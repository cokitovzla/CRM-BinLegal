import type { Lead, LeadBudget, LegalProcess, WorkflowTask, WorkflowTaskStatus, CaseControls, ClientDocument } from '../types/index.ts';
import {calculateBudget} from './budget.ts';

export interface BudgetAcceptance {
  versionId: string; budget: LeadBudget;
  services: Array<{itemId: string; caseId: string; actorUid: string; acceptedAt: string; evidence: string}>;
}
export interface WorkMember { uid: string; name: string; role: string }
export interface TaskActor { uid: string; name: string; admin: boolean }
export const TASK_LABELS: Record<WorkflowTaskStatus,string> = {
  unassigned:'Pendiente de asignación', assigned:'Pendiente', in_progress:'En proceso',
  pending_approval:'En revisión', changes_requested:'Correcciones', completed:'Completada', cancelled:'Cancelada',
};
export const CASE_LABELS = {not_started:'Por iniciar',in_progress:'En ejecución',final_review:'En revisión final',completed:'Finalizado'} as const;
export function taskNeedsReview(task: WorkflowTask) { return task.requiresReview ?? task.requiresJoseApproval; }
export function validateTask(task: WorkflowTask) {
  if (!task.title.trim() || !task.expectedResult?.trim() || !task.assignedToUid || !task.assignedToName) throw new Error('Indica título, resultado esperado y responsable.');
  if (taskNeedsReview(task) && !task.reviewerUid) throw new Error('Selecciona quién revisará la tarea.');
  if (task.dueAt && Number.isNaN(Date.parse(task.dueAt))) throw new Error('La fecha límite no es válida.');
  if (task.title.length>200 || task.description.length>8000 || task.expectedResult.length>4000) throw new Error('El texto de la tarea supera el límite permitido.');
}
export function transitionTask(task: WorkflowTask, next: WorkflowTaskStatus, actor: TaskActor, note = '', now = new Date().toISOString()): WorkflowTask {
  const graph: Record<WorkflowTaskStatus,WorkflowTaskStatus[]> = {
    unassigned:[],assigned:['in_progress','cancelled'],in_progress:['pending_approval','completed','cancelled'],
    pending_approval:['completed','changes_requested'],changes_requested:['in_progress','cancelled'],
    completed:['in_progress'],cancelled:['assigned'],
  };
  if (!graph[task.status]?.includes(next)) throw new Error('Ese cambio no corresponde al flujo de la tarea.');
  const reviewing = task.status === 'pending_approval';
  if (reviewing ? !(actor.admin || actor.uid === task.reviewerUid) : !(actor.admin || actor.uid === task.assignedToUid)) throw new Error('Esta acción corresponde al responsable o al revisor autorizado.');
  if (next === 'pending_approval' && (!taskNeedsReview(task) || !task.reviewerUid)) throw new Error('La tarea necesita un revisor identificado.');
  if (next === 'completed' && taskNeedsReview(task) && task.status !== 'pending_approval') throw new Error('Envía el trabajo a revisión antes de completarlo.');
  if ((next === 'changes_requested' || task.status === 'completed' || next === 'cancelled' || task.status === 'cancelled') && !note.trim()) throw new Error('Indica el motivo o las observaciones de este movimiento.');
  return {...task,status:next,reviewNote:note.trim(),updatedAt:now,completedAt:next==='completed'?now:null,revision:(task.revision||0)+1};
}
export function acceptServices(lead: Lead, itemIds: string[], evidence: string, actor: TaskActor, now = new Date().toISOString()) {
  if (!actor.admin) throw new Error('La aceptación debe registrarla una persona autorizada.');
  if (!evidence.trim()) throw new Error('Registra la evidencia de aceptación: acuerdo, correo o referencia.');
  const previous = lead.acceptedBudget;
  const budget = previous?.budget || lead.budget;
  if (!budget?.items.length || budget.items.length>30) throw new Error('Prepara un presupuesto de hasta 30 servicios antes de registrar su aceptación.');
  calculateBudget(budget);
  if (!previous && budget.status !== 'enviado') throw new Error('Marca el presupuesto como enviado antes de registrar la aceptación.');
  if (new Set(budget.items.map(item=>item.id)).size !== budget.items.length) throw new Error('Los servicios deben tener identificadores distintos.');
  if (!itemIds.length || new Set(itemIds).size !== itemIds.length) throw new Error('Selecciona los servicios aceptados sin repetirlos.');
  const versionId = previous?.versionId || 'v1';
  if (budget.validUntil && itemIds.some(id => !previous?.services.some(service => service.itemId === id))) {
    const deadline = Date.parse(budget.validUntil + 'T23:59:59.999-04:00');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(budget.validUntil) || !Number.isFinite(deadline) || new Date(deadline - 4 * 3600000).toISOString().slice(0,10) !== budget.validUntil) throw new Error('La fecha de vigencia del presupuesto no es válida.');
    if (Date.parse(now) > deadline) throw new Error('El presupuesto está vencido. Prepara una propuesta vigente antes de registrar nuevos servicios aceptados.');
  }
  const acceptance: BudgetAcceptance = structuredClone(previous || {versionId,budget,services:[]});
  const processes: LegalProcess[] = [];
  for (const itemId of itemIds) {
    const item = acceptance.budget.items.find(value=>value.id===itemId);
    if (!item) throw new Error('El servicio no pertenece al presupuesto conservado.');
    if (acceptance.services.some(value=>value.itemId===itemId)) continue;
    const caseId = 'case-' + encodeURIComponent(lead.id) + '-' + versionId + '-' + encodeURIComponent(item.id);
    acceptance.services.push({itemId,caseId,actorUid:actor.uid,acceptedAt:now,evidence:evidence.trim()});
    processes.push({
      id:caseId,officeId:lead.officeId || 'binlegal',leadId:lead.id,personId:lead.personId,
      companyId:lead.companyId || null,serviceItemId:itemId,budgetVersionId:versionId,
      userId:'',clientEmail:lead.email,clientName:lead.fullName,companyName:lead.company,
      title:item.concept,category:item.area as LegalProcess['category'],status:'recaudos',caseStage:'not_started',
      progress:0,assignedLawyer:'Sin asignar',assignedLawyerId:'',assignmentStatus:'pending',
      nextMilestone:'Asignar responsable y definir requisitos de inicio',targetDate:'',createdAt:now,updatedAt:now,
      scope:item.concept,assignedLawyerIds:[],
    });
  }
  return {acceptance,processes};
}

