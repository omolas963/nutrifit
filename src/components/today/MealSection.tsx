import React, { useState } from 'react';
import { MealType, FoodEntry } from '../../types';
import { FoodItemRow } from './FoodItemRow';
import { EditFoodModal } from './EditFoodModal';
import { useApp } from '../../context/AppContext';
import { Plus, Sun, Utensils, Coffee, Moon, Cookie } from 'lucide-react';

interface MealSectionProps {
  mealType: MealType;
  title: string;
}

export const MealSection: React.FC<MealSectionProps> = ({ mealType, title }) => {
  const { foodEntries, deleteFood, setIsAddModalOpen, setPreselectedMealForAdd } = useApp();
  const [editingFood, setEditingFood] = useState<FoodEntry | null>(null);

  // Filter foods for this meal
  const items = foodEntries.filter((f) => f.mealType === mealType);

  const totalCalories = items.reduce((acc, f) => acc + f.calories, 0);
  const totalProtein = items.reduce((acc, f) => acc + f.protein, 0);
  const totalCarbs = items.reduce((acc, f) => acc + f.carbs, 0);
  const totalFat = items.reduce((acc, f) => acc + f.fat, 0);

  const getMealIcon = () => {
    switch (mealType) {
      case 'desayuno':
        return <Coffee className="w-4 h-4 text-solar-700 dark:text-solar" />;
      case 'comida':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'merienda':
        return <Utensils className="w-4 h-4 text-macro-fat" />;
      case 'cena':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'snacks':
        return <Cookie className="w-4 h-4 text-amber-600" />;
    }
  };

  const handleAddClick = () => {
    setPreselectedMealForAdd(mealType);
    setIsAddModalOpen(true);
  };

  return (
    <div className="bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-4 shadow-card mb-4 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-xl bg-cream-200 dark:bg-dark-surface flex items-center justify-center shrink-0">
            {getMealIcon()}
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text leading-tight">
              {title}
            </h4>
            {items.length > 0 && (
              <span className="text-[11px] text-bark-500 dark:text-dark-muted font-medium">
                {Math.round(totalProtein)}g P · {Math.round(totalCarbs)}g C · {Math.round(totalFat)}g G
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="font-display font-black text-base text-bark-900 dark:text-dark-text">
              {totalCalories}
            </span>
            <span className="text-xs text-bark-500 dark:text-dark-muted ml-0.5">kcal</span>
          </div>

          <button
            onClick={handleAddClick}
            className="w-8 h-8 rounded-full bg-cream-200 hover:bg-solar/30 dark:bg-dark-surface dark:hover:bg-dark-elevated text-bark-800 dark:text-dark-text flex items-center justify-center transition-colors"
            aria-label={`Añadir alimento a ${title}`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* List of foods */}
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((food) => (
            <FoodItemRow
              key={food.id}
              food={food}
              onEdit={(f) => setEditingFood(f)}
              onDelete={(id) => deleteFood(id)}
            />
          ))}
        </div>
      ) : (
        <div
          onClick={handleAddClick}
          className="py-3 px-4 rounded-2xl border border-dashed border-cream-300 dark:border-dark-border/80 text-center cursor-pointer hover:bg-cream-100/50 dark:hover:bg-dark-surface/50 transition-colors"
        >
          <span className="text-xs text-bark-500 dark:text-dark-muted font-medium">
            + Añadir alimentos al {title.toLowerCase()}
          </span>
        </div>
      )}

      {/* Edit modal */}
      <EditFoodModal
        food={editingFood}
        isOpen={Boolean(editingFood)}
        onClose={() => setEditingFood(null)}
      />
    </div>
  );
};
