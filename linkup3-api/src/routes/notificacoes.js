// ─────────────────────────────────────────────
// ROTAS DE NOTIFICAÇÕES
// GET   /notificacoes              — lista notificações do usuário logado
// PUT   /notificacoes/:id/lida     — marca uma como lida
// PUT   /notificacoes/marcar-todas — marca todas como lidas
// DELETE /notificacoes/:id         — remove notificação
// POST  /notificacoes              — cria notificação (admin/sistema)
// ─────────────────────────────────────────────

const express = require('express')
const prisma = require('../lib/prisma')
const { autenticar, exigirRole } = require('../middleware/auth')

const router = express.Router()

router.use(autenticar)

// ── GET /notificacoes ──────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { lida } = req.query

    const where = { userId: req.usuario.id }
    if (lida !== undefined) where.lida = lida === 'true'

    const notificacoes = await prisma.notificacao.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    const totalNaoLidas = await prisma.notificacao.count({
      where: { userId: req.usuario.id, lida: false }
    })

    res.json({ notificacoes, totalNaoLidas })
  } catch (err) {
    next(err)
  }
})

// ── PUT /notificacoes/marcar-todas ─────────────
// Deve vir ANTES de /:id para o Express não confundir "marcar-todas" com um ID
router.put('/marcar-todas', async (req, res, next) => {
  try {
    const { count } = await prisma.notificacao.updateMany({
      where: { userId: req.usuario.id, lida: false },
      data: { lida: true }
    })

    res.json({ mensagem: `${count} notificações marcadas como lidas` })
  } catch (err) {
    next(err)
  }
})

// ── PUT /notificacoes/:id/lida ─────────────────
router.put('/:id/lida', async (req, res, next) => {
  try {
    const notificacao = await prisma.notificacao.findUnique({
      where: { id: req.params.id }
    })

    if (!notificacao) {
      return res.status(404).json({ erro: 'Notificação não encontrada' })
    }

    // Garante que o usuário só pode marcar as próprias notificações
    if (notificacao.userId !== req.usuario.id) {
      return res.status(403).json({ erro: 'Acesso negado' })
    }

    const atualizada = await prisma.notificacao.update({
      where: { id: req.params.id },
      data: { lida: true }
    })

    res.json(atualizada)
  } catch (err) {
    next(err)
  }
})

// ── DELETE /notificacoes/:id ───────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const notificacao = await prisma.notificacao.findUnique({
      where: { id: req.params.id }
    })

    if (!notificacao) {
      return res.status(404).json({ erro: 'Notificação não encontrada' })
    }

    if (notificacao.userId !== req.usuario.id && req.usuario.role !== 'admin') {
      return res.status(403).json({ erro: 'Acesso negado' })
    }

    await prisma.notificacao.delete({ where: { id: req.params.id } })
    res.json({ mensagem: 'Notificação removida' })
  } catch (err) {
    next(err)
  }
})

// ── POST /notificacoes ─────────────────────────
// Apenas admins e o próprio sistema criam notificações
router.post('/', exigirRole('admin'), async (req, res, next) => {
  try {
    const { titulo, mensagem, tipo, userId } = req.body

    if (!titulo) {
      return res.status(400).json({ erro: 'titulo é obrigatório' })
    }

    const notificacao = await prisma.notificacao.create({
      data: {
        titulo,
        mensagem,
        tipo: tipo || 'info',
        userId: userId || req.usuario.id
      }
    })

    res.status(201).json(notificacao)
  } catch (err) {
    next(err)
  }
})

module.exports = router
