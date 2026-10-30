import React from 'react';
import { useApp } from '../../context/AppContext';
import { shiftDays, formatSpanishDate, getTodayIsoString } from '../../lib/utils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export const DayNavigator: React.FC = () => {
  const { selectedDate, setSelectedDate } = useApp();
  const today = getTodayIsoString();
  const isToday = selectedDate === today;

  const handlePrevDay = () => {
    setSelectedDate(shiftDays(selectedDate, -1));
  };

  const handleNextDay = () => {
    setSelectedDate(shiftDays(selectedDate, 1));
  };

  const handleTodayClick = () => {
    setSelectedDate(today);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSelectedDate(e.target.value);
    }
  };

  return (
    <div className="flex items-center justify-between bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-2xl p-2 px-3 shadow-soft mb-4">
      {/* Prev button */}
      <button
        onClick={handlePrevDay}
        className="p-1.5 rounded-xl hover:bg-cream-200 dark:hover:bg-dark-surface text-bark-700 dark:text-dark-text transition-colors"
        aria-label="Día anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Date display & picker */}
      <div className="flex items-center space-x-2">
        <label className="relative flex items-center cursor-pointer group">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            aria-label="Seleccionar fecha en calendario"
          />
          <div className="flex items-center space-x-2 py-1 px-3 rounded-xl group-hover:bg-cream-200 dark:group-hover:bg-dark-surface transition-colors">
            <CalendarIcon className="w-4 h-4 text-solar-700 dark:text-solar" />
            <span className="font-display font-bold text-base text-bark-900 dark:text-dark-text">
              {formatSpanishDate(selectedDate)}
            </span>
          </div>
        </label>

        {!isToday && (
          <button
            onClick={handleTodayClick}
            className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-solar/20 dark:bg-solar/25 text-bark-900 dark:text-solar border border-solar/40 hover:bg-solar/30 transition-colors"
          >
            Hoy
          </button>
        )}
      </div>

      {/* Next button */}
      <button
        onClick={handleNextDay}
        className="p-1.5 rounded-xl hover:bg-cream-200 dark:hover:bg-dark-surface text-bark-700 dark:text-dark-text transition-colors"
        aria-label="Día siguiente"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
