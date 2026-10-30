import {getStorage,getMetadata,ref} from 'firebase/storage';
import { collection, doc, onSnapshot, query, where, runTransaction, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { Lead, LegalProcess, WorkflowTask, WorkflowTaskStatus, CaseActivity, ClientDocument, WorkNotification } from '../types';
import { acceptServices, validateCaseStart, validateCaseControls, validateTaskExecution, validateFinalReview, validateCaseClosure, transitionTask, validateTask, TASK_LABELS, type WorkMember, type TaskActor } from '../domain/operations';
import { clientRecords } from './leadModel';

const EVENT='binlegal-work-changed';
const key=(id:string)=>'binlegal_preview_tasks_'+id;
function latestPreviewProcess(process:LegalProcess) {
 const saved=(JSON.parse(localStorage.getItem('binlegal_crm_preview_processes_v1')||'[]') as LegalProcess[]).find(item=>item.id===process.id);
 const controls=JSON.parse(localStorage.getItem('binlegal_preview_controls_'+process.id)||'null');
 const current=saved||process;
 return controls && controls.controlsRevision>(current.controlsRevision||0)?{...current,...controls}:current;
}
export function previewTasks(caseId?: string): WorkflowTask[] {
  if (caseId) return JSON.parse(localStorage.getItem(key(caseId)) || '[]');
  return Object.keys(localStorage).filter(value=>value.startsWith('binlegal_preview_tasks_')).flatMap(value=>{
    try {return JSON.parse(localStorage.getItem(value)||'[]');} catch {return [];}
  });
}
function publishPreview(tasks: WorkflowTask[], caseId:string, activity?: CaseActivity) {
  localStorage.setItem(key(caseId),JSON.stringify(tasks));
  if(activity?.taskId) {
    const task=tasks.find(item=>item.id===activity.taskId);
    const recipient=task?.status==='pending_approval'?task.reviewerUid:task?.assignedToUid;
    if(recipient && recipient!==activity.actorUid) {
      const notices=JSON.parse(localStorage.getItem('binlegal_preview_notifications_v1')||'[]');
      localStorage.setItem('binlegal_preview_notifications_v1',JSON.stringify([{id:activity.id,caseId,taskId:activity.taskId,recipientUid:recipient,actorUid:activity.actorUid,summary:activity.summary,createdAt:activity.createdAt},...notices]));
    }
  }
  if(activity) {
    const activityKey='binlegal_preview_activity_'+caseId;
    localStorage.setItem(activityKey,JSON.stringify([activity,...JSON.parse(localStorage.getItem(activityKey)||'[]')]));
  }
  window.dispatchEvent(new Event(EVENT));
}
function requireActor(actor:TaskActor) {
  if(!auth.currentUser || auth.currentUser.uid!==actor.uid) throw new Error('Inicia sesión con una cuenta autorizada.');
}
function activity(task:WorkflowTask,actor:TaskActor,action:string):CaseActivity {
  return {id:crypto.randomUUID(),caseId:task.caseId,taskId:task.id,actorUid:actor.uid,actorName:actor.name,action,
    summary:action==='created'?'Tarea creada: '+task.title:action==='updated'?'Tarea actualizada: '+task.title+' · Responsable: '+task.assignedToName+' · Revisor: '+(task.reviewerName||'Sin revisión'):task.title+' → '+TASK_LABELS[task.status]+(task.reviewNote?' · '+task.reviewNote:''),
    visibility:'internal',createdAt:new Date().toISOString()};
}
function addEvent(transaction: Parameters<Parameters<typeof runTransaction>[1]>[0],task:WorkflowTask,actor:TaskActor,action:string) {
  const event=activity(task,actor,action);
  transaction.set(doc(db,'caseActivity',event.id),event);
  const recipient=task.status==='pending_approval'?task.reviewerUid:task.assignedToUid;
  if(recipient && recipient!==actor.uid) transaction.set(doc(db,'workNotifications',event.id),{
    id:event.id,caseId:task.caseId,taskId:task.id,recipientUid:recipient,actorUid:actor.uid,
    summary:event.summary,createdAt:event.createdAt,
  });
}
export const operationsService={
  subscribeNotifications(uid:string,preview:boolean,update:(items:WorkNotification[])=>void,error:(error:Error)=>void) {
    if(preview) {
      const refresh=()=>{try{update((JSON.parse(localStorage.getItem('binlegal_preview_notifications_v1')||'[]') as WorkNotification[]).filter(item=>item.recipientUid===uid));}catch{error(new Error('No se pudieron leer los avisos locales.'));}};
      refresh();window.addEventListener(EVENT,refresh);return ()=>window.removeEventListener(EVENT,refresh);
    }
    return onSnapshot(query(collection(db,'workNotifications'),where('recipientUid','==',uid)),snapshot=>update(snapshot.docs.map(item=>({...item.data(),id:item.id}) as WorkNotification)),error);
  },
  async markNotificationRead(item:WorkNotification,actor:TaskActor,preview:boolean) {
    if(item.recipientUid!==actor.uid)throw new Error('Este aviso pertenece a otra persona.');
    if(item.readAt)return;
    const readAt=new Date().toISOString();
    if(preview){const items=JSON.parse(localStorage.getItem('binlegal_preview_notifications_v1')||'[]') as WorkNotification[];localStorage.setItem('binlegal_preview_notifications_v1',JSON.stringify(items.map(value=>value.id===item.id?{...value,readAt}:value)));window.dispatchEvent(new Event(EVENT));}
    else{requireActor(actor);await updateDoc(doc(db,'workNotifications',item.id),{readAt});}
  },
  subscribeDeliveries(caseId:string,update:(items:Array<{id:string;name:string}>)=>void,error:(error:Error)=>void) {
    return onSnapshot(query(collection(db,'clientDocuments'),where('caseId','==',caseId)),snapshot=>update(snapshot.docs.filter(item=>{const data=item.data();return data.kind==='final_deliverable'&&data.status==='delivered'&&data.visibleToClient===true&&data.storagePath?.startsWith('client-documents/'+caseId+'/');}).map(item=>({id:item.id,name:item.data().name}))),error);
  },
  subscribeCases(uid:string,update:(items:LegalProcess[])=>void,error:(error:Error)=>void,includePending=false) {
    const filters=[where('assignedLawyerIds','array-contains',uid),where('assignedLawyerId','==',uid),...(includePending?[where('assignmentStatus','==','pending')]:[])];
    const lists:LegalProcess[][]=filters.map(()=>[]);
    const stops=filters.map((filter,index)=>onSnapshot(query(collection(db,'processes'),filter),snapshot=>{
      lists[index]=snapshot.docs.map(item=>({...item.data(),id:item.id}) as LegalProcess);
      update([...new Map(lists.flat().map(item=>[item.id,item])).values()]);
    },error));
    return ()=>stops.forEach(stop=>stop());
  },
  async reviewOrClose(process:LegalProcess,actor:TaskActor,preview:boolean,closing=false,summary='',documentId='') {
    if(!actor.admin) throw new Error('Acción reservada al despacho autorizado.');
    let current=preview?latestPreviewProcess(process):process;
    if(!preview) {requireActor(actor);const snapshot=await getDoc(doc(db,'processes',process.id));if(!snapshot.exists())throw new Error('El asunto ya no existe.');current={...snapshot.data(),id:process.id} as LegalProcess;}
    const tasks=preview?previewTasks(process.id):(await getDocs(query(collection(db,'workflowTasks'),where('caseId','==',process.id)))).docs.map(item=>({...item.data(),id:item.id}) as WorkflowTask);
    let delivery:ClientDocument|undefined;let generation='';
    if(closing) {
      if(!preview && documentId) {const snapshot=await getDoc(doc(db,'clientDocuments',documentId));if(snapshot.exists())delivery={...snapshot.data(),id:snapshot.id} as ClientDocument;}
      validateCaseClosure(current,tasks,delivery,summary,actor);
      const metadata=await getMetadata(ref(getStorage(),delivery!.storagePath));
      if(!metadata.size || metadata.size!==delivery!.sizeBytes)throw new Error('El archivo de entrega no está disponible o cambió. Revisa la biblioteca antes de cerrar.');
      generation=metadata.generation;
    } else validateFinalReview(current,tasks,actor);
    const now=new Date().toISOString();
    const patch:Partial<LegalProcess>=closing?{caseStage:'completed',status:'completado',progress:100,closure:{summary:summary.trim(),documentId,storagePath:delivery!.storagePath,storageGeneration:generation,actorUid:actor.uid,recordedAt:now},updatedAt:now}:{caseStage:'final_review',status:'revision',updatedAt:now};
    const event:CaseActivity={id:crypto.randomUUID(),caseId:process.id,actorUid:actor.uid,actorName:actor.name,action:closing?'case_closed':'case_final_review',summary:closing?'Asunto finalizado. Revisión: '+summary.trim()+' · Entrega: '+delivery!.name:'Asunto enviado a revisión final; las tareas permanecen conservadas.',visibility:'internal',createdAt:now};
    if(preview) publishPreview(tasks,process.id,event);
    else await runTransaction(db,async tx=>{
      const target=doc(db,'processes',process.id);const fresh=await tx.get(target);
      if(!fresh.exists() || fresh.data().caseStage!==current.caseStage || (fresh.data().workRevision||0)!==(current.workRevision||0) || (fresh.data().controlsRevision||0)!==(current.controlsRevision||0))throw new Error('El trabajo cambió durante la comprobación. Revisa antes de continuar.');
      if(closing) {
        const check=await tx.get(doc(db,'clientDocuments',documentId));
        const freshDelivery=check.exists()?{...check.data(),id:check.id} as ClientDocument:undefined;
        validateCaseClosure(current,tasks,freshDelivery,summary,actor);
        if(freshDelivery!.storagePath!==delivery!.storagePath || freshDelivery!.sizeBytes!==delivery!.sizeBytes || freshDelivery!.publishedAt!==delivery!.publishedAt) throw new Error('La entrega cambió. Revisa la versión publicada.');
      }
      tx.update(target,patch);tx.set(doc(db,'caseActivity',event.id),event);
    });
    return patch;
  },
  async saveCaseControls(process:LegalProcess,actor:TaskActor,preview:boolean) {
    if(!actor.admin) throw new Error('Solo el despacho autorizado puede modificar las condiciones.');
    const caseControls=validateCaseControls(process.caseControls!);
    const revision=process.controlsRevision||0;
    const event:CaseActivity={id:crypto.randomUUID(),caseId:process.id,actorUid:actor.uid,actorName:actor.name,action:'case_controls_updated',summary:'Requisitos: '+(caseControls.requirements.map(item=>item.title+' · Responsable: '+item.responsible+' · '+(item.evidence?'Evidencia: '+item.evidence:'Pendiente de acreditar')).join('; ')||'Sin requisitos definidos')+' · Situación: '+({none:'Sin espera',waiting:'En espera',blocked:'Bloqueado',suspended:'Suspendido'}[caseControls.hold.state])+' · Motivo: '+caseControls.hold.reason+' · Depende de: '+caseControls.hold.dependsOn+' · Próxima acción: '+caseControls.hold.nextAction,visibility:'internal',createdAt:new Date().toISOString()};
    if(preview) {
      const k='binlegal_preview_controls_'+process.id;
      const old=JSON.parse(localStorage.getItem(k)||'null');
      if(old && old.controlsRevision!==revision) throw new Error('Las condiciones cambiaron. Reabre el asunto para revisar.');
      localStorage.setItem(k,JSON.stringify({caseControls,controlsRevision:revision+1}));
      publishPreview(previewTasks(process.id),process.id,event);
    } else {requireActor(actor); await runTransaction(db,async tx=>{
      const target=doc(db,'processes',process.id); const old=await tx.get(target);
      if(!old.exists() || (old.data().controlsRevision||0)!==revision) throw new Error('El asunto cambió. Revisa la versión actual.');
      tx.update(target,{caseControls,controlsRevision:revision+1,updatedAt:event.createdAt});
      tx.set(doc(db,'caseActivity',event.id),event);
    });}
    return {caseControls,controlsRevision:revision+1};
  },
  async startCase(process:LegalProcess,actor:TaskActor,preview:boolean) {
    const startAuthorization=validateCaseStart(preview?{...latestPreviewProcess(process),startAuthorization:process.startAuthorization}:process,actor);
    const event:CaseActivity={id:crypto.randomUUID(),caseId:process.id,actorUid:actor.uid,actorName:actor.name,action:'case_started',summary:'Asunto iniciado. Condiciones: '+startAuthorization.requirements+' · Evidencia: '+(startAuthorization.evidence||'Sin cumplimiento acreditado')+(startAuthorization.exceptionReason?' · Excepción autorizada: '+startAuthorization.exceptionReason:''),visibility:'internal',createdAt:new Date().toISOString()};
    if(preview) {
      const eventKey='binlegal_preview_activity_'+process.id;
      localStorage.setItem(eventKey,JSON.stringify([event,...JSON.parse(localStorage.getItem(eventKey)||'[]')]));
      window.dispatchEvent(new Event(EVENT));
    }
    if(!preview) {requireActor(actor);await runTransaction(db,async tx=>{
      const target=doc(db,'processes',process.id);const current=await tx.get(target);
      if(!current.exists())throw new Error('El asunto ya no existe.');
      validateCaseStart({...current.data(),id:process.id,startAuthorization:process.startAuthorization} as LegalProcess,actor);
      tx.update(target,{startAuthorization,caseStage:'in_progress',status:'redaccion',updatedAt:new Date().toISOString()});
      tx.set(doc(db,'caseActivity',event.id),event);
    });}
    return startAuthorization;
  },
  subscribeTasks(caseId:string|null, actor:TaskActor, preview:boolean, update:(items:WorkflowTask[])=>void, error:(error:Error)=>void) {
    if(preview) {
      const refresh=()=>{try {update(previewTasks(caseId||undefined));}catch {error(new Error('No se pudieron leer las tareas de muestra.'));}};
      refresh();window.addEventListener(EVENT,refresh);window.addEventListener('storage',refresh);
      return ()=>{window.removeEventListener(EVENT,refresh);window.removeEventListener('storage',refresh);};
    }
    const base=collection(db,'workflowTasks');
    if(caseId || actor.admin) return onSnapshot(caseId?query(base,where('caseId','==',caseId)):base,
      snapshot=>update(snapshot.docs.map(item=>({...item.data(),id:item.id}) as WorkflowTask)),error);
    const lists:WorkflowTask[][]=[[],[]];
    const stops=['assignedToUid','reviewerUid'].map((field,i)=>onSnapshot(query(base,where(field,'==',actor.uid)),snapshot=>{
      lists[i]=snapshot.docs.map(item=>({...item.data(),id:item.id}) as WorkflowTask);
      update([...new Map(lists.flat().map(task=>[task.id,task])).values()]);
    },error));
    return ()=>stops.forEach(stop=>stop());
  },
  subscribeMembers(update:(items:WorkMember[])=>void,error:(error:Error)=>void) {
    return onSnapshot(collection(db,'users'),snapshot=>update(snapshot.docs.filter(item=>item.data().role!=='client')
      .map(item=>({uid:item.id,name:item.data().displayName||item.data().email,role:item.data().role}))),error);
  },
  subscribeActivity(caseId:string,preview:boolean,update:(items:CaseActivity[])=>void,error:(error:Error)=>void) {
    if(preview) {
      const refresh=()=>update(JSON.parse(localStorage.getItem('binlegal_preview_activity_'+caseId)||'[]'));
      refresh();window.addEventListener(EVENT,refresh);
      return ()=>window.removeEventListener(EVENT,refresh);
    }
    return onSnapshot(query(collection(db,'caseActivity'),where('caseId','==',caseId)),snapshot=>{
      update(snapshot.docs.map(item=>({...item.data(),id:item.id}) as CaseActivity).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));
    },error);
  },
  async saveTask(task:WorkflowTask,actor:TaskActor,preview:boolean) {
    if(!actor.admin)throw new Error('La edición y asignación corresponde al despacho autorizado.');
    validateTask(task);
    if(preview) {
      const tasks=previewTasks(task.caseId);
      const old=tasks.find(item=>item.id===task.id);
      if(old&&(old.status!==task.status||old.caseId!==task.caseId||old.createdByUid!==task.createdByUid))throw new Error('Utiliza los movimientos de la tarea para cambiar su estado.');
      if(old && (old.revision||0)!==(task.revision||0)) throw new Error('La tarea cambió. Recarga y revisa antes de guardar.');
      const saved={...task,revision:(old?.revision||0)+1};
      publishPreview([...tasks.filter(item=>item.id!==task.id),saved],task.caseId,activity(saved,actor,old?'updated':'created'));
      return;
    }
    requireActor(actor);
    await runTransaction(db,async tx=>{
      const target=doc(db,'workflowTasks',task.id);
      const processRef=doc(db,'processes',task.caseId);
      const [old,process]=await Promise.all([tx.get(target),tx.get(processRef)]);
      if(!process.exists()) throw new Error('El asunto ya no existe.');
      if(process.data().caseStage==='completed')throw new Error('No puedes añadir tareas a un asunto finalizado.');
      if(old.exists() && (old.data().revision||0)!==(task.revision||0)) throw new Error('La tarea cambió. Revisa la versión actual.');
      if(old.exists()&&(old.data().status!==task.status||old.data().caseId!==task.caseId||old.data().createdByUid!==task.createdByUid))throw new Error('Utiliza los movimientos de la tarea para cambiar su estado.');
      const uids=[...new Set([task.assignedToUid,task.reviewerUid].filter(Boolean))] as string[];
      for(const uid of uids) {
        const person=await tx.get(doc(db,'users',uid));
        if(uid!==actor.uid && (!person.exists() || person.data().role==='client')) throw new Error('Responsable y revisor deben ser integrantes del despacho.');
      }
      const saved={...task,revision:(old.data()?.revision||0)+1};
      tx.set(target,saved);
      tx.update(processRef,{workRevision:(process.data().workRevision||0)+1,assignedLawyerIds:[...new Set([...(process.data().assignedLawyerIds||[]),...uids])]});
      addEvent(tx,saved,actor,old.exists()?'updated':'created');
    });
  },
  async moveTask(task:WorkflowTask,next:WorkflowTaskStatus,actor:TaskActor,note:string,preview:boolean,process?:LegalProcess) {
    if(preview) {
      const tasks=previewTasks(task.caseId);
      const current=tasks.find(item=>item.id===task.id);
      if(!current || (current.revision||0)!==(task.revision||0)) throw new Error('La tarea cambió. Revisa la versión actual.');
      if(!process)throw new Error('Abre el asunto para verificar su situación actual.');
      validateTaskExecution(latestPreviewProcess(process),next);
      const updated=transitionTask(current,next,actor,note);
      publishPreview(tasks.map(item=>item.id===updated.id?updated:item),task.caseId,activity(updated,actor,'status_changed'));
      return;
    }
    requireActor(actor);
    await runTransaction(db,async tx=>{
      const target=doc(db,'workflowTasks',task.id);const snapshot=await tx.get(target);
      if(!snapshot.exists() || (snapshot.data().revision||0)!==(task.revision||0)) throw new Error('La tarea cambió. Revisa la versión actual.');
      const processRef=doc(db,'processes',snapshot.data().caseId);
      const parent=await tx.get(processRef);
      if(!parent.exists()) throw new Error('El asunto ya no existe.');
      validateTaskExecution(parent.data() as LegalProcess,next);
      const updated=transitionTask({...snapshot.data(),id:task.id} as WorkflowTask,next,actor,note);
      tx.update(processRef,{workRevision:(parent.data().workRevision||0)+1});
      tx.update(target,{status:updated.status,reviewNote:updated.reviewNote,updatedAt:updated.updatedAt,completedAt:updated.completedAt,revision:updated.revision});
      addEvent(tx,updated,actor,'status_changed');
    });
  },
  async accept(lead:Lead,selected:string[],evidence:string,actor:TaskActor,preview:boolean) {
    if(preview) return acceptServices(lead,selected,evidence,actor);
    requireActor(actor);
    return runTransaction(db,async tx=>{
      const leadRef=doc(db,'leads',lead.id);const snapshot=await tx.get(leadRef);
      if(!snapshot.exists()) throw new Error('La solicitud ya no existe.');
      const current={...snapshot.data(),id:lead.id} as Lead;
      if(JSON.stringify(lead.acceptedBudget?.budget||lead.budget)!==JSON.stringify(current.acceptedBudget?.budget||current.budget)) throw new Error('El presupuesto cambió. Revisa la versión actual antes de aceptar servicios.');
      const records=clientRecords(current);
      let accountUid='';
      if(current.personId) {const person=await tx.get(doc(db,'people',current.personId));accountUid=person.data()?.accountUid||'';}
      const result=acceptServices({...current,personId:records.person.id,companyId:records.company?.id||null},selected,evidence,actor);
      for(const process of result.processes) {
        const existing=await tx.get(doc(db,'processes',process.id));
        if(existing.exists()) throw new Error('Ya existe un asunto con ese identificador. Revisa su relación con la solicitud.');
      }
      for(const process of result.processes) tx.set(doc(db,'processes',process.id),JSON.parse(JSON.stringify({...process,userId:accountUid})));
      if(!current.personId) tx.set(doc(db,'people',records.person.id),records.person);
      if(!current.companyId && records.company) tx.set(doc(db,'companies',records.company.id),records.company);
      tx.update(leadRef,{status:'cliente_activo',acceptedBudget:result.acceptance,personId:records.person.id,companyId:records.company?.id||null,revision:(current.revision||0)+1});
      return result;
    });
  },
};
