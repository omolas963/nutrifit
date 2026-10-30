import React from 'react';
import { StreakCard } from '../components/progress/StreakCard';
import { CalorieMacroChart } from '../components/progress/CalorieMacroChart';
import { WeightChart } from '../components/progress/WeightChart';

export const ProgressPage: React.FC = () => {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Streak Counter Card */}
      <StreakCard />

      {/* Calories & Macros History (7 & 30 days) */}
      <CalorieMacroChart />

      {/* Weight History Line Chart */}
      <WeightChart />
    </div>
  );
};
