// ─────────────────────────────────────────────
// SINGLETON DO PRISMA CLIENT
// "Singleton" = uma única instância compartilhada por toda a aplicação.
// Sem isso, cada arquivo que faz "new PrismaClient()" abriria uma conexão
// separada com o banco — o SQLite suporta poucas conexões simultâneas.
// ─────────────────────────────────────────────

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = prisma
