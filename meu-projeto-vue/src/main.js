// src/main.js

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { initializeCsrf } from './api/axios'

// --- Configuração do Vuetify com Tree-Shaking ---
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'

// Estilos globais de autenticação
import './assets/auth-styles.css'

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
  VCheckbox,
  VChip,
  VCol,
  VContainer,
  VDataTable,
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
    VCheckbox,
    VChip,
    VCol,
    VContainer,
    VDataTable,
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

/**
 * Error Boundary Global
 * Captura erros não tratados em componentes Vue e renderização
 * Previne que erros crashem toda a aplicação
 */
app.config.errorHandler = (err, instance, info) => {
  // Log do erro para debug
  console.error('[Global Error Handler]', {
    error: err,
    component: instance?.$options.name || 'Unknown Component',
    info,
    stack: err?.stack
  });

  // Em produção, enviar para serviço de monitoramento (Sentry, etc)
  if (import.meta.env.PROD) {
    // TODO: Integrar com Sentry ou outro serviço de monitoramento
    // Sentry.captureException(err);
  }

  // Mostrar notificação amigável ao usuário
  // Usar timeout para garantir que o store está disponível
  setTimeout(async () => {
    try {
      const { useNotificationStore } = await import('./stores/notificationStore');
      const notificationStore = useNotificationStore();

      const userMessage = err?.message || 'Ocorreu um erro inesperado. Por favor, recarregue a página.';
      notificationStore.error(userMessage, 6000);
    } catch (storeError) {
      // Fallback se o store não estiver disponível
      console.error('Failed to show error notification:', storeError);
    }
  }, 100);
};

/**
 * Warning Handler Global
 * Captura avisos do Vue (dev only)
 */
app.config.warnHandler = (msg, instance, trace) => {
  if (import.meta.env.DEV) {
    console.warn('[Vue Warning]', msg, trace);
  }
};

// Inicializar CSRF token
initializeCsrf().catch(err => {
  console.warn('Falha ao inicializar CSRF token:', err);
});

app.mount('#app')
