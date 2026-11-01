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
        // If there is already a waiting worker, dispatch immediately
        if (registration.waiting) {
          window.dispatchEvent(new CustomEvent('nutrifit-update-available'));
        }

        // Check for updates on tab focus / visibility
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            registration.update().catch(() => {});
          }
        });

        window.addEventListener('focus', () => {
          registration.update().catch(() => {});
        });

        // Poll for updates every 2 minutes
        setInterval(() => {
          registration.update().catch(() => {});
        }, 1000 * 60 * 2);

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
