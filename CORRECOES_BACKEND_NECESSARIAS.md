# 🔧 Correções Necessárias no Backend

**Data:** 2025-11-09
**Prioridade:** CRÍTICA
**Status:** Bloqueando login no frontend

---

## ❌ Problemas Identificados

### 1. **CRÍTICO: Erro de Banco de Dados**

```
"Unknown column 'created_at' in 'SELECT'"
```

**Causa:** O model Sequelize de `User` está configurado com `timestamps: true` (padrão), mas a tabela no banco de dados não tem as colunas `created_at` e `updated_at`.

**Impacto:** Login completamente quebrado (erro 500).

**Solução Rápida:**
Desabilitar timestamps no model:

```javascript
// models/User.js ou equivalente
const User = sequelize.define('User', {
  matricula: DataTypes.STRING,
  nome: DataTypes.STRING,
  senha: DataTypes.STRING,
  admin_super: DataTypes.BOOLEAN,
  admin_padrao: DataTypes.BOOLEAN,
  primeiro_acesso: DataTypes.BOOLEAN
}, {
  timestamps: false, // ← ADICIONAR
  tableName: 'users'
});
```

**Solução Completa:**
Adicionar as colunas no banco:

```sql
ALTER TABLE users
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
```

---

### 2. **CORS: localhost:5173 não permitido**

```json
"origins": ["https://distribuidorvue.onrender.com","http://localhost:8080","http://localhost:3000","http://localhost:3001","http://127.0.0.1:8080"]
```

**Falta:** `http://localhost:5173` (porta padrão do Vite).

**Solução:**

Adicione no arquivo de configuração CORS (provavelmente `app.js`):

```javascript
const allowedOrigins = [
  'https://distribuidorvue.onrender.com',
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173', // ← ADICIONAR
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5173', // ← ADICIONAR (opcional)
  process.env.FRONTEND_URL
].filter(Boolean);
```

**OU** configure a variável de ambiente:
```env
FRONTEND_URL=http://localhost:5173
```

---

### 3. **Express trust proxy não configurado**

```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false
```

**Causa:** O Express não está configurado para confiar nos headers de proxy reverso.

**Impacto:** Rate limiting não funciona corretamente, pode bloquear usuários legítimos.

**Solução:**

No arquivo principal (geralmente `app.js` ou `server.js`), logo após criar a instância do Express:

```javascript
const express = require('express');
const app = express();

// Confia no proxy reverso
app.set('trust proxy', true); // ← ADICIONAR

// ... resto do código
```

**Documentação:** https://expressjs.com/en/guide/behind-proxies.html

---

## 🚀 Ordem de Implementação

### Prioridade 1 (BLOQUEADOR):
1. ✅ Corrigir model User (desabilitar timestamps OU adicionar colunas)
2. ✅ Adicionar localhost:5173 ao CORS

### Prioridade 2 (IMPORTANTE):
3. ✅ Configurar trust proxy

### Prioridade 3 (OPCIONAL):
4. ✅ Adicionar migrations para criar colunas de timestamp
5. ✅ Adicionar testes para validar CORS

---

## 🧪 Como Testar

### Teste 1: Verificar se login funciona

```bash
curl -X POST https://distribuidor.domcloud.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{"matricula":"12691114","senha":"sua_senha","loginType":"admin_super"}'
```

**Resposta esperada:**
```json
{
  "token": "jwt-token-aqui",
  "user": { ... }
}
```

### Teste 2: Verificar CORS

```bash
curl -X OPTIONS https://distribuidor.domcloud.dev/api/auth/login \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

**Header esperado na resposta:**
```
Access-Control-Allow-Origin: http://localhost:5173
```

### Teste 3: Verificar trust proxy

Nos logs, não deve mais aparecer:
```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false
```

---

## 📋 Checklist de Implementação

- [ ] Model User atualizado (timestamps: false)
- [ ] localhost:5173 adicionado ao CORS
- [ ] trust proxy configurado
- [ ] Backend reiniciado
- [ ] Teste de login executado e funcionando
- [ ] Logs verificados (sem erros de created_at)
- [ ] Frontend testado com backend corrigido

---

## 🔗 Referências

- **Sequelize timestamps:** https://sequelize.org/docs/v6/core-concepts/model-basics/#timestamps
- **Express trust proxy:** https://expressjs.com/en/guide/behind-proxies.html
- **CORS:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- **express-rate-limit:** https://express-rate-limit.github.io/ERR_ERL_UNEXPECTED_X_FORWARDED_FOR/

---

## 📞 Contato

Se precisar de ajuda para implementar essas correções, entre em contato.

**Status:** ⏳ Aguardando implementação
