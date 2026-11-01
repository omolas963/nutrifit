import React from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Minus, Droplets, CheckCircle2 } from 'lucide-react';

export const WaterTracker: React.FC = () => {
  const { waterMl, setWater, profile } = useApp();
  
  const ML_PER_GLASS = 250;
  const targetMl = profile?.dailyWaterTargetMl || 2000;
  const targetGlasses = Math.max(1, Math.round(targetMl / ML_PER_GLASS));
  const currentGlasses = Math.floor(waterMl / ML_PER_GLASS);
  const percentage = Math.min(100, Math.round((waterMl / targetMl) * 100));
  const isGoalReached = waterMl >= targetMl;

  const addGlass = (delta: number) => {
    const nextGlasses = Math.max(0, currentGlasses + delta);
    setWater(nextGlasses * ML_PER_GLASS);
  };

  return (
    <div className="bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-4 sm:p-5 shadow-card transition-colors">
      {/* Header: Título y meta */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text leading-tight">
              Agua
            </h4>
            <span className="text-xs text-bark-500 dark:text-dark-muted font-medium">
              Meta: {targetGlasses} vasos al día
            </span>
          </div>
        </div>

        {/* Contador simple */}
        <div className="text-right flex items-center space-x-1.5">
          {isGoalReached && (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-pulse" />
          )}
          <span className="font-display font-extrabold text-2xl text-cyan-600 dark:text-cyan-400">
            {currentGlasses}
          </span>
          <span className="text-sm font-semibold text-bark-400 dark:text-dark-muted">
            / {targetGlasses}
          </span>
        </div>
      </div>

      {/* Controles estilo Fitia: Botón -1, Vaso central interactivo, Botón +1 */}
      <div className="flex items-center justify-center space-x-6 py-2">
        {/* Botón -1 */}
        <button
          type="button"
          onClick={() => addGlass(-1)}
          disabled={currentGlasses <= 0}
          aria-label="Restar 1 vaso de agua"
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white dark:bg-dark-surface border-2 border-cream-200 dark:border-dark-border text-bark-700 dark:text-dark-text hover:bg-cream-100 dark:hover:bg-dark-elevated active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
        >
          <Minus className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Vaso grande que se llena con el agua */}
        <button
          type="button"
          onClick={() => addGlass(1)}
          aria-label="Añadir 1 vaso de agua"
          className="relative group flex flex-col items-center justify-center active:scale-95 transition-transform"
        >
          <div className="w-20 h-24 relative flex items-center justify-center">
            <svg
              className="w-full h-full drop-shadow-sm"
              viewBox="0 0 60 76"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Silueta del vaso */}
              <path
                d="M10 8 L16 66 C16.5 70 20 73 24 73 H36 C40 73 43.5 70 44 66 L50 8 Z"
                className="stroke-cyan-300 dark:stroke-cyan-700"
                strokeWidth="2.5"
                fill="none"
              />
              {/* Nivel de agua con clip */}
              <g clipPath="url(#glassClip)">
                <rect
                  x="8"
                  y={68 - (percentage / 100) * 58}
                  width="44"
                  height="68"
                  className="fill-cyan-400 dark:fill-cyan-500 transition-all duration-300 ease-out"
                  fillOpacity="0.85"
                />
                {percentage > 0 && (
                  <ellipse
                    cx="30"
                    cy={68 - (percentage / 100) * 58}
                    rx="14"
                    ry="2"
                    className="fill-cyan-200/90 dark:fill-cyan-300/80"
                  />
                )}
              </g>
              <defs>
                <clipPath id="glassClip">
                  <path d="M12 10 L17.5 65 C17.8 68 20.5 71 24 71 H36 C39.5 71 42.2 68 42.5 65 L48 10 Z" />
                </clipPath>
              </defs>
            </svg>

            {/* Porcentaje en el centro */}
            <span className="absolute inset-0 flex items-center justify-center font-display font-extrabold text-sm text-bark-800 dark:text-white drop-shadow-sm select-none">
              {percentage}%
            </span>
          </div>
          <span className="text-[11px] font-medium text-bark-400 dark:text-dark-muted mt-1 group-hover:text-cyan-600 transition-colors">
            Toca para +1
          </span>
        </button>

        {/* Botón +1 */}
        <button
          type="button"
          onClick={() => addGlass(1)}
          aria-label="Añadir 1 vaso de agua"
          className="w-12 h-12 rounded-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white active:scale-95 transition-all shadow-md shadow-cyan-600/30"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Barra de progreso sutil inferior */}
      <div className="w-full h-1.5 bg-cream-200 dark:bg-dark-surface rounded-full overflow-hidden mt-1">
        <div
          className="h-full bg-cyan-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
