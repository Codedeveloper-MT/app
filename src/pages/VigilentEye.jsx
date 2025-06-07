import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import '../style/VigilentEye.css';

const nativeServices = {
  isNative: window.Capacitor?.isNativePlatform?.() ?? false,
};

export default function CameraComponent() {
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [detectionMode, setDetectionMode] = useState(null); // 'objects' or 'text'
  const [isCameraReady, setIsCameraReady] = useState(false); // Added state for camera readiness
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    setError('');
    setPhoto(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera API not supported in this browser');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('autoplay', 'true');
        videoRef.current.setAttribute('muted', 'true');
        videoRef.current.play();
        setIsCameraReady(true); // Set camera as ready
      }
    } catch (err) {
      setError(`Error accessing camera: ${err.message}`);
    }
  };

  const takePicture = async () => {
    if (nativeServices.isNative) {
      try {
        const image = await Camera.getPhoto({
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
          quality: 90,
        });
        setPhoto(image.dataUrl);
        setIsCameraReady(false);
      } catch (err) {
        setError(`Error taking picture: ${err.message}`);
      }
    } else {
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setPhoto(dataUrl);
        setIsCameraReady(false);

        // Stop camera stream
        const tracks = video.srcObject?.getTracks();
        tracks?.forEach((track) => track.stop());
        video.srcObject = null;
      }
    }
  };

  const stopCamera = () => {
    setIsCameraReady(false); // Reset camera readiness
    const tracks = videoRef.current?.srcObject?.getTracks();
    tracks?.forEach((track) => track.stop());
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera(); // Clean up
    };
  }, []);

  return (
    <div className="camera-container">
      <h2>Vigilent Eye</h2>
      {error && <p className="error-message">{error}</p>}      <div className="camera-buttons" role="group" aria-label="Camera controls">
        <button
          className="camera-btn detect"
          onClick={() => {
            setDetectionMode('objects');
            takePicture();
          }}
          aria-label="Activate camera for object detection"
          role="button"
          tabIndex={0}
        >
          <span className="btn-icon" aria-hidden="true">📷</span>
          <span className="btn-text">
            Open Camera for Object Detection
            <span className="visually-hidden">Double tap to activate</span>
          </span>
        </button>

        <button
          className="camera-btn text"
          onClick={() => {
            setDetectionMode('text');
            takePicture();
          }}
          aria-label="Activate camera for text recognition"
          role="button"
          tabIndex={0}
        >
          <span className="btn-icon" aria-hidden="true">📝</span>
          <span className="btn-text">
            Open Camera for Text Recognition
            <span className="visually-hidden">Double tap to activate</span>
          </span>
        </button>
      </div>

      {photo && (
        <div className="preview-container">
          <img src={photo} alt="Captured" className="preview-image" />
          <div className="preview-controls">
            <button className="control-btn" onClick={() => setPhoto(null)}>
              Take New Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
