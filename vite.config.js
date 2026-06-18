import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 👈 Ton plugin Tailwind v4
import { VitePWA } from 'vite-plugin-pwa' // 👈 Le nouveau plugin PWA

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 👈 Ton Tailwind activé
    
    // 👇 Toute la configuration de la PWA ajoutée ici
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Adawn - Gestion Intelligente de Budget',
        short_name: 'Adawn',
        description: 'Gérez vos finances avec l\'IA Gemini',
        theme_color: '#1E1E2F',
        background_color: '#FFFFFF',
        display: "standalone",
        icons: [
          {
            src: '/logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    allowedHosts: true, // 👈 Ta configuration Localtunnel bien conservée
  }
})