import React, { useState, useEffect } from 'react';
import { stepsService } from '../../services/stepsService';
import {
  Footprints,
  Camera,
  Mic,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Download,
  Sparkles,
  Smartphone,
  ChevronRight,
  X,
  AlertCircle
} from 'lucide-react';

interface DevicePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function detectDeviceBrand() {
  if (typeof window === 'undefined') {
    return {
      brandName: 'Móvil',
      healthPlatformName: 'Health Connect',
      isSamsung: false,
      isApple: false,
      isXiaomi: false,
      isAndroid: false,
      isStandalone: false,
    };
  }

  const ua = navigator.userAgent || '';
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true;

  const isSamsung = /Samsung|SM-|SAMSUNG|Galaxy/i.test(ua);
  const isApple = /iPhone|iPad|iPod/i.test(ua);
  const isXiaomi = /Xiaomi|Redmi|POCO|MI /i.test(ua);
  const isAndroid = /Android/i.test(ua);

  let brandName = 'Tu dispositivo';
  let healthPlatformName = 'Health Connect';

  if (isApple) {
    brandName = 'iPhone (Apple)';
    healthPlatformName = 'Apple Health (Salud)';
  } else if (isSamsung) {
    brandName = 'Samsung Galaxy';
    healthPlatformName = 'Samsung Health';
  } else if (isXiaomi) {
    brandName = 'Xiaomi / Redmi';
    healthPlatformName = 'Health Connect / Xiaomi';
  } else if (isAndroid) {
    brandName = 'Android';
    healthPlatformName = 'Health Connect (Google)';
  }

  return {
    brandName,
    healthPlatformName,
    isSamsung,
    isApple,
    isXiaomi,
    isAndroid,
    isStandalone,
  };
}

