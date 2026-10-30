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

export interface SpeechListenerOptions {
  onTranscript: (text: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

export class SpeechDictationService {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const win = window as IWindow;
      const SpeechAPI = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechAPI) {
        this.recognition = new SpeechAPI();
        this.recognition.lang = 'es-ES';
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
      }
    }
  }

  public start(options: SpeechListenerOptions): boolean {
    if (!this.recognition) {
      options.onError('El reconocimiento de voz no está soportado en este navegador.');
      return false;
    }

    if (this.isListening) {
      this.stop();
    }

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const currentText = final || interim;
      if (currentText) {
        options.onTranscript(currentText.trim(), Boolean(final));
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      let message = 'Error en el reconocimiento de voz';
      if (event.error === 'not-allowed') {
        message = 'Permiso de micrófono denegado en tu navegador.';
      } else if (event.error === 'no-speech') {
        message = 'No se detectó voz. Intenta hablar más cerca.';
      }
      options.onError(message);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      options.onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (err) {
      console.error('Failed to start recognition:', err);
      options.onError('No se pudo iniciar el micrófono.');
      return false;
    }
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignored
      }
      this.isListening = false;
    }
  }

  public getStatus(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechDictationService();
