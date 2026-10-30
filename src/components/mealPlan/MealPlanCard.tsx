import React, { useState } from 'react';
import { MealPlanItem, MealType } from '../../types';
import { useApp } from '../../context/AppContext';
import { Plus, RefreshCw, Check } from 'lucide-react';

interface MealPlanCardProps {
  item: MealPlanItem;
  onSwapAlternative?: (alternativeTitle: string) => void;
}

export const MealPlanCard: React.FC<MealPlanCardProps> = ({ item }) => {
  const { addFood, selectedDate } = useApp();
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddMealToDiary = async () => {
    for (const food of item.foods) {
      await addFood({
        name: food.name,
        grams: food.grams,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        source: 'Estimado por IA',
        isEstimated: true,
        mealType: item.type as MealType,
        date: selectedDate,
        loggedAt: new Date().toISOString(),
      });
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  return (
    <div className="bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 shadow-card transition-all space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-solar-800 dark:text-solar">
            {item.type}
          </span>
          <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text leading-snug">
            {item.title}
          </h4>
        </div>

        <div className="text-right shrink-0">
          <span className="font-display font-bold text-base text-bark-900 dark:text-dark-text">
            {item.calories}
          </span>
          <span className="text-[10px] text-bark-500 ml-0.5">kcal</span>
          <div className="text-[10px] text-bark-500 font-medium">
            <span className="text-macro-protein">{item.macros.protein}g P</span> ·{' '}
            <span className="text-macro-carbs">{item.macros.carbs}g C</span> ·{' '}
            <span className="text-macro-fat">{item.macros.fat}g G</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-bark-600 dark:text-dark-muted leading-relaxed">
        {item.description}
      </p>

      {/* Foods breakdown */}
      <div className="space-y-1.5 pt-1">
        {item.foods.map((food, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-1 px-2.5 rounded-xl bg-cream-100/70 dark:bg-dark-surface text-xs"
          >
            <span className="font-medium text-bark-800 dark:text-dark-text">{food.name}</span>
            <span className="text-bark-500 font-bold">{food.grams}g · {food.calories} kcal</span>
          </div>
        ))}
      </div>

      {/* Actions: Add to diary & Alternatives */}
      <div className="pt-2 border-t border-cream-200 dark:border-dark-border flex items-center justify-between">
        {item.alternatives.length > 0 ? (
          <button
            onClick={() => setShowAlternatives(!showAlternatives)}
            className="text-xs text-bark-600 hover:text-bark-900 dark:text-dark-muted font-bold flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Alternativas ({item.alternatives.length})</span>
          </button>
        ) : (
          <span />
        )}

        <button
          onClick={handleAddMealToDiary}
          disabled={isAdded}
          className={`py-1.5 px-3.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all ${
            isAdded
              ? 'bg-emerald-500 text-white'
              : 'bg-solar hover:bg-solar-600 active:scale-95 text-bark-900'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Añadido</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Añadir a mi diario</span>
            </>
          )}
        </button>
      </div>

      {/* Alternatives List */}
      {showAlternatives && (
        <div className="p-3 bg-cream-100 dark:bg-dark-surface rounded-2xl border border-cream-200 dark:border-dark-border space-y-2 animate-in fade-in">
          <span className="text-[11px] font-bold text-bark-700 dark:text-dark-text block">
            Opciones alternativas para esta comida:
          </span>
          {item.alternatives.map((alt, idx) => (
            <div
              key={idx}
              className="p-2.5 bg-white dark:bg-dark-card rounded-xl border border-cream-200 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-semibold text-bark-900 dark:text-dark-text block leading-tight">
                  {alt.title}
                </span>
                <span className="text-[10px] text-bark-500">
                  {alt.calories} kcal · {alt.macros.protein}g P · {alt.macros.carbs}g C · {alt.macros.fat}g G
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
