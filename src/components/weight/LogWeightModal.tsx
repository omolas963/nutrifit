import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Sparkles } from 'lucide-react';

interface LogWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogWeightModal: React.FC<LogWeightModalProps> = ({ isOpen, onClose }) => {
  const { profile, logWeight } = useApp();
  const [weightKg, setWeightKg] = useState<number>(profile?.currentWeightKg || 75);
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg) return;
    await logWeight(weightKg, notes.trim() || undefined);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar nuevo pesaje" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1.5">
            Tu peso corporal de hoy
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="30"
              max="300"
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl text-bark-900 dark:text-dark-text font-display font-black text-3xl focus:outline-none focus:ring-2 focus:ring-solar text-center"
              autoFocus
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-display font-bold text-lg text-bark-500">
              kg
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1.5">
            Notas opcionales (ej: en ayunas, post-entreno)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Pesaje matutino tras despertar..."
            className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-bark-900 dark:text-dark-text text-xs focus:outline-none focus:ring-1 focus:ring-solar"
          />
        </div>

        {/* Notice of automatic recalculation */}
        <div className="p-3 bg-solar-50 dark:bg-solar/10 rounded-2xl border border-solar/40 flex items-start space-x-2 text-xs text-bark-700 dark:text-dark-text">
          <Sparkles className="w-4 h-4 text-solar-700 dark:text-solar shrink-0 mt-0.5" />
          <p>
            Al guardar, tus <strong>calorías y macronutrientes diarios se recalcularán automáticamente</strong> para adaptarse con exactitud a tu nuevo peso.
          </p>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 bg-cream-200 dark:bg-dark-surface hover:bg-cream-300 dark:hover:bg-dark-elevated rounded-xl font-bold text-bark-800 dark:text-dark-text text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!weightKg}
            className="flex-1 py-3 px-4 bg-solar hover:bg-solar-600 disabled:opacity-50 rounded-xl font-display font-bold text-bark-900 text-sm shadow-sm transition-colors"
          >
            Guardar y recalcular metas
          </button>
        </div>
      </form>
    </Modal>
  );
};
