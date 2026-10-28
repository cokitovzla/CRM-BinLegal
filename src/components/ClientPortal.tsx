import React, { useState } from 'react';
import { LegalProcess, ProcessStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { processService } from '../services/processService';
import { CaseDocumentLibrary } from './CaseDocumentLibrary';
import { 
  Building, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Plus, 
  User, 
  ShieldCheck, 
  Calendar, 
  ChevronRight, 
  Download, 
  Sparkles,
  Layers,
  X
} from 'lucide-react';

interface ClientPortalProps {
  processes: LegalProcess[];
  onOpenNewProcessModal?: () => void;
  onBackToLanding: () => void;
}

const PROCESS_STEPS: Array<{ id: ProcessStatus; label: string; desc: string }> = [
  { id: 'recaudos', label: '1. Recaudos', desc: 'Consignación documental' },
  { id: 'redaccion', label: '2. Redacción', desc: 'Elaboración legal por abogados' },
  { id: 'tramite_publico', label: '3. Ente Público', desc: 'Registro / SAPI / Notaría' },
  { id: 'revision', label: '4. Revisión', desc: 'Ajustes y visto bueno final' },
  { id: 'completado', label: '5. Finalizado', desc: 'Documento entregado y blindado' }
];

export const ClientPortal: React.FC<ClientPortalProps> = ({
  processes,
  onBackToLanding
}) => {
  const { userProfile, currentUser, logout } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [selectedProcess, setSelectedProcess] = useState<LegalProcess | null>(null);

  // New Process Modal State
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<LegalProcess['category']>('Corporativo');
  const [newNotes, setNewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Todos', 'Corporativo', 'Propiedad Intelectual', 'Regulatorio', 'Laboral', 'Administrativo & Notarial'];

  const filteredProcesses = processes.filter(p => {
    const matchesCat = categoryFilter === 'Todos' || p.category === categoryFilter;
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'completed' ? p.status === 'completado' :
      p.status !== 'completado';
    return matchesCat && matchesStatus;
  });

  const total = processes.length;
  const inProgress = processes.filter(p => p.status !== 'completado').length;
  const completed = processes.filter(p => p.status === 'completado').length;
  const avgProgress = total > 0 
    ? Math.round(processes.reduce((acc, p) => acc + p.progress, 0) / total) 
    : 0;

  const handleCreateNewProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    const newProc: LegalProcess = {
      id: `proc-${Date.now()}`,
      userId: currentUser?.uid || userProfile?.userId || 'demo-client-uid-01',
      clientEmail: currentUser?.email || userProfile?.email || 'cliente@binlegal.com',
      clientName: userProfile?.displayName || 'Cliente',
      companyName: userProfile?.companyName || 'Empresa PYME',
      title: newTitle,
      category: newCategory,
      status: 'recaudos',
      progress: 15,
      assignedLawyer: 'José Rafael Vásquez & Equipo',
      nextMilestone: 'Revisión y solicitud de recaudos iniciales',
      targetDate: '15 días hábiles',
      documents: [
        { name: 'Ficha_Apertura_Expediente.pdf', category: 'General', date: new Date().toISOString().slice(0, 10), status: 'en_revision' }
      ],
      milestones: [
        { date: new Date().toISOString().slice(0, 10), title: 'Solicitud ingresada en plataforma', note: newNotes || 'Expediente creado en línea.' }
      ],
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10)
    };

    try {
      await processService.createProcess(newProc);
      setShowNewModal(false);
      setNewTitle('');
      setNewNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepIndex = (status: ProcessStatus) => {
    return PROCESS_STEPS.findIndex(s => s.id === status);
  };

  return (
    <div className="min-h-screen bg-neutral-100/70 text-neutral-900 pb-16">
      
      {/* Client Portal Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                <span>Mi Portal BinLegal</span>
                <span>·</span>
                <span>Expediente Digital</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-extrabold text-neutral-950">
                Hola, {userProfile?.displayName || 'Estimado Cliente'}
              </h1>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {userProfile?.companyName && (
                  <span className="text-xs font-semibold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
                    {userProfile.companyName}
                  </span>
                )}
                {userProfile?.industry && (
                  <span className="text-[11px] font-medium text-neutral-700 bg-neutral-50 px-2 py-0.5 rounded-md border border-neutral-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Sector: {userProfile.industry}</span>
                  </span>
                )}
                {userProfile?.isSubscribedNewsletter && (
                  <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    ✓ Boletín Activo
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowNewModal(true)}
                className="px-3.5 py-2 bg-[#0071ce] hover:bg-[#0060b0] text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Solicitar Nuevo Trámite</span>
              </button>

              <button
                onClick={onBackToLanding}
                className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-medium border border-neutral-200 transition-colors whitespace-nowrap cursor-pointer"
              >
                Volver a la Web
              </button>

              <button
                onClick={logout}
                className="px-2.5 py-2 text-neutral-500 hover:text-neutral-900 text-xs font-medium transition-colors cursor-pointer"
                title="Cerrar sesión"
              >
                Salir
              </button>
            </div>

          </div>

          {/* Metric KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-neutral-100">
            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
              <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                Total Expedientes
              </span>
              <div className="text-2xl font-display font-extrabold text-neutral-950 mt-1 tabular-nums">
                {total}
              </div>
            </div>

            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
              <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                En Curso
              </span>
              <div className="text-2xl font-display font-extrabold text-neutral-950 mt-1 tabular-nums">
                {inProgress}
              </div>
            </div>

            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
              <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                Finalizados & Blindados
              </span>
              <div className="text-2xl font-display font-extrabold text-neutral-950 mt-1 tabular-nums">
                {completed}
              </div>
            </div>

            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
              <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                Avance Global
              </span>
              <div className="text-2xl font-display font-extrabold text-neutral-950 mt-1 tabular-nums">
                {avgProgress}%
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Viewport */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        
        {/* Category & Status Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  categoryFilter === cat
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg shrink-0 border border-neutral-200">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                statusFilter === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
              }`}
            >
              Todos ({total})
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                statusFilter === 'in_progress' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
              }`}
            >
              En Curso ({inProgress})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                statusFilter === 'completed' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
              }`}
            >
              Completados ({completed})
            </button>
          </div>

        </div>

        {/* Process Cards Grid */}
        <div className="space-y-6">
          {filteredProcesses.map((proc) => {
            const currentStepIdx = getStepIndex(proc.status);
            return (
              <div
                key={proc.id}
                className="bg-white rounded-2xl border border-neutral-200/90 p-6 sm:p-8 hover:border-neutral-300 transition-all shadow-xs space-y-6"
              >
                {/* Process Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-1">
                      <span className="font-semibold text-neutral-900">{proc.category}</span>
                      <span>·</span>
                      <span>Ref: #{proc.id}</span>
                      <span>·</span>
                      <span>Iniciado: {proc.createdAt}</span>
                    </div>

                    <h3 className="text-xl font-display font-extrabold text-neutral-950">
                      {proc.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] font-semibold uppercase text-neutral-400">
                        Abogado Asignado
                      </div>
                      <div className="text-xs font-bold text-neutral-900">
                        {proc.assignedLawyer}
                      </div>
                    </div>

                    <div className="text-right pl-4 border-l border-neutral-200">
                      <div className="text-[10px] font-semibold uppercase text-neutral-400">
                        Avance
                      </div>
                      <div className="text-xl font-display font-extrabold text-neutral-950 tabular-nums">
                        {proc.progress}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5-Step Phase Stepper */}
                <div>
                  <div className="grid grid-cols-5 gap-2 sm:gap-4 mb-2">
                    {PROCESS_STEPS.map((step, idx) => {
                      const isPast = idx < currentStepIdx;
                      const isCurrent = idx === currentStepIdx;
                      return (
                        <div key={step.id} className="text-center">
                          <div className={`h-1.5 rounded-full mb-2 transition-all ${
                            isPast ? 'bg-[#0071ce]' :
                            isCurrent ? 'bg-[#0071ce]' :
                            'bg-neutral-200'
                          }`} />
                          <div className={`text-[11px] font-bold ${
                            isCurrent ? 'text-[#0071ce]' :
                            isPast ? 'text-neutral-700' :
                            'text-neutral-400'
                          }`}>
                            {step.label}
                          </div>
                          <div className="hidden sm:block text-[10px] text-neutral-400 mt-0.5 truncate">
                            {step.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Next Milestone & Target Date Banner */}
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start sm:items-center gap-2">
                    <Clock className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <span className="text-neutral-500">Próximo Hito: </span>
                      <strong className="text-neutral-900">{proc.nextMilestone}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-neutral-600 font-mono text-[11px] shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Entrega estimada: <strong className="text-neutral-900">{proc.targetDate}</strong></span>
                  </div>
                </div>

                {/* Documents & Milestones Drawer Toggle */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs border-t border-neutral-100">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{proc.documents?.length || 0} documentos / borradores anexados</span>
                  </div>

                  <button
                    onClick={() => setSelectedProcess(selectedProcess?.id === proc.id ? null : proc)}
                    className="font-semibold text-neutral-950 hover:underline flex items-center gap-1 self-end sm:self-auto"
                  >
                    <span>{selectedProcess?.id === proc.id ? 'Ocultar detalles' : 'Ver bitácora y documentos'}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedProcess?.id === proc.id ? 'rotate-90' : ''}`} />
                  </button>
                </div>

                {/* Expanded Details Drawer */}
                {selectedProcess?.id === proc.id && (
                  <div className="p-5 bg-neutral-50/70 rounded-xl border border-neutral-200 space-y-6 animate-in fade-in">
                    
                    {/* Documents list */}
                    <div>
                      <h4 className="text-xs font-bold text-neutral-950 uppercase tracking-wider mb-3">
                        Documentos y Entregables del Expediente
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {proc.documents?.map((doc, idx) => (
                          <div key={idx} className="p-3 bg-white rounded-lg border border-neutral-200 flex items-center justify-between gap-2">
                            <div className="truncate">
                              <div className="font-semibold text-xs text-neutral-900 truncate">
                                {doc.name}
                              </div>
                              <div className="text-[10px] text-neutral-400 font-mono">
                                {doc.category} · {doc.date}
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 shrink-0">
                              {doc.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <CaseDocumentLibrary process={proc} />

                    {/* Milestones log */}
                    <div>
                      <h4 className="text-xs font-bold text-neutral-950 uppercase tracking-wider mb-3">
                        Historial de Avance Legal
                      </h4>
                      <div className="space-y-2">
                        {proc.milestones?.map((m, idx) => (
                          <div key={idx} className="p-3 bg-white rounded-lg border border-neutral-200 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-neutral-900">{m.title}</span>
                              <span className="text-[10px] text-neutral-400 font-mono">{m.date}</span>
                            </div>
                            <p className="text-neutral-600 leading-relaxed">
                              {m.note}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })}

          {filteredProcesses.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-neutral-300 p-8">
              <FileText className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-neutral-800">
                No tienes trámites en esta categoría
              </h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-4">
                Puedes solicitar el inicio de un nuevo trámite legal o administrativo en cualquier momento.
              </p>
              <button
                onClick={() => setShowNewModal(true)}
                className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors"
              >
                Solicitar Primer Trámite
              </button>
            </div>
          )}
        </div>

      </div>

      {/* NEW PROCESS REQUEST MODAL */}
      {showNewModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-lg rounded-2xl border border-neutral-200 shadow-2xl p-6 sm:p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-display font-extrabold text-neutral-950">
                  Solicitar Nuevo Proceso Legal o Administrativo
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  José Rafael Vásquez y su equipo abrirán el expediente y te asignarán un abogado líder.
                </p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewProcess} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Nombre del Trámite o Requerimiento *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Redacción de Pacto de Socios y Esquema de Vesting"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Área / Especialidad *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:bg-white"
                >
                  <option value="Corporativo">Corporativo (Sociedades, Estatutos, Acciones)</option>
                  <option value="Propiedad Intelectual">Propiedad Intelectual (Marcas, Software, Patentes)</option>
                  <option value="Regulatorio">Regulatorio (Licencias, Permisología Municipal, Sanitaria)</option>
                  <option value="Laboral">Laboral (Contratos de Trabajo, Teletrabajo, Nómina)</option>
                  <option value="Administrativo & Notarial">Administrativo & Notarial (Poderes, Gestoría, Firmas)</option>
                  <option value="Mediación">Mediación & Negociación de Conflictos</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Detalles y Urgencia (opcional)
                </label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Describe el contexto, plazos o documentos con los que ya cuentas..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 font-medium text-neutral-600 hover:text-neutral-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs"
                >
                  {isSubmitting ? 'Registrando...' : 'Abrir Expediente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
