# 📋 Especificação: API de Arquivamento de Clientes

**Contexto:** O frontend Vue.js já está implementado e funcional. Agora precisamos implementar os endpoints correspondentes no backend Node.js/Express.

---

## 🎯 Objetivo

Implementar funcionalidade de arquivamento de clientes, permitindo:
- Ocultar clientes inativos da visualização principal (arquivar)
- Restaurar clientes arquivados quando voltarem a ser ativos (desarquivar)
- Filtrar entre clientes ativos e arquivados
- Excluir clientes arquivados das estatísticas do dashboard

---

## 📊 Mudanças no Banco de Dados

### Nova Coluna na Tabela `clientes`

```sql
-- MySQL/MariaDB
ALTER TABLE clientes
ADD COLUMN arquivado BOOLEAN DEFAULT FALSE NOT NULL
COMMENT 'Indica se o cliente está arquivado (inativo)';

-- Criar índice para performance
CREATE INDEX idx_clientes_arquivado ON clientes(arquivado);

-- Atualizar registros existentes (garantir consistência)
UPDATE clientes SET arquivado = FALSE WHERE arquivado IS NULL;
```

### Modelo Sequelize (se aplicável)

Adicione ao modelo `Cliente`:

```javascript
arquivado: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
  allowNull: false,
  comment: 'Indica se o cliente está arquivado'
}
```

---

## 🛣️ Endpoints Necessários

### 1. Arquivar Cliente

**Endpoint:** `PUT /clientes/archive/:id`

**Headers Necessários:**
- `Authorization: Bearer <jwt_token>`
- `x-csrf-token: <csrf_token>`
- `Cookie: x-csrf-token=<csrf_cookie>`

**Parâmetros:**
- `id` (URL param): ID do cliente a arquivar

**Comportamento Esperado:**
1. Validar JWT token e obter `user_id`
2. Verificar se cliente existe e pertence ao usuário
3. Verificar se cliente já está arquivado (retornar erro 400 se sim)
4. Atualizar campo `arquivado = true`
5. Registrar ação no log (se houver sistema de logs)
6. Retornar sucesso

**Resposta de Sucesso (200):**
```json
{
  "message": "Cliente arquivado com sucesso",
  "cliente": {
    "id": 224,
    "name": "João Silva",
    "arquivado": true
  }
}
```

**Respostas de Erro:**

```json
// 401 Unauthorized
{
  "error": "Token não fornecido ou inválido"
}

// 403 Forbidden
{
  "error": "Acesso negado. Cliente não pertence ao usuário"
}

// 404 Not Found
{
  "error": "Cliente não encontrado"
}

// 400 Bad Request
{
  "error": "Cliente já está arquivado"
}

// 500 Internal Server Error
{
  "error": "Erro ao arquivar cliente"
}
```

**Exemplo de Implementação (Express):**

```javascript
router.put('/archive/:id',
  authenticateToken,
  doubleCsrf.doubleCsrfProtection,
  async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const userId = req.user.id;

      // Validação de ID
      if (isNaN(clientId) || clientId <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      // Buscar cliente
      const cliente = await Cliente.findOne({
        where: { id: clientId, user_id: userId }
      });

      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      if (cliente.arquivado) {
        return res.status(400).json({ error: 'Cliente já está arquivado' });
      }

      // Arquivar
      await cliente.update({ arquivado: true });

      // Log (opcional)
      // await LogAcao.create({ ... });

      res.json({
        message: 'Cliente arquivado com sucesso',
        cliente: {
          id: cliente.id,
          name: cliente.name,
          arquivado: true
        }
      });
    } catch (error) {
      console.error('Erro ao arquivar cliente:', error);
      res.status(500).json({ error: 'Erro ao arquivar cliente' });
    }
  }
);
```

---

### 2. Desarquivar Cliente

**Endpoint:** `PUT /clientes/unarchive/:id`

**Headers Necessários:**
- `Authorization: Bearer <jwt_token>`
- `x-csrf-token: <csrf_token>`
- `Cookie: x-csrf-token=<csrf_cookie>`

**Parâmetros:**
- `id` (URL param): ID do cliente a desarquivar

