// Web Speech API interface definitions for TypeScript
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as IWindow;
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

export function isMediaRecorderSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    typeof window.MediaRecorder !== 'undefined'
  );
}

export interface SpeechListenerOptions {
  onTranscript: (text: string, isFinal: boolean) => void;
  onError: (error: string, errorCode?: string) => void;
  onEnd: () => void;
}

export class SpeechDictationService {
  private recognition: any = null;
  private isListening = false;
  private userStoppedManually = false;
  private accumulatedText = '';
  private currentSessionText = '';
  private currentOptions: SpeechListenerOptions | null = null;
  private isMobile = false;

  constructor() {
    if (typeof window !== 'undefined' && navigator.userAgent) {
      this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
  }

  public start(options: SpeechListenerOptions): boolean {
    if (typeof window === 'undefined') return false;

    const win = window as IWindow;
    const SpeechAPI = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechAPI) {
      options.onError('El reconocimiento de voz no está soportado en este navegador.', 'not-supported');
      return false;
    }

    this.stop();
    this.userStoppedManually = false;
    this.accumulatedText = '';
    this.currentSessionText = '';
    this.currentOptions = options;

    return this.initAndStart();
  }

  private initAndStart(): boolean {
    if (typeof window === 'undefined' || !this.currentOptions) return false;

    const win = window as IWindow;
    const SpeechAPI = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechAPI) return false;

    try {
      const rec = new SpeechAPI();
      this.recognition = rec;
      rec.lang = 'es-ES';
      // On Android Chrome, continuous = true can freeze recognition after silence or short phrases.
      // On mobile we handle continuous dictation via automatic restart on onend.
      rec.continuous = !this.isMobile;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      this.currentSessionText = '';

      rec.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalChunk += item[0].transcript + ' ';
          } else {
            interimChunk += item[0].transcript;
          }
        }

        this.currentSessionText = finalChunk.trim();
        const activeText = [this.accumulatedText, this.currentSessionText, interimChunk.trim()]
          .filter(Boolean)
          .join(' ')
          .trim();

        if (activeText && this.currentOptions) {
          this.currentOptions.onTranscript(activeText, Boolean(finalChunk && !interimChunk));
        }
      };

      rec.onerror = (event: any) => {
        console.warn('SpeechRecognition event error:', event.error);
        if (this.userStoppedManually || event.error === 'aborted') {
          return;
        }

        // 'no-speech' is common when pausing. If user hasn't explicitly stopped, continue listening
        if (event.error === 'no-speech') {
          return;
        }

        let message = 'No se pudo capturar la voz.';
        if (event.error === 'not-allowed') {
          message = 'Permiso de micrófono bloqueado. Actívalo en los ajustes de tu navegador o teléfono.';
        } else if (event.error === 'network') {
          message = 'Error de conexión con el servicio de voz de Google.';
        } else if (event.error === 'audio-capture') {
          message = 'No se detecta el micrófono del dispositivo.';
        }

        if (this.currentOptions) {
          this.currentOptions.onError(message, event.error);
        }
      };

      rec.onend = () => {
        // Fold session text into accumulated
        if (this.currentSessionText) {
          this.accumulatedText = [this.accumulatedText, this.currentSessionText].filter(Boolean).join(' ').trim();
          this.currentSessionText = '';
        }

        // If the user hasn't stopped manually (e.g. mobile auto-ended phrase), restart seamlessly
        if (!this.userStoppedManually && this.isListening) {
          setTimeout(() => {
            if (!this.userStoppedManually && this.isListening) {
              try {
                this.initAndStart();
              } catch (e) {
                this.isListening = false;
                if (this.currentOptions) this.currentOptions.onEnd();
              }
            }
          }, 60);
          return;
        }

        this.isListening = false;
        if (this.currentOptions) {
          this.currentOptions.onEnd();
        }
      };

      rec.start();
      this.isListening = true;
      return true;
    } catch (err: any) {
      console.error('SpeechRecognition start failed:', err);
      if (this.currentOptions) {
        this.currentOptions.onError('Error al inicializar el micrófono.', 'start-failed');
      }
      return false;
    }
  }

  public stop(): void {
    this.userStoppedManually = true;
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        try {
          this.recognition.abort();
        } catch {
          // Ignore
        }
      }
      this.recognition = null;
    }
  }

  public getStatus(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechDictationService();
