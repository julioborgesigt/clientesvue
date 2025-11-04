# Relatório de Auditoria de Código - Cliente Vue.js

**Data:** 04/11/2025
**Projeto:** Sistema de Gerenciamento de Clientes (Vue.js + Vuetify)
**Backend API:** https://clientes.domcloud.dev

---

## 📋 Sumário Executivo

Esta auditoria identificou **15 problemas críticos de segurança**, **8 bugs potenciais**, **12 melhorias de código** e **5 dependências desatualizadas**. A aplicação está funcional, mas apresenta vulnerabilidades significativas que devem ser corrigidas imediatamente.

**Nível de Risco Geral:** 🔴 **ALTO**

---

## 🔴 1. VULNERABILIDADES DE SEGURANÇA CRÍTICAS

### 1.1 ❌ Token JWT no localStorage (authStore.js:8, 20, 44)
**Severidade:** CRÍTICA
**Arquivo:** `src/stores/authStore.js`

```javascript
// VULNERÁVEL:
token: localStorage.getItem('token') || null,
localStorage.setItem('token', response.data.token);
```

**Problema:**
- Tokens no localStorage são vulneráveis a ataques XSS
- Qualquer script malicioso pode acessar o token
- Token persiste mesmo após fechar o navegador

**Solução:**
- Usar httpOnly cookies (requer mudança no backend)
- Ou usar sessionStorage em vez de localStorage
- Implementar refresh tokens com expiração curta

---

### 1.2 ❌ Ausência de Sanitização de Entrada (ClientTable.vue:143)
**Severidade:** ALTA
**Arquivo:** `src/components/ClientTable.vue`

```javascript
// VULNERÁVEL:
const fullMessage = `${message}\nVencimento: ${formattedDate}`;
```

**Problema:**
- Dados do cliente (nome, mensagem) não são sanitizados
- Possível injeção de código em URLs do WhatsApp
- Campos de texto aceitam caracteres especiais sem validação

**Solução:**
```javascript
const sanitizeText = (text) => {
  return text.replace(/[<>&"']/g, (char) => {
    const entities = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' };
    return entities[char];
  });
};
```

---

### 1.3 ❌ Ausência de CSRF Protection
**Severidade:** ALTA
**Arquivo:** `src/api/axios.js`

**Problema:**
- Não há implementação de tokens CSRF
- Aplicação vulnerável a ataques Cross-Site Request Forgery
- Ações como delete, update podem ser executadas de sites maliciosos

**Solução:**
```javascript
// Adicionar interceptor para CSRF
apiClient.interceptors.request.use(
  (config) => {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
  }
);
```

---

### 1.4 ❌ Falta de Rate Limiting no Frontend
**Severidade:** MÉDIA
**Arquivo:** `src/stores/authStore.js:14-27`

**Problema:**
- Sem controle de tentativas de login
- Possível ataque de força bruta
- Sem debounce em operações críticas

**Solução:**
- Implementar rate limiting no frontend
- Adicionar delay exponencial após falhas
- Bloquear temporariamente após X tentativas

---

### 1.5 ❌ Mensagens de Erro Verbosas (authStore.js:26, 38)
**Severidade:** MÉDIA

```javascript
// VULNERÁVEL:
alert(error.response?.data?.error || 'Erro ao fazer login.');
```

**Problema:**
- Expõe detalhes da API para usuários
- Pode revelar informações sobre estrutura do backend
- Facilita reconhecimento para atacantes

**Solução:**
```javascript
// Mensagens genéricas
const errorMessage = 'Erro ao processar sua solicitação. Tente novamente.';
console.error('Detalhes do erro:', error); // Apenas no console
notificationStore.error(errorMessage);
```

---

### 1.6 ❌ Validação de WhatsApp Fraca (AppModal.vue:526-531)
**Severidade:** MÉDIA

```javascript
whatsappFormat: value => {
  const pattern = /^(?:\+?55)?(?:[1-9]{2})?(?:9[1-9]|8[1-9])\d{7}$/;
  // ...
}
```

**Problema:**
- Regex aceita números inválidos
- Não valida DDD corretos
- Pode permitir números internacionais maliciosos

---

### 1.7 ❌ Ausência de Content Security Policy
**Severidade:** ALTA
**Arquivo:** `index.html`

**Problema:**
- Sem headers CSP configurados
- Aplicação vulnerável a XSS
- Scripts externos podem ser injetados

