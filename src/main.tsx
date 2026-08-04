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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
