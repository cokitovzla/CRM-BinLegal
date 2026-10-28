import React from 'react';
import { Compass } from 'lucide-react';

export const WhySection: React.FC = () => {
  return (
    <section id="por-que" className="py-10 sm:py-12 lg:py-14 bg-[#0B192C] text-white border-b border-slate-800 relative overflow-hidden scroll-mt-20 sm:scroll-mt-24">
      {/* Subtle background glow */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="w-full max-w-5xl mb-6 sm:mb-8 text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-blue-300 uppercase mb-2 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-400/20">
            <Compass className="w-3.5 h-3.5 text-blue-300" />
            <span>Propósito & Filosofía</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight leading-[1.15] mb-2">
            Existimos para que tu negocio se vuelva empresa
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-slate-300 leading-relaxed">
            La transición de un emprendimiento informal a una compañía escalable y transferible no depende de la suerte, sino del andamiaje legal que sostiene las decisiones diarias.
          </p>
        </div>

        {/* 3 Core Pillars with adjacent documentary visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* Visual Editorial Box */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="h-full min-h-[220px] sm:min-h-[260px] lg:min-h-[360px] rounded-xl overflow-hidden border border-slate-700/80 shadow-md relative group flex flex-col justify-end">
              <img
                src="/src/assets/images/team_legal_consultation_1792518328026.jpg"
                alt="Mesa de trabajo y asesoría estratégica BinLegal con clientes"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C]/95 via-[#0B192C]/50 to-transparent pointer-events-none" />
              
              <div className="relative p-4 sm:p-6 text-white">
                <div className="text-[10px] sm:text-xs font-mono uppercase text-[#0071ce] font-semibold tracking-wider mb-1.5">
                  Caso Real · Impacto Comprobado
                </div>
                <blockquote className="text-xs sm:text-sm font-medium leading-snug text-slate-100">
                  "El 90% de los problemas que atendemos como urgencias en empresas medianas pudieron haberse blindado en una tarde con el pacto de socios inicial."
                </blockquote>
                <div className="mt-3 pt-2.5 border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-300">
                  <span>Ricardo Salas · Socio</span>
                  <span className="text-[#0071ce] font-medium">Estrategia Preventiva</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Pillars Editorial List with enhanced interactive readability */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-3 sm:space-y-4">
            
            {/* Pillar 01 - Porque el 86% no lo logra */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0e223b]/80 border border-slate-700/80 hover:bg-[#163357] hover:border-blue-400/70 hover:shadow-xl transition-all duration-300 cursor-pointer group/pillar active:scale-[0.99]">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-xs sm:text-sm font-mono font-bold text-blue-300 bg-blue-500/20 px-2.5 py-0.5 rounded-md transition-colors group-hover/pillar:bg-blue-400 group-hover/pillar:text-[#0B192C]">
                  01
                </span>
                <span className="text-slate-500">/</span>
                <h3 className="text-base sm:text-lg font-display font-bold text-white group-hover/pillar:text-blue-100 transition-colors">
                  Porque el 86% no lo logra
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 group-hover/pillar:text-white transition-colors leading-relaxed">
                Cerca de 3 millones de venezolanos inician negocios cada año. Sin embargo, solo el <strong className="text-white font-semibold">14% logra pasar de negocio a empresa</strong> y superar la barrera crítica de los 3.5 años. La diferencia casi nunca está en la idea: radica en la estructura societaria, la formalidad contractual y la anticipación oportuna de contingencias antes de que estallen.
              </p>
            </div>

            {/* Pillar 02 - Porque las ideas no bastan */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0e223b]/80 border border-slate-700/80 hover:bg-[#163357] hover:border-blue-400/70 hover:shadow-xl transition-all duration-300 cursor-pointer group/pillar active:scale-[0.99]">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-xs sm:text-sm font-mono font-bold text-blue-300 bg-blue-500/20 px-2.5 py-0.5 rounded-md transition-colors group-hover/pillar:bg-blue-400 group-hover/pillar:text-[#0B192C]">
                  02
                </span>
                <span className="text-slate-500">/</span>
                <h3 className="text-base sm:text-lg font-display font-bold text-white group-hover/pillar:text-blue-100 transition-colors">
                  Porque las ideas no bastan
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 group-hover/pillar:text-white transition-colors leading-relaxed">
                <span className="italic font-medium text-blue-200">"No es sobre las ideas, sino sobre hacer que estas se vuelvan realidad con solidez jurídica."</span> Creemos firmemente que la ley debe ser una catapulta de tracción comercial y no un obstáculo burocrático que frene tus ventas o intimide a tus clientes.
              </p>
            </div>

            {/* Pillar 03 - Porque prevenir cuesta menos */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0e223b]/80 border border-slate-700/80 hover:bg-[#163357] hover:border-blue-400/70 hover:shadow-xl transition-all duration-300 cursor-pointer group/pillar active:scale-[0.99]">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-xs sm:text-sm font-mono font-bold text-blue-300 bg-blue-500/20 px-2.5 py-0.5 rounded-md transition-colors group-hover/pillar:bg-blue-400 group-hover/pillar:text-[#0B192C]">
                  03
                </span>
                <span className="text-slate-500">/</span>
                <h3 className="text-base sm:text-lg font-display font-bold text-white group-hover/pillar:text-blue-100 transition-colors">
                  Porque prevenir cuesta menos
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 group-hover/pillar:text-white transition-colors leading-relaxed">
                Anticipar y blindar los riesgos legales protege tu capital de trabajo y la tranquilidad de tu equipo. Un problema resuelto a tiempo mediante un pacto de socios o un contrato preventivo cuesta el <strong className="text-white font-semibold">10% de lo que cuesta defender un litigio judicial</strong> cuando el conflicto ya escaló.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
