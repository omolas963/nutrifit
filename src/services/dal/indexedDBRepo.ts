import { IDataRepository } from './repositoryInterface';
import { UserProfile, FoodEntry, Recipe, WeightLog, MealPlan } from '../../types';
import { getTodayIsoString } from '../../lib/utils';

const DB_NAME = 'NutriFitDB';
const DB_VERSION = 1;

export class IndexedDBRepository implements IDataRepository {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB no está disponible en este entorno.'));
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Stores
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile');
        }
        if (!db.objectStoreNames.contains('foodEntries')) {
          const foodStore = db.createObjectStore('foodEntries', { keyPath: 'id' });
          foodStore.createIndex('date', 'date', { unique: false });
        }
        if (!db.objectStoreNames.contains('recipes')) {
          db.createObjectStore('recipes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('weightLogs')) {
          const weightStore = db.createObjectStore('weightLogs', { keyPath: 'id' });
          weightStore.createIndex('date', 'date', { unique: false });
        }
        if (!db.objectStoreNames.contains('waterLogs')) {
          db.createObjectStore('waterLogs', { keyPath: 'date' });
        }
        if (!db.objectStoreNames.contains('mealPlans')) {
          db.createObjectStore('mealPlans');
        }
        if (!db.objectStoreNames.contains('searchHistory')) {
          db.createObjectStore('searchHistory', { keyPath: 'query' });
        }
      };

      request.onsuccess = async () => {
        const db = request.result;
        resolve(db);
      };

      request.onerror = (e) => {
        console.error('Error al abrir IndexedDB:', e);
        reject(e);
      };
    });

    return this.dbPromise;
  }

  private async seedInitialDataWithDB(db: IDBDatabase): Promise<void> {
    return Promise.resolve();
  }

  public async seedInitialData(): Promise<void> {
    return Promise.resolve();
  }

  // --- Profile ---
  public async getProfile(): Promise<UserProfile | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('profile', 'readonly');
      const req = tx.objectStore('profile').get('current_user');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  public async saveProfile(profile: UserProfile): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('profile', 'readwrite');
      const req = tx.objectStore('profile').put(profile, 'current_user');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Food Entries ---
  public async getFoodEntriesByDate(date: string): Promise<FoodEntry[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('foodEntries', 'readonly');
      const index = tx.objectStore('foodEntries').index('date');
      const req = index.getAll(date);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  public async getAllFoodEntries(): Promise<FoodEntry[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('foodEntries', 'readonly');
      const req = tx.objectStore('foodEntries').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  public async addFoodEntry(entry: Omit<FoodEntry, 'id'>): Promise<FoodEntry> {
    const db = await this.getDB();
    const newEntry: FoodEntry = {
      ...entry,
      id: `food-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction('foodEntries', 'readwrite');
      const req = tx.objectStore('foodEntries').put(newEntry);
      req.onsuccess = () => resolve(newEntry);
      req.onerror = () => reject(req.error);
    });
  }

  public async updateFoodEntry(entry: FoodEntry): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('foodEntries', 'readwrite');
      const req = tx.objectStore('foodEntries').put(entry);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async deleteFoodEntry(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('foodEntries', 'readwrite');
      const req = tx.objectStore('foodEntries').delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Water Logs ---
  public async getWaterByDate(date: string): Promise<number> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('waterLogs', 'readonly');
      const req = tx.objectStore('waterLogs').get(date);
      req.onsuccess = () => resolve(req.result ? req.result.amountMl : 0);
      req.onerror = () => reject(req.error);
    });
  }

  public async setWaterByDate(date: string, amountMl: number): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('waterLogs', 'readwrite');
      const req = tx.objectStore('waterLogs').put({ date, amountMl });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Recipes ---
  public async getRecipes(): Promise<Recipe[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('recipes', 'readonly');
      const req = tx.objectStore('recipes').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  public async saveRecipe(recipe: Recipe): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('recipes', 'readwrite');
      const req = tx.objectStore('recipes').put(recipe);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async deleteRecipe(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('recipes', 'readwrite');
      const req = tx.objectStore('recipes').delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async toggleFavoriteRecipe(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('recipes', 'readwrite');
      const store = tx.objectStore('recipes');
      const req = store.get(id);
      req.onsuccess = () => {
        const recipe = req.result as Recipe;
        if (recipe) {
          recipe.isFavorite = !recipe.isFavorite;
          store.put(recipe);
        }
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  }

  // --- Weight Logs ---
  public async getWeightLogs(): Promise<WeightLog[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('weightLogs', 'readonly');
      const req = tx.objectStore('weightLogs').getAll();
      req.onsuccess = () => {
        const items = (req.result || []) as WeightLog[];
        items.sort((a, b) => a.date.localeCompare(b.date));
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async addWeightLog(log: WeightLog): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('weightLogs', 'readwrite');
      const req = tx.objectStore('weightLogs').put(log);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async deleteWeightLog(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('weightLogs', 'readwrite');
      const req = tx.objectStore('weightLogs').delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Meal Plan ---
  public async getMealPlan(): Promise<MealPlan | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mealPlans', 'readonly');
      const req = tx.objectStore('mealPlans').get('current_plan');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  public async saveMealPlan(plan: MealPlan): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mealPlans', 'readwrite');
      const req = tx.objectStore('mealPlans').put(plan, 'current_plan');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Search History ---
  public async getRecentSearches(): Promise<string[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('searchHistory', 'readonly');
      const req = tx.objectStore('searchHistory').getAll();
      req.onsuccess = () => {
        const results = (req.result || []).map((item: any) => item.query);
        resolve(results.slice(0, 8));
      };
      req.onerror = () => resolve([]);
    });
  }

  public async addRecentSearch(query: string): Promise<void> {
    const clean = query.trim();
    if (!clean) return;
    const db = await this.getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('searchHistory', 'readwrite');
      tx.objectStore('searchHistory').put({ query: clean, timestamp: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  // --- Backup & Data Management ---
  public async exportData(): Promise<string> {
    const profile = await this.getProfile();
    const foodEntries = await this.getAllFoodEntries();
    const recipes = await this.getRecipes();
    const weightLogs = await this.getWeightLogs();
    const mealPlan = await this.getMealPlan();

    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile,
      foodEntries,
      recipes,
      weightLogs,
      mealPlan,
    };

    return JSON.stringify(data, null, 2);
  }

  public async importData(jsonData: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed || typeof parsed !== 'object') return false;

      const db = await this.getDB();
      const tx = db.transaction(
        ['profile', 'foodEntries', 'recipes', 'weightLogs', 'mealPlans'],
        'readwrite'
      );

      if (parsed.profile) {
        tx.objectStore('profile').put(parsed.profile, 'current_user');
      }

      if (Array.isArray(parsed.foodEntries)) {
        const fStore = tx.objectStore('foodEntries');
        fStore.clear();
        for (const f of parsed.foodEntries) fStore.put(f);
      }

      if (Array.isArray(parsed.recipes)) {
        const rStore = tx.objectStore('recipes');
        rStore.clear();
        for (const r of parsed.recipes) rStore.put(r);
      }

      if (Array.isArray(parsed.weightLogs)) {
        const wStore = tx.objectStore('weightLogs');
        wStore.clear();
        for (const w of parsed.weightLogs) wStore.put(w);
      }

      if (parsed.mealPlan) {
        tx.objectStore('mealPlans').put(parsed.mealPlan, 'current_plan');
      }

      return new Promise((resolve) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (e) {
      console.error('Error importing data:', e);
      return false;
    }
  }

  public async clearData(): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(
      ['profile', 'foodEntries', 'recipes', 'weightLogs', 'waterLogs', 'mealPlans', 'searchHistory'],
      'readwrite'
    );
    tx.objectStore('profile').clear();
    tx.objectStore('foodEntries').clear();
    tx.objectStore('recipes').clear();
    tx.objectStore('weightLogs').clear();
    tx.objectStore('waterLogs').clear();
    tx.objectStore('mealPlans').clear();
    tx.objectStore('searchHistory').clear();

    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }
}

export const dataRepo = new IndexedDBRepository();
