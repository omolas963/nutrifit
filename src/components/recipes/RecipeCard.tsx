import React from 'react';
import { Recipe, MealType } from '../../types';
import { Clock, Users, Bookmark, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect }) => {
  const { toggleFavoriteRecipe, addFood, selectedDate } = useApp();

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Prompt or default to 'comida'
    const meal: MealType = 'comida';
    await addFood({
      name: `1 ración de ${recipe.title}`,
      grams: 250,
      calories: recipe.caloriesPerPortion,
      protein: recipe.proteinPerPortion,
      carbs: recipe.carbsPerPortion,
      fat: recipe.fatPerPortion,
      source: 'Manual',
      isEstimated: false,
      mealType: meal,
      date: selectedDate,
      loggedAt: new Date().toISOString(),
    });
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteRecipe(recipe.id);
  };

  return (
    <div
      onClick={() => onSelect(recipe)}
      className="bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 shadow-card hover:shadow-modal transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div>
        {/* Top Badges & Favorite */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-bark-500 dark:text-dark-muted">
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-solar-700 dark:text-solar" />
              <span>{recipe.prepTimeMinutes} min</span>
            </span>
            <span>·</span>
            <span className="flex items-center space-x-1">
              <Users className="w-3.5 h-3.5" />
              <span>{recipe.portions} {recipe.portions === 1 ? 'ración' : 'raciones'}</span>
            </span>
          </div>

          <button
            onClick={handleFavoriteClick}
            className={`p-1.5 rounded-full transition-colors ${
              recipe.isFavorite
                ? 'text-solar-700 dark:text-solar bg-solar/15'
                : 'text-bark-400 hover:text-bark-700 dark:hover:text-dark-text'
            }`}
            aria-label={recipe.isFavorite ? 'Quitar de favoritos' : 'Marcar como favorita'}
          >
            <Bookmark className={`w-4 h-4 ${recipe.isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Title & Description */}
        <h4 className="font-display font-bold text-lg text-bark-900 dark:text-dark-text leading-snug group-hover:text-solar-700 dark:group-hover:text-solar transition-colors">
          {recipe.title}
        </h4>
        <p className="text-xs text-bark-600 dark:text-dark-muted mt-1 line-clamp-2 leading-relaxed">
          {recipe.description}
        </p>
      </div>

      {/* Macros & Quick Add Footer */}
      <div className="mt-4 pt-3 border-t border-cream-200 dark:border-dark-border flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs">
          <div>
            <span className="font-display font-black text-base text-bark-900 dark:text-dark-text">
              {recipe.caloriesPerPortion}
            </span>
            <span className="text-[10px] text-bark-500 ml-0.5">kcal</span>
          </div>
          <div className="flex space-x-1.5 font-medium text-[11px]">
            <span className="text-macro-protein">{Math.round(recipe.proteinPerPortion)}g P</span>
            <span className="text-macro-carbs">{Math.round(recipe.carbsPerPortion)}g C</span>
            <span className="text-macro-fat">{Math.round(recipe.fatPerPortion)}g G</span>
          </div>
        </div>

        <button
          onClick={handleQuickAdd}
          className="py-1.5 px-3 rounded-xl bg-solar hover:bg-solar-600 active:scale-95 text-bark-900 text-xs font-bold flex items-center space-x-1 shadow-sm transition-transform"
          title="Añadir 1 ración a mi diario de hoy"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Añadir</span>
        </button>
      </div>
    </div>
  );
};
