// ============================================================================
// ONBOARDING CHECKLIST - FASE D3
// Card minimalista com checklist de primeiros passos
// ============================================================================

import { motion } from 'framer-motion'
import { useOnboarding } from './OnboardingProvider'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Circle } from 'lucide-react'

export default function OnboardingChecklist() {
  const { checklist, progress, markItemCompleted } = useOnboarding()
  const navigate = useNavigate()

  // Não renderizar se não tiver checklist ou se já completou tudo
  if (!checklist || checklist.length === 0) return null
  if (progress >= 100) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card mb-6"
      role="region"
      aria-label="Checklist de configuração inicial"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Bem-vindo ao LinkUp³! 👋
          </h3>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Complete os passos abaixo para começar a usar o sistema.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
            Progresso
          </div>
          <div className="mt-1 text-2xl font-bold" style={{ color: 'var(--primary)' }}>
            {progress}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full rounded-full h-2.5 overflow-hidden mb-6" style={{ backgroundColor: 'var(--color-border-light)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, var(--primary) 0%, var(--primary-hover) 100%)' }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label={`Progresso do onboarding: ${progress}%`}
        />
      </div>

      {/* Checklist Items */}
      <ul className="space-y-3" role="list">
        {checklist.map((item, index) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-center justify-between gap-4 p-3 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border-light)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-card)'}
          >
            <div className="flex items-center gap-3 flex-1">
              {/* Status Icon */}
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-lg font-semibold text-sm
                  ${item.completed
                    ? 'bg-green-100 text-green-700'
                    : 'text-neutral-700'
                  }
                `}
                aria-hidden="true"
                style={!item.completed ? { backgroundColor: 'var(--color-border-light)', color: 'var(--color-text-secondary)' } : {}}
              >
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>

              {/* Item Info */}
              <div>
                <div 
                  className={`font-medium ${item.completed ? 'line-through' : ''}`}
                  style={{ color: item.completed ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}
                >
                  {item.label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {item.completed ? 'Concluído ✓' : 'Pendente'}
                </div>
              </div>
            </div>

            {/* Actions */}
            {!item.completed && (
              <div className="flex items-center gap-2">
                <button
                  className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  style={{ backgroundColor: 'var(--primary)' }}
                  onClick={() => navigate(item.actionLink)}
                  aria-label={`Continuar para ${item.label}`}
                >
                  Continuar
                </button>
                <button
                  className="px-3 py-2 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border-light)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => markItemCompleted(item.id)}
                  aria-label={`Marcar ${item.label} como concluído`}
                >
                  Pular
                </button>
              </div>
            )}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}
