import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link to="/ajustes" className="inline-flex items-center space-x-2 text-sm text-bark-600 hover:text-bark-900 dark:text-dark-text/70 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a Ajustes</span>
      </Link>

      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-solar-100 dark:bg-solar/20 flex items-center justify-center text-solar-700 dark:text-solar">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black font-display text-bark-900 dark:text-dark-text">Términos de Uso</h1>
          <p className="text-xs text-bark-500">Condiciones de utilización del servicio</p>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-dark-card rounded-3xl border border-cream-200 dark:border-dark-border space-y-4 text-sm text-bark-700 dark:text-dark-text/90 leading-relaxed shadow-sm">
        <h2 className="text-base font-bold text-bark-900 dark:text-dark-text">1. Aviso Médico y de Salud</h2>
        <p>NutriFit es una herramienta informativa de ayuda para el registro de comidas y macronutrientes. No constituye asesoramiento médico, diagnóstico ni tratamiento profesional. Consulta siempre a un profesional sanitario o dietista colegiado antes de iniciar cualquier cambio significativo en tu alimentación.</p>

        <h2 className="text-base font-bold text-bark-900 dark:text-dark-text">2. Exactitud de las Estimaciones</h2>
        <p>Las calorías y macronutrientes proporcionados por la base de datos o estimados por la IA son valores aproximados basados en tablas de composición oficiales y productos comerciales. Pueden variar según marcas, métodos de cocción y preparaciones.</p>

        <h2 className="text-base font-bold text-bark-900 dark:text-dark-text">3. Uso Responsable</h2>
        <p>El usuario se compromete a hacer un uso lícito y adecuado de la aplicación, absteniéndose de sobrecargar intencionadamente los servicios o intentar accesos no autorizados.</p>
      </div>
    </div>
  );
};
