# Entorno local de pruebas BinLegal

Proyecto ficticio: demo-binlegal-local. Auth 9099, Firestore 8080, Storage 9199 y consola 4000; todos escuchan en 127.0.0.1. No se importan datos de producción.

1. Instalar dependencias con pnpm install. Java 21 portátil se admite en .local-tools/java21 (carpeta ignorada por Git).
2. Ejecutar powershell -File scripts/start-emulators.ps1.
3. En otra terminal ejecutar powershell -File scripts/seed-emulators.ps1. Crea cuatro cuentas ficticias: director, pasante, cliente y persona ajena con dominio binlegal.test. Genera e imprime una contraseña exclusiva local, que no se guarda en el repositorio. Si se repite la siembra sin limpiar el emulador, definir `BINLEGAL_LOCAL_TEST_PASSWORD` con la contraseña anterior. No usarla en servicios reales.
4. Iniciar la app con pnpm dev:emulators y abrir http://127.0.0.1:3001/crm. Este modo utiliza configuración ficticia y rechaza hosts que no sean loopback.
5. Ejecutar pnpm test:rules contra emuladores para comprobar autorización de tareas, avisos, mensajes internos/cliente y archivos.

La maqueta /crm-preview conserva sus muestras por separado. El entorno emulado usa Firebase local real, sin credenciales de producción. Los datos del emulador son efímeros; el script de cuentas puede repetirse. La siembra sobrescribe solo el asunto local-case-001 y los perfiles ficticios de esas cuatro cuentas.

Las reglas de archivos locales usan la base (default). La base real del repositorio tiene otro nombre: `storage.local.rules` sirve exclusivamente para validar el entorno local y no debe desplegarse como sustituto de `storage.rules` sin resolver la arquitectura de permisos del proyecto real. Firebase confirma que Storage Rules solo puede consultar la base Firestore `(default)` cuando el proyecto tiene varias bases. Por esa razón, `storage.rules` queda cerrado por defecto para producción hasta implementar un índice de autorización confiable en `(default)` o un backend de entrega.

Referencia: [Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite/install_and_configure).

## Proyecto Firebase independiente

El 29 de octubre se creó `binlegal-crm-pruebas` con base Firestore `(default)` en `us-east1`, reglas iniciales de producción que niegan acceso, Authentication por correo/contraseña y una app web. La configuración pública del cliente está en `firebase.staging-config.json`. `pnpm dev:staging` inicia una variante restringida a localhost en el puerto 3002, separada del proyecto existente. Esta variante aún no está lista para un recorrido con usuarios: faltan reglas desplegadas y cuentas ficticias vinculadas.

Storage de este proyecto nuevo requiere vincular una cuenta de facturación y activar Blaze. La propietaria debe decidir ese paso; no se activó ni se subieron archivos. Mientras tanto, la comprobación de archivos sigue limitada a los emuladores locales. Nunca usar datos de clientes reales en el proyecto de pruebas.
