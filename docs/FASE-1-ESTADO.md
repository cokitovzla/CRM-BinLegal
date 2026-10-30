# Estado vigente de la fase 1

Referencia principal: apartado 22 de la versión final del plan escrito en el chat «Plan Maestro CRM - BinLegal». Se mantiene su alcance: despacho operativo completo, desde captación hasta entrega y cierre mediante el portal.

## Aclaración de producto

- Solicitud: captación y atención comercial de una necesidad, nueva o de un cliente existente.
- Presupuesto: servicios propuestos y decisiones de aceptación.
- Asunto: ejecución de un servicio aceptado.
- Tarea: acción concreta con responsable, resultado esperado, fecha y revisión.
- Las tareas, revisión y correcciones pertenecen a la fase 1.
- La fase 2 añade plantillas, dependencias, recordatorios, reservas públicas e integración con agenda, y coordinación avanzada.

## Corrección del control comercial

El flujograma que permitía saltar etapas con clics se retiró. La situación comercial deriva de registros:
- Contacto con fecha, canal y referencia.
- Reunión con fecha, modalidad, lugar/enlace, estado y referencia.
- Presupuesto enviado con referencia del envío.
- Servicios aceptados con evidencia y asuntos relacionados.

Cada indicador es independiente. Registrar una propuesta no marca automáticamente una reunión como realizada. Ninguno de estos registros completa tareas operativas.
Los filtros de las listas solo cambian la vista.
Las etiquetas históricas sin respaldo no se usan como prueba de cumplimiento; no se ha realizado una migración masiva de datos remotos.

## Matriz de cierre

Local significa implementado y probado con datos ficticios en el navegador o mediante pruebas del modelo; no significa validado contra Firebase desplegado.

| Capacidad del plan | Estado | Pendiente para cerrar fase 1 |
| --- | --- | --- |
| Identidad y configuración del despacho | Parcial | Configuración inicial editable, opciones de captación y permisos propios del despacho inicial. |
| Acceso interno | Preparado | Verificar cuentas reales y permisos iniciales por responsabilidad; vinculación e invitaciones. |
| Directorio de empresas y personas | Parcial | Reutilización explícita de identidades y revisión de coincidencias; sustituir relaciones heredadas por nombre. |
| Formulario público completo y breve | Conectados en código | Probar ambas entradas contra Firebase, integración externa, validación y control de abuso. |
| Registro manual | Probado localmente | Persistencia y recuperación con cuenta autorizada y reglas desplegadas. |
| Diagnóstico interno | Base local | Completar campos y reglas profesionales acordadas y verificar persistencia. |
| Seguimiento comercial | Local | Validar registros, historial y situaciones derivadas contra Firebase. |
| Agenda manual | Local | Verificar guardado y permisos reales; cerrar detalles de participantes y resultados. La reserva pública y Google Calendar son fase 2. |
| Catálogo y presupuestos PDF | Parcial | Catálogo y tarifas del despacho, vigencia/condiciones finales, PDF, nuevas versiones, sustitución y vencimiento. USD confirmado; impuestos/gastos/redondeos adicionales pendientes. |
| Aceptación total o parcial | Probada localmente | Verificación real de evidencia, snapshot e idempotencia. |
| Asuntos por servicio | Probados localmente | Requisitos de inicio, anticipo registrado, bloqueos, espera, suspensión/cancelación y cierre con evidencia. |
| Tareas, revisión y correcciones | Núcleo local probado | Tareas comerciales vinculadas a solicitudes, edición/reasignación con usuarios reales, colaboradores, checklist, comentarios y adjuntos. |
| Responsables y permisos iniciales | Preparados | Probar cada cuenta y alcance contra reglas reales; usuarios no autorizados deben quedar bloqueados. |
| Documentos privados y entregas | Parcial | Corregir reglas binarias, versiones, publicación, descargas autorizadas y recuperación. |
| Portal básico y varios usuarios | Parcial | Invitación, vinculación de cuentas, solicitudes, mensajes y documentos permitidos para cada empresa/asunto. |
| Mensajes y notas separados | Funcional en local | Validar cuentas reales, notificaciones y publicación contra Firebase antes de desplegar. |
| Notificaciones internas | Persistencia preparada | Bandeja visible y recuperación de fallos; probar destinatarios y eventos reales. |
| Paneles y búsquedas esenciales | Parcial | Revisar indicadores y listados con datos persistentes y permisos efectivos. |
| Historial y recuperación básica | Parcial | Probar auditoría de operaciones y respaldos con restauración verificada. |
| Diseño adaptable y coherente | En revisión por recorrido | Revisar todas las pantallas y estados vacíos, de error y datos extensos. |

