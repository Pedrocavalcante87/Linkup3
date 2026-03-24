// ─────────────────────────────────────────────
// ROTAS OPERACIONAIS — registros e inconsistências
// GET  /operacional/registros       — lista registros (com filtros)
// GET  /operacional/registros/:id   — busca por ID
// POST /operacional/registros       — cria registro
// PUT  /operacional/registros/:id   — atualiza
// GET  /operacional/stats           — KPIs: total, inconsistentes, impacto financeiro
// ─────────────────────────────────────────────

const express = require('express')
const prisma = require('../lib/prisma')
const { autenticar } = require('../middleware/auth')

const router = express.Router()

router.use(autenticar)

// ── GET /operacional/stats ─────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    const registros = await prisma.registroOperacional.findMany()

    const total         = registros.length
    const inconsistentes = registros.filter(r => r.inconsistencia)
    const impactoTotal  = inconsistentes.reduce((s, r) => s + r.valor, 0)
    const altaSeveridade = inconsistentes.filter(r => r.severidade === 'alta').length

    res.json({
      total,
      totalInconsistentes: inconsistentes.length,
      impactoFinanceiro: impactoTotal,
      altaSeveridade
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /operacional/registros ─────────────────
router.get('/registros', async (req, res, next) => {
  try {
    const { inconsistencia, severidade } = req.query

    const where = {}
    if (inconsistencia !== undefined) where.inconsistencia = inconsistencia === 'true'
    if (severidade)                   where.severidade = severidade

    const registros = await prisma.registroOperacional.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        fatura: { select: { id: true, descricao: true, status: true } }
      }
    })

    res.json(registros)
  } catch (err) {
    next(err)
  }
})

// ── GET /operacional/registros/:id ─────────────
router.get('/registros/:id', async (req, res, next) => {
  try {
    const registro = await prisma.registroOperacional.findUnique({
      where: { id: req.params.id },
      include: { fatura: true }
    })

    if (!registro) {
      return res.status(404).json({ erro: 'Registro não encontrado' })
    }

    res.json(registro)
  } catch (err) {
    next(err)
  }
})

// ── POST /operacional/registros ────────────────
router.post('/registros', async (req, res, next) => {
  try {
    const { descricao, valor, inconsistencia, severidade, faturaId } = req.body

    if (!descricao) {
      return res.status(400).json({ erro: 'descricao é obrigatória' })
    }

    // Regra de negócio: severidade automática baseada no valor se não informada
    let severidadeFinal = severidade
    if (!severidadeFinal && inconsistencia) {
      severidadeFinal = parseFloat(valor || 0) > 200 ? 'alta' : 'media'
    }

    const registro = await prisma.registroOperacional.create({
      data: {
        descricao,
        valor: parseFloat(valor || 0),
        inconsistencia: inconsistencia || false,
        severidade: severidadeFinal || 'media',
        faturaId: faturaId || null
      }
    })

    res.status(201).json(registro)
  } catch (err) {
    next(err)
  }
})

// ── PUT /operacional/registros/:id ─────────────
router.put('/registros/:id', async (req, res, next) => {
  try {
    const { descricao, valor, inconsistencia, severidade, faturaId } = req.body

    const registro = await prisma.registroOperacional.update({
      where: { id: req.params.id },
      data: {
        ...(descricao     !== undefined && { descricao }),
        ...(valor         !== undefined && { valor: parseFloat(valor) }),
        ...(inconsistencia !== undefined && { inconsistencia }),
        ...(severidade    !== undefined && { severidade }),
        ...(faturaId      !== undefined && { faturaId })
      }
    })

    res.json(registro)
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ erro: 'Registro não encontrado' })
    }
    next(err)
  }
})

module.exports = router
