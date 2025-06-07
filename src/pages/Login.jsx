import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Login.css';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (phoneNumber) {
      navigate('/home');
    } else {
      alert('Enter your phone number');
    }
  };

  return (
    <div className="login-bg">
      <h1 className="login-title">Login</h1>
      <input
        type="text"
        placeholder="Phone Number"
        className="login-input"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <button onClick={handleLogin} className="login-button">
        Login
      </button>
      <p className="login-register">
        Don't have an account?{' '}
        <span className="login-link" onClick={() => navigate('/register')}>
          Register
        </span>
      </p>
    </div>
  );
};

export default Login;
