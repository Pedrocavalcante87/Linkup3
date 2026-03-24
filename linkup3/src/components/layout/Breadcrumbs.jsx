import { useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useSync } from '../../contexts/SyncContext'

const routeNames = {
  '/': 'Dashboard',
  '/financeiro': 'Financeiro',
  '/operacional': 'Operacional',
  '/integracoes': 'Integrações',
  '/logs': 'Logs',
  '/notificacoes': 'Notificações',
  '/chamados': 'Chamados',
  '/perfil': 'Perfil'
}

export default function Breadcrumbs() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { snapshot } = useSync()

  const integracoes = snapshot?.integracoes || []
  const faturas = snapshot?.finance?.faturas || []
  const registros = snapshot?.operations?.registros || []
  const tickets = snapshot?.tickets || []

  const breadcrumbs = useMemo(() => {
    const path = location.pathname
    const crumbs = []

    // Sempre começar com Dashboard
    if (path !== '/') {
      crumbs.push({ label: 'Dashboard', path: '/', isHome: true })
    }

    // Adicionar página atual
    const pageName = routeNames[path]
    if (pageName && path !== '/') {
      crumbs.push({ label: pageName, path })
    }

    // Adicionar contexto baseado em query params
    const faturaId = searchParams.get('fatura')
    const registroId = searchParams.get('registro')
    const integracaoId = searchParams.get('integracao')
    const ticketId = searchParams.get('ticket')

    if (faturaId) {
      const fatura = faturas.find(f => f.id === faturaId)
      crumbs.push({ 
        label: fatura ? fatura.numero : faturaId.toUpperCase(), 
        path: `${path}?fatura=${faturaId}`,
        isDetail: true
      })
    }

    if (registroId) {
      crumbs.push({ 
        label: registroId.toUpperCase(), 
        path: `${path}?registro=${registroId}`,
        isDetail: true
      })
    }

    if (integracaoId) {
      const integracao = integracoes.find(i => i.id === integracaoId)
      crumbs.push({ 
        label: integracao ? integracao.nome : integracaoId, 
        path: `${path}?integracao=${integracaoId}`,
        isDetail: true
      })
    }

    if (ticketId) {
      const ticket = tickets.find(t => t.id === ticketId || t.numero === ticketId)
      crumbs.push({ 
        label: ticket ? (ticket.numero || ticket.id || ticketId).toUpperCase() : ticketId.toUpperCase(), 
        path: `${path}?ticket=${ticketId}`,
        isDetail: true
      })
    }

    return crumbs
  }, [location.pathname, searchParams, snapshot])

  if (breadcrumbs.length === 0) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm mb-4">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1

        return (
          <div key={crumb.path} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
            )}
            
            {isLast ? (
              <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }} aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <button
                onClick={() => navigate(crumb.path)}
                className="transition-colors flex items-center gap-1.5"
                style={{ color: 'var(--color-text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
              >
                {crumb.isHome && <Home className="w-3.5 h-3.5" aria-hidden="true" />}
                {crumb.label}
              </button>
            )}
          </div>
        )
      })}
    </nav>
  )
}
