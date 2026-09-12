import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';
import './styles/pages.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

/**
 * Offline support for the web app.
 *
 * Skipped in the desktop build: its files are already local, so a service
 * worker would cache a local protocol over itself for no benefit, and a cache
 * that outlived an update could serve stale assets.
 */
const isDesktop = 'desktop' in window;
if (!isDesktop && 'serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch(() => {
        // Offline support is a bonus; the app works fine without it.
      });
  });
}
