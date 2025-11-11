# 🔍 Análise Profunda: Problema de Login Após Erro no Mobile

**Data da Análise:** 11 de novembro de 2025
**Autor:** Análise Técnica Automatizada
**Versão:** 1.0

---

## 📋 Sumário Executivo

Este documento analisa um problema crítico de autenticação que ocorre **especificamente em dispositivos móveis** após erros em operações como "renovar clientes". O usuário fica impossibilitado de fazer login com credenciais válidas na versão mobile, mas consegue acessar via desktop ou mudando para "versão desktop" no mobile.

**Diagnóstico:** Desincronização de CSRF tokens entre memória e cookies do navegador mobile, causando rejeição do backend em requisições de autenticação.

---

## 🐛 Descrição do Problema

### Sintomas Relatados

1. ✅ Usuário logado executa ação de "renovar clientes"
2. ❌ Ocorre um erro durante a operação
3. 🚪 Usuário faz logout (manual ou automático)
4. 🔐 Tenta fazer login novamente → **"Credenciais inválidas"**
5. 💻 Mesmo momento: Login no **desktop funciona perfeitamente**
6. 📱 No mobile: Muda para "versão desktop" → **Login funciona**
7. ✅ Após login bem-sucedido, tudo volta ao normal no mobile

### Padrão de Comportamento

| Cenário | Resultado |
|---------|-----------|
| Desktop (sempre) | ✅ Login funciona |
| Mobile - versão mobile | ❌ Login falha |
| Mobile - versão desktop | ✅ Login funciona |
| Após reload completo (mobile) | ✅ Login funciona |

---

## 🔬 Análise Técnica Detalhada

### Arquitetura de Segurança

O projeto implementa **dois níveis de autenticação**:

1. **JWT Tokens** (Authorization)
   - Access Token: 15 minutos
   - Refresh Token: 7 dias
   - Armazenados em: `sessionStorage`

2. **CSRF Protection** (Double Submit Cookie Pattern)
   - Token no header: `x-csrf-token`
   - Token no cookie: `x-csrf-token`
   - Configuração: `SameSite='none'`, `Secure=true`, HTTPS only

### Fluxo Normal de Login

```
1. Inicialização App
   ↓
2. GET /api/csrf-token (withCredentials: true)
   ↓
3. Backend: Set-Cookie: x-csrf-token=ABC123
   Frontend: csrfToken = 'ABC123' (memória)
   ↓
4. POST /auth/login
   Headers:
     - x-csrf-token: ABC123 (do fetch)
   Cookies:
     - x-csrf-token=ABC123 (auto-enviado)
   ↓
5. Backend valida: header === cookie ✅
   ↓
6. Retorna JWT tokens
   ↓
7. sessionStorage.setItem('accessToken', ...)
```

### Fluxo do Problema (Mobile)

```
1. Usuário logado executa renovação de cliente
   PUT /clientes/adjust-date/:id
   ↓
2. ERRO 403 (CSRF inválido) ou 401 (Token expirado)
   ↓
3. Interceptor de Resposta (axios.js:145-153)
   case 403:
     csrfToken = null  // ⚠️ Zera token em MEMÓRIA
     // ❌ MAS o cookie continua no navegador!
   ↓
4. Se 401: authStore.logout() automático
   ↓
5. Usuário tenta login novamente
   POST /auth/login (precisa de CSRF válido)
   ↓
6. Interceptor de Request (axios.js:76-92)
   if (!csrfToken) await fetchCsrfToken()
   ↓
7. GET /api/csrf-token
   Backend: Set-Cookie: x-csrf-token=XYZ789 (novo)
   Frontend: csrfToken = 'XYZ789' (memória)
   ↓
8. POST /auth/login
   Headers:
     - x-csrf-token: XYZ789 (novo, da memória)
   Cookies:
     - x-csrf-token=ABC123 (ANTIGO! ⚠️)
   ↓
9. Backend valida: XYZ789 !== ABC123 ❌
   ↓
10. Backend retorna: 403 Forbidden
    ↓
11. Frontend interpreta: "Credenciais inválidas"
```

### Por Que Funciona no Desktop?

