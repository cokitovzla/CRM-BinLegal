import type { LegalProcess } from '../types';
import { INITIAL_DEMO_PROCESSES } from '../services/processService';

export const INITIAL_PREVIEW_PROCESSES: LegalProcess[] = [
  {
    ...INITIAL_DEMO_PROCESSES[0],
    userId: 'demo-client-uid-01',
    clientEmail: 'alejandro@urbanbite.ve',
    clientName: 'Alejandro Morales',
    companyName: 'UrbanBite Delivery',
  },
  {
    ...INITIAL_DEMO_PROCESSES[1],
    userId: 'demo-client-uid-02',
    clientEmail: 'corina@vitalgreen.com',
    clientName: 'Corina Villegas',
    companyName: 'VitalGreen Cosmética Natural',
  },
  {
    ...INITIAL_DEMO_PROCESSES[2],
    userId: 'demo-client-uid-03',
    clientEmail: 'rodrigo@servioffice.net',
    clientName: 'Ing. Rodrigo Cárdenas',
    companyName: 'ServiOffice Soluciones',
  },
  {
    id: 'proc-104',
    userId: 'demo-client-uid-04',
    clientEmail: 'valeria@aurorastudio.design',
    clientName: 'Valeria Guzmán',
    companyName: 'Aurora Creative Studio',
    title: 'Registro y actualización de RIF empresarial',
    category: 'Corporativo',
    status: 'recaudos',
    progress: 20,
    assignedLawyer: 'Elena Marín',
    nextMilestone: 'Validar recaudos y preparar expediente tributario',
    targetDate: '20 días hábiles',
    documents: [{ name: 'Ficha_Apertura_Atlas.pdf', category: 'Apertura', date: '28 Oct 2026', status: 'en_revision' }],
    milestones: [{ date: '28 Oct 2026', title: 'Solicitud recibida', note: 'Caso ficticio para la demostración del MVP.' }],
    createdAt: '2026-10-28',
    updatedAt: '2026-10-28',
  },

  {
    id: 'vital-legal-201', userId: 'demo-client-uid-02', clientEmail: 'corina@vitalgreen.com',
    clientName: 'Corina Villegas', companyName: 'VitalGreen Cosmética Natural',
    title: 'Constitución y actualización societaria', category: 'Corporativo', status: 'completado',
    progress: 100, assignedLawyer: 'María Fernández', openedBy: 'Elena Marín', clientAcquiredBy: 'Carlos Bermúdez',
    nextMilestone: 'Trámite finalizado y documentos entregados', targetDate: 'Completado · 12 Sep 2026',
    documents: [
      { name: 'Acta_Asamblea_VitalGreen.pdf', category: 'Corporativo', date: '12 Sep 2026', status: 'aprobado' },
      { name: 'Estatutos_Actualizados_VitalGreen.pdf', category: 'Documento final', date: '12 Sep 2026', status: 'aprobado' }
    ],
    milestones: [
      { date: '18 Ago 2026', title: 'Apertura de expediente', note: 'Elena Marín: verificación inicial y lista de recaudos.' },
      { date: '21 Ago 2026', title: 'Recaudos revisados', note: 'María Fernández: documentación societaria validada.' },
      { date: '03 Sep 2026', title: 'Acta y estatutos aprobados', note: 'María Fernández: revisión interna completada.' },
      { date: '12 Sep 2026', title: 'Cierre y entrega', note: 'Elena Marín: documentos finales entregados.' }
    ],
    activityHistory: [
      { id: 'v201-a1', date: '18 Ago 2026 · 09:10', title: 'Cliente captado y registrado', description: 'Primera reunión de diagnóstico y alta de la oportunidad.', actor: 'Carlos Bermúdez', role: 'Desarrollo de negocio' },
      { id: 'v201-a2', date: '18 Ago 2026 · 10:25', title: 'Expediente abierto', description: 'Validación inicial e identificación del contacto principal.', actor: 'Elena Marín', role: 'Administrador autorizado' },
      { id: 'v201-a3', date: '21 Ago 2026 · 14:40', title: 'Abogada asignada', description: 'Asignación de revisión societaria y control de recaudos.', actor: 'Elena Marín', role: 'Administrador autorizado' },
      { id: 'v201-a4', date: '03 Sep 2026 · 16:20', title: 'Documentación aprobada', description: 'Acta y estatutos revisados antes de su entrega.', actor: 'María Fernández', role: 'Abogada asignada' },
      { id: 'v201-a5', date: '12 Sep 2026 · 11:15', title: 'Trámite completado', description: 'Documentos finales entregados y cierre registrado.', actor: 'María Fernández', role: 'Abogada responsable' }
    ],
    createdAt: '2026-08-18', updatedAt: '2026-09-12'
  },
  {
    id: 'vital-legal-202', userId: 'demo-client-uid-02', clientEmail: 'corina@vitalgreen.com',
    clientName: 'Corina Villegas', companyName: 'VitalGreen Cosmética Natural',
    title: 'Registro de marca y estrategia de protección', category: 'Propiedad Intelectual', status: 'completado',
    progress: 100, assignedLawyer: 'Ana Rivas', openedBy: 'Elena Marín', clientAcquiredBy: 'Carlos Bermúdez',
    nextMilestone: 'Trámite finalizado; expediente archivado', targetDate: 'Completado · 06 Oct 2026',
    documents: [
      { name: 'Informe_Viabilidad_VitalGreen.pdf', category: 'Marcas', date: '28 Sep 2026', status: 'aprobado' },
      { name: 'Constancia_Consignacion_SAPI.pdf', category: 'Trámite oficial', date: '06 Oct 2026', status: 'aprobado' }
    ],
    milestones: [
      { date: '20 Sep 2026', title: 'Búsqueda de antecedentes', note: 'Ana Rivas: revisión de coincidencias y clases aplicables.' },
      { date: '28 Sep 2026', title: 'Informe de viabilidad', note: 'Ana Rivas: informe presentado al cliente.' },
      { date: '06 Oct 2026', title: 'Solicitud consignada', note: 'Ana Rivas: comprobante incorporado al expediente.' }
    ],
    activityHistory: [
      { id: 'v202-a1', date: '19 Sep 2026 · 15:05', title: 'Solicitud recibida', description: 'Corina Villegas solicitó evaluar la protección de la marca.', actor: 'Corina Villegas', role: 'Contacto cliente' },
      { id: 'v202-a2', date: '20 Sep 2026 · 10:30', title: 'Expediente abierto', description: 'Alta del caso y comprobación de datos comerciales.', actor: 'Elena Marín', role: 'Administrador autorizado' },
      { id: 'v202-a3', date: '21 Sep 2026 · 12:00', title: 'Abogada asignada', description: 'Ana Rivas asume búsqueda y análisis marcario.', actor: 'Elena Marín', role: 'Administrador autorizado' },
      { id: 'v202-a4', date: '28 Sep 2026 · 17:10', title: 'Informe enviado', description: 'Viabilidad explicada y aprobación documentada.', actor: 'Ana Rivas', role: 'Abogada asignada' },
      { id: 'v202-a5', date: '06 Oct 2026 · 13:45', title: 'Consignación registrada', description: 'Comprobante añadido y fase cerrada.', actor: 'Ana Rivas', role: 'Abogada responsable' }
    ],
    createdAt: '2026-09-19', updatedAt: '2026-10-06'
  },
  {
    id: 'vital-legal-203', userId: 'demo-client-uid-02', clientEmail: 'corina@vitalgreen.com',
    clientName: 'Corina Villegas', companyName: 'VitalGreen Cosmética Natural',
    title: 'Contrato de distribución con cadena farmacéutica', category: 'Contratos', status: 'completado',
    progress: 100, assignedLawyer: 'Elena Marín', openedBy: 'Elena Marín', clientAcquiredBy: 'Carlos Bermúdez',
    nextMilestone: 'Contrato firmado y copia final entregada', targetDate: 'Completado · 21 Oct 2026',
    documents: [
      { name: 'Contrato_Distribucion_Firmado.pdf', category: 'Contrato final', date: '21 Oct 2026', status: 'aprobado' },
      { name: 'Matriz_Condiciones_Negociadas.xlsx', category: 'Negociación', date: '19 Oct 2026', status: 'aprobado' }
    ],
    milestones: [
      { date: '08 Oct 2026', title: 'Contrato recibido', note: 'Elena Marín: se detectaron plazos de pago y penalidades desequilibradas.' },
      { date: '13 Oct 2026', title: 'Ronda de observaciones', note: 'Elena Marín: ajustes a pagos, responsabilidad y terminación.' },
      { date: '19 Oct 2026', title: 'Condiciones negociadas', note: 'Elena Marín y Corina Villegas: términos acordados.' },
      { date: '21 Oct 2026', title: 'Firma y cierre', note: 'Elena Marín: copia final archivada y entregada.' }
    ],
    activityHistory: [
      { id: 'v203-a1', date: '07 Oct 2026 · 09:35', title: 'Solicitud comercial recibida', description: 'Solicitud para revisar condiciones de distribución nacional.', actor: 'Corina Villegas', role: 'Contacto cliente' },
      { id: 'v203-a2', date: '08 Oct 2026 · 11:20', title: 'Expediente abierto', description: 'Registro de versión recibida y fecha de respuesta.', actor: 'Elena Marín', role: 'Abogado responsable' },
      { id: 'v203-a3', date: '13 Oct 2026 · 16:00', title: 'Observaciones preparadas', description: 'Revisión de pago, exclusividad, penalidades y terminación.', actor: 'Elena Marín', role: 'Abogado responsable' },
      { id: 'v203-a4', date: '19 Oct 2026 · 15:30', title: 'Términos acordados', description: 'Contraparte aceptó cambios principales tras negociación.', actor: 'Elena Marín', role: 'Abogado responsable' },
      { id: 'v203-a5', date: '21 Oct 2026 · 12:10', title: 'Trámite completado', description: 'Contrato firmado y versión final entregada.', actor: 'Elena Marín', role: 'Abogado responsable' }
    ],
    createdAt: '2026-10-07', updatedAt: '2026-10-21'
  },
];
