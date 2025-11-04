# 🚨 Correções Urgentes - Implementação Imediata

Este arquivo contém código pronto para implementar as correções mais críticas identificadas na auditoria.

---

## 1. 🔐 Corrigir Armazenamento de Token

### ❌ ANTES (VULNERÁVEL):
```javascript
// src/stores/authStore.js
state: () => ({
    token: localStorage.getItem('token') || null,
}),
actions: {
    async login(email, password) {
        const response = await apiClient.post('/auth/login', { email, password });
        this.token = response.data.token;
        localStorage.setItem('token', response.data.token);
        router.push('/dashboard');
    },
    logout() {
        this.token = null;
        localStorage.removeItem('token');
        router.push('/login');
    },
}
```

### ✅ DEPOIS (CORRIGIDO):
```javascript
// src/stores/authStore.js
import { defineStore } from 'pinia';
import apiClient from '@/api/axios';
import router from '@/router';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: sessionStorage.getItem('token') || null, // ✅ sessionStorage
        tokenExpiry: sessionStorage.getItem('tokenExpiry') || null,
    }),
    getters: {
        isAuthenticated: (state) => {
            if (!state.token) return false;

            // ✅ Verificar expiração
            if (state.tokenExpiry) {
                const now = Date.now();
                if (now > parseInt(state.tokenExpiry)) {
                    return false;
                }
            }
            return true;
        },
    },
    actions: {
        async login(email, password) {
            try {
                const response = await apiClient.post('/auth/login', {
                    email: email.trim().toLowerCase(), // ✅ Sanitizar
                    password
                });

                // ✅ Validar resposta
                if (!response.data || !response.data.token) {
                    throw new Error('Resposta inválida do servidor');
                }

                this.token = response.data.token;

                // ✅ Definir expiração (1 hora)
                const expiry = Date.now() + (60 * 60 * 1000);
                this.tokenExpiry = expiry.toString();

                sessionStorage.setItem('token', response.data.token);
                sessionStorage.setItem('tokenExpiry', expiry.toString());

                router.push('/dashboard');
            } catch (error) {
                console.error('Erro no login:', error);
                // ✅ Mensagem genérica
                const message = 'Falha na autenticação. Verifique suas credenciais.';
                throw new Error(message);
            }
        },

        async register(name, email, password) {
            try {
                const response = await apiClient.post('/auth/register', {
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    password
                });

                return response.data.message || 'Cadastro realizado com sucesso!';
            } catch (error) {
                console.error('Erro no registro:', error);
                throw new Error('Erro ao registrar. Tente novamente.');
            }
        },

        logout() {
            this.token = null;
            this.tokenExpiry = null;
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('tokenExpiry');
            router.push('/login');
        },

        // ✅ Verificar token periodicamente
        checkTokenExpiry() {
            if (!this.isAuthenticated) {
                this.logout();
            }
        }
    },
});
```

### Adicionar no App.vue para verificar expiração:
```vue
<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
let intervalId = null;

onMounted(() => {
  // Verificar token a cada 5 minutos
  intervalId = setInterval(() => {
    authStore.checkTokenExpiry();
  }, 5 * 60 * 1000);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>
```

---

## 2. 🛡️ Adicionar Content Security Policy

### Criar novo arquivo: `index.html`
```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- ✅ Content Security Policy -->
    <meta
      http-equiv="Content-Security-Policy"
      content="
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com data:;
        img-src 'self' data: https: blob:;
        connect-src 'self' https://clientes.domcloud.dev https://wa.me;
        frame-src 'none';
        object-src 'none';
      "
    >

    <!-- ✅ Referrer Policy -->
    <meta name="referrer" content="strict-origin-when-cross-origin">

    <!-- ✅ X-Content-Type-Options -->
    <meta http-equiv="X-Content-Type-Options" content="nosniff">

    <title>Dashboard de Clientes</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

---

## 3. 🔒 Adicionar Timeout e Validação nas Requisições

### ❌ ANTES:
```javascript
// src/api/axios.js
const apiClient = axios.create({
    baseURL: 'https://clientes.domcloud.dev',
    headers: { 'Content-Type': 'application/json' },
});
```

### ✅ DEPOIS:
```javascript
// src/api/axios.js
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import router from '@/router';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://clientes.domcloud.dev',
    timeout: 30000, // ✅ 30 segundos
    headers: {
        'Content-Type': 'application/json',
    },
});

