import { Link, useNavigate } from 'react-router-dom';
import { FaMicrophone, FaVideo, FaMapMarkerAlt, FaShareAlt, FaDirections, FaHistory, FaHome, FaCog } from 'react-icons/fa';
import '../style/Home.css';
import { nativeServices } from '../services/NativeServices';

const Home = () => {
  const navigate = useNavigate();

  const speakLocation = async () => {
    try {
      nativeServices.vibrate('light');
      const position = await nativeServices.getCurrentPosition();
      
      // Get readable address from coordinates using reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
      );
      const data = await response.json();
      
      // Extract the readable address
      const address = data.display_name || `Latitude ${position.coords.latitude.toFixed(4)} and Longitude ${position.coords.longitude.toFixed(4)}`;
      
      speak(`Your current location is: ${address}`);
      nativeServices.showToast('Location found!', 'short');
    } catch (error) {
      console.error('Error getting location:', error);
      speak("Unable to get your location. Please make sure location services are enabled.");
      nativeServices.showToast('Location error. Please try again.', 'short');
    }
  };

  const shareLocationToWhatsApp = async () => {
    try {
      nativeServices.vibrate('light');
      const position = await nativeServices.getCurrentPosition();

      // Get readable address from coordinates using reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
      );
      const data = await response.json();
      
      // Extract the readable address
      const address = data.display_name || `Latitude ${position.coords.latitude.toFixed(4)} and Longitude ${position.coords.longitude.toFixed(4)}`;
      
      await nativeServices.shareLocation(
        position.coords.latitude,
        position.coords.longitude,
        address
      );

      speak("Opening share options");
      nativeServices.showToast('Sharing location...', 'short');
    } catch (error) {
      console.error('Error sharing location:', error);
      speak("Unable to share your location. Please try again.");
      nativeServices.showToast('Share error. Please try again.', 'short');
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  };

  const handleNavigation = (path) => {
    nativeServices.vibrate('light');
    navigate(path);
  };

  return (
    <div className="home-bg">
      <div className="grid-container">
        <div 
          onClick={() => handleNavigation('/vee-assistance')} 
          className="grid-item"
          role="button"
          tabIndex={0}
        >
          <div className="grid-icon">
            <FaMicrophone />
          </div>
          <h2 className="grid-title">VEE Assistance</h2>
          <p className="grid-subtitle">Voice enabled</p>
        </div>
        
        <div 
          onClick={() => handleNavigation('/vigilent-eye')} 
          className="grid-item"
          role="button"
          tabIndex={0}
        >
          <div className="grid-icon">
            <FaVideo />
          </div>
          <h2 className="grid-title">Vigilent Eye</h2>
          <p className="grid-subtitle">Visual assistance</p>
        </div>
        
        <div 
          onClick={speakLocation} 
          className="grid-item" 
          role="button" 
          tabIndex={0}
        >
          <div className="grid-icon">
            <FaMapMarkerAlt />
          </div>
          <h2 className="grid-title">Current Location</h2>
          <p className="grid-subtitle">Tap to hear</p>
        </div>
        
        <div 
          onClick={shareLocationToWhatsApp} 
          className="grid-item" 
          role="button" 
          tabIndex={0}
        >
          <div className="grid-icon">
            <FaShareAlt />
          </div>
          <h2 className="grid-title">Share Location</h2>
          <p className="grid-subtitle">Share to WhatsApp</p>
        </div>
        
        <div 
          onClick={() => handleNavigation('/navigation')} 
          className="grid-item"
          role="button"
          tabIndex={0}
        >
          <div className="grid-icon">
            <FaDirections />
          </div>
          <h2 className="grid-title">Navigation</h2>
          <p className="grid-subtitle">Get directions</p>
        </div>
        
        <div 
          onClick={() => handleNavigation('/location-history')} 
          className="grid-item"
          role="button"
          tabIndex={0}
        >
          <div className="grid-icon">
            <FaHistory />
          </div>
          <h2 className="grid-title">Location History</h2>
          <p className="grid-subtitle">View past</p>
        </div>
      </div>

      <nav className="bottom-nav">
        <button 
          className="nav-button active"
          onClick={() => handleNavigation('/home')}
        >
          <FaHome />
          <span className="nav-label">Home</span>
        </button>
        <button 
          className="nav-button"
          onClick={() => handleNavigation('/vee-assistance')}
        >
          <FaMicrophone />
          <span className="nav-label">VEE Assistance</span>
        </button>
        <button 
          className="nav-button"
          onClick={() => handleNavigation('/vigilent-eye')}
        >
          <FaVideo />
          <span className="nav-label">Vigilent Eye</span>
        </button>
        <button 
          className="nav-button"
          onClick={() => handleNavigation('/settings')}
        >
          <FaCog />
          <span className="nav-label">Settings</span>
        </button>
      </nav>
    </div>
  );
};

export default Home;
