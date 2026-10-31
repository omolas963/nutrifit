import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MealPlanCard } from './MealPlanCard';
import { GroceryListView } from './GroceryListView';
import { apiGenerateMealPlan } from '../../services/api';
import { MealType } from '../../types';
import {
  Calendar,
  ShoppingBag,
  Sparkles,
  Loader2,
  Check,
  X,
  Plus,
  ShieldAlert
} from 'lucide-react';

interface MealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'plan' | 'grocery';
}

export const MealPlanModal: React.FC<MealPlanModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'plan',
}) => {
  const { mealPlan, saveMealPlan, profile, addFood, selectedDate, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'plan' | 'grocery'>(defaultTab);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAllAdded, setIsAllAdded] = useState(false);

  if (!isOpen) return null;

  // SAFETY MINIMUM THRESHOLD:
  // Minimum 1200 kcal for women, 1500 kcal for men
  const isFemale = profile?.gender === 'female';
  const minSafeCalories = isFemale ? 1200 : 1500;
  const userTarget = profile?.dailyCalorieTarget || 2000;
  const safeCalories = Math.max(minSafeCalories, userTarget);

  const handleGenerateNewPlan = async () => {
    setIsGenerating(true);
    try {
      const plan = await apiGenerateMealPlan({
        targetCalories: safeCalories,
        targetMacros: {
          protein: profile?.dailyProteinTargetGrams || 140,
          carbs: profile?.dailyCarbsTargetGrams || 220,
          fat: profile?.dailyFatTargetGrams || 65,
        },
        goal: profile?.goal || 'lose',
      });
      await saveMealPlan(plan);
      showToast('Plan de comidas generado con éxito', 'success');
    } catch (e) {
      console.error(e);
      showToast('Error al generar el plan de comidas con IA', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddEntireDay = async () => {
    if (!mealPlan) return;
    for (const meal of mealPlan.meals) {
      for (const food of meal.foods) {
        await addFood({
          name: food.name,
          grams: food.grams,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          source: 'Estimado por IA',
          isEstimated: true,
          mealType: meal.type as MealType,
          date: selectedDate,
          loggedAt: new Date().toISOString(),
        });
      }
    }
    setIsAllAdded(true);
    showToast('Todas las comidas añadidas a tu diario de hoy', 'success');
    setTimeout(() => setIsAllAdded(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bark-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-cream-100 dark:bg-dark-card border border-cream-300 dark:border-dark-border rounded-3xl p-5 max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream-200 dark:border-dark-border pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-solar flex items-center justify-center text-bark-900 shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-bark-900 dark:text-dark-text leading-tight">
                Plan de Comidas y Lista de la Compra
              </h3>
              <p className="text-[11px] text-bark-500 dark:text-dark-muted">
                Objetivo calórico seguro: {safeCalories} kcal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-bark-400 hover:text-bark-900 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex bg-cream-200 dark:bg-dark-surface p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'plan'
                ? 'bg-white dark:bg-dark-card text-bark-900 dark:text-solar shadow-xs'
                : 'text-bark-600 dark:text-dark-muted'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Plan Diario</span>
          </button>

          <button
            onClick={() => setActiveTab('grocery')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'grocery'
                ? 'bg-white dark:bg-dark-card text-bark-900 dark:text-solar shadow-xs'
                : 'text-bark-600 dark:text-dark-muted'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Lista de la Compra</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {activeTab === 'plan' ? (
            <div className="space-y-3">
              {mealPlan ? (
                <>
                  <div className="flex items-center justify-between bg-white dark:bg-dark-surface p-3 rounded-2xl border border-cream-200 dark:border-dark-border shadow-xs">
                    <div>
                      <p className="text-xs font-bold text-bark-900 dark:text-dark-text">
                        {mealPlan.summary}
                      </p>
                      <p className="text-[10px] text-bark-500">
                        {mealPlan.meals.length} comidas planificadas
                      </p>
                    </div>

                    <button
                      onClick={handleAddEntireDay}
                      disabled={isAllAdded}
                      className={`py-2 px-3 rounded-xl font-display font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-transform active:scale-95 ${
                        isAllAdded
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-solar hover:bg-solar-600 text-bark-900'
                      }`}
                    >
                      {isAllAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>¡Añadido!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Añadir todo a hoy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {mealPlan.meals.map((meal, index) => (
                      <MealPlanCard key={index} item={meal} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-6 text-center bg-white dark:bg-dark-surface border border-cream-200 dark:border-dark-border rounded-2xl space-y-2">
                  <Sparkles className="w-8 h-8 text-solar mx-auto" />
                  <h4 className="font-display font-bold text-sm text-bark-900 dark:text-dark-text">
                    Aún no tienes un plan generado
                  </h4>
                  <p className="text-xs text-bark-500 max-w-xs mx-auto">
                    Genera un plan con recetas mediterráneas ajustadas a tus {safeCalories} kcal diarias.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {mealPlan?.groceryList ? (
                <GroceryListView categories={mealPlan.groceryList} />
              ) : (
                <div className="p-6 text-center bg-white dark:bg-dark-surface border border-cream-200 dark:border-dark-border rounded-2xl space-y-2">
                  <ShoppingBag className="w-8 h-8 text-bark-400 mx-auto" />
                  <p className="text-xs text-bark-500">
                    Genera primero un plan para que la lista de la compra se cree automáticamente con las cantidades exactas.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-2 border-t border-cream-200 dark:border-dark-border flex items-center justify-between">
          <div className="flex items-center space-x-1 text-[11px] text-bark-500">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mínimo seguro garantizado (≥{minSafeCalories} kcal)</span>
          </div>

          <button
            onClick={handleGenerateNewPlan}
            disabled={isGenerating}
            className="py-2.5 px-4 bg-solar hover:bg-solar-600 text-bark-900 rounded-xl font-display font-bold text-xs flex items-center space-x-1.5 shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{mealPlan ? 'Regenerar plan con IA' : 'Generar plan diario'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
