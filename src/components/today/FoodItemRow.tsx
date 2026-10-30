import React from 'react';
import { FoodEntry } from '../../types';
import { Edit3, Trash2, CheckCircle2, Sparkles } from 'lucide-react';

interface FoodItemRowProps {
  food: FoodEntry;
  onEdit: (food: FoodEntry) => void;
  onDelete: (id: string) => void;
}

export const FoodItemRow: React.FC<FoodItemRowProps> = ({ food, onEdit, onDelete }) => {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-2xl bg-cream-100/60 dark:bg-dark-surface/60 hover:bg-cream-200/60 dark:hover:bg-dark-surface border border-cream-200/80 dark:border-dark-border/60 transition-colors group">
      {/* Food Details */}
      <div className="flex-1 min-w-0 pr-3">
        <div className="flex items-center space-x-1.5">
          <h5 className="font-semibold text-sm text-bark-900 dark:text-dark-text truncate">
            {food.name}
          </h5>
          {food.isEstimated ? (
            <span
              className="inline-flex items-center space-x-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60"
              title="Valores estimados por IA"
            >
              <Sparkles className="w-2.5 h-2.5 text-amber-600" />
              <span>Estimado</span>
            </span>
          ) : (
            <span
              className="inline-flex items-center space-x-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60"
              title={`Verificado por base de datos (${food.source})`}
            >
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
              <span>{food.source === 'Open Food Facts' ? 'OFF' : 'USDA'}</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 text-xs text-bark-500 dark:text-dark-muted mt-0.5 font-medium">
          <span>{food.grams}g</span>
          <span>·</span>
          <span className="text-macro-protein font-semibold">{food.protein}g P</span>
          <span className="text-macro-carbs font-semibold">{food.carbs}g C</span>
          <span className="text-macro-fat font-semibold">{food.fat}g G</span>
        </div>
      </div>

      {/* Calories & Action Buttons */}
      <div className="flex items-center space-x-2 shrink-0">
        <div className="text-right">
          <span className="font-display font-bold text-sm text-bark-900 dark:text-dark-text">
            {food.calories}
          </span>
          <span className="text-[10px] text-bark-500 dark:text-dark-muted ml-0.5">kcal</span>
        </div>

        <div className="flex items-center space-x-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(food)}
            className="p-1.5 rounded-lg hover:bg-cream-300 dark:hover:bg-dark-elevated text-bark-600 dark:text-dark-muted hover:text-bark-900 transition-colors"
            aria-label={`Editar cantidad de ${food.name}`}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(food.id)}
            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/40 text-bark-600 dark:text-dark-muted hover:text-red-600 transition-colors"
            aria-label={`Eliminar ${food.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
