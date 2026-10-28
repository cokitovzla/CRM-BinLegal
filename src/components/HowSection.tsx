import React, { useState } from 'react';
import { Search, FileCheck, Sparkles, Check, ArrowRight, Workflow } from 'lucide-react';

interface HowSectionProps {
  onStartDiagnosis: () => void;
}

export const HowSection: React.FC<HowSectionProps> = ({ onStartDiagnosis }) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: '01',
      title: 'Evaluación Legal Completa',
      subtitle: 'Diagnóstico situacional y mapeo de prioridades',
      icon: <Search className="w-4 h-4 text-neutral-900" />,
      description: 'Analizamos tu situación y objetivos empresariales para identificar las mejores oportunidades y los riesgos que debes atender primero. Recibes un reporte con semáforo de urgencia.',
      deliverables: [
        'Formulario de diagnóstico ágil y entrevista de 25 min',
        'Matriz de riesgos en 6 áreas críticas del negocio',
        'Priorización de acciones inmediatas vs diferibles'
      ],
      timeframe: '24 a 48 horas hábiles'
    },
    {
      number: '02',
      title: 'Revisión Normativa Integral',
      subtitle: 'Auditoría documental y detección de vacíos',
      icon: <FileCheck className="w-4 h-4 text-neutral-900" />,
      description: 'Examinamos los contratos existentes con clientes y proveedores, actas de asambleas, relaciones de trabajo y situación marcaria para cerrar cualquier brecha antes de que se transforme en costo.',
      deliverables: [
        'Revisión minuciosa de estatutos y contratos vigentes',
        'Auditoría marcaria fonética y registral completa',
        'Checklist de cumplimiento tributario y licencias locales'
      ],
      timeframe: '3 a 5 días hábiles'
    },
    {
      number: '03',
      title: 'Propuesta de Servicios Personalizada',
      subtitle: 'Estrategia a medida con presupuesto cerrado',
      icon: <Sparkles className="w-4 h-4 text-neutral-900" />,
      description: 'Diseñamos un plan de trabajo por fases con honorarios fijos y transparentes. Sin cobros sorpresa por horas ni tecnicismos confusos, ajustado a la capacidad de caja de tu PYME.',
      deliverables: [
        'Cronograma escalonado de blindaje jurídico',
        'Presupuesto fijo sin cargos imprevistos por hora',
        'Asignación del abogado líder y acceso al ecosistema BinLegal'
      ],
      timeframe: 'Entrega en sesión 1-on-1'
    }
  ];

  return (
    <section id="como" className="py-10 sm:py-12 lg:py-14 bg-slate-50/80 border-b border-slate-200 scroll-mt-20 sm:scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="w-full max-w-5xl mb-6 sm:mb-8 text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#0071ce] uppercase mb-2 bg-blue-50 px-2.5 py-1 rounded-md">
            <Workflow className="w-3.5 h-3.5 text-[#0071ce]" />
            <span>Metodología de Acompañamiento</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-slate-950 tracking-tight mb-2">
            Soluciones legales alternativas
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600 leading-relaxed">
            Diseñamos y ejecutamos estrategias legales personalizadas según las necesidades de tu negocio, con un proceso en 3 pasos ordenados, transparentes y libres de burocracia.
          </p>
        </div>

        {/* 3 Step Interactive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {steps.map((step, idx) => {
            const isSelected = activeStep === idx;
            return (
              <div
                key={step.number}
                onClick={() => setActiveStep(idx)}
                className={`bg-white rounded-xl p-4 sm:p-5 border transition-all cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-md active:scale-[0.99] ${
                  isSelected 
                    ? 'border-[#0071ce] ring-1 ring-[#0071ce]/30 shadow-md' 
                    : 'border-slate-200/90 hover:border-slate-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md ${
                      isSelected ? 'bg-[#0071ce] text-white' : 'bg-slate-100 text-slate-800'
                    }`}>
                      Paso {step.number}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
                      {step.icon}
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-display font-bold text-slate-950 mb-1 leading-snug">
                    {step.title}
                  </h3>
                  <div className="text-xs font-semibold text-[#0071ce] mb-2.5">
                    {step.subtitle}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {step.description}
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-slate-100">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Lo que obtienes:
                    </div>
                    {step.deliverables.map((item, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-1.5 text-xs text-slate-700">
                        <Check className="w-3.5 h-3.5 text-[#0071ce] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>Plazo:</span>
                  <span className="font-semibold text-slate-800">{step.timeframe}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA banner below process - Synthesized */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-5 bg-[#0B192C] rounded-xl text-white border border-slate-800 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-base sm:text-lg font-display font-bold text-white mb-0.5">
              Comienza hoy con el Paso 01 sin costo alguno
            </h4>
            <p className="text-xs sm:text-sm text-slate-300">
              Completa el diagnóstico guiado en 3 minutos y recibe el mapa de riesgos de tu empresa.
            </p>
          </div>
          <button
            onClick={onStartDiagnosis}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#0071ce] text-white hover:bg-[#0060b0] text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
          >
            <span>Iniciar Paso 01 Ahora</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
};
