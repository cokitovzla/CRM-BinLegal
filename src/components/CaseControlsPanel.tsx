import {useState} from 'react';
import type {CaseControls,LegalProcess} from '../types';
const labels={none:'Sin espera',waiting:'En espera',blocked:'Bloqueado',suspended:'Suspendido'};
const field='mt-1 w-full rounded-lg border p-2 text-sm';
export function CaseControlsPanel({process,canEdit,onSave}:{process:LegalProcess;canEdit:boolean;onSave:(process:LegalProcess)=>Promise<void>}) {
 const empty:CaseControls={requirements:[],hold:{state:'none',reason:'',dependsOn:'',nextAction:''}};
 const [draft,setDraft]=useState<CaseControls>(()=>structuredClone(process.caseControls||empty));
 const [baseRevision,setBaseRevision]=useState(process.controlsRevision||0);
 const [editing,setEditing]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const saved=process.caseControls||empty;
 const change=(i:number,field:'title'|'responsible'|'evidence',text:string)=>setDraft(value=>({...value,requirements:value.requirements.map((item,index)=>index===i?{...item,[field]:text}:item)}));
 return <section className="rounded-xl border bg-white p-5">
 <h2 className="font-bold">Requisitos y situación del asunto</h2>
 <p className="mt-2 text-sm">{labels[saved.hold.state]} · {saved.requirements.filter(item=>!item.evidence.trim()).length} requisitos pendientes de acreditar</p>
 {saved.hold.state!=='none'&&<div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm"><p>Motivo: {saved.hold.reason}</p><p>Depende de: {saved.hold.dependsOn}</p><p>Próxima acción: {saved.hold.nextAction}</p></div>}
 {!editing&&<ul className="mt-3 space-y-2 text-sm">{saved.requirements.map(item=><li key={item.id}><strong>{item.title}</strong> · Responsable: {item.responsible}<p>{item.evidence?'Evidencia: '+item.evidence:'Pendiente de acreditar'}</p></li>)}</ul>}
 {!saved.requirements.length&&!editing&&<p className="mt-2 text-sm text-slate-500">Todavía no se han definido requisitos individuales.</p>}
 {canEdit&&!editing&&<button className="mt-3 rounded-lg border px-3 py-2 text-sm" onClick={()=>{setDraft(structuredClone(saved));setBaseRevision(process.controlsRevision||0);setError('');setEditing(true);}}>Editar requisitos y esperas</button>}
 {editing&&<form className="mt-4 space-y-4" onSubmit={async e=>{e.preventDefault();if(busy)return;setBusy(true);setError('');try{await onSave({...process,controlsRevision:baseRevision,caseControls:draft});setEditing(false);}catch(err){setError(err instanceof Error?err.message:'No se pudo guardar');}finally{setBusy(false);}}}><fieldset disabled={busy} className="space-y-4">
 {draft.requirements.map((item,i)=><div key={item.id} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2"><label className="text-sm">Requisito {i+1}<input required maxLength={4000} className={field} value={item.title} onChange={e=>change(i,'title',e.target.value)}/></label><label className="text-sm">Responsable del requisito {i+1}<input required maxLength={4000} className={field} value={item.responsible} onChange={e=>change(i,'responsible',e.target.value)}/></label><label className="text-sm sm:col-span-2">Evidencia del requisito {i+1}<textarea maxLength={4000} className={field} value={item.evidence} onChange={e=>change(i,'evidence',e.target.value)}/></label></div>)}
 <button type="button" disabled={draft.requirements.length>=30} className="rounded-lg border px-3 py-2 text-sm" onClick={()=>setDraft(value=>({...value,requirements:[...value.requirements,{id:crypto.randomUUID(),title:'',responsible:'',evidence:''}]}))}>Añadir requisito</button>
 <label className="block text-sm">Situación de espera<select className={field} value={draft.hold.state} onChange={e=>setDraft(value=>({...value,hold:{...value.hold,state:e.target.value as CaseControls['hold']['state']}}))}>{Object.entries(labels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
 {(['reason','dependsOn','nextAction'] as const).map((key,i)=><label key={key} className="block text-sm">{['Motivo o explicación del cambio','De quién depende','Próxima acción'][i]}<textarea required={draft.hold.state!=='none'} maxLength={4000} className={field} value={draft.hold[key]} onChange={e=>setDraft(value=>({...value,hold:{...value.hold,[key]:e.target.value}}))}/></label>)}
 <p className="text-xs text-slate-500">Levantar una espera no completa tareas ni finaliza el asunto. Los cambios se conservan en el historial.</p>
 <div className="flex gap-2"><button className="rounded-lg bg-blue-800 px-4 py-2 text-white">{busy?'Guardando…':'Guardar condiciones'}</button><button type="button" className="rounded-lg border px-4 py-2" onClick={()=>setEditing(false)}>Cancelar edición</button></div></fieldset>{error&&<p role="alert" className="text-sm text-red-800">{error}</p>}</form>}
 </section>;
}
