import React, { useState, useEffect } from 'react';
import { 
  X, 
  Workflow, 
  Building2, 
  UserRound, 
  Mail, 
  Calendar, 
  Briefcase, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import type { Lead, LegalProcess, LegalArea, ProcessStatus } from '../types';

interface ConvertLeadToProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead | null;
  defaultCompany?: string;
  lawyers: string[];
  allLeads?: Lead[];
  onConfirm: (
    newProcess: LegalProcess, 
    options: { markAsActive: boolean; addNote: boolean; leadId?: string }
  ) => void;
}

export const ConvertLeadToProcessModal: React.FC<ConvertLeadToProcessModalProps> = ({
  isOpen,
  onClose,
  lead,
  defaultCompany = '',
  lawyers,
  allLeads = [],
  onConfirm
}) => {
  if (!isOpen) return null;

  // Selected lead if opened without a preselected lead
  const [selectedLeadId, setSelectedLeadId] = useState<string>(lead?.id || '');

  // Effective lead based on selection or prop
  const currentLead = lead || allLeads.find(l => l.id === selectedLeadId) || null;

  const initialCompany = currentLead?.company || defaultCompany || '';
  const initialClientName = currentLead?.fullName || '';
  const initialEmail = currentLead?.email || '';

  // Determine smart suggested title & category based on lead's diagnostic areas
  const getSmartSuggestion = (leadData: Lead | null, comp: string) => {
    const companyLabel = comp.trim() || 'Empresa';
    if (!leadData || !leadData.areasOfInterest?.length) {
      return {
        title: `Estructuración Corporativa y Blindaje Legal — ${companyLabel}`,
        category: 'Corporativo' as LegalProcess['category'],
        milestone: 'Recopilación y validación de documentos constitutivos e identidad'
      };
    }

    const areas = leadData.areasOfInterest;
    if (areas.includes('Corporativo')) {
      return {
        title: `Adecuación Estatutaria y Gobernanza Societaria — ${companyLabel}`,
        category: 'Corporativo' as LegalProcess['category'],
        milestone: 'Revisión del acta constitutiva y redacción de reforma estatutaria'
      };
    }
    if (areas.includes('Propiedad Intelectual')) {
      return {
        title: `Registro de Marca y Protección de Signos Distintivos — ${companyLabel}`,
        category: 'Propiedad Intelectual' as LegalProcess['category'],
        milestone: 'Búsqueda fonética preliminar y consignación ante SAPI'
      };
    }
    if (areas.includes('Regulatorio')) {
      return {
        title: `Auditoría y Adecuación Regulatoria PYME — ${companyLabel}`,
        category: 'Regulatorio' as LegalProcess['category'],
        milestone: 'Levantamiento de permisos sectoriales y licencias pendientes'
      };
    }
    if (areas.includes('Laboral')) {
      return {
        title: `Blindaje Laboral y Estandarización de Contratos — ${companyLabel}`,
        category: 'Laboral' as LegalProcess['category'],
        milestone: 'Revisión de formatos de contratación y políticas laborales internas'
      };
    }
    if (areas.includes('Contratos')) {
      return {
        title: `Estandarización de Contratos Comerciales y Cláusulas — ${companyLabel}`,
        category: 'Contratos' as LegalProcess['category'],
        milestone: 'Elaboración de plantilla maestra de contratos de prestación de servicios'
      };
    }

    return {
      title: `Acompañamiento Legal Estratégico Integral — ${companyLabel}`,
      category: 'Corporativo' as LegalProcess['category'],
      milestone: 'Diagnóstico preliminar y plan de regularización jurídica'
    };
  };

  const defaultSuggestion = getSmartSuggestion(currentLead, initialCompany);

  // Form states
  const [companyName, setCompanyName] = useState(initialCompany);
  const [clientName, setClientName] = useState(initialClientName);
  const [clientEmail, setClientEmail] = useState(initialEmail);
  const [title, setTitle] = useState(defaultSuggestion.title);
  const [category, setCategory] = useState<LegalProcess['category']>(defaultSuggestion.category);
  const [assignedLawyer, setAssignedLawyer] = useState(lawyers[0] || 'Elena Marín');
  const [initialStatus, setInitialStatus] = useState<ProcessStatus>('recaudos');
  const [nextMilestone, setNextMilestone] = useState(defaultSuggestion.milestone);

  // Target date (+21 days default)
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d.toISOString().slice(0, 10);
  });

  const [markAsActive, setMarkAsActive] = useState(true);
  const [addAuditNote, setAddAuditNote] = useState(true);

  // When selected lead changes (if selector is used)
  useEffect(() => {
    if (currentLead) {
      setCompanyName(currentLead.company || '');
      setClientName(currentLead.fullName || '');
      setClientEmail(currentLead.email || '');
      const sug = getSmartSuggestion(currentLead, currentLead.company);
      setTitle(sug.title);
      setCategory(sug.category);
      setNextMilestone(sug.milestone);
    }
  }, [selectedLeadId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientEmail.trim()) return;

    const progressByStatus: Record<ProcessStatus, number> = {
      recaudos: 10,
      redaccion: 25,
      tramite_publico: 45,
      revision: 70,
      completado: 100
    };

    const todayStr = new Date().toISOString().slice(0, 10);

    const newProcess: LegalProcess = {
      id: `proc-${Date.now()}`,
      userId: currentLead?.id || `client-${Date.now()}`,
      clientEmail: clientEmail.trim(),
      clientName: clientName.trim() || 'Representante Legal',
      companyName: companyName.trim() || 'Empresa Cliente',
      title: title.trim(),
      category,
      status: initialStatus,
      progress: progressByStatus[initialStatus] ?? 10,
      assignedLawyer: assignedLawyer || 'Elena Marín',
      nextMilestone: nextMilestone.trim() || 'Revisión y consignación de recaudos',
      targetDate: targetDate || todayStr,
      documents: currentLead?.calculatedRiskScore ? [
        {
          name: `Diagnóstico Legal Estratégico - ${companyName || 'JurisNova'}.pdf`,
          category: 'Diagnóstico',
          date: todayStr,
          status: 'aprobado'
        }
      ] : [],
      milestones: [
        {
          date: todayStr,
          title: 'Apertura formal de expediente',
          note: `Expediente generado a partir de solicitud comercial. Abogado responsable: ${assignedLawyer}.`
        }
      ],
      activityHistory: [
        {
          id: `act-${Date.now()}`,
          date: todayStr,
          title: 'Expediente formalizado',
          description: `Asignado a ${assignedLawyer}. Plazo meta: ${targetDate}. Hito inicial: ${nextMilestone}`,
          actor: 'Elena Marín',
          role: 'Director Legal'
        }
      ],
      createdAt: todayStr,
      updatedAt: todayStr,
      openedBy: 'Elena Marín'
    };

    onConfirm(newProcess, {
      markAsActive,
      addNote: addAuditNote,
      leadId: currentLead?.id
    });

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-8 max-h-[92dvh] overflow-y-auto relative animate-in zoom-in-95 my-auto text-[#3e4543]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0071ce] border border-blue-200 shrink-0">
              <Workflow className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0071ce] bg-blue-50 px-2 py-0.5 rounded">
                  Plan Maestro · Opción 1
                </span>
                <span className="text-xs text-slate-500 font-medium">Cero duplicidad</span>
              </div>
              <h2 className="text-xl font-bold text-[#0b192c] mt-0.5">
                Convertir Solicitud en Expediente
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Lead selector if opened without a pre-selected lead */}
        {!lead && allLeads.length > 0 && (
          <div className="mb-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Seleccionar Solicitud / Prospecto a formalizar
            </label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0071ce]"
            >
              <option value="">-- Crear expediente desde cero / Sin solicitud --</option>
              {allLeads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.company} · {l.fullName} ({l.areasOfInterest?.join(', ') || 'General'}) — Riesgo: {l.calculatedRiskScore}/100
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Diagnostic data transfer banner */}
        {currentLead && (
          <div className="mb-5 p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3 text-xs">
            <Sparkles className="w-5 h-5 text-[#0071ce] shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-[#004f91]">
                  Datos del Diagnóstico Estratégico transferidos
                </span>
                <span className="font-mono text-[11px] font-bold bg-white text-slate-800 px-2 py-0.5 rounded border border-blue-200">
                  Riesgo: {currentLead.calculatedRiskScore} / 100
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Empresa: <strong>{currentLead.company}</strong> ({currentLead.stage} · {currentLead.industry}).
                Áreas marcadas: <strong>{currentLead.areasOfInterest?.join(', ') || 'General'}</strong>.
                Se transferirán las notas y el reporte sin necesidad de reescribir información.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Target Company & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Empresa Cliente *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ej. UrbanBite Delivery C.A."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071ce]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Representante Legal / Contacto *
              </label>
              <div className="relative">
                <UserRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej. Valentina Soto"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071ce]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Correo Electrónico para Notificaciones y Portal *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="contacto@empresa.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071ce]"
              />
            </div>
          </div>

          {/* Process Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Título del Expediente / Asunto Legal *</span>
              <span className="text-[10px] text-slate-400 font-normal">Sugerido según áreas diagnosticadas</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Adecuación Estatutaria y Gobernanza Societaria"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-[#0071ce]"
            />
          </div>

          {/* Category & Assigned Lawyer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Categoría Legal
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LegalProcess['category'])}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#0071ce]"
              >
                <option value="Corporativo">Corporativo</option>
                <option value="Propiedad Intelectual">Propiedad Intelectual</option>
                <option value="Regulatorio">Regulatorio</option>
                <option value="Laboral">Laboral</option>
                <option value="Contratos">Contratos</option>
                <option value="Administrativo & Notarial">Administrativo & Notarial</option>
                <option value="Mediación">Mediación</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Abogado Líder Asignado
              </label>
              <select
                value={assignedLawyer}
                onChange={(e) => setAssignedLawyer(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#0071ce]"
              >
                {lawyers.map((lawyer) => (
                  <option key={lawyer} value={lawyer}>
                    {lawyer}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Initial Status & Target Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Fase Inicial de Entrada
              </label>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value as ProcessStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#0071ce]"
              >
                <option value="recaudos">1. Recaudos (Consignación y validación inicial)</option>
                <option value="redaccion">2. Redacción (En redacción por equipo)</option>
                <option value="tramite_publico">3. Organismo Público (SAPI / Registro / Notaría)</option>
                <option value="revision">4. Revisión (Control de calidad y visto bueno)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Fecha Meta Estimada de Entrega
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071ce]"
                />
              </div>
            </div>
          </div>

          {/* First milestone */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Próximo Hito Operativo / Entregable Inmediato
            </label>
            <input
              type="text"
              value={nextMilestone}
              onChange={(e) => setNextMilestone(e.target.value)}
              placeholder="Ej. Consignación de estatutos y cédulas"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#0071ce]"
            />
          </div>

          {/* Auto actions */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={markAsActive}
                onChange={(e) => setMarkAsActive(e.target.checked)}
                className="rounded text-[#0071ce] focus:ring-[#0071ce] w-4 h-4"
              />
              <span className="text-xs font-semibold text-slate-800">
                Promover prospecto a <strong className="text-emerald-700">Cliente Activo</strong> en el Directorio
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={addAuditNote}
                onChange={(e) => setAddAuditNote(e.target.checked)}
                className="rounded text-[#0071ce] focus:ring-[#0071ce] w-4 h-4"
              />
              <span className="text-xs text-slate-600">
                Registrar nota interna de auditoría en la bitácora del cliente
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 font-bold text-white bg-[#0071ce] hover:bg-[#005ba7] rounded-xl transition-all shadow-sm hover:shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <Workflow className="w-4 h-4" />
              <span>Aperturar Expediente y Abrir Workflow</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