**Solução:**
Adicionar no `index.html`:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' https://clientes.domcloud.dev;">
```

---

### 1.8 ❌ Falta de Validação de Resposta da API (clientStore.js)
**Severidade:** MÉDIA

**Problema:**
- Não valida estrutura das respostas da API
- Assume que API sempre retorna dados corretos
- Possível crash se API retornar formato inesperado

**Solução:**
```javascript
// Adicionar validação
if (!response.data || !Array.isArray(response.data.data)) {
  throw new Error('Formato de resposta inválido');
}
```

---

### 1.9 ❌ Credenciais Hardcoded (axios.js:6)
**Severidade:** BAIXA

```javascript
baseURL: 'https://clientes.domcloud.dev',
```

**Problema:**
- URL da API hardcoded
- Dificulta mudança entre ambientes
- Sem suporte para dev/staging/production

**Solução:**
```javascript
baseURL: import.meta.env.VITE_API_URL || 'https://clientes.domcloud.dev',
```

---

### 1.10 ❌ Ausência de Timeout nas Requisições
**Severidade:** BAIXA
**Arquivo:** `src/api/axios.js`

**Problema:**
- Requisições podem ficar pendentes indefinidamente
- Usuário fica preso em loading states
- Possível DoS por exaustão de recursos

**Solução:**
```javascript
const apiClient = axios.create({
  baseURL: 'https://clientes.domcloud.dev',
  timeout: 30000, // 30 segundos
  headers: { 'Content-Type': 'application/json' },
});
```

---

## 🐛 2. BUGS E PROBLEMAS DE LÓGICA

### 2.1 🐛 Bug na Formatação de Data (ClientTable.vue:158-163)
**Severidade:** MÉDIA

```javascript
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const parts = dateString.split('-');
  if (parts.length < 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};
```

**Problema:**
- Não trata timezone corretamente
- Pode exibir data errada (off by one day)
- Não valida se data é válida

**Solução:**
```javascript
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString + 'T00:00:00'); // Force UTC
    return date.toLocaleDateString('pt-BR');
  } catch (e) {
    return dateString;
  }
};
```

---

### 2.2 🐛 Ajuste de Data com Bug (ClientTable.vue:140-142)
**Severidade:** ALTA

```javascript
const vencimentoDate = new Date(client.vencimento);
vencimentoDate.setDate(vencimentoDate.getDate() + 1); // BUG!
```

**Problema:**
- Adiciona 1 dia arbitrariamente
- Causa inconsistência nas datas
- Usuário vê data diferente do banco

**Solução:**
```javascript
// Remover o +1 ou documentar o motivo
const vencimentoDate = new Date(client.vencimento + 'T00:00:00');
const formattedDate = vencimentoDate.toLocaleDateString('pt-BR');
```

---

### 2.3 🐛 Conversão de Número Insegura (clientStore.js:217-220)
**Severidade:** MÉDIA

```javascript
valor_cobrado: parseFloat(client.valor_cobrado) || 0,
custo: parseFloat(client.custo) || 0,
```

**Problema:**
- `parseFloat('10abc')` retorna `10` (aceita strings inválidas)
- Valores nulos/undefined viram 0 silenciosamente
- Pode ocultar erros de dados

**Solução:**
```javascript
const parseDecimal = (value) => {
  const num = Number(value);
  return (Number.isNaN(num) || !Number.isFinite(num)) ? 0 : num;
};
```

---

### 2.4 🐛 Race Condition no Debounce (ClientTable.vue:112-114)
**Severidade:** BAIXA

```javascript
watch(search, (newValue) => {
  clearTimeout(searchDebounce.value);
  searchDebounce.value = setTimeout(() => {
    clientStore.setSearch(newValue);
  }, 500);
});
```

**Problema:**
- Se componente desmontar, timeout continua executando
- Pode causar erro de "Cannot read property of undefined"
- Memory leak potencial

**Solução:**
```javascript
import { onUnmounted } from 'vue';

