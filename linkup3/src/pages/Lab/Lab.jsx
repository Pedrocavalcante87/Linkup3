import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FlaskConical, Play, AlertTriangle, RefreshCw, Zap, Activity, CheckCircle2 } from 'lucide-react'
import { useSync } from '../../contexts/SyncContext'

const actions = [
  { id: 'TEST_RESTORE', label: 'TEST_RESTORE', description: 'Simula recuperação (ERROR → OK)', icon: RefreshCw },
  { id: 'TEST_DEGRADE', label: 'TEST_DEGRADE', description: 'Simula degradação (OK → WARN → ERROR)', icon: AlertTriangle },
  { id: 'TEST_FULL_CYCLE', label: 'TEST_FULL_CYCLE', description: 'Ciclo completo de status', icon: Activity },
  { id: 'TEST_MULTIPLE_ERRORS', label: 'TEST_MULTIPLE_ERRORS', description: 'Dispara múltiplos erros', icon: Zap },
  { id: 'TEST_DAY_BAD', label: 'TEST_DAY_BAD', description: 'Dia ruim (picos de erro)', icon: FlaskConical }
]

export default function Lab() {
  const { snapshot, isSyncing, lastSynced } = useSync() || {}
  const integracoes = snapshot?.integrations || []
  const [logs, setLogs] = useState([])
  const logRef = useRef(null)

  // Captura console em tempo real enquanto a tela estiver aberta
  useEffect(() => {
    const original = { ...console }
    const push = (type, args) => {
      setLogs((prev) => {
        const next = [...prev, { type, message: args.map(String).join(' '), ts: new Date() }]
        return next.slice(-200)
      })
    }
    console.log = (...args) => { push('log', args); original.log(...args) }
    console.warn = (...args) => { push('warn', args); original.warn(...args) }
    console.error = (...args) => { push('error', args); original.error(...args) }

    const handleSnapshot = () => {
      push('log', ['🔁 snapshot atualizado'])
    }
    window.addEventListener('sync-new-snapshot', handleSnapshot)

    return () => {
      console.log = original.log
      console.warn = original.warn
      console.error = original.error
      window.removeEventListener('sync-new-snapshot', handleSnapshot)
    }
  }, [])

  // Auto-scroll console
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs])

  const targetIds = useMemo(() => integracoes.slice(0, 3).map(i => i.id), [integracoes])

  const runAction = (id) => {
    const fn = window[id]
    if (typeof fn !== 'function') {
      setLogs(prev => [...prev, { type: 'error', message: `Ação ${id} não encontrada`, ts: new Date() }])
      return
    }
    setLogs(prev => [...prev, { type: 'log', message: `▶️ Executando ${id} para ${targetIds.join(', ') || '—'}`, ts: new Date() }])
    fn(targetIds.length === 1 ? targetIds[0] : targetIds)
  }

  const lastSyncedLabel = useMemo(() => {
    if (!lastSynced) return '—'
    const d = new Date(lastSynced)
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }, [lastSynced])

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-6 h-6" style={{ color: 'var(--primary)' }} />
          <div>
            <h1 className="section-title">LAB de Testes</h1>
            <p className="section-subtitle">Ações internas para validar fluxos de sync e recovery</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          <span className={`w-2.5 h-2.5 rounded-full ${isSyncing ? 'animate-pulse' : ''}`} style={{ backgroundColor: isSyncing ? 'var(--warning)' : 'var(--success)' }} />
          <span style={{ color: 'var(--color-text-secondary)' }}>Última sync: {lastSyncedLabel}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card space-y-3">
          <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Ações rápidas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {actions.map(action => {
              const Icon = action.icon || Play
              return (
                <button
                  key={action.id}
                  onClick={() => runAction(action.id)}
                  className="p-3 rounded-lg text-left border transition-colors"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{action.label}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{action.description}</p>
                </button>
              )
            })}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Integrações alvo: {targetIds.join(', ') || 'nenhuma encontrada'}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Console</h3>
            <button
              className="text-xs px-2 py-1 rounded border"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              onClick={() => setLogs([])}
            >
              Limpar
            </button>
          </div>
          <div ref={logRef} className="h-72 overflow-auto rounded border p-2 text-xs font-mono"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          >
            {logs.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>Sem eventos ainda.</p>
            ) : (
              logs.map((l, idx) => (
                <div key={idx} className="mb-1">
                  <span style={{ color: 'var(--color-text-muted)' }}>[{l.ts.toLocaleTimeString('pt-BR')}]: </span>
                  <span style={{ color: l.type === 'error' ? 'var(--danger)' : l.type === 'warn' ? 'var(--warning)' : 'var(--color-text-primary)' }}>
                    {l.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--success)' }} />
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Toda alteração de snapshot será registrada automaticamente aqui. Use esta tela para demonstrações ao vivo de sync, recovery e geração de eventos.
        </p>
      </div>
    </motion.div>
  )
}
