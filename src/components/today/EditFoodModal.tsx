import React, { useState } from 'react';
import { FoodEntry } from '../../types';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';

interface EditFoodModalProps {
  food: FoodEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditFoodModal: React.FC<EditFoodModalProps> = ({ food, isOpen, onClose }) => {
  const { updateFood } = useApp();
  const [grams, setGrams] = useState<number>(food?.grams || 100);

  // Sync state when food prop changes
  React.useEffect(() => {
    if (food) {
      setGrams(food.grams);
    }
  }, [food]);

  if (!food) return null;

  // Calculate proportional nutrition values
  const ratio = food.grams > 0 ? grams / food.grams : 1;
  const newCalories = Math.round(food.calories * ratio);
  const newProtein = Number((food.protein * ratio).toFixed(1));
  const newCarbs = Number((food.carbs * ratio).toFixed(1));
  const newFat = Number((food.fat * ratio).toFixed(1));

  const handleSave = async () => {
    await updateFood({
      ...food,
      grams,
      calories: newCalories,
      protein: newProtein,
      carbs: newCarbs,
      fat: newFat,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modificar cantidad" maxWidth="max-w-md">
      <div className="space-y-4">
        <div>
          <h4 className="font-display font-bold text-lg text-bark-900 dark:text-dark-text">
            {food.name}
          </h4>
          <span className="text-xs text-bark-500 dark:text-dark-muted capitalize">
            {food.mealType} · Fuente: {food.source}
          </span>
        </div>

        {/* Input grams */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1.5">
            Gramos o porción
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="5000"
              value={grams}
              onChange={(e) => setGrams(Math.max(1, parseInt(e.target.value, 10) || 0))}
              className="w-full px-4 py-3 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl text-bark-900 dark:text-dark-text font-display font-bold text-2xl focus:outline-none focus:ring-2 focus:ring-solar"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-display font-bold text-lg text-bark-500">
              g
            </span>
          </div>
        </div>

        {/* Live calculated macros */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-cream-200/50 dark:bg-dark-surface rounded-2xl border border-cream-300 dark:border-dark-border text-center">
          <div>
            <span className="text-[10px] font-bold text-bark-500 uppercase block">Kcal</span>
            <span className="font-display font-extrabold text-base text-bark-900 dark:text-dark-text">
              {newCalories}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-macro-protein uppercase block">Proteína</span>
            <span className="font-display font-extrabold text-base text-bark-900 dark:text-dark-text">
              {newProtein}g
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-macro-carbs uppercase block">Carbos</span>
            <span className="font-display font-extrabold text-base text-bark-900 dark:text-dark-text">
              {newCarbs}g
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-macro-fat uppercase block">Grasas</span>
            <span className="font-display font-extrabold text-base text-bark-900 dark:text-dark-text">
              {newFat}g
            </span>
          </div>
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
            onClick={handleSave}
            className="flex-1 py-3 px-4 bg-solar hover:bg-solar-600 rounded-xl font-display font-bold text-bark-900 text-sm shadow-sm transition-colors"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </Modal>
  );
};
