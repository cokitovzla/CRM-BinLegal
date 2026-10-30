# Plan Maestro MVP CMR Bindegal

**Versión 2 — Definición integral del producto, flujos, arquitectura y entregas**

**Estado:** propuesta funcional consolidada, previa a la evaluación del repositorio.

**Nombre de trabajo:** se conserva el título solicitado. La marca definitiva y la escritura de CRM/CMR y Bindegal/BinLegal se confirmarán antes de publicar materiales comerciales.

---

## 1. Qué estamos construyendo

Una plataforma de gestión para despachos jurídicos que conecta:

**Captación → atención comercial → diagnóstico → presupuesto → contratación de servicios → ejecución → revisión → entrega → cierre.**

La plataforma conservará la relación entre el cliente, sus empresas y contactos, las solicitudes que realiza y el trabajo que se ejecuta para él.

Tendrá tres espacios relacionados:

1. **CRM interno:** atención comercial y operación del despacho.
2. **Portal del cliente:** solicitudes, comunicaciones, avances y documentos autorizados.
3. **Comunidad empresarial:** directorio voluntario para que los participantes ofrezcan sus servicios y encuentren otros negocios.

El primer despacho será el de José Rafael, quien actualmente trabaja solo. La estructura deberá permitir que incorpore equipo y, posteriormente, que otros despachos utilicen el producto.

## 2. Objetivos y criterios del producto

### Objetivos principales

- Evitar que los contactos y las solicitudes se pierdan entre mensajes y conversaciones.
- Reunir el historial del cliente en un lugar.
- Dar seguimiento comercial con una próxima acción clara.
- Convertir servicios aceptados en trabajo organizado.
- Identificar responsables, revisores, fechas y bloqueos.
- Reutilizar documentos y datos sin pedirlos repetidamente.
- Facilitar al cliente consultar avances y entregas desde su celular.
- Permitir que cada despacho configure su forma de recibir interesados.
- Preparar una base que pueda crecer sin reconstruir los procesos centrales.

### Criterios permanentes

- Una función se considera terminada cuando funciona de principio a fin.
- Los datos importantes deben persistir y recuperarse al volver a entrar.
- La apariencia forma parte de cada entrega.
- Los errores deben explicar qué ocurrió y qué puede hacer la persona.
- Las acciones sensibles deben conservar historial.
- Los permisos deben aplicarse también en el servidor y en los archivos.
- El funcionamiento para una sola persona debe ser sencillo.
- Las configuraciones avanzadas se incorporarán sin complicar el uso cotidiano.

## 3. Alcance de las tres fases

| Fase | Producto terminado |
|---|---|
| **1. Despacho operativo** | Captación digital y manual, diagnóstico, seguimiento, presupuestos, asuntos, tareas, documentos y portal básico funcionando juntos. |
| **2. Equipo y automatización** | Coordinación avanzada, agenda integrada, plantillas, recordatorios y mejor administración de colaboradores del cliente. |
| **3. Plataforma y comunidad** | Incorporación de otros despachos y directorio empresarial voluntario, con separación de datos y configuración propia. |

La fase 1 es el MVP. Las fases 2 y 3 son evoluciones del mismo producto.

En cada fase habrá diseño, implementación, pruebas, revisión visual y publicación. Ninguna fase se entregará con botones decorativos o acciones que aparenten guardar sin hacerlo.

---

## 4. Modelo general de información

### 4.1. Despacho

Representa al bufete que utiliza la plataforma.

Contiene identidad, usuarios, configuraciones, servicios, tarifas y datos de sus clientes.

Debe diferenciarse de las empresas que son clientes del despacho.

### 4.2. Empresa o proyecto del cliente

Representa un negocio constituido, un emprendimiento o un proyecto en formación.

No será obligatorio disponer de una denominación legal definitiva para iniciar una relación.

Puede tener varios contactos, solicitudes y asuntos simultáneos.

### 4.3. Persona

Representa a una persona de contacto o a un cliente atendido a título personal.

Una persona puede relacionarse con varias empresas. Su cargo y sus permisos pueden variar entre ellas.

### 4.4. Cuenta de acceso