La revisión adaptable es una condición previa al despliegue: debe cubrir barras, menús, filtros, listas, formularios, modales y pantallas de detalle en escritorio, ventana reducida y celular. La propietaria prioriza escritorio, pero exige que el uso desde celular sea funcional.

## Prueba que cierra la fase 1

Interesado desde una web externa → diagnóstico → propuesta de tres servicios → aceptación de dos → dos asuntos → tareas y corrección de borrador → publicación de una entrega → cliente desde móvil descarga solo el documento autorizado.
Repetir empezando con contacto breve y registro manual.
Comprobar que otra cuenta no puede consultar el asunto ni descargar archivos.

## Dependencias de la propietaria

Podemos continuar el código con las decisiones actuales. Para el cierre integrado se necesitarán acceso autorizado al proyecto Firebase y cuentas de prueba, el catálogo/tarifas y un ejemplo real de presupuesto del despacho, y las decisiones pendientes sobre condiciones financieras, archivos y permisos. No se presupone que esas dependencias estén ya resueltas.

## Verificación de esta corrección

- 37 pruebas del modelo pasan, incluidas las que impiden avanzar por etiquetas arbitrarias, separan aceptación por servicio y exigen cierre documentado.
- Navegador: cero botones de Paso o Avanzar a; contacto registrado y reunión visible en agenda, sin aceptación ni tareas completadas por esas acciones.
- TypeScript sin errores. Compilación y revisión visual registradas al finalizar el bloque.
- No se han modificado reglas remotas, datos reales ni producción en Vercel.


### Avance: autorización de inicio
El botón Iniciar asunto exige declarar las condiciones del servicio y registrar evidencia de cumplimiento o una excepción autorizada con motivo. El registro se conserva en el asunto y su historial. La transacción comprueba la etapa actual; las reglas propuestas también validan el respaldo. No equivale todavía a un gestor de requisitos individuales: quedan pendientes requisitos estructurados con responsables, bloqueos, suspensión y cierre con entrega comprobada. Reglas aún sin desplegar ni probar contra Firebase real.


### Avance: requisitos individuales y situación de espera
Panel por asunto con hasta 30 requisitos, responsable y referencia de evidencia. Espera, bloqueo y suspensión se registran por separado de la etapa, con motivo, dependencia y próxima acción. Guardado con revisión para detectar conflictos e historial interno. El inicio rechaza esperas activas; los requisitos pendientes requieren excepción autorizada. Pendiente: restricciones de ejecución de tareas durante suspensión, reglas exhaustivas de requisitos y verificación real en Firebase, cierre y entrega. Estos controles todavía no representan el ciclo completo del asunto.


### Avance: suspensión, revisión final y cierre documentado
La suspensión impide avances, revisión y reapertura de tareas; conserva cancelación con motivo. Se comprueba en transacciones con el asunto actual y en reglas propuestas. Cambios de tareas incrementan workRevision para detectar modificaciones concurrentes durante revisión/cierre. La revisión final exige tareas concluidas, al menos una completada, requisitos acreditados y ninguna espera activa. Se retiró Finalizado del selector anterior y se rechaza su uso desde el servicio. El cierre exige resultado de revisión y entrega final publicada a la cuenta vinculada del cliente, con consulta de metadatos del archivo real; se registra generación de Storage. La demostración no permite cerrar con archivos ficticios. No se ha probado la entrega real ni desplegado reglas; Firebase y Storage siguen pendientes de validación integral. La comprobación acredita disponibilidad/publicación, no lectura por el cliente.


### Avance: avisos internos y preparación de pruebas
Mi trabajo muestra avisos dirigidos a la cuenta, sin leer o todos; abrir un asunto y marcar un aviso como leído son acciones separadas. Las reglas permiten al destinatario modificar únicamente readAt. Se preparó el modo emulators, scripts de arranque/siembra y pruebas de autorización de Firebase. Estado de ejecución y comandos en ENTORNO-PRUEBAS.md. La descarga usa getBlob autenticado, pendiente de verificar CORS del bucket real antes de despliegue.

