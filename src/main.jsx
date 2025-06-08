import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Create root with concurrent mode
const root = createRoot(document.getElementById('root'), {
  unstable_concurrentUpdatesByDefault: true,
  unstable_strictMode: true
});

// Render app
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
