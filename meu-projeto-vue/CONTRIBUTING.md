# 🤝 Guia de Contribuição

Obrigado por considerar contribuir para o Sistema de Gestão de Clientes! Este documento fornece diretrizes e boas práticas para contribuir com o projeto.

## 📑 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Fluxo de Trabalho](#fluxo-de-trabalho)
- [Padrões de Código](#padrões-de-código)
- [Padrões de Commit](#padrões-de-commit)
- [Testes](#testes)
- [Pull Requests](#pull-requests)
- [Revisão de Código](#revisão-de-código)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Melhorias](#sugerindo-melhorias)

---

## 📜 Código de Conduta

### Nosso Compromisso

Estamos comprometidos em proporcionar uma experiência acolhedora e respeitosa para todos, independentemente de:

- Idade, raça, etnia, nacionalidade
- Identidade e expressão de gênero
- Orientação sexual
- Deficiência ou aparência física
- Nível de experiência ou educação
- Status socioeconômico
- Religião (ou falta dela)

### Comportamento Esperado

✅ **Faça**:
- Use linguagem acolhedora e inclusiva
- Respeite pontos de vista e experiências diferentes
- Aceite críticas construtivas com graça
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros

❌ **Não Faça**:
- Use linguagem ou imagens sexualizadas
- Faça comentários insultuosos ou depreciativos (trolling)
- Realize ataques pessoais ou políticos
- Assédio público ou privado
- Publique informações privadas de outros sem permissão

### Aplicação

Comportamentos inaceitáveis podem ser reportados para [seu-email@exemplo.com]. Todas as reclamações serão revisadas e investigadas, resultando em resposta apropriada.

---

## 🚀 Como Contribuir

Existem várias formas de contribuir:

### 1. Reportar Bugs
Encontrou um bug? [Abra uma issue](#reportando-bugs) descrevendo o problema.

### 2. Sugerir Melhorias
Tem uma ideia para melhorar o projeto? [Crie uma issue](#sugerindo-melhorias) com sua sugestão.

### 3. Escrever Código
Quer implementar uma feature ou corrigir um bug? Siga o [fluxo de trabalho](#fluxo-de-trabalho).

### 4. Melhorar Documentação
Documentação clara é essencial. Correções e melhorias são sempre bem-vindas.

### 5. Revisar Pull Requests
Ajude revisando código de outros contribuidores.

---

## 🛠️ Configuração do Ambiente

### Pré-requisitos

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Git**: >= 2.0.0

### Instalação

```bash
# 1. Fork o repositório no GitHub
# Clique em "Fork" na página do repositório

# 2. Clone seu fork
git clone https://github.com/SEU-USUARIO/clientesvue.git
cd clientesvue/meu-projeto-vue

# 3. Adicione o repositório original como upstream
git remote add upstream https://github.com/USUARIO-ORIGINAL/clientesvue.git

# 4. Instale as dependências
npm install

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

### Verificação

```bash
# Execute os testes
npm test

# Execute o linting
npm run lint

# Faça um build de teste
npm run build
```

Se tudo passar sem erros, você está pronto para contribuir! 🎉

---

## 🔄 Fluxo de Trabalho

### 1. Sincronize com o Repositório Original

Sempre comece sincronizando com a branch principal:

```bash
# Busque as últimas mudanças
git fetch upstream

# Vá para a branch main
git checkout main

# Merge com upstream
git merge upstream/main

# Atualize seu fork no GitHub
git push origin main
```

### 2. Crie uma Branch para sua Feature

```bash
# Crie e mude para a nova branch
git checkout -b feature/nome-da-feature

# Ou para correção de bug
git checkout -b fix/descricao-do-bug
```

**Nomenclatura de Branches**:
- `feature/nome-da-feature`: Nova funcionalidade
- `fix/descricao-do-bug`: Correção de bug
- `docs/descricao`: Documentação
- `refactor/descricao`: Refatoração
- `test/descricao`: Adição/correção de testes
- `chore/descricao`: Tarefas gerais (config, build, etc)

### 3. Faça suas Mudanças

```bash
# Edite os arquivos necessários
# Siga os padrões de código (veja seção abaixo)

# Teste suas mudanças
npm test
npm run dev

# Verifique o linting
npm run lint
```

### 4. Commit suas Mudanças

```bash
# Adicione os arquivos modificados
git add .

# Faça commit seguindo Conventional Commits
git commit -m "feat: adiciona validação de email no formulário de cadastro"
```

Ver [Padrões de Commit](#padrões-de-commit) para mais detalhes.

### 5. Push para seu Fork

```bash
# Envie para seu fork no GitHub
git push origin feature/nome-da-feature
```

### 6. Abra um Pull Request

1. Vá para o repositório original no GitHub
2. Clique em "Pull Requests" → "New Pull Request"
3. Clique em "compare across forks"
4. Selecione sua branch
5. Preencha o template de PR (veja seção [Pull Requests](#pull-requests))
6. Clique em "Create Pull Request"

---

## 📝 Padrões de Código

### Vue 3 / JavaScript

#### Nomenclatura

```javascript
// ✅ Componentes: PascalCase
ClientCard.vue
RegisterClientForm.vue

// ✅ Composables: camelCase com prefixo 'use'
useClientData.js
useAuth.js

// ✅ Stores: camelCase com sufixo 'Store'
clientStore.js
notificationStore.js

// ✅ Utils: camelCase
validators.js
formatters.js

// ✅ Variáveis e funções: camelCase
const clientData = ref({})
const fetchClientData = async () => {}

// ✅ Constantes: UPPER_SNAKE_CASE
const MAX_CLIENTS = 1000
const API_BASE_URL = 'https://api.example.com'
```

#### Estrutura de Componente

```vue
<template>
  <!-- 1. Template HTML limpo e semântico -->
  <div class="client-card">
    <h2>{{ client.name }}</h2>
  </div>
</template>

<script setup>
// 2. Imports (ordem: Vue → bibliotecas → local)
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClientStore } from '@/stores/clientStore'

// 3. Props com tipos e validação
const props = defineProps({
  clientId: {
    type: Number,
    required: true,
    validator: (value) => value > 0
  },
  isEditable: {
    type: Boolean,
    default: false
  }
})

// 4. Emits documentados
const emit = defineEmits(['update', 'delete'])

// 5. Composables e stores
const router = useRouter()
const clientStore = useClientStore()

// 6. Estado reativo
const isLoading = ref(false)
const formData = reactive({
  name: '',
  email: ''
})

// 7. Computed properties
const fullName = computed(() => {
  return `${formData.name} ${formData.surname}`
})

// 8. Watchers (se necessário)
watch(() => props.clientId, (newId) => {
  fetchClient(newId)
})

// 9. Methods
const fetchClient = async (id) => {
  isLoading.value = true
  try {
    // Lógica
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    isLoading.value = false
  }
}

// 10. Lifecycle hooks
onMounted(() => {
  fetchClient(props.clientId)
})
</script>

<style scoped>
/* 11. Estilos escopados */
.client-card {
  padding: 1rem;
  border-radius: 4px;
}
</style>
```

#### Boas Práticas Vue

```vue
<!-- ✅ Use v-bind shorthand -->
<img :src="imageUrl" :alt="imageAlt">

<!-- ❌ Evite -->
<img v-bind:src="imageUrl" v-bind:alt="imageAlt">

<!-- ✅ Use v-on shorthand -->
<button @click="handleClick">Clique</button>

<!-- ❌ Evite -->
<button v-on:click="handleClick">Clique</button>

<!-- ✅ Sempre use :key em v-for -->
<div v-for="client in clients" :key="client.id">

<!-- ❌ Nunca use index como key se a lista pode mudar -->
<div v-for="(client, index) in clients" :key="index">

<!-- ✅ Use computed para valores derivados -->
const filteredClients = computed(() => {
  return clients.value.filter(c => c.active)
})

<!-- ❌ Evite cálculos no template -->
<div>{{ clients.filter(c => c.active).length }}</div>
```

#### ESLint

O projeto usa ESLint para garantir qualidade. Execute antes de commitar:

```bash
# Verificar código
npm run lint

# Corrigir automaticamente
npm run lint:fix
```

---

## 📋 Padrões de Commit

Seguimos [Conventional Commits](https://www.conventionalcommits.org/) para mensagens de commit consistentes.

### Formato

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé(s) opcional(is)]
```

### Tipos

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `feat` | Nova funcionalidade | `feat: adiciona validação de CPF` |
| `fix` | Correção de bug | `fix: corrige cálculo de receita total` |
| `docs` | Documentação | `docs: atualiza README com instruções` |
| `style` | Formatação (não afeta código) | `style: formata código com prettier` |
| `refactor` | Refatoração | `refactor: simplifica lógica do clientStore` |
| `test` | Testes | `test: adiciona testes para validators` |
| `chore` | Tarefas gerais | `chore: atualiza dependências` |
| `perf` | Performance | `perf: otimiza renderização de lista` |
| `ci` | Integração contínua | `ci: adiciona GitHub Actions` |
| `build` | Build/bundling | `build: configura tree-shaking` |
| `revert` | Reverter commit | `revert: reverte commit abc123` |

### Exemplos

#### ✅ Bons Commits

```bash
# Feature simples
git commit -m "feat: adiciona botão de exportar clientes"

# Feature com escopo
git commit -m "feat(forms): adiciona validação de WhatsApp"

# Fix com descrição detalhada
git commit -m "fix(clientStore): corrige erro ao deletar último cliente

O método deleteClient não verificava se era o último item,
causando erro ao tentar atualizar o estado."

# Breaking change
git commit -m "feat: migra para Vue 3 Composition API

BREAKING CHANGE: Todos os componentes agora usam <script setup>.
Plugins antigos precisam ser atualizados."

# Múltiplos footers
git commit -m "fix: corrige bug de validação

Closes #123
Reviewed-by: João Silva"
```

#### ❌ Commits Ruins

```bash
# ❌ Vago
git commit -m "fix bug"

# ❌ Sem tipo
git commit -m "adiciona nova feature"

# ❌ Muito longo (> 72 chars no título)
git commit -m "feat: adiciona validação super complexa que valida todos os campos do formulário com regras customizadas"

# ❌ Múltiplas mudanças não relacionadas
git commit -m "feat: adiciona validação, corrige bug da tabela e atualiza README"
```

### Dicas

- **Título**: Máximo 72 caracteres
- **Corpo**: Quebra de linha em 72 caracteres
- **Imperativo**: Use "adiciona" não "adicionado" ou "adicionando"
- **Presente**: "corrige" não "corrigiu"
- **Um commit = uma mudança**: Não misture features e fixes

---

## 🧪 Testes

### Obrigatório

**Todos os PRs devem incluir testes.** Código sem testes não será aceito (exceto documentação).

### Tipos de Testes

#### 1. Testes Unitários (Vitest)

```javascript
// src/test/utils/validators.spec.js
import { describe, it, expect } from 'vitest'
import { isValidCPF } from '@/utils/validators'

describe('validators - isValidCPF', () => {
  it('should validate correct CPF', () => {
    expect(isValidCPF('12345678900')).toBe(true)
  })

  it('should reject invalid CPF', () => {
    expect(isValidCPF('00000000000')).toBe(false)
  })

  it('should reject CPF with letters', () => {
    expect(isValidCPF('123abc78900')).toBe(false)
  })
})
```

#### 2. Testes de Store (Pinia)

```javascript
// src/test/stores/clientStore.spec.js
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useClientStore } from '@/stores/clientStore'

describe('clientStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('should add client', () => {
    const store = useClientStore()
    const client = {
      name: 'João Silva',
      cpf: '12345678900',
      status: 'ativo'
    }

    store.addClient(client)

    expect(store.clients).toHaveLength(1)
    expect(store.clients[0].name).toBe('João Silva')
  })

  it('should persist to localStorage', () => {
    const store = useClientStore()
    const client = { name: 'João Silva', cpf: '12345678900' }

    store.addClient(client)

    const saved = JSON.parse(localStorage.getItem('clients_data'))
    expect(saved).toHaveLength(1)
    expect(saved[0].name).toBe('João Silva')
  })
})
```

### Executando Testes

```bash
# Todos os testes
npm test

# Testes específicos
npm test validators.spec.js

# Modo watch (desenvolvimento)
npm run test:watch

# Coverage
npm run test:coverage
```

### Cobertura Mínima

- **Stores**: 90% de cobertura
- **Utils (validators, formatters)**: 95% de cobertura
- **Componentes críticos**: 80% de cobertura

### Diretrizes

1. **Teste comportamento, não implementação**
   ```javascript
   // ✅ Bom: testa o resultado
   expect(store.clients).toHaveLength(1)

   // ❌ Ruim: testa implementação interna
   expect(store._internalCache).toBeDefined()
   ```

2. **Um conceito por teste**
   ```javascript
   // ✅ Bom: testes separados
   it('should add client', () => { ... })
   it('should update client', () => { ... })

   // ❌ Ruim: múltiplos conceitos
   it('should add and update client', () => { ... })
   ```

3. **Use describe para agrupar**
   ```javascript
   describe('clientStore', () => {
     describe('addClient', () => {
       it('should add client', () => { ... })
       it('should generate unique ID', () => { ... })
     })

     describe('deleteClient', () => {
       it('should remove client', () => { ... })
       it('should update localStorage', () => { ... })
     })
   })
   ```

4. **Mock externos (localStorage, fetch, etc)**
   ```javascript
   import { vi } from 'vitest'

   beforeEach(() => {
     localStorage.clear()
     vi.clearAllMocks()
   })
   ```

---

## 🔍 Pull Requests

### Template de PR

Ao abrir um PR, use este template:

```markdown
## 📋 Descrição

Breve descrição das mudanças realizadas.

## 🔗 Issue Relacionada

Closes #123

## 🧪 Tipo de Mudança

- [ ] 🐛 Bug fix (mudança que corrige um problema)
- [ ] ✨ Nova feature (mudança que adiciona funcionalidade)
- [ ] 💥 Breaking change (fix ou feature que quebra compatibilidade)
- [ ] 📝 Documentação
- [ ] ♻️ Refatoração
- [ ] 🧪 Testes

## ✅ Checklist

- [ ] Meu código segue os padrões do projeto
- [ ] Realizei self-review do código
- [ ] Comentei código em áreas complexas
- [ ] Atualizei a documentação
- [ ] Minhas mudanças não geram novos warnings
- [ ] Adicionei testes que provam que meu fix/feature funciona
- [ ] Testes unitários passam localmente (`npm test`)
- [ ] Build passa sem erros (`npm run build`)
- [ ] Linting passa sem erros (`npm run lint`)

## 📸 Screenshots (se aplicável)

[Adicione screenshots aqui]

## 🧪 Como Testar

1. Checkout da branch: `git checkout feature/minha-feature`
2. Instale dependências: `npm install`
3. Execute testes: `npm test`
4. Inicie dev server: `npm run dev`
5. Teste manualmente: [passos específicos]

## 📝 Notas Adicionais

Qualquer contexto adicional sobre o PR.
```

### Diretrizes para PRs

#### ✅ Faça

- **Mantenha PRs pequenos**: Ideal < 400 linhas
- **Um PR = um propósito**: Não misture features e fixes
- **Descreva claramente**: O que, por que, como
- **Adicione screenshots**: Para mudanças de UI
- **Referencie issues**: Use "Closes #123" ou "Fixes #456"
- **Mantenha atualizado**: Rebase com main se necessário
- **Responda feedback**: Seja receptivo a sugestões

#### ❌ Não Faça

- **PRs gigantes**: > 1000 linhas são difíceis de revisar
- **Commits desnecessários**: "fix", "fix2", "fix3"
- **Código comentado**: Remova código não usado
- **console.log**: Remova logs de debug
- **Código não testado**: Sempre adicione testes
- **Quebrar build**: Verifique antes de abrir PR

---

## 👀 Revisão de Código

### Como Revisor

#### Foque em:

1. **Correção**: O código faz o que deveria?
2. **Legibilidade**: É fácil de entender?
3. **Manutenibilidade**: Será fácil modificar no futuro?
4. **Performance**: Há gargalos óbvios?
5. **Segurança**: Há vulnerabilidades?
6. **Testes**: Cobertura adequada?

#### Seja Construtivo

```markdown
✅ "Considere usar computed property aqui para melhor performance:
`const filteredClients = computed(() => ...)`"

❌ "Esse código está horrível."
```

### Como Autor (Recebendo Feedback)

- **Não leve para o pessoal**: Críticas são sobre o código, não sobre você
- **Pergunte se não entender**: "Pode elaborar sobre X?"
- **Agradeça**: Revisores gastam tempo ajudando você
- **Explique decisões**: Se houver razão específica para algo

---

## 🐛 Reportando Bugs

### Template de Issue (Bug)

```markdown
## 🐛 Descrição do Bug

Descrição clara e concisa do bug.

## 🔄 Passos para Reproduzir

1. Vá para '...'
2. Clique em '...'
3. Scroll até '...'
4. Veja o erro

## ✅ Comportamento Esperado

O que deveria acontecer.

## ❌ Comportamento Atual

O que está acontecendo.

## 📸 Screenshots

Se aplicável, adicione screenshots.

## 🌍 Ambiente

- OS: [e.g. Windows 10, macOS 13, Ubuntu 22.04]
- Browser: [e.g. Chrome 120, Firefox 121]
- Node.js: [e.g. 18.19.0]
- npm: [e.g. 9.2.0]

## 📝 Informações Adicionais

Qualquer contexto adicional sobre o problema.

## 🔍 Logs de Erro

```
Cole logs de erro aqui
```
```

---

## 💡 Sugerindo Melhorias

### Template de Issue (Feature Request)

```markdown
## 💡 Descrição da Feature

Descrição clara do que você gostaria de ver implementado.

## 🎯 Problema que Resolve

Qual problema essa feature resolve? Por que é útil?

## 💭 Solução Proposta

Como você imagina que isso funcionaria?

## 🔄 Alternativas Consideradas

Você pensou em outras abordagens?

## 📸 Mockups/Wireframes

Se aplicável, adicione designs ou wireframes.

## 📝 Contexto Adicional

Qualquer informação adicional relevante.
```

---

## 🎨 Estilo de Código

### Prettier

O projeto usa Prettier para formatação automática:

```bash
# Formatar todos os arquivos
npm run format

# Verificar formatação
npm run format:check
```

### Configuração (.prettierrc)

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100
}
```

---

## 📚 Recursos

- [Documentação Vue 3](https://vuejs.org/)
- [Documentação Vuetify 3](https://vuetifyjs.com/)
- [Documentação Pinia](https://pinia.vuejs.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

---

## ❓ Dúvidas?

Se tiver dúvidas sobre como contribuir:

- 📧 Email: seu-email@exemplo.com
- 💬 [GitHub Discussions](https://github.com/seu-usuario/clientesvue/discussions)
- 🐛 [GitHub Issues](https://github.com/seu-usuario/clientesvue/issues)

---

**Obrigado por contribuir! 🎉**
