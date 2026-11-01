import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Utensils, ChefHat, TrendingUp, Target, Plus, Sparkles } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { setIsAddModalOpen, setPreselectedMealForAdd } = useApp();

  const handleOpenAdd = () => {
    setPreselectedMealForAdd('desayuno');
    setIsAddModalOpen(true);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-cream-50 dark:bg-dark-card border-t border-cream-200 dark:border-dark-border py-1.5 px-1 sm:px-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] transition-colors shadow-floating">
      <div className="max-w-xl mx-auto flex items-center justify-between px-1 relative">
        {/* 1. Hoy */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[48px] py-1 px-1 rounded-xl transition-all ${
              isActive
                ? 'text-bark-900 dark:text-solar font-bold'
                : 'text-bark-500 dark:text-dark-muted hover:text-bark-800 dark:hover:text-dark-text'
            }`
          }
        >
          <Utensils className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] sm:text-xs font-semibold leading-tight">Hoy</span>
        </NavLink>

        {/* 2. Recetas */}
        <NavLink
          to="/recetas"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[48px] py-1 px-1 rounded-xl transition-all ${
              isActive
                ? 'text-bark-900 dark:text-solar font-bold'
                : 'text-bark-500 dark:text-dark-muted hover:text-bark-800 dark:hover:text-dark-text'
            }`
          }
        >
          <ChefHat className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] sm:text-xs font-semibold leading-tight">Recetas</span>
        </NavLink>

        {/* Centered Floating Action Button (+) */}
        <div className="relative -top-4 flex flex-col items-center shrink-0 mx-1">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-solar hover:bg-solar-600 active:scale-95 text-bark-900 flex items-center justify-center shadow-floating border-3 sm:border-4 border-cream-100 dark:border-dark-bg transition-transform"
            aria-label="Registrar alimento"
          >
            <Plus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
          </button>
          <span className="text-[10px] font-bold text-bark-800 dark:text-dark-muted mt-0.5">
            Añadir
          </span>
        </div>

        {/* 3. Asistente */}
        <NavLink
          to="/asistente"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[48px] py-1 px-1 rounded-xl transition-all ${
              isActive
                ? 'text-bark-900 dark:text-solar font-bold'
                : 'text-bark-500 dark:text-dark-muted hover:text-bark-800 dark:hover:text-dark-text'
            }`
          }
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] sm:text-xs font-semibold leading-tight">Asistente</span>
        </NavLink>

        {/* 4. Progreso */}
        <NavLink
          to="/progreso"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[48px] py-1 px-1 rounded-xl transition-all ${
              isActive
                ? 'text-bark-900 dark:text-solar font-bold'
                : 'text-bark-500 dark:text-dark-muted hover:text-bark-800 dark:hover:text-dark-text'
            }`
          }
        >
          <TrendingUp className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] sm:text-xs font-semibold leading-tight">Progreso</span>
        </NavLink>

        {/* 5. Objetivo */}
        <NavLink
          to="/objetivo"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[48px] py-1 px-1 rounded-xl transition-all ${
              isActive
                ? 'text-bark-900 dark:text-solar font-bold'
                : 'text-bark-500 dark:text-dark-muted hover:text-bark-800 dark:hover:text-dark-text'
            }`
          }
        >
          <Target className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] sm:text-xs font-semibold leading-tight">Objetivo</span>
        </NavLink>
      </div>
    </nav>
  );
};
