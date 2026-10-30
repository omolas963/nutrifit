import React, { useState } from 'react';
import { Recipe, MealType } from '../../types';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Clock, Users, Plus, Check } from 'lucide-react';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ recipe, isOpen, onClose }) => {
  const { addFood, selectedDate } = useApp();
  const [targetMeal, setTargetMeal] = useState<MealType>('comida');
  const [portionsToAdd, setPortionsToAdd] = useState(1);

  if (!recipe) return null;

  const handleAddToDiary = async () => {
    await addFood({
      name: `${portionsToAdd} ración de ${recipe.title}`,
      grams: Math.round(250 * portionsToAdd),
      calories: Math.round(recipe.caloriesPerPortion * portionsToAdd),
      protein: Number((recipe.proteinPerPortion * portionsToAdd).toFixed(1)),
      carbs: Number((recipe.carbsPerPortion * portionsToAdd).toFixed(1)),
      fat: Number((recipe.fatPerPortion * portionsToAdd).toFixed(1)),
      source: 'Manual',
      isEstimated: false,
      mealType: targetMeal,
      date: selectedDate,
      loggedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle de la receta" maxWidth="max-w-lg">
      <div className="space-y-5">
        <div>
          <h3 className="font-display font-extrabold text-2xl text-bark-900 dark:text-dark-text leading-tight">
            {recipe.title}
          </h3>
          <p className="text-xs text-bark-600 dark:text-dark-muted mt-1 leading-relaxed">
            {recipe.description}
          </p>

          <div className="flex items-center space-x-3 mt-3 text-xs font-semibold text-bark-600 dark:text-dark-muted">
            <span className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-solar-700 dark:text-solar" />
              <span>{recipe.prepTimeMinutes} minutos</span>
            </span>
            <span>·</span>
            <span className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{recipe.portions} {recipe.portions === 1 ? 'ración total' : 'raciones totales'}</span>
            </span>
          </div>
        </div>

        {/* Nutritional values per portion */}
        <div className="p-4 bg-solar-50 dark:bg-solar/10 rounded-2xl border border-solar/40">
          <span className="text-[11px] font-bold uppercase tracking-wider text-solar-800 dark:text-solar block mb-1">
            Por ración:
          </span>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <span className="font-display font-black text-xl text-bark-900 dark:text-dark-text">
                {recipe.caloriesPerPortion}
              </span>
              <span className="text-[10px] text-bark-500 block">kcal</span>
            </div>
            <div>
              <span className="font-display font-bold text-xl text-macro-protein">
                {Math.round(recipe.proteinPerPortion)}g
              </span>
              <span className="text-[10px] text-bark-500 block">Proteína</span>
            </div>
            <div>
              <span className="font-display font-bold text-xl text-macro-carbs">
                {Math.round(recipe.carbsPerPortion)}g
              </span>
              <span className="text-[10px] text-bark-500 block">Carbos</span>
            </div>
            <div>
              <span className="font-display font-bold text-xl text-macro-fat">
                {Math.round(recipe.fatPerPortion)}g
              </span>
              <span className="text-[10px] text-bark-500 block">Grasas</span>
            </div>
          </div>
        </div>

        {/* Ingredients list */}
        <div>
          <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text mb-2">
            Ingredientes ({recipe.ingredients.length})
          </h4>
          <div className="space-y-1.5">
            {recipe.ingredients.map((ing, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-cream-100 dark:bg-dark-surface text-xs"
              >
                <span className="font-medium text-bark-800 dark:text-dark-text">{ing.name}</span>
                <span className="font-bold text-bark-600 dark:text-dark-muted">{ing.grams}g</span>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        {recipe.steps.length > 0 && (
          <div>
            <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text mb-2">
              Paso a paso
            </h4>
            <ol className="space-y-2 text-xs text-bark-700 dark:text-dark-muted leading-relaxed">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-cream-200 dark:bg-dark-surface text-bark-800 dark:text-dark-text font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                    {i + 1}
                  </span>
                  <span className="flex-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Add to diary section */}
        <div className="pt-3 border-t border-cream-200 dark:border-dark-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-bark-700 dark:text-dark-text">
              Añadir al diario de hoy en:
            </span>
            <select
              value={targetMeal}
              onChange={(e) => setTargetMeal(e.target.value as MealType)}
              className="py-1 px-3 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-xs font-bold capitalize focus:outline-none"
            >
              <option value="desayuno">Desayuno</option>
              <option value="comida">Comida</option>
              <option value="merienda">Merienda</option>
              <option value="cena">Cena</option>
              <option value="snacks">Snacks</option>
            </select>
          </div>

          <button
            onClick={handleAddToDiary}
            className="w-full py-3.5 px-4 bg-solar hover:bg-solar-600 rounded-2xl font-display font-bold text-bark-900 text-sm shadow-floating flex items-center justify-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Añadir ración al diario ({targetMeal})</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
