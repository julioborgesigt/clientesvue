import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // Importe o módulo 'path' do Node.js

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  // Adicione esta seção 'resolve'
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Configuração de build para produção
  build: {
    // Remove console.log, console.warn, e console.error em produção
    minify: 'esbuild',
    esbuild: {
      drop: ['console', 'debugger'],
    },
  },
})