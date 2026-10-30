import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { apiGenerateRecipe } from '../../services/api';
import { Recipe, MealType } from '../../types';
import { Sparkles, Loader2, Plus, Clock, Users, Check } from 'lucide-react';

interface AiRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiRecipeModal: React.FC<AiRecipeModalProps> = ({ isOpen, onClose }) => {
  const { profile, foodEntries, saveRecipe, addFood, selectedDate } = useApp();

  const [ingredientsInput, setIngredientsInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [targetMeal, setTargetMeal] = useState<MealType>('comida');

  // Calculate remaining targets for today
  const targetCalories = profile?.dailyCalorieTarget || 2250;
  const targetProtein = profile?.dailyProteinTargetGrams || 155;
  const targetCarbs = profile?.dailyCarbsTargetGrams || 245;
  const targetFat = profile?.dailyFatTargetGrams || 70;

  const consumed = foodEntries.reduce(
    (acc, item) => {
      acc.calories += item.calories;
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fat += item.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const remainingCalories = Math.max(250, targetCalories - consumed.calories);
  const remainingProtein = Math.max(15, targetProtein - consumed.protein);
  const remainingCarbs = Math.max(15, targetCarbs - consumed.carbs);
  const remainingFat = Math.max(5, targetFat - consumed.fat);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const rec = await apiGenerateRecipe({
        remainingCalories,
        remainingMacros: {
          protein: Math.round(remainingProtein),
          carbs: Math.round(remainingCarbs),
          fat: Math.round(remainingFat),
        },
        ingredientsAvailable: ingredientsInput.trim(),
        goal: profile?.goal || 'lose',
      });
      setGeneratedRecipe(rec);
    } catch (e) {
      console.error(e);
      alert('Error al generar la receta con IA. Inténtalo de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndAdd = async () => {
    if (!generatedRecipe) return;
    // Save to recipes collection
    await saveRecipe(generatedRecipe);

    // Also add to today's diary
    await addFood({
      name: `1 ración de ${generatedRecipe.title}`,
      grams: 250,
      calories: generatedRecipe.caloriesPerPortion,
      protein: generatedRecipe.proteinPerPortion,
      carbs: generatedRecipe.carbsPerPortion,
      fat: generatedRecipe.fatPerPortion,
      source: 'Estimado por IA',
      isEstimated: true,
      mealType: targetMeal,
      date: selectedDate,
      loggedAt: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generar receta con Inteligencia Artificial" maxWidth="max-w-lg">
      <div className="space-y-4">
        {/* Remaining macros header */}
        <div className="p-3.5 bg-solar-50 dark:bg-solar/10 rounded-2xl border border-solar/40">
          <span className="text-[11px] font-bold uppercase tracking-wider text-solar-800 dark:text-solar block mb-1">
            Ajustada exactamente a tus macros restantes de hoy:
          </span>
          <div className="flex items-center justify-between text-xs font-semibold text-bark-800 dark:text-dark-text">
            <span className="font-display font-black text-base text-bark-900 dark:text-dark-text">
              {remainingCalories} kcal
            </span>
            <span>·</span>
            <span className="text-macro-protein">{Math.round(remainingProtein)}g P</span>
            <span>·</span>
            <span className="text-macro-carbs">{Math.round(remainingCarbs)}g C</span>
            <span>·</span>
            <span className="text-macro-fat">{Math.round(remainingFat)}g G</span>
          </div>
        </div>

        {/* Ingredients Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1.5">
            ¿Qué ingredientes tienes en tu nevera o despensa?
          </label>
          <textarea
            rows={3}
            value={ingredientsInput}
            onChange={(e) => setIngredientsInput(e.target.value)}
            placeholder="Ejemplo: tengo pechuga de pollo, espinacas frescas, arroz jazmín, cebolla y aceite de oliva..."
            className="w-full p-3 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-bark-900 dark:text-dark-text text-xs focus:outline-none focus:ring-2 focus:ring-solar resize-none"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3 px-4 bg-solar hover:bg-solar-600 disabled:opacity-50 active:scale-[0.99] rounded-2xl font-display font-bold text-bark-900 text-sm shadow-floating flex items-center justify-center space-x-2 transition-all"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Diseñando receta a tu medida...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generar receta perfecta con IA</span>
            </>
          )}
        </button>

        {/* Generated recipe result preview */}
        {generatedRecipe && (
          <div className="p-4 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl shadow-card space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-lg text-bark-900 dark:text-dark-text">
                {generatedRecipe.title}
              </h4>
              <div className="flex items-center space-x-2 text-xs font-semibold text-bark-500">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-solar-700" />
                  <span>{generatedRecipe.prepTimeMinutes} min</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-bark-600 dark:text-dark-muted leading-relaxed">
              {generatedRecipe.description}
            </p>

            {/* Macros pill banner */}
            <div className="grid grid-cols-4 gap-2 text-center p-2.5 bg-cream-100 dark:bg-dark-elevated rounded-xl text-xs font-semibold">
              <div>
                <span className="text-bark-500 block text-[10px]">Calorías</span>
                <span className="font-bold text-bark-900 dark:text-dark-text font-display">
                  {generatedRecipe.caloriesPerPortion} kcal
                </span>
              </div>
              <div>
                <span className="text-macro-protein block text-[10px]">Proteínas</span>
                <span className="font-bold text-macro-protein">
                  {Math.round(generatedRecipe.proteinPerPortion)}g
                </span>
              </div>
              <div>
                <span className="text-macro-carbs block text-[10px]">Carbos</span>
                <span className="font-bold text-macro-carbs">
                  {Math.round(generatedRecipe.carbsPerPortion)}g
                </span>
              </div>
              <div>
                <span className="text-macro-fat block text-[10px]">Grasas</span>
                <span className="font-bold text-macro-fat">
                  {Math.round(generatedRecipe.fatPerPortion)}g
                </span>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <span className="text-xs font-bold text-bark-700 block mb-1">Ingredientes:</span>
              <ul className="text-xs text-bark-600 dark:text-dark-muted space-y-1">
                {generatedRecipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{ing.name}</span>
                    <span className="font-bold">{ing.grams}g</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div>
              <span className="text-xs font-bold text-bark-700 block mb-1">Instrucciones:</span>
              <ol className="text-xs text-bark-600 dark:text-dark-muted space-y-1 list-decimal list-inside leading-relaxed">
                {generatedRecipe.steps.map((st, i) => (
                  <li key={i}>{st}</li>
                ))}
              </ol>
            </div>

            {/* Meal Choice & Save Button */}
            <div className="pt-2 border-t border-cream-200 dark:border-dark-border flex items-center space-x-2">
              <select
                value={targetMeal}
                onChange={(e) => setTargetMeal(e.target.value as MealType)}
                className="py-2.5 px-3 bg-cream-100 dark:bg-dark-elevated border border-cream-300 rounded-xl text-xs font-bold capitalize"
              >
                <option value="desayuno">Desayuno</option>
                <option value="comida">Comida</option>
                <option value="merienda">Merienda</option>
                <option value="cena">Cena</option>
                <option value="snacks">Snacks</option>
              </select>

              <button
                onClick={handleSaveAndAdd}
                className="flex-1 py-2.5 px-4 bg-solar hover:bg-solar-600 rounded-xl font-display font-bold text-bark-900 text-xs shadow-sm flex items-center justify-center space-x-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Guardar y añadir a {targetMeal}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
