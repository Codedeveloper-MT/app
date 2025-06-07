import React, { useState, useEffect } from 'react';

const MicrophoneIcon = () => (
  <svg 
    style={styles.microphoneIcon}
    viewBox="0 0 24 24" 
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 2C9.79 2 8 3.79 8 6v6c0 2.21 1.79 4 4 4s4-1.79 4-4V6c0-2.21-1.79-4-4-4zm-2 18.91c0-.61.54-1.11 1.2-1L15 21c.63.1 1-.29 1-.8v-.01c0-.37-.25-.71-.6-.81L11 18.2c-.41-.1-.8-.29-1.13-.54C7.67 16.12 6 13.27 6 10v-.5c0-.28.22-.5.5-.5s.5.22.5.5v.5c0 2.86 1.45 5.34 3.65 6.81.18.12.37.22.57.31l4.41 1.27c.97.28 1.64 1.15 1.64 2.15 0 1.22-.99 2.22-2.22 2.22h-5.5c-.62 0-1.12-.5-1.12-1.12v-.73z"/>
  </svg>
);

const Navigation = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [announceMessage, setAnnounceMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(true);

  useEffect(() => {
    const checkPlatform = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileRegex.test(userAgent.toLowerCase()));
    };

    const initSpeechRecognition = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setDestination(transcript);
          setIsRecording(false);

          // Only set the message, do NOT start navigation timer
          setAnnounceMessage(`Destination set to: ${transcript}. Press "Show Directions" to open Google Maps.`);
        };

        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setError('Could not recognize speech. Please try again or type manually.');
          setAnnounceMessage('Voice recognition failed. Please try again or type your destination.');
          setIsRecording(false);
        };

        recognitionInstance.onend = () => {
          setIsRecording(false);
        };

        setRecognition(recognitionInstance);
      } else {
        console.error('Speech recognition not supported');
        setError('Voice input is not supported in your browser.');
      }
    };

    checkPlatform();
    getCurrentLocation();
    initSpeechRecognition();
    setAnnounceMessage('Navigation page loaded. Getting your location...');

    return () => {
      if (recognition) {
        recognition.abort();
      }
      if (window.lastNavigationTimeout) {
        clearTimeout(window.lastNavigationTimeout);
      }
    };
  }, []);

  const getCurrentLocation = (callback) => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      setAnnounceMessage('Requesting your location...');
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          fetchAddress(latitude, longitude);
          setIsGettingLocation(false);
          setAnnounceMessage('Location found. Please speak or type your destination.');
          if (callback) callback();
        },
        error => {
          console.error('Error getting location:', error);
          setError('Unable to get current location. Please try again.');
          setAnnounceMessage('Could not get your location. Please try again.');
          setIsGettingLocation(false);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 0 // Don't use cached position
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setAnnounceMessage('Location services are not available in your browser.');
      setIsGettingLocation(false);
    }
  };

  const fetchAddress = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      setOrigin(data.display_name);
    } catch (err) {
      console.error('Error fetching address:', err);
      setAnnounceMessage('Could not get address for your location.');
    }
  };

  const toggleRecording = () => {
    if (!recognition) {
      setError('Voice input is not supported in your browser.');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setAnnounceMessage('Stopped listening.');
    } else {
      // Check location before starting recording
      if (!currentLocation) {
        getCurrentLocation(() => {
          startRecording();
        });
      } else {
        startRecording();
      }
    }
  };

  const startRecording = () => {
    if (window.lastNavigationTimeout) {
      clearTimeout(window.lastNavigationTimeout);
      window.lastNavigationTimeout = null;
    }
    
    setError(null);
    recognition.start();
    setIsRecording(true);
    setAnnounceMessage('Listening for destination... Please speak now.');
  };

  const openInGoogleMaps = (dest = destination) => {
    if (!dest) {
      setError('Please provide a destination');
      setAnnounceMessage('Please speak or type your destination before proceeding.');
      return;
    }

    // Save to location history with coordinates
    const historyEntry = {
      origin,
      destination: dest,
      startCoords: {
        lat: currentLocation.latitude,
        lon: currentLocation.longitude
      },
      startTime: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };
    
    const savedHistory = localStorage.getItem('navigationHistory');
    const history = savedHistory ? JSON.parse(savedHistory) : [];
    
    // Update end time of previous trip if it exists
    if (history.length > 0 && !history[0].endTime) {
      history[0].endTime = new Date().toISOString();
    }
    
    history.unshift(historyEntry); // Add new entry at the beginning
    localStorage.setItem('navigationHistory', JSON.stringify(history));

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${encodeURIComponent(dest)}&travelmode=driving`;
    window.open(mapsUrl, '_blank');
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && destination && !isGettingLocation) {
      openInGoogleMaps();
    }
  };

  return (
    <main className="navigation-container" style={styles.container} role="main">
      <h1 style={styles.visuallyHidden}>Navigation</h1>
      
      <div role="status" aria-live="polite" style={styles.visuallyHidden}>
        {announceMessage}
      </div>

      <form 
        className="input-container" 
        style={styles.inputContainer}
        onSubmit={(e) => {
          e.preventDefault();
          if (destination) openInGoogleMaps();
        }}
        role="search"
        aria-label="Navigation form"
      >
        <div style={styles.inputWrapper}>
          <label htmlFor="origin" style={styles.label}>Current Location</label>
          <input
            id="origin"
            type="text"
            style={styles.input}
            placeholder="Current location"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            readOnly
            aria-label="Current location"
            aria-readonly="true"
          />
        </div>

        <div style={styles.inputWrapper}>
          <label htmlFor="destination" style={styles.label}>
            Destination (Required)
          </label>
          <div style={styles.destinationContainer}>
            <input
              id="destination"
              type="text"
              style={styles.input}
              placeholder={isRecording ? "Listening..." : "Speak or type your destination"}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyPress={handleKeyPress}
              aria-label="Enter destination"
              aria-required="true"
              required
            />
            <button
              type="button"
              onClick={toggleRecording}
              style={styles.recordButton}
              aria-label={isRecording ? "Stop recording" : "Start recording destination"}
            >
              <MicrophoneIcon />
              <span style={styles.buttonText}>
                {isRecording ? "Stop Recording" : "Record Destination"}
              </span>
            </button>
            {/* New Show Directions button */}
            <button
              type="button"
              style={styles.button}
              onClick={() => {
                if (!currentLocation) {
                  setError('Current location not available.');
                  setAnnounceMessage('Current location not available.');
                  return;
                }
                if (!destination) {
                  setError('Please enter a destination.');
                  setAnnounceMessage('Please enter a destination.');
                  return;
                }
                openInGoogleMaps();
              }}
              disabled={!currentLocation || !destination}
              aria-label="Show directions in Google Maps"
            >
              Show Directions
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div 
          role="alert" 
          style={styles.error}
          aria-live="assertive"
        >
          {error}
        </div>
      )}

      <div style={styles.infoContainer}>
        <p style={styles.infoText}>
          {isGettingLocation ? 
            "Getting your location..." :
            isRecording ? 
              "Listening for destination... Speak clearly" :
              destination ? 
                "Navigation will start in 3 seconds. Press microphone to cancel and try again." :
                "Press the microphone button and speak your destination"
          }
        </p>
      </div>
    </main>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#fff',
    maxWidth: '600px',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0',
  },
  inputContainer: {
    marginBottom: '20px',
    width: '100%',
  },
  inputWrapper: {
    marginBottom: '15px',
  },
  label: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '5px',
    fontSize: '16px',
    fontWeight: '500',
    color: '#333',
  },
  destinationContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    gap: '20px',
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    height: '60px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    padding: '0 16px',
    fontSize: '16px',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    color: '#333',
    transition: 'border-color 0.2s ease',
    marginBottom: '10px',
    '&:focus': {
      borderColor: '#007AFF',
      outline: 'none',
    },
  },
  recordButton: {
    width: '100%',
    height: '80px',
    border: '2px solid #000',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    backgroundColor: isRecording => isRecording ? '#dc3545' : '#ffffff',
    color: isRecording => isRecording ? '#ffffff' : '#000000',
    marginTop: '20px',
    padding: '0 20px',
    '&:focus': {
      outline: '4px solid #99c9ff',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
    },
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: '0 6px 15px rgba(0,0,0,0.3)',
    },
    '&:active': {
      transform: 'scale(0.98)',
    },
  },
  button: {
    width: '100%',
    height: '60px',
    backgroundColor: '#007AFF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'background-color 0.2s ease',
    marginTop: '20px',
    '&:hover': {
      backgroundColor: '#0056b3',
    },
    '&:focus': {
      outline: '4px solid #99c9ff',
    },
    '&:disabled': {
      backgroundColor: '#ccc',
      cursor: 'not-allowed',
    },
  },
  buttonText: {
    color: 'inherit',
    fontSize: '20px',
    fontWeight: 'bold',
    flexGrow: 1,
    textAlign: 'left',
  },
  error: {
    color: '#dc3545',
    backgroundColor: '#fde7e9',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '16px',
    textAlign: 'center',
    border: '1px solid #dc3545',
  },
  infoContainer: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #ddd',
  },
  infoText: {
    margin: 0,
    fontSize: '16px',
    color: '#666',
    textAlign: 'center',
  },
  microphoneIcon: {
    width: '50px',
    height: '50px',
    marginRight: '15px',
    flexShrink: 0,
  }
};

export default Navigation;