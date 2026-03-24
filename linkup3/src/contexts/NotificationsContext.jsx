import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useToast } from './ToastContext'
import { useSync } from './SyncContext'
import { notificacoesAPI } from '../services/api'

const NotificationsContext = createContext()

export function NotificationsProvider({ children }) {
  const { snapshot } = useSync()
  const [notifications, setNotifications] = useState([])
  const toast = useToast()

  // Sincronizar com snapshot
  const normalize = (n) => ({
    ...n,
    title: n.titulo || n.title || 'Notificação',
    description: n.descricao || n.mensagem || n.description || '',
    status: n.tipo || n.status || 'info',
    category: n.categoria || n.category || 'geral',
    time: n.time || n.criado_em || n.timestamp,
    origem_tipo: n.origem_tipo,
    origem_id: n.origem_id,
    origem_modulo: n.origem_modulo,
    read: n.read ?? n.lida ?? false,
    raw: n
  })

  useEffect(() => {
    const snapNotifs = snapshot?.notificacoes || snapshot?.notifications || []
    setNotifications(snapNotifs.map(normalize))
  }, [snapshot])

  // Adicionar nova notificação (push local — o sync a persiste na próxima rodada)
  const pushNotification = useCallback((newNotification) => {
    const created = normalize(newNotification)
    setNotifications(prev => [created, ...prev])
    if (created.status === 'error') {
      toast.error(`${created.title}`)
    }
  }, [toast])

  // Marcar notificação como lida via API
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificacoesAPI.marcarLida(notificationId)
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (err) {
      console.error('[NotificationsContext] Erro ao marcar lida:', err.message)
    }
  }, [])

  // Marcar todas como lidas via API
  const markAllAsRead = useCallback(async () => {
    try {
      await notificacoesAPI.marcarTodas()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      console.error('[NotificationsContext] Erro ao marcar todas:', err.message)
    }
  }, [])

  // Contar não lidas
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        pushNotification,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider')
  }
  return context
}
