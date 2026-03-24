import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import packageJson from './package.json'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],
})