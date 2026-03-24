import { useState, useEffect, forwardRef, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import CardStat from '../../components/ui/CardStat'
import BadgeStatus from '../../components/ui/BadgeStatus'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Activity, AlertTriangle, ExternalLink, Lightbulb, CheckCircle2, XCircle, FileText, Bell, Headphones, Zap as ZapIcon, Clock } from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'
import { useIntegrationRecovery } from '../../hooks/useIntegrationRecovery'
import { useSync } from '../../contexts/SyncContext'
import { 
  calcularSaudeIntegracao, 
  obterCorStatus, 
  obterCorFundoStatus,
  calcularSaudeGeral,
  formatarTempoRecuperacao
} from '../../utils/systemHealth'
import { telemetry } from '../../telemetry/TelemetryEvents'

const IntegracaoCard = forwardRef(({ item, onSync, onRecuperacao }, ref) => {
  const [syncing, setSyncing] = useState(false)
  const [justRecovered, setJustRecovered] = useState(false)
  const navigate = useNavigate()
  const saude = calcularSaudeIntegracao(item.status)

  const handleSync = () => {
    setSyncing(true)
    onSync(item.id, item.nome)
    setTimeout(() => setSyncing(false), 2000)
  }

  // Escutar evento de recuperação
  useEffect(() => {
    const handleRecovery = (event) => {
      if (event.detail.integracaoId === item.id) {
        setJustRecovered(true)
        setTimeout(() => setJustRecovered(false), 3000)
      }
    }
    
    window.addEventListener('integracao-recuperada', handleRecovery)
    return () => window.removeEventListener('integracao-recuperada', handleRecovery)
  }, [item.id])

  // Estilo de highlight verde para recovery
  const cardStyle = justRecovered ? {
    border: '2px solid var(--success)',
    boxShadow: '0 0 20px rgba(42, 157, 143, 0.3)'
  } : {}

  return (
    <motion.div 
      ref={ref}
      className="card card-hover overflow-hidden"
      style={cardStyle}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Banner de recuperação */}
      <AnimatePresence>
        {justRecovered && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-3 p-2 rounded-lg flex items-center gap-2"
            style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-semibold">Integração restaurada com sucesso!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.nome}</h3>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Tipo: {item.tipo}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <BadgeStatus status={item.status} animate={saude === 'danger' || saude === 'success'} />
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Uptime: {item.uptime}%
          </span>
        </div>
      </div>

      <div className="mb-3 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Activity className="w-4 h-4" style={{ color: obterCorStatus(item.status) }} />
          <span style={{ color: 'var(--color-text-secondary)' }}>Taxa de Sucesso:</span>
          <span className="font-semibold" style={{ color: obterCorStatus(item.status) }}>
            {item.success_rate}%
          </span>
        </div>
        
        {item.ultima_sync && (
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Última sync: {new Date(item.ultima_sync).toLocaleString('pt-BR')}
          </div>
        )}
        
        {item.proxima_sync && (
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Próxima sync: {new Date(item.proxima_sync).toLocaleString('pt-BR')}
          </div>
        )}
      </div>

      {/* Indicador de status com cor do tema */}
      <div className="mb-3 p-2 rounded-lg" style={{ 
        backgroundColor: obterCorFundoStatus(item.status),
        borderLeft: `4px solid ${obterCorStatus(item.status)}`
      }}>
        <p className="text-xs font-medium" style={{ color: obterCorStatus(item.status) }}>
          {saude === 'success' && 'Operando normalmente'}
          {saude === 'warning' && 'Atenção necessária'}
          {saude === 'danger' && 'Erro crítico - verificar urgente'}
        </p>
      </div>

      <button
        onClick={handleSync}
        disabled={syncing}
        className="w-full btn-ghost flex items-center justify-center gap-2 text-sm disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
        {syncing ? 'Sincronizando...' : 'Sincronizar agora'}
      </button>
    </motion.div>
  )
})

IntegracaoCard.displayName = 'IntegracaoCard'

