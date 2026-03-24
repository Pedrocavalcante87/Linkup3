/**
 * Manual tests (Notifications snapshot-only)
 * 1) Abrir /notifications: lista deve usar snapshot.notifications em ordem desc por timestamp.
 * 2) Clicar "Marcar todas como lidas" zera contador e persiste via mockBackend.markAllNotificationsRead.
 * 3) Clicar em item de integração/ticket/log/fatura marca como lida e navega para /integracoes?integracao=ID, /chamados?ticket=ID, /logs?log=ID ou /financeiro?fatura=ID.
 * 4) Rodar um sync (Lab/forçar sync) deve atualizar a lista sem refresh e sem erros de normalização.
 * 5) Se surgir status fora de success|warning|error, deve aparecer console.warn informando status não padronizado.
 */

import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Check, Inbox } from 'lucide-react'
import { useSync } from '../../contexts/SyncContext'
import { notificacoesAPI } from '../../services/api'
import NotificationItem from '../../components/notifications/NotificationItem'
import { Skeleton } from '../../components/ui/Skeleton'

const formatTempoRelativo = (value) => {
  if (!value) return ''
  const data = new Date(value)
  if (Number.isNaN(data.getTime())) return value
  const diffMin = Math.floor((Date.now() - data.getTime()) / 60000)
  if (diffMin < 60) return `há ${Math.max(diffMin, 1)}m`
  const diffHoras = Math.floor(diffMin / 60)
  if (diffHoras < 24) return `há ${diffHoras}h`
  const diffDias = Math.floor(diffHoras / 24)
  if (diffDias === 1) return 'ontem'
  if (diffDias < 7) return `há ${diffDias} dias`
  return data.toLocaleDateString('pt-BR')
}

export default function Notifications() {
  const { snapshot } = useSync() || {}
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('todos')
  const [integrationFilter, setIntegrationFilter] = useState('todas')

  const notifications = useMemo(() => {
    const list = snapshot?.notifications || []
    return [...list].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }, [snapshot])

  const correlated = snapshot?.notificationsCorrelated || []
  const integrationsMap = snapshot?.notificationsByIntegration || {}

  const filtered = useMemo(() => {
    return notifications.filter(n => {
      const statusOk = statusFilter === 'todos' ? true : n.status === statusFilter
      const integrationOk = integrationFilter === 'todas'
        ? true
        : n.rel?.integrationId === integrationFilter || n.origem_id === integrationFilter
      return statusOk && integrationOk
    })
  }, [notifications, statusFilter, integrationFilter])

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications])

  const handleMarkAll = useCallback(async () => {
    try {
      await notificacoesAPI.marcarTodas()
      window.dispatchEvent(new Event('linkup-data-changed'))
    } catch (err) {
      console.error('[Notifications] Erro ao marcar todas:', err.message)
    }
  }, [])

  const handleClick = useCallback(async (notif) => {
    try { await notificacoesAPI.marcarLida(notif.id) } catch (_) {}
    window.dispatchEvent(new Event('linkup-data-changed'))
    const rel = notif.rel || {}
    if (rel.integrationId || notif.origem_modulo === 'integração') {
      navigate(`/integracoes?integracao=${rel.integrationId || notif.origem_id}`)
      return
    }
    if (rel.ticketId || notif.origem_tipo === 'ticket') {
      navigate(`/chamados?ticket=${rel.ticketId || notif.origem_id}`)
      return
    }
    if (rel.logId || notif.origem_tipo === 'log') {
      navigate(`/logs?log=${rel.logId || notif.origem_id}`)
      return
    }
    if (notif.origem_modulo === 'financeiro' || notif.category === 'financeiro') {
      navigate(`/financeiro${notif.origem_id ? `?fatura=${notif.origem_id}` : ''}`)
    }
  }, [navigate])

  const integrationOptions = useMemo(() => ['todas', ...Object.keys(integrationsMap)], [integrationsMap])

  const viewNotifications = useMemo(() => filtered.map(n => {
    if (!['success', 'warning', 'error'].includes(n.status)) {
      console.warn('Status não padronizado recebido do backend', n.status, n.id)
    }
    const integrationName = n.rel?.integrationId
      ? snapshot?.integracoes?.find(i => i.id === n.rel.integrationId)?.nome || `Integração ${n.rel.integrationId}`
      : null
    const originLabel = integrationName
      ? `Integração • ${integrationName}`
      : n.origem_modulo
        ? `${n.origem_modulo}${n.origem_id ? ` • ${n.origem_id}` : ''}`
        : 'Sistema'
    const hasDeepLink = Boolean(n.rel?.integrationId || n.rel?.ticketId || n.rel?.logId || n.origem_modulo)
    return {
      id: n.id,
      title: n.title,
      description: n.description,
      status: n.status,
      timeLabel: formatTempoRelativo(n.timestamp),
      read: n.read,
      originLabel,
      hasDeepLink,
      rel: n.rel,
      origem_modulo: n.origem_modulo,
      origem_id: n.origem_id,
      category: n.category
    }
  }), [filtered, snapshot])

  const loading = !snapshot

  return (
    <motion.div className="p-6 space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Notificações</h1>
          <p className="section-subtitle">Central de alertas e atualizações do sistema</p>
        </div>
        <button
          onClick={handleMarkAll}
          className="btn-ghost text-sm"
          disabled={unreadCount === 0}
        >
          <Check className="w-4 h-4 mr-1" />
          Marcar todas como lidas
        </button>
      </div>

      {correlated.length > 0 && (
        <div className="card" style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)' }}>
          <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--color-text-primary)' }}>
            <Bell className="w-5 h-5" />
            <h2 className="section-title">Eventos correlacionados</h2>
          </div>
          <div className="space-y-3">
            {correlated.map((group, idx) => (
              <div key={idx} className="p-3 rounded-lg" style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-border-light)' }}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {group.origem_tipo || 'origem'} • {group.origem_id || 'desconhecida'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {group.notificacoes.length} eventos • severidade {group.severidadeGrupo}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                    {group.tipoRelacao}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-2 mb-4 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <Bell className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
          <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {['todos', 'success', 'warning', 'error'].map(s => {
            const active = statusFilter === s
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-3 py-2 rounded-lg text-sm"
                style={active ? { backgroundColor: 'var(--primary)', color: 'white' } : { backgroundColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                {s === 'todos' ? 'Todos' : s}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {integrationOptions.map(opt => {
            const active = integrationFilter === opt
            return (
              <button
                key={opt}
                onClick={() => setIntegrationFilter(opt)}
                className="px-3 py-2 rounded-lg text-sm"
                style={active ? { backgroundColor: 'var(--primary)', color: 'white' } : { backgroundColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                {opt === 'todas' ? 'Todas integrações' : opt}
              </button>
            )
          })}
        </div>

        <div className="space-y-3">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg" style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)' }}>
                <div className="flex items-start gap-3">
                  <Skeleton variant="avatar" className="w-5 h-5 mt-1" />
                  <div className="flex-1 space-y-3">
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="90%" />
                    <Skeleton variant="text" width="30%" />
                  </div>
                </div>
              </div>
            ))
          ) : viewNotifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full mx-auto mb-4" style={{ backgroundColor: 'var(--color-border)' }}>
                <Inbox className="w-8 h-8" style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Nenhuma notificação encontrada</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>As próximas atualizações aparecerão aqui</p>
            </div>
          ) : (
            viewNotifications.map(n => (
              <NotificationItem key={n.id} n={n} onMarkRead={() => handleClick(n)} />
            ))
          )}
        </div>
      </div>
    </motion.div>
  )
}
