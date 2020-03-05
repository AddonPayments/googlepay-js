/**
 * Defina la versión del API de Google Pay a la que se hace referencia al crear su
 * configuración
 *
 * @ver {@link https://developers.google.com/pay/api/web/reference/request-objects#PaymentDataRequest|apiVersion in PaymentDataRequest}
 */
const baseRequest = {
  apiVersion: 2,
  apiVersionMinor: 0
};

/**
 * Las tarjetas apoyadas por su sitio y CaixaBank
 *
 * @ver {@link https://developers.google.com/pay/api/web/reference/request-objects#CardParameters|CardParameters}
 * @hacer confirmar las tarjetas soportadas por CaixaBank
 */
const allowedCardNetworks = ["AMEX", "DISCOVER", "JCB", "MASTERCARD", "VISA"];

/**
 * Métodos de autenticación de tarjetas apoyados por su sitio y CaixaBank
 *
 * @ver {@link https://developers.google.com/pay/api/web/reference/request-objects#CardParameters|CardParameters}
 */
const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

/**
 * Identifique su puerta de enlace (globalpayments) y el Merchant ID
 *
 * La respuesta de la API de Google Pay devolverá un método de pago encriptado capaz
 * de ser cobrado por Addon Payments después de la autorización del pagador
 *
 * @hacer Compruebe con Addon Payments los datos necesarios para la autorización
 * @ver {@link https://developers.google.com/pay/api/web/reference/request-objects#gateway|PaymentMethodTokenizationSpecification}
 */
const tokenizationSpecification = {
  type: 'PAYMENT_GATEWAY',
  parameters: {
    gateway: 'globalpayments',
    gatewayMerchantId: 'addonphptest'
  }
};

 console.log(tokenizationSpecification);

/**
 * Indique que su página web permite pago con tarjeta
 *
 * @ver {@link https://developers.google.com/pay/api/web/reference/request-objects#CardParameters|CardParameters}
 */
const baseCardPaymentMethod = {
  type: 'CARD',
  parameters: {
    allowedAuthMethods: allowedCardAuthMethods,
    allowedCardNetworks: allowedCardNetworks
  }
};

/**
 * Indique que su página web permite pago con tarjeta y Token
 *
 * @ver {@link https://developers.google.com/pay/api/web/reference/request-objects#CardParameters|CardParameters}
 */
const cardPaymentMethod = Object.assign( 
	{},
	baseCardPaymentMethod, {
    	tokenizationSpecification: tokenizationSpecification
  	}
);

/**
 * Inicialice google.payments.api.PaymentsClient object or null si aún no se ha establecido
 *
 * @ver {@link getGooglePaymentsClient}
 */
let paymentsClient = null;

/**
 * Configure la compatibilidad de su sitio con los métodos de pago admitidos por Google Pay
 * API
 *
 * Cada miembro de "allowedPaymentMethods" debe contener sólo los campos requeridos,
 * permitiendo la reutilización de esta petición base al determinar la capacidad de un visitante
 * para pagar y posteriormente solicitar un método de pago soportado
 *
 * @devuelve {object} Google Pay API version, métodos de pagos soportado por el sitio
 */
function getGoogleIsReadyToPayRequest() {
  return Object.assign(
    	{},
    	baseRequest, {
    		allowedPaymentMethods: [baseCardPaymentMethod]
    	}
	);
}

/**
 * Configurar la compatibilidad con el API de Google Pay
 *
 * @ver {@link https://developers.google.com/pay/api/web/reference/request-objects#PaymentDataRequest|PaymentDataRequest}
 * @devuelve {object} PaymentDataRequest
 */
function getGooglePaymentDataRequest() {
  const paymentDataRequest = Object.assign({}, baseRequest);
  paymentDataRequest.allowedPaymentMethods = [cardPaymentMethod];
  paymentDataRequest.transactionInfo = getGoogleTransactionInfo();
  paymentDataRequest.merchantInfo = {
    // @hacer solicitar el pase a producción a Google
    // Ver {@link https://developers.google.com/pay/api/web/guides/test-and-deploy/integration-checklist|Integration checklist}
    // merchantId: '01234567890123456789',
    merchantName: 'Addon Payments'
  };

  paymentDataRequest.callbackIntents = ["PAYMENT_AUTHORIZATION"];

  return paymentDataRequest;
}

/**
 * Devuelve un cliente de pagos activo o inicializado
 *
 * @ver {@link https://developers.google.com/pay/api/web/reference/client#PaymentsClient|PaymentsClient constructor}
 * @devuelve {google.payments.api.PaymentsClient} Google Pay API client
 */
function getGooglePaymentsClient() {
	if ( paymentsClient === null ) {
    	paymentsClient = new google.payments.api.PaymentsClient({
        	environment: 'TEST',
      		paymentDataCallbacks: {
        		onPaymentAuthorized: onPaymentAuthorized
    		}
		});
	}
	return paymentsClient;
}

/**
 * Los "handle" manejan las llamadas realizadas
 *
 * @param {object} paymentData respuesta de la API de Google Pay después de que un pagador apruebe el pago
 * @ver {@link https://developers.google.com/pay/api/web/reference/response-objects#PaymentData object reference}
 *
 * @ver {@link https://developers.google.com/pay/api/web/reference/response-objects#PaymentAuthorizationResult}
 * @devuelve Promise<{object}> Promise de PaymentAuthorizationResult se oponen a reconocer el estado de la autorización de pago.
 */
