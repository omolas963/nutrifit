import React from 'react';
import { ActivityLevel } from '../../types';
import { Check } from 'lucide-react';

interface StepActivityProps {
  activity: ActivityLevel;
  onChange: (activity: ActivityLevel) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const StepActivity: React.FC<StepActivityProps> = ({
  activity,
  onChange,
  onNext,
  onPrev,
}) => {
  const levels: Array<{
    type: ActivityLevel;
    title: string;
    description: string;
    factor: string;
  }> = [
    {
      type: 'sedentary',
      title: 'Sedentario',
      description: 'Poco o ningún ejercicio. Trabajo de escritorio.',
      factor: 'x1.20',
    },
    {
      type: 'light',
      title: 'Ligero',
      description: 'Ejercicio ligero o caminatas 1 a 3 días por semana.',
      factor: 'x1.375',
    },
    {
      type: 'moderate',
      title: 'Moderado (Recomendado)',
      description: 'Ejercicio moderado (pesas, running) 3 a 5 días por semana.',
      factor: 'x1.55',
    },
    {
      type: 'very_active',
      title: 'Muy activo',
      description: 'Entrenamientos intensos 6 a 7 días por semana.',
      factor: 'x1.725',
    },
    {
      type: 'athlete',
      title: 'Atleta / Físico intenso',
      description: 'Doble sesión diaria o trabajo de esfuerzo físico pesado.',
      factor: 'x1.90',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <span className="text-xs font-bold text-solar-700 dark:text-solar uppercase tracking-wider">
          Paso 3 de 4
        </span>
        <h2 className="font-display font-extrabold text-2xl text-bark-900 dark:text-dark-text mt-1">
          Nivel de actividad semanal
        </h2>
        <p className="text-sm text-bark-600 dark:text-dark-muted mt-1">
          Calcula tu gasto calórico real más allá de tu metabolismo basal.
        </p>
      </div>

      <div className="space-y-2.5">
        {levels.map((lvl) => {
          const isSelected = activity === lvl.type;
          return (
            <div
              key={lvl.type}
              onClick={() => onChange(lvl.type)}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                isSelected
                  ? 'border-solar bg-solar-50/60 dark:bg-solar/10 dark:border-solar shadow-sm'
                  : 'border-cream-300 dark:border-dark-border bg-white dark:bg-dark-surface hover:border-cream-400'
              }`}
            >
              <div className="flex-1 pr-3">
                <div className="flex items-center space-x-2">
                  <h4 className="font-display font-bold text-sm text-bark-900 dark:text-dark-text">
                    {lvl.title}
                  </h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cream-200 dark:bg-dark-elevated text-bark-600 dark:text-dark-muted">
                    {lvl.factor}
                  </span>
                </div>
                <p className="text-xs text-bark-600 dark:text-dark-muted mt-0.5">
                  {lvl.description}
                </p>
              </div>

              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'border-solar bg-solar text-bark-900'
                    : 'border-cream-400 dark:border-dark-border text-transparent'
                }`}
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center space-x-3 pt-4">
        <button
          type="button"
          onClick={onPrev}
          className="py-3.5 px-5 bg-cream-200 dark:bg-dark-surface hover:bg-cream-300 dark:hover:bg-dark-elevated rounded-2xl font-bold text-bark-800 dark:text-dark-text text-sm transition-colors"
        >
          Atrás
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-3.5 px-4 bg-solar hover:bg-solar-600 active:scale-[0.99] rounded-2xl font-display font-bold text-bark-900 shadow-sm transition-all text-base"
        >
          Calcular mis calorías
        </button>
      </div>
    </div>
  );
};