### Avance: conversación interna y portal
Cada asunto muestra una conversación. El despacho elige entre nota interna y actualización visible para el cliente; el portal solo consulta y publica mensajes con visibilidad `client`. Las reglas validan autor, rol, acceso al asunto, destino y longitud, y conservan los mensajes como historial inmutable. La publicación del mensaje y su registro de actividad se guardan atómicamente. Las pruebas del emulador niegan a clientes la creación de notas internas y a personas ajenas cualquier mensaje. Los mensajes no modifican tareas ni etapas. La vista previa verificó visualmente ambos destinos con contenido ficticio.

### Avance: vigencia de presupuestos
El editor permite indicar la fecha de vigencia. El modelo de aceptación impide incorporar servicios nuevos después del último día completo en Caracas, conserva las aceptaciones previas y permite repetirlas sin duplicar asuntos. Se rechazan fechas imposibles. Las 38 pruebas de negocio pasan. Pendiente: versiones y renovación de propuestas, PDF, validación visual de este campo y comprobación equivalente en las reglas de Firebase; este avance no cierra el bloque de presupuestos.

### Avances del 29 de octubre: presupuestos, archivos y tareas
- La propietaria confirma USD y tasa configurable de 16 %, con opción de precios que incluyen impuesto, impuesto adicional o propuesta sin desglose. El catálogo y las tarifas los aportará José. Se implementa cálculo a centavos; USD 100 con impuesto incluido se desglosa en base 86,21 e impuesto 13,79. Este desglose comercial no genera factura fiscal. Queda pendiente confirmar la política definitiva de redondeo y vigencia habitual.
- Vista imprimible del presupuesto con datos del cliente, servicios, condiciones, descuento y desglose. Ofrece guardar PDF mediante la impresión del navegador; pendiente revisión visual y PDF descargado.
- Biblioteca: carga de versiones con referencia al archivo anterior, archivos originales conservados, validación de formato/tamaño e historial atómico de carga y publicación. Reglas locales propuestas restringen cambios a publicación y bloquean borrar/sustituir metadatos originales. Pendiente verificar las nuevas reglas en emuladores y revisar concurrencia de versiones.
- Tarjetas de tareas: edición/reasignación y cancelación con motivo. Se conservan revisión y estado durante la edición; se distinguen creación y actualización en el historial. Pendiente recorrido visual y prueba integrada.
- 42 pruebas del modelo y TypeScript pasan. Las pruebas de reglas de esta entrega todavía no se completaron: los puertos locales de emuladores están ocupados y no responden. No se acredita éxito de esta comprobación.
- Repetición del 29 de octubre: 42 pruebas de negocio, TypeScript y compilación de producción pasan. El comando `pnpm test` intentó reinstalar dependencias y se detuvo por falta de terminal interactiva; las mismas pruebas se ejecutaron con Node directamente. La regla de documentos sigue pendiente de validación en emuladores.
- Preparación de Git: confirmados `main`, `origin` hacia `cokitovzla/CRM-BinLegal` y el proyecto Vercel conectado. Se reforzó `.gitignore` para claves privadas y se eliminó la contraseña fija de las cuentas locales ficticias. No hubo commit ni push. La eliminación local de `bun.lock` queda excluida de cualquier actualización hasta decidir su tratamiento.
- La propietaria inició sesión y se creó el proyecto Firebase independiente `binlegal-crm-pruebas`. Firestore `(default)` está en `us-east1` con reglas iniciales privadas; Authentication por correo está habilitada y la aplicación web registrada. Se añadió una configuración local de staging. Storage requiere Blaze con facturación y está pendiente de decisión; no se desplegaron reglas personalizadas ni se subieron archivos.

Estos avances no acreditan el cierre de fase 1. Permanecen los pendientes de la matriz y el recorrido de aceptación integral.

