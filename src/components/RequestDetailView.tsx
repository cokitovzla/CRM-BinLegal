import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Mail, 
  Phone, 
  UserRound, 
  Workflow, 
  AlertTriangle, 
  Plus, 
  Download, 
  Trash2, 
  ExternalLink, 
  FolderKanban, 
  Check, 
  Send, 
  Briefcase, 
  FileSpreadsheet, 
  ChevronRight,
  ShieldCheck,
  Tag,
  Paperclip
} from 'lucide-react';
import type { 
  Lead, 
  LeadStatus, 
  LegalProcess, 
  LeadBudget, 
  LeadBudgetItem, 
  LeadDocument, 
  LegalArea 
} from '../types';

interface RequestDetailViewProps {
  lead: Lead;
  lawyers: string[];
  processes: LegalProcess[];
  allLeads?: Lead[];
  onBack: () => void;
  onBackLabel?: string;
  onUpdateLeadStatus: (leadId: string, newStatus: LeadStatus) => void;
  onUpdateLeadLawyer: (leadId: string, lawyer: string) => void;
  onUpdateLeadBudget: (leadId: string, budget: LeadBudget) => void;
  onAddLeadDocument: (leadId: string, doc: LeadDocument) => void;
  onUpdateLeadDocumentStatus: (leadId: string, docId: string, status: LeadDocument['status']) => void;
  onAddNote: (leadId: string, text: string, author: string) => void;
  onCreateProcess: (newProcess: LegalProcess, options: { markAsActive: boolean; addNote: boolean; leadId?: string }) => void;
  onOpenProcess: (process: LegalProcess) => void;
  onOpenCompany?: (company: string) => void;
}

const PIPELINE_STAGES: Array<{
  id: LeadStatus;
  stepNumber: number;
  label: string;
  shortDesc: string;
}> = [
  { id: 'nuevo_lead', stepNumber: 1, label: 'Nueva sin atender', shortDesc: 'Pendiente de primera revisión' },
  { id: 'diagnostico_enviado', stepNumber: 2, label: 'En seguimiento', shortDesc: 'Evaluada y en contacto' },
  { id: 'sesion_programada', stepNumber: 3, label: 'Reunión agendada', shortDesc: 'Sesión o llamada pautada' },
  { id: 'propuesta_presentada', stepNumber: 4, label: 'Propuesta enviada', shortDesc: 'Presupuesto remitido al cliente' },
  { id: 'cliente_activo', stepNumber: 5, label: 'Cliente activo', shortDesc: 'Expediente formalizado' }
];

const PREDEFINED_SERVICES: Array<{
  concept: string;
  area: LegalArea;
  suggestedPrice: number;
}> = [
  { concept: 'Constitución o Reestructuración de Sociedad Mercantil (C.A. / S.A.S.)', area: 'Corporativo', suggestedPrice: 450 },
  { concept: 'Redacción de Pacto de Socios y Acuerdo de Accionistas (Vesting & Drag-Along)', area: 'Corporativo', suggestedPrice: 380 },
  { concept: 'Búsqueda Fonética y Registro de Marca ante SAPI (por clase)', area: 'Propiedad Intelectual', suggestedPrice: 280 },
  { concept: 'Auditoría y Redacción de Contratos de Trabajo y Cláusulas de Confidencialidad', area: 'Laboral', suggestedPrice: 320 },
  { concept: 'Adecuación de Términos, Condiciones y Políticas de Privacidad Web / App', area: 'Regulatorio', suggestedPrice: 260 },
  { concept: 'Mediación Mercantil Extrajudicial y Redacción de Acuerdo Transaccional', area: 'Mediación', suggestedPrice: 350 },
  { concept: 'Gestión Registral de Asambleas de Accionistas o Modificación de Estatutos', area: 'Corporativo', suggestedPrice: 290 }
];