Permite iniciar sesión.

Es independiente del registro de persona: alguien puede existir como contacto sin tener acceso al portal.

Una cuenta podrá tener varias pertenencias autorizadas. Al operar, deberá quedar claro en qué empresa o despacho está actuando.

### 4.5. Solicitud

Registra una necesidad o grupo de necesidades planteadas al despacho.

Puede proceder de una persona nueva o de un cliente existente.

Contiene origen, motivo, diagnóstico, seguimiento, presupuestos y resultado comercial.

### 4.6. Diagnóstico

Organiza la información recopilada para comprender la situación.

Puede recibir respuestas del interesado y una valoración posterior del equipo.

### 4.7. Presupuesto

Propuesta comercial con uno o varios servicios, condiciones e importes.

Conserva versiones y aceptación por concepto o servicio.

### 4.8. Asunto o expediente

Unidad de ejecución de un servicio.

Una solicitud puede generar varios asuntos independientes. Cada uno tiene alcance, responsables, fechas, tareas, documentos y entregas.

El término visible —asunto, trámite o expediente— se acordará para evitar confusiones con identificadores de expedientes externos.

### 4.9. Tarea

Unidad concreta de trabajo, comercial u operativo.

Puede vincularse a una solicitud o a un asunto.

### 4.10. Documento

Archivo con metadatos, versiones, relaciones y permisos.

### 4.11. Comunicación y actividad

Registra mensajes, notas, llamadas, acuerdos, movimientos y hechos relevantes.

### Relaciones principales

**Despacho → clientes y contactos → solicitudes → presupuestos → servicios aceptados → asuntos → tareas y entregas.**

Los documentos y las comunicaciones se vinculan al registro al que pertenecen y pueden tener relaciones adicionales cuando corresponda.

---

## 5. Entrada de información: dos vías principales

### 5.1. Entrada digital desde la web del despacho

La plataforma permitirá integrar un formulario en una página desarrollada por nosotros o por terceros.

Cada despacho podrá habilitar:

- Diagnóstico público.
- Contacto breve.
- Ambas opciones.

El diagnóstico público será una capacidad de la primera fase, junto con el contacto breve.

La selección de José Rafael será contacto breve, seguido de atención personal y diagnóstico interno.

### 5.2. Entrada manual

Un usuario autorizado podrá registrar una solicitud recibida por:

- Llamada.
- WhatsApp.
- Correo.
- Atención presencial.
- Referencia.
- Otro canal identificado.

También podrá registrar directamente una solicitud de un cliente existente.

Ambas vías alimentarán el mismo modelo de información y el mismo flujo comercial.

### 5.3. Acciones al recibir una solicitud

1. Validar los datos.
2. Identificar el despacho receptor.
3. Buscar coincidencias de contactos y empresas.
4. Crear o relacionar los registros correspondientes.
5. Guardar la solicitud y sus respuestas.
6. Registrar fecha, canal y origen.
7. Incorporarla a la bandeja de nuevas solicitudes.
8. Notificar al responsable o a la bandeja general.
9. Confirmar al interesado que la información se recibió.

La confirmación de éxito solo se mostrará después del guardado.

Si falla el envío, el formulario conservará los datos y permitirá reintentar sin producir solicitudes duplicadas.

### 5.4. Duplicados

Un nuevo envío no debe confundirse automáticamente con una nueva empresa.

Las coincidencias se propondrán usando los datos disponibles. Un correo compartido o un nombre parecido no bastarán para fusionar registros silenciosamente.

El equipo podrá revisar coincidencias y resolver duplicados. Toda vinculación o fusión deberá conservar las solicitudes y su historial.

---

## 6. Integración con páginas externas

### Solución inicial propuesta

Ofrecer un formulario alojado por la plataforma que pueda:

- Abrirse mediante enlace.
- Insertarse en una página mediante un bloque de integración.

Cada formulario pertenecerá a un despacho y mostrará su identidad.

Las integraciones a medida mediante una interfaz de programación se incorporarán cuando sean necesarias.

### Requisitos técnicos

