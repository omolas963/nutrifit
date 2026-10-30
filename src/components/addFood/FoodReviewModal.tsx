import React, { useState } from 'react';
import { FoodItem, MealType } from '../../types';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Trash2, CheckCircle2, Sparkles, Plus } from 'lucide-react';

interface FoodReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedFoods: FoodItem[];
  defaultMealType?: MealType;
}

export const FoodReviewModal: React.FC<FoodReviewModalProps> = ({
  isOpen,
  onClose,
  detectedFoods,
  defaultMealType = 'comida',
}) => {
  const { addFood, selectedDate } = useApp();
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [foods, setFoods] = useState<FoodItem[]>(detectedFoods);

  // Sync state when detectedFoods changes
  React.useEffect(() => {
    setFoods(detectedFoods);
  }, [detectedFoods]);

  React.useEffect(() => {
    if (defaultMealType) {
      setMealType(defaultMealType);
    }
  }, [defaultMealType]);

  const updateGrams = (index: number, newGrams: number) => {
    setFoods((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const validGrams = Math.max(1, newGrams);
        const ratio = item.grams > 0 ? validGrams / item.grams : 1;
        return {
          ...item,
          grams: validGrams,
          calories: Math.round(item.calories * ratio),
          protein: Number((item.protein * ratio).toFixed(1)),
          carbs: Number((item.carbs * ratio).toFixed(1)),
          fat: Number((item.fat * ratio).toFixed(1)),
        };
      })
    );
  };

  const updateName = (index: number, newName: string) => {
    setFoods((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, name: newName } : item))
    );
  };

  const removeFood = (index: number) => {
    setFoods((prev) => prev.filter((_, idx) => idx !== index));
  };

  const totalCalories = foods.reduce((acc, f) => acc + f.calories, 0);
  const totalProtein = foods.reduce((acc, f) => acc + f.protein, 0);
  const totalCarbs = foods.reduce((acc, f) => acc + f.carbs, 0);
  const totalFat = foods.reduce((acc, f) => acc + f.fat, 0);

  const handleSaveAll = async () => {
    for (const food of foods) {
      await addFood({
        ...food,
        mealType,
        date: selectedDate,
        loggedAt: new Date().toISOString(),
      });
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Revisar alimentos detectados" maxWidth="max-w-lg">
      <div className="space-y-4">
        {/* Meal Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-2">
            Añadir a esta comida
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {(['desayuno', 'comida', 'merienda', 'cena', 'snacks'] as MealType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setMealType(type)}
                className={`py-2 px-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                  mealType === type
                    ? 'bg-solar text-bark-900 font-bold shadow-sm'
                    : 'bg-cream-200 dark:bg-dark-surface text-bark-700 dark:text-dark-muted hover:bg-cream-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* List of detected items */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {foods.map((food, index) => (
            <div
              key={food.id || index}
              className="p-3 bg-white dark:bg-dark-surface rounded-2xl border border-cream-300 dark:border-dark-border shadow-sm space-y-2"
            >
              <div className="flex items-start justify-between space-x-2">
                <input
                  type="text"
                  value={food.name}
                  onChange={(e) => updateName(index, e.target.value)}
                  className="font-display font-bold text-sm text-bark-900 dark:text-dark-text bg-transparent border-b border-transparent hover:border-cream-400 focus:border-solar focus:outline-none flex-1 pb-0.5"
                />

                <div className="flex items-center space-x-2 shrink-0">
                  {food.isEstimated ? (
                    <span className="inline-flex items-center space-x-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60">
                      <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                      <span>Estimado</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Verificado ({food.source === 'Open Food Facts' ? 'OFF' : 'USDA'})</span>
                    </span>
                  )}

                  <button
                    onClick={() => removeFood(index)}
                    className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/40 text-bark-400 hover:text-red-600 transition-colors"
                    aria-label={`Eliminar ${food.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grams & calculated macros */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-cream-200 dark:border-dark-border">
                <div className="flex items-center space-x-1.5">
                  <span className="text-bark-500 font-medium">Porción:</span>
                  <input
                    type="number"
                    min="1"
                    max="3000"
                    value={food.grams}
                    onChange={(e) => updateGrams(index, parseInt(e.target.value, 10) || 1)}
                    className="w-16 px-2 py-1 bg-cream-100 dark:bg-dark-elevated border border-cream-300 dark:border-dark-border rounded-lg font-bold text-center text-bark-900 dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-solar"
                  />
                  <span className="text-bark-600 font-bold">g</span>
                </div>

                <div className="flex items-center space-x-2 text-bark-600 dark:text-dark-muted font-medium">
                  <span className="font-bold text-bark-900 dark:text-dark-text font-display">
                    {food.calories} kcal
                  </span>
                  <span>·</span>
                  <span className="text-macro-protein">{food.protein}g P</span>
                  <span className="text-macro-carbs">{food.carbs}g C</span>
                  <span className="text-macro-fat">{food.fat}g G</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Footer */}
        <div className="p-3 bg-solar-50 dark:bg-solar/10 rounded-2xl border border-solar/40 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-bark-700 dark:text-dark-text block">
              Total a registrar ({foods.length} alimentos)
            </span>
            <span className="text-[11px] text-bark-500 dark:text-dark-muted font-medium">
              {Math.round(totalProtein)}g P · {Math.round(totalCarbs)}g C · {Math.round(totalFat)}g G
            </span>
          </div>
          <span className="font-display font-black text-xl text-bark-900 dark:text-dark-text">
            {totalCalories} <span className="text-xs font-sans font-bold">kcal</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 bg-cream-200 dark:bg-dark-surface hover:bg-cream-300 dark:hover:bg-dark-elevated rounded-xl font-bold text-bark-800 dark:text-dark-text text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={foods.length === 0}
            className="flex-1 py-3 px-4 bg-solar hover:bg-solar-600 disabled:opacity-50 rounded-xl font-display font-bold text-bark-900 text-sm shadow-sm transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Guardar en {mealType}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
