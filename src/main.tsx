import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './viewport-overrides.css';
import './immersive-shell.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);