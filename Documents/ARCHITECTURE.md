# Arquitetura do LinkUp³

## Estrutura do monorepo
- `linkup3/` — SPA React (frontend)
- `linkup3-api/` — API REST Node.js (backend)
- `Documents/` — documentação do projeto

## Decisões técnicas

### Frontend
- **SPA com React Router DOM 6:** todas as rotas são client-side, exceto autenticação
- **Snapshot-driven state:** um único objeto `snapshot` centraliza todos os dados, populado pelo SyncContext
- **Lazy loading universal:** todas as páginas internas usam `React.lazy()` com `<Suspense>`
- **Provider nesting:** ThemeProvider → SyncProvider → ToastProvider → NotificationsProvider → OnboardingProvider
- **Modo dual (online/offline):** api.js (backend real) ou mockBackend (localStorage) — controlado por VITE_USE_MOCK

### Backend
- **Express 5 + Prisma 5:** rotas RESTful com ORM para SQLite
- **JWT + RBAC:** autenticação stateless, autorização por role via middleware `exigirRole`
- **SQLite em desenvolvimento:** adequado para MVP, migrar para PostgreSQL antes de produção
- **Swagger/OpenAPI:** documentação das rotas disponível via swagger-ui-express

## Dependências principais
| Pacote | Versão | Motivo |
|--------|--------|--------|
| react | 18.2 | Framework UI |
| vite | 5.x | Build tool |
| tailwindcss | 3.4 | Estilização |
| framer-motion | 12.x | Animações |
| recharts | 2.6 | Gráficos |
| express | 5.x | HTTP framework |
| prisma | 5.22 | ORM |
| jsonwebtoken | 9.x | Autenticação |

## Próxima migração recomendada
- SQLite → PostgreSQL antes de produção
- Adicionar Redis para cache de sessão e rate limiting
