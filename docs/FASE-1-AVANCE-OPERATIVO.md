> Registro de un avance anterior. Para el estado actual y lo pendiente de la fase 1, consulta [Estado vigente](FASE-1-ESTADO.md).

# Fase 1: conexión comercial y ejecución

Referencia principal: última versión del plan en el chat «Plan Maestro CRM - BinLegal», releída para esta implementación. Apartados 9 a 13 y prueba de aceptación de la fase 1.

## Decisión confirmada por la propietaria

- Moneda para nuevos presupuestos: USD.
- Impuestos, gastos y redondeos adicionales siguen pendientes. Este avance conserva el cálculo básico previo; no añade tasas ni convierte presupuestos históricos.

## Implementado en este bloque

- Presupuesto con conceptos y tarifas introducidos por el despacho y guardado explícito.
- Registro manual de evidencia de aceptación por servicio.
- Conservación de la versión aceptada, bloqueada frente a sobrescrituras desde la aplicación.
- Aceptación parcial: una solicitud puede abrir varios asuntos independientes.
- Identificadores deterministas para impedir duplicar asuntos al repetir la aceptación.
- El asunto conserva el vínculo con solicitud, servicio y versión de presupuesto.
- Una cuenta de acceso no se inventa a partir del identificador de una solicitud.
- Tareas con responsable, resultado esperado, fecha y revisor configurable.
- Flujo: pendiente → en proceso → revisión → completada; devolución con observaciones obligatorias y nuevo envío tras corregir.
- Reapertura con motivo.
- Lista y tablero por asunto, historial de movimientos y bandeja «Mi trabajo»: tareas, revisiones, vencidas y todas.
- Inicio del asunto separado de la finalización de tareas; una tarea completada no cierra el asunto.
- Sesiones internas preparadas para ver asuntos asignados y trabajar en sus tareas; las cuentas no administrativas no reciben el CRM comercial completo.
- Persistencia real preparada con transacciones para tarea + historial + avisos dirigidos a responsable/revisor. Las nuevas asignaciones dan acceso solo al asunto correspondiente.
- Reglas de Firestore preparadas para respaldar las transiciones. No desplegadas.

## Verificado

- 22 pruebas del modelo, incluyendo aceptación parcial, idempotencia, preservación del presupuesto, autorización de movimientos y ciclo de correcciones.
- Prueba de navegador local: tres servicios, aceptación de dos, dos asuntos, creación de una tarea asignada a pasante con revisor, envío a revisión, localización en la bandeja, devolución con observaciones, reenvío y aprobación.
- La prueba de navegador utiliza /crm-preview y datos ficticios. No acredita aún sesiones de empleados reales ni permisos desplegados en Firebase.

## Pendientes de la fase 1

La fase 1 completa sigue abierta. Faltan, entre otros:
- Aplicar y probar reglas y transacciones contra Firebase con cuentas autorizadas; pruebas de rechazo y concurrencia.
- Invitación y vinculación de cuentas reales del equipo y clientes.
- Requisitos de inicio, bloqueos y criterios de revisión final/cierre del asunto.
- Historial de nuevas versiones y sustitución de presupuestos, PDF y condiciones financieras definitivas.
- Tareas comerciales vinculadas a solicitudes, colaboradores, listas de comprobación y adjuntos de tarea.
- Reasignación y edición de tareas antiguas que aún no tengan identidades o revisor válidos.
- Completar mensajes, notificaciones visibles y agenda manual.
- Corrección de permisos binarios, versiones y publicación de documentos.
- Portal del cliente adaptado al nuevo modelo.
- Prueba integral de la fase 1 con datos persistentes y varias cuentas reales.

Este avance se mantiene local. No hay push, despliegue de Vercel ni cambios en datos o reglas remotas.
