import React, { useState } from 'react';
import { StreakCard } from '../components/progress/StreakCard';
import { StepsProgressSection } from '../components/steps/StepsProgressSection';
import { CalorieMacroChart } from '../components/progress/CalorieMacroChart';
import { WeightChart } from '../components/progress/WeightChart';
import { WeightSummaryCard } from '../components/weight/WeightSummaryCard';
import { GoalTipsCard } from '../components/weight/GoalTipsCard';
import { LogWeightModal } from '../components/weight/LogWeightModal';
import { MealPlanModal } from '../components/mealPlan/MealPlanModal';
import { TrendingUp, Target, Sparkles } from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'charts' | 'goal'>('charts');
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Segmented Tab Switcher */}
      <div className="flex bg-cream-200 dark:bg-dark-surface p-1 rounded-2xl shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('charts')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'charts'
              ? 'bg-white dark:bg-dark-card text-bark-900 dark:text-solar shadow-sm'
              : 'text-bark-600 dark:text-dark-muted hover:text-bark-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Evolución y Gráficas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('goal')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'goal'
              ? 'bg-white dark:bg-dark-card text-bark-900 dark:text-solar shadow-sm'
              : 'text-bark-600 dark:text-dark-muted hover:text-bark-900'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Mi Objetivo de Peso</span>
        </button>
      </div>

      {activeTab === 'charts' ? (
        <>
          {/* Streak Counter Card */}
          <StreakCard />

          {/* Steps History & Progress (7 & 30 days) */}
          <StepsProgressSection />

          {/* Calories & Macros History (7 & 30 days) */}
          <CalorieMacroChart />

          {/* Weight History Line Chart */}
          <WeightChart />
        </>
      ) : (
        <>
          {/* Weight Summary & Goal Target Card */}
          <WeightSummaryCard onOpenLogModal={() => setIsLogOpen(true)} />

          {/* Quick Meal Plan Trigger */}
          <div className="p-4 bg-solar-50 dark:bg-solar/10 border border-solar/40 rounded-3xl flex items-center justify-between shadow-2xs">
            <div>
              <h4 className="font-display font-bold text-sm text-bark-900 dark:text-dark-text">
                Plan diario para tu objetivo
              </h4>
              <p className="text-xs text-bark-600 dark:text-dark-muted mt-0.5">
                Genera tu menú adaptado con las calorías recomendadas.
              </p>
            </div>
            <button
              onClick={() => setIsPlanOpen(true)}
              className="py-2 px-3.5 bg-solar hover:bg-solar-600 active:scale-95 text-bark-900 rounded-xl font-display font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-transform shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ver plan</span>
            </button>
          </div>

          {/* Weight History Line Chart */}
          <WeightChart />

          {/* Science-based Goal Tips */}
          <GoalTipsCard />
        </>
      )}

      {/* Log Weight Modal */}
      <LogWeightModal
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
      />

      {/* Meal Plan Modal */}
      <MealPlanModal
        isOpen={isPlanOpen}
        onClose={() => setIsPlanOpen(false)}
      />
    </div>
  );
};
