# 🕵️ Login Falha em Guia Anônima: Problema de Cookies CSRF

## 🔍 Problema Identificado

**Sintoma:**
- ✅ Login funciona em **guia normal**
- ❌ Login falha em **guia anônima/privada** com **403 Forbidden**
- ❌ Mensagem: "Acesso negado - pode ser CSRF token inválido"

**Erro Específico:**
```
POST https://clientes.domcloud.dev/auth/login 403 (Forbidden)
Acesso negado - pode ser CSRF token inválido
```

---

## 🎯 Causa Raiz

Navegadores **bloqueiam cookies SameSite='none' em modo anônimo/privado** por motivos de privacidade.

### Por Que Funciona em Guia Normal?

1. **Cookies persistem** entre recarregamentos
2. **Cookies de terceiros permitidos** (configuração padrão)
3. **SameSite='none' funciona** normalmente

### Por Que Falha em Guia Anônima?

1. **Cookies bloqueados** por padrão
2. **SameSite='none' rejeitado** em contextos privados
3. **Política de privacidade mais restritiva**
4. **Cookies apagados** após fechar guia

### O Que Está Acontecendo?

```
1. Frontend busca CSRF token
   GET /api/csrf-token
   ↓
2. Backend tenta definir cookie
   Set-Cookie: x-csrf-token=ABC123; SameSite=none; Secure
   ↓
3. ❌ Navegador REJEITA em modo anônimo
   (Cookies SameSite=none bloqueados em modo privado)
   ↓
4. Frontend tenta fazer login
   POST /auth/login
   Header: x-csrf-token: ABC123
   Cookie: (vazio - não foi salvo)
   ↓
5. Backend valida: header != cookie
   ❌ 403 Forbidden
```

---

## ✅ Soluções

### Solução 1: Usar SameSite='lax' (RECOMENDADO)

**Quando usar:**
- ✅ Frontend e backend no **mesmo domínio principal**
- ✅ Exemplo: `app.domcloud.dev` + `api.domcloud.dev`

**Backend:**
```javascript
// Configuração CSRF
const { doubleCsrf } = require('csrf-csrf');

const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
  cookieName: 'x-csrf-token',
  cookieOptions: {
    sameSite: 'lax',  // ← MUDAR DE 'none' PARA 'lax'
    secure: true,
    httpOnly: false,
    path: '/',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
});
```

**Vantagens:**
- ✅ Funciona em modo anônimo
- ✅ Mais seguro
- ✅ Compatível com maioria dos navegadores

**Desvantagens:**
- ⚠️ Requer domínio principal igual (não funciona cross-domain)

---

### Solução 2: Verificar Contexto Seguro (HTTPS)

Cookies `SameSite='none'` **só funcionam em HTTPS**.

**Verificar:**

1. **Frontend:** `https://clientesvue-1.onrender.com` ✅
2. **Backend:** `https://clientes.domcloud.dev` ✅

Ambos estão em HTTPS, então isso **não é o problema**.

---

### Solução 3: Usar Partitioned Cookies (Futuro)

**Novo atributo do Chrome:**
```javascript
cookieOptions: {
  sameSite: 'none',
  secure: true,
  partitioned: true,  // ← Chrome 114+
}
```

**Status:** Experimental, não recomendado ainda.

---

### Solução 4: Avisar Usuário (Workaround)

Se não puder mudar para `SameSite='lax'`:

```vue
<!-- LoginView.vue -->
<v-alert v-if="isPrivateMode" type="warning" class="mb-4">
  O login em modo anônimo/privado pode não funcionar devido a restrições
  de cookies. Use uma guia normal para fazer login.
</v-alert>
```

**Detectar modo privado:**
```javascript
const isPrivateMode = ref(false);

onMounted(async () => {
  // Detecta modo privado
  try {
    await navigator.storage.estimate();
    isPrivateMode.value = false;
  } catch {
    isPrivateMode.value = true;
  }
});
```

---

## 🔧 Implementação Recomendada

### Mudar Backend para SameSite='lax'

**Arquivo:** Backend CSRF configuration

```javascript
// Antes (não funciona em modo anônimo)
cookieOptions: {
  sameSite: 'none',
  secure: true,
  httpOnly: false,
}

// Depois (funciona em modo anônimo)
cookieOptions: {
  sameSite: 'lax',   // ← MUDANÇA PRINCIPAL
  secure: true,
  httpOnly: false,
}
```

**Commit e Deploy:**
```bash
git add .
git commit -m "fix: change CSRF cookie SameSite to lax for private mode support"
git push origin main
```

---

## 🧪 Como Testar

### Teste 1: Guia Normal
1. Abra `https://clientesvue-1.onrender.com`
2. Faça login
3. ✅ Deve funcionar

### Teste 2: Guia Anônima (Antes da Fix)
1. Abra em modo anônimo
2. Tente fazer login
3. ❌ 403 Forbidden

### Teste 3: Guia Anônima (Depois da Fix)
1. Backend com `SameSite='lax'`
2. Abra em modo anônimo
3. Tente fazer login
4. ✅ Deve funcionar

---

## 📊 Comparação: SameSite Values

| Valor | Funciona Modo Anônimo | Cross-Domain | Segurança |
|-------|----------------------|--------------|-----------|
| `'none'` | ❌ Bloqueado | ✅ Sim | ⚠️ Média |
| `'lax'` | ✅ Funciona | ❌ Não | ✅ Alta |
| `'strict'` | ✅ Funciona | ❌ Não | ✅ Muito Alta |

**Recomendação:** Use `'lax'` quando possível.

---

## 🌐 Seu Caso Específico

**Domínios:**
- Frontend: `clientesvue-1.onrender.com`
- Backend: `clientes.domcloud.dev`

