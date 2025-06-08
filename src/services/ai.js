import Vapi from "@vapi-ai/web";
import { settingsService } from './SettingsService';

export const VAPI_VOICES = [
  { id: 'alloy', name: 'Alloy' },
  { id: 'echo', name: 'Echo' },
  { id: 'fable', name: 'Fable' },
  { id: 'onyx', name: 'Onyx' },
  { id: 'nova', name: 'Nova' }
];

let vapi = null;
const assistantId = import.meta.env.VITE_ASSISTANT_ID;

export const initializeVAPI = async () => {
  if (!vapi) {
    try {
      vapi = new Vapi(import.meta.env.VITE_VAPI_API_KEY_SETTINGS);
      // Get initial settings
      const settings = settingsService.loadSettings();
      // Voice settings will be applied when starting the assistant
      return vapi;
    } catch (error) {
      console.error("Error initializing VAPI:", error);
      throw error;
    }
  }
  return vapi;
};

export const startAssistant = async () => {
  await initializeVAPI();
  try {
    const settings = settingsService.loadSettings();
    const session = await vapi.start(assistantId, {
      voice: {
        id: settings.voiceId || 'alloy',
        speed: settings.voiceSpeed || 1.0
      }
    });
    settingsService.setAssistantEnabled(true);
    return session;
  } catch (error) {
    console.error("Error starting assistant:", error);
    throw error;
  }
};

export const stopAssistant = async () => {
  if (!vapi) return;
  try {
    await vapi.stop();
    settingsService.setAssistantEnabled(false);
  } catch (error) {
    console.error("Error stopping assistant:", error);
    throw error;
  }
};

export const updateVoiceSpeed = async (speed) => {
  await initializeVAPI();
  try {
    const settings = settingsService.loadSettings();
    if (vapi.isActive()) {
      await stopAssistant();
      await startAssistant();
    }
    settingsService.setVoiceSpeed(speed);
  } catch (error) {
    console.error("Error updating voice speed:", error);
    throw error;
  }
};

export const updateVoiceSettings = async ({ voiceId, speed }) => {
  await initializeVAPI();
  try {
    if (vapi.isActive()) {
      await stopAssistant();
      await startAssistant();
    }
    if (voiceId) settingsService.setVoiceId(voiceId);
    if (speed) settingsService.setVoiceSpeed(speed);
  } catch (error) {
    console.error("Error updating voice settings:", error);
    throw error;
  }
};

export const getVoiceConfig = async () => {
  const settings = settingsService.loadSettings();
  return {
    voiceId: settings.voiceId || 'alloy',
    speed: settings.voiceSpeed || 1.0
  };
};

export const setupEventListeners = (handlers) => {
  if (!vapi) {
    throw new Error("VAPI not initialized. Call initializeVAPI first.");
  }

  Object.entries(handlers).forEach(([event, handler]) => {
    if (typeof handler === "function") {
      vapi.on(event, handler);
    }
  });

  return () => {
    Object.entries(handlers).forEach(([event, handler]) => {
      if (typeof handler === "function") {
        vapi.off(event, handler);
      }
    });
  };
};
