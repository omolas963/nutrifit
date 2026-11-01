import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/authService';
import { UserAccount } from '../../types';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface AuthGateProps {
  onAuthenticated: (user: UserAccount) => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onAuthenticated }) => {
  const { showToast } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password.trim()) {
          throw new Error('Introduce tu correo y contraseña.');
        }
        const user = await authService.loginWithEmail(email, password);
        showToast(`¡Bienvenido de nuevo, ${user.name}!`, 'success');
        onAuthenticated(user);
      } else {
        if (!name.trim()) {
          throw new Error('Por favor introduce tu nombre completo.');
        }
        if (!email.trim() || !password.trim()) {
          throw new Error('Introduce un correo y una contraseña.');
        }
        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres.');
        }
        const user = await authService.registerWithEmail(email, password, name);
        showToast(`¡Cuenta creada con éxito! Bienvenido/a ${user.name}`, 'success');
        onAuthenticated(user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ha ocurrido un error. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-dark-bg text-bark-900 dark:text-dark-text flex flex-col justify-center items-center px-4 py-8 font-sans transition-colors selection:bg-solar-200">
      <div className="w-full max-w-md space-y-6">
        {/* App Logo & Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[26px] bg-[#F8D864] shadow-lg shadow-amber-200/50 dark:shadow-none p-3.5 mb-1 transition-transform hover:scale-105">
            <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
              {/* Reloj centrado */}
              <circle cx="32" cy="32" r="14" stroke="#1E1A17" strokeWidth="3" strokeLinecap="round" />
              {/* Agujas */}
              <path d="M32 23V32H39" stroke="#1E1A17" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              {/* Centro */}
              <circle cx="32" cy="32" r="1.5" fill="#1E1A17" />
              {/* Bolita naranja suave */}
              <circle cx="43" cy="21" r="3.2" fill="#FA8C48" />
            </svg>
          </div>

          <h1 className="font-display font-black text-3xl tracking-tight text-bark-900 dark:text-dark-text">
            Nutri<span className="text-[#E0A800] dark:text-solar">Fit</span>
          </h1>
          <p className="text-xs text-bark-600 dark:text-dark-muted max-w-xs mx-auto leading-relaxed">
            {mode === 'login'
              ? 'Inicia sesión con tu correo y contraseña personal.'
              : 'Crea tu cuenta gratis para comenzar tu diario nutricional.'}
          </p>
        </div>

        {/* Card for Email & Password */}
        <div className="bg-white dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-6 sm:p-7 shadow-card transition-colors">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-cream-100 dark:bg-dark-surface rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
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
              className={`py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-bark-800 dark:text-dark-text mb-1.5">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-bark-400 dark:text-dark-muted" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full pl-10 pr-4 py-2.5 bg-cream-50 dark:bg-dark-surface border border-cream-200 dark:border-dark-border rounded-2xl text-xs font-semibold text-bark-900 dark:text-dark-text placeholder:text-bark-400 focus:outline-none focus:ring-2 focus:ring-solar"
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
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-cream-50 dark:bg-dark-surface border border-cream-200 dark:border-dark-border rounded-2xl text-xs font-semibold text-bark-900 dark:text-dark-text placeholder:text-bark-400 focus:outline-none focus:ring-2 focus:ring-solar"
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
                  placeholder="Introduce tu contraseña"
                  className="w-full pl-10 pr-10 py-2.5 bg-cream-50 dark:bg-dark-surface border border-cream-200 dark:border-dark-border rounded-2xl text-xs font-semibold text-bark-900 dark:text-dark-text placeholder:text-bark-400 focus:outline-none focus:ring-2 focus:ring-solar"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-bark-400 dark:text-dark-muted hover:text-bark-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-[#F8D864] hover:bg-[#F2D054] active:scale-[0.98] disabled:opacity-50 text-bark-900 rounded-2xl text-xs font-extrabold shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <span>{isLoading ? 'Comprobando...' : mode === 'login' ? 'Iniciar Sesión' : 'Registrarme Gratis'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Toggle between register and login */}
          <div className="mt-5 pt-4 border-t border-cream-100 dark:border-dark-border text-center">
            {mode === 'login' ? (
              <p className="text-xs text-bark-600 dark:text-dark-muted">
                ¿No tienes una cuenta aún?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Crear cuenta gratis
                </button>
              </p>
            ) : (
              <p className="text-xs text-bark-600 dark:text-dark-muted">
                ¿Ya tienes una cuenta registrada?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Iniciar sesión
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Device Privacy Notice */}
        <div className="bg-cream-200/50 dark:bg-dark-surface/50 border border-cream-300 dark:border-dark-border rounded-2xl p-4 space-y-1.5 text-xs text-bark-600 dark:text-dark-muted">
          <div className="flex items-center space-x-2 text-bark-800 dark:text-dark-text font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Sesiones individuales y privadas</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Cada persona inicia sesión únicamente con sus credenciales personales. No se comparten cuentas ni datos entre dispositivos.
          </p>
        </div>
      </div>
    </div>
  );
};
