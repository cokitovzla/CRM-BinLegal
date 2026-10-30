import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { initGlobalClickTracking, trackNavigation, trackAuthAction } from './lib/analytics';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { DemoLanding } from './components/DemoLanding';
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
import { db, usingFirebaseEmulators, usingFirebaseStaging } from './lib/firebase';

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
import { commercialStatus, validateCommercial, validateBudgetDispatch, type CommercialActivity } from './domain/commercial';
import { operationsService } from './services/operationsService';
import type { LeadBudget } from './types';
import { leadService } from './services/leadService';
import { publicIntake, cleanLead, validateFollowUp, type LeadFollowUp } from './services/leadModel';
import { INITIAL_PREVIEW_PROCESSES } from './data/previewProcesses';

function MainAppContent() {
  const { currentUser, userProfile, isAdmin, loading: authLoading } = useAuth();
  const canUseWorkspace = isAdmin || ['lawyer','supervisor','intern','secretary'].includes(userProfile?.role || '');
  const isCrmPreview = window.location.pathname.replace(/\/$/, '') === '/crm-preview';
  const [previewLeads, setPreviewLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem('jurisnova_omega_preview_leads_v1');
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
      '/': { view: 'landing', section: 'inicio' },
      '/crm': { view: 'admin', section: 'admin' },
      '/crm-preview': { view: 'admin', section: 'admin' },
      '/diagnostico': { view: 'landing', section: 'diagnostico' },
      '/landing': { view: 'landing', section: 'inicio' },
      '/servicios': { view: 'landing', section: 'que-hacemos' },
      '/por-que': { view: 'landing', section: 'por-que' },
      '/como-funciona': { view: 'landing', section: 'como' },
      '/equipo': { view: 'landing', section: 'equipo' },
      '/blog': { view: 'landing', section: 'blog' },
      '/contacto': { view: 'landing', section: 'contacto' },
      '/portal': { view: 'portal', section: 'portal' },
    };
    return routes[cleanPath] || { view: 'landing' as const, section: 'inicio' };
  };

  const [, refreshLocation] = useState(0);
  const initialRoute = getRouteState(window.location.pathname);
  const [currentView, setCurrentView] = useState<'landing' | 'admin' | 'ecosystem' | 'portal'>(initialRoute.view);
  const [activeSection, setActiveSection] = useState<string>(initialRoute.section);
  const [preselectedArea, setPreselectedArea] = useState<LegalArea | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState<boolean>(
    () => false
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

  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadLoadError, setLeadLoadError] = useState('');
  // Persistent Processes State (Syncing with Firestore & fallback memory)
  const [processes, setProcesses] = useState<LegalProcess[]>(isCrmPreview ? INITIAL_PREVIEW_PROCESSES : []);
  const [previewProcesses, setPreviewProcesses] = useState<LegalProcess[]>(() => {
    try {
      const saved = localStorage.getItem('jurisnova_omega_preview_processes_v1');
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
    } else if (!isCrmPreview && currentUser && canUseWorkspace) {
      unsubscribe = operationsService.subscribeCases(currentUser.uid, setProcesses, () => showNotification('No se pudieron cargar los asuntos asignados.'), userProfile?.role === 'supervisor');
    } else if (!isCrmPreview && currentUser) {
      unsubscribe = processService.subscribeUserProcesses(currentUser.uid, (updated) => {
        setProcesses(updated);
      });
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, isAdmin, canUseWorkspace, isCrmPreview, userProfile?.role]);

  useEffect(() => {
    setLeads([]);
    setLeadLoadError('');
    if (isCrmPreview || !isAdmin || !currentUser) return;
    return leadService.subscribe(setLeads, () => {
      setLeads([]);
      setLeadLoadError('No pudimos cargar las solicitudes. Comprueba tu conexión y los permisos de Firebase.');
    });
  }, [currentUser?.uid, isAdmin, isCrmPreview]);

  // Keep CRM preview data isolated and persistent in this browser; never write demo edits to production Firestore.
  useEffect(() => {
    try { localStorage.setItem('jurisnova_omega_preview_leads_v1', JSON.stringify(previewLeads)); } catch (err) {
      console.warn('Could not persist CRM preview leads:', err);
    }
  }, [previewLeads]);

  useEffect(() => {
    try { localStorage.setItem('jurisnova_omega_preview_processes_v1', JSON.stringify(previewProcesses)); } catch (err) {
      console.warn('Could not persist CRM preview processes:', err);
    }
  }, [previewProcesses]);

  // Only demonstration/community data is stored in this browser.

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
    const destination = view === 'admin' ? (canUseWorkspace ? '/crm' : '/crm-preview')
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
      refreshLocation(previous => previous + 1);
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
    if (!isCrmPreview && currentView === 'admin' && (!currentUser || !canUseWorkspace)) {
      setCurrentView(currentUser ? 'portal' : 'landing');
      setActiveSection(currentUser ? 'portal' : 'inicio');
      if (!currentUser) handleOpenAuth('login');
    } else if (currentView === 'portal' && !currentUser) {
      setCurrentView('landing');
      handleOpenAuth('login');
    }
  }, [authLoading, currentView, currentUser, canUseWorkspace, isCrmPreview]);

  const handleSelectAreaForDiagnosis = (area: LegalArea) => {
    setPreselectedArea(area);
    handleNavigate('landing', 'diagnostico');
    showNotification(`Área "${area}" preseleccionada en tu diagnóstico legal.`);
  };

  const receiveLead = async (newLead: Lead, source: 'diagnostic' | 'contact'): Promise<boolean> => {
    if (isCrmPreview) {
      const intake = publicIntake(newLead, source);
      setPreviewLeads(previous => [intake, ...previous.filter(item => item.id !== intake.id)]);
      showNotification('Solicitud de muestra guardada en este navegador.');
      return true;
    }
    await leadService.submit(newLead, source);
    showNotification('Solicitud recibida por el despacho.');
    return true;
  };
  const handleNewLeadCreated = (lead: Lead) => receiveLead(lead, 'diagnostic');

  const persistLead = async (lead: Lead): Promise<void> => {
    if(lead.commercial)lead={...lead,commercial:validateCommercial(lead.commercial)};
    lead = {...lead,status:commercialStatus(lead)};
    if (isCrmPreview) {
      const current=previewLeads.find(item=>item.id===lead.id);
      if(current && (current.revision||0)!==(lead.revision||0)) throw new Error('La solicitud cambió. Revisa la versión actual antes de guardar.');
      setPreviewLeads(previous => previous.map(item => item.id === lead.id ? {...lead,revision:(lead.revision||0)+1} : item));
      return;
    }
    if (!currentUser || !isAdmin) throw new Error('Inicia sesión con una cuenta autorizada del despacho.');
    const saved = await leadService.update(lead, currentUser.uid);
    setLeads(previous => previous.map(item => item.id === saved.id ? saved : item));
  };

  const handleUpdateLead = async (updated: Lead) => {
    try { await persistLead(updated); }
    catch { showNotification('No se pudo guardar el cambio. Revisa la conexión y vuelve a intentarlo.'); }
  };

  const handleUpdateLeadStatus = async (_leadId: string, _status: LeadStatus) => {
    showNotification('La situación comercial se calcula desde los registros de contacto, reunión, envío y aceptación.');
  };

  const handleAddInternalNote = async (leadId: string, text: string, author: string) => {
    const lead = (isCrmPreview ? previewLeads : leads).find(item => item.id === leadId);
    if (!lead) return;
    await handleUpdateLead({ ...lead, internalNotes: [...lead.internalNotes, {
      id: crypto.randomUUID(), author: userProfile?.displayName || author, text,
      timestamp: new Date().toISOString(),
    }] });
  };

  const handleAddManualLead = async (lead: Lead): Promise<void> => {
    if (isCrmPreview) {
      const saved = cleanLead(lead, 'manual');
      setPreviewLeads(previous => [saved, ...previous.filter(item => item.id !== saved.id)]);
      return;
    }
    if (!currentUser || !isAdmin) throw new Error('Necesitas una cuenta autorizada del despacho.');
    const saved = await leadService.createManual(lead, currentUser.uid);
    setLeads(previous => [saved, ...previous.filter(item => item.id !== saved.id)]);
  };

  const handleSaveFollowUp = async (lead: Lead, followUp: LeadFollowUp) => {
    await persistLead({ ...lead, followUp: validateFollowUp(followUp) });
  };

  const handleReviewOrClose = async (process:LegalProcess,closing:boolean,summary:string,documentId:string) => {
    const saved=await operationsService.reviewOrClose(process,{uid:currentUser?.uid||'demo-admin-uid-01',name:userProfile?.displayName||'Elena Marín',admin:isCrmPreview||isAdmin},isCrmPreview,closing,summary,documentId);
    if(isCrmPreview)setPreviewProcesses(previous=>previous.map(item=>item.id===process.id?{...item,...saved}:item));
  };

  const handleSaveCaseControls = async (process:LegalProcess) => {
    const saved=await operationsService.saveCaseControls(process,{uid:currentUser?.uid||'demo-admin-uid-01',name:userProfile?.displayName||'Elena Marín',admin:isCrmPreview||isAdmin},isCrmPreview);
    if(isCrmPreview) setPreviewProcesses(previous=>previous.map(item=>item.id===process.id?{...item,...saved}:item));
  };

  const handleStartCase = async (process: LegalProcess) => {
    const startAuthorization = await operationsService.startCase(process, { uid: currentUser?.uid || 'demo-admin-uid-01', name: userProfile?.displayName || 'Elena Marín', admin: isCrmPreview || isAdmin }, isCrmPreview);
    if (isCrmPreview) setPreviewProcesses(previous => previous.map(item => item.id === process.id ? { ...item, startAuthorization, caseStage: 'in_progress', status: 'redaccion' } : item));
  };

  const handleSaveCommercial = async (lead: Lead, activity: CommercialActivity) => {
    const saved=validateCommercial(activity);
    const actorUid=currentUser?.uid || 'demo-admin-uid-01';
    if(saved.contact && JSON.stringify(saved.contact)!==JSON.stringify(lead.commercial?.contact))saved.contact.actorUid=actorUid;
    if(saved.meeting && JSON.stringify(saved.meeting)!==JSON.stringify(lead.commercial?.meeting))saved.meeting.actorUid=actorUid;
    await persistLead({...lead,commercial:saved});
  };

  const handleSaveBudget = async (lead: Lead, budget: LeadBudget) => {
    validateBudgetDispatch(budget);
    const saved = budget.status === 'enviado' ? {...budget,sentAt:budget.sentAt || new Date().toISOString(),sentByUid:currentUser?.uid || 'demo-admin-uid-01',sentByName:budget.sentByName || userProfile?.displayName || 'Elena Marín'} : budget;
    await persistLead({ ...lead, budget:saved });
  };
  const handleAcceptServices = async (lead: Lead, ids: string[], evidence: string) => {
    const actor = { uid: currentUser?.uid || 'demo-admin-uid-01', name: userProfile?.displayName || 'Elena Marín', admin: isCrmPreview || isAdmin };
    const result = await operationsService.accept(lead, ids, evidence, actor, isCrmPreview);
    const updated = { ...lead, status:'cliente_activo' as const, acceptedBudget: result.acceptance, revision: (lead.revision || 0) + 1 };
    if (isCrmPreview) {
      setPreviewLeads(previous => previous.map(item => item.id === lead.id ? updated : item));
      setPreviewProcesses(previous => [...new Map([...previous, ...result.processes].map(item => [item.id, item])).values()]);
    }
    // Real subscriptions refresh the authoritative lead and cases after the transaction.
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

  const handleAssignProcess = async (processId: string, uid: string, name: string) => {
    if (!currentUser || !(isAdmin || userProfile?.role === 'supervisor')) throw new Error('Sin permiso para asignar trámites.');
    await updateDoc(doc(db, 'processes', processId), { assignedLawyer: name, assignedLawyerId: uid, assignedLawyerIds: [uid], assignmentStatus: 'assigned', updatedAt: new Date().toISOString().slice(0, 10) });
    showNotification(`Trámite asignado a ${name}.`);
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
        onSuccess={() => { window.location.assign('/crm'); }}
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
                  <p className="text-xs text-[#cfd1d0]">{isCrmPreview ? 'Prueba local: se creará una solicitud de muestra.' : 'La solicitud se confirmará después de guardarse.'}</p>
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

      {currentView !== 'landing' && !isCrmPreview && <Navbar currentView={currentView} activeSection={activeSection} onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} unreadLeadsCount={unreadCount} />}
      {currentView === 'landing' && <DemoLanding onOpenCrm={() => handleNavigate('admin')} />}
      {currentView === 'portal' && currentUser && <ClientPortal processes={processes} onRequestService={lead => receiveLead(lead, 'contact')} onBackToLanding={() => handleNavigate('landing', 'inicio')} />}
      {currentView === 'admin' && !isCrmPreview && authLoading && <p role="status" className="p-8">Comprobando acceso…</p>}
      {leadLoadError && currentView === 'admin' && <p role="alert" className="m-4 rounded-lg bg-red-50 p-4 text-red-800">{leadLoadError}</p>}
      {currentView === 'admin' && (isCrmPreview || (!authLoading && currentUser && canUseWorkspace)) && <>
      {isCrmPreview && <p className="border-b border-cyan-200 bg-cyan-50 px-6 py-3 text-sm text-cyan-950">Omega · Demo de Cokito’s Lab con firma y asuntos ficticios. Los cambios se guardan solo en este navegador.</p>}
      {usingFirebaseEmulators&&<p role="status" className="border-b bg-blue-950 px-6 py-3 text-sm text-white">Entorno local de pruebas · Firebase emulado · Datos ficticios · Sin conexión a producción</p>}
      {usingFirebaseStaging&&<p role="status" className="border-b bg-amber-950 px-6 py-3 text-sm text-white">Firebase de pruebas · Usa solo datos ficticios · Los permisos y archivos aún están en configuración</p>}
      {/* Main CRM workspace */}
      <AdminCRM
        onSaveCommercial={handleSaveCommercial}
        onReviewOrClose={handleReviewOrClose}
        onSaveCaseControls={handleSaveCaseControls}
        onStartCase={handleStartCase}
        onAcceptServices={handleAcceptServices}
        onSaveBudget={handleSaveBudget}
        onSaveFollowUp={handleSaveFollowUp}
        leads={isCrmPreview ? previewLeads : leads}
        processes={isCrmPreview ? previewProcesses : processes}
        onCreateProcess={handleCreateProcess}
        onUpdateLeadStatus={handleUpdateLeadStatus}
        onAddInternalNote={isCrmPreview
          ? (leadId, noteText, author) => setPreviewLeads(prev => prev.map(lead => lead.id === leadId ? { ...lead, internalNotes: [...lead.internalNotes, { id: `preview-note-${Date.now()}`, author, text: noteText, timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) }] } : lead))
          : handleAddInternalNote}
        onAddManualLead={handleAddManualLead}
        onUpdateProcessStatus={isCrmPreview ? (processId, status, progress, milestone) => {if(status==='completado'||progress>=100){showNotification('Utiliza la revisión final y la comprobación de entrega para finalizar.');return;}setPreviewProcesses(prev => prev.map(process => process.id === processId ? { ...process, status, progress: Math.max(0, Math.min(100, progress)), nextMilestone: milestone || process.nextMilestone, updatedAt: new Date().toISOString().slice(0, 10) } : process));} : handleUpdateProcessStatus}
        onAssignProcess={isCrmPreview ? async (processId, uid, name) => setPreviewProcesses(previous => previous.map(item => item.id === processId ? { ...item, assignedLawyer: name, assignedLawyerId: uid, assignedLawyerIds: [uid], assignmentStatus: 'assigned' } : item)) : handleAssignProcess}
        onUpdateProcessLawyer={isCrmPreview ? (processId, lawyer) => setPreviewProcesses(prev => prev.map(process => process.id === processId ? { ...process, assignedLawyer: lawyer, updatedAt: new Date().toISOString().slice(0, 10) } : process)) : handleUpdateProcessLawyer}
        onBackToLanding={() => handleNavigate('landing', 'inicio')}
        onOpenDiagnostic={() => setShowDiagnosticModal(true)}
        onUpdateLead={handleUpdateLead}
      />
      </>}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
      {!usingFirebaseEmulators&&!usingFirebaseStaging&&<Analytics />}
      {!usingFirebaseEmulators&&!usingFirebaseStaging&&<SpeedInsights />}
    </AuthProvider>
  );
}
