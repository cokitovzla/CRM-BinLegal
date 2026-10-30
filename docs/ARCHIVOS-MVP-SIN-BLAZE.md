# Archivos privados del MVP sin Firebase Storage

Decisión provisional: usar Cloud Firestore `(default)` del proyecto de pruebas para archivos pequeños, conservando Firebase Authentication. No se activa Blaze ni se solicita un método de pago.

## Diseño antes de habilitarlo

- Mantener `clientDocuments` como índice de versiones y publicación.
- Guardar cada archivo en fragmentos binarios de hasta 256 KiB en una subcolección del documento. Límite inicial por archivo: 5 MiB. La interfaz debe rechazar archivos mayores antes de subirlos y explicar el límite.
- Crear índice y fragmentos en una operación atómica, con identificador de versión inmutable, cantidad de fragmentos, tamaño y SHA-256. La descarga reconstruye el archivo, verifica tamaño y SHA-256 y falla cerrada si falta un fragmento.
- Reglas: solo el cliente dueño o el personal autorizado del asunto puede escribir; el cliente solo puede leer sus cargas o entregas expresamente publicadas; nadie puede modificar fragmentos de una versión existente.
- El cierre del trámite comprueba que la entrega publicada tiene todos sus fragmentos y su huella; no basta un nombre de archivo o metadatos.
- Las pruebas deben cubrir carga, descarga, nueva versión, acceso negado a otro cliente y archivo incompleto. Después se repite con cuentas del entorno Firebase de pruebas.

## Límites y migración

Firestore ofrece una cuota gratuita de 1 GiB, 50.000 lecturas y 20.000 escrituras diarias; cada documento tiene un máximo de 1 MiB. El almacenamiento de archivos en documentos usa más lecturas/escrituras que un servicio de objetos. Es una solución acotada al MVP y se debe medir su uso. Al crecer, migrar los binarios a almacenamiento de objetos sin cambiar los identificadores de `clientDocuments`.

Referencias: https://firebase.google.com/docs/firestore/quotas y https://firebase.google.com/docs/firestore/manage-data/transactions

**Estado:** diseño preparado; la biblioteca todavía usa Firebase Storage en modo real. No activar carga real hasta implementar reglas, reconstrucción y pruebas. La vista previa conserva solo metadatos de muestra.
