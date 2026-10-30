import React, { useState } from 'react';
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
} from 'recharts';
import { shiftDays, getTodayIsoString } from '../../lib/utils';
import { Utensils } from 'lucide-react';

export const CalorieMacroChart: React.FC = () => {
  const { allFoodEntries, profile } = useApp();
  const [rangeDays, setRangeDays] = useState<7 | 30>(7);

  const targetCalories = profile?.dailyCalorieTarget || 2250;
  const today = getTodayIsoString();

  // Build daily timeline for the selected range (7 or 30 days)
  const chartData = [];
  for (let i = rangeDays - 1; i >= 0; i--) {
    const dStr = shiftDays(today, -i);
    const dayFoods = allFoodEntries.filter((f) => f.date === dStr);

    const cals = dayFoods.reduce((acc, f) => acc + f.calories, 0);
    const protein = dayFoods.reduce((acc, f) => acc + f.protein, 0);
    const carbs = dayFoods.reduce((acc, f) => acc + f.carbs, 0);
    const fat = dayFoods.reduce((acc, f) => acc + f.fat, 0);

    const [, m, d] = dStr.split('-');
    chartData.push({
      date: rangeDays === 7 ? `${d}/${m}` : `${d}`,
      fullDate: dStr,
      calorías: cals,
      proteína: Math.round(protein),
      carbohidratos: Math.round(carbs),
      grasas: Math.round(fat),
    });
  }

  return (
    <div className="bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Utensils className="w-5 h-5 text-solar-700 dark:text-solar" />
          <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text">
            Calorías Ingeridas
          </h4>
        </div>

        {/* Range Selector */}
        <div className="flex bg-cream-200 dark:bg-dark-surface p-0.5 rounded-xl text-xs font-bold">
          <button
            onClick={() => setRangeDays(7)}
            className={`py-1 px-2.5 rounded-lg transition-colors ${
              rangeDays === 7
                ? 'bg-white dark:bg-dark-card text-bark-900 dark:text-solar shadow-sm'
                : 'text-bark-600 dark:text-dark-muted'
            }`}
          >
            7 días
          </button>
          <button
            onClick={() => setRangeDays(30)}
            className={`py-1 px-2.5 rounded-lg transition-colors ${
              rangeDays === 30
                ? 'bg-white dark:bg-dark-card text-bark-900 dark:text-solar shadow-sm'
                : 'text-bark-600 dark:text-dark-muted'
            }`}
          >
            30 días
          </button>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EFE8DC" opacity={0.6} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#7D6D5E' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#7D6D5E' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const it = payload[0].payload;
                  return (
                    <div className="bg-bark-900 dark:bg-dark-surface text-white px-3 py-2 rounded-xl text-xs shadow-lg space-y-1">
                      <div className="font-display font-bold text-sm text-solar">
                        {it.calorías} kcal
                      </div>
                      <div className="text-[10px] text-bark-300">Fecha: {it.fullDate}</div>
                      <div className="text-[10px] text-bark-300 space-x-1">
                        <span className="text-macro-protein">{it.proteína}g P</span>
                        <span>·</span>
                        <span className="text-macro-carbs">{it.carbohidratos}g C</span>
                        <span>·</span>
                        <span className="text-macro-fat">{it.grasas}g G</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Target Line */}
            <ReferenceLine
              y={targetCalories}
              stroke="#E26D5C"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <Bar dataKey="calorías" fill="#FFC62E" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs font-semibold text-bark-600 dark:text-dark-muted pt-1">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-solar" />
          <span>Calorías consumidas</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-0.5 bg-macro-protein" />
          <span>Meta diaria ({targetCalories} kcal)</span>
        </div>
      </div>
    </div>
  );
};
