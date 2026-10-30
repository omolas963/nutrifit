import React from 'react';
import { Gender } from '../../types';

interface StepMetricsProps {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  onChange: (fields: Partial<{
    gender: Gender;
    age: number;
    heightCm: number;
    weightKg: number;
    targetWeightKg: number;
  }>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const StepMetrics: React.FC<StepMetricsProps> = ({
  gender,
  age,
  heightCm,
  weightKg,
  targetWeightKg,
  onChange,
  onNext,
  onPrev,
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <span className="text-xs font-bold text-solar-700 dark:text-solar uppercase tracking-wider">
          Paso 2 de 4
        </span>
        <h2 className="font-display font-extrabold text-2xl text-bark-900 dark:text-dark-text mt-1">
          Tus datos corporales
        </h2>
        <p className="text-sm text-bark-600 dark:text-dark-muted mt-1">
          Necesarios para la fórmula clínica Mifflin-St Jeor.
        </p>
      </div>

      {/* Sex Selector */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-2">
          Sexo biológico
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChange({ gender: 'male' })}
            className={`py-3 px-4 rounded-2xl border-2 font-display font-bold text-sm transition-all ${
              gender === 'male'
                ? 'border-solar bg-solar-50/60 dark:bg-solar/15 text-bark-900 dark:text-dark-text'
                : 'border-cream-300 dark:border-dark-border bg-white dark:bg-dark-surface text-bark-600 dark:text-dark-muted'
            }`}
          >
            Hombre
          </button>
          <button
            type="button"
            onClick={() => onChange({ gender: 'female' })}
            className={`py-3 px-4 rounded-2xl border-2 font-display font-bold text-sm transition-all ${
              gender === 'female'
                ? 'border-solar bg-solar-50/60 dark:bg-solar/15 text-bark-900 dark:text-dark-text'
                : 'border-cream-300 dark:border-dark-border bg-white dark:bg-dark-surface text-bark-600 dark:text-dark-muted'
            }`}
          >
            Mujer
          </button>
        </div>
      </div>

      {/* Edad y Altura */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1.5">
            Edad
          </label>
          <div className="relative">
            <input
              type="number"
              min="14"
              max="100"
              value={age || ''}
              onChange={(e) => onChange({ age: Math.max(1, parseInt(e.target.value, 10) || 0) })}
              className="w-full px-4 py-3 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl text-bark-900 dark:text-dark-text font-display font-bold text-lg focus:outline-none focus:ring-2 focus:ring-solar"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-bark-500">
              años
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1.5">
            Altura
          </label>
          <div className="relative">
            <input
              type="number"
              min="100"
              max="250"
              value={heightCm || ''}
              onChange={(e) => onChange({ heightCm: Math.max(1, parseInt(e.target.value, 10) || 0) })}
              className="w-full px-4 py-3 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl text-bark-900 dark:text-dark-text font-display font-bold text-lg focus:outline-none focus:ring-2 focus:ring-solar"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-bark-500">
              cm
            </span>
          </div>
        </div>
      </div>

      {/* Peso actual y Peso objetivo */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1.5">
            Peso actual
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="30"
              max="300"
              value={weightKg || ''}
              onChange={(e) => onChange({ weightKg: Math.max(1, parseFloat(e.target.value) || 0) })}
              className="w-full px-4 py-3 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl text-bark-900 dark:text-dark-text font-display font-bold text-lg focus:outline-none focus:ring-2 focus:ring-solar"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-bark-500">
              kg
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1.5">
            Peso objetivo
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="30"
              max="300"
              value={targetWeightKg || ''}
              onChange={(e) => onChange({ targetWeightKg: Math.max(1, parseFloat(e.target.value) || 0) })}
              className="w-full px-4 py-3 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl text-bark-900 dark:text-dark-text font-display font-bold text-lg focus:outline-none focus:ring-2 focus:ring-solar"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-bark-500">
              kg
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}
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
          disabled={!age || !heightCm || !weightKg || !targetWeightKg}
          className="flex-1 py-3.5 px-4 bg-solar hover:bg-solar-600 disabled:opacity-50 active:scale-[0.99] rounded-2xl font-display font-bold text-bark-900 shadow-sm transition-all text-base"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};