- Validación de los datos en el servidor.
- Identificación segura del despacho receptor.
- Protección contra envíos abusivos.
- Límites de tamaño y formato.
- Registro del origen.
- Prevención de duplicados por reintentos.
- Compatibilidad visual con computadora y móvil.
- Ninguna credencial privada dentro del código público.

El formulario público solo podrá enviar información. No podrá consultar la base privada de clientes.

Los dominios autorizados y las medidas contra abuso complementarán la protección; no sustituirán los controles del servidor.

### WhatsApp

El contacto breve podrá guardar la solicitud y ofrecer continuar por WhatsApp.

Abrir WhatsApp no se registrará como prueba de que el mensaje fue enviado o recibido.

La creación de solicitudes a partir de mensajes recibidos directamente requerirá una integración específica, fuera del alcance inicial salvo acuerdo expreso.

---

## 7. Formularios públicos e internos

### 7.1. Contacto breve

Campos propuestos:

- Nombre.
- Correo o teléfono de contacto.
- Empresa o proyecto, si corresponde.
- Motivo breve.
- Preferencia de contacto.
- Aviso y consentimiento aplicables.

La obligatoriedad se confirmará con José Rafael.

### 7.2. Diagnóstico público

Podrá incluir:

- Etapa del negocio.
- Áreas legales de interés.
- Sector o industria.
- Nombre del contacto.
- Cargo o relación con el negocio.
- Correo.
- Teléfono.
- Nombre comercial o denominación.
- Descripción de la situación.
- Adjuntos, si se habilitan.

Se revisará la regla histórica del máximo de tres selecciones: debe quedar definido si aplica a sectores, áreas o ambos. No se fijará en programación mientras exista ambigüedad.

### 7.3. Diagnóstico interno

Siempre estará disponible, incluso cuando el despacho desactive el diagnóstico público.

Permitirá registrar:

- Respuestas y antecedentes.
- Información faltante.
- Puntos críticos.
- Documentación revisada.
- Valoración del profesional.
- Riesgos y prioridades.
- Recomendaciones.
- Servicios propuestos.
- Próxima acción.

Estados:

**Pendiente → En elaboración → Completado.**

Completado no significa inmutable: las revisiones posteriores deberán conservar autor y fecha.

### 7.4. Separación de respuestas y valoración

Se distinguirá:

- Lo declarado por el interesado.
- Lo verificado o anotado por el equipo.
- La conclusión profesional.

Si existe un semáforo calculado, sus reglas deberán definirse y su resultado identificarse como orientativo hasta la validación correspondiente.

---

## 8. Gestión comercial

### Etapas propuestas

1. Nueva sin atender.
2. En seguimiento.
3. Reunión agendada.
4. Propuesta enviada.
5. Aceptada total o parcialmente.

Resultados alternativos:

- No aceptada.
- Sin respuesta.
- Cancelada.

No todas las solicitudes necesitarán recorrer todas las etapas.

### Información de seguimiento

- Responsable comercial.
- Fecha del primer contacto.
- Última actividad.
- Próxima acción y fecha.
- Diagnóstico.
- Reuniones.
- Presupuestos.
- Motivo de cierre o pérdida.
- Asuntos generados.

### Reglas

- Asignar una solicitud no equivale a contratar un servicio.
- Agendar una reunión no equivale a aceptar una propuesta.
- Una empresa activa puede tener nuevas solicitudes pendientes.
- El cierre comercial conserva la información.
- Una solicitud aceptada puede originar varios asuntos.

---

## 9. Presupuestos y catálogo de servicios

### Catálogo

Cada servicio podrá tener:

- Nombre y descripción.
- Área.
- Alcance orientativo.
- Recaudos habituales.
- Tarifa fija o necesidad de valoración.
- Condiciones y entregables.
- Estado activo o archivado.

Las tarifas procederán del despacho.

### Presupuesto

Contendrá:

- Identificador.
- Cliente y solicitud.
- Fecha y vigencia.
- Moneda.
- Servicios y conceptos.
- Cantidades y precios.
- Descuentos autorizados.
- Gastos e impuestos cuando correspondan.
- Condiciones de pago.
- Exclusiones y observaciones.
- Total.

