import Vapi from "@vapi-ai/web";
import { settingsService } from '../services/SettingsService';

export const vapi = new Vapi("61169b77-1bd5-4c83-9c23-b7be3b42492d");
const assistantId = import.meta.env.VITE_ASSISTANT_ID;

// Start the assistant
export const startAssistant = async () => {
  try {
    // Set initial voice speed from settings
    const voiceSpeed = settingsService.getVoiceSpeed();
    await vapi.setConfig({
      voice: { speed: voiceSpeed }
    });

    const session = await vapi.start(assistantId);
    settingsService.setAssistantEnabled(true);
    console.log("Assistant started:", session);
    return session;
  } catch (error) {
    console.error("Error starting assistant:", error);
    throw error;
  }
};

// Stop the assistant
export const stopAssistant = () => {
  try {
    vapi.stop();
    settingsService.setAssistantEnabled(false);
    console.log("Assistant stopped");
  } catch (error) {
    console.error("Error stopping assistant:", error);
    throw error;
  }
};

// Get current voice configuration
export const getVoiceConfig = async () => {
  try {
    const config = await vapi.getConfig();
    return config?.voice || { speed: 1.0 };
  } catch (error) {
    console.error("Error getting voice config:", error);
    return { speed: 1.0 };
  }
};

// Update voice speed
export const updateVoiceSpeed = async (speed) => {
  try {
    await vapi.setConfig({
      voice: { speed }
    });
    settingsService.setVoiceSpeed(speed);
    console.log("Voice speed updated to:", speed);
  } catch (error) {
    console.error("Error updating voice speed:", error);
    throw error;
  }
};

// Set up event listeners
export const setupEventListeners = (handlers) => {
  // Store handlers to ensure we remove the exact same functions
  const eventHandlers = new Map();
  
  Object.entries(handlers).forEach(([event, handler]) => {
    eventHandlers.set(event, handler);
    vapi.on(event, handler);
  });
  
  return () => {
    eventHandlers.forEach((handler, event) => {
      vapi.removeListener(event, handler);
    });
  };
};