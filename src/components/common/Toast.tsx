import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { activeToast } = useApp();

  if (!activeToast) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-[420px] w-[90%] pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div className="bg-bark-900/95 dark:bg-dark-card/95 backdrop-blur-md text-white dark:text-dark-text border border-white/10 dark:border-dark-border px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-3">
        {activeToast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-solar shrink-0" />}
        {activeToast.type === 'error' && <AlertCircle className="w-5 h-5 text-macro-protein shrink-0" />}
        {activeToast.type === 'info' && <Info className="w-5 h-5 text-macro-water shrink-0" />}
        <p className="text-sm font-medium leading-snug">{activeToast.message}</p>
      </div>
    </div>
  );
};
