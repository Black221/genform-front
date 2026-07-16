import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
    basicSsl(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'GenForm Observatoire',
        short_name: 'GenForm',
        description: 'Observatoire de suivi citoyen de l\'environnement',
        theme_color: '#00853F',
        background_color: '#f7f8f6',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // App shell + assets statiques
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Routes offline-first (navigation)
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            // Tuiles OSM — cache first, 7 jours
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Formulaires publiés — network first, fallback cache
            urlPattern: /^.*\/api\/v1\/public\/forms\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'forms-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            // Liste des formulaires
            urlPattern: /^.*\/api\/v1\/forms$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'forms-list-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 5 },
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    proxy: {
      '/api': 'http://192.168.1.10:8080',
    },
  },
})
