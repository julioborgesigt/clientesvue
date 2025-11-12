# 🗄️ Implementação Backend: Arquivamento de Clientes

Este documento explica como implementar as rotas de arquivamento/desarquivamento de clientes no backend.

---

## 📋 Checklist de Implementação

- [ ] 1. Adicionar coluna `arquivado` na tabela `clientes`
- [ ] 2. Criar rota `PUT /clientes/archive/:id`
- [ ] 3. Criar rota `PUT /clientes/unarchive/:id`
- [ ] 4. Modificar `GET /clientes/list` para filtrar por `showArchived`
- [ ] 5. Modificar estatísticas para não contar clientes arquivados
- [ ] 6. Testar as rotas com Postman/Insomnia
- [ ] 7. Fazer deploy

---

## 🗃️ 1. Adicionar Coluna no Banco de Dados

### SQL Direto (MySQL/PostgreSQL)

```sql
-- Adiciona coluna arquivado na tabela clientes
ALTER TABLE clientes
ADD COLUMN arquivado BOOLEAN DEFAULT FALSE;

-- Cria índice para melhor performance em consultas
CREATE INDEX idx_clientes_arquivado ON clientes(arquivado);

-- Opcional: Atualiza clientes existentes (garante que todos sejam FALSE)
UPDATE clientes SET arquivado = FALSE WHERE arquivado IS NULL;
```

### Sequelize Migration

Se estiver usando Sequelize, crie uma migration:

```bash
npx sequelize-cli migration:generate --name add-arquivado-to-clientes
```

Edite o arquivo gerado:

```javascript
// migrations/XXXXXX-add-arquivado-to-clientes.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('clientes', 'arquivado', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    // Adiciona índice
    await queryInterface.addIndex('clientes', ['arquivado'], {
      name: 'idx_clientes_arquivado',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('clientes', 'idx_clientes_arquivado');
    await queryInterface.removeColumn('clientes', 'arquivado');
  },
};
```

Execute a migration:

```bash
npx sequelize-cli db:migrate
```

### Atualizar Modelo Sequelize

```javascript
// models/Cliente.js
module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define('Cliente', {
    // ... campos existentes ...

    arquivado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: 'Indica se o cliente está arquivado',
    },
  }, {
    tableName: 'clientes',
    timestamps: true,
  });

  return Cliente;
};
```

---

## 🛣️ 2. Criar Rota: Arquivar Cliente

### Rota Express

```javascript
// routes/clientes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { doubleCsrf } = require('../middleware/csrf');

/**
 * PUT /clientes/archive/:id
 * Arquiva um cliente (define arquivado = true)
 */
router.put('/archive/:id',
  authenticateToken,
  doubleCsrf.doubleCsrfProtection,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id; // Do JWT token

      // Busca o cliente
      const cliente = await Cliente.findOne({
        where: {
          id,
          user_id: userId // Garante que o cliente pertence ao usuário
        }
      });

      if (!cliente) {
        return res.status(404).json({
          error: 'Cliente não encontrado'
        });
      }

      // Verifica se já está arquivado
      if (cliente.arquivado) {
        return res.status(400).json({
          error: 'Cliente já está arquivado'
        });
      }

      // Arquiva o cliente
      await cliente.update({ arquivado: true });

      // Log da ação (opcional, se você tiver sistema de logs)
      await LogAcao.create({
        user_id: userId,
        cliente_id: id,
        acao: 'ARCHIVE_CLIENT',
        descricao: `Cliente ${cliente.name} arquivado`,
      });

      res.json({
        message: 'Cliente arquivado com sucesso',
        cliente: {
          id: cliente.id,
          name: cliente.name,
          arquivado: cliente.arquivado,
        }
      });
    } catch (error) {
      console.error('Erro ao arquivar cliente:', error);
      res.status(500).json({
        error: 'Erro ao arquivar cliente'
      });
    }
  }
);

module.exports = router;
```

---

## 🛣️ 3. Criar Rota: Desarquivar Cliente

```javascript
// routes/clientes.js

/**
 * PUT /clientes/unarchive/:id
 * Desarquiva um cliente (define arquivado = false)
 */
router.put('/unarchive/:id',
  authenticateToken,
  doubleCsrf.doubleCsrfProtection,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Busca o cliente
      const cliente = await Cliente.findOne({
        where: {
          id,
          user_id: userId
        }
      });

      if (!cliente) {
        return res.status(404).json({
          error: 'Cliente não encontrado'
        });
      }

      // Verifica se está arquivado
      if (!cliente.arquivado) {
        return res.status(400).json({
          error: 'Cliente não está arquivado'
        });
      }

      // Desarquiva o cliente
      await cliente.update({ arquivado: false });

      // Log da ação (opcional)
      await LogAcao.create({
        user_id: userId,
        cliente_id: id,
        acao: 'UNARCHIVE_CLIENT',
        descricao: `Cliente ${cliente.name} desarquivado`,
      });

      res.json({
        message: 'Cliente desarquivado com sucesso',
        cliente: {
          id: cliente.id,
          name: cliente.name,
          arquivado: cliente.arquivado,
        }
      });
    } catch (error) {
      console.error('Erro ao desarquivar cliente:', error);
      res.status(500).json({
        error: 'Erro ao desarquivar cliente'
      });
    }
  }
);
```

