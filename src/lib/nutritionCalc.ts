import { Gender, ActivityLevel, GoalType } from '../types';

export interface CalculationInput {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  goal: GoalType;
  activityLevel: ActivityLevel;
}

export interface NutritionPlan {
  bmr: number;
  tdee: number;
  dailyCalories: number;
  dailyProteinGrams: number;
  dailyCarbsGrams: number;
  dailyFatGrams: number;
  weeklyPaceKg: number;
  weeksToGoal: number;
  estimatedTargetDate: Date;
  isAdjustedForSafety: boolean;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,       // Poco o ningún ejercicio
  light: 1.375,         // Ejercicio ligero 1-3 días/semana
  moderate: 1.55,       // Ejercicio moderado 3-5 días/semana
  very_active: 1.725,   // Ejercicio intenso 6-7 días/semana
  athlete: 1.9,         // Trabajo físico muy duro o atleta profesional
};

export function calculateNutritionTargets(input: CalculationInput): NutritionPlan {
  const { gender, age, heightCm, weightKg, targetWeightKg, goal, activityLevel } = input;

  // 1. Mifflin-St Jeor BMR (Tasa Metabólica Basal)
  // Hombres: BMR = (10 × peso) + (6.25 × altura) - (5 × edad) + 5
  // Mujeres: BMR = (10 × peso) + (6.25 × altura) - (5 × edad) - 161
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  // 2. TDEE (Gasto Energético Total Diario)
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.375;
  const tdee = Math.round(bmr * multiplier);

  // 3. Ajuste según objetivo (Déficit / Superávit)
  let rawCalories = tdee;
  let weeklyPaceKg = 0;

  if (goal === 'lose') {
    rawCalories = tdee - 500; // Déficit de ~500 kcal para perder ~0.5 kg/semana
    weeklyPaceKg = 0.5;
  } else if (goal === 'gain') {
    rawCalories = tdee + 300; // Superávit controlado de ~300 kcal para ganancia limpia
    weeklyPaceKg = 0.25;
  } else {
    rawCalories = tdee;
    weeklyPaceKg = 0;
  }

  // 4. Mínimos de seguridad biológica
  // Mínimo de 1.500 kcal para hombres y 1.200 kcal para mujeres
  const minSafeCalories = gender === 'male' ? 1500 : 1200;
  const isAdjustedForSafety = rawCalories < minSafeCalories;
  const dailyCalories = Math.max(rawCalories, minSafeCalories);

  // 5. Cálculo de Macronutrientes
  // Proteína: 1.8 a 2.0 g/kg (fijamos 1.9 g/kg para óptima preservación muscular)
  const proteinGramsPerKg = goal === 'lose' ? 2.0 : 1.9;
  const dailyProteinGrams = Math.round(weightKg * proteinGramsPerKg);
  const proteinCalories = dailyProteinGrams * 4;

  // Grasas: ~27% del total de calorías diarias (1g grasa = 9 kcal)
  const fatCalories = dailyCalories * 0.27;
  const dailyFatGrams = Math.round(fatCalories / 9);

  // Carbohidratos: El resto de calorías disponibles (1g carb = 4 kcal)
  const remainingCaloriesForCarbs = Math.max(0, dailyCalories - (proteinCalories + dailyFatGrams * 9));
  const dailyCarbsGrams = Math.round(remainingCaloriesForCarbs / 4);

  // 6. Estimación de tiempo para alcanzar el peso objetivo
  const weightDiff = Math.abs(weightKg - targetWeightKg);
  let weeksToGoal = 0;
  if (weeklyPaceKg > 0 && weightDiff > 0) {
    weeksToGoal = Math.ceil(weightDiff / weeklyPaceKg);
  }

  const estimatedTargetDate = new Date();
  if (weeksToGoal > 0) {
    estimatedTargetDate.setDate(estimatedTargetDate.getDate() + weeksToGoal * 7);
  }

  return {
    bmr: Math.round(bmr),
    tdee,
    dailyCalories,
    dailyProteinGrams,
    dailyCarbsGrams,
    dailyFatGrams,
    weeklyPaceKg,
    weeksToGoal,
    estimatedTargetDate,
    isAdjustedForSafety,
  };
}

export function formatWeightDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
