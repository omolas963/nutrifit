import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  provider: 'google' | 'samsung' | 'email' | 'guest';
  passwordHash?: string;
  avatarUrl?: string;
  hasCompletedAssessment: boolean;
  createdAt: string;
}

export interface UserDataStore {
  users: StoredUser[];
  profiles: Record<string, any>;
  foodEntries: Record<string, any[]>;
  waterLogs: Record<string, Record<string, number>>;
  weightLogs: Record<string, any[]>;
  recipes: Record<string, any[]>;
  mealPlans: Record<string, any>;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Locate project root regardless of where node process was started
const PROJECT_ROOT = fs.existsSync(path.join(__dirname, '..', 'package.json'))
  ? path.resolve(__dirname, '..')
  : fs.existsSync(path.join(__dirname, 'package.json'))
    ? __dirname
    : path.resolve(process.cwd());

const DATA_DIR = process.env.DATA_DIR || path.resolve(PROJECT_ROOT, 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'nutrifit.json');
const BACKUP_FILE = path.join(DATA_DIR, 'nutrifit.backup.json');

class Database {
  private data: UserDataStore;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): UserDataStore {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } else if (fs.existsSync(BACKUP_FILE)) {
        console.warn('[DB] DB principal no encontrada, recuperando desde backup...');
        const raw = fs.readFileSync(BACKUP_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('[DB] Error al cargar la base de datos principal, intentando backup:', e);
      if (fs.existsSync(BACKUP_FILE)) {
        try {
          const raw = fs.readFileSync(BACKUP_FILE, 'utf-8');
          return JSON.parse(raw);
        } catch {}
      }
    }

    return {
      users: [],
      profiles: {},
      foodEntries: {},
      waterLogs: {},
      weightLogs: {},
      recipes: {},
      mealPlans: {},
    };
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (e) {
      console.error('[DB] Error al guardar datos en disco:', e);
    }
  }

  public hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password.trim()).digest('hex');
  }

  // --- Users ---
  public findUserByEmail(email: string): StoredUser | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  public findUserById(id: string): StoredUser | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(params: {
    email: string;
    name: string;
    provider: 'google' | 'samsung' | 'email' | 'guest';
    password?: string;
    avatarUrl?: string;
    hasCompletedAssessment?: boolean;
  }): StoredUser {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const user: StoredUser = {
      id,
      email: params.email.trim().toLowerCase(),
      name: params.name.trim(),
      provider: params.provider,
      avatarUrl: params.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(params.name)}`,
      hasCompletedAssessment: Boolean(params.hasCompletedAssessment),
      createdAt: new Date().toISOString(),
      ...(params.password ? { passwordHash: this.hashPassword(params.password) } : {}),
    };

    this.data.users.push(user);
    // Initialize empty records for fresh user
    this.data.foodEntries[id] = [];
    this.data.waterLogs[id] = {};
    this.data.weightLogs[id] = [];
    this.data.recipes[id] = [];

    this.persist();
    return user;
  }

  public updateUser(id: string, updates: Partial<StoredUser>): StoredUser | null {
    const user = this.findUserById(id);
    if (!user) return null;

    Object.assign(user, updates);
    this.persist();
    return user;
  }

  // --- User Nutrition Data ---
  public getUserData(userId: string) {
    return {
      profile: this.data.profiles[userId] || null,
      foodEntries: this.data.foodEntries[userId] || [],
      waterLogs: this.data.waterLogs[userId] || {},
      weightLogs: this.data.weightLogs[userId] || [],
      recipes: this.data.recipes[userId] || [],
      mealPlan: this.data.mealPlans[userId] || null,
    };
  }

  public saveProfile(userId: string, profile: any) {
    this.data.profiles[userId] = profile;
    const user = this.findUserById(userId);
    if (user && !user.hasCompletedAssessment) {
      user.hasCompletedAssessment = true;
    }
    this.persist();
    return profile;
  }

  public saveFoodEntry(userId: string, entry: any) {
    if (!this.data.foodEntries[userId]) this.data.foodEntries[userId] = [];
    const index = this.data.foodEntries[userId].findIndex(e => e.id === entry.id);
    if (index >= 0) {
      this.data.foodEntries[userId][index] = entry;
    } else {
      this.data.foodEntries[userId].push(entry);
    }
    this.persist();
    return entry;
  }

  public deleteFoodEntry(userId: string, entryId: string) {
    if (!this.data.foodEntries[userId]) return false;
    this.data.foodEntries[userId] = this.data.foodEntries[userId].filter(e => e.id !== entryId);
    this.persist();
    return true;
  }

  public saveWater(userId: string, date: string, amountMl: number) {
    if (!this.data.waterLogs[userId]) this.data.waterLogs[userId] = {};
    this.data.waterLogs[userId][date] = amountMl;
    this.persist();
    return amountMl;
  }

  public saveWeightLog(userId: string, log: any) {
    if (!this.data.weightLogs[userId]) this.data.weightLogs[userId] = [];
    const index = this.data.weightLogs[userId].findIndex(l => l.id === log.id || l.date === log.date);
    if (index >= 0) {
      this.data.weightLogs[userId][index] = log;
    } else {
      this.data.weightLogs[userId].push(log);
    }
    this.persist();
    return log;
  }

  public saveRecipe(userId: string, recipe: any) {
    if (!this.data.recipes[userId]) this.data.recipes[userId] = [];
    const index = this.data.recipes[userId].findIndex(r => r.id === recipe.id);
    if (index >= 0) {
      this.data.recipes[userId][index] = recipe;
    } else {
      this.data.recipes[userId].push(recipe);
    }
    this.persist();
    return recipe;
  }

  public deleteRecipe(userId: string, recipeId: string) {
    if (!this.data.recipes[userId]) return false;
    this.data.recipes[userId] = this.data.recipes[userId].filter(r => r.id !== recipeId);
    this.persist();
    return true;
  }

  public saveMealPlan(userId: string, plan: any) {
    this.data.mealPlans[userId] = plan;
    this.persist();
    return plan;
  }
}

export const db = new Database();
