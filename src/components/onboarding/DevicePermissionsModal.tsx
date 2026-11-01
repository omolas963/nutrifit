import React, { useState, useEffect } from 'react';
import { stepsService } from '../../services/stepsService';
import {
  Footprints,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Download,
  Sparkles,
  Smartphone,
  ChevronRight,
  X,
  Watch,
  HelpCircle,
  Share
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

  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(deviceInfo.isStandalone);
  const [stepsGranted, setStepsGranted] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  // Capture PWA install prompt event
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const s = stepsService.getState();
    if (s.status === 'connected' || s.todaySteps > 0) {
      setStepsGranted(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Install App Action
  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    } else if (deviceInfo.isApple) {
      setShowIosGuide(true);
    } else {
      // In Android/Chrome if installPrompt is not available or already installed:
      // Try APK download or prompt menu
      window.location.href = '/api/download/apk';
    }
  };

  // 2. Request Steps / Health Permission
  const handleRequestSteps = async () => {
    setIsRequesting(true);
    try {
      const ok = await stepsService.connectHealth();
      if (ok || stepsService.getState().status === 'connected') {
        setStepsGranted(true);
      } else {
        // If in browser, trigger mobile Health Connect / Samsung Health intent directly
        stepsService.openHealthSettings();
      }
    } catch {
      stepsService.openHealthSettings();
    } finally {
      setIsRequesting(false);
    }
  };

  const handleTestSteps = () => {
    const today = new Date().toISOString().split('T')[0];
    stepsService.setManualSteps(today, 8420);
    setStepsGranted(true);
  };

  const handleComplete = () => {
    localStorage.setItem('nutrifit_permissions_configured', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-bark-900/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-cream-200 dark:border-dark-border pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-solar flex items-center justify-center text-bark-900 shadow-sm">
              <Sparkles className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-bark-900 dark:text-dark-text leading-tight">
                Instalar y Configurar NutriFit
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

        {/* STEP 1: Instalar la aplicación en el móvil */}
        <div className="p-3.5 bg-gradient-to-r from-solar-100 to-amber-50 dark:from-solar/20 dark:to-dark-surface border border-solar/40 rounded-2xl space-y-2 text-left shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-solar flex items-center justify-center text-bark-900 font-bold shadow-xs">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-bark-900 dark:text-dark-text block">
                  1. Instalar App en tu móvil
                </span>
                <span className="text-[10px] text-bark-600 dark:text-dark-muted block">
                  Icono directo en tu pantalla de inicio
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleInstallApp}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1 ${
                isInstalled
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-solar hover:bg-solar-600 text-bark-900 active:scale-95'
              }`}
            >
              {isInstalled ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Instalada</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Instalar App</span>
                </>
              )}
            </button>
          </div>

          {/* iOS guidance if requested */}
          {showIosGuide && (
            <div className="p-2.5 bg-white/80 dark:bg-dark-surface/80 rounded-xl border border-cream-300 dark:border-dark-border text-[11px] text-bark-700 dark:text-dark-muted space-y-1">
              <div className="flex items-center space-x-1 font-bold text-bark-900 dark:text-dark-text">
                <Share className="w-3.5 h-3.5 text-solar-800 dark:text-solar" />
                <span>Instalar en iPhone (Safari):</span>
              </div>
              <p>
                1. Toca el botón <strong>Compartir</strong> (cuadrado con flecha hacia arriba ↑ abajo en Safari).
                <br />
                2. Selecciona <strong>«Añadir a pantalla de inicio»</strong>.
              </p>
            </div>
          )}

          {/* Android alternative link for full native package */}
          {deviceInfo.isAndroid && !isInstalled && (
            <div className="pt-1 flex items-center justify-between text-[10px] text-bark-500 border-t border-solar/20">
              <span>¿Prefieres el instalador de Android?</span>
              <a
                href="/api/download/apk"
                className="font-bold text-bark-800 dark:text-solar underline hover:text-bark-950"
              >
                Descargar APK directo
              </a>
            </div>
          )}
        </div>

        {/* STEP 2: Conectar Pasos (Samsung Health / Apple Health / Health Connect) */}
        <div className="p-3.5 bg-cream-50 dark:bg-dark-surface border border-cream-200 dark:border-dark-border rounded-2xl space-y-2.5 text-left shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-700 dark:text-solar font-bold shrink-0">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-bark-900 dark:text-dark-text block">
                  2. Conectar Pasos: {deviceInfo.healthPlatformName}
                </span>
                <span className="text-[10px] text-bark-500 dark:text-dark-muted block">
                  Pasos reales de tu salud sin duplicar reloj
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRequestSteps}
              disabled={isRequesting}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1 ${
                stepsGranted
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-solar hover:bg-solar-600 text-bark-900 active:scale-95'
              }`}
            >
              {stepsGranted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Conectado</span>
                </>
              ) : (
                <span>{isRequesting ? 'Conectando...' : 'Conectar'}</span>
              )}
            </button>
          </div>

          {/* Shortcut to phone settings & manual test */}
          <div className="pt-2 border-t border-cream-200 dark:border-dark-border flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => stepsService.openHealthSettings()}
              className="flex-1 py-1.5 px-2.5 bg-white dark:bg-dark-card border border-cream-300 dark:border-dark-border rounded-xl text-[11px] font-semibold text-bark-800 dark:text-dark-text hover:border-solar shadow-2xs flex items-center justify-center space-x-1"
            >
              <ExternalLink className="w-3 h-3 text-solar-800 dark:text-solar" />
              <span>Abrir Ajustes de tu móvil</span>
            </button>

            <button
              type="button"
              onClick={handleTestSteps}
              className="flex-1 py-1.5 px-2.5 bg-white dark:bg-dark-card border border-cream-300 dark:border-dark-border rounded-xl text-[11px] font-semibold text-bark-800 dark:text-dark-text hover:border-solar shadow-2xs flex items-center justify-center space-x-1"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Probar con 8.420 pasos</span>
            </button>
          </div>
        </div>

        {/* Compatibility and Privacy Note */}
        <div className="p-2.5 bg-cream-50 dark:bg-dark-surface/80 rounded-xl border border-cream-200 dark:border-dark-border text-[10px] text-bark-600 dark:text-dark-muted flex items-start space-x-2 text-left">
          <Watch className="w-4 h-4 text-solar-800 dark:text-solar mt-0.5 shrink-0" />
          <p className="leading-tight">
            Compatible con cualquier pulsera o reloj (Garmin, Fitbit, Samsung, Strava, Oura, Withings...) a través de <strong>Health Connect</strong> y <strong>Apple Health</strong>.
          </p>
        </div>

        {/* Primary Action Button: Entrar a NutriFit */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleComplete}
            className="w-full py-3.5 px-4 bg-solar hover:bg-solar-600 active:scale-[0.99] text-bark-900 font-display font-bold text-sm rounded-2xl shadow-floating flex items-center justify-center space-x-2 transition-all"
          >
            <span>Entrar a NutriFit</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
