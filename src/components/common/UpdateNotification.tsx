import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, X, CheckCircle2, Download, ArrowRight } from 'lucide-react';

export const UpdateNotification: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState<string>('');
  const [serverVersion, setServerVersion] = useState<string>('1.5.2');
  const [releaseNotes, setReleaseNotes] = useState<string>('');
  const [serverBuildTime, setServerBuildTime] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState(false);

  const checkServerVersion = async (forceShow = false) => {
    try {
      const res = await fetch('/api/version', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const storedBuild = localStorage.getItem('nutrifit_last_build_time');

      if (data.version) setServerVersion(data.version);
      if (data.releaseNotes) setReleaseNotes(data.releaseNotes);
      if (data.buildTime) setServerBuildTime(data.buildTime);

      if (forceShow || (storedBuild && data.buildTime && storedBuild !== data.buildTime)) {
        setShowUpdate(true);
      } else if (!storedBuild && data.buildTime) {
        localStorage.setItem('nutrifit_last_build_time', data.buildTime);
      }
    } catch (err) {
      // Ignore network errors
    }
  };

  useEffect(() => {
    checkServerVersion();

    // Listen to manual update checks from Settings
    const handleManualCheck = () => checkServerVersion(true);
    window.addEventListener('check_for_updates', handleManualCheck);

    // Listen to Service Worker update events
    const handleSwUpdate = () => setShowUpdate(true);
    window.addEventListener('nutrifit-update-available', handleSwUpdate);

    // Check periodically every 60 seconds
    const interval = setInterval(() => checkServerVersion(), 60_000);

    return () => {
      window.removeEventListener('check_for_updates', handleManualCheck);
      window.removeEventListener('nutrifit-update-available', handleSwUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleDownloadAndApplyUpdate = async () => {
    setIsDownloading(true);
    setDownloadProgress(10);
    setDownloadStatus('Iniciando descarga de la actualización...');

    try {
      // 1. Download updated APK package directly inside the app with stream progress
      const response = await fetch('/nutrifit.apk', { cache: 'no-store' });
      if (response.ok && response.body) {
        const contentLength = response.headers.get('content-length');
        const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
        const reader = response.body.getReader();
        let receivedBytes = 0;
        const chunks: BlobPart[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            receivedBytes += value.length;
            if (totalBytes > 0) {
              const pct = Math.min(90, Math.round((receivedBytes / totalBytes) * 85) + 10);
              setDownloadProgress(pct);
              setDownloadStatus(`Descargando actualización... ${pct}%`);
            }
          }
        }

        setDownloadProgress(92);
        setDownloadStatus('Empaquetando actualización...');

        // Create Blob and trigger direct in-app download without opening external links
        const blob = new Blob(chunks, { type: 'application/vnd.android.package-archive' });
        const blobUrl = window.URL.createObjectURL(blob);
        const tempLink = document.createElement('a');
        tempLink.href = blobUrl;
        tempLink.download = `NutriFit-v${serverVersion || '1.5.2'}.apk`;
        tempLink.style.display = 'none';
        document.body.appendChild(tempLink);
        tempLink.click();

        setTimeout(() => {
          document.body.removeChild(tempLink);
          window.URL.revokeObjectURL(blobUrl);
        }, 3000);
      }

      // 2. Clean Web Caches and update Service Worker
      setDownloadProgress(96);
      setDownloadStatus('Actualizando memoria y componentes...');
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.update().catch(() => {});
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      }

      if (serverBuildTime) {
        localStorage.setItem('nutrifit_last_build_time', serverBuildTime);
      }

      setDownloadProgress(100);
      setDownloadStatus('¡Actualización descargada!');
      setIsCompleted(true);

      // Auto refresh in-place after 2.5 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } catch (err) {
      console.warn('Update download error:', err);
      // Fallback reload
      window.location.reload();
    }
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-[460px] p-4 bg-bark-900/95 dark:bg-dark-card/95 backdrop-blur-md text-white rounded-3xl shadow-floating border border-solar/70 transition-all animate-in fade-in slide-in-from-top-4 select-none">
      <div className="flex items-start justify-between space-x-3 mb-2.5">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-solar text-bark-900 flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="font-display font-extrabold text-sm block text-solar truncate">
              ¡Nueva actualización disponible! {serverVersion ? `(v${serverVersion})` : ''}
            </span>
            <span className="text-xs text-cream-200 block truncate">
              {releaseNotes || 'Icono oficial centrado y formato móvil nativo sin desplazamientos.'}
            </span>
          </div>
        </div>

        {!isDownloading && (
          <button
            type="button"
            onClick={() => setShowUpdate(false)}
            className="p-1.5 text-cream-400 hover:text-white rounded-xl transition-colors shrink-0"
            title="Cerrar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Download Progress Bar & Status */}
      {isDownloading ? (
        <div className="space-y-2 mt-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-cream-200 flex items-center space-x-1.5 truncate">
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <RefreshCw className="w-4 h-4 text-solar animate-spin shrink-0" />
              )}
              <span>{downloadStatus}</span>
            </span>
            <span className="text-solar font-bold shrink-0 ml-2">{downloadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-solar rounded-full transition-all duration-300 ease-out"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
          <p className="text-[11px] text-cream-300 text-center pt-0.5">
            {isCompleted
              ? 'Aplicando actualización... la aplicación se reiniciará en un segundo.'
              : 'Descargando sin salir de la app... por favor espera.'}
          </p>
        </div>
      ) : (
        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between space-x-2">
          <span className="text-[11px] text-cream-300 truncate">
            No requiere salir de la app.
          </span>
          <button
            type="button"
            onClick={handleDownloadAndApplyUpdate}
            className="py-2 px-4 bg-solar hover:bg-solar-600 active:scale-95 text-bark-900 rounded-xl font-extrabold text-xs flex items-center space-x-1.5 shadow-sm transition-transform cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Descargar y Actualizar</span>
          </button>
        </div>
      )}
    </div>
  );
};
