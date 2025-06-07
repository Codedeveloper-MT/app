import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Login.css';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showAccessibility, setShowAccessibility] = useState(false);
  const navigate = useNavigate();

  // Speech synthesis function
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  // Voice input function
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

  // Screen reader function
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

  const handleLogin = () => {
    if (phoneNumber) {
      navigate('/home');
    } else {
      speak('Please enter your phone number');
    }
  };

  useEffect(() => {
    // Initial greeting with new instructions
    speak('Welcome to the login page. The microphone button is at the bottom of the screen. Double tap it to access voice commands and registration.');
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
