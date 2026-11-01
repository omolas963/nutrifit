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
  HelpCircle
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
  const [isRequesting, setIsRequesting] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const s = stepsService.getState();
    if (s.status === 'connected' || s.todaySteps > 0) {
      setStepsGranted(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Request Steps / Health Permission
  const handleRequestSteps = async () => {
    setIsRequesting(true);
    try {
      const ok = await stepsService.connectHealth();
      if (ok || stepsService.getState().status === 'connected') {
        setStepsGranted(true);
      } else {
        // If on web, show the explanation and prompt APK / Health Connect
        setShowExplanation(true);
        // Also open Health Connect intent if Android
        if (deviceInfo.isAndroid || deviceInfo.isSamsung) {
          stepsService.openHealthSettings();
        }
      }
    } catch {
      setShowExplanation(true);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-bark-900/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-cream-200 dark:border-dark-border pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-solar flex items-center justify-center text-bark-900 shadow-sm">
              <Footprints className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-bark-900 dark:text-dark-text leading-tight">
                Conectar tus Pasos Reales
              </h3>
              <p className="text-[11px] text-bark-500 dark:text-dark-muted">
                {deviceInfo.brandName} · {deviceInfo.healthPlatformName}
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

        {/* Universal Compatibility Banner */}
        <div className="p-3 bg-cream-50 dark:bg-dark-surface border border-cream-200 dark:border-dark-border rounded-2xl space-y-1.5 text-left text-xs">
          <div className="flex items-center space-x-1.5 font-bold text-bark-900 dark:text-dark-text">
            <Watch className="w-4 h-4 text-solar-800 dark:text-solar shrink-0" />
            <span>Compatible con todos los relojes y pulseras</span>
          </div>
          <p className="text-[11px] text-bark-600 dark:text-dark-muted leading-relaxed">
            Sincroniza tus pasos reales desde <strong>Apple Health</strong> (iPhone) o <strong>Health Connect</strong> (Samsung Health, Garmin, Fitbit, Strava, Oura, Xiaomi, Withings...).
          </p>
          <div className="flex items-center space-x-1.5 pt-0.5 text-[10px] text-bark-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Solo lectura de pasos y distancia. No duplica pasos del reloj y teléfono.</span>
          </div>
        </div>

        {/* Main Steps Permission Connection Card */}
        <div className="p-4 bg-gradient-to-r from-solar-50 to-amber-50/70 dark:from-solar/15 dark:to-dark-surface border border-solar/40 rounded-2xl space-y-3 text-left shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-solar flex items-center justify-center text-bark-900 font-bold shadow-xs">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-bark-900 dark:text-dark-text block">
                  {deviceInfo.healthPlatformName}
                </span>
                <span className="text-[10px] text-bark-600 dark:text-dark-muted block">
                  Lectura directa del podómetro de tu móvil
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
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Conectado</span>
                </>
              ) : (
                <span>{isRequesting ? 'Conectando...' : 'Conectar'}</span>
              )}
            </button>
          </div>

          {/* If on Web / Explanation needed */}
          {(showExplanation || !stepsGranted) && (
            <div className="pt-2 border-t border-solar/30 space-y-2.5">
              <div className="flex items-start space-x-2 text-[11px] text-bark-700 dark:text-dark-muted leading-relaxed">
                <HelpCircle className="w-4 h-4 text-solar-800 dark:text-solar mt-0.5 shrink-0" />
                <p>
                  Por privacidad, <strong>Android e iOS no permiten que los navegadores web lean tu salud</strong>. Para tener la lectura automática en directo, instala la app en tu móvil:
                </p>
              </div>

              {/* Direct APK Download button */}
              <a
                href="/api/download/apk"
                className="w-full py-2.5 px-3 bg-solar hover:bg-solar-600 active:scale-95 text-bark-900 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-transform"
              >
                <Download className="w-4 h-4" />
                <span>Descargar App Android (APK)</span>
              </a>

              {/* Alternative action: Open Health Connect in Phone */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => stepsService.openHealthSettings()}
                  className="flex-1 py-1.5 px-2 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-[11px] font-semibold text-bark-800 dark:text-dark-text hover:border-solar shadow-2xs flex items-center justify-center space-x-1"
                >
                  <ExternalLink className="w-3 h-3 text-solar-800 dark:text-solar" />
                  <span>Abrir Health Connect</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestSteps}
                  className="flex-1 py-1.5 px-2 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-[11px] font-semibold text-bark-800 dark:text-dark-text hover:border-solar shadow-2xs flex items-center justify-center space-x-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Probar con 8.420 pasos</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Button: Continuar */}
        <div className="pt-2 space-y-2">
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
