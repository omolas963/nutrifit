import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';

export const UpdateNotification: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setShowUpdate(true);
    window.addEventListener('nutrifit-update-available', handleUpdate);
    return () => window.removeEventListener('nutrifit-update-available', handleUpdate);
  }, []);

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto p-3.5 bg-bark-900 text-white rounded-2xl shadow-floating border border-solar/60 flex items-center justify-between space-x-3 animate-fade-in">
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-xl bg-solar text-bark-900 flex items-center justify-center font-bold shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-xs block text-solar">Nueva versión disponible</span>
          <span className="text-[11px] text-cream-200">Asistente de IA y mejoras listas</span>
        </div>
      </div>
      <div className="flex items-center space-x-1.5 shrink-0">
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1.5 bg-solar hover:bg-solar-600 text-bark-900 rounded-xl font-bold text-xs flex items-center space-x-1 shadow-sm transition-transform active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Recargar</span>
        </button>
        <button
          onClick={() => setShowUpdate(false)}
          className="p-1 text-cream-300 hover:text-white rounded-lg"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
