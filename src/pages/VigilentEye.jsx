import React, { useEffect, useRef, useState } from 'react';
import { FaCamera, FaCameraRetro, FaSync, FaImage } from 'react-icons/fa';
import '../style/VigilentEye.css';
import { nativeServices } from '../services/NativeServices';

const VigilentEye = () => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const startCamera = async (useFrontCamera = false) => {
    try {
      setIsLoading(true);
      setError(null);

      if (nativeServices.isNative) {
        // For native platforms, we'll show the camera UI when taking a picture
        speak("Camera ready. Tap the screen to take a picture.");
        setIsLoading(false);
      } else {
        // For web, we'll use the video stream
        const constraints = {
          video: {
            facingMode: useFrontCamera ? "user" : "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          speak("Camera started successfully");
        }
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please make sure camera permissions are granted.');
      speak("Error accessing camera. Please make sure camera permissions are granted.");
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (!nativeServices.isNative && videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const takePicture = async () => {
    try {
      nativeServices.vibrate('light');
      const result = await nativeServices.takePicture();
      
      if (nativeServices.isNative) {
        setCapturedImage(result);
        speak("Picture taken successfully");
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      speak("Error taking picture. Please try again.");
    }
  };

  const toggleCamera = () => {
    nativeServices.vibrate('medium');
    stopCamera();
    setIsFrontCamera(!isFrontCamera);
    startCamera(!isFrontCamera);
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    startCamera(isFrontCamera);
    speak("Opening camera. Please grant camera permissions if prompted.");

    return () => {
      stopCamera();
    };
  }, []);

  if (error) {
    return (
      <div className="vigilent-eye-container error">
        <div className="error-message">
          <FaCamera className="error-icon" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vigilent-eye-container" onClick={takePicture}>
      {isLoading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Starting camera...</p>
        </div>
      )}
      
      {!nativeServices.isNative && (
        <video
          ref={videoRef}
          className="camera-feed"
          playsInline
          autoPlay
          muted
        />
      )}

      {capturedImage && (
        <img 
          src={capturedImage} 
          alt="Captured" 
          className="camera-feed"
        />
      )}

      <div className="camera-controls">
        <button 
          className="control-button"
          onClick={(e) => {
            e.stopPropagation();
            toggleCamera();
          }}
          aria-label="Switch camera"
        >
          <FaSync className="button-icon" />
          <span className="button-text">Switch Camera</span>
        </button>

        <button 
          className="control-button"
          onClick={(e) => {
            e.stopPropagation();
            takePicture();
          }}
          aria-label="Take picture"
        >
          <FaImage className="button-icon" />
          <span className="button-text">Take Picture</span>
        </button>
      </div>

      <div className="camera-status">
        <FaCameraRetro className="status-icon" />
        <span>{isFrontCamera ? 'Front Camera' : 'Back Camera'}</span>
      </div>
    </div>
  );
};

export default VigilentEye; 