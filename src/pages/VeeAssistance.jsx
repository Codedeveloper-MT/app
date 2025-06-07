import React, { useState, useEffect } from "react";
import {
  startAssistant,
  stopAssistant,
  updateVoiceSpeed,
  setupEventListeners,
} from "./ai";
import "../style/VeeAssistance.css";
import styled, { keyframes } from 'styled-components';

const glowAnimation = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 255, 255, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(0, 255, 255, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 255, 255, 0);
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #000;
`;

const Circle = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  margin-bottom: 32px;
  
  &:before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top: 2px solid #0ff;
    border-right: 2px solid #0ff;
    animation: ${glowAnimation} 2s linear infinite;
  }

  &:after {
    content: '';
    position: absolute;
    width: 94%;
    height: 94%;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top: 2px solid #0f0;
    border-left: 2px solid #0f0;
    animation: ${glowAnimation} 2s linear infinite reverse;
  }
`;

const InnerText = styled.div`
  color: #0ff;
  font-size: 1.2rem;
  text-align: center;
  z-index: 1;
  user-select: none;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.7);
  white-space: pre-line;
`;

const SliderContainer = styled.div`
  margin-top: 24px;
  color: #0ff;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const VeeAssistance = () => {
  const [isActive, setIsActive] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);

  useEffect(() => {
    // Listen for assistant events
    const removeListeners = setupEventListeners({
      started: () => setIsActive(true),
      stopped: () => setIsActive(false),
    });
    return () => removeListeners();
  }, []);

  const handleToggle = async () => {
    if (!isActive) {
      await startAssistant();
      setIsActive(true);
    } else {
      stopAssistant();
      setIsActive(false);
    }
  };

  const handleSpeedChange = async (e) => {
    const speed = parseFloat(e.target.value);
    setVoiceSpeed(speed);
    await updateVoiceSpeed(speed);
  };

  return (
    <Container>
      <Circle onClick={handleToggle}>
        <InnerText>
          {isActive ? 'Click to\ndeactivate' : 'Click to\ntalk to me'}
        </InnerText>
      </Circle>
    </Container>
  );
};

export default VeeAssistance; 