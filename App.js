import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Homepage from './Homepage';
import SecondScreen from './SecondScreen';
import Map from './src/navigation/Map';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import VeeAssistance from './pages/VeeAssistance';
import VigilentEye from './pages/VigilentEye';
import Navigation from './navigation/Navigation';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/vigilent-eye" element={<VigilentEye />} />
        <Route path="/vee-assistance" element={<VeeAssistance />} />
        <Route path="/navigation" element={<Navigation />} />
      </Routes>
    </Router>
  );
}
