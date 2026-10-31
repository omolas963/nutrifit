import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// PWA Service Worker Registration with skipWaiting, clientsClaim & update dispatch
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Poll for updates every 10 minutes
        setInterval(() => {
          registration.update();
        }, 1000 * 60 * 10);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                window.dispatchEvent(new CustomEvent('nutrifit-update-available'));
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn('PWA ServiceWorker registration failed:', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
