import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { initGlobalClickTracking, trackNavigation, trackAuthAction } from './lib/analytics';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { WhySection } from './components/WhySection';
import { HowSection } from './components/HowSection';
import { TeamSection } from './components/TeamSection';
import { BlogSection } from './components/BlogSection';
import { DiagnosticSection } from './components/DiagnosticSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AdminCRM } from './components/AdminCRM';
import { ClientPortal } from './components/ClientPortal';
import { AuthModal } from './components/AuthModal';
import { AffiliateBanner } from './components/AffiliateBanner';
import { ShareModal } from './components/ShareModal';
import { ScrollToTop } from './components/ScrollToTop';
import { FloatingAssistant } from './components/FloatingAssistant';
import { LegalInfoModal, LegalTab } from './components/LegalInfoModal';
import { X } from 'lucide-react';
import { doc, setDoc, updateDoc, collection, onSnapshot, arrayUnion } from 'firebase/firestore';
import { db } from './lib/firebase';

import { 
  Lead, 
  LeadStatus, 
  LegalArea, 
  EcosystemStartup, 
  ForumPost, 
  LegalProcess, 
  ProcessStatus 
} from './types';
import { 
  INITIAL_LEADS, 
  INITIAL_ECOSYSTEM_STARTUPS, 
  INITIAL_FORUM_POSTS 
} from './data/initialData';
import { processService } from './services/processService';
import { INITIAL_PREVIEW_PROCESSES } from './data/previewProcesses';

