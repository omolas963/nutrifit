import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProfileEditor } from '../components/settings/ProfileEditor';
import { BackupManager } from '../components/settings/BackupManager';
import { ConnectStepsModal } from '../components/steps/ConnectStepsModal';
import { WidgetPreviewModal } from '../components/widget/WidgetPreviewModal';
import { stepsService } from '../services/stepsService';
import { Sun, Moon, Scale, ShieldCheck, HeartPulse, User, LogOut, Sparkles, RefreshCw, CheckCircle2, Footprints, ChevronRight, Smartphone } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    profile,
    saveProfile,
    toggleTheme,
    currentUser,
    setIsAuthModalOpen,
    setIsAssessmentOpen,
    logout,
  } = useApp();
  const isDark = profile?.theme === 'dark';
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [isStepsModalOpen, setIsStepsModalOpen] = useState(false);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const stepsConnected = stepsService.getState().status === 'connected';

  const handleForceUpdate = async () => {
    setIsCheckingUpdate(true);
    try {
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
      localStorage.removeItem('nutrifit_last_build_time');
    } catch (e) {
      console.warn('Update error:', e);
    }
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  const toggleUnits = async () => {
    if (!profile) return;
    const nextUnits = profile.units === 'metric' ? 'imperial' : 'metric';
    await saveProfile({
      ...profile,
      units: nextUnits,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Account Status Card */}
      <div className="bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-11 h-11 rounded-2xl object-cover border-2 border-solar"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-solar flex items-center justify-center font-display font-black text-bark-900 text-lg shadow-sm">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div>
              <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text leading-tight">
                {currentUser ? currentUser.name : 'Usuario no registrado'}
              </h4>
              <span className="text-xs text-bark-500 dark:text-dark-muted font-medium">
                {currentUser ? currentUser.email : 'Inicia sesión para sincronizar tus datos'}
              </span>
            </div>
          </div>

          {currentUser ? (
            <button
              onClick={logout}
              className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="py-2 px-3.5 bg-solar hover:bg-solar-600 active:scale-95 text-bark-900 rounded-xl text-xs font-bold shadow-sm transition-transform"
            >
              Iniciar sesión
            </button>
          )}
        </div>

        {currentUser && (
          <div className="pt-2 border-t border-cream-200 dark:border-dark-border flex items-center justify-between text-xs">
            <span className="font-semibold text-bark-600 dark:text-dark-muted">
              Cuenta: <strong>{currentUser.email}</strong>
            </span>
            <button
              onClick={() => setIsAssessmentOpen(true)}
              className="text-solar-800 dark:text-solar font-bold hover:underline flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Repetir evaluación profesional</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Appearance & Units Card */}
      <div className="bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 shadow-card space-y-3">
        <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text leading-tight">
          Preferencias de Visualización
        </h4>

        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-3 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl flex items-center justify-between text-xs font-bold text-bark-900 dark:text-dark-text shadow-sm hover:border-solar transition-colors"
          >
            <div className="flex items-center space-x-2">
              {isDark ? <Sun className="w-4 h-4 text-solar" /> : <Moon className="w-4 h-4 text-bark-700" />}
              <span>Tema:</span>
            </div>
            <span className="text-solar-800 dark:text-solar capitalize">
              {isDark ? 'Oscuro' : 'Claro'}
            </span>
          </button>

          {/* Units Switcher */}
          <button
            onClick={toggleUnits}
            className="p-3 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl flex items-center justify-between text-xs font-bold text-bark-900 dark:text-dark-text shadow-sm hover:border-solar transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Scale className="w-4 h-4 text-solar-700 dark:text-solar" />
              <span>Unidades:</span>
            </div>
            <span className="text-solar-800 dark:text-solar uppercase">
              {profile?.units === 'imperial' ? 'lb / in' : 'kg / cm'}
            </span>
          </button>
        </div>
      </div>

      {/* Health & Steps Connection Card */}
      <div className="bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-700 dark:text-solar shadow-sm">
              <Footprints className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text leading-tight">
                Conexión de Salud y Pasos
              </h4>
              <p className="text-xs text-bark-500 dark:text-dark-muted font-medium">
                Samsung Health, Apple Health y Health Connect
              </p>
            </div>
          </div>

          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
            stepsConnected
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
              : 'bg-cream-200 text-bark-600 dark:bg-dark-surface dark:text-dark-muted'
          }`}>
            {stepsConnected ? 'Conectado' : 'No conectado'}
          </span>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setIsStepsModalOpen(true)}
            className="w-full py-2.5 px-3.5 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border hover:border-solar rounded-2xl flex items-center justify-between text-xs font-bold text-bark-900 dark:text-dark-text shadow-xs transition-colors"
          >
            <span>Configurar sincronización de pasos y objetivos</span>
            <ChevronRight className="w-4 h-4 text-bark-400" />
          </button>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open_device_permissions_modal'))}
            className="w-full py-2.5 px-3.5 bg-solar/15 hover:bg-solar/25 border border-solar/40 rounded-2xl flex items-center justify-between text-xs font-bold text-bark-900 dark:text-solar shadow-xs transition-colors"
          >
            <span className="flex items-center space-x-1.5">
              <span>📱 Configurar permisos del móvil (Salud, Cámara, Micro)</span>
            </span>
            <ChevronRight className="w-4 h-4 text-bark-600 dark:text-solar" />
          </button>
        </div>
      </div>

      {/* Mobile Home Screen Widget Card */}
      <div className="bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-solar flex items-center justify-center text-bark-900 shadow-sm">
              <Smartphone className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text leading-tight">
                Widget de Pantalla de Inicio
              </h4>
              <p className="text-xs text-bark-500 dark:text-dark-muted font-medium">
                Calorías, pasos y agua en el escritorio de tu móvil
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
            Activo
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsWidgetModalOpen(true)}
          className="w-full py-2.5 px-3.5 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border hover:border-solar rounded-2xl flex items-center justify-between text-xs font-bold text-bark-900 dark:text-dark-text shadow-xs transition-colors"
        >
          <span>Ver y probar widget del móvil</span>
          <ChevronRight className="w-4 h-4 text-bark-400" />
        </button>
      </div>

      {/* Profile & Mifflin-St Jeor Editor */}
      <ProfileEditor />

      {/* Backup & Data Manager (JSON Export / Import / Clear) */}
      <BackupManager />

      {/* App Version & Direct Update Control */}
      <div className="bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-solar flex items-center justify-center text-bark-900 font-bold shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-bark-900 dark:text-dark-text">
                Actualizaciones del Sistema
              </h4>
              <p className="text-[11px] text-bark-500 dark:text-dark-muted">
                Versión conectada a la nube 24/7 (v1.3.0)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleForceUpdate}
            disabled={isCheckingUpdate}
            className="py-2 px-3 bg-solar hover:bg-solar-600 active:scale-95 rounded-xl font-bold text-xs text-bark-900 shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
            <span>{isCheckingUpdate ? 'Actualizando...' : 'Actualizar ahora'}</span>
          </button>
        </div>
        <p className="text-xs text-bark-600 dark:text-dark-muted">
          Pulsa este botón en cualquier momento para forzar la descarga de los últimos cambios y funciones sin perder tu diario ni tus recetas.
        </p>
      </div>

      {/* Medical Disclaimer Card */}
      <div className="bg-cream-200/50 dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-3xl p-5 space-y-2 text-xs text-bark-600 dark:text-dark-muted leading-relaxed">
        <div className="flex items-center space-x-2 text-bark-800 dark:text-dark-text font-bold">
          <HeartPulse className="w-4 h-4 text-macro-protein" />
          <span>Aviso Médico y Sanitario</span>
        </div>
        <p>
          NutriFit calcula estimaciones energéticas basadas en fórmulas científicas estándar (Mifflin-St Jeor). Los requerimientos individuales pueden variar en función de factores metabólicos, clínicos o farmacológicos. Esta aplicación no sustituye el diagnóstico ni la prescripción de un profesional de la salud o dietista-nutricionista.
        </p>
        <div className="pt-2 flex items-center justify-between text-[11px] text-bark-400">
          <span>NutriFit v1.1.0 · Progressive Web App</span>
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Datos protegidos en tu dispositivo</span>
          </span>
        </div>
      </div>

      {/* Connect Steps Modal */}
      <ConnectStepsModal
        isOpen={isStepsModalOpen}
        onClose={() => setIsStepsModalOpen(false)}
      />

      {/* Widget Preview Modal */}
      <WidgetPreviewModal
        isOpen={isWidgetModalOpen}
        onClose={() => setIsWidgetModalOpen(false)}
      />
    </div>
  );
};
