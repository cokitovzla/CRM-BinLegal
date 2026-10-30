import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  CalendarDays, 
  CheckCircle2, 
  CircleAlert, 
  FileText, 
  Mail, 
  MessageSquare, 
  Phone, 
  UserRound, 
  Workflow,
  Copy,
  Check,
  Star,
  ExternalLink,
  Users,
  ArrowRight,
  Plus
} from 'lucide-react';
import type { Lead, LegalProcess } from '../types';

interface ClientRecordViewProps {
  lead: Lead;
  processes: LegalProcess[];
  allLeads?: Lead[];
  onBack: () => void;
  onBackLabel?: string;
  onOpenProcess: (process: LegalProcess) => void;
  onOpenCompany: (company: string) => void;
  onOpenContact?: (contact: Lead) => void;
  onAddNote: (leadId: string, text: string, author: string) => void;
  onCreateProcess?: (lead: Lead) => void;
}

const norm = (s?: string) => (s || '').trim().toLowerCase().replace(/\s+/g, ' ');

export const ClientRecordView: React.FC<ClientRecordViewProps> = ({ 
  lead, 
  processes, 
  allLeads = [],
  onBack, 
  onBackLabel = 'Volver al directorio',
  onOpenProcess, 
  onAddNote, 
  onOpenCompany,
  onOpenContact,
  onCreateProcess
}) => {
  const [note, setNote] = useState('');
  const [author, setAuthor] = useState('Elena Marín');
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Processes linked directly to this person or their company
  const clientProcesses = processes.filter(p =>
    (p.clientEmail || '').toLowerCase() === lead.email.toLowerCase() ||
    (p.clientName || '').toLowerCase() === lead.fullName.toLowerCase() ||
    (p.companyName && norm(p.companyName) === norm(lead.company))
  );

  const isActive = lead.status === 'cliente_activo';

  // Find other colleagues in the same company
  const companyColleagues = allLeads.filter(l => 
    l.id !== lead.id && 
    norm(l.company) === norm(lead.company) && 
    lead.company.trim().length > 0
  );

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="w-full min-w-0 space-y-6 text-[#3e4543]">
      
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack} 
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:text-[#0071ce] hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{onBackLabel}</span>
        </button>

        <span className="text-xs text-slate-500 font-mono">
          Contacto ID · {lead.id}
        </span>
      </div>

      {/* Main Profile Header Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0071ce]/10 text-[#0071ce] border border-[#0071ce]/20 text-xl font-bold font-mono">
              {lead.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0071ce] bg-blue-50 px-2 py-0.5 rounded">
                  Ficha Individual
                </span>
                {lead.isPrimaryContact && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-amber-200">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>Contacto Principal</span>
                  </span>
                )}
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {isActive ? 'Cliente Activo' : 'Contacto Registrado'}
                </span>
              </div>

              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#0b192c] tracking-tight truncate">
                {lead.fullName}
              </h1>

              <div className="mt-1 text-sm text-slate-600 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-800">{lead.jobTitle || 'Representante'}</span>
                <span>en</span>
                {lead.company ? (
                  <button 
                    type="button" 
                    onClick={() => onOpenCompany(lead.company)}
                    className="font-bold text-[#0071ce] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{lead.company}</span>
                  </button>
                ) : (
                  <span>Particular</span>
                )}
                {lead.rif && (
                  <span className="font-mono text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    RIF: {lead.rif}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <div className="text-center px-4 py-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Expedientes</div>
                <div className="text-xl font-bold text-slate-900 tabular-nums">{clientProcesses.length}</div>
              </div>
              <div className="text-center px-4 py-1 border-l border-slate-200">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#0071ce]">Trámites Activos</div>
                <div className="text-xl font-bold text-[#0071ce] tabular-nums">
                  {clientProcesses.filter(p => p.status !== 'completado').length}
                </div>
              </div>
            </div>

            {onCreateProcess && (
              <button
                type="button"
                onClick={() => onCreateProcess(lead)}
                className="inline-flex items-center justify-center gap-2 bg-[#0071ce] hover:bg-[#005ba7] text-white px-4 py-3 rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer h-full"
                title="Convertir esta solicitud o cliente en un expediente formal sin duplicidad de datos"
              >
                <Workflow className="w-4 h-4" />
                <span>Abrir Expediente</span>
              </button>
            )}
          </div>

        </div>
      </section>

      {/* Information Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Contact details & Company Card */}
        <div className="space-y-6">
          
          {/* Company Context card */}
          {lead.company && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Empresa / Organización
                </span>
                <button
                  type="button"
                  onClick={() => onOpenCompany(lead.company)}
                  className="text-xs font-semibold text-[#0071ce] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Abrir empresa</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Building2 className="w-5 h-5 text-[#0071ce]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">{lead.company}</h3>
                  <p className="text-xs text-slate-500">{lead.industry} · {lead.stage}</p>
                </div>
              </div>

              {/* Other contacts in the same company */}
              {companyColleagues.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Otros contactos de {lead.company}:</span>
                  </p>
                  <div className="space-y-1.5">
                    {companyColleagues.map(colleague => (
                      <div 
                        key={colleague.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{colleague.fullName}</p>
                          <p className="text-[11px] text-slate-500 truncate">{colleague.jobTitle || 'Contacto'}</p>
                        </div>
                        {onOpenContact && (
                          <button
                            type="button"
                            onClick={() => onOpenContact(colleague)}
                            className="text-[#0071ce] hover:underline text-xs font-semibold shrink-0 cursor-pointer ml-2"
                          >
                            Ver ficha →
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Direct Contact info */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Datos de Comunicación
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Correo</div>
                    <div className="font-semibold text-slate-800 truncate">{lead.email}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyEmail(lead.email)}
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-500"
                  title="Copiar correo"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Teléfono</div>
                  <div className="font-semibold text-slate-800">{lead.phone || 'No registrado'}</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Fecha de Alta</div>
                  <div className="font-semibold text-slate-800 font-mono">{lead.createdAt}</div>
                </div>
              </div>
            </div>

            {/* Areas of interest */}
            <div className="pt-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Áreas de Asesoría
              </p>
              <div className="flex flex-wrap gap-1.5">
                {lead.areasOfInterest.map(area => (
                  <span key={area} className="rounded-md bg-slate-100 text-slate-700 px-2 py-1 text-xs font-medium">
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {lead.notes && (
              <div className="pt-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Contexto Inicial de la Solicitud
                </p>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                  {lead.notes}
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Expedientes y Trámites + Notas Internas */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Process List */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 px-5 py-4 gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Expedientes y Trámites Vinculados</h2>
                <p className="text-xs text-slate-500">Trámites a cargo de este contacto o de su empresa.</p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                  {clientProcesses.length} {clientProcesses.length === 1 ? 'expediente' : 'expedientes'}
                </span>
                {onCreateProcess && (
                  <button
                    type="button"
                    onClick={() => onCreateProcess(lead)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0071ce] hover:bg-[#005ba7] px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nuevo Expediente</span>
                  </button>
                )}
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {clientProcesses.map(proc => (
                <div key={proc.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0 space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">{proc.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        proc.status === 'completado' 
                          ? 'bg-emerald-50 text-emerald-800' 
                          : 'bg-blue-50 text-blue-800'
                      }`}>
                        {proc.status === 'completado' ? 'Completado' : proc.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      {proc.category} • Responsable: <strong className="text-slate-700">{proc.assignedLawyer || 'Sin asignar'}</strong>
                    </p>

                    <div className="pt-1 flex items-center gap-3">
                      <div className="w-36 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#0071ce] rounded-full" 
                          style={{ width: `${Math.max(0, Math.min(100, proc.progress))}%` }} 
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-700">{proc.progress}%</span>
                      <span className="text-xs text-slate-500 truncate">{proc.nextMilestone}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => onOpenProcess(proc)} 
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#0b192c] hover:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white shadow-xs cursor-pointer transition-colors"
                  >
                    <Workflow className="h-3.5 w-3.5" />
                    <span>Abrir expediente</span>
                  </button>
                </div>
              ))}

              {clientProcesses.length === 0 && (
                <div className="p-8 text-center space-y-3">
                  <FileText className="mx-auto h-7 w-7 text-slate-300" />
                  <div>
                    <p className="text-xs font-bold text-slate-700">Sin expedientes abiertos aún</p>
                    <p className="text-xs text-slate-500 mt-0.5">Apertura el primer trámite formal para transferir automáticamente el diagnóstico y comenzar el seguimiento.</p>
                  </div>
                  {onCreateProcess && (
                    <button
                      type="button"
                      onClick={() => onCreateProcess(lead)}
                      className="inline-flex items-center gap-2 bg-[#0071ce] hover:bg-[#005ba7] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Workflow className="w-3.5 h-3.5" />
                      <span>⚡ Abrir Primer Expediente</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Internal Notes Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#0071ce]" />
                <h2 className="text-sm font-bold text-slate-900">Notas Internas Confidenciales</h2>
              </div>
              <span className="text-xs text-slate-400">Solo visible para el equipo JurisNova</span>
            </div>

            <form 
              onSubmit={e => {
                e.preventDefault(); 
                if (!note.trim()) return; 
                onAddNote(lead.id, note.trim(), author); 
                setNote('');
              }} 
              className="space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Autor</label>
                  <input 
                    value={author} 
                    onChange={e => setAuthor(e.target.value)} 
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071ce]" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Nueva nota de seguimiento</label>
                <textarea 
                  value={note} 
                  onChange={e => setNote(e.target.value)} 
                  rows={3} 
                  placeholder="Detalles sobre acuerdos, llamadas telefónicas o compromisos..." 
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071ce]" 
                />
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={!note.trim()} 
                  className="rounded-lg bg-[#0071ce] hover:bg-[#0060b0] px-4 py-2 text-xs font-semibold text-white shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Guardar nota
                </button>
              </div>
            </form>

            <div className="space-y-3 pt-3 border-t border-slate-100">
              {[...(lead.internalNotes || [])].reverse().map(item => (
                <div key={item.id} className="border-l-2 border-[#0071ce] pl-3 py-1 space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{item.author}</span>
                    <span className="text-[11px] font-mono text-slate-400">{item.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap">{item.text}</p>
                </div>
              ))}

              {!lead.internalNotes?.length && (
                <p className="text-xs text-slate-400 italic">No hay notas registradas para este contacto.</p>
              )}
            </div>
          </div>

        </div>

      </section>

    </div>
  );
};
