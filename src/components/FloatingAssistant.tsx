import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  MessageCircle, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink, 
  ArrowRight, 
  FileText, 
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { trackClick, trackWhatsAppClick } from '../lib/analytics';

interface FloatingAssistantProps {
  onNavigateSection?: (sectionId: string) => void;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  action?: {
    label: string;
    type: 'whatsapp' | 'section' | 'external';
    target?: string;
  };
}

const PRESET_FAQS = [
  {
    question: '¿Qué servicios ofrece BinLegal?',
    answer: 'BinLegal brinda asesoría jurídica integral y preventiva para PYMEs y startups: contratos comerciales, derecho corporativo y societario, propiedad intelectual y registro de marcas (SAPI), cumplimiento laboral (LOTTT), blindaje fiscal y resolución de controversias.',
    actionLabel: 'Ver áreas de práctica',
    actionSection: 'que-hacemos'
  },
  {
    question: '¿Cómo funciona el Diagnóstico Legal Gratuito?',
    answer: 'Es una herramienta guiada sin costo que evalúa en 4 pasos la salud jurídica de tu negocio, identifica puntos ciegos o contingencias legales y te genera un semáforo de riesgo estratégico con recomendaciones claras.',
    actionLabel: 'Realizar diagnóstico ahora',
    actionSection: 'diagnostico'
  },
  {
    question: '¿Cuáles son las modalidades de honorarios?',
    answer: 'Operamos con total transparencia: tarifas planas y predecibles por proyecto o paquetes de retención mensual (igualas jurídicas) ajustadas al tamaño y flujo de tu empresa, sin costos ocultos ni facturación por horas innecesarias.',
    actionLabel: 'Consultar planes y tarifas',
    actionSection: 'contacto'
  },
  {
    question: '¿Cómo agendar con José Rafael Vásquez o el equipo?',
    answer: 'Puedes solicitar una consulta mediante nuestro formulario de contacto o escribirnos directamente a WhatsApp. Nuestro equipo responderá en menos de 24 horas hábiles para coordinar una sesión estratégica.',
    actionLabel: 'Escribir a WhatsApp',
    actionType: 'whatsapp'
  },
  {
    question: '¿Atienden fuera de Caracas o en el exterior?',
    answer: 'Sí. Atendemos a empresas en toda Venezuela mediante asesoría remota e híbrida, y asesoramos a inversionistas y empresas internacionales que operan o desean constituirse en el país.',
    actionLabel: 'Contactar equipo',
    actionSection: 'contacto'
  },
  {
    question: '¿Cómo protegen mi confidencialidad?',
    answer: 'Toda consulta y documento está estrictamente resguardado por el secreto profesional del Código de Ética del Abogado y protocolos de confidencialidad digital.',
    actionLabel: 'Conocer más',
    actionSection: 'por-que'
  }
];