La definición de monedas, impuestos y reglas de redondeo se confirmará antes de implementar cálculos.

### Estados

**Borrador → Enviado → Aceptado total o parcialmente / Rechazado / Vencido / Sustituido.**

### Reglas esenciales

- Conservar la versión enviada.
- No modificar propuestas históricas al actualizar tarifas.
- Registrar aceptación por servicio.
- Registrar quién comunicó o verificó la aceptación y cuándo.
- Generar asuntos únicamente para los servicios autorizados.
- Evitar crear dos veces el mismo asunto al repetir una acción.

En fase 1, el envío y la aceptación podrán registrarse manualmente con evidencia. La aceptación desde el portal y los envíos automáticos se ampliarán en fase 2.

---

## 10. Inicio de trabajo

Cada servicio podrá tener condiciones de inicio:

- Aceptación.
- Documentación mínima.
- Anticipo, si aplica.
- Autorización interna.

El sistema mostrará qué requisitos faltan.

La fase 1 podrá registrar manualmente el estado de un anticipo y su referencia. No incluirá contabilidad, conciliación bancaria ni facturación completa.

Un responsable autorizado podrá permitir el inicio con requisitos pendientes, dejando motivo e historial.

---

## 11. Asuntos o expedientes

Cada asunto tendrá:

- Cliente.
- Solicitud y servicio de origen.
- Nombre e identificador.
- Descripción y alcance.
- Responsable principal.
- Colaboradores.
- Estado.
- Prioridad.
- Fechas.
- Tareas.
- Documentos.
- Comunicaciones.
- Entregables.
- Criterios de cierre.

Estados propuestos:

**Por iniciar → En ejecución → En revisión final → Finalizado.**

Podrá estar bloqueado o en espera sin perder su etapa de trabajo. Se registrará el motivo, de quién depende y la próxima acción.

También se contemplarán suspensión y cancelación.

Esta separación permite saber, por ejemplo, que un asunto está en ejecución y temporalmente espera una respuesta del cliente.

---

## 12. Tareas, revisión y tableros

### Contenido de una tarjeta

- Título.
- Descripción.
- Resultado esperado.
- Responsable principal.
- Colaboradores.
- Revisor.
- Fecha de inicio y vencimiento.
- Prioridad.
- Lista de comprobación.
- Comentarios.
- Adjuntos.
- Bloqueos.
- Historial.

### Flujo

**Pendiente → En proceso → En revisión → Completada.**

Si hay observaciones:

**En revisión → Correcciones → En revisión.**

El cierre podrá ser directo cuando la tarea no requiera revisión.

### Reglas

- Una tarea puede ser comercial o pertenecer a un asunto.
- El revisor debe estar identificado cuando se solicite revisión.
- Una devolución debe incluir observaciones.
- Completar una tarea no cierra automáticamente el asunto.
- Reabrir una tarea debe conservar el motivo.
- Cambiar responsable debe actualizar las bandejas.
- Una reasignación no concede acceso indiscriminado a otros asuntos.

### Vistas

- Tablero por asunto.
- Lista por asunto.
- Mis tareas.
- Pendiente de mi revisión.
- Tareas vencidas.
- Tareas bloqueadas.

Las dependencias avanzadas y las plantillas de tableros se incorporarán en fase 2. En fase 1 podrán registrarse bloqueos y requisitos previos de manera explícita.

---

## 13. Responsabilidades y permisos internos

Perfiles iniciales:

| Perfil | Alcance orientativo |
|---|---|
| Director | Administración del despacho y supervisión general. |
| Supervisor | Coordinación y revisión del ámbito asignado. |
| Abogado | Gestión de asuntos y tareas autorizadas. |
| Secretaría | Recepción, agenda, coordinación y documentación autorizada. |
| Pasante | Trabajo asignado con revisión cuando corresponda. |

El nombre del perfil no será el único criterio de acceso.

Se definirán permisos para ver, crear, editar, asignar, aprobar, compartir, descargar, archivar y administrar.

### Niveles de responsabilidad

- Relación con el cliente.
- Asunto.
- Tarea.
- Revisión.