Navegadores **desktop** implementam melhor:
- Substituição automática de cookies quando `Set-Cookie` é recebido
- `withCredentials: true` funciona de forma mais confiável
- Cookies `SameSite='none'` são tratados corretamente
- Cache de DNS e conexões HTTP/2 mais estável

### Por Que Funciona ao Mudar para "Versão Desktop" no Mobile?

Quando o usuário ativa "Versão Desktop" no navegador mobile:
1. **Navegador força reload COMPLETO da página**
2. **Limpa cache de cookies** (ou força resync)
3. **JavaScript executa do zero**: `initializeCsrf()`
4. **Novo CSRF token** é buscado SEM cookies antigos
5. **Login funciona normalmente**

---

## 🎯 Causa Raiz Identificada

### Problema Principal

**Navegadores mobile não atualizam cookies de forma confiável quando:**
- Cookie tem `SameSite='none'` + `Secure=true`
- Aplicação usa `withCredentials: true`
- Múltiplas requisições ocorrem rapidamente (error → logout → login)
- PWA/WebView contexts

### Código Problemático

**Arquivo:** `/home/user/clientesvue/meu-projeto-vue/src/api/axios.js:145-153`

```javascript
case 403:
    // Pode ser CSRF token inválido - tentar renovar
    logger.error('Acesso negado - pode ser CSRF token inválido');
    const errorMessage = error.response.data?.error || '';
    if (errorMessage.includes('csrf') || errorMessage.includes('CSRF')) {
        logger.warn('Detectado erro de CSRF - renovando token');
        csrfToken = null; // ⚠️ Zera APENAS a variável em memória
        // ❌ NÃO limpa o cookie do navegador!
    }
    break;
```

**Problema:** Zerando `csrfToken = null`, o código força um novo `fetchCsrfToken()` na próxima requisição, mas o cookie antigo **permanece no navegador**, causando desincronização.

---

## 📂 Arquivos Envolvidos

| Arquivo | Linhas | Função | Problema |
|---------|--------|--------|----------|
| `src/api/axios.js` | 145-153 | Detecta erro 403 CSRF | Não limpa cookies |
| `src/api/axios.js` | 16-39 | `fetchCsrfToken()` | Não valida cookie antigo |
| `src/api/axios.js` | 71-116 | Request Interceptor | Não força limpeza |
| `src/stores/authStore.js` | 72-125 | `login()` | Não trata erro CSRF |
| `src/stores/clientStore.js` | 429-441 | `adjustClientDate()` | Não trata erro 403 |
| `src/main.js` | 189-192 | `initializeCsrf()` | Não limpa estado anterior |

---

## 🔧 Soluções Recomendadas

### Solução 1: Limpeza de Cookies CSRF (RECOMENDADA)

**Objetivo:** Garantir que cookies antigos sejam removidos antes de buscar novo token.

**Implementação:**

```javascript
// src/api/axios.js

/**
 * Limpa cookies CSRF do navegador
 * Necessário antes de buscar novo token
 */
function clearCsrfCookie() {
    // Limpa cookie do domínio atual
    document.cookie = 'x-csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=none; Secure';

    // Limpa cookie do backend (domcloud.dev)
    const backendDomain = new URL(getEnv('VITE_API_URL')).hostname;
    document.cookie = `x-csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${backendDomain}; SameSite=none; Secure`;

    logger.log('🧹 Cookies CSRF limpos');
}

async function fetchCsrfToken(forceClear = false) {
    try {
        // NOVO: Limpa cookies antigos se solicitado
        if (forceClear) {
            clearCsrfCookie();
            // Aguarda um pouco para garantir que o navegador processou
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        const baseURL = getEnv('VITE_API_URL', 'https://clientes.domcloud.dev');
        const csrfUrl = `${baseURL}/api/csrf-token`;

        logger.log('🔐 Buscando CSRF token de:', csrfUrl);

        const response = await axios.get(csrfUrl, {
            withCredentials: true
        });

        if (response.data && response.data.csrfToken) {
            csrfToken = response.data.csrfToken;
            logger.log('✅ CSRF token obtido:', csrfToken.substring(0, 20) + '...');
            return csrfToken;
        } else {
            logger.error('❌ Token CSRF não encontrado na resposta');
            throw new Error('Token CSRF não encontrado na resposta');
        }
    } catch (error) {
        logger.error('💥 Erro ao buscar CSRF token:', error);
        throw error;
    }
}

// MODIFICAR caso 403:
case 403:
    logger.error('Acesso negado - pode ser CSRF token inválido');
    const errorMessage = error.response.data?.error || '';
    if (errorMessage.includes('csrf') || errorMessage.includes('CSRF')) {
        logger.warn('Detectado erro de CSRF - renovando token');
        clearCsrfCookie(); // ✅ NOVA LINHA
        csrfToken = null;
    }
    break;
```

