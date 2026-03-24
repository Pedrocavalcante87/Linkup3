# 🗄️ BACKEND — Documentação da API (`linkup3-api`)

**Versão:** 1.0 | **Atualizado:** 23/03/2026
**Status:** ⚠️ Em desenvolvimento ativo
**Stack:** Node.js + Express 5 + Prisma ORM + SQLite
**Swagger:** `http://localhost:3001/docs` (quando rodando)

---

## ⚠️ Estado Atual do Backend

O backend está **em desenvolvimento**. As rotas já estão implementadas e funcionando, mas:

- Algumas funcionalidades avançadas (ex: execução real de automações) retornam dados mockados
- Não há testes automatizados ainda
- O banco é SQLite local — adequado para dev, será substituído por PostgreSQL em produção

---

## 📐 Arquitetura Geral

```
linkup3-api/
├── src/
│   ├── index.js          ← Ponto de entrada (inicia servidor na porta 3001)
│   ├── app.js            ← Configuração do Express (middlewares + rotas)
│   ├── swagger.js        ← Especificação OpenAPI 3.0 completa
│   ├── lib/
│   │   └── prisma.js     ← Instância singleton do PrismaClient
│   ├── middleware/
│   │   └── auth.js       ← autenticar() + exigirRole()
│   └── routes/
│       ├── auth.js
│       ├── integracoes.js
│       ├── tickets.js
│       ├── financeiro.js
│       ├── logs.js
│       ├── notificacoes.js
│       ├── operacional.js
│       └── automacoes.js
└── prisma/
    ├── schema.prisma     ← Definição dos modelos do banco
    ├── seed.js           ← Dados iniciais para desenvolvimento
    └── dev.db            ← Banco SQLite (gerado automaticamente)
```

---

## 🗃️ Banco de Dados — Modelos (Prisma Schema)

### `User` — Usuários do sistema

| Campo       | Tipo           | Descrição                             |
| ----------- | -------------- | ------------------------------------- |
| `id`        | String (cuid)  | Identificador único                   |
| `email`     | String (único) | Login do usuário                      |
| `nome`      | String         | Nome de exibição                      |
| `senha`     | String         | Hash bcrypt — **nunca em texto puro** |
| `role`      | String         | `admin` \| `analyst` \| `user`        |
| `createdAt` | DateTime       | Data de criação                       |

### `Integracao` — Sistemas monitorados

| Campo         | Tipo          | Descrição                                   |
| ------------- | ------------- | ------------------------------------------- |
| `id`          | String (cuid) | Identificador único                         |
| `nome`        | String        | Nome da integração                          |
| `descricao`   | String?       | Descrição opcional                          |
| `status`      | String        | `ok` \| `warn` \| `error`                   |
| `uptime`      | Float         | Porcentagem de disponibilidade (0–100)      |
| `taxaSucesso` | Float         | Taxa de transações bem-sucedidas (0–100)    |
| `origem`      | String?       | Fornecedor/sistema de origem (ex: "Stripe") |

### `Ticket` — Chamados de suporte

| Campo          | Tipo          | Descrição                                 |
| -------------- | ------------- | ----------------------------------------- |
| `id`           | String (cuid) | Identificador único                       |
| `titulo`       | String        | Título do chamado                         |
| `descricao`    | String?       | Descrição completa                        |
| `status`       | String        | `aberto` \| `em_andamento` \| `resolvido` |
| `prioridade`   | String        | `baixa` \| `media` \| `alta`              |
| `origem`       | String?       | `manual` \| `automatico`                  |
| `integracaoId` | String?       | FK → `Integracao`                         |
| `userId`       | String?       | FK → `User`                               |

### `Log` — Eventos do sistema

| Campo          | Tipo          | Descrição                           |
| -------------- | ------------- | ----------------------------------- |
| `id`           | String (cuid) | Identificador único                 |
| `nivel`        | String        | `INFO` \| `WARN` \| `ERROR`         |
| `mensagem`     | String        | Texto do evento                     |
| `modulo`       | String?       | Módulo de origem (ex: "pagamentos") |
| `integracaoId` | String?       | FK → `Integracao`                   |

### `Notificacao` — Alertas por usuário

| Campo      | Tipo          | Descrição                                   |
| ---------- | ------------- | ------------------------------------------- |
| `id`       | String (cuid) | Identificador único                         |
| `titulo`   | String        | Título da notificação                       |
| `mensagem` | String?       | Corpo da notificação                        |
| `tipo`     | String        | `info` \| `success` \| `warning` \| `error` |
| `lida`     | Boolean       | Se o usuário já visualizou                  |
| `userId`   | String?       | FK → `User`                                 |

### `Fatura` — Gestão financeira

| Campo            | Tipo          | Descrição                     |
| ---------------- | ------------- | ----------------------------- |
| `id`             | String (cuid) | Identificador único           |
| `descricao`      | String        | Descrição da cobrança         |
| `valor`          | Float         | Valor em reais                |
| `status`         | String        | `open` \| `paid` \| `overdue` |
| `dataVencimento` | DateTime      | Data de vencimento            |
| `clienteNome`    | String?       | Nome do cliente               |

