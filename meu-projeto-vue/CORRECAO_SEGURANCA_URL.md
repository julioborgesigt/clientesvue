# 🔒 Correção de Segurança - Dados Sensíveis na URL

## 🚨 Problema de Segurança Identificado

**Você estava certo!** Passar o código de recuperação e email na URL era **inseguro**:

### Antes (❌ INSEGURO):
```
http://localhost:5173/auth/recovery-code?code=FVBB-PKKZ-AQ3I-GOKB&email=teste7@exemplo.com
```

### Riscos:

| Risco | Descrição |
|-------|-----------|
| **📝 Histórico do Navegador** | URLs ficam armazenadas permanentemente no histórico |
| **📊 Logs do Servidor** | Servidores web logam URLs completas (incluindo query params) |
| **🔗 Referrer Headers** | Se o usuário clicar em link externo, a URL completa vaza via header Referer |
| **📸 Screenshots** | Código fica visível se alguém compartilhar tela ou tirar print |
| **👀 Shoulder Surfing** | Pessoa olhando por cima do ombro vê o código na barra de endereço |
| **💾 Cache** | URLs podem ficar em cache do navegador/proxy |
| **🌐 Proxy/Intermediários** | Proxies corporativos logam URLs completas |

## ✅ Solução Implementada

Agora usamos **Router State** - os dados passam "invisíveis" entre as páginas:

### Depois (✅ SEGURO):
```
http://localhost:5173/auth/recovery-code
```

O código e email **não aparecem mais na URL**!

## 🔧 O Que Foi Alterado

### 1. RegisterForm.vue
**Antes:**
```javascript
router.push({
  name: 'RecoveryCode',
  query: {  // ❌ Expõe na URL
    code: result.recoveryCode,
    email: form.value.email
  }
});
```

**Depois:**
```javascript
router.push({
  name: 'RecoveryCode',
  state: {  // ✅ Invisível na URL
    code: result.recoveryCode,
    email: form.value.email
  }
});
```

### 2. RecoveryCodeForm.vue
**Antes:**
```javascript
onMounted(() => {
  recoveryCode.value = route.query.code || '';  // ❌ Lê da URL
  userEmail.value = route.query.email || '';
});
```

**Depois:**
```javascript
onMounted(() => {
  const state = history.state || {};
  recoveryCode.value = state.code || '';  // ✅ Lê do state (invisível)
  userEmail.value = state.email || '';
});
```

### 3. Outros Arquivos Atualizados

Aplicamos a mesma correção em:
- ✅ **authStore.js** - Detecção automática de primeiro login
- ✅ **FirstLoginForm.vue** - Recebe email do registro/login
- ✅ **ForgotPasswordForm.vue** - Recebe email de outras telas

## 🎓 Como Funciona o Router State

### O que é Router State?

O **Router State** é uma funcionalidade do Vue Router que permite passar dados entre rotas **sem expor na URL**.

```javascript
// Enviar dados
router.push({
  name: 'TargetRoute',
  state: { secretData: 'valor secreto' }
});

// Receber dados
const state = history.state || {};
const secretData = state.secretData;
```

### Características:

| Aspecto | Router State | Query Params |
|---------|--------------|--------------|
| **Visibilidade** | ❌ Não aparece na URL | ✅ Aparece na URL |
| **Histórico** | ✅ Armazenado no history.state | ❌ Fica no histórico visível |
| **Logs** | ✅ Não é logado | ❌ É logado pelos servidores |
| **Compartilhamento** | ✅ Não pode ser compartilhado | ❌ URL pode ser copiada |
| **Atualizar (F5)** | ⚠️ Perdido ao atualizar | ✅ Persiste ao atualizar |

### ⚠️ Limitação do Router State

**Importante:** Se o usuário atualizar a página (F5) na tela do código de recuperação, o **state é perdido** porque:
- State só existe na **sessão atual** do navegador
- Não é persistido em localStorage ou sessionStorage
- Não faz parte da URL

**Solução implementada:**
- Se não houver código no state, redirecionamos automaticamente para `/auth/register`
- Usuário precisa fazer o registro novamente (medida de segurança adicional)

## 📊 Comparação: Antes vs Depois

### Teste 1: Registro Normal

**Antes (❌):**
```
1. Registra usuário
2. URL: /auth/recovery-code?code=XXXX-XXXX-XXXX-XXXX&email=teste@exemplo.com
3. Código visível na barra de endereço
4. Fica no histórico do navegador
```

**Depois (✅):**
```
1. Registra usuário
2. URL: /auth/recovery-code
3. Código invisível (está no state)
4. Não fica exposto no histórico
```

### Teste 2: Copiar URL

