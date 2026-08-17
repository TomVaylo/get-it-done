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
        name: 'Get it Done!',
        short_name: 'GetItDone',
        description: 'Gestionnaire de projets et tâches épuré',
        theme_color: '#ea580c',
        background_color: '#fafaf9',
        display: 'standalone',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/906/906334.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/906/906334.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})