**Comportamento Esperado:**
1. Validar JWT token e obter `user_id`
2. Verificar se cliente existe e pertence ao usuário
3. Verificar se cliente está arquivado (retornar erro 400 se não)
4. Atualizar campo `arquivado = false`
5. Registrar ação no log (se houver sistema de logs)
6. Retornar sucesso

**Resposta de Sucesso (200):**
```json
{
  "message": "Cliente desarquivado com sucesso",
  "cliente": {
    "id": 224,
    "name": "João Silva",
    "arquivado": false
  }
}
```

**Respostas de Erro:** (mesmas do endpoint anterior, exceto 400)

```json
// 400 Bad Request
{
  "error": "Cliente não está arquivado"
}
```

**Exemplo de Implementação (Express):**

```javascript
router.put('/unarchive/:id',
  authenticateToken,
  doubleCsrf.doubleCsrfProtection,
  async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const userId = req.user.id;

      if (isNaN(clientId) || clientId <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const cliente = await Cliente.findOne({
        where: { id: clientId, user_id: userId }
      });

      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      if (!cliente.arquivado) {
        return res.status(400).json({ error: 'Cliente não está arquivado' });
      }

      await cliente.update({ arquivado: false });

      res.json({
        message: 'Cliente desarquivado com sucesso',
        cliente: {
          id: cliente.id,
          name: cliente.name,
          arquivado: false
        }
      });
    } catch (error) {
      console.error('Erro ao desarquivar cliente:', error);
      res.status(500).json({ error: 'Erro ao desarquivar cliente' });
    }
  }
);
```

---

### 3. Modificar Endpoint Existente: Listar Clientes

**Endpoint:** `GET /clientes/list`

**Novo Query Parameter:**
- `showArchived` (boolean string): `'true'` ou `'false'` (padrão: `'false'`)

**Comportamento:**
- `showArchived=false` → Retorna apenas clientes com `arquivado = false` (padrão)
- `showArchived=true` → Retorna apenas clientes com `arquivado = true`

**Exemplo de Requisição:**

```http
GET /clientes/list?page=1&limit=20&showArchived=false
Authorization: Bearer <token>

GET /clientes/list?page=1&limit=20&showArchived=true
Authorization: Bearer <token>
```

**Modificação Necessária:**

```javascript
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      status = '',
      search = '',
      showArchived = 'false', // ← NOVO PARÂMETRO
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      user_id: userId,
      // ← ADICIONAR FILTRO DE ARQUIVADOS
      arquivado: showArchived === 'true' ? true : false,
    };

    // Filtros existentes de status e search
    if (status) {
      // ... lógica existente
    }

    if (search) {
      // ... lógica existente
    }

    const { count, rows } = await Cliente.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['vencimento', 'ASC']],
    });

    res.json({
      data: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});
```

---

### 4. Modificar Endpoints de Estatísticas

**IMPORTANTE:** Todos os endpoints de estatísticas devem **EXCLUIR clientes arquivados** dos cálculos.

#### Endpoints Afetados:

1. `GET /clientes/dashboard-stats`
2. `GET /clientes/pending-this-month`
3. `GET /clientes/pagamentos/dias`
4. `GET /clientes/stats/by-service`

#### Modificação Necessária:

**Adicionar `arquivado: false` em TODAS as queries:**

```javascript
// Exemplo: dashboard-stats
router.get('/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // ← Filtro base para excluir arquivados
    const whereAtivo = {
      user_id: userId,
      arquivado: false, // ← ADICIONAR EM TODAS AS QUERIES
    };

    // Total de clientes ATIVOS
    const totalClientes = await Cliente.count({
      where: whereAtivo,
    });

    // Custos e valores (apenas ativos)
    const custoTotal = await Cliente.sum('custo', {
      where: whereAtivo,
    }) || 0;

    const valorApurado = await Cliente.sum('valor_cobrado', {
      where: {
        ...whereAtivo,
        status: 'in-day',
      },
    }) || 0;

    // Vencidos (apenas ativos)
    const vencidos = await Cliente.count({
      where: {
        ...whereAtivo,
        vencimento: { [Op.lt]: new Date() },
        status: { [Op.ne]: 'in-day' },
      },
    });

    // ... resto das estatísticas

    res.json({
      totalClientes,
      custoTotal,
      valorApurado,
      lucro: valorApurado - custoTotal,
      previsto,
      vencidos,
      vence3,
      emdias,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao calcular estatísticas' });
  }
});
```

