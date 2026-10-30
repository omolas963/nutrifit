import React from 'react';
import { DayNavigator } from '../components/today/DayNavigator';
import { CalorieRing } from '../components/today/CalorieRing';
import { WaterTracker } from '../components/common/WaterTracker';
import { MealSection } from '../components/today/MealSection';

export const TodayPage: React.FC = () => {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Day Navigator */}
      <DayNavigator />

      {/* Main Calorie Ring & Macro Bars */}
      <CalorieRing />

      {/* Water Tracker */}
      <WaterTracker />

      {/* Meals Journal */}
      <div className="space-y-3 pt-2">
        <h3 className="font-display font-bold text-lg text-bark-900 dark:text-dark-text px-1">
          Diario de Comidas
        </h3>

        <MealSection mealType="desayuno" title="Desayuno" />
        <MealSection mealType="comida" title="Comida" />
        <MealSection mealType="merienda" title="Merienda" />
        <MealSection mealType="cena" title="Cena" />
        <MealSection mealType="snacks" title="Snacks" />
      </div>
    </div>
  );
};
