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
    // Otimizações de bundle
    rollupOptions: {
      output: {
        manualChunks: {
          // Separa Vue e Vuetify em chunks separados
          'vue-vendor': ['vue', 'pinia'],
          'vuetify-vendor': ['vuetify'],
          'chart-vendor': ['chart.js', 'vue-chartjs'],
        },
      },
    },
    // Aumenta o limite de aviso para chunks grandes (Vuetify é grande)
    chunkSizeWarningLimit: 1000,
  },

  // Configuração de testes
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    // Ignora CSS em testes
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.spec.js',
        '**/*.test.js',
      ],
    },
  },
})