// ✅ Contador de requisições pendentes
let pendingRequests = 0;

// Interceptor: Adiciona o token a CADA requisição
apiClient.interceptors.request.use(
    (config) => {
        pendingRequests++;

        // Só adicione o token se a rota não for de autenticação
        if (!config.url.startsWith('/auth')) {
            const authStore = useAuthStore();
            const token = authStore.token;

            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            } else {
                // ✅ Bloquear requisição se não tiver token
                pendingRequests--;
                return Promise.reject(new Error('Token não encontrado'));
            }
        }

        return config;
    },
    (error) => {
        pendingRequests--;
        return Promise.reject(error);
    }
);

// Interceptor: Lida com erros
apiClient.interceptors.response.use(
    (response) => {
        pendingRequests--;

        // ✅ Validar estrutura básica da resposta
        if (!response.data) {
            console.warn('Resposta sem dados:', response);
        }

        return response;
    },
    (error) => {
        pendingRequests--;

        // ✅ Tratamento de erros melhorado
        if (error.response) {
            const status = error.response.status;

            switch (status) {
                case 401:
                    // Token inválido ou expirado
                    const authStore = useAuthStore();
                    authStore.logout();
                    break;

                case 403:
                    console.error('Acesso negado');
                    break;

                case 404:
                    console.error('Recurso não encontrado');
                    break;

                case 429:
                    console.error('Muitas requisições - aguarde');
                    break;

                case 500:
                case 502:
                case 503:
                    console.error('Erro no servidor - tente novamente');
                    break;

                default:
                    console.error(`Erro ${status}:`, error.response.data);
            }
        } else if (error.code === 'ECONNABORTED') {
            console.error('Requisição expirou - timeout');
        } else if (error.message === 'Network Error') {
            console.error('Erro de conexão - verifique sua internet');
        }

        return Promise.reject(error);
    }
);

// ✅ Exportar função para verificar requisições pendentes
export const hasPendingRequests = () => pendingRequests > 0;

export default apiClient;
```

---

## 4. 🐛 Corrigir Bug de Data

### Criar arquivo de utilitários: `src/utils/dateUtils.js`
```javascript
/**
 * Formata data do formato ISO para pt-BR
 * @param {string} dateString - Data no formato ISO (YYYY-MM-DD)
 * @returns {string} - Data formatada (DD/MM/YYYY)
 */
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
        // ✅ Forçar timezone UTC para evitar off-by-one
        const date = new Date(dateString + 'T00:00:00Z');

        // ✅ Verificar se data é válida
        if (isNaN(date.getTime())) {
            console.warn('Data inválida:', dateString);
            return dateString;
        }

        return date.toLocaleDateString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (e) {
        console.error('Erro ao formatar data:', e);
        return dateString;
    }
};

/**
 * Formata data para input type="date" (YYYY-MM-DD)
 * @param {string|Date} date - Data
 * @returns {string} - Data no formato YYYY-MM-DD
 */
export const formatDateForInput = (date) => {
    if (!date) return '';

    try {
        const d = date instanceof Date ? date : new Date(date);

        if (isNaN(d.getTime())) {
            return '';
        }

        // ✅ Extrair componentes em UTC
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    } catch (e) {
        console.error('Erro ao formatar data para input:', e);
        return '';
    }
};

/**
 * Adiciona dias a uma data
 * @param {string} dateString - Data no formato ISO
 * @param {number} days - Número de dias a adicionar
 * @returns {string} - Nova data no formato ISO
 */
