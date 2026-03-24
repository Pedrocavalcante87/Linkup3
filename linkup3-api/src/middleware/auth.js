// ─────────────────────────────────────────────
// MIDDLEWARE DE AUTENTICAÇÃO — verifica o JWT em cada rota protegida
//
// Como funciona o fluxo:
// 1. Frontend faz login → recebe um token JWT
// 2. Nas próximas requisições, frontend envia o token no cabeçalho:
//    Authorization: Bearer <token>
// 3. Este middleware intercepta, valida o token e libera ou bloqueia.
// ─────────────────────────────────────────────

const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')

// Middleware principal — aplique em rotas que exigem login
async function autenticar(req, res, next) {
  const authHeader = req.headers['authorization']

  // Verifica se o cabeçalho existe e segue o padrão "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de autenticação não fornecido' })
  }

  const token = authHeader.split(' ')[1] // pega só o token, sem o "Bearer "

  try {
    // jwt.verify lança uma exceção se o token for inválido ou expirado
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    // Busca o usuário no banco para garantir que ainda existe
    const usuario = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, nome: true, role: true }
      // select: não retorna a senha — boa prática
    })

    if (!usuario) {
      return res.status(401).json({ erro: 'Usuário não encontrado' })
    }

    // Disponibiliza o usuário para todas as próximas funções da rota
    req.usuario = usuario
    next() // chama a próxima função (a rota em si)

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ erro: 'Token expirado. Faça login novamente.' })
    }
    return res.status(401).json({ erro: 'Token inválido' })
  }
}

// Middleware de role — use APÓS autenticar() para restringir por perfil
// Exemplo de uso: router.delete('/:id', autenticar, exigirRole('admin'), handler)
function exigirRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.role)) {
      return res.status(403).json({
        erro: `Acesso negado. Necessário: ${roles.join(' ou ')}`
      })
    }
    next()
  }
}

module.exports = { autenticar, exigirRole }
