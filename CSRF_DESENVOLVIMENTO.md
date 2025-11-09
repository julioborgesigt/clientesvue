# 🔒 Problema com CSRF em Desenvolvimento (Cross-Domain)

## ❌ Problema Atual

O login está falhando porque:

1. **Frontend**: `localhost:5173`
2. **Backend**: `clientes.domcloud.dev`
3. **Cookie CSRF**: `sameSite: 'lax'` no backend

### Por que isso causa erro?

Com `sameSite: 'lax'`, os cookies:
- ✅ **SÃO enviados** em requisições GET cross-site
- ❌ **NÃO são enviados** em requisições POST cross-site

Quando você faz login (`POST /auth/login`), o cookie CSRF não é enviado, causando erro **403 Forbidden**.

---

## ✅ Solução 1: Mudar Backend (Recomendado para Dev)

No arquivo `backend/app.js`, localize esta configuração:

```javascript
cookieOptions: {
  sameSite: 'lax',        // ← MUDAR
  path: '/',
  secure: isProduction,
  httpOnly: false,
}
```

### Mude para:

```javascript
cookieOptions: {
  sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none',  // ← NOVO
  path: '/',
  secure: process.env.NODE_ENV === 'production',  // ← AJUSTAR
  httpOnly: false,
}
```

### Explicação:
- **Desenvolvimento**: `sameSite: 'none'` permite cookies em POST cross-domain
- **Produção**: `sameSite: 'lax'` mantém segurança
- **secure**: Deve ser `true` quando `sameSite: 'none'` (HTTPS obrigatório)

---

## ✅ Solução 2: Desabilitar CSRF em Dev (Alternativa)

Se não quiser mexer no cookie, desabilite CSRF em desenvolvimento:

No arquivo `backend/app.js`:

```javascript
// Aplicar CSRF protection apenas em produção
if (process.env.NODE_ENV === 'production') {
  app.use('/auth', csrfMiddleware, authRoutes);
  app.use('/clientes', authMiddleware, csrfMiddleware, clientesRoutes);
  app.use('/servicos', authMiddleware, csrfMiddleware, servicosRoutes);
} else {
  // Desenvolvimento sem CSRF
  app.use('/auth', authRoutes);
  app.use('/clientes', authMiddleware, clientesRoutes);
  app.use('/servicos', authMiddleware, servicosRoutes);
}
```

⚠️ **Atenção**: Apenas para desenvolvimento! Nunca desabilite CSRF em produção.

---

## ✅ Solução 3: Usar Proxy do Vite (Mais Complexo)

O proxy já está configurado no `vite.config.js`, mas requer:

1. Ajustar `.env` para `VITE_API_URL=`
2. Garantir que o servidor Vite foi reiniciado
3. Verificar se o proxy está funcionando com logs no terminal

Esta solução evita cross-domain completamente.

---

## 📝 Recomendação

Para desenvolvimento rápido:
1. Use **Solução 1** (mudar sameSite)
2. Reinicie o backend
3. Reinicie o frontend
4. Teste o login

Para produção:
- Mantenha `sameSite: 'lax'`
- Use mesmo domínio para frontend e backend
- Ou configure proxy reverso (nginx/apache)

---

## 🐛 Debug

Se ainda não funcionar, verifique no console do navegador:

```javascript
// Abra o console e execute:
document.cookie  // Deve mostrar x-csrf-token após GET /api/csrf-token
```

Se o cookie não aparecer, o problema está na configuração CORS do backend.
