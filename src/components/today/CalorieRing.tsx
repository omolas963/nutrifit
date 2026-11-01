import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CircularProgress } from '../common/CircularProgress';
import { MacroBar } from '../common/MacroBar';
import { stepsService, StepsState } from '../../services/stepsService';
import { Flame } from 'lucide-react';

export const CalorieRing: React.FC = () => {
  const { profile, foodEntries, selectedDate } = useApp();
  const [stepsState, setStepsState] = useState<StepsState>(stepsService.getState());

  useEffect(() => {
    return stepsService.subscribe((s) => setStepsState(s));
  }, []);

  const baseCalorieTarget = profile?.dailyCalorieTarget || 2250;
  const proteinTarget = profile?.dailyProteinTargetGrams || 155;
  const carbsTarget = profile?.dailyCarbsTargetGrams || 245;
  const fatTarget = profile?.dailyFatTargetGrams || 70;

  // Step calories if user opted in
  const todayIso = new Date().toISOString().split('T')[0];
  const dateKey = selectedDate || todayIso;
  const currentStepData = stepsState.history[dateKey];
  const stepCalories = currentStepData?.calories || (dateKey === todayIso ? stepsState.todayCalories : 0);

  const effectiveCalorieTarget = stepsState.includeCaloriesInDailyGoal && stepCalories > 0
    ? baseCalorieTarget + stepCalories
    : baseCalorieTarget;

  // Aggregate today's food entries
  const totals = foodEntries.reduce(
    (acc, item) => {
      acc.calories += item.calories;
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fat += item.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-4 sm:p-5 shadow-card mb-4">
      {/* Ring Section */}
      <div className="flex flex-col items-center justify-center my-2">
        <CircularProgress
          consumed={totals.calories}
          target={effectiveCalorieTarget}
          size={190}
          strokeWidth={14}
        />
        {stepsState.includeCaloriesInDailyGoal && stepCalories > 0 && (
          <div className="mt-2 text-[11px] font-bold text-amber-700 dark:text-solar bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-full px-2.5 py-0.5 flex items-center space-x-1 shadow-2xs">
            <Flame className="w-3 h-3" />
            <span>+{stepCalories} kcal añadidas por tus pasos</span>
          </div>
        )}
      </div>

      {/* Macros Section */}
      <div className="grid grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-cream-200 dark:border-dark-border">
        <MacroBar
          label="Proteínas"
          consumed={totals.protein}
          target={proteinTarget}
          colorType="protein"
        />
        <MacroBar
          label="Carbos"
          consumed={totals.carbs}
          target={carbsTarget}
          colorType="carbs"
        />
        <MacroBar
          label="Grasas"
          consumed={totals.fat}
          target={fatTarget}
          colorType="fat"
        />
      </div>
    </div>
  );
};
