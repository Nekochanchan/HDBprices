import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against third-party cross-origin script errors (e.g., Disqus tracking/adblock in sandboxed iframes)
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message === 'Script error.' || event.filename?.includes('disqus')) {
      // Prevent cross-origin third-party script noise from failing app lifecycle
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

