# 🛠️ Configuração para Desenvolvimento Local

Este documento explica como configurar o ambiente de desenvolvimento local para evitar erros de CORS e outras issues.

---

## 🚨 Problema Resolvido

Ao rodar o frontend em `http://localhost:5173` e tentar acessar a API em `https://clientes.domcloud.dev`, você recebia:

```
Access to XMLHttpRequest at 'https://clientes.domcloud.dev/api/csrf-token'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

---

## ✅ Solução Implementada

### 1. **Proxy no Vite** (já configurado)

O arquivo `vite.config.js` agora inclui configuração de proxy que redireciona requisições locais para o backend de produção:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'https://clientes.domcloud.dev',
      changeOrigin: true,
      secure: true,
    },
    '/auth': {
      target: 'https://clientes.domcloud.dev',
      changeOrigin: true,
      secure: true,
    },
    '/clientes': {
      target: 'https://clientes.domcloud.dev',
      changeOrigin: true,
      secure: true,
    },
    '/servicos': {
      target: 'https://clientes.domcloud.dev',
      changeOrigin: true,
      secure: true,
    },
  },
}
```

### 2. **Configurar Variáveis de Ambiente**

Crie um arquivo `.env.local` na raiz do projeto `meu-projeto-vue/`:

```bash
# Arquivo: meu-projeto-vue/.env.local

# URL da API Backend - vazio para usar caminhos relativos (proxy)
VITE_API_URL=

# Timeout das requisições HTTP
VITE_API_TIMEOUT=30000

# Habilitar logs de debug em desenvolvimento
VITE_ENABLE_DEBUG=true

# Tempo de expiração do token
VITE_TOKEN_EXPIRY=3600000
```

**Importante:** O arquivo `.env.local` **NÃO** é versionado (está no `.gitignore`), então você precisa criá-lo manualmente.

---

## 📝 Como Criar o Arquivo

### Opção 1: Via Terminal

```bash
cd meu-projeto-vue
cat > .env.local << 'EOF'
# Configuração para Desenvolvimento Local
VITE_API_URL=
VITE_API_TIMEOUT=30000
VITE_ENABLE_DEBUG=true
VITE_TOKEN_EXPIRY=3600000
EOF
```

### Opção 2: Copiar do Exemplo

```bash
cd meu-projeto-vue
cp .env.example .env.local
# Depois edite .env.local e deixe VITE_API_URL vazio
```

### Opção 3: Criar Manualmente

1. Abra seu editor
2. Crie arquivo `meu-projeto-vue/.env.local`
3. Cole o conteúdo acima
4. Salve o arquivo

---

## 🚀 Como Usar

### 1. Instale as Dependências (se ainda não instalou)

```bash
cd meu-projeto-vue
npm install
```

### 2. Crie o Arquivo `.env.local`

Use uma das opções acima.

### 3. Inicie o Servidor de Desenvolvimento

```bash
npm run dev
```

### 4. Acesse a Aplicação

Abra o navegador em: **http://localhost:5173**

---

## 🔍 Como Funciona

### Fluxo de Requisições:

1. **Frontend faz requisição:**
   ```
   GET http://localhost:5173/api/csrf-token
   ```

2. **Vite Proxy intercepta e redireciona:**
   ```
   GET https://clientes.domcloud.dev/api/csrf-token
   ```

3. **Backend responde:**
   ```
   200 OK { csrfToken: "abc123..." }
   ```

4. **Proxy retorna para o frontend:**
   ```
   Frontend recebe a resposta sem erro de CORS
   ```

### Diferenças entre Ambientes:

| Ambiente | URL Base | Como Funciona |
|----------|----------|---------------|
| **Desenvolvimento** | `` (vazio) | Usa caminhos relativos + proxy do Vite |
| **Produção** | `https://clientes.domcloud.dev` | Usa URL completa diretamente |

---

## 🐛 Troubleshooting

### Erro: "429 Too Many Requests"

**Causa:** Múltiplas requisições rápidas ao endpoint CSRF.

**Solução:**
1. Espere 1 minuto (rate limit reseta)
2. Recarregue a página
3. Tente fazer login novamente

### Erro: "Network Error" ou "ERR_NETWORK"

**Causa:** Servidor de desenvolvimento não foi reiniciado após criar `.env.local`.

**Solução:**
1. Pressione `Ctrl+C` no terminal onde o Vite está rodando
2. Execute `npm run dev` novamente
3. Aguarde inicialização completa
4. Tente novamente

### Erro: CORS ainda aparecendo

**Causa:** `.env.local` não foi criado ou `VITE_API_URL` não está vazio.

**Verificar:**
```bash
cd meu-projeto-vue
cat .env.local
```

Deve mostrar `VITE_API_URL=` (sem valor).

**Corrigir:**
```bash
# Edite o arquivo e deixe a linha assim:
VITE_API_URL=
```

### Proxy não está funcionando

**Verificar configuração:**
```bash
cd meu-projeto-vue
cat vite.config.js | grep -A 20 "server:"
```

Deve mostrar a configuração de proxy.

**Reiniciar servidor:**
```bash
# Pare o servidor (Ctrl+C)
npm run dev
```

---

## 📌 Notas Importantes

### Arquivo `.env.local`

- ✅ **É ignorado pelo Git** (não será commitado)
- ✅ **Sobrescreve** `.env.example`
- ✅ **Específico para seu ambiente local**
- ❌ **NÃO compartilhe** este arquivo (pode conter dados sensíveis)

### Produção vs Desenvolvimento

- **Desenvolvimento:** Proxy redireciona requisições localmente
- **Produção:** Aplicação faz requisições diretamente para o backend
- **Build:** Use `npm run build` - gera arquivos otimizados para produção

---

## 🎯 Checklist de Setup

- [ ] Clonar repositório
- [ ] Instalar dependências: `npm install`
- [ ] Criar `.env.local` com `VITE_API_URL=` vazio
- [ ] Iniciar servidor: `npm run dev`
- [ ] Acessar: http://localhost:5173
- [ ] Testar login
- [ ] Verificar console do navegador (sem erros de CORS)

---

## 🔗 Links Úteis

- [Documentação do Vite - Server Proxy](https://vitejs.dev/config/server-options.html#server-proxy)
- [Variáveis de Ambiente no Vite](https://vitejs.dev/guide/env-and-mode.html)
- [CORS - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## 📞 Suporte

Se ainda estiver com problemas:

1. Verifique se o backend está online: https://clientes.domcloud.dev/api/csrf-token
2. Limpe cache do navegador: `Ctrl+Shift+Delete` → Limpar cache
3. Limpe node_modules: `rm -rf node_modules && npm install`
4. Verifique logs do console no navegador (F12)

---

**Última atualização:** 12 de novembro de 2025
