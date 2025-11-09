# 🔐 Frontend - CSRF Protection Ativada

**Data:** 2025-11-09
**Status:** ✅ CSRF Restaurado e Funcionando

---

## 📋 Resumo

O frontend foi atualizado para **restaurar completamente o sistema CSRF**, alinhando-se com a proteção CSRF reativada no backend.

### Por Que CSRF Foi Reativado?

O backend reativou a proteção CSRF com as seguintes configurações:
- ✅ **Double Submit Cookie Pattern** usando a biblioteca `csrf-csrf`
- ✅ **Cookie SameSite: 'none'** para permitir cross-domain (frontend Render → backend DomCloud)
- ✅ **Secure: true** para HTTPS obrigatório
- ✅ **Proteção em todas as rotas** que modificam dados (POST, PUT, DELETE, PATCH)

---

## 🔧 Implementação Atual

### 1. **Busca do Token CSRF** (`src/api/axios.js`)

Função que busca o token do backend:

```javascript
async function fetchCsrfToken() {
    const baseURL = getEnv('VITE_API_URL', 'https://clientes.domcloud.dev');
    const csrfUrl = `${baseURL}/api/csrf-token`;

    const response = await axios.get(csrfUrl, {
        withCredentials: true  // Necessário para receber cookies
    });

    if (response.data && response.data.csrfToken) {
        csrfToken = response.data.csrfToken;
        return csrfToken;
    }
}
```

### 2. **Inicialização no Startup** (`src/main.js`)

O token CSRF é buscado quando a aplicação inicia:

```javascript
import { initializeCsrf } from './api/axios';

// Inicializar CSRF token
initializeCsrf().catch(err => {
    console.warn('Falha ao inicializar CSRF token:', err);
});

app.mount('#app');
```

### 3. **Interceptor de Requisição** (`src/api/axios.js`)

O interceptor adiciona automaticamente o token CSRF em requisições de mutação:

```javascript
apiClient.interceptors.request.use(async (config) => {
    // Adicionar CSRF token para requisições de mutação
    const needsCsrf = ['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase());

    if (needsCsrf) {
        // Buscar token CSRF se não tiver
        if (!csrfToken) {
            await fetchCsrfToken();
        }

        // Adicionar token CSRF ao header
        if (csrfToken) {
            config.headers['x-csrf-token'] = csrfToken;
        }
    }

    // Também adiciona JWT para rotas protegidas
    if (!config.url.startsWith('/auth')) {
        const authStore = useAuthStore();
        config.headers['Authorization'] = `Bearer ${authStore.token}`;
    }

    return config;
});
```

### 4. **Tratamento de Erros 403** (`src/api/axios.js`)

Se o backend rejeitar uma requisição por CSRF inválido, o frontend renova automaticamente:

```javascript
case 403:
    const errorMessage = error.response.data?.error || '';
    if (errorMessage.includes('csrf') || errorMessage.includes('CSRF')) {
        logger.warn('Detectado erro de CSRF - renovando token');
        csrfToken = null; // Forçar renovação na próxima requisição
    }
    break;
```

---

## 🔐 Como Funciona o Fluxo Completo

### Fluxo de Login:

1. **Startup da Aplicação:**
   - `initializeCsrf()` é chamado
   - `GET /api/csrf-token` retorna token e define cookie
   - Token é armazenado em `csrfToken` (variável local)

2. **Usuário Faz Login:**
   - Frontend envia `POST /auth/login` com:
     - Header: `x-csrf-token: <token-do-passo-1>`
     - Cookie: `x-csrf-token` (enviado automaticamente com `withCredentials: true`)
     - Body: `{ matricula, senha, loginType }`
   - Backend valida CSRF (compara header vs cookie)
   - Backend valida credenciais
   - Backend retorna JWT: `{ accessToken, refreshToken, user }`

3. **Requisições Protegidas:**
   - Interceptor adiciona automaticamente:
     - `Authorization: Bearer <jwt-token>` (para autenticação)
     - `x-csrf-token: <csrf-token>` (para proteção CSRF)
   - Backend valida ambos os tokens
   - Se válido, processa a requisição

4. **Token CSRF Expirado/Inválido:**
   - Backend retorna 403 com mensagem de erro CSRF
   - Interceptor detecta erro e limpa `csrfToken = null`
   - Próxima requisição busca novo token automaticamente

---

