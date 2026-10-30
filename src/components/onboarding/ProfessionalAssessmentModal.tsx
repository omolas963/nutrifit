import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import {
  UserProfile,
  GoalType,
  Gender,
  ActivityLevel,
  BodyFatLevel,
  WorkType,
  WorkoutType,
  DietaryPreference,
  MacroExperience,
} from '../../types';
import { calculateNutritionTargets, formatWeightDate } from '../../lib/nutritionCalc';
import { authService } from '../../services/authService';
import {
  Check,
  TrendingDown,
  Minus,
  TrendingUp,
  Flame,
  Award,
  ShieldCheck,
  Dumbbell,
  Briefcase,
  UtensilsCrossed,
  Sparkles,
} from 'lucide-react';

interface ProfessionalAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfessionalAssessmentModal: React.FC<ProfessionalAssessmentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile, saveProfile, currentUser, setCurrentUser } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form states
  const [goal, setGoal] = useState<GoalType>(profile?.goal || 'lose');
  const [mainMotivation, setMainMotivation] = useState<string>('Mejorar mi salud y energía');
  
  const [gender, setGender] = useState<Gender>(profile?.gender || 'male');
  const [age, setAge] = useState<number>(profile?.age || 28);
  const [heightCm, setHeightCm] = useState<number>(profile?.heightCm || 178);
  const [weightKg, setWeightKg] = useState<number>(profile?.currentWeightKg || 78.4);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(profile?.targetWeightKg || 73.0);
  const [bodyFat, setBodyFat] = useState<BodyFatLevel>('medium');

  const [workType, setWorkType] = useState<WorkType>('sedentary');
  const [exerciseDays, setExerciseDays] = useState<number>(4);
  const [workoutType, setWorkoutType] = useState<WorkoutType>('strength');

  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>('standard');
  const [mealsPerDay, setMealsPerDay] = useState<number>(4);
  const [macroExperience, setMacroExperience] = useState<MacroExperience>('intermediate');

  // Derive activity level
  let activityLevel: ActivityLevel = 'moderate';
  if (exerciseDays <= 1 && workType === 'sedentary') activityLevel = 'sedentary';
  else if (exerciseDays <= 2) activityLevel = 'light';
  else if (exerciseDays <= 4) activityLevel = 'moderate';
  else if (exerciseDays <= 6) activityLevel = 'very_active';
  else activityLevel = 'athlete';

  // Calculate clinical nutrition plan
  const plan = calculateNutritionTargets({
    gender,
    age,
    heightCm,
    weightKg,
    targetWeightKg,
    goal,
    activityLevel,
  });

  const handleFinishAssessment = async () => {
    const updatedProfile: UserProfile = {
      id: profile?.id || currentUser?.id || `user-${Date.now()}`,
      name: currentUser?.name || profile?.name || 'Mi Perfil',
      email: currentUser?.email || profile?.email,
      provider: currentUser?.provider || profile?.provider,
      avatarUrl: currentUser?.avatarUrl || profile?.avatarUrl,
      gender,
      age,
      heightCm,
      currentWeightKg: weightKg,
      targetWeightKg,
      goal,
      activityLevel,
      weeklyPaceKg: plan.weeklyPaceKg,
      dailyCalorieTarget: plan.dailyCalories,
      dailyProteinTargetGrams: plan.dailyProteinGrams,
      dailyCarbsTargetGrams: plan.dailyCarbsGrams,
      dailyFatTargetGrams: plan.dailyFatGrams,
      dailyWaterTargetMl: Math.round(weightKg * 35), // ~35 ml per kg bodyweight
      bodyFatEstimate: bodyFat,
      workType,
      exerciseDaysPerWeek: exerciseDays,
      workoutType,
      dietaryPreference,
      mealsPerDay,
      macroExperience,
      mainMotivation,
      theme: profile?.theme || 'light',
      units: profile?.units || 'metric',
      createdAt: profile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveProfile(updatedProfile);

    if (currentUser) {
      authService.markAssessmentCompleted(currentUser.id);
      setCurrentUser({ ...currentUser, hasCompletedAssessment: true });
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
      <div className="space-y-4">
        {/* Progress Step Header */}
        <div className="flex items-center justify-between pb-2 border-b border-cream-200 dark:border-dark-border">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-solar text-bark-900 font-extrabold text-xs flex items-center justify-center">
              {step}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-solar-800 dark:text-solar">
              Evaluación Nutricional Profesional ({step}/5)
            </span>
          </div>

          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-6 h-1.5 rounded-full transition-all ${
                  i <= step ? 'bg-solar' : 'bg-cream-300 dark:bg-dark-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ---------------- PASO 1: OBJETIVO Y MOTIVACIÓN ---------------- */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="text-center">
              <h3 className="font-display font-extrabold text-2xl text-bark-900 dark:text-dark-text">
                ¿Qué deseas lograr?
              </h3>
              <p className="text-xs text-bark-600 dark:text-dark-muted mt-1">
                Ajustaremos con precisión clínica tu déficit o superávit calórico.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  id: 'lose',
                  title: 'Perder peso y grasa corporal',
                  desc: 'Déficit calórico de ~500 kcal/día preservando músculo con alta proteína.',
                  icon: <TrendingDown className="w-5 h-5 text-emerald-600" />,
                  tag: '-0.5 kg / sem',
                },
                {
                  id: 'maintain',
                  title: 'Mantener peso y recomposición',
                  desc: 'Equilibrio calórico exacto para tonificar y optimizar tu energía.',
                  icon: <Minus className="w-5 h-5 text-amber-600" />,
                  tag: 'Mantenimiento',
                },
                {
                  id: 'gain',
                  title: 'Ganar masa muscular (Hipertrofia)',
                  desc: 'Superávit limpio de ~300 kcal/día para construir tejido magro.',
                  icon: <TrendingUp className="w-5 h-5 text-macro-protein" />,
                  tag: '+0.25 kg / sem',
                },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setGoal(opt.id as GoalType)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                    goal === opt.id
                      ? 'border-solar bg-solar-50/70 dark:bg-solar/15 shadow-sm'
                      : 'border-cream-300 dark:border-dark-border bg-white dark:bg-dark-surface'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-cream-200 dark:bg-dark-elevated">
                      {opt.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-bark-900 dark:text-dark-text">
                        {opt.title}
                      </h4>
                      <p className="text-xs text-bark-500 dark:text-dark-muted">{opt.desc}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-cream-200 dark:bg-dark-elevated text-bark-700 shrink-0 ml-2">
                    {opt.tag}
                  </span>
                </div>
              ))}
            </div>

            {/* Motivation */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1.5">
                ¿Cuál es tu mayor motivación?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Mejorar mi salud y energía',
                  'Verme mejor en el espejo',
                  'Rendir en mis entrenamientos',
                  'Crear hábitos para toda la vida',
                ].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMainMotivation(m)}
                    className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-colors border ${
                      mainMotivation === m
                        ? 'border-solar bg-solar/20 text-bark-900 dark:text-dark-text font-bold'
                        : 'border-cream-300 dark:border-dark-border bg-white dark:bg-dark-surface text-bark-700 dark:text-dark-muted'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 px-4 bg-solar hover:bg-solar-600 rounded-2xl font-display font-bold text-bark-900 text-sm shadow-floating mt-2"
            >
              Siguiente paso →
            </button>
          </div>
        )}

        {/* ---------------- PASO 2: BIOMETRÍA Y COMPOSICIÓN ---------------- */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="text-center">
              <h3 className="font-display font-extrabold text-2xl text-bark-900 dark:text-dark-text">
                Datos corporales y biometría
              </h3>
              <p className="text-xs text-bark-600 dark:text-dark-muted mt-1">
                La ecuación Mifflin-St Jeor requiere estos parámetros para calcular tu tasa metabólica basal (BMR).
              </p>
            </div>

            {/* Sexo */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1.5">
                Sexo biológico
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-2.5 rounded-xl border-2 font-bold text-xs transition-colors ${
                    gender === 'male'
                      ? 'border-solar bg-solar/20 text-bark-900 dark:text-dark-text'
                      : 'border-cream-300 dark:border-dark-border bg-white dark:bg-dark-surface text-bark-600'
                  }`}
                >
                  Hombre
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-2.5 rounded-xl border-2 font-bold text-xs transition-colors ${
                    gender === 'female'
                      ? 'border-solar bg-solar/20 text-bark-900 dark:text-dark-text'
                      : 'border-cream-300 dark:border-dark-border bg-white dark:bg-dark-surface text-bark-600'
                  }`}
                >
                  Mujer
                </button>
              </div>
            </div>

            {/* Edad y Altura */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1">
                  Edad
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="14"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value, 10) || 18)}
                    className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl font-bold text-bark-900 dark:text-dark-text text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-bark-400">
                    años
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1">
                  Altura
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="120"
                    max="240"
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseInt(e.target.value, 10) || 170)}
                    className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl font-bold text-bark-900 dark:text-dark-text text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-bark-400">
                    cm
                  </span>
                </div>
              </div>
            </div>

            {/* Peso actual y Peso objetivo */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1">
                  Peso actual
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 60)}
                    className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl font-bold text-bark-900 dark:text-dark-text text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-bark-400">
                    kg
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1">
                  Peso objetivo
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={targetWeightKg}
                    onChange={(e) => setTargetWeightKg(parseFloat(e.target.value) || 60)}
                    className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl font-bold text-bark-900 dark:text-dark-text text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-bark-400">
                    kg
                  </span>
                </div>
              </div>
            </div>

            {/* Estimación de grasa corporal */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1">
                Estimación de grasa corporal aproximada
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                {[
                  { id: 'low', label: 'Bajo (<15%)' },
                  { id: 'medium', label: 'Medio (15-22%)' },
                  { id: 'high', label: 'Alto (>22%)' },
                  { id: 'unknown', label: 'No lo sé' },
                ].map((bf) => (
                  <button
                    key={bf.id}
                    type="button"
                    onClick={() => setBodyFat(bf.id as BodyFatLevel)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-semibold border ${
                      bodyFat === bf.id
                        ? 'border-solar bg-solar/20 text-bark-900 dark:text-dark-text font-bold'
                        : 'border-cream-300 dark:border-dark-border bg-white dark:bg-dark-surface text-bark-600'
                    }`}
                  >
                    {bf.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-4 bg-cream-200 dark:bg-dark-surface rounded-xl text-xs font-bold text-bark-800 dark:text-dark-text"
              >
                Atrás
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 px-4 bg-solar hover:bg-solar-600 rounded-xl font-display font-bold text-bark-900 text-sm shadow-floating"
              >
                Siguiente paso →
              </button>
            </div>
          </div>
        )}

        {/* ---------------- PASO 3: ACTIVIDAD Y ENTRENAMIENTO ---------------- */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="text-center">
              <h3 className="font-display font-extrabold text-2xl text-bark-900 dark:text-dark-text">
                Actividad y Entrenamiento
              </h3>
              <p className="text-xs text-bark-600 dark:text-dark-muted mt-1">
                Calcula tu gasto energético real más allá del reposo basal.
              </p>
            </div>

            {/* Trabajo diario */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1.5 flex items-center space-x-1">
                <Briefcase className="w-3.5 h-3.5" />
                <span>¿Cómo es tu trabajo o día habitual?</span>
              </label>
              <div className="space-y-2">
                {[
                  { id: 'sedentary', label: 'Sedentario', desc: 'Sentado la mayor parte del tiempo (oficina, estudio, conductor)' },
                  { id: 'standing', label: 'De pie / Activo', desc: 'En movimiento continuo (camarero, dependiente, enfermería, profesor)' },
                  { id: 'physical', label: 'Físico pesado', desc: 'Carga de peso o esfuerzo físico continuo (construcción, almacén)' },
                ].map((w) => (
                  <div
                    key={w.id}
                    onClick={() => setWorkType(w.id as WorkType)}
                    className={`p-2.5 rounded-xl border-2 cursor-pointer transition-colors ${
                      workType === w.id
                        ? 'border-solar bg-solar-50/70 dark:bg-solar/15 font-bold'
                        : 'border-cream-300 dark:border-dark-border bg-white dark:bg-dark-surface'
                    }`}
                  >
                    <span className="text-xs font-bold text-bark-900 dark:text-dark-text block">{w.label}</span>
                    <span className="text-[11px] text-bark-500 block">{w.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Frecuencia de ejercicio */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text flex items-center space-x-1">
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Días de ejercicio a la semana</span>
                </label>
                <span className="font-display font-extrabold text-sm text-solar-800 dark:text-solar">
                  {exerciseDays} {exerciseDays === 1 ? 'día' : 'días'}/semana
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="7"
                value={exerciseDays}
                onChange={(e) => setExerciseDays(parseInt(e.target.value, 10))}
                className="w-full accent-solar cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-bark-400 font-bold px-1">
                <span>0</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
              </div>
            </div>

            {/* Tipo de ejercicio */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1">
                Tipo de entrenamiento predominante
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'strength', label: 'Fuerza / Pesas / Gym' },
                  { id: 'cardio', label: 'Cardio / Running / Ciclismo' },
                  { id: 'hiit', label: 'CrossFit / HIIT funcional' },
                  { id: 'mixed', label: 'Combinado (Fuerza + Cardio)' },
                ].map((wt) => (
                  <button
                    key={wt.id}
                    type="button"
                    onClick={() => setWorkoutType(wt.id as WorkoutType)}
                    className={`p-2.5 rounded-xl text-xs font-semibold text-left border ${
                      workoutType === wt.id
                        ? 'border-solar bg-solar/20 text-bark-900 dark:text-dark-text font-bold'
                        : 'border-cream-300 dark:border-dark-border bg-white dark:bg-dark-surface text-bark-600'
                    }`}
                  >
                    {wt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setStep(2)}
                className="py-3 px-4 bg-cream-200 dark:bg-dark-surface rounded-xl text-xs font-bold text-bark-800 dark:text-dark-text"
              >
                Atrás
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-3 px-4 bg-solar hover:bg-solar-600 rounded-xl font-display font-bold text-bark-900 text-sm shadow-floating"
              >
                Siguiente paso →
              </button>
            </div>
          </div>
        )}

        {/* ---------------- PASO 4: HÁBITOS Y PREFERENCIAS ---------------- */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="text-center">
              <h3 className="font-display font-extrabold text-2xl text-bark-900 dark:text-dark-text">
                Hábitos y Preferencias
              </h3>
              <p className="text-xs text-bark-600 dark:text-dark-muted mt-1">
                Personalizamos tus comidas y recetas a tu estilo de alimentación.
              </p>
            </div>

            {/* Dieta */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1.5 flex items-center space-x-1">
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Preferencia de alimentación</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'standard', label: 'Sin restricciones (Como de todo)' },
                  { id: 'mediterranean', label: 'Mediterránea tradicional' },
                  { id: 'vegetarian', label: 'Vegetariana / Ovoláctea' },
                  { id: 'vegan', label: '100% Vegana' },
                  { id: 'keto', label: 'Keto / Baja en carbohidratos' },
                  { id: 'gluten_free', label: 'Sin Gluten / Celíaco' },
                ].map((dp) => (
                  <button
                    key={dp.id}
                    type="button"
                    onClick={() => setDietaryPreference(dp.id as DietaryPreference)}
                    className={`p-2.5 rounded-xl text-xs font-semibold text-left border ${
                      dietaryPreference === dp.id
                        ? 'border-solar bg-solar/20 text-bark-900 dark:text-dark-text font-bold'
                        : 'border-cream-300 dark:border-dark-border bg-white dark:bg-dark-surface text-bark-600'
                    }`}
                  >
                    {dp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Número de comidas al día */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1.5">
                ¿Cuántas comidas prefieres al día?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 3, label: '3 comidas', desc: 'Desayuno, Comida, Cena' },
                  { val: 4, label: '4 comidas', desc: 'Con merienda media tarde' },
                  { val: 5, label: '5 comidas', desc: 'Tomas más frecuentes' },
                ].map((m) => (
                  <button
                    key={m.val}
                    type="button"
                    onClick={() => setMealsPerDay(m.val)}
                    className={`p-2.5 rounded-xl border text-center ${
                      mealsPerDay === m.val
                        ? 'border-solar bg-solar/20 font-bold text-bark-900 dark:text-dark-text'
                        : 'border-cream-300 dark:border-dark-border bg-white dark:bg-dark-surface text-bark-600'
                    }`}
                  >
                    <span className="text-xs font-bold block">{m.label}</span>
                    <span className="text-[10px] text-bark-400 block">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Experiencia contando macros */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1">
                Tu experiencia registrando alimentos
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'beginner', label: 'Principiante', desc: 'Primera vez que controlo macros' },
                  { id: 'intermediate', label: 'Intermedio', desc: 'Conozco calorías y porciones' },
                  { id: 'advanced', label: 'Avanzado', desc: 'Llevo tiempo pesando comida' },
                ].map((exp) => (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => setMacroExperience(exp.id as MacroExperience)}
                    className={`p-2 rounded-xl border text-center ${
                      macroExperience === exp.id
                        ? 'border-solar bg-solar/20 font-bold text-bark-900 dark:text-dark-text'
                        : 'border-cream-300 dark:border-dark-border bg-white dark:bg-dark-surface text-bark-600'
                    }`}
                  >
                    <span className="text-xs font-bold block">{exp.label}</span>
                    <span className="text-[9px] text-bark-400 block">{exp.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setStep(3)}
                className="py-3 px-4 bg-cream-200 dark:bg-dark-surface rounded-xl text-xs font-bold text-bark-800 dark:text-dark-text"
              >
                Atrás
              </button>
              <button
                onClick={() => setStep(5)}
                className="flex-1 py-3 px-4 bg-solar hover:bg-solar-600 rounded-2xl font-display font-bold text-bark-900 text-sm shadow-floating"
              >
                Ver mi Diagnóstico Clínico →
              </button>
            </div>
          </div>
        )}

        {/* ---------------- PASO 5: DIAGNÓSTICO Y PRESCRIPCIÓN CLÍNICA ---------------- */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="text-center">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-full text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Plan Clínico Personalizado Listo</span>
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-bark-900 dark:text-dark-text">
                Tu Prescripción Nutricional
              </h3>
            </div>

            {/* Target Calories Banner */}
            <div className="bg-solar-50 dark:bg-solar/10 border-2 border-solar rounded-3xl p-5 text-center shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-solar-800 dark:text-solar">
                Calorías Diarias Asignadas
              </span>
              <div className="font-display font-black text-5xl text-bark-900 dark:text-dark-text my-1">
                {plan.dailyCalories.toLocaleString()}{' '}
                <span className="text-xl font-bold font-sans">kcal</span>
              </div>
              <div className="flex justify-center space-x-4 text-xs text-bark-600 dark:text-dark-muted mt-2">
                <span>Metabolismo Basal (BMR): <strong>{plan.bmr} kcal</strong></span>
                <span>·</span>
                <span>Gasto Diario (TDEE): <strong>{plan.tdee} kcal</strong></span>
              </div>
            </div>

            {/* Macros Distribution */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-macro-protein/10 dark:bg-macro-protein/20 border border-macro-protein/30 rounded-2xl p-3 text-center">
                <span className="text-[11px] font-bold text-macro-protein uppercase block">
                  Proteínas
                </span>
                <span className="font-display font-black text-2xl text-bark-900 dark:text-dark-text block my-0.5">
                  {plan.dailyProteinGrams}g
                </span>
                <span className="text-[10px] text-bark-500">
                  ~{plan.dailyProteinGrams * 4} kcal
                </span>
              </div>

              <div className="bg-macro-carbs/10 dark:bg-macro-carbs/20 border border-macro-carbs/30 rounded-2xl p-3 text-center">
                <span className="text-[11px] font-bold text-macro-carbs uppercase block">
                  Carbos
                </span>
                <span className="font-display font-black text-2xl text-bark-900 dark:text-dark-text block my-0.5">
                  {plan.dailyCarbsGrams}g
                </span>
                <span className="text-[10px] text-bark-500">
                  ~{plan.dailyCarbsGrams * 4} kcal
                </span>
              </div>

              <div className="bg-macro-fat/10 dark:bg-macro-fat/20 border border-macro-fat/30 rounded-2xl p-3 text-center">
                <span className="text-[11px] font-bold text-macro-fat uppercase block">
                  Grasas
                </span>
                <span className="font-display font-black text-2xl text-bark-900 dark:text-dark-text block my-0.5">
                  {plan.dailyFatGrams}g
                </span>
                <span className="text-[10px] text-bark-500">
                  ~{plan.dailyFatGrams * 9} kcal
                </span>
              </div>
            </div>

            {/* Estimation Pill */}
            {plan.weeksToGoal > 0 && (
              <div className="p-3 bg-cream-100 dark:bg-dark-surface rounded-2xl border border-cream-200 dark:border-dark-border text-xs flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-solar-700 dark:text-solar" />
                  <span>Meta: llegar a <strong>{targetWeightKg} kg</strong></span>
                </div>
                <span className="font-bold text-bark-900 dark:text-dark-text">
                  {formatWeightDate(plan.estimatedTargetDate)} ({plan.weeksToGoal} semanas)
                </span>
              </div>
            )}

            {/* Medical Disclaimer */}
            <div className="p-3 bg-cream-200/50 dark:bg-dark-elevated rounded-2xl border border-cream-300 dark:border-dark-border text-[10px] text-bark-600 dark:text-dark-muted flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Plan formulado con la ecuación clínica Mifflin-St Jeor. Esta app no sustituye la consulta o prescripción médica o dietoterápica especializada.
              </span>
            </div>

            {/* Action Finish Button */}
            <button
              onClick={handleFinishAssessment}
              className="w-full py-4 px-4 bg-solar hover:bg-solar-600 active:scale-[0.99] rounded-2xl font-display font-black text-bark-900 text-base shadow-floating flex items-center justify-center space-x-2 transition-transform"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>Comenzar mi transformación</span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
