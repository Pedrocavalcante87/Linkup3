// ─────────────────────────────────────────────
// ROTAS DE TICKETS (CHAMADOS DE SUPORTE)
// GET    /tickets          — lista com filtros opcionais
// GET    /tickets/:id      — busca por ID
// POST   /tickets          — cria ticket
// PUT    /tickets/:id      — atualiza status/prioridade
// DELETE /tickets/:id      — remove (admin)
// ─────────────────────────────────────────────

const express = require('express')
const prisma = require('../lib/prisma')
const { autenticar, exigirRole } = require('../middleware/auth')

const router = express.Router()

router.use(autenticar)

// ── GET /tickets ───────────────────────────────
// Suporta filtros via query string:
// GET /tickets?status=aberto&prioridade=alta&integracaoId=xyz
router.get('/', async (req, res, next) => {
  try {
    const { status, prioridade, integracaoId } = req.query

    // "where" é construído dinamicamente — só filtra pelo que foi enviado
    const where = {}
    if (status)       where.status = status
    if (prioridade)   where.prioridade = prioridade
    if (integracaoId) where.integracaoId = integracaoId

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        integracao: { select: { id: true, nome: true, status: true } },
        user:       { select: { id: true, nome: true } }
      }
    })

    res.json(tickets)
  } catch (err) {
    next(err)
  }
})

// ── GET /tickets/:id ───────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: {
        integracao: true,
        user: { select: { id: true, nome: true, email: true } }
      }
    })

    if (!ticket) {
      return res.status(404).json({ erro: 'Ticket não encontrado' })
    }

    res.json(ticket)
  } catch (err) {
    next(err)
  }
})

// ── POST /tickets ──────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { titulo, descricao, prioridade, integracaoId, origem } = req.body

    if (!titulo) {
      return res.status(400).json({ erro: 'titulo é obrigatório' })
    }

    // Se integracaoId foi informado, verifica se existe
    if (integracaoId) {
      const integracao = await prisma.integracao.findUnique({ where: { id: integracaoId } })
      if (!integracao) {
        return res.status(404).json({ erro: 'Integração referenciada não existe' })
      }
    }

    const ticket = await prisma.ticket.create({
      data: {
        titulo,
        descricao,
        prioridade: prioridade || 'media',
        integracaoId: integracaoId || null,
        userId: req.usuario.id, // quem criou o ticket
        origem: origem || 'manual'
      }
    })

    res.status(201).json(ticket)
  } catch (err) {
    next(err)
  }
})

// ── PUT /tickets/:id ───────────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const { titulo, descricao, status, prioridade } = req.body

    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        ...(titulo     !== undefined && { titulo }),
        ...(descricao  !== undefined && { descricao }),
        ...(status     !== undefined && { status }),
        ...(prioridade !== undefined && { prioridade })
      }
    })

    res.json(ticket)
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ erro: 'Ticket não encontrado' })
    }
    next(err)
  }
})

// ── DELETE /tickets/:id ────────────────────────
router.delete('/:id', exigirRole('admin', 'analyst'), async (req, res, next) => {
  try {
    await prisma.ticket.delete({ where: { id: req.params.id } })
    res.json({ mensagem: 'Ticket removido com sucesso' })
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ erro: 'Ticket não encontrado' })
    }
    next(err)
  }
})

module.exports = router
