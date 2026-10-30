import React, { useState } from 'react';
import { apiAnalyzeFood } from '../../services/api';
import { FoodItem } from '../../types';
import { FoodReviewModal } from './FoodReviewModal';
import { Sparkles, Loader2, PenLine } from 'lucide-react';

export const TextTab: React.FC = () => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedFoods, setDetectedFoods] = useState<FoodItem[]>([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const examples = [
    '2 huevos revueltos y 1 rebanada de pan integral',
    '180g de pechuga de pollo con 1 taza de arroz blanco',
    '1 manzana fuji y 25g de nueces',
    '150g salmón a la plancha con patatas cocidas',
    'Bowl de avena con 1 plátano y leche',
  ];

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    try {
      const foods = await apiAnalyzeFood({ text: text.trim() });
      setDetectedFoods(foods);
      setIsReviewOpen(true);
    } catch (e) {
      console.error(e);
      alert('Error al analizar el texto. Por favor inténtalo de nuevo.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-2">
          Describe lo que has comido
        </label>
        <div className="relative">
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ejemplo: 2 huevos fritos, una tostada con aceite de oliva y un café cortado..."
            className="w-full p-4 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl text-bark-900 dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-solar resize-none leading-relaxed"
          />
          <PenLine className="w-4 h-4 text-bark-400 absolute right-3 bottom-3" />
        </div>
      </div>

      {/* Quick suggestions chips */}
      <div>
        <span className="text-[11px] font-semibold text-bark-500 dark:text-dark-muted block mb-2">
          Ideas rápidas:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {examples.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setText(item)}
              className="text-xs py-1 px-2.5 rounded-full bg-cream-200 dark:bg-dark-surface hover:bg-cream-300 dark:hover:bg-dark-elevated text-bark-700 dark:text-dark-muted transition-colors text-left"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={!text.trim() || isAnalyzing}
        className="w-full py-3.5 px-4 bg-solar hover:bg-solar-600 disabled:opacity-50 active:scale-[0.99] rounded-2xl font-display font-bold text-bark-900 text-sm shadow-floating flex items-center justify-center space-x-2 transition-all"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Interpretando ingredientes...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Analizar con Inteligencia Artificial</span>
          </>
        )}
      </button>

      {/* Review Modal */}
      <FoodReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        detectedFoods={detectedFoods}
      />
    </div>
  );
};