**Aplicar mesma lógica em:**

```javascript
// pending-this-month
const pendentes = await Cliente.findAll({
  where: {
    user_id: userId,
    arquivado: false, // ← ADICIONAR
    status: 'pending',
    // ... resto dos filtros
  },
});

// pagamentos/dias
const clientes = await Cliente.findAll({
  where: {
    user_id: userId,
    arquivado: false, // ← ADICIONAR
    // ... resto dos filtros
  },
});

// stats/by-service
const stats = await Cliente.findAll({
  where: {
    user_id: userId,
    arquivado: false, // ← ADICIONAR
  },
  attributes: ['servico', [sequelize.fn('COUNT', '*'), 'count']],
  group: ['servico'],
});
```

---

## 🔒 Segurança e Validações

### Checklist de Segurança:

- [ ] ✅ **Autenticação:** Validar JWT token em todas as rotas
- [ ] ✅ **Autorização:** Verificar se cliente pertence ao usuário (`user_id`)
- [ ] ✅ **CSRF:** Validar token CSRF em rotas PUT/DELETE
- [ ] ✅ **Validação de ID:** Verificar se é número válido e positivo
- [ ] ✅ **SQL Injection:** Usar prepared statements (Sequelize faz isso)
- [ ] ✅ **Rate Limiting:** Aplicar limite de requisições por IP/usuário

### Exemplo de Validações:

```javascript
// Validação de ID
const clientId = parseInt(req.params.id);
if (isNaN(clientId) || clientId <= 0) {
  return res.status(400).json({ error: 'ID inválido' });
}

// Verificar propriedade
if (cliente.user_id !== req.user.id) {
  return res.status(403).json({ error: 'Acesso negado' });
}

// Verificar existência
if (!cliente) {
  return res.status(404).json({ error: 'Cliente não encontrado' });
}
```

---

## 📝 Sistema de Logs (Opcional)

Se o backend tiver sistema de logs de ações, registre:

```javascript
await LogAcao.create({
  user_id: userId,
  cliente_id: clientId,
  acao: 'ARCHIVE_CLIENT', // ou 'UNARCHIVE_CLIENT'
  descricao: `Cliente ${cliente.name} ${arquivado ? 'arquivado' : 'desarquivado'}`,
  dados_anteriores: JSON.stringify({ arquivado: !cliente.arquivado }),
  dados_novos: JSON.stringify({ arquivado: cliente.arquivado }),
  ip: req.ip,
  user_agent: req.get('user-agent'),
  created_at: new Date(),
});
```

---

## 🧪 Testes

### Cenários de Teste:

#### 1. Arquivar Cliente com Sucesso

```bash
# Request
PUT /clientes/archive/224
Authorization: Bearer <valid_token>
x-csrf-token: <valid_csrf>

# Expected Response (200)
{
  "message": "Cliente arquivado com sucesso",
  "cliente": {
    "id": 224,
    "name": "João Silva",
    "arquivado": true
  }
}
```

#### 2. Tentar Arquivar Cliente Já Arquivado

```bash
# Request
PUT /clientes/archive/224

# Expected Response (400)
{
  "error": "Cliente já está arquivado"
}
```

#### 3. Desarquivar Cliente com Sucesso

```bash
# Request
PUT /clientes/unarchive/224

# Expected Response (200)
{
  "message": "Cliente desarquivado com sucesso",
  "cliente": {
    "id": 224,
    "name": "João Silva",
    "arquivado": false
  }
}
```

#### 4. Listar Apenas Clientes Ativos

```bash
# Request
GET /clientes/list?showArchived=false

# Expected: Retorna apenas clientes com arquivado=false
```

#### 5. Listar Apenas Clientes Arquivados

```bash
# Request
GET /clientes/list?showArchived=true

# Expected: Retorna apenas clientes com arquivado=true
```

#### 6. Verificar Estatísticas Excluem Arquivados

```bash
# Request
GET /clientes/dashboard-stats

# Expected: Totais não incluem clientes arquivados
```

---

## ✅ Checklist de Implementação

### Backend:

