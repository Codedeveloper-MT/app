import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Capacitor } from '@capacitor/core';

class SpeechService {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  async speak(text) {
    if (this.isNative) {
      try {
        await TextToSpeech.speak({
          text,
          lang: 'en-US',
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
          category: 'ambient'
        });
      } catch (error) {
        console.error('Error with Capacitor Text-to-Speech:', error);
        this.fallbackSpeak(text);
      }
    } else {
      this.fallbackSpeak(text);
    }
  }

  fallbackSpeak(text) {
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Web Speech API failed:', error);
    }
  }

  async stop() {
    return this.stopSpeaking();
  }

  async stopSpeaking() {
    try {
      await TextToSpeech.stop();
    } catch (error) {
      console.error('Error stopping Text-to-Speech:', error);
      // Fallback to Web Speech API
      try {
        window.speechSynthesis.cancel();
      } catch (fallbackError) {
        console.error('Fallback speech synthesis stop failed:', fallbackError);
      }
    }
  }
}

export const speechService = new SpeechService();