## ✅ Camadas de Segurança

O sistema agora tem múltiplas camadas de proteção:

| Camada | Proteção | Status |
|--------|----------|--------|
| **CSRF Token** | Previne ataques CSRF | ✅ Ativo |
| **JWT Access Token** | Autenticação stateless (15 min) | ✅ Ativo |
| **JWT Refresh Token** | Renovação de sessão (7 dias) | ✅ Ativo |
| **CORS** | Apenas origens permitidas | ✅ Ativo |
| **Rate Limiting** | Previne força bruta | ✅ Ativo |
| **Headers de Segurança** | XSS, Clickjacking, etc | ✅ Ativo |
| **Cookies SameSite** | Proteção adicional CSRF | ✅ none (cross-domain) |
| **HTTPS Only** | Previne man-in-the-middle | ✅ Ativo |

---

## 🚀 Como Testar

1. **Limpe o cache do navegador** (importante!):
   - Chrome: F12 → Application → Clear storage → Clear site data
   - Firefox: F12 → Storage → Cookies → Delete all

2. **Acesse a aplicação:**
   ```
   http://localhost:5173
   ```

3. **Verifique no Console (F12):**
   - Deve ver: "🔐 Buscando CSRF token de: https://clientes.domcloud.dev/api/csrf-token"
   - Deve ver: "✅ CSRF token obtido: [primeiros-20-chars]..."
   - Deve ver: "CSRF inicializado com sucesso"

4. **Faça Login:**
   - Deve ver: "Token CSRF adicionado à requisição"
   - Login deve funcionar normalmente

5. **Verifique os Cookies:**
   - F12 → Application → Cookies → https://clientes.domcloud.dev
   - Deve ter cookie: `x-csrf-token`

---

## 🐛 Troubleshooting

### Erro: "invalid csrf token"

**Causa:** Cookie CSRF não está sendo enviado ou token no header está errado.

**Soluções:**
1. Limpe cookies do navegador
2. Verifique se `withCredentials: true` está configurado no axios
3. Verifique se backend tem `sameSite: 'none'` e `secure: true`
4. Certifique-se de que está usando HTTPS

### Erro: "CORS policy: Credential is not supported if the CORS header 'Access-Control-Allow-Origin' is '*'"

**Causa:** Backend com CORS aberto (`*`) não funciona com `withCredentials: true`.

**Solução:** Backend deve especificar a origem exata:
```javascript
{
  origin: 'https://seu-frontend.render.com',
  credentials: true
}
```

### Erro: "CSRF token não encontrado na resposta"

**Causa:** Endpoint `/api/csrf-token` não está retornando o token.

**Solução:** Verifique se o backend tem a rota configurada corretamente.

### Login funciona mas outras requisições retornam 403

**Causa:** Token CSRF pode ter expirado ou sido invalidado.

**Solução:** A renovação automática deve resolver. Se não:
1. Verifique os logs do console para ver se está renovando
2. Force logout e login novamente
3. Verifique se o cookie não está sendo bloqueado

---

## 📊 Comparação: Antes vs Agora

| Aspecto | Tentativa Anterior (Sem CSRF) | Agora (Com CSRF) |
|---------|-------------------------------|------------------|
| Login | ❌ 403 Forbidden | ✅ Funcionando |
| Segurança CSRF | ❌ Vulnerável | ✅ Protegido |
| Tokens | 1 (JWT apenas) | 2 (JWT + CSRF) |
| Complexidade | Baixa | Moderada |
| Alinhamento Backend | ❌ Desalinhado | ✅ Alinhado |

---

## 📝 Checklist de Implementação

- [x] CSRF token fetching implementado em axios.js
- [x] Inicialização de CSRF adicionada em main.js
- [x] Interceptor adiciona header `x-csrf-token` em mutações
- [x] `withCredentials: true` configurado para cookies
- [x] Tratamento de erro 403 com renovação automática
- [x] Código commitado e pushed para o branch
- [x] Documentação criada

---

## 📚 Referências

- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [csrf-csrf Library](https://github.com/Psifi-Solutions/csrf-csrf)
- [MDN - SameSite Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [Axios withCredentials](https://axios-http.com/docs/req_config)

---

**✨ CSRF Protection agora está totalmente ativo e funcionando!**
**🔒 Frontend e backend estão alinhados!**
**🚀 Pronto para uso em produção!**