export const RequestDetailView: React.FC<RequestDetailViewProps> = ({
  lead,
  lawyers,
  processes,
  onBack,
  onBackLabel = 'Volver a solicitudes',
  onUpdateLeadStatus,
  onUpdateLeadLawyer,
  onUpdateLeadBudget,
  onAddLeadDocument,
  onUpdateLeadDocumentStatus,
  onAddNote,
  onCreateProcess,
  onOpenProcess,
  onOpenCompany
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'budget' | 'documents' | 'history'>('summary');
  
  // Assigned lawyer state
  const currentLawyer = lead.assignedLawyer || lawyers[0] || 'José Rafael Vásquez';

  // Find linked legal process if already created
  const linkedProcess = processes.find(p => 
    p.id === lead.linkedProcessId ||
    (p.clientEmail && p.clientEmail.toLowerCase() === lead.email.toLowerCase()) ||
    (lead.company && p.companyName && p.companyName.trim().toLowerCase() === lead.company.trim().toLowerCase())
  );

  // In-line Process Creation State (No modal popup needed!)
  const [showProcessForm, setShowProcessForm] = useState(false);
  const [processTitle, setProcessTitle] = useState(() => {
    const area = lead.areasOfInterest[0] || 'Asesoría Legal Estratégica';
    return `${area} - ${lead.company || lead.fullName}`;
  });
  const [processCategory, setProcessCategory] = useState<LegalProcess['category']>(() => {
    const map: Record<string, LegalProcess['category']> = {
      'Corporativo': 'Corporativo',
      'Propiedad Intelectual': 'Propiedad Intelectual',
      'Regulatorio': 'Regulatorio',
      'Laboral': 'Laboral',
      'Contratos': 'Contratos',
      'Mediación': 'Mediación'
    };
    return map[lead.areasOfInterest[0]] || 'Corporativo';
  });
  const [processLawyer, setProcessLawyer] = useState(currentLawyer);
  const [processTargetDate, setProcessTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d.toISOString().slice(0, 10);
  });
  const [processMilestone, setProcessMilestone] = useState('Revisión inicial y recopilación de recaudos');

  // Budget management state
  const [budgetItems, setBudgetItems] = useState<LeadBudgetItem[]>(() => lead.budget?.items || [
    {
      id: 'item-1',
      concept: `Asesoría inicial en ${lead.areasOfInterest[0] || 'Corporativo'} para ${lead.company || lead.fullName}`,
      area: lead.areasOfInterest[0] || 'Corporativo',
      quantity: 1,
      unitPrice: 350
    }
  ]);
  const [budgetCurrency, setBudgetCurrency] = useState<'USD' | 'EUR' | 'VES'>(() => lead.budget?.currency || 'USD');
  const [budgetDiscount, setBudgetDiscount] = useState<number>(() => lead.budget?.discount || 0);
  const [budgetNotes, setBudgetNotes] = useState<string>(() => lead.budget?.notes || 'Condición de pago: 50% de anticipo al inicio de gestiones y 50% a la entrega del instrumento formal registrado.');
  const [budgetStatus, setBudgetStatus] = useState<LeadBudget['status']>(() => lead.budget?.status || 'borrador');
  const [catalogSelection, setCatalogSelection] = useState<string>('');

  // Document library state
  const [documents, setDocuments] = useState<LeadDocument[]>(() => lead.documents || [
    {
      id: 'doc-init-1',
      name: `Cédula_Representante_${lead.fullName.replace(/\s+/g, '_')}.pdf`,
      category: 'Identificación Legal',
      status: 'aprobado',
      uploadDate: lead.createdAt.slice(0, 10),
      size: '1.1 MB'
    },
    {
      id: 'doc-init-2',
      name: `RIF_Actualizado_${(lead.rif || lead.company).replace(/\s+/g, '_')}.pdf`,
      category: 'Fiscal',
      status: 'recibido',
      uploadDate: lead.createdAt.slice(0, 10),
      size: '850 KB'
    }
  ]);
  const [newDocName, setNewDocName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('Recaudo General');

  // Notes state
  const [newNoteText, setNewNoteText] = useState('');
  const [noteAuthor, setNoteAuthor] = useState(currentLawyer);

  // Calculations for budget
  const subtotal = budgetItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const total = Math.max(0, subtotal - (Number(budgetDiscount) || 0));

  // Current stage index in pipeline
  const currentStageIndex = PIPELINE_STAGES.findIndex(s => s.id === lead.status);
  const nextStage = currentStageIndex >= 0 && currentStageIndex < PIPELINE_STAGES.length - 1 
    ? PIPELINE_STAGES[currentStageIndex + 1] 
    : null;

  const handleStageSelect = (stageId: LeadStatus) => {
    onUpdateLeadStatus(lead.id, stageId);
  };

  const handleAdvanceToNext = () => {
    if (nextStage) {
      onUpdateLeadStatus(lead.id, nextStage.id);
    }
  };

  const handleLawyerChange = (lawyer: string) => {
    onUpdateLeadLawyer(lead.id, lawyer);
    setProcessLawyer(lawyer);
    onAddNote(lead.id, `Abogado responsable asignado: ${lawyer}`, 'Sistema');
  };

  const handleAddBudgetItem = () => {
    if (!catalogSelection) return;
    const found = PREDEFINED_SERVICES.find(s => s.concept === catalogSelection);
    if (found) {
      const newItem: LeadBudgetItem = {
        id: `bi-${Date.now()}`,
        concept: found.concept,
        area: found.area,
        quantity: 1,
        unitPrice: found.suggestedPrice
      };
      const updated = [...budgetItems, newItem];
      setBudgetItems(updated);
      saveBudget(updated, budgetDiscount, budgetNotes, budgetStatus);
      setCatalogSelection('');
    }
  };

  const handleRemoveBudgetItem = (id: string) => {
    const updated = budgetItems.filter(item => item.id !== id);
    setBudgetItems(updated);
    saveBudget(updated, budgetDiscount, budgetNotes, budgetStatus);
  };

  const saveBudget = (
    items: LeadBudgetItem[], 
    discount: number, 
    notes: string, 
    status: LeadBudget['status']
  ) => {
    const newBudget: LeadBudget = {
      items,
      currency: budgetCurrency,
      discount: Number(discount) || 0,
      notes,
      status,
      createdAt: lead.budget?.createdAt || new Date().toISOString().slice(0, 10),
      validUntil: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10)
    };
    onUpdateLeadBudget(lead.id, newBudget);
  };

  const handleBudgetStatusChange = (newStatus: LeadBudget['status']) => {
    setBudgetStatus(newStatus);
    saveBudget(budgetItems, budgetDiscount, budgetNotes, newStatus);
    onAddNote(lead.id, `Estatus del presupuesto actualizado a: "${newStatus.toUpperCase()}"`, noteAuthor);
    
    // If budget approved, automatically suggest or advance to proposal stage
    if (newStatus === 'aprobado' && lead.status !== 'cliente_activo') {
      onUpdateLeadStatus(lead.id, 'propuesta_presentada');
    }
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    const doc: LeadDocument = {
      id: `doc-${Date.now()}`,
      name: newDocName.trim().endsWith('.pdf') ? newDocName.trim() : `${newDocName.trim()}.pdf`,
      category: newDocCategory,
      status: 'recibido',
      uploadDate: new Date().toISOString().slice(0, 10),
      size: '1.4 MB'
    };
    const updated = [doc, ...documents];
    setDocuments(updated);
    onAddLeadDocument(lead.id, doc);
    setNewDocName('');
    onAddNote(lead.id, `Recaudo anexado a la solicitud: "${doc.name}" (${doc.category})`, noteAuthor);
  };

  const handleDocStatusChange = (docId: string, status: LeadDocument['status']) => {
    const updated = documents.map(d => d.id === docId ? { ...d, status } : d);
    setDocuments(updated);
    onUpdateLeadDocumentStatus(lead.id, docId, status);
  };

  const handleCreateProcessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!processTitle.trim()) return;

    const newProc: LegalProcess = {
      id: `proc-${Date.now()}`,
      userId: lead.id,
      clientEmail: lead.email,
      clientName: lead.fullName,
      companyName: lead.company || lead.fullName,
      title: processTitle.trim(),
      category: processCategory,
      status: 'recaudos',
      progress: 15,
      assignedLawyer: processLawyer,
      targetDate: processTargetDate,
      nextMilestone: processMilestone.trim() || 'Auditoría inicial de recaudos societarios',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      openedBy: noteAuthor,
      documents: documents.map(d => ({
        name: d.name,
        category: d.category,
        date: d.uploadDate,
        status: d.status === 'aprobado' ? 'aprobado' : d.status === 'en_revision' ? 'en_revision' : 'pendiente'
      })),
      activityHistory: [
        {
          id: `act-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          title: 'Apertura formal de expediente',
          description: `Expediente generado a partir de la solicitud ${lead.id}. Abogado asignado: ${processLawyer}.`,
          actor: noteAuthor,
          role: 'Abogado Director'
        }
      ]
    };

    onCreateProcess(newProc, {
      markAsActive: true,
      addNote: true,
      leadId: lead.id
    });
    setShowProcessForm(false);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote(lead.id, newNoteText.trim(), noteAuthor);
    setNewNoteText('');
  };

  return (
    <div className="w-full min-w-0 space-y-5 text-[#3e4543]">
      
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:text-[#0071ce] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{onBackLabel}</span>
          </button>
          
          <span className="hidden sm:inline text-slate-300">/</span>
          
          <div className="text-xs text-slate-500 font-medium truncate">
            <span>Solicitud: </span>
            <strong className="text-slate-900 font-semibold">{lead.company || lead.fullName}</strong>
            <span className="ml-1.5 font-mono text-slate-400">({lead.id})</span>
          </div>
        </div>

        {/* Quick Assignment Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Abogado responsable:
          </span>
          <select
            value={currentLawyer}
            onChange={(e) => handleLawyerChange(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#0b192c] focus:outline-none focus:ring-1 focus:ring-[#0071ce] shadow-xs"
          >
            {lawyers.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Request Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0071ce]/10 text-[#0071ce] border border-[#0071ce]/20 font-mono font-bold text-lg">
              {lead.company ? lead.company.slice(0, 2).toUpperCase() : lead.fullName.slice(0, 2).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0071ce] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  Solicitud Comercial
                </span>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded">
                  Recibida: {lead.createdAt}
                </span>
                {lead.isPrimaryContact && (
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Contacto Principal
                  </span>
                )}
              </div>

              <h1 className="mt-1.5 text-2xl font-extrabold text-[#0b192c] tracking-tight truncate">
                {lead.company || lead.fullName}
              </h1>

              <div className="mt-1 text-sm text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-semibold text-slate-800">{lead.fullName}</span>
                {lead.jobTitle && <span>({lead.jobTitle})</span>}
                <span>·</span>
                <span className="text-slate-500">{lead.industry}</span>
                <span>·</span>
                <span className="text-slate-500 font-mono text-xs">{lead.stage}</span>
              </div>
            </div>
          </div>

          {/* Contact Details & Expediente Button */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <a href={`mailto:${lead.email}`} className="hover:text-[#0071ce] underline">
                  {lead.email}
                </a>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lead.phone}</span>
                </div>
              )}
            </div>

            {linkedProcess ? (
              <button
                type="button"
                onClick={() => onOpenProcess(linkedProcess)}
                className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <FolderKanban className="w-4 h-4" />
                <span>Expediente Activo ({linkedProcess.progress}%)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowProcessForm(true)}
                className="inline-flex items-center gap-2 bg-[#0071ce] hover:bg-[#005ba7] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Workflow className="w-4 h-4" />
                <span>Aperturar Expediente</span>
              </button>
            )}
          </div>
        </div>

        {/* INTERACTIVE TRELLO-STYLE PIPELINE FLOWCHART */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Flujograma de la Solicitud (Haz clic en una etapa para moverla)
            </span>
            {nextStage && (
              <button
                type="button"
                onClick={handleAdvanceToNext}
                className="text-xs font-bold text-[#0071ce] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Avanzar a: {nextStage.label}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
            {PIPELINE_STAGES.map((st, idx) => {
              const isCurrent = lead.status === st.id;
              const isPassed = currentStageIndex > idx;

              let cardStyles = 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300';
              if (isCurrent) {
                cardStyles = 'bg-[#0071ce] text-white border-[#0071ce] shadow-sm ring-2 ring-blue-200';
              } else if (isPassed) {
                cardStyles = 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100/70';
              }

              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleStageSelect(st.id)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${cardStyles}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isCurrent ? 'bg-white/20 text-white' : isPassed ? 'bg-emerald-200/60 text-emerald-900' : 'bg-slate-200 text-slate-700'
                    }`}>
                      Paso {st.stepNumber}
                    </span>
                    {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                    {isCurrent && <Clock className="w-3.5 h-3.5 text-white animate-pulse" />}
                  </div>

                  <div className="text-xs font-bold leading-snug">
                    {st.label}
                  </div>

                  <div className={`mt-0.5 text-[10px] truncate ${
                    isCurrent ? 'text-blue-100' : 'text-slate-400'
                  }`}>
                    {st.shortDesc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* IN-LINE PROCESS APERTURE PANEL (Direct on screen when toggled, no popup modal!) */}
      {showProcessForm && !linkedProcess && (
        <section className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800 animate-in fade-in space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                Formalización Inmediata
              </span>
              <h2 className="text-lg font-bold text-white">
                Apertura de Expediente Operativo para {lead.company || lead.fullName}
              </h2>
              <p className="text-xs text-slate-300">
                Se creará el caso en el tablero de trabajo sin duplicar registros ni perder recaudos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowProcessForm(false)}
              className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1"
            >
              Cerrar
            </button>
          </div>

          <form onSubmit={handleCreateProcessSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Título del Expediente</label>
              <input
                type="text"
                value={processTitle}
                onChange={(e) => setProcessTitle(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#0071ce]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Materia Legal</label>
              <select
                value={processCategory}
                onChange={(e) => setProcessCategory(e.target.value as LegalProcess['category'])}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#0071ce]"
              >
                <option value="Corporativo">Corporativo</option>
                <option value="Propiedad Intelectual">Propiedad Intelectual</option>
                <option value="Regulatorio">Regulatorio</option>
                <option value="Laboral">Laboral</option>
                <option value="Contratos">Contratos</option>
                <option value="Mediación">Mediación</option>
                <option value="Administrativo & Notarial">Administrativo & Notarial</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Abogado Titular</label>
              <select
                value={processLawyer}
                onChange={(e) => setProcessLawyer(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#0071ce]"
              >
                {lawyers.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Primer Hito Operativo</label>
              <input
                type="text"
                value={processMilestone}
                onChange={(e) => setProcessMilestone(e.target.value)}
                placeholder="Ej. Revisión y elaboración de borrador estatutario"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#0071ce]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Fecha Meta Estimada</label>
              <input
                type="date"
                value={processTargetDate}
                onChange={(e) => setProcessTargetDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#0071ce]"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-[#0071ce] hover:bg-[#005ba7] text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-xs"
              >
                Confirmar y Abrir Expediente
              </button>
            </div>
          </form>
        </section>
      )}

      {/* WORKSPACE NAVIGATION TABS */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'summary' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Visión General & Diagnóstico
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('budget')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'budget' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Presupuesto Comercial (${total})</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
            budgetStatus === 'aprobado' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
          }`}>
            {budgetStatus}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'documents' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Paperclip className="w-3.5 h-3.5" />
          <span>Recaudos & Documentos ({documents.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'history' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Bitácora & Notas ({lead.internalNotes.length})</span>
        </button>
      </div>

      {/* TAB 1: SUMMARY & DIAGNOSTIC */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column: Requirements & Risks */}
          <div className="lg:col-span-2 space-y-5">
            {/* Situation / Needs statement */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Planteamiento del Negocio y Necesidad
              </h2>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-normal">
                {lead.notes || 'El cliente completó el formulario indicando interés en blindaje societario y contratos marco.'}
              </div>

              {/* Areas of interest */}
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1.5">
                  Áreas Legales Requeridas:
                </span>
                <div className="flex flex-wrap gap-2">
                  {lead.areasOfInterest.map((area, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-[#0071ce] border border-blue-200 px-2.5 py-1 rounded-lg">
                      <Tag className="w-3 h-3" />
                      <span>{area}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Risk Items from Diagnostic */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Evaluación de Riesgo Legal Detectado
                  </h2>
                  <p className="text-xs text-slate-500">
                    Puntos críticos identificados en el diagnóstico previo
                  </p>
                </div>
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                  lead.calculatedRiskScore >= 70 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  Riesgo: {lead.calculatedRiskScore} / 100
                </span>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                <strong>Diagnóstico Resumen:</strong> {lead.riskSummary}
              </div>

              <div className="space-y-2.5 pt-2">
                {lead.riskItems.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{item.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.level === 'Alto' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Nivel {item.level}
                      </span>
                    </div>
                    <p className="text-slate-600">{item.description}</p>
                    <div className="pt-1 text-[11px] text-[#0071ce] font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Acción BinLegal: {item.actionRequired}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Company details & Expediente connector */}
          <div className="space-y-5">
            {/* Company Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Ficha de Empresa
              </span>
              <h2 className="text-lg font-extrabold text-[#0b192c]">
                {lead.company || 'Particular'}
              </h2>
              {lead.company && onOpenCompany && (
                <button
                  type="button"
                  onClick={() => onOpenCompany(lead.company)}
                  className="text-xs font-semibold text-[#0071ce] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Ver empresa y otros contactos</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}

              <div className="pt-3 border-t border-slate-100 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">RIF:</span>
                  <span className="font-mono font-semibold text-slate-800">{lead.rif || 'No registrado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sector:</span>
                  <span className="font-semibold text-slate-800">{lead.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Madurez:</span>
                  <span className="font-semibold text-slate-800">{lead.stage}</span>
                </div>
              </div>
            </div>

            {/* Quick Process Status Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Estado del Trámite Legal
              </span>
              {linkedProcess ? (
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-[#0b192c] text-sm">
                    {linkedProcess.title}
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Fase actual:</span>
                    <span className="font-bold uppercase text-[#0071ce]">{linkedProcess.status}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-[#0071ce] h-2 rounded-full" 
                      style={{ width: `${linkedProcess.progress}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Avance: {linkedProcess.progress}%</span>
                    <span>Meta: {linkedProcess.targetDate}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenProcess(linkedProcess)}
                    className="w-full mt-2 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-center transition-colors cursor-pointer"
                  >
                    Abrir Tablero de Trabajo
                  </button>
                </div>
              ) : (
                <div className="text-xs text-slate-500 space-y-2">
                  <p>Esta solicitud aún no tiene expediente operativo formalizado.</p>
                  <button
                    type="button"
                    onClick={() => setShowProcessForm(true)}
                    className="w-full py-2 bg-[#0071ce] hover:bg-[#005ba7] text-white rounded-lg font-bold text-center transition-colors cursor-pointer"
                  >
                    Aperturar Expediente Ahora
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTEGRATED BUDGET & PROPOSAL TOOL (Sección 7 del Plan Maestro) */}
      {activeTab === 'budget' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0071ce]">
                Herramienta de Presupuestos BinLegal
              </span>
              <h2 className="text-lg font-bold text-[#0b192c]">
                Cotización de Honorarios y Servicios para {lead.company || lead.fullName}
              </h2>
              <p className="text-xs text-slate-500">
                Diseña y aprueba honorarios comerciales vinculados directamente a la solicitud.
              </p>
            </div>

            {/* Proposal status selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Estatus:</span>
              <select
                value={budgetStatus}
                onChange={(e) => handleBudgetStatusChange(e.target.value as LeadBudget['status'])}
                className={`border rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none ${
                  budgetStatus === 'aprobado' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                    : budgetStatus === 'enviado' 
                    ? 'bg-blue-50 text-[#0071ce] border-blue-300' 
                    : 'bg-slate-50 text-slate-700 border-slate-300'
                }`}
              >
                <option value="borrador">Borrador Interno</option>
                <option value="enviado">Enviado al Cliente</option>
                <option value="aprobado">Aprobado por el Cliente</option>
                <option value="rechazado">Declinado</option>
              </select>
            </div>
          </div>

          {/* Quick Service Catalog Adder */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 block">
              Agregar Servicio desde el Catálogo Oficial de BinLegal:
            </span>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={catalogSelection}
                onChange={(e) => setCatalogSelection(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none"
              >
                <option value="">-- Seleccionar concepto o trámite --</option>
                {PREDEFINED_SERVICES.map((srv, i) => (
                  <option key={i} value={srv.concept}>
                    {srv.concept} ({srv.area} · Ref: ${srv.suggestedPrice} USD)
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddBudgetItem}
                disabled={!catalogSelection}
                className="inline-flex items-center justify-center gap-1.5 bg-[#0071ce] hover:bg-[#005ba7] disabled:opacity-40 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Concepto</span>
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Concepto Jurídico</th>
                  <th className="py-2.5 px-3">Materia</th>
                  <th className="py-2.5 px-3 text-center">Cant.</th>
                  <th className="py-2.5 px-3 text-right">Tarifa Unit. ($)</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                  <th className="py-2.5 px-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {budgetItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-semibold text-slate-900 max-w-md">
                      {item.concept}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                        {item.area}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      ${item.unitPrice} {budgetCurrency}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ${item.quantity * item.unitPrice} {budgetCurrency}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveBudgetItem(item.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Eliminar concepto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {budgetItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                      No hay conceptos en el presupuesto. Selecciona un servicio arriba para agregar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Budget Summary & Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Condiciones Comerciales y Observaciones
              </label>
              <textarea
                value={budgetNotes}
                onChange={(e) => {
                  setBudgetNotes(e.target.value);
                  saveBudget(budgetItems, budgetDiscount, e.target.value, budgetStatus);
                }}
                rows={3}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:bg-white"
                placeholder="Indica vigencia, forma de pago (50/50), gastos arancelarios, etc."
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal honorarios:</span>
                <span className="font-mono font-semibold">${subtotal} {budgetCurrency}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Descuento acordado ($):</span>
                <input
                  type="number"
                  min="0"
                  value={budgetDiscount}
                  onChange={(e) => {
                    const d = Number(e.target.value) || 0;
                    setBudgetDiscount(d);
                    saveBudget(budgetItems, d, budgetNotes, budgetStatus);
                  }}
                  className="w-24 text-right bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-mono"
                />
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-extrabold text-[#0b192c]">
                <span>Total Presupuestado:</span>
                <span className="font-mono text-[#0071ce]">${total} {budgetCurrency}</span>
              </div>
              
              {/* Direct action if approved */}
              {budgetStatus === 'aprobado' && !linkedProcess && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowProcessForm(true)}
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-center text-xs transition-colors cursor-pointer"
                  >
                    Aprobar y Formalizar Expediente Legal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENT & RECAUDOS LIBRARY (Sección 4.3 del Plan Maestro) */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0071ce]">
                Gestión Documental de la Solicitud
              </span>
              <h2 className="text-lg font-bold text-[#0b192c]">
                Biblioteca de Recaudos y Archivos Anexados
              </h2>
              <p className="text-xs text-slate-500">
                Consulta los recaudos consignados por el cliente o sube nuevos instrumentos para revisión.
              </p>
            </div>
          </div>

          {/* Add Recaudo / File Bar */}
          <form onSubmit={handleAddDocument} className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre del Archivo / Recaudo</label>
              <input
                type="text"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="Ej. Poder_Especial_UrbanBite.pdf"
                required
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Categoría</label>
              <select
                value={newDocCategory}
                onChange={(e) => setNewDocCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
              >
                <option value="Identificación Legal">Identificación Legal (Cédula, Pasaporte)</option>
                <option value="Fiscal">Fiscal (RIF, Licencia Comercial)</option>
                <option value="Societario">Societario (Estatutos, Actas)</option>
                <option value="Propiedad Intelectual">Propiedad Intelectual (Logo, Memoria)</option>
                <option value="Laboral">Laboral (Nóminas, Contratos)</option>
                <option value="Recaudo General">Recaudo General</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-[#0071ce] hover:bg-[#005ba7] text-white font-bold py-2 px-3 rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
              >
                Anexar Recaudo
              </button>
            </div>
          </form>

          {/* Documents Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Documento</th>
                  <th className="py-2.5 px-3">Categoría</th>
                  <th className="py-2.5 px-3">Fecha de Carga</th>
                  <th className="py-2.5 px-3">Tamaño</th>
                  <th className="py-2.5 px-3">Estatus del Recaudo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#0071ce] shrink-0" />
                      <span className="truncate max-w-xs">{doc.name}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {doc.category}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {doc.uploadDate}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {doc.size || '1.0 MB'}
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={doc.status}
                        onChange={(e) => handleDocStatusChange(doc.id, e.target.value as LeadDocument['status'])}
                        className={`text-[11px] font-bold px-2 py-1 rounded border focus:outline-none ${
                          doc.status === 'aprobado'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : doc.status === 'en_revision'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : doc.status === 'recibido'
                            ? 'bg-blue-50 text-[#0071ce] border-blue-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        <option value="recibido">Recibido</option>
                        <option value="en_revision">En Revisión</option>
                        <option value="aprobado">Aprobado / Conforme</option>
                        <option value="pendiente">Faltante / Pendiente</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {documents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                      No hay documentos anexados en esta solicitud.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CHRONOLOGICAL ACTIVITY & NOTES LOG */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0071ce]">
                Bitácora de Seguimiento
              </span>
              <h2 className="text-lg font-bold text-[#0b192c]">
                Historial de Notas Internas de la Solicitud
              </h2>
            </div>
          </div>

          {/* Add Note Form */}
          <form onSubmit={handleSaveNote} className="space-y-3">
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Escribe un avance, resumen de llamada o acuerdo con el cliente..."
              rows={3}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:bg-white"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-semibold">Autor:</span>
                <select
                  value={noteAuthor}
                  onChange={(e) => setNoteAuthor(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none"
                >
                  {lawyers.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Registrar Nota</span>
              </button>
            </div>
          </form>

          {/* Notes Log */}
          <div className="space-y-3 pt-2">
            {lead.internalNotes.map((note) => (
              <div key={note.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span className="font-bold text-slate-800">{note.author}</span>
                  <span className="font-mono">{note.timestamp}</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{note.text}</p>
              </div>
            ))}
            {lead.internalNotes.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-4">
                No hay notas registradas para esta solicitud.
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
