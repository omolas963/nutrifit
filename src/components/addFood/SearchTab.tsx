import React, { useState, useEffect } from 'react';
import { apiSearchFood, apiEstimateFood, apiSaveCustomFood } from '../../services/api';
import { MealType, FoodEntry } from '../../types';
import { useApp } from '../../context/AppContext';
import { BarcodeScanner } from './BarcodeScanner';
import { dataRepo } from '../../services/dal/indexedDBRepo';
import {
  Search,
  Barcode,
  Plus,
  Loader2,
  Clock,
  Star,
  Sparkles,
  CheckCircle2,
  FileQuestion,
  X,
  ChevronRight,
  ShieldCheck,
  Scale
} from 'lucide-react';

interface SearchTabProps {
  initialMealType?: MealType;
}

export const SearchTab: React.FC<SearchTabProps> = ({ initialMealType = 'comida' }) => {
  const { addFood, selectedDate, recentSearches, showToast } = useApp();
  const [query, setQuery] = useState('');
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  
  // Portion configuration
  const [unitMode, setUnitMode] = useState<'grams' | 'units'>('grams');
  const [unitsCount, setUnitsCount] = useState<number>(1);
  const [grams, setGrams] = useState<number>(100);

  // Favorites state stored in localStorage
  const [favorites, setFavorites] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('nutrifit_food_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [activeListTab, setActiveListTab] = useState<'all' | 'favorites'>('all');
  const [brandFilter, setBrandFilter] = useState<'all' | 'generic' | 'branded'>('all');

  // "No encuentro mi alimento" modal state
  const [isNotFoundModalOpen, setIsNotFoundModalOpen] = useState(false);
  const [isEstimatingAI, setIsEstimatingAI] = useState(false);
  const [notFoundQuery, setNotFoundQuery] = useState('');

  // Manual custom food form
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [manualPortionName, setManualPortionName] = useState('');
  const [manualPortionGrams, setManualPortionGrams] = useState('100');

  // Sync favorites to localStorage
  const toggleFavorite = (food: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const key = food.name.toLowerCase();
    const exists = favorites.some((f) => f.name.toLowerCase() === key);
    let updated: any[];
    if (exists) {
      updated = favorites.filter((f) => f.name.toLowerCase() !== key);
      showToast('Eliminado de favoritos', 'info');
    } else {
      updated = [food, ...favorites];
      showToast('Guardado en favoritos', 'success');
    }
    setFavorites(updated);
    try {
      localStorage.setItem('nutrifit_food_favorites', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const isFavorite = (food: any) => {
    return favorites.some((f) => f.name.toLowerCase() === food.name.toLowerCase());
  };

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await apiSearchFood(trimmed);
        setResults(res || []);
        setHasSearched(true);
        if (res && res.length > 0) {
          await dataRepo.addRecentSearch(trimmed);
        }
      } catch (e) {
        console.error('Error buscando alimentos:', e);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // When food is selected, set initial grams & units
  const handleSelectFood = (item: any) => {
    setSelectedFood(item);
    if (item.portionGrams && item.portionName) {
      setUnitMode('units');
      setUnitsCount(1);
      setGrams(item.portionGrams);
    } else {
      setUnitMode('grams');
      setGrams(100);
      setUnitsCount(1);
    }
  };

  // Update grams based on unit count
  const handleUnitsChange = (count: number) => {
    setUnitsCount(count);
    if (selectedFood?.portionGrams) {
      setGrams(Math.round(count * selectedFood.portionGrams));
    }
  };

  const handleAddFood = async (item: any) => {
    const factor = grams / 100;
    const isAi = item.source === 'Estimado por IA';
    const entry: Omit<FoodEntry, 'id'> = {
      name: item.name,
      brand: item.brand,
      grams,
      calories: Math.round(item.caloriesPer100g * factor),
      protein: Number((item.proteinPer100g * factor).toFixed(1)),
      carbs: Number((item.carbsPer100g * factor).toFixed(1)),
      fat: Number((item.fatPer100g * factor).toFixed(1)),
      source: item.source || 'Base de datos oficial',
      isEstimated: isAi,
      mealType,
      date: selectedDate,
      loggedAt: new Date().toISOString(),
    };

    await addFood(entry);
    showToast(`Añadido ${grams}g de ${item.name} a ${mealType}`, 'success');
    setSelectedFood(null);
  };

  // AI Estimation request on-the-fly
  const handleRequestAIEstimate = async () => {
    const target = notFoundQuery.trim() || query.trim();
    if (!target) return;
    setIsEstimatingAI(true);
    try {
      const estimated = await apiEstimateFood(target);
      if (estimated) {
        setResults((prev) => [estimated, ...prev]);
        handleSelectFood(estimated);
        setIsNotFoundModalOpen(false);
        showToast('Alimento estimado con éxito por la IA', 'success');
      } else {
        showToast('No pudimos estimar el alimento. Prueba describiéndolo con más detalle.', 'error');
      }
    } catch {
      showToast('Error al conectar con la IA', 'error');
    } finally {
      setIsEstimatingAI(false);
    }
  };

  // Save custom food manually
  const handleSaveManualFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualCalories) return;

    try {
      const cal = parseFloat(manualCalories);
      const p = parseFloat(manualProtein) || 0;
      const c = parseFloat(manualCarbs) || 0;
      const f = parseFloat(manualFat) || 0;
      const pGrams = parseInt(manualPortionGrams, 10) || 100;

      const created = await apiSaveCustomFood({
        name: manualName.trim(),
        brand: 'Personalizado',
        caloriesPer100g: cal,
        proteinPer100g: p,
        carbsPer100g: c,
        fatPer100g: f,
        portionName: manualPortionName.trim() || '1 ración',
        portionGrams: pGrams,
        category: 'Mis Alimentos',
      });

      if (created) {
        setResults((prev) => [created, ...prev]);
        handleSelectFood(created);
        setIsNotFoundModalOpen(false);
        setShowManualForm(false);
        showToast('Alimento personalizado guardado', 'success');
      }
    } catch {
      showToast('Error al guardar el alimento manual', 'error');
    }
  };

  if (showBarcodeScanner) {
    return (
      <BarcodeScanner
        mealType={mealType}
        onClose={() => setShowBarcodeScanner(false)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Meal Selector */}
      <div className="grid grid-cols-5 gap-1.5">
        {(['desayuno', 'comida', 'merienda', 'cena', 'snacks'] as MealType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setMealType(type)}
            className={`py-1.5 px-1 rounded-xl text-xs font-semibold capitalize transition-all ${
              mealType === type
                ? 'bg-solar text-bark-900 font-bold shadow-sm scale-[1.02]'
                : 'bg-cream-200 dark:bg-dark-surface text-bark-700 dark:text-dark-muted hover:bg-cream-300'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Search Bar + Barcode Scanner Button */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveListTab('all');
            }}
            placeholder="Buscar alimento o plato en español o catalán..."
            className="w-full pl-10 pr-9 py-3 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl text-bark-900 dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-solar shadow-sm"
            autoFocus
          />
          <Search className="w-4 h-4 text-bark-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-bark-400 hover:text-bark-700 p-1"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowBarcodeScanner(true)}
          className="p-3 bg-cream-200 dark:bg-dark-surface hover:bg-cream-300 dark:hover:bg-dark-elevated rounded-2xl text-bark-800 dark:text-dark-text transition-colors shadow-sm shrink-0"
          title="Escanear código de barras"
          aria-label="Abrir escáner de código de barras"
        >
          <Barcode className="w-5 h-5 text-solar-700 dark:text-solar" />
        </button>
      </div>

      {/* Subtabs: All vs Favorites & "No encuentro mi alimento" button */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => setActiveListTab('all')}
            className={`py-1 px-3 rounded-xl text-xs font-bold transition-all ${
              activeListTab === 'all'
                ? 'bg-solar text-bark-900 shadow-xs'
                : 'bg-cream-100 dark:bg-dark-surface text-bark-600 dark:text-dark-muted'
            }`}
          >
            Búsqueda
          </button>
          <button
            type="button"
            onClick={() => setActiveListTab('favorites')}
            className={`py-1 px-3 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all ${
              activeListTab === 'favorites'
                ? 'bg-solar text-bark-900 shadow-xs'
                : 'bg-cream-100 dark:bg-dark-surface text-bark-600 dark:text-dark-muted'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
            <span>Favoritos ({favorites.length})</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setNotFoundQuery(query);
            setIsNotFoundModalOpen(true);
          }}
          className="text-[11px] font-bold text-amber-800 dark:text-solar hover:underline flex items-center space-x-1"
        >
          <FileQuestion className="w-3.5 h-3.5" />
          <span>No encuentro mi alimento</span>
        </button>
      </div>

      {/* Quick Filters: Todos | Genéricos | Marcas */}
      {query && results.length > 0 && activeListTab === 'all' && (
        <div className="flex items-center space-x-1.5 pt-0.5">
          <span className="text-[11px] font-bold text-bark-500 dark:text-dark-muted">Ver:</span>
          <button
            type="button"
            onClick={() => setBrandFilter('all')}
            className={`py-0.5 px-2.5 rounded-lg text-[11px] font-bold transition-all ${
              brandFilter === 'all'
                ? 'bg-solar text-bark-900 shadow-2xs'
                : 'bg-cream-100 dark:bg-dark-surface text-bark-600 dark:text-dark-muted hover:bg-cream-200'
            }`}
          >
            Todos ({results.length})
          </button>
          <button
            type="button"
            onClick={() => setBrandFilter('generic')}
            className={`py-0.5 px-2.5 rounded-lg text-[11px] font-bold transition-all ${
              brandFilter === 'generic'
                ? 'bg-solar text-bark-900 shadow-2xs'
                : 'bg-cream-100 dark:bg-dark-surface text-bark-600 dark:text-dark-muted hover:bg-cream-200'
            }`}
          >
            Genéricos
          </button>
          <button
            type="button"
            onClick={() => setBrandFilter('branded')}
            className={`py-0.5 px-2.5 rounded-lg text-[11px] font-bold transition-all ${
              brandFilter === 'branded'
                ? 'bg-solar text-bark-900 shadow-2xs'
                : 'bg-cream-100 dark:bg-dark-surface text-bark-600 dark:text-dark-muted hover:bg-cream-200'
            }`}
          >
            Marcas
          </button>
        </div>
      )}

      {/* Quick Suggestion Pills when query is empty */}
      {!query && activeListTab === 'all' && (
        <div className="space-y-3">
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-bark-500 dark:text-dark-muted mb-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Búsquedas recientes</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="py-1 px-3 bg-cream-200 dark:bg-dark-surface hover:bg-cream-300 dark:hover:bg-dark-elevated rounded-full text-xs text-bark-800 dark:text-dark-muted transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-bark-500 dark:text-dark-muted mb-2">
              <Sparkles className="w-3.5 h-3.5 text-solar-700" />
              <span>Platos y alimentos habituales</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Huevos fritos',
                'Ensaimada',
                'Tortilla de patatas',
                'Pa amb tomàquet',
                'Pechuga de pollo',
                'Lentejas estofadas',
                'Croquetas de jamón',
                'Arroz blanco',
                'Pan Bimbo',
                'Salmón a la plancha',
                'Botifarra amb seques',
                'Crema catalana',
              ].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="py-1 px-2.5 bg-white dark:bg-dark-surface border border-cream-200 dark:border-dark-border hover:border-solar rounded-full text-xs font-medium text-bark-800 dark:text-dark-text transition-colors shadow-2xs"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Food Quantity & Portion Configurator (Units vs Grams) */}
      {selectedFood && (
        <div className="p-4 bg-solar-50 dark:bg-solar/10 border-2 border-solar rounded-2xl space-y-3 animate-in zoom-in-95 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="pr-2">
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                <h5 className="font-display font-bold text-sm text-bark-900 dark:text-dark-text">
                  {selectedFood.name}
                </h5>

                {/* Badge: Verificado vs Estimado por IA */}
                {selectedFood.source === 'Estimado por IA' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center space-x-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Estimado por IA</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center space-x-1">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>Verificado</span>
                  </span>
                )}

                {selectedFood.isStandard && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    ⭐ Estándar / Normal
                  </span>
                )}
              </div>
              <p className="text-xs text-bark-500 dark:text-dark-muted mt-0.5">
                Por 100g: {selectedFood.caloriesPer100g} kcal · {selectedFood.proteinPer100g}g P · {selectedFood.carbsPer100g}g C · {selectedFood.fatPer100g}g G
              </p>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={(e) => toggleFavorite(selectedFood, e)}
                className="p-1 text-bark-400 hover:text-amber-500 transition-colors"
                title="Favorito"
              >
                <Star
                  className={`w-4 h-4 ${
                    isFavorite(selectedFood) ? 'fill-amber-400 text-amber-500' : ''
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => setSelectedFood(null)}
                className="p-1 text-xs font-semibold text-bark-400 hover:text-bark-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Unit Toggle: Grams vs Units (if portion available) */}
          {selectedFood.portionName && selectedFood.portionGrams && (
            <div className="flex bg-cream-200 dark:bg-dark-surface p-1 rounded-xl text-xs font-bold w-fit">
              <button
                type="button"
                onClick={() => {
                  setUnitMode('units');
                  setGrams(Math.round(unitsCount * selectedFood.portionGrams));
                }}
                className={`py-1 px-3 rounded-lg transition-all ${
                  unitMode === 'units'
                    ? 'bg-solar text-bark-900 shadow-xs'
                    : 'text-bark-600 dark:text-dark-muted'
                }`}
              >
                Por unidades ({selectedFood.portionName})
              </button>
              <button
                type="button"
                onClick={() => setUnitMode('grams')}
                className={`py-1 px-3 rounded-lg transition-all ${
                  unitMode === 'grams'
                    ? 'bg-solar text-bark-900 shadow-xs'
                    : 'text-bark-600 dark:text-dark-muted'
                }`}
              >
                Por gramos (g)
              </button>
            </div>
          )}

          {/* Unit Selector or Grams Selector */}
          {unitMode === 'units' && selectedFood.portionName && selectedFood.portionGrams ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-bark-700 dark:text-dark-text">Cantidad:</span>
                {[0.5, 1, 2, 3].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => handleUnitsChange(u)}
                    className={`py-1 px-2.5 rounded-xl text-xs font-bold transition-all ${
                      unitsCount === u
                        ? 'bg-solar text-bark-900 ring-2 ring-solar-600 shadow-xs'
                        : 'bg-white dark:bg-dark-surface border border-cream-300 text-bark-800'
                    }`}
                  >
                    {u} {selectedFood.portionName.split(' ')[0]}
                  </button>
                ))}
              </div>
              <div className="text-xs text-bark-600 dark:text-dark-muted">
                Equivale a: <strong>{grams} gramos</strong>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 pt-1 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-bark-600 dark:text-dark-muted shrink-0">Gramos:</span>
              {[50, 100, 150, 200, 300].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrams(g)}
                  className={`py-1 px-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    grams === g
                      ? 'bg-solar text-bark-900 ring-2 ring-solar-600 shadow-xs'
                      : 'bg-white dark:bg-dark-surface border border-cream-300 text-bark-800 hover:bg-cream-100'
                  }`}
                >
                  {g}g
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-3 pt-1 border-t border-solar/30">
            <span className="text-xs font-bold text-bark-700 dark:text-dark-text">Ajuste manual (g):</span>
            <input
              type="number"
              min="1"
              max="3000"
              value={grams}
              onChange={(e) => setGrams(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-20 px-2 py-1 bg-white dark:bg-dark-surface border border-cream-300 rounded-xl font-bold text-center text-bark-900 dark:text-dark-text shadow-inner text-sm"
            />
            <div className="text-xs text-bark-600 dark:text-dark-muted font-medium flex-1 text-right">
              <strong className="text-bark-900 dark:text-dark-text font-display text-base">
                {Math.round(selectedFood.caloriesPer100g * (grams / 100))} kcal
              </strong>
              <div className="space-x-1.5 text-[11px] font-semibold mt-0.5">
                <span className="text-macro-protein">{Number((selectedFood.proteinPer100g * (grams / 100)).toFixed(1))}g P</span>
                <span>·</span>
                <span className="text-macro-carbs">{Number((selectedFood.carbsPer100g * (grams / 100)).toFixed(1))}g C</span>
                <span>·</span>
                <span className="text-macro-fat">{Number((selectedFood.fatPer100g * (grams / 100)).toFixed(1))}g G</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleAddFood(selectedFood)}
            className="w-full py-2.5 bg-solar hover:bg-solar-600 active:scale-[0.99] rounded-xl font-display font-bold text-bark-900 text-xs shadow-sm flex items-center justify-center space-x-1.5 transition-transform"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Añadir {grams}g a {mealType}</span>
          </button>
        </div>
      )}

      {/* Loading state */}
      {isSearching && (
        <div className="py-6 text-center text-bark-500 flex items-center justify-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin text-solar-700" />
          <span className="text-xs font-semibold">Buscando en catálogo, bases oficiales y fuentes externas...</span>
        </div>
      )}

      {/* Empty State / Not Found Card */}
      {!isSearching && hasSearched && query && results.length === 0 && (
        <div className="py-6 text-center space-y-3 bg-white dark:bg-dark-surface p-6 rounded-2xl border border-cream-200 dark:border-dark-border">
          <p className="text-sm font-bold text-bark-800 dark:text-dark-text">
            No encontramos resultados exactos para &quot;{query}&quot;
          </p>
          <p className="text-xs text-bark-500 max-w-sm mx-auto">
            Puedes pedirle a la Inteligencia Artificial que estime este plato de inmediato o crearlo manualmente.
          </p>
          <div className="pt-2 flex justify-center space-x-2">
            <button
              type="button"
              onClick={handleRequestAIEstimate}
              disabled={isEstimatingAI}
              className="py-2 px-3.5 bg-solar hover:bg-solar-600 text-bark-900 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-xs"
            >
              {isEstimatingAI ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Pedir a la IA que estime &quot;{query}&quot;</span>
            </button>
          </div>
        </div>
      )}

      {/* Results or Favorites List */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {(activeListTab === 'favorites' ? favorites : results)
          .filter((item) => {
            if (activeListTab === 'favorites') return true;
            if (brandFilter === 'generic') {
              return (
                item.isStandard ||
                !item.brand ||
                item.brand === 'Estándar / Común' ||
                item.brand === 'Tradicional' ||
                item.brand === 'Genérico' ||
                item.brand === 'Genérico (USDA)'
              );
            }
            if (brandFilter === 'branded') {
              return (
                item.brand &&
                item.brand !== 'Estándar / Común' &&
                item.brand !== 'Tradicional' &&
                item.brand !== 'Genérico' &&
                item.brand !== 'Genérico (USDA)'
              );
            }
            return true;
          })
          .map((item, idx) => (
          <div
            key={idx}
            onClick={() => handleSelectFood(item)}
            className="p-3 bg-white dark:bg-dark-surface border border-cream-200 dark:border-dark-border hover:border-solar rounded-2xl cursor-pointer flex items-center justify-between transition-all group hover:shadow-xs"
          >
            <div className="flex-1 pr-3 min-w-0">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h5 className="font-semibold text-sm text-bark-900 dark:text-dark-text truncate group-hover:text-bark-950">
                  {item.name}
                </h5>

                {/* Badge: Verificado vs Estimado por IA */}
                {item.source === 'Estimado por IA' ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center space-x-0.5 shrink-0">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>IA</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center space-x-0.5 shrink-0">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>Verificado</span>
                  </span>
                )}

                {item.isStandard && (
                  <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 shrink-0">
                    ⭐ Estándar
                  </span>
                )}

                {item.brand && item.brand !== 'Estándar / Común' && item.brand !== 'Tradicional' && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-solar/25 text-bark-900 dark:text-solar shrink-0">
                    {item.brand}
                  </span>
                )}
              </div>

              {/* Portion natural hint */}
              {item.portionName && item.portionGrams && (
                <div className="text-[11px] text-bark-500 dark:text-dark-muted font-medium mt-0.5">
                  Ración típica: <strong>{item.portionName}</strong> ({item.portionGrams}g)
                </div>
              )}

              {/* Macro info */}
              <div className="flex items-center space-x-2 text-xs text-bark-500 dark:text-dark-muted mt-1">
                <span>Por 100g:</span>
                <span className="font-bold text-bark-800 dark:text-dark-text font-display">
                  {item.caloriesPer100g} kcal
                </span>
                <span>·</span>
                <span className="text-macro-protein font-semibold">{item.proteinPer100g}g P</span>
                <span className="text-macro-carbs font-semibold">{item.carbsPer100g}g C</span>
                <span className="text-macro-fat font-semibold">{item.fatPer100g}g G</span>
              </div>
            </div>

            <div className="flex items-center space-x-1 shrink-0">
              <button
                type="button"
                onClick={(e) => toggleFavorite(item, e)}
                className="p-2 text-bark-400 hover:text-amber-500 rounded-xl"
                title="Favorito"
              >
                <Star
                  className={`w-4 h-4 ${
                    isFavorite(item) ? 'fill-amber-400 text-amber-500' : ''
                  }`}
                />
              </button>
              <button
                type="button"
                className="p-2 rounded-xl bg-cream-100 group-hover:bg-solar text-bark-800 transition-colors shadow-2xs"
                aria-label={`Seleccionar ${item.name}`}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: "No encuentro mi alimento" */}
      {isNotFoundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bark-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-dark-card border border-cream-300 dark:border-dark-border rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-cream-200 dark:border-dark-border pb-3">
              <div className="flex items-center space-x-2">
                <FileQuestion className="w-5 h-5 text-solar-700 dark:text-solar" />
                <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text">
                  ¿No encuentras tu alimento?
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsNotFoundModalOpen(false);
                  setShowManualForm(false);
                }}
                className="p-1 text-bark-400 hover:text-bark-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!showManualForm ? (
              <div className="space-y-4">
                <p className="text-xs text-bark-600 dark:text-dark-muted">
                  Puedes pedir a la Inteligencia Artificial que estime los valores nutricionales automáticamente o crear un alimento personalizado con tus propios macros.
                </p>

                {/* Option 1: AI Estimation */}
                <div className="p-3.5 bg-solar-50 dark:bg-solar/10 border border-solar/40 rounded-2xl space-y-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-solar-700" />
                    <span className="text-xs font-bold text-bark-900 dark:text-dark-text">
                      Opción 1: Estimar con IA de NutriFit
                    </span>
                  </div>
                  <input
                    type="text"
                    value={notFoundQuery}
                    onChange={(e) => setNotFoundQuery(e.target.value)}
                    placeholder="Ej: Torrija casera con miel, Arroz con conejo..."
                    className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-cream-300 rounded-xl text-xs font-medium text-bark-900"
                  />
                  <button
                    type="button"
                    onClick={handleRequestAIEstimate}
                    disabled={isEstimatingAI || !notFoundQuery.trim()}
                    className="w-full py-2 bg-solar hover:bg-solar-600 text-bark-900 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs disabled:opacity-50"
                  >
                    {isEstimatingAI ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>Estimar valores nutricionales con IA</span>
                  </button>
                </div>

                {/* Option 2: Manual creation */}
                <div className="p-3.5 bg-cream-50 dark:bg-dark-surface border border-cream-200 dark:border-dark-border rounded-2xl flex items-center justify-between">
                  <div>
                    <h6 className="text-xs font-bold text-bark-900 dark:text-dark-text">
                      Opción 2: Crear manualmente
                    </h6>
                    <p className="text-[11px] text-bark-500">
                      Introduce las calorías y macros por 100g de la etiqueta.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setManualName(notFoundQuery || query);
                      setShowManualForm(true);
                    }}
                    className="py-1.5 px-3 bg-bark-900 dark:bg-dark-elevated text-white rounded-xl text-xs font-bold shrink-0"
                  >
                    Crear a mano
                  </button>
                </div>
              </div>
            ) : (
              /* Manual creation form */
              <form onSubmit={handleSaveManualFood} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-bark-700 dark:text-dark-muted block mb-1">
                    Nombre del alimento
                  </label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-cream-300 rounded-xl text-xs font-medium"
                    placeholder="Ej: Galletas de avena caseras"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-bark-700 block mb-1">
                      Kcal / 100g *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={manualCalories}
                      onChange={(e) => setManualCalories(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-cream-300 rounded-xl text-xs font-bold"
                      placeholder="250"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-bark-700 block mb-1">
                      Proteínas (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={manualProtein}
                      onChange={(e) => setManualProtein(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-cream-300 rounded-xl text-xs"
                      placeholder="8"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-bark-700 block mb-1">
                      Carbohidratos (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={manualCarbs}
                      onChange={(e) => setManualCarbs(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-cream-300 rounded-xl text-xs"
                      placeholder="35"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-bark-700 block mb-1">
                      Grasas (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={manualFat}
                      onChange={(e) => setManualFat(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-cream-300 rounded-xl text-xs"
                      placeholder="6"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-bark-700 block mb-1">
                      Ración típica (nombre)
                    </label>
                    <input
                      type="text"
                      value={manualPortionName}
                      onChange={(e) => setManualPortionName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-cream-300 rounded-xl text-xs"
                      placeholder="1 galleta"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-bark-700 block mb-1">
                      Peso ración (g)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={manualPortionGrams}
                      onChange={(e) => setManualPortionGrams(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-cream-300 rounded-xl text-xs"
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowManualForm(false)}
                    className="flex-1 py-2 bg-cream-200 text-bark-800 rounded-xl text-xs font-bold"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-solar text-bark-900 rounded-xl text-xs font-bold"
                  >
                    Guardar alimento
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