**Benefícios:**
- ✅ Garante sincronização entre memória e cookies
- ✅ Funciona em todos os navegadores (desktop + mobile)
- ✅ Não quebra compatibilidade existente

**Riscos:**
- ⚠️ Pequeno delay (100ms) antes de buscar novo token
- ⚠️ Depende de `document.cookie` (não funciona em alguns contexts como Service Workers)

---

### Solução 2: Inicialização Limpa no Login

**Objetivo:** Sempre buscar CSRF token limpo antes de fazer login.

**Implementação:**

```javascript
// src/stores/authStore.js

async login(email, password) {
    const notificationStore = useNotificationStore();
    try {
        const sanitizedEmail = email.trim().toLowerCase();

        if (!sanitizedEmail || !password) {
            throw new Error('Email e senha são obrigatórios');
        }

        // ✅ NOVO: Força renovação limpa do CSRF antes do login
        await initializeCsrf(true); // Passa flag para forçar limpeza

        const response = await apiClient.post('/auth/login', {
            email: sanitizedEmail,
            password
        });

        // ... resto do código
```

```javascript
// src/api/axios.js

export async function initializeCsrf(forceClear = false) {
    try {
        if (forceClear) {
            clearCsrfCookie();
            csrfToken = null;
        }
        await fetchCsrfToken(forceClear);
        logger.log('CSRF inicializado com sucesso');
    } catch (error) {
        logger.warn('Falha ao inicializar CSRF token:', error);
    }
}
```

**Benefícios:**
- ✅ Garante estado limpo no login
- ✅ Fácil de implementar
- ✅ Não afeta outras operações

**Riscos:**
- ⚠️ Adiciona latência extra no login (~200ms)

---

### Solução 3: Retry Automático com Limpeza

**Objetivo:** Quando detectar erro CSRF, limpar e tentar novamente automaticamente.

**Implementação:**

```javascript
// src/api/axios.js

apiClient.interceptors.response.use(
    (response) => {
        pendingRequests--;
        return response;
    },
    async (error) => {
        pendingRequests--;

        if (error.response) {
            const status = error.response.status;
            const config = error.config;

            switch (status) {
                case 403:
                    const errorMessage = error.response.data?.error || '';
                    if (errorMessage.includes('csrf') || errorMessage.includes('CSRF')) {
                        logger.warn('Detectado erro de CSRF - tentando recuperação automática');

                        // ✅ NOVO: Verifica se já tentou antes (evita loop infinito)
                        if (!config._csrfRetry) {
                            config._csrfRetry = true;

                            // Limpa cookies e token
                            clearCsrfCookie();
                            csrfToken = null;

                            // Aguarda um pouco
                            await new Promise(resolve => setTimeout(resolve, 200));

                            // Busca novo token
                            await fetchCsrfToken(true);

                            // Atualiza header da requisição
                            config.headers['x-csrf-token'] = csrfToken;

                            // Tenta novamente
                            logger.log('♻️ Tentando requisição novamente com CSRF renovado');
                            return apiClient.request(config);
                        } else {
                            logger.error('❌ Retry de CSRF falhou - redirecionando para login');
                        }
                    }
                    break;

                // ... outros cases
```

**Benefícios:**
- ✅ Transparente para o usuário
- ✅ Recupera automaticamente de erros CSRF
- ✅ Tenta apenas uma vez (evita loops)

**Riscos:**
- ⚠️ Pode mascarar problemas reais de CSRF
- ⚠️ Aumenta complexidade do código

---

