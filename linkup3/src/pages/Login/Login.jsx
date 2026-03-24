import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail, Loader2 } from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'
import { authAPI } from '../../services/api'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const MOCK_USERS = [
  { email: 'admin@linkup3.com',    senha: 'linkup3@2026', nome: 'Administrador LinkUp³', role: 'admin' },
  { email: 'analista@linkup3.com', senha: 'linkup3@2026', nome: 'Ana Lima',               role: 'analyst' },
  { email: 'usuario@linkup3.com',  senha: 'linkup3@2026', nome: 'Pedro Silva',            role: 'user' },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({ email: false, password: false })
  const navigate = useNavigate()
  const toast = useToast()
  const emailInputRef = useRef(null)

  useEffect(() => {
    emailInputRef.current?.focus()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({ email: false, password: false })

    const errors = {}
    if (!email.trim()) errors.email = true
    if (!password.trim()) errors.password = true

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      toast.error('Preencha todos os campos para continuar')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setFieldErrors({ ...fieldErrors, email: true })
      toast.error('Digite um e-mail válido')
      return
    }

    setLoading(true)

    if (USE_MOCK) {
      const user = MOCK_USERS.find(u => u.email === email && u.senha === password)
      if (!user) {
        setError('Credenciais inválidas')
        toast.error('E-mail ou senha incorretos')
        setLoading(false)
        return
      }
      const fakeToken = `mock.${btoa(JSON.stringify({ email: user.email, name: user.nome, role: user.role }))}.signature`
      localStorage.setItem('authToken', fakeToken)
      localStorage.setItem('linkup_user', JSON.stringify({ email: user.email, nome: user.nome, role: user.role }))
      toast.success('Login realizado com sucesso! Redirecionando...')
      setTimeout(() => navigate('/'), 600)
      return
    }

    try {
      // Chama a API real — POST /auth/login
      const { token, usuario } = await authAPI.login(email, password)

      // Salva o JWT real e os dados do usuário
      localStorage.setItem('authToken', token)
      localStorage.setItem('linkup_user', JSON.stringify(usuario))

      toast.success('Login realizado com sucesso! Redirecionando...')
      setTimeout(() => navigate('/'), 600)
    } catch (err) {
      setError(err.message || 'Credenciais inválidas')
      toast.error('E-mail ou senha incorretos')
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="card card-hover">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--primary)' }}>LinkUp³</h1>
            <p className="section-subtitle">Faça login para acessar o dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
                <input
                  ref={emailInputRef}
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setFieldErrors({ ...fieldErrors, email: false })
                  }}
                  placeholder="admin@linkup3.com"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    borderColor: fieldErrors.email ? 'var(--danger)' : 'var(--color-border)'
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-colors ${
                    fieldErrors.email
                      ? 'focus:ring-2'
                      : 'focus:ring-2'
                  }`}
                  aria-invalid={fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                />
              </div>
              {fieldErrors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600">
                  E-mail inválido
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setFieldErrors({ ...fieldErrors, password: false })
                  }}
                  placeholder="••••••"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    borderColor: fieldErrors.password ? 'var(--danger)' : 'var(--color-border)'
                  }}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2"
                  aria-invalid={fieldErrors.password}
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 rounded-lg text-sm border"
                style={{
                  backgroundColor: 'var(--danger-light)',
                  borderColor: 'var(--danger)',
                  color: 'var(--danger)'
                }}
                role="alert"
                aria-live="assertive"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              aria-label={loading ? 'Processando login' : 'Fazer login'}
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link
              to="/recuperar-senha"
              className="text-sm transition-colors hover:underline"
              style={{ color: 'var(--primary)' }}
            >
              Esqueceu a senha?
            </Link>
          </div>

          <div
            className="mt-6 pt-6 border-t text-center"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Credenciais de teste: <span className="font-medium">admin@linkup.com</span> / <span className="font-medium">123456</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
