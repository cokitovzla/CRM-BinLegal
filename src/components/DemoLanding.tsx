import { useState } from 'react';
import { ArrowRight, CalendarDays, CheckCircle2, ClipboardList, Files, Globe2, Menu, Scale, ShieldCheck, Users, X } from 'lucide-react';

type Language = 'es' | 'en' | 'fr' | 'it' | 'de' | 'pt';

const languages: { code: Language; label: string }[] = [
  { code: 'es', label: 'Español' }, { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' }, { code: 'it', label: 'Italiano' },
  { code: 'de', label: 'Deutsch' }, { code: 'pt', label: 'Português' },
];

const copy = {
  es: {
    demo: 'Demo ficticia de LegalTech', nav: ['La solución', 'Cómo funciona', 'El laboratorio'], open: 'Explorar CRM',
    eyebrow: 'JurisNova International · una firma ficticia', title: 'Una práctica legal más clara, conectada y organizada.',
    subtitle: 'Esta experiencia de Cokito’s Lab muestra cómo un despacho puede recibir solicitudes, coordinar su equipo y dar seguimiento a cada trámite desde un mismo lugar.',
    primary: 'Ver CRM en acción', secondary: 'Conocer la solución',
    note: 'JurisNova es una identidad de demostración. Los nombres y asuntos mostrados son ficticios.',
    cardLabel: 'Vista de la operación', cardTitle: 'Del primer contacto a la entrega',
    cardText: 'Una secuencia visible para el cliente y el equipo, con responsables y próximos pasos.',
    steps: ['Solicitud recibida', 'Reunión y propuesta', 'Trámite en curso', 'Revisión y entrega'],
    sectionEyebrow: 'La solución', sectionTitle: 'Un recorrido completo para el trabajo legal',
    sectionText: 'Omega reúne la gestión comercial y el trabajo jurídico sin confundir solicitudes de contacto con tareas o trámites.',
    features: [
      ['Solicitudes', 'Recibe el primer contacto, registra reuniones y da seguimiento a propuestas.'],
      ['Trámites', 'Organiza los servicios aceptados por etapas y asigna responsables.'],
      ['Mi espacio', 'Consulta tareas, revisiones y pendientes propios del equipo.'],
      ['Agenda y directorio', 'Coordina reuniones y muestra los contactos pertinentes a cada asunto.'],
      ['Expedientes y archivos', 'Reúne el historial y los documentos del trabajo en un mismo lugar.'],
      ['Portal del cliente', 'Permite seguir avances y participar en la conversación del asunto.'],
    ],
    howEyebrow: 'Cómo funciona', howTitle: 'Una demo que puedes recorrer',
    howText: 'Entra al CRM, abre una solicitud de muestra y sigue su transición hacia un trámite. Los cambios de la vista previa se guardan solo en este navegador.',
    labEyebrow: 'Cokito’s Lab', labTitle: 'LegalTech creado para adaptarse',
    labText: 'Esta es la versión Omega, la demostración más completa del CRM legal. Alfa y Beta representan alcances más sencillos para equipos con otras necesidades.',
    footer: 'Prototipo de Cokito’s Lab · Firma y datos ficticios',
  },
  en: {
    demo: 'Fictional LegalTech demo', nav: ['The solution', 'How it works', 'The lab'], open: 'Explore CRM',
    eyebrow: 'JurisNova International · a fictional firm', title: 'A clearer, connected and organized legal practice.',
    subtitle: 'This Cokito’s Lab experience shows how a firm can receive inquiries, coordinate its team and track each matter in one place.',
    primary: 'See the CRM in action', secondary: 'Explore the solution',
    note: 'JurisNova is a demo identity. The names and matters shown are fictional.',
    cardLabel: 'Operations view', cardTitle: 'From first contact to delivery',
    cardText: 'A visible sequence for clients and staff, with owners and next steps.',
    steps: ['Inquiry received', 'Meeting and proposal', 'Matter in progress', 'Review and delivery'],
    sectionEyebrow: 'The solution', sectionTitle: 'A complete legal workflow',
    sectionText: 'Omega brings commercial intake and legal work together while keeping inquiries, tasks and matters distinct.',
    features: [
      ['Inquiries', 'Capture first contact, record meetings and follow up on proposals.'],
      ['Matters', 'Organize accepted services by stage and assign owners.'],
      ['My workspace', 'See your tasks, reviews and pending work.'],
      ['Calendar and directory', 'Coordinate meetings and show contacts relevant to each matter.'],
      ['Files and documents', 'Keep work history and documents together.'],
      ['Client portal', 'Let clients follow progress and join the matter conversation.'],
    ],
    howEyebrow: 'How it works', howTitle: 'A demo you can explore',
    howText: 'Open the CRM, review a sample inquiry and follow its transition to a matter. Preview changes are saved only in this browser.',
    labEyebrow: 'Cokito’s Lab', labTitle: 'LegalTech made to adapt',
    labText: 'This is Omega, the most complete legal CRM demo. Alpha and Beta offer smaller scopes for teams with different needs.',
    footer: 'Cokito’s Lab prototype · Fictional firm and data',
  },
  fr: {
    demo: 'Démo LegalTech fictive', nav: ['La solution', 'Fonctionnement', 'Le laboratoire'], open: 'Explorer le CRM',
    eyebrow: 'JurisNova International · cabinet fictif', title: 'Une pratique juridique plus claire, connectée et organisée.',
    subtitle: 'Cette expérience de Cokito’s Lab montre comment un cabinet peut recevoir des demandes, coordonner son équipe et suivre chaque dossier au même endroit.',
    primary: 'Voir le CRM en action', secondary: 'Découvrir la solution',
    note: 'JurisNova est une identité de démonstration. Les noms et les dossiers présentés sont fictifs.',
    cardLabel: 'Vue des opérations', cardTitle: 'Du premier contact à la livraison',
    cardText: 'Un parcours visible pour le client et l’équipe, avec responsables et prochaines étapes.',
    steps: ['Demande reçue', 'Rendez-vous et proposition', 'Dossier en cours', 'Révision et livraison'],
    sectionEyebrow: 'La solution', sectionTitle: 'Un parcours complet pour le travail juridique',
    sectionText: 'Omega réunit les demandes commerciales et le travail juridique en distinguant demandes, tâches et dossiers.',
    features: [
      ['Demandes', 'Recueillir le premier contact, les rendez-vous et les propositions.'],
      ['Dossiers', 'Organiser les services acceptés par étape et responsable.'],
      ['Mon espace', 'Consulter ses tâches, révisions et travaux en attente.'],
      ['Agenda et annuaire', 'Coordonner les réunions et les contacts utiles à chaque dossier.'],
      ['Fichiers et documents', 'Rassembler l’historique et les documents du travail.'],
      ['Portail client', 'Suivre les avancées et échanger sur le dossier.'],
    ],
    howEyebrow: 'Fonctionnement', howTitle: 'Une démo à parcourir',
    howText: 'Ouvrez le CRM, consultez une demande fictive et suivez sa transformation en dossier. Les changements restent dans ce navigateur.',
    labEyebrow: 'Cokito’s Lab', labTitle: 'Une LegalTech adaptable',
    labText: 'Omega est la démo la plus complète du CRM juridique. Alpha et Beta couvrent des besoins plus simples.',
    footer: 'Prototype Cokito’s Lab · Cabinet et données fictifs',
  },
  it: {
    demo: 'Demo LegalTech fittizia', nav: ['La soluzione', 'Come funziona', 'Il laboratorio'], open: 'Esplora il CRM',
    eyebrow: 'JurisNova International · studio fittizio', title: 'Una pratica legale più chiara, connessa e organizzata.',
    subtitle: 'Questa esperienza di Cokito’s Lab mostra come uno studio può ricevere richieste, coordinare il team e seguire ogni pratica in un unico luogo.',
    primary: 'Scopri il CRM', secondary: 'Esplora la soluzione',
    note: 'JurisNova è un’identità dimostrativa. Nomi e pratiche sono fittizi.',
    cardLabel: 'Vista operativa', cardTitle: 'Dal primo contatto alla consegna',
    cardText: 'Un percorso visibile per clienti e team, con responsabili e prossimi passi.',
    steps: ['Richiesta ricevuta', 'Incontro e proposta', 'Pratica in corso', 'Revisione e consegna'],
    sectionEyebrow: 'La soluzione', sectionTitle: 'Un percorso completo per il lavoro legale',
    sectionText: 'Omega unisce il primo contatto e il lavoro legale distinguendo richieste, attività e pratiche.',
    features: [
      ['Richieste', 'Raccogli il primo contatto e segui incontri e proposte.'],
      ['Pratiche', 'Organizza i servizi accettati per fase e responsabile.'],
      ['Il mio spazio', 'Consulta attività, revisioni e lavoro in sospeso.'],
      ['Agenda e contatti', 'Coordina incontri e contatti pertinenti a ogni pratica.'],
      ['Fascicoli e documenti', 'Riunisci cronologia e documenti del lavoro.'],
      ['Portale cliente', 'Consenti ai clienti di seguire i progressi e conversare.'],
    ],
    howEyebrow: 'Come funziona', howTitle: 'Una demo da esplorare',
    howText: 'Apri il CRM e segui una richiesta fittizia fino alla pratica. Le modifiche restano in questo browser.',
    labEyebrow: 'Cokito’s Lab', labTitle: 'LegalTech che si adatta',
    labText: 'Omega è la demo più completa del CRM legale. Alpha e Beta coprono esigenze più semplici.',
    footer: 'Prototipo Cokito’s Lab · Studio e dati fittizi',
  },
  de: {
    demo: 'Fiktive LegalTech-Demo', nav: ['Die Lösung', 'So funktioniert es', 'Das Labor'], open: 'CRM erkunden',
    eyebrow: 'JurisNova International · fiktive Kanzlei', title: 'Eine klarere, vernetzte und organisierte Rechtspraxis.',
    subtitle: 'Diese Cokito’s Lab-Demo zeigt, wie eine Kanzlei Anfragen erfasst, ihr Team koordiniert und Mandate an einem Ort verfolgt.',
    primary: 'CRM ansehen', secondary: 'Lösung entdecken',
    note: 'JurisNova ist eine Demo-Identität. Namen und Mandate sind fiktiv.',
    cardLabel: 'Arbeitsübersicht', cardTitle: 'Vom Erstkontakt bis zur Übergabe',
    cardText: 'Ein sichtbarer Ablauf für Mandanten und Team mit Zuständigkeiten und nächsten Schritten.',
    steps: ['Anfrage eingegangen', 'Termin und Angebot', 'Mandat in Bearbeitung', 'Prüfung und Übergabe'],
    sectionEyebrow: 'Die Lösung', sectionTitle: 'Ein vollständiger juristischer Arbeitsablauf',
    sectionText: 'Omega verbindet Erstkontakt und juristische Arbeit und trennt Anfragen, Aufgaben und Mandate.',
    features: [
      ['Anfragen', 'Erstkontakt, Termine und Angebote erfassen.'],
      ['Mandate', 'Angenommene Leistungen nach Phase und Zuständigkeit organisieren.'],
      ['Mein Bereich', 'Eigene Aufgaben, Prüfungen und offene Arbeit sehen.'],
      ['Kalender und Kontakte', 'Termine und relevante Kontakte koordinieren.'],
      ['Akten und Dokumente', 'Verlauf und Dokumente zusammenführen.'],
      ['Mandantenportal', 'Fortschritt und Kommunikation zugänglich machen.'],
    ],
    howEyebrow: 'So funktioniert es', howTitle: 'Eine Demo zum Erkunden',
    howText: 'Öffnen Sie das CRM und verfolgen Sie eine Beispielanfrage bis zum Mandat. Änderungen bleiben in diesem Browser.',
    labEyebrow: 'Cokito’s Lab', labTitle: 'Anpassbare LegalTech',
    labText: 'Omega ist die umfangreichste CRM-Demo. Alpha und Beta bieten kleinere Funktionsumfänge.',
    footer: 'Cokito’s Lab-Prototyp · Fiktive Kanzlei und Daten',
  },
  pt: {
    demo: 'Demo fictícia de LegalTech', nav: ['A solução', 'Como funciona', 'O laboratório'], open: 'Explorar CRM',
    eyebrow: 'JurisNova International · escritório fictício', title: 'Uma prática jurídica mais clara, conectada e organizada.',
    subtitle: 'Esta experiência da Cokito’s Lab mostra como um escritório pode receber pedidos, coordenar a equipa e acompanhar cada processo num só lugar.',
    primary: 'Ver o CRM em ação', secondary: 'Conhecer a solução',
    note: 'JurisNova é uma identidade de demonstração. Nomes e processos são fictícios.',
    cardLabel: 'Visão da operação', cardTitle: 'Do primeiro contacto à entrega',
    cardText: 'Um percurso visível para clientes e equipa, com responsáveis e próximos passos.',
    steps: ['Pedido recebido', 'Reunião e proposta', 'Processo em curso', 'Revisão e entrega'],
    sectionEyebrow: 'A solução', sectionTitle: 'Um percurso completo para o trabalho jurídico',
    sectionText: 'Omega une o primeiro contacto e o trabalho jurídico sem confundir pedidos, tarefas e processos.',
    features: [
      ['Pedidos', 'Receba o primeiro contacto e acompanhe reuniões e propostas.'],
      ['Processos', 'Organize serviços aceites por fase e responsável.'],
      ['O meu espaço', 'Consulte tarefas, revisões e trabalho pendente.'],
      ['Agenda e contactos', 'Coordene reuniões e contactos relevantes.'],
      ['Ficheiros e documentos', 'Reúna histórico e documentos do trabalho.'],
      ['Portal do cliente', 'Acompanhe o progresso e converse sobre o processo.'],
    ],
    howEyebrow: 'Como funciona', howTitle: 'Uma demo para explorar',
    howText: 'Abra o CRM e siga um pedido fictício até ao processo. As alterações ficam apenas neste navegador.',
    labEyebrow: 'Cokito’s Lab', labTitle: 'LegalTech adaptável',
    labText: 'Omega é a demo mais completa do CRM jurídico. Alpha e Beta respondem a necessidades mais simples.',
    footer: 'Protótipo Cokito’s Lab · Escritório e dados fictícios',
  },
} satisfies Record<Language, {
  demo: string; nav: string[]; open: string; eyebrow: string; title: string; subtitle: string;
  primary: string; secondary: string; note: string; cardLabel: string; cardTitle: string; cardText: string;
  steps: string[]; sectionEyebrow: string; sectionTitle: string; sectionText: string;
  features: string[][]; howEyebrow: string; howTitle: string; howText: string;
  labEyebrow: string; labTitle: string; labText: string; footer: string;
}>;

const featureIcons = [ClipboardList, Scale, CheckCircle2, CalendarDays, Files, Users];

export function DemoLogo({ dark = false }: { dark?: boolean }) {
  return <span className="flex items-center gap-2.5 text-left">
    <span className="grid size-9 place-items-center rounded-xl border border-cyan-400/70 bg-[#0b192c] text-cyan-300 shadow-sm shadow-cyan-300/20"><Scale className="size-5" aria-hidden="true" /></span>
    <span className="leading-tight"><strong className={`block text-base font-extrabold tracking-tight ${dark ? 'text-white' : 'text-[#0b192c]'}`}>JurisNova <span className={dark ? 'text-cyan-300' : 'text-[#0071ce]'}>International</span></strong><span className={`block text-[10px] font-semibold uppercase tracking-[.16em] ${dark ? 'text-slate-300' : 'text-slate-500'}`}>Cokito’s Lab · LegalTech demo</span></span>
  </span>;
}

export function DemoLanding({ onOpenCrm }: { onOpenCrm: () => void }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('omega_demo_language');
    return languages.some(item => item.code === saved) ? saved as Language : 'es';
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const t = copy[language];
  const navigation = [
    { href: '#solucion', label: t.nav[0] }, { href: '#recorrido', label: t.nav[1] }, { href: '#laboratorio', label: t.nav[2] },
  ];

  const chooseLanguage = (value: Language) => {
    setLanguage(value);
    localStorage.setItem('omega_demo_language', value);
    document.documentElement.lang = value;
  };

  return <div className="min-h-screen bg-white text-slate-900">
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="#inicio" aria-label="JurisNova International" onClick={() => setMenuOpen(false)}><DemoLogo /></a>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {navigation.map(item => <a key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-[#0071ce]">{item.label}</a>)}
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          <label className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700"><Globe2 className="size-4 text-[#0071ce]" /><span className="sr-only">Idioma</span><select aria-label="Idioma" value={language} onChange={event => chooseLanguage(event.target.value as Language)} className="max-w-16 cursor-pointer bg-transparent outline-none">{languages.map(item => <option key={item.code} value={item.code}>{item.code.toUpperCase()}</option>)}</select></label>
          <button onClick={onOpenCrm} className="rounded-lg bg-[#0b192c] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0071ce]">{t.open}</button>
        </div>
        <button type="button" className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 sm:hidden" onClick={() => setMenuOpen(open => !open)} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen}>{menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
      </div>
      {menuOpen && <nav className="space-y-1 border-t border-slate-200 bg-white px-4 py-3 sm:hidden" aria-label="Móvil">
        {navigation.map(item => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50">{item.label}</a>)}
        <select aria-label="Idioma" value={language} onChange={event => chooseLanguage(event.target.value as Language)} className="w-full rounded-lg border border-slate-200 p-2 text-sm">{languages.map(item => <option key={item.code} value={item.code}>{item.label}</option>)}</select>
        <button onClick={() => { setMenuOpen(false); onOpenCrm(); }} className="w-full rounded-lg bg-[#0b192c] px-4 py-2.5 text-sm font-bold text-white">{t.open}</button>
      </nav>}
    </header>

    <main>
      <section id="inicio" className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-blue-50/50">
        <div className="pointer-events-none absolute inset-0 opacity-[.04]" style={{ backgroundImage: 'radial-gradient(#0b192c 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12 lg:items-center lg:gap-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-7">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#0071ce]"><Globe2 className="size-4" />{t.eyebrow}</p>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-[#0b192c] sm:text-5xl lg:text-6xl">{t.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">{t.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={onOpenCrm} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0071ce] px-6 py-3 font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#0060b0] hover:shadow-lg">{t.primary}<ArrowRight className="size-4" /></button>
              <a href="#solucion" className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-[#0071ce] hover:text-[#0071ce] hover:shadow-md">{t.secondary}</a>
            </div>
            <p className="mt-6 flex max-w-2xl items-start gap-2 text-xs leading-relaxed text-slate-500"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#0071ce]" />{t.note}</p>
          </div>
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4"><span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#0071ce]">{t.cardLabel}</span><span className="text-xs font-semibold text-slate-400">OMEGA · 01—04</span></div>
              <h2 className="mt-5 text-xl font-extrabold text-[#0b192c]">{t.cardTitle}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.cardText}</p>
              <ol className="mt-5 space-y-2.5">{t.steps.map((step, index) => <li key={step} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-blue-100 text-xs font-extrabold text-[#0071ce]">{index + 1}</span><span className="flex-1">{step}</span><CheckCircle2 className="size-4 text-emerald-600" /></li>)}</ol>
            </div>
          </div>
        </div>
      </section>

      <section id="solucion" className="scroll-mt-20 px-4 py-14 sm:px-6 lg:px-8 lg:py-20"><div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#0071ce]">{t.sectionEyebrow}</p><h2 className="mt-2 max-w-3xl text-3xl font-extrabold tracking-tight text-[#0b192c] sm:text-4xl">{t.sectionTitle}</h2><p className="mt-3 max-w-3xl text-slate-600">{t.sectionText}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{t.features.map(([title, description], index) => { const Icon = featureIcons[index]; return <div key={title} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"><span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-[#0071ce] group-hover:bg-[#0071ce] group-hover:text-white"><Icon className="size-5" /></span><h3 className="mt-4 font-bold text-[#0b192c]">{title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p></div>; })}</div>
      </div></section>

      <section id="recorrido" className="scroll-mt-20 bg-[#0b192c] px-4 py-14 text-white sm:px-6 lg:px-8 lg:py-20"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 lg:flex-row lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-300">{t.howEyebrow}</p><h2 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">{t.howTitle}</h2><p className="mt-4 max-w-2xl text-slate-300">{t.howText}</p></div><button onClick={onOpenCrm} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-6 py-3 font-bold text-[#0b192c] transition hover:bg-white">{t.primary}<ArrowRight className="size-4" /></button></div></section>

      <section id="laboratorio" className="scroll-mt-20 border-t border-cyan-500/30 bg-gradient-to-r from-[#081321] to-[#0b2538] px-4 py-14 text-white sm:px-6 lg:px-8 lg:py-20"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-300">{t.labEyebrow}</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{t.labTitle}</h2><p className="mt-4 max-w-3xl text-slate-300">{t.labText}</p><div className="mt-6 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-200">Cokito’s Lab · Omega</div></div></section>
    </main>
    <footer className="border-t border-slate-200 bg-white px-4 py-7 text-sm text-slate-500 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 sm:flex-row sm:items-center"><DemoLogo /><span>{t.footer}</span></div></footer>
  </div>;
}
