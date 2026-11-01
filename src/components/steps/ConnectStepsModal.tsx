import React, { useState, useEffect } from 'react';
import { stepsService, StepsState } from '../../services/stepsService';
import {
  X,
  Footprints,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Trash2,
  Download,
  HelpCircle,
  ShieldCheck,
  Flame,
  Smartphone,
  ArrowRight
} from 'lucide-react';

interface ConnectStepsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenManual?: () => void;
}

export const ConnectStepsModal: React.FC<ConnectStepsModalProps> = ({
  isOpen,
  onClose,
  onOpenManual,
}) => {
  const [stepsState, setStepsState] = useState<StepsState>(stepsService.getState());
  const [targetInput, setTargetInput] = useState(String(stepsState.dailyTarget));
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    return stepsService.subscribe((s) => {
      setStepsState(s);
      setTargetInput(String(s.dailyTarget));
    });
  }, []);

  if (!isOpen) return null;

  const isConnected = stepsState.status === 'connected';
  const hasZeroSteps = isConnected && stepsState.todaySteps === 0;

  const handleConnect = async () => {
    setIsSyncing(true);
    await stepsService.connectHealth();
    setIsSyncing(false);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await stepsService.syncSteps();
    setIsSyncing(false);
  };

  const handleDisconnect = async () => {
    if (confirm('¿Estás seguro de que deseas desconectar y borrar todos tus datos de pasos guardados?')) {
      await stepsService.disconnectAndEraseData();
      onClose();
    }
  };

  const handleSaveTarget = () => {
    const val = parseInt(targetInput, 10);
    if (!isNaN(val) && val >= 1000) {
      stepsService.setDailyTarget(val);
    }
  };

  const buttonLabel =
    stepsState.platform === 'ios'
      ? 'Conectar con Apple Health'
      : stepsState.isSamsung
      ? 'Conectar con Samsung Health'
      : 'Conectar con Health Connect';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bark-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream-200 dark:border-dark-border pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-700 dark:text-solar shadow-sm">
              <Footprints className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-bark-900 dark:text-dark-text leading-tight">
                Conectar Pasos del Móvil
              </h3>
              <p className="text-[11px] text-bark-500 dark:text-dark-muted">
                Samsung Health, Apple Health & Health Connect
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-bark-400 hover:text-bark-900 dark:text-dark-muted rounded-xl hover:bg-cream-100 dark:hover:bg-dark-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Two-line privacy statement */}
        <div className="p-3 bg-cream-50 dark:bg-dark-surface/80 border border-cream-200 dark:border-dark-border rounded-2xl space-y-1 text-xs text-bark-700 dark:text-dark-muted">
          <div className="flex items-center space-x-1.5 font-bold text-bark-900 dark:text-dark-text">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Acceso 100% privado y de solo lectura</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            NutriFit lee únicamente tus <strong>pasos y distancia diaria</strong> de forma segura. Tus datos nunca se venden ni se comparten con terceros.
          </p>
        </div>

        {/* State: Web / PWA fallback */}
        {stepsState.platform === 'web' && (
          <div className="p-4 bg-solar-50/70 dark:bg-solar/10 border border-solar/40 rounded-2xl space-y-3 text-left">
            <div className="flex items-start space-x-2.5">
              <Smartphone className="w-5 h-5 text-solar-800 dark:text-solar mt-0.5 shrink-0" />
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-bark-900 dark:text-dark-text">
                  Para leer pasos reales, instala la App de NutriFit
                </h4>
                <p className="text-[11px] text-bark-600 dark:text-dark-muted leading-relaxed">
                  Los navegadores web no tienen acceso directo a los sensores de Samsung Health ni Apple Health por motivos de seguridad del sistema. Puedes descargar el instalador para Android o registrar tus pasos manualmente.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href="https://github.com/omolas963/nutrifit/releases/latest"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 px-3 bg-solar hover:bg-solar-600 active:scale-95 text-bark-900 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-transform"
              >
                <Download className="w-4 h-4" />
                <span>Descargar App Android (APK)</span>
              </a>

              {onOpenManual && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenManual();
                  }}
                  className="py-2.5 px-3 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border text-bark-800 dark:text-dark-text font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-1"
                >
                  <span>Introducir pasos a mano</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* State: Connected */}
        {isConnected && (
          <div className="space-y-3">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-xs text-emerald-900 dark:text-emerald-300 block">
                    Conexión de salud activa
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                    Última sincronización:{' '}
                    {stepsState.lastSyncTime
                      ? new Date(stepsState.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Ahora mismo'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="p-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded-xl active:scale-95 transition-transform"
                title="Sincronizar ahora"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* If connected but has 0 steps -> show specific Samsung/Apple help */}
            {hasZeroSteps && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl space-y-2 text-left">
                <div className="flex items-center space-x-1.5 font-bold text-xs text-amber-900 dark:text-amber-300">
                  <HelpCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                  <span>¿Aparecen 0 pasos en tu contador?</span>
                </div>

                {stepsState.platform === 'ios' ? (
                  <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
                    Apple Health oculta los pasos si no se marcó la casilla de permisos. Abre:
                    <br />
                    <strong>Ajustes &gt; Salud &gt; Acceso a datos y dispositivos &gt; NutriFit &gt; Activar Pasos</strong>.
                  </p>
                ) : (
                  <div className="space-y-1.5 text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
                    <p>
                      Para que Samsung Health comparta tus pasos reales, comprueba esto:
                      <br />
                      <strong>Abre Samsung Health &gt; Ajustes &gt; Health Connect &gt; Permisos de aplicaciones &gt; Samsung Health</strong>, activa «Escribir pasos» y activa la sincronización con Samsung Cloud. (Puede tardar un par de minutos).
                    </p>
                    <button
                      type="button"
                      onClick={() => stepsService.openHealthSettings()}
                      className="inline-flex items-center space-x-1 font-bold text-amber-900 dark:text-solar underline pt-1"
                    >
                      <span>Abrir ajustes de Health Connect</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* State: Permission Denied */}
        {stepsState.status === 'permission_denied' && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-2xl space-y-2 text-left">
            <div className="flex items-center space-x-2 text-red-800 dark:text-red-300 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Permiso de salud denegado</span>
            </div>
            <p className="text-[11px] text-red-700 dark:text-red-300/90 leading-relaxed">
              El acceso a pasos está desactivado en la configuración de tu teléfono. Puedes activarlo pulsando el botón de abajo:
            </p>
            <button
              type="button"
              onClick={() => stepsService.openHealthSettings()}
              className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center space-x-1"
            >
              <span>Abrir Ajustes de Salud del sistema</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* State: Health Connect Not Installed */}
        {stepsState.status === 'not_available' && (
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl space-y-2 text-left">
            <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-300 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Health Connect no encontrado</span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
              En algunas versiones de Android necesitas instalar la app oficial de Google <strong>Health Connect</strong> para conectar Samsung Health o tus pulseras deportivas.
            </p>
            <button
              type="button"
              onClick={() => stepsService.openHealthSettings()}
              className="py-2 px-3 bg-solar hover:bg-solar-600 text-bark-900 font-bold text-xs rounded-xl shadow-xs inline-flex items-center space-x-1"
            >
              <span>Instalar Health Connect desde Google Play</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Native Connect Action Button (When not connected or after error) */}
        {stepsState.platform !== 'web' && !isConnected && (
          <button
            type="button"
            onClick={handleConnect}
            disabled={isSyncing}
            className="w-full py-3.5 px-4 bg-solar hover:bg-solar-600 active:scale-[0.99] text-bark-900 font-display font-bold text-sm rounded-2xl shadow-floating flex items-center justify-center space-x-2 transition-all"
          >
            {isSyncing ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Footprints className="w-5 h-5" />
                <span>{buttonLabel}</span>
              </>
            )}
          </button>
        )}

        {/* Options & Configuration */}
        <div className="space-y-3 pt-2 border-t border-cream-200 dark:border-dark-border text-left">
          {/* Target input */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-xs text-bark-900 dark:text-dark-text block">
                Objetivo diario de pasos
              </span>
              <span className="text-[10px] text-bark-500 dark:text-dark-muted">
                Por defecto: 10.000 pasos
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                step="500"
                min="1000"
                max="100000"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                onBlur={handleSaveTarget}
                className="w-20 text-center py-1.5 px-2 bg-cream-100 dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-xs font-bold text-bark-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-solar"
              />
              <span className="text-xs text-bark-500">pasos</span>
            </div>
          </div>

          {/* Calorie addition toggle (OFF by default) */}
          <div className="flex items-start justify-between space-x-3 p-3 bg-cream-50 dark:bg-dark-surface rounded-2xl border border-cream-200 dark:border-dark-border">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-solar" />
                <span className="font-bold text-xs text-bark-900 dark:text-dark-text">
                  Sumar calorías de los pasos al objetivo diario
                </span>
              </div>
              <p className="text-[10px] text-bark-500 dark:text-dark-muted leading-tight">
                <strong>Desactivado por defecto.</strong> Si lo activas, las calorías estimadas que quemes caminando se añadirán a tu límite de calorías disponibles de hoy.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input
                type="checkbox"
                checked={stepsState.includeCaloriesInDailyGoal}
                onChange={(e) => stepsService.setIncludeCaloriesInDailyGoal(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-cream-300 peer-focus:outline-none rounded-full peer dark:bg-dark-border peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-cream-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-solar"></div>
            </label>
          </div>

          {/* Sync to server toggle */}
          <div className="flex items-center justify-between p-2.5">
            <div>
              <span className="font-semibold text-xs text-bark-800 dark:text-dark-text block">
                Guardar historial en mi cuenta en la nube
              </span>
              <span className="text-[10px] text-bark-500 dark:text-dark-muted">
                Si lo desactivas, los pasos solo se guardan en este dispositivo
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={stepsState.syncToServer}
                onChange={(e) => stepsService.setSyncToServer(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-cream-300 peer-focus:outline-none rounded-full peer dark:bg-dark-border peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-cream-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-solar"></div>
            </label>
          </div>

          {/* Disconnect & Erase button */}
          {isConnected && (
            <div className="pt-2 border-t border-cream-200 dark:border-dark-border">
              <button
                type="button"
                onClick={handleDisconnect}
                className="w-full py-2.5 px-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Desconectar y borrar mis datos de pasos</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
