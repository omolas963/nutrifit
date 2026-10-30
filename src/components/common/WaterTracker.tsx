import React from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Minus, RotateCcw, Sparkles } from 'lucide-react';

export const WaterTracker: React.FC = () => {
  const { waterMl, setWater, profile } = useApp();
  
  const ML_PER_GLASS = 250;
  const targetMl = profile?.dailyWaterTargetMl || 2000;
  const targetGlasses = Math.max(1, Math.round(targetMl / ML_PER_GLASS));
  const currentGlasses = Math.floor(waterMl / ML_PER_GLASS);
  const percentage = Math.min(100, Math.round((waterMl / targetMl) * 100));
  const isGoalReached = waterMl >= targetMl;

  const addGlass = (count: number = 1) => {
    const next = Math.max(0, waterMl + count * ML_PER_GLASS);
    setWater(next);
  };

  const handleSelectGlass = (glassIndex: number) => {
    // If clicking on current number of glasses, toggle off one glass, otherwise set to that glass count
    if (glassIndex === currentGlasses) {
      setWater((glassIndex - 1) * ML_PER_GLASS);
    } else {
      setWater(glassIndex * ML_PER_GLASS);
    }
  };

  const resetWater = () => {
    setWater(0);
  };

  // Render glass array (e.g. 8 glasses)
  const glasses = Array.from({ length: targetGlasses }, (_, i) => i + 1);

  return (
    <div className="bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 shadow-card transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-100 dark:bg-cyan-950/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-sm">
            {/* SVG Glass Icon */}
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3H7c-.6 0-1 .4-1 1l1.5 16.2c.1.9.8 1.8 1.8 1.8h5.4c1 0 1.7-.9 1.8-1.8L18 4c0-.6-.4-1-1-1Z" />
              <line x1="6.5" y1="8" x2="17.5" y2="8" strokeDasharray="1 1" />
              <path d="M7.4 12h9.2" fill="currentColor" fillOpacity="0.3" stroke="none" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text leading-tight">
                Control de Agua
              </h4>
              {isGoalReached && (
                <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Meta cumplida</span>
                </span>
              )}
            </div>
            <span className="text-xs text-bark-500 dark:text-dark-muted font-medium">
              Meta: {targetGlasses} vasos al día ({targetMl} ml)
            </span>
          </div>
        </div>

        {/* Counter */}
        <div className="text-right">
          <div className="flex items-baseline justify-end space-x-1">
            <span className="font-display font-extrabold text-2xl text-cyan-600 dark:text-cyan-400">
              {currentGlasses}
            </span>
            <span className="text-xs font-bold text-bark-500 dark:text-dark-muted">
              / {targetGlasses} vasos
            </span>
          </div>
          <span className="text-[11px] text-bark-400 dark:text-dark-muted block">
            {waterMl} ml ({percentage}%)
          </span>
        </div>
      </div>

      {/* Interactive Glasses Row / Grid */}
      <div className="bg-cream-100 dark:bg-dark-surface/60 rounded-2xl p-3 mb-4">
        <p className="text-[11px] text-bark-500 dark:text-dark-muted mb-2 font-medium">
          Toca un vaso para marcarlo:
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {glasses.map((num) => {
            const isFilled = num <= currentGlasses;
            return (
              <button
                key={num}
                type="button"
                onClick={() => handleSelectGlass(num)}
                aria-label={`Vaso de agua número ${num}`}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all active:scale-90 border ${
                  isFilled
                    ? 'bg-cyan-500 text-white border-cyan-400 shadow-sm shadow-cyan-500/20'
                    : 'bg-white dark:bg-dark-card text-bark-400 dark:text-dark-muted border-cream-200 dark:border-dark-border hover:border-cyan-400/50'
                }`}
              >
                {/* Visual Glass SVG */}
                <svg
                  className={`w-6 h-6 transition-transform ${isFilled ? 'scale-110' : 'opacity-60'}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3H7c-.6 0-1 .4-1 1l1.5 16.2c.1.9.8 1.8 1.8 1.8h5.4c1 0 1.7-.9 1.8-1.8L18 4c0-.6-.4-1-1-1Z" />
                  {isFilled && (
                    <path
                      d="M7.4 11h9.2l-.7 7.5c0 .5-.4.9-.9.9H9c-.5 0-.9-.4-.9-.9L7.4 11Z"
                      fill="currentColor"
                      stroke="none"
                    />
                  )}
                </svg>
                <span className={`text-[10px] font-bold mt-1 ${isFilled ? 'text-white' : 'text-bark-500 dark:text-dark-muted'}`}>
                  Vaso {num}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-cream-200 dark:bg-dark-surface rounded-full overflow-hidden mb-4 relative">
        <div
          className="h-full bg-cyan-500 dark:bg-cyan-400 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => addGlass(1)}
          className="flex-1 py-2.5 px-3 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
          aria-label="Añadir 1 vaso de agua"
        >
          <Plus className="w-4 h-4" />
          <span>+1 Vaso (250 ml)</span>
        </button>

        {currentGlasses > 0 && (
          <>
            <button
              onClick={() => addGlass(-1)}
              className="py-2.5 px-3.5 bg-cream-200 hover:bg-cream-300 dark:bg-dark-surface dark:hover:bg-dark-elevated rounded-xl text-bark-700 dark:text-dark-text text-xs font-bold flex items-center space-x-1 transition-colors"
              aria-label="Restar 1 vaso de agua"
              title="Restar 1 vaso"
            >
              <Minus className="w-4 h-4" />
              <span>-1 Vaso</span>
            </button>
            <button
              onClick={resetWater}
              className="p-2.5 bg-cream-200 hover:bg-cream-300 dark:bg-dark-surface dark:hover:bg-dark-elevated rounded-xl text-bark-500 hover:text-red-500 dark:text-dark-muted dark:hover:text-red-400 transition-colors"
              aria-label="Vaciar contador de agua"
              title="Reiniciar a 0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
