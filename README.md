# BinLegal CRM

Implementación local del primer recorrido de la fase 1. Node.js 24 o superior y pnpm 11.25.0.

## Ejecutar

```text
pnpm install --frozen-lockfile
pnpm dev
pnpm lint
pnpm test
pnpm build
```

Para el recorrido integrado sin datos reales:

```text
pnpm emulators:start
pnpm emulators:seed
pnpm dev:emulators
pnpm test:rules
```

Los detalles y cuentas ficticias están en [docs/ENTORNO-PRUEBAS.md](docs/ENTORNO-PRUEBAS.md).

- /crm-preview: demostración de solicitudes en este navegador.
- /crm: CRM con acceso autorizado a Firebase.
- /diagnostico: diagnóstico público.
- /contacto: contacto breve.
- /portal: portal del cliente con asuntos, documentos autorizados y mensajes visibles para el cliente; aún requiere validación integrada antes del despliegue.

La vista previa permite crear una solicitud manual, abrirla y guardar responsable, valoración y próxima acción. Recargar conserva estos datos de muestra en el mismo navegador.

## Referencias

- [Plan maestro vigente](docs/PLAN-MAESTRO.md).
- [Bases de diseño](docs/BASES-DISENO.md).
- [Estado y validación del primer recorrido](docs/PRIMER-RECORRIDO.md).

La configuración de Firebase existente apunta a una base real. Las pruebas automatizadas del modelo no escriben en ella. Las reglas incluidas necesitan aplicarse y comprobarse antes de probar el recorrido integrado con una cuenta autorizada.

El siguiente bloque implementado conecta aceptación parcial, asuntos por servicio y tareas con revisión. Ver [avance operativo de fase 1](docs/FASE-1-AVANCE-OPERATIVO.md).

El [estado vigente de la fase 1](docs/FASE-1-ESTADO.md) contrasta cada capacidad con el plan del chat.
