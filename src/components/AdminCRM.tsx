import React, { useState } from 'react';
import { 
  Lead, 
  LeadStatus, 
  BusinessStage, 
  LegalArea, 
  InternalNote, 
  LegalProcess, 
  ProcessStatus,
  LeadBudget,
  LeadDocument 
} from '../types';
import { 
  Users, 
  Search, 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Plus, 
  Download, 
  X, 
  Phone, 
  Mail, 
  Building, 
  AlertTriangle, 
  ChevronRight, 
  Send, 
  Briefcase, 
  Layers, 
  LayoutGrid, 
  List, 
  FolderKanban, 
  Building2, 
  Star, 
  Copy, 
  Check, 
  Workflow 
} from 'lucide-react';
import { SectorSelector, COMMON_BUSINESS_SECTORS } from './SectorSelector';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { WorkflowBoard } from './WorkflowBoard';
import { ClientRecordView } from './ClientRecordView';
import { CompanyRecordView } from './CompanyRecordView';
import { ConvertLeadToProcessModal } from './ConvertLeadToProcessModal';
import { RequestDetailView } from './RequestDetailView';

interface AdminCRMProps {
  leads: Lead[];
  processes?: LegalProcess[];
  onCreateProcess?: (process: LegalProcess) => void;
  onUpdateLeadStatus: (leadId: string, newStatus: LeadStatus) => void;
  onAddInternalNote: (leadId: string, noteText: string, author: string) => void;
  onAddManualLead: (lead: Lead) => void;
  onUpdateProcessStatus?: (processId: string, status: ProcessStatus, progress: number, milestone?: string) => void;
  onUpdateProcessLawyer?: (processId: string, lawyer: string) => void;
  onBackToLanding: () => void;
  onOpenDiagnostic?: () => void;
  onUpdateLead?: (lead: Lead) => void;
}

const STAGES_CONFIG: Array<{ id: LeadStatus; label: string; desc: string }> = [
  { id: 'nuevo_lead', label: 'Solicitud nueva / sin atender', desc: 'Pendiente de primera revisión' },
  { id: 'diagnostico_enviado', label: 'En seguimiento', desc: 'Evaluación enviada y seguimiento pendiente' },
  { id: 'sesion_programada', label: 'Reunión programada', desc: 'Llamada o reunión agendada' },
  { id: 'propuesta_presentada', label: 'Propuesta enviada', desc: 'Propuesta comercial pendiente de respuesta' }
];

