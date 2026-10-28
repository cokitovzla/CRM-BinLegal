import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ChevronUp, UserPlus, Mail, ShieldCheck } from 'lucide-react';
import { trackClick, trackAuthAction } from '../lib/analytics';

interface AffiliateBannerProps {
  onOpenAuth: (mode?: 'login' | 'register' | 'newsletter') => void;
}

export const AffiliateBanner: React.FC<AffiliateBannerProps> = ({ onOpenAuth }) => {
  const { currentUser } = useAuth();
  
  // State for dismissed or minimized
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('binlegal_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const [isMinimized, setIsMinimized] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640;
    }
    return false;
  });

  // If user is already logged in or dismissed for the session, hide banner
  if (currentUser || isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('binlegal_banner_dismissed', 'true');
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <>
      {/* Minimized Discreet Button (Sits cleanly in bottom corner, brand-consistent) */}
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-[58px] sm:bottom-5 right-3 sm:right-6 z-40 bg-white/95 backdrop-blur-md text-[#3e4543] hover:text-slate-950 px-3 py-1.5 rounded-lg shadow-md border border-slate-200 flex items-center gap-2 text-xs font-medium transition-all active:scale-95 cursor-pointer"
          title="Abrir registro y boletín"
          aria-label="Registrarme o suscribirme al boletín"
        >
          <span className="w-2 h-2 rounded-full bg-[#0071ce]" />
          <span>Registrarme / Boletín</span>
          <ChevronUp className="w-3 h-3 text-slate-400" />
        </button>
      ) : (
        /* Discreet, Professional Institutional Dock */
        <aside 
          aria-label="Registro en plataforma y boletín informativo"
          className="fixed bottom-[56px] sm:bottom-5 left-3 right-3 sm:left-6 sm:right-6 max-w-3xl sm:mx-auto z-40 bg-white/95 backdrop-blur-md text-[#3e4543] rounded-xl py-2.5 px-3.5 sm:px-4 shadow-lg border border-slate-200/90 transition-all animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4">
            
            {/* Left Info: Clean, quiet typographic hierarchy */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-6 sm:pr-0">
              <div className="w-7 h-7 rounded-lg bg-[#0071ce]/10 text-[#0071ce] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium mb-0.5">
                  <span>Comunidad PYME</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span>Boletín Legal</span>
                </div>
                <h4 className="text-xs sm:text-sm font-display font-bold text-slate-900 tracking-tight leading-tight">
                  ¿Aún no estás registrado en BinLegal?
                </h4>
                <p className="text-[11px] text-slate-600 leading-snug line-clamp-1 mt-0.5 hidden sm:block">
                  Crea tu cuenta para seguir tus trámites o recibe nuestro boletín normativo mensual.
                </p>
              </div>
            </div>

            {/* Right Action Buttons: Concise, executive labels */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-end">
              <button
                type="button"
                onClick={() => {
                  trackClick('banner_inferior', 'registrarme_click');
                  trackAuthAction('open_modal', { mode: 'register', source: 'banner_inferior' });
                  onOpenAuth('register');
                }}
                data-track-section="banner_inferior"
                data-track-name="btn_banner_registrarme"
                className="px-3 py-1.5 bg-[#0071ce] hover:bg-[#0060b0] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Registrarme</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  trackClick('banner_inferior', 'boletin_click');
                  trackAuthAction('open_modal', { mode: 'newsletter', source: 'banner_inferior' });
                  onOpenAuth('newsletter');
                }}
                data-track-section="banner_inferior"
                data-track-name="btn_banner_boletin"
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
                title="Suscribirme al boletín sin cuenta"
              >
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Boletín</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  trackClick('banner_inferior', 'cerrar_banner');
                  handleDismiss();
                }}
                data-track-section="banner_inferior"
                data-track-name="btn_cerrar_banner"
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors shrink-0 cursor-pointer ml-1"
                title="Cerrar aviso"
                aria-label="Cerrar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>
        </aside>
      )}
    </>
  );
};