### Revisión adaptable iniciada
En Solicitudes, la tabla que comprimía siete columnas se sustituyó por tarjetas a anchos reducidos; la tabla mantiene un ancho mínimo y desplazamiento horizontal en pantallas amplias. El menú del CRM se pliega en móvil, los filtros permanecen disponibles y la cabecera del detalle puede acomodar nombres largos. Los controles de tareas y su diálogo permiten envolver botones y desplazarse verticalmente. TypeScript y compilación pasan. La comprobación de todas las vistas y de tamaños reales de celular sigue pendiente; no se declara terminada la revisión adaptable.

### Claridad del recorrido comercial y operativo
La navegación muestra Solicitudes, Trámites y Mi trabajo como destinos distintos. Trámites reúne los servicios en ejecución de todos los clientes; Mi trabajo reúne tareas y revisiones. En Solicitudes, las tarjetas se abren desde toda su superficie y los hitos de atención, reunión y propuesta muestran responsable y nota al pasar el cursor o al tocarlos. Los registros nuevos de contacto y reunión guardan la persona responsable; los históricos sin ese dato se muestran como no registrados. La propuesta registra el nombre de quien la envía en los nuevos envíos. Se retiraron textos que sugerían abrir un trámite sin registrar aceptación de un servicio. Todo esto funciona en la vista local; aún falta validar persistencia, permisos y recorrido completo en Firebase.

### Recorrido local y reglas aisladas del 29 de octubre
- En `/crm-preview`, una propuesta ficticia pasó de borrador a enviada con referencia; se aceptaron dos de tres servicios y aparecieron dos trámites distintos. El tercer servicio quedó pendiente. Se creó una tarea con responsable y revisor separados. Una nota interna de prueba apareció como «Solo despacho».
- La tarea puede planificarse antes del inicio del trámite, pero no ejecutarse hasta que el despacho autorice el inicio. Se comprueba en el modelo, la interfaz y las reglas del emulador.
- Las pruebas aisladas de Firestore y Storage pasaron: acceso por trámite, bloqueo de ejecución suspendida y aún no iniciada, avisos, mensajes internos, versiones de documentos, bloqueo de alteración de versiones y descarga privada tras publicación. Las denegaciones esperadas producen mensajes del emulador; una rama de denegación alcanza el límite de evaluación de expresiones, pendiente de simplificar antes de publicar reglas.
- 43 pruebas de negocio, TypeScript y compilación de producción pasan. Estas comprobaciones usan datos ficticios y no acreditan todavía el recorrido con cuentas reales ni Storage en el proyecto de pruebas.

### Solicitudes de clientes existentes
El portal enviaba «Solicitar Nuevo Trámite» directamente a `processes` con avance y documento ficticios. Ahora el formulario crea una solicitud comercial mediante el mismo ingreso saneado de la web; el despacho debe evaluar, presupuestar y registrar la aceptación por servicio antes de abrir un trámite. El portal confirma la recepción o muestra un error sin simular la apertura. Las reglas prohíben a clientes crear trámites directamente. El diálogo también cabe en pantallas pequeñas. Falta probar este recorrido con una cuenta de cliente del entorno Firebase independiente.

### Catálogo provisional y ruta documental sin Blaze
La propietaria autorizó precios ficticios para no esperar el tarifario de José. El editor de presupuestos ofrece 24 ejemplos editables, tres por cada una de las ocho áreas actuales. Están marcados como provisionales y no incluyen aranceles. Se preparó en `ARCHIVOS-MVP-SIN-BLAZE.md` el diseño de archivos pequeños privados en Firestore del proyecto de pruebas, con control de acceso, fragmentos y verificación de integridad. La implementación real de esa ruta documental y sus pruebas siguen pendientes; la biblioteca actual todavía requiere Storage. No se activó facturación.

### Ajuste visual solicitado en Solicitudes
La vista «Vista de lista» vuelve a ser una tabla en escritorio y ventana reducida, con desplazamiento horizontal dentro de la tabla si no cabe. «Tarjetas de seguimiento» reúne los registros en tarjetas, sin columnas de etapas. Se quitaron los subrayados en hover y se reforzaron color, fondo y sombra en los elementos interactivos principales. Mi trabajo y Agenda de reuniones ahora se expanden en el menú lateral con filtros propios y tarjetas con la misma base visual. Comprobado en la vista previa a ancho de escritorio reducido; aún falta la revisión completa en tamaños reales de celular.
