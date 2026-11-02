import React, { useState } from 'react';
import { DayNavigator } from '../components/today/DayNavigator';
import { CalorieRing } from '../components/today/CalorieRing';
import { WaterTracker } from '../components/common/WaterTracker';
import { StepsCard } from '../components/steps/StepsCard';
import { MealSection } from '../components/today/MealSection';
import { MealPlanModal } from '../components/mealPlan/MealPlanModal';
import { Sparkles, ShoppingBag } from 'lucide-react';

export const TodayPage: React.FC = () => {
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planModalTab, setPlanModalTab] = useState<'plan' | 'grocery'>('plan');

  return (
    <div className="w-full max-w-full space-y-4 animate-in fade-in duration-200 overflow-x-hidden">
      {/* Day Navigator */}
      <DayNavigator />

      {/* Main Calorie Ring & Macro Bars */}
      <CalorieRing />

      {/* Quick Meal Plan & Grocery Access (< 2 taps) */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => {
            setPlanModalTab('plan');
            setIsPlanModalOpen(true);
          }}
          className="flex-1 p-3 bg-gradient-to-r from-solar-100 to-solar-50 dark:from-solar/20 dark:to-dark-surface border border-solar/40 rounded-2xl flex items-center justify-between text-left hover:border-solar transition-colors shadow-2xs group"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-solar flex items-center justify-center text-bark-900 shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-display font-bold text-xs text-bark-900 dark:text-dark-text leading-tight">
                Plan de Comidas Diario
              </h4>
              <p className="text-[10px] text-bark-500 dark:text-dark-muted">
                Genera tu menú adaptado con IA
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-solar-800 dark:text-solar">Ver</span>
        </button>

        <button
          onClick={() => {
            setPlanModalTab('grocery');
            setIsPlanModalOpen(true);
          }}
          className="p-3 bg-white dark:bg-dark-surface border border-cream-200 dark:border-dark-border rounded-2xl flex items-center space-x-2 text-bark-700 dark:text-dark-muted hover:border-solar transition-colors shadow-2xs"
          title="Ver lista de la compra"
        >
          <ShoppingBag className="w-4 h-4 text-solar-700" />
          <span className="text-xs font-bold">Compra</span>
        </button>
      </div>

      {/* Water Tracker */}
      <WaterTracker />

      {/* Step Counter Tracker (Samsung Health, Apple Health & Health Connect) */}
      <StepsCard />

      {/* Meals Journal */}
      <div className="space-y-3 pt-2">
        <h3 className="font-display font-bold text-lg text-bark-900 dark:text-dark-text px-1">
          Diario de Comidas
        </h3>

        <MealSection mealType="desayuno" title="Desayuno" />
        <MealSection mealType="comida" title="Comida" />
        <MealSection mealType="merienda" title="Merienda" />
        <MealSection mealType="cena" title="Cena" />
        <MealSection mealType="snacks" title="Snacks" />
      </div>

      {/* Meal Plan & Grocery Modal */}
      <MealPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        defaultTab={planModalTab}
      />
    </div>
  );
};
