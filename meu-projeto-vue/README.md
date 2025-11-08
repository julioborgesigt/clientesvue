# 📋 Sistema de Gestão de Clientes

![Vue 3](https://img.shields.io/badge/Vue-3.4-42b883?logo=vue.js)
![Vuetify](https://img.shields.io/badge/Vuetify-3.5-1867C0?logo=vuetify)
![Tests](https://img.shields.io/badge/Tests-159%20passing-success)
![Quality](https://img.shields.io/badge/Quality-8.5%2F10-brightgreen)
![WCAG](https://img.shields.io/badge/WCAG-2.1%20AA-blue)

Sistema moderno de gestão de clientes desenvolvido com Vue 3, Vuetify 3 e Pinia. Oferece interface intuitiva para cadastro, edição, visualização e gerenciamento completo de clientes com dashboard analítico.

## 📑 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Uso](#-uso)
- [Testes](#-testes)
- [Build](#-build)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Qualidade do Código](#-qualidade-do-código)
- [Acessibilidade](#-acessibilidade)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

## 🎯 Sobre o Projeto

Sistema completo de gestão de clientes com foco em usabilidade, performance e acessibilidade. Desenvolvido seguindo as melhores práticas de desenvolvimento front-end, com ênfase em:

- **Segurança**: Validação robusta, sanitização de inputs, proteção XSS
- **Performance**: Lazy loading, tree-shaking, code splitting
- **Acessibilidade**: Conformidade WCAG 2.1 AA
- **Manutenibilidade**: Código modular, testes automatizados, documentação completa
- **UX**: Interface responsiva, feedback visual, temas claro/escuro

## ✨ Funcionalidades

### Gestão de Clientes
- ✅ **Cadastro de Clientes**: Formulário completo com validação em tempo real
- ✅ **Edição de Clientes**: Atualização de dados com preservação de histórico
- ✅ **Visualização Detalhada**: Perfil completo do cliente com todas as informações
- ✅ **Exclusão Segura**: Confirmação em dois passos com aviso visual
- ✅ **Busca Avançada**: Filtro em tempo real por nome, status, plano

### Dashboard Analítico
- 📊 **Métricas em Tempo Real**: Total de clientes, ativos/inativos, receita
- 📈 **Gráficos Interativos**: Visualização de dados com Chart.js
- 🎨 **Cards Informativos**: Resumo visual das principais métricas
- 🔄 **Atualização Automática**: Sincronização em tempo real

### Recursos Adicionais
- 🌓 **Tema Claro/Escuro**: Alternância suave entre temas
- 📱 **Design Responsivo**: Otimizado para mobile, tablet e desktop
- ⚡ **Performance Otimizada**: Bundle otimizado (91.60 kB gzipped)
- ♿ **Acessível**: Compatível com leitores de tela e navegação por teclado
- 🔔 **Notificações**: Sistema de feedback visual para ações do usuário
- 🛡️ **Error Boundary**: Tratamento global de erros

## 🚀 Tecnologias

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Vue 3** | 3.4.21 | Framework JavaScript progressivo |
| **Vuetify 3** | 3.5.10 | Framework de componentes Material Design |
| **Pinia** | 2.1.7 | Gerenciamento de estado |
| **Vue Router** | 4.3.0 | Roteamento SPA |
| **Chart.js** | 4.4.1 | Biblioteca de gráficos |
| **Vite** | 5.2.0 | Build tool e bundler |
| **Vitest** | 1.3.1 | Framework de testes unitários |
| **@vue/test-utils** | 2.4.4 | Utilitários para testes de componentes |

## 📋 Pré-requisitos

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Git**: >= 2.0.0

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/clientesvue.git

# Entre no diretório
cd clientesvue/meu-projeto-vue

# Instale as dependências
npm install
```

## 💻 Uso

### Modo Desenvolvimento

```bash
# Inicia servidor de desenvolvimento em http://localhost:5173
npm run dev
```

### Build para Produção

```bash
# Cria build otimizado
npm run build

# Preview do build de produção
npm run preview
```

### Testes

```bash
# Executa todos os testes
npm test

# Executa testes com coverage
npm run test:coverage

# Executa testes em modo watch
npm run test:watch
```

### Linting

```bash
# Verifica código
npm run lint

# Corrige problemas automaticamente
npm run lint:fix
```

## 🧪 Testes

O projeto possui **159 testes automatizados** (100% passando) organizados em 5 suites:

### Cobertura de Testes

```
✅ clientStore.spec.js - 51 tests
   - CRUD operations (create, read, update, delete)
   - Filters and search
   - State management
   - Error handling

✅ notificationStore.spec.js - 27 tests
   - Notification system
   - Success/error/warning messages
   - Auto-dismiss functionality

✅ themeStore.spec.js - 9 tests
   - Theme switching (light/dark)
   - Persistence
   - Default values

✅ validators.spec.js - 51 tests
   - Input validation (name, CPF, email, phone, WhatsApp, date, currency)
   - Edge cases
   - Security (XSS, injection)

✅ formatters.spec.js - 21 tests
   - Data formatting (currency, date, phone, CPF, status)
   - Edge cases and null handling
```

### Executando Testes

```bash
# Todos os testes
npm test

# Com relatório de cobertura
npm run test:coverage

# Modo watch (desenvolvimento)
npm run test:watch
```

## 📦 Build

### Tamanhos de Bundle (Otimizado)

```
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-C40ij7lp.css   17.09 kB │ gzip:  3.78 kB
dist/assets/index-CYN7MQxx.js    91.60 kB │ gzip: 31.26 kB
```

### Otimizações Aplicadas

- ✅ **Tree-shaking**: Importação seletiva de componentes Vuetify (~40% redução)
- ✅ **Code splitting**: Chunks separados para Vue, Vuetify e Chart.js
- ✅ **Lazy loading**: Carregamento sob demanda de rotas
- ✅ **Minification**: Compressão com esbuild
- ✅ **Console removal**: Remoção de console.log em produção

## 📁 Estrutura do Projeto

```
meu-projeto-vue/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── ClientCards.vue          # Cards de métricas
│   │   │   └── ClientChart.vue          # Gráficos
│   │   ├── forms/
│   │   │   ├── RegisterClientForm.vue   # Formulário de cadastro (WCAG AA)
│   │   │   └── EditClientForm.vue       # Formulário de edição (WCAG AA)
│   │   ├── layout/
│   │   │   ├── AppBar.vue               # Barra superior
│   │   │   └── SidebarNav.vue           # Menu lateral
│   │   └── ui/
│   │       ├── ConfirmDialog.vue        # Diálogo de confirmação
│   │       └── NotificationSnackbar.vue # Notificações
│   ├── stores/
│   │   ├── clientStore.js               # Store de clientes (JSDoc completo)
│   │   ├── notificationStore.js         # Store de notificações (JSDoc completo)
│   │   └── themeStore.js                # Store de tema (JSDoc completo)
│   ├── utils/
│   │   ├── validators.js                # Validações (51 testes)
│   │   └── formatters.js                # Formatadores (21 testes)
│   ├── views/
│   │   ├── HomePage.vue                 # Dashboard principal
│   │   ├── ClientsListPage.vue          # Lista de clientes
│   │   ├── RegisterClientPage.vue       # Página de cadastro
│   │   ├── EditClientPage.vue           # Página de edição
│   │   └── ClientDetailsPage.vue        # Detalhes do cliente
│   ├── router/
│   │   └── index.js                     # Rotas (lazy loading)
│   ├── test/
│   │   ├── setup.js                     # Configuração de testes
│   │   ├── stores/                      # Testes de stores (87 tests)
│   │   └── utils/                       # Testes de utils (72 tests)
│   ├── App.vue                          # Componente raiz
│   └── main.js                          # Entry point (Error Boundary)
├── public/                              # Assets estáticos
├── vite.config.js                       # Configuração Vite
├── vitest.config.js                     # Configuração de testes
├── package.json                         # Dependências
└── README.md                            # Este arquivo
```

## 📊 Qualidade do Código

### Score Geral: **8.5/10** 🎯

| Categoria | Score | Descrição |
|-----------|-------|-----------|
| **Segurança** | 9.0/10 | Validação robusta, sanitização XSS, proteção CSRF |
| **Modularização** | 9.0/10 | Componentes reutilizáveis, separação de responsabilidades |
| **Testes** | 8.0/10 | 159 testes unitários, 100% passando |
| **Performance** | 9.0/10 | Lazy loading, tree-shaking, bundle otimizado |
| **Acessibilidade** | 8.5/10 | WCAG 2.1 AA, ARIA completo, navegação por teclado |
| **Documentação** | 9.0/10 | JSDoc completo, README detalhado, comentários |

### Evolução do Projeto

```
Sprint 1: Auditoria Inicial       → 5.0/10
Sprint 2: Modularização + UX      → 6.0/10
Sprint 3: Testes + Otimização     → 7.0/10
Sprint 4: Correções Críticas      → 7.5/10
Sprint 5: Lazy Loading + Tests    → 8.0/10
Sprint 6: Documentação JSDoc      → 8.0/10
Sprint 7: Acessibilidade WCAG     → 8.5/10 ⭐
```

## ♿ Acessibilidade

### Conformidade WCAG 2.1 - Nível AA

O projeto implementa as seguintes práticas de acessibilidade:

#### ✅ Implementações

- **Semântica HTML**: Uso correto de tags (`role`, `aria-label`, `aria-labelledby`)
- **ARIA Attributes**: Labels descritivos em todos os campos de formulário
- **Navegação por Teclado**: Todos os elementos interativos acessíveis via Tab
- **Screen Readers**: Hints e descrições para leitores de tela (.sr-only)
- **Contraste de Cores**: Conformidade com WCAG AA (contraste mínimo 4.5:1)
- **Focus Indicators**: Indicadores visuais de foco em todos os elementos
- **Autocomplete**: Atributos autocomplete para facilitar preenchimento
- **Input Types**: Tipos corretos (tel, date, number) para melhor UX
- **Required Fields**: Marcação visual e aria-required para campos obrigatórios

#### 📋 Formulários Acessíveis

```vue
<!-- Exemplo de campo acessível -->
<v-text-field
  label="Nome*"
  v-model="formData.name"
  aria-label="Nome completo do cliente (obrigatório)"
  aria-required="true"
  autocomplete="name"
  prepend-inner-icon="mdi-account"
/>
```

#### 🎯 Benefícios

- ✅ Navegação completa por teclado (Tab, Enter, Esc)
- ✅ Compatibilidade com NVDA, JAWS, VoiceOver
- ✅ Hints contextuais para leitores de tela
- ✅ Agrupamento lógico de campos relacionados
- ✅ Feedback de erro acessível

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/MinhaFeature`)
3. **Commit** suas mudanças (`git commit -m 'feat: adiciona MinhaFeature'`)
4. **Push** para a branch (`git push origin feature/MinhaFeature`)
5. Abra um **Pull Request**

### Padrões de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: tarefas gerais
```

### Testes Obrigatórios

Antes de fazer commit:

```bash
# Execute os testes
npm test

# Verifique o linting
npm run lint

# Faça build para garantir que não há erros
npm run build
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📞 Suporte

Para questões e suporte:

- 📧 Email: seu-email@exemplo.com
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/clientesvue/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/seu-usuario/clientesvue/discussions)

---

**Desenvolvido com ❤️ usando Vue 3 e Vuetify 3**
