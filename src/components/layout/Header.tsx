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
    <header className="sticky top-0 z-30 w-full bg-cream-100/95 dark:bg-dark-bg/95 backdrop-blur-md border-b border-cream-200 dark:border-dark-border px-4 py-3 transition-colors">
      <div className="w-full flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-2.5 group shrink-0">
          <svg
            viewBox="0 0 64 64"
            fill="none"
            className="w-8 h-8 rounded-xl shadow-sm group-hover:scale-105 transition-transform object-contain shrink-0"
            aria-label="NutriFit Logo"
          >
            <rect width="64" height="64" rx="20" fill="#FFC62E" />
            <path
              d="M32 12C20.954 12 12 20.954 12 32C12 43.046 20.954 52 32 52C43.046 52 52 43.046 52 32"
              stroke="#261C14"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M32 20V32L40 36"
              stroke="#261C14"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="48" cy="18" r="5" fill="#E26D5C" />
          </svg>
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

          {/* User Account / Profile Menu */}
          <div className="relative">
            {currentUser ? (
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-8 h-8 rounded-full border border-cream-300 dark:border-dark-border flex items-center justify-center bg-cream-50 dark:bg-dark-surface text-bark-800 dark:text-dark-text text-xs font-bold hover:ring-2 hover:ring-solar transition-all overflow-hidden"
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {currentUser.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="p-1.5 px-3 bg-solar hover:bg-solar-600 text-bark-900 text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Acceder
              </button>
            )}

            {/* Profile Dropdown */}
            {isMenuOpen && currentUser && (
              <div className="absolute right-0 mt-2 w-56 bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-2xl shadow-floating p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="p-2.5 border-b border-cream-200 dark:border-dark-border mb-1">
                  <span className="font-bold text-bark-900 dark:text-dark-text block truncate">
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
                    <Sparkles className="w-3.5 h-3.5 text-solar-800 dark:text-solar" />
                    <span>Evaluación Personalizada</span>
                  </button>

                  <Link
                    to="/ajustes"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full py-1.5 px-2.5 rounded-xl hover:bg-cream-100 dark:hover:bg-dark-surface text-left text-xs font-semibold text-bark-800 dark:text-dark-text flex items-center space-x-2"
                  >
                    <Settings className="w-3.5 h-3.5 text-bark-600 dark:text-dark-muted" />
                    <span>Ajustes y Objetivos</span>
                  </Link>

                  <button
                    onClick={logout}
                    className="w-full py-1.5 px-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-left text-xs font-semibold text-red-600 dark:text-red-400 flex items-center space-x-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
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
