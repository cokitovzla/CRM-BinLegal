import React from 'react';
import { X, ShieldCheck, FileText, Lock, HelpCircle, ChevronRight, CheckCircle2 } from 'lucide-react';

export type LegalTab = 'aviso-legal' | 'terminos' | 'privacidad' | 'faq';

interface LegalInfoModalProps {
  isOpen: boolean;
  activeTab: LegalTab;
  onClose: () => void;
  onSelectTab: (tab: LegalTab) => void;
}

export const LegalInfoModal: React.FC<LegalInfoModalProps> = ({
  isOpen,
  activeTab,
  onClose,
  onSelectTab,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl max-h-[88vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0B192C] text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-white">
                Información Legal & Preguntas Frecuentes
              </h2>
              <p className="text-xs text-slate-300">
                BinLegal · Soluciones Legales Estratégicas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-6 overflow-x-auto no-scrollbar gap-1 pt-2">
          <button
            onClick={() => onSelectTab('faq')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'faq'
                ? 'border-[#0071ce] text-[#0071ce] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Preguntas Frecuentes (FAQ)</span>
          </button>

          <button
            onClick={() => onSelectTab('aviso-legal')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'aviso-legal'
                ? 'border-[#0071ce] text-[#0071ce] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Aviso Legal</span>
          </button>

          <button
            onClick={() => onSelectTab('terminos')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'terminos'
                ? 'border-[#0071ce] text-[#0071ce] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Términos & Condiciones</span>
          </button>

          <button
            onClick={() => onSelectTab('privacidad')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'privacidad'
                ? 'border-[#0071ce] text-[#0071ce] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacidad de Datos</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-slate-700 text-xs sm:text-sm leading-relaxed space-y-4">
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-blue-900 text-xs">
                <strong>Preguntas Frecuentes:</strong> Encuentra respuestas directas a las dudas más comunes sobre la asesoría legal estratégica de BinLegal para PYMEs y emprendedores.
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <h4 className="font-bold text-slate-950 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0071ce]" />
                    ¿Qué diferencia a BinLegal de un bufete tradicional?
                  </h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Operamos con enfoque preventivo, lenguaje ejecutivo y tarifas planas predecibles. No cobramos por horas sorpresivas ni alargamos procesos; blindamos tu negocio de forma ágil para que puedas operar con seguridad.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <h4 className="font-bold text-slate-950 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0071ce]" />
                    ¿El Diagnóstico Legal Estratégico tiene algún costo o compromiso?
                  </h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    No, es 100% gratuito y sin compromiso. Es una herramienta diseñada por nuestro fundador José Rafael Vásquez para que conozcas el nivel de contingencia de tu empresa en 4 áreas clave.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <h4 className="font-bold text-slate-950 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0071ce]" />
                    ¿Cómo son los esquemas de pago y contratación?
                  </h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Manejamos dos esquemas: 1) Servicios puntuales por proyecto (redacción de contratos específicos, registro de marca, adecuación estatutaria) y 2) Planes de Retainer mensual para tener un departamento legal externo permanente.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <h4 className="font-bold text-slate-950 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0071ce]" />
                    ¿Atienden empresas en otras ciudades o en el extranjero?
                  </h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Sí, nuestra estructura digital nos permite asesorar PYMEs en cualquier estado de Venezuela y empresas extranjeras con inversiones o relaciones mercantiles en la región.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <h4 className="font-bold text-slate-950 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0071ce]" />
                    ¿Cómo solicito una reunión con José Rafael Vásquez?
                  </h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Puedes completar el formulario de contacto, escribir directamente a nuestro WhatsApp oficial (+58 412 246 8800) o solicitar tu diagnóstico previo para revisar tu caso con prioridad.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'aviso-legal' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-950">1. Identificación del Despacho</h3>
              <p>
                BinLegal es una firma de asesoría jurídica y consultoría corporativa fundada y dirigida por el abogado José Rafael Vásquez, con sede en Caracas, Venezuela.
              </p>
              <h3 className="text-sm font-bold text-slate-950">2. Naturaleza de la Información Web</h3>
              <p>
                El contenido publicado en este portal web, incluyendo artículos del blog, guías y resultados orientativos del Diagnóstico Legal Gratuito, posee carácter informativo y formativo general. No constituye una consulta jurídica formal ni establece relación abogado-cliente hasta la suscripción formal de la propuesta de servicios.
              </p>
              <h3 className="text-sm font-bold text-slate-950">3. Propiedad Intelectual</h3>
              <p>
                Todas las marcas, logotipos, metodologías, textos y diseños gráficos presentes en esta plataforma son propiedad exclusiva de BinLegal o sus licenciantes y están protegidos por las leyes de propiedad intelectual correspondientes.
              </p>
            </div>
          )}

          {activeTab === 'terminos' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-950">1. Aceptación de los Términos</h3>
              <p>
                El acceso y utilización de este sitio web y sus herramientas interactivas (diagnóstico, portal cliente y CRM) implica la plena aceptación de los presentes Términos y Condiciones.
              </p>
              <h3 className="text-sm font-bold text-slate-950">2. Servicios Prestados</h3>
              <p>
                BinLegal ofrece consultoría preventiva, redacción y auditoría de contratos, gestión ante registros y organismos públicos, estructuración societaria y resolución de controversias para PYMEs. Cada contratación se formaliza mediante una propuesta de servicios aceptada.
              </p>
              <h3 className="text-sm font-bold text-slate-950">3. Responsabilidad del Usuario</h3>
              <p>
                El usuario se compromete a suministrar información veraz al solicitar diagnósticos, presupuestos o enviar mensajes a través de los canales de contacto provistos.
              </p>
            </div>
          )}

          {activeTab === 'privacidad' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-950">1. Compromiso de Confidencialidad</h3>
              <p>
                En BinLegal consideramos la confidencialidad como un pilar innegociable. Toda la información suministrada a través de nuestros formularios y canales de atención está amparada por el secreto profesional legal y normas éticas del ejercicio del derecho.
              </p>
              <h3 className="text-sm font-bold text-slate-950">2. Finalidad del Tratamiento de Datos</h3>
              <p>
                Los datos recolectados (nombre, correo electrónico, empresa, sector y mensajes) se utilizan exclusivamente para procesar tu diagnóstico, responder a tus consultas jurídicas, coordinar asesorías y, si lo autorizas, remitir el boletín legal mensual.
              </p>
              <h3 className="text-sm font-bold text-slate-950">3. No Cesión a Terceros</h3>
              <p>
                Bajo ninguna circunstancia vendemos, cedemos o comercializamos tus datos o los de tu empresa con terceros o agencias publicitarias.
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-3.5 sm:p-4 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono text-[11px]">
            BinLegal · Caracas, Venezuela
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0B192C] hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Entendido y cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
