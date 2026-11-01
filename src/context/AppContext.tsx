import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, FoodEntry, Recipe, WeightLog, MealPlan, MealType, UserAccount } from '../types';
import { dataRepo } from '../services/dal/indexedDBRepo';
import { authService } from '../services/authService';
import { getTodayIsoString, shiftDays } from '../lib/utils';
import { calculateNutritionTargets } from '../lib/nutritionCalc';
import { API_BASE_URL } from '../config/api';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  currentUser: UserAccount | null;
  setCurrentUser: (user: UserAccount | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isAssessmentOpen: boolean;
  setIsAssessmentOpen: (open: boolean) => void;
  profile: UserProfile | null;
  isLoading: boolean;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  foodEntries: FoodEntry[];
  allFoodEntries: FoodEntry[];
  waterMl: number;
  recipes: Recipe[];
  weightLogs: WeightLog[];
  mealPlan: MealPlan | null;
  recentSearches: string[];
  activeToast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  preselectedMealForAdd: MealType;
  setPreselectedMealForAdd: (meal: MealType) => void;
  streakDays: number;
  toggleTheme: () => void;
  refreshData: () => Promise<void>;
  addFood: (entry: Omit<FoodEntry, 'id'>) => Promise<void>;
  updateFood: (entry: FoodEntry) => Promise<void>;
  deleteFood: (id: string) => Promise<void>;
  setWater: (amountMl: number) => Promise<void>;
  saveRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  toggleFavoriteRecipe: (id: string) => Promise<void>;
  logWeight: (weightKg: number, notes?: string) => Promise<void>;
  saveProfile: (profile: UserProfile) => Promise<void>;
  saveMealPlan: (plan: MealPlan) => Promise<void>;
  resetAllData: () => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => authService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayIsoString());
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [allFoodEntries, setAllFoodEntries] = useState<FoodEntry[]>([]);
  const [waterMl, setWaterMl] = useState<number>(0);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeToast, setActiveToast] = useState<ToastState | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [preselectedMealForAdd, setPreselectedMealForAdd] = useState<MealType>('desayuno');

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setActiveToast({ message, type });
    setTimeout(() => {
      setActiveToast((prev) => (prev?.message === message ? null : prev));
    }, 3200);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const current = authService.getCurrentUser();
      
      if (!current) {
        setProfile(null);
        setFoodEntries([]);
        setAllFoodEntries([]);
        setWaterMl(0);
        setWeightLogs([]);
        setRecipes([]);
        setMealPlan(null);
        setIsLoading(false);
        return;
      }

      // Try server sync first
      try {
        const res = await fetch(`${API_BASE_URL}/api/user/all`, {
          headers: { 'x-user-id': current.id },
        });
        if (res.ok) {
          const sData = await res.json();
          if (sData.profile) {
            setProfile(sData.profile);
            await dataRepo.saveProfile(sData.profile);
          }
          if (Array.isArray(sData.foodEntries)) {
            setAllFoodEntries(sData.foodEntries);
            const dateFoods = sData.foodEntries.filter((f: any) => f.date === selectedDate);
            setFoodEntries(dateFoods);
          }
          if (sData.waterLogs && typeof sData.waterLogs[selectedDate] === 'number') {
            setWaterMl(sData.waterLogs[selectedDate]);
          } else {
            const localWater = await dataRepo.getWaterByDate(selectedDate);
            setWaterMl(localWater);
          }
          if (Array.isArray(sData.weightLogs)) {
            setWeightLogs(sData.weightLogs);
          }
          if (Array.isArray(sData.recipes)) {
            setRecipes(sData.recipes);
          }
          if (sData.mealPlan) {
            setMealPlan(sData.mealPlan);
          }

          if (!current.hasCompletedAssessment && !sData.profile) {
            setIsAssessmentOpen(true);
          }
          setIsLoading(false);
          return;
        }
      } catch (netErr) {
        // Fallback to IndexedDB
      }

      // Local fallback
      const p = await dataRepo.getProfile();
      setProfile(p);

      const foodsForDate = await dataRepo.getFoodEntriesByDate(selectedDate);
      setFoodEntries(foodsForDate);

      const allFoods = await dataRepo.getAllFoodEntries();
      setAllFoodEntries(allFoods);

      const water = await dataRepo.getWaterByDate(selectedDate);
      setWaterMl(water);

      const rList = await dataRepo.getRecipes();
      setRecipes(rList);

      const wLogs = await dataRepo.getWeightLogs();
      setWeightLogs(wLogs);

      const mPlan = await dataRepo.getMealPlan();
      setMealPlan(mPlan);

      const searches = await dataRepo.getRecentSearches();
      setRecentSearches(searches);

      if (!current.hasCompletedAssessment && !p) {
        setIsAssessmentOpen(true);
      }
    } catch (e) {
      console.error('Error refreshing app state:', e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (profile?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile?.theme]);

  const toggleTheme = useCallback(async () => {
    if (!profile) return;
    const newTheme = profile.theme === 'dark' ? 'light' : 'dark';
    const updated: UserProfile = { ...profile, theme: newTheme, updatedAt: new Date().toISOString() };
    setProfile(updated);
    await dataRepo.saveProfile(updated);
  }, [profile]);

  const streakDays = useMemo(() => {
    if (!allFoodEntries.length) return 0;
    const loggedDates = new Set(allFoodEntries.map((e) => e.date));
    const today = getTodayIsoString();

    let streak = 0;
    let checkDate = today;

    if (!loggedDates.has(today)) {
      checkDate = shiftDays(today, -1);
      if (!loggedDates.has(checkDate)) {
        return 0;
      }
    }

    while (loggedDates.has(checkDate)) {
      streak++;
      checkDate = shiftDays(checkDate, -1);
    }

    return streak;
  }, [allFoodEntries]);

  const addFood = useCallback(async (entry: Omit<FoodEntry, 'id'>) => {
    const fullEntry: FoodEntry = {
      ...entry,
      id: `food_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    await dataRepo.addFoodEntry(fullEntry);
    
    // Server sync
    if (currentUser) {
      fetch(`${API_BASE_URL}/api/user/food`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify(fullEntry),
      }).catch(() => {});
    }

    showToast(`"${fullEntry.name}" agregado a ${fullEntry.mealType}`, 'success');
    await refreshData();
  }, [currentUser, refreshData, showToast]);

  const updateFood = useCallback(async (entry: FoodEntry) => {
    await dataRepo.updateFoodEntry(entry);
    
    if (currentUser) {
      fetch(`${API_BASE_URL}/api/user/food`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify(entry),
      }).catch(() => {});
    }

    showToast('Alimento actualizado', 'success');
    await refreshData();
  }, [currentUser, refreshData, showToast]);

  const deleteFood = useCallback(async (id: string) => {
    await dataRepo.deleteFoodEntry(id);
    
    if (currentUser) {
      fetch(`${API_BASE_URL}/api/user/food/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser.id },
      }).catch(() => {});
    }

    showToast('Alimento eliminado del diario', 'info');
    await refreshData();
  }, [currentUser, refreshData, showToast]);

  const setWater = useCallback(async (amountMl: number) => {
    const finalAmount = Math.max(0, amountMl);
    setWaterMl(finalAmount);
    await dataRepo.setWaterByDate(selectedDate, finalAmount);

    if (currentUser) {
      fetch(`${API_BASE_URL}/api/user/water`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify({ date: selectedDate, amountMl: finalAmount }),
      }).catch(() => {});
    }
  }, [currentUser, selectedDate]);

  const saveRecipe = useCallback(async (recipe: Recipe) => {
    await dataRepo.saveRecipe(recipe);
    
    if (currentUser) {
      fetch(`${API_BASE_URL}/api/user/recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify(recipe),
      }).catch(() => {});
    }

    showToast(`Receta "${recipe.title}" guardada`, 'success');
    await refreshData();
  }, [currentUser, refreshData, showToast]);

  const deleteRecipe = useCallback(async (id: string) => {
    await dataRepo.deleteRecipe(id);
    
    if (currentUser) {
      fetch(`${API_BASE_URL}/api/user/recipe/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser.id },
      }).catch(() => {});
    }

    showToast('Receta eliminada', 'info');
    await refreshData();
  }, [currentUser, refreshData, showToast]);

  const toggleFavoriteRecipe = useCallback(async (id: string) => {
    await dataRepo.toggleFavoriteRecipe(id);
    await refreshData();
  }, [refreshData]);

  const logWeight = useCallback(async (weightKg: number, notes?: string) => {
    const date = getTodayIsoString();
    const newLog: WeightLog = {
      id: `weight-${Date.now()}`,
      date,
      weightKg,
      notes,
      createdAt: new Date().toISOString(),
    };
    await dataRepo.addWeightLog(newLog);

    if (currentUser) {
      fetch(`${API_BASE_URL}/api/user/weight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify(newLog),
      }).catch(() => {});
    }

    if (profile) {
      const plan = calculateNutritionTargets({
        gender: profile.gender,
        age: profile.age,
        heightCm: profile.heightCm,
        weightKg,
        targetWeightKg: profile.targetWeightKg,
        goal: profile.goal,
        activityLevel: profile.activityLevel,
      });

      const updatedProfile: UserProfile = {
        ...profile,
        currentWeightKg: weightKg,
        dailyCalorieTarget: plan.dailyCalories,
        dailyProteinTargetGrams: plan.dailyProteinGrams,
        dailyCarbsTargetGrams: plan.dailyCarbsGrams,
        dailyFatTargetGrams: plan.dailyFatGrams,
        updatedAt: new Date().toISOString(),
      };

      await dataRepo.saveProfile(updatedProfile);
      setProfile(updatedProfile);

      if (currentUser) {
        fetch(`${API_BASE_URL}/api/user/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
          body: JSON.stringify(updatedProfile),
        }).catch(() => {});
      }

      showToast(`Peso de ${weightKg} kg registrado y objetivos actualizados`, 'success');
    }

    await refreshData();
  }, [currentUser, profile, refreshData, showToast]);

  const saveProfile = useCallback(async (newProfile: UserProfile) => {
    await dataRepo.saveProfile(newProfile);
    setProfile(newProfile);

    if (currentUser) {
      fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify(newProfile),
      }).catch(() => {});
      authService.markAssessmentCompleted(currentUser.id);
    }

    showToast('Perfil guardado con éxito', 'success');
    await refreshData();
  }, [currentUser, refreshData, showToast]);

  const saveMealPlan = useCallback(async (newPlan: MealPlan) => {
    await dataRepo.saveMealPlan(newPlan);
    setMealPlan(newPlan);
    showToast('Plan de comidas actualizado', 'success');
    await refreshData();
  }, [refreshData, showToast]);

  const resetAllData = useCallback(async () => {
    await dataRepo.clearData();
    await refreshData();
    showToast('Datos reiniciados con éxito', 'info');
  }, [refreshData, showToast]);

  const logout = useCallback(async () => {
    authService.logout();
    setCurrentUser(null);
    setProfile(null);
    setFoodEntries([]);
    setAllFoodEntries([]);
    setWaterMl(0);
    setWeightLogs([]);
    setRecipes([]);
    setMealPlan(null);
    setIsAssessmentOpen(false);
    await dataRepo.clearData();
    showToast('Sesión cerrada correctamente', 'info');
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isAssessmentOpen,
        setIsAssessmentOpen,
        profile,
        isLoading,
        isOnboardingOpen,
        setIsOnboardingOpen,
        selectedDate,
        setSelectedDate,
        foodEntries,
        allFoodEntries,
        waterMl,
        recipes,
        weightLogs,
        mealPlan,
        recentSearches,
        showToast,
        activeToast,
        isAddModalOpen,
        setIsAddModalOpen,
        preselectedMealForAdd,
        setPreselectedMealForAdd,
        streakDays,
        toggleTheme,
        refreshData,
        addFood,
        updateFood,
        deleteFood,
        setWater,
        saveRecipe,
        deleteRecipe,
        toggleFavoriteRecipe,
        logWeight,
        saveProfile,
        saveMealPlan,
        resetAllData,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de un AppProvider');
  }
  return context;
};
