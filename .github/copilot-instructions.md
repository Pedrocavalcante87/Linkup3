## Sobre o projeto
LinkUp³ é uma plataforma de monitoramento e gestão de integrações ERP.
Permite que empresas acompanhem em tempo real o status de suas integrações,
gerenciem tickets, automações, financeiro e operacional em um único painel.

## Stack
- Frontend: React 18, Vite 5, TailwindCSS 3.4, Framer Motion, Recharts, React Router DOM 6
- Backend: Node.js, Express 5, Prisma 5, SQLite, JWT, bcryptjs
- Monorepo com workspaces: `linkup3/` (frontend) e `linkup3-api/` (backend)

## Arquitetura principal
- SyncContext: estado global, busca todos os dados via Promise.all, redistribui para a árvore React
- mockBackend: pseudo-backend em localStorage para modo offline/demo
- api.js: cliente HTTP único com injeção automática de JWT
- AIEngine: gera insights contextuais com base no snapshot atual
- AutomationEngine: motor de regras if-then disparado por eventos de integração

## Convenções de código
- React: functional components + hooks apenas, sem class components
- TypeScript não está em uso — manter JavaScript com JSDoc onde necessário
- Tailwind para estilização, sem CSS-in-JS
- Lazy loading obrigatório para todas as páginas internas
- Commits em português, padrão Conventional Commits (feat:, fix:, refactor:, docs:)

## Problemas conhecidos (não introduzir novos padrões que agravem estes)
- Dual-mode sem toggle: mockBackend e api.js coexistem sem flag VITE_USE_MOCK
- currentUser hardcoded em App.jsx: não reflete o JWT real
- Conflito de auth: isAuthenticated (localStorage) vs authToken (JWT) — não misturar os dois
- Sem rate limiting nas rotas /auth/login e /auth/register
- JWT_SECRET sem fallback seguro no backend

## O que evitar
- Não usar `var`, apenas `const` e `let`
- Não criar lógica de negócio dentro de componentes React
- Não duplicar estado já presente no SyncContext
- Não adicionar novas dependências sem documentar no ARCHITECTURE.md
- Não usar `any` implícito ou `console.log` em produção
