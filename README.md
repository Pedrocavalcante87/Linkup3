# LinkUp³

Plataforma de monitoramento e gestão de integrações ERP em tempo real.

## Funcionalidades

- Dashboard com KPIs, uptime e saúde das integrações
- Monitoramento em tempo real com abertura automática de tickets
- Motor de automações (if-then) baseado em eventos
- AIEngine com insights contextuais sobre o sistema
- Central de notificações por severidade
- Módulos de financeiro, operacional e logs
- Onboarding guiado com checklist interativo
- Modo offline completo via localStorage (ideal para demo)

## Stack

| Camada   | Tecnologia                                   |
| -------- | -------------------------------------------- |
| Frontend | React 18, Vite 5, TailwindCSS, Framer Motion |
| Gráficos | Recharts                                     |
| Backend  | Node.js, Express 5                           |
| ORM      | Prisma 5 + SQLite                            |
| Auth     | JWT + RBAC                                   |
| Docs API | Swagger / OpenAPI                            |

## Como rodar

### Modo demo (sem backend)

```bash
cd linkup3
cp .env.example .env   # VITE_USE_MOCK=true já está ativado
npm install
npm run dev
```

Acesse `http://localhost:5173` — funciona completamente sem servidor.

### Modo completo (frontend + backend)

**Backend:**

```bash
cd linkup3-api
cp .env.example .env   # preencha JWT_SECRET
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

**Frontend:**

```bash
cd linkup3
# edite .env e defina VITE_USE_MOCK=false
npm install
npm run dev
```

## Estrutura do projeto

```
linkup3_full/
├── linkup3/          # Frontend React (SPA)
├── linkup3-api/      # Backend Express + Prisma
└── Documents/        # Documentação técnica
```

## Arquitetura

- **SyncContext** — estado global centralizado, sincroniza todos os dados via `Promise.all`
- **mockBackend** — pseudo-backend em localStorage para modo offline
- **AIEngine** — gera insights contextuais com base no snapshot atual
- **AutomationEngine** — motor de regras if-then disparado por eventos de integração
- **RBAC** — controle de acesso por role via middleware JWT
