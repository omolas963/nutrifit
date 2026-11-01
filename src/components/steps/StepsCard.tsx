import React, { useState, useEffect } from 'react';
import { stepsService, StepsState } from '../../services/stepsService';
import { useApp } from '../../context/AppContext';
import { ConnectStepsModal } from './ConnectStepsModal';
import { ManualStepsModal } from './ManualStepsModal';
import {
  Footprints,
  Flame,
  MapPin,
  RefreshCw,
  Plus,
  Sparkles,
  Smartphone,
  Download,
  Settings2
} from 'lucide-react';

export const StepsCard: React.FC = () => {
  const { profile, selectedDate } = useApp();
  const [stepsState, setStepsState] = useState<StepsState>(stepsService.getState());
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    return stepsService.subscribe((s) => setStepsState(s));
  }, []);

  // Compute values for selectedDate
  const todayIso = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayIso;

  const currentEntry = stepsState.history[selectedDate] || (isToday ? {
    steps: stepsState.todaySteps,
    distanceMeters: stepsState.todayDistanceMeters,
    calories: stepsState.todayCalories,
  } : {
    steps: 0,
    distanceMeters: 0,
    calories: 0,
  });

  const stepsCount = currentEntry.steps || 0;
  const target = stepsState.dailyTarget || 10000;
  const percent = Math.min(100, Math.round((stepsCount / target) * 100));
  const isGoalReached = stepsCount >= target;

  const userWeight = profile?.currentWeightKg || 70;
  const userHeight = profile?.heightCm || 175;

  const distanceKm = (
    (currentEntry.distanceMeters || stepsService.estimateDistanceMeters(stepsCount, userHeight)) / 1000
  ).toFixed(1);

  const caloriesBurned =
    currentEntry.calories || stepsService.estimateCalories(stepsCount, userWeight);

  const handleQuickSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    await stepsService.syncSteps(userWeight, userHeight);
    setIsSyncing(false);
  };

  const isConnected = stepsState.status === 'connected';

  // SVG Progress Ring calculations
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-4 sm:p-5 shadow-card transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-700 dark:text-solar shadow-sm">
            <Footprints className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text leading-tight">
                Control de Pasos
              </h4>
              {isGoalReached && (
                <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Meta cumplida</span>
                </span>
              )}
            </div>
            <span className="text-xs text-bark-500 dark:text-dark-muted font-medium">
              Meta: {target.toLocaleString('es-ES')} pasos al día
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-1">
          {isConnected && (
            <button
              type="button"
              onClick={handleQuickSync}
              disabled={isSyncing}
              className="p-2 text-bark-500 hover:text-bark-900 dark:text-dark-muted rounded-xl hover:bg-cream-100 dark:hover:bg-dark-surface transition-colors active:scale-95"
              title="Sincronizar pasos"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-solar-800 dark:text-solar' : ''}`} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsManualOpen(true)}
            className="p-2 text-bark-500 hover:text-bark-900 dark:text-dark-muted rounded-xl hover:bg-cream-100 dark:hover:bg-dark-surface transition-colors"
            title="Añadir pasos a mano"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsConnectOpen(true)}
            className="p-2 text-bark-500 hover:text-bark-900 dark:text-dark-muted rounded-xl hover:bg-cream-100 dark:hover:bg-dark-surface transition-colors"
            title="Ajustes de pasos y conexión"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Left: Circular Progress Ring & Total */}
        <div className="sm:col-span-6 flex items-center space-x-4 bg-white dark:bg-dark-surface/60 border border-cream-200 dark:border-dark-border/60 rounded-2xl p-3.5">
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="text-cream-200 dark:text-dark-border"
                strokeWidth="6.5"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="text-amber-500 dark:text-solar transition-all duration-700 ease-out"
                strokeWidth="6.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-display font-extrabold text-sm text-bark-900 dark:text-dark-text leading-none">
                {percent}%
              </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-2xl font-display font-extrabold text-bark-900 dark:text-dark-text tracking-tight">
              {stepsCount.toLocaleString('es-ES')}
            </div>
            <div className="text-[11px] font-semibold text-bark-500 dark:text-dark-muted">
              de {target.toLocaleString('es-ES')} pasos
            </div>
            {stepsState.lastSyncTime && (
              <div className="text-[10px] text-bark-400 dark:text-dark-muted pt-0.5">
                {isToday ? 'Actualizado ' + new Date(stepsState.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Histórico'}
              </div>
            )}
          </div>
        </div>

        {/* Right: Metrics (Distance & Calories, and optional Exercise Calories) */}
        <div className={`sm:col-span-6 grid ${stepsState.importExerciseCalories ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
          {/* Distance */}
          <div className="bg-white dark:bg-dark-surface/60 border border-cream-200 dark:border-dark-border/60 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between">
            <div className="flex items-center space-x-1 text-bark-500 dark:text-dark-muted text-[10px] sm:text-[11px] font-medium truncate">
              <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="truncate">Distancia</span>
            </div>
            <div className="mt-1">
              <span className="text-base sm:text-lg font-bold font-display text-bark-900 dark:text-dark-text">
                {distanceKm}
              </span>
              <span className="text-[10px] sm:text-xs text-bark-500 font-semibold ml-0.5">km</span>
            </div>
          </div>

          {/* Calories burned by steps */}
          <div className="bg-white dark:bg-dark-surface/60 border border-cream-200 dark:border-dark-border/60 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between">
            <div className="flex items-center space-x-1 text-bark-500 dark:text-dark-muted text-[10px] sm:text-[11px] font-medium truncate">
              <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-solar shrink-0" />
              <span className="truncate">Pasos</span>
            </div>
            <div className="mt-1">
              <span className="text-base sm:text-lg font-bold font-display text-bark-900 dark:text-dark-text">
                ~{caloriesBurned}
              </span>
              <span className="text-[10px] sm:text-xs text-bark-500 font-semibold ml-0.5">kcal</span>
            </div>
          </div>

          {/* Exercise Calories (Optional, shown if enabled) */}
          {stepsState.importExerciseCalories && (
            <div className="bg-white dark:bg-dark-surface/60 border border-cream-200 dark:border-dark-border/60 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between">
              <div className="flex items-center space-x-1 text-bark-500 dark:text-dark-muted text-[10px] sm:text-[11px] font-medium truncate">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">Entreno</span>
              </div>
              <div className="mt-1">
                <span className="text-base sm:text-lg font-bold font-display text-bark-900 dark:text-dark-text">
                  {currentEntry.exerciseCalories || (isToday ? stepsState.todayExerciseCalories : 0)}
                </span>
                <span className="text-[10px] sm:text-xs text-bark-500 font-semibold ml-0.5">kcal</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Banner: If Not Connected */}
      {!isConnected && (
        <div className="mt-3.5 pt-3 border-t border-cream-200 dark:border-dark-border/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-bark-600 dark:text-dark-muted text-[11px]">
            <Smartphone className="w-4 h-4 text-solar-800 dark:text-solar shrink-0" />
            <span>
              {stepsState.platform === 'web'
                ? 'En la web puedes anotar pasos a mano o descargar la App Android.'
                : 'Conecta Samsung Health o Apple Health para leer tus pasos automáticamente.'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsConnectOpen(true)}
            className="w-full sm:w-auto py-1.5 px-3 bg-solar hover:bg-solar-600 active:scale-95 text-bark-900 font-bold text-xs rounded-xl shadow-2xs whitespace-nowrap transition-transform"
          >
            {stepsState.platform === 'web' ? 'Descargar App / Opciones' : 'Conectar pasos'}
          </button>
        </div>
      )}

      {/* Modals */}
      <ConnectStepsModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        onOpenManual={() => setIsManualOpen(true)}
      />

      <ManualStepsModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        initialDate={selectedDate}
      />
    </div>
  );
};