### Operación individual

José Rafael podrá asumir todos los niveles.

El sistema evitará notificaciones o aprobaciones redundantes y permitirá completar tareas propias cuando esté autorizado.

### Cambios de equipo

Se podrá desactivar una cuenta, transferir trabajo pendiente y conservar su historial.

---

## 14. Portal del cliente

### Capacidades de fase 1

- Activar acceso mediante invitación.
- Consultar asuntos autorizados.
- Crear solicitudes nuevas.
- Ver avances publicados.
- Entregar documentos.
- Consultar mensajes dirigidos al cliente.
- Descargar e imprimir entregas.
- Consultar presupuestos compartidos.

### Empresas con varios usuarios

Se contemplarán permisos como:

- Ver todos los asuntos autorizados de la empresa.
- Ver solo determinados asuntos.
- Crear solicitudes.
- Subir documentos.
- Descargar documentos.
- Consultar presupuestos.
- Aceptar propuestas, cuando se habilite.
- Administrar colaboradores, dentro de los límites del despacho.

En fase 1, el despacho podrá administrar estos accesos. En fase 2 se ampliará la autogestión de la persona administradora de la empresa.

### Separación interna y externa

Las notas internas, borradores y comentarios de revisión permanecerán privados salvo publicación expresa.

Las nuevas solicitudes del portal se vincularán automáticamente con la identidad autenticada y el contexto de empresa autorizado.

---

## 15. Documentos y entregas

### Clasificación

- Recaudos recibidos.
- Documentos generales del cliente.
- Borradores internos.
- Documentos finales.
- Evidencias de aceptación o entrega.

### Datos del documento

- Nombre y tipo.
- Cliente y relaciones.
- Autor de la carga.
- Fecha.
- Versión.
- Vigencia, si aplica.
- Visibilidad.
- Estado.
- Archivo original.

### Reglas

- Un documento podrá utilizarse en varios asuntos.
- Reemplazarlo conservará la versión anterior.
- El portal mostrará únicamente versiones autorizadas.
- La descarga comprobará los permisos.
- Los archivos privados no dependerán de enlaces públicos permanentes.
- La carga tendrá restricciones de tamaño y formato.
- Se informará claramente cuando una carga falle.

Se definirá una política de archivo, recuperación y eliminación definitiva.

La impresión de documentos se apoyará en formatos descargables o vistas preparadas para imprimir.

---

## 16. Comunicación, notificaciones e historial

### Comunicación

Se distinguirán:

- Nota interna.
- Mensaje al cliente.
- Registro de llamada.
- Solicitud de recaudos.
- Observación de revisión.
- Acuerdo o decisión.

### Notificaciones

Eventos iniciales:

- Solicitud recibida.
- Asignación.
- Mensaje recibido.
- Documento entregado.
- Revisión solicitada.
- Corrección solicitada.
- Entrega publicada.

En fase 1, las notificaciones internas serán parte del producto. Los correos necesarios para acceso y recuperación también.

Los recordatorios automáticos y canales adicionales se ampliarán en fase 2.

### Confiabilidad

Guardar un cambio y entregar su notificación son operaciones relacionadas, pero el fallo de una notificación no debe borrar el cambio.

El sistema registrará notificaciones pendientes o fallidas para permitir su recuperación.

### Historial

Se conservarán actor, acción, fecha, registro afectado y cambios relevantes.

No se permitirá alterar silenciosamente el historial mediante edición de una nota.

---

## 17. Agenda, fechas y bloqueos

### Fechas diferenciadas

- Seguimiento comercial.
- Reunión.
- Vencimiento de tarea.
- Compromiso con el cliente.
- Fecha relevante del asunto.

### Agenda en fase 1

Permitirá registrar reuniones, participantes, fecha, hora, modalidad y resultado.

### Integración en fase 2

La reserva pública y su conexión con Google Calendar contemplarán:

- Zona horaria.
- Disponibilidad.
- Duración.
- Intervalos.
- Prevención de reservas incompatibles.
- Cancelaciones y reprogramaciones.
- Relación con solicitud y contacto.
- Manejo de fallos de sincronización.

