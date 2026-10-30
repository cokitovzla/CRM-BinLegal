import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  Mail, 
  Phone, 
  FileText, 
  ArrowRight, 
  History, 
  UserRound, 
  CheckCircle2, 
  ChevronDown,
  Plus,
  Star,
  Copy,
  Check,
  Briefcase,
  Calendar,
  MessageSquare,
  ShieldCheck,
  ExternalLink,
  Layers,
  X
} from 'lucide-react';
import type { Lead, LegalProcess, InternalNote } from '../types';

interface Props { 
  company: string; 
  leads: Lead[]; 
  processes: LegalProcess[]; 
  onBack: () => void; 
  onOpenContact: (lead: Lead) => void; 
  onOpenProcess: (process: LegalProcess) => void; 
  onAddContact?: (newLead: Lead) => void;
  onAddNote?: (leadId: string, text: string, author: string) => void;
  onCreateProcess?: (companyName: string) => void;
}

const norm = (s?: string) => (s || '').trim().toLowerCase().replace(/\s+/g, ' ');

export const CompanyRecordView: React.FC<Props> = ({ 
  company, 
  leads, 
  processes, 
  onBack, 
  onOpenContact, 
  onOpenProcess,
  onAddContact,
  onAddNote,
  onCreateProcess
}) => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'processes' | 'notes'>('contacts');
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [processFilter, setProcessFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [showAddContactModal, setShowAddContactModal] = useState(false);

  // New Contact Form State
  const [newContactName, setNewContactName] = useState('');
  const [newContactJobTitle, setNewContactJobTitle] = useState('Representante Legal');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactIsPrimary, setNewContactIsPrimary] = useState(false);

  // Company Note State
  const [companyNoteText, setCompanyNoteText] = useState('');
  const [companyNoteAuthor, setCompanyNoteAuthor] = useState('Elena Marín');

  // Filter contacts belonging to this company
  const companyContacts = leads.filter(l => norm(l.company) === norm(company)).sort((a, b) => {
    // Primary contact first, then alphabetical
    if (a.isPrimaryContact && !b.isPrimaryContact) return -1;
    if (!a.isPrimaryContact && b.isPrimaryContact) return 1;
    return a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' });
  });

  const primaryContact = companyContacts.find(c => c.isPrimaryContact) || companyContacts[0];
  const companyIndustry = primaryContact?.industry || 'Sector no especificado';
  const companyStage = primaryContact?.stage || 'En crecimiento';
  const companyRif = primaryContact?.rif || 'No registrado';

  // Identify related processes for this company
  const emails = new Set(companyContacts.map(c => c.email.toLowerCase()));
  const names = new Set(companyContacts.map(c => c.fullName.toLowerCase()));
  const relatedProcesses = processes.filter(p => 
    norm(p.companyName) === norm(company) || 
    emails.has((p.clientEmail || '').toLowerCase()) || 
    names.has((p.clientName || '').toLowerCase())
  );

  const activeProcesses = relatedProcesses.filter(p => p.status !== 'completado');
  const completedProcesses = relatedProcesses.filter(p => p.status === 'completado');

  const visibleProcesses = relatedProcesses.filter(p => {
    if (processFilter === 'active') return p.status !== 'completado';
    if (processFilter === 'completed') return p.status === 'completado';
    return true;
  }).sort((a, b) => (a.status === 'completado' ? 1 : 0) - (b.status === 'completado' ? 1 : 0) || (b.updatedAt || '').localeCompare(a.updatedAt || ''));

  // Lead lawyer for this company account (most common or first assigned)
  const assignedLawyers = relatedProcesses.map(p => p.assignedLawyer).filter(Boolean);
  const primaryLawyer = assignedLawyers[0] || 'Elena Marín';

  // Gather internal notes from all contacts of this company
  const aggregatedNotes: Array<InternalNote & { contactName: string }> = [];
  companyContacts.forEach(contact => {
    (contact.internalNotes || []).forEach(note => {
      aggregatedNotes.push({
        ...note,
        contactName: contact.fullName
      });
    });
  });
  aggregatedNotes.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactEmail.trim()) return;

    const newLead: Lead = {
      id: `lead-contact-${Date.now()}`,
      fullName: newContactName.trim(),
      email: newContactEmail.trim(),
      phone: newContactPhone.trim() || undefined,
      company: company,
      jobTitle: newContactJobTitle.trim() || 'Contacto corporativo',
      isPrimaryContact: newContactIsPrimary || companyContacts.length === 0,
      rif: companyRif !== 'No registrado' ? companyRif : undefined,
      industry: companyIndustry,
      stage: companyStage,
      areasOfInterest: primaryContact?.areasOfInterest || ['Corporativo'],
      status: primaryContact?.status || 'cliente_activo',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      calculatedRiskScore: primaryContact?.calculatedRiskScore || 40,
      riskSummary: `Contacto corporativo incorporado a la cuenta ${company}.`,
      riskItems: [],
      internalNotes: [
        {
          id: `note-${Date.now()}`,
          author: companyNoteAuthor,
          text: `Contacto vinculado a ${company} como ${newContactJobTitle}.`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
        }
      ]
    };

    if (onAddContact) {
      onAddContact(newLead);
    }
    setShowAddContactModal(false);
    setNewContactName('');
    setNewContactEmail('');
    setNewContactPhone('');
    setNewContactJobTitle('Representante Legal');
    setNewContactIsPrimary(false);
  };

  const handleAddCompanyNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyNoteText.trim() || !primaryContact || !onAddNote) return;
    onAddNote(primaryContact.id, companyNoteText.trim(), companyNoteAuthor);
    setCompanyNoteText('');
  };

  return (
    <div className="w-full min-w-0 space-y-6">
      
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button 
          type="button" 
          onClick={onBack} 
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:text-[#0071ce] hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> 
          <span>Volver al directorio</span>
        </button>
        <span className="text-xs text-slate-500 font-mono">
          Empresa ID · {company.replace(/\s+/g, '-').toLowerCase()}
        </span>
      </div>

      {/* Corporate Profile Header Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0071ce]/10 text-[#0071ce] border border-[#0071ce]/20">
              <Building2 className="h-7 w-7" />
            </div>
            
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0071ce] bg-blue-50 px-2 py-0.5 rounded">
                  Perfil Corporativo
                </span>
                {companyRif && companyRif !== 'No registrado' && (
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    RIF: {companyRif}
                  </span>
                )}
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  activeProcesses.length > 0 || companyContacts.some(c => c.status === 'cliente_activo')
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {activeProcesses.length > 0 || companyContacts.some(c => c.status === 'cliente_activo')
                    ? 'Cliente Corporativo Activo'
                    : 'Cuenta en Prospección'}
                </span>
              </div>

              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#0b192c] tracking-tight truncate">
                {company}
              </h1>

              <p className="mt-1 text-sm text-slate-500 flex flex-wrap items-center gap-2">
                <span>{companyIndustry}</span>
                <span>•</span>
                <span className="font-mono text-xs">{companyStage}</span>
                <span>•</span>
                <span className="text-slate-600 font-medium">Asesor asignado: {primaryLawyer}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
              <div className="text-center px-3 py-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Contactos</div>
                <div className="text-xl font-bold text-slate-900 tabular-nums">{companyContacts.length}</div>
              </div>
              <div className="text-center px-3 py-1 border-x border-slate-200">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#0071ce]">Activos</div>
                <div className="text-xl font-bold text-[#0071ce] tabular-nums">{activeProcesses.length}</div>
              </div>
              <div className="text-center px-3 py-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Cerrados</div>
                <div className="text-xl font-bold text-emerald-700 tabular-nums">{completedProcesses.length}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddContactModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0071ce] hover:bg-[#0060b0] text-white px-4 py-2.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Añadir contacto</span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs inside Company */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'contacts'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Contactos de la empresa ({companyContacts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('processes')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'processes'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Expedientes y Trámites ({relatedProcesses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'notes'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Bitácora y Notas internas ({aggregatedNotes.length})</span>
          </button>
        </div>
      </section>

      {/* TAB 1: CONTACTS (Relación 1 a N) */}
      {activeTab === 'contacts' && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Contactos y Representantes de {company}
              </h2>
              <p className="text-xs text-slate-500">
                Cada persona tiene su ficha particular y rol específico dentro de la empresa.
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => setShowAddContactModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0071ce] hover:underline cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Vincular otra persona</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companyContacts.map((contact) => {
              const contactProcesses = processes.filter(p => 
                (p.clientEmail || '').toLowerCase() === contact.email.toLowerCase() ||
                (p.clientName || '').toLowerCase() === contact.fullName.toLowerCase()
              );
              const activeCount = contactProcesses.filter(p => p.status !== 'completado').length;

              return (
                <div
                  key={contact.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-[#0071ce]/50 transition-all flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-sm">
                          {contact.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 truncate flex items-center gap-2">
                            <span>{contact.fullName}</span>
                          </h3>
                          <div className="text-xs font-medium text-slate-600 truncate">
                            {contact.jobTitle || 'Representante corporativo'}
                          </div>
                        </div>
                      </div>

                      {contact.isPrimaryContact && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>Contacto Principal</span>
                        </span>
                      )}
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-slate-500 truncate">
                          <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{contact.email || 'Sin correo'}</span>
                        </span>
                        {contact.email && (
                          <button
                            type="button"
                            onClick={() => handleCopyEmail(contact.email)}
                            className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors"
                            title="Copiar correo"
                          >
                            {copiedEmail === contact.email ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span>{contact.phone || 'Sin teléfono registrado'}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Trámites a su nombre: <strong className="text-slate-800">{activeCount} activos</strong> ({contactProcesses.length} total)</span>
                      <span className="text-slate-400 font-mono">{contact.createdAt.slice(0, 10)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => onOpenContact(contact)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <span>Ver ficha individual</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 2: PROCESSES & LEGAL WORKFLOW */}
      {activeTab === 'processes' && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Expedientes e Historial de {company}
              </h2>
              <p className="text-xs text-slate-500">
                Seguimiento de trámites societarios, marcas, contratos y permisos.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
              {onCreateProcess && (
                <button
                  type="button"
                  onClick={() => onCreateProcess(company)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0071ce] hover:bg-[#005ba7] px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Expediente</span>
                </button>
              )}

              {/* Subfilters */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setProcessFilter('all')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  processFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos ({relatedProcesses.length})
              </button>
              <button
                type="button"
                onClick={() => setProcessFilter('active')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  processFilter === 'active' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Activos ({activeProcesses.length})
              </button>
              <button
                type="button"
                onClick={() => setProcessFilter('completed')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  processFilter === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completados ({completedProcesses.length})
              </button>
            </div>
          </div>
        </div>

          <div className="space-y-3">
            {visibleProcesses.map((proc) => {
              const isCompleted = proc.status === 'completado';
              const isExpanded = expandedHistory === proc.id;

              return (
                <article
                  key={proc.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {proc.title}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isCompleted 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}>
                          {isCompleted ? 'Completado' : proc.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          ID: {proc.id}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                          {proc.category}
                        </span>
                        <span>•</span>
                        <span>Contacto solicitante: <strong>{proc.clientName || proc.clientEmail || 'No indicado'}</strong></span>
                        <span>•</span>
                        <span>Abogado líder: <strong>{proc.assignedLawyer || 'Sin asignar'}</strong></span>
                      </div>

                      {/* Progress Bar & Next Milestone */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                          <span className="text-slate-500">Avance: <strong className="text-slate-900">{proc.progress || 0}%</strong></span>
                          <span className="text-slate-500">Próximo hito: <span className="font-normal text-slate-700">{proc.nextMilestone || 'No definido'}</span></span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${isCompleted ? 'bg-emerald-600' : 'bg-[#0071ce]'}`}
                            style={{ width: `${Math.max(0, Math.min(100, proc.progress || 0))}%` }}
                          />
                        </div>
                      </div>

                      {/* Associated Documents preview */}
                      {proc.documents && proc.documents.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-2 items-center">
                          <span className="text-[11px] font-semibold text-slate-400">Documentos:</span>
                          {proc.documents.map((doc, idx) => (
                            <span 
                              key={idx}
                              className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded text-[11px] text-slate-700 font-mono"
                            >
                              <FileText className="w-3 h-3 text-[#0071ce]" />
                              <span>{doc.name}</span>
                              <span className="text-emerald-700 text-[10px]">
                                ({doc.status === 'aprobado' ? 'Aprobado' : doc.status})
                              </span>
                            </span>
                          ))}
                        </div>
                      )}

                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                      <button
                        type="button"
                        onClick={() => setExpandedHistory(isExpanded ? null : proc.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5 text-slate-500" />
                        <span>{isExpanded ? 'Ocultar historial' : 'Trazabilidad'}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenProcess(proc)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b192c] hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir expediente</span>
                      </button>
                    </div>

                  </div>

                  {/* Expanded History Section */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/70 p-4 rounded-xl space-y-4">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-1.5">
                          <History className="w-4 h-4 text-[#0071ce]" />
                          Línea de tiempo del expediente
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          Creado: {proc.createdAt || 'N/D'} · Actualizado: {proc.updatedAt || 'N/D'}
                        </span>
                      </div>

                      {/* Activity History or Milestones */}
                      <div className="space-y-3 pl-2 border-l-2 border-[#0071ce]/30 ml-2">
                        {proc.activityHistory && proc.activityHistory.length > 0 ? (
                          proc.activityHistory.map((item, idx) => (
                            <div key={item.id || idx} className="text-xs space-y-1">
                              <div className="flex items-center justify-between text-slate-800 font-semibold">
                                <span>{item.title}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{item.date}</span>
                              </div>
                              <p className="text-slate-600 text-[11px]">{item.description}</p>
                              <div className="text-[10px] text-slate-400">
                                Por: <strong className="text-slate-600">{item.actor}</strong> ({item.role})
                              </div>
                            </div>
                          ))
                        ) : proc.milestones && proc.milestones.length > 0 ? (
                          proc.milestones.map((m, idx) => (
                            <div key={idx} className="text-xs space-y-0.5">
                              <div className="flex items-center justify-between text-slate-800 font-semibold">
                                <span>{m.title}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{m.date}</span>
                              </div>
                              <p className="text-slate-600 text-[11px]">{m.note}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic">No hay registros de actividad previa en este expediente.</p>
                        )}
                      </div>
                    </div>
                  )}

                </article>
              );
            })}

            {visibleProcesses.length === 0 && (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 space-y-3">
                <FileText className="mx-auto h-8 w-8 text-slate-300" />
                <div>
                  <p className="text-sm font-bold text-slate-800">No hay expedientes en esta categoría</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Apertura un trámite legal para {company} para registrar tareas, documentos y avances en vivo.
                  </p>
                </div>
                {onCreateProcess && (
                  <button
                    type="button"
                    onClick={() => onCreateProcess(company)}
                    className="inline-flex items-center gap-2 bg-[#0071ce] hover:bg-[#005ba7] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>⚡ Aperturar Expediente para {company}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 3: COMPANY NOTES & SHARED LOG */}
      {activeTab === 'notes' && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Add Note Form */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs h-fit space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#0071ce]" />
              <h2 className="text-sm font-bold text-slate-900">Nueva Nota para {company}</h2>
            </div>
            <p className="text-xs text-slate-500">
              Registra acuerdos corporativos, particularidades societarias o instrucciones confidenciales del despacho.
            </p>

            <form onSubmit={handleAddCompanyNote} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Autor de la nota</label>
                <input
                  type="text"
                  value={companyNoteAuthor}
                  onChange={(e) => setCompanyNoteAuthor(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071ce]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Contenido</label>
                <textarea
                  rows={4}
                  value={companyNoteText}
                  onChange={(e) => setCompanyNoteText(e.target.value)}
                  placeholder="Detalles sobre acuerdos de tarifas, asambleas de socios, poderes vigentes..."
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071ce]"
                />
              </div>

              <button
                type="submit"
                disabled={!companyNoteText.trim()}
                className="w-full rounded-lg bg-[#0071ce] hover:bg-[#0060b0] text-white py-2 text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                Guardar nota en la cuenta
              </button>
            </form>
          </div>

          {/* Aggregated Notes Stream */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Bitácora de Notas y Acuerdos</span>
              <span className="text-xs font-normal text-slate-500">
                {aggregatedNotes.length} notas registradas
              </span>
            </h2>

            <div className="divide-y divide-slate-100">
              {aggregatedNotes.map((note) => (
                <div key={note.id} className="py-3.5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{note.author}</span>
                    <span className="text-[11px] font-mono text-slate-400">{note.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {note.text}
                  </p>
                  <div className="text-[10px] text-slate-400">
                    Vía contacto: <strong className="text-slate-600">{note.contactName}</strong>
                  </div>
                </div>
              ))}

              {aggregatedNotes.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400 italic">
                  No hay notas registradas para esta empresa aún. Usa el formulario de la izquierda para agregar la primera.
                </div>
              )}
            </div>
          </div>

        </section>
      )}

      {/* MODAL: ADD CONTACT TO COMPANY */}
      {showAddContactModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowAddContactModal(false)}
        >
          <div 
            className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-6 relative animate-in zoom-in-95 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Vincular Contacto a {company}
                </h3>
                <p className="text-xs text-slate-500">
                  Añade un socio, apoderado o responsable operativo a esta empresa.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddContactModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Nombre completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ing. Daniel Ortega"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:outline-none focus:border-[#0071ce]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Cargo / Rol en la empresa *</label>
                  <select
                    value={newContactJobTitle}
                    onChange={(e) => setNewContactJobTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:outline-none focus:border-[#0071ce]"
                  >
                    <option value="Socio / Accionista">Socio / Accionista</option>
                    <option value="Socia Fundadora & Directora General">Socia Fundadora & Directora General</option>
                    <option value="Director General & Co-Fundador">Director General & Co-Fundador</option>
                    <option value="Representante Legal">Representante Legal</option>
                    <option value="Gerente de Operaciones & Distribución">Gerente de Operaciones & Distribución</option>
                    <option value="Gerente de Administración & Finanzas">Gerente de Administración & Finanzas</option>
                    <option value="Apoderado Especial">Apoderado Especial</option>
                    <option value="Consultor / Asesor">Consultor / Asesor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="+58 412 123 4567"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:outline-none focus:border-[#0071ce]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Correo corporativo / personal *</label>
                <input
                  type="email"
                  required
                  placeholder="contacto@empresa.com"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:outline-none focus:border-[#0071ce]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="primaryContactCheckbox"
                  checked={newContactIsPrimary}
                  onChange={(e) => setNewContactIsPrimary(e.target.checked)}
                  className="rounded text-[#0071ce] focus:ring-[#0071ce]"
                />
                <label htmlFor="primaryContactCheckbox" className="text-slate-700 cursor-pointer">
                  Designar como <strong>Contacto Principal</strong> para notificaciones y firmas
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0071ce] hover:bg-[#0060b0] text-white font-semibold shadow-xs"
                >
                  Guardar y Vincular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
