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
  const isOver = consumed > target;

  const colors = {
    protein: {
      bg: 'bg-macro-protein',
      text: 'text-macro-protein',
      track: 'bg-macro-protein/15 dark:bg-macro-protein/25',
      badge: 'bg-macro-protein/10 text-macro-protein border-macro-protein/20 dark:bg-macro-protein/20 dark:text-macro-protein',
      dot: 'bg-macro-protein',
    },
    carbs: {
      bg: 'bg-macro-carbs',
      text: 'text-macro-carbs',
      track: 'bg-macro-carbs/15 dark:bg-macro-carbs/25',
      badge: 'bg-macro-carbs/10 text-macro-carbs border-macro-carbs/20 dark:bg-macro-carbs/20 dark:text-macro-carbs',
      dot: 'bg-macro-carbs',
    },
    fat: {
      bg: 'bg-macro-fat',
      text: 'text-macro-fat',
      track: 'bg-macro-fat/15 dark:bg-macro-fat/25',
      badge: 'bg-macro-fat/10 text-macro-fat border-macro-fat/20 dark:bg-macro-fat/20 dark:text-macro-fat',
      dot: 'bg-macro-fat',
    },
  }[colorType];

  return (
    <div className="bg-white dark:bg-dark-surface border border-cream-200 dark:border-dark-border rounded-2xl p-3 sm:p-3.5 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${colors.dot} shrink-0`} />
          <span className="font-bold text-sm text-bark-900 dark:text-dark-text tracking-tight">
            {label}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-bark-800 dark:text-dark-text">
            {Math.round(consumed)} <span className="font-normal text-bark-400 dark:text-dark-muted">/ {Math.round(target)} g</span>
          </span>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${colors.badge} whitespace-nowrap`}>
            {isOver ? `+${Math.round(consumed - target)} g extra` : `${Math.round(remaining)} g restantes`}
          </span>
        </div>
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
