import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, X, ArrowUpCircle } from 'lucide-react';

export const UpdateNotification: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [serverVersion, setServerVersion] = useState<string>('');

  useEffect(() => {
    // 1. Service Worker update event
    const handleSwUpdate = () => setShowUpdate(true);
    window.addEventListener('nutrifit-update-available', handleSwUpdate);

    // 2. Direct server version check
    const checkServerVersion = async () => {
      try {
        const res = await fetch('/api/version', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const storedBuild = localStorage.getItem('nutrifit_last_build_time');

        if (storedBuild && data.buildTime && storedBuild !== data.buildTime) {
          setShowUpdate(true);
          setServerVersion(data.version || '1.3.0');
        } else if (!storedBuild && data.buildTime) {
          // Store first time
          localStorage.setItem('nutrifit_last_build_time', data.buildTime);
        }
      } catch (err) {
        // Ignore offline / network blips
      }
    };

    checkServerVersion();

    // Check on focus / visibility
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkServerVersion();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Periodically check every 60 seconds
    const interval = setInterval(checkServerVersion, 60_000);

    return () => {
      window.removeEventListener('nutrifit-update-available', handleSwUpdate);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, []);

  const handleApplyUpdate = async () => {
    setIsUpdating(true);

    try {
      // 1. Fetch latest version info to update local reference
      const res = await fetch('/api/version', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.buildTime) {
          localStorage.setItem('nutrifit_last_build_time', data.buildTime);
        }
      }

      // 2. Clear all cache storages
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }

      // 3. Update Service Worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.update().catch(() => {});
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      }
    } catch (e) {
      console.warn('Update cleanup error:', e);
    }

    // 4. Force hard reload from server
    window.location.reload();
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-3 left-3 right-3 z-50 max-w-md mx-auto p-3.5 bg-bark-900/95 backdrop-blur-md text-white rounded-2xl shadow-floating border border-solar/70 flex items-center justify-between space-x-3 animate-fade-in">
      <div className="flex items-center space-x-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-solar text-bark-900 flex items-center justify-center font-bold shrink-0 shadow-sm animate-pulse">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="font-bold text-xs block text-solar truncate">
            ¡Nueva actualización disponible! {serverVersion ? `(v${serverVersion})` : ''}
          </span>
          <span className="text-[11px] text-cream-200 block truncate">
            Pulsa para activar las últimas mejoras
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-1.5 shrink-0">
        <button
          type="button"
          onClick={handleApplyUpdate}
          disabled={isUpdating}
          className="px-3 py-1.5 bg-solar hover:bg-solar-600 active:scale-95 text-bark-900 rounded-xl font-bold text-xs flex items-center space-x-1 shadow-sm transition-transform"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
          <span>{isUpdating ? 'Actualizando...' : 'Actualizar'}</span>
        </button>
        <button
          type="button"
          onClick={() => setShowUpdate(false)}
          className="p-1.5 text-cream-400 hover:text-white rounded-lg transition-colors"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
