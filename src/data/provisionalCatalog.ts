import type { LegalArea } from '../types';

// Valores de demostración editables. No son honorarios aprobados por BinLegal ni incluyen aranceles.
export interface ProvisionalService { id: string; area: LegalArea; concept: string; suggestedPrice: number }
export const PROVISIONAL_CATALOG: ProvisionalService[] = [
  {id:'corp-1',area:'Corporativo',concept:'Constitución de sociedad mercantil: asesoría y documentos',suggestedPrice:450},
  {id:'corp-2',area:'Corporativo',concept:'Reforma de estatutos o acta de asamblea',suggestedPrice:290},
  {id:'corp-3',area:'Corporativo',concept:'Pacto de socios y acuerdo de accionistas',suggestedPrice:380},
  {id:'pi-1',area:'Propiedad Intelectual',concept:'Búsqueda y solicitud de registro de marca ante SAPI, una clase',suggestedPrice:280},
  {id:'pi-2',area:'Propiedad Intelectual',concept:'Respuesta inicial a observación de marca',suggestedPrice:220},
  {id:'pi-3',area:'Propiedad Intelectual',concept:'Cesión o licencia de marca: redacción del acuerdo',suggestedPrice:320},
  {id:'reg-1',area:'Regulatorio',concept:'Diagnóstico de obligaciones regulatorias de la actividad',suggestedPrice:180},
  {id:'reg-2',area:'Regulatorio',concept:'Revisión de términos y política de privacidad web',suggestedPrice:260},
  {id:'reg-3',area:'Regulatorio',concept:'Acompañamiento documental para permiso o licencia',suggestedPrice:320},
  {id:'lab-1',area:'Laboral',concept:'Contrato individual de trabajo y cláusulas especiales',suggestedPrice:250},
  {id:'lab-2',area:'Laboral',concept:'Auditoría básica de tres contratos laborales',suggestedPrice:320},
  {id:'lab-3',area:'Laboral',concept:'Política de confidencialidad y teletrabajo',suggestedPrice:280},
  {id:'con-1',area:'Contratos',concept:'Contrato de prestación de servicios',suggestedPrice:280},
  {id:'con-2',area:'Contratos',concept:'Revisión y comentarios a contrato comercial',suggestedPrice:220},
  {id:'con-3',area:'Contratos',concept:'Acuerdo de confidencialidad bilateral',suggestedPrice:160},
  {id:'med-1',area:'Mediación',concept:'Sesión inicial de mediación comercial',suggestedPrice:180},
  {id:'med-2',area:'Mediación',concept:'Preparación de propuesta de arreglo',suggestedPrice:240},
  {id:'med-3',area:'Mediación',concept:'Redacción de acuerdo transaccional',suggestedPrice:350},
  {id:'neg-1',area:'Negociación y mediación',concept:'Evaluación de conflicto y estrategia de negociación',suggestedPrice:200},
  {id:'neg-2',area:'Negociación y mediación',concept:'Acompañamiento a una ronda de negociación',suggestedPrice:260},
  {id:'neg-3',area:'Negociación y mediación',concept:'Acta de acuerdos y compromisos',suggestedPrice:240},
  {id:'gen-1',area:'Asesoría General',concept:'Consulta legal estratégica de una hora',suggestedPrice:100},
  {id:'gen-2',area:'Asesoría General',concept:'Informe jurídico breve sobre una consulta',suggestedPrice:220},
  {id:'gen-3',area:'Asesoría General',concept:'Revisión documental preliminar',suggestedPrice:180},
];
