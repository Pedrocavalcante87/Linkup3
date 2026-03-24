import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'

export default function RecoverPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const toast = useToast()
  const emailInputRef = useRef(null)

  useEffect(() => {
    if (!success) {
      emailInputRef.current?.focus()
    }
  }, [success])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setEmailError(false)

    // Validação básica
    if (!email.trim()) {
      setEmailError(true)
      toast.error('Digite seu e-mail para continuar')
      return
    }

    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError(true)
      toast.error('Digite um e-mail válido')
      return
    }

    setLoading(true)

    const VALID_EMAIL = 'admin@linkup.com'

    setTimeout(() => {
      if (email === VALID_EMAIL) {
        setSuccess(true)
        toast.success('Link de recuperação enviado com sucesso!')
      } else {
        setError('E-mail não encontrado')
        toast.error('E-mail não cadastrado no sistema')
      }
      setLoading(false)
    }, 1000)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="card card-hover text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>E-mail Enviado!</h1>
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Enviamos um e-mail com instruções para redefinir sua senha para <strong>{email}</strong>
            </p>
            <Link to="/login" className="btn-primary w-full py-3 text-base inline-block">
              Voltar ao Login
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="card card-hover">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm mb-6 transition-colors" style={{ color: 'var(--color-text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}>
            <ArrowLeft className="w-4 h-4" />
            Voltar ao login
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary-700 mb-2">Recuperar Senha</h1>
            <p className="section-subtitle">Digite seu e-mail para receber instruções de recuperação</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
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
                    setEmailError(false)
                  }}
                  placeholder="admin@linkup.com"
                  className={`w-full pl-10 pr-4 py-3 border bg-white text-neutral-900 rounded-lg outline-none transition-colors ${
                    emailError
                      ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-500'
                      : 'border-neutral-200 focus:ring-2 focus:ring-primary-300 focus:border-primary-600'
                  }`}
                  aria-invalid={emailError}
                  aria-describedby={emailError ? 'email-error' : undefined}
                />
              </div>
              {emailError && (
                <p id="email-error" className="mt-1 text-sm text-red-600">
                  E-mail inválido
                </p>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
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
              aria-label={loading ? 'Enviando link de recuperação' : 'Enviar link de recuperação'}
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
