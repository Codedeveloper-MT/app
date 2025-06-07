import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import VeeAssistance from './pages/VeeAssistance';
import VigilentEye from './pages/VigilentEye';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/vigilent-eye" element={<VigilentEye />} />
        <Route path="/vee-assistance" element={<VeeAssistance />} />
      </Routes>
    </Router>
  );
}

export default App;
