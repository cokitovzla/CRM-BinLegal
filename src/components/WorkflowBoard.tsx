import React, { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Check, ChevronLeft, CircleAlert, LoaderCircle, MessageSquare, Plus, Send, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CaseDocumentLibrary } from './CaseDocumentLibrary';
import { workflowService } from '../services/workflowService';
import type { LegalProcess, WorkflowComment, WorkflowTask, WorkflowTaskPriority, WorkflowTaskStatus } from '../types';

const LANES: Array<{ id: WorkflowTaskStatus; label: string }> = [
  { id: 'unassigned', label: 'Sin asignar' },
  { id: 'assigned', label: 'Asignado' },
  { id: 'in_progress', label: 'En curso' },
  { id: 'pending_approval', label: 'En revisión' },
  { id: 'changes_requested', label: 'Correcciones' },
  { id: 'completed', label: 'Completado' },
];

const PRIORITIES: Array<{ value: WorkflowTaskPriority; label: string }> = [
  { value: 'low', label: 'Baja' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
];

interface WorkflowBoardProps {
  process: LegalProcess;
  lawyers: string[];
  onBack: () => void;
  onBackLabel?: string;
}

export const WorkflowBoard: React.FC<WorkflowBoardProps> = ({ process, lawyers, onBack, onBackLabel = 'Volver a expedientes' }) => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [comments, setComments] = useState<WorkflowComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newPriority, setNewPriority] = useState<WorkflowTaskPriority>('normal');
  const [newDueDate, setNewDueDate] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentVisibility, setCommentVisibility] = useState<'internal' | 'client'>('internal');
  const [reassignmentChoices, setReassignmentChoices] = useState<Record<string, string>>({});

  const demoMode = window.location.pathname.replace(/\/$/, '') === '/crm-preview';
  const demoTasksKey = `binlegal_preview_tasks_${process.id}`;
  const demoCommentsKey = `binlegal_preview_comments_${process.id}`;
  const actorUid = currentUser?.uid || userProfile?.userId || 'demo-admin-uid-01';
  const actorName = userProfile?.displayName || currentUser?.displayName || currentUser?.email || 'Equipo BinLegal';
  const isCaseLead = isAdmin || process.assignedLawyerId === actorUid || process.assignedLawyer === actorName;

  useEffect(() => {
    setLoading(true);
    if (demoMode) {
      try {
        const savedTasks = localStorage.getItem(demoTasksKey);
        const savedComments = localStorage.getItem(demoCommentsKey);
        const now = new Date().toISOString();
        const sampleTasks: WorkflowTask[] = [
          { id: 'demo-' + process.id + '-task-1', caseId: process.id, clientId: process.userId, title: 'Verificar recaudos y datos del cliente', description: 'Revisar que los datos de identidad y de la empresa coincidan con los documentos recibidos.', status: 'completed', priority: 'high', assignedToUid: 'demo-lawyer-01', assignedToName: process.assignedLawyer || 'José Rafael Vásquez', assignedByUid: 'demo-admin-uid-01', assignedByName: 'José Rafael Vásquez', createdByUid: 'demo-admin-uid-01', createdAt: now, updatedAt: now, completedAt: now, requiresJoseApproval: true, reassignmentStatus: 'not_required', visibility: 'internal' },
          { id: 'demo-' + process.id + '-task-2', caseId: process.id, clientId: process.userId, title: 'Preparar borrador del trámite', description: 'Preparar la primera versión y registrar cualquier dato pendiente para revisión interna.', status: 'in_progress', priority: 'high', assignedToUid: 'demo-lawyer-02', assignedToName: 'María Fernández', assignedByUid: 'demo-admin-uid-01', assignedByName: 'José Rafael Vásquez', createdByUid: 'demo-admin-uid-01', createdAt: now, updatedAt: now, dueAt: new Date(Date.now() + 3 * 86400000).toISOString(), requiresJoseApproval: true, reassignmentStatus: 'not_required', visibility: 'internal' },
          { id: 'demo-' + process.id + '-task-3', caseId: process.id, clientId: process.userId, title: 'Revisión del supervisor', description: 'Validación de consistencia, requisitos aplicables y calidad del entregable antes de enviarlo.', status: 'assigned', priority: 'normal', assignedToUid: 'demo-supervisor-01', assignedToName: 'Supervisor Legal', assignedByUid: 'demo-admin-uid-01', assignedByName: 'José Rafael Vásquez', createdByUid: 'demo-admin-uid-01', createdAt: now, updatedAt: now, requiresJoseApproval: true, reassignmentStatus: 'not_required', visibility: 'internal' },
          { id: 'demo-' + process.id + '-task-4', caseId: process.id, clientId: process.userId, title: 'Actualizar al cliente sobre el próximo hito', description: process.nextMilestone || 'Confirmar el siguiente paso y el plazo estimado.', status: 'unassigned', priority: 'normal', assignedToUid: null, assignedToName: null, assignedByUid: 'demo-admin-uid-01', assignedByName: 'José Rafael Vásquez', createdByUid: 'demo-admin-uid-01', createdAt: now, updatedAt: now, requiresJoseApproval: true, reassignmentStatus: 'not_required', visibility: 'client' },
        ];
        const initialTasks = savedTasks ? JSON.parse(savedTasks) as WorkflowTask[] : sampleTasks;
        const initialComments = savedComments ? JSON.parse(savedComments) as WorkflowComment[] : [];
        setTasks(initialTasks);
        setComments(initialComments);
        if (!savedTasks) localStorage.setItem(demoTasksKey, JSON.stringify(initialTasks));
        if (!savedComments) localStorage.setItem(demoCommentsKey, JSON.stringify(initialComments));
      } catch { setTasks([]); setComments([]); }
      setLoading(false);
      return;
    }
    const stopTasks = workflowService.subscribeCaseTasks(process.id, setTasks, (err) => {
      setError(err.message || 'No se pudieron cargar los trámites.');
      setLoading(false);
    });
    const stopComments = workflowService.subscribeCaseComments(process.id, setComments, (err) => {
      setError(err.message || 'No se pudieron cargar los comentarios.');
    });
    const stopActivity = workflowService.subscribeCaseActivity(process.id, () => {}, () => {});
    const timeout = window.setTimeout(() => setLoading(false), 900);
    return () => {
      stopTasks();
      stopComments();
      stopActivity();
      window.clearTimeout(timeout);
    };
  }, [process.id, demoMode]);

  const commentsByTask = useMemo(() => {
    const map = new Map<string, WorkflowComment[]>();
    comments.forEach(comment => {
      const key = comment.taskId || 'case';
      map.set(key, [...(map.get(key) || []), comment]);
    });
    return map;
  }, [comments]);

  const runAction = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await action();
      setNotice(success);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar. Comprueba la conexión y los permisos de Firebase.');
    } finally {
      setBusy(false);
    }
  };

  const createTask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!actorUid || !newTitle.trim()) return;
    const assignedName = newAssignee || null;
    const task: Omit<WorkflowTask, 'id' | 'createdAt' | 'updatedAt'> = {
      caseId: process.id,
      clientId: process.userId,
      title: newTitle.trim(),
      description: newDescription.trim(),
      status: assignedName ? 'assigned' : 'unassigned',
      priority: newPriority,
      assignedToUid: assignedName,
      assignedToName: assignedName,
      assignedByUid: actorUid,
      assignedByName: actorName,
      createdByUid: actorUid,
      dueAt: newDueDate ? new Date(newDueDate + 'T12:00:00').toISOString() : null,
      completedAt: null,
      requiresJoseApproval: true,
      reassignmentStatus: 'not_required',
      visibility: 'internal',
    };
    await runAction(async () => {
      if (demoMode) { const now = new Date().toISOString(); const next = [...tasks, { ...task, id: `demo-task-${Date.now()}`, createdAt: now, updatedAt: now } as WorkflowTask]; setTasks(next); localStorage.setItem(demoTasksKey, JSON.stringify(next)); } else { await workflowService.createTask(task); }
      setNewTitle('');
      setNewDescription('');
      setNewAssignee('');
      setNewPriority('normal');
      setNewDueDate('');
      setShowCreate(false);
    }, 'Trámite creado.');
  };

  const changeStatus = (task: WorkflowTask, status: WorkflowTaskStatus) =>
    runAction(async () => { if (demoMode) { const next = tasks.map(item => item.id === task.id ? { ...item, status, completedAt: status === 'completed' ? new Date().toISOString() : null, updatedAt: new Date().toISOString() } : item); setTasks(next); localStorage.setItem(demoTasksKey, JSON.stringify(next)); } else { await workflowService.updateTaskStatus(task, status, actorUid, actorName); } }, 'Estado actualizado.');

  const approveReassignment = (task: WorkflowTask, approve: boolean) =>
    runAction(async () => { if (demoMode) { const next = tasks.map(item => item.id === task.id ? { ...item, reassignmentStatus: (approve ? 'approved' : 'rejected') as 'approved' | 'rejected', ...(approve ? { assignedToUid: item.proposedAssigneeUid || null, assignedToName: item.proposedAssigneeName || null, status: item.proposedAssigneeUid ? ('assigned' as WorkflowTaskStatus) : ('unassigned' as WorkflowTaskStatus) } : {}), updatedAt: new Date().toISOString() } : item); setTasks(next); localStorage.setItem(demoTasksKey, JSON.stringify(next)); } else { await workflowService.resolveReassignment(task, approve, actorUid, actorName); } }, approve ? 'Reasignación aprobada.' : 'Reasignación rechazada.');

  const requestReassignment = (task: WorkflowTask) => {
    const nextName = reassignmentChoices[task.id];
    if (!nextName) return;
    return runAction(async () => { if (demoMode) { const next = tasks.map(item => item.id === task.id ? { ...item, reassignmentStatus: 'pending_approval' as const, proposedAssigneeUid: nextName, proposedAssigneeName: nextName, updatedAt: new Date().toISOString() } : item); setTasks(next); localStorage.setItem(demoTasksKey, JSON.stringify(next)); } else { await workflowService.proposeReassignment(task, nextName, nextName, actorUid, actorName); } }, 'Solicitud enviada para aprobación.');
  };

  const addComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!actorUid || !commentText.trim()) return;
    await runAction(async () => {
      const comment = {
        caseId: process.id,
        taskId: activeTask,
        authorUid: actorUid,
        authorName: actorName,
        authorRole: (userProfile?.role === 'admin' || userProfile?.role === 'lawyer' || userProfile?.role === 'supervisor' || userProfile?.role === 'intern' || userProfile?.role === 'secretary') ? userProfile.role : 'client' as const,
        body: commentText.trim(),
        visibility: commentVisibility,
      };
      if (demoMode) { const next = [...comments, { ...comment, id: `demo-comment-${Date.now()}`, createdAt: new Date().toISOString() } as WorkflowComment]; setComments(next); localStorage.setItem(demoCommentsKey, JSON.stringify(next)); } else { await workflowService.addComment(comment); }
      setCommentText('');
    }, commentVisibility === 'client' ? 'Actualización publicada para el cliente.' : 'Comentario interno añadido.');
  };

  return (
    <div className="relative min-h-[70vh] w-full min-w-0 overflow-hidden rounded-xl bg-neutral-100 text-neutral-900">
      <header className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-3 sm:px-5 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-neutral-100 shrink-0" aria-label={onBackLabel} title={onBackLabel}><ChevronLeft className="w-5 h-5" /></button>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Tablero de trámites · {process.id}</div>
            <h1 className="text-lg sm:text-xl font-extrabold truncate">{process.title}</h1>
            <p className="text-xs text-neutral-500 truncate">{process.clientName || process.clientEmail} · Responsable del expediente: {process.assignedLawyer || 'Sin asignar'}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 min-w-0"><button onClick={() => setShowLibrary(true)} className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold">Biblioteca</button><button onClick={() => setShowCreate(v => !v)} className="inline-flex items-center gap-2 rounded-lg bg-[#0071ce] text-white px-3 py-2 text-sm font-semibold"><Plus className="w-4 h-4" /> Nuevo trámite</button></div>
      </header>

      <main className="w-full max-w-full min-w-0 mx-auto p-3 sm:p-5 space-y-4">
        <section className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Estado del expediente</p><p className="mt-2 text-sm font-extrabold">{({ recaudos: 'Recaudos', redaccion: 'Redacción', tramite_publico: 'En ente público', revision: 'Revisión', completado: 'Completado' } as Record<string,string>)[process.status] || process.status}</p><p className="mt-1 text-xs text-neutral-500">{process.id}</p></div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Avance general</p><p className="mt-2 text-2xl font-extrabold">{process.progress}%</p><div className="mt-2 h-2 rounded-full bg-neutral-100"><div className="h-2 rounded-full bg-blue-600" style={{ width: (Math.max(0, Math.min(100, process.progress))) + '%' }} /></div></div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Trámites de trabajo</p><p className="mt-2 text-2xl font-extrabold">{tasks.length}</p><p className="mt-1 text-xs text-neutral-500">{tasks.filter(task => task.status === 'completed').length} completados · {tasks.filter(task => task.status === 'in_progress').length} en curso</p></div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Próximo hito</p><p className="mt-2 text-sm font-extrabold">{process.nextMilestone || 'Pendiente de definir'}</p><p className="mt-1 text-xs text-neutral-500">Fecha objetivo: {process.targetDate || 'Por confirmar'}</p></div>
        </section>
        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 text-red-800 p-3 text-sm flex gap-2"><CircleAlert className="w-4 h-4 shrink-0 mt-0.5" />{error}</div>}
        {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 p-3 text-sm">{notice}</div>}
        {showCreate && <form onSubmit={createTask} className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <label className="text-xs font-semibold lg:col-span-2">Nombre del trámite<input required value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ej. Preparar recaudos del RIF" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal" /></label>
          <label className="text-xs font-semibold">Asignar a<select value={newAssignee} onChange={e => setNewAssignee(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal"><option value="">Sin asignar</option>{lawyers.map(name => <option key={name} value={name}>{name}</option>)}</select></label>
          <label className="text-xs font-semibold">Prioridad<select value={newPriority} onChange={e => setNewPriority(e.target.value as WorkflowTaskPriority)} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal">{PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}</select></label>
          <label className="text-xs font-semibold">Fecha límite<input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal" /></label>
          <label className="text-xs font-semibold sm:col-span-2 lg:col-span-4">Instrucciones<textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} rows={2} placeholder="Qué hay que hacer, contexto y entregable esperado" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal" /></label>
          <div className="flex items-end gap-2"><button disabled={busy || !newTitle.trim()} className="rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-semibold disabled:opacity-50">{busy ? 'Guardando…' : 'Crear trámite'}</button><button type="button" onClick={() => setShowCreate(false)} className="rounded-lg px-3 py-2 text-sm border border-neutral-300">Cancelar</button></div>
        </form>}

        <div className="flex items-center gap-2 text-xs text-neutral-500"><UserRound className="w-4 h-4" /> Las tareas son independientes del responsable general del expediente. Las reasignaciones quedan registradas y requieren aprobación del responsable.</div>
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
            <h2 className="font-extrabold">Hitos del expediente</h2>
            <p className="mt-1 text-xs text-neutral-500">Lo ocurrido y lo que sigue en el caso.</p>
            <div className="mt-4 space-y-4">
              {(process.milestones || []).map((milestone, index) => <div key={milestone.title + index} className="flex gap-3"><span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" /><div><p className="text-sm font-semibold">{milestone.title}</p><p className="mt-1 text-xs text-neutral-500">{milestone.date} · {milestone.note}</p></div></div>)}
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3"><p className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Siguiente paso</p><p className="mt-1 text-sm font-bold text-blue-950">{process.nextMilestone || 'Pendiente de definir'}</p></div>
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
            <h2 className="font-extrabold">Resumen de ejecución</h2>
            <p className="mt-1 text-xs text-neutral-500">El flujo operativo se calcula desde los trámites registrados.</p>
            <div className="mt-4 space-y-3">
              {LANES.map(lane => <div key={lane.id} className="flex items-center justify-between gap-3 border-b border-neutral-100 pb-2"><span className="text-sm text-neutral-700">{lane.label}</span><span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-extrabold">{tasks.filter(task => task.status === lane.id).length}</span></div>)}
              <div className="rounded-lg bg-neutral-50 p-3"><p className="text-xs font-bold">Responsable general</p><p className="mt-1 text-sm">{process.assignedLawyer || 'Sin asignar'}</p><p className="mt-2 text-xs text-neutral-500">La asignación de cada trámite es independiente del responsable general del expediente.</p></div>
            </div>
          </div>
        </section>
        {loading ? <div className="p-12 text-center text-neutral-500"><LoaderCircle className="w-6 h-6 animate-spin mx-auto mb-2" />Cargando trámites…</div> :
          <div className="flex gap-3 overflow-x-auto pb-4 items-start">
            {LANES.map(lane => {
              const laneTasks = tasks.filter(task => task.status === lane.id);
              return <section key={lane.id} className="w-[280px] min-w-[280px] rounded-xl bg-neutral-200/70 p-2.5">
                <div className="flex items-center justify-between px-1 py-2"><h2 className="text-xs font-extrabold uppercase tracking-wide">{lane.label}</h2><span className="text-[10px] bg-white rounded-full px-2 py-1 font-bold">{laneTasks.length}</span></div>
                <div className="space-y-2">
                  {laneTasks.map(task => {
                    const taskComments = commentsByTask.get(task.id) || [];
                    return <article key={task.id} className="bg-white rounded-lg border border-neutral-200 p-3 shadow-sm space-y-3">
                      <div className="flex items-start justify-between gap-2"><h3 className="text-sm font-bold leading-snug">{task.title}</h3><span className={`text-[9px] uppercase font-bold rounded px-1.5 py-1 ${task.priority === 'urgent' ? 'bg-red-100 text-red-700' : task.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-neutral-100 text-neutral-600'}`}>{task.priority}</span></div>
                      {task.description && <p className="text-xs text-neutral-600 whitespace-pre-wrap">{task.description}</p>}
                      <div className="text-[11px] text-neutral-500 space-y-1">
                        <div className="flex gap-1.5 items-center"><UserRound className="w-3.5 h-3.5" />{task.assignedToName || 'Sin responsable asignado'}</div>
                        {task.dueAt && <div className="flex gap-1.5 items-center"><CalendarClock className="w-3.5 h-3.5" />Límite: {new Date(task.dueAt).toLocaleDateString()}</div>}
                        <div className="flex gap-1.5 items-center"><MessageSquare className="w-3.5 h-3.5" />{taskComments.length} comentarios</div>
                      </div>
                      {task.reassignmentStatus === 'pending_approval' && <div className="rounded-md bg-amber-50 border border-amber-200 p-2 text-xs space-y-2"><p>Solicitado: {task.proposedAssigneeName || 'Nuevo responsable'}</p>{isCaseLead ? <div className="flex gap-2"><button onClick={() => approveReassignment(task, true)} disabled={busy} className="rounded bg-emerald-700 text-white px-2 py-1"><Check className="inline w-3 h-3 mr-1" />Aprobar</button><button onClick={() => approveReassignment(task, false)} disabled={busy} className="rounded border border-neutral-300 px-2 py-1">Rechazar</button></div> : <p className="text-neutral-600">Pendiente de aprobación del responsable del expediente.</p>}</div>}
                      <div className="flex flex-wrap gap-1.5">
                        {(task.status === 'assigned' || task.status === 'unassigned') && <button onClick={() => changeStatus(task, 'in_progress')} disabled={busy} className="rounded border border-neutral-300 px-2 py-1 text-[10px] font-semibold hover:bg-neutral-50">Iniciar</button>}
                        {task.status === 'in_progress' && <button onClick={() => changeStatus(task, task.requiresJoseApproval ? 'pending_approval' : 'completed')} disabled={busy} className="rounded border border-blue-200 bg-blue-50 text-blue-800 px-2 py-1 text-[10px] font-semibold hover:bg-blue-100">{task.requiresJoseApproval ? 'Enviar a revisión' : 'Completar'}</button>}
                        {isCaseLead && task.status === 'pending_approval' && <button onClick={() => changeStatus(task, 'completed')} disabled={busy} className="rounded border border-emerald-200 text-emerald-800 px-2 py-1 text-[10px] font-semibold hover:bg-emerald-50">Aprobar y completar</button>}
                        {isCaseLead && task.status === 'pending_approval' && <button onClick={() => changeStatus(task, 'changes_requested')} disabled={busy} className="rounded border border-amber-200 text-amber-800 px-2 py-1 text-[10px] font-semibold hover:bg-amber-50">Solicitar correcciones</button>}
                        {task.status === 'changes_requested' && <button onClick={() => changeStatus(task, 'in_progress')} disabled={busy} className="rounded border border-neutral-300 px-2 py-1 text-[10px] font-semibold hover:bg-neutral-50">Reanudar corrección</button>}
                        <button onClick={() => { setActiveTask(task.id); setCommentVisibility('internal'); }} className="rounded border border-neutral-300 px-2 py-1 text-[10px] font-semibold">Comentarios</button>
                      </div>
                      {task.reassignmentStatus !== 'pending_approval' && task.status !== 'completed' && task.status !== 'pending_approval' && <div className="flex gap-1.5 pt-1 border-t border-neutral-100">
                        <select aria-label="Nuevo responsable" value={reassignmentChoices[task.id] || ''} onChange={e => setReassignmentChoices(prev => ({ ...prev, [task.id]: e.target.value }))} className="min-w-0 flex-1 rounded border border-neutral-300 px-2 py-1 text-[10px]">
                          <option value="">Transferir a…</option>{lawyers.filter(name => name !== task.assignedToName).map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                        <button onClick={() => requestReassignment(task)} disabled={busy || !reassignmentChoices[task.id]} className="rounded bg-neutral-900 text-white px-2 py-1 text-[10px] font-semibold disabled:opacity-50">Solicitar</button>
                      </div>}
                    </article>;
                  })}
                  {laneTasks.length === 0 && <div className="rounded-lg border border-dashed border-neutral-300 p-5 text-center text-[11px] text-neutral-500">Sin trámites</div>}
                </div>
              </section>;
            })}
          </div>
        }
      </main>

      {showLibrary && <CaseDocumentLibrary process={process} staffMode onClose={() => setShowLibrary(false)} />}

      {activeTask && <div className="absolute inset-0 z-[80] bg-neutral-950/40 flex items-center justify-center p-3" onClick={() => setActiveTask(null)}>
        <section role="dialog" aria-modal="true" className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-5 shadow-xl" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between gap-3 items-start"><div><h2 className="font-extrabold text-lg">Conversación del trámite</h2><p className="text-xs text-neutral-500">{tasks.find(t => t.id === activeTask)?.title}</p></div><button onClick={() => setActiveTask(null)} aria-label="Cerrar"><X className="w-5 h-5" /></button></div>
          <div className="space-y-3 py-4">{(commentsByTask.get(activeTask) || []).map(comment => <div key={comment.id} className="rounded-lg bg-neutral-50 border border-neutral-200 p-3"><div className="flex justify-between gap-2 text-xs font-bold"><span>{comment.authorName}</span><span className="text-neutral-500 font-normal">{comment.visibility === 'client' ? 'Visible al cliente' : 'Interno'}</span></div><p className="text-sm whitespace-pre-wrap mt-1">{comment.body}</p><p className="text-[10px] text-neutral-400 mt-2">{new Date(comment.createdAt).toLocaleString()}</p></div>)}</div>
          <form onSubmit={addComment} className="space-y-2 border-t border-neutral-200 pt-4"><label className="block text-xs font-semibold">Comentario<textarea required rows={3} value={commentText} onChange={e => setCommentText(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 p-3 text-sm font-normal" placeholder="Consulta al equipo, menciona a un colega o deja instrucciones…" /></label><div className="flex flex-wrap items-center justify-between gap-2"><select value={commentVisibility} onChange={e => setCommentVisibility(e.target.value as 'internal' | 'client')} className="rounded-lg border border-neutral-300 px-2 py-2 text-xs"><option value="internal">Nota interna</option><option value="client">Publicar al cliente</option></select><button disabled={busy || !commentText.trim()} className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-semibold disabled:opacity-50"><Send className="w-4 h-4" />Enviar comentario</button></div></form>
        </section>
      </div>}
    </div>
  );
};
