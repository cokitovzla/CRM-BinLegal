import { useEffect, useRef, useState } from 'react';
import type { Lead } from '../types';
import type { LeadFollowUp } from '../services/leadModel';

import { leadService } from '../services/leadService';

interface Props { lead: Lead; onSave: (followUp: LeadFollowUp, revision: number) => Promise<void> }

export function LeadFollowUpPanel({ lead, onSave }: Props) {
  const [draft, setDraft] = useState<LeadFollowUp>(lead.followUp || {
    responsibleName: lead.assignedLawyer || '', nextAction: '', nextActionDate: '',
    assessment: '', diagnosticStatus: 'pending',
  });
  const [activity, setActivity] = useState<Array<{id: string; action: string; createdAt: string}>>([]);
  const [activityError, setActivityError] = useState('');
  const preview = window.location.pathname.replace(/\/$/, '') === '/crm-preview';
  useEffect(() => {
    setActivity([]); setActivityError('');
    if (preview) return;
    return leadService.subscribeActivity(lead.id, setActivity, () => setActivityError('No pudimos cargar el historial.'));
  }, [lead.id, preview]);
  const baseRevision = useRef(lead.revision || 0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const [dirty, setDirty] = useState(false);
  const change = <K extends keyof LeadFollowUp>(key: K, value: LeadFollowUp[K]) => {
    if (!dirty) baseRevision.current = lead.revision || 0;
    setDraft(previous => ({ ...previous, [key]: value })); setDirty(true); setMessage('');
  };
  return (
    <section className="my-6 rounded-2xl border border-blue-100 bg-white p-4 sm:p-6" aria-labelledby="followup-title">
      <h2 id="followup-title" className="text-lg font-bold text-slate-950">Atención y diagnóstico interno</h2>
      <p className="mt-1 text-sm text-slate-600">Valoración privada del despacho, separada de lo declarado por el interesado.</p>
      <p className="mt-2 text-xs text-slate-500">Origen: {lead.source === 'contact' ? 'Contacto breve' : lead.source === 'diagnostic' ? 'Diagnóstico público' : lead.source === 'manual' ? 'Registro manual' : 'Registro anterior'}</p>
      <form className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={async event => {
        event.preventDefault(); if (saving) return;
        setSaving(true); setMessage(''); setFailed(false);
        try { await onSave(draft, baseRevision.current); setDirty(false); setMessage('Seguimiento guardado.'); }
        catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : 'No se pudo guardar. Conservamos tus cambios para reintentar.'); }
        finally { setSaving(false); }
      }}>
        <label className="text-sm font-medium text-slate-700">Responsable de atención
          <input required maxLength={120} disabled={saving} className="mt-1 w-full rounded-lg border border-slate-300 p-2" value={draft.responsibleName} onChange={event => change('responsibleName', event.target.value)} />
        </label>
        <label className="text-sm font-medium text-slate-700">Estado del diagnóstico
          <select disabled={saving} className="mt-1 w-full rounded-lg border border-slate-300 p-2" value={draft.diagnosticStatus} onChange={event => change('diagnosticStatus', event.target.value as LeadFollowUp['diagnosticStatus'])}>
            <option value="pending">Pendiente</option><option value="in_progress">En elaboración</option><option value="completed">Completado</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">Próxima acción
          <input required maxLength={500} disabled={saving} className="mt-1 w-full rounded-lg border border-slate-300 p-2" value={draft.nextAction} onChange={event => change('nextAction', event.target.value)} />
        </label>
        <label className="text-sm font-medium text-slate-700">Fecha de seguimiento
          <input required type="date" disabled={saving} className="mt-1 w-full rounded-lg border border-slate-300 p-2" value={draft.nextActionDate} onChange={event => change('nextActionDate', event.target.value)} />
        </label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">Valoración del profesional
          <textarea rows={4} maxLength={8000} required={draft.diagnosticStatus === 'completed'} disabled={saving} className="mt-1 w-full rounded-lg border border-slate-300 p-2" value={draft.assessment} onChange={event => change('assessment', event.target.value)} />
        </label>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button disabled={saving || !dirty} className="rounded-lg bg-[#0071ce] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" type="submit">{saving ? 'Guardando…' : 'Guardar seguimiento'}</button>
          <span role={failed ? 'alert' : 'status'} className={failed ? 'text-sm text-red-700' : 'text-sm text-slate-600'}>{message || (dirty ? 'Cambios sin guardar' : '')}</span>
        </div>
      </form>
      {!preview && <details className="mt-4 text-sm text-slate-600">
        <summary className="cursor-pointer">Historial de cambios ({activity.length})</summary>
        {activityError && <p role="alert">{activityError}</p>}
        <ul className="mt-2 space-y-1">{activity.map(item => <li key={item.id}>{new Date(item.createdAt).toLocaleString('es-VE')} · {item.action === 'created' ? 'Solicitud registrada' : 'Solicitud actualizada'}</li>)}</ul>
      </details>}
      {failed && baseRevision.current !== (lead.revision || 0) && <div className="mt-3 text-sm text-slate-700">
        <p>Revisa el último seguimiento guardado antes de volver a enviar tu borrador.</p>
        <button type="button" className="mt-2 rounded-lg border border-slate-300 px-3 py-2" onClick={() => {
          baseRevision.current = lead.revision || 0; setFailed(false); setMessage('Referencia actualizada. Tu borrador se conserva; pulsa Guardar seguimiento para enviarlo.');
        }}>Usar la versión actual como base</button>
      </div>}
      {lead.followUp && <details className="mt-4 text-sm text-slate-600"><summary className="cursor-pointer">Último seguimiento guardado</summary><p className="mt-2">{lead.followUp.responsibleName} · {lead.followUp.nextActionDate} · {lead.followUp.nextAction}</p><p className="whitespace-pre-wrap">{lead.followUp.assessment}</p></details>}
    </section>
  );
}
