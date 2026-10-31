import React, { useState, useEffect, useRef } from 'react';
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
  RefreshCw,
  Flame,
  Layers,
  Check,
} from 'lucide-react';
import { EnrichedFoodItem, VisionAnalysisResponse, apiSearchFood, IngredientItem } from '../../services/api';

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

  // Active pin / card highlight
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Open "Cambiar" dropdown per item
  const [openAlternativeIndex, setOpenAlternativeIndex] = useState<number | null>(null);

  // Expanded composite dishes
  const [expandedComposite, setExpandedComposite] = useState<Record<number, boolean>>({});

  // Manual search to add missed foods
  const [isSearchingMissed, setIsSearchingMissed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingLoading, setIsSearchingLoading] = useState(false);

  // Synchronize incoming detected foods with coordinates and metadata
  useEffect(() => {
    const defaultCoords = [
      { x: 30, y: 35 },
      { x: 70, y: 35 },
      { x: 35, y: 65 },
      { x: 68, y: 68 },
      { x: 50, y: 50 },
      { x: 50, y: 25 },
      { x: 25, y: 50 },
    ];

    const formatted = detectedFoods.map((f, i) => {
      const grams = f.grams || 100;
      const enriched = f as EnrichedFoodItem;
      const c100 = enriched.caloriesPer100g || (f.calories > 0 ? (f.calories / grams) * 100 : 150);
      const p100 = enriched.proteinPer100g || (f.protein > 0 ? (f.protein / grams) * 100 : 5);
      const cb100 = enriched.carbsPer100g || (f.carbs > 0 ? (f.carbs / grams) * 100 : 15);
      const f100 = enriched.fatPer100g || (f.fat > 0 ? (f.fat / grams) * 100 : 5);

      const markerPos = enriched.markerPosition || {
        xPercent: defaultCoords[i % defaultCoords.length].x,
        yPercent: defaultCoords[i % defaultCoords.length].y,
        index: i + 1,
      };

      return {
        id: f.id || `food-${Date.now()}-${i}`,
        name: f.name,
        nameCa: (f as any).nameCa,
        grams,
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat,
        cookingMethod: enriched.cookingMethod || 'Cocinado tradicional',
        markerPosition: markerPos,
        box2d: enriched.box2d,
        isComposite: enriched.isComposite || false,
        ingredientsBreakdown: enriched.ingredientsBreakdown || [],
        gramsRange: enriched.gramsRange || [Math.round(grams * 0.85), Math.round(grams * 1.15)],
        source: (f.source as any) || 'Base de datos oficial',
        isEstimated: !!f.isEstimated,
        confidence: enriched.confidence || 0.95,
        confidenceBadge: enriched.confidenceBadge || 'Alta',
        confidencePercent: enriched.confidencePercent || 95,
        visualReasoning: enriched.visualReasoning || 'Alimento identificado visualmente.',
        alternatives: enriched.alternatives || [
          `${f.name} a la plancha`,
          `${f.name} cocido`,
          `${f.name} casero`,
        ],
        caloriesPer100g: Math.round(c100),
        proteinPer100g: Number(p100.toFixed(1)),
        carbsPer100g: Number(cb100.toFixed(1)),
        fatPer100g: Number(f100.toFixed(1)),
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

  const scrollToItem = (idx: number) => {
    setActiveIndex(idx);
    const target = itemRefs.current[idx];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

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

  // Switch an item to an alternative from the database
  const selectAlternative = async (index: number, altName: string) => {
    setOpenAlternativeIndex(null);
    try {
      const results = await apiSearchFood(altName);
      if (results && results.length > 0) {
        const top = results[0];
        const currentItem = confirmedFoods[index];
        const factor = (currentItem?.grams || 100) / 100;
        setConfirmedFoods((prev) =>
          prev.map((item, idx) => {
            if (idx !== index) return item;
            return {
              ...item,
              name: top.name,
              nameCa: top.nameCa,
              caloriesPer100g: top.caloriesPer100g,
              proteinPer100g: top.proteinPer100g,
              carbsPer100g: top.carbsPer100g,
              fatPer100g: top.fatPer100g,
              calories: Math.round(top.caloriesPer100g * factor),
              protein: Number((top.proteinPer100g * factor).toFixed(1)),
              carbs: Number((top.carbsPer100g * factor).toFixed(1)),
              fat: Number((top.fatPer100g * factor).toFixed(1)),
              cookingMethod: altName.toLowerCase().includes('plancha')
                ? 'A la plancha'
                : altName.toLowerCase().includes('cocid') || altName.toLowerCase().includes('hervid')
                ? 'Cocido'
                : altName.toLowerCase().includes('horno') || altName.toLowerCase().includes('asado')
                ? 'Al horno'
                : 'Modificado por usuario',
              source: 'Base de datos oficial',
              isEstimated: false,
            };
          })
        );
      } else {
        updateName(index, altName);
      }
    } catch {
      updateName(index, altName);
    }
  };

  // Break down a composite dish into its individual ingredients
  const breakdownCompositeDish = (index: number) => {
    const dish = confirmedFoods[index];
    if (!dish || !dish.ingredientsBreakdown || dish.ingredientsBreakdown.length === 0) return;

    const baseCoords = dish.markerPosition || { xPercent: 50, yPercent: 50, index: 1 };
    const newItems: EnrichedFoodItem[] = dish.ingredientsBreakdown.map((ing, i) => {
      const c100 = ing.grams > 0 ? (ing.calories / ing.grams) * 100 : 150;
      const p100 = ing.grams > 0 ? (ing.protein / ing.grams) * 100 : 5;
      const cb100 = ing.grams > 0 ? (ing.carbs / ing.grams) * 100 : 15;
      const f100 = ing.grams > 0 ? (ing.fat / ing.grams) * 100 : 5;

      return {
        id: `breakdown-${Date.now()}-${i}`,
        name: ing.name,
        grams: ing.grams,
        calories: ing.calories,
        protein: ing.protein,
        carbs: ing.carbs,
        fat: ing.fat,
        cookingMethod: `Ingrediente de ${dish.name}`,
        markerPosition: {
          xPercent: Math.min(85, Math.max(15, baseCoords.xPercent + (i % 2 === 0 ? -12 : 12))),
          yPercent: Math.min(85, Math.max(15, baseCoords.yPercent + Math.floor(i / 2) * 10)),
          index: index + 1 + i,
        },
        isComposite: false,
        source: 'Base de datos oficial',
        isEstimated: false,
        confidence: 0.92,
        confidenceBadge: 'Alta',
        confidencePercent: 92,
        visualReasoning: `Desglosado de ${dish.name}`,
        caloriesPer100g: Math.round(c100),
        proteinPer100g: Number(p100.toFixed(1)),
        carbsPer100g: Number(cb100.toFixed(1)),
        fatPer100g: Number(f100.toFixed(1)),
      };
    });

    setConfirmedFoods((prev) => {
      const next = [...prev];
      // Replace the composite dish with its ingredients
      next.splice(index, 1, ...newItems);
      // Re-index marker numbers
      return next.map((item, idx) => ({
        ...item,
        markerPosition: {
          ...(item.markerPosition || { xPercent: 50, yPercent: 50 }),
          index: idx + 1,
        },
      }));
    });
  };

  const removeFood = (index: number) => {
    setConfirmedFoods((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      return next.map((item, idx) => ({
        ...item,
        markerPosition: {
          ...(item.markerPosition || { xPercent: 50, yPercent: 50 }),
          index: idx + 1,
        },
      }));
    });
  };

  // Move a doubtful item into confirmed items
  const acceptDoubtful = (index: number) => {
    const item = doubtfulList[index];
    if (!item) return;

    setConfirmedFoods((prev) => [
      ...prev,
      {
        ...item,
        isUncertain: false,
        markerPosition: {
          xPercent: 50,
          yPercent: 50,
          index: prev.length + 1,
        },
      },
    ]);
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
      cookingMethod: 'Añadido manualmente',
      markerPosition: {
        xPercent: 50,
        yPercent: 50,
        index: confirmedFoods.length + 1,
      },
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
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Interactive Photo with Numbered Pins */}
        {imagePreview && (
          <div className="space-y-2">
            <div className="relative rounded-2xl overflow-hidden bg-bark-900 border border-cream-300 dark:border-dark-border shadow-md max-h-64 sm:max-h-72 flex items-center justify-center select-none">
              <img
                src={imagePreview}
                alt="Foto analizada"
                className="w-full h-56 sm:h-64 object-contain rounded-2xl"
              />

              {/* Numbered Pins matching confirmed foods */}
              {confirmedFoods.map((food, idx) => {
                const pos = food.markerPosition || { xPercent: 50, yPercent: 50, index: idx + 1 };
                const isSelected = activeIndex === idx;

                return (
                  <button
                    key={food.id || idx}
                    type="button"
                    onClick={() => scrollToItem(idx)}
                    style={{
                      left: `${pos.xPercent}%`,
                      top: `${pos.yPercent}%`,
                    }}
                    title={`Punto ${idx + 1}: ${food.name}`}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full font-black text-xs flex items-center justify-center transition-all duration-200 shadow-xl border-2 cursor-pointer z-10 ${
                      isSelected
                        ? 'bg-solar-500 text-bark-950 border-white ring-4 ring-solar/70 scale-125 z-20 shadow-solar/40'
                        : 'bg-solar text-bark-900 border-white ring-2 ring-black/30 hover:scale-115 hover:ring-solar'
                    }`}
                  >
                    <span>{idx + 1}</span>
                  </button>
                );
              })}

              {/* Status pill overlay */}
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md rounded-xl px-2.5 py-1 flex items-center space-x-1.5 text-white text-[11px] font-semibold border border-white/20">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                <span>Desglose verificado · Toca un punto para ver el alimento</span>
              </div>
            </div>

            {/* Micro badges for OCR and Barcode */}
            {(ocrData || barcode) && (
              <div className="flex flex-wrap gap-1.5 px-1">
                {ocrData && (
                  <div className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    <FileText className="w-3 h-3" />
                    <span>OCR: {ocrData.productName || 'Etiqueta nutricional leída'}</span>
                  </div>
                )}
                {barcode && (
                  <div className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    <Barcode className="w-3 h-3" />
                    <span>Código: {barcode}</span>
                  </div>
                )}
              </div>
            )}
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

        {/* Visual grouping header (Does NOT count as an item, only organizes visually) */}
        <div className="p-3 bg-cream-100 dark:bg-dark-elevated rounded-2xl border border-cream-300 dark:border-dark-border flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1.5">
              <span className="font-display font-extrabold text-sm text-bark-900 dark:text-dark-text">
                Comida detectada ({confirmedFoods.length} alimentos desglosados)
              </span>
            </div>
            <p className="text-[11px] text-bark-500 dark:text-dark-muted">
              Agrupación visual: cada alimento se registra por separado.
            </p>
          </div>
          <div className="text-right">
            <span className="font-display font-black text-base text-bark-900 dark:text-dark-text">
              {totalCalories} kcal
            </span>
            <p className="text-[10px] font-semibold text-bark-500 dark:text-dark-muted">
              {totalProtein}g P · {totalCarbs}g C · {totalFat}g G
            </p>
          </div>
        </div>

        {/* Confirmed Detected Foods List */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {confirmedFoods.length === 0 ? (
            <div className="p-6 text-center bg-cream-100 dark:bg-dark-surface rounded-2xl border border-dashed border-cream-300 dark:border-dark-border text-bark-600 dark:text-dark-muted text-xs">
              No hay alimentos en la lista. Puedes añadir uno desde el buscador inferior.
            </div>
          ) : (
            confirmedFoods.map((food, index) => {
              const isSelected = activeIndex === index;
              const isComp = food.isComposite && food.ingredientsBreakdown && food.ingredientsBreakdown.length > 0;
              const isExpanded = !!expandedComposite[index];

              return (
                <div
                  key={food.id || index}
                  ref={(el) => (itemRefs.current[index] = el)}
                  onClick={() => setActiveIndex(index)}
                  className={`p-3 bg-white dark:bg-dark-surface rounded-2xl border transition-all space-y-2.5 shadow-sm ${
                    isSelected
                      ? 'border-solar ring-2 ring-solar/40 bg-solar-50/20'
                      : 'border-cream-300 dark:border-dark-border hover:border-cream-400'
                  }`}
                >
                  {/* Top Bar: Number Pin Badge + Name + Cooking Method + Action buttons */}
                  <div className="flex items-start justify-between space-x-2">
                    <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                      {/* Numbered pin matching photo */}
                      <span
                        className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border ${
                          isSelected
                            ? 'bg-solar text-bark-900 border-white ring-2 ring-solar shadow'
                            : 'bg-cream-200 dark:bg-dark-elevated text-bark-800 dark:text-dark-text border-cream-300 dark:border-dark-border'
                        }`}
                      >
                        {index + 1}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <input
                            type="text"
                            value={food.name}
                            onChange={(e) => updateName(index, e.target.value)}
                            className="font-display font-bold text-sm text-bark-900 dark:text-dark-text bg-transparent border-b border-transparent hover:border-cream-400 focus:border-solar focus:outline-none flex-1 min-w-[140px] pb-0.5"
                          />

                          {/* Cooking method badge */}
                          {food.cookingMethod && (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300/60 shrink-0">
                              <Flame className="w-2.5 h-2.5 text-amber-600" />
                              <span>{food.cookingMethod}</span>
                            </span>
                          )}

                          {/* Confidence badge */}
                          <span
                            className={`inline-flex items-center space-x-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${
                              food.confidencePercent && food.confidencePercent >= 85
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300'
                            }`}
                          >
                            <Eye className="w-2.5 h-2.5" />
                            <span>{food.confidencePercent || 90}%</span>
                          </span>
                        </div>

                        {/* Estimated Range and visual reasoning */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-bark-500 dark:text-dark-muted">
                          {food.gramsRange && (
                            <span className="font-medium text-bark-600 dark:text-dark-text">
                              Rango estimado: {food.gramsRange[0]}g – {food.gramsRange[1]}g
                            </span>
                          )}
                          {food.visualReasoning && (
                            <span className="italic line-clamp-1">"{food.visualReasoning}"</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right action buttons: Alternatives dropdown + Delete */}
                    <div className="flex items-center space-x-1.5 shrink-0 relative">
                      {/* «Cambiar» Button */}
                      {food.alternatives && food.alternatives.length > 0 && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenAlternativeIndex(
                                openAlternativeIndex === index ? null : index
                              );
                            }}
                            className="py-1 px-2 rounded-lg bg-cream-100 dark:bg-dark-elevated hover:bg-cream-200 dark:hover:bg-dark-border text-bark-700 dark:text-dark-text text-[11px] font-bold flex items-center space-x-1 border border-cream-300 dark:border-dark-border transition-colors"
                            title="Cambiar por alternativa de la base de datos"
                          >
                            <RefreshCw className="w-3 h-3 text-solar-700 dark:text-solar" />
                            <span>Cambiar</span>
                          </button>

                          {/* Alternatives Dropdown Menu */}
                          {openAlternativeIndex === index && (
                            <div className="absolute right-0 top-8 z-30 w-52 bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-cream-300 dark:border-dark-border p-1.5 space-y-1">
                              <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-bark-400">
                                3 alternativas más probables:
                              </div>
                              {food.alternatives.slice(0, 3).map((alt, altIdx) => (
                                <button
                                  key={altIdx}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectAlternative(index, alt);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-bark-800 dark:text-dark-text hover:bg-cream-100 dark:hover:bg-dark-elevated flex items-center justify-between group transition-colors"
                                >
                                  <span className="truncate">{alt}</span>
                                  <Check className="w-3 h-3 text-emerald-600 opacity-0 group-hover:opacity-100 shrink-0 ml-1" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFood(index);
                        }}
                        className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/40 text-bark-400 hover:text-red-600 transition-colors"
                        title="Eliminar falso positivo"
                        aria-label={`Eliminar ${food.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Composite Dish Collapsible Breakdown («Ver ingredientes») */}
                  {isComp && (
                    <div className="p-2.5 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200/80 dark:border-amber-900/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedComposite((prev) => ({
                              ...prev,
                              [index]: !prev[index],
                            }));
                          }}
                          className="flex items-center space-x-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 hover:underline"
                        >
                          <Layers className="w-3.5 h-3.5 text-amber-600" />
                          <span>
                            Plato compuesto · Ver ingredientes ({food.ingredientsBreakdown?.length})
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            breakdownCompositeDish(index);
                          }}
                          className="py-1 px-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold shadow-sm transition-colors"
                          title="Registrar cada ingrediente por separado para ajustar cantidades individuales"
                        >
                          Desglosar en ingredientes
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="space-y-1.5 pt-1.5 border-t border-amber-200 dark:border-amber-900/60">
                          <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-snug">
                            Ingredientes estimados para este plato. Puedes mantener el plato único o pulsar "Desglosar" para editar cantidades de cada ingrediente.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                            {food.ingredientsBreakdown?.map((ing, ingIdx) => (
                              <div
                                key={ingIdx}
                                className="px-2 py-1 bg-white dark:bg-dark-surface rounded-lg border border-amber-100 dark:border-amber-900 text-[11px] flex items-center justify-between"
                              >
                                <span className="font-medium text-bark-800 dark:text-dark-text truncate">
                                  {ing.name}
                                </span>
                                <span className="text-bark-500 font-semibold shrink-0 ml-1">
                                  {ing.grams}g ({ing.calories} kcal)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

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
                        title="-10g"
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
                        title="+10g"
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
              );
            })
          )}
        </div>

        {/* Section: Doubtful Items / Alternatives */}
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

        {/* Section: Add Missed Food («Añadir alimento») */}
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
