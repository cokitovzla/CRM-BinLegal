import {CaseControlsPanel} from './CaseControlsPanel';
import {CaseMessages} from './CaseMessages';
import {useEffect,useMemo,useState} from 'react';
import {useAuth} from '../context/AuthContext';
import {CaseDocumentLibrary} from './CaseDocumentLibrary';
import {operationsService} from '../services/operationsService';
import {TASK_LABELS,CASE_LABELS,taskNeedsReview,type TaskActor,type WorkMember} from '../domain/operations';
import type {LegalProcess,WorkflowTask,WorkflowTaskStatus,CaseActivity} from '../types';
import {formatCrmDate} from '../lib/dates';

interface Props {onReviewOrClose:(process:LegalProcess,closing:boolean,summary:string,documentId:string)=>Promise<void>;onSaveCaseControls:(process:LegalProcess)=>Promise<void>;onStartCase:(process:LegalProcess)=>Promise<void>;process:LegalProcess;lawyers:string[];onBack:()=>void;onBackLabel?:string}
const stages:WorkflowTaskStatus[]=['assigned','in_progress','pending_approval','changes_requested','completed'];
const field='mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm font-normal';
export function WorkflowBoard({onReviewOrClose,onSaveCaseControls,onStartCase,process,lawyers,onBack,onBackLabel='Volver a asuntos'}:Props) {
 const {currentUser,userProfile,isAdmin}=useAuth();
 const preview=window.location.pathname.replace(/\/$/,'')==='/crm-preview';
 const actor=useMemo<TaskActor>(()=>({uid:currentUser?.uid||'demo-admin-uid-01',name:userProfile?.displayName||'José Rafael Vásquez',admin:preview||isAdmin}),[currentUser?.uid,userProfile?.displayName,preview,isAdmin]);
 const [tasks,setTasks]=useState<WorkflowTask[]>([]);
 const [events,setEvents]=useState<CaseActivity[]>([]);
 const [members,setMembers]=useState<WorkMember[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [busy,setBusy]=useState(false);
 const [creating,setCreating]=useState(false);
 const [editing,setEditing]=useState<WorkflowTask|null>(null);
 const [starting,setStarting]=useState(false);
 const [requirements,setRequirements]=useState('');
 const [startEvidence,setStartEvidence]=useState('');
 const [exceptionReason,setExceptionReason]=useState('');
 const [library,setLibrary]=useState(false);
 const [closing,setClosing]=useState(false);
 const [closureSummary,setClosureSummary]=useState('');
 const [deliveryId,setDeliveryId]=useState('');
 const [deliveries,setDeliveries]=useState<Array<{id:string;name:string}>>([]);
 const [view,setView]=useState<'list'|'board'>('list');
 const [title,setTitle]=useState('');
 const [description,setDescription]=useState('');
 const [expectedResult,setExpectedResult]=useState('');
 const [assignee,setAssignee]=useState(actor.uid);
 const [reviewer,setReviewer]=useState(actor.uid);
 const [requiresReview,setRequiresReview]=useState(true);
 const [due,setDue]=useState('');
 const [note,setNote]=useState('');
 const [pending,setPending]=useState<{task:WorkflowTask;next:WorkflowTaskStatus}|null>(null);
 useEffect(()=>{
   setLoading(true);setError('');
   return operationsService.subscribeTasks(process.id,actor,preview,items=>{setTasks(items);setLoading(false);},err=>{setError(err.message);setLoading(false);});
 },[process.id,actor,preview]);
 useEffect(()=>{
   const self={uid:actor.uid,name:actor.name,role:'admin'};
   if(preview) {setMembers([self,...lawyers.filter(name=>name!==actor.name).map((name,i)=>({uid:'demo-member-'+i,name,role:'lawyer'}))]);return;}
   setMembers([self]);
   if(!actor.admin) return;
   return operationsService.subscribeMembers(items=>setMembers([self,...items.filter(item=>item.uid!==actor.uid)]),()=>setError('No pudimos cargar el equipo. Solo puedes asignarte trabajo a ti mientras recuperamos la conexión.'));
 },[actor,preview,lawyers]);
 useEffect(()=>operationsService.subscribeActivity(process.id,preview,setEvents,err=>setError(err.message)),[process.id,preview]);
 useEffect(()=>{
   if(preview){setDeliveries([]);return;}
   return operationsService.subscribeDeliveries(process.id,setDeliveries,err=>setError(err.message));
 },[process.id,preview]);
 const run=async(action:()=>Promise<unknown>,success:string)=>{
   if(busy)return;setBusy(true);setError('');setNotice('');
   try {await action();setNotice(success);}catch(err){setError(err instanceof Error?err.message:'No se pudo guardar.');}finally{setBusy(false);}
 };
 const move=(task:WorkflowTask,next:WorkflowTaskStatus)=>{
   if(next==='changes_requested'||task.status==='completed'||next==='cancelled') {setPending({task,next});setNote('');return;}
   void run(()=>operationsService.moveTask(task,next,actor,'',preview,process),'Tarea actualizada.');
 };
 const create=()=>run(async()=>{
   const responsible=members.find(item=>item.uid===assignee);
   const review=members.find(item=>item.uid===reviewer);
   const now=new Date().toISOString();
   const draft:WorkflowTask={
     id:crypto.randomUUID(),caseId:process.id,clientId:process.userId,title:title.trim(),description:description.trim(),
     expectedResult:expectedResult.trim(),status:'assigned',priority:'normal',assignedToUid:responsible?.uid||null,
     assignedToName:responsible?.name||null,assignedByUid:actor.uid,assignedByName:actor.name,createdByUid:actor.uid,
     reviewerUid:requiresReview?review?.uid||null:null,reviewerName:requiresReview?review?.name||null:null,
     requiresReview,requiresJoseApproval:requiresReview,reassignmentStatus:'not_required',visibility:'internal',
     dueAt:due?new Date(due+'T12:00:00-04:00').toISOString():null,completedAt:null,createdAt:now,updatedAt:now,revision:0,
   };
   const task=editing?{...editing,title:draft.title,description:draft.description,expectedResult:draft.expectedResult,assignedToUid:draft.assignedToUid,assignedToName:draft.assignedToName,reviewerUid:draft.reviewerUid,reviewerName:draft.reviewerName,requiresReview:draft.requiresReview,requiresJoseApproval:draft.requiresJoseApproval,dueAt:draft.dueAt,updatedAt:now}:draft;
   await operationsService.saveTask(task,actor,preview);
   setEditing(null);
   setCreating(false);setTitle('');setDescription('');setExpectedResult('');setDue('');
 },'Tarea creada y asignada.');
 const card=(task:WorkflowTask)=><article key={task.id} className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm" aria-label={task.title}>
   <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-bold text-slate-950 break-words">{task.title}</h3><span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-900">{TASK_LABELS[task.status]}</span></div>
   <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{task.description}</p>
   <p className="mt-3 text-sm"><strong>Resultado esperado:</strong> {task.expectedResult||'Pendiente de definir en esta tarea anterior'}</p>
   <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
     <p>Responsable: <strong>{task.assignedToName||'Sin asignar'}</strong></p>
     <p>Revisor: <strong>{taskNeedsReview(task)?task.reviewerName||'Pendiente de configurar':'No requiere revisión'}</strong></p>
     <p>Vencimiento: {task.dueAt?formatCrmDate(task.dueAt):'Sin fecha'}</p>
   </div>
   {task.reviewNote&&<p className="mt-3 whitespace-pre-wrap rounded-lg bg-amber-50 p-3 text-sm text-amber-950"><strong>Observaciones:</strong> {task.reviewNote}</p>}
   <div className="mt-4 flex flex-wrap gap-2">
     {actor.admin&&!['completed','cancelled'].includes(task.status)&&<button disabled={busy} onClick={()=>{setEditing(task);setTitle(task.title);setDescription(task.description);setExpectedResult(task.expectedResult||'');setAssignee(task.assignedToUid||actor.uid);setReviewer(task.reviewerUid||actor.uid);setRequiresReview(taskNeedsReview(task));setDue(task.dueAt?task.dueAt.slice(0,10):'');setCreating(true);}} className="rounded-lg border px-3 py-2 text-sm">Editar / reasignar</button>}
     {(actor.admin||actor.uid===task.assignedToUid)&&['assigned','in_progress','changes_requested'].includes(task.status)&&<button disabled={busy} onClick={()=>move(task,'cancelled')} className="rounded-lg border px-3 py-2 text-sm text-red-800">Cancelar con motivo</button>}
     {(actor.admin||actor.uid===task.assignedToUid)&&task.status==='assigned'&&<button disabled={busy||process.caseStage==='not_started'} title={process.caseStage==='not_started'?'Autoriza el inicio del trámite para ejecutar tareas':undefined} onClick={()=>move(task,'in_progress')} className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">Iniciar tarea</button>}
     {(actor.admin||actor.uid===task.assignedToUid)&&task.status==='in_progress'&&<button disabled={busy} onClick={()=>move(task,taskNeedsReview(task)?'pending_approval':'completed')} className="rounded-lg bg-[#0071ce] px-3 py-2 text-sm text-white">{taskNeedsReview(task)?'Enviar a revisión':'Completar tarea'}</button>}
     {(actor.admin||actor.uid===task.reviewerUid)&&task.status==='pending_approval'&&<>
       <button disabled={busy} onClick={()=>move(task,'completed')} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm text-white">Aprobar y completar</button>
       <button disabled={busy} onClick={()=>move(task,'changes_requested')} className="rounded-lg border border-amber-300 px-3 py-2 text-sm">Solicitar correcciones</button>
     </>}
     {(actor.admin||actor.uid===task.assignedToUid)&&task.status==='changes_requested'&&<button disabled={busy} onClick={()=>move(task,'in_progress')} className="rounded-lg border px-3 py-2 text-sm">Trabajar en correcciones</button>}
     {(actor.admin||actor.uid===task.assignedToUid)&&task.status==='completed'&&<button disabled={busy} onClick={()=>move(task,'in_progress')} className="rounded-lg border px-3 py-2 text-sm">Reabrir con motivo</button>}
   </div>
 </article>;
 return <section className="min-w-0 space-y-5">
   <header className="rounded-xl border border-slate-200 bg-white p-5">
     <button className="text-sm font-semibold text-blue-800" onClick={onBack}>← {onBackLabel}</button>
     <p className="mt-4 text-xs uppercase tracking-wide text-slate-500">Asunto · {process.companyName||process.clientName}</p>
     <h1 className="mt-1 text-xl font-bold text-slate-950">{process.title}</h1>
     <p className="mt-2 text-sm text-slate-600">Estado del asunto: <strong>{process.caseStage?CASE_LABELS[process.caseStage]:process.status==='completado'?'Finalizado':'En ejecución'}</strong> · Responsable: {process.assignedLawyer}</p>
     <p className="mt-2 text-xs text-slate-500">Completar una tarea no cierra el asunto. Cada servicio conserva su ejecución y entrega.</p>
     <div className="mt-4 flex flex-wrap gap-2">{actor.admin&&<button onClick={()=>{setEditing(null);setTitle('');setDescription('');setExpectedResult('');setDue('');setAssignee(actor.uid);setReviewer(actor.uid);setRequiresReview(true);setCreating(true);}} className="rounded-lg bg-[#0071ce] px-4 py-2 text-sm font-semibold text-white">Nueva tarea</button>}
     {actor.admin&&process.caseStage==='not_started'&&<button disabled={busy} onClick={()=>setStarting(true)} className="rounded-lg border px-4 py-2 text-sm">Iniciar asunto</button>}<button onClick={()=>setLibrary(true)} className="rounded-lg border px-4 py-2 text-sm">Documentos del asunto</button></div>
   </header>
   {process.caseControls?.hold.state==='suspended'&&<p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950">Asunto suspendido: las tareas conservan su estado y no admiten avances hasta levantar la suspensión. Puedes registrar una cancelación con motivo.</p>}
   {process.caseStage==='not_started'&&<p role="status" className="rounded-lg bg-blue-50 p-3 text-sm text-blue-950">Puedes planificar y asignar tareas. Para empezar a ejecutarlas, registra las condiciones y autoriza el inicio del trámite.</p>}
   {error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
   {notice&&<p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}

   {actor.admin&&process.caseStage==='in_progress'&&<button disabled={busy||loading} className="rounded-lg border bg-white px-4 py-2 text-sm" onClick={()=>void run(()=>onReviewOrClose(process,false,'',''),'Asunto enviado a revisión final.')}>Pasar a revisión final</button>}
   {actor.admin&&process.caseStage==='final_review'&&<section className="rounded-xl border bg-white p-5"><h2 className="font-bold">Revisión final y entrega</h2><p className="mt-2 text-sm">El cierre comprueba tareas, requisitos y una entrega final publicada con archivo real para la cuenta vinculada del cliente.</p>{!closing?<button className="mt-3 rounded-lg border px-4 py-2 text-sm" onClick={()=>setClosing(true)}>Preparar cierre del asunto</button>:<form className="mt-4 space-y-3" onSubmit={e=>{e.preventDefault();void run(()=>onReviewOrClose(process,true,closureSummary,deliveryId),'Asunto finalizado con entrega comprobada.');}}><label className="block text-sm">Resultado de la revisión final<textarea required maxLength={4000} className={field} value={closureSummary} onChange={e=>setClosureSummary(e.target.value)}/></label><label className="block text-sm">Entrega final publicada<select required className={field} value={deliveryId} onChange={e=>setDeliveryId(e.target.value)}><option value="">Selecciona la entrega</option>{deliveries.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>{!deliveries.length&&<p className="text-sm text-amber-900">No hay entregas reales publicadas disponibles. Los archivos de muestra no permiten finalizar.</p>}<button disabled={busy||!deliveries.length} className="rounded-lg bg-blue-800 px-4 py-2 text-sm text-white">Comprobar entrega y finalizar</button></form>}</section>}
   {process.closure&&<section className="rounded-xl border bg-white p-5"><h2 className="font-bold">Cierre documentado</h2><p className="mt-2 whitespace-pre-wrap text-sm">{process.closure.summary}</p><p className="mt-2 text-xs text-slate-500">Entrega: {process.closure.documentId} · {formatCrmDate(process.closure.recordedAt)}</p></section>}
   <CaseControlsPanel key={process.id} process={process} canEdit={actor.admin} onSave={onSaveCaseControls}/>
   <CaseMessages process={process} staffMode/>
   {starting&&<form className="rounded-xl border bg-white p-5" onSubmit={e=>{e.preventDefault();void run(async()=>{await onStartCase({...process,startAuthorization:{requirements,evidence:startEvidence,exceptionReason}});setStarting(false);},'Inicio autorizado y registrado.');}}>
     <h2 className="font-bold">Autorizar inicio del asunto</h2>
     <p className="mt-2 text-sm text-slate-600">Define los recaudos mínimos, anticipo o autorización aplicables a este servicio. Registra dónde se comprobó su cumplimiento. Si hay pendientes y decides iniciar, explica la excepción; quedará en el historial.</p>
     <fieldset disabled={busy} className="mt-4 grid gap-4">
       <label className="text-sm">Condiciones de inicio<textarea required maxLength={4000} value={requirements} onChange={e=>setRequirements(e.target.value)} className={field}/></label>
       <label className="text-sm">Evidencia de cumplimiento<textarea maxLength={4000} value={startEvidence} onChange={e=>setStartEvidence(e.target.value)} className={field}/></label>
       <label className="text-sm">Motivo de excepción autorizada, si aplica<textarea maxLength={4000} value={exceptionReason} onChange={e=>setExceptionReason(e.target.value)} className={field}/></label>
       <div className="flex flex-wrap gap-2"><button disabled={busy} className="rounded-lg bg-blue-800 px-4 py-2 text-white">Autorizar e iniciar</button><button type="button" onClick={()=>setStarting(false)} className="rounded-lg border px-4 py-2">Cancelar</button></div>
     </fieldset>
   </form>}
   {process.startAuthorization&&<details className="rounded-xl border bg-white p-4"><summary className="cursor-pointer font-semibold">Condiciones y autorización de inicio</summary><p className="mt-3 whitespace-pre-wrap text-sm">{process.startAuthorization.requirements}</p><p className="mt-2 whitespace-pre-wrap text-sm">Evidencia: {process.startAuthorization.evidence||'Sin cumplimiento acreditado'}</p>{process.startAuthorization.exceptionReason&&<p className="mt-2 whitespace-pre-wrap text-sm text-amber-900">Excepción autorizada: {process.startAuthorization.exceptionReason}</p>}</details>}
   {creating&&<form onSubmit={e=>{e.preventDefault();void create();}} className="rounded-xl border bg-white p-5">
     <h2 className="font-bold">{editing?'Editar y reasignar tarea':'Crear tarea del asunto'}</h2>
     <fieldset disabled={busy} className="mt-4 grid gap-4 sm:grid-cols-2">
       <label className="text-sm font-medium">Título de la tarea<input required maxLength={200} value={title} onChange={e=>setTitle(e.target.value)} className={field}/></label>
       <label className="text-sm font-medium">Responsable de la tarea<select value={assignee} onChange={e=>setAssignee(e.target.value)} className={field}>{members.map(item=><option key={item.uid} value={item.uid}>{item.name}</option>)}</select></label>
       <label className="text-sm font-medium sm:col-span-2">Resultado esperado<textarea required maxLength={4000} value={expectedResult} onChange={e=>setExpectedResult(e.target.value)} className={field}/></label>
       <label className="text-sm font-medium sm:col-span-2">Instrucciones<textarea maxLength={8000} value={description} onChange={e=>setDescription(e.target.value)} className={field}/></label>
       <label className="text-sm font-medium">Fecha límite<input required type="date" value={due} onChange={e=>setDue(e.target.value)} className={field}/></label>
       <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={requiresReview} onChange={e=>setRequiresReview(e.target.checked)}/> Requiere revisión</label>
       {requiresReview&&<label className="text-sm font-medium">Revisor de la tarea<select required value={reviewer} onChange={e=>setReviewer(e.target.value)} className={field}>{members.map(item=><option key={item.uid} value={item.uid}>{item.name}</option>)}</select></label>}
       <p className="text-xs text-slate-500 sm:col-span-2">Responsable y revisor tendrán acceso a este asunto. La asignación no les concede acceso a otros asuntos.</p>
       <div className="flex flex-wrap gap-2 sm:col-span-2"><button className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white" disabled={busy}>{busy?'Guardando…':'Crear y asignar tarea'}</button><button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={()=>setCreating(false)}>Cancelar</button></div>
     </fieldset>
   </form>}
   <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold">Tareas del asunto ({tasks.length})</h2><div className="flex gap-2"><button aria-pressed={view==='list'} className="rounded-lg border bg-white px-3 py-2 text-sm" onClick={()=>setView('list')}>Lista</button><button aria-pressed={view==='board'} className="rounded-lg border bg-white px-3 py-2 text-sm" onClick={()=>setView('board')}>Tablero</button></div></div>
   {loading?<p role="status">Cargando tareas…</p>:!tasks.length?<p className="rounded-xl border border-dashed bg-white p-8 text-center text-slate-500">Este asunto todavía no tiene tareas. Crea la primera con su resultado esperado y responsable.</p>:view==='list'?<div className="grid gap-4 lg:grid-cols-2">{tasks.map(card)}</div>:<div className="flex gap-3 overflow-x-auto pb-4">{stages.map(stage=><section key={stage} className="w-80 shrink-0 rounded-xl bg-slate-100 p-3"><h2 className="mb-3 text-sm font-bold">{TASK_LABELS[stage]} ({tasks.filter(item=>item.status===stage).length})</h2><div className="space-y-3">{tasks.filter(item=>item.status===stage).map(card)}</div></section>)}</div>}
   <details className="rounded-xl border bg-white p-4"><summary className="cursor-pointer font-semibold">Historial del asunto ({events.length})</summary><ul className="mt-4 space-y-3 text-sm">{events.map(item=><li key={item.id}><p>{item.summary.replace(/\b(in_progress|pending_approval|changes_requested|completed|assigned|cancelled|unassigned)\b/g,value=>TASK_LABELS[value as WorkflowTaskStatus])}</p><p className="text-xs text-slate-500">{item.actorName} · {formatCrmDate(item.createdAt)}</p></li>)}</ul></details>
   {pending&&<div role="dialog" aria-modal="true" aria-labelledby="movement-title" className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-4"><form className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4 sm:p-6" onSubmit={e=>{e.preventDefault();void run(async()=>{await operationsService.moveTask(pending.task,pending.next,actor,note,preview,process);setPending(null);},'Movimiento registrado.');}}><h2 id="movement-title" className="text-lg font-bold">{pending.next==='changes_requested'?'Solicitar correcciones':'Registrar motivo'}</h2><label className="mt-4 block text-sm">Observaciones<textarea required autoFocus value={note} onChange={e=>setNote(e.target.value)} className={field} rows={4}/></label><p className="mt-2 text-xs text-slate-500">Las observaciones se conservarán en el historial y estarán disponibles para el responsable.</p><div className="mt-4 flex flex-wrap gap-2"><button disabled={busy||!note.trim()} className="rounded-lg bg-[#0071ce] px-4 py-2 text-white">Confirmar movimiento</button><button type="button" className="rounded-lg border px-4 py-2" onClick={()=>setPending(null)}>Cancelar</button></div>{error&&<p role="alert" className="mt-3 text-red-700">{error}</p>}</form></div>}
   {library&&<div role="dialog" aria-modal="true" aria-label="Documentos del asunto" className="fixed inset-0 z-50 overflow-auto bg-slate-100 p-4"><button onClick={()=>setLibrary(false)} className="mb-4 rounded-lg border bg-white px-4 py-2">Volver a tareas</button><CaseDocumentLibrary process={process} staffMode/></div>}
 </section>;
}
