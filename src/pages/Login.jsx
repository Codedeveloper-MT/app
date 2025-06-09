import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Login.css';
import { speechService } from '../services/SpeechService';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showAccessibility, setShowAccessibility] = useState(false);
  const navigate = useNavigate();

  const speak = (text) => {
    speechService.speak(text);
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        speak('Please say your phone number');
      };

      recognition.onresult = (event) => {
        const number = event.results[0][0].transcript
          .toLowerCase()
          .replace(/\s+/g, '')
          .replace(/[^0-9]/g, '');
        setPhoneNumber(number);
        speak('Your phone number is ' + number.split('').join(' '));
      };

      recognition.start();
    } else {
      speak('Voice input is not supported on your device');
    }
  };

  const readScreen = () => {
    const elements = [
      'Login page',
      phoneNumber ? `Phone number: ${phoneNumber.split('').join(' ')}` : 'Phone number field is empty',
      'Use the voice input button to speak your phone number',
      'Or use the keyboard to type your number',
      'Double tap the login button to continue',
      'To create a new account, use the Register option in the accessibility menu'
    ];

    let index = 0;
    const readNext = () => {
      if (index < elements.length) {
        speak(elements[index]);
        index++;
      }
    };

    readNext();
    const interval = setInterval(readNext, 3000);
    return () => clearInterval(interval);
  };

  const handleLogin = async () => {
    if (!phoneNumber) {
      await speak('Please enter your phone number');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/login?phone=${phoneNumber}`);
      const data = await response.json();

      if (response.ok) {
        await speak(`Welcome back ${data.user.username}`);
        navigate('/home');
      } else {
        await speak(data.message || 'Login failed');
      }
    } catch (error) {
      console.error("Login error:", error);
      await speak('Something went wrong while logging in');
    }
  };

  useEffect(() => {
    const initialGreeting = () => {
      speechService.speak('Welcome to login. Enter your phone number or use voice input.');
    };

    const enableSpeech = () => {
      document.removeEventListener('click', enableSpeech);
      initialGreeting();
    };
    document.addEventListener('click', enableSpeech);

    return () => {
      document.removeEventListener('click', enableSpeech);
      speechService.stop();
    };
  }, []);

  return (
    <div className="login-bg">
      <h1 className="login-title">Login</h1>
      <input
        type="text"
        placeholder="Phone Number"
        className="login-input"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        aria-label="Phone number input"
      />
      <button 
        onClick={handleLogin} 
        className="login-button"
        aria-label="Login button"
      >
        Login
      </button>

      <button 
        className="mic-button"
        onClick={() => setShowAccessibility(!showAccessibility)}
        aria-label="Toggle accessibility options"
      >
        🎤
      </button>

      {showAccessibility && (
        <div className="accessibility-menu">
          <button 
            className="accessibility-option"
            onClick={startVoiceInput}
            aria-label="Start voice input"
          >
            🗣️ Voice Input
          </button>
          <button 
            className="accessibility-option"
            onClick={readScreen}
            aria-label="Read screen content"
          >
            📢 Read Screen
          </button>
          <button 
            className="accessibility-option"
            onClick={() => navigate('/register')}
            aria-label="Create new account"
          >
            ➕ Register New Account
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;
