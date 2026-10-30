import React, { useState, useEffect } from 'react';
import { speechService, isSpeechRecognitionSupported } from '../../lib/speechRecognition';
import { apiAnalyzeFood } from '../../services/api';
import { FoodItem } from '../../types';
import { FoodReviewModal } from './FoodReviewModal';
import { Mic, MicOff, Sparkles, Loader2, RotateCcw } from 'lucide-react';

export const VoiceTab: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedFoods, setDetectedFoods] = useState<FoodItem[]>([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supported = isSpeechRecognitionSupported();

  useEffect(() => {
    return () => {
      speechService.stop();
    };
  }, []);

  const toggleListening = () => {
    setErrorMsg(null);
    if (isListening) {
      speechService.stop();
      setIsListening(false);
    } else {
      const ok = speechService.start({
        onTranscript: (text) => {
          setTranscript(text);
        },
        onError: (err) => {
          setErrorMsg(err);
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
        },
      });
      if (ok) setIsListening(true);
    }
  };

  const handleReset = () => {
    speechService.stop();
    setIsListening(false);
    setTranscript('');
    setErrorMsg(null);
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) return;
    speechService.stop();
    setIsListening(false);
    setIsAnalyzing(true);
    try {
      const foods = await apiAnalyzeFood({ text: transcript.trim() });
      setDetectedFoods(foods);
      setIsReviewOpen(true);
    } catch (e) {
      console.error(e);
      alert('Error al analizar el dictado de voz. Inténtalo de nuevo.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!supported) {
    return (
      <div className="p-6 bg-cream-100 dark:bg-dark-surface rounded-3xl text-center space-y-2 border border-cream-300 dark:border-dark-border">
        <MicOff className="w-8 h-8 text-bark-400 mx-auto" />
        <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text">
          Reconocimiento de voz no soportado
        </h4>
        <p className="text-xs text-bark-600 dark:text-dark-muted">
          Tu navegador actual no admite la API Web Speech. Puedes utilizar la pestaña de <strong>Escribir</strong> para introducir tus alimentos en texto libre con la misma inteligencia artificial.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-center">
      {/* Pulsing Concentric Circles Around Microphone (matching Fitia voice screen) */}
      <div className="relative py-6 flex items-center justify-center">
        {/* Outer pulse wave */}
        {isListening && (
          <>
            <div className="absolute w-44 h-44 rounded-full bg-solar/15 animate-ping duration-1000" />
            <div className="absolute w-36 h-36 rounded-full bg-solar/25" />
          </>
        )}

        <button
          onClick={toggleListening}
          className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-floating transition-all active:scale-95 ${
            isListening
              ? 'bg-solar-600 text-bark-900 ring-4 ring-solar-300'
              : 'bg-solar text-bark-900 hover:bg-solar-600'
          }`}
          aria-label={isListening ? 'Detener dictado de voz' : 'Iniciar dictado de voz'}
        >
          {isListening ? (
            <Mic className="w-10 h-10 animate-pulse stroke-[2.5]" />
          ) : (
            <Mic className="w-10 h-10 stroke-[2.5]" />
          )}
        </button>
      </div>

      <p className="text-xs font-semibold text-bark-600 dark:text-dark-muted">
        {isListening ? (
          <span className="text-solar-800 dark:text-solar font-bold animate-pulse">
            Escuchando... habla de forma natural
          </span>
        ) : (
          'Toca el micrófono y di lo que has comido'
        )}
      </p>

      {/* Transcript Card */}
      <div className="min-h-[90px] p-4 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl text-left flex flex-col justify-between">
        <p className="text-sm text-bark-900 dark:text-dark-text italic leading-relaxed">
          {transcript ? `"${transcript}"` : 'Ej: "Para la comida tomé 150 gramos de salmón a la plancha con una taza de arroz y ensalada mixta"'}
        </p>

        {transcript && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleReset}
              className="text-xs text-bark-500 hover:text-bark-900 dark:text-dark-muted flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <p className="text-xs text-macro-protein font-semibold">{errorMsg}</p>
      )}

      {/* Action Button */}
      <button
        onClick={handleAnalyze}
        disabled={!transcript.trim() || isAnalyzing}
        className="w-full py-3.5 px-4 bg-solar hover:bg-solar-600 disabled:opacity-50 active:scale-[0.99] rounded-2xl font-display font-bold text-bark-900 text-sm shadow-floating flex items-center justify-center space-x-2 transition-all"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analizando con IA...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Analizar lo que he dicho</span>
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
