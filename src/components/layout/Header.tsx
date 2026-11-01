import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Moon, Sun, Settings, User as UserIcon, LogOut, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const {
    streakDays,
    profile,
    toggleTheme,
    currentUser,
    setIsAuthModalOpen,
    setIsAssessmentOpen,
    logout,
  } = useApp();
  const isDark = profile?.theme === 'dark';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-cream-100/90 dark:bg-dark-bg/90 backdrop-blur-md border-b border-cream-200 dark:border-dark-border px-4 py-3 transition-colors">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-solar flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <span className="font-display font-extrabold text-bark-900 text-base">N</span>
          </div>
          <span className="font-display font-black text-xl tracking-tight text-bark-900 dark:text-dark-text">
            Nutri<span className="text-solar-600 dark:text-solar">Fit</span>
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center space-x-2">
          {/* Streak Badge */}
          <div
            className="flex items-center space-x-1 px-2.5 py-1 bg-cream-50 dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-full shadow-sm text-xs font-bold text-amber-600 dark:text-amber-400"
            title={`Racha activa: ${streakDays} días consecutivos`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{streakDays}</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-bark-700 hover:text-bark-900 hover:bg-cream-200 dark:text-dark-muted dark:hover:text-dark-text dark:hover:bg-dark-surface transition-colors"
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDark ? <Sun className="w-4 h-4 text-solar" /> : <Moon className="w-4 h-4 text-bark-800" />}
          </button>

          {/* User Account / Login Button */}
          <div className="relative">
            {currentUser ? (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-1 p-1 rounded-full hover:ring-2 hover:ring-solar transition-all"
                aria-label="Abrir menú de usuario"
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-solar"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-solar text-bark-900 font-bold text-xs flex items-center justify-center">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="py-1 px-3 bg-solar hover:bg-solar-600 active:scale-95 text-bark-900 rounded-xl text-xs font-bold shadow-sm transition-transform flex items-center space-x-1"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            )}

            {/* Account Popover Menu */}
            {isMenuOpen && currentUser && (
              <div
                className="absolute right-0 top-10 w-56 bg-white dark:bg-dark-card border border-cream-300 dark:border-dark-border rounded-2xl shadow-modal p-3 z-50 animate-in fade-in zoom-in-95"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="border-b border-cream-200 dark:border-dark-border pb-2.5 mb-2">
                  <span className="font-bold text-xs text-bark-900 dark:text-dark-text block truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-bark-500 truncate block">
                    {currentUser.email}
                  </span>
                  <span className="inline-flex items-center space-x-1 mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span>Sesión activa</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => setIsAssessmentOpen(true)}
                    className="w-full py-1.5 px-2.5 rounded-xl hover:bg-cream-100 dark:hover:bg-dark-surface text-left text-xs font-semibold text-bark-800 dark:text-dark-text flex items-center space-x-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-solar-700 dark:text-solar" />
                    <span>Repetir evaluación</span>
                  </button>

                  <Link
                    to="/ajustes"
                    className="w-full py-1.5 px-2.5 rounded-xl hover:bg-cream-100 dark:hover:bg-dark-surface text-left text-xs font-semibold text-bark-800 dark:text-dark-text flex items-center space-x-2"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Ajustes del perfil</span>
                  </Link>

                  <button
                    onClick={logout}
                    className="w-full py-1.5 px-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-left text-xs font-semibold text-red-600 flex items-center space-x-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
