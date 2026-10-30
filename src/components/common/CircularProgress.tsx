import React from 'react';

interface CircularProgressProps {
  consumed: number;
  target: number;
  size?: number;
  strokeWidth?: number;
  sublabel?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  consumed,
  target,
  size = 200,
  strokeWidth = 14,
  sublabel = 'kcal restantes',
}) => {
  const remaining = Math.max(0, target - consumed);
  const percentage = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;

  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const isOver = consumed > target;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <defs>
          <linearGradient id="solarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFC62E" />
            <stop offset="100%" stopColor="#FFAA00" />
          </linearGradient>
          <linearGradient id="overGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E26D5C" />
            <stop offset="100%" stopColor="#D9381E" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-cream-300 dark:text-dark-border"
        />

        {/* Animated Progress bar */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={isOver ? 'url(#overGradient)' : 'url(#solarGradient)'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <span className="font-display font-extrabold text-3xl sm:text-4xl text-bark-900 dark:text-dark-text tracking-tight leading-none">
          {remaining.toLocaleString()}
        </span>
        <span className="text-xs font-semibold text-bark-600 dark:text-dark-muted mt-1 uppercase tracking-wider">
          {isOver ? 'kcal excedidas' : sublabel}
        </span>
        <div className="flex items-center space-x-1 text-xs text-bark-500 dark:text-dark-muted/80 mt-1">
          <span>{consumed.toLocaleString()}</span>
          <span>/</span>
          <span>{target.toLocaleString()} kcal</span>
        </div>
      </div>
    </div>
  );
};
