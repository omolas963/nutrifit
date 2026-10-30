import React, { useState } from 'react';
import { GroceryCategory } from '../../types';
import { ShoppingBag, Check } from 'lucide-react';

interface GroceryListViewProps {
  categories: GroceryCategory[];
  onUpdateCategories?: (cats: GroceryCategory[]) => void;
}

export const GroceryListView: React.FC<GroceryListViewProps> = ({
  categories: initialCategories,
  onUpdateCategories,
}) => {
  const [categories, setCategories] = useState<GroceryCategory[]>(initialCategories);

  // Sync state if props change
  React.useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const toggleItem = (catIdx: number, itemIdx: number) => {
    const next = categories.map((cat, cI) => {
      if (cI !== catIdx) return cat;
      return {
        ...cat,
        items: cat.items.map((it, iI) => (iI === itemIdx ? { ...it, checked: !it.checked } : it)),
      };
    });
    setCategories(next);
    onUpdateCategories?.(next);
  };

  const totalItems = categories.reduce((acc, cat) => acc + cat.items.length, 0);
  const checkedItems = categories.reduce(
    (acc, cat) => acc + cat.items.filter((it) => it.checked).length,
    0
  );

  return (
    <div className="space-y-4">
      {/* Header with progress */}
      <div className="bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 shadow-card flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-solar-100 dark:bg-solar/20 text-solar-800 dark:text-solar flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text leading-tight">
              Lista de la Compra
            </h4>
            <span className="text-xs text-bark-500 dark:text-dark-muted font-medium">
              Generada a partir de tu plan de comidas
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="font-display font-bold text-lg text-bark-900 dark:text-dark-text">
            {checkedItems} / {totalItems}
          </span>
          <span className="text-[11px] text-bark-500 block">comprados</span>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {categories.map((cat, catIdx) => (
          <div
            key={catIdx}
            className="bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 shadow-card space-y-2.5"
          >
            <h5 className="font-display font-bold text-sm text-bark-900 dark:text-dark-text uppercase tracking-wider text-solar-800 dark:text-solar">
              {cat.category}
            </h5>

            <div className="space-y-1.5">
              {cat.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  onClick={() => toggleItem(catIdx, itemIdx)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-colors ${
                    item.checked
                      ? 'bg-cream-200/40 dark:bg-dark-surface/40 text-bark-400 line-through'
                      : 'bg-white dark:bg-dark-surface text-bark-800 dark:text-dark-text hover:bg-cream-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        item.checked
                          ? 'border-solar bg-solar text-bark-900'
                          : 'border-cream-400 dark:border-dark-border'
                      }`}
                    >
                      {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-sm font-semibold">{item.name}</span>
                  </div>

                  <span className="text-xs font-bold text-bark-500 dark:text-dark-muted">
                    {item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
