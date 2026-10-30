import React from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Award, Calendar } from 'lucide-react';

export const StreakCard: React.FC = () => {
  const { streakDays, allFoodEntries } = useApp();

  const totalLoggedDays = new Set(allFoodEntries.map((e) => e.date)).size;

  return (
    <div className="bg-gradient-to-br from-amber-500 to-solar rounded-3xl p-5 text-bark-900 shadow-floating relative overflow-hidden">
      {/* Background ambient flame outline */}
      <Flame className="absolute -right-4 -bottom-4 w-32 h-32 text-amber-600/20 pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-bark-800/80 block">
            Racha Actual de Registro
          </span>
          <div className="flex items-baseline space-x-2 my-1">
            <span className="font-display font-black text-5xl tracking-tight leading-none">
              {streakDays}
            </span>
            <span className="font-bold text-lg">
              {streakDays === 1 ? 'día consecutivo' : 'días consecutivos'}
            </span>
          </div>
          <p className="text-xs font-semibold text-bark-800 max-w-xs mt-1">
            {streakDays >= 7
              ? '¡Imparable! La consistencia es el factor #1 para transformar tu cuerpo.'
              : streakDays >= 3
              ? '¡Excelente ritmo! Estás construyendo un hábito nutricional sólido.'
              : 'Registra tus comidas cada día para mantener tu racha activa.'}
          </p>
        </div>

        <div className="p-3.5 bg-bark-900/10 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center shrink-0 border border-bark-900/10">
          <Flame className="w-8 h-8 fill-bark-900 text-bark-900 animate-bounce" />
          <span className="text-[10px] font-black uppercase mt-1">En racha</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-bark-900/15 flex items-center justify-between text-xs font-bold text-bark-800">
        <div className="flex items-center space-x-1.5">
          <Calendar className="w-4 h-4" />
          <span>{totalLoggedDays} días registrados en total</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Award className="w-4 h-4" />
          <span>Hábito constante</span>
        </div>
      </div>
    </div>
  );
};
