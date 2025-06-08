import React, { useState, useEffect } from "react";
import {
  startAssistant,
  stopAssistant,
  setupEventListeners,
} from "./ai";
import { settingsService } from '../services/SettingsService';
import "../style/VeeAssistance.css";
import styled, { keyframes } from 'styled-components';

const glowAnimation = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
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
  background: #000; /* Black background */
  cursor: pointer;
  user-select: none;
`;

const Circle = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: #000000;
  border: 2px solid #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
  }
`;

const InnerText = styled.div`
  color: #FFFFFF;
  text-align: center;
  font-size: 18px;
  white-space: pre-line;
`;

const VeeAssistance = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Setup event listeners
    const removeListeners = setupEventListeners({
      started: () => setIsActive(true),
      stopped: () => setIsActive(false),
    });

    return () => {
      if (typeof removeListeners === "function") {
        removeListeners();
      }
    };
  }, []);

  const handleToggle = async () => {
    if (!isActive) {
      await startAssistant();
      setIsActive(true);
      settingsService.setAssistantEnabled(true);
    } else {
      stopAssistant();
      setIsActive(false);
      settingsService.setAssistantEnabled(false);
    }
  };

  return (
    <Container>
      <Circle onClick={handleToggle}>
        <InnerText>
          {isActive ? 'Active\nTap to stop' : 'Tap to start'}
        </InnerText>
      </Circle>
    </Container>
  );
};

export default VeeAssistance;