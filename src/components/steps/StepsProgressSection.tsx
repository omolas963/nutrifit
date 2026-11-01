import React, { useState, useEffect } from 'react';
import { stepsService, StepsState } from '../../services/stepsService';
import { useApp } from '../../context/AppContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  Cell,
} from 'recharts';
import { shiftDays, getTodayIsoString } from '../../lib/utils';
import { Footprints, Flame, Trophy, Award, Zap } from 'lucide-react';

export const StepsProgressSection: React.FC = () => {
  const { profile } = useApp();
  const [stepsState, setStepsState] = useState<StepsState>(stepsService.getState());
  const [rangeDays, setRangeDays] = useState<7 | 30>(7);

  useEffect(() => {
    return stepsService.subscribe((s) => setStepsState(s));
  }, []);

  const today = getTodayIsoString();
  const target = stepsState.dailyTarget || 10000;
  const userWeight = profile?.currentWeightKg || 70;
  const userHeight = profile?.heightCm || 175;

  // Build daily timeline data for 7 or 30 days
  const chartData: Array<{
    date: string;
    fullDate: string;
    pasos: number;
    km: string;
    kcal: number;
    metTarget: boolean;
  }> = [];

  let totalSteps = 0;
  let maxSteps = 0;
  let bestDayDate = '';

  for (let i = rangeDays - 1; i >= 0; i--) {
    const dStr = shiftDays(today, -i);
    const dayData = stepsState.history[dStr];
    const steps = dayData?.steps || 0;

    totalSteps += steps;
    if (steps > maxSteps) {
      maxSteps = steps;
      bestDayDate = dStr;
    }

    const distKm = (
      (dayData?.distanceMeters || stepsService.estimateDistanceMeters(steps, userHeight)) / 1000
    ).toFixed(1);
    const cals = dayData?.calories || stepsService.estimateCalories(steps, userWeight);

    const [, m, d] = dStr.split('-');
    chartData.push({
      date: rangeDays === 7 ? `${d}/${m}` : `${d}`,
      fullDate: dStr,
      pasos: steps,
      km: distKm,
      kcal: cals,
      metTarget: steps >= target,
    });
  }

  const averageSteps = Math.round(totalSteps / rangeDays);

  // Calculate current streak of consecutive days meeting the target
  let currentStreak = 0;
  for (let i = 0; i < 60; i++) {
    const dStr = shiftDays(today, -i);
    const s = stepsState.history[dStr]?.steps || 0;
    if (s >= target) {
      currentStreak++;
    } else {
      // If today is not finished yet and has not reached target, don't break streak from yesterday
      if (i === 0) continue;
      break;
    }
  }

  // Format best day string
  const formatBestDay = (isoDate: string) => {
    if (!isoDate) return 'Sin registros';
    const [, m, d] = isoDate.split('-');
    return `${d}/${m}`;
  };

  return (
    <div className="bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 shadow-card space-y-4">
      {/* Header and 7/30 days toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Footprints className="w-5 h-5 text-amber-700 dark:text-solar" />
          <div>
            <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text leading-tight">
              Evolución de Pasos
            </h4>
            <span className="text-[11px] text-bark-500 dark:text-dark-muted">
              Meta: {target.toLocaleString('es-ES')} pasos/día
            </span>
          </div>
        </div>

        <div className="flex bg-cream-200 dark:bg-dark-surface p-0.5 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setRangeDays(7)}
            className={`py-1 px-2.5 rounded-lg transition-all ${
              rangeDays === 7
                ? 'bg-white dark:bg-dark-card text-bark-900 dark:text-solar shadow-xs'
                : 'text-bark-500 dark:text-dark-muted hover:text-bark-900'
            }`}
          >
            7 días
          </button>
          <button
            type="button"
            onClick={() => setRangeDays(30)}
            className={`py-1 px-2.5 rounded-lg transition-all ${
              rangeDays === 30
                ? 'bg-white dark:bg-dark-card text-bark-900 dark:text-solar shadow-xs'
                : 'text-bark-500 dark:text-dark-muted hover:text-bark-900'
            }`}
          >
            30 días
          </button>
        </div>
      </div>

      {/* Metrics Row: Average, Best Day, Streak */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Weekly/Monthly Average */}
        <div className="p-3 bg-white dark:bg-dark-surface border border-cream-200 dark:border-dark-border/60 rounded-2xl text-left">
          <div className="flex items-center space-x-1 text-[11px] text-bark-500 dark:text-dark-muted font-medium">
            <Award className="w-3.5 h-3.5 text-amber-600 dark:text-solar shrink-0" />
            <span className="truncate">Media</span>
          </div>
          <div className="mt-1">
            <span className="text-base sm:text-lg font-bold font-display text-bark-900 dark:text-dark-text">
              {averageSteps.toLocaleString('es-ES')}
            </span>
            <span className="text-[10px] text-bark-400 block">pasos/día</span>
          </div>
        </div>

        {/* Best Day */}
        <div className="p-3 bg-white dark:bg-dark-surface border border-cream-200 dark:border-dark-border/60 rounded-2xl text-left">
          <div className="flex items-center space-x-1 text-[11px] text-bark-500 dark:text-dark-muted font-medium">
            <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">Mejor día</span>
          </div>
          <div className="mt-1">
            <span className="text-base sm:text-lg font-bold font-display text-bark-900 dark:text-dark-text">
              {maxSteps > 0 ? maxSteps.toLocaleString('es-ES') : '0'}
            </span>
            <span className="text-[10px] text-bark-400 block">
              {maxSteps > 0 ? formatBestDay(bestDayDate) : '—'}
            </span>
          </div>
        </div>

        {/* Streak */}
        <div className="p-3 bg-white dark:bg-dark-surface border border-cream-200 dark:border-dark-border/60 rounded-2xl text-left">
          <div className="flex items-center space-x-1 text-[11px] text-bark-500 dark:text-dark-muted font-medium">
            <Zap className="w-3.5 h-3.5 text-solar-800 dark:text-solar shrink-0" />
            <span className="truncate">Racha</span>
          </div>
          <div className="mt-1">
            <span className="text-base sm:text-lg font-bold font-display text-bark-900 dark:text-dark-text">
              {currentStreak}
            </span>
            <span className="text-[10px] text-bark-400 block">
              {currentStreak === 1 ? 'día cumplido' : 'días seguidos'}
            </span>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#7A6E65' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#7A6E65' }}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-bark-900 text-white dark:bg-dark-surface dark:border dark:border-dark-border p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                      <div className="font-bold text-[11px] text-solar">
                        {data.fullDate}
                      </div>
                      <div className="flex justify-between space-x-3">
                        <span className="text-cream-300">Pasos:</span>
                        <span className="font-bold">{data.pasos.toLocaleString('es-ES')}</span>
                      </div>
                      <div className="flex justify-between space-x-3">
                        <span className="text-cream-300">Distancia:</span>
                        <span className="font-bold">{data.km} km</span>
                      </div>
                      <div className="flex justify-between space-x-3">
                        <span className="text-cream-300">Calorías:</span>
                        <span className="font-bold">~{data.kcal} kcal</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              y={target}
              stroke="#D49B00"
              strokeDasharray="3 3"
              label={{
                value: 'Objetivo',
                fill: '#946B00',
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />
            <Bar dataKey="pasos" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.metTarget ? '#F59E0B' : '#E5DDCB'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
