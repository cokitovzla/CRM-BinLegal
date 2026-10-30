import type {Lead,LeadBudget,LeadStatus} from '../types/index.ts';
export interface ContactRecord { at:string; channel:'Llamada'|'WhatsApp'|'Correo'|'Presencial'|'Otro'; note:string; responsibleName?:string; actorUid?:string }
export interface MeetingRecord { at:string; modality:'Videollamada'|'Llamada'|'Presencial'; location:string; note:string; status:'scheduled'|'completed'|'cancelled'; responsibleName?:string; actorUid?:string }
export interface CommercialActivity {contact?:ContactRecord;meeting?:MeetingRecord}
export function commercialStatus(lead:Lead):LeadStatus {
 if(lead.acceptedBudget?.services.length)return 'cliente_activo';
 if(lead.budget?.status==='enviado'&&lead.budget.sentEvidence?.trim())return 'propuesta_presentada';
 if(lead.commercial?.meeting?.status==='scheduled')return 'sesion_programada';
 if(lead.commercial?.contact || lead.commercial?.meeting?.status==='completed')return 'diagnostico_enviado';
 return 'nuevo_lead';
}
export const COMMERCIAL_LABELS:Record<LeadStatus,string>={
 nuevo_lead:'Nueva sin atender',diagnostico_enviado:'En seguimiento',sesion_programada:'Reunión agendada',
 propuesta_presentada:'Propuesta enviada',cliente_activo:'Servicios aceptados',
};
export function parseCaracasDateTime(value:string):string {
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))throw new Error('Indica una fecha y hora válidas.');
 const date=new Date(value+'-04:00');
 if(Number.isNaN(date.getTime()) || new Date(date.getTime()-4*60*60*1000).toISOString().slice(0,16)!==value)throw new Error('La fecha y hora no existen en el calendario.');
 return date.toISOString();
}
export function caracasDateTimeInput(value=new Date().toISOString()):string {
 const date=new Date(value);return new Date(date.getTime()-4*60*60*1000).toISOString().slice(0,16);
}
export function validateCommercial(activity:CommercialActivity):CommercialActivity {
 const result=structuredClone(activity);
 for(const record of [result.contact,result.meeting])if(record){
   if(Number.isNaN(Date.parse(record.at))||!record.note.trim())throw new Error('Registra fecha, hora y una referencia de lo ocurrido.');
   if(record.note.length>4000)throw new Error('La referencia no puede superar 4000 caracteres.');
   record.note=record.note.trim();
   if(record.responsibleName){if(record.responsibleName.length>160)throw new Error('El nombre del responsable es demasiado largo.');record.responsibleName=record.responsibleName.trim();}
 }
 if(result.contact&&Date.parse(result.contact.at)>Date.now()+60000)throw new Error('Un contacto realizado no puede registrarse en una fecha futura.');
 if(result.meeting?.status==='completed'&&Date.parse(result.meeting.at)>Date.now()+60000)throw new Error('Una reunión futura no puede marcarse como realizada.');
 if(result.contact&&!['Llamada','WhatsApp','Correo','Presencial','Otro'].includes(result.contact.channel))throw new Error('Selecciona un canal válido.');
 if(result.meeting&&(!['scheduled','completed','cancelled'].includes(result.meeting.status)||!['Videollamada','Llamada','Presencial'].includes(result.meeting.modality)))throw new Error('Revisa los datos de la reunión.');
 return result;
}
export function validateBudgetDispatch(budget:LeadBudget):LeadBudget {
 if(budget.status==='aprobado')throw new Error('La aceptación se registra por servicio y con su evidencia.');
 if(budget.status==='enviado'&&!budget.sentEvidence?.trim())throw new Error('Indica por qué canal y con qué referencia se envió el presupuesto.');
 return budget;
}
