# 🔧 Correção do Erro 404 ao Atualizar Página (SPA)

## 🐛 Problema

Quando você atualizava a página (F5) em rotas do Vue Router como:
- `http://localhost:5173/auth/login`
- `http://localhost:5173/auth/register`
- `http://localhost:5173/auth/forgot-password`

Recebia o erro:
```json
{"status":"fail","message":"Rota não encontrada: GET /auth/login"}
```

## 🔍 Causa Raiz

O problema estava na **configuração do Vite proxy** em `vite.config.js`:

```javascript
// ❌ CONFIGURAÇÃO INCORRETA (antes)
server: {
  proxy: {
    '/auth': {
      target: 'https://clientes.domcloud.dev',
      changeOrigin: true,
    },
  },
}
```

### O que acontecia:

1. **Navegação normal (clicando em links)**: ✅ Funcionava
   - Vue Router intercepta a navegação
   - Muda a URL sem fazer requisição ao servidor
   - Renderiza o componente correto

2. **Atualizar página (F5)**: ❌ Erro 404
   - Navegador faz: `GET http://localhost:5173/auth/login`
   - Vite proxy intercepta (porque começa com `/auth`)
   - Vite envia para: `GET https://clientes.domcloud.dev/auth/login`
   - Backend responde: **404** (porque só tem `POST /auth/login`, não GET)

### Por que o proxy estava lá?

O proxy foi configurado para "evitar erros de CORS", mas **não era necessário** porque:
- O **axios** já está configurado para fazer requisições diretas para `https://clientes.domcloud.dev`
- O **backend já tem CORS configurado** corretamente
- O proxy só serve para interceptar requisições, mas estava interceptando as rotas do Vue Router também

## ✅ Solução Implementada

Removi o proxy de `/auth`, `/clientes` e `/servicos` do `vite.config.js`:

```javascript
// ✅ CONFIGURAÇÃO CORRETA (depois)
server: {
  // Sem proxy - axios faz requisições diretas para https://clientes.domcloud.dev
},
```

### Por que isso funciona:

1. **Rotas do Vue Router** (`/auth/login`, `/auth/register`, etc.):
   - São rotas de **UI** (interface do usuário)
   - Navegador faz `GET http://localhost:5173/auth/login`
   - Vite serve o `index.html`
   - Vue Router carrega e renderiza o componente correto ✅

2. **Rotas de API** (`POST /auth/login`, `GET /clientes`, etc.):
   - São chamadas **HTTP do axios**
   - axios.js já tem `baseURL: 'https://clientes.domcloud.dev'`
   - axios faz requisição direta: `POST https://clientes.domcloud.dev/auth/login`
   - Backend responde corretamente ✅

## 📋 O Que Você Precisa Fazer

### 1. Reiniciar o Servidor Vite

O Vite só recarrega as mudanças do `vite.config.js` quando reinicia:

```bash
# No terminal onde o Vite está rodando:
Ctrl + C  (para parar)

# Depois:
npm run dev
```

### 2. Testar

Depois de reiniciar o Vite, teste:

1. Acesse: `http://localhost:5173/auth/login`
2. Pressione **F5** (atualizar página)
3. Deve **continuar na tela de login** ✅
4. NÃO deve mostrar erro 404 ❌

Teste também:
- `http://localhost:5173/auth/register` + F5
- `http://localhost:5173/auth/forgot-password` + F5
- `http://localhost:5173/dashboard` + F5 (se estiver logado)

## 🎓 Conceitos Importantes

### O que é SPA (Single Page Application)?

- O Vue.js é um SPA: uma aplicação de página única
- O servidor (Vite ou backend em produção) serve **apenas o index.html**
- O Vue Router muda a URL no navegador **sem fazer requisição ao servidor**
- Quando você atualiza (F5), o navegador PEDE a URL ao servidor
- O servidor precisa retornar o **index.html** para qualquer rota do Vue Router

### Diferença entre Rotas de UI e Rotas de API

| Tipo | Exemplo | Método | Quem Lida |
|------|---------|--------|-----------|
| **Rota de UI** | `/auth/login` | GET (navegador) | Vue Router |
| **Rota de API** | `/auth/login` | POST (axios) | Backend Express |

Por isso o backend pode ter `POST /auth/login` (API) e o frontend pode ter `/auth/login` (UI) sem conflito!

### Quando Usar Proxy no Vite?

Só use proxy se:
1. Você **não quer** configurar CORS no backend
2. Você **quer** que o backend rode em `localhost:3000` e frontend em `localhost:5173`
3. Você **precisa** que as requisições pareçam vir do mesmo domínio

**Mas neste projeto NÃO precisamos** porque:
- ✅ Backend já tem CORS configurado
- ✅ Axios já faz requisições diretas
- ✅ Frontend e backend estão em domínios diferentes (e está tudo bem!)

## 🚀 Em Produção

Em produção, você fará o build do Vue.js:

```bash
npm run build
```

Isso gera a pasta `dist/` com:
- `index.html`
- `assets/` (JS, CSS, etc.)

Você coloca essa pasta `dist/` no servidor web (nginx, domcloud, etc.) e configura:

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**DomCloud (Apache):**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ /index.html [L]
```

Isso faz o servidor retornar `index.html` para qualquer rota que não seja um arquivo real, permitindo que o Vue Router funcione corretamente.

## 📝 Resumo

| Problema | Causa | Solução |
|----------|-------|---------|
| Erro 404 ao atualizar página | Vite proxy interceptava rotas do Vue Router | Remover proxy do vite.config.js |
| `/auth/login` retornava 404 | Proxy enviava GET para backend que só tem POST | Deixar Vue Router lidar com rotas de UI |

---

**Desenvolvido com ❤️ - Correção de SPA Routing**
