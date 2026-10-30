import type { LegalProcess } from '../types';
import { ViewModeSwitch, useViewMode } from './ViewModeSwitch';

type LinkedContact = { id: string; name: string; email: string; company: string };

export function StaffDirectory({ processes, links, uid }: { processes: LegalProcess[]; links: LinkedContact[]; uid: string }) {
  const [viewMode, setViewMode] = useViewMode('staff-directory');
  const contacts = new Map<string, { id: string; name: string; email: string; company: string; source: string }>();
  for (const process of processes) {
    if (process.assignedLawyerId !== uid && !process.assignedLawyerIds?.includes(uid)) continue;
    const key = (process.clientEmail || process.clientName || '').trim().toLowerCase();
    if (!key) continue;
    contacts.set(key, { id: process.id, name: process.clientName || 'Cliente', email: process.clientEmail, company: process.companyName || '', source: 'Trámite asignado' });
  }
  for (const link of links) {
    const key = (link.email || link.name).trim().toLowerCase();
    if (key && !contacts.has(key)) contacts.set(key, { ...link, source: 'Vínculo de contacto' });
  }
  const rows = [...contacts.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  return <section className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div><h2 className="font-bold text-slate-900">Contactos de mis asuntos</h2><p className="mt-1 text-xs text-slate-500">Contactos de trámites asignados y vínculos expresos del despacho.</p></div><ViewModeSwitch mode={viewMode} onChange={setViewMode}/></div>
    {viewMode === 'cards' ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{rows.map(contact => <article key={contact.id} className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"><h3 className="break-words font-bold text-slate-900">{contact.name}</h3><p className="mt-1 break-words text-sm text-slate-600">{contact.company || 'Particular'}</p>{contact.email && <a href={'mailto:' + contact.email} className="mt-2 inline-block break-all rounded-lg px-2 py-1 text-sm text-blue-800 hover:bg-blue-50">{contact.email}</a>}<p className="mt-2 text-xs text-slate-500">{contact.source}</p></article>)}</div> : <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="w-full min-w-[600px] table-fixed text-left text-xs"><thead><tr className="border-b bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500"><th className="w-[28%] px-4 py-3">Contacto</th><th className="w-[25%] px-4 py-3">Empresa</th><th className="w-[30%] px-4 py-3">Correo</th><th className="w-[17%] px-4 py-3">Relación</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map(contact => <tr key={contact.id} className="hover:bg-blue-50/70"><td className="break-words px-4 py-3 font-semibold text-slate-900">{contact.name}</td><td className="break-words px-4 py-3">{contact.company || 'Particular'}</td><td className="break-all px-4 py-3">{contact.email && <a href={'mailto:' + contact.email} className="rounded-md px-1 py-0.5 text-blue-800 hover:bg-blue-50">{contact.email}</a>}</td><td className="px-4 py-3">{contact.source}</td></tr>)}</tbody></table></div>}
    {rows.length === 0 && <p className="rounded-xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">No hay contactos de trámites asignados ni vínculos expresos.</p>}
  </section>;
}
