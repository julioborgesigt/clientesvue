// src/main.js

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// --- Configuração do Vuetify ---
import 'vuetify/styles' // Importa os estilos principais do Vuetify
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css' // Importa os ícones

// Cria a instância do Vuetify
const vuetify = createVuetify({
  components,
  directives,
  // Você pode definir um tema aqui (opcional)
  theme: {
    defaultTheme: 'light', // ou 'dark'
  },
})
// --- Fim da Configuração ---


// --- Remoção dos CSS antigos ---
// DELETE as linhas que importavam seu CSS antigo, se ainda estiverem aqui
// import '@/assets/style.css' (DELETAR)
// import '@/assets/styledash.css' (DELETAR)
// --- Fim da Remoção ---


const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(vuetify) // Adiciona o Vuetify ao app

app.mount('#app')