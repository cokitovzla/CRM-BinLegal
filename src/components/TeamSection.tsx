import React, { useState } from 'react';
import { BINLEGAL_TEAM } from '../data/initialData';
import { TeamMember } from '../types';
import { Award, Briefcase, Mail, X, ArrowRight, ShieldCheck, Quote, ChevronRight } from 'lucide-react';
import { trackClick } from '../lib/analytics';

export const TeamSection: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const founder = BINLEGAL_TEAM.find(m => m.id === 'jose-rafael-vasquez') || BINLEGAL_TEAM[0];
  const specialists = BINLEGAL_TEAM.filter(m => m.id !== 'jose-rafael-vasquez');

  const handleOpenMember = (member: TeamMember) => {
    trackClick('equipo', `ver_perfil_${member.id}`);
    setSelectedMember(member);
  };

  return (
    <section id="equipo" className="py-12 sm:py-16 lg:py-20 bg-white border-b border-neutral-200 scroll-mt-20 sm:scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: Left-aligned and adapted to the section width */}
        <div className="w-full mb-8 sm:mb-10 text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#0071ce] uppercase mb-2 bg-blue-50 px-2.5 py-1 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0071ce]" />
            <span>Socios & Especialistas Legales</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-slate-950 tracking-tight mb-3">
            Abogados especializados, obsesionados con tu crecimiento
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600 leading-relaxed max-w-4xl">
            Combinamos rigor jurídico, agilidad en trámites y visión comercial. Entendemos la presión del flujo de caja, la necesidad de cerrar contratos rápidos y el valor de no perder tiempo en burocracia estéril.
          </p>
        </div>

        {/* Highlight Banner: José Rafael Vásquez as Founder in large horizontal blue container */}
        <div 
          onClick={() => handleOpenMember(founder)}
          className="w-full bg-gradient-to-r from-[#0B192C] via-[#0e274a] to-[#005fb0] text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg border border-blue-900/60 mb-8 sm:mb-10 cursor-pointer group transition-all duration-300 hover:shadow-xl active:scale-[0.99]"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-8">
            
            {/* Circular Photo of Founder */}
            <div className="relative shrink-0">
              <img
                src={founder.photoUrl}
                alt={founder.name}
                referrerPolicy="no-referrer"
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full object-cover ring-4 ring-blue-400/40 border-2 border-white/30 shadow-xl transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full bg-blue-700 text-white flex items-center justify-center font-display font-bold text-2xl hidden">
                JR
              </div>
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-[#0B192C] rounded-full shadow-md" title="Abogado Titular Activo" />
            </div>

            {/* Founder Biography & Credentials */}
            <div className="flex-1 min-w-0 text-center md:text-left space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/25 text-blue-200 border border-blue-400/30">
                  Fundador & Director General
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-blue-200/90 font-mono">
                  <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{founder.experience}</span>
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight group-hover:text-blue-200 transition-colors">
                  {founder.name}
                </h3>
                <p className="text-xs sm:text-sm text-blue-200 font-medium mt-0.5">
                  {founder.specialty}
                </p>
              </div>

              <blockquote className="text-xs sm:text-sm text-slate-200 italic leading-relaxed bg-white/5 p-3.5 sm:p-4 rounded-xl border border-white/10 max-w-3xl">
                "Fundé BinLegal con la convicción de que la ley debe ser una catapulta de crecimiento y no un laberinto burocrático para los emprendedores. Nuestro compromiso es blindar tu negocio para que puedas escalar sin contingencias imprevistas."
              </blockquote>

              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <a
                  href="#contacto"
                  onClick={(e) => {
                    e.stopPropagation();
                    trackClick('equipo', 'solicitar_consulta_fundador');
                  }}
                  className="px-5 py-2.5 bg-[#0071ce] hover:bg-[#0084f0] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Mail className="w-4 h-4" />
                  <span>Solicitar consulta directa</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleOpenMember(founder)}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Ver perfil completo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* 4 Specialists Row: Adapts fully to the section width in white cards */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Equipo de Socios & Directores Especialistas
            </h4>
            <span className="text-xs text-slate-500 font-mono">4 abogados especialistas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {specialists.map((member) => {
              const initials = member.name.split(' ').map(n => n[0]).slice(0, 2).join('');

              return (
                <div
                  key={member.id}
                  onClick={() => handleOpenMember(member)}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-[#0071ce]/60 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
                >
                  <div>
                    {/* Member Top: Circular Avatar + Role */}
                    <div className="flex items-center gap-3.5 mb-3.5">
                      <div className="relative shrink-0">
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-blue-100 border border-slate-200 shadow-xs group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-900 text-white flex items-center justify-center font-display font-bold text-sm hidden">
                          {initials}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-[#0071ce] block w-fit truncate">
                          {member.role.split('·')[0].trim()}
                        </span>
                        <h4 className="text-sm sm:text-base font-display font-bold text-slate-950 mt-1 truncate group-hover:text-[#0071ce] transition-colors">
                          {member.name}
                        </h4>
                        <div className="text-[11px] text-[#0071ce] font-medium truncate">
                          {member.role.includes('·') ? member.role.split('·')[1].trim() : member.role}
                        </div>
                      </div>
                    </div>

                    {/* Member Specialty */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">
                      {member.bio}
                    </p>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 font-mono truncate">
                      {member.experience}
                    </span>
                    <span className="text-[11px] font-bold text-[#0071ce] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 shrink-0">
                      <span>Ver</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-7 animate-in zoom-in-95">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="flex items-center gap-4">
                <img
                  src={selectedMember.photoUrl}
                  alt={selectedMember.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-blue-50 border-2 border-white shadow-sm shrink-0"
                />
                <div>
                  <h3 className="text-lg sm:text-xl font-display font-extrabold text-slate-950 leading-tight">
                    {selectedMember.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-[#0071ce] mt-0.5">
                    {selectedMember.role}
                  </p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>{selectedMember.experience}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 leading-relaxed text-slate-600">
                {selectedMember.bio}
              </div>

              <div className="p-4 bg-white rounded-2xl space-y-2 border border-slate-200 text-xs">
                <div>
                  <strong className="text-slate-900 block mb-0.5 font-semibold">Enfoque y especialidad:</strong>
                  <span className="text-slate-600">{selectedMember.specialty}</span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <strong className="text-slate-900 block mb-0.5 font-semibold">Contacto directo:</strong>
                  <a href={`mailto:${selectedMember.email}`} className="text-[#0071ce] hover:underline font-mono">
                    {selectedMember.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <a
                href="#contacto"
                onClick={() => {
                  trackClick('equipo_modal', `contactar_${selectedMember.id}`);
                  setSelectedMember(null);
                }}
                className="px-5 py-2.5 text-xs font-semibold bg-[#0071ce] hover:bg-[#005fb0] text-white rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Solicitar consulta</span>
              </a>

              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
