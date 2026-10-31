import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link to="/ajustes" className="inline-flex items-center space-x-2 text-sm text-bark-600 hover:text-bark-900 dark:text-dark-text/70 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a Ajustes</span>
      </Link>

      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-solar-100 dark:bg-solar/20 flex items-center justify-center text-solar-700 dark:text-solar">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black font-display text-bark-900 dark:text-dark-text">Política de Privacidad</h1>
          <p className="text-xs text-bark-500">Tus datos nutricionales te pertenecen</p>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-dark-card rounded-3xl border border-cream-200 dark:border-dark-border space-y-4 text-sm text-bark-700 dark:text-dark-text/90 leading-relaxed shadow-sm">
        <h2 className="text-base font-bold text-bark-900 dark:text-dark-text">1. Almacenamiento Local</h2>
        <p>NutriFit guarda tu perfil biométrico, registros diarios de comida, agua y recetas directamente en tu navegador (mediante IndexedDB y LocalStorage). Ningún dato personal se vende ni se comparte con terceros.</p>

        <h2 className="text-base font-bold text-bark-900 dark:text-dark-text">2. Análisis Nutricional con IA</h2>
        <p>Cuando utilizas la función de análisis por foto o dictado de voz, el texto o imagen se envía a través de una conexión cifrada al servicio de IA exclusivamente para calcular los ingredientes y gramos estimados. Las imágenes no se almacenan permanentemente en el servidor.</p>

        <h2 className="text-base font-bold text-bark-900 dark:text-dark-text">3. Consulta de Bases de Datos</h2>
        <p>Las consultas nutricionales se realizan contra la base de datos oficial española precargada, Open Food Facts y el USDA. No se vincula tu identidad con las búsquedas que realizas.</p>

        <h2 className="text-base font-bold text-bark-900 dark:text-dark-text">4. Control Total</h2>
        <p>Puedes exportar una copia completa de tus datos o eliminarlos en cualquier momento desde la sección de Ajustes.</p>

        <h2 className="text-base font-bold text-bark-900 dark:text-dark-text">5. Asistente con IA y Memoria Persistente</h2>
        <p>Las consultas con el Asistente de IA y tus notas de memoria personal (alergias, gustos, intolerancias o preferencias dietéticas) se almacenan de forma segura y local en tu navegador (LocalStorage). Ninguna conversación ni recuerdo se almacena en archivos permanentes del servidor. Puedes inspeccionar, editar o borrar tu historial de chat y recuerdos en cualquier momento con un solo clic directamente desde la pestaña del Asistente.</p>
      </div>
    </div>
  );
};
