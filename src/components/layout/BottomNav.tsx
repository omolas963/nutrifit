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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-cream-50/95 dark:bg-dark-card/95 backdrop-blur-lg border-t border-cream-200 dark:border-dark-border py-2 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-colors">
      <div className="max-w-xl mx-auto flex items-center justify-around relative">
        {/* 1. Hoy */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-colors ${
              isActive
                ? 'text-bark-900 dark:text-solar font-bold'
                : 'text-bark-500 dark:text-dark-muted hover:text-bark-800 dark:hover:text-dark-text'
            }`
          }
        >
          <Utensils className="w-5 h-5 mb-1" />
          <span className="text-[11px] font-medium leading-none">Hoy</span>
        </NavLink>

        {/* 2. Recetas */}
        <NavLink
          to="/recetas"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-colors ${
              isActive
                ? 'text-bark-900 dark:text-solar font-bold'
                : 'text-bark-500 dark:text-dark-muted hover:text-bark-800 dark:hover:text-dark-text'
            }`
          }
        >
          <ChefHat className="w-5 h-5 mb-1" />
          <span className="text-[11px] font-medium leading-none">Recetas</span>
        </NavLink>

        {/* Centered Floating Action Button (+) */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            onClick={handleOpenAdd}
            className="w-14 h-14 rounded-full bg-solar hover:bg-solar-600 active:scale-95 text-bark-900 flex items-center justify-center shadow-floating border-4 border-cream-100 dark:border-dark-bg transition-transform"
            aria-label="Registrar alimento"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
          <span className="text-[10px] font-bold text-bark-700 dark:text-dark-muted mt-0.5">
            Añadir
          </span>
        </div>

        {/* 3. Asistente (Reemplaza a Plan) */}
        <NavLink
          to="/asistente"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-colors ${
              isActive
                ? 'text-bark-900 dark:text-solar font-bold'
                : 'text-bark-500 dark:text-dark-muted hover:text-bark-800 dark:hover:text-dark-text'
            }`
          }
        >
          <Sparkles className="w-5 h-5 mb-1" />
          <span className="text-[11px] font-medium leading-none">Asistente</span>
        </NavLink>

        {/* 4. Progreso */}
        <NavLink
          to="/progreso"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-colors ${
              isActive
                ? 'text-bark-900 dark:text-solar font-bold'
                : 'text-bark-500 dark:text-dark-muted hover:text-bark-800 dark:hover:text-dark-text'
            }`
          }
        >
          <TrendingUp className="w-5 h-5 mb-1" />
          <span className="text-[11px] font-medium leading-none">Progreso</span>
        </NavLink>

        {/* 5. Objetivo */}
        <NavLink
          to="/objetivo"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-colors ${
              isActive
                ? 'text-bark-900 dark:text-solar font-bold'
                : 'text-bark-500 dark:text-dark-muted hover:text-bark-800 dark:hover:text-dark-text'
            }`
          }
        >
          <Target className="w-5 h-5 mb-1" />
          <span className="text-[11px] font-medium leading-none">Objetivo</span>
        </NavLink>
      </div>
    </nav>
  );
};
