// ─────────────────────────────────────────────
// ROTAS DE AUTENTICAÇÃO
// POST /auth/register — cadastra novo usuário
// POST /auth/login    — faz login, retorna token JWT
// GET  /auth/me       — retorna dados do usuário logado
// ─────────────────────────────────────────────

const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')
const { autenticar } = require('../middleware/auth')

const router = express.Router()

// ── POST /auth/register ────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { email, nome, senha, role } = req.body

    if (!email || !nome || !senha) {
      return res.status(400).json({ erro: 'email, nome e senha são obrigatórios' })
    }

    // Verifica se já existe um usuário com esse email
    const existente = await prisma.user.findUnique({ where: { email } })
    if (existente) {
      return res.status(409).json({ erro: 'Email já cadastrado' })
    }

    // bcrypt.hash: transforma "minha_senha123" em algo como
    // "$2a$10$Xyz...abc" — hash irreversível. O "10" é o "salt rounds"
    // (quanto maior, mais seguro e mais lento — 10 é o padrão adequado)
    const senhaHash = await bcrypt.hash(senha, 10)

    const usuario = await prisma.user.create({
      data: {
        email,
        nome,
        senha: senhaHash,
        role: role || 'user'
      },
      select: { id: true, email: true, nome: true, role: true }
    })

    res.status(201).json({ mensagem: 'Usuário criado com sucesso', usuario })

  } catch (err) {
    next(err)
  }
})

// ── POST /auth/login ───────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, senha } = req.body

    if (!email || !senha) {
      return res.status(400).json({ erro: 'email e senha são obrigatórios' })
    }

    // Busca o usuário pelo email
    const usuario = await prisma.user.findUnique({ where: { email } })
    if (!usuario) {
      // Retornamos a mesma mensagem para email e senha inválidos
      // (não revelamos qual dos dois está errado — boa prática de segurança)
      return res.status(401).json({ erro: 'Email ou senha inválidos' })
    }

    // bcrypt.compare: compara a senha digitada com o hash salvo
    const senhaValida = await bcrypt.compare(senha, usuario.senha)
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' })
    }

    // jwt.sign: cria o token com os dados do usuário "dentro"
    // O token é uma string codificada em base64 — legível, mas apenas válido
    // se assinado com o JWT_SECRET correto
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        role: usuario.role
      }
    })

  } catch (err) {
    next(err)
  }
})

// ── GET /auth/me ───────────────────────────────
// Rota protegida — precisa do token JWT
router.get('/me', autenticar, (req, res) => {
  // req.usuario foi preenchido pelo middleware autenticar()
  res.json({ usuario: req.usuario })
})

module.exports = router
