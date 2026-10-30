import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SectorSelector } from './SectorSelector';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Building, 
  ArrowRight, 
  ArrowLeft,
  Sparkles, 
  Eye, 
  EyeOff, 
  CheckCircle2,
  Check,
  ChevronRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register' | 'newsletter';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  onSuccess
}) => {
  const { 
    loginWithGoogle, 
    loginWithIdentifier, 
    registerWithEmailOrUsername, 
    subscribeNewsletter,
    loginAsDemoClient, 
    loginAsDemoAdmin 
  } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register' | 'newsletter'>(defaultMode);
  
  // Registration 2-step wizard state (mobile-first ergonomics)
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);
  const [showUsernameField, setShowUsernameField] = useState(false);
  
  // Login & Register fields
  const [identifier, setIdentifier] = useState(''); // can be email OR username
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<string[]>(['Tecnología & Software']);
  const [otherSectorText, setOtherSectorText] = useState('');
  const [subscribeNewsletterOptIn, setSubscribeNewsletterOptIn] = useState(true);

  // Standalone newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterName, setNewsletterName] = useState('');
  const [newsletterSubscribedSuccess, setNewsletterSubscribedSuccess] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync mode if defaultMode changes
  useEffect(() => {
    setMode(defaultMode);
    setRegisterStep(1);
    setErrorMsg('');
    setNewsletterSubscribedSuccess(false);
  }, [defaultMode, isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getFormattedIndustry = () => {
    return selectedSectors.map(s => {
      if (s === 'Otro') {
        return otherSectorText.trim() ? `Otro: ${otherSectorText.trim()}` : 'Otro';
      }
      return s;
    }).join(', ');
  };

  // Step 1 validation
  const validateStep1 = () => {
    setErrorMsg('');
    if (!displayName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre completo.');
      return false;
    }
    if (!identifier.trim() || !identifier.includes('@')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return false;
    }
    if (!password || password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    return true;
  };

  const handleNextStep = (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setRegisterStep(2);
      setErrorMsg('');
    }
  };

  const handlePrevStep = () => {
    setRegisterStep(1);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        if (!identifier.trim()) throw new Error('Ingresa tu correo o tu nombre de usuario');
        if (!password) throw new Error('Ingresa tu contraseña');
        await loginWithIdentifier(identifier, password);
      } else if (mode === 'register') {
        // Step 1 checks
        if (!validateStep1()) {
          setRegisterStep(1);
          setIsLoading(false);
          return;
        }

        // Step 2 checks
        if (!companyName.trim()) {
          throw new Error('Por favor ingresa el nombre de tu empresa, startup o PYME.');
        }
        
        if (selectedSectors.length === 0) {
          throw new Error('Selecciona al menos 1 sector o industria para tu empresa (máximo 3).');
        }
        if (selectedSectors.includes('Otro') && !otherSectorText.trim()) {
          throw new Error('Por favor especifica tu sector en el campo de texto.');
        }

        const formattedIndustry = getFormattedIndustry();

        await registerWithEmailOrUsername(
          identifier.trim(),
          password,
          displayName.trim(),
          companyName.trim(),
          username.trim() || undefined,
          subscribeNewsletterOptIn,
          formattedIndustry,
          selectedSectors
        );
      } else if (mode === 'newsletter') {
        if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
          throw new Error('Ingresa un correo electrónico válido');
        }
        await subscribeNewsletter(newsletterEmail, newsletterName);
        setNewsletterSubscribedSuccess(true);
        setIsLoading(false);
        return;
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setErrorMsg('Credenciales inválidas. Revisa tu correo/usuario y contraseña.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Este correo ya está registrado. Puedes iniciar sesión directamente.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setErrorMsg(err.message || 'Error en la autenticación. Intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      await loginWithGoogle();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'No se pudo completar el inicio de sesión con Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClient = () => {
    loginAsDemoClient();
    onSuccess?.();
    onClose();
  };

  const handleDemoAdmin = () => {
    loginAsDemoAdmin();
    onSuccess?.();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-neutral-950/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {/* Modal Card with native-like bottom sheet behavior on mobile & modal on desktop */}
      <div 
        className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border-t sm:border border-neutral-200 shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[88dvh] overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle mobile drag bar for mobile ergonomics */}
        <div className="w-12 h-1 bg-neutral-200 rounded-full mx-auto mt-2 sm:hidden shrink-0" />

        {/* FIXED HEADER WITH ALWAYS-VISIBLE PROMINENT CLOSE BUTTON */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-neutral-100 flex items-center justify-between bg-white z-30">
          <div className="flex items-center gap-2.5">
            <img 
              src="/assets/images/LogoApaisado_BinLegal.png" 
              alt="BinLegal Logo" 
              className="h-9 sm:h-10 w-auto object-contain shrink-0" 
            />
            <div>
              <div className="text-sm font-display font-bold text-neutral-950 leading-tight">
                {mode === 'login' && 'Iniciar Sesión'}
                {mode === 'register' && (
                  registerStep === 1 
                    ? 'Crear Cuenta (1/2: Acceso)' 
                    : 'Crear Cuenta (2/2: Tu Empresa)'
                )}
                {mode === 'newsletter' && 'Boletín Jurídico PYME'}
              </div>
              <div className="text-[11px] text-neutral-500 font-mono truncate max-w-[210px] sm:max-w-none">
                BinLegal · Asesoría & Trámites Corporativos
              </div>
            </div>
          </div>

          {/* Prominent, touch-friendly close button (always visible) */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-700 hover:text-neutral-950 flex items-center justify-center transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 shrink-0"
            aria-label="Cerrar ventana"
            title="Cerrar ventana (Esc)"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* SCROLLABLE INNER BODY */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3.5 space-y-3.5 overscroll-contain">
          
          {/* Tab switch (3 modes: login, register, newsletter) */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg border border-neutral-200">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all text-center ${
                mode === 'login'
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setRegisterStep(1); setErrorMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all text-center ${
                mode === 'register'
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Crear Cuenta
            </button>
            <button
              type="button"
              onClick={() => { setMode('newsletter'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all text-center ${
                mode === 'newsletter'
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Solo Boletín
            </button>
          </div>

          {/* Step Progress Indicator (when registering) */}
          {mode === 'register' && (
            <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/80">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="text-neutral-900 font-semibold flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center font-bold">
                    {registerStep}
                  </span>
                  {registerStep === 1 ? 'Paso 1: Tus Datos de Acceso' : 'Paso 2: Datos de tu Empresa'}
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {registerStep === 1 ? '1 de 2' : '2 de 2'}
                </span>
              </div>
              <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden flex">
                <div 
                  className={`bg-[#0071ce] h-full transition-all duration-300 ${
                    registerStep === 1 ? 'w-1/2' : 'w-full'
                  }`} 
                />
              </div>
            </div>
          )}

          {/* Subtitle / Context description */}
          <p className="text-xs text-neutral-600 leading-relaxed">
            {mode === 'login' && 'Ingresa con tu correo o tu nombre de usuario para consultar tus expedientes y trámites.'}
            {mode === 'register' && registerStep === 1 && 'Ingresa tus credenciales básicas para crear tu cuenta en menos de 1 minuto.'}
            {mode === 'register' && registerStep === 2 && 'Indica tu empresa y sectores para clasificar tus trámites y adaptar los modelos legales.'}
            {mode === 'newsletter' && 'Recibe alertas normativas, modelos de contratos y análisis jurídicos para PYMES en tu correo.'}
          </p>

          {/* Error message box */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {/* Standalone Newsletter Success */}
          {newsletterSubscribedSuccess ? (
            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2.5 my-2 animate-in fade-in">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center font-bold">
                ✓
              </div>
              <div className="font-display font-bold text-sm text-emerald-950">
                ¡Te has suscrito con éxito al boletín!
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Recibirás periódicamente nuestras publicaciones, análisis legales y alertas normativas de BinLegal.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 px-5 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 cursor-pointer shadow-xs"
              >
                Cerrar ventana
              </button>
            </div>
          ) : mode === 'newsletter' ? (
            /* Newsletter Only Form */
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Nombre o Empresa (opcional)
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={newsletterName}
                    onChange={(e) => setNewsletterName(e.target.value)}
                    placeholder="Ej. Carlos Mendoza (TecnoAgro)"
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Correo electrónico *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="ejemplo@tuempresa.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-[11px] text-neutral-600 leading-snug">
                Te enviaremos únicamente contenido práctico sobre protección legal de empresas, cambios normativos y modelos de contratos. Sin spam.
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer text-xs sm:text-sm"
              >
                {isLoading ? (
                  <span>Suscribiendo...</span>
                ) : (
                  <>
                    <span>Suscribirme al Boletín y Publicaciones</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : mode === 'login' ? (
            /* LOGIN FORM (Ultra-clean, zero bloat, fits on any mobile screen) */
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Google 1-Tap Login */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 active:scale-[0.99] border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-800 transition-all flex items-center justify-center gap-2.5 shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Continuar con Google</span>
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-neutral-200" />
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                  o con tu correo / usuario
                </span>
                <div className="flex-1 h-px bg-neutral-200" />
              </div>

              {/* Identifier field */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1 flex items-center justify-between">
                  <span>Correo o Usuario *</span>
                  <span className="text-[10px] text-neutral-500 font-normal">
                    ej. contacto@pyme.com o @usuario
                  </span>
                </label>
                <div className="relative">
                  {!identifier.includes('@') && identifier.length > 0 ? (
                    <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  ) : (
                    <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  )}
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="correo@empresa.com o nombre_usuario"
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Contraseña *
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#0071ce] hover:bg-[#0060b0] active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer text-xs sm:text-sm mt-1"
              >
                {isLoading ? (
                  <span>Iniciando sesión...</span>
                ) : (
                  <>
                    <span>Iniciar Sesión en BinLegal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* REGISTER WIZARD (2 STEPS: Fast, lightweight, zero mobile overwhelm) */
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              
              {/* STEP 1: Personal credentials (30 seconds) */}
              {registerStep === 1 && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  {/* Google 1-Tap Option */}
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 active:scale-[0.99] border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-800 transition-all flex items-center justify-center gap-2.5 shadow-xs cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Registrarme con Google (1 Clic)</span>
                  </button>

                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-neutral-200" />
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                      o con tus datos
                    </span>
                    <div className="flex-1 h-px bg-neutral-200" />
                  </div>

                  {/* Nombre completo */}
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Nombre completo *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Ej. Sofía Colmenares"
                        className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-neutral-900"
                      />
                    </div>
                  </div>

                  {/* Correo electrónico */}
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Correo electrónico de contacto *
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="sofia@tuempresa.com"
                        className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-neutral-900"
                      />
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Contraseña * (mínimo 6 caracteres)
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-neutral-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                        title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Optional username toggle (collapsed to avoid mobile clutter) */}
                  <div>
                    {showUsernameField || username ? (
                      <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 animate-in fade-in">
                        <label className="block font-semibold text-neutral-700 mb-1 text-[11px] flex items-center justify-between">
                          <span>Nombre de usuario o alias (opcional)</span>
                          <span className="text-[10px] text-neutral-400 font-mono">Para inicio rápido</span>
                        </label>
                        <div className="relative">
                          <span className="text-neutral-400 font-mono text-xs absolute left-3 top-1/2 -translate-y-1/2">@</span>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="sofia_legal"
                            className="w-full pl-8 pr-3 py-1.5 bg-white border border-neutral-300 rounded-md text-neutral-900 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                          />
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowUsernameField(true)}
                        className="text-[11px] text-neutral-600 hover:text-neutral-950 font-medium underline py-1 text-left"
                      >
                        + Agregar nombre de usuario / alias (opcional)
                      </button>
                    )}
                  </div>

                  {/* Next Step Button (Sticky, prominent) */}
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full py-3 bg-[#0071ce] hover:bg-[#0060b0] active:scale-[0.99] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer text-xs sm:text-sm mt-3"
                  >
                    <span>Siguiente: Datos de tu Empresa</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 2: Company & Sector Information (Tailored & Compact) */}
              {registerStep === 2 && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  {/* Empresa / PYME */}
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Nombre de tu Empresa / PYME *
                    </label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ej. Kora Logistics C.A."
                        className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-neutral-900"
                      />
                    </div>
                  </div>

                  {/* SECTOR / INDUSTRIA SELECTOR (Ultra ergonomic compact chips) */}
                  <div className="p-3 bg-neutral-50/90 rounded-xl border border-neutral-200 space-y-2">
                    <SectorSelector
                      compact={true}
                      selectedSectors={selectedSectors}
                      otherText={otherSectorText}
                      onSelectionChange={(sectors, other) => {
                        setSelectedSectors(sectors);
                        setOtherSectorText(other);
                      }}
                    />
                  </div>

                  {/* Newsletter opt-in clean toggle */}
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={subscribeNewsletterOptIn}
                        onChange={(e) => setSubscribeNewsletterOptIn(e.target.checked)}
                        className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer w-4 h-4"
                      />
                      <span className="text-[11px] text-neutral-700 leading-snug">
                        <strong className="text-neutral-900">Afiliarme al boletín legal PYME:</strong> Alertas normativas, modelos de actas y análisis periódicos de BinLegal en mi correo.
                      </span>
                    </label>
                  </div>

                  {/* Action buttons (Complete registration + Back to Step 1) */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-[#0071ce] hover:bg-[#0060b0] active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer text-xs sm:text-sm"
                    >
                      {isLoading ? (
                        <span>Procesando afiliación...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Completar Registro & Entrar</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="w-full py-2 text-center text-xs text-neutral-600 hover:text-neutral-950 font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver al Paso 1 (Datos de Acceso)</span>
                    </button>
                  </div>
                </div>
              )}

            </form>
          )}

          {/* Demo Fast Access (Compact, non-intrusive) */}
          {window.location.pathname.replace(/\/$/, '') === '/crm-preview' && <>
          <div className="pt-2 border-t border-neutral-100">
            <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-neutral-700" />
              <span>Acceso de prueba rápida (1 clic):</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDemoClient}
                className="p-2 text-left bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-200 border border-neutral-200 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="font-bold text-[11px] text-neutral-900 group-hover:text-black flex items-center gap-1">
                  <span>⚡ Cliente Demo</span>
                </div>
                <div className="text-[10px] text-neutral-500 truncate">Sofía (Kora Logistics)</div>
              </button>

              {import.meta.env.DEV && (
                <button
                  type="button"
                  onClick={handleDemoAdmin}
                  className="p-2 text-left bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-200 border border-neutral-200 rounded-lg transition-colors cursor-pointer group"
                >
                  <div className="font-bold text-[11px] text-neutral-900 group-hover:text-black flex items-center gap-1">
                    <span>⚡ Admin CRM</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 truncate">José Rafael Vásquez</div>
                </button>
              )}
            </div>
          </div></>}

          {/* Bottom thumb cancel button */}
          <div className="pt-1 pb-1 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-neutral-400 hover:text-neutral-700 font-medium py-1 px-4 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Cerrar ventana y volver a la web
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
