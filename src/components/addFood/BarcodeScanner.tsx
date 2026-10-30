import React, { useState, useEffect, useRef } from 'react';
import { apiLookupBarcode } from '../../services/api';
import { FoodItem, MealType } from '../../types';
import { useApp } from '../../context/AppContext';
import { Barcode, Camera, Loader2, Check, AlertCircle, X } from 'lucide-react';

interface BarcodeScannerProps {
  onClose: () => void;
  mealType: MealType;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onClose, mealType }) => {
  const { addFood, selectedDate } = useApp();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<any | null>(null);
  const [grams, setGrams] = useState(100);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera helper
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);

      // If BarcodeDetector is natively supported in Chrome / Android / modern Edge
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'],
        });

        const interval = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === 4) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const detectedCode = barcodes[0].rawValue;
                clearInterval(interval);
                stopCamera();
                handleLookup(detectedCode);
              }
            } catch (err) {
              // Ignore frames without barcodes
            }
          }
        }, 300);
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setErrorMsg('No se pudo acceder a la cámara. Puedes escribir el código de barras manualmente.');
    }
  };

  const handleLookup = async (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const prod = await apiLookupBarcode(cleanCode);
      if (prod) {
        setScannedProduct(prod);
      } else {
        setErrorMsg('Producto no encontrado en la base de datos de Open Food Facts.');
      }
    } catch (e) {
      setErrorMsg('Error al consultar código de barras.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddScanned = async () => {
    if (!scannedProduct) return;
    const factor = grams / 100;
    const item: Omit<FoodItem, 'id'> & { mealType: MealType; date: string; loggedAt: string } = {
      name: scannedProduct.name,
      brand: scannedProduct.brand,
      grams,
      calories: Math.round(scannedProduct.caloriesPer100g * factor),
      protein: Number((scannedProduct.proteinPer100g * factor).toFixed(1)),
      carbs: Number((scannedProduct.carbsPer100g * factor).toFixed(1)),
      fat: Number((scannedProduct.fatPer100g * factor).toFixed(1)),
      source: 'Open Food Facts',
      isEstimated: false,
      barcode: scannedProduct.barcode,
      mealType,
      date: selectedDate,
      loggedAt: new Date().toISOString(),
    };

    await addFood(item);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-cream-200 dark:border-dark-border pb-3">
        <div className="flex items-center space-x-2">
          <Barcode className="w-5 h-5 text-solar-700 dark:text-solar" />
          <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text">
            Escáner de Código de Barras
          </h4>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-bark-500 hover:text-bark-900"
          aria-label="Cerrar escáner"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Camera View */}
      {cameraActive ? (
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-black">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
          {/* Target red scan line */}
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 shadow-[0_0_8px_#EF4444] animate-pulse" />
          <button
            onClick={stopCamera}
            className="absolute top-3 right-3 py-1 px-3 bg-black/60 text-white rounded-full text-xs font-semibold"
          >
            Detener cámara
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={startCamera}
          className="w-full py-4 bg-cream-100 dark:bg-dark-surface border-2 border-dashed border-cream-300 dark:border-dark-border rounded-2xl flex items-center justify-center space-x-2 text-xs font-bold text-bark-800 dark:text-dark-text hover:border-solar transition-colors"
        >
          <Camera className="w-5 h-5 text-solar-700 dark:text-solar" />
          <span>Activar escáner con la cámara</span>
        </button>
      )}

      {/* Manual Barcode Input */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-bark-700 dark:text-dark-text mb-1">
          O introduce el código numérico:
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            placeholder="Ej: 8480000123456"
            className="flex-1 px-4 py-2.5 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-xl text-bark-900 dark:text-dark-text text-sm font-mono focus:outline-none focus:ring-2 focus:ring-solar"
          />
          <button
            type="button"
            onClick={() => handleLookup(barcodeInput)}
            disabled={!barcodeInput.trim() || isLoading}
            className="py-2.5 px-4 bg-solar hover:bg-solar-600 disabled:opacity-50 rounded-xl font-bold text-bark-900 text-xs shadow-sm"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center space-x-2 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Scanned product preview */}
      {scannedProduct && (
        <div className="p-4 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl shadow-sm space-y-3 animate-in fade-in">
          <div>
            <h5 className="font-display font-bold text-base text-bark-900 dark:text-dark-text">
              {scannedProduct.name}
            </h5>
            {scannedProduct.brand && (
              <span className="text-xs text-bark-500 font-medium">{scannedProduct.brand}</span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-bark-700">Porción:</span>
            <input
              type="number"
              min="1"
              max="2000"
              value={grams}
              onChange={(e) => setGrams(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-20 px-3 py-1.5 bg-cream-100 dark:bg-dark-elevated border border-cream-300 rounded-xl font-bold text-center text-bark-900 dark:text-dark-text"
            />
            <span className="text-xs font-bold text-bark-600">gramos</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs p-2.5 bg-cream-50 dark:bg-dark-elevated rounded-xl">
            <div>
              <span className="text-bark-500 block text-[10px]">Kcal</span>
              <span className="font-bold font-display text-bark-900 dark:text-dark-text">
                {Math.round(scannedProduct.caloriesPer100g * (grams / 100))}
              </span>
            </div>
            <div>
              <span className="text-macro-protein block text-[10px]">Proteína</span>
              <span className="font-bold text-bark-900 dark:text-dark-text">
                {Number((scannedProduct.proteinPer100g * (grams / 100)).toFixed(1))}g
              </span>
            </div>
            <div>
              <span className="text-macro-carbs block text-[10px]">Carbos</span>
              <span className="font-bold text-bark-900 dark:text-dark-text">
                {Number((scannedProduct.carbsPer100g * (grams / 100)).toFixed(1))}g
              </span>
            </div>
            <div>
              <span className="text-macro-fat block text-[10px]">Grasas</span>
              <span className="font-bold text-bark-900 dark:text-dark-text">
                {Number((scannedProduct.fatPer100g * (grams / 100)).toFixed(1))}g
              </span>
            </div>
          </div>

          <button
            onClick={handleAddScanned}
            className="w-full py-3 bg-solar hover:bg-solar-600 rounded-xl font-display font-bold text-bark-900 text-sm shadow-sm flex items-center justify-center space-x-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Añadir a {mealType}</span>
          </button>
        </div>
      )}
    </div>
  );
};
