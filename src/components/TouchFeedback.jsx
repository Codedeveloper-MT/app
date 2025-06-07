import React from 'react';
import { speechService } from '../services/SpeechService';

const TouchFeedback = ({ 
  children, 
  speakText, 
  onPress, 
  role = "button",
  className = "",
  style = {}
}) => {
  const handlePress = (e) => {
    e.preventDefault();
    speechService.speak(speakText);
    if (onPress) {
      onPress(e);
    }
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    e.target.style.opacity = '0.7';
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    e.target.style.opacity = '1';
  };

  return (
    <div
      role={role}
      tabIndex={0}
      className={className}
      style={{ 
        cursor: 'pointer',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        ...style
      }}
      onClick={handlePress}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onFocus={() => speechService.speak(speakText, 1.0, false)}
    >
      {children}
    </div>
  );
};

export default TouchFeedback;
