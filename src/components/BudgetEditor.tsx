import {useRef,useState} from 'react';
import type {Lead,LeadBudget,LeadBudgetItem} from '../types';
import {calculateBudget} from '../domain/budget';
import {BudgetPrint} from './BudgetPrint';
import {PROVISIONAL_CATALOG} from '../data/provisionalCatalog';
export function BudgetEditor({lead,onSave}:{lead:Lead;onSave:(budget:LeadBudget,revision:number)=>Promise<void>}) {
 const [budget,setBudget]=useState<LeadBudget>(()=>structuredClone(lead.acceptedBudget?.budget||lead.budget||{items:[],currency:'USD',status:'borrador',discount:0,notes:''}));
 const baseRevision=useRef(lead.revision||0);
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [notice,setNotice]=useState('');
 const [catalogId,setCatalogId]=useState('');
 const locked=!!lead.acceptedBudget || budget.currency!=='USD';
 const subtotal=budget.items.reduce((sum,item)=>sum+item.quantity*item.unitPrice,0);
 let calculation:ReturnType<typeof calculateBudget>|undefined;
 try{calculation=calculateBudget(budget);}catch{/* Validation is shown when saving. */}
 const change=(id:string,patch:Partial<LeadBudgetItem>)=>setBudget(value=>({...value,items:value.items.map(item=>item.id===id?{...item,...patch}:item)}));
 return <form className="rounded-2xl border bg-white p-5" onSubmit={async e=>{
   e.preventDefault();if(busy||locked)return;setBusy(true);setError('');setNotice('');
   try{
     if(!budget.items.length||budget.items.some(item=>!item.concept.trim()||!Number.isFinite(item.unitPrice)||item.unitPrice<0||!Number.isFinite(item.quantity)||item.quantity<=0))throw new Error('Revisa los conceptos, cantidades y tarifas.');
     if(budget.status==='enviado'&&!budget.sentEvidence?.trim())throw new Error('Indica la referencia del envío antes de marcar la propuesta como enviada.');
     if((budget.discount||0)<0||(budget.discount||0)>subtotal)throw new Error('El descuento debe estar entre cero y el subtotal.');
     calculateBudget(budget);
     await onSave({...budget,createdAt:budget.createdAt||new Date().toISOString()},baseRevision.current);baseRevision.current+=1;setNotice('Presupuesto guardado. Ya puedes registrar los servicios aceptados.');
   }catch(err){setError(err instanceof Error?err.message:'No se pudo guardar.');}finally{setBusy(false);}
 }}>
 <h2 className="text-lg font-bold">Presupuesto de la solicitud</h2><p className="mt-2 text-sm text-slate-600">{locked?'Esta versión está conservada con la aceptación y no puede editarse.':'Introduce los servicios y las tarifas del despacho. Los cambios se guardan al pulsar Guardar presupuesto.'}</p>
 <fieldset disabled={busy||locked} className="mt-4 space-y-4">
   <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-slate-800">
     <p className="font-semibold">Catálogo provisional para pruebas</p>
     <p className="mt-1 text-xs">Precios orientativos en USD, editables antes de guardar. No son tarifas aprobadas por el despacho; aranceles y gastos externos se acuerdan aparte.</p>
     <div className="mt-3 flex flex-col gap-2 sm:flex-row">
       <select aria-label="Servicio del catálogo provisional" value={catalogId} onChange={event=>setCatalogId(event.target.value)} className="min-w-0 flex-1 rounded-lg border bg-white p-2">
         <option value="">Selecciona un servicio</option>
         {PROVISIONAL_CATALOG.map(item=><option key={item.id} value={item.id}>{item.area} · {item.concept} · {item.suggestedPrice} USD</option>)}
       </select>
       <button type="button" disabled={!catalogId} onClick={()=>{const item=PROVISIONAL_CATALOG.find(value=>value.id===catalogId);if(!item)return;setBudget(value=>({...value,items:[...value.items,{id:crypto.randomUUID(),concept:item.concept,area:item.area,quantity:1,unitPrice:item.suggestedPrice}]}));setCatalogId('');}} className="rounded-lg bg-[#0071ce] px-4 py-2 font-semibold text-white disabled:opacity-50">Agregar al presupuesto</button>
     </div>
   </div>
   <div className="flex flex-wrap gap-4"><label className="text-sm">Moneda<select value={budget.currency} onChange={e=>setBudget(value=>({...value,currency:e.target.value as LeadBudget['currency']}))} className="ml-2 rounded-lg border p-2">{[budget.currency].map(currency=><option key={currency}>{currency}</option>)}</select></label><label className="text-sm">Estado<select value={budget.status} onChange={e=>setBudget(value=>({...value,status:e.target.value as LeadBudget['status']}))} className="ml-2 rounded-lg border p-2"><option value="borrador">Borrador</option><option value="enviado">Enviado</option><option value="rechazado">Rechazado</option></select></label></div>
   {budget.status==='enviado'&&<label className="block text-sm">Referencia del envío<input required maxLength={2000} value={budget.sentEvidence||''} onChange={event=>setBudget(value=>({...value,sentEvidence:event.target.value}))} placeholder="Ej. Correo al cliente del 28/10, asunto Propuesta" className="mt-1 w-full rounded-lg border p-2"/><span className="mt-1 block text-xs text-slate-500">Registrar el envío no equivale a registrar aceptación.</span></label>}
   {budget.items.map((item,index)=><div key={item.id} className="grid gap-3 rounded-xl border bg-slate-50 p-4 sm:grid-cols-2">
     <label className="text-sm sm:col-span-2">Servicio {index+1}<input required value={item.concept} onChange={e=>change(item.id,{concept:e.target.value})} className="mt-1 w-full rounded-lg border bg-white p-2"/></label>
     <label className="text-sm">Área<input required value={item.area} onChange={e=>change(item.id,{area:e.target.value})} className="mt-1 w-full rounded-lg border bg-white p-2"/></label>
     <label className="text-sm">Cantidad<input required type="number" min="1" step="1" value={item.quantity} onChange={e=>change(item.id,{quantity:Number(e.target.value)})} className="mt-1 w-full rounded-lg border bg-white p-2"/></label>
     <label className="text-sm">Tarifa unitaria<input required type="number" min="0" step="any" value={item.unitPrice} onChange={e=>change(item.id,{unitPrice:Number(e.target.value)})} className="mt-1 w-full rounded-lg border bg-white p-2"/></label>
     <div className="flex items-end"><button type="button" onClick={()=>setBudget(value=>({...value,items:value.items.filter(line=>line.id!==item.id)}))} className="rounded-lg border px-3 py-2 text-sm text-red-700">Retirar servicio {index+1}</button></div>
   </div>)}
   <button type="button" onClick={()=>setBudget(value=>({...value,items:[...value.items,{id:crypto.randomUUID(),concept:'',area:'Corporativo',quantity:1,unitPrice:0}]}))} className="rounded-lg border px-4 py-2 text-sm">Agregar servicio</button>
   <label className="block text-sm">Vigente hasta<input type="date" value={budget.validUntil||''} onChange={e=>setBudget(value=>({...value,validUntil:e.target.value}))} className="ml-2 rounded-lg border p-2"/><span className="mt-1 block text-xs text-slate-500">Incluye el día indicado, según la hora de Caracas. Después no se admiten nuevas aceptaciones.</span></label>
   <label className="block text-sm">Descuento<input type="number" min="0" step="any" value={budget.discount||0} onChange={e=>setBudget(value=>({...value,discount:Number(e.target.value)}))} className="ml-2 rounded-lg border p-2"/></label>
   <label className="block text-sm">Condiciones y observaciones<textarea value={budget.notes||''} onChange={e=>setBudget(value=>({...value,notes:e.target.value}))} className="mt-1 w-full rounded-lg border p-2" rows={3}/></label>
   <label className="block text-sm">Tratamiento del impuesto<select value={budget.taxMode||'none'} onChange={e=>setBudget(value=>({...value,taxMode:e.target.value as LeadBudget['taxMode'],taxRate:value.taxRate??16}))} className="mt-1 w-full rounded-lg border p-2"><option value="none">Sin desglose de impuesto en esta propuesta</option><option value="included">Los precios ya incluyen el impuesto</option><option value="added">Sumar el impuesto a los precios</option></select></label>
   {budget.taxMode&&budget.taxMode!=='none'&&<label className="block text-sm">Tasa (%)<input type="number" min="0" max="100" step="0.01" value={budget.taxRate??16} onChange={e=>setBudget(value=>({...value,taxRate:Number(e.target.value)}))} className="ml-2 rounded-lg border p-2"/></label>}
   {calculation?<div className="rounded-xl bg-slate-50 p-4 text-sm"><p>Subtotal: {calculation.subtotal.toFixed(2)} {budget.currency}</p><p>Descuento: {calculation.discount.toFixed(2)} {budget.currency}</p>{calculation.mode!=='none'&&<><p>Base: {calculation.base.toFixed(2)} {budget.currency}</p><p>Impuesto ({calculation.rate}%): {calculation.tax.toFixed(2)} {budget.currency}</p></>}<p className="mt-2 font-bold">Total: {calculation.total.toFixed(2)} {budget.currency}</p><p className="mt-2 text-xs text-slate-500">Propuesta comercial. Los importes se expresan con dos decimales; el desglose no genera una factura fiscal.</p></div>:<p className="text-sm text-amber-900">Revisa cantidades, tarifas y descuento para calcular el total.</p>}
   <button disabled={busy||locked} className="rounded-lg bg-[#0071ce] px-4 py-2 text-sm text-white">{busy?'Guardando…':'Guardar presupuesto'}</button>
 </fieldset>
 <BudgetPrint lead={lead} budget={budget}/>
 {error&&<p role="alert" className="mt-3 text-red-700">{error}</p>}{notice&&<p role="status" className="mt-3 text-emerald-800">{notice}</p>}
 </form>;
}
