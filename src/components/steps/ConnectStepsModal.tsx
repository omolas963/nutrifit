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
  ChevronDown,
  ChevronUp,
  Watch,
  Activity,
  Sparkles
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
  const [showWatchHelp, setShowWatchHelp] = useState(false);
  const [activeWatchTab, setActiveWatchTab] = useState<'garmin' | 'fitbit' | 'samsung' | 'other'>('garmin');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-bark-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-4 sm:p-6 max-w-lg w-full shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream-200 dark:border-dark-border pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-700 dark:text-solar shadow-sm">
              <Footprints className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-bark-900 dark:text-dark-text leading-tight">
                Conectar Pasos y Actividad
              </h3>
              <p className="text-[11px] text-bark-500 dark:text-dark-muted">
                Apple Health & Health Connect (Samsung, Garmin, Fitbit...)
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

        {/* Universal Compatibility Notice */}
        <div className="p-3 bg-cream-50 dark:bg-dark-surface/80 border border-cream-200 dark:border-dark-border rounded-2xl space-y-1.5 text-xs text-bark-700 dark:text-dark-muted text-left">
          <div className="flex items-center space-x-1.5 font-bold text-bark-900 dark:text-dark-text">
            <Watch className="w-4 h-4 text-solar-800 dark:text-solar shrink-0" />
            <span>Compatible con todos tus dispositivos y relojes</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            NutriFit se sincroniza a través de los dos centros oficiales de salud del sistema: <strong>Apple Health</strong> en iPhone y <strong>Health Connect</strong> en Android. Cualquier reloj o app que sincronice con ellos (<strong>Samsung Health, Garmin, Fitbit, Strava, Oura, WHOOP, Withings, Xiaomi...</strong>) transmitirá tus pasos automáticamente y sin duplicar registros.
          </p>
          <div className="flex items-center space-x-1.5 pt-0.5 text-[10px] text-bark-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Acceso 100% de solo lectura. No usamos Google Fit (obsoleto).</span>
          </div>
        </div>

        {/* State: Sincronización Automática Activa */}
        <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50/60 dark:from-emerald-950/40 dark:to-dark-surface border border-emerald-300 dark:border-emerald-800/60 rounded-2xl space-y-2.5 text-left shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div>
                <span className="font-bold text-xs text-emerald-900 dark:text-emerald-300 block">
                  Conexión Automática Activa
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                  {stepsState.platform === 'ios'
                    ? 'Apple Health & Sensores iOS'
                    : stepsState.isSamsung
                    ? 'Samsung Health · Health Connect · Podómetro'
                    : 'Google Health Connect · Sensores del móvil'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs active:scale-95 transition-transform cursor-pointer"
              title="Sincronizar ahora"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/40 text-[11px]">
            <div className="flex items-center space-x-1 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Pasos hoy: <strong>{stepsState.todaySteps.toLocaleString('es-ES')}</strong></span>
            </div>
            <div className="flex items-center space-x-1 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Meta diaria: <strong>{stepsState.dailyTarget.toLocaleString('es-ES')}</strong></span>
            </div>
          </div>
        </div>

        {/* State: Native App Connected */}
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
                    Apple Health no revela pasos si no se activó la casilla de lectura. Abre:
                    <br />
                    <strong>Ajustes &gt; Salud &gt; Acceso a datos y dispositivos &gt; NutriFit &gt; Activar Pasos</strong>.
                  </p>
                ) : (
                  <div className="space-y-1.5 text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
                    <p>
                      Para que Samsung Health comparta tus pasos con Health Connect:
                      <br />
                      1. Abre <strong>Samsung Health &gt; Ajustes &gt; Health Connect &gt; Permisos de aplicaciones &gt; Samsung Health</strong>.
                      <br />
                      2. Activa «Permitir todo» o «Escribir pasos».
                      <br />
                      3. Asegúrate de tener activada la sincronización con Samsung Cloud. (Puede tardar un par de minutos en reflejarse).
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

        {/* State: Native Permission Denied */}
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

        {/* State: Native Connect Action Button */}
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

        {/* Watch Help Accordion («¿Mi reloj no aparece?») */}
        <div className="border border-cream-200 dark:border-dark-border rounded-2xl overflow-hidden text-left">
          <button
            type="button"
            onClick={() => setShowWatchHelp(!showWatchHelp)}
            className="w-full p-3 bg-cream-50 dark:bg-dark-surface/60 hover:bg-cream-100 flex items-center justify-between text-xs font-bold text-bark-900 dark:text-dark-text transition-colors"
          >
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-solar-800 dark:text-solar" />
              <span>¿Mi reloj o pulsera no aparece?</span>
            </div>
            {showWatchHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showWatchHelp && (
            <div className="p-3.5 bg-white dark:bg-dark-card space-y-3 text-[11px] text-bark-700 dark:text-dark-muted border-t border-cream-200 dark:border-dark-border">
              <p className="leading-relaxed">
                Tu reloj no necesita conectarse directamente a NutriFit. Basta con que la app oficial de tu reloj comparta sus datos con <strong>Health Connect</strong> (en Android) o <strong>Apple Health</strong> (en iPhone):
              </p>

              {/* Watch brand selector tabs */}
              <div className="flex flex-wrap gap-1 border-b border-cream-200 dark:border-dark-border pb-2">
                <button
                  type="button"
                  onClick={() => setActiveWatchTab('garmin')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-colors ${
                    activeWatchTab === 'garmin'
                      ? 'bg-solar text-bark-900'
                      : 'bg-cream-100 dark:bg-dark-surface text-bark-600 dark:text-dark-muted'
                  }`}
                >
                  Garmin
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWatchTab('fitbit')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-colors ${
                    activeWatchTab === 'fitbit'
                      ? 'bg-solar text-bark-900'
                      : 'bg-cream-100 dark:bg-dark-surface text-bark-600 dark:text-dark-muted'
                  }`}
                >
                  Fitbit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWatchTab('samsung')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-colors ${
                    activeWatchTab === 'samsung'
                      ? 'bg-solar text-bark-900'
                      : 'bg-cream-100 dark:bg-dark-surface text-bark-600 dark:text-dark-muted'
                  }`}
                >
                  Samsung Watch
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWatchTab('other')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-colors ${
                    activeWatchTab === 'other'
                      ? 'bg-solar text-bark-900'
                      : 'bg-cream-100 dark:bg-dark-surface text-bark-600 dark:text-dark-muted'
                  }`}
                >
                  Otras marcas
                </button>
              </div>

              {/* Tab: Garmin */}
              {activeWatchTab === 'garmin' && (
                <div className="space-y-1 leading-relaxed bg-cream-50 dark:bg-dark-surface p-2.5 rounded-xl">
                  <strong className="text-bark-900 dark:text-dark-text block">Garmin Connect:</strong>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Abre la app <strong>Garmin Connect</strong> en tu móvil.</li>
                    <li>Ve a <strong>Más (icono ⋯) &gt; Configuración &gt; Aplicaciones conectadas</strong>.</li>
                    <li>Selecciona <strong>Health Connect</strong> (en Android) o <strong>Apple Health</strong> (en iPhone) y activa «Permitir todo».</li>
                  </ol>
                </div>
              )}

              {/* Tab: Fitbit */}
              {activeWatchTab === 'fitbit' && (
                <div className="space-y-1 leading-relaxed bg-cream-50 dark:bg-dark-surface p-2.5 rounded-xl">
                  <strong className="text-bark-900 dark:text-dark-text block">Fitbit (Google):</strong>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Abre la app <strong>Fitbit</strong>.</li>
                    <li>Toca tu foto de perfil &gt; <strong>Configuración de la app &gt; Health Connect</strong>.</li>
                    <li>Pulsa «Configurar» y activa el permiso de escritura de Pasos y Distancia.</li>
                  </ol>
                </div>
              )}

              {/* Tab: Samsung */}
              {activeWatchTab === 'samsung' && (
                <div className="space-y-1 leading-relaxed bg-cream-50 dark:bg-dark-surface p-2.5 rounded-xl">
                  <strong className="text-bark-900 dark:text-dark-text block">Samsung Galaxy Watch / Health:</strong>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Abre <strong>Samsung Health</strong> en tu móvil.</li>
                    <li>Toca los 3 puntos (⋮) &gt; <strong>Ajustes &gt; Health Connect</strong>.</li>
                    <li>Concede permisos a Samsung Health para escribir datos en Health Connect.</li>
                  </ol>
                </div>
              )}

              {/* Tab: Other (Strava, Polar, Oura, WHOOP, Withings, Xiaomi) */}
              {activeWatchTab === 'other' && (
                <div className="space-y-1 leading-relaxed bg-cream-50 dark:bg-dark-surface p-2.5 rounded-xl">
                  <strong className="text-bark-900 dark:text-dark-text block">Strava, Oura, WHOOP, Withings, Polar, Xiaomi:</strong>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Abre la app de tu dispositivo (ej. Mi Fitness, Polar Flow, Oura, Withings).</li>
                    <li>Ve a su sección de <strong>Ajustes &gt; Cuentas conectadas o Enlace a la nube</strong>.</li>
                    <li>Activa la casilla de <strong>Health Connect</strong> o <strong>Apple Health</strong>.</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Options & Advanced Configuration */}
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

          {/* Toggle 1: Calorie addition from steps (OFF by default) */}
          <div className="flex items-start justify-between space-x-3 p-3 bg-cream-50 dark:bg-dark-surface rounded-2xl border border-cream-200 dark:border-dark-border">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-solar" />
                <span className="font-bold text-xs text-bark-900 dark:text-dark-text">
                  Sumar calorías de los pasos al objetivo del día
                </span>
              </div>
              <p className="text-[10px] text-bark-500 dark:text-dark-muted leading-tight">
                <strong>Desactivado por defecto.</strong> Si lo activas, las calorías estimadas de tus pasos se añaden a tu margen de calorías disponibles hoy.
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

          {/* Toggle 2: Import Exercise Calories from HealthKit / Health Connect (OFF by default) */}
          <div className="flex items-start justify-between space-x-3 p-3 bg-cream-50 dark:bg-dark-surface rounded-2xl border border-cream-200 dark:border-dark-border">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1">
                <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-xs text-bark-900 dark:text-dark-text">
                  Importar calorías de ejercicio de Apple Health / Health Connect
                </span>
              </div>
              <p className="text-[10px] text-bark-500 dark:text-dark-muted leading-tight">
                <strong>Opcional, desactivado por defecto.</strong> Muestra las calorías quemadas en entrenamientos registrados por tu reloj (gimnasio, correr, bici...) por separado de los pasos.
              </p>

              {/* Sub-toggle: Include in daily target */}
              {stepsState.importExerciseCalories && (
                <div className="pt-2 mt-2 border-t border-cream-200 dark:border-dark-border flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-bark-700 dark:text-dark-muted">
                    Sumar también las calorías de ejercicio al objetivo diario
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
                    <input
                      type="checkbox"
                      checked={stepsState.includeExerciseCaloriesInDailyGoal}
                      onChange={(e) => stepsService.setIncludeExerciseCaloriesInDailyGoal(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-cream-300 peer-focus:outline-none rounded-full peer dark:bg-dark-border peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-cream-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              )}
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input
                type="checkbox"
                checked={stepsState.importExerciseCalories}
                onChange={(e) => stepsService.setImportExerciseCalories(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-cream-300 peer-focus:outline-none rounded-full peer dark:bg-dark-border peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-cream-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
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
