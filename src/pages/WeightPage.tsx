import React, { useState } from 'react';
import { WeightSummaryCard } from '../components/weight/WeightSummaryCard';
import { WeightChart } from '../components/progress/WeightChart';
import { GoalTipsCard } from '../components/weight/GoalTipsCard';
import { LogWeightModal } from '../components/weight/LogWeightModal';
import { MealPlanModal } from '../components/mealPlan/MealPlanModal';
import { Sparkles } from 'lucide-react';

export const WeightPage: React.FC = () => {
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Weight Summary & Goal Target Card */}
      <WeightSummaryCard onOpenLogModal={() => setIsLogOpen(true)} />

      {/* Quick Meal Plan Trigger for this Goal (< 2 taps) */}
      <div className="p-4 bg-solar-50 dark:bg-solar/10 border border-solar/40 rounded-3xl flex items-center justify-between shadow-2xs">
        <div>
          <h4 className="font-display font-bold text-sm text-bark-900 dark:text-dark-text">
            Plan diario para tu objetivo
          </h4>
          <p className="text-xs text-bark-600 dark:text-dark-muted mt-0.5">
            Genera un menú mediterráneo con las calorías exactas recomendadas.
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

      {/* Weight History Chart */}
      <WeightChart />

      {/* Science-based Goal Tips */}
      <GoalTipsCard />

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
