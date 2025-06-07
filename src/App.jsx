import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import VeeAssistance from './pages/VeeAssistance';
import VigilentEye from './pages/VigilentEye';
import Navigation from './pages/Navigation';
import LocationHistory from './pages/LocationHistory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/vigilent-eye" element={<VigilentEye />} />
        <Route path="/vee-assistance" element={<VeeAssistance />} />
        <Route path="/navigation" element={<Navigation />} />
        <Route path="/location-history" element={<LocationHistory />} />
      </Routes>
    </Router>
  );
}

export default App;
