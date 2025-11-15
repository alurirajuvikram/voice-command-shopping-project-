export type VoiceRecognitionCallback = (transcript: string, isFinal: boolean) => void;

export class VoiceRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private onResultCallback: VoiceRecognitionCallback | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  constructor() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionAPI();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      const isFinal = event.results[last].isFinal;

      if (this.onResultCallback) {
        this.onResultCallback(transcript, isFinal);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        this.recognition?.start();
      }
    };
  }

  setLanguage(language: string) {
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  startListening(onResult: VoiceRecognitionCallback, onError?: (error: string) => void) {
    if (!this.recognition) {
      onError?.('Speech recognition not supported in this browser');
      return false;
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError || null;
    this.isListening = true;

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Error starting recognition:', error);
      return false;
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

export const voiceRecognitionService = new VoiceRecognitionService();