---

## 🔍 4. Modificar Rota: Listar Clientes

Modifique a rota `GET /clientes/list` para aceitar o parâmetro `showArchived`:

```javascript
// routes/clientes.js

/**
 * GET /clientes/list
 * Lista clientes com paginação e filtros
 */
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

    // Monta filtro base
    const where = {
      user_id: userId,
    };

    // ← NOVO: Filtro de arquivados
    if (showArchived === 'true') {
      where.arquivado = true; // Mostra apenas arquivados
    } else {
      where.arquivado = false; // Mostra apenas ativos (padrão)
    }

    // Filtro de status (se fornecido)
    if (status) {
      if (status === 'vence3') {
        // Clientes que vencem nos próximos 3 dias
        const hoje = new Date();
        const daquiTresDias = new Date();
        daquiTresDias.setDate(hoje.getDate() + 3);

        where.vencimento = {
          [Op.between]: [hoje, daquiTresDias],
        };
        where.status = { [Op.ne]: 'in-day' }; // Exclui "em dia"
      } else {
        where.status = status;
      }
    }

    // Filtro de busca (se fornecido)
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { whatsapp: { [Op.like]: `%${search}%` } },
        { servico: { [Op.like]: `%${search}%` } },
      ];
    }

    // Busca clientes
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

## 📊 5. Atualizar Estatísticas

Modifique as rotas de estatísticas para **NÃO contar clientes arquivados**:

```javascript
// routes/clientes.js

/**
 * GET /clientes/dashboard-stats
 * Retorna estatísticas do dashboard
 */
