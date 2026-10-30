import React from 'react';

interface MacroBarProps {
  label: string;
  consumed: number;
  target: number;
  colorType: 'protein' | 'carbs' | 'fat';
}

export const MacroBar: React.FC<MacroBarProps> = ({
  label,
  consumed,
  target,
  colorType,
}) => {
  const percentage = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;
  const remaining = Math.max(0, target - consumed);

  const colors = {
    protein: {
      bg: 'bg-macro-protein',
      text: 'text-macro-protein',
      track: 'bg-macro-protein/15 dark:bg-macro-protein/25',
    },
    carbs: {
      bg: 'bg-macro-carbs',
      text: 'text-macro-carbs',
      track: 'bg-macro-carbs/15 dark:bg-macro-carbs/25',
    },
    fat: {
      bg: 'bg-macro-fat',
      text: 'text-macro-fat',
      track: 'bg-macro-fat/15 dark:bg-macro-fat/25',
    },
  }[colorType];

  return (
    <div className="flex-1 bg-cream-50 dark:bg-dark-surface p-3.5 rounded-2xl border border-cream-200 dark:border-dark-border">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text/90">
          {label}
        </span>
        <span className="text-xs font-medium text-bark-500 dark:text-dark-muted">
          {remaining}g rest.
        </span>
      </div>

      <div className="flex items-baseline space-x-1 mb-2">
        <span className="font-display font-bold text-lg text-bark-900 dark:text-dark-text">
          {Math.round(consumed)}
        </span>
        <span className="text-xs font-normal text-bark-500 dark:text-dark-muted">
          / {Math.round(target)}g
        </span>
      </div>

      <div className={`w-full h-2 rounded-full overflow-hidden ${colors.track}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colors.bg}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