export const FloatingAssistant: React.FC<FloatingAssistantProps> = ({ onNavigateSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: '¡Hola! Soy Mr. Bin, tu asistente virtual en BinLegal. Puedo responder tus dudas sobre nuestros servicios legales, el diagnóstico gratuito o comunicarte de inmediato con nuestro equipo por WhatsApp.',
      timestamp: 'Ahora'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleOpenToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      trackClick('assistant', 'open_assistant_modal');
    }
  };

  const handleSelectFaq = (faq: typeof PRESET_FAQS[0]) => {
    trackClick('assistant', 'select_faq', { question: faq.question });
    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: faq.question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const botMsg: Message = {
      id: `msg-${Date.now()}-bot`,
      sender: 'bot',
      text: faq.answer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: faq.actionType === 'whatsapp' 
        ? { label: faq.actionLabel, type: 'whatsapp' }
        : { label: faq.actionLabel, type: 'section', target: faq.actionSection }
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
  };

  const handleSendCustomMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputQuery.trim();
    if (!query) return;

    trackClick('assistant', 'send_custom_message', { query_length: query.length });

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Analyze query keywords for intelligent response
    const qLower = query.toLowerCase();
    let responseText = '';
    let actionItem: Message['action'] = undefined;

    if (qLower.includes('whatsapp') || qLower.includes('teléfono') || qLower.includes('numero') || qLower.includes('llamar') || qLower.includes('contacto')) {
      responseText = 'Puedes contactarnos directamente por WhatsApp al +58 412 246 8800 o por correo a contacto@binlegal.com. Atendemos de lunes a viernes en horario comercial.';
      actionItem = { label: 'Abrir WhatsApp', type: 'whatsapp' };
    } else if (qLower.includes('precio') || qLower.includes('costo') || qLower.includes('tarifa') || qLower.includes('honorarios') || qLower.includes('cuanto')) {
      responseText = 'En BinLegal manejamos paquetes cerrados y cuotas mensuales adaptadas a tu modelo de negocio, eliminando sorpresas de facturación. ¿Deseas solicitar una cotización personalizada?';
      actionItem = { label: 'Solicitar cotización en contacto', type: 'section', target: 'contacto' };
    } else if (qLower.includes('diagnostico') || qLower.includes('gratis') || qLower.includes('salud') || qLower.includes('test')) {
      responseText = 'Nuestro Diagnóstico Legal Gratuito te permite evaluar contratos, estatus mercantil y riesgos laborales en solo 3 minutos y sin costo alguno.';
      actionItem = { label: 'Ir al Diagnóstico Gratuito', type: 'section', target: 'diagnostico' };
    } else if (qLower.includes('jose') || qLower.includes('vasquez') || qLower.includes('fundador') || qLower.includes('abogados') || qLower.includes('socio')) {
      responseText = 'José Rafael Vásquez es el socio fundador de BinLegal, especialista en derecho corporativo y estrategia de negocios con más de 15 años de experiencia asesorando PYMEs y empresas líderes.';
      actionItem = { label: 'Ver perfil del equipo', type: 'section', target: 'equipo' };
    } else if (qLower.includes('marca') || qLower.includes('sapi') || qLower.includes('patente') || qLower.includes('propiedad intelectual')) {
      responseText = 'Protegemos tu marca comercial, logotipos, derechos de autor y activos intangibles ante el SAPI y jurisdicciones internacionales para evitar copias y litigios.';
      actionItem = { label: 'Ver área de Propiedad Intelectual', type: 'section', target: 'que-hacemos' };
    } else if (qLower.includes('laboral') || qLower.includes('lottt') || qLower.includes('empleado') || qLower.includes('trabajador') || qLower.includes('despido')) {
      responseText = 'Blindamos tus relaciones laborales conforme a la LOTTT: contratos de trabajo, reglamentos internos, prevención de demandas y auditorías de nómina legal.';
      actionItem = { label: 'Consultar área laboral', type: 'section', target: 'que-hacemos' };
    } else if (qLower.includes('contrato') || qLower.includes('acuerdo') || qLower.includes('ndas') || qLower.includes('proveedor')) {
      responseText = 'Redactamos y revisamos contratos mercantiles a la medida de tu empresa: acuerdos de socios, confidencialidad (NDA), distribución, prestación de servicios y términos de uso.';
      actionItem = { label: 'Solicitar revisión contractual', type: 'section', target: 'contacto' };
    } else {
      responseText = 'Soy Mr. Bin. Para una orientación legal precisa y adaptada a la situación particular de tu empresa, te sugerimos contactar directamente por WhatsApp a nuestros abogados o dejarnos tus datos en el formulario.';
      actionItem = { label: 'Escribir por WhatsApp ahora', type: 'whatsapp' };
    }

    const botMsg: Message = {
      id: `msg-${Date.now()}-bot`,
      sender: 'bot',
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: actionItem
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setInputQuery('');
  };

  const handleActionClick = (action: NonNullable<Message['action']>) => {
    if (action.type === 'whatsapp') {
      trackWhatsAppClick('assistant_message_action');
      window.open('https://wa.me/584122468800?text=Hola%20BinLegal,%20deseo%20asesor%C3%ADa%20legal%20para%20mi%20empresa.', '_blank');
    } else if (action.type === 'section' && action.target && onNavigateSection) {
      onNavigateSection(action.target);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button with Dismiss option */}
      <div className="fixed bottom-5 right-4 sm:right-6 z-40">
        {isDismissed ? (
          /* Subtle discreet restore pill when dismissed so it doesn't obstruct */
          <button
            onClick={() => setIsDismissed(false)}
            data-track-section="assistant"
            data-track-name="btn_restore_mr_bin"
            className="p-2 bg-slate-900/90 hover:bg-[#0B192C] text-white rounded-xl shadow-md border border-slate-700/80 text-xs flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-all cursor-pointer backdrop-blur-xs"
            title="Abrir Mr. Bin (Asistente Legal)"
            aria-label="Abrir Mr. Bin"
          >
            <Bot className="w-4 h-4 text-blue-400" />
            <span className="text-[11px] font-semibold hidden sm:inline">Mr. Bin</span>
          </button>
        ) : !isOpen ? (
          <div className="flex items-center bg-[#0B192C] hover:bg-[#142944] text-white rounded-2xl shadow-xl border border-slate-700/80 hover:border-[#0071ce] transition-all duration-300">
            <button
              onClick={handleOpenToggle}
              data-track-section="assistant"
              data-track-name="btn_open_floating_assistant"
              className="group flex items-center gap-2.5 p-3 sm:px-4 sm:py-3 cursor-pointer active:scale-95"
              aria-label="Abrir Mr. Bin y WhatsApp"
              title="Mr. Bin · Asistente Virtual & WhatsApp"
            >
              {/* Status pulsing dot */}
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>

              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
                <span className="text-xs font-bold tracking-tight text-white whitespace-nowrap">
                  Mr. Bin & WhatsApp
                </span>
              </div>

              {/* Quick mini WhatsApp badge */}
              <span className="hidden md:inline-flex items-center justify-center bg-emerald-600/90 text-[10px] font-bold px-1.5 py-0.5 rounded text-white font-mono">
                Online
              </span>
            </button>

            {/* Close/Dismiss button right on the pill so user can close it if in the way */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDismissed(true);
              }}
              className="p-2 sm:p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-r-2xl transition-colors cursor-pointer border-l border-slate-800"
              title="Cerrar y ocultar Mr. Bin de la navegación"
              aria-label="Cerrar Mr. Bin"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : null}
      </div>

      {/* Floating Assistant Popover / Window */}
      {isOpen && (
        <div 
          className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[400px] h-[550px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4"
          role="dialog"
          aria-label="Ventana de Mr. Bin"
        >
          {/* Header */}
          <div className="bg-[#0B192C] text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0071ce]/20 border border-[#0071ce]/40 flex items-center justify-center text-blue-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    Mr. Bin · Asistente Legal
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    En línea
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Orientación jurídica & canal directo
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsDismissed(true);
                }}
                className="px-2 py-1 text-[10px] text-slate-400 hover:text-slate-200 hover:bg-white/10 rounded transition-colors cursor-pointer"
                title="Ocultar Mr. Bin para navegar libremente"
              >
                Ocultar
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Cerrar ventana"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Primary WhatsApp Quick Banner */}
          <div className="bg-emerald-50 border-b border-emerald-200/90 p-2.5 sm:p-3 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-bold text-emerald-950">
                    Atención Directa por WhatsApp
                  </div>
                  <div className="text-[10px] text-emerald-800">
                    +58 412 246 8800 · Respuesta ágil
                  </div>
                </div>
              </div>

              <a
                href="https://wa.me/584122468800?text=Hola%20BinLegal,%20deseo%20asesor%C3%ADa%20legal%20para%20mi%20empresa."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick('assistant_direct_banner')}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0 shadow-xs active:scale-95"
              >
                <span>Chatear</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-slate-50/50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#0071ce] text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 shadow-2xs rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Optional Action inside message */}
                  {msg.action && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleActionClick(msg.action!)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0B192C] hover:bg-[#142944] text-white font-semibold text-[11px] rounded-lg transition-colors cursor-pointer"
                      >
                        <span>{msg.action.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 px-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Preset FAQ Quick Questions Bar */}
          <div className="p-2 sm:p-2.5 bg-white border-t border-slate-200 shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-[#0071ce]" />
              <span>Preguntas Frecuentes Rápidas:</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {PRESET_FAQS.map((faq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectFaq(faq)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-[#0071ce] text-slate-700 rounded-lg whitespace-nowrap border border-slate-200 transition-colors text-left shrink-0 cursor-pointer active:scale-95"
                >
                  {faq.question}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form 
            onSubmit={handleSendCustomMessage}
            className="p-2.5 sm:p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Escribe tu consulta legal o de servicios..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071ce]/30 focus:border-[#0071ce] transition-all"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="p-2 bg-[#0071ce] hover:bg-[#005fb0] disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer active:scale-95 shrink-0"
              title="Enviar consulta"
              aria-label="Enviar"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
