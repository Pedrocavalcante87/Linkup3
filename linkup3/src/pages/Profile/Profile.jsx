import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Shield, Save, Check } from 'lucide-react'
import { Skeleton } from '../../components/ui/Skeleton'
import { useToast } from '../../contexts/ToastContext'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  // Carrega o usuário salvo no login (linkup_user no localStorage)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('linkup_user')
      if (stored) setUser(JSON.parse(stored))
    } catch (_) {}
    setLoading(false)
  }, [])

  const handleSave = (e) => {
    e.preventDefault()
    if (!user) return
    // Persiste localmente (o backend não tem endpoint de atualização de perfil ainda)
    const toSave = { ...user }
    localStorage.setItem('linkup_user', JSON.stringify(toSave))
    setSaved(true)
    toast.success('Suas alterações foram salvas com sucesso!')
    setTimeout(() => setSaved(false), 3000)
  }

  const updateUserField = (field, value) => {
    setUser(prev => ({ ...prev, [field]: value }))
  }

  return (
    <motion.div className="p-6 space-y-6 animate-fadeIn">
      <div>
        <h1 className="section-title">Perfil</h1>
        <p className="section-subtitle">Gerencie suas informações e preferências</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card Principal */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="card">
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Informações Pessoais</h2>

            {loading || !user ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i}>
                    <Skeleton variant="text" width="30%" className="mb-2" />
                    <Skeleton variant="button" className="w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="profile-name" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                      Nome Completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
                      <input
                        id="profile-name"
                        type="text"
                        value={user?.name || ''}
                        onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-600 outline-none"
                        style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="profile-email" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                      E-mail
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
                      <input
                        id="profile-email"
                        type="email"
                        value={user?.email || ''}
                        onChange={(e) => updateUserField('email', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-600 outline-none"
                        style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="profile-role" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                      Cargo
                    </label>
                    <input
                      id="profile-role"
                      type="text"
                        value={user?.role || ''}
                      disabled
                      className="w-full px-4 py-3 rounded-lg"
                      style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-border-light)', color: 'var(--color-text-muted)' }}
                      aria-disabled="true"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Preferências</h3>

                  <div className="space-y-3">
                    <label htmlFor="pref-notifications" className="flex items-center gap-3 cursor-pointer">
                      <input
                        id="pref-notifications"
                        type="checkbox"
                        checked={user?.preferences?.notifications || false}
                        disabled={!user}
                        onChange={(e) => setUser({
                          ...user,
                          preferences: {...user.preferences, notifications: e.target.checked}
                        })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-300"
                        style={{ borderColor: 'var(--color-border)' }}
                      />
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Receber notificações por e-mail</span>
                    </label>

                    <label htmlFor="pref-metrics" className="flex items-center gap-3 cursor-pointer">
                      <input
                        id="pref-metrics"
                        type="checkbox"
                        checked={user?.preferences?.advancedMetrics || false}
                        disabled={!user}
                        onChange={(e) => setUser({
                          ...user,
                          preferences: {...user.preferences, advancedMetrics: e.target.checked}
                        })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-300"
                        style={{ borderColor: 'var(--color-border)' }}
                      />
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Exibir métricas avançadas no dashboard</span>
                    </label>
                  </div>
                </div>
              </>
            )}


            {!loading && user && (
              <button
                type="submit"
                className="w-full mt-6 btn-primary flex items-center justify-center gap-2"
                disabled={saved}
              >
                {saved ? (
                  <>
                    <Check className="w-5 h-5" aria-hidden="true" />
                    Alterações Salvas
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" aria-hidden="true" />
                    Salvar Alterações
                  </>
                )}
              </button>
            )}
          </form>

          <div className="card">
            <h2 className="section-title mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              Segurança
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Mantenha sua conta segura atualizando sua senha regularmente
            </p>
            <button className="btn-ghost">
              Alterar Senha
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
              {user?.avatar || 'U'}
            </div>
            <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{user?.name || 'Usuário'}</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{user?.role || '—'}</p>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>{user?.email || ''}</p>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Estatísticas</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-secondary)' }}>Chamados abertos</span>
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-secondary)' }}>Último acesso</span>
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Hoje</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-secondary)' }}>Notificações não lidas</span>
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
