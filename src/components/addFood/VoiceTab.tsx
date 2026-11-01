import React, { useState, useEffect, useRef } from 'react';
import { speechService, isSpeechRecognitionSupported } from '../../lib/speechRecognition';
import { apiAnalyzeFood, apiTranscribeAudio } from '../../services/api';
import { FoodItem } from '../../types';
import { FoodReviewModal } from './FoodReviewModal';
import { Mic, Sparkles, Loader2, RotateCcw, PenLine, Volume2, AlertCircle } from 'lucide-react';

interface VoiceTabProps {
  onSwitchToText?: () => void;
}

export const VoiceTab: React.FC<VoiceTabProps> = ({ onSwitchToText }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedFoods, setDetectedFoods] = useState<FoodItem[]>([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const nativeSpeechSupported = isSpeechRecognitionSupported();
  const mediaRecorderSupported = typeof window !== 'undefined' && Boolean(window.MediaRecorder);
  const supported = nativeSpeechSupported || mediaRecorderSupported;

  useEffect(() => {
    return () => {
      cleanupAudio();
      speechService.stop();
    };
  }, []);

  const cleanupAudio = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startListening = async () => {
    setErrorMsg(null);

    // MODE 1: Native Web Speech API (Chrome on Android, Windows, Mac, Edge)
    // Run natively WITHOUT getUserMedia so Android mic is never locked or starved
    if (nativeSpeechSupported) {
      setIsListening(true);
      const started = speechService.start({
        onTranscript: (text) => {
          if (text && text.trim()) {
            setTranscript(text);
          }
        },
        onError: (errMsg, errorCode) => {
          console.warn('SpeechRecognition error:', errorCode, errMsg);
          setIsListening(false);
          if (errorCode !== 'no-speech') {
            setErrorMsg(errMsg);
          }
        },
        onEnd: () => {
          setIsListening(false);
        },
      });

      if (!started) {
        setIsListening(false);
        // Fallback to media recorder if speech API couldn't launch
        startMediaRecorderListening();
      }
      return;
    }

    // MODE 2: MediaRecorder + Gemini fallback (for browsers without Web Speech API)
    startMediaRecorderListening();
  };

  const startMediaRecorderListening = async () => {
    cleanupAudio();
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMsg('Tu navegador no permite grabar audio.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(250);
      setIsListening(true);
    } catch (err: any) {
      console.warn('Microphone permission error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Permiso de micrófono bloqueado. Haz clic en el candado 🔒 junto a la URL del navegador para permitir el micrófono.');
      } else {
        setErrorMsg('No se pudo acceder al micrófono de tu dispositivo.');
      }
    }
  };

  const stopListening = async () => {
    if (nativeSpeechSupported) {
      speechService.stop();
      setIsListening(false);
      return;
    }

    // Stopping MediaRecorder fallback
    setIsListening(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore
      }
    }

    setTimeout(async () => {
      cleanupAudio();
      if (audioChunksRef.current.length === 0) return;

      setIsTranscribing(true);
      try {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const res = reader.result as string;
            resolve(res);
          };
          reader.onerror = reject;
        });
        reader.readAsDataURL(audioBlob);

        const base64Audio = await base64Promise;
        if (base64Audio) {
          const textFromAI = await apiTranscribeAudio({
            audioBase64: base64Audio,
            mimeType,
          });

          if (textFromAI && textFromAI.trim()) {
            setTranscript(textFromAI.trim());
            setErrorMsg(null);
          }
        }
      } catch (err: any) {
        console.warn('Fallback audio transcription error:', err);
        setErrorMsg('No se pudo transcribir el audio grabado. Puedes escribir la comida en la pestaña de al lado.');
      } finally {
        setIsTranscribing(false);
      }
    }, 300);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleReset = () => {
    speechService.stop();
    cleanupAudio();
    setIsListening(false);
    setIsTranscribing(false);
    setTranscript('');
    setErrorMsg(null);
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) return;
    speechService.stop();
    cleanupAudio();
    setIsListening(false);
    setIsAnalyzing(true);
    try {
      const res = await apiAnalyzeFood({ text: transcript.trim() });
      setDetectedFoods(res.confirmedItems || res.foods || []);
      setIsReviewOpen(true);
    } catch (e) {
      console.error(e);
      alert('Error al analizar los alimentos descritos. Inténtalo de nuevo.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!supported) {
    return (
      <div className="p-6 bg-cream-100 dark:bg-dark-surface rounded-3xl text-center space-y-3 border border-cream-300 dark:border-dark-border">
        <AlertCircle className="w-8 h-8 text-bark-400 mx-auto" />
        <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text">
          Micrófono no disponible en este navegador
        </h4>
        <p className="text-xs text-bark-600 dark:text-dark-muted">
          Tu navegador actual no admite la captura de voz directa. Puedes utilizar la pestaña de <strong>Escribir</strong> para introducir tus alimentos en texto libre con la misma inteligencia artificial.
        </p>
        {onSwitchToText && (
          <button
            type="button"
            onClick={onSwitchToText}
            className="py-2.5 px-4 bg-solar hover:bg-solar-600 rounded-xl text-xs font-bold text-bark-900 shadow-sm"
          >
            ✏️ Ir a Escribir comida
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center">
      {/* Pulsing Concentric Circles Around Microphone */}
      <div className="relative py-4 flex items-center justify-center">
        {isListening && (
          <>
            <div className="absolute w-44 h-44 rounded-full bg-solar/20 animate-ping duration-1000" />
            <div className="absolute w-36 h-36 rounded-full bg-solar/30 animate-pulse" />
          </>
        )}

        <button
          type="button"
          onClick={toggleListening}
          disabled={isTranscribing || isAnalyzing}
          className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-floating transition-all active:scale-95 ${
            isListening
              ? 'bg-solar-600 text-bark-900 ring-4 ring-solar-300'
              : 'bg-solar text-bark-900 hover:bg-solar-600'
          }`}
          aria-label={isListening ? 'Detener dictado de voz' : 'Iniciar dictado de voz'}
        >
          {isListening ? (
            <Mic className="w-10 h-10 animate-pulse stroke-[2.5]" />
          ) : isTranscribing ? (
            <Loader2 className="w-10 h-10 animate-spin text-bark-900" />
          ) : (
            <Mic className="w-10 h-10 stroke-[2.5]" />
          )}
        </button>
      </div>

      <p className="text-xs font-semibold text-bark-600 dark:text-dark-muted">
        {isListening ? (
          <span className="text-solar-800 dark:text-solar font-bold animate-pulse">
            🔴 Escuchando... habla y pulsa el botón al terminar
          </span>
        ) : isTranscribing ? (
          <span className="text-solar-800 dark:text-solar font-bold flex items-center justify-center space-x-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Transcribiendo tu audio con Inteligencia Artificial...</span>
          </span>
        ) : (
          'Toca el micrófono y di lo que has comido'
        )}
      </p>

      {/* Transcript Card & Editable Textbox */}
      <div className="min-h-[90px] p-3.5 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl text-left flex flex-col justify-between">
        {transcript ? (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-bark-500 dark:text-dark-muted block mb-1">
              Texto detectado (puedes editarlo si quieres):
            </span>
            <textarea
              rows={2}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full text-sm text-bark-900 dark:text-dark-text font-medium bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-solar rounded p-1 resize-none"
            />
          </div>
        ) : (
          <p className="text-xs text-bark-500 dark:text-dark-muted italic leading-relaxed py-2">
            Ejemplo: "Para comer he tomado 150 gramos de pechuga de pollo a la plancha con una taza de arroz blanco y ensalada mixta"
          </p>
        )}

        {transcript && (
          <div className="flex justify-between items-center pt-2 border-t border-cream-100 dark:border-dark-border/40 mt-1">
            <span className="text-[11px] text-bark-500 dark:text-dark-muted flex items-center space-x-1">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voz capturada en tiempo real</span>
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-bark-500 hover:text-bark-900 dark:text-dark-muted flex items-center space-x-1 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Borrar</span>
            </button>
          </div>
        )}
      </div>

      {/* Helpful Error with fallback action */}
      {errorMsg && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-left space-y-1.5">
          <p className="text-xs text-red-700 dark:text-red-300 font-semibold">{errorMsg}</p>
          {onSwitchToText && (
            <button
              type="button"
              onClick={onSwitchToText}
              className="text-xs text-bark-900 dark:text-solar font-bold underline flex items-center space-x-1"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>O pulsa aquí para escribirlo con el teclado</span>
            </button>
          )}
        </div>
      )}

      {/* Action Button */}
      <button
        type="button"
        onClick={handleAnalyze}
        disabled={!transcript.trim() || isAnalyzing || isTranscribing}
        className="w-full py-3.5 px-4 bg-solar hover:bg-solar-600 disabled:opacity-50 active:scale-[0.99] rounded-2xl font-display font-bold text-bark-900 text-sm shadow-floating flex items-center justify-center space-x-2 transition-all"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Desglosando alimentos con IA...</span>
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
