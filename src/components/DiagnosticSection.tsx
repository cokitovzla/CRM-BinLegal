import React, { useState, useEffect } from 'react';
import { BusinessStage, LegalArea, Lead, RiskItem } from '../types';
import { calculateDiagnosisRisk } from '../data/initialData';
import { SectorSelector } from './SectorSelector';
import { 
  Check, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle, 
  Lock, 
  Calendar,
  Building2,
  Scale,
  Briefcase,
  Users2,
  FileText,
  Handshake,
  ArrowRight,
  TrendingUp,
  Layers,
  Award,
  Info,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { trackDiagnosticStart, trackDiagnosticComplete, trackClick } from '../lib/analytics';

interface DiagnosticSectionProps {
  onNewLeadCreated: (lead: Lead) => Promise<boolean> | void;
  preselectedArea?: LegalArea | null;
}

const BUSINESS_STAGES_CONFIG: { 
  stage: BusinessStage; 
  label: string; 
  icon: React.ReactNode; 
  legalFocus: string 
}[] = [
  { 
    stage: 'Idea / Pre-lanzamiento', 
    label: 'Idea / Pre-lanzamiento',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    legalFocus: 'Fase de concepción: Prioridad en la selección del tipo societario adecuado (C.A., S.A.S. o LLC), acuerdos de confidencialidad estrictos (NDA) y reserva de denominación comercial y signos distintivos antes de la salida al mercado.'
  },
  { 
    stage: 'Recién constituida', 
    label: 'Recién constituida',
    icon: <Building2 className="w-3.5 h-3.5" />,
    legalFocus: 'Primeros 2 años de vida comercial: Es indispensable formalizar el pacto de socios (reglas de salida, drag-along, tag-along), protocolizar libros mercantiles obligatorios e implementar contratos comerciales estandarizados con clientes.'
  },
  { 
    stage: 'En crecimiento', 
    label: 'En crecimiento',
    icon: <TrendingUp className="w-3.5 h-3.5" />,
    legalFocus: 'Expansión operativa y escalamiento: El foco legal se traslada al blindaje laboral de colaboradores clave, protección y cesión de propiedad intelectual (código y marcas) y ordenamiento societario para rondas de capital o créditos.'
  },
  { 
    stage: 'Consolidada', 
    label: 'Consolidada',
    icon: <Layers className="w-3.5 h-3.5" />,
    legalFocus: 'Madurez institucional: Auditoría de cumplimiento corporativo integral, optimización de esquemas tributarios legales, programas de retención de talento (vesting) y preparación de gobierno corporativo para expansión regional.'
  }
];

const LEGAL_AREAS_CONFIG: { area: LegalArea; label: string; icon: React.ReactNode; hint: string; fullDesc: string }[] = [
  { 
    area: 'Corporativo', 
    label: 'Corporativo & Socios', 
    icon: <Building2 className="w-4 h-4" />, 
    hint: 'Pactos de socios, actas, vesting y gobierno societario',
    fullDesc: 'Blindaje de la estructura de capital, cláusulas antibloqueo entre socios, estatutos adaptados y asambleas mercantiles.'
  },
  { 
    area: 'Propiedad Intelectual', 
    label: 'Propiedad Intelectual', 
    icon: <Award className="w-4 h-4" />, 
    hint: 'Registro de marca, software, patentes y secretos industriales',
    fullDesc: 'Búsqueda fonética, tramitación ante SAPI/OMPI, cesión de derechos de programadores y acuerdos de secreto industrial.'
  },
  { 
    area: 'Regulatorio', 
    label: 'Regulatorio & Licencias', 
    icon: <Scale className="w-4 h-4" />, 
    hint: 'Compliance sectorial, licencias municipales y normativas',
    fullDesc: 'Auditoría de deberes formales, permisos sanitarios o bancarios y prevención de sanciones administrativas o cierres.'
  },
  { 
    area: 'Laboral', 
    label: 'Laboral & Talento', 
    icon: <Users2 className="w-4 h-4" />, 
    hint: 'Contratos laborales, tercerización, pasivos y acuerdos',
    fullDesc: 'Diferenciación estricta entre colaboradores independientes y empleados subordinados, libros de horas y finiquitos seguros.'
  },
  { 
    area: 'Contratos', 
    label: 'Contratos Comerciales', 
    icon: <FileText className="w-4 h-4" />, 
    hint: 'Contratos con clientes, proveedores, NDA y acuerdos de pago',
    fullDesc: 'Diseño de contratos comerciales con garantías de cobro, cláusulas penales y limitaciones de responsabilidad patrimonial.'
  },
  { 
    area: 'Mediación', 
    label: 'Mediación & Disputas', 
    icon: <Handshake className="w-4 h-4" />, 
    hint: 'Resolución pacífica de controversias y prevención de juicios',
    fullDesc: 'Negociación estratégica prejudicial y redacción de transacciones con fuerza ejecutiva para evitar el drenaje de litigios.'
  }
];

const PILLARS_EXPLANATION = [
  {
    number: '01',
    title: 'Semáforo de Riesgo (0 a 100)',
    short: 'Puntuación objetiva y cuantitativa de tu nivel actual de exposición.',
    detail: 'Algoritmo situacional ponderado según la legislación mercantil y tributaria. Evalúa el grado de vulnerabilidad de tu empresa frente a multas de entes fiscales o municipales, demandas laborales desmedidas, contingencias contractuales o controversias societarias entre fundadores.'
  },
  {
    number: '02',
    title: 'Puntos Críticos & Alertas',
    short: 'Detección inmediata de brechas documentales y regulatorias.',
    detail: 'Auditoría preventiva que identifica puntos de fuga de valor: falta de pactos de socios (riesgo de bloqueo accionario), marcas comerciales no registradas vulnerables ante el SAPI, colaboradores sin contratos de cesión de IP y contratos sin limitación de responsabilidad civil.'
  },
  {
    number: '03',
    title: 'Hoja de Ruta Inmediata',
    short: 'Acciones correctivas ordenadas por prioridad de impacto y urgencia.',
    detail: 'Plan de acción legal cronológico que discrimina lo urgente de lo diferible. Permite resolver contingencias con presupuestos cerrados y sin desgastar la caja, garantizando que el equipo directivo se concentre en la tracción comercial y no en litigios.'
  }
];

export const DiagnosticSection: React.FC<DiagnosticSectionProps> = ({
  onNewLeadCreated,
  preselectedArea
}) => {
  // NONE preselected by default as requested by user
  const [stage, setStage] = useState<BusinessStage | null>(null);
  const [selectedAreas, setSelectedAreas] = useState<LegalArea[]>(preselectedArea ? [preselectedArea] : []);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [otherSectorText, setOtherSectorText] = useState('');
  const [hoveredPillar, setHoveredPillar] = useState<number | null>(null);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [situation, setSituation] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<{
    lead: Lead;
    items: RiskItem[];
    score: number;
    summary: string;
  } | null>(null);

  // Sync preselected area from services section if triggered
  useEffect(() => {
    if (preselectedArea && !selectedAreas.includes(preselectedArea)) {
      setSelectedAreas(prev => [...prev, preselectedArea]);
    }
  }, [preselectedArea]);

  const toggleArea = (area: LegalArea) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter(a => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
    if (errors.areas) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.areas;
        return next;
      });
    }
  };

  const handleSelectAllAreas = () => {
    if (selectedAreas.length === LEGAL_AREAS_CONFIG.length) {
      setSelectedAreas([]);
    } else {
      setSelectedAreas(LEGAL_AREAS_CONFIG.map(a => a.area));
    }
    if (errors.areas) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.areas;
        return next;
      });
    }
  };

  const getFormattedIndustry = () => {
    const list = selectedSectors.map(s => {
      if (s === 'Otro') {
        return otherSectorText.trim() ? `Otro: ${otherSectorText.trim()}` : 'Otro';
      }
      return s;
    });
    return list.join(', ');
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!stage) {
      errs.stage = 'Por favor selecciona la etapa actual de tu empresa';
    }
    if (selectedAreas.length === 0) {
      errs.areas = 'Por favor selecciona al menos 1 área legal a blindar';
    }
    if (selectedSectors.length === 0) {
      errs.industry = 'Selecciona al menos 1 sector o actividad de tu empresa';
    } else if (selectedSectors.includes('Otro') && !otherSectorText.trim()) {
      errs.industry = 'Por favor especifica tu sector en el campo "Otro"';
    }

    if (!fullName.trim()) errs.fullName = 'Ingresa tu nombre completo';
    if (!email.trim()) {
      errs.email = 'Ingresa tu correo de contacto';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Ingresa un correo electrónico válido';
    }
    if (!company.trim()) errs.company = 'Ingresa el nombre de tu empresa o proyecto';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 1. Prevent duplicate submissions from double clicks or re-triggers
    if (isSubmitting) return;

    // 2. Validate all required fields
    if (!validateForm()) return;
    if (!stage) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const formattedIndustry = getFormattedIndustry();
    const calculation = calculateDiagnosisRisk(stage, selectedAreas, company, formattedIndustry);

    // 3. Assemble complete Lead entity with all fields collected by the public form
    const leadId = `lead-${Date.now()}`;
    const newLead: Lead = {
      id: leadId,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      company: company.trim(),
      industry: formattedIndustry,
      stage,
      areasOfInterest: [...selectedAreas], // Preserves ALL selected legal areas in a single request
      notes: situation.trim() || undefined,
      status: 'nuevo_lead',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      calculatedRiskScore: calculation.score,
      riskSummary: calculation.summary,
      riskItems: calculation.items,
      internalNotes: [
        {
          id: `note-${Date.now()}`,
          author: 'Formulario Web BinLegal',
          text: `Solicitud de diagnóstico legal recibida. Etapa: ${stage}. Áreas prioritarias: ${selectedAreas.join(', ')}. Sector: ${formattedIndustry}.${situation.trim() ? ` Detalle: "${situation.trim()}"` : ''}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
        }
      ]
    };

    try {
      // 4. Persist to CRM and Firestore through existing integration flow
      await onNewLeadCreated(newLead);

      trackDiagnosticComplete(formattedIndustry, calculation.score, calculation.items.length);
      setDiagnosisResult({
        lead: newLead,
        items: calculation.items,
        score: calculation.score,
        summary: calculation.summary
      });

      const container = document.getElementById('diagnostico');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      console.error('Error al registrar la solicitud en el CRM:', err);
      // Strictly report persistence failure; do not inform false success
      setSubmitError('No se pudo confirmar el guardado de la solicitud en la base de datos del CRM. Por favor revisa tu conexión e intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    trackClick('diagnostico', 'reiniciar_diagnostico');
    setDiagnosisResult(null);
    setStage(null);
    setSelectedAreas([]);
    setSelectedSectors([]);
    setOtherSectorText('');
    setFullName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setSituation('');
    setErrors({});
    setSubmitError(null);
  };

  const currentStageConfig = stage ? BUSINESS_STAGES_CONFIG.find(s => s.stage === stage) : null;

  return (
    <section 
      id="diagnostico" 
      className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-slate-50/70 to-white border-b border-slate-200 scroll-mt-24 sm:scroll-mt-28"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: Aligned to the left matching the rest of the page */}
        <div className="w-full mb-8 sm:mb-10 text-left">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-[#0B192C] uppercase mb-2 bg-slate-100 border border-slate-200 px-3 py-1 rounded-md shadow-2xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#0071ce]" />
            <span>Diagnóstico Legal Estratégico · Sin costo</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-slate-950 tracking-tight mb-3">
            Evalúa la salud jurídica de tu negocio sin costo
          </h2>

          <p className="text-xs sm:text-sm lg:text-base text-slate-600 leading-relaxed max-w-4xl">
            Detecta contingencias societarias, laborales, contractuales o de propiedad intelectual antes de que frenen tu operación. Recibe tu semáforo de riesgo y dictamen preliminar en pantalla en 2 minutos. Pasa el cursor sobre los 3 componentes para conocer el alcance del informe.
          </p>
        </div>

        {/* 3 Pillars Ribbon: Full width, interactive with rich legal explanations on hover */}
        <div className="w-full mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {PILLARS_EXPLANATION.map((pillar, idx) => {
            const isHovered = hoveredPillar === idx;
            return (
              <div
                key={pillar.number}
                onMouseEnter={() => setHoveredPillar(idx)}
                onMouseLeave={() => setHoveredPillar(null)}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group ${
                  isHovered 
                    ? 'border-[#0B192C] ring-2 ring-[#0B192C]/15 bg-slate-50/70' 
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md transition-colors ${
                      isHovered ? 'bg-[#0B192C] text-white' : 'bg-slate-100 text-[#0B192C]'
                    }`}>
                      Pilar {pillar.number}
                    </span>
                    <Info className={`w-4 h-4 transition-colors ${isHovered ? 'text-[#0B192C]' : 'text-slate-400'}`} />
                  </div>

                  <h3 className="text-sm sm:text-base font-display font-bold text-slate-950 mb-1 group-hover:text-[#0B192C] transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-snug mb-3">
                    {pillar.short}
                  </p>
                </div>

                {/* Extended Legal Detail Box (Always visible, highlighted on hover) */}
                <div className={`pt-3 border-t text-[11px] leading-relaxed transition-colors rounded-xl p-2.5 ${
                  isHovered 
                    ? 'border-slate-300 bg-white text-slate-900 shadow-2xs font-medium' 
                    : 'border-slate-100 bg-slate-50/80 text-slate-500'
                }`}>
                  <span className="text-[#0B192C] font-bold block mb-0.5">Alcance jurídico:</span>
                  {pillar.detail}
                </div>
              </div>
            );
          })}
        </div>

        {!diagnosisResult ? (
          /* Main Assessment Card: Adapts fully to the width of the page */
          <div className="w-full">
            <form 
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all p-6 sm:p-8 md:p-10 space-y-8"
            >
              
              {/* Step 1: Etapa de tu empresa - Horizontal compact buttons with darker navy selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0B192C] text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                      1
                    </span>
                    <label className="text-sm sm:text-base font-bold text-slate-900">
                      ¿En qué etapa se encuentra tu empresa o proyecto? *
                    </label>
                  </div>
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">Selecciona 1 opción</span>
                </div>

                <p className="text-xs text-slate-500 mb-3">
                  La etapa define el nivel de madurez contractual y el tipo de responsabilidades societarias prioritarias a auditar.
                </p>

                {/* 4 Compact Horizontal Stage Buttons with Navy blue (#0B192C) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {BUSINESS_STAGES_CONFIG.map((item) => {
                    const isSelected = stage === item.stage;
                    return (
                      <button
                        type="button"
                        key={item.stage}
                        onClick={() => {
                          setStage(item.stage);
                          if (errors.stage) {
                            setErrors(prev => {
                              const next = { ...prev };
                              delete next.stage;
                              return next;
                            });
                          }
                        }}
                        className={`py-3 px-3 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] ${
                          isSelected
                            ? 'bg-[#0B192C] text-white border-[#0B192C] shadow-sm font-bold'
                            : 'bg-slate-50/70 text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-white font-medium hover:shadow-2xs'
                        }`}
                      >
                        <span className={`shrink-0 ${isSelected ? 'text-blue-300' : 'text-[#0B192C]'}`}>
                          {item.icon}
                        </span>
                        <span className="text-xs leading-tight truncate">
                          {item.label}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] shrink-0 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>

                {errors.stage && (
                  <p className="text-xs text-red-600 font-semibold mt-2 flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.stage}</span>
                  </p>
                )}

                {/* Legal focus note: shows guide when unselected, dynamic focus when selected */}
                {currentStageConfig ? (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-100/80 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-800 animate-in fade-in">
                    <Info className="w-4 h-4 text-[#0B192C] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#0B192C] font-bold">Criterio legal para "{stage}": </strong>
                      <span>{currentStageConfig.legalFocus}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-2 text-xs text-slate-500">
                    <Info className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Haz clic en tu etapa para cargar automáticamente el criterio legal y las obligaciones correspondientes.</span>
                  </div>
                )}
              </div>

              {/* Step 2: Áreas a blindar - With explanation & Select All helper & darker navy tone */}
              <div className="pt-6 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0B192C] text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                      2
                    </span>
                    <label className="text-sm sm:text-base font-bold text-slate-900">
                      ¿Cuáles áreas legales deseas blindar o auditar prioritariamente? *
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleSelectAllAreas}
                    className="self-start sm:self-auto text-xs font-semibold text-[#0B192C] hover:text-black bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-[#0B192C]" />
                    <span>{selectedAreas.length === LEGAL_AREAS_CONFIG.length ? 'Desmarcar todas' : 'Marcar todas las áreas'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-500 mb-3.5">
                  Selecciona los frentes del negocio donde sospechas vacíos legales o necesitas certeza documental. Si las marcas todas, realizaremos una auditoría transversal completa.
                </p>

                {errors.areas && (
                  <p className="text-xs text-red-600 font-semibold mb-3 flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.areas}</span>
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {LEGAL_AREAS_CONFIG.map((item) => {
                    const isChecked = selectedAreas.includes(item.area);
                    return (
                      <button
                        type="button"
                        key={item.area}
                        onClick={() => toggleArea(item.area)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 cursor-pointer active:scale-[0.98] ${
                          isChecked
                            ? 'bg-slate-900/[0.04] border-[#0B192C] ring-2 ring-[#0B192C]/20 shadow-xs'
                            : 'bg-slate-50/60 border-slate-200 hover:border-slate-400 hover:bg-white hover:shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isChecked ? 'bg-[#0B192C] text-white' : 'bg-slate-200/70 text-slate-700'
                          }`}>
                            {item.icon}
                          </div>
                          <div className="min-w-0">
                            <span className={`text-xs font-bold block leading-tight ${isChecked ? 'text-[#0B192C]' : 'text-slate-900'}`}>
                              {item.label}
                            </span>
                            <span className="text-[11px] text-slate-500 mt-1 block leading-snug">
                              {item.fullDesc}
                            </span>
                          </div>
                        </div>

                        <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          isChecked ? 'bg-[#0B192C] text-white border border-[#0B192C]' : 'border border-slate-300 bg-white'
                        }`}>
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Sector de la empresa */}
              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-[#0B192C] text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                    3
                  </span>
                  <label className="text-sm sm:text-base font-bold text-slate-900">
                    Sector e industria de tu negocio *
                  </label>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Permite ponderar la carga regulatoria aplicable según tu actividad comercial (comercio, fintech, alimentos, tecnología, etc.).
                </p>

                <div className="bg-slate-50/50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <SectorSelector
                    selectedSectors={selectedSectors}
                    otherText={otherSectorText}
                    compact={true}
                    onSelectionChange={(sectors, other) => {
                      setSelectedSectors(sectors);
                      setOtherSectorText(other);
                      if (errors.industry) {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next.industry;
                          return next;
                        });
                      }
                    }}
                    error={errors.industry}
                  />
                </div>
              </div>

              {/* Step 4: Datos de la empresa y contacto */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0B192C] text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                      4
                    </span>
                    <label className="text-sm sm:text-base font-bold text-slate-900">
                      Datos de la empresa y titular para emitir el dictamen
                    </label>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">* Campos obligatorios</span>
                </div>

                <p className="text-xs text-slate-500">
                  Emitiremos el reporte personalizado con el nombre formal de tu proyecto o sociedad mercantil.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nombre y apellido del titular o socio *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ej. Sofía Valero"
                      className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/20 focus:border-[#0B192C] transition-all shadow-2xs"
                    />
                    {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Correo corporativo *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sofia@tuempresa.com"
                      className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/20 focus:border-[#0B192C] transition-all shadow-2xs"
                    />
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nombre comercial o denominación de la empresa *
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Ej. Nexo Store C.A."
                      className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/20 focus:border-[#0B192C] transition-all shadow-2xs"
                    />
                    {errors.company && <p className="text-xs text-red-600 mt-1">{errors.company}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Teléfono / WhatsApp de contacto <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+58 412 000 0000"
                      className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/20 focus:border-[#0B192C] transition-all shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Describe tu duda puntual o situación con socios/contratos <span className="text-slate-400 font-normal">(opcional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    placeholder="Ej. Vamos a incorporar un nuevo socio inversionista y necesitamos saber si los estatutos actuales lo permiten, o queremos registrar la marca antes de abrir locales..."
                    className="w-full px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/20 focus:border-[#0B192C] transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Submit CTA with Darker Navy Tone (#0B192C) */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Información amparada bajo estricto secreto profesional del Código de Ética del Abogado.</span>
                </div>

                <div className="flex flex-col sm:items-end w-full sm:w-auto gap-2">
                  {submitError && (
                    <div className="text-xs text-red-700 bg-red-50 border border-red-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 animate-in fade-in max-w-md">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    data-track-section="diagnostico"
                    data-track-name="enviar_solicitud"
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#0B192C] hover:bg-[#142d4d] active:bg-[#07111e] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer active:scale-95"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Enviando solicitud...</span>
                      </span>
                    ) : (
                      <>
                        <span>Enviar solicitud</span>
                        <ArrowRight className="w-4 h-4 text-blue-300" />
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          </div>
        ) : (
          /* Executive Diagnostic Results Deck: Full width, prestigious, left-aligned */
          <div className="w-full space-y-6 animate-in fade-in">
            
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 md:p-10 shadow-sm space-y-6">
              
              {/* Header with Title and Gauge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 text-left">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#0B192C] bg-slate-100 px-2.5 py-1 rounded-md mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0071ce]" />
                    <span>DICTAMEN EMITIDO · {diagnosisResult.lead.createdAt}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-950">
                    {diagnosisResult.lead.company}
                  </h3>
                  <div className="text-xs text-slate-500 mt-1">
                    Titular evaluado: <strong className="text-slate-800">{diagnosisResult.lead.fullName}</strong> · Etapa: <strong className="text-slate-800">{diagnosisResult.lead.stage}</strong> · Sector: <strong className="text-slate-800">{diagnosisResult.lead.industry}</strong>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shrink-0 shadow-2xs">
                  <div className="text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Índice de Exposición
                    </div>
                    <div className="text-3xl sm:text-4xl font-display font-extrabold text-[#0B192C] leading-none mt-1">
                      {diagnosisResult.score}<span className="text-base font-normal text-slate-400">/100</span>
                    </div>
                  </div>
                  <div className="pl-3 border-l border-slate-200">
                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                      diagnosisResult.score >= 75
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : diagnosisResult.score >= 55
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      Riesgo {diagnosisResult.score >= 75 ? 'Crítico' : diagnosisResult.score >= 55 ? 'Moderado' : 'Preventivo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dictamen Jurídico Preliminar */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0B192C] mb-1.5 flex items-center gap-1.5 font-mono">
                  <FileText className="w-4 h-4 text-[#0071ce]" />
                  <span>Dictamen Jurídico Preliminar de BinLegal</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {diagnosisResult.summary}
                </p>
              </div>

              {/* Hallazgos Críticos List */}
              <div className="space-y-3 pt-2 text-left">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Hallazgos Prioritarios & Acciones Inmediatas ({diagnosisResult.items.length})</span>
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">Ordenados por impacto y severidad</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {diagnosisResult.items.map((item, idx) => (
                    <div key={idx} className="bg-slate-50/70 rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-2.5 hover:bg-white hover:shadow-xs transition-all">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#0B192C] bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md font-mono">
                          {item.area}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          item.level === 'Alto'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          Riesgo {item.level}
                        </span>
                      </div>

                      <h5 className="text-sm font-bold text-slate-950">
                        {item.title}
                      </h5>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="pt-2 border-t border-slate-200/70 text-xs">
                        <strong className="text-slate-900 font-semibold block mb-0.5">Acción legal recomendada:</strong>
                        <span className="text-slate-700">{item.actionRequired}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons with Darker Navy Tone */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <a
                  href="#contacto"
                  onClick={() => trackClick('diagnostico_resultado', 'coordinar_sesion')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-[#0B192C] hover:bg-[#142d4d] text-white text-xs sm:text-sm font-bold rounded-xl text-center flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-blue-300" />
                  <span>Coordinar Sesión con José Rafael Vásquez</span>
                </a>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Realizar otro diagnóstico</span>
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
};
