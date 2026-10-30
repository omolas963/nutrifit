import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile, Gender, GoalType, ActivityLevel } from '../../types';
import { calculateNutritionTargets } from '../../lib/nutritionCalc';
import { User, Sparkles, Check } from 'lucide-react';

export const ProfileEditor: React.FC = () => {
  const { profile, saveProfile } = useApp();

  const [name, setName] = useState(profile?.name || 'Mi Perfil');
  const [gender, setGender] = useState<Gender>(profile?.gender || 'male');
  const [age, setAge] = useState(profile?.age || 28);
  const [heightCm, setHeightCm] = useState(profile?.heightCm || 178);
  const [weightKg, setWeightKg] = useState(profile?.currentWeightKg || 78.4);
  const [targetWeightKg, setTargetWeightKg] = useState(profile?.targetWeightKg || 73.0);
  const [goal, setGoal] = useState<GoalType>(profile?.goal || 'lose');
  const [activity, setActivity] = useState<ActivityLevel>(profile?.activityLevel || 'moderate');
  const [waterTarget, setWaterTarget] = useState(profile?.dailyWaterTargetMl || 2500);

  const handleRecalculateAndSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const plan = calculateNutritionTargets({
      gender,
      age,
      heightCm,
      weightKg,
      targetWeightKg,
      goal,
      activityLevel: activity,
    });

    const updated: UserProfile = {
      id: profile?.id || `user-${Date.now()}`,
      name: name.trim() || 'Mi Perfil',
      gender,
      age,
      heightCm,
      currentWeightKg: weightKg,
      targetWeightKg,
      goal,
      activityLevel: activity,
      weeklyPaceKg: plan.weeklyPaceKg,
      dailyCalorieTarget: plan.dailyCalories,
      dailyProteinTargetGrams: plan.dailyProteinGrams,
      dailyCarbsTargetGrams: plan.dailyCarbsGrams,
      dailyFatTargetGrams: plan.dailyFatGrams,
      dailyWaterTargetMl: waterTarget,
      theme: profile?.theme || 'light',
      units: profile?.units || 'metric',
      createdAt: profile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveProfile(updated);
  };

  return (
    <div className="bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 shadow-card space-y-4">
      <div className="flex items-center space-x-2.5">
        <div className="w-10 h-10 rounded-2xl bg-solar-100 dark:bg-solar/20 text-solar-800 dark:text-solar flex items-center justify-center">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text leading-tight">
            Perfil y Metas Nutricionales
          </h4>
          <span className="text-xs text-bark-500 dark:text-dark-muted font-medium">
            Recalcula tus calorías y macros según la fórmula clínica
          </span>
        </div>
      </div>

      <form onSubmit={handleRecalculateAndSave} className="space-y-3 pt-2">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1">
            Nombre
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-bark-900 dark:text-dark-text text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-solar"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1">
              Sexo biológico
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-bark-900 dark:text-dark-text text-sm font-semibold focus:outline-none"
            >
              <option value="male">Hombre</option>
              <option value="female">Mujer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1">
              Edad
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-bark-900 dark:text-dark-text text-sm font-semibold focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1">
              Altura (cm)
            </label>
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-bark-900 dark:text-dark-text text-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1">
              Peso (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-bark-900 dark:text-dark-text text-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1">
              Meta (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={targetWeightKg}
              onChange={(e) => setTargetWeightKg(parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-bark-900 dark:text-dark-text text-sm font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1">
              Objetivo
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as GoalType)}
              className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-bark-900 dark:text-dark-text text-sm font-semibold"
            >
              <option value="lose">Bajar de peso</option>
              <option value="maintain">Mantener peso</option>
              <option value="gain">Subir peso / músculo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1">
              Actividad
            </label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value as ActivityLevel)}
              className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-bark-900 dark:text-dark-text text-sm font-semibold"
            >
              <option value="sedentary">Sedentario (x1.2)</option>
              <option value="light">Ligero (x1.375)</option>
              <option value="moderate">Moderado (x1.55)</option>
              <option value="very_active">Muy activo (x1.725)</option>
              <option value="athlete">Atleta (x1.9)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1">
            Meta de agua diaria (ml)
          </label>
          <input
            type="number"
            step="100"
            value={waterTarget}
            onChange={(e) => setWaterTarget(parseInt(e.target.value, 10) || 2000)}
            className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-bark-900 dark:text-dark-text text-sm font-semibold"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 px-4 bg-solar hover:bg-solar-600 rounded-2xl font-display font-bold text-bark-900 text-sm shadow-floating flex items-center justify-center space-x-2 transition-all mt-4"
        >
          <Sparkles className="w-4 h-4" />
          <span>Guardar y recalcular metas con Mifflin-St Jeor</span>
        </button>
      </form>
    </div>
  );
};
