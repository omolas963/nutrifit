import React, { useState } from 'react';
import { stepsService } from '../../services/stepsService';
import { useApp } from '../../context/AppContext';
import { X, Footprints, Check } from 'lucide-react';

interface ManualStepsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

export const ManualStepsModal: React.FC<ManualStepsModalProps> = ({
  isOpen,
  onClose,
  initialDate,
}) => {
  const { profile, selectedDate } = useApp();
  const dateToUse = initialDate || selectedDate || new Date().toISOString().split('T')[0];

  const currentSteps = stepsService.getState().history[dateToUse]?.steps || 0;
  const [stepsInput, setStepsInput] = useState(String(currentSteps || ''));

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(stepsInput, 10);
    if (!isNaN(count) && count >= 0) {
      const weight = profile?.currentWeightKg || 70;
      const height = profile?.heightCm || 175;
      await stepsService.setManualSteps(dateToUse, count, weight, height);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bark-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-cream-200 dark:border-dark-border pb-3">
          <div className="flex items-center space-x-2">
            <Footprints className="w-5 h-5 text-solar-800 dark:text-solar" />
            <h3 className="font-display font-bold text-base text-bark-900 dark:text-dark-text">
              Registrar Pasos
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-bark-400 hover:text-bark-900 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-bark-700 dark:text-dark-muted mb-1">
              Pasos caminados el {dateToUse}:
            </label>
            <input
              type="number"
              min="0"
              max="150000"
              placeholder="Ej: 8500"
              value={stepsInput}
              onChange={(e) => setStepsInput(e.target.value)}
              className="w-full py-2.5 px-3 bg-cream-100 dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-sm font-bold text-bark-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-solar"
              autoFocus
            />
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 bg-cream-100 dark:bg-dark-surface text-bark-700 dark:text-dark-muted rounded-xl text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-3 bg-solar hover:bg-solar-600 text-bark-900 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
