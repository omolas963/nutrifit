import React from 'react';
import { useApp } from '../../context/AppContext';
import { Target, TrendingDown, TrendingUp, Calendar, Award, Plus } from 'lucide-react';
import { formatWeightDate } from '../../lib/nutritionCalc';

interface WeightSummaryCardProps {
  onOpenLogModal: () => void;
}

export const WeightSummaryCard: React.FC<WeightSummaryCardProps> = ({ onOpenLogModal }) => {
  const { profile } = useApp();

  const currentWeight = profile?.currentWeightKg || 78.4;
  const targetWeight = profile?.targetWeightKg || 73.0;
  const goal = profile?.goal || 'lose';
  const pace = profile?.weeklyPaceKg || (goal === 'lose' ? 0.5 : goal === 'gain' ? 0.25 : 0);

  const diffKg = Math.abs(currentWeight - targetWeight);
  const weeksToGoal = pace > 0 ? Math.ceil(diffKg / pace) : 0;

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + weeksToGoal * 7);

  const getGoalTitle = () => {
    switch (goal) {
      case 'lose':
        return 'Pérdida de Grasa Gradual';
      case 'gain':
        return 'Ganancia Muscular Limpia';
      case 'maintain':
        return 'Mantenimiento y Recomposición';
    }
  };

  return (
    <div className="bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 shadow-card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-solar-100 dark:bg-solar/20 text-solar-800 dark:text-solar flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-solar-800 dark:text-solar">
              Objetivo Actual
            </span>
            <h3 className="font-display font-extrabold text-lg text-bark-900 dark:text-dark-text leading-tight">
              {getGoalTitle()}
            </h3>
          </div>
        </div>

        <button
          onClick={onOpenLogModal}
          className="py-2 px-3.5 bg-solar hover:bg-solar-600 active:scale-95 text-bark-900 rounded-xl font-display font-bold text-xs shadow-sm flex items-center space-x-1 transition-transform"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Registrar peso</span>
        </button>
      </div>

      {/* Metric comparison box */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-cream-100 dark:bg-dark-surface rounded-2xl border border-cream-200 dark:border-dark-border text-center">
        <div>
          <span className="text-xs font-semibold text-bark-500 dark:text-dark-muted block">
            Peso Actual
          </span>
          <span className="font-display font-black text-3xl text-bark-900 dark:text-dark-text">
            {currentWeight}{' '}
            <span className="text-sm font-sans font-bold text-bark-500">kg</span>
          </span>
        </div>

        <div className="border-l border-cream-300 dark:border-dark-border pl-3">
          <span className="text-xs font-semibold text-bark-500 dark:text-dark-muted block">
            Peso Objetivo
          </span>
          <span className="font-display font-black text-3xl text-solar-700 dark:text-solar">
            {targetWeight}{' '}
            <span className="text-sm font-sans font-bold text-bark-500">kg</span>
          </span>
        </div>
      </div>

      {/* Progress Estimation Pill */}
      <div className="p-3.5 bg-solar-50 dark:bg-solar/10 rounded-2xl border border-solar/40 space-y-2 text-xs">
        <div className="flex items-center justify-between font-semibold text-bark-800 dark:text-dark-text">
          <div className="flex items-center space-x-1.5">
            {goal === 'lose' ? (
              <TrendingDown className="w-4 h-4 text-emerald-600" />
            ) : (
              <TrendingUp className="w-4 h-4 text-macro-protein" />
            )}
            <span>Ritmo recomendado: <strong>{pace} kg / semana</strong></span>
          </div>
          <span className="font-bold text-bark-900 dark:text-dark-text">
            {diffKg > 0 ? `${diffKg.toFixed(1)} kg de diferencia` : '¡Objetivo alcanzado!'}
          </span>
        </div>

        {weeksToGoal > 0 && (
          <div className="flex items-center space-x-2 pt-2 border-t border-solar/30 text-bark-700 dark:text-dark-text">
            <Calendar className="w-4 h-4 text-solar-700 dark:text-solar shrink-0" />
            <span>
              Fecha estimada de llegada: <strong>{formatWeightDate(targetDate)}</strong> (~{weeksToGoal} semanas)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
