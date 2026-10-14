import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'favicon-16.png',
        'favicon-32.png',
        'apple-touch-icon.png',
        'icon-192.png',
        'icon-512.png',
        'icon-maskable-512.png',
        'og-image.png',
      ],
      manifest: {
        name: 'EcoPulse - Smart Energy Saving Reminder',
        short_name: 'EcoPulse',
        description: 'Build sustainable energy-saving habits with timely reminders, estimated savings, and analytics.',
        theme_color: '#e6f4ea',
        background_color: '#e6f4ea',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
  css: {
    devSourcemap: false,
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router')
          ) {
            return 'react-vendor'
          }
          if (id.includes('node_modules/motion/')) {
            return 'motion-vendor'
          }
          if (
            id.includes('node_modules/recharts/') ||
            id.includes('node_modules/d3') ||
            id.includes('node_modules/victory-vendor')
          ) {
            return 'recharts-vendor'
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'lucide-vendor'
          }
        },
      },
    },
  },
})

