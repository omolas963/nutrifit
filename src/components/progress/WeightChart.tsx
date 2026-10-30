import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { TrendingDown } from 'lucide-react';

export const WeightChart: React.FC = () => {
  const { weightLogs, profile } = useApp();
  const targetWeight = profile?.targetWeightKg || 73.0;

  // Format data for chart
  const data = weightLogs.map((log) => {
    const [, m, d] = log.date.split('-');
    return {
      date: `${d}/${m}`,
      rawDate: log.date,
      peso: log.weightKg,
    };
  });

  const weights = weightLogs.map((l) => l.weightKg);
  const minWeight = Math.min(...weights, targetWeight) - 1;
  const maxWeight = Math.max(...weights, targetWeight) + 1;

  return (
    <div className="bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingDown className="w-5 h-5 text-solar-700 dark:text-solar" />
          <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text">
            Evolución de Peso
          </h4>
        </div>
        <div className="flex items-center space-x-3 text-xs font-semibold">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-solar" />
            <span className="text-bark-600 dark:text-dark-muted">Peso</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-0.5 bg-emerald-500" />
            <span className="text-bark-600 dark:text-dark-muted">Meta ({targetWeight} kg)</span>
          </span>
        </div>
      </div>

      <div className="h-56 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EFE8DC" opacity={0.6} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#7D6D5E' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[Math.floor(minWeight), Math.ceil(maxWeight)]}
                tick={{ fontSize: 11, fill: '#7D6D5E' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-bark-900 dark:bg-dark-surface text-white px-3 py-1.5 rounded-xl text-xs shadow-lg">
                        <span className="font-bold font-display text-sm">
                          {item.peso} kg
                        </span>
                        <span className="text-bark-400 block text-[10px]">
                          Fecha: {item.rawDate}
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Target weight line */}
              <ReferenceLine
                y={targetWeight}
                stroke="#10B981"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
              {/* Actual weight curve */}
              <Line
                type="monotone"
                dataKey="peso"
                stroke="#FFC62E"
                strokeWidth={3}
                dot={{ r: 4, fill: '#FFC62E', stroke: '#261C14', strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: '#FFC62E' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-bark-400">
            Aún no hay registros de peso.
          </div>
        )}
      </div>
    </div>
  );
};
