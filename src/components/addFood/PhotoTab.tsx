import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Loader2, AlertCircle, RefreshCw, SunMedium } from 'lucide-react';
import { apiAnalyzeFood, VisionAnalysisResponse, EnrichedFoodItem } from '../../services/api';
import { FoodReviewModal } from './FoodReviewModal';

export const PhotoTab: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visionData, setVisionData] = useState<VisionAnalysisResponse | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [errorWarning, setErrorWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resize and optimize image on client canvas to prevent heavy payloads
  const preprocessImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1400;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Client-side brightness check
          try {
            const imgData = ctx.getImageData(0, 0, width, height);
            const data = imgData.data;
            let totalLuminance = 0;
            const step = 4 * 10; // sample every 10th pixel for speed
            let samples = 0;
            for (let i = 0; i < data.length; i += step) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              totalLuminance += 0.299 * r + 0.587 * g + 0.114 * b;
              samples++;
            }
            const avgLuminance = totalLuminance / (samples || 1);
            if (avgLuminance < 15) {
              setErrorWarning('La foto parece muy oscura. Te recomendamos encender la luz o usar flash.');
            } else {
              setErrorWarning(null);
            }
          } catch {
            // Ignore canvas security errors if any
          }

          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const optimizedBase64 = await preprocessImage(file);
      setImagePreview(optimizedBase64);
    } catch {
      // Fallback to direct read
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setIsAnalyzing(true);
    setErrorWarning(null);

    try {
      const result = await apiAnalyzeFood({ imageBase64: imagePreview });

      if (!result.isFood) {
        setErrorWarning(result.rejectionReason || 'No parece comida. Por favor enfoca un plato o producto alimenticio.');
        return;
      }

      if (result.imageQuality === 'blurry' || result.imageQuality === 'too_dark') {
        setErrorWarning(result.rejectionReason || 'La foto no se distingue bien. Por favor repite la toma con mejor enfoque o luz.');
        return;
      }

      if ((!result.confirmedItems || result.confirmedItems.length === 0) && (!result.doubtfulItems || result.doubtfulItems.length === 0)) {
        setErrorWarning('No se han podido distinguir alimentos con suficiente certeza. Intenta sacar la foto más de cerca.');
        return;
      }

      setVisionData(result);
      setIsReviewOpen(true);
    } catch (e: any) {
      console.error(e);
      setErrorWarning(e.message || 'No se pudo procesar la imagen. Verifica tu conexión e inténtalo de nuevo.');
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

      {errorWarning && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-start space-x-3 text-amber-900 dark:text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed flex-1">
            <span className="font-bold block">Aviso de captura:</span>
            {errorWarning}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-bold underline shrink-0 text-amber-800 dark:text-amber-300"
          >
            Repetir foto
          </button>
        </div>
      )}

      {imagePreview ? (
        <div className="space-y-4">
          {/* Photo Preview Container with scan overlays */}
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-bark-900 border-2 border-solar shadow-md">
            <img
              src={imagePreview}
              alt="Foto del plato de comida"
              className="w-full h-full object-cover"
            />

            {/* Corner camera reticle markers */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg pointer-events-none" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg pointer-events-none" />

            {/* Scanning beam animation when analyzing */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-bark-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 rounded-2xl bg-solar/20 border border-solar text-solar flex items-center justify-center animate-pulse mb-3">
                  <Sparkles className="w-8 h-8 animate-spin" />
                </div>
                <span className="text-white font-display font-bold text-sm">Auditor de Visión Activo</span>
                <span className="text-cream-200 text-xs mt-1 text-center max-w-xs">
                  Detectando solo elementos visibles y calculando gramos sin alucinaciones...
                </span>
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-solar to-transparent shadow-[0_0_20px_#FFC62E] animate-bounce top-1/2 -translate-y-1/2" />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              className="py-3 px-4 bg-cream-200 dark:bg-dark-surface hover:bg-cream-300 dark:hover:bg-dark-elevated rounded-2xl font-bold text-bark-800 dark:text-dark-text text-sm transition-colors flex items-center space-x-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Cambiar foto</span>
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex-1 py-3 px-4 bg-solar hover:bg-solar-600 disabled:opacity-60 rounded-2xl font-display font-bold text-bark-900 text-sm shadow-floating flex items-center justify-center space-x-2 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analizando plato...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Analizar comida con IA</span>
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
              Fotografía tu plato o etiqueta
            </h4>
            <p className="text-xs text-bark-500 dark:text-dark-muted mt-1 max-w-xs mx-auto leading-relaxed">
              La IA identifica con precisión solo lo visible, descarta salsas o aceites ocultos y consulta las calorías reales de la base de datos española.
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

      {/* Review & Edit Confirmation Modal (Mandatory Screen) */}
      <FoodReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        imagePreview={imagePreview}
        detectedFoods={visionData?.confirmedItems || visionData?.foods || []}
        doubtfulItems={visionData?.doubtfulItems || []}
        ocrData={visionData?.ocrData}
        barcode={visionData?.barcode}
      />
    </div>
  );
};
