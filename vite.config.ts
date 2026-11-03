import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.png',
        'icon-192.png',
        'icon-512.png',
        'icon-maskable-192.png',
        'icon-maskable-512.png',
        'nutrifit.mobileconfig',
        'oscar-avatar.png',
      ],
      manifest: {
        id: '/',
        name: 'NutriFit — Control de Calorías y Macros',
        short_name: 'NutriFit',
        description: 'Calcula y controla lo que comes (calorías y macros) y alcanza tu peso ideal.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#FFC62E',
        theme_color: '#FFC62E',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192.png?v=3',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png?v=3',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-maskable-192.png?v=3',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icon-maskable-512.png?v=3',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 5_000_000,
        navigateFallbackDenylist: [
          /^\/api\//,
          /\.apk$/,
          /nutrifit\.apk/,
          /\.ipa$/,
          /nutrifit\.ipa/,
          /\/apple/,
          /\/ios/,
          /\/descargar/,
          /\.mobileconfig$/,
        ],
        runtimeCaching: [
          {
            urlPattern: /^\/api\//,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-v2',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /\.(?:png|svg|jpg|jpeg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-v2',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${process.env.PORT || 10000}`,
        changeOrigin: true,
      },
    },
  },
});