export function validateCaseStart(process: LegalProcess, actor: TaskActor) {
  if (!actor.admin) throw new Error('El inicio requiere autorización del despacho.');
  if (process.caseStage !== 'not_started') throw new Error('El asunto ya cambió de etapa.');
  if(process.caseControls?.hold.state && process.caseControls.hold.state !== 'none') throw new Error('Resuelve o levanta la espera, bloqueo o suspensión antes de iniciar.');
  const record = process.startAuthorization;
  if(process.caseControls?.requirements.some(item=>!item.evidence.trim()) && !record?.exceptionReason.trim()) throw new Error('Hay requisitos pendientes. Acredita su cumplimiento o registra una excepción autorizada.');
  if (!record?.requirements.trim()) throw new Error('Define las condiciones de inicio de este servicio.');
  if (!record.evidence.trim() && !record.exceptionReason.trim()) throw new Error('Registra la evidencia de cumplimiento o el motivo de la excepción autorizada.');
  if ([record.requirements, record.evidence, record.exceptionReason].some(value => value.length > 4000)) throw new Error('Cada campo admite hasta 4000 caracteres.');
  return {requirements:record.requirements.trim(), evidence:record.evidence.trim(), exceptionReason:record.exceptionReason.trim(),actorUid:actor.uid,recordedAt:new Date().toISOString()};
}

