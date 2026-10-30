import React, { useState } from 'react';
import { UserAccount } from '../../types';
import { authService } from '../../services/authService';
import { Smartphone } from 'lucide-react';

interface SamsungAuthScreenProps {
  onSuccess: (user: UserAccount) => void;
  onCancel?: () => void;
}

export const SamsungAuthScreen: React.FC<SamsungAuthScreenProps> = ({ onSuccess, onCancel }) => {
  const [isUsingOtherAccount, setIsUsingOtherAccount] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Oscar's Samsung account
  const defaultAccount = {
    name: 'oscar Molas Robles',
    email: 'omolas963@gmail.com',
  };

  const handleSelectAccount = async (account: { name: string; email: string }) => {
    setIsLoading(true);
    try {
      const user = await authService.loginWithSamsung(account);
      onSuccess(user);
    } catch (e) {
      console.error('Error logging in with Samsung:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) return;
    const name = customName.trim() || customEmail.split('@')[0];
    handleSelectAccount({
      name,
      email: customEmail.trim().toLowerCase(),
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] text-[#1F1F1F] flex flex-col justify-between p-4 sm:p-8 font-sans antialiased selection:bg-[#D5E2FF]">
      {/* Top spacing / back button */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-[#1428A0] hover:underline font-medium"
          >
            ← Volver a otras opciones
          </button>
        )}
      </div>

      {/* Main Samsung Box */}
      <div className="w-full max-w-4xl mx-auto my-auto bg-white rounded-[28px] border border-[#E0E4EC] shadow-sm p-8 sm:p-12 transition-all">
        {/* Samsung Header */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-6 h-6 rounded-full bg-[#1428A0] text-white flex items-center justify-center font-black text-xs">
            S
          </div>
          <span className="text-xs font-semibold text-[#1428A0] tracking-wider uppercase">
            Samsung Account
          </span>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Left Column: Heading & App Link */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-normal text-[#1F1F1F] tracking-tight leading-tight">
              Vincula tu móvil Samsung
            </h1>
            <p className="text-sm font-medium text-[#1428A0]">
              Conectar con <span className="hover:underline cursor-pointer">NutriFit</span>
            </p>
          </div>

          {/* Right Column: Account Card, 1-Tap & Disclaimers */}
          <div className="space-y-4">
            {!isUsingOtherAccount ? (
              <div className="space-y-2">
                {/* 1-Tap Samsung Galaxy Card */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSelectAccount(defaultAccount)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#F0F4FA] hover:bg-[#E5ECF8] border border-[#D0DAEC] transition-all flex items-center justify-between text-left group cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-[#1428A0] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-sm text-[#1F1F1F] block truncate group-hover:text-[#1428A0]">
                        {defaultAccount.name}
                      </span>
                      <span className="text-xs text-[#555] block truncate">
                        {defaultAccount.email} · Samsung Galaxy
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#1428A0] text-white shrink-0">
                    1 Toque
                  </span>
                </button>

                {/* Horizontal Divider */}
                <div className="border-t border-[#E0E2E0] my-2" />

                {/* "Usar otra cuenta de Samsung" Option */}
                <button
                  type="button"
                  onClick={() => setIsUsingOtherAccount(true)}
                  className="w-full py-2.5 px-3.5 -mx-3.5 rounded-xl hover:bg-[#F2F6FC] transition-colors flex items-center space-x-3 text-left text-[#1F1F1F] cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#555] shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-[#1F1F1F]">
                    Usar otra cuenta de Samsung
                  </span>
                </button>
              </div>
            ) : (
              /* Custom Account Input Form */
              <form onSubmit={handleCustomSubmit} className="space-y-3 p-3 bg-[#F8FAFD] rounded-2xl border border-[#E0E2E0]">
                <h4 className="text-xs font-bold text-[#1F1F1F]">Introduce tu ID de Samsung</h4>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="usuario@samsung.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#C4C7C5] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1428A0] focus:ring-1 focus:ring-[#1428A0]"
                />
                <input
                  type="text"
                  placeholder="Tu nombre (opcional)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#C4C7C5] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1428A0] focus:ring-1 focus:ring-[#1428A0]"
                />
                <div className="flex space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsUsingOtherAccount(false)}
                    className="flex-1 py-1.5 text-xs font-medium text-[#555] hover:text-[#1F1F1F]"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-1.5 px-3 bg-[#1428A0] hover:bg-[#102082] text-white rounded-xl text-xs font-medium shadow-sm"
                  >
                    Conectar
                  </button>
                </div>
              </form>
            )}

            {/* Disclaimer Text */}
            <div className="pt-4 border-t border-[#E0E2E0]">
              <p className="text-xs text-[#555] leading-relaxed">
                Al vincular tu dispositivo, autorizas la sincronización local de tus calorías y macros en NutriFit.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Language & Legal Links */}
      <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-[#555] pt-4 pb-2 space-y-2 sm:space-y-0">
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
