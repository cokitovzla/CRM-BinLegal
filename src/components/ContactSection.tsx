import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageCircle, Clock, ShieldCheck, ArrowRight, MessageSquare, Instagram } from 'lucide-react';
import { trackClick, trackWhatsAppClick, trackAuthAction } from '../lib/analytics';
import { Lead } from '../types';

interface ContactSectionProps {
  onOpenAdmin: () => void;
  onOpenAuth?: (mode?: 'login' | 'register' | 'newsletter') => void;
  onNewLeadCreated?: (lead: Lead) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ 
  onOpenAdmin, 
  onOpenAuth,
  onNewLeadCreated 
}) => {
  const { subscribeNewsletter } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedLeadInfo, setSubmittedLeadInfo] = useState<{ id: string; email: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    trackClick('contacto', 'enviar_mensaje_directo', {
      has_company: Boolean(company.trim()),
    });

    const leadId = `lead-contact-${Date.now()}`;
    const newContactLead: Lead = {
      id: leadId,
      fullName: name.trim(),
      email: email.trim(),
      company: company.trim() || 'Consulta particular',
      industry: 'Contacto directo web',
      stage: 'En crecimiento',
      areasOfInterest: ['Asesoría General'],
      notes: message.trim(),
      status: 'nuevo_lead',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      calculatedRiskScore: 0,
      riskSummary: `Consulta enviada desde el formulario de contacto web: "${message.trim().slice(0, 140)}${message.length > 140 ? '...' : ''}"`,
      riskItems: [],
      internalNotes: [
        {
          id: `note-${Date.now()}`,
          author: 'Formulario Web BinLegal',
          text: `Mensaje de ${name.trim()} (${email.trim()}${company.trim() ? ` · ${company.trim()}` : ''}): ${message.trim()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
        }
      ]
    };

    if (onNewLeadCreated) {
      onNewLeadCreated(newContactLead);
    }

    setSubmittedLeadInfo({ id: leadId, email: email.trim() });
    setSubmitted(true);
    setIsSubmitting(false);
    setName('');
    setEmail('');
    setCompany('');
    setMessage('');
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setNewsletterLoading(true);
    try {
      trackAuthAction('newsletter_subscribe', { source: 'contacto_footer' });
      await subscribeNewsletter(newsletterEmail);
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    } catch (e) {
      console.error(e);
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <section 
      id="contacto" 
      className="py-12 sm:py-16 lg:py-20 bg-slate-50/80 border-b border-slate-200 scroll-mt-24 sm:scroll-mt-28"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#0071ce] uppercase mb-2 bg-blue-50 px-2.5 py-1 rounded-md">
            <MessageSquare className="w-3.5 h-3.5 text-[#0071ce]" />
            <span>Contacto & Asesoría Directa</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-slate-950 tracking-tight mb-2">
            Hablemos de tu negocio
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600 leading-relaxed">
            ¿Tienes un reto legal, una sociedad por estructurar o simplemente quieres estar protegido? Escríbenos y coordinamos una primera conversación directa y sin burocracia con nuestro equipo.
          </p>
        </div>

        {/* 2-Column Contact & Channels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-8 sm:mb-10">
          
          {/* Direct Message Form */}
          <div className="lg:col-span-7 bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs">
            {submitted ? (
              <div className="text-center py-8 sm:py-10 space-y-4 animate-in fade-in">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                
                <div>
                  <h3 className="text-xl font-display font-bold text-slate-950">
                    Mensaje recibido y registrado en el CRM
                  </h3>
                  <div className="inline-block mt-1 font-mono text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded">
                    Solicitud #{submittedLeadInfo?.id.slice(-6)}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Tu consulta fue enviada con éxito al despacho de <strong>José Rafael Vásquez</strong> y al equipo de socios de BinLegal. Te responderemos directamente a <strong>{submittedLeadInfo?.email}</strong> en menos de 24 horas hábiles.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Enviar otro mensaje o consulta
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre y apellido"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071ce]/30 focus:border-[#0071ce] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Correo *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@empresa.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071ce]/30 focus:border-[#0071ce] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Empresa o proyecto <span className="text-slate-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Nombre comercial o denominación social"
                    className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071ce]/30 focus:border-[#0071ce] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ¿En qué podemos ayudarte? *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe brevemente tu situación, duda con socios, contratos o trámite..."
                    className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071ce]/30 focus:border-[#0071ce] transition-all"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Se guarda directamente en CRM con confidencialidad.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-3 bg-[#0071ce] hover:bg-[#005fb0] active:bg-[#004f91] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
                  >
                    <span>Enviar mensaje</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Contact Details & Channels */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-base sm:text-lg font-display font-bold text-slate-950">
                Canales de Atención Directa
              </h3>

              {/* Direct WhatsApp Call to Action Button */}
              <a
                href="https://wa.me/584122468800?text=Hola%20BinLegal,%20deseo%20asesor%C3%ADa%20legal%20para%20mi%20empresa."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick('contact_channel_card')}
                data-track-section="contacto"
                data-track-name="whatsapp_direct_action_card"
                className="p-3.5 bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200/90 rounded-xl flex items-center justify-between gap-3 group transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <span>Escribir de una vez al WhatsApp</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-200/90 text-emerald-900 rounded font-bold">Respuesta ágil</span>
                    </div>
                    <div className="text-[11px] text-emerald-800 font-mono">
                      +58 412 246 8800 · Atención personalizada
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-1 transition-transform shrink-0" />
              </a>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700 pt-1">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0071ce] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Correo Electrónico
                    </div>
                    <a 
                      href="mailto:contacto@binlegal.com" 
                      onClick={() => trackClick('contacto', 'click_email')}
                      data-track-section="contacto"
                      data-track-name="email_contacto"
                      className="font-semibold text-slate-900 hover:text-[#0071ce] transition-colors"
                    >
                      contacto@binlegal.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Teléfono / WhatsApp de Guardia
                    </div>
                    <a
                      href="https://wa.me/584122468800"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackWhatsAppClick('contacto_directo')}
                      data-track-section="contacto"
                      data-track-name="whatsapp_contacto_directo"
                      className="font-semibold text-slate-900 font-mono text-xs hover:text-[#0071ce] flex items-center gap-1.5 transition-colors"
                    >
                      <span>+58 212 900 2460 / +58 412 246 8800</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-purple-500/10 text-rose-600 flex items-center justify-center shrink-0">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Síguenos en Instagram
                    </div>
                    <a 
                      href="https://instagram.com/binlegal" 
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackClick('contacto', 'click_instagram')}
                      data-track-section="contacto"
                      data-track-name="instagram_contacto"
                      className="font-semibold text-slate-900 hover:text-rose-600 transition-colors flex items-center gap-1.5"
                    >
                      <span>@binlegal</span>
                      <span className="text-slate-400 font-normal text-xs">· Criterios jurídicos & tips</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Ubicación Principal
                    </div>
                    <div className="text-slate-700 text-xs">
                      Caracas, Venezuela · Atención remota a nivel nacional y PYMES regionales en LATAM.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick response commitment */}
            <div className="p-5 rounded-2xl bg-[#0B192C] text-white border border-slate-800 shadow-sm">
              <div className="text-[10px] font-mono uppercase tracking-wider text-blue-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Compromiso BinLegal</span>
              </div>
              <h4 className="text-sm font-bold mb-1.5 text-white">
                Cero burocracia, respuestas en menos de 24 horas.
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sabemos que los negocios no pueden esperar semanas por una opinión legal. Nuestro modelo prioriza la agilidad y la claridad ejecutiva.
              </p>
            </div>
          </div>

        </div>

        {/* Newsletter Section */}
        <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/90 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 shadow-xs">
          <div className="max-w-md">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#0071ce] mb-0.5">
              Boletín Jurídico
            </div>
            <h3 className="text-base sm:text-lg font-display font-bold text-slate-950 mb-1">
              Inteligencia legal para tu negocio, cada mes.
            </h3>
            <p className="text-xs text-slate-600">
              Casos reales, cambios de normativas, modelos descargables y consejos directos sin spam.
            </p>
          </div>

          <div className="w-full md:w-auto">
            {newsletterSubscribed ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 bg-slate-100 px-4 py-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>¡Suscripción confirmada! Te enviaremos la próxima edición.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="nombre@empresa.com"
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071ce]/30 focus:border-[#0071ce] min-w-[200px]"
                />
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="px-4 py-2.5 bg-[#0071ce] hover:bg-[#005fb0] text-white font-bold text-xs rounded-xl transition-colors whitespace-nowrap shadow-xs cursor-pointer active:scale-95"
                >
                  {newsletterLoading ? 'Enviando...' : 'Suscribirme'}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
