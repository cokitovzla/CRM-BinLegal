import {useRef,useState} from 'react';
import type {Lead} from '../types';
import {commercialStatus,COMMERCIAL_LABELS,caracasDateTimeInput,parseCaracasDateTime,type CommercialActivity,type ContactRecord,type MeetingRecord} from '../domain/commercial';
import {formatCrmDate} from '../lib/dates';
export function CommercialActivityPanel({lead,onSave}:{lead:Lead;onSave:(activity:CommercialActivity,revision:number)=>Promise<void>}) {
 const [form,setForm]=useState<'contact'|'meeting'|null>(null);
 const [at,setAt]=useState(caracasDateTimeInput());
 const [channel,setChannel]=useState<ContactRecord['channel']>('Llamada');
 const [modality,setModality]=useState<MeetingRecord['modality']>('Videollamada');
 const [meetingStatus,setMeetingStatus]=useState<MeetingRecord['status']>('scheduled');
 const [location,setLocation]=useState('');
 const [note,setNote]=useState('');
 const [responsibleName,setResponsibleName]=useState(lead.assignedLawyer||'');
 const [openFact,setOpenFact]=useState<string|null>(null);
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [notice,setNotice]=useState('');
 const revision=useRef(lead.revision||0);
 const open=(type:'contact'|'meeting')=>{
  revision.current=lead.revision||0;setForm(type);setError('');setNotice('');
  if(type==='meeting'&&lead.commercial?.meeting){const meeting=lead.commercial.meeting;setAt(caracasDateTimeInput(meeting.at));setModality(meeting.modality);setLocation(meeting.location);setMeetingStatus(meeting.status);setNote(meeting.note);setResponsibleName(meeting.responsibleName||lead.assignedLawyer||'');}
  else {setAt(caracasDateTimeInput());setNote('');setLocation('');setMeetingStatus('scheduled');setResponsibleName(lead.assignedLawyer||'');}
 };
 const facts=[
  {label:'Atención comercial',detail:lead.commercial?.contact?lead.commercial.contact.channel+' · '+formatCrmDate(lead.commercial.contact.at):'Sin contacto registrado',responsible:lead.commercial?.contact?.responsibleName,note:lead.commercial?.contact?.note,color:'border-blue-200 bg-blue-50/70 text-blue-900'},
  {label:'Reunión',detail:lead.commercial?.meeting?({scheduled:'Agendada',completed:'Realizada',cancelled:'Cancelada'}[lead.commercial.meeting.status])+' · '+formatCrmDate(lead.commercial.meeting.at):'Sin reunión registrada',responsible:lead.commercial?.meeting?.responsibleName,note:lead.commercial?.meeting?.note,color:'border-violet-200 bg-violet-50/70 text-violet-900'},
  {label:'Propuesta',detail:lead.budget?.sentEvidence?'Envío registrado · '+(lead.budget.sentAt?formatCrmDate(lead.budget.sentAt):'fecha no registrada'):'Sin envío registrado',responsible:lead.budget?.sentByName,note:lead.budget?.sentEvidence,color:'border-amber-200 bg-amber-50/70 text-amber-900'},
  {label:'Servicios aceptados',detail:lead.acceptedBudget?.services.length?lead.acceptedBudget.services.length+' servicios con evidencia':'Sin aceptación registrada',responsible:undefined,note:undefined,color:'border-emerald-200 bg-emerald-50/70 text-emerald-900'},
 ];
 return <section className="my-5 rounded-2xl border border-blue-100 bg-white p-5" aria-labelledby="commercial-heading">
  <div className="flex flex-wrap items-start justify-between gap-3"><h2 id="commercial-heading" className="text-lg font-bold text-slate-950">Atención comercial de la solicitud</h2><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-900">{COMMERCIAL_LABELS[commercialStatus(lead)]}</span></div>
  <p className="mt-2 text-sm text-slate-600">Esta sección registra contacto, reunión y propuesta. Los servicios aceptados aparecen como trámites; sus tareas se consultan en Mi trabajo.</p>
  <dl className="mt-4 grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-4">{facts.map(fact=><div key={fact.label} className="group relative min-w-0"><dt><button type="button" aria-expanded={openFact===fact.label} onClick={()=>setOpenFact(current=>current===fact.label?null:fact.label)} className={`w-full min-w-0 rounded-xl border p-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${fact.color}`}><span className="block text-xs font-bold">{fact.label}</span><span className="mt-2 block break-words text-xs leading-relaxed">{fact.detail}</span><span className="mt-2 block text-[11px] opacity-70">Ver responsable y nota</span></button></dt><dd className={`${openFact===fact.label?'relative block':'absolute top-full hidden group-hover:block group-focus-within:block'} inset-x-0 z-20 mt-1 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-xl`}><p><strong>Responsable:</strong> {fact.responsible||'No registrado en este hito'}</p><p className="mt-2 whitespace-pre-wrap break-words"><strong>Nota:</strong> {fact.note||'Sin nota registrada'}</p></dd></div>)}</dl>
  <p className="mt-3 text-xs text-slate-500">La situación se calcula a partir de los registros guardados. Agendar una reunión no significa que ya se realizó ni completa tareas.</p>
  <div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={()=>open('contact')} className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-800">Registrar contacto realizado</button><button type="button" disabled={busy} onClick={()=>open('meeting')} className="rounded-lg border px-3 py-2 text-sm">{lead.commercial?.meeting?'Actualizar reunión':'Agendar reunión'}</button></div>
  {form&&<form className="mt-5 rounded-xl border bg-slate-50 p-4" onSubmit={async event=>{
   event.preventDefault();if(busy)return;setBusy(true);setError('');setNotice('');
   try{
    const activity:CommercialActivity={...lead.commercial};
    if(form==='contact')activity.contact={at:parseCaracasDateTime(at),channel,note,responsibleName:responsibleName.trim()};
    else activity.meeting={at:parseCaracasDateTime(at),modality,location,note,status:meetingStatus,responsibleName:responsibleName.trim()};
    await onSave(activity,revision.current);setForm(null);setNote('');setNotice(form==='contact'?'Contacto registrado.':'Reunión guardada en la agenda.');
   }catch(err){setError(err instanceof Error?err.message:'No se pudo guardar. Los datos siguen aquí para reintentar.');}finally{setBusy(false);}
  }}>
   <h3 className="font-semibold">{form==='contact'?'Registrar un contacto realizado':'Datos de la reunión'}</h3>
   <fieldset disabled={busy} className="mt-4 grid gap-4 sm:grid-cols-2">
    <label className="text-sm font-medium">Persona responsable<input required maxLength={160} value={responsibleName} onChange={event=>setResponsibleName(event.target.value)} className="mt-1 w-full rounded-lg border bg-white p-2" placeholder="Nombre de quien atendió"/></label>
    <label className="text-sm font-medium">Fecha y hora (Caracas)<input type="datetime-local" required value={at} onChange={event=>setAt(event.target.value)} className="mt-1 w-full rounded-lg border bg-white p-2"/></label>
    {form==='contact'?<label className="text-sm font-medium">Canal del contacto<select value={channel} onChange={event=>setChannel(event.target.value as ContactRecord['channel'])} className="mt-1 w-full rounded-lg border bg-white p-2">{['Llamada','WhatsApp','Correo','Presencial','Otro'].map(value=><option key={value}>{value}</option>)}</select></label>:<>
     <label className="text-sm font-medium">Modalidad<select value={modality} onChange={event=>setModality(event.target.value as MeetingRecord['modality'])} className="mt-1 w-full rounded-lg border bg-white p-2">{['Videollamada','Llamada','Presencial'].map(value=><option key={value}>{value}</option>)}</select></label>
     <label className="text-sm font-medium">Estado de la reunión<select value={meetingStatus} onChange={event=>setMeetingStatus(event.target.value as MeetingRecord['status'])} className="mt-1 w-full rounded-lg border bg-white p-2"><option value="scheduled">Agendada</option><option value="completed">Realizada</option><option value="cancelled">Cancelada</option></select></label>
     <label className="text-sm font-medium">Lugar o enlace<input value={location} onChange={event=>setLocation(event.target.value)} className="mt-1 w-full rounded-lg border bg-white p-2"/></label>
    </>}
    <label className="text-sm font-medium sm:col-span-2">{form==='contact'?'Referencia de lo conversado':'Motivo, resultado o razón de cancelación'}<textarea required maxLength={4000} rows={3} value={note} onChange={event=>setNote(event.target.value)} className="mt-1 w-full rounded-lg border bg-white p-2"/></label>
    <div className="flex gap-2 sm:col-span-2"><button className="rounded-lg bg-[#0071ce] px-4 py-2 text-sm font-semibold text-white">{busy?'Guardando…':'Guardar registro comercial'}</button><button type="button" onClick={()=>setForm(null)} className="rounded-lg border px-4 py-2 text-sm">Cancelar</button></div>
   </fieldset>
  </form>}
  {error&&<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}{notice&&<p role="status" className="mt-3 text-sm text-emerald-800">{notice}</p>}
 </section>;
}
