# 🔒 Correção: Token Não Fornecido ao Trocar Senha

## 🐛 Problema Identificado

**Erro**: Ao tentar trocar a senha após o login, retornava:
```
PUT https://clientes.domcloud.dev/auth/change-password 401 (Unauthorized)
Token não fornecido!
```

**Local do Problema**: **FRONTEND** - [src/api/axios.js](src/api/axios.js) linhas 127-141

## 📋 Causa Raiz

O interceptor de requisições do Axios tinha uma lógica incorreta:

### Código Anterior (com BUG):
```javascript
// ❌ INCORRETO: Excluía TODAS as rotas /auth/* do JWT
if (!config.url.startsWith('/auth')) {
    const authStore = useAuthStore();
    const token = authStore.token;

    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    } else {
        return Promise.reject(new Error('Token não encontrado'));
    }
}
```

### O Problema:

A condição `!config.url.startsWith('/auth')` significa:
- **"Se a URL NÃO começa com /auth, adicione o JWT"**

Isso assumia que **TODAS** as rotas `/auth/*` são públicas (não precisam de autenticação), como:
- `/auth/login` ✅ Público
- `/auth/register` ✅ Público
- `/auth/first-login` ✅ Público

**MAS** `/auth/change-password` é uma **rota protegida** que REQUER autenticação!

Resultado: O JWT não era adicionado ao cabeçalho, causando erro 401.

## ✅ Solução Implementada

Agora o interceptor diferencia entre rotas públicas e protegidas:

### Código Corrigido:
```javascript
// ✅ CORRETO: Lista explícita de rotas públicas
const publicAuthRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/first-login',
    '/auth/reset-password-with-code',
    '/auth/reset-password',
    '/api/csrf-token'
];

// Verifica se é uma rota pública
const isPublicRoute = publicAuthRoutes.some(route => config.url.startsWith(route));

// Adicionar Authorization token para todas as rotas protegidas
if (!isPublicRoute) {
    const authStore = useAuthStore();
    const token = authStore.token;

    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        logger.log('Token JWT adicionado à requisição');
    } else {
        pendingRequests--;
        logger.warn('Tentativa de requisição sem token');
        return Promise.reject(new Error('Token não encontrado'));
    }
}
```

## 📊 Comparação: Antes vs Depois

### Antes da Correção:

| Rota | JWT Adicionado? | Resultado |
|------|----------------|-----------|
| `/auth/login` | ❌ Não | ✅ OK (rota pública) |
| `/auth/register` | ❌ Não | ✅ OK (rota pública) |
| `/auth/change-password` | ❌ Não | ❌ **ERRO 401** |
| `/api/clientes` | ✅ Sim | ✅ OK |

### Depois da Correção:

| Rota | JWT Adicionado? | Resultado |
|------|----------------|-----------|
| `/auth/login` | ❌ Não (pública) | ✅ OK |
| `/auth/register` | ❌ Não (pública) | ✅ OK |
| `/auth/change-password` | ✅ **SIM** (protegida) | ✅ **OK** |
| `/api/clientes` | ✅ Sim | ✅ OK |

## 🔐 Classificação das Rotas de Autenticação

### Rotas Públicas (NÃO precisam de JWT):
```javascript
'/auth/login'                   // Login do usuário
'/auth/register'                // Registro de novo usuário
'/auth/first-login'             // Primeiro login com código de recuperação
'/auth/reset-password-with-code'// Reset de senha com código
'/auth/reset-password'          // Solicitar reset de senha (envia email)
'/api/csrf-token'               // Obter token CSRF
```

### Rotas Protegidas (PRECISAM de JWT):
```javascript
'/auth/change-password'         // ⭐ Trocar senha (usuário logado)
'/auth/logout'                  // Logout (se implementado no backend)
'/api/*'                        // Todas as outras APIs
```

## 🧪 Como Testar

1. **Faça login** na aplicação
2. **Vá para a tela de trocar senha** (após primeiro login ou menu)
3. **Preencha o formulário**:
   - Senha atual
   - Nova senha
   - Confirmação da nova senha
4. **Clique em "Alterar Senha"**
5. **Resultado Esperado**: ✅ Senha alterada com sucesso
6. **Verifique no console** do navegador (F12):
   ```
   Token JWT adicionado à requisição
   PUT /auth/change-password 200 OK
   ```

## 🔍 Identificando Futuras Rotas

### Como saber se uma rota `/auth/*` precisa de JWT?

**Regra Geral**:
- ✅ **Precisa de JWT**: Se a ação requer que o usuário esteja logado
  - Exemplos: trocar senha, alterar perfil, logout

- ❌ **NÃO precisa de JWT**: Se a ação pode ser feita sem login
  - Exemplos: login, registro, reset de senha

### Adicionando Nova Rota Pública:

Se o backend criar uma nova rota pública `/auth/verify-email`:

```javascript
const publicAuthRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/first-login',
    '/auth/reset-password-with-code',
    '/auth/reset-password',
    '/auth/verify-email',  // ← ADICIONAR AQUI
    '/api/csrf-token'
];
```

## 📝 Arquivo Modificado

- **[src/api/axios.js](src/api/axios.js)** - Linhas 127-155

## ✨ Benefícios da Correção

1. ✅ **Trocar senha funciona** após login
2. ✅ **Lógica mais clara** - lista explícita de rotas públicas
3. ✅ **Fácil manutenção** - adicionar novas rotas públicas é simples
4. ✅ **Segurança melhorada** - JWT é adicionado por padrão, a menos que explicitamente excluído
5. ✅ **Logging adequado** - logs mostram quando JWT é adicionado

## 🎯 Impacto

Esta correção resolve o erro "Token não fornecido!" ao tentar trocar a senha e garante que todas as rotas protegidas recebam corretamente o JWT token.

---

**Status**: ✅ **CORRIGIDO**

**Data**: 2025-11-25

**Problema**: Frontend (axios.js)

**Solução**: Whitelist de rotas públicas ao invés de blacklist de rotas protegidas