export const DevicePermissionsModal: React.FC<DevicePermissionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const deviceInfo = detectDeviceBrand();

  const [stepsGranted, setStepsGranted] = useState(false);
  const [cameraGranted, setCameraGranted] = useState(false);
  const [micGranted, setMicGranted] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(deviceInfo.isStandalone);

  // Capture PWA install prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Check initial permissions if available
  useEffect(() => {
    if (!isOpen) return;

    // Check steps state
    const s = stepsService.getState();
    if (s.status === 'connected' || s.todaySteps > 0) {
      setStepsGranted(true);
    }

    // Check navigator permissions API if supported
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'camera' as any })
        .then((res) => {
          if (res.state === 'granted') setCameraGranted(true);
        })
        .catch(() => {});

      navigator.permissions
        .query({ name: 'microphone' as any })
        .then((res) => {
          if (res.state === 'granted') setMicGranted(true);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Request Steps / Health Permission
  const handleRequestSteps = async () => {
    setIsRequesting(true);
    try {
      const ok = await stepsService.connectHealth();
      if (ok || stepsService.getState().status === 'connected') {
        setStepsGranted(true);
      } else {
        // Fallback: allow simulated/manual entry as granted
        setStepsGranted(true);
      }
    } catch {
      setStepsGranted(true);
    } finally {
      setIsRequesting(false);
    }
  };

  // 2. Request Camera Permission
  const handleRequestCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        stream.getTracks().forEach((t) => t.stop());
        setCameraGranted(true);
      } else {
        setCameraGranted(true);
      }
    } catch (err: any) {
      console.warn('Camera permission denied or unsupported:', err);
      // If user denied in browser, prompt to open settings
      alert('Permiso de cámara denegado. Puedes activarlo pulsando en el candado 🔒 junto a la dirección web.');
    }
  };

  // 3. Request Mic Permission
  const handleRequestMic = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
        setMicGranted(true);
      } else {
        setMicGranted(true);
      }
    } catch (err: any) {
      console.warn('Microphone permission denied:', err);
      alert('Permiso de micrófono denegado. Puedes activarlo pulsando en el candado 🔒 junto a la dirección web.');
    }
  };

  // 4. Request ALL permissions sequentially
  const handleRequestAll = async () => {
    setIsRequesting(true);

    // Request health steps
    try {
      await stepsService.connectHealth();
      setStepsGranted(true);
    } catch {}

    // Request camera
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
        camStream.getTracks().forEach((t) => t.stop());
        setCameraGranted(true);
      }
    } catch {}

    // Request mic
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStream.getTracks().forEach((t) => t.stop());
        setMicGranted(true);
      }
    } catch {}

    setIsRequesting(false);
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('nutrifit_permissions_configured', 'true');
    onClose();
  };

  // Prompt install app
  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    } else if (deviceInfo.isApple) {
      alert(
        'Para instalar NutriFit en tu iPhone:\n1. Pulsa el botón Compartir (el cuadrado con la flecha hacia arriba ↑ en Safari).\n2. Elige "Añadir a pantalla de inicio".'
      );
    } else {
      alert(
        'Pulsa el menú de 3 puntos (⋮) de tu navegador arriba a la derecha y selecciona "Instalar aplicación" o "Añadir a pantalla de inicio".'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-bark-900/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-cream-200 dark:border-dark-border pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-solar flex items-center justify-center text-bark-900 shadow-sm">
              <Sparkles className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-bark-900 dark:text-dark-text leading-tight">
                Configura NutriFit en tu móvil
              </h3>
              <p className="text-[11px] text-bark-500 dark:text-dark-muted">
                Detectado: <strong>{deviceInfo.brandName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleComplete}
            className="p-1.5 text-bark-400 hover:text-bark-900 dark:text-dark-muted rounded-xl hover:bg-cream-100 dark:hover:bg-dark-surface transition-colors"
            title="Cerrar y continuar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner: Install as native app if not standalone */}
        {!isInstalled && (
          <div className="p-3.5 bg-gradient-to-r from-solar-100 to-amber-50 dark:from-solar/20 dark:to-dark-surface border border-solar/40 rounded-2xl flex items-center justify-between space-x-3 shadow-2xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-solar flex items-center justify-center text-bark-900 shrink-0 shadow-xs">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="text-left space-y-0.5">
                <span className="font-bold text-xs text-bark-900 dark:text-dark-text block leading-tight">
                  1. Instalar icono en tu pantalla
                </span>
                <span className="text-[10px] text-bark-600 dark:text-dark-muted block">
                  Para tenerla a pantalla completa como una app nativa
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleInstallApp}
              className="py-2 px-3 bg-solar hover:bg-solar-600 active:scale-95 text-bark-900 font-bold text-xs rounded-xl shadow-2xs whitespace-nowrap transition-transform flex items-center space-x-1 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar app</span>
            </button>
          </div>
        )}

        {/* Introduction text */}
        <div className="text-left space-y-1">
          <h4 className="font-bold text-xs text-bark-900 dark:text-dark-text">
            2. Permisos necesarios para automatizar todo:
          </h4>
          <p className="text-[11px] text-bark-600 dark:text-dark-muted leading-relaxed">
            Puedes dar los permisos directamente aquí o tocar en el botón para abrir la configuración de tu teléfono:
          </p>
        </div>

        {/* Permission 1: Pasos y Salud */}
        <div className="p-3.5 bg-cream-50 dark:bg-dark-surface border border-cream-200 dark:border-dark-border rounded-2xl flex items-center justify-between space-x-3 text-left">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-700 dark:text-solar shrink-0">
              <Footprints className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-bark-900 dark:text-dark-text block truncate">
                Pasos: {deviceInfo.healthPlatformName}
              </span>
              <span className="text-[10px] text-bark-500 dark:text-dark-muted block">
                Lee tus pasos reales sin duplicar smartwatch
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRequestSteps}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1 shadow-2xs ${
              stepsGranted
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-solar hover:bg-solar-600 text-bark-900'
            }`}
          >
            {stepsGranted ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Conectado</span>
              </>
            ) : (
              <span>Conectar</span>
            )}
          </button>
        </div>

        {/* Permission 2: Cámara */}
        <div className="p-3.5 bg-cream-50 dark:bg-dark-surface border border-cream-200 dark:border-dark-border rounded-2xl flex items-center justify-between space-x-3 text-left">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-950/50 flex items-center justify-center text-cyan-700 dark:text-cyan-400 shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-bark-900 dark:text-dark-text block truncate">
                Cámara de fotos
              </span>
              <span className="text-[10px] text-bark-500 dark:text-dark-muted block">
                Reconoce platos con IA y escanea códigos
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRequestCamera}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1 shadow-2xs ${
              cameraGranted
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-solar hover:bg-solar-600 text-bark-900'
            }`}
          >
            {cameraGranted ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Permitido</span>
              </>
            ) : (
              <span>Permitir</span>
            )}
          </button>
        </div>

        {/* Permission 3: Micrófono */}
        <div className="p-3.5 bg-cream-50 dark:bg-dark-surface border border-cream-200 dark:border-dark-border rounded-2xl flex items-center justify-between space-x-3 text-left">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-rose-700 dark:text-rose-400 shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-bark-900 dark:text-dark-text block truncate">
                Micrófono
              </span>
              <span className="text-[10px] text-bark-500 dark:text-dark-muted block">
                Dicta tus comidas por voz en tiempo real
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRequestMic}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1 shadow-2xs ${
              micGranted
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-solar hover:bg-solar-600 text-bark-900'
            }`}
          >
            {micGranted ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Permitido</span>
              </>
            ) : (
              <span>Permitir</span>
            )}
          </button>
        </div>

        {/* Shortcut to phone settings */}
        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={() => stepsService.openHealthSettings()}
            className="inline-flex items-center space-x-1 text-xs text-bark-600 dark:text-dark-muted hover:text-bark-900 dark:hover:text-solar font-semibold underline"
          >
            <span>O abrir Ajustes del teléfono para dar permisos</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Primary Action Button: Conectar Todo y Entrar */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={handleRequestAll}
            disabled={isRequesting}
            className="w-full py-3.5 px-4 bg-solar hover:bg-solar-600 active:scale-[0.99] text-bark-900 font-display font-bold text-sm rounded-2xl shadow-floating flex items-center justify-center space-x-2 transition-all"
          >
            <span>Conectar y Entrar a NutriFit</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={handleComplete}
            className="text-xs text-bark-400 hover:text-bark-700 dark:text-dark-muted font-medium transition-colors"
          >
            Omitir por ahora y configurar más tarde
          </button>
        </div>
      </div>
    </div>
  );
};
