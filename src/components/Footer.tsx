import React from 'react';
import { 
  Lock, 
  Briefcase, 
  Compass, 
  Workflow, 
  ShieldCheck, 
  BookOpen, 
  Sparkles, 
  MessageSquare,
  Instagram,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { trackNavigation, trackClick, trackWhatsAppClick } from '../lib/analytics';
import { LegalTab } from './LegalInfoModal';

interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
  onOpenAdmin: () => void;
  onOpenLegalModal?: (tab: LegalTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigateSection, 
  onOpenAdmin,
  onOpenLegalModal 
}) => {
  const handleFooterNav = (sectionId: string) => {
    trackNavigation(sectionId, 'footer');
    onNavigateSection(sectionId);
  };

  const handleLegalClick = (tab: LegalTab) => {
    trackClick('footer', `legal_${tab}`);
    if (onOpenLegalModal) {
      onOpenLegalModal(tab);
    }
  };

  return (
    <footer className="bg-white border-t border-neutral-200 pt-8 sm:pt-10 pb-20 sm:pb-8 text-xs text-neutral-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 pb-6 sm:pb-8 border-b border-neutral-200/80">
          
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <img 
                src="/assets/images/LogoApaisado_BinLegal.png" 
                alt="BinLegal Logo" 
                className="h-7 sm:h-8 w-auto object-contain" 
              />
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              Asesoría legal estratégica para PYME. Impulsamos y protegemos tu negocio en cada etapa de su crecimiento con soluciones directas y ágiles.
            </p>

            <div className="text-[11px] text-neutral-400 font-mono">
              Fundado por José Rafael Vásquez · Caracas, Venezuela
            </div>

            {/* Social Media Link: Instagram */}
            <div className="pt-1">
              <a
                href="https://instagram.com/binlegal"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick('footer', 'click_instagram')}
                data-track-section="footer"
                data-track-name="footer_instagram"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-rose-600 transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-rose-50/60"
              >
                <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                  <Instagram className="w-3.5 h-3.5" />
                </div>
                <span>Síguenos en Instagram @binlegal</span>
              </a>
            </div>
          </div>

          {/* Navigation Links with Matching Section Icons */}
          <div className="md:col-span-3 space-y-2">
            <div className="text-[11px] font-semibold text-neutral-900 uppercase tracking-wider">
              Navegación
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleFooterNav('que-hacemos')}
                  data-track-section="footer"
                  data-track-name="footer_que_hacemos"
                  className="hover:text-neutral-950 transition-colors cursor-pointer flex items-center gap-2 group text-left"
                >
                  <Briefcase className="w-3.5 h-3.5 text-[#0071ce] shrink-0 group-hover:scale-110 transition-transform" />
                  <span>Qué hacemos</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav('por-que')}
                  data-track-section="footer"
                  data-track-name="footer_por_que"
                  className="hover:text-neutral-950 transition-colors cursor-pointer flex items-center gap-2 group text-left"
                >
                  <Compass className="w-3.5 h-3.5 text-[#0071ce] shrink-0 group-hover:scale-110 transition-transform" />
                  <span>Por qué lo hacemos</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav('como')}
                  data-track-section="footer"
                  data-track-name="footer_como"
                  className="hover:text-neutral-950 transition-colors cursor-pointer flex items-center gap-2 group text-left"
                >
                  <Workflow className="w-3.5 h-3.5 text-[#0071ce] shrink-0 group-hover:scale-110 transition-transform" />
                  <span>Cómo lo hacemos</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav('equipo')}
                  data-track-section="footer"
                  data-track-name="footer_equipo"
                  className="hover:text-neutral-950 transition-colors cursor-pointer flex items-center gap-2 group text-left"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0071ce] shrink-0 group-hover:scale-110 transition-transform" />
                  <span>Equipo de abogados</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav('blog')}
                  data-track-section="footer"
                  data-track-name="footer_blog"
                  className="hover:text-neutral-950 transition-colors cursor-pointer flex items-center gap-2 group text-left"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#0071ce] shrink-0 group-hover:scale-110 transition-transform" />
                  <span>Blog & Criterios</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav('diagnostico')}
                  data-track-section="footer"
                  data-track-name="footer_diagnostico"
                  className="hover:text-[#0071ce] font-semibold text-[#0071ce] transition-colors cursor-pointer flex items-center gap-2 group text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#0071ce] shrink-0 group-hover:scale-110 transition-transform" />
                  <span>Diagnóstico Legal Gratuito</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav('contacto')}
                  data-track-section="footer"
                  data-track-name="footer_contacto"
                  className="hover:text-neutral-950 transition-colors cursor-pointer flex items-center gap-2 group text-left"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#0071ce] shrink-0 group-hover:scale-110 transition-transform" />
                  <span>Contacto</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="md:col-span-4 space-y-3">
            <div className="text-[11px] font-semibold text-neutral-900 uppercase tracking-wider">
              Contacto Directo
            </div>
            <div className="space-y-1.5 text-xs text-neutral-600">
              <div>
                <a href="mailto:contacto@binlegal.com" className="hover:text-neutral-950 transition-colors font-medium">
                  contacto@binlegal.com
                </a>
              </div>
              <div className="font-mono text-[11px]">
                <a 
                  href="https://wa.me/584122468800"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick('footer_phone')}
                  className="hover:text-emerald-700 flex items-center gap-1.5 text-slate-700"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp: +58 412 246 8800 / +58 212 900 2460</span>
                </a>
              </div>
              <div className="text-neutral-500 pt-0.5">
                Torre Xerox, Piso 9, Av. Francisco de Miranda, Chacao, Caracas.
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md text-xs font-medium border border-neutral-200 transition-colors cursor-pointer"
              >
                <Lock className="w-3 h-3" />
                <span>Panel Admin / CRM</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom bar with Legal Items + FAQ */}
        <div className="pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] text-neutral-500">
          <div>
            © 2026 BinLegal. Soluciones legales alternativas. Todos los derechos reservados.
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-1">
            <button 
              onClick={() => handleLegalClick('aviso-legal')}
              className="hover:text-neutral-950 transition-colors cursor-pointer"
            >
              Aviso Legal
            </button>
            <span aria-hidden="true">·</span>
            <button 
              onClick={() => handleLegalClick('terminos')}
              className="hover:text-neutral-950 transition-colors cursor-pointer"
            >
              Términos y Condiciones
            </button>
            <span aria-hidden="true">·</span>
            <button 
              onClick={() => handleLegalClick('privacidad')}
              className="hover:text-neutral-950 transition-colors cursor-pointer"
            >
              Privacidad de Datos
            </button>
            <span aria-hidden="true">·</span>
            <button 
              onClick={() => handleLegalClick('faq')}
              className="hover:text-[#0071ce] font-semibold text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3 text-[#0071ce]" />
              <span>Preguntas Frecuentes</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
