import React from 'react';
import { NutritionPlan, formatWeightDate } from '../../lib/nutritionCalc';
import { Flame, ShieldAlert, Award } from 'lucide-react';

interface StepSummaryProps {
  plan: NutritionPlan;
  onFinish: () => void;
  onPrev: () => void;
}

export const StepSummary: React.FC<StepSummaryProps> = ({ plan, onFinish, onPrev }) => {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <span className="text-xs font-bold text-solar-700 dark:text-solar uppercase tracking-wider">
          Paso 4 de 4 · Tu Plan Personalizado
        </span>
        <h2 className="font-display font-extrabold text-2xl text-bark-900 dark:text-dark-text mt-1">
          Tus calorías y macros diarios
        </h2>
        <p className="text-xs text-bark-600 dark:text-dark-muted mt-0.5">
          Calculado con rigor clínico según la ecuación Mifflin-St Jeor.
        </p>
      </div>

      {/* Main Target Banner */}
      <div className="bg-solar-50 dark:bg-solar/10 border-2 border-solar rounded-3xl p-5 text-center relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-center space-x-1.5 text-solar-700 dark:text-solar mb-1 font-bold text-xs uppercase tracking-wider">
          <Flame className="w-4 h-4 fill-current" />
          <span>Meta Calórica Diaria</span>
        </div>
        <div className="font-display font-black text-4xl sm:text-5xl text-bark-900 dark:text-dark-text leading-none my-1">
          {plan.dailyCalories.toLocaleString()} <span className="text-xl font-bold font-sans">kcal</span>
        </div>
        <p className="text-xs text-bark-600 dark:text-dark-muted mt-2">
          Gasto total estimado: <strong>{plan.tdee} kcal/día</strong>
        </p>

        {plan.weeksToGoal > 0 && (
          <div className="mt-3 pt-3 border-t border-solar/30 flex items-center justify-center space-x-1.5 text-xs text-bark-800 dark:text-dark-text">
            <Award className="w-4 h-4 text-solar-700 dark:text-solar" />
            <span>
              Fecha estimada a tu peso objetivo: <strong>{formatWeightDate(plan.estimatedTargetDate)}</strong> ({plan.weeksToGoal} semanas)
            </span>
          </div>
        )}
      </div>

      {/* Macros Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-macro-protein/10 dark:bg-macro-protein/20 border border-macro-protein/30 rounded-2xl p-3 text-center">
          <span className="text-[11px] font-bold text-macro-protein uppercase tracking-wider block">
            Proteínas
          </span>
          <span className="font-display font-extrabold text-2xl text-bark-900 dark:text-dark-text block my-0.5">
            {plan.dailyProteinGrams}g
          </span>
          <span className="text-[10px] text-bark-600 dark:text-dark-muted">
            ~{plan.dailyProteinGrams * 4} kcal
          </span>
        </div>

        <div className="bg-macro-carbs/10 dark:bg-macro-carbs/20 border border-macro-carbs/30 rounded-2xl p-3 text-center">
          <span className="text-[11px] font-bold text-macro-carbs uppercase tracking-wider block">
            Carbohidratos
          </span>
          <span className="font-display font-extrabold text-2xl text-bark-900 dark:text-dark-text block my-0.5">
            {plan.dailyCarbsGrams}g
          </span>
          <span className="text-[10px] text-bark-600 dark:text-dark-muted">
            ~{plan.dailyCarbsGrams * 4} kcal
          </span>
        </div>

        <div className="bg-macro-fat/10 dark:bg-macro-fat/20 border border-macro-fat/30 rounded-2xl p-3 text-center">
          <span className="text-[11px] font-bold text-macro-fat uppercase tracking-wider block">
            Grasas (~27%)
          </span>
          <span className="font-display font-extrabold text-2xl text-bark-900 dark:text-dark-text block my-0.5">
            {plan.dailyFatGrams}g
          </span>
          <span className="text-[10px] text-bark-600 dark:text-dark-muted">
            ~{plan.dailyFatGrams * 9} kcal
          </span>
        </div>
      </div>

      {/* Safety Notice if adjusted */}
      {plan.isAdjustedForSafety && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-start space-x-2 text-xs text-amber-900 dark:text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            Hemos fijado tu objetivo en el <strong>mínimo de seguridad biológica</strong> para evitar déficits agresivos perjudiciales para tu salud metabólica.
          </p>
        </div>
      )}

      {/* Medical Disclaimer */}
      <div className="p-3.5 bg-cream-200/70 dark:bg-dark-surface rounded-2xl border border-cream-300 dark:border-dark-border text-[11px] text-bark-600 dark:text-dark-muted leading-relaxed">
        <p className="font-semibold text-bark-800 dark:text-dark-text mb-0.5">
          Aviso importante de salud:
        </p>
        Esta aplicación es una herramienta de registro, educación y autocontrol nutricional. No constituye asesoramiento médico, diagnóstico ni tratamiento de profesionales de la salud o dietistas-nutricionistas colegiados.
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-3 pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="py-3.5 px-5 bg-cream-200 dark:bg-dark-surface hover:bg-cream-300 dark:hover:bg-dark-elevated rounded-2xl font-bold text-bark-800 dark:text-dark-text text-sm transition-colors"
        >
          Atrás
        </button>
        <button
          type="button"
          onClick={onFinish}
          className="flex-1 py-3.5 px-4 bg-solar hover:bg-solar-600 active:scale-[0.99] rounded-2xl font-display font-bold text-bark-900 shadow-sm transition-all text-base"
        >
          Empezar ahora
        </button>
      </div>
    </div>
  );
};
