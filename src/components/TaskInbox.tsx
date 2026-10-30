import {WorkNotifications} from './WorkNotifications';
import { ViewModeSwitch, useViewMode } from './ViewModeSwitch';
import {useEffect,useMemo,useState} from 'react';
import {useAuth} from '../context/AuthContext';
import {operationsService} from '../services/operationsService';
import {TASK_LABELS,type TaskActor} from '../domain/operations';
import type {WorkflowTask,LegalProcess} from '../types';
import {formatCrmDate} from '../lib/dates';
export type TaskInboxFilter = 'mine' | 'review' | 'overdue' | 'all';
export function TaskInbox({processes,onOpen,filter:controlledFilter,onFilterChange}:{processes:LegalProcess[];onOpen:(process:LegalProcess)=>void;filter?:TaskInboxFilter;onFilterChange?:(filter:TaskInboxFilter)=>void}) {
 const {currentUser,userProfile,isAdmin}=useAuth();
 const preview=window.location.pathname.replace(/\/$/,'')==='/crm-preview';
 const actor=useMemo<TaskActor>(()=>({uid:currentUser?.uid||'demo-admin-uid-01',name:userProfile?.displayName||'José Rafael Vásquez',admin:preview||isAdmin}),[currentUser?.uid,userProfile?.displayName,preview,isAdmin]);
 const [viewMode,setViewMode]=useViewMode('tasks');
 const [tasks,setTasks]=useState<WorkflowTask[]>([]);const [error,setError]=useState('');const [localFilter,setLocalFilter]=useState<TaskInboxFilter>('mine');
 const filter=controlledFilter??localFilter;
 const setFilter=(value:TaskInboxFilter)=>{setLocalFilter(value);onFilterChange?.(value);};
 useEffect(()=>operationsService.subscribeTasks(null,actor,preview,setTasks,err=>setError(err.message)),[actor,preview]);
 const visible=tasks.filter(task=>processes.some(process=>process.id===task.caseId)).filter(task=>{
   if(filter==='review')return task.status==='pending_approval'&&task.reviewerUid===actor.uid;
   if(filter==='overdue')return task.status!=='completed'&&task.status!=='cancelled'&&task.dueAt&&task.dueAt.slice(0,10)<new Date().toLocaleDateString('en-CA',{timeZone:'America/Caracas'});
   if(filter==='all')return true;
   return task.assignedToUid===actor.uid&&task.status!=='completed'&&task.status!=='cancelled';
 });
  const today = new Date().toLocaleDateString('en-CA',{timeZone:'America/Caracas'});
  const available = tasks.filter(task=>processes.some(process=>process.id===task.caseId));
  const open = (task:WorkflowTask)=>task.status!=='completed'&&task.status!=='cancelled';
  const overdue = (task:WorkflowTask)=>open(task)&&!!task.dueAt&&task.dueAt.slice(0,10)<today;
  const filters = [
    {id:'mine' as const,label:'Mis tareas',description:'Trabajo pendiente a mi cargo',count:available.filter(task=>open(task)&&task.assignedToUid===actor.uid).length},
    {id:'review' as const,label:'Por revisar',description:'Esperan mi aprobación',count:available.filter(task=>task.status==='pending_approval'&&task.reviewerUid===actor.uid).length},
    {id:'overdue' as const,label:'Vencidas',description:'Requieren atención',count:available.filter(overdue).length},
    {id:'all' as const,label:'Todas las tareas',description:'Trabajo de los trámites visibles',count:available.length}
  ];
  return <section className="space-y-5">
    <p className="text-xs text-slate-500">Las tareas pertenecen a trámites en ejecución. Cambiar el filtro no completa ninguna tarea.</p>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{filters.map(item=><button key={item.id} type="button" onClick={()=>setFilter(item.id)} aria-pressed={filter===item.id} className={'rounded-xl border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 '+(filter===item.id?'border-blue-500 bg-blue-50 ring-2 ring-blue-200':'border-slate-200 bg-white hover:border-blue-300')}><div className="text-xs font-semibold tracking-wide text-slate-700">{item.label}</div><div className="mt-1 text-2xl font-extrabold tabular-nums text-blue-800">{item.count}</div><div className="mt-1 text-xs text-slate-500">{item.description}</div></button>)}</div>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 p-4"><div><h2 className="text-sm font-bold text-slate-900">{filters.find(item=>item.id===filter)?.label}</h2><p className="mt-1 text-xs text-slate-500">Abre un trámite para trabajar o revisar su tarea.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{visible.length} {visible.length===1?'tarea':'tareas'}</span><ViewModeSwitch mode={viewMode} onChange={setViewMode}/></div>
      {error&&<p role="alert" className="border-b border-red-100 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      <div className={viewMode==='cards'?'grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3':'hidden'}>{visible.map(task=>{const process=processes.find(item=>item.id===task.caseId)!;return <article key={task.id} className="min-w-0 rounded-xl border border-slate-200 p-4 shadow-sm"><p className="break-words text-xs font-semibold text-blue-800">{process.companyName||process.clientName} · {process.title}</p><h3 className="mt-2 break-words font-bold text-slate-900">{task.title}</h3><p className="mt-2 text-xs text-slate-600">{TASK_LABELS[task.status]} · {task.dueAt?formatCrmDate(task.dueAt):'Sin fecha'}</p><p className="mt-1 text-xs text-slate-600">Responsable: {task.assignedToName}</p>{task.reviewNote&&<p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">{task.reviewNote}</p>}<button type="button" onClick={()=>onOpen(process)} className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-900 hover:bg-blue-100">Abrir trámite</button></article>;})}</div>
      <div className={viewMode==='list'?'overflow-x-auto':'hidden'}><table className="w-full min-w-[840px] table-fixed border-collapse text-left text-xs"><thead><tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-500"><th className="w-[30%] px-4 py-3">Tarea y trámite</th><th className="w-[17%] px-4 py-3">Estado</th><th className="w-[19%] px-4 py-3">Responsable</th><th className="w-[17%] px-4 py-3">Vencimiento</th><th className="w-[17%] px-4 py-3 text-right">Acción</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map(task=>{const process=processes.find(item=>item.id===task.caseId)!;return <tr key={task.id} className="transition-colors hover:bg-blue-50/70"><td className="px-4 py-3"><button type="button" onClick={()=>onOpen(process)} className="break-words text-left font-bold text-blue-800 hover:text-blue-950">{task.title}</button><p className="mt-1 break-words text-[11px] text-slate-500">{process.companyName||process.clientName} · {process.title}</p></td><td className="px-4 py-3"><span className="rounded-full bg-blue-50 px-2 py-1 font-semibold text-blue-900">{TASK_LABELS[task.status]}</span>{task.reviewNote&&<p className="mt-2 text-[11px] text-amber-800">{task.reviewNote}</p>}</td><td className="break-words px-4 py-3 text-slate-700">{task.assignedToName}</td><td className="px-4 py-3 text-slate-700">{task.dueAt?formatCrmDate(task.dueAt):'Sin fecha'}</td><td className="px-4 py-3 text-right"><button type="button" onClick={()=>onOpen(process)} className="rounded-lg border border-blue-200 bg-white px-3 py-2 font-semibold text-blue-800 hover:bg-blue-50 hover:shadow-sm">Abrir trámite</button></td></tr>;})}</tbody></table></div>
      {!visible.length&&<p className="border-t border-slate-100 p-8 text-center text-sm text-slate-500">No hay tareas en esta vista.</p>}
    </div>
    <WorkNotifications actor={actor} preview={preview} processes={processes} onOpen={onOpen}/>
  </section>;
}
