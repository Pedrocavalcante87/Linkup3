// ─────────────────────────────────────────────
// ROTAS DE AUTOMAÇÕES — engine de regras
// GET    /automacoes          — lista automações
// GET    /automacoes/:id      — detalhes
// POST   /automacoes          — cria automação
// PUT    /automacoes/:id      — atualiza / ativa / desativa
// DELETE /automacoes/:id      — remove
// POST   /automacoes/:id/executar — executa manualmente
// ─────────────────────────────────────────────

const express = require('express')
const prisma = require('../lib/prisma')
const { autenticar, exigirRole } = require('../middleware/auth')

const router = express.Router()

router.use(autenticar)

// ── GET /automacoes ────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const automacoes = await prisma.automacao.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(automacoes)
  } catch (err) {
    next(err)
  }
})

// ── GET /automacoes/:id ────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const automacao = await prisma.automacao.findUnique({
      where: { id: req.params.id }
    })

    if (!automacao) {
      return res.status(404).json({ erro: 'Automação não encontrada' })
    }

    res.json(automacao)
  } catch (err) {
    next(err)
  }
})

// ── POST /automacoes ───────────────────────────
router.post('/', exigirRole('admin', 'analyst'), async (req, res, next) => {
  try {
    const { nome, descricao, triggerType, triggerCondicao, actionType, actionData } = req.body

    if (!nome || !triggerType || !actionType) {
      return res.status(400).json({ erro: 'nome, triggerType e actionType são obrigatórios' })
    }

    // triggerCondicao e actionData são objetos JSON — salvamos como string no SQLite
    const automacao = await prisma.automacao.create({
      data: {
        nome,
        descricao,
        triggerType,
        triggerCondicao: triggerCondicao ? JSON.stringify(triggerCondicao) : null,
        actionType,
        actionData: actionData ? JSON.stringify(actionData) : null
      }
    })

    res.status(201).json(automacao)
  } catch (err) {
    next(err)
  }
})

// ── PUT /automacoes/:id ────────────────────────
router.put('/:id', exigirRole('admin', 'analyst'), async (req, res, next) => {
  try {
    const { nome, descricao, enabled, triggerType, triggerCondicao, actionType, actionData } = req.body

    const automacao = await prisma.automacao.update({
      where: { id: req.params.id },
      data: {
        ...(nome            !== undefined && { nome }),
        ...(descricao       !== undefined && { descricao }),
        ...(enabled         !== undefined && { enabled }),
        ...(triggerType     !== undefined && { triggerType }),
        ...(triggerCondicao !== undefined && { triggerCondicao: JSON.stringify(triggerCondicao) }),
        ...(actionType      !== undefined && { actionType }),
        ...(actionData      !== undefined && { actionData: JSON.stringify(actionData) })
      }
    })

    res.json(automacao)
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ erro: 'Automação não encontrada' })
    }
    next(err)
  }
})

// ── DELETE /automacoes/:id ─────────────────────
router.delete('/:id', exigirRole('admin'), async (req, res, next) => {
  try {
    await prisma.automacao.delete({ where: { id: req.params.id } })
    res.json({ mensagem: 'Automação removida com sucesso' })
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ erro: 'Automação não encontrada' })
    }
    next(err)
  }
})

// ── POST /automacoes/:id/executar ──────────────
// Execução manual de uma automação (para testes)
router.post('/:id/executar', exigirRole('admin', 'analyst'), async (req, res, next) => {
  try {
    const automacao = await prisma.automacao.findUnique({
      where: { id: req.params.id }
    })

    if (!automacao) {
      return res.status(404).json({ erro: 'Automação não encontrada' })
    }

    if (!automacao.enabled) {
      return res.status(400).json({ erro: 'Automação está desativada' })
    }

    // Incrementa o contador de execuções
    await prisma.automacao.update({
      where: { id: req.params.id },
      data: { executionCount: { increment: 1 } }
    })

    // Cria um log da execução manual
    await prisma.log.create({
      data: {
        nivel: 'INFO',
        mensagem: `Automação "${automacao.nome}" executada manualmente por ${req.usuario.nome}`,
        modulo: 'automacoes'
      }
    })

    res.json({
      mensagem: `Automação "${automacao.nome}" executada com sucesso`,
      executionCount: automacao.executionCount + 1
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