### `RegistroOperacional` — Conciliação de dados

| Campo            | Tipo          | Descrição                    |
| ---------------- | ------------- | ---------------------------- |
| `id`             | String (cuid) | Identificador único          |
| `descricao`      | String        | Descrição do registro        |
| `valor`          | Float         | Valor do registro            |
| `inconsistencia` | Boolean       | Se há divergência detectada  |
| `severidade`     | String        | `alta` \| `media` \| `baixa` |
| `faturaId`       | String?       | FK → `Fatura`                |

### `Automacao` — Regras automáticas

> Modelo presente no schema. Campos: `id`, `nome`, `descricao`, `ativa` (Boolean), `condicao` (String/JSON), `acao` (String/JSON), `ultimaExecucao` (DateTime?).

---

## 🔐 Autenticação — JWT

### Fluxo completo

```
1. POST /auth/login { email, senha }
        ↓
2. API valida senha com bcrypt.compare()
        ↓
3. API gera token: jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '8h' })
        ↓
4. Frontend armazena token em localStorage ('authToken')
        ↓
5. Todas as próximas requisições enviam:
   Header: Authorization: Bearer <token>
        ↓
6. Middleware autenticar() valida o token em cada rota protegida
```

### Middlewares disponíveis

```javascript
const { autenticar, exigirRole } = require("../middleware/auth");

// Exige token válido
router.get("/rota", autenticar, handler);

// Exige token válido E role específica
router.delete("/rota/:id", autenticar, exigirRole("admin"), handler);

// Múltiplos roles aceitos
router.post("/rota", autenticar, exigirRole("admin", "analyst"), handler);
```

### Payload do token JWT

```json
{
  "id": "cmmv1eqfw0001z9v59xiztuof",
  "email": "admin@linkup3.com",
  "role": "admin",
  "iat": 1711234567,
  "exp": 1711263367
}
```

---

## 📡 Rotas da API

> Todas as rotas (exceto `/auth/login` e `/auth/register`) exigem `Authorization: Bearer <token>`.

### Auth — `/auth`

| Método | Rota             | Role        | Descrição                       |
| ------ | ---------------- | ----------- | ------------------------------- |
| POST   | `/auth/login`    | público     | Login — retorna token JWT       |
| POST   | `/auth/register` | público     | Cadastra novo usuário           |
| GET    | `/auth/me`       | autenticado | Retorna dados do usuário logado |

**Exemplo de login:**

```json
POST /auth/login
{ "email": "admin@linkup3.com", "senha": "linkup3@2026" }

Resposta:
{
  "token": "eyJhbGci...",
  "usuario": { "id": "...", "nome": "Administrador LinkUp³", "email": "...", "role": "admin" }
}
```

---

### Integrações — `/integracoes`

| Método | Rota               | Role        | Descrição                                       |
| ------ | ------------------ | ----------- | ----------------------------------------------- |
| GET    | `/integracoes`     | autenticado | Lista todas (inclui contagem de tickets e logs) |
| GET    | `/integracoes/:id` | autenticado | Detalhes + tickets abertos + últimos 10 logs    |
| POST   | `/integracoes`     | admin       | Cria nova integração                            |
| PUT    | `/integracoes/:id` | autenticado | Atualiza status/dados                           |
| DELETE | `/integracoes/:id` | admin       | Remove integração                               |

**Campos de POST/PUT:**

```json
{
  "nome": "Gateway de Pagamento",
  "descricao": "Stripe — processamento de pagamentos",
  "status": "ok",
  "uptime": 99.8,
  "taxaSucesso": 98.5,
  "origem": "Stripe"
}
```

---

### Tickets — `/tickets`

| Método | Rota           | Role        | Descrição                   |
| ------ | -------------- | ----------- | --------------------------- |
| GET    | `/tickets`     | autenticado | Lista com filtros opcionais |
| GET    | `/tickets/:id` | autenticado | Detalhes do ticket          |
| POST   | `/tickets`     | autenticado | Cria ticket                 |
| PUT    | `/tickets/:id` | autenticado | Atualiza status/prioridade  |
| DELETE | `/tickets/:id` | admin       | Remove ticket               |

**Filtros disponíveis (query string):**

```
GET /tickets?status=aberto&prioridade=alta&integracaoId=xyz
```

---

### Financeiro — `/financeiro`

| Método | Rota                      | Role        | Descrição                                    |
| ------ | ------------------------- | ----------- | -------------------------------------------- |
| GET    | `/financeiro/stats`       | autenticado | KPIs: total, pago, vencido, inadimplência    |
| GET    | `/financeiro/faturas`     | autenticado | Lista faturas (filtros: status, clienteNome) |
| GET    | `/financeiro/faturas/:id` | autenticado | Detalhes da fatura com registros             |
| POST   | `/financeiro/faturas`     | autenticado | Cria fatura                                  |
| PUT    | `/financeiro/faturas/:id` | autenticado | Atualiza status da fatura                    |