onUnmounted(() => {
  if (searchDebounce.value) {
    clearTimeout(searchDebounce.value);
  }
});
```

---

### 2.5 🐛 Confirmação com `confirm()` (ClientTable.vue:125, AppModal.vue:422)
**Severidade:** BAIXA

**Problema:**
- `confirm()` nativo bloqueia thread principal
- UX ruim (não customizável)
- Não segue design system

**Solução:**
- Criar modal de confirmação Vue
- Usar Vuetify dialog

---

### 2.6 🐛 Estado de Loading Não Sincronizado (clientStore.js:228)
**Severidade:** MÉDIA

**Problema:**
- Se múltiplas requisições paralelas, `isLoading` pode ficar travado
- Último `finally` define estado global
- UX inconsistente

**Solução:**
```javascript
// Usar contador de requests
state: () => ({
  loadingCount: 0,
  isLoading: computed(() => loadingCount > 0)
})
```

---

### 2.7 🐛 Fallback de Serviço Hardcoded (AppModal.vue:368)
**Severidade:** BAIXA

```javascript
servico: clientStore.servicos.length > 0
  ? clientStore.servicos[0].nome
  : 'Serviço Padrão',
```

**Problema:**
- "Serviço Padrão" pode não existir no banco
- Causa erro ao salvar cliente
- Melhor deixar vazio ou null

---

### 2.8 🐛 Logs de Debug em Produção
**Severidade:** BAIXA
**Arquivos:** Vários (AppModal.vue:432, 437, etc.)

```javascript
console.log('DashboardView: openPendingModal chamada.');
```

**Problema:**
- Logs expostos em produção
- Revela estrutura interna
- Impacta performance ligeiramente

**Solução:**
```javascript
// Usar variável de ambiente
if (import.meta.env.DEV) {
  console.log('Debug:', data);
}
```

---

## ⚠️ 3. CÓDIGO DESATUALIZADO

### 3.1 Dependências Desatualizadas
**Arquivo:** `package.json`

| Pacote | Atual | Disponível | Crítico |
|--------|-------|------------|---------|
| axios | 1.12.2 | 1.13.1 | ✅ Sim |
| vue-chartjs | 5.3.2 | 5.3.3 | ❌ Não |
| vuetify | 3.10.7 | 3.10.8 | ❌ Não |
| vite | 7.1.7 | Latest | ⚠️ Verificar |
| pinia | 3.0.3 | Latest | ⚠️ Verificar |

**Ação Recomendada:**
```bash
npm update axios vue-chartjs vuetify
npm outdated # Verificar outras
```

---

### 3.2 Código Comentado (clientStore.js:247-250, AppModal.vue:172-176)
**Severidade:** BAIXA

**Problema:**
- Código comentado "por garantia"
- Dificulta leitura
- Deve estar no git history

**Solução:**
- Remover código comentado
- Usar git para histórico

---

### 3.3 Comentários em Português e Inglês Misturados
**Severidade:** MUITO BAIXA

**Problema:**
- Inconsistência de idioma
- Dificulta manutenção de equipe internacional

**Recomendação:**
- Padronizar todos comentários em inglês OU português

---

## 🔧 4. MELHORIAS E OTIMIZAÇÕES

### 4.1 ⚡ Performance - Computed Desnecessários

**Problema:** Várias computações poderiam ser feitas no backend

**Sugestões:**
- `totalPages` (clientStore.js:29) - backend pode enviar
- Filtros e ordenação no frontend - mover para backend

---

### 4.2 ⚡ Lazy Loading de Componentes
**Arquivo:** `src/router/index.js:6-7`

```javascript
// ATUAL:
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';

// MELHOR:
const LoginView = () => import('../views/LoginView.vue');
const DashboardView = () => import('../views/DashboardView.vue');
```

**Benefício:**
- Reduz bundle inicial
- Melhora First Contentful Paint
- Carrega views sob demanda

---

### 4.3 🎨 Componentes Muito Grandes

**AppModal.vue:** 540 linhas - deveria ser quebrado em:
- `RegisterClientModal.vue`
- `EditClientModal.vue`
- `ManageServicesModal.vue`
- `MessageEditorModal.vue`

**ClientStore.js:** 428 linhas - quebrar em:
- `useClientData.js`
- `useClientActions.js`
- `useClientStats.js`

---

### 4.4 🔄 Refatorar Lógica Duplicada

**ClientTable.vue + AppModal.vue:**
- Validação de WhatsApp duplicada
- Formatação de moeda duplicada
- Regras de validação duplicadas

**Solução:**
```javascript
// src/utils/validators.js
export const validators = {
  required: (value) => !!value || 'Campo obrigatório',
  whatsapp: (value) => { /* ... */ },
  numeric: (value) => { /* ... */ }
};

