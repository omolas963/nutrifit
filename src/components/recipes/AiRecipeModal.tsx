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

  // A single recipe meal should target ~420-620 kcal (not the whole day's 2000+ kcal)
  const targetMealCalories = Math.round(
    remainingCalories > 750
      ? Math.min(620, Math.max(420, targetCalories * 0.28))
      : Math.min(650, remainingCalories)
  );

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const rec = await apiGenerateRecipe({
        caloriesTarget: targetMealCalories,
        remainingCalories: targetMealCalories,
        remainingMacros: {
          protein: Math.round(Math.min(45, Math.max(20, remainingProtein * 0.3))),
          carbs: Math.round(Math.min(70, Math.max(25, remainingCarbs * 0.3))),
          fat: Math.round(Math.min(25, Math.max(10, remainingFat * 0.3))),
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
        <div className="p-3.5 bg-solar-50 dark:bg-solar/10 rounded-2xl border border-solar/40 space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[11px] font-bold uppercase tracking-wider text-solar-800 dark:text-solar">
              Objetivo para este plato:
            </span>
            <span className="font-display font-black text-sm text-bark-900 dark:text-dark-text">
              ~{targetMealCalories} kcal (1 ración)
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-bark-600 dark:text-dark-muted">
            <span>Calorías restantes en tu día: <strong>{remainingCalories} kcal</strong></span>
            <span>·</span>
            <span>{Math.round(remainingProtein)}g P restantes</span>
          </div>
        </div>

        {/* Ingredients Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1.5">
            ¿Qué alimentos tienes ahora mismo?
          </label>
          <textarea
            rows={3}
            value={ingredientsInput}
            onChange={(e) => setIngredientsInput(e.target.value)}
            placeholder="Escribe los ingredientes que tienes (ej: atún y tomate / 2 huevos y patatas / pollo y arroz / manzana y yogur)..."
            className="w-full p-3 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-bark-900 dark:text-dark-text text-xs focus:outline-none focus:ring-2 focus:ring-solar resize-none"
          />
          <p className="text-[11px] text-bark-500 dark:text-dark-muted mt-1">
            * La IA creará una receta sabrosa usando estrictamente lo que tienes, adaptada a tus macros.
          </p>
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

            {/* Macros banner: clearly displaying THIS RECIPE's calories and macros */}
            <div className="p-3 bg-cream-100 dark:bg-dark-elevated rounded-2xl border border-cream-200 dark:border-dark-border/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-bark-800 dark:text-dark-text uppercase tracking-wider text-[11px]">
                  Nutrición de este plato (1 ración):
                </span>
                <span className="text-[11px] font-semibold text-bark-600 dark:text-dark-muted">
                  {Math.round(((generatedRecipe.caloriesPerPortion || 0) / (targetCalories || 2000)) * 100)}% de tu día
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-white dark:bg-dark-surface rounded-xl border border-cream-200 dark:border-dark-border">
                  <span className="text-bark-500 dark:text-dark-muted block text-[10px] font-semibold uppercase">Calorías</span>
                  <span className="font-bold text-bark-900 dark:text-dark-text font-display text-base">
                    {generatedRecipe.caloriesPerPortion} kcal
                  </span>
                </div>
                <div className="p-2 bg-white dark:bg-dark-surface rounded-xl border border-cream-200 dark:border-dark-border">
                  <span className="text-macro-protein block text-[10px] font-semibold uppercase">Proteína</span>
                  <span className="font-bold text-macro-protein text-sm">
                    {Math.round(generatedRecipe.proteinPerPortion)}g
                  </span>
                </div>
                <div className="p-2 bg-white dark:bg-dark-surface rounded-xl border border-cream-200 dark:border-dark-border">
                  <span className="text-macro-carbs block text-[10px] font-semibold uppercase">Carbos</span>
                  <span className="font-bold text-macro-carbs text-sm">
                    {Math.round(generatedRecipe.carbsPerPortion)}g
                  </span>
                </div>
                <div className="p-2 bg-white dark:bg-dark-surface rounded-xl border border-cream-200 dark:border-dark-border">
                  <span className="text-macro-fat block text-[10px] font-semibold uppercase">Grasas</span>
                  <span className="font-bold text-macro-fat text-sm">
                    {Math.round(generatedRecipe.fatPerPortion)}g
                  </span>
                </div>
              </div>
            </div>

            {/* Ingredients with full individual nutritional breakdown */}
            <div>
              <span className="text-xs font-bold text-bark-700 dark:text-dark-text block mb-1.5 uppercase tracking-wider text-[11px]">
                Desglose de ingredientes utilizados:
              </span>
              <ul className="text-xs divide-y divide-cream-200 dark:divide-dark-border/40 bg-white dark:bg-dark-surface rounded-xl border border-cream-200 dark:border-dark-border p-2 space-y-1">
                {generatedRecipe.ingredients.map((ing, i) => (
                  <li key={i} className="py-1.5 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-bark-900 dark:text-dark-text">{ing.name}</span>
                      <span className="font-bold text-bark-900 dark:text-dark-text">{ing.grams}g</span>
                    </div>
                    {(ing.calories !== undefined || ing.protein !== undefined) && (
                      <div className="flex items-center space-x-2 text-[11px] text-bark-500 dark:text-dark-muted mt-0.5">
                        <span className="font-bold text-bark-800 dark:text-dark-text">{ing.calories || 0} kcal</span>
                        <span>·</span>
                        <span className="text-macro-protein">{ing.protein || 0}g P</span>
                        <span>·</span>
                        <span className="text-macro-carbs">{ing.carbs || 0}g C</span>
                        <span>·</span>
                        <span className="text-macro-fat">{ing.fat || 0}g G</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggested Pantry Items (if available) */}
            {generatedRecipe.suggestedPantryItems && generatedRecipe.suggestedPantryItems.length > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center space-x-1">
                  <span>💡 Básicos o condimentos recomendados (si los tienes):</span>
                </span>
                <ul className="text-xs text-amber-900 dark:text-amber-200/90 space-y-0.5 list-disc list-inside">
                  {generatedRecipe.suggestedPantryItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

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