export function validateCaseControls(value: CaseControls): CaseControls {
 if(!value || !Array.isArray(value.requirements) || value.requirements.length>30) throw new Error('Admite hasta 30 requisitos por asunto.');
 if(new Set(value.requirements.map(item=>item.id)).size!==value.requirements.length) throw new Error('Hay requisitos duplicados.');
 for(const item of value.requirements) {
  if(!item.id || !item.title.trim() || !item.responsible.trim()) throw new Error('Cada requisito necesita descripción y responsable.');
  if([item.title,item.responsible,item.evidence].some(text=>typeof text!=='string'||text.length>4000)) throw new Error('Cada campo admite hasta 4000 caracteres.');
 }
 const hold=value.hold;
 if(!hold || !['none','waiting','blocked','suspended'].includes(hold.state)) throw new Error('La situación de espera no es válida.');
 if([hold.reason,hold.dependsOn,hold.nextAction].some(text=>typeof text!=='string'||text.length>4000)) throw new Error('Cada campo admite hasta 4000 caracteres.');
 if(hold.state!=='none' && (!hold.reason.trim()||!hold.dependsOn.trim()||!hold.nextAction.trim())) throw new Error('Indica motivo, de quién depende y próxima acción.');
 return structuredClone(value);
}

export function validateTaskExecution(process: Pick<LegalProcess,'caseStage'|'caseControls'>, next: WorkflowTaskStatus) {
 if(next==='cancelled') return;
 if(process.caseStage==='not_started') throw new Error('Autoriza el inicio del trámite antes de ejecutar tareas. Puedes planificarlas y asignarlas mientras tanto.');
 if(process.caseStage==='completed') throw new Error('El asunto está finalizado; requiere reapertura autorizada antes de modificar tareas.');
 if(process.caseControls?.hold.state==='suspended') throw new Error('El asunto está suspendido. Levanta la suspensión antes de continuar tareas.');
}
export function validateFinalReview(process:LegalProcess,tasks:WorkflowTask[],actor:TaskActor) {
 if(!actor.admin) throw new Error('La revisión final requiere autorización del despacho.');
 if(process.caseStage!=='in_progress') throw new Error('El asunto debe estar en ejecución para pasar a revisión final.');
 if(process.caseControls?.hold.state && process.caseControls.hold.state!=='none') throw new Error('Resuelve la espera, bloqueo o suspensión antes de la revisión final.');
 if(!tasks.length || tasks.some(task=>!['completed','cancelled'].includes(task.status)) || !tasks.some(task=>task.status==='completed')) throw new Error('Completa y revisa las tareas del asunto antes de solicitar la revisión final.');
 if(process.caseControls?.requirements.some(item=>!item.evidence.trim())) throw new Error('Hay requisitos sin acreditar. Regularízalos antes de la revisión final.');
}

export function validateCaseClosure(process:LegalProcess,tasks:WorkflowTask[],document:ClientDocument|undefined,summary:string,actor:TaskActor) {
 if(!actor.admin || process.caseStage!=='final_review') throw new Error('El cierre requiere revisión final y autorización del despacho.');
 validateFinalReview({...process,caseStage:'in_progress'},tasks,actor);
 if(!summary.trim() || summary.length>4000) throw new Error('Registra el resultado de la revisión final (hasta 4000 caracteres).');
 if(!process.userId || !document || document.caseId!==process.id || document.clientId!==process.userId || document.kind!=='final_deliverable' || document.status!=='delivered' || !document.visibleToClient || !document.publishedAt || !document.publishedByUid || !document.storagePath.startsWith('client-documents/'+process.id+'/')) throw new Error('Selecciona una entrega final publicada para la cuenta vinculada del cliente, con archivo real. Los documentos de muestra no acreditan entrega.');
}
