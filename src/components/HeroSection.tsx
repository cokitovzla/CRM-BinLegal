import React from 'react';
import { ArrowDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { trackClick } from '../lib/analytics';

interface HeroSectionProps {
  onStartDiagnosis: () => void;
  onExploreServices: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartDiagnosis,
  onExploreServices,
}) => {
  return (
    <section id="inicio" className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-slate-50/40 border-b border-slate-200">
      {/* Background subtle architectural grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #0b192c 1px, transparent 0)`,
          backgroundSize: '28px 28px'
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-10 pb-8 sm:pb-10 lg:pb-12 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Architectural Kicker (Clean unboxed text, no pills) */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold tracking-wider text-slate-500 uppercase mb-2.5">
              <span className="text-[#0071ce] font-bold">Arquitectura BinLegal</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-700">Asesoría Legal Estratégica</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-500">PYME & Startups</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-950 tracking-tight leading-[1.1] mb-3 sm:mb-4 text-balance">
              Impulsamos <br className="hidden sm:inline" />
              y protegemos <br className="hidden sm:inline" />
              tu negocio.
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mb-5 sm:mb-6">
              Te guiamos en cada etapa, desde los primeros pasos hasta el crecimiento exponencial de tu empresa. Soluciones legales alternativas, directas y sin procesos administrativos innecesarios.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 mb-6 sm:mb-8">
              <button
                onClick={() => {
                  trackClick('hero', 'hacer_diagnostico_gratuito');
                  onStartDiagnosis();
                }}
                data-track-section="hero"
                data-track-name="cta_diagnostico_hero"
                data-track-click="hacer_diagnostico_gratuito"
                className="w-full sm:w-auto px-5 py-2.5 sm:py-3 bg-[#0071ce] hover:bg-[#0060b0] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-[0.99] whitespace-nowrap cursor-pointer"
              >
                <span>Hacer Diagnóstico Legal Gratuito</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => {
                  trackClick('hero', 'explorar_que_hacemos');
                  onExploreServices();
                }}
                data-track-section="hero"
                data-track-name="cta_explorar_servicios"
                data-track-click="explorar_que_hacemos"
                className="w-full sm:w-auto px-4 py-2.5 sm:py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-medium text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>Explorar Qué Hacemos</span>
                <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
              </button>
            </div>

            {/* Trust points */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-y-1.5 gap-x-5 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0071ce] shrink-0" />
                <span>Sin costos ocultos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0071ce] shrink-0" />
                <span>Respuesta en menos de 24h</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0071ce] shrink-0" />
                <span>Diseñado por fundadores para fundadores</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Asset with Scrim */}
          <div className="lg:col-span-5 relative flex items-center">
            <div className="w-full aspect-[16/10] sm:aspect-[4/3] lg:aspect-auto lg:h-full min-h-[220px] sm:min-h-[260px] lg:min-h-[340px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-md relative group">
              <img
                src="/src/assets/images/hero_binlegal_architecture_1792518327540.jpg"
                alt="Sede y arquitectura de asesoría BinLegal"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b192c]/90 via-[#0b192c]/30 to-transparent pointer-events-none" />
              
              {/* Overlay note on hero image */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white pointer-events-none">
                <div className="text-[10px] sm:text-xs uppercase tracking-wider text-blue-200 font-semibold mb-1">
                  Enfoque Preventivo · Ecosistema PYME
                </div>
                <p className="text-xs sm:text-sm font-medium leading-snug text-slate-100">
                  "No es sobre las ideas, sino sobre hacer que estas se vuelvan realidad con solidez jurídica."
                </p>
                <div className="mt-1.5 text-[11px] sm:text-xs text-slate-300 font-normal">
                  José Rafael Vásquez · Fundador
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 4-Column Proof & Statistics Cards - Synthesized, responsive */}
        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-[#0b192c] tracking-tight tabular-nums">
              86%
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-1 font-normal leading-snug">
              de nuevos negocios fracasan antes de 3.5 años por falta de estructura legal.
            </p>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-[#0071ce] tracking-tight tabular-nums">
              14%
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-1 font-normal leading-snug">
              supera la barrera y se transforma en empresa con blindaje institucional.
            </p>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-[#0b192c] tracking-tight tabular-nums">
              +180
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-1 font-normal leading-snug">
              PYMES y startups acompañadas en Venezuela y la región LATAM.
            </p>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-emerald-600 tracking-tight tabular-nums">
              0
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-1 font-normal leading-snug">
              litigios destructivos: prioridad a la mediación y prevención de contingencias.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
