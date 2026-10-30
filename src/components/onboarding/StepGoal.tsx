import React from 'react';
import { GoalType } from '../../types';
import { TrendingDown, Minus, TrendingUp, Check } from 'lucide-react';

interface StepGoalProps {
  goal: GoalType;
  onChange: (goal: GoalType) => void;
  onNext: () => void;
}

export const StepGoal: React.FC<StepGoalProps> = ({ goal, onChange, onNext }) => {
  const options: Array<{
    type: GoalType;
    title: string;
    description: string;
    icon: React.ReactNode;
    badge: string;
  }> = [
    {
      type: 'lose',
      title: 'Perder peso',
      description: 'Déficit calórico moderado de ~500 kcal/día preservando masa muscular.',
      icon: <TrendingDown className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      badge: '~0.5 kg / semana',
    },
    {
      type: 'maintain',
      title: 'Mantener peso',
      description: 'Equilibrio calórico exacto para mejorar composición corporal y salud.',
      icon: <Minus className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      badge: 'Estabilidad',
    },
    {
      type: 'gain',
      title: 'Ganar masa muscular',
      description: 'Superávit controlado de ~300 kcal/día para construir músculo magro.',
      icon: <TrendingUp className="w-6 h-6 text-macro-protein" />,
      badge: '~0.25 kg / semana',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <span className="text-xs font-bold text-solar-700 dark:text-solar uppercase tracking-wider">
          Paso 1 de 4
        </span>
        <h2 className="font-display font-extrabold text-2xl text-bark-900 dark:text-dark-text mt-1">
          ¿Cuál es tu objetivo principal?
        </h2>
        <p className="text-sm text-bark-600 dark:text-dark-muted mt-1">
          Personalizaremos tu déficit o superávit calórico ideal.
        </p>
      </div>

      <div className="space-y-3">
        {options.map((opt) => {
          const isSelected = goal === opt.type;
          return (
            <div
              key={opt.type}
              onClick={() => onChange(opt.type)}
              className={`p-4 rounded-3xl border-2 cursor-pointer transition-all flex items-start space-x-4 ${
                isSelected
                  ? 'border-solar bg-solar-50/50 dark:bg-solar/10 dark:border-solar shadow-sm'
                  : 'border-cream-300 dark:border-dark-border bg-white dark:bg-dark-surface hover:border-cream-400'
              }`}
            >
              <div className="p-3 rounded-2xl bg-cream-200 dark:bg-dark-elevated shrink-0">
                {opt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text">
                    {opt.title}
                  </h4>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cream-200 dark:bg-dark-elevated text-bark-700 dark:text-dark-muted">
                    {opt.badge}
                  </span>
                </div>
                <p className="text-xs text-bark-600 dark:text-dark-muted mt-1 leading-relaxed">
                  {opt.description}
                </p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-colors ${
                  isSelected
                    ? 'border-solar bg-solar text-bark-900'
                    : 'border-cream-400 dark:border-dark-border text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4">
        <button
          onClick={onNext}
          className="w-full py-3.5 px-4 bg-solar hover:bg-solar-600 active:scale-[0.99] rounded-2xl font-display font-bold text-bark-900 shadow-sm transition-all text-base"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};
