import { Capacitor } from '@capacitor/core';
import { apiSaveSteps, apiGetSteps, apiDeleteSteps, StepEntry } from './api';

export type StepsPlatform = 'ios' | 'android_samsung' | 'android_standard' | 'web';
export type StepsConnectionStatus =
  | 'unconnected'
  | 'connecting'
  | 'connected'
  | 'permission_denied'
  | 'not_available'
  | 'error';

export interface DayStepData {
  date: string; // YYYY-MM-DD
  steps: number;
  distanceMeters: number;
  calories: number;
  exerciseCalories?: number;
  source: 'health_connect' | 'healthkit' | 'manual' | 'simulated';
  updatedAt: string;
}

export interface StepsState {
  platform: StepsPlatform;
  status: StepsConnectionStatus;
  lastSyncTime: string | null;
  todaySteps: number;
  todayDistanceMeters: number;
  todayCalories: number;
  // Exercise calories from Apple Health / Health Connect (workouts, sport sessions)
  importExerciseCalories: boolean;
  todayExerciseCalories: number;
  includeExerciseCaloriesInDailyGoal: boolean;
  dailyTarget: number;
  includeCaloriesInDailyGoal: boolean;
  syncToServer: boolean;
  history: Record<string, DayStepData>;
  errorMessage?: string;
  isSamsung: boolean;
}

const STORAGE_STEPS_KEY = 'nutrifit_steps_state_v1';

// Dynamic import helper to safely access @capacitor/health-fitness without crashing on web/bundler
let healthFitnessPluginInstance: any = null;
async function getHealthFitnessPlugin() {
  if (healthFitnessPluginInstance) return healthFitnessPluginInstance;
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const mod = await import('@capacitor/health-fitness');
    healthFitnessPluginInstance = mod.HealthFitness;
    return healthFitnessPluginInstance;
  } catch (err) {
    console.warn('HealthFitness plugin unavailable natively:', err);
    return null;
  }
}

export class StepsService {
  private state: StepsState;
  private listeners: Set<(state: StepsState) => void> = new Set();
  private syncIntervalId: any = null;
  private isSyncing = false;

  constructor() {
    this.state = this.loadInitialState();
    this.setupAppLifecycle();
  }

  private isSamsungDevice(): boolean {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /Samsung|SM-|SAMSUNG/i.test(ua);
  }

  private detectPlatform(): StepsPlatform {
    if (!Capacitor.isNativePlatform()) {
      return 'web';
    }
    const plat = Capacitor.getPlatform();
    if (plat === 'ios') return 'ios';
    if (this.isSamsungDevice()) return 'android_samsung';
    return 'android_standard';
  }

  private loadInitialState(): StepsState {
    const defaultPlatform = this.detectPlatform();
    const isSamsung = this.isSamsungDevice();

    const baseState: StepsState = {
      platform: defaultPlatform,
      status: 'unconnected',
      lastSyncTime: null,
      todaySteps: 0,
      todayDistanceMeters: 0,
      todayCalories: 0,
      importExerciseCalories: false,
      todayExerciseCalories: 0,
      includeExerciseCaloriesInDailyGoal: false,
      dailyTarget: 10000,
      includeCaloriesInDailyGoal: false,
      syncToServer: true,
      history: {},
      isSamsung,
    };

    if (typeof window === 'undefined') return baseState;

    try {
      const stored = localStorage.getItem(STORAGE_STEPS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...baseState,
          ...parsed,
          platform: defaultPlatform,
          isSamsung,
        };
      }
    } catch (e) {
      console.warn('Error loading steps state from localStorage:', e);
    }

