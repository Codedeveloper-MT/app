import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { settingsService } from '../services/SettingsService';
import { updateVoiceSpeed } from './ai';
import { speechService } from '../services/SpeechService';

const Settings = () => {
  const navigate = useNavigate();
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);

  useEffect(() => {
    // Load current settings
    const currentSpeed = settingsService.getVoiceSpeed();
    setVoiceSpeed(currentSpeed);
    
    // Announce page load
    speechService.speak('Settings page. Adjust voice speed using the slider.');
  }, []);

  const handleSpeedChange = async (e) => {
    const newSpeed = parseFloat(e.target.value);
    setVoiceSpeed(newSpeed);
    await updateVoiceSpeed(newSpeed);
    speechService.speak(`Voice speed set to ${newSpeed}`);
  };

  const handleBackClick = () => {
    speechService.speak('Going back to home screen');
    navigate('/home');
  };

  return (
    <main style={styles.container} role="main">
      <div style={styles.header}>
        <button
          onClick={handleBackClick}
          style={styles.backButton}
          aria-label="Go back"
        >
          <FaArrowLeft />
        </button>
        <h1 style={styles.heading}>Settings</h1>
      </div>

      <div style={styles.settingSection}>
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
  label: {
    display: 'block',
    marginBottom: '15px',
    fontSize: '18px',
  },
  slider: {
    width: '100%',
    height: '40px',
    backgroundColor: '#000000',
    appearance: 'none',
    outline: 'none',
    opacity: '0.7',
    transition: 'opacity .2s',
    '&:hover': {
      opacity: '1',
    },
    '&::-webkit-slider-thumb': {
      appearance: 'none',
      width: '25px',
      height: '25px',
      backgroundColor: '#FFFFFF',
      cursor: 'pointer',
      borderRadius: '50%',
    },
    '&::-webkit-slider-runnable-track': {
      height: '2px',
      backgroundColor: '#FFFFFF',
    },
  },
  speedMarkers: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px',
    color: '#FFFFFF',
    opacity: '0.8',
  },
};

export default Settings;
