// src/main.js

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// --- Configuração do Vuetify com Tree-Shaking ---
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'

// Importar apenas componentes usados (reduz bundle em ~40%)
import {
  VAlert,
  VApp,
  VAppBar,
  VAppBarNavIcon,
  VBtn,
  VCard,
  VCardActions,
  VCardSubtitle,
  VCardText,
  VCardTitle,
  VChip,
  VCol,
  VContainer,
  VDataTableServer,
  VDialog,
  VDivider,
  VForm,
  VIcon,
  VImg,
  VList,
  VListItem,
  VListItemSubtitle,
  VListItemTitle,
  VMain,
  VMenu,
  VNavigationDrawer,
  VProgressCircular,
  VProgressLinear,
  VRow,
  VSelect,
  VSnackbar,
  VSpacer,
  VTable,
  VTextField,
  VTextarea,
  VToolbarItems,
  VToolbarTitle,
  VTooltip,
} from 'vuetify/components'

// Diretivas (importar apenas as necessárias)
import { Ripple } from 'vuetify/directives' 

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
    primary: '#1E1E1E',    // <-- MUDANÇA: Azul acinzentado escuro para a cor primária no dark mode
    // secondary: '#...', 
  },
}

// Criação da instância do Vuetify com os temas
const vuetify = createVuetify({
  components: {
    VAlert,
    VApp,
    VAppBar,
    VAppBarNavIcon,
    VBtn,
    VCard,
    VCardActions,
    VCardSubtitle,
    VCardText,
    VCardTitle,
    VChip,
    VCol,
    VContainer,
    VDataTableServer,
    VDialog,
    VDivider,
    VForm,
    VIcon,
    VImg,
    VList,
    VListItem,
    VListItemSubtitle,
    VListItemTitle,
    VMain,
    VMenu,
    VNavigationDrawer,
    VProgressCircular,
    VProgressLinear,
    VRow,
    VSelect,
    VSnackbar,
    VSpacer,
    VTable,
    VTextField,
    VTextarea,
    VToolbarItems,
    VToolbarTitle,
    VTooltip,
  },
  directives: {
    Ripple,
  },
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