export const addDays = (dateString, days) => {
    const date = new Date(dateString + 'T00:00:00Z');
    date.setUTCDate(date.getUTCDate() + days);
    return formatDateForInput(date);
};
```

### Atualizar ClientTable.vue:
```javascript
// ❌ REMOVER:
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const parts = dateString.split('-');
  if (parts.length < 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

// ✅ ADICIONAR:
import { formatDate } from '@/utils/dateUtils';

// Na função sendWhatsAppMessage:
async function sendWhatsAppMessage(client, messageType = 'default') {
  try {
    const message = await clientStore.fetchMessage(messageType);
    if (!message) {
      alert(`Mensagem ${messageType === 'vencido' ? '(Vencido)' : 'Padrão'} não configurada.`);
      return;
    }

    // ✅ CORRIGIDO - Sem o +1 arbitrário
    const formattedDate = formatDate(client.vencimento);
    const fullMessage = `${message}\nVencimento: ${formattedDate}`;

    const phone = client.whatsapp.startsWith('+')
      ? client.whatsapp.substring(1)
      : client.whatsapp;

    const whatsappLink = `https://wa.me/${phone}?text=${encodeURIComponent(fullMessage)}`;
    window.open(whatsappLink, '_blank');
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error);
    alert('Erro ao preparar mensagem do WhatsApp.');
  }
}
```

---

## 5. 🛡️ Adicionar Sanitização de Entrada

### Criar arquivo: `src/utils/sanitize.js`
```javascript
/**
 * Remove caracteres HTML potencialmente perigosos
 * @param {string} text - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
export const sanitizeHTML = (text) => {
    if (!text || typeof text !== 'string') return '';

    const entities = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;'
    };

    return text.replace(/[<>&"'\/]/g, (char) => entities[char]);
};

/**
 * Sanitiza texto para URL (WhatsApp, etc)
 * @param {string} text - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
export const sanitizeForURL = (text) => {
    if (!text || typeof text !== 'string') return '';

    // Remove caracteres de controle e especiais perigosos
    return text
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .replace(/[<>]/g, '') // Remove < e >
        .trim();
};

/**
 * Sanitiza número de telefone
 * @param {string} phone - Número de telefone
 * @returns {string} - Número sanitizado
 */
export const sanitizePhone = (phone) => {
    if (!phone || typeof phone !== 'string') return '';

    // Remove tudo exceto números e o símbolo +
    return phone.replace(/[^\d+]/g, '');
};

/**
 * Sanitiza email
 * @param {string} email - Email
 * @returns {string} - Email sanitizado
 */
export const sanitizeEmail = (email) => {
    if (!email || typeof email !== 'string') return '';

    return email.trim().toLowerCase();
};
```

### Atualizar ClientTable.vue para usar sanitização:
```javascript
import { sanitizeForURL, sanitizePhone } from '@/utils/sanitize';

async function sendWhatsAppMessage(client, messageType = 'default') {
  try {
    const message = await clientStore.fetchMessage(messageType);
    if (!message) {
      alert(`Mensagem ${messageType === 'vencido' ? '(Vencido)' : 'Padrão'} não configurada.`);
      return;
    }

    const formattedDate = formatDate(client.vencimento);

    // ✅ Sanitizar mensagem e nome do cliente
    const safeName = sanitizeForURL(client.name);
    const safeMessage = sanitizeForURL(message);
    const fullMessage = `${safeMessage}\nCliente: ${safeName}\nVencimento: ${formattedDate}`;

    // ✅ Sanitizar número de telefone
    const safePhone = sanitizePhone(client.whatsapp);
    const phone = safePhone.startsWith('+') ? safePhone.substring(1) : safePhone;

    const whatsappLink = `https://wa.me/${phone}?text=${encodeURIComponent(fullMessage)}`;
    window.open(whatsappLink, '_blank');
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error);
    alert('Erro ao preparar mensagem do WhatsApp.');
  }
}
```

---

## 6. 🔧 Adicionar Variáveis de Ambiente

### Criar arquivo: `.env.example`
```env
# URL da API
VITE_API_URL=https://clientes.domcloud.dev

# Timeout das requisições (ms)
VITE_API_TIMEOUT=30000

# Habilitar logs de debug
VITE_ENABLE_DEBUG=false

# Tempo de expiração do token (ms)
VITE_TOKEN_EXPIRY=3600000
```

### Criar arquivo: `.env` (não commitar)
```env
VITE_API_URL=https://clientes.domcloud.dev
VITE_API_TIMEOUT=30000
VITE_ENABLE_DEBUG=true
VITE_TOKEN_EXPIRY=3600000
```

### Atualizar `.gitignore`:
```gitignore
# Environment variables
.env
.env.local
.env.*.local
```

### Criar helper: `src/utils/env.js`
```javascript
/**
 * Obtém variável de ambiente com fallback
 * @param {string} key - Nome da variável
 * @param {any} defaultValue - Valor padrão
 * @returns {any} - Valor da variável
 */
