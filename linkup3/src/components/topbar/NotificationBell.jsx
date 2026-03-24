import { useState, useEffect, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellDot, CheckCheck, X } from 'lucide-react'
import { useNotifications } from '../../contexts/NotificationsContext'
import { useSync } from '../../contexts/SyncContext'
import { getNomeOrigem } from '../../utils/getNomeOrigem'
import BadgeStatus from '../ui/BadgeStatus'

function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [shouldPulse, setShouldPulse] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const { snapshot } = useSync() || {}
  const navigate = useNavigate()

  // Últimas 5 notificações
  const recentNotifications = notifications.slice(0, 5)

  // Animar badge quando houver nova notificação
  useEffect(() => {
    if (unreadCount > 0) {
      setShouldPulse(true)
      const timer = setTimeout(() => setShouldPulse(false), 300)
      return () => clearTimeout(timer)
    }
  }, [unreadCount])

  const handleNotificationClick = useCallback((notif) => {
    markAsRead(notif.id)
    setIsOpen(false)

    // Deep linking baseado na origem
    const { origem_modulo, origem_tipo, origem_id } = notif
    
    if (origem_modulo === 'financeiro' && origem_tipo === 'fatura') {
      navigate(`/financeiro?fatura=${origem_id}`)
    } else if (origem_modulo === 'integração' && origem_tipo === 'integracao') {
      navigate(`/integracoes?integracao=${origem_id}`)
    } else if (origem_modulo === 'operacional' && origem_tipo === 'registro') {
      navigate(`/operacional?registro=${origem_id}`)
    } else if (origem_modulo === 'suporte' && origem_tipo === 'ticket') {
      navigate(`/chamados?ticket=${origem_id}`)
    } else {
      navigate('/notificacoes')
    }
  }, [markAsRead, navigate])

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead()
  }, [markAllAsRead])

  return (
    <div className="relative">
      {/* Botão do Sino */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg transition-colors"
        style={{ backgroundColor: 'transparent' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border-light)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        {unreadCount > 0 ? (
          <BellDot className={`w-5 h-5 ${shouldPulse ? 'animate-pulse' : ''}`} style={{ color: 'var(--color-text-primary)' }} />
        ) : (
          <Bell className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
        )}
        
        {/* Badge de contagem */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--danger)' }}
          >
            <span className="text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
            {shouldPulse && (
              <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ backgroundColor: 'var(--danger)' }}></span>
            )}
          </motion.div>
        )}
      </button>

      {/* Dropdown de Notificações */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay para fechar ao clicar fora */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-96 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-md"
              style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
            >
              {/* Header */}
              <div
                className="p-4 flex items-center justify-between"
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  background: 'linear-gradient(90deg, rgba(0,119,182,0.08), rgba(0,119,182,0.02))'
                }}
              >
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Notificações</h3>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-1 text-xs font-medium transition-colors"
                    style={{ color: 'var(--primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    <CheckCheck className="w-4 h-4" />
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              {/* Lista de Notificações */}
              <div className="max-h-[400px] overflow-y-auto">
                {recentNotifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-border)' }} />
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Nenhuma notificação</p>
                  </div>
                ) : (
                  <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                    {recentNotifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => handleNotificationClick(notif)}
                        className="p-4 cursor-pointer transition-all"
                        style={{
                          backgroundColor: !notif.read ? 'rgba(0,119,182,0.08)' : 'transparent'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border-light)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = !notif.read ? 'rgba(0,119,182,0.08)' : 'transparent'}
                      >
                        <div className="flex items-start gap-3">
                          <BadgeStatus status={notif.status} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                                {notif.title}
                              </h4>
                              {!notif.read && (
                                <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: 'var(--primary)' }}></div>
                              )}
                            </div>
                            <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                              {notif.description}
                            </p>
                            <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                              {getNomeOrigem(notif.origem_tipo, notif.origem_id, snapshot)}
                            </p>
                            <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                              {notif.time}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {recentNotifications.length > 0 && (
                <div className="p-3" style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-border-light)' }}>
                  <button
                    onClick={() => {
                      navigate('/notificacoes')
                      setIsOpen(false)
                    }}
                    className="w-full text-center text-sm font-medium transition-colors"
                    style={{ color: 'var(--primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    Ver todas as notificações →
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Memoização para evitar re-renders desnecessários
export default memo(NotificationBell);
