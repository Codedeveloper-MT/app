import { useNavigate } from 'react-router-dom';
import { FaMicrophone, FaVideo, FaMapMarkerAlt, FaShareAlt, FaDirections, FaHistory, FaHome, FaCog } from 'react-icons/fa';
import '../style/Home.css';
import { nativeServices } from '../services/NativeServices';
import { speechService } from '../services/SpeechService';
import { useEffect } from 'react';
import React from 'react';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    speechService.speak('Welcome to the home screen. Here you can access Vee Assistance, Vigilant Eye, and location services.');
    return () => speechService.stop();
  }, []);

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
      const address = data.display_name || `Latitude ${position.coords.latitude.toFixed(4)} and Longitude ${position.coords.longitude.toFixed(4)}`;

      // WhatsApp sharing link
      const message = encodeURIComponent(`Here is my location: ${address}\nhttps://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`);
      const whatsappUrl = `https://wa.me/?text=${message}`;

      // Open WhatsApp (works on mobile and desktop)
      window.open(whatsappUrl, '_blank');

      speak("Opening WhatsApp to share your location.");
      nativeServices.showToast('Sharing location on WhatsApp...', 'short');
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

  const speakMenuOption = (text) => {
    speechService.speak(text);
  };

  const handleNavigation = (path) => {
    nativeServices.vibrate('light');
    navigate(path);
  };

  const handleNavigationWithSpeech = async (path, message) => {
    await speak(message); // Speak the message
    setTimeout(() => navigate(path), 1000); // Navigate after a short delay
  };

  return (
    <div className="home-bg">
      <div className="grid-container">
        <button
          className="grid-item"
          onClick={() => {
            speakMenuOption('Opening Vee Assistance');
            handleNavigation('/vee-assistance');
          }}
          aria-label="VEE Assistance"
        >
          <div className="grid-icon">
            <FaMicrophone />
          </div>
          <h2 className="grid-title">VEE Assistance</h2>
          <p className="grid-subtitle">Voice enabled</p>
        </button>

        <button
          className="grid-item"
          onClick={() => {
            speakMenuOption('Opening Vigilant Eye');
            handleNavigation('/vigilent-eye');
          }}
          aria-label="Vigilant Eye"
        >
          <div className="grid-icon">
            <FaVideo />
          </div>
          <h2 className="grid-title">Vigilent Eye</h2>
          <p className="grid-subtitle">Visual assistance</p>
        </button>

        <button
          className="grid-item"
          onClick={speakLocation}
          aria-label="Current Location"
        >
          <div className="grid-icon">
            <FaMapMarkerAlt />
          </div>
          <h2 className="grid-title">Current Location</h2>
          <p className="grid-subtitle">Tap to hear</p>
        </button>
        
        <button 
          onClick={shareLocationToWhatsApp} 
          className="grid-item" 
          aria-label="Share Location"
        >
          <div className="grid-icon">
            <FaShareAlt />
          </div>
          <h2 className="grid-title">Share Location</h2>
          <p className="grid-subtitle">Share to WhatsApp</p>
        </button>
        
        <button 
          onClick={() => handleNavigation('/navigation')} 
          className="grid-item"
          aria-label="Navigation"
        >
          <div className="grid-icon">
            <FaDirections />
          </div>
          <h2 className="grid-title">Navigation</h2>
          <p className="grid-subtitle">Get directions</p>
        </button>
        
        <button 
          onClick={() => handleNavigation('/location-history')} 
          className="grid-item"
          aria-label="Location History"
        >
          <div className="grid-icon">
            <FaHistory />
          </div>
          <h2 className="grid-title">Location History</h2>
          <p className="grid-subtitle">View past</p>
        </button>
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