export const getEnv = (key, defaultValue = null) => {
    const value = import.meta.env[key];
    return value !== undefined ? value : defaultValue;
};

/**
 * Verifica se está em modo de desenvolvimento
 */
export const isDev = () => import.meta.env.DEV;

/**
 * Verifica se está em modo de produção
 */
export const isProd = () => import.meta.env.PROD;

/**
 * Log condicional (apenas em dev)
 */
export const devLog = (...args) => {
    if (isDev() || getEnv('VITE_ENABLE_DEBUG') === 'true') {
        console.log(...args);
    }
};
```

### Usar no axios.js:
```javascript
import { getEnv } from '@/utils/env';

const apiClient = axios.create({
    baseURL: getEnv('VITE_API_URL', 'https://clientes.domcloud.dev'),
    timeout: parseInt(getEnv('VITE_API_TIMEOUT', '30000')),
    headers: { 'Content-Type': 'application/json' },
});
```

---

## 7. 🧹 Remover Logs de Debug em Produção

### Criar arquivo: `src/utils/logger.js`
```javascript
import { isDev } from './env';

export const logger = {
    log: (...args) => {
        if (isDev()) {
            console.log(...args);
        }
    },

    warn: (...args) => {
        if (isDev()) {
            console.warn(...args);
        }
    },

    error: (...args) => {
        // Sempre mostrar erros
        console.error(...args);
    },

    debug: (...args) => {
        if (isDev()) {
            console.debug(...args);
        }
    }
};
```

### Substituir todos console.log:
```javascript
// ❌ ANTES:
console.log('DashboardView: openPendingModal chamada.');

// ✅ DEPOIS:
import { logger } from '@/utils/logger';
logger.debug('DashboardView: openPendingModal chamada.');
```

---

## 8. ✅ Checklist de Implementação

### Prioridade 1 (Fazer AGORA):
- [ ] Migrar token de localStorage para sessionStorage
- [ ] Adicionar Content Security Policy no index.html
- [ ] Adicionar timeout de 30s nas requisições
- [ ] Corrigir bug de data (+1 dia removido)
- [ ] Atualizar axios para versão mais recente

### Prioridade 2 (Esta semana):
- [ ] Implementar sanitização de entradas
- [ ] Adicionar variáveis de ambiente
- [ ] Remover logs de debug em produção
- [ ] Validar estrutura de respostas da API
- [ ] Mensagens de erro genéricas

### Prioridade 3 (Próximas semanas):
- [ ] Criar utilitários compartilhados
- [ ] Refatorar componentes grandes
- [ ] Adicionar testes unitários
- [ ] Melhorar validações
- [ ] Documentar código

---

## 🧪 Como Testar as Correções

### Teste 1: Token em sessionStorage
```javascript
// No console do navegador:
// 1. Fazer login
// 2. Verificar storage:
console.log('localStorage:', localStorage.getItem('token')); // Deve ser null
console.log('sessionStorage:', sessionStorage.getItem('token')); // Deve ter token

// 3. Fechar aba e reabrir
// 4. Verificar se foi deslogado automaticamente ✅
```

### Teste 2: Timeout
```javascript
// Simular requisição lenta no backend (> 30s)
// Deve receber erro de timeout
```

### Teste 3: Formatação de Data
```javascript
import { formatDate } from '@/utils/dateUtils';

// Testar diferentes formatos
console.log(formatDate('2024-12-25')); // Deve ser 25/12/2024
console.log(formatDate('2024-01-01')); // Deve ser 01/01/2024
console.log(formatDate(null)); // Deve ser 'N/A'
```

---

## 📦 Comandos para Executar

```bash
# 1. Atualizar dependências
cd meu-projeto-vue
npm update axios vue-chartjs vuetify

# 2. Instalar novas dependências (se necessário)
npm install

# 3. Criar arquivos de ambiente
cp .env.example .env

# 4. Rodar em modo dev
npm run dev

# 5. Build para produção
npm run build

# 6. Preview do build
npm run preview
```

---

**Última Atualização:** 04/11/2025
**Status:** Pronto para Implementação
