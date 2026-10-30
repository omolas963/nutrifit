import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = 'max-h-[92vh]',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-bark-900/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-cream-50 dark:bg-dark-card border-t sm:border border-cream-300 dark:border-dark-border w-full max-w-xl sm:rounded-3xl rounded-t-3xl shadow-modal overflow-hidden animate-in slide-in-from-bottom duration-300 ${maxHeight} flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle for mobile */}
        <div className="w-12 h-1.5 bg-cream-400 dark:bg-dark-border rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 dark:border-dark-border">
            <h3 className="font-display font-bold text-lg text-bark-900 dark:text-dark-text">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-bark-600 hover:text-bark-900 hover:bg-cream-200 dark:text-dark-muted dark:hover:text-dark-text dark:hover:bg-dark-elevated transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
