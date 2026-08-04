import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './viewport-overrides.css';
import './immersive-shell.css';
import './polish.css';
import './polish-mobile.css';
import './polish-legibility.css';
import './polish-wave2.css';
import './polish-wave2-repairs.css';
import './polish-wave3.css';
import './polish-wave3-repairs.css';
import './polish-wave4.css';
import './polish-wave4-repairs.css';
import './runtime-interaction-repair.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