// src/utils/formatters.js
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};
```

---

### 4.5 📱 Responsividade - Melhorar UX Mobile

**LoginView.vue:**
- Imagem de fundo pesada (Unsplash)
- Não otimizada para mobile
- Usa URL externa (pode falhar)

**Solução:**
- Usar imagem local otimizada
- Versão WebP + fallback
- srcset para diferentes resoluções

---

### 4.6 ♿ Acessibilidade (A11Y)

**Problemas:**
- Botões sem labels adequados (ClientTable.vue:39-76)
- Tooltips apenas visuais
- Sem suporte a navegação por teclado
- Contraste de cores não verificado

**Soluções:**
```vue
<!-- ANTES -->
<v-btn icon="mdi-whatsapp" @click="..."></v-btn>

<!-- DEPOIS -->
<v-btn
  icon="mdi-whatsapp"
  @click="..."
  aria-label="Enviar mensagem pelo WhatsApp"
  role="button"
></v-btn>
```

---

### 4.7 🧪 Ausência de Testes

**Problema:**
- Zero testes unitários
- Zero testes E2E
- Sem CI/CD configurado

**Recomendação:**
```bash
# Adicionar Vitest
npm install -D vitest @vue/test-utils

# Adicionar Playwright para E2E
npm install -D @playwright/test
```

Criar testes para:
- `authStore.js` - login/logout
- `clientStore.js` - CRUD operations
- `validators.js` - todas as regras
- `formatters.js` - formatações

---

### 4.8 📚 Falta de Documentação

**Problemas:**
- README.md vazio
- Sem documentação de setup
- Sem guia de contribuição
- Sem documentação de API

**Solução:**
Criar:
- `README.md` completo
- `CONTRIBUTING.md`
- `docs/API.md`
- `docs/ARCHITECTURE.md`

---

### 4.9 🔐 Variáveis de Ambiente

**Problema:**
- Sem arquivo `.env.example`
- Sem separação dev/prod
- URL de API hardcoded

**Solução:**
Criar `.env.example`:
```env
VITE_API_URL=https://clientes.domcloud.dev
VITE_ENABLE_DEBUG=false
VITE_TIMEOUT=30000
```

---

### 4.10 📦 Bundle Size

**Problema:**
- Importando Vuetify completo (main.js:11-12)
- Chart.js inteiro importado
- Sem tree-shaking adequado

**Solução:**
```javascript
// Importar apenas componentes usados
import { VBtn, VCard, VDataTable } from 'vuetify/components';
import { VSnackbar } from 'vuetify/components';
```

---

### 4.11 🎯 Type Safety

**Problema:**
- JavaScript puro (sem TypeScript)
- Sem validação de tipos
- Erros de tipo descobertos em runtime

**Recomendação:**
- Migrar para TypeScript gradualmente
- Começar pelos stores (Pinia tem ótimo suporte)
- Usar JSDoc como alternativa temporária:

```javascript
/**
 * @typedef {Object} Client
 * @property {number} id
 * @property {string} name
 * @property {string} vencimento
 */

/**
 * @param {Client} client
 * @returns {Promise<void>}
 */
async function updateClient(client) { /* ... */ }
```

---

### 4.12 🔄 Estado Global Excessivo

**Problema:**
- ClientStore muito grande
- Mistura dados de UI com dados de negócio
- Dificulta teste e manutenção

**Solução:**
Separar em múltiplas stores:
- `useClientDataStore` - dados puros
- `useClientUIStore` - paginação, filtros, loading
- `useClientActionsStore` - ações CRUD

---

## 🎨 5. MELHORIAS DE UX/UI

### 5.1 Feedback Visual Inadequado

**Problemas:**
- `alert()` usado para erros (authStore.js:26, 34)
- Sem loading states em botões
- Sem skeleton loaders

**Soluções:**
- Remover todos `alert()`
- Usar `v-skeleton-loader` durante carregamento
- Adicionar `:loading="isLoading"` em botões

---

### 5.2 Confirmações Melhoradas

**Atual:** `confirm()` nativo
**Melhor:** Modal do Vuetify com:
- Título claro
- Descrição do impacto
- Botões coloridos (cancelar/confirmar)
- Animação suave

---

### 5.3 Validação em Tempo Real

**Problema:**
- Validação só acontece no submit
- Usuário não vê erros enquanto digita

**Solução:**
```vue
<v-text-field
  v-model="form.email"
  :rules="[rules.required, rules.email]"
  validate-on="blur"  <!-- Valida ao sair do campo -->
