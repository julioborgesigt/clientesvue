# 🚨 Erro CORS em Produção - Render

## Problema Identificado

```
Access to XMLHttpRequest at 'https://clientes.domcloud.dev/api/csrf-token'
from origin 'https://clientesvue-1.onrender.com' has been blocked by CORS policy
```

**Origem:** `https://clientesvue-1.onrender.com` (Frontend no Render)
**Destino:** `https://clientes.domcloud.dev` (Backend no DomCloud)
**Erro:** Backend não permite requisições deste domínio

---

## 🔍 Causa Raiz

O **proxy do Vite só funciona em desenvolvimento local**, não em produção. Quando você faz o build e deploy:

- ❌ Proxy **NÃO** é incluído no build
- ❌ Frontend tenta acessar backend diretamente
- ❌ Backend rejeita por CORS (origem não permitida)

---

## ✅ Solução: Configurar CORS no Backend

### Passo 1: Adicionar Origem no Backend

No seu backend (`clientes.domcloud.dev`), adicione o domínio do Render às origens permitidas:

```javascript
// Backend - configuração CORS
const allowedOrigins = [
  'https://clientesvue-1.onrender.com',  // ← ADICIONE ISSO
  'http://localhost:5173',               // Desenvolvimento
  'http://localhost:3000',               // Alternativo
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // IMPORTANTE para cookies CSRF
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-csrf-token',
    'X-Requested-With',
  ],
};

app.use(cors(corsOptions));
```

### Passo 2: Verificar Variáveis de Ambiente no Render

