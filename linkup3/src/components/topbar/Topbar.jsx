import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, Settings, ChevronDown, RefreshCcw } from 'lucide-react'
import NotificationBell from './NotificationBell'
import ThemeSwitcher from './ThemeSwitcher'
import { useSync } from '../../contexts/SyncContext'

export default function Topbar({ currentUser, onLogout }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { isSyncing, lastSynced, syncNow } = useSync() || {}

  const lastSyncedLabel = useMemo(() => {
    if (!lastSynced) return '—'
    const d = new Date(lastSynced)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }, [lastSynced])

  const handleProfile = () => {
    navigate('/perfil')
    setIsUserMenuOpen(false)
  }

  const handleLogout = () => {
    setIsUserMenuOpen(false)
    onLogout()
  }

  return (
    <div
      className="h-16 flex items-center justify-between px-6 fixed top-0 right-0 left-0 lg:left-64 z-30"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)'
      }}
    >
      {/* Logo / Título (Opcional) */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>LinkUp³</h1>
      </div>

      {/* Lado Direito: Notificações + Tema + Usuário */}
      <div className="flex items-center gap-3">
        {/* Sync status */}
        <motion.div
          className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          animate={isSyncing ? { boxShadow: '0 0 0 6px rgba(234,179,8,0.12)' } : { boxShadow: 'none' }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: isSyncing ? 'var(--warning)' : 'var(--success)' }}
              animate={isSyncing ? { scale: [1, 1.25, 1] } : { scale: 1 }}
              transition={{ repeat: isSyncing ? Infinity : 0, duration: 1.1 }}
            />
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {isSyncing ? 'Sincronizando...' : 'Sync OK'}
            </span>
          </div>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Última: {lastSyncedLabel}</span>
          <button
            onClick={syncNow}
            disabled={isSyncing}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border transition-colors"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--primary)'
            }}
          >
            <RefreshCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando' : 'Sync agora'}
          </button>
        </motion.div>

        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Sino de Notificações */}
        <NotificationBell />

        {/* Avatar + Nome do Usuário */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: isUserMenuOpen ? 'var(--color-border-light)' : 'transparent'
            }}
            onMouseEnter={(e) => !isUserMenuOpen && (e.currentTarget.style.backgroundColor = 'var(--color-border-light)')}
            onMouseLeave={(e) => !isUserMenuOpen && (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {/* Avatar */}
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>

            {/* Nome + Cargo */}
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {currentUser?.name || 'Usuário'}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {currentUser?.role || 'Administrador'}
              </p>
            </div>

            <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--color-text-muted)' }} />
          </button>

          {/* Dropdown do Usuário */}
          <AnimatePresence>
            {isUserMenuOpen && (
              <>
                {/* Overlay */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                />

                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-neutral-200 z-50 overflow-hidden backdrop-blur-md"
                >
                  {/* Header do Dropdown */}
                  <div className="p-4 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-indigo-50">
                    <p className="font-semibold text-neutral-900">{currentUser?.name || 'Usuário'}</p>
                    <p className="text-xs text-neutral-600">{currentUser?.email || 'user@linkup3.com'}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      onClick={handleProfile}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-neutral-600" />
                      <span className="text-sm text-neutral-700">Meu Perfil</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate('/perfil')
                        setIsUserMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors text-left"
                    >
                      <Settings className="w-4 h-4 text-neutral-600" />
                      <span className="text-sm text-neutral-700">Configurações</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="p-2 border-t border-neutral-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-danger/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-danger" />
                      <span className="text-sm text-danger font-medium">Sair</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
