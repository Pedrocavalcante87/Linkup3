import { Link, useLocation } from 'react-router-dom'
import { Home, DollarSign, BarChart2, Settings, FileText, Bell, Headphones, User, Menu, X, Zap, Target } from 'lucide-react'
import clsx from 'clsx'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '../../contexts/NotificationsContext'
import { useSync } from '../../contexts/SyncContext'

// D5.1 - Pre-fetching de páginas ao hover
const prefetchPage = (pageName) => {
  // Lazy imports para pre-carregamento
  switch(pageName) {
    case 'Dashboard':
      import('../../pages/Dashboard/Dashboard')
      break
    case 'Prioridades':
      import('../../pages/Prioridades/Prioridades')
      break
    case 'Financeiro':
      import('../../pages/Financeiro/Financeiro')
      break
    case 'Operacional':
      import('../../pages/Operacional/Operacional')
      break
    case 'Integrações':
      import('../../pages/Integracoes/Integracoes')
      break
    case 'Logs':
      import('../../pages/Logs/Logs')
      break
    case 'Notificações':
      import('../../pages/Notifications/Notifications')
      break
    case 'Chamados':
      import('../../pages/Tickets/Tickets')
      break
    case 'Perfil':
      import('../../pages/Profile/Profile')
      break
  }
}

export default function Sidebar() {
  const { pathname } = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const { unreadCount } = useNotifications()
  const { snapshot, isSyncing } = useSync() || {}
  const tickets = snapshot?.tickets || []
  const integrations = snapshot?.integracoes || snapshot?.integrations || []

  // Contar tickets abertos
  const openTicketsCount = useMemo(() => {
    return tickets.filter(t => {
      const status = (t.status || '').toLowerCase()
      return status !== 'encerrado' && status !== 'resolvido'
    }).length
  }, [tickets])

  // Contar integrações com problema
  const problematicIntegrations = useMemo(() => {
    return integrations.filter(i => i.status !== 'ok').length
  }, [integrations])

  const menuGroups = useMemo(() => [
    {
      title: 'Principal',
      items: [
        { label: 'Dashboard', to: '/', icon: Home },
        {
          label: 'Prioridades',
          to: '/prioridades',
          icon: Target,
          badge: (problematicIntegrations + openTicketsCount) > 0 ? (problematicIntegrations + openTicketsCount) : null,
          badgeType: 'danger'
        },
      ]
    },
    {
      title: 'Gestão',
      items: [
        { label: 'Financeiro', to: '/financeiro', icon: DollarSign },
        { label: 'Operacional', to: '/operacional', icon: BarChart2 },
        {
          label: 'Integrações',
          to: '/integracoes',
          icon: Settings,
          badge: problematicIntegrations > 0 ? problematicIntegrations : null,
          badgeType: 'danger'
        },
        { label: 'Logs', to: '/logs', icon: FileText },
      ]
    },
    {
      title: 'Suporte',
      items: [
        {
          label: 'Notificações',
          to: '/notificacoes',
          icon: Bell,
          badge: unreadCount > 0 ? unreadCount : null,
          badgeType: 'primary'
        },
        {
          label: 'Chamados',
          to: '/chamados',
          icon: Headphones,
          badge: openTicketsCount > 0 ? openTicketsCount : null,
          badgeType: 'warning'
        },
      ]
    },
    {
      title: 'Conta',
      items: [
        { label: 'Perfil', to: '/perfil', icon: User },
        { label: 'Automações', to: '/automacoes', icon: Zap },
        { label: 'LAB', to: '/lab', icon: Zap },
      ]
    }
  ], [unreadCount, openTicketsCount, problematicIntegrations])

  // Fechar drawer ao mudar de rota
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevenir scroll do body quando drawer aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const SidebarContent = () => (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--primary)' }}>LinkUp³</h1>
          <span className={`w-2.5 h-2.5 rounded-full ${isSyncing ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: isSyncing ? 'var(--warning)' : 'var(--success)', boxShadow: isSyncing ? '0 0 0 6px rgba(234,179,8,0.15)' : 'none' }}
            aria-label={isSyncing ? 'Sincronizando' : 'Online'}
            title={isSyncing ? 'Sincronizando' : 'Online'}
          />
        </div>
        <p className="text-sm font-medium mt-1" style={{ color: 'var(--color-text-secondary)' }}>Dashboard</p>
      </div>

      <nav className="space-y-6" aria-label="Menu principal">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-2 px-4" style={{ color: 'var(--color-text-muted)' }}>
              {group.title}
            </h2>
            <div className="space-y-1">
              {group.items.map((m, i) => {
                const Icon = m.icon
                const active = pathname === m.to
                const hasBadge = m.badge !== null && m.badge !== undefined

                return (
                  <Link
                    key={i}
                    to={m.to}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 relative"
                    style={
                      active
                        ? {
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            border: '2px solid var(--primary)',
                            boxShadow: '0 2px 12px rgba(0, 119, 182, 0.25)'
                          }
                        : {
                            color: 'var(--color-text-primary)',
                            backgroundColor: 'transparent',
                            border: '2px solid transparent'
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = 'var(--color-border-light)'
                        e.currentTarget.style.borderColor = 'var(--color-border)'
                      }
                      // D5.1 - Pre-fetching ao hover (150ms delay)
                      setTimeout(() => prefetchPage(m.label), 150)
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.borderColor = 'transparent'
                      }
                    }}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon
                      className={clsx('w-5 h-5')}
                      style={{ color: active ? 'white' : 'var(--color-text-muted)' }}
                      aria-hidden="true"
                    />
                    <span className="flex-1">{m.label}</span>

                    {/* Badge de contador */}
                    {hasBadge && (
                      <span
                        className={clsx(
                          'inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full min-w-[20px]',
                          m.badgeType === 'danger' && 'bg-red-100 text-red-700',
                          m.badgeType === 'warning' && 'bg-amber-100 text-amber-700',
                          m.badgeType === 'primary' && 'bg-primary-100 text-primary-700',
                          active && m.badgeType === 'danger' && 'bg-red-600 text-white',
                          active && m.badgeType === 'warning' && 'bg-amber-600 text-white',
                          active && m.badgeType === 'primary' && 'bg-primary-800 text-white'
                        )}
                        aria-label={`${m.badge} itens`}
                      >
                        {m.badge > 99 ? '99+' : m.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </>
  )

  return (
    <>
      {/* Botão flutuante mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-strong hover:bg-primary-700 transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-200"
        aria-label="Abrir menu"
        aria-expanded={isOpen}
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Sidebar Desktop (fixa) */}
      <aside
        className="hidden lg:block w-64 h-screen fixed p-6 overflow-y-auto"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
          boxShadow: 'var(--shadow-card)'
        }}
        aria-label="Sidebar de navegação"
      >
        <SidebarContent />
      </aside>

      {/* Drawer Mobile */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              className="lg:hidden fixed top-0 left-0 h-screen w-80 max-w-[85vw] z-50 p-6 overflow-y-auto"
              style={{
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-strong)'
              }}
              aria-label="Menu de navegação mobile"
            >
              {/* Botão fechar */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Fechar menu"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>

              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
