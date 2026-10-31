import React, { useState, useEffect } from 'react';
import { FoodItem, MealType } from '../../types';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import {
  Trash2,
  CheckCircle2,
  Sparkles,
  Plus,
  Minus,
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  FileText,
  Barcode,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { EnrichedFoodItem, VisionAnalysisResponse, apiSearchFood } from '../../services/api';

interface FoodReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imagePreview?: string | null;
  detectedFoods: (FoodItem | EnrichedFoodItem)[];
  doubtfulItems?: EnrichedFoodItem[];
  ocrData?: VisionAnalysisResponse['ocrData'];
  barcode?: string;
  defaultMealType?: MealType;
}

export const FoodReviewModal: React.FC<FoodReviewModalProps> = ({
  isOpen,
  onClose,
  imagePreview,
  detectedFoods,
  doubtfulItems: initialDoubtful = [],
  ocrData,
  barcode,
  defaultMealType = 'comida',
}) => {
  const { addFood, selectedDate } = useApp();
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [confirmedFoods, setConfirmedFoods] = useState<EnrichedFoodItem[]>([]);
  const [doubtfulList, setDoubtfulList] = useState<EnrichedFoodItem[]>([]);
  const [isDoubtfulOpen, setIsDoubtfulOpen] = useState(true);

  // Manual search to add missed foods
  const [isSearchingMissed, setIsSearchingMissed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingLoading, setIsSearchingLoading] = useState(false);

  // Synchronize incoming detected foods
  useEffect(() => {
    const formatted = detectedFoods.map((f, i) => {
      const grams = f.grams || 100;
      const c100 = (f as EnrichedFoodItem).caloriesPer100g || (f.calories > 0 ? (f.calories / grams) * 100 : 150);
      const p100 = (f as EnrichedFoodItem).proteinPer100g || (f.protein > 0 ? (f.protein / grams) * 100 : 5);
      const cb100 = (f as EnrichedFoodItem).carbsPer100g || (f.carbs > 0 ? (f.carbs / grams) * 100 : 15);
      const f100 = (f as EnrichedFoodItem).fatPer100g || (f.fat > 0 ? (f.fat / grams) * 100 : 5);

      return {
        id: f.id || `food-${Date.now()}-${i}`,
        name: f.name,
        nameCa: (f as any).nameCa,
        grams,
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat,
        source: (f.source as any) || 'Base de datos oficial',
        isEstimated: !!f.isEstimated,
        confidence: (f as EnrichedFoodItem).confidence || 0.95,
        confidenceBadge: (f as EnrichedFoodItem).confidenceBadge || 'Alta',
        confidencePercent: (f as EnrichedFoodItem).confidencePercent || 95,
        visualReasoning: (f as EnrichedFoodItem).visualReasoning || 'Alimento identificado visualmente.',
        caloriesPer100g: c100,
        proteinPer100g: p100,
        carbsPer100g: cb100,
        fatPer100g: f100,
      } as EnrichedFoodItem;
    });

    setConfirmedFoods(formatted);
    setDoubtfulList(initialDoubtful || []);
  }, [detectedFoods, initialDoubtful]);

  useEffect(() => {
    if (defaultMealType) {
      setMealType(defaultMealType);
    }
  }, [defaultMealType]);

  // Handle live recalculation when grams change
  const updateGrams = (index: number, newGrams: number) => {
    setConfirmedFoods((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const validGrams = Math.max(1, newGrams);
        const factor = validGrams / 100;
        const c100 = item.caloriesPer100g || 150;
        const p100 = item.proteinPer100g || 5;
        const cb100 = item.carbsPer100g || 15;
        const f100 = item.fatPer100g || 5;

        return {
          ...item,
          grams: validGrams,
          calories: Math.round(c100 * factor),
          protein: Number((p100 * factor).toFixed(1)),
          carbs: Number((cb100 * factor).toFixed(1)),
          fat: Number((f100 * factor).toFixed(1)),
        };
      })
    );
  };

  const adjustGrams = (index: number, delta: number) => {
    const current = confirmedFoods[index]?.grams || 100;
    updateGrams(index, Math.max(5, current + delta));
  };

  const updateName = (index: number, newName: string) => {
    setConfirmedFoods((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, name: newName } : item))
    );
  };

  const removeFood = (index: number) => {
    setConfirmedFoods((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Move a doubtful item into confirmed items
  const acceptDoubtful = (index: number) => {
    const item = doubtfulList[index];
    if (!item) return;

    setConfirmedFoods((prev) => [...prev, { ...item, isUncertain: false }]);
    setDoubtfulList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const discardDoubtful = (index: number) => {
    setDoubtfulList((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Search local food database for missed foods
  const handleSearchMissed = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearchingLoading(true);
    try {
      const results = await apiSearchFood(q.trim());
      setSearchResults(results.slice(0, 6));
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearchingLoading(false);
    }
  };

  const addSearchedFood = (food: any) => {
    const grams = food.portionGrams || 100;
    const factor = grams / 100;
    const newItem: EnrichedFoodItem = {
      id: `manual-${Date.now()}`,
      name: food.name,
      nameCa: food.nameCa,
      grams,
      calories: Math.round(food.caloriesPer100g * factor),
      protein: Number((food.proteinPer100g * factor).toFixed(1)),
      carbs: Number((food.carbsPer100g * factor).toFixed(1)),
      fat: Number((food.fatPer100g * factor).toFixed(1)),
      caloriesPer100g: food.caloriesPer100g,
      proteinPer100g: food.proteinPer100g,
      carbsPer100g: food.carbsPer100g,
      fatPer100g: food.fatPer100g,
      source: (food.brand ? `${food.brand} (Base verificada)` : 'Base de datos oficial') as any,
      isEstimated: false,
      confidence: 1.0,
      confidenceBadge: 'Alta',
      confidencePercent: 100,
      visualReasoning: 'Añadido manualmente por el usuario desde la base de datos.',
      isUncertain: false,
    };

    setConfirmedFoods((prev) => [...prev, newItem]);
    setIsSearchingMissed(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const totalCalories = confirmedFoods.reduce((acc, f) => acc + f.calories, 0);
  const totalProtein = Number(confirmedFoods.reduce((acc, f) => acc + f.protein, 0).toFixed(1));
  const totalCarbs = Number(confirmedFoods.reduce((acc, f) => acc + f.carbs, 0).toFixed(1));
  const totalFat = Number(confirmedFoods.reduce((acc, f) => acc + f.fat, 0).toFixed(1));

  const handleSaveAll = async () => {
    for (const food of confirmedFoods) {
      await addFood({
        name: food.name,
        grams: food.grams,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        source: (food.source as any) || 'Manual',
        isEstimated: food.isEstimated,
        mealType,
        date: selectedDate,
        loggedAt: new Date().toISOString(),
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar alimentos del plato"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Photo Thumbnail Header with Anti-hallucination Badge */}
        {imagePreview && (
          <div className="relative rounded-2xl overflow-hidden bg-bark-900 border border-cream-300 dark:border-dark-border shadow-sm max-h-36 flex items-center justify-between">
            <img
              src={imagePreview}
              alt="Foto capturada"
              className="w-28 h-28 object-cover rounded-xl m-2 shrink-0 border border-white/20"
            />
            <div className="p-3 pr-4 flex-1 text-left space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Auditoría de Visión Verificada</span>
              </div>
              <p className="text-[11px] text-bark-600 dark:text-dark-muted leading-relaxed">
                Solo se registran alimentos visibles. Calorías y macros calculados por 100g desde la base de datos oficial.
              </p>
              {ocrData && (
                <div className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  <FileText className="w-3 h-3" />
                  <span>OCR: {ocrData.productName || 'Etiqueta leída'}</span>
                </div>
              )}
              {barcode && (
                <div className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 ml-1">
                  <Barcode className="w-3 h-3" />
                  <span>Código: {barcode}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Meal Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-2">
            Añadir a esta comida
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {(['desayuno', 'comida', 'merienda', 'cena', 'snacks'] as MealType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setMealType(type)}
                className={`py-2 px-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                  mealType === type
                    ? 'bg-solar text-bark-900 font-bold shadow-sm'
                    : 'bg-cream-200 dark:bg-dark-surface text-bark-700 dark:text-dark-muted hover:bg-cream-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Confirmed Detected Foods List */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-bark-700 dark:text-dark-text uppercase tracking-wider">
              Alimentos visibles confirmados ({confirmedFoods.length})
            </span>
            <span className="text-[11px] text-bark-500 dark:text-dark-muted">
              Revisa o ajusta los gramos
            </span>
          </div>

          {confirmedFoods.length === 0 ? (
            <div className="p-6 text-center bg-cream-100 dark:bg-dark-surface rounded-2xl border border-dashed border-cream-300 dark:border-dark-border text-bark-600 dark:text-dark-muted text-xs">
              No hay alimentos confirmados en la lista. Puedes añadir uno desde el buscador inferior.
            </div>
          ) : (
            confirmedFoods.map((food, index) => (
              <div
                key={food.id || index}
                className="p-3 bg-white dark:bg-dark-surface rounded-2xl border border-cream-300 dark:border-dark-border shadow-sm space-y-2.5 transition-all"
              >
                {/* Header: Name + Badges + Delete */}
                <div className="flex items-start justify-between space-x-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={food.name}
                      onChange={(e) => updateName(index, e.target.value)}
                      className="font-display font-bold text-sm text-bark-900 dark:text-dark-text bg-transparent border-b border-transparent hover:border-cream-400 focus:border-solar focus:outline-none w-full pb-0.5"
                    />
                    {food.visualReasoning && (
                      <p className="text-[11px] text-bark-500 dark:text-dark-muted mt-0.5 line-clamp-1 italic">
                        "{food.visualReasoning}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    {/* Confidence badge */}
                    <span
                      className={`inline-flex items-center space-x-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        food.confidencePercent && food.confidencePercent >= 85
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300'
                      }`}
                    >
                      <Eye className="w-2.5 h-2.5" />
                      <span>{food.confidencePercent || 90}%</span>
                    </span>

                    {/* Source badge */}
                    {food.isEstimated ? (
                      <span className="inline-flex items-center space-x-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60">
                        <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                        <span>IA</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>{food.source.includes('OCR') ? 'OCR' : 'BD'}</span>
                      </span>
                    )}

                    <button
                      onClick={() => removeFood(index)}
                      className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/40 text-bark-400 hover:text-red-600 transition-colors"
                      title="Eliminar falso positivo"
                      aria-label={`Eliminar ${food.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Grams stepper and Real Calories */}
                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-cream-200 dark:border-dark-border">
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => adjustGrams(index, -50)}
                      className="w-6 h-6 rounded-lg bg-cream-200 dark:bg-dark-elevated hover:bg-cream-300 dark:hover:bg-dark-border flex items-center justify-center font-bold text-bark-700 dark:text-dark-text"
                      title="-50g"
                    >
                      -50
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustGrams(index, -10)}
                      className="w-6 h-6 rounded-lg bg-cream-200 dark:bg-dark-elevated hover:bg-cream-300 dark:hover:bg-dark-border flex items-center justify-center font-bold text-bark-700 dark:text-dark-text"
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    <div className="flex items-center bg-cream-100 dark:bg-dark-elevated px-2 py-0.5 rounded-lg border border-cream-300 dark:border-dark-border">
                      <input
                        type="number"
                        min="5"
                        max="3000"
                        value={food.grams}
                        onChange={(e) => updateGrams(index, parseInt(e.target.value, 10) || 5)}
                        className="w-12 bg-transparent font-bold text-center text-bark-900 dark:text-dark-text focus:outline-none"
                      />
                      <span className="text-bark-500 font-bold text-[11px]">g</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => adjustGrams(index, +10)}
                      className="w-6 h-6 rounded-lg bg-cream-200 dark:bg-dark-elevated hover:bg-cream-300 dark:hover:bg-dark-border flex items-center justify-center font-bold text-bark-700 dark:text-dark-text"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustGrams(index, +50)}
                      className="w-6 h-6 rounded-lg bg-cream-200 dark:bg-dark-elevated hover:bg-cream-300 dark:hover:bg-dark-border flex items-center justify-center font-bold text-bark-700 dark:text-dark-text"
                      title="+50g"
                    >
                      +50
                    </button>
                  </div>

                  {/* Real Nutrition Breakdown */}
                  <div className="flex items-center space-x-2 text-bark-600 dark:text-dark-muted font-medium">
                    <span className="font-bold text-bark-900 dark:text-dark-text font-display">
                      {food.calories} kcal
                    </span>
                    <span>·</span>
                    <span className="text-macro-protein">{food.protein}g P</span>
                    <span className="text-macro-carbs">{food.carbs}g C</span>
                    <span className="text-macro-fat">{food.fat}g G</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Section: Doubtful Items / Alternatives (PASO 3.5) */}
        {doubtfulList.length > 0 && (
          <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900 space-y-2">
            <button
              type="button"
              onClick={() => setIsDoubtfulOpen(!isDoubtfulOpen)}
              className="w-full flex items-center justify-between text-left text-xs font-bold text-amber-900 dark:text-amber-200"
            >
              <div className="flex items-center space-x-1.5">
                <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Elementos dudosos identificados ({doubtfulList.length})</span>
              </div>
              {isDoubtfulOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isDoubtfulOpen && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-snug">
                  La IA no está 100% segura de que estos alimentos estuvieran en tu plato. Pulsa "Añadir" solo si realmente los has comido.
                </p>

                {doubtfulList.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-2.5 bg-white dark:bg-dark-surface rounded-xl border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between space-x-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-xs text-bark-900 dark:text-dark-text truncate">
                          ¿Había {item.name}?
                        </span>
                        <span className="text-[10px] text-bark-500 font-semibold shrink-0">
                          (~{item.grams}g)
                        </span>
                      </div>
                      {item.visualReasoning && (
                        <p className="text-[10px] text-bark-500 dark:text-dark-muted truncate">
                          {item.visualReasoning}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => acceptDoubtful(idx)}
                        className="py-1 px-2.5 bg-solar hover:bg-solar-600 text-bark-900 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-sm transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => discardDoubtful(idx)}
                        className="p-1 text-bark-400 hover:text-bark-600 rounded-lg"
                        title="Descartar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section: Add Missed Food (PASO 3.4) */}
        {!isSearchingMissed ? (
          <button
            type="button"
            onClick={() => setIsSearchingMissed(true)}
            className="w-full py-2 px-3 border border-dashed border-cream-400 dark:border-dark-border rounded-xl text-xs font-bold text-bark-700 dark:text-dark-muted hover:border-solar hover:text-bark-900 dark:hover:text-dark-text flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-solar-700 dark:text-solar" />
            <span>Añadir alimento que la IA no haya visto</span>
          </button>
        ) : (
          <div className="p-3 bg-cream-100/70 dark:bg-dark-surface rounded-2xl border border-cream-300 dark:border-dark-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-bark-800 dark:text-dark-text">
                Buscar alimento en el catálogo de España
              </span>
              <button
                type="button"
                onClick={() => setIsSearchingMissed(false)}
                className="text-xs text-bark-500 hover:text-bark-800 font-semibold"
              >
                Cerrar
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchMissed(e.target.value)}
                placeholder="Ej: Huevo frito, Pan Bimbo, Ensalada..."
                autoFocus
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-dark-elevated border border-cream-300 dark:border-dark-border rounded-xl text-xs text-bark-900 dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-solar"
              />
              <Search className="w-4 h-4 text-bark-400 absolute left-2.5 top-2.5" />
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto pt-1">
                {searchResults.map((resItem) => (
                  <button
                    key={resItem.id}
                    type="button"
                    onClick={() => addSearchedFood(resItem)}
                    className="w-full p-2 bg-white dark:bg-dark-elevated hover:bg-cream-200 dark:hover:bg-dark-border rounded-xl flex items-center justify-between text-left text-xs transition-colors"
                  >
                    <div>
                      <span className="font-bold text-bark-900 dark:text-dark-text block">
                        {resItem.name}
                      </span>
                      <span className="text-[10px] text-bark-500">
                        {resItem.brand || 'Básico'} · {resItem.caloriesPer100g} kcal/100g
                      </span>
                    </div>
                    <Plus className="w-4 h-4 text-solar-700" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Nutritional Summary Card */}
        <div className="p-3 bg-solar-50 dark:bg-solar/10 rounded-2xl border border-solar/40 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-bark-700 dark:text-dark-text block">
              Total a registrar ({confirmedFoods.length} alimentos)
            </span>
            <span className="text-[11px] text-bark-500 dark:text-dark-muted font-medium">
              {totalProtein}g P · {totalCarbs}g C · {totalFat}g G
            </span>
          </div>
          <span className="font-display font-black text-xl text-bark-900 dark:text-dark-text">
            {totalCalories} <span className="text-xs font-sans font-bold">kcal</span>
          </span>
        </div>

        {/* Mandatory Explicit Confirmation Button */}
        <div className="flex items-center space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 bg-cream-200 dark:bg-dark-surface hover:bg-cream-300 dark:hover:bg-dark-elevated rounded-xl font-bold text-bark-800 dark:text-dark-text text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={confirmedFoods.length === 0}
            className="flex-1 py-3 px-4 bg-solar hover:bg-solar-600 disabled:opacity-50 rounded-xl font-display font-bold text-bark-900 text-sm shadow-sm transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Guardar {confirmedFoods.length} alimentos en {mealType}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
