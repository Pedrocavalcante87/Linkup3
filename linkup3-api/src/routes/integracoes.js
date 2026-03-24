// ─────────────────────────────────────────────
// ROTAS DE INTEGRAÇÕES
// GET    /integracoes          — lista todas
// GET    /integracoes/:id      — busca por ID
// POST   /integracoes          — cria nova (admin)
// PUT    /integracoes/:id      — atualiza status/dados
// DELETE /integracoes/:id      — remove (admin)
// ─────────────────────────────────────────────

const express = require('express')
const prisma = require('../lib/prisma')
const { autenticar, exigirRole } = require('../middleware/auth')

const router = express.Router()

// Todas as rotas desta seção exigem login
router.use(autenticar)

// ── GET /integracoes ───────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const integracoes = await prisma.integracao.findMany({
      orderBy: { nome: 'asc' },
      include: {
        _count: { select: { tickets: true, logs: true } }
      }
    })
    res.json(integracoes)
  } catch (err) {
    next(err)
  }
})

// ── GET /integracoes/:id ───────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const integracao = await prisma.integracao.findUnique({
      where: { id: req.params.id },
      include: {
        tickets: { where: { status: { not: 'resolvido' } }, orderBy: { createdAt: 'desc' }, take: 5 },
        logs:    { orderBy: { createdAt: 'desc' }, take: 10 }
      }
    })

    if (!integracao) {
      return res.status(404).json({ erro: 'Integração não encontrada' })
    }

    res.json(integracao)
  } catch (err) {
    next(err)
  }
})

// ── POST /integracoes ──────────────────────────
router.post('/', exigirRole('admin'), async (req, res, next) => {
  try {
    const { nome, descricao, origem, status } = req.body

    if (!nome) {
      return res.status(400).json({ erro: 'nome é obrigatório' })
    }

    const integracao = await prisma.integracao.create({
      data: { nome, descricao, origem, status: status || 'ok' }
    })

    res.status(201).json(integracao)
  } catch (err) {
    next(err)
  }
})

// ── PUT /integracoes/:id ───────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const { nome, descricao, status, uptime, taxaSucesso, origem } = req.body

    const integracao = await prisma.integracao.update({
      where: { id: req.params.id },
      data: {
        ...(nome        !== undefined && { nome }),
        ...(descricao   !== undefined && { descricao }),
        ...(status      !== undefined && { status }),
        ...(uptime      !== undefined && { uptime }),
        ...(taxaSucesso !== undefined && { taxaSucesso }),
        ...(origem      !== undefined && { origem })
      }
    })

    // Quando status muda para 'error', cria log automático
    if (status === 'error') {
      await prisma.log.create({
        data: {
          nivel: 'ERROR',
          mensagem: `Integração "${integracao.nome}" entrou em estado de ERRO`,
          modulo: 'integracoes',
          integracaoId: integracao.id
        }
      })
    }

    // Quando status volta para 'ok', cria log de recuperação
    if (status === 'ok') {
      await prisma.log.create({
        data: {
          nivel: 'INFO',
          mensagem: `Integração "${integracao.nome}" recuperada com sucesso`,
          modulo: 'integracoes',
          integracaoId: integracao.id
        }
      })
    }

    res.json(integracao)
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ erro: 'Integração não encontrada' })
    }
    next(err)
  }
})

// ── DELETE /integracoes/:id ────────────────────
router.delete('/:id', exigirRole('admin'), async (req, res, next) => {
  try {
    await prisma.integracao.delete({ where: { id: req.params.id } })
    res.json({ mensagem: 'Integração removida com sucesso' })
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ erro: 'Integração não encontrada' })
    }
    next(err)
  }
})

module.exports = router
