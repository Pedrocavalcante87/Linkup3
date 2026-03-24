# 🏗️ ARQUITETURA DO FRONTEND (`linkup3`)

**Versão:** 1.0 | **Atualizado:** 23/03/2026
**Stack:** React 18.2 + Vite 5 + TailwindCSS 3.4 + Framer Motion + Recharts

---

## 📐 Visão Geral

O frontend é uma SPA (Single Page Application) **orientada a contexto**, onde um estado global centralizado (snapshot) é distribuído para todos os componentes via React Context.

```
API (linkup3-api)
      ↓ polling a cada 15s
  SyncContext  ←── único ponto de busca de dados
      ↓
  snapshot { integracoes, tickets, logs, notifications, finance, ... }
      ↓
  NotificationsContext   ThemeContext   ToastContext
      ↓
  Páginas + Componentes (leem o snapshot via useSync())
```

---

## 🗂️ Estrutura de Pastas

```
linkup3/src/
├── App.jsx                ← Roteamento + providers + lazy loading
├── main.jsx               ← Ponto de entrada React
├── index.css              ← Import do Tailwind
│
├── services/
│   └── api.js             ← Cliente HTTP central (fetch + JWT + 401 handler)
│
├── contexts/
│   ├── SyncContext.jsx    ← Estado global: polling da API + distribuição do snapshot
│   ├── NotificationsContext.jsx  ← Gerencia notificações do usuário
│   ├── ToastContext.jsx   ← Toast messages (success/error/warning/info)
│   └── ThemeContext.jsx   ← Dark/light mode (localStorage)
│
├── hooks/
│   ├── useIntegrationRecovery.js ← Lógica reversa de recovery de integrações
│   ├── useAIInsights.js   ← Análise contextual com IA (insights automáticos)
│   ├── useAutomations.js  ← Gerencia automações e regras
│   ├── useHeatmap.js      ← Calcula heatmap de atividade
│   ├── useTelemetry.js    ← Rastreia eventos de uso (telemetria)
│   └── usePageMap.js      ← Mapa de navegação para breadcrumbs
│
├── store/
│   └── mockBackend.js     ← Backend simulado em localStorage (modo mock)
│
├── utils/
│   ├── fakeData.js        ← Dados fake para o mockBackend
│   ├── FakeEventsStream.js ← Gera eventos aleatórios a cada 10-25s (mock)
│   ├── systemHealth.js    ← Funções de cálculo de saúde de integrações
│   ├── testActions.js     ← Comandos de teste globais (TEST_RESTORE, etc.)
│   ├── insights.js        ← Gerador de insights contextuais
│   ├── getNomeOrigem.js   ← Normaliza nomes de origem de integrações
│   └── widgetConfig.js    ← Configuração dos widgets do dashboard
│
├── components/
│   ├── layout/            ← Sidebar, Navbar, Topbar, Breadcrumbs, PageContainer
│   ├── ui/                ← CardStat, Table, Skeleton, BadgeStatus, SearchModal, etc.
│   ├── charts/            ← BarChart, LineChart (wrappers do Recharts)
│   ├── auth/              ← ProtectedRoute
│   └── notifications/     ← Componentes do painel de notificações
│
├── pages/
│   ├── Dashboard/         ← Cards de KPI, gráficos, resumo do sistema
│   ├── Prioridades/       ← Central de prioridades (tickets críticos filtrados)
│   ├── Integracoes/       ← Lista e gerenciamento de integrações
│   ├── Tickets/           ← Chamados com busca inteligente e filtros
│   ├── Financeiro/        ← Faturas, KPIs financeiros
│   ├── Operacional/       ← Registros operacionais e conciliação
│   ├── Logs/              ← Log viewer com paginação
│   ├── Notifications/     ← Central de notificações
│   ├── Automations/       ← Gerenciamento de automações
│   ├── Lab/               ← Área experimental/testes
│   ├── Profile/           ← Perfil do usuário
│   ├── Login/             ← Tela de login
│   └── RecoverPassword/   ← Recuperação de senha
│
├── onboarding/            ← Fluxo de onboarding guiado (checklist + tutorial)
├── ai/                    ← AIEngine.js (análise de contexto, insights de IA)
├── automations/           ← AutomationEngine.js (motor de regras)
├── telemetry/             ← TelemetryEvents.js (rastreamento de eventos)
└── auth/                  ← SessionManager.js (persistência de sessão)
```

---

