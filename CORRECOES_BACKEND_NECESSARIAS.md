# 🔧 Correções Necessárias no Backend

**Data:** 2025-11-09
**Prioridade:** CRÍTICA
**Status:** Bloqueando login no frontend

---

## ❌ Problemas Identificados

### 1. **CRÍTICO: Erro de Banco de Dados**

```
"Unknown column 'created_at' in 'SELECT'"
"Unknown column 'Process.created_at' in 'SELECT'"
```

**Causa:** Os models Sequelize estão configurados com `timestamps: true` (padrão), mas as tabelas no banco de dados não têm as colunas `created_at` e `updated_at`.

**Impacto:**
- ✅ Login funcionando (User model já foi corrigido)
- ❌ Listagem de processos quebrada (Process model ainda precisa correção)
- ❓ Outros endpoints podem estar quebrados

**Solução Rápida:**
Desabilitar timestamps em **TODOS** os models:

```javascript
// models/User.js (JÁ CORRIGIDO ✅)
const User = sequelize.define('User', {
  matricula: DataTypes.STRING,
  nome: DataTypes.STRING,
  senha: DataTypes.STRING,
  admin_super: DataTypes.BOOLEAN,
  admin_padrao: DataTypes.BOOLEAN,
  primeiro_acesso: DataTypes.BOOLEAN
}, {
  timestamps: false, // ← JÁ ADICIONADO
  tableName: 'users'
});

// models/Process.js (PRECISA CORREÇÃO ❌)
const Process = sequelize.define('Process', {
  numero_processo: DataTypes.STRING,
  classe_principal: DataTypes.STRING,
  prazo_processual: DataTypes.INTEGER,
  assunto_principal: DataTypes.STRING,
  tarjas: DataTypes.STRING,
  data_intimacao: DataTypes.DATE,
  cumprido: DataTypes.BOOLEAN,
  observacoes: DataTypes.TEXT,
  userId: DataTypes.INTEGER
}, {
  timestamps: false, // ← ADICIONAR ESTA LINHA
  tableName: 'processes' // Ajuste o nome se necessário
});

// Verifique TODOS os outros models no projeto!
```

**⚠️ AÇÃO REQUERIDA:**
Procure por **todos os arquivos em `models/`** e adicione `timestamps: false` em cada um.

**Solução Completa:**
Se preferir manter timestamps (recomendado para auditoria), adicione as colunas no banco:

```sql
-- Para tabela users
ALTER TABLE users
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Para tabela processes
ALTER TABLE processes
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Repita para todas as outras tabelas
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

### 3. **Express trust proxy configuração**

**Situação Atual:**
```
ValidationError: The Express 'trust proxy' setting is true, which allows anyone to trivially bypass IP-based rate limiting.
```

**Status:** ✅ Trust proxy já está configurado, mas com warning de segurança.

**Causa do Warning:** `app.set('trust proxy', true)` é muito permissivo para produção.

**Impacto:**
- ⚠️ Warning apenas (não bloqueia funcionalidade)
- Rate limiting pode ser burlado facilmente
- Logs de IP podem não ser confiáveis

**Solução Recomendada para Produção:**

Em vez de `true`, especifique o número de proxies confiáveis:

```javascript
const express = require('express');
const app = express();

// Para DomCloud/Render (geralmente 1 proxy)
app.set('trust proxy', 1);

// OU especifique IPs/ranges confiáveis
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

// ... resto do código
```

**Prioridade:** Baixa (funciona, mas menos seguro)

**Documentação:**
- https://expressjs.com/en/guide/behind-proxies.html
- https://express-rate-limit.github.io/ERR_ERL_PERMISSIVE_TRUST_PROXY/

---

## 📊 Progresso Atual

### ✅ Corrigido:
- [x] Model User (timestamps desabilitados)
- [x] Trust proxy configurado (com warning de segurança)

### ❌ Ainda Precisa Correção:
- [ ] Model Process (timestamps precisam ser desabilitados)
- [ ] Outros models (se existirem)
- [ ] CORS para localhost:5173 (opcional se não estiver testando localmente)

### ⚠️ Pode Melhorar (Opcional):
- [ ] Trust proxy mais restritivo (usar número em vez de `true`)
- [ ] Adicionar colunas de timestamp nas tabelas (para auditoria)

---

## 🚀 Ordem de Implementação

### Prioridade 1 (BLOQUEADOR - AGORA):
1. ✅ ~~Corrigir model User~~ (JÁ FEITO)
2. ❌ **Corrigir model Process** (URGENTE - bloqueando listagem)
3. ❌ **Verificar e corrigir outros models** (pode estar bloqueando outros endpoints)

### Prioridade 2 (IMPORTANTE):
4. ✅ ~~Configurar trust proxy~~ (JÁ FEITO, mas pode melhorar)
5. ❌ Adicionar localhost:5173 ao CORS (se testar localmente)

### Prioridade 3 (OPCIONAL):
6. ⚠️ Melhorar trust proxy (usar número em vez de true)
7. ⚠️ Adicionar migrations para criar colunas de timestamp
8. ⚠️ Adicionar testes para validar CORS

---

## 🧪 Como Testar

### Teste 1: Verificar se login funciona (✅ JÁ PASSA)

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

**Status:** ✅ FUNCIONANDO

### Teste 2: Verificar listagem de processos (❌ AINDA FALHA)

```bash
curl -X GET "https://distribuidor.domcloud.dev/api/admin/processes?cumprido=false&page=1&itemsPerPage=10" \
  -H "Authorization: Bearer SEU_TOKEN_JWT_AQUI" \
  -H "Origin: http://localhost:5173"
```

**Resposta esperada:**
```json
{
  "rows": [...],
  "count": 100,
  "totalPages": 10
}
```

**Status:** ❌ RETORNA 500 (precisa corrigir model Process)

**Erro atual:**
```
"Unknown column 'Process.created_at' in 'SELECT'"
```

### Teste 3: Verificar CORS

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

**Status:** ⚠️ Não testado (opcional)

### Teste 4: Verificar trust proxy

Nos logs, não deve mais aparecer:
```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false
```

**Status:** ✅ Configurado (mas com warning de segurança sobre permissividade)

---

## 📋 Checklist de Implementação

### Já Feito:
- [x] Model User atualizado (timestamps: false) ✅
- [x] trust proxy configurado ✅
- [x] Backend reiniciado ✅
- [x] Teste de login executado e funcionando ✅

### Ainda Precisa Fazer:
- [ ] **Model Process atualizado (timestamps: false)** ← URGENTE
- [ ] **Outros models verificados e corrigidos** ← URGENTE
- [ ] localhost:5173 adicionado ao CORS (opcional)
- [ ] Backend reiniciado após correções
- [ ] Teste de listagem de processos executado e funcionando
- [ ] Logs verificados (sem erros de Process.created_at)
- [ ] Frontend testado completamente com backend corrigido

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
