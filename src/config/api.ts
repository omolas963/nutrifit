import { Capacitor } from '@capacitor/core';

// In native Capacitor builds, relative '/api' calls fail with 404 because
// the webview runs under capacitor://localhost or http://localhost.
// On the web (PWA/browser), relative paths are preserved so reverse proxy
// and same-origin cookies/routing work smoothly.
export const API_BASE_URL =
  typeof window !== 'undefined' && Capacitor.isNativePlatform()
    ? 'https://nutrifit-ie73.onrender.com'
    : '';

export function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extraHeaders };
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('nutrifit_current_user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user && user.id) {
          headers['x-user-id'] = user.id;
        }
      }
    } catch {
      // Ignore
    }
  }
  return headers;
}