    return baseState;
  }

  private persistState(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_STEPS_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Error saving steps state:', e);
    }
    this.notify();
  }

  private notify(): void {
    const snapshot = { ...this.state };
    this.listeners.forEach((cb) => {
      try {
        cb(snapshot);
      } catch (err) {
        console.error('StepsService listener error:', err);
      }
    });
  }

  public subscribe(cb: (state: StepsState) => void): () => void {
    this.listeners.add(cb);
    cb({ ...this.state });
    return () => this.listeners.delete(cb);
  }

  public getState(): StepsState {
    return { ...this.state };
  }

  /**
   * Estimates calories burned based on body weight and steps.
   * Standard sports science estimation: ~0.04 kcal per step for a 70kg adult.
   */
  public estimateCalories(steps: number, userWeightKg: number = 70): number {
    if (!steps || steps <= 0) return 0;
    const factor = (userWeightKg || 70) / 70;
    return Math.round(steps * 0.04 * factor);
  }

  /**
   * Estimates distance walked in meters based on height and steps.
   * Average stride length = height * 0.415
   */
  public estimateDistanceMeters(steps: number, userHeightCm: number = 175): number {
    if (!steps || steps <= 0) return 0;
    const strideMeters = ((userHeightCm || 175) * 0.415) / 100;
    return Math.round(steps * strideMeters);
  }

  /**
   * Request Health permissions on native device (iOS HealthKit or Android Health Connect).
   */
  public async connectHealth(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      // On web/PWA native health permissions cannot be requested
      this.state.status = 'unconnected';
      this.persistState();
      return false;
    }

    const plugin = await getHealthFitnessPlugin();
    if (!plugin) {
      this.state.status = 'not_available';
      this.state.errorMessage = 'El plugin de salud no está disponible en este dispositivo.';
      this.persistState();
      return false;
    }

    this.state.status = 'connecting';
    this.notify();

    try {
      // Declare READ-only access for STEPS and DISTANCE
      const customPerms = JSON.stringify([
        { Variable: 'STEPS', AccessType: 'READ' },
        { Variable: 'DISTANCE', AccessType: 'READ' },
      ]);
      const fitnessPerms = JSON.stringify({
        IsActive: true,
        AccessType: 'READ',
      });

      await plugin.requestHealthPermissions({
        customPermissions: customPerms,
        allVariables: JSON.stringify({ IsActive: false, AccessType: 'READ' }),
        fitnessVariables: fitnessPerms,
        healthVariables: JSON.stringify({ IsActive: false, AccessType: 'READ' }),
        profileVariables: JSON.stringify({ IsActive: false, AccessType: 'READ' }),
        workoutVariables: JSON.stringify({ IsActive: false, AccessType: 'READ' }),
      });

      this.state.status = 'connected';
      this.state.errorMessage = undefined;
      this.persistState();

      // Immediately run first sync
      await this.syncSteps();
      return true;
    } catch (err: any) {
      console.warn('connectHealth error:', err);
      const msg = String(err?.message || err);

      if (msg.includes('not installed') || msg.includes('not available') || msg.includes('0401')) {
        this.state.status = 'not_available';
        this.state.errorMessage = 'Health Connect no está instalado en este dispositivo.';
      } else if (msg.includes('denied') || msg.includes('cancelled') || msg.includes('rejected')) {
        this.state.status = 'permission_denied';
        this.state.errorMessage = 'Permiso denegado por el usuario en Ajustes.';
      } else {
        // Many Android / iOS permission dialogs finish without error even if user unchecked steps
        this.state.status = 'connected';
      }

      this.persistState();
      return this.state.status === 'connected';
    }
  }

  /**
   * Opens native Samsung Health app on device
   */
  public openSamsungHealth(): void {
    if (typeof window === 'undefined') return;
    try {
      window.location.href = 'intent:#Intent;package=com.sec.android.app.shealth;end';
    } catch {
      window.open('https://play.google.com/store/apps/details?id=com.sec.android.app.shealth', '_blank');
    }
  }

  /**
   * Opens native Health Connect app or settings (Android)
   */
  public async openHealthSettings(): Promise<void> {
    if (typeof window === 'undefined') return;

    if (Capacitor.isNativePlatform()) {
      const plugin = await getHealthFitnessPlugin();
      if (plugin && typeof plugin.openHealthConnect === 'function') {
        try {
          await plugin.openHealthConnect();
          return;
        } catch (e) {
          console.warn('Could not open Health Connect via plugin:', e);
        }
      }
    }

    // On Android (browser or native fallback): launch Android Settings / Health Connect Intent
    if (this.state.platform !== 'ios') {
      try {
        window.location.href = 'intent:#Intent;action=android.settings.HEALTH_CONNECT_SETTINGS;end';
      } catch {
        window.open('https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata', '_blank');
      }
    } else {
      alert('En iPhone: Abre Ajustes > Salud > Acceso a datos y dispositivos > NutriFit.');
    }
  }

  /**
   * Synchronize steps without duplicating (daily aggregated statistics).
   * Reads today, last 7 days, and last 30 days.
   */
  public async syncSteps(userWeightKg: number = 70, userHeightCm: number = 175): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const todayIso = new Date().toISOString().split('T')[0];

      if (Capacitor.isNativePlatform() && this.state.status === 'connected') {
        const plugin = await getHealthFitnessPlugin();
        if (plugin) {
          // Calculate start date: 30 days ago at local midnight
          const startDateObj = new Date();
          startDateObj.setDate(startDateObj.getDate() - 30);
          startDateObj.setHours(0, 0, 0, 0);

          const endDateObj = new Date();
          endDateObj.setHours(23, 59, 59, 999);

          // Daily aggregation query: Prevents duplicate counting of watch and phone steps
          const queryParams = JSON.stringify({
            variable: 'STEPS',
            startDate: startDateObj.toISOString(),
            endDate: endDateObj.toISOString(),
            timeUnit: 'DAY',
            timeUnitLength: 1,
            operationType: 'SUM',
          });

          let aggregatedResult: any = null;
          try {
            const res = await plugin.getData({ parameters: queryParams });
            if (res && res.results) {
              aggregatedResult = typeof res.results === 'string' ? JSON.parse(res.results) : res.results;
            }
          } catch (queryErr) {
            console.warn('plugin.getData failed, falling back to getLastRecord:', queryErr);
            try {
              const last = await plugin.getLastRecord({ variable: 'STEPS' });
              if (last && last.results) {
                aggregatedResult = typeof last.results === 'string' ? JSON.parse(last.results) : last.results;
              }
            } catch (e) {
              console.warn('getLastRecord failed:', e);
            }
          }

          // Parse aggregated blocks per day
          if (Array.isArray(aggregatedResult)) {
            aggregatedResult.forEach((block: any) => {
              const dateKey = block.startDate ? block.startDate.split('T')[0] : todayIso;
              const steps = Math.max(0, Math.round(Number(block.value || block.total || 0)));
              const dist = this.estimateDistanceMeters(steps, userHeightCm);
              const cals = this.estimateCalories(steps, userWeightKg);

              this.state.history[dateKey] = {
                date: dateKey,
                steps,
                distanceMeters: dist,
                calories: cals,
                source: this.state.platform === 'ios' ? 'healthkit' : 'health_connect',
                updatedAt: new Date().toISOString(),
              };
            });
          }
        }
      }

      // Update today's figures
      const todayEntry = this.state.history[todayIso];
      if (todayEntry) {
        this.state.todaySteps = todayEntry.steps;
        this.state.todayDistanceMeters = todayEntry.distanceMeters;
        this.state.todayCalories = todayEntry.calories;
      }

      this.state.lastSyncTime = new Date().toISOString();

      // Sync to cloud backend if enabled by user
      if (this.state.syncToServer && this.state.todaySteps > 0) {
        await apiSaveSteps({
          date: todayIso,
          steps: this.state.todaySteps,
          distanceMeters: this.state.todayDistanceMeters,
          calories: this.state.todayCalories,
          source: todayEntry?.source || 'manual',
        });
      }

      this.persistState();
    } catch (err) {
      console.warn('syncSteps failed:', err);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Manual steps entry (for Web/PWA or when user enters manually).
   */
  public async setManualSteps(
    date: string,
    steps: number,
    userWeightKg: number = 70,
    userHeightCm: number = 175,
    exerciseCalories?: number
  ): Promise<void> {
    const validSteps = Math.max(0, Math.min(150000, Math.round(steps)));
    const distanceMeters = this.estimateDistanceMeters(validSteps, userHeightCm);
    const calories = this.estimateCalories(validSteps, userWeightKg);
    const validExerciseCals = exerciseCalories !== undefined ? Math.max(0, Math.round(exerciseCalories)) : undefined;

    this.state.history[date] = {
      date,
      steps: validSteps,
      distanceMeters,
      calories,
      exerciseCalories: validExerciseCals,
      source: 'manual',
      updatedAt: new Date().toISOString(),
    };

    const todayIso = new Date().toISOString().split('T')[0];
    if (date === todayIso) {
      this.state.todaySteps = validSteps;
      this.state.todayDistanceMeters = distanceMeters;
      this.state.todayCalories = calories;
      if (validExerciseCals !== undefined) {
        this.state.todayExerciseCalories = validExerciseCals;
      }
    }

    this.state.lastSyncTime = new Date().toISOString();

    if (this.state.syncToServer) {
      await apiSaveSteps({
        date,
        steps: validSteps,
        distanceMeters,
        calories,
        source: 'manual',
      });
    }

    this.persistState();
  }

  public setDailyTarget(target: number): void {
    const valid = Math.max(1000, Math.min(100000, Math.round(target)));
    this.state.dailyTarget = valid;
    this.persistState();
  }

  public setIncludeCaloriesInDailyGoal(include: boolean): void {
    this.state.includeCaloriesInDailyGoal = include;
    this.persistState();
  }

  public setImportExerciseCalories(enabled: boolean): void {
    this.state.importExerciseCalories = enabled;
    this.persistState();
    if (enabled && this.state.status === 'connected') {
      this.syncSteps();
    }
  }

  public setIncludeExerciseCaloriesInDailyGoal(include: boolean): void {
    this.state.includeExerciseCaloriesInDailyGoal = include;
    this.persistState();
  }

  public setSyncToServer(sync: boolean): void {
    this.state.syncToServer = sync;
    this.persistState();
  }

  /**
   * Disconnect and Erase all step tracking data (Privacy Requirement 9)
   */
  public async disconnectAndEraseData(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      const plugin = await getHealthFitnessPlugin();
      if (plugin && typeof plugin.disconnectFromHealthConnect === 'function') {
        try {
          await plugin.disconnectFromHealthConnect();
        } catch (e) {
          console.warn('disconnectFromHealthConnect error:', e);
        }
      }
    }

    // Call server to wipe database steps
    await apiDeleteSteps();

    // Reset local state
    this.state.status = 'unconnected';
    this.state.todaySteps = 0;
    this.state.todayDistanceMeters = 0;
    this.state.todayCalories = 0;
    this.state.lastSyncTime = null;
    this.state.history = {};
    this.state.errorMessage = undefined;

    this.persistState();
  }

  /**
   * Injects mock aggregated data for automated testing and test suites.
   */
  public injectTestData(testData: Record<string, number>, userWeightKg: number = 70): void {
    const todayIso = new Date().toISOString().split('T')[0];
    Object.entries(testData).forEach(([date, steps]) => {
      this.state.history[date] = {
        date,
        steps,
        distanceMeters: this.estimateDistanceMeters(steps),
        calories: this.estimateCalories(steps, userWeightKg),
        source: 'simulated',
        updatedAt: new Date().toISOString(),
      };
      if (date === todayIso) {
        this.state.todaySteps = steps;
        this.state.todayDistanceMeters = this.estimateDistanceMeters(steps);
        this.state.todayCalories = this.estimateCalories(steps, userWeightKg);
      }
    });
    this.persistState();
  }

  public setTestStatus(status: StepsConnectionStatus, errorMsg?: string): void {
    this.state.status = status;
    this.state.errorMessage = errorMsg;
    this.persistState();
  }

  private setupAppLifecycle(): void {
    if (typeof window === 'undefined') return;

    // 1. Sync on visibility change (when user returns to the app from Health Connect / home screen)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.state.status === 'connected') {
        this.syncSteps();
      }
    });

    // 2. Periodic sync every 3 minutes while the app remains open
    this.syncIntervalId = setInterval(() => {
      if (this.state.status === 'connected' && typeof document !== 'undefined' && document.visibilityState === 'visible') {
        this.syncSteps();
      }
    }, 180_000);
  }

  public destroy(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
    this.listeners.clear();
  }
}

export const stepsService = new StepsService();