No dashboard do Render (https://dashboard.render.com):

1. Vá em seu serviço do frontend
2. Clique em **"Environment"**
3. Adicione/verifique as variáveis:

```bash
VITE_API_URL=https://clientes.domcloud.dev
VITE_API_TIMEOUT=30000
VITE_ENABLE_DEBUG=false
```

**IMPORTANTE:**
- ✅ Em produção: `VITE_API_URL` deve ter a URL **COMPLETA**
- ❌ Em produção: `VITE_API_URL` **NÃO** pode estar vazio

### Passo 3: Redeploy do Backend

Após adicionar a origem CORS:

```bash
# No backend
git add .
git commit -m "fix: add Render frontend to CORS allowed origins"
git push origin main

# Aguarde deploy automático no DomCloud
```

### Passo 4: Redeploy do Frontend (se necessário)

Se você modificou as variáveis de ambiente no Render:

1. Vá no dashboard do Render
2. Clique em **"Manual Deploy"** → **"Deploy latest commit"**
3. Aguarde o build completar

---

## 🔧 Configuração Completa - Checklist

### Backend (DomCloud):

- [ ] Adicionar `https://clientesvue-1.onrender.com` ao CORS
- [ ] Verificar `credentials: true` no CORS
- [ ] Verificar headers permitidos incluem `x-csrf-token`
- [ ] Fazer commit e push
- [ ] Verificar deploy bem-sucedido

### Frontend (Render):

- [ ] Verificar variável `VITE_API_URL=https://clientes.domcloud.dev`
- [ ] Garantir que **NÃO** está vazio
- [ ] Fazer redeploy se mudou variáveis
- [ ] Testar após deploy

---

## 📊 Diferenças: Desenvolvimento vs Produção

| Aspecto | Desenvolvimento | Produção |
|---------|----------------|----------|
| **URL Frontend** | `http://localhost:5173` | `https://clientesvue-1.onrender.com` |
| **Proxy** | ✅ Ativo (Vite) | ❌ Não existe |
| **VITE_API_URL** | `` (vazio, usa proxy) | `https://clientes.domcloud.dev` |
| **Requisições** | Relativas (`/api/...`) | Absolutas via axios |
| **CORS** | Não precisa (proxy) | ✅ Precisa configurar |

---

## 🧪 Como Testar

### Teste 1: Verificar Variáveis de Ambiente

No Render, vá em **Environment** e confirme:

```
VITE_API_URL = https://clientes.domcloud.dev
```

### Teste 2: Verificar CORS no Backend

Use `curl` para testar CORS:

```bash
curl -I -X OPTIONS \
  -H "Origin: https://clientesvue-1.onrender.com" \
  -H "Access-Control-Request-Method: GET" \
  https://clientes.domcloud.dev/api/csrf-token
```

**Resposta esperada:**
```
Access-Control-Allow-Origin: https://clientesvue-1.onrender.com
Access-Control-Allow-Credentials: true
```

### Teste 3: Acessar Aplicação

1. Abra: https://clientesvue-1.onrender.com
2. Abra DevTools (F12) → Console
3. Não deve ter erros de CORS
4. Tente fazer login
5. Deve funcionar normalmente

---

## 🆘 Troubleshooting

### Erro Persiste Após Configurar CORS

**Possível causa:** Cache do navegador

**Solução:**
```
1. Limpar cache: Ctrl+Shift+Delete
2. Hard refresh: Ctrl+F5
3. Testar em aba anônima
```

### Erro 429 (Too Many Requests)

**Causa:** Múltiplas tentativas de buscar CSRF token

**Solução:**
```
1. Aguarde 5-10 minutos (rate limit reseta)
2. Limpe cookies do site
3. Recarregue a página
```

### Variável VITE_API_URL Não Aplica

**Causa:** Build antigo ainda está em cache

**Solução:**
```
1. No Render, faça "Clear build cache"
2. Faça novo deploy
3. Aguarde build completar
```

### CORS Ainda Bloqueia

**Verificar:**

1. **Origem exata no backend:**
   ```javascript
   // CERTO
   'https://clientesvue-1.onrender.com'

   // ERRADO (com barra no final)
   'https://clientesvue-1.onrender.com/'
   ```

2. **Credentials habilitado:**
   ```javascript
   credentials: true  // DEVE estar true
   ```

3. **Wildcard não funciona com credentials:**
   ```javascript
   // ❌ ERRADO
   origin: '*'  // Não funciona com credentials

   // ✅ CERTO
   origin: ['https://clientesvue-1.onrender.com']
   ```

---

## 📝 Exemplo Completo - Backend CORS

```javascript
// server.js ou app.js (backend)
const express = require('express');
const cors = require('cors');

const app = express();

// Lista de origens permitidas
const allowedOrigins = [
  'https://clientesvue-1.onrender.com',  // Produção (Render)
  'http://localhost:5173',                // Dev local (Vite)
  'http://localhost:3000',                // Dev alternativo
];

// Configuração CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Permite requisições sem origin (Postman, mobile apps)
    if (!origin) {
      return callback(null, true);
    }

    // Verifica se origem está na lista
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS bloqueado para origem:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // CRUCIAL para cookies CSRF
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-csrf-token',
    'X-Requested-With',
  ],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // Cache preflight por 24h
};

// Aplicar CORS
app.use(cors(corsOptions));

// Resto do código...
```

---

## 🎯 Resumo Rápido

```bash
# 1. Backend (adicionar ao código)
allowedOrigins.push('https://clientesvue-1.onrender.com');

# 2. Commit e deploy
git add .
git commit -m "fix: add Render to CORS"
git push origin main

# 3. Frontend - verificar no Render dashboard
VITE_API_URL=https://clientes.domcloud.dev

# 4. Testar
# Abrir https://clientesvue-1.onrender.com
# Sem erros de CORS = ✅ Resolvido
```

---

## 🔗 Links Úteis

- **Render Dashboard:** https://dashboard.render.com
- **CORS MDN:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- **Vite Env Vars:** https://vitejs.dev/guide/env-and-mode.html

---

## ⏱️ Tempo Estimado para Resolver

- Adicionar CORS no backend: **5 minutos**
- Deploy backend: **2-5 minutos**
- Verificar variáveis Render: **2 minutos**
- Testar: **3 minutos**

**Total:** ~15-20 minutos

---

**Última atualização:** 12 de novembro de 2025
**Status:** Aguardando configuração CORS no backend
