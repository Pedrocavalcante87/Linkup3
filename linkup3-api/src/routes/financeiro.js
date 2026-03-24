// ─────────────────────────────────────────────
// ROTAS FINANCEIRAS
// GET  /financeiro/faturas         — lista faturas (com filtros)
// GET  /financeiro/faturas/:id     — busca fatura por ID
// POST /financeiro/faturas         — cria fatura
// PUT  /financeiro/faturas/:id     — atualiza status
// GET  /financeiro/stats           — KPIs: total, pago, vencido, inadimplência
// ─────────────────────────────────────────────

const express = require('express')
const prisma = require('../lib/prisma')
const { autenticar } = require('../middleware/auth')

const router = express.Router()

router.use(autenticar)

// ── GET /financeiro/stats ──────────────────────
// Retorna os totalizadores exibidos nos cards do Dashboard Financeiro
router.get('/stats', async (req, res, next) => {
  try {
    const faturas = await prisma.fatura.findMany()

    const totalFaturas  = faturas.length
    const totalValor    = faturas.reduce((s, f) => s + f.valor, 0)
    const pagas         = faturas.filter(f => f.status === 'paid')
    const vencidas      = faturas.filter(f => f.status === 'overdue')
    const abertas       = faturas.filter(f => f.status === 'open')

    const valorPago     = pagas.reduce((s, f)   => s + f.valor, 0)
    const valorVencido  = vencidas.reduce((s, f) => s + f.valor, 0)

    const taxaInadimplencia = totalFaturas > 0
      ? ((vencidas.length / totalFaturas) * 100).toFixed(1)
      : '0.0'

    res.json({
      totalFaturas,
      totalValor,
      valorPago,
      valorVencido,
      faturasPagas:   pagas.length,
      faturasVencidas: vencidas.length,
      faturasAbertas:  abertas.length,
      taxaInadimplencia: parseFloat(taxaInadimplencia)
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /financeiro/faturas ────────────────────
router.get('/faturas', async (req, res, next) => {
  try {
    const { status, clienteNome } = req.query

    const where = {}
    if (status)      where.status = status
    if (clienteNome) where.clienteNome = { contains: clienteNome }

    const faturas = await prisma.fatura.findMany({
      where,
      orderBy: { dataVencimento: 'desc' },
      include: {
        _count: { select: { registros: true } }
      }
    })

    res.json(faturas)
  } catch (err) {
    next(err)
  }
})

// ── GET /financeiro/faturas/:id ────────────────
router.get('/faturas/:id', async (req, res, next) => {
  try {
    const fatura = await prisma.fatura.findUnique({
      where: { id: req.params.id },
      include: { registros: true }
    })

    if (!fatura) {
      return res.status(404).json({ erro: 'Fatura não encontrada' })
    }

    res.json(fatura)
  } catch (err) {
    next(err)
  }
})

// ── POST /financeiro/faturas ───────────────────
router.post('/faturas', async (req, res, next) => {
  try {
    const { descricao, valor, dataVencimento, clienteNome, status } = req.body

    if (!descricao || !valor || !dataVencimento) {
      return res.status(400).json({ erro: 'descricao, valor e dataVencimento são obrigatórios' })
    }

    if (isNaN(parseFloat(valor))) {
      return res.status(400).json({ erro: 'valor deve ser um número' })
    }

    const fatura = await prisma.fatura.create({
      data: {
        descricao,
        valor: parseFloat(valor),
        dataVencimento: new Date(dataVencimento),
        clienteNome,
        status: status || 'open'
      }
    })

    res.status(201).json(fatura)
  } catch (err) {
    next(err)
  }
})

// ── PUT /financeiro/faturas/:id ────────────────
router.put('/faturas/:id', async (req, res, next) => {
  try {
    const { descricao, valor, status, dataVencimento, clienteNome } = req.body

    const fatura = await prisma.fatura.update({
      where: { id: req.params.id },
      data: {
        ...(descricao      !== undefined && { descricao }),
        ...(valor          !== undefined && { valor: parseFloat(valor) }),
        ...(status         !== undefined && { status }),
        ...(dataVencimento !== undefined && { dataVencimento: new Date(dataVencimento) }),
        ...(clienteNome    !== undefined && { clienteNome })
      }
    })

    res.json(fatura)
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ erro: 'Fatura não encontrada' })
    }
    next(err)
  }
})

module.exports = router
