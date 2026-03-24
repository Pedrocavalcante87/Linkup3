// ─────────────────────────────────────────────
// PONTO DE ENTRADA DO SERVIDOR
// Este arquivo inicia o servidor e fica "escutando" por requisições.
// É o primeiro arquivo que o Node.js executa quando você roda "npm run dev".
// ─────────────────────────────────────────────

require('dotenv').config() // Carrega as variáveis do .env antes de tudo

if (!process.env.JWT_SECRET) {
  throw new Error('[LinkUp³] JWT_SECRET não definido. Configure o arquivo .env antes de iniciar o servidor.')
}

const app = require('./app')

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`\n🚀 LinkUp³ API rodando em http://localhost:${PORT}`)
  console.log(`📋 Ambiente: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🗄️  Banco: SQLite (prisma/dev.db)\n`)
})