- [ ] 1. Adicionar coluna `arquivado BOOLEAN DEFAULT FALSE` na tabela `clientes`
- [ ] 2. Criar índice `idx_clientes_arquivado`
- [ ] 3. Atualizar modelo Sequelize (se aplicável)
- [ ] 4. Implementar rota `PUT /clientes/archive/:id`
- [ ] 5. Implementar rota `PUT /clientes/unarchive/:id`
- [ ] 6. Modificar `GET /clientes/list` para aceitar `showArchived`
- [ ] 7. Adicionar `arquivado: false` em `GET /clientes/dashboard-stats`
- [ ] 8. Adicionar `arquivado: false` em `GET /clientes/pending-this-month`
- [ ] 9. Adicionar `arquivado: false` em `GET /clientes/pagamentos/dias`
- [ ] 10. Adicionar `arquivado: false` em `GET /clientes/stats/by-service`
- [ ] 11. Adicionar validações de segurança (auth, CSRF, ID)
- [ ] 12. Testar com Postman/Insomnia
- [ ] 13. Testar integração com frontend
- [ ] 14. Fazer commit e deploy

### Testes de Integração:

- [ ] Arquivar cliente e verificar que some da lista de ativos
- [ ] Alternar para "Arquivados" no frontend e verificar que aparece
- [ ] Desarquivar e verificar que volta para lista de ativos
- [ ] Verificar que estatísticas não contam clientes arquivados
- [ ] Testar com cliente que não pertence ao usuário (deve retornar 403)
- [ ] Testar sem autenticação (deve retornar 401)
- [ ] Testar sem CSRF token (deve retornar 403)

---

## 🚀 Deploy

### Passos para Deploy:

```bash
# 1. Rodar SQL no banco de produção
mysql -u user -p database < migration_arquivado.sql

# Ou Sequelize
npx sequelize-cli db:migrate

# 2. Commit do código
git add .
git commit -m "feat: add client archive/unarchive functionality"
git push origin main

# 3. Deploy (dependendo da plataforma)
# Railway/Render: push automático
# PM2: pm2 restart app
# Systemd: systemctl restart app
```

---

## 📊 Resumo dos Dados

### Estrutura do Cliente (após modificação):

```javascript
{
  id: 224,
  name: "João Silva",
  whatsapp: "+5511987654321",
  vencimento: "2025-12-01",
  servico: "Hosting",
  valor_cobrado: 50.00,
  custo: 30.00,
  status: "pending", // 'pending', 'paid', 'in-day'
  observacoes: "Cliente premium",
  user_id: 1,
  arquivado: false, // ← NOVO CAMPO
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-11-12T00:00:00Z"
}
```

---

## 🎯 Comportamento Esperado

### Estado Inicial:
- Todos os clientes existentes: `arquivado = false`

### Após Arquivamento:
- Cliente some da lista principal de ativos
- Não aparece nas estatísticas do dashboard
- Ainda pode ser encontrado alternando para "Arquivados"
- Pode ser editado, renovado, excluído normalmente
- Dados são preservados integralmente

### Após Desarquivamento:
- Cliente volta para lista de ativos
- Volta a aparecer nas estatísticas
- Volta a receber notificações de vencimento (se houver)

---

## ❓ Perguntas Frequentes

### Q: Clientes arquivados podem ser editados?
**A:** Sim, todas as operações (editar, renovar, excluir) funcionam normalmente. Apenas a visualização é filtrada.

### Q: O que acontece com clientes arquivados nas estatísticas?
**A:** São totalmente excluídos dos cálculos de custos, lucros, totais, etc.

### Q: É possível buscar um cliente arquivado?
**A:** Sim, basta alternar para a visualização "Arquivados" no frontend.

### Q: Arquivamento é reversível?
**A:** Sim, 100% reversível através do botão "Desarquivar".

### Q: Qual a diferença entre arquivar e excluir?
**A:** Arquivar apenas oculta (soft delete), excluir remove permanentemente (hard delete).

---

## 📞 Suporte

**Frontend:** ✅ Implementado e funcional
**Backend:** ⏳ Aguardando implementação conforme esta spec

**Status Atual:**
- Frontend faz chamadas para `PUT /clientes/archive/:id` e `PUT /clientes/unarchive/:id`
- Backend retorna 404 (rotas não existem ainda)
- Após implementação, funcionalidade estará completa

---

**Data:** 12 de novembro de 2025
**Versão:** 1.0
**Autor:** Especificação técnica para implementação backend
