> Registro de un avance anterior. Para el estado actual y lo pendiente de la fase 1, consulta [Estado vigente](FASE-1-ESTADO.md).

# Primer recorrido: recepción y seguimiento

Estado: primera implementación local de la fase 1. No constituye el MVP completo.

## Cambios

- Código del repositorio descargado en esta carpeta, con referencias actuales de producto y diseño.
- Una capa común de solicitudes para contacto breve, diagnóstico y registro manual.
- Guardado confirmado antes del éxito en contacto breve; datos conservados ante errores.
- Reintentos de formularios con la misma identidad mientras no cambie su contenido.
- Solicitudes reales separadas de la demostración; la bandeja real no se rellena con muestras ni se conserva en localStorage.
- Persona, empresa y cuenta diferenciadas: los registros internos crean identidades separadas y accountUid permanece sin asignar hasta vincular una cuenta real.
- Los envíos públicos solo crean solicitudes; las identidades internas se crean al atenderlas. No se fusionan personas por coincidencia de correo o nombre.
- Responsable de atención, próxima acción, fecha y valoración interna en la ficha.
- Diagnóstico pendiente/en elaboración/completado; completar exige valoración.
- Escrituras internas en transacciones, revisión para detectar conflictos e historial separado e inmutable según las reglas propuestas.
- Acceso al CRM condicionado a sesión autorizada; identificadores de correo administrativos exactos y verificados, en lugar de coincidencias parciales.
- Retirados presupuesto y documentos que se inventaban automáticamente al abrir una solicitud sin esos datos.
- Fechas mostradas en America/Caracas; marcas de recepción nuevas en formato ISO.
- pnpm como gestor de dependencias reproducible; se sustituye bun.lock por pnpm-lock.yaml.

El responsable de atención es una etiqueta de seguimiento en este incremento; no concede permisos ni sustituye la asignación futura a una cuenta del equipo.

## Verificación local

- 12 pruebas del modelo, autorización y fechas aprobadas.
- TypeScript sin errores.
- Compilación de producción aprobada.
- Navegador: solicitud ficticia sin empresa creada desde registro manual.
- Navegador: responsable, valoración, acción y fecha guardados y recuperados tras recargar.
- Navegador: ficha sin presupuesto ni documentos automáticos.
- Pantalla de escritorio de 1440 x 900 y móvil de 390 x 844 revisadas para el nuevo seguimiento; no hubo desbordamiento horizontal de la página en móvil.
- /crm sin sesión muestra acceso y no monta la bandeja privada.
- Capturas en screenshots/.

Las verificaciones de persistencia en navegador se hicieron en /crm-preview: acreditan almacenamiento de demostración en el navegador, no persistencia en Firebase.

## Pendiente para aceptar el recorrido integrado

1. Validar y publicar las reglas de firestore.rules en la base configurada. No se han desplegado.
2. Comprobar una cuenta administrativa autorizada. Si se usa la lista de correos administrativos, el correo debe estar verificado; el registro de admins puede autorizar cuentas explícitas.
3. Probar, con datos ficticios y cuenta autorizada, envío público → bandeja real → seguimiento → cierre de sesión y reingreso.
4. Comprobar las colecciones people, companies y leadActivity, la atomicidad y el rechazo de acceso a usuarios no autorizados con reglas desplegadas o emulador.
5. Probar reintentos y conflictos contra Firebase, fallos de conexión y abuso de formularios. No hay emulador configurado ni Java disponible en esta máquina.
6. Completar la reutilización explícita de contactos/empresas existentes y revisión de coincidencias; las fichas heredadas aún agrupan información por nombre.
7. Aplicar el mismo criterio de confirmación y errores a las operaciones antiguas que siguen fuera de este incremento, y completar la asignación a usuarios reales.
8. Presupuestos, aceptación, asuntos, tareas, portal y archivos privados conservan pendientes del diagnóstico previo. La biblioteca de archivos aún necesita corregir sus reglas antes de documentación real.

La separación de varios despachos no está terminada: officeId identifica el despacho inicial; las políticas administrativas actuales siguen siendo globales.

## Publicación

No se hicieron commits, push ni despliegues. No se cambiaron datos, usuarios o reglas de Firebase ni la aplicación publicada en Vercel. El trabajo se encuentra en el checkout local para revisión.