La integración concreta se confirmará antes de su desarrollo. Si José la considera indispensable para lanzar, se trasladará completa a la fase 1 y se ajustará su alcance y duración.

---

## 18. Paneles y navegación

### Navegación interna propuesta

- Inicio.
- Gestión comercial.
- Directorio.
- Asuntos.
- Mis tareas.
- Documentos.
- Agenda.
- Equipo.
- Configuración.

Los presupuestos estarán accesibles desde la solicitud y mediante su listado cuando el volumen lo justifique.

### Panel del director

- Nuevas solicitudes.
- Seguimientos del día.
- Reuniones.
- Presupuestos pendientes.
- Revisiones.
- Vencimientos.
- Bloqueos.
- Actividad reciente.

### Panel del colaborador

- Trabajo asignado.
- Fechas próximas.
- Correcciones.
- Revisiones.
- Mensajes relevantes.

### Panel del cliente

- Asuntos activos.
- Documentos pendientes de entregar.
- Mensajes.
- Presupuestos.
- Entregas disponibles.
- Nueva solicitud.

Cada indicador deberá abrir un listado coherente con su cifra.

---

## 19. Diseño visual y experiencia

### Dirección

Interfaz profesional, clara y visual, con jerarquía entre información principal, contexto y acciones.

La identidad definitiva se acordará mediante una propuesta visual antes de extender el diseño a todos los módulos.

### Sistema compartido

Se definirán colores, tipografías, espaciados, botones, formularios, tablas, tarjetas, estados, diálogos y notificaciones.

### Comportamiento

- Conservar filtros y contexto cuando sea útil.
- Indicar dónde está la persona.
- Mostrar estados de carga, vacío, error y guardado.
- Advertir sobre cambios sin guardar.
- Confirmar acciones destructivas.
- Evitar depender únicamente del color para comunicar estados.
- Mantener navegación por teclado y etiquetas comprensibles.

### Adaptación

En escritorio se priorizarán tablas legibles y paneles amplios.

En móvil se reorganizará el contenido mediante tarjetas, secciones y acciones accesibles. Los tableros podrán ofrecer una alternativa en lista.

Cada entrega se revisará con datos vacíos, habituales y extensos, nombres largos y distintos tamaños de pantalla.

---

## 20. Arquitectura de programación propuesta

La selección concreta de herramientas se hará después de evaluar el repositorio. Se conservará lo que sirva y se cambiará lo que impida cumplir el plan.

### Componentes

1. **Aplicación interna y portal:** interfaz y navegación.
2. **Servidor o capa de servicios:** reglas, validaciones y operaciones.
3. **Base de datos:** relaciones y persistencia.
4. **Almacenamiento privado:** archivos y versiones.
5. **Autenticación y autorización:** identidad y permisos.
6. **Procesamiento de eventos:** notificaciones, generación de documentos y automatizaciones.
7. **Integraciones:** formularios externos, correo y agenda.

### Organización funcional

Los módulos de contactos, solicitudes, presupuestos, asuntos, tareas y documentos tendrán responsabilidades definidas.

Las reglas importantes estarán centralizadas. Cambiar un estado desde un tablero, una ficha o una automatización deberá aplicar las mismas validaciones.

### Operaciones relacionadas

Se deberán proteger operaciones como:

- Crear una solicitud y sus relaciones.
- Aceptar servicios y abrir asuntos.
- Cambiar el estado de una tarea y registrar actividad.
- Publicar una entrega y conceder visibilidad.
- Retirar acceso y reasignar trabajo.

Se utilizarán transacciones o mecanismos equivalentes adecuados a la base elegida.

### Reintentos y simultaneidad

- Repetir un envío no deberá duplicar el resultado.
- Dos usuarios editando deberán recibir un comportamiento definido.
- Los conflictos importantes no se resolverán sobrescribiendo silenciosamente.
- Los fallos parciales deberán quedar identificados y ser recuperables.

### Preparación para varios despachos

Los registros privados pertenecerán a un despacho desde la primera fase.

Las relaciones deberán comprobar que no se conectan datos de despachos distintos.