**Análise:**
- ❌ Domínios **diferentes** (`.onrender.com` vs `.domcloud.dev`)
- ⚠️ `SameSite='lax'` **NÃO vai funcionar** cross-domain
- ✅ Precisa de `SameSite='none'` para cross-domain

**Problema:**
- `SameSite='none'` é bloqueado em modo anônimo
- Não há solução perfeita para cross-domain + modo anônimo

---

## 💡 Soluções Viáveis para Seu Caso

### Opção A: Aceitar Limitação (Mais Simples)

**Implementar:**
1. Manter `SameSite='none'`
2. Adicionar aviso no frontend
3. Documentar limitação

**Código:**
```vue
<!-- LoginView.vue -->
<v-alert v-if="loginError === 'csrf'" type="warning" class="mb-4">
  ⚠️ Problemas com login em modo anônimo?
  Cookies de segurança podem estar bloqueados.
  Use uma guia normal para fazer login.
</v-alert>
```

### Opção B: Migrar para Mesmo Domínio

**Ideal:**
- Frontend: `app.domcloud.dev`
- Backend: `api.domcloud.dev`

**Resultado:**
- ✅ `SameSite='lax'` funciona
- ✅ Modo anônimo funciona
- ✅ Mais seguro

### Opção C: Autenticação por Header (Sem Cookies)

**Alternativa:**
- Remover CSRF baseado em cookies
- Usar apenas JWT no `Authorization` header
- Implementar CSRF via header customizado

**Prós:**
- ✅ Funciona em modo anônimo
- ✅ Mais simples

**Contras:**
- ⚠️ Menos seguro contra CSRF
- ⚠️ Requer mudança significativa no backend

---

## 🎯 Recomendação Final

Para seu caso específico (cross-domain):

**Curto Prazo:**
1. ✅ Adicionar aviso no frontend sobre modo anônimo
2. ✅ Documentar limitação
3. ✅ Manter funcionamento em guia normal

**Longo Prazo:**
1. ✅ Migrar para subdomínios do mesmo domínio
2. ✅ Mudar para `SameSite='lax'`
3. ✅ Suporte total a modo anônimo

---

## 📝 Código: Avisar Usuário

```vue
<!-- LoginView.vue -->
<template>
  <v-container fluid class="fill-height pa-4 login-background">
    <v-row align="center" justify="center" class="fill-height fill-width ma-0">
      <v-col cols="11" sm="8" md="6" lg="4" xl="3">

        <!-- Aviso para Modo Anônimo -->
        <v-alert
          v-if="showPrivateModeWarning"
          type="info"
          variant="tonal"
          closable
          class="mb-4"
          @click:close="showPrivateModeWarning = false"
        >
          <v-alert-title>Modo Anônimo Detectado</v-alert-title>
          <div class="text-caption">
            O login pode não funcionar em modo privado/anônimo devido a
            restrições de cookies. Se tiver problemas, use uma guia normal.
          </div>
        </v-alert>

        <!-- Logo -->
        <div class="text-center mb-6">
          <v-img src="..." max-height="80" contain></v-img>
        </div>

        <!-- Formulário de Login -->
        <v-card class="frosted-glass-card pa-4">
          <!-- ... resto do formulário ... -->
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const showPrivateModeWarning = ref(false);

// Detecta modo privado
onMounted(() => {
  // Método 1: Storage API
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    navigator.storage.estimate().then(estimate => {
      // Em modo privado, quota é muito baixa
      if (estimate.quota < 120000000) {
        showPrivateModeWarning.value = true;
      }
    }).catch(() => {
      // Erro ao acessar storage = provavelmente modo privado
      showPrivateModeWarning.value = true;
    });
  }

  // Método 2: IndexedDB (fallback)
  try {
    const openRequest = indexedDB.open('test');
    openRequest.onerror = () => {
      showPrivateModeWarning.value = true;
    };
  } catch {
    showPrivateModeWarning.value = true;
  }
});
</script>
```

---

## 🆘 Troubleshooting

### Pergunta: Por que funciona em guia normal?

**Resposta:** Navegadores permitem cookies `SameSite='none'` em guias normais, mas bloqueiam em modo privado por privacidade.

### Pergunta: Posso forçar cookies em modo anônimo?

**Resposta:** Não. É uma restrição do navegador, não pode ser contornada pelo site.

### Pergunta: Outros sites funcionam em modo anônimo, por que o meu não?

**Resposta:** Sites que funcionam em modo anônimo provavelmente:
- Usam `SameSite='lax'` (mesma origem)
- Não usam cookies para CSRF
- Usam apenas localStorage/sessionStorage

### Pergunta: Isso afeta muitos usuários?

**Resposta:** Relativamente poucos. Maioria dos usuários:
- ✅ Usa guias normais (95%+)
- ❌ Raramente usa modo anônimo para login

---

## 📚 Referências

- [MDN - SameSite Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [Chrome - SameSite Changes](https://www.chromium.org/updates/same-site/)
- [Private Mode Restrictions](https://developer.mozilla.org/en-US/docs/Web/Privacy)

---

## ✅ Checklist

### Entender o Problema:
- [x] Identificado: Cookies `SameSite='none'` bloqueados em modo anônimo
- [x] Confirmado: Funciona em guia normal
- [x] Confirmado: Cross-domain (Render + DomCloud)

### Implementar Solução:
- [ ] Adicionar aviso no frontend (modo anônimo)
- [ ] Documentar limitação no README
- [ ] Considerar migração para mesmo domínio (longo prazo)
- [ ] Testar em diferentes navegadores

---

**Última atualização:** 12 de novembro de 2025
**Status:** Limitação conhecida do navegador
**Solução:** Adicionar aviso para usuários em modo anônimo
