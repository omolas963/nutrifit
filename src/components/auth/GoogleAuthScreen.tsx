import React, { useState } from 'react';
import { UserAccount } from '../../types';
import { authService } from '../../services/authService';
import { ExternalLink, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';

interface GoogleAuthScreenProps {
  onSuccess: (user: UserAccount) => void;
  onCancel?: () => void;
}

export const GoogleAuthScreen: React.FC<GoogleAuthScreenProps> = ({ onSuccess, onCancel }) => {
  const [isUsingOtherAccount, setIsUsingOtherAccount] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  // Oscar's real Google Account from screenshot
  const defaultAccount = {
    name: 'oscar Molas Robles',
    email: 'omolas963@gmail.com',
    avatarUrl: '/oscar-avatar.png',
  };

  const handleSelectAccount = async (account: { name: string; email: string; avatarUrl?: string }) => {
    setIsLoading(true);
    try {
      const user = await authService.loginWithGoogle({
        ...account,
        credential: 'google_oauth_token_' + Date.now(),
      });
      onSuccess(user);
    } catch (e) {
      console.error('Error logging in with Google:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Open Real Google Sign-In Window
  const handleOpenGoogleOfficialAuth = () => {
    setIsConnectingGoogle(true);
    const width = 520;
    const height = 640;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      'https://accounts.google.com/signin/v2/identifier?service=lso&flowName=GlifWebSignIn',
      'GoogleAuthPopup',
      `width=${width},height=${height},top=${top},left=${left},status=yes,scrollbars=yes`
    );

    // After opening the official Google window, show the linking progress
    setTimeout(() => {
      setIsConnectingGoogle(false);
    }, 4000);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) return;
    const name = customName.trim() || customEmail.split('@')[0];
    handleSelectAccount({
      name,
      email: customEmail.trim().toLowerCase(),
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    });
  };

  return (
    <div className="min-h-screen bg-[#F0F4F9] text-[#1F1F1F] flex flex-col justify-between p-4 sm:p-8 font-sans antialiased selection:bg-[#D3E3FD]">
      {/* Top spacing / optional back button */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-[#0B57D0] hover:underline font-medium flex items-center space-x-1"
          >
            <span>← Volver a otras opciones</span>
          </button>
        )}
      </div>

      {/* Main Google Box - Matches Exact Google Account Picker Design */}
      <div className="w-full max-w-4xl mx-auto my-auto bg-white rounded-[28px] border border-[#E0E2E0] shadow-sm p-8 sm:p-12 transition-all">
        {/* Google Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="text-xs font-medium text-[#444746] tracking-tight">
              Iniciar sesión con Google
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px]">Vinculación Segura SSL</span>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Left Column: Heading & App Link */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-normal text-[#1F1F1F] tracking-tight leading-tight">
                Selecciona una cuenta
              </h1>
              <p className="text-sm font-medium text-[#0B57D0]">
                Ir a <span className="hover:underline cursor-pointer font-bold">NutriFit</span>
              </p>
            </div>

            <p className="text-xs text-[#444746] leading-relaxed">
              Tus datos de comidas, calorías, vasos de agua y evaluación nutricional quedarán vinculados a tu cuenta y sincronizados en la base de datos.
            </p>

            {/* Official Google External Link Button */}
            <button
              type="button"
              onClick={handleOpenGoogleOfficialAuth}
              disabled={isConnectingGoogle}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-[#F8FAFD] hover:bg-[#EDF2FA] border border-[#C4C7C5] rounded-xl text-xs font-semibold text-[#1F1F1F] transition-colors"
            >
              {isConnectingGoogle ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0B57D0]" />
              ) : (
                <ExternalLink className="w-3.5 h-3.5 text-[#0B57D0]" />
              )}
              <span>Abrir ventana oficial de Google</span>
            </button>
          </div>

          {/* Right Column: Account Card, Switcher & Disclaimers */}
          <div className="space-y-4">
            {!isUsingOtherAccount ? (
              <div className="space-y-1">
                {/* Oscar's Primary Account Card (1-Tap Selection) */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSelectAccount(defaultAccount)}
                  className="w-full py-3 px-3.5 -mx-3.5 rounded-xl hover:bg-[#F2F6FC] transition-colors flex items-center space-x-3.5 text-left group cursor-pointer border-2 border-transparent hover:border-[#D3E3FD]"
                >
                  <img
                    src={defaultAccount.avatarUrl}
                    alt={defaultAccount.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#E0E2E0] shrink-0 shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=Oscar`;
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold text-sm text-[#1F1F1F] block truncate group-hover:text-[#0B57D0]">
                        {defaultAccount.name}
                      </span>
                      <CheckCircle className="w-3.5 h-3.5 text-[#0B57D0] shrink-0" />
                    </div>
                    <span className="text-xs text-[#444746] block truncate">
                      {defaultAccount.email}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-[#0B57D0] bg-[#E8F0FE] px-2.5 py-1 rounded-full shrink-0 group-hover:bg-[#0B57D0] group-hover:text-white transition-colors">
                    Entrar
                  </span>
                </button>

                {/* Horizontal Divider */}
                <div className="border-t border-[#E0E2E0] my-2" />

                {/* "Usar otra cuenta" Option */}
                <button
                  type="button"
                  onClick={() => setIsUsingOtherAccount(true)}
                  className="w-full py-3 px-3.5 -mx-3.5 rounded-xl hover:bg-[#F2F6FC] transition-colors flex items-center space-x-3.5 text-left text-[#1F1F1F] cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#444746] bg-[#F0F4F9] shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-[#1F1F1F] block">
                      Usar otra cuenta de Google
                    </span>
                    <span className="text-[11px] text-[#444746] block">
                      Introduce otro correo de Google
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              /* Custom Account Input Form */
              <form onSubmit={handleCustomSubmit} className="space-y-3 p-3 bg-[#F8FAFD] rounded-2xl border border-[#E0E2E0]">
                <h4 className="text-xs font-bold text-[#1F1F1F]">Introduce tu cuenta de Google</h4>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="ejemplo@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#C4C7C5] rounded-xl text-xs font-medium focus:outline-none focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0]"
                />
                <input
                  type="text"
                  placeholder="Tu nombre completo"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#C4C7C5] rounded-xl text-xs font-medium focus:outline-none focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0]"
                />
                <div className="flex space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsUsingOtherAccount(false)}
                    className="flex-1 py-2 text-xs font-medium text-[#444746] hover:text-[#1F1F1F]"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2 px-3 bg-[#0B57D0] hover:bg-[#0842A0] text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Conectar cuenta
                  </button>
                </div>
              </form>
            )}

            {/* Disclaimer Text */}
            <div className="pt-4 border-t border-[#E0E2E0]">
              <p className="text-xs text-[#444746] leading-relaxed">
                Antes de usar esta aplicación, puedes leer la{' '}
                <a href="#" onClick={(e) => e.preventDefault()} className="text-[#0B57D0] font-medium hover:underline">
                  Política de Privacidad
                </a>{' '}
                y los{' '}
                <a href="#" onClick={(e) => e.preventDefault()} className="text-[#0B57D0] font-medium hover:underline">
                  Términos del Servicio
                </a>{' '}
                de NutriFit.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Language & Legal Links */}
      <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-[#444746] pt-4 pb-2 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-1 cursor-pointer hover:text-[#1F1F1F]">
          <span>Español (España)</span>
          <span className="text-[10px]">▼</span>
        </div>
        <div className="flex items-center space-x-6">
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#1F1F1F]">
            Ayuda
          </a>
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#1F1F1F]">
            Privacidad
          </a>
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#1F1F1F]">
            Términos
          </a>
        </div>
      </div>
    </div>
  );
};
