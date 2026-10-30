import { track } from '@vercel/analytics';

/**
 * Universal Analytics & Event Tracking for BinLegal
 * Powered by @vercel/analytics custom events and structured data tagging.
 */

export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Safely send a custom event to Vercel Analytics and Google Analytics (if present)
 */
export function trackEvent(eventName: string, properties: EventProperties = {}): void {
  if(import.meta.env.MODE==='emulators')return;
  try {
    // 1. Send to Vercel Analytics
    track(eventName, properties);

    // 2. Also send to standard window.gtag if user connects Google Analytics / GTM
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties);
    }

    // 3. Optional debug log in development
    if (import.meta.env.DEV) {
      console.log(`[📊 Analytics Tracked] -> ${eventName}:`, properties);
    }
  } catch (error) {
    // Never fail application execution due to tracking
    console.debug('[Analytics tracking error]:', error);
  }
}

/**
 * Track user interaction on any specific CTA or button
 */
export function trackClick(section: string, buttonName: string, extra: EventProperties = {}): void {
  trackEvent('cta_click', {
    section,
    button: buttonName,
    timestamp: new Date().toISOString(),
    ...extra,
  });
}

/**
 * Track navigation between sections
 */
export function trackNavigation(destination: string, source: string = 'navbar'): void {
  trackEvent('navigation_click', {
    destination,
    source,
  });
}

/**
 * Track WhatsApp conversation trigger (high-intent lead)
 */
export function trackWhatsAppClick(section: string, reason: string = 'asesoria_directa'): void {
  trackEvent('whatsapp_click', {
    section,
    reason,
    destination: 'https://wa.me/584120302194',
  });
}

/**
 * Track Legal Diagnostic progression
 */
export function trackDiagnosticStart(sector?: string): void {
  trackEvent('diagnostico_iniciado', {
    sector: sector || 'no_especificado',
  });
}

export function trackDiagnosticComplete(sector: string, score: number, risksCount: number): void {
  trackEvent('diagnostico_completado', {
    sector,
    score,
    risks_count: risksCount,
  });
}

/**
 * Track User Registration, Login, or Newsletter Subscription
 */
export function trackAuthAction(action: 'open_modal' | 'login' | 'register' | 'newsletter_subscribe', details: EventProperties = {}): void {
  trackEvent(`auth_${action}`, details);
}

/**
 * Track Legal Service card interaction / consultation
 */
export function trackServiceInteraction(serviceId: string, serviceTitle: string, action: 'view_details' | 'select' | 'quote'): void {
  trackEvent('service_interaction', {
    service_id: serviceId,
    service_title: serviceTitle,
    action,
  });
}

/**
 * Initialize automatic click listener that captures any element with `data-track-*` attributes
 */
export function initGlobalClickTracking(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleClick = (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest('[data-track-click], [data-track-section], [data-track-name]');
    if (!target) return;

    const name = target.getAttribute('data-track-name') || target.getAttribute('data-track-click') || target.textContent?.trim().slice(0, 40) || 'unnamed_element';
    const section = target.getAttribute('data-track-section') || 'global';
    const category = target.getAttribute('data-track-category') || 'ui_interaction';

    trackEvent('user_click', {
      name,
      section,
      category,
      tag: target.tagName.toLowerCase(),
    });
  };

  document.addEventListener('click', handleClick, { passive: true });
  return () => document.removeEventListener('click', handleClick);
}
