// Service to manage VAPI AI settings
class SettingsService {
    constructor() {
        this.settings = this.loadSettings();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('vapi_settings');
        return savedSettings ? JSON.parse(savedSettings) : {
            voiceSpeed: 1.0,
            voiceId: 'alloy',
            assistantEnabled: false,
            lastUsed: null
        };
    }

    saveSettings(settings) {
        localStorage.setItem('vapi_settings', JSON.stringify(settings));
        this.settings = settings;
    }

    getVoiceSpeed() {
        return this.settings.voiceSpeed;
    }

    setVoiceSpeed(speed) {
        this.settings.voiceSpeed = speed;
        this.saveSettings(this.settings);
    }

    getVoiceId() {
        return this.settings.voiceId;
    }

    setVoiceId(voiceId) {
        this.settings.voiceId = voiceId;
        this.saveSettings(this.settings);
    }

    isAssistantEnabled() {
        return this.settings.assistantEnabled;
    }

    setAssistantEnabled(enabled) {
        this.settings.assistantEnabled = enabled;
        this.settings.lastUsed = enabled ? new Date().toISOString() : this.settings.lastUsed;
        this.saveSettings(this.settings);
    }
}

export const settingsService = new SettingsService();
