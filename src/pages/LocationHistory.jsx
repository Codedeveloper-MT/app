import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaRoute, FaClock } from 'react-icons/fa';
import { calculateDistance, formatDuration } from '../utils/distanceUtils';
import { speechService } from '../services/SpeechService';

const LocationHistory = () => {
  const [history, setHistory] = useState([]);
  const [totalStats, setTotalStats] = useState({ distance: 0, duration: 0 });
  const navigate = useNavigate();  useEffect(() => {
    // Load history and calculate stats from localStorage when component mounts
    const loadHistory = () => {
      const savedHistory = localStorage.getItem('navigationHistory');
      if (savedHistory) {
        const historyData = JSON.parse(savedHistory);
        setHistory(historyData);
        
        // Announce number of entries
        const entriesMessage = `You have ${historyData.length} navigation ${historyData.length === 1 ? 'entry' : 'entries'} in your history.`;
        speechService.speak(entriesMessage);

        // Calculate total stats
        let totalDistance = 0;
        let totalDuration = 0;

        historyData.forEach(entry => {
          if (entry.startTime) {
            const endTime = entry.endTime || new Date().toISOString();
            const duration = (new Date(endTime) - new Date(entry.startTime)) / 1000;
            totalDuration += duration;

            // If we have coordinates, calculate distance
            if (entry.startCoords) {
              totalDistance += calculateDistance(
                entry.startCoords.lat,
                entry.startCoords.lon,
                entry.endCoords ? entry.endCoords.lat : entry.startCoords.lat,
                entry.endCoords ? entry.endCoords.lon : entry.startCoords.lon
              );
            }
          }
        });        setTotalStats({
          distance: Math.round(totalDistance * 10) / 10,
          duration: totalDuration
        });

        // Announce stats using speech service
        const statsMessage = `You have traveled a total of ${Math.round(totalDistance)} kilometers over ${formatDuration(new Date(0).toISOString(), new Date(totalDuration * 1000).toISOString())}`;
        speechService.speak(statsMessage);
      }
    };
    loadHistory();
  }, []);  const clearHistory = () => {
    localStorage.removeItem('navigationHistory');
    setHistory([]);
    speechService.speak('Navigation history cleared');
  };
  const handleBackClick = () => {
    speechService.speak('Going back to home screen');
    navigate('/home');
  };  const handleKeyPress = (event, entry) => {
    if (event.key === 'Enter' || event.key === ' ') {
      speakHistoryDetails(entry);
    }
  };
  const speakHistoryDetails = (entry) => {
    const distance = entry.startCoords ? 
      calculateDistance(
        entry.startCoords.lat,
        entry.startCoords.lon,
        entry.endCoords ? entry.endCoords.lat : entry.startCoords.lat,
        entry.endCoords ? entry.endCoords.lon : entry.startCoords.lon
      ) : 0;
    
    const duration = entry.startTime ? 
      formatDuration(entry.startTime, entry.endTime || new Date().toISOString()) : '';
    
    const message = `Navigation details: From ${entry.origin} to ${entry.destination}. ` +
      (distance ? `Distance traveled: ${distance} kilometers. ` : '') +
      (duration ? `Trip duration: ${duration}.` : '');
    
    speechService.speak(message);
  };

  return (
    <main className="location-history-container" style={styles.container} role="main">
      {history.length === 0 ? (
        <p style={styles.emptyMessage}>No navigation history available</p>
      ) : (
        <>
          <button 
            onClick={clearHistory} 
            style={styles.clearButton}
            aria-label="Clear history"
          >
            Clear History
          </button>
          <div style={styles.historyList}>
            {history.map((entry, index) => (              <button
                key={index}
                onClick={() => speakHistoryDetails(entry)}
                onKeyPress={(e) => handleKeyPress(e, entry)}
                onFocus={() => {
                  const message = `Navigation from ${entry.origin} to ${entry.destination}. `;
                  const timeMessage = entry.startTime ? 
                    `Trip duration: ${formatDuration(entry.startTime, entry.endTime || new Date().toISOString())}. ` :
                    '';
                  speechService.speak(message + timeMessage + 'Press Enter or Space to hear full details.');
                }}
                style={styles.historyItem}
                aria-label={`Navigate to ${entry.destination}`}
              >
                <div style={styles.timeStamp}>{new Date(entry.timestamp).toLocaleString()}</div>
                <div style={styles.locationDetails}>
                  <div style={styles.locationText}>
                    <strong>From:</strong> {entry.origin}
                  </div>
                  <div style={styles.locationText}>
                    <strong>To:</strong> {entry.destination}
                  </div>
                  <div style={styles.tripStats}>
                    {entry.startTime && (
                      <span style={styles.tripDuration}>
                        <FaClock style={styles.smallIcon} />
                        {formatDuration(
                          entry.startTime,
                          entry.endTime || new Date().toISOString()
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
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
  clearButton: {
    backgroundColor: '#FFFFFF',
    color: '#000000',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginBottom: '20px',
    fontSize: '16px',
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: '#E0E0E0',
    },
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  historyItem: {
    border: '2px solid #FFFFFF',
    borderRadius: '8px',
    padding: '15px',
    backgroundColor: '#000000',
    width: '100%',
    display: 'block',
    textAlign: 'left',
    cursor: 'pointer',
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: '#333333',
    },
    '&:focus': {
      backgroundColor: '#333333',
      outline: '3px solid #FFFFFF',
    },
  },
  timeStamp: {
    fontSize: '14px',
    color: '#FFFFFF',
    marginBottom: '8px',
    opacity: '0.8',
  },
  locationDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  locationText: {
    fontSize: '16px',
    color: '#FFFFFF',
  },
  tripStats: {
    marginTop: '8px',
    display: 'flex',
    gap: '15px',
    color: '#FFFFFF',
    fontSize: '14px',
    opacity: '0.8',
  },
  tripDuration: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  smallIcon: {
    fontSize: '14px',
    color: '#FFFFFF',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: '16px',
    marginTop: '40px',
  },
};

export default LocationHistory;
