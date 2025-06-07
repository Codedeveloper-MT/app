import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    username: '',
    gender: '',
  });

  const navigate = useNavigate();

  const handleRegister = () => {
    if (formData.phoneNumber && formData.username && formData.gender) {
      navigate('/');
    } else {
      alert('Please fill in all fields.');
    }
  };

  return (
    <div className="register-bg">
      <h1 className="register-title">Register</h1>
      <input
        type="text"
        placeholder="Phone Number"
        className="register-input"
        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
      />
      <input
        type="text"
        placeholder="Username"
        className="register-input"
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
      />
      <select
        className="register-select"
        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
      >
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <button onClick={handleRegister} className="register-button">
        Register
      </button>
    </div>
  );
};

export default Register;
