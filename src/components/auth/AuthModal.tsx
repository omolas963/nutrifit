import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { authService } from '../../services/authService';
import { UserAccount } from '../../types';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setErrorMsg(null);
    setAuthMode('login');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      let user: UserAccount;
      if (authMode === 'register') {
        if (!name.trim()) throw new Error('Por favor introduce tu nombre completo.');
        if (!email.trim() || !password.trim()) throw new Error('Introduce un correo y una contraseña.');
        if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.');
        user = await authService.registerWithEmail(email, password, name);
      } else {
        if (!email.trim() || !password.trim()) throw new Error('Introduce tu correo y contraseña.');
        user = await authService.loginWithEmail(email, password);
      }
      onLoginSuccess(user);
      handleClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de autenticación. Verifica tus datos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-md">
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="text-center pt-2">
          <div className="w-14 h-14 rounded-2xl bg-[#F8D864] flex items-center justify-center mx-auto mb-2 shadow-sm p-2.5">
            <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
              <circle cx="32" cy="32" r="14" stroke="#1E1A17" strokeWidth="3" strokeLinecap="round" />
              <path d="M32 23V32H39" stroke="#1E1A17" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="32" cy="32" r="1.5" fill="#1E1A17" />
              <circle cx="43" cy="21" r="3.2" fill="#FA8C48" />
            </svg>
          </div>
          <h3 className="font-display font-bold text-xl text-bark-900 dark:text-dark-text">
            {authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h3>
          <p className="text-xs text-bark-500 dark:text-dark-muted mt-0.5">
            {authMode === 'login'
              ? 'Introduce tu correo y contraseña registrados'
              : 'Regístrate para guardar y sincronizar tu diario'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 p-1 bg-cream-100 dark:bg-dark-surface rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-white dark:bg-dark-card text-bark-900 dark:text-dark-text shadow-sm'
                : 'text-bark-500 dark:text-dark-muted hover:text-bark-900 dark:hover:text-dark-text'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-white dark:bg-dark-card text-bark-900 dark:text-dark-text shadow-sm'
                : 'text-bark-500 dark:text-dark-muted hover:text-bark-900 dark:hover:text-dark-text'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start space-x-2 text-xs text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="space-y-3">
          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-bark-700 dark:text-dark-text mb-1">
                Tu Nombre
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-bark-400 dark:text-dark-muted" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full pl-9 pr-3 py-2 bg-cream-50 dark:bg-dark-surface border border-cream-200 dark:border-dark-border rounded-xl text-xs font-semibold text-bark-900 dark:text-dark-text placeholder:text-bark-400 focus:outline-none focus:ring-2 focus:ring-solar"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-bark-700 dark:text-dark-text mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-bark-400 dark:text-dark-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full pl-9 pr-3 py-2 bg-cream-50 dark:bg-dark-surface border border-cream-200 dark:border-dark-border rounded-xl text-xs font-semibold text-bark-900 dark:text-dark-text placeholder:text-bark-400 focus:outline-none focus:ring-2 focus:ring-solar"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-bark-700 dark:text-dark-text mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-bark-400 dark:text-dark-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                className="w-full pl-9 pr-9 py-2 bg-cream-50 dark:bg-dark-surface border border-cream-200 dark:border-dark-border rounded-xl text-xs font-semibold text-bark-900 dark:text-dark-text placeholder:text-bark-400 focus:outline-none focus:ring-2 focus:ring-solar"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-bark-400 dark:text-dark-muted hover:text-bark-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 bg-[#F8D864] hover:bg-[#F2D054] active:scale-[0.98] disabled:opacity-50 text-bark-900 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm"
          >
            <span>{isLoading ? 'Procesando...' : authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        <div className="p-3 bg-cream-100 dark:bg-dark-surface rounded-xl flex items-center space-x-2 text-[11px] text-bark-600 dark:text-dark-muted">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Acceso privado exclusivo para esta cuenta.</span>
        </div>
      </div>
    </Modal>
  );
};