export const AdminCRM: React.FC<AdminCRMProps> = ({
  leads,
  processes = [],
  onCreateProcess,
  onUpdateLeadStatus,
  onAddInternalNote,
  onAddManualLead,
  onUpdateProcessStatus,
  onUpdateProcessLawyer,
  onBackToLanding,
  onOpenDiagnostic,
  onUpdateLead
}) => {
  const [adminTab, setAdminTab] = useState<'requests' | 'contacts' | 'processes' | 'lawyers'>('requests');
  const [expandedMenu, setExpandedMenu] = useState<'Solicitudes' | 'Directorio' | 'Expedientes' | ''>('Solicitudes');
  const [lawyers, setLawyers] = useState<string[]>(() => { try { const saved = localStorage.getItem('binlegal_crm_lawyers_v1'); if (saved) return JSON.parse(saved); } catch {} return ['José Rafael Vasquez', 'Supervisor Legal', 'María Fernández', 'Ricardo Salas', 'Pasante Legal']; });
  const [newLawyerName, setNewLawyerName] = useState('');
  const [selectedLawyer, setSelectedLawyer] = useState<string | null>(null);
  const [lawyerProfiles, setLawyerProfiles] = useState<Record<string, { specialty: string; email: string; phone: string; notes: string }>>(() => { try { return JSON.parse(localStorage.getItem('binlegal_crm_lawyer_profiles_v1') || '{}'); } catch { return {}; } });
  const [lawyerProfileDraft, setLawyerProfileDraft] = useState({ specialty: '', email: '', phone: '', notes: '' });
  const [activeView, setActiveView] = useState<'pipeline' | 'table'>('table');
  const [quickFilter, setQuickFilter] = useState<'all' | 'followup' | 'meetings' | 'new'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeadOrigin, setSelectedLeadOrigin] = useState<'requests' | 'contacts'>('requests');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [contactDirectoryView, setContactDirectoryView] = useState<'people' | 'companies'>('companies');
  const [contactSectorFilter, setContactSectorFilter] = useState<string>('all');
  const [contactStatusFilter, setContactStatusFilter] = useState<'all' | 'active_cases' | 'active_clients'>('all');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [selectedProcessToEdit, setSelectedProcessToEdit] = useState<LegalProcess | null>(null);
  const [selectedWorkflowProcess, setSelectedWorkflowProcess] = useState<LegalProcess | null>(null);
  const [accountActionMessage, setAccountActionMessage] = useState('');
  const [resetEmailLoading, setResetEmailLoading] = useState(false);
  const [profileProcessId, setProfileProcessId] = useState('');
  const [processQuickFilter, setProcessQuickFilter] = useState<'active' | 'recaudos' | 'redaccion' | 'tramite_publico' | 'revision'>('active');

  // New Note state
  const [noteText, setNoteText] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('José Rafael Vásquez');

  // Manual Lead Modal state
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newSelectedSectors, setNewSelectedSectors] = useState<string[]>(['Tecnología & Software']);
  const [newOtherSectorText, setNewOtherSectorText] = useState('');
  const [newStage, setNewStage] = useState<BusinessStage>('Recién constituida');
  const [newAreas, setNewAreas] = useState<LegalArea[]>(['Corporativo']);
  const [newSituation, setNewSituation] = useState('');

  // Convert Lead / Company to Process Modal State (Opción 1: Conexión Solicitud ➔ Expediente)
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);
  const [companyToConvert, setCompanyToConvert] = useState<string>('');

  const handleOpenConvertModal = (targetLead?: Lead | null, companyName?: string) => {
    setLeadToConvert(targetLead || null);
    setCompanyToConvert(companyName || targetLead?.company || '');
    setShowConvertModal(true);
  };

  const handleLeadLawyerChange = (leadId: string, lawyer: string) => {
    const target = leads.find(l => l.id === leadId);
    if (target) {
      const updated = { ...target, assignedLawyer: lawyer };
      onUpdateLead?.(updated);
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead(updated);
      }
    }
  };

  const handleLeadBudgetChange = (leadId: string, budget: LeadBudget) => {
    const target = leads.find(l => l.id === leadId);
    if (target) {
      const updated = { ...target, budget };
      onUpdateLead?.(updated);
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead(updated);
      }
    }
  };

  const handleLeadDocumentAdd = (leadId: string, doc: LeadDocument) => {
    const target = leads.find(l => l.id === leadId);
    if (target) {
      const existing = target.documents || [];
      const updated = { ...target, documents: [doc, ...existing] };
      onUpdateLead?.(updated);
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead(updated);
      }
    }
  };

  const handleLeadDocumentStatusChange = (leadId: string, docId: string, status: LeadDocument['status']) => {
    const target = leads.find(l => l.id === leadId);
    if (target && target.documents) {
      const updatedDocs = target.documents.map(d => d.id === docId ? { ...d, status } : d);
      const updated = { ...target, documents: updatedDocs };
      onUpdateLead?.(updated);
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead(updated);
      }
    }
  };

  const handleConfirmConvert = (
    newProcess: LegalProcess, 
    options: { markAsActive: boolean; addNote: boolean; leadId?: string }
  ) => {
    if (onCreateProcess) {
      onCreateProcess(newProcess);
    }
    if (options.leadId) {
      if (options.markAsActive) {
        onUpdateLeadStatus(options.leadId, 'cliente_activo');
      }
      if (options.addNote) {
        onAddInternalNote(
          options.leadId,
          `Expediente formalizado: "${newProcess.title}" (Categoría: ${newProcess.category}) asignado a ${newProcess.assignedLawyer}. Plazo meta: ${newProcess.targetDate}. Hito inicial: ${newProcess.nextMilestone}`,
          'José Rafael Vásquez'
        );
      }
      const target = leads.find(l => l.id === options.leadId);
      if (target) {
        const updated = { ...target, status: 'cliente_activo' as LeadStatus, linkedProcessId: newProcess.id };
        onUpdateLead?.(updated);
      }
    }
    // Seamlessly transition right into the workflow board for zero friction
    setSelectedLead(null);
    setSelectedCompany(null);
    setSelectedWorkflowProcess(newProcess);
  };

  React.useEffect(() => { localStorage.setItem('binlegal_crm_lawyers_v1', JSON.stringify(lawyers)); }, [lawyers]);
  React.useEffect(() => { localStorage.setItem('binlegal_crm_lawyer_profiles_v1', JSON.stringify(lawyerProfiles)); }, [lawyerProfiles]);
  React.useEffect(() => { if (selectedLawyer) setLawyerProfileDraft(lawyerProfiles[selectedLawyer] || { specialty: '', email: '', phone: '', notes: '' }); }, [selectedLawyer, lawyerProfiles]);

  // Filter leads
  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = selectedStageFilter === 'all' || l.status === selectedStageFilter;
    const matchesQuickFilter = quickFilter === 'all' || (quickFilter === 'new' && l.status === 'nuevo_lead') || (quickFilter === 'followup' && l.status !== 'nuevo_lead' && l.status !== 'cliente_activo') || (quickFilter === 'meetings' && l.status === 'sesion_programada');
    const matchesSector = selectedSectorFilter === 'all' || 
                          l.industry.toLowerCase().includes(selectedSectorFilter.toLowerCase());
    return matchesSearch && matchesStage && matchesSector && matchesQuickFilter;
  });

  const selectQuickFilter = (filter: 'all' | 'followup' | 'meetings' | 'new') => {
    setQuickFilter(filter);
    setSelectedStageFilter('all');
    setActiveView('table');
  };

  // KPI Calculations
  const totalLeads = leads.length;
  const newRequests = leads.filter(l => l.status === 'nuevo_lead').length;
  const inPipeline = leads.filter(l => l.status !== 'nuevo_lead' && l.status !== 'cliente_activo').length;
  const sessionsScheduled = leads.filter(l => l.status === 'sesion_programada').length;

  const handleAddNote = (leadId: string) => {
    if (!noteText.trim()) return;
    onAddInternalNote(leadId, noteText, noteAuthor);
    setNoteText('');
    
    // Update local selectedLead state
    if (selectedLead && selectedLead.id === leadId) {
      const updatedNotes: InternalNote[] = [
        ...selectedLead.internalNotes,
        {
          id: `note-${Date.now()}`,
          author: noteAuthor,
          text: noteText,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
        }
      ];
      setSelectedLead({ ...selectedLead, internalNotes: updatedNotes });
    }
  };

  const handleSendPasswordReset = async (email: string) => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) { setAccountActionMessage('Este perfil no tiene un correo electrónico registrado.'); return; }
    setResetEmailLoading(true);
    setAccountActionMessage('');
    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      setAccountActionMessage(`Si existe una cuenta asociada a ${normalizedEmail}, Firebase enviará las instrucciones para restablecer la contraseña.`);
    } catch (error) {
      console.error('Password reset email failed:', error);
      setAccountActionMessage('No se pudo solicitar el correo. Verifica la configuración de Firebase Authentication y el correo registrado.');
    } finally { setResetEmailLoading(false); }
  };

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    onUpdateLeadStatus(leadId, newStatus);
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
  };

  const handleSaveManualLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newEmail || !newCompany) return;

    const formattedIndustry = newSelectedSectors.map(s => {
      if (s === 'Otro') {
        return newOtherSectorText.trim() ? `Otro: ${newOtherSectorText.trim()}` : 'Otro';
      }
      return s;
    }).join(', ') || 'PYME General';

    const lead: Lead = {
      id: `lead-manual-${Date.now()}`,
      fullName: newFullName,
      email: newEmail,
      phone: newPhone || undefined,
      company: newCompany,
      industry: formattedIndustry,
      stage: newStage,
      areasOfInterest: newAreas,
      notes: newSituation || undefined,
      status: 'nuevo_lead',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      calculatedRiskScore: 60,
      riskSummary: `Registrado manualmente por ${noteAuthor} para prospección directa.`,
      riskItems: [
        {
          area: newAreas[0] || 'Corporativo',
          level: 'Medio',
          title: 'Evaluación inicial pendiente',
          description: 'Contacto directo de ventas para diagnóstico telefónico o presencial.',
          actionRequired: 'Agendar llamada de calificación de 15 minutos.'
        }
      ],
      internalNotes: [
        {
          id: `note-${Date.now()}`,
          author: noteAuthor,
          text: 'Contacto creado manualmente en el CRM.',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
        }
      ]
    };

    onAddManualLead(lead);
    setShowAddLeadModal(false);
    setNewFullName('');
    setNewEmail('');
    setNewPhone('');
    setNewCompany('');
    setNewSelectedSectors(['Tecnología & Software']);
    setNewOtherSectorText('');
  };

  const exportCSV = () => {
    const headers = ['ID', 'Nombre', 'Empresa', 'Email', 'Telefono', 'Etapa', 'Areas', 'Estado', 'Riesgo', 'Fecha'];
    const rows = leads.map(l => [
      l.id,
      `"${l.fullName}"`,
      `"${l.company}"`,
      l.email,
      l.phone || '',
      `"${l.stage}"`,
      `"${l.areasOfInterest.join(';')}"`,
      l.status,
      l.calculatedRiskScore,
      l.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `binlegal_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="crm-workspace min-h-screen bg-[#f4f5f5] flex flex-col font-sans text-[#3e4543]">
      
      {/* Top Bar for Admin */}
      <header className="bg-[#3e4543] text-white border-b border-[#323836] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between min-h-[64px] py-3 gap-3">
            
            <div className="flex items-center gap-2.5">
              <img 
                src="/assets/images/LogoApaisado_BinLegal.png" 
                alt="BinLegal Logo" 
                className="h-8 sm:h-9 w-auto object-contain bg-white rounded p-1" 
              />
              <div>
                <h1 className="text-sm sm:text-base font-semibold tracking-tight text-white flex items-center gap-2">
                  <span>BinLegal CRM</span>
                  <span className="text-[#cfd1d0] font-normal">·</span>
                  <span className="text-xs sm:text-sm text-[#e7e8e8] font-normal hidden sm:inline">
                    José Rafael Vásquez
                  </span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {onOpenDiagnostic && (
                <button
                  type="button"
                  onClick={onOpenDiagnostic}
                  className="px-3 py-1.5 bg-[#0071ce] hover:bg-[#0060b0] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Abrir formulario de diagnóstico legal para simular una solicitud real"
                >
                  <span className="text-sm">🧪</span>
                  <span className="hidden sm:inline">Probar Diagnóstico</span>
                  <span className="sm:hidden">Diagnóstico</span>
                </button>
              )}

              {(adminTab === 'requests' || adminTab === 'contacts') && (
                <>
                  <button
                    onClick={() => setShowAddLeadModal(true)}
                    className="px-2.5 py-1.5 bg-[#323836] hover:bg-[#4f5553] text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1 border border-neutral-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Nuevo contacto</span>
                  </button>

                  <button
                    onClick={exportCSV}
                    className="px-2.5 py-1.5 bg-[#323836] hover:bg-[#4f5553] text-neutral-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 border border-neutral-700 cursor-pointer"
                    title="Exportar base a CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">CSV</span>
                  </button>
                </>
              )}

              <button
                onClick={onBackToLanding}
                className="px-2.5 py-1.5 bg-[#323836] hover:bg-[#4f5553] text-neutral-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 border border-neutral-700 cursor-pointer"
                title="Ver web pública"
              >
                <span>Web</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* CRM workspace navigation with one expanded section at a time */}
      <div className="flex-1 w-full max-w-screen-2xl mx-auto min-w-0 lg:flex">
        <aside className="w-full min-w-0 px-3 sm:px-4 lg:w-60 lg:shrink-0 lg:px-4 py-3 lg:py-6">
          <div className="rounded-xl border border-[#cfd1d0] bg-white p-2 lg:sticky lg:top-24">
            <p className="px-3 pt-2 pb-3 text-xs font-semibold uppercase tracking-wide text-[#626967]">Tu espacio de trabajo</p>

            <button type="button" onClick={() => {
              setSelectedLead(null); setSelectedCompany(null); setSelectedWorkflowProcess(null);
              setAdminTab('requests'); setExpandedMenu(current => current === 'Solicitudes' ? '' : 'Solicitudes');
            }} aria-expanded={expandedMenu === 'Solicitudes'} aria-current={adminTab === 'requests' ? 'page' : undefined}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-left transition-colors ${adminTab === 'requests' ? 'bg-[#e0effb] text-[#004f91] border border-[#b9ddf6]' : 'text-[#3e4543] hover:bg-[#f4f5f5]'}`}>
              <Layers className="w-5 h-5 shrink-0" /><span className="flex-1">Solicitudes</span>
              <span className="text-xs tabular-nums">{leads.filter(l => l.status !== 'cliente_activo').length}</span>
              <ChevronRight className={`h-4 w-4 transition-transform ${expandedMenu === 'Solicitudes' ? 'rotate-90' : ''}`} />
            </button>
            {expandedMenu === 'Solicitudes' && <div className="ml-5 mt-1 space-y-1 border-l border-[#dce2e6] pl-3">
              {[
                { label: 'Nuevas sin atender', value: 'new' as const },
                { label: 'En seguimiento', value: 'followup' as const },
                { label: 'Reuniones programadas', value: 'meetings' as const },
                { label: 'Estados de solicitudes', value: 'all' as const }
              ].map(item => <button key={item.value} type="button" onClick={() => {
                setSelectedLead(null); setSelectedCompany(null); setSelectedWorkflowProcess(null);
                setAdminTab('requests'); setQuickFilter(item.value); setSelectedStageFilter('all');
              }} className={`w-full rounded-md px-3 py-2 text-left text-xs transition-colors ${quickFilter === item.value && adminTab === 'requests' ? 'bg-[#e0effb] font-semibold text-[#004f91]' : 'text-[#505856] hover:bg-[#f4f5f5]'}`}>{item.label}</button>)}
            </div>}

            <button type="button" onClick={() => {
              setSelectedLead(null); setSelectedCompany(null); setSelectedWorkflowProcess(null);
              setAdminTab('contacts'); setExpandedMenu(current => current === 'Directorio' ? '' : 'Directorio');
            }} aria-expanded={expandedMenu === 'Directorio'} aria-current={adminTab === 'contacts' ? 'page' : undefined}
              className={`mt-1 w-full flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-left transition-colors ${adminTab === 'contacts' ? 'bg-[#e0effb] text-[#004f91] border border-[#b9ddf6]' : 'text-[#3e4543] hover:bg-[#f4f5f5]'}`}>
              <Users className="w-5 h-5 shrink-0" /><span className="flex-1">Directorio</span><span className="text-xs tabular-nums">{leads.length}</span>
              <ChevronRight className={`h-4 w-4 transition-transform ${expandedMenu === 'Directorio' ? 'rotate-90' : ''}`} />
            </button>
            {expandedMenu === 'Directorio' && <div className="ml-5 mt-1 space-y-1 border-l border-[#dce2e6] pl-3">
              {[
                { label: 'Empresas', value: 'companies' as const },
                { label: 'Personas', value: 'people' as const }
              ].map(item => <button key={item.value} type="button" onClick={() => {
                setSelectedLead(null); setSelectedCompany(null); setSelectedWorkflowProcess(null);
                setAdminTab('contacts'); setContactDirectoryView(item.value);
              }} className={`w-full rounded-md px-3 py-2 text-left text-xs transition-colors ${contactDirectoryView === item.value && adminTab === 'contacts' ? 'bg-[#e0effb] font-semibold text-[#004f91]' : 'text-[#505856] hover:bg-[#f4f5f5]'}`}>{item.label}</button>)}
            </div>}

            <button type="button" onClick={() => {
              setSelectedLead(null); setSelectedCompany(null); setSelectedWorkflowProcess(null);
              setAdminTab('processes'); setExpandedMenu(current => current === 'Expedientes' ? '' : 'Expedientes');
            }} aria-expanded={expandedMenu === 'Expedientes'} aria-current={adminTab === 'processes' ? 'page' : undefined}
              className={`mt-1 w-full flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-left transition-colors ${adminTab === 'processes' ? 'bg-[#e0effb] text-[#004f91] border border-[#b9ddf6]' : 'text-[#3e4543] hover:bg-[#f4f5f5]'}`}>
              <FolderKanban className="w-5 h-5 shrink-0" /><span className="flex-1">Expedientes</span><span className="text-xs tabular-nums">{processes.length}</span>
              <ChevronRight className={`h-4 w-4 transition-transform ${expandedMenu === 'Expedientes' ? 'rotate-90' : ''}`} />
            </button>
            {expandedMenu === 'Expedientes' && <div className="ml-5 mt-1 space-y-1 border-l border-[#dce2e6] pl-3">
              {[
                { label: 'En trámite', value: 'active' as const },
                { label: 'En redacción', value: 'redaccion' as const },
                { label: 'Organismo público', value: 'tramite_publico' as const },
                { label: 'En revisión', value: 'revision' as const },
                { label: 'Pendientes por recaudos', value: 'recaudos' as const }
              ].map(item => <button key={item.value} type="button" onClick={() => {
                setSelectedLead(null); setSelectedCompany(null); setSelectedWorkflowProcess(null);
                setAdminTab('processes'); setProcessQuickFilter(item.value);
              }} className={`w-full rounded-md px-3 py-2 text-left text-xs transition-colors ${processQuickFilter === item.value && adminTab === 'processes' ? 'bg-[#e0effb] font-semibold text-[#004f91]' : 'text-[#505856] hover:bg-[#f4f5f5]'}`}>{item.label}</button>)}
            </div>}

            <button type="button" onClick={() => {
              setSelectedLead(null); setSelectedCompany(null); setSelectedWorkflowProcess(null);
              setAdminTab('lawyers'); setExpandedMenu('');
            }} aria-current={adminTab === 'lawyers' ? 'page' : undefined}
              className={`mt-1 w-full flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-left transition-colors ${adminTab === 'lawyers' ? 'bg-[#e0effb] text-[#004f91] border border-[#b9ddf6]' : 'text-[#3e4543] hover:bg-[#f4f5f5]'}`}>
              <Briefcase className="w-5 h-5 shrink-0" /><span className="flex-1">Equipo legal</span><span className="text-xs tabular-nums">{lawyers.length}</span>
            </button>
            <div className="mt-3 border-t border-[#e7e8e8] px-3 pt-3 pb-2 text-xs leading-relaxed text-[#626967]">
              Separa las solicitudes comerciales, el directorio de contactos y los expedientes legales.
            </div>
          </div>
        </aside>
      <main className="min-w-0 flex-1 w-full overflow-x-hidden px-3 sm:px-5 lg:px-6 py-4 sm:py-6 space-y-5">
        {!selectedCompany && !selectedWorkflowProcess && !selectedLead && (
          <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.03] sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#0071ce]">
              {adminTab === 'requests' ? 'Gestión comercial' : adminTab === 'contacts' ? 'Base de relaciones' : adminTab === 'processes' ? 'Operación legal' : 'Personas y permisos'}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#0b192c]">
              {adminTab === 'requests' ? 'Solicitudes' : adminTab === 'contacts' ? 'Directorio' : adminTab === 'processes' ? 'Expedientes' : 'Equipo legal'}
            </h2>
            <p className="mt-1 text-sm text-[#626967]">
              {adminTab === 'requests' ? 'Revisa y prioriza las solicitudes comerciales pendientes.' : adminTab === 'contacts' ? 'Primero empresas y clientes corporativos; después, personas y sus fichas.' : adminTab === 'processes' ? 'Gestiona los expedientes activos y consulta sus perfiles para ver los casos finalizados.' : 'Consulta responsables, perfiles y carga de trabajo del equipo.'}
            </p>
          </div>
        )}
        
        {selectedCompany ? (
          <CompanyRecordView 
            company={selectedCompany} 
            leads={leads} 
            processes={processes} 
            onBack={() => setSelectedCompany(null)} 
            onOpenContact={(lead) => { setSelectedCompany(null); setSelectedLead(lead); }} 
            onOpenProcess={(process) => setSelectedWorkflowProcess(process)}
            onAddContact={(newContact) => onAddManualLead(newContact)}
            onAddNote={(leadId, text, author) => onAddInternalNote(leadId, text, author)}
            onCreateProcess={(comp) => handleOpenConvertModal(null, comp)}
          />
        ) : selectedWorkflowProcess ? (
          <WorkflowBoard 
            process={selectedWorkflowProcess} 
            lawyers={lawyers} 
            onBack={() => setSelectedWorkflowProcess(null)} 
            onBackLabel={selectedLead ? 'Volver al perfil del cliente' : selectedCompany ? 'Volver al perfil corporativo' : 'Volver a expedientes'} 
          />
        ) : selectedLead ? (
          selectedLeadOrigin === 'requests' ? (
            <RequestDetailView
              lead={selectedLead}
              lawyers={lawyers}
              processes={processes}
              allLeads={leads}
              onBack={() => setSelectedLead(null)}
              onBackLabel="Volver a solicitudes"
              onUpdateLeadStatus={handleStatusChange}
              onUpdateLeadLawyer={handleLeadLawyerChange}
              onUpdateLeadBudget={handleLeadBudgetChange}
              onAddLeadDocument={handleLeadDocumentAdd}
              onUpdateLeadDocumentStatus={handleLeadDocumentStatusChange}
              onAddNote={(leadId, text, author) => {
                onAddInternalNote(leadId, text, author);
                setSelectedLead(prev => prev && prev.id === leadId ? { ...prev, internalNotes: [...prev.internalNotes, { id: 'note-' + Date.now(), author, text, timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) }] } : prev);
              }}
              onCreateProcess={handleConfirmConvert}
              onOpenProcess={(proc) => setSelectedWorkflowProcess(proc)}
              onOpenCompany={(company) => { setSelectedLead(null); setSelectedCompany(company); setContactDirectoryView('companies'); setAdminTab('contacts'); }}
            />
          ) : (
            <ClientRecordView 
              lead={selectedLead} 
              processes={processes} 
              allLeads={leads}
              onBack={() => setSelectedLead(null)} 
              onBackLabel="Volver al directorio"
              onOpenCompany={(company) => { setSelectedLead(null); setSelectedCompany(company); setContactDirectoryView('companies'); setAdminTab('contacts'); }} 
              onOpenProcess={setSelectedWorkflowProcess} 
              onOpenContact={(contact) => { setSelectedLead(contact); setSelectedLeadOrigin('contacts'); }}
              onAddNote={(leadId, text, author) => { 
                onAddInternalNote(leadId, text, author); 
                setSelectedLead(prev => prev && prev.id === leadId ? { ...prev, internalNotes: [...prev.internalNotes, { id: 'note-' + Date.now(), author, text, timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) }] } : prev); 
              }} 
              onCreateProcess={(l) => handleOpenConvertModal(l)}
            />
          )
        ) : adminTab === 'requests' ? (
          <>
            {/* Solicitudes: prioridad operativa, sin categoría de cliente activo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <button type="button" onClick={() => selectQuickFilter('new')} aria-pressed={quickFilter === 'new'} className={`text-left p-4 rounded-xl border shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${quickFilter === 'new' ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-200 shadow-md' : 'bg-white border-amber-200 hover:border-amber-400 hover:shadow-md'}`}>
                <div className="text-xs font-semibold text-amber-800 tracking-wide">Nuevas / sin atender</div><div className="mt-1 text-2xl font-extrabold text-slate-950 tabular-nums">{newRequests}</div><div className="mt-1 text-xs text-slate-500">Requieren primera revisión</div>
              </button>
              <button type="button" onClick={() => selectQuickFilter('followup')} aria-pressed={quickFilter === 'followup'} className={`text-left p-4 rounded-xl border shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${quickFilter === 'followup' ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200 shadow-md' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'}`}>
                <div className="text-xs font-semibold text-slate-600 tracking-wide">En seguimiento</div><div className="mt-1 text-2xl font-extrabold text-blue-700 tabular-nums">{inPipeline}</div><div className="mt-1 text-xs text-slate-500">Evaluaciones y propuestas pendientes</div>
              </button>
              <button type="button" onClick={() => selectQuickFilter('meetings')} aria-pressed={quickFilter === 'meetings'} className={`text-left p-4 rounded-xl border shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${quickFilter === 'meetings' ? 'bg-violet-50 border-violet-500 ring-2 ring-violet-200 shadow-md' : 'bg-white border-slate-200 hover:border-violet-300 hover:shadow-md'}`}>
                <div className="text-xs font-semibold text-slate-600 tracking-wide">Reuniones programadas</div><div className="mt-1 text-2xl font-extrabold text-slate-950 tabular-nums">{sessionsScheduled}</div><div className="mt-1 text-xs text-slate-500">Solicitudes con reunión agendada</div>
              </button>
              <button type="button" onClick={() => selectQuickFilter('all')} aria-pressed={quickFilter === 'all'} className={`text-left p-4 rounded-xl border shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${quickFilter === 'all' ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-200 shadow-md' : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-md'}`}>
                <div className="text-xs font-semibold text-slate-600 tracking-wide">Total de solicitudes</div><div className="mt-1 text-2xl font-extrabold text-slate-950 tabular-nums">{leads.filter(l => l.status !== 'cliente_activo').length}</div><div className="mt-1 text-xs text-slate-500">Todas las solicitudes recibidas</div>
              </button>
            </div>

        {/* Filter and View Mode Switcher */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por contacto, empresa, correo o sector..."
                className="w-full pl-9 pr-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-[#3e4543] focus:outline-none focus:bg-white"
              />
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-neutral-500">Etapa:</span>
              <select
                value={selectedStageFilter}
                onChange={(e) => setSelectedStageFilter(e.target.value)}
                className="bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-none"
              >
                <option value="all">Todas las etapas</option>
                {STAGES_CONFIG.map(st => (
                  <option key={st.id} value={st.id}>{st.label}</option>
                ))}
              </select>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-neutral-500">Sector:</span>
              <select
                value={selectedSectorFilter}
                onChange={(e) => setSelectedSectorFilter(e.target.value)}
                className="bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-none max-w-[160px] truncate"
              >
                <option value="all">Todos los sectores</option>
                {COMMON_BUSINESS_SECTORS.map(sec => {
                  const val = sec.id === 'otro' ? 'Otro' : sec.name;
                  return (
                    <option key={sec.id} value={val}>{sec.name}</option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* View switcher: list first, stages optional */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg shrink-0 border border-neutral-200 self-end md:self-auto">
            <button
              onClick={() => setActiveView('table')}
              className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${activeView === 'table' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'}`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Vista de lista</span>
            </button>
            <button
              onClick={() => setActiveView('pipeline')}
              className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${activeView === 'pipeline' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Etapas de seguimiento</span>
            </button>
          </div>

                </div>

        {/* VIEW 1: PIPELINE / KANBAN */}
        {activeView === 'pipeline' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-6">
            {STAGES_CONFIG.map((stage) => {
              const stageLeads = filteredLeads.filter(l => l.status === stage.id);
              return (
                <div 
                  key={stage.id} 
                  className="bg-neutral-50/80 rounded-xl border border-neutral-200 p-3 flex flex-col min-w-0"
                >
                  {/* Column Header */}
                  <div className="pb-3 mb-3 border-b border-neutral-200/90 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-neutral-900">
                        {stage.label}
                      </h3>
                      <p className="text-[10px] text-neutral-400 font-normal">
                        {stage.desc}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-neutral-200 rounded-full text-neutral-800 tabular-nums">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Cards inside stage */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
                    {stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => {
                          setSelectedLead(lead);
                          setSelectedLeadOrigin('requests');
                        }}
                        className="bg-white p-4 rounded-xl border border-slate-200/90 hover:border-[#0071ce]/50 shadow-md hover:shadow-lg transition-all cursor-pointer space-y-2 group"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-[#3e4543] group-hover:text-neutral-800 transition-colors line-clamp-1">
                            {lead.company}
                          </h4>
                          <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                            {lead.calculatedRiskScore}/100
                          </span>
                        </div>

                        <div className="text-[11px] text-neutral-600 font-medium truncate">
                          {lead.fullName}
                        </div>

                        <div className="text-[10px] text-neutral-400 truncate font-mono">
                          {lead.stage} · {lead.industry}
                        </div>

                        {/* Areas tags */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {lead.areasOfInterest.slice(0, 2).map((area, i) => (
                            <span key={i} className="text-[9px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                              {area}
                            </span>
                          ))}
                          {lead.areasOfInterest.length > 2 && (
                            <span className="text-[9px] text-neutral-400">
                              +{lead.areasOfInterest.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Bottom card info & Convert action */}
                        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                          <span>{lead.createdAt.slice(5, 10)}</span>
                          <span className="flex items-center gap-1 text-neutral-600 font-sans">
                            <MessageSquare className="w-2.5 h-2.5" />
                            <span>{lead.internalNotes.length}</span>
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenConvertModal(lead);
                          }}
                          className="w-full mt-1.5 py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-[#0071ce] text-[#0071ce] hover:text-white border border-blue-200 text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                          title="Convertir esta solicitud en expediente formal sin duplicidad de datos"
                        >
                          <Workflow className="w-3 h-3" />
                          <span>Crear Expediente</span>
                        </button>
                      </div>
                    ))}

                    {stageLeads.length === 0 && (
                      <div className="p-4 text-center text-xs text-neutral-400 italic">
                        Sin solicitudes en esta etapa
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: HIGH-DENSITY TABLE */}
        {activeView === 'table' && (
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-left border-collapse text-xs">
                <colgroup>
                  <col style={{ width: '22%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '17%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '16%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '10%' }} />
                </colgroup>
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Empresa / Contacto</th>
                    <th className="py-3 px-4">Etapa del Negocio</th>
                    <th className="py-3 px-4">Áreas Marcadas</th>
                    <th className="py-3 px-4">Riesgo Calculado</th>
                    <th className="py-3 px-4">Etapa actual</th>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-neutral-700">
                  {[...filteredLeads].filter(lead => lead.status !== 'cliente_activo').sort((a,b) => { const order: Record<string, number> = { nuevo_lead: 0, diagnostico_enviado: 1, sesion_programada: 2, propuesta_presentada: 3 }; return (order[a.status] ?? 99) - (order[b.status] ?? 99) || a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' }); }).map((lead) => (
                    <tr 
                      key={lead.id} 
                      onClick={() => {
                        setSelectedLead(lead);
                        setSelectedLeadOrigin('requests');
                      }}
                      className="hover:bg-neutral-50/70 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#3e4543]">{lead.company}</div>
                        <div className="text-[11px] text-neutral-500">{lead.fullName} · {lead.email}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {lead.stage}
                        <div className="text-neutral-400 text-[10px] font-sans">{lead.industry}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {lead.areasOfInterest.map((a, i) => (
                            <span key={i} className="text-[10px] bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded">
                              {a}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums font-semibold">
                        <span className={lead.calculatedRiskScore >= 70 ? 'text-red-700' : 'text-neutral-800'}>
                          {lead.calculatedRiskScore} / 100
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-medium text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                          {STAGES_CONFIG.find(s => s.id === lead.status)?.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-400 text-[11px]">
                        {lead.createdAt}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenConvertModal(lead);
                            }}
                            className="px-2.5 py-1 text-xs font-bold text-[#0071ce] bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Convertir esta solicitud en expediente formal sin duplicidad de datos"
                          >
                            <Workflow className="w-3 h-3" />
                            <span>Expediente</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLead(lead);
                              setSelectedLeadOrigin('requests');
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-neutral-900 hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors cursor-pointer"
                          >
                            Ver Detalle
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
          </>
        ) : adminTab === 'contacts' ? (
          <section className="w-full min-w-0 space-y-5">
            {(() => {
              // Helper to normalize strings for robust grouping
              const normStr = (s?: string) => (s || '').trim().toLowerCase().replace(/\s+/g, ' ');

              // 1. Group leads into companies
              const companyMap = new Map<string, {
                name: string;
                normalizedName: string;
                contacts: Lead[];
                primaryContact?: Lead;
                industry: string;
                stage: string;
                rif?: string;
                relatedProcesses: LegalProcess[];
                activeProcesses: LegalProcess[];
                completedProcesses: LegalProcess[];
                assignedLawyers: string[];
                isClientActive: boolean;
              }>();

              leads.forEach(lead => {
                const compName = lead.company?.trim() || '';
                if (!compName) return;
                const key = normStr(compName);

                if (!companyMap.has(key)) {
                  companyMap.set(key, {
                    name: compName,
                    normalizedName: key,
                    contacts: [],
                    industry: lead.industry || 'PYME General',
                    stage: lead.stage || 'En crecimiento',
                    rif: lead.rif,
                    relatedProcesses: [],
                    activeProcesses: [],
                    completedProcesses: [],
                    assignedLawyers: [],
                    isClientActive: false
                  });
                }

                const comp = companyMap.get(key)!;
                comp.contacts.push(lead);
                if (lead.isPrimaryContact || !comp.primaryContact) {
                  comp.primaryContact = lead;
                }
                if (lead.rif && !comp.rif) comp.rif = lead.rif;
                if (lead.status === 'cliente_activo') comp.isClientActive = true;
              });

              // Link processes to companies
              companyMap.forEach(comp => {
                const emails = new Set(comp.contacts.map(c => c.email.toLowerCase()));
                const names = new Set(comp.contacts.map(c => c.fullName.toLowerCase()));

                comp.relatedProcesses = processes.filter(p => 
                  normStr(p.companyName) === comp.normalizedName ||
                  emails.has((p.clientEmail || '').toLowerCase()) ||
                  names.has((p.clientName || '').toLowerCase())
                );
                comp.activeProcesses = comp.relatedProcesses.filter(p => p.status !== 'completado');
                comp.completedProcesses = comp.relatedProcesses.filter(p => p.status === 'completado');
                comp.assignedLawyers = Array.from(new Set(comp.relatedProcesses.map(p => p.assignedLawyer).filter(Boolean)));
              });

              const companiesList = Array.from(companyMap.values());

              // 2. Filter Companies
              const filteredCompanies = companiesList.filter(comp => {
                const q = searchQuery.toLowerCase().trim();
                const matchesSearch = !q || 
                  comp.name.toLowerCase().includes(q) ||
                  comp.industry.toLowerCase().includes(q) ||
                  (comp.rif && comp.rif.toLowerCase().includes(q)) ||
                  comp.contacts.some(c => 
                    c.fullName.toLowerCase().includes(q) ||
                    c.email.toLowerCase().includes(q) ||
                    (c.phone && c.phone.toLowerCase().includes(q)) ||
                    (c.jobTitle && c.jobTitle.toLowerCase().includes(q))
                  );

                const matchesSector = contactSectorFilter === 'all' || 
                  comp.industry.toLowerCase().includes(contactSectorFilter.toLowerCase());

                const matchesStatus = contactStatusFilter === 'all' ||
                  (contactStatusFilter === 'active_cases' && comp.activeProcesses.length > 0) ||
                  (contactStatusFilter === 'active_clients' && comp.isClientActive);

                return matchesSearch && matchesSector && matchesStatus;
              }).sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

              // 3. Filter People
              const filteredPeople = leads.filter(lead => {
                const q = searchQuery.toLowerCase().trim();
                const matchesSearch = !q ||
                  lead.fullName.toLowerCase().includes(q) ||
                  lead.company.toLowerCase().includes(q) ||
                  lead.email.toLowerCase().includes(q) ||
                  (lead.phone && lead.phone.toLowerCase().includes(q)) ||
                  (lead.jobTitle && lead.jobTitle.toLowerCase().includes(q)) ||
                  lead.industry.toLowerCase().includes(q);

                const matchesSector = contactSectorFilter === 'all' || 
                  lead.industry.toLowerCase().includes(contactSectorFilter.toLowerCase());

                const leadProcesses = processes.filter(p => 
                  (p.clientEmail || '').toLowerCase() === lead.email.toLowerCase() ||
                  (p.clientName || '').toLowerCase() === lead.fullName.toLowerCase()
                );
                const hasActiveCases = leadProcesses.some(p => p.status !== 'completado');

                const matchesStatus = contactStatusFilter === 'all' ||
                  (contactStatusFilter === 'active_cases' && hasActiveCases) ||
                  (contactStatusFilter === 'active_clients' && lead.status === 'cliente_activo');

                return matchesSearch && matchesSector && matchesStatus;
              }).sort((a, b) => a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' }));

              const handleQuickCopy = (e: React.MouseEvent, email: string) => {
                e.stopPropagation();
                navigator.clipboard.writeText(email);
                setCopiedEmail(email);
                setTimeout(() => setCopiedEmail(null), 2000);
              };

              return (
                <div className="space-y-4">
                  
                  {/* Top Bar: Selector de Directorio (Empresas vs Personas) & Acciones */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-xs">
                    
                    {/* Segmented view switcher */}
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setContactDirectoryView('companies')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                          contactDirectoryView === 'companies'
                            ? 'bg-white text-[#0071ce] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                        <span>Empresas</span>
                        <span className="bg-blue-50 text-[#0071ce] px-2 py-0.5 rounded-full text-[11px] font-mono font-bold">
                          {companiesList.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setContactDirectoryView('people')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                          contactDirectoryView === 'people'
                            ? 'bg-white text-[#0071ce] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        <span>Personas</span>
                        <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold">
                          {leads.length}
                        </span>
                      </button>
                    </div>

                    {/* Quick Action Button */}
                    <button
                      type="button"
                      onClick={() => setShowAddLeadModal(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0071ce] hover:bg-[#0060b0] text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{contactDirectoryView === 'companies' ? 'Nueva empresa / contacto' : 'Nuevo contacto'}</span>
                    </button>
                  </div>

                  {/* Search and Filters Bar */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    
                    {/* Search input */}
                    <div className="relative flex-1 max-w-lg">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={
                          contactDirectoryView === 'companies'
                            ? 'Buscar por empresa, contacto, correo, RIF o sector...'
                            : 'Buscar por persona, cargo, empresa, correo o teléfono...'
                        }
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0071ce] focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    {/* Filter dropdowns */}
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={contactSectorFilter}
                        onChange={(e) => setContactSectorFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-[#0071ce] cursor-pointer"
                      >
                        <option value="all">Todos los sectores</option>
                        {COMMON_BUSINESS_SECTORS.map(sec => (
                          <option key={sec.id} value={sec.id === 'otro' ? 'Otro' : sec.name}>
                            {sec.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={contactStatusFilter}
                        onChange={(e) => setContactStatusFilter(e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-[#0071ce] cursor-pointer"
                      >
                        <option value="all">Todos los estados</option>
                        <option value="active_cases">Con trámites activos</option>
                        <option value="active_clients">Clientes activos</option>
                      </select>

                      {(searchQuery || contactSectorFilter !== 'all' || contactStatusFilter !== 'all') && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setContactSectorFilter('all');
                            setContactStatusFilter('all');
                          }}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1.5 rounded hover:bg-slate-100 cursor-pointer"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>

                  </div>

                  {/* VIEW 1: COMPANIES TABLE (High-density, coherent, 1-to-N relationships) */}
                  {contactDirectoryView === 'companies' && (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full table-fixed border-collapse text-left text-xs">
                          <colgroup>
                            <col style={{ width: '25%' }} />
                            <col style={{ width: '16%' }} />
                            <col style={{ width: '25%' }} />
                            <col style={{ width: '14%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '10%' }} />
                          </colgroup>
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                              <th className="py-3.5 px-4">Empresa / Organización</th>
                              <th className="py-3.5 px-4">Sector & Etapa</th>
                              <th className="py-3.5 px-4">Contactos Vinculados</th>
                              <th className="py-3.5 px-4">Abogado(a) Asignado</th>
                              <th className="py-3.5 px-4">Expedientes</th>
                              <th className="py-3.5 px-4 text-right">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {filteredCompanies.map((comp) => {
                              const isAccountActive = comp.isClientActive || comp.activeProcesses.length > 0;
                              const primaryLawyer = comp.assignedLawyers[0] || 'José Rafael Vásquez';

                              return (
                                <tr
                                  key={comp.normalizedName}
                                  onClick={() => setSelectedCompany(comp.name)}
                                  className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                                >
                                  {/* Company Name & RIF */}
                                  <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className="h-9 w-9 rounded-xl bg-slate-100 text-[#0071ce] flex items-center justify-center shrink-0 border border-slate-200/80 group-hover:border-[#0071ce]/40 transition-colors">
                                        <Building2 className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="font-bold text-slate-900 group-hover:text-[#0071ce] transition-colors truncate">
                                          {comp.name}
                                        </div>
                                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                                          <span>{comp.rif ? `RIF: ${comp.rif}` : 'Sin RIF registrado'}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Sector & Stage */}
                                  <td className="py-3.5 px-4">
                                    <div className="font-medium text-slate-800 truncate">
                                      {comp.industry}
                                    </div>
                                    <div className="text-[11px] text-slate-400 font-mono">
                                      {comp.stage}
                                    </div>
                                  </td>

                                  {/* 1-to-N Contacts representation */}
                                  <td className="py-3.5 px-4">
                                    <div className="flex flex-col gap-1">
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        {comp.contacts.slice(0, 2).map((contact) => (
                                          <button
                                            key={contact.id}
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedLead(contact);
                                            }}
                                            className="inline-flex items-center gap-1 bg-slate-100 hover:bg-blue-100 text-slate-800 hover:text-blue-900 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer"
                                            title={`Abrir ficha de ${contact.fullName}`}
                                          >
                                            {contact.isPrimaryContact && (
                                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500 shrink-0" />
                                            )}
                                            <span className="truncate max-w-[130px]">{contact.fullName}</span>
                                            {contact.jobTitle && (
                                              <span className="text-[9px] text-slate-500 font-normal">
                                                ({contact.jobTitle.split(' ')[0]})
                                              </span>
                                            )}
                                          </button>
                                        ))}

                                        {comp.contacts.length > 2 && (
                                          <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
                                            +{comp.contacts.length - 2}
                                          </span>
                                        )}
                                      </div>

                                      <div className="text-[10px] text-slate-400">
                                        {comp.contacts.length} {comp.contacts.length === 1 ? 'contacto registrado' : 'contactos en la cuenta'}
                                      </div>
                                    </div>
                                  </td>

                                  {/* Assigned Lawyer */}
                                  <td className="py-3.5 px-4">
                                    <div className="font-semibold text-slate-800 truncate flex items-center gap-1.5">
                                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <span className="truncate">{primaryLawyer}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      {comp.assignedLawyers.length > 1 ? `+${comp.assignedLawyers.length - 1} en equipo` : 'Líder de cuenta'}
                                    </div>
                                  </td>

                                  {/* Processes Badge */}
                                  <td className="py-3.5 px-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                      comp.activeProcesses.length > 0
                                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      {comp.activeProcesses.length} activos · {comp.completedProcesses.length} cerrados
                                    </span>
                                  </td>

                                  {/* Action */}
                                  <td className="py-3.5 px-4 text-right">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedCompany(comp.name);
                                      }}
                                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#0071ce] hover:text-[#004f91] bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                                    >
                                      <span>Ver empresa</span>
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}

                            {filteredCompanies.length === 0 && (
                              <tr>
                                <td colSpan={6} className="py-12 text-center text-slate-400">
                                  <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                  <p className="font-semibold text-slate-600">No se encontraron empresas con esos criterios</p>
                                  <p className="text-xs text-slate-400 mt-1">Prueba ajustando los términos de búsqueda o los filtros.</p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* VIEW 2: PEOPLE TABLE (High-density, coherent with companies) */}
                  {contactDirectoryView === 'people' && (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full table-fixed border-collapse text-left text-xs">
                          <colgroup>
                            <col style={{ width: '25%' }} />
                            <col style={{ width: '20%' }} />
                            <col style={{ width: '22%' }} />
                            <col style={{ width: '13%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '10%' }} />
                          </colgroup>
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                              <th className="py-3.5 px-4">Persona / Cargo</th>
                              <th className="py-3.5 px-4">Empresa Vinculada</th>
                              <th className="py-3.5 px-4">Canales de Contacto</th>
                              <th className="py-3.5 px-4">Trámites</th>
                              <th className="py-3.5 px-4">Estado</th>
                              <th className="py-3.5 px-4 text-right">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {filteredPeople.map((lead) => {
                              const related = processes.filter(p => 
                                (p.clientEmail || '').toLowerCase() === lead.email.toLowerCase() || 
                                (p.clientName || '').toLowerCase() === lead.fullName.toLowerCase()
                              );
                              const activeCases = related.filter(p => p.status !== 'completado').length;

                              return (
                                <tr
                                  key={lead.id}
                                  onClick={() => {
                                    setSelectedLead(lead);
                                    setSelectedLeadOrigin('contacts');
                                  }}
                                  className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                                >
                                  {/* Person & Job Title */}
                                  <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 font-bold text-xs border border-slate-200">
                                        {lead.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="font-bold text-slate-900 group-hover:text-[#0071ce] transition-colors truncate flex items-center gap-1.5">
                                          <span>{lead.fullName}</span>
                                          {lead.isPrimaryContact && (
                                            <span title="Contacto Principal">
                                              <Star className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-[11px] text-slate-500 truncate">
                                          {lead.jobTitle || 'Contacto corporativo'}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Linked Company */}
                                  <td className="py-3.5 px-4">
                                    {lead.company ? (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedCompany(lead.company);
                                        }}
                                        className="font-semibold text-[#0071ce] hover:underline text-left truncate max-w-full block cursor-pointer"
                                        title={`Abrir perfil de ${lead.company}`}
                                      >
                                        <span className="flex items-center gap-1">
                                          <Building2 className="w-3 h-3 shrink-0" />
                                          <span className="truncate">{lead.company}</span>
                                        </span>
                                      </button>
                                    ) : (
                                      <span className="text-slate-400 italic">Particular</span>
                                    )}
                                    <div className="text-[10px] text-slate-400 font-mono">
                                      {lead.industry}
                                    </div>
                                  </td>

                                  {/* Contact Channels */}
                                  <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-1.5 text-slate-600">
                                      <span className="truncate font-mono text-[11px]">{lead.email}</span>
                                      <button
                                        type="button"
                                        onClick={(e) => handleQuickCopy(e, lead.email)}
                                        className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors"
                                        title="Copiar correo"
                                      >
                                        {copiedEmail === lead.email ? (
                                          <Check className="w-3 h-3 text-emerald-600" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>
                                    </div>
                                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                      <Phone className="w-3 h-3 text-slate-300 shrink-0" />
                                      <span>{lead.phone || 'Sin teléfono'}</span>
                                    </div>
                                  </td>

                                  {/* Processes */}
                                  <td className="py-3.5 px-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                      activeCases > 0 ? 'bg-blue-50 text-blue-800' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      {activeCases} activos · {related.length} total
                                    </span>
                                  </td>

                                  {/* Status */}
                                  <td className="py-3.5 px-4">
                                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                                      lead.status === 'cliente_activo' 
                                        ? 'bg-emerald-50 text-emerald-800' 
                                        : 'bg-slate-100 text-slate-700'
                                    }`}>
                                      {lead.status === 'cliente_activo' ? 'Cliente activo' : 'Contacto'}
                                    </span>
                                  </td>

                                  {/* Action */}
                                  <td className="py-3.5 px-4 text-right">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedLead(lead);
                                        setSelectedLeadOrigin('contacts');
                                      }}
                                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-[#0071ce] bg-white hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                                    >
                                      <span>Ver ficha</span>
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}

                            {filteredPeople.length === 0 && (
                              <tr>
                                <td colSpan={6} className="py-12 text-center text-slate-400">
                                  <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                  <p className="font-semibold text-slate-600">No se encontraron personas con esos criterios</p>
                                  <p className="text-xs text-slate-400 mt-1">Prueba ajustando los términos de búsqueda o los filtros.</p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              );
            })()}
          </section>
        ) : adminTab === 'lawyers' ? (
          <div className="space-y-5">
            {selectedLawyer ? (
              <div className="space-y-4">
                <button type="button" onClick={() => setSelectedLawyer(null)} className="text-sm font-semibold text-[#3e4543] hover:underline">← Volver al equipo legal</button>
                {(() => {
                  const assignedCases = processes.filter(p => (p.assignedLawyer || '').trim().toLowerCase() === selectedLawyer.trim().toLowerCase());
                  const activeCases = assignedCases.filter(p => p.status !== 'completado');
                  const closedCases = assignedCases.filter(p => p.status === 'completado');
                  const profile = lawyerProfileDraft;
                  return <div className="space-y-4">
                    <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div><div className="text-xs uppercase tracking-wider text-neutral-500">Perfil del abogado</div><h2 className="mt-1 text-2xl font-bold text-[#3e4543]">{selectedLawyer}</h2><p className="mt-1 text-sm text-neutral-500">{profile.specialty || 'Especialidad no indicada'}</p></div>
                        <div className="grid grid-cols-2 gap-2"><div className="rounded-xl bg-blue-50 p-3"><div className="text-xs text-blue-800">Casos activos</div><div className="text-2xl font-bold text-blue-950">{activeCases.length}</div></div><div className="rounded-xl bg-neutral-100 p-3"><div className="text-xs text-neutral-600">Completados</div><div className="text-2xl font-bold text-neutral-900">{closedCases.length}</div></div></div>
                      </div>
                      <form className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3" onSubmit={e => { e.preventDefault(); setLawyerProfiles(prev => ({ ...prev, [selectedLawyer]: { ...lawyerProfileDraft } })); }}>
                        <label className="text-xs font-semibold text-neutral-700">Especialidad<input value={profile.specialty} onChange={e => setLawyerProfileDraft(p => ({ ...p, specialty: e.target.value }))} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal" placeholder="Ej. Corporativo, laboral..." /></label>
                        <label className="text-xs font-semibold text-neutral-700">Correo<input type="email" value={profile.email} onChange={e => setLawyerProfileDraft(p => ({ ...p, email: e.target.value }))} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal" placeholder="abogado@binlegal.com" /></label>
                        <label className="text-xs font-semibold text-neutral-700">Teléfono<input value={profile.phone} onChange={e => setLawyerProfileDraft(p => ({ ...p, phone: e.target.value }))} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal" placeholder="Teléfono de contacto" /></label>
                        <label className="text-xs font-semibold text-neutral-700 sm:col-span-2">Notas internas del perfil<textarea value={profile.notes} onChange={e => setLawyerProfileDraft(p => ({ ...p, notes: e.target.value }))} rows={3} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal" placeholder="Observaciones, responsabilidades, disponibilidad..." /></label>
                        <div className="sm:col-span-2 flex justify-end"><button type="submit" className="rounded-lg bg-[#3e4543] px-4 py-2 text-sm font-semibold text-white">Guardar perfil</button></div>
                      </form>
                      <div className="mt-5 border-t border-neutral-200 pt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"><div><div className="text-xs font-semibold text-neutral-700">Acceso a la cuenta</div><p className="mt-1 text-xs text-neutral-500">Solicita que Firebase envíe al abogado las instrucciones para restablecer su contraseña.</p></div><button type="button" disabled={resetEmailLoading || !profile.email.trim()} onClick={() => handleSendPasswordReset(profile.email)} className="rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold text-[#3e4543] hover:bg-neutral-100 disabled:opacity-50">{resetEmailLoading ? 'Enviando…' : 'Enviar recuperación de contraseña'}</button></div>
                        {accountActionMessage && <p role="status" className="mt-2 text-xs text-neutral-600">{accountActionMessage}</p>}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7 shadow-sm">
                      <h3 className="text-lg font-bold text-[#3e4543]">Asignar expediente</h3><p className="mt-1 text-sm text-neutral-500">Asigna desde el perfil un expediente existente que todavía no esté a cargo de este abogado.</p>
                      <form className="mt-3 flex flex-col sm:flex-row gap-2" onSubmit={e => { e.preventDefault(); const chosen = processes.find(p => p.id === profileProcessId); if (chosen && onUpdateProcessLawyer) { onUpdateProcessLawyer(chosen.id, selectedLawyer); setProfileProcessId(''); } }}>
                        <select value={profileProcessId} onChange={e => setProfileProcessId(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"><option value="">Seleccionar expediente…</option>{processes.filter(p => (p.assignedLawyer || '').trim().toLowerCase() !== selectedLawyer.trim().toLowerCase()).map(p => <option key={p.id} value={p.id}>{p.title} · {p.clientName || p.clientEmail} ({p.assignedLawyer || 'Sin asignar'})</option>)}</select>
                        <button type="submit" disabled={!profileProcessId || !onUpdateProcessLawyer} className="rounded-lg bg-[#3e4543] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Asignar a {selectedLawyer.split(' ')[0]}</button>
                      </form>
                    </div>
                    <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7 shadow-sm">
                      <h3 className="text-lg font-bold text-[#3e4543]">Casos asignados</h3><p className="mt-1 text-sm text-neutral-500">Activos y cerrados, con estado, progreso e hitos registrados.</p>
                      {assignedCases.length ? <div className="mt-4 space-y-3">{assignedCases.map(p => <div key={p.id} className="rounded-xl border border-neutral-200 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3"><div><div className="font-semibold text-neutral-900">{p.title}</div><div className="mt-1 text-sm text-neutral-600">{p.companyName || p.clientName || p.clientEmail} · {p.category}</div></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.status === 'completado' ? 'bg-emerald-50 text-emerald-800' : 'bg-blue-50 text-blue-800'}`}>{p.status === 'completado' ? 'Completado' : p.status.replace(/_/g, ' ')}</span></div>
                        <div className="mt-3 h-2 rounded-full bg-neutral-100 overflow-hidden"><div className="h-full bg-[#3e4543]" style={{ width: `${Math.max(0, Math.min(100, p.progress || 0))}%` }} /></div><div className="mt-1 text-xs text-neutral-500">{p.progress || 0}% · Actualizado: {p.updatedAt || 'Sin fecha'} · Próximo hito: {p.nextMilestone || 'No definido'}</div>
                        {p.milestones?.length ? <div className="mt-4 border-l-2 border-neutral-200 pl-4 space-y-3">{[...p.milestones].reverse().map((m, idx) => <div key={idx}><div className="text-xs font-semibold text-neutral-800">{m.title}</div><div className="text-xs text-neutral-500">{m.date} · {m.note}</div></div>)}</div> : <p className="mt-3 text-xs text-neutral-500">No hay hitos históricos registrados en este expediente.</p>}
                        <div className="mt-3 flex justify-end"><button type="button" onClick={() => { setAdminTab('processes'); setSelectedProcessToEdit(p); }} className="rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50">Gestionar expediente</button></div>
                      </div>)}</div> : <div className="mt-4 rounded-xl bg-neutral-50 p-5 text-sm text-neutral-600">No hay expedientes asignados a este abogado en los datos disponibles.</div>}
                    </div>
                  </div>;
                })()}
              </div>
            ) : (
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7 shadow-sm space-y-5">
                <div><h2 className="text-xl font-bold text-[#3e4543]">Equipo legal</h2><p className="mt-1 text-sm text-neutral-500">Abre cada perfil para consultar su carga de trabajo, historial de expedientes y datos profesionales.</p></div>
                <form className="flex flex-col sm:flex-row gap-2" onSubmit={e => { e.preventDefault(); const name = newLawyerName.trim(); if (name && !lawyers.some(l => l.toLowerCase() === name.toLowerCase())) setLawyers(prev => [...prev, name]); setNewLawyerName(''); }}>
                  <input value={newLawyerName} onChange={e => setNewLawyerName(e.target.value)} placeholder="Nombre del abogado/a" className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
                  <button type="submit" className="rounded-lg bg-[#3e4543] px-4 py-2 text-sm font-semibold text-white">Añadir abogado</button>
                </form>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {lawyers.map(lawyer => { const assigned = processes.filter(p => (p.assignedLawyer || '').trim().toLowerCase() === lawyer.trim().toLowerCase()); const active = assigned.filter(p => p.status !== 'completado').length; return <div key={lawyer} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4"><button type="button" onClick={() => setSelectedLawyer(lawyer)} className="w-full text-left"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e0effb] text-[#004f91] font-bold">{lawyer.split(' ').map(n => n[0]).slice(0,2).join('')}</div><div className="min-w-0"><div className="font-semibold text-sm text-neutral-900">{lawyer}</div><div className="text-xs text-neutral-500">{lawyerProfiles[lawyer]?.specialty || 'Ver perfil y casos'}</div></div></div><div className="mt-3 flex gap-3 text-xs text-neutral-600"><span>{active} activos</span><span>{assigned.length - active} completados</span></div></button></div>; })}
                </div>
                <p className="text-xs text-neutral-500">Los perfiles y la lista se guardan en este navegador; los expedientes y su historial se leen de los datos del CRM.</p>
              </div>
            )}
          </div>
        ) : (
          /* PROCESSES TAB FOR ADMIN */
          <div className="space-y-5">
            {(() => {
              const activeProcesses = processes.filter(p => p.status !== 'completado');
              const visibleProcesses = activeProcesses.filter(p => processQuickFilter === 'active' || p.status === processQuickFilter);
              const cards = [
                { id: 'active' as const, label: 'Expedientes en trámite', count: activeProcesses.length, desc: 'Trabajo legal activo', color: 'blue' },
                { id: 'redaccion' as const, label: 'En redacción', count: activeProcesses.filter(p => p.status === 'redaccion').length, desc: 'Documentos en preparación', color: 'violet' },
                { id: 'tramite_publico' as const, label: 'En organismo público', count: activeProcesses.filter(p => p.status === 'tramite_publico').length, desc: 'Gestión ante el organismo', color: 'teal' },
                { id: 'revision' as const, label: 'En revisión', count: activeProcesses.filter(p => p.status === 'revision').length, desc: 'Validación pendiente', color: 'amber' },
                { id: 'recaudos' as const, label: 'En recaudos', count: activeProcesses.filter(p => p.status === 'recaudos').length, desc: 'Documentación por reunir', color: 'slate' }
              ];
              const styles: Record<string, { active: string; idle: string }> = {
                blue: { active: 'bg-blue-50 border-blue-500 ring-2 ring-blue-100 shadow-md', idle: 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md' },
                violet: { active: 'bg-violet-50 border-violet-500 ring-2 ring-violet-100 shadow-md', idle: 'bg-white border-slate-200 hover:border-violet-300 hover:shadow-md' },
                teal: { active: 'bg-teal-50 border-teal-500 ring-2 ring-teal-100 shadow-md', idle: 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-md' },
                amber: { active: 'bg-amber-50 border-amber-500 ring-2 ring-amber-100 shadow-md', idle: 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-md' },
                slate: { active: 'bg-slate-100 border-slate-500 ring-2 ring-slate-100 shadow-md', idle: 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-md' }
              };
              return <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {cards.map(card => <button key={card.id} type="button" aria-pressed={processQuickFilter === card.id} onClick={() => setProcessQuickFilter(card.id)} className={`rounded-xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${processQuickFilter === card.id ? styles[card.color].active : styles[card.color].idle}`}>
                    <div className="text-xs font-semibold tracking-wide text-slate-700">{card.label}</div>
                    <div className="mt-1 text-2xl font-extrabold tabular-nums text-slate-950">{card.count}</div>
                    <div className="mt-1 text-xs text-slate-500">{card.desc}</div>
                  </button>)}
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.03]">
                  <div className="flex flex-col gap-2 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{cards.find(card => card.id === processQuickFilter)?.label}</h3>
                      <p className="text-xs text-slate-500">Selecciona el nombre de un trámite para abrir su expediente completo.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {visibleProcesses.length} {visibleProcesses.length === 1 ? 'expediente' : 'expedientes'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenConvertModal(null)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0071ce] hover:bg-[#005ba7] px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>⚡ Nuevo Expediente</span>
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed border-collapse text-left text-xs">
                      <colgroup><col style={{ width: '22%' }} /><col style={{ width: '13%' }} /><col style={{ width: '15%' }} /><col style={{ width: '14%' }} /><col style={{ width: '8%' }} /><col style={{ width: '14%' }} /><col style={{ width: '14%' }} /></colgroup>
                      <thead><tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs"><th className="px-4 py-3">Trámite</th><th className="px-4 py-3">Categoría</th><th className="px-4 py-3">Abogado líder</th><th className="px-4 py-3">Estado actual</th><th className="px-4 py-3">Avance</th><th className="px-4 py-3">Próximo hito</th><th className="px-4 py-3 text-right">Acciones</th></tr></thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {visibleProcesses.slice().sort((a,b) => (a.status === 'recaudos' ? 0 : a.status === 'redaccion' ? 1 : a.status === 'tramite_publico' ? 2 : a.status === 'revision' ? 3 : 4) - (b.status === 'recaudos' ? 0 : b.status === 'redaccion' ? 1 : b.status === 'tramite_publico' ? 2 : b.status === 'revision' ? 3 : 4) || a.title.localeCompare(b.title, 'es', { sensitivity: 'base' })).map(proc => <tr key={proc.id} className="cursor-pointer transition-colors duration-150 hover:bg-blue-50/70 focus-within:bg-blue-50/70" onClick={() => setSelectedWorkflowProcess(proc)}>
                          <td className="px-4 py-3"><button type="button" onClick={(e) => { e.stopPropagation(); setSelectedWorkflowProcess(proc); }} className="line-clamp-2 text-left font-bold text-blue-800 underline-offset-2 transition-colors hover:text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{proc.title}</button><div className="mt-1 truncate text-[11px] text-slate-500">{proc.clientName} · {proc.companyName || proc.clientEmail}</div></td>
                          <td className="break-words px-4 py-3 text-[11px]">{proc.category}</td>
                          <td className="break-words px-4 py-3 font-semibold text-slate-900">{proc.assignedLawyer || 'Sin asignar'}</td>
                          <td className="px-4 py-3"><span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase text-blue-800">{proc.status.replace('_', ' ')}</span></td>
                          <td className="px-4 py-3 font-mono font-bold tabular-nums">{proc.progress}%</td>
                          <td className="px-4 py-3"><div className="line-clamp-2 text-slate-600">{proc.nextMilestone || 'Sin hito definido'}</div></td>
                          <td className="px-4 py-3 text-right"><button type="button" onClick={(e) => { e.stopPropagation(); setSelectedProcessToEdit(proc); }} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-800 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Actualizar</button></td>
                        </tr>)}
                        {visibleProcesses.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">No hay expedientes en esta etapa. Los trámites finalizados se consultan desde los perfiles de cliente y empresa.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Expedientes finalizados: {processes.filter(p => p.status === 'completado').length}. Se conservan en el historial de la persona y de la empresa, no en la lista operativa de trámites activos.</p>
              </>;
            })()}
          </div>
        )}

        </main>
      </div>

      {/* ADD MANUAL LEAD MODAL */}
      {showAddLeadModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/65 backdrop-blur-xs animate-in fade-in overflow-y-auto"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddLeadModal(false);
          }}
        >
          <div 
            className="bg-white w-full max-w-xl rounded-2xl border border-neutral-200 shadow-2xl p-6 sm:p-8 max-h-[92dvh] overflow-y-auto relative animate-in zoom-in-95 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-4 border-b border-neutral-100 mb-5">
              <div>
                <h3 className="text-xl font-display font-extrabold text-[#3e4543]">
                  Registrar nuevo contacto
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Para llamadas comerciales, eventos o networking directo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddLeadModal(false)}
                className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-[#3e4543] flex items-center justify-center transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleSaveManualLead} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Nombre completo *</label>
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Ej. Gustavo Páez"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Empresa / Proyecto *</label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="Ej. Páez & Co Logística"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Correo electrónico *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="gustavo@paez.com"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+58 412 111 2233"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Etapa de la empresa</label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value as BusinessStage)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:bg-white"
                >
                  <option value="Idea / Pre-lanzamiento">Idea / Pre-lanzamiento</option>
                  <option value="Recién constituida">Recién constituida</option>
                  <option value="En crecimiento">En crecimiento</option>
                  <option value="Consolidada">Consolidada</option>
                </select>
              </div>

              {/* Segmented Sector Selector (Max 3 + Otro) */}
              <div className="pt-1 pb-1">
                <SectorSelector
                  compact={true}
                  selectedSectors={newSelectedSectors}
                  otherText={newOtherSectorText}
                  onSelectionChange={(sectors, other) => {
                    setNewSelectedSectors(sectors);
                    setNewOtherSectorText(other);
                  }}
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Notas iniciales</label>
                <textarea
                  rows={3}
                  value={newSituation}
                  onChange={(e) => setNewSituation(e.target.value)}
                  placeholder="Detalles de la conversación..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 font-medium text-neutral-600 hover:text-neutral-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-[#3e4543] rounded-lg hover:bg-[#323836] transition-colors shadow-xs"
                >
                  Guardar en Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

            {/* EDIT PROCESS STATUS MODAL FOR ADMIN */}
      {selectedProcessToEdit && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-lg rounded-2xl border border-neutral-200 shadow-2xl p-6 sm:p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-display font-extrabold text-[#3e4543]">
                  Actualizar Estatus de Expediente
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {selectedProcessToEdit.title} ({selectedProcessToEdit.companyName || selectedProcessToEdit.clientName})
                </p>
              </div>
              <button
                onClick={() => setSelectedProcessToEdit(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                const newSt = form.status.value as ProcessStatus;
                const newProg = Number(form.progress.value);
                const newMilestone = form.milestone.value;
                const newLawyer = form.assignedLawyer.value;
                onUpdateProcessStatus?.(selectedProcessToEdit.id, newSt, newProg, newMilestone);
                if (newLawyer && newLawyer !== selectedProcessToEdit.assignedLawyer) onUpdateProcessLawyer?.(selectedProcessToEdit.id, newLawyer);
                setSelectedProcessToEdit(null);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Fase del Trámite</label>
                <select
                  name="status"
                  defaultValue={selectedProcessToEdit.status}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none"
                >
                  <option value="recaudos">1. Recaudos (Consignación de recaudos)</option>
                  <option value="redaccion">2. Redacción (En redacción por equipo legal)</option>
                  <option value="tramite_publico">3. Ente Público (SAPI / Registro / Notaría)</option>
                  <option value="revision">4. Revisión (Revisión y visto bueno final)</option>
                  <option value="completado">5. Finalizado (Trámite entregado y blindado)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Porcentaje de Avance (0 - 100%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    name="progress"
                    defaultValue={selectedProcessToEdit.progress}
                    onChange={(e) => {
                      const display = document.getElementById('progress-val');
                      if (display) display.innerText = `${e.target.value}%`;
                    }}
                    className="flex-1 accent-neutral-900"
                  />
                  <span id="progress-val" className="font-mono font-bold text-sm w-12 text-right">
                    {selectedProcessToEdit.progress}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Abogado responsable</label>
                <select name="assignedLawyer" defaultValue={selectedProcessToEdit.assignedLawyer || ''} className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none">
                  {selectedProcessToEdit.assignedLawyer && !lawyers.includes(selectedProcessToEdit.assignedLawyer) && <option value={selectedProcessToEdit.assignedLawyer}>{selectedProcessToEdit.assignedLawyer} (actual)</option>}
                  <option value="">Sin asignar</option>{lawyers.map(lawyer => <option key={lawyer} value={lawyer}>{lawyer}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Próximo Hito para el Cliente</label>
                <input
                  type="text"
                  name="milestone"
                  defaultValue={selectedProcessToEdit.nextMilestone}
                  placeholder="Ej. Revisión y entrega de borrador v2..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProcessToEdit(null)}
                  className="px-4 py-2 font-medium text-neutral-600 hover:text-neutral-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-[#3e4543] rounded-lg hover:bg-[#323836] transition-colors shadow-xs"
                >
                  Guardar y Sincronizar en Vivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONVERT LEAD TO LEGAL PROCESS MODAL (Opción 1: Conexión Solicitud ➔ Expediente) */}
      <ConvertLeadToProcessModal
        isOpen={showConvertModal}
        onClose={() => {
          setShowConvertModal(false);
          setLeadToConvert(null);
          setCompanyToConvert('');
        }}
        lead={leadToConvert}
        defaultCompany={companyToConvert}
        lawyers={lawyers}
        allLeads={leads}
        onConfirm={handleConfirmConvert}
      />

    </div>
  );
};
