# 🏗️ Arquitetura do Sistema

## Índice

- [Visão Geral](#visão-geral)
- [Arquitetura de Componentes](#arquitetura-de-componentes)
- [Gerenciamento de Estado](#gerenciamento-de-estado)
- [Roteamento](#roteamento)
- [Utilitários](#utilitários)
- [Testes](#testes)
- [Build e Bundling](#build-e-bundling)
- [Fluxo de Dados](#fluxo-de-dados)
- [Padrões e Convenções](#padrões-e-convenções)

---

## Visão Geral

O sistema é construído como uma **Single Page Application (SPA)** usando Vue 3 com Composition API. A arquitetura segue o padrão **Component-Based Architecture** com gerenciamento de estado centralizado via Pinia.

### Stack Tecnológico

```
┌─────────────────────────────────────────┐
│           Camada de Apresentação         │
│         Vue 3 + Vuetify 3 + Router      │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│        Camada de Gerenciamento           │
│           Pinia Stores                   │
│  (clientStore, notificationStore,        │
│   themeStore)                            │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│           Camada de Utilitários          │
│      (validators, formatters)            │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│         Camada de Persistência           │
│          localStorage API                │
└─────────────────────────────────────────┘
```

### Princípios Arquiteturais

1. **Separation of Concerns**: Componentes, lógica de negócio e estado separados
2. **Single Responsibility**: Cada módulo tem uma responsabilidade única
3. **DRY (Don't Repeat Yourself)**: Reutilização de código via composables e utilitários
4. **Component Composition**: Componentes pequenos e reutilizáveis
5. **State Management Centralizado**: Estado global gerenciado por Pinia
6. **Lazy Loading**: Carregamento sob demanda de rotas e componentes

---

## Arquitetura de Componentes

### Hierarquia de Componentes

```
App.vue (Raiz)
│
├── AppBar.vue (Layout)
│   ├── ThemeToggle (UI)
│   └── UserMenu (UI)
│
├── SidebarNav.vue (Layout)
│   └── NavigationItems
│
├── Router View (Dinâmico)
│   │
│   ├── HomePage.vue (View)
│   │   ├── ClientCards.vue (Dashboard)
│   │   └── ClientChart.vue (Dashboard)
│   │
│   ├── ClientsListPage.vue (View)
│   │   └── VDataTableServer (Vuetify)
│   │
│   ├── RegisterClientPage.vue (View)
│   │   └── RegisterClientForm.vue (Form)
│   │
│   ├── EditClientPage.vue (View)
│   │   └── EditClientForm.vue (Form)
│   │
│   └── ClientDetailsPage.vue (View)
│       └── ClientProfile (Inline)
│
└── NotificationSnackbar.vue (UI Global)
```

### Categorias de Componentes

#### 1. **Layout Components** (`src/components/layout/`)

Responsáveis pela estrutura geral da aplicação.

- **AppBar.vue**: Barra superior com logo, navegação e controles de tema
- **SidebarNav.vue**: Menu lateral com navegação principal

**Características**:
- Sempre visíveis (não lazy loaded)
- Gerenciam estado global de UI (drawer aberto/fechado)
- Responsivos (adapta a mobile/desktop)

#### 2. **View Components** (`src/views/`)

Páginas principais da aplicação, carregadas via rotas.

- **HomePage.vue**: Dashboard com métricas e gráficos
- **ClientsListPage.vue**: Lista completa de clientes com tabela
- **RegisterClientPage.vue**: Página de cadastro de novo cliente
- **EditClientPage.vue**: Página de edição de cliente existente
- **ClientDetailsPage.vue**: Visualização detalhada de um cliente

**Características**:
- Lazy loaded (carregadas sob demanda)
- Consomem stores (clientStore, notificationStore)
- Orquestram componentes menores

#### 3. **Form Components** (`src/components/forms/`)

Formulários complexos com validação.

- **RegisterClientForm.vue**: Formulário de cadastro (WCAG AA)
- **EditClientForm.vue**: Formulário de edição (WCAG AA)

**Características**:
- Validação em tempo real com `validators.js`
- Acessibilidade completa (ARIA attributes)
- Emitem eventos ao invés de chamar stores diretamente
- Reutilizáveis

#### 4. **Dashboard Components** (`src/components/dashboard/`)

Componentes de visualização de dados.

- **ClientCards.vue**: Cards com métricas (total, ativos, inativos, receita)
- **ClientChart.vue**: Gráfico de clientes por status (Chart.js)

**Características**:
- Reativos aos dados do clientStore
- Performance otimizada (computed properties)
- Gráficos renderizados com Chart.js

#### 5. **UI Components** (`src/components/ui/`)

Componentes de interface reutilizáveis.

- **ConfirmDialog.vue**: Diálogo de confirmação genérico
- **NotificationSnackbar.vue**: Sistema global de notificações

**Características**:
- Genéricos e reutilizáveis
- Props para customização
- Acessíveis (keyboard navigation, ARIA)

---

## Gerenciamento de Estado

### Pinia Stores

#### **clientStore** (`src/stores/clientStore.js`)

Store principal para gerenciamento de clientes.

**Estado**:
```javascript
{
  clients: [],           // Array de clientes
  selectedClient: null,  // Cliente atualmente selecionado
  filter: '',            // Filtro de busca
  isLoading: false       // Estado de carregamento
}
```

**Getters**:
- `getClientById(id)`: Busca cliente por ID
- `filteredClients`: Clientes filtrados por nome/status
- `activeClients`: Apenas clientes ativos
- `inactiveClients`: Apenas clientes inativos
- `totalRevenue`: Soma de valores de todos os clientes ativos
- `clientsByStatus`: Agrupamento por status (ativo/inativo)

**Actions**:
- `loadClients()`: Carrega clientes do localStorage
- `addClient(client)`: Adiciona novo cliente
- `updateClient(id, data)`: Atualiza cliente existente
- `deleteClient(id)`: Remove cliente
- `setSelectedClient(id)`: Define cliente selecionado
- `setFilter(filter)`: Define filtro de busca

**Persistência**: localStorage (`clients_data`)

#### **notificationStore** (`src/stores/notificationStore.js`)

Store para sistema de notificações.

**Estado**:
```javascript
{
  show: false,        // Visibilidade do snackbar
  message: '',        // Mensagem
  type: 'success',    // Tipo (success, error, warning, info)
  timeout: 3000       // Duração em ms
}
```

**Actions**:
- `success(message, timeout)`: Notificação de sucesso
- `error(message, timeout)`: Notificação de erro
- `warning(message, timeout)`: Notificação de aviso
- `info(message, timeout)`: Notificação informativa
- `clear()`: Limpa notificação

#### **themeStore** (`src/stores/themeStore.js`)

Store para controle de tema.

**Estado**:
```javascript
{
  isDark: true  // Tema escuro ativado
}
```

**Actions**:
- `toggleTheme()`: Alterna entre claro/escuro
- `setTheme(isDark)`: Define tema específico

**Persistência**: localStorage (`theme_preference`)

### Fluxo de Estado

```
┌──────────────┐
│  Componente  │
│   (View)     │
└──────┬───────┘
       │ 1. Action dispatch
       ↓
┌──────────────┐
│  Pinia Store │
│   (State)    │
└──────┬───────┘
       │ 2. Mutation
       │ 3. localStorage sync
       ↓
┌──────────────┐
│ localStorage │
└──────┬───────┘
       │ 4. Reactive update
       ↓
┌──────────────┐
│  Componente  │
│  (Reactivity)│
└──────────────┘
```

---

## Roteamento

### Estrutura de Rotas (`src/router/index.js`)

```javascript
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomePage.vue'),  // Lazy
    meta: { title: 'Dashboard' }
  },
  {
    path: '/clientes',
    name: 'clients-list',
    component: () => import('../views/ClientsListPage.vue'),  // Lazy
    meta: { title: 'Lista de Clientes' }
  },
  {
    path: '/cadastrar',
    name: 'register-client',
    component: () => import('../views/RegisterClientPage.vue'),  // Lazy
    meta: { title: 'Cadastrar Cliente' }
  },
  {
    path: '/editar/:id',
    name: 'edit-client',
    component: () => import('../views/EditClientPage.vue'),  // Lazy
    meta: { title: 'Editar Cliente' },
    props: true  // Passa :id como prop
  },
  {
    path: '/detalhes/:id',
    name: 'client-details',
    component: () => import('../views/ClientDetailsPage.vue'),  // Lazy
    meta: { title: 'Detalhes do Cliente' },
    props: true
  }
]
```

### Lazy Loading

**Benefícios**:
- Redução do bundle inicial (chunks separados)
- Carregamento sob demanda (melhor performance)
- Menor tempo de carregamento inicial

**Implementação**:
```javascript
// ❌ Eager loading (bad)
import HomePage from '../views/HomePage.vue'

// ✅ Lazy loading (good)
component: () => import('../views/HomePage.vue')
```

### Navegação Programática

```javascript
import { useRouter } from 'vue-router'

const router = useRouter()

// Navegar para rota
router.push({ name: 'client-details', params: { id: 123 } })

// Voltar
router.back()

// Substituir (sem adicionar ao history)
router.replace({ name: 'home' })
```

---

## Utilitários

### **validators.js** (`src/utils/validators.js`)

Funções de validação para formulários.

**Validadores**:
- `isRequired(value)`: Campo obrigatório
- `isValidName(name)`: Nome válido (2-100 chars, sem XSS)
- `isValidCPF(cpf)`: CPF válido (algoritmo oficial)
- `isValidEmail(email)`: Email válido (RFC 5322)
- `isValidPhone(phone)`: Telefone válido (formato brasileiro)
- `isValidWhatsApp(whatsapp)`: WhatsApp válido
- `isValidDate(date)`: Data válida (formato YYYY-MM-DD)
- `isValidCurrency(value)`: Valor monetário válido
- `sanitizeInput(input)`: Remove caracteres perigosos (XSS)

**Segurança**:
- Sanitização contra XSS
- Validação contra SQL injection
- Regex para validação de formato

### **formatters.js** (`src/utils/formatters.js`)

Funções de formatação de dados.

**Formatadores**:
- `formatCurrency(value)`: R$ 1.234,56
- `formatDate(date)`: DD/MM/YYYY
- `formatPhone(phone)`: (11) 98765-4321
- `formatCPF(cpf)`: 123.456.789-00
- `formatStatus(status)`: "Ativo" / "Inativo"
- `parseDate(dateString)`: Converte DD/MM/YYYY → YYYY-MM-DD

**Uso**:
```javascript
import { formatCurrency, formatDate } from '@/utils/formatters'

const price = formatCurrency(1234.56)  // "R$ 1.234,56"
const date = formatDate('2024-01-15')  // "15/01/2024"
```

---

## Testes

### Estrutura de Testes

```
src/test/
├── setup.js                    # Configuração global
├── stores/
│   ├── clientStore.spec.js     # 51 testes
│   ├── notificationStore.spec.js  # 27 testes
│   └── themeStore.spec.js      # 9 testes
└── utils/
    ├── validators.spec.js      # 51 testes
    └── formatters.spec.js      # 21 testes
```

### Configuração (setup.js)

```javascript
import { vi } from 'vitest'

// Mock global do console
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
  debug: vi.fn(),
}

// Mock de CSS
vi.mock('*.css', () => ({}))
vi.mock('*.scss', () => ({}))
vi.mock('*.sass', () => ({}))
```

### Exemplo de Teste (Store)

```javascript
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useClientStore } from '@/stores/clientStore'

describe('clientStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should add client', () => {
    const store = useClientStore()
    const client = { name: 'João Silva', cpf: '12345678900' }

    store.addClient(client)

    expect(store.clients).toHaveLength(1)
    expect(store.clients[0].name).toBe('João Silva')
  })
})
```

### Cobertura de Testes

- **Stores**: 87 testes (CRUD, filters, edge cases)
- **Utils**: 72 testes (validação, formatação, segurança)
- **Total**: 159 testes (100% passando)

---

## Build e Bundling

### Configuração Vite (`vite.config.js`)

#### Alias

```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

Permite imports como: `import ClientStore from '@/stores/clientStore'`

#### Build Otimizado

```javascript
build: {
  minify: 'esbuild',  // Minificação rápida
  esbuild: {
    drop: ['console', 'debugger'],  // Remove logs em produção
  },
  rollupOptions: {
    output: {
      manualChunks: {
        'vue-vendor': ['vue', 'pinia'],       // ~30 kB
        'vuetify-vendor': ['vuetify'],        // ~250 kB (tree-shaken)
        'chart-vendor': ['chart.js', 'vue-chartjs'],  // ~50 kB
      },
    },
  },
  chunkSizeWarningLimit: 1000,  // Vuetify é grande
}
```

#### Tree-Shaking Vuetify

Importação seletiva de componentes (redução de ~40%):

```javascript
// ❌ Import completo (bad)
import * as components from 'vuetify/components'

// ✅ Import seletivo (good)
import { VBtn, VCard, VTextField } from 'vuetify/components'
```

### Resultado do Build

```
dist/
├── index.html                   0.46 kB  (gzip: 0.30 kB)
├── assets/
│   ├── index-C40ij7lp.css      17.09 kB  (gzip: 3.78 kB)
│   ├── index-CYN7MQxx.js       91.60 kB  (gzip: 31.26 kB)  ← Main
│   ├── vue-vendor-ABC123.js    ~30 kB    (Vue + Pinia)
│   ├── vuetify-vendor-XYZ.js   ~250 kB   (Vuetify)
│   └── chart-vendor-DEF.js     ~50 kB    (Chart.js)
```

**Total gzipped**: ~315 kB (excelente para uma aplicação completa)

---

## Fluxo de Dados

### Cadastro de Cliente (Exemplo Completo)

```
1. User preenche RegisterClientForm.vue
   ↓
2. Validação em tempo real (validators.js)
   ↓
3. Submit do formulário
   ↓
4. Emit event 'submit' com dados
   ↓
5. RegisterClientPage.vue recebe evento
   ↓
6. Chama clientStore.addClient(data)
   ↓
7. Store adiciona cliente + salva localStorage
   ↓
8. notificationStore.success("Cliente cadastrado!")
   ↓
9. Router redireciona para /clientes
   ↓
10. ClientsListPage.vue renderiza lista atualizada
```

### Edição de Cliente (Exemplo Completo)

```
1. User clica "Editar" em ClientsListPage
   ↓
2. router.push({ name: 'edit-client', params: { id } })
   ↓
3. EditClientPage.vue carrega (lazy)
   ↓
4. onMounted: clientStore.setSelectedClient(id)
   ↓
5. EditClientForm.vue recebe client via props
   ↓
6. User edita campos + submit
   ↓
7. Emit 'submit' com dados atualizados
   ↓
8. EditClientPage chama clientStore.updateClient(id, data)
   ↓
9. Store atualiza + salva localStorage
   ↓
10. notificationStore.success("Cliente atualizado!")
   ↓
11. Router volta para /clientes
```

### Exclusão de Cliente

```
1. User clica "Excluir" em ClientsListPage
   ↓
2. ConfirmDialog.vue exibe confirmação
   ↓
3. User confirma exclusão
   ↓
4. clientStore.deleteClient(id)
   ↓
5. Store remove cliente + salva localStorage
   ↓
6. notificationStore.success("Cliente excluído!")
   ↓
7. Lista atualiza automaticamente (reatividade)
```

---

## Padrões e Convenções

### Nomenclatura

- **Componentes**: PascalCase (`ClientCard.vue`)
- **Stores**: camelCase com sufixo `Store` (`clientStore.js`)
- **Utils**: camelCase (`validators.js`, `formatters.js`)
- **Views**: PascalCase com sufixo `Page` (`HomePage.vue`)
- **Props**: camelCase (`clientData`, `isLoading`)
- **Events**: kebab-case (`@client-updated`, `@form-submit`)

### Estrutura de Componente

```vue
<template>
  <!-- Template HTML -->
</template>

<script setup>
// 1. Imports
import { ref, computed, onMounted } from 'vue'
import { useClientStore } from '@/stores/clientStore'

// 2. Props
const props = defineProps({
  clientId: {
    type: Number,
    required: true
  }
})

// 3. Emits
const emit = defineEmits(['update', 'delete'])

// 4. Stores
const clientStore = useClientStore()

// 5. Reactive state
const isLoading = ref(false)

// 6. Computed properties
const client = computed(() => clientStore.getClientById(props.clientId))

// 7. Methods
const handleUpdate = () => {
  emit('update', props.clientId)
}

// 8. Lifecycle hooks
onMounted(() => {
  // Inicialização
})
</script>

<style scoped>
/* Estilos locais */
</style>
```

### Composition API

**Sempre usar `<script setup>`** para código mais limpo:

```vue
<!-- ✅ Recomendado -->
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<!-- ❌ Evitar -->
<script>
export default {
  setup() {
    const count = ref(0)
    return { count }
  }
}
</script>
```

### Reatividade

```javascript
// Estado reativo
const count = ref(0)
const user = reactive({ name: 'João' })

// Computed (cache automático)
const doubleCount = computed(() => count.value * 2)

// Watcher
watch(count, (newValue, oldValue) => {
  console.log(`Count mudou de ${oldValue} para ${newValue}`)
})

// Watcher profundo
watch(() => user.name, (newName) => {
  console.log(`Nome mudou para ${newName}`)
})
```

### Error Handling

#### Global (main.js)

```javascript
app.config.errorHandler = (err, instance, info) => {
  console.error('[Global Error Handler]', { error: err, component: instance?.$options.name, info })

  // Produção: enviar para Sentry
  if (import.meta.env.PROD) {
    // Sentry.captureException(err)
  }

  // Notificar usuário
  notificationStore.error(err.message || 'Erro inesperado')
}
```

#### Local (try/catch)

```javascript
const handleSubmit = async () => {
  try {
    await clientStore.addClient(formData.value)
    notificationStore.success('Cliente cadastrado!')
    router.push({ name: 'clients-list' })
  } catch (error) {
    console.error('Erro ao cadastrar cliente:', error)
    notificationStore.error('Falha ao cadastrar cliente')
  }
}
```

### Acessibilidade

#### Formulários

```vue
<v-text-field
  label="Nome*"
  v-model="name"
  aria-label="Nome completo do cliente (obrigatório)"
  aria-required="true"
  autocomplete="name"
  :rules="[rules.required, rules.nameValid]"
/>

<!-- Hint para screen readers -->
<span id="name-hint" class="sr-only">
  Digite o nome completo sem números ou caracteres especiais
</span>
```

#### Navegação

```vue
<v-btn @click="handleDelete" aria-label="Excluir cliente">
  <v-icon>mdi-delete</v-icon>
</v-btn>
```

#### Screen-reader only CSS

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## Performance

### Otimizações Aplicadas

1. **Lazy Loading de Rotas**: Redução de bundle inicial
2. **Tree-Shaking Vuetify**: ~40% redução no tamanho
3. **Code Splitting**: Chunks separados (Vue, Vuetify, Chart.js)
4. **Computed Properties**: Cache automático de cálculos
5. **v-show vs v-if**: `v-show` para toggles frequentes
6. **Debounce em Buscas**: Reduz chamadas desnecessárias
7. **LocalStorage**: Persistência sem necessidade de backend

### Boas Práticas

```javascript
// ✅ Use computed para valores derivados
const filteredClients = computed(() => {
  return clients.value.filter(c => c.name.includes(filter.value))
})

// ✅ Use v-show para toggles frequentes
<v-card v-show="isVisible">

// ✅ Use v-if para condicional que muda raramente
<AdminPanel v-if="isAdmin">

// ✅ Use key em v-for
<div v-for="client in clients" :key="client.id">

// ✅ Avoid inline functions in templates
<v-btn @click="handleClick">  <!-- ✅ Good -->
<v-btn @click="() => handleClick()">  <!-- ❌ Bad -->
```

---

## Segurança

### Proteções Implementadas

1. **XSS Protection**: Sanitização de inputs com `sanitizeInput()`
2. **Input Validation**: Validação rigorosa em todos os formulários
3. **CSP Headers**: Content Security Policy (configurar no servidor)
4. **No eval()**: Nunca usar `eval()` ou `Function()` constructor
5. **Escape HTML**: Vue escapa automaticamente (não usar `v-html` sem sanitização)

### Exemplo de Sanitização

```javascript
export const sanitizeInput = (input) => {
  if (!input) return input

  return input
    .replace(/[<>]/g, '')  // Remove < e >
    .replace(/javascript:/gi, '')  // Remove javascript:
    .replace(/on\w+=/gi, '')  // Remove atributos on*
    .trim()
}
```

---

## Conclusão

Esta arquitetura foi projetada para ser:

- **Escalável**: Fácil adicionar novos componentes e features
- **Manutenível**: Código organizado e bem documentado
- **Testável**: 159 testes automatizados
- **Performática**: Bundle otimizado e lazy loading
- **Acessível**: WCAG 2.1 AA compliant
- **Segura**: Validação e sanitização robustas

Para contribuir, leia [CONTRIBUTING.md](CONTRIBUTING.md).
