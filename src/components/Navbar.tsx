import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, LayoutDashboard, Menu, X, Sparkles, FolderKanban, LogOut, Briefcase, Share2, Mail, LogIn, UserPlus, Instagram } from 'lucide-react';
import { trackNavigation } from '../lib/analytics';

interface NavbarProps {
  currentView: 'landing' | 'admin' | 'ecosystem' | 'portal';
  activeSection?: string;
  onNavigate: (view: 'landing' | 'admin' | 'ecosystem' | 'portal', sectionId?: string) => void;
  unreadLeadsCount?: number;
  onOpenAuth: (mode?: 'login' | 'register' | 'newsletter') => void;
  onOpenShare?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  activeSection,
  onNavigate, 
  unreadLeadsCount = 0,
  onOpenAuth,
  onOpenShare
}) => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const canUseWorkspace = isAdmin || ['lawyer','supervisor','intern','secretary'].includes(userProfile?.role || '');
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Auto-close dropdown when viewport is resized back to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { id: 'que-hacemos', label: 'Qué hacemos' },
    { id: 'por-que', label: 'Por qué' },
    { id: 'como', label: 'Cómo' },
    { id: 'equipo', label: 'Equipo' },
    { id: 'blog', label: 'Blog' },
    { id: 'diagnostico', label: 'Diagnóstico' },
    { id: 'contacto', label: 'Contacto' },
  ];

  const handleNavClick = (sectionId: string) => {
    trackNavigation(sectionId, 'navbar');
    onNavigate('landing', sectionId);
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    trackNavigation('inicio', 'navbar_logo');
    onNavigate('landing', 'inicio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <header 
      style={{ position: 'sticky', top: 0 }}
      className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/90 transition-all shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 lg:gap-6 h-15 sm:h-16">
          
          {/* Zone 1: Logo Wordmark - Always returns directly to top */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-2 sm:gap-2.5 text-left group focus-visible:outline-none cursor-pointer"
              title="Volver arriba - BinLegal"
              aria-label="Ir al inicio de BinLegal"
            >
              <img 
                src="/assets/images/LogoApaisado_BinLegal.png" 
                alt="BinLegal Logo" 
                className="h-7 sm:h-8 md:h-9 w-auto object-contain max-w-[130px] sm:max-w-none transition-transform group-hover:scale-[1.02]" 
              />
              <span className="hidden xl:inline-block text-[#3e4543] font-medium text-xs ml-1 pl-2.5 border-l border-slate-300">
                Asesoría Legal · PYME
              </span>
            </button>
          </div>

          {/* Zone 2: Desktop Navigation Links (>= lg: 1024px) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs xl:text-sm font-semibold">
            {navItems.map((item) => {
              const isActive = currentView === 'landing' && activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  data-track-section="navbar"
                  data-track-action={`nav_${item.id}`}
                  className={`relative px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer select-none group ${
                    isActive 
                      ? 'text-[#0071ce] bg-blue-50/90 font-bold shadow-2xs' 
                      : 'text-slate-600 hover:text-[#0071ce] hover:bg-blue-50/60 active:scale-95'
                  }`}
                >
                  <span className="relative z-10 transition-colors group-hover:text-[#0071ce]">
                    {item.label}
                  </span>
                  {/* Subtle active / hover bottom bar accent */}
                  <span 
                    className={`absolute bottom-0.5 left-2 right-2 h-0.5 rounded-full bg-[#0071ce] transition-transform duration-200 origin-center ${
                      isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-75'
                    }`} 
                  />
                </button>
              );
            })}
          </nav>

          {/* Zone 3 Desktop Actions (>= lg: 1024px) */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('portal')}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'portal'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 border border-neutral-300'
                  }`}
                  title="Ver mis trámites legales y administrativos"
                >
                  <FolderKanban className="w-3.5 h-3.5" />
                  <span>Mi Portal</span>
                </button>

                {canUseWorkspace && (
                  <button
                    onClick={() => onNavigate(currentView === 'admin' ? 'landing' : 'admin')}
                    className="px-3 py-2 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg border border-neutral-300 flex items-center gap-1.5 cursor-pointer"
                    title="Acceso CRM"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-neutral-700" />
                    <span>CRM</span>
                    {unreadLeadsCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-neutral-900 text-white rounded">
                        {unreadLeadsCount}
                      </span>
                    )}
                  </button>
                )}

                <button
                  onClick={logout}
                  className="p-2 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 xl:gap-2">
                {/* Botón Compartir */}
                {onOpenShare && (
                  <button
                    onClick={onOpenShare}
                    data-track-section="navbar"
                    data-track-action="share_click"
                    className="px-2.5 py-1.5 text-xs font-semibold text-[#3e4543] bg-slate-50 hover:bg-blue-50/80 hover:text-[#0071ce] border border-slate-200 hover:border-blue-200 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                    title="Compartir plataforma BinLegal con amigos y colegas"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#0071ce] transition-transform hover:scale-110" />
                    <span className="hidden xl:inline">Compartir</span>
                  </button>
                )}

                {/* Enlace Instagram */}
                <a
                  href="https://instagram.com/binlegal"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track-section="navbar"
                  data-track-action="instagram_nav_top"
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50/80 border border-slate-200 hover:border-rose-200 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                  title="Síguenos en Instagram @binlegal"
                  aria-label="Instagram de BinLegal"
                >
                  <Instagram className="w-3.5 h-3.5 text-rose-500" />
                  <span className="hidden xl:inline">Instagram</span>
                </a>

                {/* Botón Iniciar Sesión */}
                <button
                  onClick={() => onOpenAuth('login')}
                  data-track-section="navbar"
                  data-track-action="login_click"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#0071ce] hover:bg-blue-50/80 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border border-transparent hover:border-blue-100"
                  title="Iniciar sesión en tu cuenta"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#0071ce]" />
                  <span>Iniciar Sesión</span>
                </button>

                {/* Botón Registrarse */}
                <button
                  onClick={() => onOpenAuth('register')}
                  data-track-section="navbar"
                  data-track-action="register_click"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#0071ce] hover:bg-[#005fb0] active:bg-[#004f91] rounded-lg shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Crear cuenta en BinLegal"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Registrarse</span>
                </button>

                {/* Direct CRM preview access */}
                {currentView === 'landing' && (
                  <button
                    onClick={() => onNavigate('admin')}
                    data-track-section="navbar"
                    data-track-action="crm_shortcut"
                    className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer ml-0.5"
                    title="Acceso CRM"
                    aria-label="Acceso CRM"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Zone 3 Responsive (< lg: Mobile, Tablet & Zoomed Desktop) */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 shrink-0">
            {onOpenShare && (
              <button
                onClick={onOpenShare}
                data-track-section="navbar_mobile"
                data-track-action="share_click"
                className="p-2 text-[#0071ce] bg-blue-50/80 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                title="Compartir enlace"
                aria-label="Compartir"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}

            {!currentUser ? (
              <>
                <button
                  onClick={() => onOpenAuth('login')}
                  data-track-section="navbar_mobile"
                  data-track-action="login_mobile"
                  className="px-2.5 sm:px-3 py-1.5 text-xs font-bold text-[#0071ce] bg-blue-50/80 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors flex items-center gap-1"
                  title="Iniciar sesión"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Ingresar</span>
                </button>

                <button
                  onClick={() => onOpenAuth('register')}
                  data-track-section="navbar_mobile"
                  data-track-action="register_mobile"
                  className="hidden sm:flex px-3 py-1.5 text-xs font-bold text-white bg-[#0071ce] hover:bg-[#005fb0] rounded-lg shadow-xs transition-colors items-center gap-1"
                  title="Registrarse"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Registrarse</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate('portal')}
                className="p-2 text-neutral-700 bg-neutral-100 rounded-lg border border-neutral-200"
                aria-label="Portal Clientes"
              >
                <FolderKanban className="w-4 h-4" />
              </button>
            )}

            {/* Hamburger button: ALWAYS visible when screen is < lg (tablets, zoomed in, or mobile) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-700 hover:text-[#0071ce] hover:bg-blue-50/60 rounded-lg focus:outline-none cursor-pointer transition-colors"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-[#0071ce]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Responsive Dropdown Menu (Available on all screens < lg: tablets, zoomed desktop & mobile) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 shadow-lg max-h-[85vh] overflow-y-auto">
          <div className="flex flex-col space-y-1 text-sm font-semibold text-neutral-700">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left py-2.5 px-3 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                  currentView === 'landing' && activeSection === item.id 
                    ? 'text-[#0071ce] bg-blue-50 font-bold' 
                    : 'hover:text-[#0071ce] hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                <span className="text-xs text-slate-400">→</span>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2">
            {currentUser ? (
              <>
                <button
                  onClick={() => {
                    onNavigate('portal');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 px-4 bg-neutral-900 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <FolderKanban className="w-4 h-4" />
                  <span>Mi Portal de Trámites</span>
                </button>
                {canUseWorkspace && (
                  <button
                    onClick={() => {
                    onNavigate('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 px-4 bg-neutral-100 text-neutral-800 text-xs font-semibold rounded-lg border border-neutral-300 cursor-pointer"
                >
                  Mi espacio de trabajo
                </button>
                )}
                <button
                  onClick={logout}
                  className="w-full text-center py-2 text-neutral-500 text-xs cursor-pointer hover:text-neutral-800"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onOpenAuth('register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 bg-[#0071ce] hover:bg-[#005fb0] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Registrarse en BinLegal</span>
                </button>

                <button
                  onClick={() => {
                    onOpenAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-[#3e4543] text-xs font-semibold rounded-lg border border-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <LogIn className="w-4 h-4 text-[#0071ce]" />
                  <span>Iniciar Sesión</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg border border-neutral-200 flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Acceso CRM</span>
                </button>

                <a
                  href="https://instagram.com/binlegal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-2 px-3 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200/80 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5 text-rose-600" />
                  <span>Síguenos en Instagram @binlegal</span>
                </a>
              </>
            )}
          </div>
        </div>
      )}

      {/* FIXED MOBILE BOTTOM TAB BAR */}
      <nav 
        aria-label="Navegación móvil inferior"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 py-1 px-2 flex items-center justify-around shadow-lg pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <button
          onClick={handleLogoClick}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 transition-colors ${
            currentView === 'landing' && (!activeSection || activeSection === 'inicio') ? 'text-[#0071ce] font-bold' : 'text-[#626967] hover:text-[#3e4543]'
          }`}
        >
          <Shield className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Inicio</span>
        </button>

        <button
          onClick={() => handleNavClick('que-hacemos')}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 text-[#626967] hover:text-[#3e4543] transition-colors"
        >
          <Briefcase className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Servicios</span>
        </button>

        <button
          onClick={() => handleNavClick('diagnostico')}
          className="flex flex-col items-center justify-center min-w-[60px] min-h-[48px] px-2.5 py-1 text-[#3e4543] transition-transform active:scale-95"
        >
          <div className="w-9 h-9 -mt-3.5 bg-[#0071ce] text-white rounded-full flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold tracking-tight text-[#0071ce] mt-0.5">Diagnóstico</span>
        </button>

        <button
          onClick={() => handleNavClick('contacto')}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 text-[#626967] hover:text-[#3e4543] transition-colors"
        >
          <Mail className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Contacto</span>
        </button>

        <button
          onClick={() => onNavigate('admin')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 transition-colors ${
            currentView === 'admin' ? 'text-neutral-950 font-bold' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">CRM</span>
        </button>
      </nav>
    </header>
  );
};
