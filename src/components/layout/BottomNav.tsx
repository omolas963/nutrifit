import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Utensils, ChefHat, TrendingUp, Plus, Sparkles } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { setIsAddModalOpen, setPreselectedMealForAdd } = useApp();

  const handleOpenAdd = () => {
    setPreselectedMealForAdd('desayuno');
    setIsAddModalOpen(true);
  };

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 bg-cream-50 dark:bg-dark-card border-t border-cream-200 dark:border-dark-border py-1.5 px-2 pb-[max(0.6rem,env(safe-area-inset-bottom,0px))] transition-colors shadow-floating select-none">
      <div className="w-full flex items-center justify-between relative">
        {/* 1. Hoy */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-1 rounded-2xl transition-all ${
              isActive
                ? 'text-bark-900 dark:text-solar font-bold'
                : 'text-bark-500 dark:text-dark-muted hover:text-bark-800 dark:hover:text-dark-text'
            }`
          }
        >
          <Utensils className="w-[22px] h-[22px] mb-0.5 shrink-0" />
          <span className="text-[11px] font-semibold leading-tight truncate">Hoy</span>
        </NavLink>

        {/* 2. Recetas */}
        <NavLink
          to="/recetas"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-1 rounded-2xl transition-all ${
              isActive
                ? 'text-bark-900 dark:text-solar font-bold'
                : 'text-bark-500 dark:text-dark-muted hover:text-bark-800 dark:hover:text-dark-text'
            }`
          }
        >
          <ChefHat className="w-[22px] h-[22px] mb-0.5 shrink-0" />
          <span className="text-[11px] font-semibold leading-tight truncate">Recetas</span>
        </NavLink>

        {/* Botón flotante central (+) */}
        <div className="relative -top-4 flex flex-col items-center px-1 shrink-0">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="w-14 h-14 rounded-full bg-solar hover:bg-solar-600 active:scale-95 text-bark-900 flex items-center justify-center shadow-floating border-4 border-cream-100 dark:border-dark-bg transition-transform"
            aria-label="Registrar alimento"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
          <span className="text-[11px] font-bold text-bark-900 dark:text-dark-muted mt-0.5">
            Añadir
          </span>
        </div>

        {/* 3. Asistente IA */}
        <NavLink
          to="/asistente"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-1 rounded-2xl transition-all ${
              isActive
                ? 'text-bark-900 dark:text-solar font-bold'
                : 'text-bark-500 dark:text-dark-muted hover:text-bark-800 dark:hover:text-dark-text'
            }`
          }
        >
          <Sparkles className="w-[22px] h-[22px] mb-0.5 shrink-0" />
          <span className="text-[11px] font-semibold leading-tight truncate">Asistente</span>
        </NavLink>

        {/* 4. Progreso y Objetivos */}
        <NavLink
          to="/progreso"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-1 rounded-2xl transition-all ${
              isActive
                ? 'text-bark-900 dark:text-solar font-bold'
                : 'text-bark-500 dark:text-dark-muted hover:text-bark-800 dark:hover:text-dark-text'
            }`
          }
        >
          <TrendingUp className="w-[22px] h-[22px] mb-0.5 shrink-0" />
          <span className="text-[11px] font-semibold leading-tight truncate">Progreso</span>
        </NavLink>
      </div>
    </nav>
  );
};
