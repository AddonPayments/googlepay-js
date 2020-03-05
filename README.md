<a href="https://desarrolladores.addonpayments.com/" target="_blank">
    <img src="https://desarrolladores.addonpayments.com/assets/images/branding/comercia/logo.svg?v=?v=1.14.1" alt="Addon Payments logo" title="Addon Payments" align="right" width="225" />
</a>

# Google Pay JS Comercia Global Payments

El código fuente ha sido desarrollado por Comercia Global Payments para facilitar la integración del botón de Google Pay con su terminal Addon Payments en su página web.

## Soluciones

### General

* Envío de petición con Ajax mediante el método POST
* Obtener el token de pago con Google Pay
* Estilo del botón de Google Pay
* Cifrado seguro de extremo a extremo

## Requisitos

- Cuenta de desarrollador de Google Pay para operar en producción

## Documentación y ejemplos

Puede encontrar una documentación adaptada al envío de operaciones por remoto, ejecutando el archivo "index.html" desde su servidor.

Este archivo se encuentra dentro de la carpeta ["test"](https://github.com/AddonPayments/googlepay-js/tree/master/test) del repositorio GitHub. Si lo prefiere, también puede ver nuestra documentación oficial en la página web de desarrolladores de [Addon Payments](https://desarrolladores.addonpayments.com) donde encontrará además tarjetas con las que realizar pruebas de compra y el resto de librerías disponibles.

#### Procesar un pago

Para realizar transacciones desde un cliente iOS en su navegador de Safari, debe enviar las peticiones a su servidor con una de nuestras librerías para procesar los pagos:

- [PHP](https://github.com/AddonPayments/php-sdk)
- [JAVA](https://github.com/AddonPayments/java-sdk)
- [.NET](https://github.com/AddonPayments/net-sdk)

#### Pruebas del proceso de pago Google Pay

Para realizar operaciones de prueba y obtener todos los estados posibles con el botón de Google Pay, debe introducir un importe exacto que detallamos en la tabla siguiente:

Importe   | Tipo de tarjeta  | Resultado | Mensaje
--------- | ---------------- | --------- | --------
10        | Visa             | 0         | Successful
11.01     | Visa             | 101       | Declined
11.02     | Visa             | 102       | Referral B
11.03     | Visa             | 103       | Referral A
12.05     | Visa             | 200       | Comms Error
20        | MC               | 0         | Successful
21.01     | MC               | 101       | Declined
21.02     | MC               | 102       | Referral B
21.03     | MC               | 103       | Referral A
22.05     | MC               | 200       | Comms Error

## Soporte

En caso de que quiera hablar con un especialista de Addon Payments, deberá llamar al teléfono [914 353 028](tel:914353028) o enviar un email a [soporte@addonpayments.com](mailto:soporte@addonpayments.com).

## Contribuyendo

¡Todo nuestro código es de código abierto y animamos a otros desarrolladores a contribuir y ayudar a mejorarlo!

1. Fork it
2. Cree su rama de características (`git checkout -b mi-nueva-feature`)
3. Asegúrese de que las pruebas de SDK son correctas
4. Confirme sus cambios (`git commit -am 'Añadir un commit'`)
5. Empujar a la rama (`git push origin mi-nueva-feature`)
6. Crear una nueva solicitud de extracción

## Licencia

Este proyecto está licenciado bajo GNUv3. Consulte el archivo "LICENSE.md" ubicado en la raíz del proyecto para obtener más detalles.
