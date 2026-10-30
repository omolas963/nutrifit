import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { authService } from '../../services/authService';
import { UserAccount } from '../../types';
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

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
  const [authMode, setAuthMode] = useState<'options' | 'email_login' | 'email_register' | 'google_input' | 'samsung_input'>('options');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [samsungEmail, setSamsungEmail] = useState('');
  const [samsungName, setSamsungName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setGoogleEmail('');
    setGoogleName('');
    setSamsungEmail('');
    setSamsungName('');
    setErrorMsg(null);
    setAuthMode('options');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Google Login (Real)
  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail || !googleEmail.includes('@')) {
      setErrorMsg('Introduce tu correo de Google real.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const derivedName = googleName.trim() || googleEmail.split('@')[0];
      const user = await authService.loginWithGoogle({
        email: googleEmail,
        name: derivedName,
      });
      onLoginSuccess(user);
      handleClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Error al iniciar sesión con Google');
    } finally {
      setIsLoading(false);
    }
  };

  // Samsung Login (Real)
  const handleSamsungSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!samsungEmail || !samsungEmail.includes('@')) {
      setErrorMsg('Introduce tu ID de Samsung Account.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const derivedName = samsungName.trim() || samsungEmail.split('@')[0];
      const user = await authService.loginWithSamsung({
        email: samsungEmail,
        name: derivedName,
      });
      onLoginSuccess(user);
      handleClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Error al iniciar sesión con Samsung Account');
    } finally {
      setIsLoading(false);
    }
  };

  // Email Submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      let user: UserAccount;
      if (authMode === 'email_register') {
        if (!name.trim()) throw new Error('Por favor introduce tu nombre.');
        user = await authService.registerWithEmail(email, password, name);
      } else {
        user = await authService.loginWithEmail(email, password);
      }
      onLoginSuccess(user);
      handleClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-md">
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="text-center pt-2">
          <div className="w-12 h-12 rounded-2xl bg-solar flex items-center justify-center mx-auto mb-2 shadow-sm">
            <span className="font-display font-black text-2xl text-bark-900">N</span>
          </div>
          <h3 className="font-display font-bold text-xl text-bark-900 dark:text-dark-text">
            {authMode === 'options' && 'Accede a tu Cuenta'}
            {authMode === 'google_input' && 'Conectar con Google'}
            {authMode === 'samsung_input' && 'Conectar con Samsung Account'}
            {authMode === 'email_login' && 'Iniciar Sesión'}
            {authMode === 'email_register' && 'Crear Cuenta'}
          </h3>
          <p className="text-xs text-bark-500 dark:text-dark-muted mt-0.5">
            {authMode === 'options' && 'Elige cómo deseas identificarte en NutriFit'}
            {authMode === 'google_input' && 'Introduce tu cuenta real de Google'}
            {authMode === 'samsung_input' && 'Introduce tu cuenta real de Samsung'}
            {authMode === 'email_login' && 'Ingresa tus credenciales registradas'}
            {authMode === 'email_register' && 'Regístrate para guardar tu plan nutricional'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start space-x-2 text-xs text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Main Options Screen */}
        {authMode === 'options' && (
          <div className="space-y-2.5 pt-2">
            {/* Google Button */}
            <button
              onClick={() => {
                setErrorMsg(null);
                setAuthMode('google_input');
              }}
              className="w-full py-3 px-4 bg-white dark:bg-dark-surface hover:bg-cream-100 dark:hover:bg-dark-elevated border border-cream-300 dark:border-dark-border rounded-2xl text-xs font-bold text-bark-900 dark:text-dark-text flex items-center justify-center space-x-3 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continuar con Google</span>
            </button>

            {/* Samsung Account Button */}
            <button
              onClick={() => {
                setErrorMsg(null);
                setAuthMode('samsung_input');
              }}
              className="w-full py-3 px-4 bg-[#1428A0] hover:bg-[#102082] active:scale-[0.99] rounded-2xl text-xs font-bold text-white flex items-center justify-center space-x-3 transition-colors shadow-sm"
            >
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black tracking-tighter">
                S
              </div>
              <span>Continuar con Samsung Account</span>
            </button>

            {/* Email Button */}
            <button
              onClick={() => {
                setErrorMsg(null);
                setAuthMode('email_login');
              }}
              className="w-full py-3 px-4 bg-cream-200 dark:bg-dark-surface hover:bg-cream-300 dark:hover:bg-dark-elevated rounded-2xl text-xs font-bold text-bark-800 dark:text-dark-text flex items-center justify-center space-x-3 transition-colors"
            >
              <Mail className="w-4 h-4 text-bark-600 dark:text-dark-muted" />
              <span>Continuar con Correo electrónico</span>
            </button>
          </div>
        )}

        {/* 2. Google Input Screen */}
        {authMode === 'google_input' && (
          <form onSubmit={handleGoogleSubmit} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-bark-800 dark:text-dark-text mb-1">
                Tu Correo de Google (@gmail.com)
              </label>
              <input
                type="email"
                required
                autoFocus
                placeholder="ejemplo@gmail.com"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream-50 dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl text-xs font-semibold text-bark-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-solar"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-bark-800 dark:text-dark-text mb-1">
                Tu Nombre
              </label>
              <input
                type="text"
                placeholder="Nombre completo"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream-50 dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl text-xs font-semibold text-bark-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-solar"
              />
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setAuthMode('options')}
                className="flex-1 py-2.5 px-3 bg-cream-200 dark:bg-dark-surface rounded-2xl text-xs font-bold text-bark-700 dark:text-dark-text"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 px-3 bg-solar hover:bg-solar-600 text-bark-900 rounded-2xl text-xs font-bold shadow-sm"
              >
                {isLoading ? 'Conectando...' : 'Iniciar con Google'}
              </button>
            </div>
          </form>
        )}

        {/* 3. Samsung Input Screen */}
        {authMode === 'samsung_input' && (
          <form onSubmit={handleSamsungSubmit} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-bark-800 dark:text-dark-text mb-1">
                ID o Correo de Samsung Account
              </label>
              <input
                type="email"
                required
                autoFocus
                placeholder="usuario@samsung.com"
                value={samsungEmail}
                onChange={(e) => setSamsungEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream-50 dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl text-xs font-semibold text-bark-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-solar"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-bark-800 dark:text-dark-text mb-1">
                Nombre
              </label>
              <input
                type="text"
                placeholder="Tu nombre"
                value={samsungName}
                onChange={(e) => setSamsungName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream-50 dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl text-xs font-semibold text-bark-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-solar"
              />
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setAuthMode('options')}
                className="flex-1 py-2.5 px-3 bg-cream-200 dark:bg-dark-surface rounded-2xl text-xs font-bold text-bark-700 dark:text-dark-text"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 px-3 bg-[#1428A0] hover:bg-[#102082] text-white rounded-2xl text-xs font-bold shadow-sm"
              >
                {isLoading ? 'Conectando...' : 'Iniciar con Samsung'}
              </button>
            </div>
          </form>
        )}

        {/* 4. Email Login / Register Form */}
        {(authMode === 'email_login' || authMode === 'email_register') && (
          <form onSubmit={handleEmailSubmit} className="space-y-3 pt-2">
            {authMode === 'email_register' && (
              <div>
                <label className="block text-xs font-bold text-bark-800 dark:text-dark-text mb-1">
                  Tu Nombre
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-bark-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Oscar Fernández"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-xs font-semibold text-bark-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-solar"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-bark-800 dark:text-dark-text mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-bark-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-xs font-semibold text-bark-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-solar"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-bark-800 dark:text-dark-text mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-bark-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-xs font-semibold text-bark-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-solar"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-solar hover:bg-solar-600 active:scale-95 text-bark-900 rounded-xl text-xs font-bold shadow-sm transition-transform flex items-center justify-center space-x-2 mt-4"
            >
              <span>{isLoading ? 'Verificando...' : authMode === 'email_login' ? 'Entrar' : 'Crear Cuenta'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setAuthMode(authMode === 'email_login' ? 'email_register' : 'email_login');
                }}
                className="text-xs text-solar-800 dark:text-solar font-semibold hover:underline"
              >
                {authMode === 'email_login'
                  ? '¿No tienes cuenta? Regístrate aquí'
                  : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setAuthMode('options')}
                className="text-xs text-bark-400 dark:text-dark-muted hover:text-bark-700"
              >
                ← Otras opciones
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
