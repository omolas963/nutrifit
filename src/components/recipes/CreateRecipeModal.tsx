import React, { useState } from 'react';
import { Recipe, RecipeIngredient } from '../../types';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { apiSearchFood } from '../../services/api';
import { Plus, Trash2, Search, Loader2 } from 'lucide-react';

interface CreateRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRecipeModal: React.FC<CreateRecipeModalProps> = ({ isOpen, onClose }) => {
  const { saveRecipe } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(20);
  const [portions, setPortions] = useState(1);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [steps, setSteps] = useState<string[]>(['']);

  // Ingredient search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [ingGrams, setIngGrams] = useState(100);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await apiSearchFood(searchQuery.trim());
      setSearchResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddIngredient = (item: any) => {
    const factor = ingGrams / 100;
    const newIng: RecipeIngredient = {
      name: item.name,
      grams: ingGrams,
      calories: Math.round(item.caloriesPer100g * factor),
      protein: Number((item.proteinPer100g * factor).toFixed(1)),
      carbs: Number((item.carbsPer100g * factor).toFixed(1)),
      fat: Number((item.fatPer100g * factor).toFixed(1)),
    };

    setIngredients((prev) => [...prev, newIng]);
    setSearchQuery('');
    setSearchResults([]);
    setIngGrams(100);
  };

  const removeIngredient = (idx: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  };

  // Steps
  const handleStepChange = (index: number, val: string) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? val : s)));
  };

  const addStepField = () => {
    setSteps((prev) => [...prev, '']);
  };

  const removeStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  // Totals & Per-portion calculations
  const totalCalories = ingredients.reduce((acc, ing) => acc + ing.calories, 0);
  const totalProtein = ingredients.reduce((acc, ing) => acc + ing.protein, 0);
  const totalCarbs = ingredients.reduce((acc, ing) => acc + ing.carbs, 0);
  const totalFat = ingredients.reduce((acc, ing) => acc + ing.fat, 0);

  const safePortions = Math.max(1, portions);
  const caloriesPerPortion = Math.round(totalCalories / safePortions);
  const proteinPerPortion = Number((totalProtein / safePortions).toFixed(1));
  const carbsPerPortion = Number((totalCarbs / safePortions).toFixed(1));
  const fatPerPortion = Number((totalFat / safePortions).toFixed(1));

  const handleSave = async () => {
    if (!title.trim() || ingredients.length === 0) return;

    const newRecipe: Recipe = {
      id: `recipe-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Receta personalizada.',
      prepTimeMinutes,
      portions: safePortions,
      isFavorite: false,
      ingredients,
      steps: steps.filter((s) => s.trim().length > 0),
      caloriesPerPortion,
      proteinPerPortion,
      carbsPerPortion,
      fatPerPortion,
      createdAt: new Date().toISOString(),
    };

    await saveRecipe(newRecipe);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear nueva receta" maxWidth="max-w-xl">
      <div className="space-y-4">
        {/* Title & Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1">
            Nombre de la receta *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Salmón con quinoa y aguacate"
            className="w-full px-4 py-2.5 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-bark-900 dark:text-dark-text text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-solar"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1">
            Descripción corta
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve resumen de la receta..."
            className="w-full px-4 py-2 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-bark-900 dark:text-dark-text text-xs focus:outline-none focus:ring-2 focus:ring-solar"
          />
        </div>

        {/* Portions & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1">
              Raciones totales
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={portions}
              onChange={(e) => setPortions(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl font-bold text-sm text-bark-900 dark:text-dark-text"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1">
              Tiempo (minutos)
            </label>
            <input
              type="number"
              min="1"
              max="240"
              value={prepTimeMinutes}
              onChange={(e) => setPrepTimeMinutes(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl font-bold text-sm text-bark-900 dark:text-dark-text"
            />
          </div>
        </div>

        {/* Add Ingredients Section */}
        <div className="p-3 bg-cream-100 dark:bg-dark-surface rounded-2xl border border-cream-200 dark:border-dark-border space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text">
            Buscar y añadir ingredientes
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar ingrediente (ej: arroz, salmón...)"
              className="flex-1 px-3 py-2 bg-white dark:bg-dark-card border border-cream-300 dark:border-dark-border rounded-xl text-xs"
            />
            <input
              type="number"
              value={ingGrams}
              onChange={(e) => setIngGrams(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-16 px-2 py-2 bg-white dark:bg-dark-card border border-cream-300 dark:border-dark-border rounded-xl text-xs text-center font-bold"
              placeholder="g"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="py-2 px-3 bg-solar hover:bg-solar-600 rounded-xl text-xs font-bold text-bark-900 flex items-center space-x-1"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Buscar</span>
            </button>
          </div>

          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div className="space-y-1 max-h-40 overflow-y-auto bg-white dark:bg-dark-card p-2 rounded-xl border border-cream-300">
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleAddIngredient(item)}
                  className="p-1.5 hover:bg-cream-100 dark:hover:bg-dark-elevated rounded-lg cursor-pointer flex items-center justify-between text-xs"
                >
                  <span className="font-medium truncate">{item.name}</span>
                  <span className="text-[10px] text-bark-500 shrink-0">
                    {item.caloriesPer100g} kcal/100g · +
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Current Ingredients list */}
          <div className="space-y-1.5 pt-2">
            {ingredients.map((ing, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-1.5 px-3 bg-white dark:bg-dark-card rounded-xl text-xs border border-cream-200"
              >
                <span className="font-semibold">{ing.name} ({ing.grams}g)</span>
                <div className="flex items-center space-x-3">
                  <span className="text-bark-600 font-bold">{ing.calories} kcal</span>
                  <button
                    onClick={() => removeIngredient(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Calculated Per Portion Banner */}
        <div className="p-3 bg-solar-50 dark:bg-solar/10 rounded-2xl border border-solar/40 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-bark-800 dark:text-dark-text block">
              Nutrición por ración ({safePortions} raciones):
            </span>
            <span className="text-bark-500 text-[11px]">
              {proteinPerPortion}g P · {carbsPerPortion}g C · {fatPerPortion}g G
            </span>
          </div>
          <span className="font-display font-black text-lg text-bark-900 dark:text-dark-text">
            {caloriesPerPortion} <span className="text-[10px] font-sans font-bold">kcal</span>
          </span>
        </div>

        {/* Steps */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text">
              Pasos de preparación
            </label>
            <button
              type="button"
              onClick={addStepField}
              className="text-xs text-solar-700 dark:text-solar font-bold hover:underline"
            >
              + Añadir paso
            </button>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {steps.map((st, i) => (
              <div key={i} className="flex items-center space-x-2">
                <span className="text-xs font-bold text-bark-500">{i + 1}.</span>
                <input
                  type="text"
                  value={st}
                  onChange={(e) => handleStepChange(i, e.target.value)}
                  placeholder={`Paso ${i + 1}...`}
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-xs"
                />
                {steps.length > 1 && (
                  <button
                    onClick={() => removeStep(i)}
                    className="text-bark-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 bg-cream-200 dark:bg-dark-surface rounded-xl text-xs font-bold text-bark-800 dark:text-dark-text"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim() || ingredients.length === 0}
            className="flex-1 py-3 px-4 bg-solar hover:bg-solar-600 disabled:opacity-50 rounded-xl font-display font-bold text-bark-900 text-sm shadow-sm"
          >
            Guardar receta
          </button>
        </div>
      </div>
    </Modal>
  );
};
