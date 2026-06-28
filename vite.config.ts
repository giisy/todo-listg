import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      base: '/todo-listg/',
      scope: '/todo-listg/',
      manifest: {
        name: 'TaskFlow',
        short_name: 'TaskFlow',
        description: 'Premium To-Do List App',
        theme_color: '#0F1115',
        background_color: '#0F1115',
        display: 'standalone',
        scope: '/todo-listg/',
        start_url: '/todo-listg/',
        icons: [
          {
            src: '/todo-listg/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/todo-listg/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  base: '/todo-listg/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})