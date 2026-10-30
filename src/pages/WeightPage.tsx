import React, { useState } from 'react';
import { WeightSummaryCard } from '../components/weight/WeightSummaryCard';
import { WeightChart } from '../components/progress/WeightChart';
import { GoalTipsCard } from '../components/weight/GoalTipsCard';
import { LogWeightModal } from '../components/weight/LogWeightModal';

export const WeightPage: React.FC = () => {
  const [isLogOpen, setIsLogOpen] = useState(false);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Weight Summary & Goal Target Card */}
      <WeightSummaryCard onOpenLogModal={() => setIsLogOpen(true)} />

      {/* Weight History Chart */}
      <WeightChart />

      {/* Science-based Goal Tips */}
      <GoalTipsCard />

      {/* Log Weight Modal */}
      <LogWeightModal
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
      />
    </div>
  );
};