## 🔄 Mock Backend vs API Real — Diferença crucial

> Esta é a distinção mais importante de entender antes de evoluir o projeto.

### Mock Backend (`store/mockBackend.js`)

- Armazena todos os dados em **localStorage** do navegador
- Simula operações de leitura/escrita sem nenhum servidor
- Gera eventos aleatórios via `FakeEventsStream.js` (simula integrações falhando/recuperando)
- Expõe funções de teste globais: `TEST_RESTORE()`, `TEST_DEGRADE()`, `TEST_FULL_CYCLE()`
- **Ainda ativo** no projeto — inicializado via `import './utils/fakeData'` no `App.jsx`

### API Real (`services/api.js` + `linkup3-api`)

- Comunicação HTTP real com o backend Express
- Autenticação JWT real
- Dados persistidos em SQLite via Prisma
- O `SyncContext` já usa a API real — faz polling das rotas REST

### Estado atual da coexistência

```
App.jsx
├── import './utils/fakeData'     ← INICIALIZA os dados mock no localStorage
├── import './utils/testActions'  ← REGISTRA comandos de teste (TEST_*)
│
└── SyncProvider (SyncContext)    ← POLLING NA API REAL a cada 15s
    └── fetchSnapshot()           ← Chama todas as rotas REST
```

**O problema atual:** O frontend importa o `fakeData` (que popula o localStorage), mas o `SyncContext` busca dados da API real. As **páginas** leem dados do snapshot do `SyncContext` (API real). Porém, algumas funções do mockBackend ainda podem ser chamadas por hooks específicos (como `useIntegrationRecovery`).

**Direção de evolução:** remover progressivamente as importações do mock conforme as funcionalidades forem migradas para a API real.

---

## 🌐 SyncContext — O coração do frontend

**Arquivo:** `src/contexts/SyncContext.jsx`

É o único contexto que vai à rede. Define:

```javascript
// O que expõe para o app:
const { snapshot, loading, error, refetch } = useSync();
```

### Como funciona o polling

```javascript
// SyncProvider faz polling automático:
useEffect(() => {
  fetchSnapshot(); // busca imediata ao montar
  const id = setInterval(fetchSnapshot, intervalMs); // padrão: 15s
  return () => clearInterval(id);
}, []);
```

### O que é o `snapshot`

```javascript
snapshot = {
  integrations:  [...],   // para o Dashboard
  integracoes:   [...],   // para Integrações/Tickets
  logs:          [...],
  notifications: [...],
  notificationsUnread: 3,
  tickets:       [...],
  finance: {
    faturas: [...],
    totalValor, valorPago, valorVencido, taxaInadimplencia, ...
  },
  operations: {
    registros: [...],
    ...stats
  },
  automacoes:    [...],
  lastSynced:    "2026-03-23T15:00:00.000Z"
}
```

### Como as páginas consomem

```javascript
// Em qualquer página ou componente:
import { useSync } from "../../contexts/SyncContext";

function MinhaPagina() {
  const { snapshot, loading, refetch } = useSync();
  const tickets = snapshot?.tickets || [];
  // ...
}
```

---

## 🔔 NotificationsContext

**Arquivo:** `src/contexts/NotificationsContext.jsx`

Lê do snapshot e adiciona operações de escrita via API:

```javascript
const { notifications, pushNotification, markAsRead, markAllAsRead } =
  useNotifications();
```

- `pushNotification()` → adiciona localmente + toast automático para erros
- `markAsRead(id)` → chama `PUT /notificacoes/:id/lida`
- `markAllAsRead()` → chama `PUT /notificacoes/marcar-todas`

---

## 🎨 ThemeContext

```javascript
const { theme, toggleTheme } = useTheme();
// theme: 'light' | 'dark'
```

Persiste em localStorage. Aplica classe `dark` no `<html>`.

---

## 🍞 ToastContext

```javascript
const toast = useToast();
toast.success("Operação realizada!");
toast.error("Falha na integração");
toast.warning("Atenção necessária");
toast.info("Informação disponível");
```

---

## 🪝 Hooks Customizados

### `useIntegrationRecovery`

- Gerencia mudanças de status de integrações
- Executa lógica reversa: ao recuperar (`error → ok`), fecha tickets, cria logs de sucesso, dispara notificações positivas
- **Status:** usa mockBackend internamente — precisa ser migrado para API real

### `useAIInsights`

