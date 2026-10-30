import React from 'react';
import { useApp } from '../../context/AppContext';
import { CircularProgress } from '../common/CircularProgress';
import { MacroBar } from '../common/MacroBar';

export const CalorieRing: React.FC = () => {
  const { profile, foodEntries } = useApp();

  const calorieTarget = profile?.dailyCalorieTarget || 2250;
  const proteinTarget = profile?.dailyProteinTargetGrams || 155;
  const carbsTarget = profile?.dailyCarbsTargetGrams || 245;
  const fatTarget = profile?.dailyFatTargetGrams || 70;

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
    <div className="bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 shadow-card mb-4">
      {/* Ring Section */}
      <div className="flex flex-col items-center justify-center my-2">
        <CircularProgress
          consumed={totals.calories}
          target={calorieTarget}
          size={190}
          strokeWidth={14}
        />
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
