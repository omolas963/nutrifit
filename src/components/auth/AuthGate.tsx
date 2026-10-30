import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/authService';
import { UserAccount } from '../../types';
import { GoogleAuthScreen } from './GoogleAuthScreen';
import { SamsungAuthScreen } from './SamsungAuthScreen';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Smartphone,
} from 'lucide-react';

interface AuthGateProps {
  onAuthenticated: (user: UserAccount) => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onAuthenticated }) => {
  const { showToast } = useApp();

  // Active view: 'google' (default, matches user screenshot), 'samsung', or 'email'
  const [activeView, setActiveView] = useState<'google' | 'samsung' | 'email'>('google');

  // Email form states
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // When Google 1-Tap succeeds
  const handleGoogleSuccess = (user: UserAccount) => {
    showToast(`¡Conectado como ${user.name}!`, 'success');
    onAuthenticated(user);
  };

  // When Samsung 1-Tap succeeds
  const handleSamsungSuccess = (user: UserAccount) => {
    showToast(`¡Dispositivo Samsung vinculado con éxito!`, 'success');
    onAuthenticated(user);
  };

  // Standard Email/Password Submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const user = await authService.loginWithEmail(email, password);
        showToast(`¡Bienvenido de nuevo, ${user.name}!`, 'success');
        onAuthenticated(user);
      } else {
        if (!name.trim()) {
          throw new Error('Por favor introduce tu nombre.');
        }
        const user = await authService.registerWithEmail(email, password, name);
        showToast(`¡Cuenta creada con éxito! Bienvenido, ${user.name}`, 'success');
        onAuthenticated(user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ha ocurrido un error. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // If user selected Google mode, render the exact Google Account Picker screen from screenshot!
  if (activeView === 'google') {
    return (
      <div className="relative">
        {/* Floating Switcher Bar at Top */}
        <div className="absolute top-3 right-4 z-20 flex items-center space-x-2 bg-white/90 backdrop-blur-sm border border-[#E0E2E0] p-1.5 rounded-2xl shadow-sm text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveView('google')}
            className="px-2.5 py-1 rounded-xl bg-[#0B57D0] text-white"
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => setActiveView('samsung')}
            className="px-2.5 py-1 rounded-xl text-[#444746] hover:bg-cream-200"
          >
            Samsung
          </button>
          <button
            type="button"
            onClick={() => setActiveView('email')}
            className="px-2.5 py-1 rounded-xl text-[#444746] hover:bg-cream-200"
          >
            Escribir Correo
          </button>
        </div>

        <GoogleAuthScreen
          onSuccess={handleGoogleSuccess}
          onCancel={() => setActiveView('email')}
        />
      </div>
    );
  }

  // If user selected Samsung mode, render the Samsung Galaxy Linking screen!
  if (activeView === 'samsung') {
    return (
      <div className="relative">
        <div className="absolute top-3 right-4 z-20 flex items-center space-x-2 bg-white/90 backdrop-blur-sm border border-[#E0E4EC] p-1.5 rounded-2xl shadow-sm text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveView('google')}
            className="px-2.5 py-1 rounded-xl text-[#555] hover:bg-cream-200"
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => setActiveView('samsung')}
            className="px-2.5 py-1 rounded-xl bg-[#1428A0] text-white"
          >
            Samsung
          </button>
          <button
            type="button"
            onClick={() => setActiveView('email')}
            className="px-2.5 py-1 rounded-xl text-[#555] hover:bg-cream-200"
          >
            Escribir Correo
          </button>
        </div>

        <SamsungAuthScreen
          onSuccess={handleSamsungSuccess}
          onCancel={() => setActiveView('email')}
        />
      </div>
    );
  }

  // Manual Email / Password Form ("también tenga lo de escribir")
  return (
    <div className="min-h-screen bg-cream-100 dark:bg-dark-bg text-bark-900 dark:text-dark-text flex flex-col justify-center items-center px-4 py-8 font-sans transition-colors selection:bg-solar-200">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-solar text-bark-900 shadow-md shadow-solar/20 mb-1">
            <span className="font-display font-black text-2xl">N</span>
          </div>
          <h1 className="font-display font-black text-3xl tracking-tight text-bark-900 dark:text-dark-text">
            Nutri<span className="text-solar-600 dark:text-solar">Fit</span>
          </h1>
          <p className="text-xs text-bark-600 dark:text-dark-muted max-w-xs mx-auto leading-relaxed">
            Escribe tu correo y contraseña o usa el acceso en 1 toque.
          </p>
        </div>

        {/* Quick 1-Tap Switch Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setActiveView('google')}
            className="py-2.5 px-3 bg-white dark:bg-dark-surface hover:bg-cream-100 dark:hover:bg-dark-elevated border border-cream-300 dark:border-dark-border rounded-2xl flex items-center justify-center space-x-2 text-xs font-bold text-bark-900 dark:text-dark-text shadow-sm transition-all"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Ver Google</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('samsung')}
            className="py-2.5 px-3 bg-[#1428A0] hover:bg-[#102082] text-white rounded-2xl flex items-center justify-center space-x-2 text-xs font-bold shadow-sm transition-all"
          >
            <Smartphone className="w-4 h-4" />
            <span>Ver Samsung</span>
          </button>
        </div>

        {/* Card for writing email / password */}
        <div className="bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-6 shadow-card transition-colors">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-cream-200/70 dark:bg-dark-surface rounded-2xl mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-dark-card text-bark-900 dark:text-dark-text shadow-sm'
                  : 'text-bark-500 dark:text-dark-muted hover:text-bark-900 dark:hover:text-dark-text'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-dark-card text-bark-900 dark:text-dark-text shadow-sm'
                  : 'text-bark-500 dark:text-dark-muted hover:text-bark-900 dark:hover:text-dark-text'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start space-x-2 text-xs text-red-700 dark:text-red-400 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-bark-800 dark:text-dark-text mb-1.5">
                  Tu Nombre
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-bark-400 dark:text-dark-muted" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Oscar Molas"
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl text-xs font-semibold text-bark-900 dark:text-dark-text placeholder:text-bark-400 focus:outline-none focus:ring-2 focus:ring-solar"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-bark-800 dark:text-dark-text mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-bark-400 dark:text-dark-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl text-xs font-semibold text-bark-900 dark:text-dark-text placeholder:text-bark-400 focus:outline-none focus:ring-2 focus:ring-solar"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-bark-800 dark:text-dark-text mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-bark-400 dark:text-dark-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl text-xs font-semibold text-bark-900 dark:text-dark-text placeholder:text-bark-400 focus:outline-none focus:ring-2 focus:ring-solar"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-bark-400 dark:text-dark-muted hover:text-bark-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-solar hover:bg-solar-600 active:scale-95 disabled:opacity-50 text-bark-900 rounded-2xl text-xs font-extrabold shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <span>{isLoading ? 'Verificando...' : mode === 'login' ? 'Entrar a NutriFit' : 'Crear mi Cuenta Gratis'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>

        {/* Security badge */}
        <div className="bg-cream-200/50 dark:bg-dark-surface/50 border border-cream-300 dark:border-dark-border rounded-2xl p-4 space-y-1.5 text-xs text-bark-600 dark:text-dark-muted">
          <div className="flex items-center space-x-2 text-bark-800 dark:text-dark-text font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Datos protegidos en tu equipo</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Tu diario nutricional, alimentos y objetivos se guardan exclusivamente en el servidor local de tu equipo.
          </p>
        </div>
      </div>
    </div>
  );
};
