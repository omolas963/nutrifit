import React from 'react';
import { useApp } from '../../context/AppContext';
import { Lightbulb, CheckCircle2 } from 'lucide-react';

export const GoalTipsCard: React.FC = () => {
  const { profile } = useApp();
  const goal = profile?.goal || 'lose';

  const tipsByGoal = {
    lose: [
      {
        title: 'Prioriza la proteína en cada comida',
        desc: 'Consumir entre 1.8 y 2.0 g/kg de proteína protege tu masa muscular durante el déficit y eleva la saciedad.',
      },
      {
        title: 'Aumenta tu actividad NEAT diaria',
        desc: 'Caminar entre 8.000 y 10.000 pasos al día quema grasa de forma pasiva sin fatigar tu sistema nervioso central.',
      },
      {
        title: 'Volumen alto en vegetales y fibra',
        desc: 'Alimentos con gran volumen y pocas calorías (brócoli, espinacas, calabacín) mantienen tu estómago lleno y satisfecho.',
      },
      {
        title: 'Pesajes consistentes en ayunas',
        desc: 'Pésate 2-3 veces por semana al despertar y evalúa la media semanal para no agobiarte por retenciones de líquidos puntuales.',
      },
    ],
    gain: [
      {
        title: 'Superávit moderado, no agresivo',
        desc: 'Un superávit de 300 kcal/día maximiza la síntesis proteica muscular sin acumular grasa innecesaria.',
      },
      {
        title: 'Sobrecarga progresiva en el gimnasio',
        desc: 'El estímulo mecánico del entrenamiento de fuerza es el interruptor que convierte tus calorías extra en músculo.',
      },
      {
        title: 'Densidad calórica saludable',
        desc: 'Añade frutos secos, aceite de oliva virgen extra y crema de cacahuete para alcanzar tus calorías sin pesadez estomacal.',
      },
      {
        title: 'Duerme entre 7 y 9 horas cada noche',
        desc: 'La mayor parte de la hormona del crecimiento y la recuperación muscular ocurre durante el sueño profundo.',
      },
    ],
    maintain: [
      {
        title: 'Flexibilidad metabólica',
        desc: 'Disfruta de tus comidas manteniendo el balance calórico semanal sin prohibirte ningún alimento.',
      },
      {
        title: 'Entrena para el rendimiento',
        desc: 'Enfócate en mejorar marcas de fuerza, resistencia y bienestar en tus entrenamientos diarios.',
      },
      {
        title: 'Hidratación constante',
        desc: 'Beber suficiente agua favorece la digestión, los niveles de energía y la regulación natural del apetito.',
      },
    ],
  }[goal];

  return (
    <div className="bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 shadow-card space-y-3">
      <div className="flex items-center space-x-2">
        <Lightbulb className="w-5 h-5 text-solar-700 dark:text-solar" />
        <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text">
          Consejos prácticos para tu objetivo
        </h4>
      </div>

      <div className="space-y-2.5">
        {tipsByGoal.map((tip, i) => (
          <div
            key={i}
            className="p-3 bg-cream-100/70 dark:bg-dark-surface rounded-2xl flex items-start space-x-2.5 border border-cream-200/60 dark:border-dark-border/60"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-xs text-bark-900 dark:text-dark-text">
                {tip.title}
              </h5>
              <p className="text-[11px] text-bark-600 dark:text-dark-muted mt-0.5 leading-relaxed">
                {tip.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
