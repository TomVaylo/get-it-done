import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/get-it-done/',

  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        id: '/get-it-done/',
        name: 'Get it Done!',
        short_name: 'GetItDone',
        description: 'Gestionnaire de projets et tâches épuré',

        start_url: '/get-it-done/',
        scope: '/get-it-done/',
        display: 'standalone',

        theme_color: '#ea580c',
        background_color: '#fafaf9',

        icons: [
          {
            src: '/get-it-done/pwa-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/get-it-done/pwa-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})