export default function Integracoes() {
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const filter = searchParams.get('filter')
  const { snapshot, syncNow, isSyncing } = useSync() || {}
  const integracoesSnapshot = snapshot?.integrations || []
  const lastSynced = snapshot?.lastSynced
  const logs = snapshot?.logs || []
  const notifications = snapshot?.notifications || []
  const tickets = snapshot?.tickets || []
  const automations = snapshot?.automations || []
  const [sinceLastSync, setSinceLastSync] = useState('—')
  
  const { 
    mudarStatusIntegracao, 
    fecharTicketAutomatico,
    limparAlertas,
    dispararReprocessamento
  } = useIntegrationRecovery()

  // Filtrar integrações
  const integracoesFiltradas = filter === 'error'
    ? integracoesSnapshot.filter(i => calcularSaudeIntegracao(i.status) === 'danger')
    : integracoesSnapshot

  // Calcular saúde geral
  const saudeGeral = calcularSaudeGeral(integracoesSnapshot)

  const timeline = useMemo(() => {
    const events = []

    integracoesSnapshot.forEach((i) => {
      if (i.ultima_sync) {
        events.push({
          tipo: 'status',
          integracaoId: i.id,
          integracaoNome: i.nome,
          status: i.status,
          timestamp: i.ultima_sync,
          texto: `Status ${i.status?.toUpperCase()} (uptime ${i.uptime}%)`
        })
      }
    })

    logs.filter(l => l.origem_tipo === 'integracao').forEach(l => {
      events.push({
        tipo: 'log',
        integracaoId: l.origem_id,
        integracaoNome: integracoesSnapshot.find(i => i.id === l.origem_id)?.nome,
        status: l.nivel,
        timestamp: l.timestamp,
        texto: l.mensagem
      })
    })

    notifications.filter(n => n.origem_tipo === 'integracao').forEach(n => {
      events.push({
        tipo: 'notificacao',
        integracaoId: n.origem_id,
        integracaoNome: integracoesSnapshot.find(i => i.id === n.origem_id)?.nome,
        status: n.tipo,
        timestamp: n.criado_em || n.timestamp,
        texto: n.titulo || n.title || 'Notificação'
      })
    })

    tickets.filter(t => t.origem_tipo === 'integracao').forEach(t => {
      events.push({
        tipo: 'ticket',
        integracaoId: t.origem_id,
        integracaoNome: integracoesSnapshot.find(i => i.id === t.origem_id)?.nome,
        status: t.status,
        timestamp: t.atualizado_em || t.criado_em,
        texto: t.assunto || t.subject || 'Ticket relacionado'
      })
    })

    automations.filter(a => a.integracao_id || a.integrationId).forEach(a => {
      const id = a.integracao_id || a.integrationId
      events.push({
        tipo: 'automation',
        integracaoId: id,
        integracaoNome: integracoesSnapshot.find(i => i.id === id)?.nome,
        status: a.status || 'executada',
        timestamp: a.timestamp || a.executada_em || a.criado_em,
        texto: a.nome || a.title || 'Automação executada'
      })
    })

    const parseTs = (ts) => {
      const d = new Date(ts)
      return Number.isNaN(d.getTime()) ? 0 : d.getTime()
    }

    return events
      .sort((a, b) => parseTs(b.timestamp) - parseTs(a.timestamp))
      .slice(0, 30)
  }, [integracoesSnapshot, logs, notifications, tickets, automations])

  const lastSyncedLabel = useMemo(() => {
    if (!lastSynced) return '—'
    const d = new Date(lastSynced)
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }, [lastSynced])

  useEffect(() => {
    const update = () => {
      if (!lastSynced) return setSinceLastSync('—')
      const d = new Date(lastSynced)
      if (Number.isNaN(d.getTime())) return setSinceLastSync('—')
      const diff = Math.max(0, Date.now() - d.getTime())
      const seconds = Math.floor(diff / 1000)
      if (seconds < 60) return setSinceLastSync(`há ${seconds}s`)
      const minutes = Math.floor(seconds / 60)
      if (minutes < 60) return setSinceLastSync(`há ${minutes}min`)
      const hours = Math.floor(minutes / 60)
      return setSinceLastSync(`há ${hours}h`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [lastSynced])

  // Handler de sincronização
  const handleSync = (id, nome) => {
    toast.success(`Sincronização iniciada: ${nome}`)
    telemetry.trackEvent('integration_sync', { integracaoId: id, nome })
  }

  return (
    <motion.div 
      className="p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h1 className="section-title">Integrações</h1>
        <p className="section-subtitle">
          Status e monitoramento em tempo real de todas as integrações
        </p>
      </div>

      {/* Banner de sincronização */}
      <AnimatePresence>
        {isSyncing && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-lg px-4 py-3 flex items-center gap-3"
            style={{ backgroundColor: 'var(--color-border-light)', border: '1px solid var(--color-border)' }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.1 }}
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: 'var(--primary)' }}
            />
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-primary)' }}>
              <span role="img" aria-label="sync">🔄</span>
              Sincronizando dados…
            </div>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Última: {lastSyncedLabel}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <CardStat
          title="Total de Integrações"
          value={saudeGeral.total}
          icon={Activity}
          trend={saudeGeral.ok === saudeGeral.total ? 'up' : 'neutral'}
          badge={`Atualizado ${sinceLastSync}`}
        />
        <CardStat
          title="Operacionais"
          value={saudeGeral.ok}
          icon={CheckCircle2}
          trend="up"
          color="var(--success)"
          badge={`Atualizado ${sinceLastSync}`}
        />
        <CardStat
          title="Com Avisos"
          value={saudeGeral.warn}
          icon={AlertTriangle}
          trend="neutral"
          color="var(--warning)"
          badge={`Atualizado ${sinceLastSync}`}
        />
        <CardStat
          title="Com Erros"
          value={saudeGeral.error}
          icon={XCircle}
          trend={saudeGeral.error > 0 ? 'down' : 'up'}
          color="var(--danger)"
          badge={`Atualizado ${sinceLastSync}`}
        />
      </div>

      {/* Banner de saúde geral */}
      {saudeGeral.status !== 'success' && (
        <motion.div 
          className="card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ 
            backgroundColor: obterCorFundoStatus(saudeGeral.status),
            border: `2px solid ${obterCorStatus(saudeGeral.status)}`
          }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: obterCorStatus(saudeGeral.status) }} />
            <div className="flex-1">
              <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                {saudeGeral.error > 0 
                  ? `${saudeGeral.error} integração(ões) com erro crítico` 
                  : `${saudeGeral.warn} integração(ões) requerem atenção`
                }
              </h3>
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Saúde geral do sistema: {saudeGeral.porcentagem}% operacional
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/logs?filter=integracao&nivel=error')}
                  className="text-xs px-3 py-1.5 text-white rounded transition-opacity"
                  style={{ backgroundColor: obterCorStatus(saudeGeral.status) }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Ver Logs de Erro
                </button>
                <button
                  onClick={() => navigate('/automacoes')}
                  className="text-xs px-3 py-1.5 rounded"
                  style={{ backgroundColor: 'var(--color-border-light)', color: 'var(--color-text-secondary)' }}
                >
                  Configurar Automações
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Linha do Tempo da Integração */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span role="img" aria-label="timeline">📘</span>
            <h2 className="section-title" style={{ color: 'var(--color-text-primary)' }}>Linha do Tempo da Integração</h2>
          </div>
          <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--color-border-light)', color: 'var(--color-text-secondary)' }}>
            Atualizado {sinceLastSync}
          </span>
        </div>

        {timeline.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Sem eventos recentes.</p>
        ) : (
          <div className="space-y-3">
            {timeline.map((ev, idx) => {
              const Icon = ev.tipo === 'status' ? Activity : ev.tipo === 'log' ? FileText : ev.tipo === 'notificacao' ? Bell : ev.tipo === 'ticket' ? Headphones : ev.tipo === 'automation' ? ZapIcon : Clock
              const color = ev.status === 'ERROR' || ev.status === 'error' || ev.status === 'critico' ? 'var(--danger)' : ev.status === 'WARN' || ev.status === 'warning' || ev.status === 'alerta' ? 'var(--warning)' : 'var(--primary)'
              const timeLabel = ev.timestamp ? new Date(ev.timestamp).toLocaleString('pt-BR') : '—'
              return (
                <motion.div
                  key={`${ev.tipo}-${idx}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg flex items-start gap-3"
                  style={{ backgroundColor: 'var(--color-border-light)', border: '1px solid var(--color-border)' }}
                >
                  <div className="mt-0.5">
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {ev.integracaoNome || 'Integração'}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color }}>
                        {ev.tipo}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{ev.texto}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{timeLabel}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Grid de integrações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {integracoesFiltradas.map((integracao) => (
            <IntegracaoCard 
              key={integracao.id} 
              item={integracao} 
              onSync={handleSync}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Mensagem se não houver integrações */}
      {integracoesFiltradas.length === 0 && (
        <div className="card text-center py-12">
          <Activity className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
          <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Nenhuma integração encontrada
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {filter ? 'Não há integrações com este filtro' : 'Configure integrações para começar'}
          </p>
        </div>
      )}
    </motion.div>
  )
}
