import {useEffect,useState} from 'react';
import {useAuth} from '../context/AuthContext';
import {workflowService} from '../services/workflowService';
import type {CaseVisibility,LegalProcess,WorkflowComment} from '../types';
import {formatCrmDate} from '../lib/dates';

const eventName='binlegal-preview-comments-changed';
const storageKey=(caseId:string)=>'binlegal_preview_comments_'+caseId;

export function CaseMessages({process,staffMode=false}:{process:LegalProcess;staffMode?:boolean}) {
  const {currentUser,userProfile}=useAuth();
  const preview=window.location.pathname.replace(/\/$/,'')==='/crm-preview';
  const [items,setItems]=useState<WorkflowComment[]>([]);
  const [body,setBody]=useState('');
  const [visibility,setVisibility]=useState<CaseVisibility>(staffMode?'internal':'client');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');

  useEffect(()=>{
    if(preview){
      const refresh=()=>{
        const stored=JSON.parse(localStorage.getItem(storageKey(process.id))||'[]') as WorkflowComment[];
        setItems(staffMode?stored:stored.filter(item=>item.visibility==='client'));
      };
      refresh();window.addEventListener(eventName,refresh);return()=>window.removeEventListener(eventName,refresh);
    }
    return workflowService.subscribeCaseComments(process.id,!staffMode,setItems,err=>setError(err.message));
  },[process.id,preview,staffMode]);

  const submit=async()=>{
    const clean=body.trim();
    if(!clean||busy)return;
    setBusy(true);setError('');setNotice('');
    try{
      const authorUid=currentUser?.uid||userProfile?.userId||(staffMode?'demo-admin-uid-01':'demo-client-uid-01');
      const comment:WorkflowComment={id:crypto.randomUUID(),caseId:process.id,taskId:null,documentId:null,authorUid,
        authorName:userProfile?.displayName||currentUser?.displayName||(staffMode?'Equipo JurisNova':'Cliente de demostración'),
        authorRole:staffMode?(userProfile?.role||'admin') as WorkflowComment['authorRole']:'client',body:clean,
        visibility:staffMode?visibility:'client',createdAt:new Date().toISOString(),mentions:[]};
      if(preview){
        const stored=JSON.parse(localStorage.getItem(storageKey(process.id))||'[]') as WorkflowComment[];
        localStorage.setItem(storageKey(process.id),JSON.stringify([...stored,comment]));window.dispatchEvent(new Event(eventName));
      }else await workflowService.addComment(comment);
      setBody('');setNotice(comment.visibility==='internal'?'Nota interna registrada.':'Actualización publicada en el portal del cliente.');
    }catch(err){setError(err instanceof Error?err.message:'No se pudo publicar el mensaje.');}finally{setBusy(false);}
  };

  return <section className="rounded-xl border bg-white p-5">
    <h2 className="font-bold">{staffMode?'Conversación del asunto':'Mensajes con JurisNova'}</h2>
    <p className="mt-2 text-xs text-slate-500">{staffMode?'Las notas internas quedan dentro del despacho. Las actualizaciones para el cliente aparecen en su portal.':'Este canal pertenece al asunto. No completa tareas ni cambia su etapa.'}</p>
    <div className="mt-4 space-y-3">{items.map(item=><article key={item.id} className={'rounded-lg border p-3 '+(item.visibility==='internal'?'bg-amber-50':'bg-blue-50')}>
      <div className="flex flex-wrap justify-between gap-2 text-xs"><strong>{item.authorName}</strong><span>{item.visibility==='internal'?'Solo despacho':'Visible al cliente'} · {formatCrmDate(item.createdAt)}</span></div>
      <p className="mt-2 whitespace-pre-wrap text-sm">{item.body}</p>
    </article>)}</div>
    {!items.length&&<p className="mt-4 text-sm text-slate-500">Todavía no hay mensajes en este asunto.</p>}
    <form className="mt-4 space-y-3" onSubmit={e=>{e.preventDefault();void submit();}}>
      {staffMode&&<label className="block text-sm">Destino<select className="mt-1 w-full rounded-lg border p-2" value={visibility} onChange={e=>setVisibility(e.target.value as CaseVisibility)}><option value="internal">Nota interna · solo despacho</option><option value="client">Actualización · visible al cliente</option></select></label>}
      <label className="block text-sm">{staffMode?'Mensaje o nota':'Escribe tu mensaje'}<textarea required maxLength={4000} rows={4} className="mt-1 w-full rounded-lg border p-2" value={body} onChange={e=>setBody(e.target.value)}/></label>
      <button disabled={busy||!body.trim()} className="rounded-lg bg-blue-800 px-4 py-2 text-sm text-white">{busy?'Publicando…':staffMode&&visibility==='internal'?'Guardar nota interna':'Publicar mensaje'}</button>
    </form>
    {error&&<p role="alert" className="mt-3 text-sm text-red-800">{error}</p>}{notice&&<p role="status" className="mt-3 text-sm text-emerald-800">{notice}</p>}
  </section>;
}
