import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nutrifit.app',
  appName: 'NutriFit',
  webDir: 'dist',
  server: {
    // Prioriza que las actualizaciones lleguen solas en tiempo real desde el servidor desplegado
    url: 'https://nutrifit-ie73.onrender.com',
    cleartext: false,
    androidScheme: 'https',
  },
  android: {
    minSdkVersion: 26,
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
  ios: {
    scheme: 'NutriFit',
  },
};

export default config;
