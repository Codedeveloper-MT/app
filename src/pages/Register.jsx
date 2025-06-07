import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    username: '',
    gender: '',
  });  const navigate = useNavigate();

  // Speech synthesis function
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  // Voice input function for different fields
  const startVoiceInput = (field) => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        speak(`Please say your ${field}`);
      };
      
      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript.toLowerCase();
        
        if (field === 'phone number') {
          const number = text.replace(/\s+/g, '').replace(/[^0-9]/g, '');
          setFormData(prev => ({ ...prev, phoneNumber: number }));
          speak('Your phone number is ' + number.split('').join(' '));
        } else if (field === 'username') {
          setFormData(prev => ({ ...prev, username: text }));
          speak('Your username is ' + text);
        } else if (field === 'gender') {
          const gender = text.includes('male') ? 'male' : text.includes('female') ? 'female' : '';
          if (gender) {
            setFormData(prev => ({ ...prev, gender }));
            speak('Your gender is set to ' + gender);
          } else {
            speak('Please say either male or female');
          }
        }
      };
      
      recognition.start();
    } else {
      speak('Voice input is not supported on your device');
    }
  };

  // Screen reader function
  const readScreen = () => {
    const elements = [
      'Registration page',
      formData.phoneNumber ? `Phone number: ${formData.phoneNumber.split('').join(' ')}` : 'Phone number field is empty',
      formData.username ? `Username: ${formData.username}` : 'Username field is empty',
      formData.gender ? `Gender: ${formData.gender}` : 'Gender is not selected',
      'Use the voice input buttons to speak your information',
      'Or use the keyboard to type',
      'Double tap the register button when done'
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

  const handleRegister = () => {
    if (formData.phoneNumber && formData.username && formData.gender) {
      navigate('/');
    } else {
      speak('Please fill in all fields before registering');
    }
  };

  useEffect(() => {
    // Initial greeting
    speak('Welcome to registration. The microphone button is at the bottom of the screen. Double tap it to access voice commands.');
  }, []);

  return (
    <div className="register-bg">
      <div className="main-content">
        <h1 className="register-title">Register</h1>
        
        <div className="form-container">
          <input
            type="text"
            placeholder="Phone Number"
            className="register-input"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            aria-label="Phone number input"
          />
          <input
            type="text"
            placeholder="Username"
            className="register-input"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            aria-label="Username input"
          />
          <select
            className="register-select"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            aria-label="Gender selection"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <button 
            onClick={handleRegister} 
            className="register-button"
            aria-label="Register button"
          >
            Register
          </button>
         
        <button 
          className="accessibility-option"
          onClick={() => startVoiceInput('phone number')}
          aria-label="Start voice input for phone number"
        >
          🗣️ Speak Phone Number
        </button>
        <button 
          className="accessibility-option"
          onClick={() => startVoiceInput('username')}
          aria-label="Start voice input for username"
        >
          🗣️ Speak Username
        </button>
        <button 
          className="accessibility-option"
          onClick={() => startVoiceInput('gender')}
          aria-label="Start voice input for gender"
        >
          🗣️ Speak Gender
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
          onClick={() => navigate('/')}
          aria-label="Go to login page"
        >
          ⬅️ Back to Login
        </button>
        </div>
        </div>      
    </div>
  );
};

export default Register;