**Resposta de `/financeiro/stats`:**

```json
{
  "totalFaturas": 25,
  "totalValor": 87500.0,
  "valorPago": 52000.0,
  "valorVencido": 12000.0,
  "faturasPagas": 15,
  "faturasVencidas": 4,
  "faturasAbertas": 6,
  "taxaInadimplencia": 16.0
}
```

---

### Logs — `/logs`

| Método | Rota           | Role        | Descrição                           |
| ------ | -------------- | ----------- | ----------------------------------- |
| GET    | `/logs`        | autenticado | Lista com paginação e filtros       |
| POST   | `/logs`        | autenticado | Cria log manualmente                |
| DELETE | `/logs/limpar` | admin       | Remove logs mais antigos que X dias |

**Filtros e paginação:**

```
GET /logs?nivel=ERROR&modulo=pagamentos&pagina=1&limite=50
```

**Resposta paginada:**

```json
{
  "logs": [...],
  "total": 342,
  "pagina": 1,
  "totalPaginas": 7
}
```

---

### Notificações — `/notificacoes`

| Método | Rota                         | Role          | Descrição                            |
| ------ | ---------------------------- | ------------- | ------------------------------------ |
| GET    | `/notificacoes`              | autenticado   | Lista notificações do usuário logado |
| PUT    | `/notificacoes/marcar-todas` | autenticado   | Marca todas como lidas               |
| PUT    | `/notificacoes/:id/lida`     | autenticado   | Marca uma como lida                  |
| POST   | `/notificacoes`              | admin/analyst | Cria notificação para um usuário     |
| DELETE | `/notificacoes/:id`          | autenticado   | Remove notificação                   |

> **Atenção:** A rota `PUT /notificacoes/marcar-todas` deve ser registrada **antes** de `PUT /notificacoes/:id/lida` no arquivo de rotas, para evitar que o Express interprete "marcar-todas" como um ID.

---

### Operacional — `/operacional`

| Método | Rota                         | Role        | Descrição                                 |
| ------ | ---------------------------- | ----------- | ----------------------------------------- |
| GET    | `/operacional/stats`         | autenticado | KPIs operacionais (inconsistências, etc.) |
| GET    | `/operacional/registros`     | autenticado | Lista registros com filtros               |
| POST   | `/operacional/registros`     | autenticado | Cria registro                             |
| PUT    | `/operacional/registros/:id` | autenticado | Atualiza registro                         |

---

### Automações — `/automacoes`

| Método | Rota                       | Role          | Descrição                   |
| ------ | -------------------------- | ------------- | --------------------------- |
| GET    | `/automacoes`              | autenticado   | Lista todas as automações   |
| GET    | `/automacoes/:id`          | autenticado   | Detalhes de uma automação   |
| POST   | `/automacoes`              | admin/analyst | Cria automação              |
| PUT    | `/automacoes/:id`          | admin/analyst | Atualiza / ativa / desativa |
| DELETE | `/automacoes/:id`          | admin         | Remove automação            |
| POST   | `/automacoes/:id/executar` | admin/analyst | Executa manualmente         |

---

## 🌱 Seed — Dados Iniciais

O `npm run seed` popula o banco com:

- **3 usuários** (admin, analista, user) — senha padrão: `linkup3@2026`
- **10 integrações** com status variados (ok, warn, error)
- Tickets, logs, notificações e faturas de exemplo

O seed usa `upsert` — pode ser executado várias vezes sem duplicar dados.

---

## 🔧 Variáveis de Ambiente

| Variável       | Obrigatória | Padrão        | Descrição                                            |
| -------------- | ----------- | ------------- | ---------------------------------------------------- |
| `DATABASE_URL` | ✅          | —             | Caminho do SQLite: `file:./prisma/dev.db`            |
| `JWT_SECRET`   | ✅          | —             | Chave secreta para tokens JWT (min 32 chars em prod) |
| `PORT`         | ❌          | `3001`        | Porta do servidor                                    |
| `NODE_ENV`     | ❌          | `development` | Ambiente de execução                                 |

---

## 🔗 Rotas que o Frontend Consome

O frontend (via `src/services/api.js`) consome exatamente estas rotas ao fazer o sync a cada 15 segundos:

```javascript
Promise.all([
  GET /integracoes
  GET /tickets
  GET /logs?limite=200
  GET /notificacoes
  GET /financeiro/faturas
  GET /operacional/registros
  GET /automacoes
  GET /financeiro/stats
  GET /operacional/stats
])
```

---

## 📚 Ver também

- Como configurar e rodar: [SETUP.md](SETUP.md)
- Arquitetura do frontend: [ARQUITETURA_FRONTEND.md](ARQUITETURA_FRONTEND.md)
- Swagger interativo: `http://localhost:3001/docs`
