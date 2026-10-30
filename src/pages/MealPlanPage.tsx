import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MealPlanCard } from '../components/mealPlan/MealPlanCard';
import { GroceryListView } from '../components/mealPlan/GroceryListView';
import { apiGenerateMealPlan } from '../services/api';
import { Calendar, ShoppingBag, Sparkles, Loader2, Plus, Check } from 'lucide-react';
import { MealType, MealPlanItem } from '../types';

export const MealPlanPage: React.FC = () => {
  const { mealPlan, saveMealPlan, profile, addFood, selectedDate, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'plan' | 'grocery'>('plan');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAllAdded, setIsAllAdded] = useState(false);

  const handleGenerateNewPlan = async () => {
    setIsGenerating(true);
    try {
      const plan = await apiGenerateMealPlan({
        targetCalories: profile?.dailyCalorieTarget || 2250,
        targetMacros: {
          protein: profile?.dailyProteinTargetGrams || 155,
          carbs: profile?.dailyCarbsTargetGrams || 245,
          fat: profile?.dailyFatTargetGrams || 70,
        },
        goal: profile?.goal || 'lose',
      });
      await saveMealPlan(plan);
    } catch (e) {
      console.error(e);
      alert('Error al generar el plan de comidas con IA. Inténtalo de nuevo.');
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
    showToast('Todas las comidas del plan añadidas a tu diario de hoy', 'success');
    setTimeout(() => setIsAllAdded(false), 3000);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Switcher Tab Pill Bar */}
      <div className="flex bg-cream-200 dark:bg-dark-surface p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('plan')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'plan'
              ? 'bg-white dark:bg-dark-card text-bark-900 dark:text-solar shadow-sm'
              : 'text-bark-600 dark:text-dark-muted'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Plan Diario de Comidas</span>
        </button>

        <button
          onClick={() => setActiveTab('grocery')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'grocery'
              ? 'bg-white dark:bg-dark-card text-bark-900 dark:text-solar shadow-sm'
              : 'text-bark-600 dark:text-dark-muted'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Lista de la Compra</span>
        </button>
      </div>

      {activeTab === 'plan' ? (
        <div className="space-y-4">
          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-solar-50 to-cream-200/80 dark:from-dark-card dark:to-dark-surface border border-solar/40 dark:border-dark-border rounded-3xl p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-solar-800 dark:text-solar">
                Plan Nutricional Diario
              </span>
              <span className="font-display font-bold text-sm text-bark-800 dark:text-dark-text">
                {profile?.dailyCalorieTarget || 2250} kcal / día
              </span>
            </div>

            <p className="text-xs text-bark-600 dark:text-dark-muted leading-relaxed">
              {mealPlan?.summary ||
                'Plan diario equilibrado y estructurado para cubrir tus macronutrientes de forma deliciosa y sostenible.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={handleGenerateNewPlan}
                disabled={isGenerating}
                className="flex-1 py-3 px-4 bg-solar hover:bg-solar-600 disabled:opacity-50 active:scale-[0.99] rounded-2xl font-display font-bold text-bark-900 text-xs shadow-floating flex items-center justify-center space-x-2 transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generando nuevo menú con IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generar nuevo plan con IA</span>
                  </>
                )}
              </button>

              <button
                onClick={handleAddEntireDay}
                disabled={isAllAdded || !mealPlan}
                className={`py-3 px-4 rounded-2xl font-display font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                  isAllAdded
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white dark:bg-dark-elevated text-bark-900 dark:text-dark-text border border-cream-300 dark:border-dark-border hover:bg-cream-100'
                }`}
              >
                {isAllAdded ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>¡Añadido a hoy!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Añadir todo el día al diario</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Meals list */}
          <div className="space-y-3">
            {mealPlan?.meals.map((item: MealPlanItem, idx: number) => (
              <MealPlanCard key={idx} item={item} />
            ))}
          </div>
        </div>
      ) : (
        /* Grocery List Tab */
        <GroceryListView
          categories={mealPlan?.groceryList || []}
          onUpdateCategories={(newCats) => {
            if (mealPlan) {
              saveMealPlan({ ...mealPlan, groceryList: newCats });
            }
          }}
        />
      )}
    </div>
  );
};