- Analisa o snapshot atual e gera insights contextuais
- Ex: "3 integrações em estado crítico — risco de indisponibilidade"
- Baseado em `utils/insights.js` + `ai/AIEngine.js`

### `useAutomations`

- Interface com o `AutomationEngine.js`
- Lista, ativa/desativa e executa automações configuradas

### `useHeatmap`

- Calcula a frequência de eventos por hora/dia
- Usado no Dashboard para o componente de heatmap de atividade

### `useTelemetry`

- Registra eventos de uso (navegação, ações do usuário)
- Persiste em localStorage via `TelemetryEvents.js`
- Usado para análise de comportamento

### `usePageMap`

- Retorna o mapa de páginas com títulos, ícones e rotas
- Alimenta `Breadcrumbs`, `SearchModal` e a Sidebar

---

## 🖥️ Roteamento (`App.jsx`)

Todas as páginas usam **lazy loading** com `React.lazy()` + `Suspense`:

```javascript
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'))
// ...
<Suspense fallback={<LoaderPage />}>
  <Routes>
    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    ...
  </Routes>
</Suspense>
```

`ProtectedRoute` verifica se há token em localStorage. Sem token → redirect para `/login`.

**Rotas disponíveis:**

| Rota               | Página          | Protegida |
| ------------------ | --------------- | --------- |
| `/login`           | Login           | ❌        |
| `/recuperar-senha` | RecoverPassword | ❌        |
| `/`                | Dashboard       | ✅        |
| `/prioridades`     | Prioridades     | ✅        |
| `/integracoes`     | Integracoes     | ✅        |
| `/tickets`         | Tickets         | ✅        |
| `/financeiro`      | Financeiro      | ✅        |
| `/operacional`     | Operacional     | ✅        |
| `/logs`            | Logs            | ✅        |
| `/notificacoes`    | Notifications   | ✅        |
| `/automacoes`      | Automations     | ✅        |
| `/lab`             | Lab             | ✅        |
| `/perfil`          | Profile         | ✅        |

---

## 🧩 Cliente HTTP — `services/api.js`

Centraliza toda comunicação com o backend:

```javascript
import {
  integracoesAPI,
  ticketsAPI,
  logsAPI,
  notificacoesAPI,
  financeiroAPI,
  operacionalAPI,
  automacoesAPI,
  authAPI,
} from "../services/api";

// Exemplos:
await authAPI.login(email, senha);
await integracoesAPI.listar();
await ticketsAPI.listar({ status: "aberto", prioridade: "alta" });
await notificacoesAPI.marcarLida(id);
```

**Comportamento padrão:**

- Injeta `Authorization: Bearer <token>` automaticamente em todas as requisições
- Em resposta `401` → limpa localStorage e força redirect para `/login`
- URL base configurável via `VITE_API_URL` (padrão: `http://localhost:3001`)

---

## 🏗️ Design System

Definido em `src/styles/theme.css` + `tailwind.config.js`.

**Variáveis CSS principais:**

```css
--primary, --primary-light
--success, --success-light
--warning, --warning-light
--danger, --danger-light
--info, --info-light
--bg-primary, --bg-secondary, --bg-card
--text-primary, --text-secondary, --text-muted
--border, --border-light
```

**Classes utilitárias criadas:**

- `.card` — container padrão com sombra e border
- `.btn-primary`, `.btn-secondary`, `.btn-danger`
- `.section-title`, `.section-subtitle`
- `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-info`

---

## ⚡ Comandos de Teste (modo mock)

Disponíveis no console do navegador (F12):

```javascript
TEST_RESTORE("int-001"); // Simula recovery de uma integração
TEST_DEGRADE("int-001"); // Simula degradação gradual (ok → warn → error)
TEST_FULL_CYCLE("int-001"); // Ciclo completo: degrade + restore
TEST_MULTIPLE_ERRORS(); // Coloca 3-5 integrações em erro simultâneo
TEST_LIST_INTEGRATIONS(); // Lista IDs disponíveis para testes
VALIDATE_SNAPSHOT(); // Valida integridade do snapshot atual
TEST_HELP(); // Exibe todos os comandos disponíveis
```

> Estes comandos operam no **mockBackend** (localStorage). Não afetam o banco de dados real.

---

## 📚 Ver também

- Como configurar e rodar: [SETUP.md](SETUP.md)
- Documentação do backend: [BACKEND_API.md](BACKEND_API.md)
- Sistema de Recovery: [RECOVERY_SYSTEM.md](RECOVERY_SYSTEM.md)
