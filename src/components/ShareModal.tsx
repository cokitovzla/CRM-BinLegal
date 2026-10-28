import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  MessageSquare, 
  Linkedin, 
  Mail, 
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Use the canonical public URL or fallback to window.location
  const shareUrl = typeof window !== 'undefined' 
    ? (window.location.origin.includes('localhost') 
        ? 'https://ais-pre-qcargiylh46wkkuweanx6w-620132059100.us-east1.run.app' 
        : window.location.href.split('#')[0])
    : 'https://ais-pre-qcargiylh46wkkuweanx6w-620132059100.us-east1.run.app';

  const shareText = `¡Hola! Te comparto la plataforma de BinLegal: asesoría legal estratégica para PYMES, diagnóstico preventivo gratuito y seguimiento digital de expedientes.`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
  const shareLinkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const shareEmailUrl = `mailto:?subject=${encodeURIComponent('BinLegal - Asesoría Legal Estratégica PYME')}&body=${encodeURIComponent(`${shareText}\n\nPuedes ingresar aquí:\n${shareUrl}`)}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden p-5 sm:p-7">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0071ce]/10 text-[#0071ce] flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#0071ce] font-semibold">
                Difundir Ecosistema
              </div>
              <h3 className="text-lg sm:text-xl font-display font-extrabold text-neutral-950">
                Compartir con amigos de BinLegal
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-neutral-600 mb-5 leading-relaxed">
          Comparte el enlace de acceso directo para que socios, clientes y amigos del ecosistema puedan hacer su diagnóstico gratuito o revisar la plataforma:
        </p>

        {/* Copy Link Input Bar */}
        <div className="mb-5 p-1.5 pl-3 bg-neutral-50 rounded-xl border border-neutral-300 flex items-center justify-between gap-2">
          <span className="text-xs text-neutral-700 font-mono truncate select-all">
            {shareUrl}
          </span>
          <button
            onClick={handleCopyLink}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              copied
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[#0071ce] hover:bg-[#0060b0] text-white shadow-xs'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Enlace</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Social & Chat Buttons */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <a
            href={shareWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-900 flex flex-col items-center justify-center text-center gap-1 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] font-semibold">WhatsApp</span>
          </a>

          <a
            href={shareLinkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-blue-900 flex flex-col items-center justify-center text-center gap-1 transition-colors cursor-pointer"
          >
            <Linkedin className="w-4 h-4 text-blue-600" />
            <span className="text-[11px] font-semibold">LinkedIn</span>
          </a>

          <a
            href={shareEmailUrl}
            className="p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-900 flex flex-col items-center justify-center text-center gap-1 transition-colors cursor-pointer"
          >
            <Mail className="w-4 h-4 text-neutral-600" />
            <span className="text-[11px] font-semibold">Correo</span>
          </a>
        </div>

        {/* Note for the Team / Friends */}
        <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-neutral-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Guía rápida para tus invitados:</span>
          </div>
          <ul className="space-y-1 text-neutral-600 text-[11px]">
            <li>· <strong>Diagnóstico gratuito:</strong> Cualquier visitante puede completarlo en 3 minutos.</li>
            <li>· <strong>Portal de Clientes & CRM:</strong> Puedes ingresar como Demo o con tu cuenta creada para explorar expedientes en vivo.</li>
            <li>· <strong>Ecosistema PYME:</strong> Incluye directorio de empresas y foro de preguntas.</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-neutral-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Listo
          </button>
        </div>

      </div>
    </div>
  );
};
