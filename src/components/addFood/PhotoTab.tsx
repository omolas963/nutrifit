import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Loader2 } from 'lucide-react';
import { apiAnalyzeFood } from '../../services/api';
import { FoodItem } from '../../types';
import { FoodReviewModal } from './FoodReviewModal';

export const PhotoTab: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedFoods, setDetectedFoods] = useState<FoodItem[]>([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setIsAnalyzing(true);
    try {
      const foods = await apiAnalyzeFood({ imageBase64: imagePreview });
      setDetectedFoods(foods);
      setIsReviewOpen(true);
    } catch (e) {
      console.error(e);
      alert('No se pudo procesar la imagen. Verifica la conexión o intenta con otra foto.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {imagePreview ? (
        <div className="space-y-4">
          {/* Photo Preview Container with simulated Fitia scanning tags */}
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-black border-2 border-solar shadow-md">
            <img
              src={imagePreview}
              alt="Foto del plato de comida"
              className="w-full h-full object-cover"
            />

            {/* Corner camera reticle markers */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg" />

            {/* Scanning beam animation when analyzing */}
            {isAnalyzing && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-solar to-transparent shadow-[0_0_15px_#FFC62E] animate-bounce top-1/2 -translate-y-1/2" />
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-3 px-4 bg-cream-200 dark:bg-dark-surface hover:bg-cream-300 dark:hover:bg-dark-elevated rounded-2xl font-bold text-bark-800 dark:text-dark-text text-sm transition-colors"
            >
              Cambiar foto
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex-1 py-3 px-4 bg-solar hover:bg-solar-600 disabled:opacity-60 rounded-2xl font-display font-bold text-bark-900 text-sm shadow-floating flex items-center justify-center space-x-2 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Identificando alimentos...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Analizar plato con IA</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-cream-300 dark:border-dark-border rounded-3xl p-8 text-center cursor-pointer hover:border-solar dark:hover:border-solar transition-colors bg-cream-100/50 dark:bg-dark-surface/50"
          >
            <div className="w-16 h-16 rounded-3xl bg-solar-100 dark:bg-solar/20 text-solar-700 dark:text-solar flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Camera className="w-8 h-8" />
            </div>
            <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text">
              Toma una foto de tu plato
            </h4>
            <p className="text-xs text-bark-500 dark:text-dark-muted mt-1 max-w-xs mx-auto">
              Nuestra IA detectará cada alimento, calculará sus gramos y verificará calorías y macros reales.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-3 px-4 rounded-2xl bg-cream-200 dark:bg-dark-surface hover:bg-cream-300 dark:hover:bg-dark-elevated text-xs font-bold text-bark-800 dark:text-dark-text flex items-center justify-center space-x-2 transition-colors"
            >
              <Camera className="w-4 h-4 text-solar-700 dark:text-solar" />
              <span>Abrir cámara</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-3 px-4 rounded-2xl bg-cream-200 dark:bg-dark-surface hover:bg-cream-300 dark:hover:bg-dark-elevated text-xs font-bold text-bark-800 dark:text-dark-text flex items-center justify-center space-x-2 transition-colors"
            >
              <Upload className="w-4 h-4 text-solar-700 dark:text-solar" />
              <span>Subir de galería</span>
            </button>
          </div>
        </div>
      )}

      {/* Review & Edit Modal */}
      <FoodReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        detectedFoods={detectedFoods}
      />
    </div>
  );
};
