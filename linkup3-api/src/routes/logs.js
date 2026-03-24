// ─────────────────────────────────────────────
// ROTAS DE LOGS
// GET    /logs           — lista com filtros (nivel, modulo)
// POST   /logs           — cria log
// DELETE /logs/limpar    — remove logs mais antigos que X dias (admin)
// ─────────────────────────────────────────────

const express = require('express')
const prisma = require('../lib/prisma')
const { autenticar, exigirRole } = require('../middleware/auth')

const router = express.Router()

router.use(autenticar)

// ── GET /logs ──────────────────────────────────
// Suporta paginação: /logs?pagina=1&limite=50
// e filtros: /logs?nivel=ERROR&modulo=pagamentos
router.get('/', async (req, res, next) => {
  try {
    const { nivel, modulo, integracaoId, pagina = '1', limite = '50' } = req.query

    const where = {}
    if (nivel)        where.nivel = nivel.toUpperCase()
    if (modulo)       where.modulo = { contains: modulo }
    if (integracaoId) where.integracaoId = integracaoId

    const skip = (parseInt(pagina) - 1) * parseInt(limite)

    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limite),
        include: {
          integracao: { select: { id: true, nome: true } }
        }
      }),
      prisma.log.count({ where })
    ])

    // Promise.all() roda as duas queries ao mesmo tempo (em paralelo)
    // Em vez de esperar uma terminar para começar a outra

    res.json({
      logs,
      total,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(total / parseInt(limite))
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /logs ─────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { nivel, mensagem, modulo, integracaoId } = req.body

    if (!nivel || !mensagem) {
      return res.status(400).json({ erro: 'nivel e mensagem são obrigatórios' })
    }

    const niveisValidos = ['INFO', 'WARN', 'ERROR']
    if (!niveisValidos.includes(nivel.toUpperCase())) {
      return res.status(400).json({ erro: `nivel deve ser: ${niveisValidos.join(', ')}` })
    }

    const log = await prisma.log.create({
      data: {
        nivel: nivel.toUpperCase(),
        mensagem,
        modulo,
        integracaoId: integracaoId || null
      }
    })

    res.status(201).json(log)
  } catch (err) {
    next(err)
  }
})

// ── DELETE /logs/limpar ────────────────────────
// Remove logs mais antigos que "dias" dias (padrão: 30)
router.delete('/limpar', exigirRole('admin'), async (req, res, next) => {
  try {
    const dias = parseInt(req.query.dias || '30')
    const corte = new Date()
    corte.setDate(corte.getDate() - dias)

    const { count } = await prisma.log.deleteMany({
      where: { createdAt: { lt: corte } }
    })

    res.json({ mensagem: `${count} logs removidos (mais antigos que ${dias} dias)` })
  } catch (err) {
    next(err)
  }
})

module.exports = router