function MainAppContent() {
  const { currentUser, userProfile, isAdmin, loading: authLoading } = useAuth();
  const isCrmPreview = window.location.pathname.replace(/\/$/, '') === '/crm-preview';
  const [previewLeads, setPreviewLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem('binlegal_crm_preview_leads_v1');
      if (!saved) return INITIAL_LEADS;
      const existing = JSON.parse(saved) as Lead[];
      const knownIds = new Set(existing.map(lead => lead.id));
      return [...existing, ...INITIAL_LEADS.filter(lead => !knownIds.has(lead.id))];
    } catch {
      return INITIAL_LEADS;
    }
  });
  const getRouteState = (pathname: string) => {
    const cleanPath = pathname.replace(/\/$/, '') || '/';
    const routes: Record<string, { view: 'landing' | 'admin' | 'ecosystem' | 'portal'; section: string }> = {
      '/': { view: 'admin', section: 'admin' },
      '/crm': { view: 'admin', section: 'admin' },
      '/crm-preview': { view: 'admin', section: 'admin' },
      '/diagnostico': { view: 'admin', section: 'diagnostico' },
      '/landing': { view: 'landing', section: 'inicio' },
      '/servicios': { view: 'landing', section: 'que-hacemos' },
      '/por-que': { view: 'landing', section: 'por-que' },
      '/como-funciona': { view: 'landing', section: 'como' },
      '/equipo': { view: 'landing', section: 'equipo' },
      '/blog': { view: 'landing', section: 'blog' },
      '/contacto': { view: 'landing', section: 'contacto' },
      '/portal': { view: 'portal', section: 'portal' },
    };
    return routes[cleanPath] || { view: 'admin' as const, section: 'admin' };
  };

  const initialRoute = getRouteState(window.location.pathname);
  const [currentView, setCurrentView] = useState<'landing' | 'admin' | 'ecosystem' | 'portal'>(initialRoute.view);
  const [activeSection, setActiveSection] = useState<string>(initialRoute.section);
  const [preselectedArea, setPreselectedArea] = useState<LegalArea | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState<boolean>(
    () => window.location.pathname.replace(/\/$/, '') === '/diagnostico'
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'newsletter'>('login');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>('faq');

  const handleOpenLegalModal = (tab: LegalTab) => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  useEffect(() => {
    // Automatically capture all data-track-* clicks across the whole page
    const cleanupTracking = initGlobalClickTracking();
    return () => cleanupTracking();
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register' | 'newsletter' = 'login') => {
    trackAuthAction('open_modal', { mode });
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Persistent Leads State (CRM & Diagnóstico)
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem('binlegal_leads_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_LEADS;
  });

  // Persistent Processes State (Syncing with Firestore & fallback memory)
  const [processes, setProcesses] = useState<LegalProcess[]>(isCrmPreview ? INITIAL_PREVIEW_PROCESSES : []);
  const [previewProcesses, setPreviewProcesses] = useState<LegalProcess[]>(() => {
    try {
      const saved = localStorage.getItem('binlegal_crm_preview_processes_v1');
      if (!saved) return INITIAL_PREVIEW_PROCESSES;
      const existing = JSON.parse(saved) as LegalProcess[];
      const knownIds = new Set(existing.map(process => process.id));
      return [...existing, ...INITIAL_PREVIEW_PROCESSES.filter(process => !knownIds.has(process.id))];
    } catch {
      return INITIAL_PREVIEW_PROCESSES;
    }
  });

  // Persistent Ecosystem Startups
  const [startups, setStartups] = useState<EcosystemStartup[]>(() => {
    try {
      const saved = localStorage.getItem('binlegal_startups_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ECOSYSTEM_STARTUPS;
  });

  // Persistent Forum Posts
  const [posts, setPosts] = useState<ForumPost[]>(() => {
    try {
      const saved = localStorage.getItem('binlegal_posts_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_FORUM_POSTS;
  });

  // Real-time Firestore subscription for legal and administrative processes
  useEffect(() => {
    let unsubscribe: () => void;
    if (!isCrmPreview && isAdmin && currentUser) {
      unsubscribe = processService.subscribeAllProcesses((updated) => {
        setProcesses(updated);
      });
    } else if (!isCrmPreview && currentUser) {
      unsubscribe = processService.subscribeUserProcesses(currentUser.uid, (updated) => {
        setProcesses(updated);
      });
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, isAdmin, isCrmPreview]);

  // Real-time Firestore subscription for leads (CRM / José Rafael Vásquez)
  useEffect(() => {
    let unsubscribe: () => void;
    if (!isCrmPreview && isAdmin && currentUser) {
      try {
        unsubscribe = onSnapshot(collection(db, 'leads'), (snapshot) => {
          if (!snapshot.empty) {
            const firestoreLeads = snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as Lead);
            setLeads(prev => {
              const map = new Map<string, Lead>();
              prev.forEach(l => map.set(l.id, l));
              firestoreLeads.forEach(l => map.set(l.id, l));
              return Array.from(map.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
            });
          }
        }, (err) => {
          console.warn('Firestore leads subscription note:', err);
        });
      } catch (e) {
        console.warn(e);
      }
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAdmin, currentUser, isCrmPreview]);

  // Keep CRM preview data isolated and persistent in this browser; never write demo edits to production Firestore.
  useEffect(() => {
    try { localStorage.setItem('binlegal_crm_preview_leads_v1', JSON.stringify(previewLeads)); } catch (err) {
      console.warn('Could not persist CRM preview leads:', err);
    }
  }, [previewLeads]);

  useEffect(() => {
    try { localStorage.setItem('binlegal_crm_preview_processes_v1', JSON.stringify(previewProcesses)); } catch (err) {
      console.warn('Could not persist CRM preview processes:', err);
    }
  }, [previewProcesses]);

  // Sync leads, startups, posts to local storage
  useEffect(() => {
    localStorage.setItem('binlegal_leads_v1', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('binlegal_startups_v1', JSON.stringify(startups));
  }, [startups]);

  useEffect(() => {
    localStorage.setItem('binlegal_posts_v1', JSON.stringify(posts));
  }, [posts]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Active section scroll spy for landing page
  useEffect(() => {
    if (currentView !== 'landing') {
      setActiveSection(currentView);
      return;
    }

    const sectionIds = ['inicio', 'que-hacemos', 'por-que', 'como', 'equipo', 'blog', 'diagnostico', 'contacto'];
    const elements = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter(e => e.isIntersecting);
      if (visible.length > 0) {
        visible.sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
        setActiveSection(visible[0].target.id);
      }
    }, {
      rootMargin: '-70px 0px -40% 0px',
      threshold: [0, 0.2, 0.5]
    });

    elements.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [currentView]);

  const handleNavigate = (view: 'landing' | 'admin' | 'ecosystem' | 'portal', sectionId?: string) => {
    // El acceso público abre solo una demo local con datos ficticios; /crm sigue protegido.
    if (view === 'portal' && !currentUser) {
      setCurrentView('landing');
      handleOpenAuth('login');
      return;
    }

    const sectionRoutes: Record<string, string> = {
      inicio: '/',
      'que-hacemos': '/servicios',
      'por-que': '/por-que',
      como: '/como-funciona',
      equipo: '/equipo',
      blog: '/blog',
      diagnostico: '/diagnostico',
      contacto: '/contacto',
    };
    const normalizedSection = sectionId === 'root' ? 'inicio' : sectionId;
    const destination = view === 'admin' ? '/crm-preview'
      : view === 'portal' ? '/portal'
      : view === 'ecosystem' ? '/ecosistema'
      : sectionRoutes[normalizedSection || 'inicio'] || '/';

    trackNavigation(normalizedSection || view, 'navigation');
    if (window.location.pathname !== destination) {
      window.history.pushState({}, '', destination);
    }
    setCurrentView(view);
    const nextSection = normalizedSection || (view === 'landing' ? 'inicio' : view);
    setActiveSection(nextSection);

    if (normalizedSection && normalizedSection !== 'inicio' && view === 'landing') {
      setTimeout(() => {
        const el = document.getElementById(normalizedSection);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Keep URL, active view and browser Back/Forward navigation in sync.
  useEffect(() => {
    const syncFromLocation = () => {
      const route = getRouteState(window.location.pathname);
      setCurrentView(route.view);
      setActiveSection(route.section);
      if (route.view === 'landing' && route.section !== 'inicio') {
        window.setTimeout(() => {
          document.getElementById(route.section)?.scrollIntoView({ behavior: 'auto', block: 'start' });
        }, 50);
      } else {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    };
    window.addEventListener('popstate', syncFromLocation);
    if (initialRoute.view === 'landing' && initialRoute.section !== 'inicio') {
      window.setTimeout(() => {
        document.getElementById(initialRoute.section)?.scrollIntoView({ behavior: 'auto', block: 'start' });
      }, 150);
    }
    return () => window.removeEventListener('popstate', syncFromLocation);
  }, []);

  // Keep private views closed if a session expires or the role is no longer authorized.
  useEffect(() => {
    if (authLoading) return;
    if (!isCrmPreview && currentView === 'admin' && (!currentUser || !isAdmin)) {
      setCurrentView('landing');
      setActiveSection('inicio');
      if (!currentUser) handleOpenAuth('login');
    } else if (currentView === 'portal' && !currentUser) {
      setCurrentView('landing');
      handleOpenAuth('login');
    }
  }, [authLoading, currentView, currentUser, isAdmin]);

  const handleSelectAreaForDiagnosis = (area: LegalArea) => {
    setPreselectedArea(area);
    handleNavigate('landing', 'diagnostico');
    showNotification(`Área "${area}" preseleccionada en tu diagnóstico legal.`);
  };

  const handleNewLeadCreated = async (newLead: Lead): Promise<boolean> => {
    try {
      // 1. Direct persistence in Firestore collection 'leads'
      await setDoc(doc(db, 'leads', newLead.id), newLead);

      // 2. Synchronize with React state & CRM lists
      setLeads(prev => {
        const exists = prev.some(l => l.id === newLead.id);
        return exists ? prev : [newLead, ...prev];
      });
      setPreviewLeads(prev => {
        const exists = prev.some(l => l.id === newLead.id);
        return exists ? prev : [newLead, ...prev];
      });

      showNotification(`¡Solicitud de "${newLead.company}" registrada en el CRM!`);
      return true;
    } catch (err) {
      console.error('Error al persistir solicitud en Firestore:', err);
      throw err;
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        return { ...lead, status: newStatus };
      }
      return lead;
    }));
    showNotification('Estado del prospecto actualizado en el pipeline.');
    try {
      await setDoc(doc(db, 'leads', leadId), { status: newStatus }, { merge: true });
    } catch (err) {
      console.warn('Firestore update status:', err);
    }
  };

  const handleAddInternalNote = async (leadId: string, noteText: string, author: string) => {
    const newNote = {
      id: `note-${Date.now()}`,
      author,
      text: noteText,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        return {
          ...lead,
          internalNotes: [...lead.internalNotes, newNote]
        };
      }
      return lead;
    }));
    showNotification('Nota interna guardada en esta vista; sincronizando con el CRM.');
    try {
      await setDoc(doc(db, 'leads', leadId), { internalNotes: arrayUnion(newNote) }, { merge: true });
      showNotification('Nota interna guardada y sincronizada.');
    } catch (err) {
      console.error('Could not persist internal note:', err);
      showNotification('La nota quedó en pantalla, pero no se pudo sincronizar. Verifica los permisos de Firebase.');
    }
  };

  const handleAddManualLead = async (manualLead: Lead) => {
    setLeads(prev => [manualLead, ...prev]);
    showNotification(`Lead "${manualLead.company}" registrado en el pipeline.`);
    try {
      await setDoc(doc(db, 'leads', manualLead.id), manualLead);
    } catch (err) {
      console.warn('Could not save manual lead to Firestore:', err);
    }
  };

  const handleUpdateLead = async (updatedLead: Lead) => {
    setLeads(prev => prev.map(lead => lead.id === updatedLead.id ? updatedLead : lead));
    setPreviewLeads(prev => prev.map(lead => lead.id === updatedLead.id ? updatedLead : lead));
    try {
      await setDoc(doc(db, 'leads', updatedLead.id), updatedLead, { merge: true });
    } catch (err) {
      console.warn('Firestore update lead:', err);
    }
  };

  const handleUpdateProcessStatus = async (
    processId: string, 
    status: ProcessStatus, 
    progress: number, 
    milestone?: string
  ) => {
    try {
      await processService.updateProcessStatus(processId, status, progress, milestone);
      // Local optimistic update
      setProcesses(prev => prev.map(p => {
        if (p.id === processId) {
          return {
            ...p,
            status,
            progress,
            nextMilestone: milestone || p.nextMilestone,
            updatedAt: new Date().toISOString().slice(0, 10)
          };
        }
        return p;
      }));
      showNotification('Estatus de expediente actualizado y sincronizado en vivo.');
    } catch (err) {
      console.error(err);
      showNotification('Error al actualizar estatus.');
    }
  };

  const handleUpdateProcessLawyer = async (processId: string, lawyer: string) => {
    try {
      await updateDoc(doc(db, 'processes', processId), { assignedLawyer: lawyer, updatedAt: new Date().toISOString().slice(0, 10) });
      setProcesses(prev => prev.map(process => process.id === processId ? { ...process, assignedLawyer: lawyer, updatedAt: new Date().toISOString().slice(0, 10) } : process));
      showNotification(`Abogado responsable actualizado: ${lawyer}`);
    } catch (err) {
      console.error('Could not reassign process:', err);
      showNotification('No se pudo cambiar el abogado. Verifica los permisos y vuelve a intentarlo.');
    }
  };

  const handleCreateProcess = async (newProcess: LegalProcess) => {
    setProcesses(prev => [newProcess, ...prev]);
    setPreviewProcesses(prev => [newProcess, ...prev]);
    showNotification(`¡Expediente "${newProcess.title}" abierto y formalizado!`);
    if (!isCrmPreview) {
      try {
        await processService.createProcess(newProcess);
      } catch (err) {
        console.warn('Could not save process to Firestore:', err);
      }
    }
  };

  const handleAddForumPost = (post: ForumPost) => {
    setPosts(prev => [post, ...prev]);
    showNotification('Pregunta publicada en el foro del ecosistema.');
  };

  const handleAddForumReply = (postId: string, text: string, author: string, company: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          replies: [
            ...post.replies,
            {
              id: `reply-${Date.now()}`,
              author,
              role: 'Miembro Comunidad',
              company,
              content: text,
              createdAt: 'Hace un momento'
            }
          ]
        };
      }
      return post;
    }));
    showNotification('Respuesta agregada al hilo.');
  };

  const unreadCount = leads.filter(l => l.status === 'nuevo_lead').length;

  return (
    <div className="min-h-screen w-full max-w-full bg-white text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-50 bg-neutral-950 text-white px-4 py-3 rounded-xl shadow-lg border border-neutral-800 text-xs font-medium flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 max-w-sm mx-auto sm:mx-0">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="flex-1">{notification}</span>
        </div>
      )}

      {/* Auth Modal with dynamic mode (login, register, or newsletter) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        defaultMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          showNotification('¡Sesión iniciada con éxito!');
          handleNavigate('portal');
        }}
      />

      {/* Share Platform Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Legal & FAQ Information Modal */}
      <LegalInfoModal
        isOpen={isLegalModalOpen}
        activeTab={legalModalTab}
        onClose={() => setIsLegalModalOpen(false)}
        onSelectTab={(tab) => setLegalModalTab(tab)}
      />

      {/* Interactive Diagnostic Form Modal (Simulator feeding directly into CRM) */}
      {showDiagnosticModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative my-auto max-h-[94dvh] flex flex-col">
            <div className="bg-[#3e4543] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-[#323836] shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xl">🧪</span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Simulador de Diagnóstico Legal PYME</h3>
                  <p className="text-xs text-[#cfd1d0]">Formulario real: al completarlo, se calculará el riesgo y se creará la solicitud en el CRM.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDiagnosticModal(false)}
                className="rounded-lg p-2 text-white hover:bg-[#4f5553] transition-colors cursor-pointer"
                title="Cerrar formulario"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-2 sm:p-6 bg-slate-50">
              <DiagnosticSection
                onNewLeadCreated={async (newLead) => {
                  const res = await handleNewLeadCreated(newLead);
                  setShowDiagnosticModal(false);
                  return res;
                }}
                preselectedArea={preselectedArea}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main CRM Application Workspace (100% Exclusive) */}
      <AdminCRM
        leads={isCrmPreview ? previewLeads : leads}
        processes={isCrmPreview ? previewProcesses : processes}
        onCreateProcess={handleCreateProcess}
        onUpdateLeadStatus={isCrmPreview
          ? (leadId, newStatus) => setPreviewLeads(prev => prev.map(lead => lead.id === leadId ? { ...lead, status: newStatus } : lead))
          : handleUpdateLeadStatus}
        onAddInternalNote={isCrmPreview
          ? (leadId, noteText, author) => setPreviewLeads(prev => prev.map(lead => lead.id === leadId ? { ...lead, internalNotes: [...lead.internalNotes, { id: `preview-note-${Date.now()}`, author, text: noteText, timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) }] } : lead))
          : handleAddInternalNote}
        onAddManualLead={isCrmPreview ? (newLead) => setPreviewLeads(prev => [newLead, ...prev]) : handleAddManualLead}
        onUpdateProcessStatus={isCrmPreview ? (processId, status, progress, milestone) => setPreviewProcesses(prev => prev.map(process => process.id === processId ? { ...process, status, progress: Math.max(0, Math.min(100, progress)), nextMilestone: milestone || process.nextMilestone, updatedAt: new Date().toISOString().slice(0, 10) } : process)) : handleUpdateProcessStatus}
        onUpdateProcessLawyer={isCrmPreview ? (processId, lawyer) => setPreviewProcesses(prev => prev.map(process => process.id === processId ? { ...process, assignedLawyer: lawyer, updatedAt: new Date().toISOString().slice(0, 10) } : process)) : handleUpdateProcessLawyer}
        onBackToLanding={() => setShowDiagnosticModal(true)}
        onOpenDiagnostic={() => setShowDiagnosticModal(true)}
        onUpdateLead={handleUpdateLead}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
      <Analytics />
      <SpeedInsights />
    </AuthProvider>
  );
}
