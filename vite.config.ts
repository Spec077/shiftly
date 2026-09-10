import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'prompt',
    includeAssets: ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
    manifest: {
      name: 'Shiftly',
      short_name: 'Shiftly',
      description: 'Paste. Convert. Copy. Private staffing list conversion.',
      theme_color: '#faf9f7',
      background_color: '#faf9f7',
      display: 'standalone',
      start_url: '/',
      scope: '/',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
      navigateFallback: 'index.html',
      cleanupOutdatedCaches: true,
    },
  })],
})