router.get('/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // ← IMPORTANTE: Adiciona filtro arquivado: false em TODAS as consultas
    const whereAtivo = {
      user_id: userId,
      arquivado: false, // ← NOVO: Exclui arquivados
    };

    // Total de clientes ATIVOS
    const totalClientes = await Cliente.count({
      where: whereAtivo,
    });

    // Custos e valores APENAS de clientes ativos
    const custoTotal = await Cliente.sum('custo', {
      where: whereAtivo,
    }) || 0;

    const valorApurado = await Cliente.sum('valor_cobrado', {
      where: {
        ...whereAtivo,
        status: 'in-day', // Apenas pagos
      },
    }) || 0;

    // Clientes vencidos (ativos apenas)
    const vencidos = await Cliente.count({
      where: {
        ...whereAtivo,
        vencimento: { [Op.lt]: new Date() },
        status: { [Op.ne]: 'in-day' },
      },
    });

    // Vencem nos próximos 3 dias (ativos apenas)
    const hoje = new Date();
    const daquiTresDias = new Date();
    daquiTresDias.setDate(hoje.getDate() + 3);

    const vence3 = await Cliente.count({
      where: {
        ...whereAtivo,
        vencimento: { [Op.between]: [hoje, daquiTresDias] },
        status: { [Op.ne]: 'in-day' },
      },
    });

    // Em dia (ativos apenas)
    const emdias = await Cliente.count({
      where: {
        ...whereAtivo,
        status: 'in-day',
      },
    });

    // Previsto (soma de todos os ativos)
    const previsto = await Cliente.sum('valor_cobrado', {
      where: whereAtivo,
    }) || 0;

    const lucro = valorApurado - custoTotal;

    res.json({
      totalClientes,
      custoTotal,
      valorApurado,
      lucro,
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

### Atualizar Outras Consultas

Certifique-se de adicionar `arquivado: false` em:

- `GET /clientes/pending-this-month`
- `GET /clientes/pagamentos/dias`
- `GET /clientes/stats/by-service`

Exemplo:

```javascript
// GET /clientes/pending-this-month
const pendentes = await Cliente.findAll({
  where: {
    user_id: userId,
    arquivado: false, // ← Adicione isso
    status: 'pending',
    vencimento: {
      [Op.gte]: primeiroDiaMes,
      [Op.lte]: ultimoDiaMes,
    },
  },
});
```

---

## 🧪 6. Testes com Postman/Insomnia

### Teste 1: Arquivar Cliente

```http
PUT https://clientes.domcloud.dev/clientes/archive/224
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  x-csrf-token: YOUR_CSRF_TOKEN
  Cookie: x-csrf-token=YOUR_CSRF_COOKIE
```

**Resposta esperada (200):**
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

### Teste 2: Desarquivar Cliente

```http
PUT https://clientes.domcloud.dev/clientes/unarchive/224
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  x-csrf-token: YOUR_CSRF_TOKEN
  Cookie: x-csrf-token=YOUR_CSRF_COOKIE
```

**Resposta esperada (200):**
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

### Teste 3: Listar Clientes Ativos

```http
GET https://clientes.domcloud.dev/clientes/list?page=1&limit=20&showArchived=false
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

**Resposta esperada (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Cliente Ativo",
      "arquivado": false,
      ...
    }
  ],
  "total": 50,
  "page": 1,
  "totalPages": 3
}
```

### Teste 4: Listar Clientes Arquivados

```http
GET https://clientes.domcloud.dev/clientes/list?page=1&limit=20&showArchived=true
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

**Resposta esperada (200):**
```json
{
  "data": [
    {
      "id": 224,
      "name": "Cliente Arquivado",
      "arquivado": true,
      ...
    }
  ],
  "total": 5,
  "page": 1,
  "totalPages": 1
}
```

---

## 🚀 7. Deploy

### Checklist de Deploy

1. **Commit e Push:**
   ```bash
   git add .
   git commit -m "feat: add client archive/unarchive routes"
   git push origin main
   ```

2. **Rodar Migration (se usando Sequelize):**
   ```bash
   # No servidor de produção
   npx sequelize-cli db:migrate
   ```

3. **Ou Executar SQL Diretamente:**
   ```sql
   -- No banco de produção
   ALTER TABLE clientes ADD COLUMN arquivado BOOLEAN DEFAULT FALSE;
   CREATE INDEX idx_clientes_arquivado ON clientes(arquivado);
   UPDATE clientes SET arquivado = FALSE WHERE arquivado IS NULL;
   ```

4. **Reiniciar Servidor:**
   ```bash
   pm2 restart app
   # ou
   systemctl restart seu-app
   ```

5. **Testar em Produção:**
   - Acesse https://seu-frontend.com
   - Tente arquivar um cliente
   - Verifique se aparece a mensagem de sucesso
   - Alterne para "Arquivados" e veja se aparece
   - Desarquive e verifique se volta para "Ativos"

---

## 🔒 Segurança

### Validações Importantes

1. **Autenticação:** ✅ Sempre verificar JWT token
2. **Autorização:** ✅ Verificar se cliente pertence ao usuário (`user_id`)
3. **CSRF:** ✅ Validar token CSRF em PUT requests
4. **Validação de ID:** ✅ Verificar se ID é número válido
5. **Rate Limiting:** ✅ Limitar requisições por IP/usuário

Exemplo de validação adicional:

```javascript
// Validação de ID
const id = parseInt(req.params.id);
if (isNaN(id) || id <= 0) {
  return res.status(400).json({ error: 'ID inválido' });
}

// Verificar propriedade
if (cliente.user_id !== req.user.id) {
  return res.status(403).json({ error: 'Acesso negado' });
}
```

---

## 📝 Log de Ações (Opcional)

Se você tem um sistema de logs de ações, adicione:

```javascript
// Após arquivar/desarquivar
await LogAcao.create({
  user_id: userId,
  cliente_id: id,
  acao: 'ARCHIVE_CLIENT', // ou 'UNARCHIVE_CLIENT'
  descricao: `Cliente ${cliente.name} ${arquivado ? 'arquivado' : 'desarquivado'}`,
  dados_anteriores: JSON.stringify({ arquivado: !cliente.arquivado }),
  dados_novos: JSON.stringify({ arquivado: cliente.arquivado }),
  ip: req.ip,
  user_agent: req.get('user-agent'),
});
```

---

## 🎯 Resumo

### Ordem de Implementação:

1. ✅ **Banco:** `ALTER TABLE clientes ADD COLUMN arquivado BOOLEAN DEFAULT FALSE`
2. ✅ **Modelo:** Adicionar campo `arquivado` no modelo Sequelize
3. ✅ **Rotas:** Criar `PUT /archive/:id` e `PUT /unarchive/:id`
4. ✅ **Listar:** Modificar `GET /list` para aceitar `showArchived`
5. ✅ **Stats:** Adicionar `arquivado: false` em todas as estatísticas
6. ✅ **Testar:** Usar Postman/Insomnia
7. ✅ **Deploy:** Migration + restart servidor

---

## 🐛 Troubleshooting

### Erro: "arquivado column doesn't exist"
- **Causa:** Migration não foi executada
- **Solução:** Execute `ALTER TABLE clientes ADD COLUMN arquivado BOOLEAN DEFAULT FALSE`

### Erro: "Cliente não encontrado" (404)
- **Causa:** Cliente não pertence ao usuário ou ID inválido
- **Solução:** Verifique `user_id` e valide ID

### Frontend mostra erro 404
- **Causa:** Rotas não foram criadas no backend
- **Solução:** Implemente as rotas conforme este documento

### Clientes arquivados aparecem em estatísticas
- **Causa:** Filtro `arquivado: false` não foi adicionado
- **Solução:** Adicione em todas as queries de stats

---

**Última atualização:** 12 de novembro de 2025

**Frontend:** ✅ Implementado
**Backend:** ⏳ Aguardando implementação
