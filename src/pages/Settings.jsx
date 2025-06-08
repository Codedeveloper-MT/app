import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import {
  getVoiceConfig,
  updateVoiceSettings,
  VAPI_VOICES,
  updateVoiceSpeed,
} from '../services/ai';
import { settingsService } from '../services/SettingsService';

const Settings = () => {
  const navigate = useNavigate();
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState('alloy');

  // New states
  const [showEditFields, setShowEditFields] = useState(false);
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');

  useEffect(() => {
    const loadConfig = async () => {
      const config = await getVoiceConfig();
      setVoiceSpeed(config.speed || 1.0);
      setSelectedVoice(config.voiceId || 'alloy');
      speak('Settings page. Adjust voice settings using the controls.');
    };
    loadConfig();
  }, []);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceSpeed;
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeedChange = async (e) => {
    const newSpeed = parseFloat(e.target.value);
    setVoiceSpeed(newSpeed);
    await updateVoiceSpeed(newSpeed);
    settingsService.setVoiceSpeed(newSpeed);
    speak(`Voice speed set to ${newSpeed} times`);
  };

  const handleVoiceChange = async (e) => {
    const newVoice = e.target.value;
    setSelectedVoice(newVoice);
    await updateVoiceSettings({ voiceId: newVoice });
    settingsService.setVoiceId(newVoice);
    speak('Voice type changed. This is how I sound now.');
  };

  const handleBackClick = () => {
    speak('Going back to home screen');
    navigate('/home');
  };

  const handleDeleteAccount = () => {
    speak('Account deleted');
    alert('Your account has been deleted.'); // Replace with real delete logic
  };

  const handleEditToggle = () => {
    setShowEditFields(!showEditFields);
  };

  const handleSaveUserInfo = () => {
    speak(`Username set to ${username}, Gender set to ${gender}`);
    alert(`Saved! Username: ${username}, Gender: ${gender}`);
    setShowEditFields(false);
  };

  return (
    <main style={styles.container} role="main">
      <div style={styles.settingSection}>
        <div style={styles.settingItem}>
          <label htmlFor="voiceType" style={styles.label}>
            Assistant Voice
          </label>
          <select
            id="voiceType"
            value={selectedVoice}
            onChange={handleVoiceChange}
            style={styles.select}
          >
            {VAPI_VOICES.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.settingItem}>
          <label htmlFor="voiceSpeed" style={styles.label}>
            Voice Speed: {voiceSpeed}x
          </label>
          <input
            id="voiceSpeed"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={voiceSpeed}
            onChange={handleSpeedChange}
            style={styles.slider}
            aria-label="Adjust voice speed"
          />
          <div style={styles.speedMarkers}>
            <span>0.5x</span>
            <span>1x</span>
            <span>2x</span>
          </div>
        </div>

        <div style={styles.settingItem}>
          <button style={styles.button} onClick={handleDeleteAccount}>
            Delete Account
          </button>
        </div>

        <div style={styles.settingItem}>
          <button style={styles.button} onClick={handleEditToggle}>
            {showEditFields ? 'Cancel' : 'Edit Username & Gender'}
          </button>
        </div>

        {showEditFields && (
          <div style={styles.settingItem}>
            <input
              type="text"
              placeholder="Enter new username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Enter gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={styles.input}
            />
            <button style={styles.button} onClick={handleSaveUserInfo}>
              Save
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#000000',
    minHeight: '100vh',
    color: '#FFFFFF',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '10px 0',
    borderBottom: '1px solid #FFFFFF',
  },
  backButton: {
    background: 'none',
    border: '2px solid #FFFFFF',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#FFFFFF',
    padding: '8px',
    marginRight: '10px',
    borderRadius: '5px',
  },
  heading: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  settingSection: {
    marginBottom: '30px',
    padding: '20px',
    border: '2px solid #FFFFFF',
    borderRadius: '8px',
  },
  settingItem: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    marginBottom: '15px',
    fontSize: '18px',
  },
  select: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#000000',
    color: '#FFFFFF',
    border: '2px solid #FFFFFF',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  slider: {
    width: '100%',
    height: '40px',
    backgroundColor: '#000000',
    appearance: 'none',
    outline: 'none',
    opacity: '0.7',
  },
  speedMarkers: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px',
    color: '#FFFFFF',
    opacity: '0.8',
  },
  button: {
    padding: '10px 15px',
    fontSize: '16px',
    backgroundColor: '#FFFFFF',
    color: '#000000',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginTop: '10px',
    marginBottom: '10px',
    borderRadius: '5px',
    fontSize: '16px',
    border: '1px solid #FFFFFF',
    backgroundColor: '#000000',
    color: '#FFFFFF',
  },
};

export default Settings;
