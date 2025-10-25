// src/main.js

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// --- Configuração do Vuetify ---
import 'vuetify/styles' 
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css' 

// Definição do Tema Claro (Light)
const lightTheme = {
  dark: false,
  colors: {
    background: '#FFFFFF', 
    surface: '#FFFFFF',    
    primary: '#1976D2',    // Azul padrão para tema claro
    // secondary: '#...', // Outras cores se necessário
  },
}

// Definição do Tema Escuro (Dark)
const darkTheme = {
  dark: true,
  colors: {
    background: '#121212', // Fundo principal escuro
    surface: '#1E1E1E',    // Fundo de cards/barras um pouco mais claro
    primary: '#1d2427ff',    // <-- MUDANÇA: Azul acinzentado escuro para a cor primária no dark mode
    // secondary: '#...', 
  },
}

// Criação da instância do Vuetify com os temas
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark', // Começa no tema escuro
    themes: {
      light: lightTheme,
      dark: darkTheme,
    },
  },
})
// --- Fim da Configuração ---

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(vuetify) 

app.mount('#app')