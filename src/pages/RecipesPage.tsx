import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Recipe, RecipeIngredient } from '../types';
import { RecipeCard } from '../components/recipes/RecipeCard';
import { RecipeDetailModal } from '../components/recipes/RecipeDetailModal';
import { CreateRecipeModal } from '../components/recipes/CreateRecipeModal';
import { AiRecipeModal } from '../components/recipes/AiRecipeModal';
import { Sparkles, Plus, Search, Bookmark, ChefHat, ShoppingBag, Calendar } from 'lucide-react';
import { MealPlanModal } from '../components/mealPlan/MealPlanModal';

export const RecipesPage: React.FC = () => {
  const { recipes } = useApp();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planModalTab, setPlanModalTab] = useState<'plan' | 'grocery'>('grocery');
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = recipes.filter((r: Recipe) => {
    if (filterFavorite && !r.isFavorite) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.ingredients.some((i: RecipeIngredient) => i.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header & Hero AI Trigger */}
      <div className="bg-gradient-to-br from-solar-50 to-cream-200/80 dark:from-dark-card dark:to-dark-surface border border-solar/40 dark:border-dark-border rounded-3xl p-5 shadow-card space-y-3">
        <div className="flex items-center space-x-2 text-solar-800 dark:text-solar font-bold text-xs uppercase tracking-wider">
          <ChefHat className="w-4 h-4" />
          <span>Recetas y Cocina Saludable</span>
        </div>

        <div>
          <h2 className="font-display font-extrabold text-2xl text-bark-900 dark:text-dark-text leading-tight">
            Cocina ajustada a tus macros
          </h2>
          <p className="text-xs text-bark-600 dark:text-dark-muted mt-1 max-w-md leading-relaxed">
            Crea tus platos favoritos con cálculo automático de calorías por ración o deja que nuestra IA cree una receta a partir de los ingredientes que tienes.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex-1 py-3 px-4 bg-solar hover:bg-solar-600 active:scale-[0.99] text-bark-900 rounded-2xl font-display font-bold text-xs shadow-floating flex items-center justify-center space-x-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generar receta con IA</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="py-3 px-4 bg-white dark:bg-dark-elevated hover:bg-cream-100 dark:hover:bg-dark-card text-bark-900 dark:text-dark-text border border-cream-300 dark:border-dark-border rounded-2xl font-display font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Crear receta</span>
          </button>
          <button
            onClick={() => {
              setPlanModalTab('grocery');
              setIsPlanModalOpen(true);
            }}
            className="py-3 px-4 bg-white dark:bg-dark-elevated hover:bg-cream-100 dark:hover:bg-dark-card text-bark-900 dark:text-dark-text border border-cream-300 dark:border-dark-border rounded-2xl font-display font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
            title="Ver lista de la compra"
          >
            <ShoppingBag className="w-4 h-4 text-solar-700" />
            <span>Lista de la compra</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar recetas por nombre o ingrediente..."
            className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl text-bark-900 dark:text-dark-text text-xs focus:outline-none focus:ring-2 focus:ring-solar"
          />
          <Search className="w-4 h-4 text-bark-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <button
          onClick={() => setFilterFavorite(!filterFavorite)}
          className={`py-2.5 px-3.5 rounded-2xl text-xs font-bold flex items-center space-x-1.5 border transition-colors ${
            filterFavorite
              ? 'bg-solar-100 dark:bg-solar/20 border-solar text-solar-800 dark:text-solar'
              : 'bg-white dark:bg-dark-surface border-cream-300 dark:border-dark-border text-bark-600 dark:text-dark-muted'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${filterFavorite ? 'fill-current' : ''}`} />
          <span>Favoritas</span>
        </button>
      </div>

      {/* Recipes List */}
      <div className="space-y-3 pt-1">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((recipe: Recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelect={(r: Recipe) => setSelectedRecipe(r)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl space-y-2">
            <ChefHat className="w-10 h-10 text-bark-400 mx-auto" />
            <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text">
              No se encontraron recetas
            </h4>
            <p className="text-xs text-bark-500 max-w-xs mx-auto">
              Prueba con otra búsqueda o pulsa en <strong>Generar receta con IA</strong> para que creemos una deliciosa al instante.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <MealPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        defaultTab={planModalTab}
      />
      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={Boolean(selectedRecipe)}
        onClose={() => setSelectedRecipe(null)}
      />

      <CreateRecipeModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <AiRecipeModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
};
