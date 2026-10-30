import {useState} from 'react';
import type {Lead,LegalProcess} from '../types';
interface Props {lead:Lead;processes:LegalProcess[];onAccept:(lead:Lead,ids:string[],evidence:string)=>Promise<void>;onOpen:(process:LegalProcess)=>void}
export function AcceptedServicesPanel({lead,processes,onAccept,onOpen}:Props) {
 const [selected,setSelected]=useState<string[]>([]);const [evidence,setEvidence]=useState('');
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [notice,setNotice]=useState('');
 const budget=lead.acceptedBudget?.budget||lead.budget;
 const accepted=lead.acceptedBudget?.services||[];
 return <section className="my-5 rounded-2xl border border-emerald-200 bg-white p-5">
   <h2 className="text-lg font-bold text-slate-950">Servicios aceptados y asuntos</h2>
   <p className="mt-1 text-sm text-slate-600">La solicitud reúne la necesidad comercial. Cada servicio aceptado abre un asunto independiente, con sus propias tareas.</p>
   {!budget?.items.length?<p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Prepara primero los conceptos del presupuesto en la pestaña Presupuesto Comercial. Las tarifas deben proceder del despacho.</p>:<form className="mt-4 space-y-4" onSubmit={async e=>{
     e.preventDefault();if(busy)return;setBusy(true);setError('');setNotice('');
     try{await onAccept(lead,selected,evidence);setSelected([]);setEvidence('');setNotice('Aceptación registrada. Los asuntos están disponibles aquí y en Operación legal.');}
     catch(err){setError(err instanceof Error?err.message:'No se pudo registrar la aceptación.');}finally{setBusy(false);}
   }}>
     <fieldset disabled={busy} className="space-y-3"><legend className="mb-2 text-sm font-semibold">Selecciona únicamente los servicios que el cliente aceptó ({accepted.length}/{budget.items.length})</legend>
     {budget.items.map(item=>{
       const record=accepted.find(value=>value.itemId===item.id);
       const process=processes.find(value=>value.id===record?.caseId);
       return <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
         <label className="flex min-w-0 items-start gap-3 text-sm"><input type="checkbox" disabled={!!record||busy} checked={!!record||selected.includes(item.id)} onChange={e=>setSelected(previous=>e.target.checked?[...previous,item.id]:previous.filter(id=>id!==item.id))}/><span className="break-words">{item.concept}<span className="block text-xs text-slate-500">{item.quantity} × {item.unitPrice} {budget.currency} · {record?'Aceptado · '+record.evidence:'Pendiente de decisión'}</span></span></label>
         {process&&<button type="button" onClick={()=>onOpen(process)} className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-800">Abrir asunto y tareas</button>}
       </div>;
     })}
     {accepted.length<budget.items.length&&<>
       <label className="block text-sm font-medium">Evidencia de aceptación<textarea required maxLength={4000} value={evidence} onChange={e=>setEvidence(e.target.value)} className="mt-1 w-full rounded-lg border p-2" placeholder="Ej. Confirmación por correo del cliente y referencia del mensaje"/></label>
       <button disabled={busy||!selected.length||!evidence.trim()} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy?'Registrando…':'Registrar aceptación y abrir asuntos'}</button>
     </>}
     </fieldset>
     {lead.acceptedBudget&&<p className="text-xs text-slate-500">Se conserva la versión enviada del presupuesto. Repetir la aceptación no crea asuntos duplicados.</p>}
   </form>}
   {error&&<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}{notice&&<p role="status" className="mt-3 text-sm text-emerald-800">{notice}</p>}
 </section>;
}