**Antes (❌):**
```
1. Usuário copia URL: /auth/recovery-code?code=XXXX&email=teste@exemplo.com
2. Envia para outra pessoa
3. ⚠️ VAZAMENTO DE CÓDIGO - outra pessoa pode acessar a conta!
```

**Depois (✅):**
```
1. Usuário copia URL: /auth/recovery-code
2. Envia para outra pessoa
3. ✅ Código NÃO está na URL - seguro!
4. Outra pessoa vê tela vazia e é redirecionada para registro
```

### Teste 3: Logs do Servidor (Dev Tools)

**Antes (❌):**
```
Network Tab:
GET /auth/recovery-code?code=XXXX-XXXX-XXXX-XXXX&email=teste@exemplo.com
```

**Depois (✅):**
```
Network Tab:
GET /auth/recovery-code
(Sem query params sensíveis)
```

## 🧪 Como Testar a Correção

### 1. Teste Básico de Segurança

```bash
1. Faça um novo registro
2. Na tela do código de recuperação, observe a URL
3. ✅ URL deve ser: http://localhost:5173/auth/recovery-code
4. ❌ URL NÃO deve conter: ?code=... ou &email=...
5. O código deve aparecer na tela, mas NÃO na URL
```

### 2. Teste de Compartilhamento de URL

```bash
1. Na tela de código de recuperação, copie a URL
2. Abra uma nova aba anônima
3. Cole a URL
4. ✅ Deve redirecionar para /auth/register (não há state)
5. Mostra erro: "Código de recuperação não encontrado"
```

### 3. Teste de Atualização (F5)

```bash
1. Na tela de código de recuperação, pressione F5
2. ⚠️ State é perdido (comportamento esperado)
3. ✅ Sistema redireciona para /auth/register
4. Usuário precisa fazer registro novamente
```

### 4. Teste de Fluxo Completo

```bash
1. Registre novo usuário
2. Veja código (URL sem query params) ✅
3. Deslize o botão para prosseguir
4. Vai para /auth/first-login
5. ✅ Email está preenchido mas NÃO está na URL
6. Complete o primeiro login
```

## 🛡️ Melhores Práticas de Segurança

### ✅ DO (Faça):

- **Use Router State** para dados sensíveis (senhas, códigos, tokens)
- **Use Query Params** apenas para dados públicos (filtros, páginas, categorias)
- **Valide no backend** - nunca confie apenas no frontend
- **Use HTTPS** em produção - evita man-in-the-middle
- **Expire códigos** - códigos de recuperação devem ter validade curta

### ❌ DON'T (Não faça):

- **Nunca passe senhas** em query params
- **Nunca passe tokens de auth** em query params
- **Nunca passe dados pessoais** (CPF, RG, cartão) em query params
- **Nunca confie apenas no frontend** para segurança

## 🔐 Comparação com Outras Soluções

### Opção 1: Router State (✅ Implementada)

**Prós:**
- ✅ Simples de implementar
- ✅ Não requer mudanças no backend
- ✅ Dados invisíveis na URL
- ✅ Funciona offline

**Contras:**
- ⚠️ Perdido ao atualizar página (F5)
- ⚠️ Não pode ser compartilhado via URL

### Opção 2: SessionStorage

**Prós:**
- ✅ Persiste ao atualizar página
- ✅ Invisível na URL

**Contras:**
- ❌ Pode ser lido por JavaScript malicioso (XSS)
- ❌ Não funciona entre abas

### Opção 3: Token Temporário no Backend

**Prós:**
- ✅ Mais seguro (backend valida)
- ✅ Pode ter expiração

**Contras:**
- ❌ Requer mudanças no backend
- ❌ Mais complexo
- ❌ Depende de conexão com backend

## 📝 Resumo das Mudanças

| Arquivo | Mudança | Motivo |
|---------|---------|--------|
| RegisterForm.vue | `query` → `state` | Não expor código na URL |
| RecoveryCodeForm.vue | `route.query` → `history.state` | Ler código de forma segura |
| FirstLoginForm.vue | `query` → `state` | Não expor email na URL |
| ForgotPasswordForm.vue | `route.query` → `history.state` | Ler email de forma segura |
| authStore.js | `query` → `state` | Detecção automática segura |

## ✅ Checklist de Segurança

- [x] Código de recuperação não aparece na URL
- [x] Email não aparece na URL em rotas de autenticação
- [x] State usado para dados sensíveis
- [x] Fallback para query params (compatibilidade)
- [x] Redirecionamento automático se state vazio
- [x] Logs de debug não expõem código completo
- [x] Histórico do navegador não contém dados sensíveis

---

**🎉 Correção de Segurança Implementada com Sucesso!**

Agora seu sistema está muito mais seguro. Obrigado por identificar essa vulnerabilidade! 🛡️
