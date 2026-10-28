import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { trackClick } from '../lib/analytics';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    trackClick('global', 'scroll_to_top');
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      data-track-section="global"
      data-track-name="btn_scroll_to_top"
      aria-label="Volver arriba"
      title="Volver al inicio de la página"
      className="fixed bottom-22 right-4 sm:right-6 z-40 p-2.5 sm:p-3 bg-white/95 hover:bg-[#0B192C] text-[#0B192C] hover:text-white rounded-xl shadow-md hover:shadow-lg border border-slate-200 hover:border-[#0B192C] transition-all duration-200 cursor-pointer active:scale-90 flex items-center justify-center group backdrop-blur-xs"
    >
      <ArrowUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-200 group-hover:-translate-y-0.5" />
      <span className="sr-only">Volver arriba</span>
    </button>
  );
};