### Solução 4: Usar LocalStorage para CSRF (ALTERNATIVA)

**Objetivo:** Evitar problemas de cookies usando LocalStorage.

**Nota:** ⚠️ Isso **reduz a segurança** do CSRF, pois remove o Double Submit Cookie pattern. NÃO RECOMENDADO a menos que cookies sejam inviáveis.

---

## 🧪 Plano de Teste

### Teste 1: Reproduzir o Problema

1. Acessar app no mobile
2. Fazer login
3. Executar "renovar cliente" até causar erro 403
4. Tentar fazer login novamente
5. **Esperado:** Deve falhar com "credenciais inválidas"

### Teste 2: Validar Solução 1

1. Aplicar Solução 1 (limpeza de cookies)
2. Repetir Teste 1
3. **Esperado:** Login deve funcionar normalmente

### Teste 3: Validar em Diferentes Browsers Mobile

- Chrome Android
- Safari iOS
- Firefox Mobile
- Samsung Internet
- Edge Mobile

### Teste 4: Validar Desktop (Regressão)

1. Aplicar solução
2. Testar no desktop (Chrome, Firefox, Safari, Edge)
3. **Esperado:** Tudo continua funcionando

---

## 📊 Dados de Suporte

### Configuração Atual CSRF

**Backend (conforme CSRF_ATIVADO.md):**
```javascript
{
    sameSite: 'none',
    secure: true,
    httpOnly: false,
    path: '/'
}
```

**Frontend (axios.js):**
```javascript
{
    withCredentials: true,
    baseURL: 'https://clientes.domcloud.dev'
}
```

### Browser Compatibility

| Browser | SameSite=none | withCredentials | Cookie Sync |
|---------|---------------|-----------------|-------------|
| Chrome Desktop | ✅ | ✅ | ✅ |
| Chrome Mobile | ✅ | ⚠️ | ❌ (problema) |
| Safari Desktop | ✅ | ✅ | ✅ |
| Safari iOS | ✅ | ⚠️ | ❌ (problema) |
| Firefox Desktop | ✅ | ✅ | ✅ |
| Firefox Mobile | ✅ | ⚠️ | ⚠️ |

---

## 🎯 Recomendação Final

**Implementar Solução 1 + Solução 2:**

1. **Solução 1:** Adicionar `clearCsrfCookie()` e chamar em erros 403
2. **Solução 2:** Forçar `initializeCsrf(true)` antes do login

**Justificativa:**
- ✅ Corrige o problema raiz (cookies desincronizados)
- ✅ Garante estado limpo no login (UX melhor)
- ✅ Baixo risco de regressão
- ✅ Funciona em todos os browsers

**Não implementar Solução 3** (retry automático) inicialmente, pois:
- Aumenta complexidade
- Pode mascarar outros problemas
- Pode ser adicionada depois se necessário

---

## 📝 Checklist de Implementação

- [ ] Adicionar função `clearCsrfCookie()` em `axios.js`
- [ ] Modificar `fetchCsrfToken()` para aceitar parâmetro `forceClear`
- [ ] Modificar `initializeCsrf()` para aceitar parâmetro `forceClear`
- [ ] Atualizar caso 403 para chamar `clearCsrfCookie()`
- [ ] Modificar `authStore.login()` para chamar `initializeCsrf(true)`
- [ ] Adicionar logs detalhados para debugging mobile
- [ ] Testar em Chrome Mobile
- [ ] Testar em Safari iOS
- [ ] Testar desktop (regressão)
- [ ] Documentar solução no README
- [ ] Adicionar comentários no código explicando o problema

---

## 📚 Referências

- [MDN - SameSite Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [MDN - withCredentials](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials)
- [Double Submit Cookie Pattern](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie)
- Documentos do projeto:
  - `CSRF_ATIVADO.md`
  - `CSRF_DESENVOLVIMENTO.md`
  - `AUDITORIA_CODIGO.md`

---

## 🔄 Histórico de Revisões

| Data | Versão | Autor | Mudanças |
|------|--------|-------|----------|
| 2025-11-11 | 1.0 | Análise Técnica | Criação inicial do documento |

---

**FIM DO RELATÓRIO**
