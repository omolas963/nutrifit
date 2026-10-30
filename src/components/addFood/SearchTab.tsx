import React, { useState, useEffect } from 'react';
import { apiSearchFood } from '../../services/api';
import { MealType, FoodEntry } from '../../types';
import { useApp } from '../../context/AppContext';
import { BarcodeScanner } from './BarcodeScanner';
import { dataRepo } from '../../services/dal/indexedDBRepo';
import { Search, Barcode, Plus, Loader2, Clock, Check, Tag } from 'lucide-react';

interface SearchTabProps {
  initialMealType?: MealType;
}

export const SearchTab: React.FC<SearchTabProps> = ({ initialMealType = 'comida' }) => {
  const { addFood, selectedDate, recentSearches } = useApp();
  const [query, setQuery] = useState('');
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [grams, setGrams] = useState<number>(100);

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

  const handleAddFood = async (item: any) => {
    const factor = grams / 100;
    const entry: Omit<FoodEntry, 'id'> = {
      name: item.name,
      brand: item.brand,
      grams,
      calories: Math.round(item.caloriesPer100g * factor),
      protein: Number((item.proteinPer100g * factor).toFixed(1)),
      carbs: Number((item.carbsPer100g * factor).toFixed(1)),
      fat: Number((item.fatPer100g * factor).toFixed(1)),
      source: item.source || 'Base de datos oficial',
      isEstimated: false,
      mealType,
      date: selectedDate,
      loggedAt: new Date().toISOString(),
    };

    await addFood(entry);
    setSelectedFood(null);
    setGrams(100);
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

      {/* Search Input and Barcode Button */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar pan, leche, marcas (Bimbo, Hacendado...)"
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl text-bark-900 dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-solar shadow-sm"
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

      {/* Quick Suggestion Pills */}
      {!query && (
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
              <Tag className="w-3.5 h-3.5 text-solar-700" />
              <span>Alimentos frecuentes con marcas</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Pan de molde',
                'Pan Bimbo',
                'Pan integral Hacendado',
                'Leche semidesnatada',
                'Pechuga de pollo',
                'Huevos',
                'Avena',
                'Atún al natural',
                'Plátano',
                'Arroz',
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

      {/* Selected Food Quantity & Portion Configurator */}
      {selectedFood && (
        <div className="p-4 bg-solar-50 dark:bg-solar/10 border-2 border-solar rounded-2xl space-y-3 animate-in zoom-in-95 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h5 className="font-display font-bold text-sm text-bark-900 dark:text-dark-text">
                  {selectedFood.name}
                </h5>
                {selectedFood.brand && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-solar text-bark-900 shadow-2xs">
                    {selectedFood.brand}
                  </span>
                )}
              </div>
              <p className="text-xs text-bark-500 dark:text-dark-muted mt-0.5">
                Valores por 100g: {selectedFood.caloriesPer100g} kcal · {selectedFood.proteinPer100g}g P · {selectedFood.carbsPer100g}g C · {selectedFood.fatPer100g}g G
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedFood(null)}
              className="text-xs font-semibold text-bark-500 hover:text-bark-900"
            >
              Cancelar
            </button>
          </div>

          {/* Quick Portion Selector */}
          <div className="flex items-center space-x-2 pt-1 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-bark-600 dark:text-dark-muted shrink-0">Porciones:</span>
            {selectedFood.portionName && selectedFood.portionGrams && (
              <button
                type="button"
                onClick={() => setGrams(selectedFood.portionGrams)}
                className={`py-1 px-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  grams === selectedFood.portionGrams
                    ? 'bg-solar text-bark-900 ring-2 ring-solar-600 shadow-sm'
                    : 'bg-white dark:bg-dark-surface border border-cream-300 text-bark-800 hover:bg-cream-100'
                }`}
              >
                {selectedFood.portionName} ({selectedFood.portionGrams}g)
              </button>
            )}
            {[50, 100, 150, 200].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGrams(g)}
                className={`py-1 px-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  grams === g
                    ? 'bg-solar text-bark-900 ring-2 ring-solar-600 shadow-sm'
                    : 'bg-white dark:bg-dark-surface border border-cream-300 text-bark-800 hover:bg-cream-100'
                }`}
              >
                {g}g
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 pt-1">
            <span className="text-xs font-bold text-bark-700 dark:text-dark-text">Cantidad personalizada (g):</span>
            <input
              type="number"
              min="1"
              max="3000"
              value={grams}
              onChange={(e) => setGrams(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-24 px-3 py-1.5 bg-white dark:bg-dark-surface border border-cream-300 rounded-xl font-bold text-center text-bark-900 dark:text-dark-text shadow-inner"
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
          <span className="text-xs font-semibold">Buscando marcas y alimentos...</span>
        </div>
      )}

      {/* No results message */}
      {!isSearching && hasSearched && query && results.length === 0 && (
        <div className="py-8 text-center space-y-2 bg-white dark:bg-dark-surface p-6 rounded-2xl border border-cream-200">
          <p className="text-sm font-bold text-bark-800 dark:text-dark-text">
            No se encontraron alimentos para &quot;{query}&quot;
          </p>
          <p className="text-xs text-bark-500 max-w-xs mx-auto">
            Prueba buscando por nombre genérico o marca: &quot;pan&quot;, &quot;bimbo&quot;, &quot;hacendado&quot;, &quot;leche&quot; o usa la pestaña &quot;Foto&quot; o &quot;Escribir&quot; para registrarlo libremente.
          </p>
        </div>
      )}

      {/* Search Results List with Prominent Brand Badges */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {results.map((item, idx) => (
          <div
            key={idx}
            onClick={() => {
              setSelectedFood(item);
              setGrams(item.portionGrams || 100);
            }}
            className="p-3 bg-white dark:bg-dark-surface border border-cream-200 dark:border-dark-border hover:border-solar rounded-2xl cursor-pointer flex items-center justify-between transition-all group hover:shadow-xs"
          >
            <div className="flex-1 pr-3 min-w-0">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h5 className="font-semibold text-sm text-bark-900 dark:text-dark-text truncate group-hover:text-bark-950">
                  {item.name}
                </h5>
                {/* PROMINENT BRAND BADGE */}
                {item.brand && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-solar/25 text-bark-900 dark:text-solar border border-solar/40 shrink-0">
                    {item.brand}
                  </span>
                )}
              </div>

              {/* Portion hint if present */}
              {item.portionName && (
                <div className="text-[11px] text-amber-700 dark:text-solar-400 font-medium mt-0.5">
                  Porción sugerida: {item.portionName} ({item.portionGrams}g)
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

            <button
              type="button"
              className="p-2 rounded-xl bg-cream-100 group-hover:bg-solar dark:bg-dark-elevated text-bark-800 transition-colors shrink-0 shadow-2xs"
              aria-label={`Seleccionar ${item.name}`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
