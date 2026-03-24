# Problemas conhecidos

## Críticos (resolver antes de ir para produção)

### [C1] Dual-mode sem toggle explícito
- **Problema:** `SyncContext` importa `api.js` e `mockBackend` coexistem sem uma flag única
- **Risco:** Comportamento imprevisível entre ambientes
- **Fix sugerido:** Criar `.env` com `VITE_USE_MOCK=true/false` e usar `import.meta.env.VITE_USE_MOCK` como única fonte de verdade no SyncContext

### [C2] currentUser hardcoded em App.jsx
- **Problema:** `{ name: 'Pedro Cavalcante', role: 'Administrador' }` é estático
- **Risco:** Interface não reflete o usuário autenticado real
- **Fix sugerido:** Decodificar o JWT após login e popular o contexto de usuário com os dados reais

### [C3] Conflito de mecanismo de autenticação
- **Problema:** `localStorage.removeItem('isAuthenticated')` no logout conflita com `authToken` (JWT)
- **Risco:** Usuário pode ficar em estado inconsistente (logado em um mecanismo, deslogado em outro)
- **Fix sugerido:** Unificar em torno do JWT — remover `isAuthenticated` e usar apenas presença/validade do `authToken`

## Moderados (resolver antes de escalar usuários)

### [M1] Sem rate limiting na API
- **Problema:** Rotas `/auth/login` e `/auth/register` sem `express-rate-limit`
- **Fix sugerido:** `npm install express-rate-limit` e aplicar nas rotas de auth

### [M2] JWT_SECRET sem fallback seguro
- **Problema:** Se `process.env.JWT_SECRET` for undefined, tokens são gerados com secret inválido silenciosamente
- **Fix sugerido:** Adicionar validação no startup: `if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET não definido')`

### [M3] fakeData.js com side-effect de importação
- **Problema:** Import em `App.jsx` executa inicialização como efeito colateral
- **Fix sugerido:** Exportar função `initializeFakeData()` e chamá-la explicitamente

### [M4] Express 5.x em produção
- **Problema:** Ainda em release candidate, async error handling tem comportamento diferente do Express 4
- **Fix sugerido:** Documentar e testar o comportamento atual, ou fixar versão no package.json

## Menores

### [m1] Página Lab sem documentação
- Documentar propósito no ROADMAP.md

### [m2] build.log commitado
- Adicionar `build.log` ao `.gitignore`
