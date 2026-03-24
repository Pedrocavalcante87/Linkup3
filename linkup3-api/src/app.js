// ─────────────────────────────────────────────
// CONFIGURAÇÃO DO EXPRESS
// Aqui: middlewares globais (cors, json parser) + todas as rotas registradas.
// "Middleware" = código que roda em TODA requisição antes de chegar na rota.
// ─────────────────────────────────────────────

const express = require('express')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./swagger')

const app = express()

// ── Middlewares globais ────────────────────────
// cors(): permite que o frontend (porta 5173) acesse esta API (porta 3001).
// Sem isso, o navegador bloquearia as requisições por "política de mesma origem".
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// express.json(): faz o Express entender o corpo das requisições em formato JSON.
// Sem isso, req.body seria undefined em POST/PUT.
app.use(express.json())

// ── Rota de health check ───────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Raiz redireciona para a documentação ───────
app.get('/', (req, res) => {
  res.redirect('/docs')
})

// ── Documentação Swagger ───────────────────────
// Disponível em: http://localhost:3001/docs
// Interface visual para explorar e testar todos os endpoints da API.
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'LinkUp³ API Docs',
  customCss: '.swagger-ui .topbar { background-color: #1e293b; }',
  swaggerOptions: {
    persistAuthorization: true, // mantém o token ao recarregar a página
  },
}))

// ── Rotas da API ───────────────────────────────
// Cada "require" carrega um arquivo de rotas.
// O primeiro argumento é o "prefixo" de todas as rotas daquele arquivo.
// Ex: "/auth" + "/login" = POST /auth/login
app.use('/auth',         require('./routes/auth'))
app.use('/integracoes',  require('./routes/integracoes'))
app.use('/tickets',      require('./routes/tickets'))
app.use('/financeiro',   require('./routes/financeiro'))
app.use('/logs',         require('./routes/logs'))
app.use('/notificacoes', require('./routes/notificacoes'))
app.use('/operacional',  require('./routes/operacional'))
app.use('/automacoes',   require('./routes/automacoes'))

// ── Tratamento de rota não encontrada (404) ────
app.use((req, res) => {
  res.status(404).json({ erro: `Rota ${req.method} ${req.path} não encontrada` })
})

// ── Tratamento global de erros ─────────────────
// Qualquer "throw" ou "next(error)" em qualquer rota cai aqui.
// O "err" como 1º parâmetro é o que distingue um error handler normal.
app.use((err, req, res, next) => {
  console.error('[ERRO]', err.message)
  const status = err.status || 500
  res.status(status).json({ erro: err.message || 'Erro interno do servidor' })
})

module.exports = app
