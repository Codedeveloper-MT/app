import React, { useState, useEffect } from 'react';

const Navigation = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [announceMessage, setAnnounceMessage] = useState('');

  useEffect(() => {
    const checkPlatform = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileRegex.test(userAgent.toLowerCase()));
    };
    
    checkPlatform();
    getCurrentLocation();
    setAnnounceMessage('Navigation page loaded. Please allow location access for better experience.');
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setAnnounceMessage('Requesting your location...');
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          fetchAddress(latitude, longitude);
          setAnnounceMessage('Location found. You can now enter your destination.');
        },
        error => {
          console.error('Error getting location:', error);
          setError('Unable to get current location. Please enter manually.');
          setAnnounceMessage('Could not get your location. Please enter your location manually.');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setAnnounceMessage('Location services are not available in your browser.');
    }
  };

  const fetchAddress = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      setOrigin(data.display_name);
      setAnnounceMessage(`Current location set to ${data.display_name}`);
    } catch (err) {
      console.error('Error fetching address:', err);
      setAnnounceMessage('Could not get address for your location.');
    }
  };

  const openInGoogleMaps = () => {
    if (!currentLocation) {
      setError('Please allow location access first');
      setAnnounceMessage('Please allow location access to use navigation.');
      return;
    }

    let mapsUrl;
    if (destination) {
      // If destination is provided, open directions
      mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
      setAnnounceMessage('Opening directions in Google Maps.');
    } else {
      // If no destination, just show current location
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${currentLocation.latitude},${currentLocation.longitude}`;
      setAnnounceMessage('Opening current location in Google Maps.');
    }

    // Open in new tab for web, or in app for mobile
    window.open(mapsUrl, '_blank');
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
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
          openInGoogleMaps();
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
          <label htmlFor="destination" style={styles.label}>Destination (Optional)</label>
          <input
            id="destination"
            type="text"
            style={styles.input}
            placeholder="Enter destination (optional)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onKeyPress={handleKeyPress}
            aria-label="Enter destination"
          />
        </div>

        <button 
          type="submit"
          style={styles.button}
          onClick={openInGoogleMaps}
          aria-label="View in Google Maps"
        >
          <span style={styles.buttonText}>
            View in Google Maps
          </span>
        </button>
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
          {isMobile ? 
            "Tap 'View in Google Maps' to open navigation in your Google Maps app" :
            "Click 'View in Google Maps' to open navigation in a new tab"
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
    display: 'block',
    marginBottom: '5px',
    fontSize: '16px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    width: '100%',
    height: '50px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    padding: '0 16px',
    fontSize: '16px',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    color: '#333',
    transition: 'border-color 0.2s ease',
    '&:focus': {
      borderColor: '#007AFF',
      outline: 'none',
    },
  },
  button: {
    width: '100%',
    height: '50px',
    backgroundColor: '#007AFF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#0056b3',
    },
    '&:focus': {
      outline: '3px solid #99c9ff',
    },
  },
  buttonText: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
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
    fontSize: '14px',
    color: '#666',
    textAlign: 'center',
  },
};

export default Navigation; 