import { Capacitor, registerPlugin } from '@capacitor/core';

export interface WidgetData {
  caloriesRemaining: number;
  caloriesTarget: number;
  caloriesConsumed: number;
  steps: number;
  waterLiters: number;
  updatedAt?: string;
}

interface NativeWidgetPlugin {
  updateWidgetData(options: {
    caloriesRemaining: number;
    caloriesTarget: number;
    caloriesConsumed: number;
    steps: number;
    waterLiters: number;
  }): Promise<{ success: boolean; updatedAt: string }>;
}

const NativeWidget = registerPlugin<NativeWidgetPlugin>('NutriFitWidget');

const WIDGET_STORAGE_KEY = 'nutrifit_widget_data_v1';

class WidgetService {
  private lastData: WidgetData | null = null;
  private listeners: Set<(data: WidgetData) => void> = new Set();

  constructor() {
    this.lastData = this.loadData();
  }

  private loadData(): WidgetData {
    if (typeof window === 'undefined') {
      return {
        caloriesRemaining: 2230,
        caloriesTarget: 2230,
        caloriesConsumed: 0,
        steps: 0,
        waterLiters: 0,
        updatedAt: 'Hoy',
      };
    }
    try {
      const stored = localStorage.getItem(WIDGET_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      caloriesRemaining: 2230,
      caloriesTarget: 2230,
      caloriesConsumed: 0,
      steps: 0,
      waterLiters: 0,
      updatedAt: 'Hoy',
    };
  }

  public getWidgetData(): WidgetData {
    return this.lastData || this.loadData();
  }

  public subscribe(cb: (data: WidgetData) => void): () => void {
    this.listeners.add(cb);
    cb(this.getWidgetData());
    return () => this.listeners.delete(cb);
  }

  /**
   * Syncs latest app data (calories, steps, water) to the native Android widget
   */
  public async syncWidget(data: {
    caloriesRemaining: number;
    caloriesTarget: number;
    caloriesConsumed: number;
    steps: number;
    waterLiters: number;
  }): Promise<void> {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fullData: WidgetData = {
      ...data,
      caloriesRemaining: Math.max(0, Math.round(data.caloriesRemaining)),
      caloriesTarget: Math.max(0, Math.round(data.caloriesTarget)),
      caloriesConsumed: Math.max(0, Math.round(data.caloriesConsumed)),
      steps: Math.max(0, Math.round(data.steps)),
      waterLiters: parseFloat(data.waterLiters.toFixed(1)),
      updatedAt: timeStr,
    };

    this.lastData = fullData;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(fullData));
      } catch {}
    }

    // Trigger local listeners
    this.listeners.forEach((cb) => {
      try {
        cb(fullData);
      } catch {}
    });

    // Send to Android Native widget if on device
    if (Capacitor.isNativePlatform()) {
      try {
        await NativeWidget.updateWidgetData({
          caloriesRemaining: fullData.caloriesRemaining,
          caloriesTarget: fullData.caloriesTarget,
          caloriesConsumed: fullData.caloriesConsumed,
          steps: fullData.steps,
          waterLiters: fullData.waterLiters,
        });
      } catch (err) {
        console.warn('Could not update native Android widget:', err);
      }
    }
  }
}

export const widgetService = new WidgetService();
