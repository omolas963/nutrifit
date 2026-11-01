import React, { useState, useEffect } from 'react';
import { widgetService, WidgetData } from '../../services/widgetService';
import {
  X,
  Smartphone,
  Sparkles,
  Footprints,
  Flame,
  Plus,
  RefreshCw,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface WidgetPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WidgetPreviewModal: React.FC<WidgetPreviewModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<WidgetData>(widgetService.getWidgetData());
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    return widgetService.subscribe((d) => setData(d));
  }, []);

  if (!isOpen) return null;

  const handleSimulateAddSteps = async () => {
    setIsSimulating(true);
    await widgetService.syncWidget({
      ...data,
      steps: data.steps + 1250,
    });
    setIsSimulating(false);
  };

  const handleSimulateAddWater = async () => {
    setIsSimulating(true);
    await widgetService.syncWidget({
      ...data,
      waterLiters: Number((data.waterLiters + 0.25).toFixed(2)),
    });
    setIsSimulating(false);
  };

  const handleSimulateAddMeal = async () => {
    setIsSimulating(true);
    const newConsumed = data.caloriesConsumed + 350;
    const newRemaining = Math.max(0, data.caloriesTarget - newConsumed);
    await widgetService.syncWidget({
      ...data,
      caloriesConsumed: newConsumed,
      caloriesRemaining: newRemaining,
    });
    setIsSimulating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-bark-900/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream-200 dark:border-dark-border pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-solar flex items-center justify-center text-bark-900 shadow-sm">
              <Smartphone className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-bark-900 dark:text-dark-text leading-tight">
                Widget para Pantalla del Móvil
              </h3>
              <p className="text-[11px] text-bark-500 dark:text-dark-muted">
                Android AppWidget & Pantalla de inicio
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-bark-400 hover:text-bark-900 dark:text-dark-muted rounded-xl hover:bg-cream-100 dark:hover:bg-dark-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status banner */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center space-x-2 text-xs text-emerald-900 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong>Widget funcional activo</strong>. Se actualiza automáticamente con tus calorías, pasos y agua.
          </span>
        </div>

        {/* Live Widget Phone Mockup */}
        <div className="space-y-2 text-left">
          <span className="font-bold text-xs text-bark-700 dark:text-dark-muted block">
            Vista previa interactiva del Widget en tu teléfono:
          </span>

          <div className="bg-gradient-to-b from-stone-800 to-stone-900 p-4 rounded-3xl shadow-inner border-2 border-stone-700">
            {/* The Actual Widget Card Container */}
            <div className="bg-[#FDFBF7] dark:bg-[#1E1A16] border border-[#E8E2D6] dark:border-dark-border rounded-2xl p-4 shadow-xl space-y-3 select-none transition-transform hover:scale-[1.01]">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-solar text-bark-900 font-extrabold text-xs flex items-center justify-center shadow-2xs">
                    N
                  </div>
                  <span className="font-display font-black text-sm text-bark-900 dark:text-white">
                    Nutri<span className="text-solar-700 dark:text-solar">Fit</span>
                  </span>
                </div>
                <span className="text-[10px] text-bark-400 dark:text-stone-400 font-medium">
                  {data.updatedAt || 'Hoy'}
                </span>
              </div>

              {/* Remaining Calories Big Hero */}
              <div className="space-y-0.5">
                <div className="text-2xl font-display font-black text-bark-900 dark:text-white tracking-tight">
                  {data.caloriesRemaining.toLocaleString('es-ES')} kcal
                </div>
                <div className="text-[11px] text-bark-600 dark:text-stone-300 font-medium">
                  restantes de {data.caloriesTarget.toLocaleString('es-ES')} ({data.caloriesConsumed.toLocaleString('es-ES')} consumidas)
                </div>
              </div>

              {/* Bottom Metrics: Steps & Water & Quick Add */}
              <div className="flex items-center justify-between pt-1 gap-1.5">
                {/* Steps Pill */}
                <div className="flex-1 bg-[#F5EFE3] dark:bg-stone-800/80 px-2.5 py-1.5 rounded-xl flex items-center space-x-1.5">
                  <span className="text-xs">👟</span>
                  <span className="font-bold text-xs text-bark-900 dark:text-white truncate">
                    {data.steps.toLocaleString('es-ES')}
                  </span>
                </div>

                {/* Water Pill */}
                <div className="flex-1 bg-[#F5EFE3] dark:bg-stone-800/80 px-2.5 py-1.5 rounded-xl flex items-center space-x-1.5">
                  <span className="text-xs">💧</span>
                  <span className="font-bold text-xs text-bark-900 dark:text-white truncate">
                    {data.waterLiters.toFixed(1)} L
                  </span>
                </div>

                {/* Quick Add Button */}
                <div className="w-7 h-7 rounded-xl bg-solar text-bark-900 font-bold flex items-center justify-center shadow-xs text-sm">
                  +
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Simulator Controls */}
        <div className="p-3.5 bg-cream-50 dark:bg-dark-surface border border-cream-200 dark:border-dark-border rounded-2xl space-y-2.5 text-left">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-bark-900 dark:text-dark-text">
            <Sparkles className="w-4 h-4 text-solar-800 dark:text-solar" />
            <span>Probar actualización del Widget en vivo:</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleSimulateAddMeal}
              disabled={isSimulating}
              className="py-2 px-2 bg-white dark:bg-dark-card border border-cream-300 dark:border-dark-border rounded-xl text-[11px] font-bold text-bark-800 dark:text-dark-text hover:border-solar shadow-2xs active:scale-95 transition-all text-center"
            >
              + 350 kcal
            </button>

            <button
              type="button"
              onClick={handleSimulateAddSteps}
              disabled={isSimulating}
              className="py-2 px-2 bg-white dark:bg-dark-card border border-cream-300 dark:border-dark-border rounded-xl text-[11px] font-bold text-bark-800 dark:text-dark-text hover:border-solar shadow-2xs active:scale-95 transition-all text-center"
            >
              + 1.250 pasos
            </button>

            <button
              type="button"
              onClick={handleSimulateAddWater}
              disabled={isSimulating}
              className="py-2 px-2 bg-white dark:bg-dark-card border border-cream-300 dark:border-dark-border rounded-xl text-[11px] font-bold text-bark-800 dark:text-dark-text hover:border-solar shadow-2xs active:scale-95 transition-all text-center"
            >
              + 1 vaso agua
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3 bg-cream-50 dark:bg-dark-surface/80 rounded-2xl border border-cream-200 dark:border-dark-border space-y-1 text-left text-xs text-bark-600 dark:text-dark-muted">
          <strong className="text-bark-900 dark:text-dark-text block">
            ¿Cómo se añade a tu móvil?
          </strong>
          <ol className="list-decimal list-inside space-y-1 text-[11px]">
            <li>Mantén pulsado cualquier espacio vacío en la pantalla de inicio de tu móvil.</li>
            <li>Toca en el menú <strong>Widgets</strong>.</li>
            <li>Busca <strong>NutriFit</strong> y arrastra el widget a tu pantalla.</li>
          </ol>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 px-4 bg-solar hover:bg-solar-600 active:scale-95 text-bark-900 font-display font-bold text-sm rounded-2xl shadow-floating transition-transform"
        >
          Entendido, continuar
        </button>
      </div>
    </div>
  );
};