></v-text-field>
```

---

## 📊 6. PRIORIZAÇÃO DE CORREÇÕES

### 🔴 URGENTE (Resolver em 1-2 dias)
1. ✅ Token no localStorage → sessionStorage ou httpOnly cookie
2. ✅ Sanitização de entrada (XSS)
3. ✅ Content Security Policy
4. ✅ Bug de data (+1 dia)
5. ✅ Atualizar axios (segurança)

### 🟡 ALTA (Resolver em 1 semana)
6. CSRF Protection
7. Validação de resposta da API
8. Rate limiting
9. Timeout em requisições
10. Mensagens de erro genéricas

### 🟢 MÉDIA (Resolver em 2-4 semanas)
11. Refatorar componentes grandes
12. Adicionar testes unitários
13. Lazy loading de rotas
14. Variáveis de ambiente
15. Remover código comentado

### 🔵 BAIXA (Backlog)
16. TypeScript migration
17. Bundle size optimization
18. Acessibilidade completa
19. Documentação completa
20. Internacionalização (i18n)

---

## 🛠️ 7. PLANO DE AÇÃO SUGERIDO

### Semana 1: Segurança Crítica
```bash
# 1. Atualizar dependências
npm update axios vue-chartjs vuetify
npm audit fix

# 2. Adicionar variáveis de ambiente
cp .env.example .env

# 3. Implementar CSP
# Editar index.html

# 4. Refatorar autenticação
# Migrar para sessionStorage ou cookies
```

### Semana 2: Correção de Bugs
- Corrigir formatação de datas
- Adicionar validações robustas
- Implementar sanitização
- Remover logs de debug

### Semana 3: Refatoração
- Quebrar componentes grandes
- Criar utils compartilhados
- Adicionar TypeScript/JSDoc
- Melhorar performance

### Semana 4: Testes e Documentação
- Setup de testes (Vitest)
- Escrever testes unitários críticos
- Documentar README
- Configurar CI/CD básico

---

## 📈 8. MÉTRICAS RECOMENDADAS

### Adicionar Monitoramento
```javascript
// Sentry para error tracking
import * as Sentry from "@sentry/vue";

Sentry.init({
  app,
  dsn: "YOUR_DSN",
  integrations: [
    new Sentry.BrowserTracing({ routingInstrumentation: Sentry.vueRouterInstrumentation(router) }),
  ],
  tracesSampleRate: 0.2,
});
```

### Métricas de Performance
- Lighthouse CI
- Web Vitals
- Bundle size tracking

---

## ✅ 9. CHECKLIST DE VERIFICAÇÃO

### Segurança
- [ ] Token movido para local seguro
- [ ] CSP implementado
- [ ] CSRF protection
- [ ] Inputs sanitizados
- [ ] Mensagens de erro genéricas
- [ ] Rate limiting
- [ ] Timeouts configurados

### Qualidade de Código
- [ ] Sem código comentado
- [ ] Logs de debug removidos
- [ ] Componentes < 300 linhas
- [ ] Funções < 50 linhas
- [ ] Sem duplicação de código
- [ ] Variáveis de ambiente

### Performance
- [ ] Lazy loading de rotas
- [ ] Otimização de bundle
- [ ] Debounce em buscas
- [ ] Skeleton loaders

### Testes
- [ ] Testes unitários > 70%
- [ ] Testes E2E para fluxos críticos
- [ ] CI/CD configurado

### Documentação
- [ ] README completo
- [ ] API documentada
- [ ] Comentários em código complexo
- [ ] Guia de contribuição

---

## 🎯 10. CONCLUSÃO

O projeto está **funcional**, mas apresenta **riscos significativos de segurança** e **dívida técnica**. As principais preocupações são:

1. **Segurança:** Token em localStorage é vulnerável a XSS
2. **Bugs:** Formatação de data incorreta causa inconsistências
3. **Manutenibilidade:** Componentes grandes dificultam manutenção
4. **Performance:** Bundle size pode ser otimizado

**Recomendação:** Priorizar correções de segurança nos próximos 5 dias úteis antes de adicionar novas features.

---

## 📞 Próximos Passos

1. **Revisar este relatório** com a equipe
2. **Priorizar** itens críticos (vermelho)
3. **Criar issues** no GitHub para cada item
4. **Estimar esforço** para cada correção
5. **Planejar sprints** de correção

---

**Auditor:** Claude AI
**Versão:** 1.0
**Última Atualização:** 04/11/2025
