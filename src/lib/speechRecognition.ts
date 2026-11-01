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

  public async start(options: SpeechListenerOptions): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const win = window as IWindow;
    const SpeechAPI = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechAPI) {
      options.onError('El reconocimiento de voz directo no está disponible en este navegador.', 'not-supported');
      return false;
    }

    // Stop and clean up any previous instance
    this.stop();
    this.userStoppedManually = false;

    // Check microphone permission beforehand via getUserMedia to prompt the browser dialog cleanly if not granted
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop temporary tracks immediately so hardware is available for speech recognition
        stream.getTracks().forEach((track) => track.stop());
      } catch (err: any) {
        console.warn('Microphone permission check error:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          options.onError(
            'Permiso de micrófono denegado. Haz clic en el candado 🔒 de la barra de direcciones de tu navegador y permite el micrófono.',
            'not-allowed'
          );
          return false;
        }
      }
    }

    try {
      // ALWAYS create a fresh instance of SpeechRecognition
      const rec = new SpeechAPI();
      this.recognition = rec;
      rec.lang = 'es-ES';
      // continuous = false prevents the infamous WebSocket drop / network error in Chrome
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentText = (final || interim).trim();
        if (currentText) {
          options.onTranscript(currentText, Boolean(final));
        }
      };

      rec.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        if (this.userStoppedManually || event.error === 'aborted') {
          // Normal user abort or stop, do not trigger error
          return;
        }

        let message = 'No se pudo reconocer la voz.';
        if (event.error === 'not-allowed') {
          message = 'Permiso de micrófono bloqueado. Haz clic en el candado 🔒 de tu navegador y permite el micrófono.';
        } else if (event.error === 'no-speech') {
          message = 'No se escuchó nada. Pulsa el micrófono y habla de nuevo.';
        } else if (event.error === 'network') {
          message = 'El servicio de voz del navegador no responde. Puedes grabar el audio o usar la pestaña Escribir.';
        } else if (event.error === 'audio-capture') {
          message = 'No se encontró ningún micrófono o está ocupado por otra aplicación.';
        }

        options.onError(message, event.error);
      };

      rec.onend = () => {
        this.isListening = false;
        options.onEnd();
      };

      rec.start();
      this.isListening = true;
      return true;
    } catch (err: any) {
      console.error('Failed to create or start SpeechRecognition:', err);
      options.onError('No se pudo iniciar el micrófono. Revisa los permisos de tu navegador.', 'start-failed');
      return false;
    }
  }

  public stop(): void {
    this.userStoppedManually = true;
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        try {
          this.recognition.stop();
        } catch {
          // Ignore
        }
      }
      this.recognition = null;
    }
    this.isListening = false;
  }

  public getStatus(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechDictationService();
