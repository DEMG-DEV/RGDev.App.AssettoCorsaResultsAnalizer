import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { acLocalServerPlugin } from './vite-plugin-ac-local'

export default defineConfig({
  plugins: [react(), acLocalServerPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    watch: {
      ignored: ['**/src-tauri/**', '**/android/**'],
    },
  },
})