La fase 3 completará la administración comercial y el alta autónoma o asistida de nuevos despachos.

---

## 21. Seguridad y continuidad

- Comprobar identidad y permisos en cada operación protegida.
- Mantener credenciales fuera del código público.
- Limitar el acceso a archivos privados.
- Proteger las entradas públicas contra abuso.
- Registrar errores sin exponer datos sensibles.
- Separar datos de prueba y datos reales cuando sea necesario.
- Definir respaldos y comprobar su recuperación.
- Conservar versiones del código y cambios de estructura de datos.
- Aplicar una política de sesiones y recuperación de acceso.

Las políticas definitivas de privacidad, conservación y condiciones de uso deberán establecerse antes del lanzamiento comercial.

---

## 22. Fase 1 — Despacho operativo completo

### Resultado

José Rafael puede recibir un interesado, diagnosticar su necesidad, presentar una propuesta, ejecutar los servicios aceptados y entregar documentos mediante el portal.

### Incluye

- Identidad del despacho y configuración inicial.
- Acceso interno.
- Directorio de empresas y personas.
- Formularios públicos completo y breve.
- Registro manual.
- Diagnóstico interno.
- Seguimiento comercial.
- Agenda manual.
- Catálogo y presupuestos en PDF.
- Aceptación total o parcial registrada.
- Asuntos por servicio.
- Tareas, revisión y correcciones.
- Responsables y permisos iniciales.
- Documentos privados y entregas.
- Portal básico con varios usuarios administrados por el despacho.
- Mensajes y notas diferenciados.
- Notificaciones internas.
- Paneles y búsquedas esenciales.
- Historial y recuperación básica.
- Diseño adaptable y coherente.

### Prueba de aceptación

Un interesado envía el diagnóstico desde una web externa. José recibe la solicitud, completa su valoración y propone tres servicios. Se aceptan dos y se crean dos asuntos. Se ejecutan tareas, se corrige un borrador y se publica una entrega. El cliente entra desde el celular y descarga el documento autorizado.

El mismo recorrido debe funcionar comenzando con contacto breve o registro manual.

También deberá comprobarse que un usuario sin permiso no puede consultar el asunto ni descargar sus archivos.

---

## 23. Fase 2 — Equipo y automatización completos

### Resultado

Un equipo puede coordinar varios asuntos con menos seguimiento manual.

### Incluye

- Disponibilidad y reserva pública conectadas con agenda.
- Recordatorios configurables.
- Plantillas de tareas y recaudos por servicio.
- Dependencias de tareas.
- Sustituciones y delegaciones más completas.
- Permisos más detallados.
- Administración de colaboradores por el cliente.
- Aceptación de propuestas desde el portal.
- Envíos comerciales y seguimiento.
- Indicadores de carga y tiempos.
- Reutilización avanzada de condiciones y plantillas.
- Mejoras de búsqueda y reportes.

### Prueba de aceptación

Una llamada reservada genera o vincula la solicitud. Se acepta una propuesta y se aplica una plantilla de trabajo. Un pasante entrega su tarea, un supervisor solicita correcciones y un abogado completa el siguiente paso. El cliente aporta un recaudo y recibe una entrega. Las bandejas, fechas y notificaciones permanecen coordinadas.

---

## 24. Fase 3 — Plataforma para despachos y comunidad

### Resultado

Otros despachos pueden incorporarse y configurar su operación; los participantes autorizados pueden publicar perfiles comerciales voluntarios.

### Incluye

- Alta y configuración de nuevos despachos.
- Identidad y formularios por despacho.
- Usuarios, tarifas, plantillas y permisos propios.
- Administración general de la plataforma.
- Procedimientos de exportación y salida.
- Pruebas de aislamiento entre despachos.
- Directorio empresarial voluntario.
- Perfil público con publicación y retirada.
- Búsqueda por servicios y sectores.
- Contacto comercial según datos publicados.
- Moderación y tratamiento de abuso.

### Decisión pendiente de comunidad

Se definirá si el directorio será por despacho, compartido entre despachos o ambas modalidades.

Ningún dato privado se publicará por pertenecer al CRM.