var tiempo = new Date();

function onPaymentAuthorized(paymentData) {
    return new Promise(function(resolve, reject) {
	    // Manejar la respuesta
	    processPayment(paymentData)
	    .then(function() {
	    	// Todos los "console.log();" introducidos en el código son con motivo de desarrollo
			console.log(' ---- '+tiempo.getHours() + ':' +tiempo.getMinutes()+ ':' +tiempo.getSeconds()+' ---- ');
			console.log('%c Token obtenido ','color: white; background-color: #D33F49', paymentData["paymentMethodData"]["tokenizationData"]["token"]);
	    	// Ajax a nuestro servidor con los datos de la operación
			console.log('%c Enviando token a nuestro servidor ','color: white; background-color: #199651');
	    	$.ajax({
	            url: 'authorization.php',
	            type: 'POST',
	            data: {misDatos: paymentData["paymentMethodData"]["tokenizationData"]["token"], importe: "10"},
	            success: function(data) {
					if(data.respuesta == '00') {
						// Si la transacción es correcta (00), indicamos al modal que la transacción es correcta
						console.log('%c Operación correcta ','color: white; background-color: #2274A5', data);
						resolve({transactionState: 'SUCCESS'});
						
						// Pintamos en nuestro Front-End la respuesta de la pasarela de pagos
						$("#respuestaMsg").remove();
						$("#server-results").empty();
						$("#server-results").append('Respuesta == '+ data.respuesta + '<br>');
						$("#server-results").append('Mensaje == '+ data.mensaje + '<br>');
						$("#server-results").append('Order ID == '+ data.orderid + '<br>');
						$("#server-results").append('Código de autorización == '+ data.codeauth + '<br>');
						$("#server-results").append('Transaction ID (PasRef) == '+ data.pasref + '<br>');
						$("#server-results").append('Esquema == '+ data.schemeId);
						console.log(' ---- Fin de la petición ---- ');
					} else {
						// Si la transacción no es correcta, indicamos al modal que la transacción no se ha podido procesar
						console.log('%c Error al procesar su solicitud ','color: white; background-color: #D33F49',data);
						$("#server-results").html('Error al procesar su solicitud: ' + data);
					}
	            },
	            error: function(error) { 
	                console.log(error);
	            }
	        });
	    })
	    // En caso de error con Google Pay
	    .catch(function() {
	    	resolve({
		        transactionState: 'ERROR',
		        error: {
					intent: 'PAYMENT_AUTHORIZATION',
					message: 'Insufficient funds',
					reason: 'PAYMENT_DATA_INVALID'
		        }
			});
    	});
	});
}

/**
 * Iniciar Google PaymentsClient después de que se haya cargado el JavaScript alojado en Google
 *
 * Mostrar un botón de pago de Google Pay después de la confirmación del cliente
 */
function onGooglePayLoaded() {
	const paymentsClient = getGooglePaymentsClient();
	paymentsClient.isReadyToPay(getGoogleIsReadyToPayRequest())
	.then(function(response) {
        if (response.result) {
        	addGooglePayButton();
        }
	})
	.catch(function(err) {
    	// Ver error en la consola de Javascript
        console.error(err);
	});
}

/**
 * Creación del botón de compra de Google Pay
 *
 * @ver {@link https://developers.google.com/pay/api/web/reference/request-objects#ButtonOptions|Button options}
 * @ver {@link https://developers.google.com/pay/api/web/guides/brand-guidelines|Google Pay brand guidelines}
 */
function addGooglePayButton() {
	const paymentsClient = getGooglePaymentsClient();
	const button = paymentsClient.createButton({onClick: onGooglePaymentButtonClicked});
	document.getElementById('googlePay').appendChild(button);
}

/**
 * Proporcionamos a la API de Google Pay un importe de pago, una moneda y un estado de importe
 *
 * @ver {@link https://developers.google.com/pay/api/web/reference/request-objects#TransactionInfo|TransactionInfo}
 * @devuelve {object} información de la transacción, adecuada para su uso como propiedad de TransactionInfo de PaymentDataRequest
 */
function getGoogleTransactionInfo() {
	return {
        displayItems: [ {
	        	label: "Subtotal",
	        	type: "SUBTOTAL",
	        	price: "10",
	    } ],
	    countryCode: 'ES',
	    currencyCode: 'EUR',
	    totalPriceStatus: 'FINAL',
	    totalPrice: '10',
	    totalPriceLabel: 'Total'
	};
}

/**
 * Mostrar la hoja de pago de Google Pay cuando se hace clic en el botón de pago de Google Pay
 */
function onGooglePaymentButtonClicked() {
  const paymentDataRequest = getGooglePaymentDataRequest();
  paymentDataRequest.transactionInfo = getGoogleTransactionInfo();

  const paymentsClient = getGooglePaymentsClient();
  paymentsClient.loadPaymentData(paymentDataRequest);
}

/**
 * Procesar los datos de pago devueltos por la API de Google Pay
 *
 * @param {object} paymentData respuesta de Google Pay API después de aprobar el pago
 * @ver {@link https://developers.google.com/pay/api/web/reference/response-objects#PaymentData|PaymentData object reference}
 */
function processPayment(paymentData) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            // @hacer pasar token al procesador de pagos
            paymentToken = paymentData.paymentMethodData.tokenizationData.token;
        	resolve({});
    	}, 3000);
	});
}