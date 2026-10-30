import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dataRepo } from '../../services/dal/indexedDBRepo';
import { Download, Upload, Trash2, Database, AlertTriangle } from 'lucide-react';
import { Modal } from '../common/Modal';

export const BackupManager: React.FC = () => {
  const { showToast, refreshData, resetAllData } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const handleExport = async () => {
    try {
      const json = await dataRepo.exportData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nutrifit-copia-seguridad-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Copia de seguridad exportada con éxito', 'success');
    } catch (e) {
      console.error(e);
      showToast('Error al exportar los datos', 'error');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = reader.result as string;
        const success = await dataRepo.importData(text);
        if (success) {
          await refreshData();
          showToast('Datos restaurados correctamente', 'success');
        } else {
          showToast('El archivo JSON no tiene un formato válido', 'error');
        }
      } catch (err) {
        showToast('Error al importar el archivo', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = async () => {
    await resetAllData();
    setIsConfirmDeleteOpen(false);
  };

  return (
    <div className="bg-cream-50 dark:bg-dark-card border border-cream-200 dark:border-dark-border rounded-3xl p-5 shadow-card space-y-4">
      <div className="flex items-center space-x-2.5">
        <div className="w-10 h-10 rounded-2xl bg-solar-100 dark:bg-solar/20 text-solar-800 dark:text-solar flex items-center justify-center">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text leading-tight">
            Datos y Copias de Seguridad
          </h4>
          <span className="text-xs text-bark-500 dark:text-dark-muted font-medium">
            Tus datos se guardan localmente en IndexedDB en tu dispositivo
          </span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="space-y-2 pt-2">
        <button
          onClick={handleExport}
          className="w-full py-3 px-4 bg-white dark:bg-dark-surface hover:bg-cream-100 dark:hover:bg-dark-elevated border border-cream-300 dark:border-dark-border rounded-2xl text-xs font-bold text-bark-900 dark:text-dark-text flex items-center justify-between transition-colors shadow-sm"
        >
          <div className="flex items-center space-x-2.5">
            <Download className="w-4 h-4 text-solar-700 dark:text-solar" />
            <span>Exportar copia de seguridad (JSON)</span>
          </div>
          <span className="text-[10px] text-bark-500 font-normal">Descargar</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 px-4 bg-white dark:bg-dark-surface hover:bg-cream-100 dark:hover:bg-dark-elevated border border-cream-300 dark:border-dark-border rounded-2xl text-xs font-bold text-bark-900 dark:text-dark-text flex items-center justify-between transition-colors shadow-sm"
        >
          <div className="flex items-center space-x-2.5">
            <Upload className="w-4 h-4 text-solar-700 dark:text-solar" />
            <span>Importar copia de seguridad (JSON)</span>
          </div>
          <span className="text-[10px] text-bark-500 font-normal">Subir archivo</span>
        </button>

        <button
          onClick={() => setIsConfirmDeleteOpen(true)}
          className="w-full py-3 px-4 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl text-xs font-bold text-red-600 dark:text-red-400 flex items-center justify-between transition-colors shadow-sm"
        >
          <div className="flex items-center space-x-2.5">
            <Trash2 className="w-4 h-4 text-red-500" />
            <span>Restablecer y borrar datos</span>
          </div>
          <span className="text-[10px] text-red-500 font-normal">Reiniciar app</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        title="¿Restablecer datos de la aplicación?"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-start space-x-3 text-xs text-red-800 dark:text-red-200">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p>
              Esta acción borrará los alimentos que hayas añadido, recetas personalizadas y pesajes, restaurando los datos iniciales de demostración.
            </p>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <button
              onClick={() => setIsConfirmDeleteOpen(false)}
              className="py-2.5 px-4 bg-cream-200 dark:bg-dark-surface rounded-xl text-xs font-bold text-bark-800 dark:text-dark-text"
            >
              Cancelar
            </button>
            <button
              onClick={handleClearAll}
              className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Sí, restablecer datos
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