### Prueba de aceptación

Dos despachos operan con configuraciones independientes sin acceso a datos ajenos. Una empresa publica voluntariamente su perfil, otra encuentra su servicio y puede contactarla. Retirar el perfil elimina su presencia pública sin borrar su historial privado como cliente.

---

## 25. Método de desarrollo y revisión visual

### Antes de modificar código

1. Revisar este plan.
2. Resolver decisiones que afecten la estructura.
3. Inventariar el proyecto existente.
4. Comparar funciones presentes con funciones comprobadas.
5. Decidir qué conservar, corregir o sustituir.
6. Preparar un orden de implementación con dependencias.

### Durante cada entrega

1. Diseñar el recorrido y sus pantallas.
2. Implementar guardado, permisos y reglas.
3. Conectar la interfaz.
4. Probar el recorrido completo.
5. Revisar apariencia y adaptación.
6. Publicar la versión revisable.
7. Incorporar ajustes y actualizar el plan.

Podremos trabajar sobre un entorno publicado en Vercel para que la propietaria vea los avances.

Cada versión deberá poder identificarse y recuperarse. Los cambios de base de datos y archivos requerirán su propia estrategia de recuperación; volver al código anterior puede no bastar.

Mientras se desarrolla podrán existir versiones intermedias para revisión. La entrega de una fase deberá cumplir todos sus criterios de aceptación.

---

## 26. Matriz de evaluación del repositorio

Cada capacidad se clasificará como:

- Existe y está comprobada.
- Existe parcialmente.
- Existe, pero requiere corrección.
- No existe.
- Pendiente de decisión.

La evaluación incluirá:

- Pantalla.
- Guardado y consulta.
- Reglas de negocio.
- Permisos.
- Relación con otros módulos.
- Manejo de errores.
- Adaptación visual.
- Prueba completa.
- Acción recomendada.

No se asumirá que debe rehacerse todo ni que el avance anterior equivale a una versión funcional.

---

## 27. Decisiones que debemos cerrar

### Antes de la fase 1

- Marca y términos visibles.
- Campos y límites de selección de formularios.
- Datos mínimos para registrar un contacto.
- Reglas del diagnóstico y del riesgo.
- Catálogo, tarifas, monedas y redondeos.
- Evidencia de aceptación.
- Requisitos de inicio y cierre.
- Permisos iniciales.
- Momento de invitación al portal.
- Tipos, tamaños y conservación de archivos.
- Identidad visual.
- Necesidad de adelantar la agenda integrada.

### Antes de la fase 2

- Reglas de disponibilidad y recordatorios.
- Plantillas de trabajo.
- Delegaciones.
- Autogestión del cliente.
- Canales de envío.
- Indicadores prioritarios.

### Antes de la fase 3

- Modalidad comercial.
- Incorporación y salida de despachos.
- Alcance de la comunidad.
- Datos públicos y moderación.
- Administración y soporte.

---

## 28. Definición de producto terminado

Una entrega está terminada cuando:

- El recorrido acordado se completa con datos persistentes.
- Los permisos permiten lo autorizado y bloquean lo demás.
- Los documentos se guardan y descargan correctamente.
- Los estados y paneles reflejan la situación real.
- Los errores permiten comprender y recuperar la operación.
- La interfaz es coherente en computadora y móvil.
- No hay acciones visibles sin funcionamiento.
- Existe historial suficiente para entender qué ocurrió.
- La versión puede desplegarse y mantenerse.
- Se han revisado los criterios de aceptación con la propietaria.

## 29. Referencia de trabajo

Este plan establece el producto objetivo.

El siguiente paso será contrastar el repositorio con él y preparar una propuesta concreta de conservación, rediseño y desarrollo por fases.

Toda nueva decisión deberá incorporarse a esta referencia indicando qué cambia, a qué fase pertenece y cómo se comprobará su funcionamiento.


## Decisión posterior confirmada en este chat

Moneda de los nuevos presupuestos: USD. Se conserva el alcance y las tres fases del plan original. El avance y las pruebas se registran en FASE-1-AVANCE-OPERATIVO.md.
