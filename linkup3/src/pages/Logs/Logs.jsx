import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { detectarPadroesLogs } from '../../utils/insights'
import { motion } from 'framer-motion'
import { Filter, Bell, ChevronLeft, ChevronRight, ExternalLink, AlertCircle, TrendingUp, Lightbulb } from 'lucide-react'
import BadgeStatus from '../../components/ui/BadgeStatus'
import { SkeletonTable } from '../../components/ui/SkeletonLoaders'
import { useSync } from '../../contexts/SyncContext'

export default function Logs() {
  const { snapshot } = useSync() || {}
  const logsCompletos = snapshot?.logs || []
  const [filterModulo, setFilterModulo] = useState('todos')
  const [filterNivel, setFilterNivel] = useState('todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const logsPerPage = 10
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Simular carregamento
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])
  
  // Aplicar filtros de URL
  const urlFilter = searchParams.get('filter')
  const urlRegistro = searchParams.get('registro')
  const urlIntegracao = searchParams.get('integracao')

  // Filtrar logs
  let filteredLogs = logsCompletos
  
  // Filtro por módulo (case-insensitive para compatibilidade)
  if (filterModulo !== 'todos') {
    filteredLogs = filteredLogs.filter(l => 
      l.modulo?.toLowerCase().includes(filterModulo.toLowerCase())
    )
  }
  
  // Filtro por nível
  if (filterNivel !== 'todos') {
    filteredLogs = filteredLogs.filter(l => l.nivel === filterNivel)
  }
  
  // Filtros de URL
  if (urlFilter === 'ERROR') {
    filteredLogs = filteredLogs.filter(l => l.nivel === 'ERROR')
  }
  if (urlFilter === 'integração') {
    filteredLogs = filteredLogs.filter(l => 
      l.modulo?.toLowerCase().includes('integra')
    )
  }
  if (urlRegistro) {
    filteredLogs = filteredLogs.filter(l => l.origem_tipo === 'registro' && l.origem_id === urlRegistro)
  }
  if (urlIntegracao) {
    filteredLogs = filteredLogs.filter(l => l.origem_tipo === 'integracao' && l.origem_id === urlIntegracao)
  }

  // Paginação real
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage)
  const startIdx = (currentPage - 1) * logsPerPage
  const paginatedLogs = filteredLogs.slice(startIdx, startIdx + logsPerPage)

  // Detectar padrões nos logs com memoização
  const padroes = useMemo(() => {
    try {
      return detectarPadroesLogs(logsCompletos)
    } catch (error) {
      console.error('Erro ao detectar padrões:', error)
      return []
    }
  }, [logsCompletos])

  // Função para abrir origem do log
  const handleLogClick = (log) => {
    const { origem_tipo, origem_id, modulo } = log
    
    if (origem_tipo === 'fatura') {
      navigate(`/financeiro?fatura=${origem_id}`)
    } else if (origem_tipo === 'integracao') {
      navigate(`/integracoes?integracao=${origem_id}`)
    } else if (origem_tipo === 'registro') {
      navigate(`/operacional?registro=${origem_id}`)
    } else if (origem_tipo === 'ticket') {
      navigate(`/chamados?ticket=${origem_id}`)
    }
  }

  return (
    <motion.div className="p-6 space-y-6 animate-fadeIn">
      <div>
        <h1 className="section-title">Logs / Monitoramento</h1>
        <p className="section-subtitle">Eventos recentes e mensagens do sistema</p>
      </div>

      {/* Padrões Detectados */}
      {padroes.length > 0 && (
        <div className="card" style={{ border: '1px solid rgba(230, 57, 70, 0.3)', background: 'linear-gradient(to right, rgba(230, 57, 70, 0.05), rgba(230, 57, 70, 0.08))' }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5" style={{ color: 'var(--danger)' }} />
            <h2 className="section-title" style={{ color: 'var(--color-text-primary)' }}>Padrões Detectados Automaticamente</h2>
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            {padroes.length} padrão{padroes.length > 1 ? 'ões' : ''} identificado{padroes.length > 1 ? 's' : ''} nos logs recentes
          </p>
          
          <div className="space-y-3">
            {padroes.map((padrao, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: padrao.tipo === 'erro_repetido' ? 'rgba(230, 57, 70, 0.05)' : 'rgba(247, 183, 51, 0.05)',
                  border: padrao.tipo === 'erro_repetido' ? '1px solid rgba(230, 57, 70, 0.3)' : '1px solid rgba(247, 183, 51, 0.3)'
                }}
              >
                <div className="flex items-start gap-3">
                  {padrao.tipo === 'erro_repetido' ? 
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--danger)' }} /> :
                    <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
                  }
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {padrao.tipo === 'erro_repetido' ? 'Erro Repetido' : 'Pico de Avisos'}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{
                        backgroundColor: padrao.tipo === 'erro_repetido' ? 'rgba(230, 57, 70, 0.2)' : 'rgba(247, 183, 51, 0.2)',
                        color: padrao.tipo === 'erro_repetido' ? 'var(--danger)' : 'var(--warning)'
                      }}>
                        {padrao.count} ocorrência{padrao.count > 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-sm mb-2 font-mono p-2 rounded" style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                      {padrao.mensagem}
                    </p>
                    <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                      Módulo: <span className="font-medium">{padrao.modulo}</span> • 
                      Última ocorrência: <span className="font-medium">{padrao.ultimaOcorrencia}</span>
                    </p>
                    
                    {padrao.sugestao && (
                      <div className="flex items-start gap-2 mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-border-light)', border: '1px solid var(--color-border)' }}>
                        <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
                        <div>
                          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Sugestão de Ação</p>
                          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{padrao.sugestao}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="card">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Filtrar por módulo:</span>
          </div>
          
          {['todos', 'financeiro', 'integração', 'operacional', 'suporte'].map(mod => (
            <button
              key={mod}
              onClick={() => {
                setFilterModulo(mod)
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterModulo === mod 
                  ? 'bg-primary-600 text-white' 
                  : ''
              }`}
              style={filterModulo !== mod ? { backgroundColor: 'var(--color-border-light)', color: 'var(--color-text-secondary)' } : {}}
              onMouseEnter={(e) => filterModulo !== mod && (e.currentTarget.style.backgroundColor = 'var(--color-border)')}
              onMouseLeave={(e) => filterModulo !== mod && (e.currentTarget.style.backgroundColor = 'var(--color-border-light)')}
            >
              {mod.charAt(0).toUpperCase() + mod.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 flex-wrap mt-4">
          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Nível:</span>
          
          {['todos', 'OK', 'WARN', 'ERROR'].map(nivel => {
            const isActive = filterNivel === nivel
            let activeStyle = {}
            if (isActive) {
              if (nivel === 'OK') activeStyle = { backgroundColor: 'var(--success)', color: 'white' }
              else if (nivel === 'WARN') activeStyle = { backgroundColor: 'var(--warning)', color: 'white' }
              else if (nivel === 'ERROR') activeStyle = { backgroundColor: 'var(--danger)', color: 'white' }
              else activeStyle = { backgroundColor: 'var(--primary)', color: 'white' }
            }
            
            return (
              <button
                key={nivel}
                onClick={() => {
                  setFilterNivel(nivel)
                  setCurrentPage(1)
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={isActive ? activeStyle : { backgroundColor: 'var(--color-border-light)', color: 'var(--color-text-secondary)' }}
                onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'var(--color-border)')}
                onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'var(--color-border-light)')}
              >
                {nivel}
              </button>
            )
          })}

          <button
            onClick={() => navigate('/notificacoes')}
            className="ml-auto btn-ghost flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Ver notificações relacionadas
          </button>
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="card">
        {loading ? (
          <SkeletonTable rows={10} />
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Hora</th>
                <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Nível</th>
                <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Mensagem</th>
                <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Módulo</th>
                <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Origem</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log, idx) => {
                const hasOrigem = log.origem_tipo && log.origem_id
                return (
                  <tr 
                    key={idx}
                    onClick={() => hasOrigem && handleLogClick(log)}
                    className={`transition-colors ${
                      hasOrigem ? 'cursor-pointer' : ''
                    }`}
                    style={{ borderBottom: '1px solid var(--color-border)' }}
                    onMouseEnter={(e) => hasOrigem && (e.currentTarget.style.backgroundColor = 'var(--color-border-light)')}
                    onMouseLeave={(e) => hasOrigem && (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                    </td>
                    <td className="py-3 px-4">
                      <BadgeStatus 
                        status={
                          log.nivel === 'OK' || log.nivel === 'info' ? 'ok' : 
                          log.nivel === 'WARN' ? 'warning' : 
                          'error'
                        } 
                        label={log.nivel === 'info' ? 'OK' : log.nivel}
                      />
                    </td>
                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{log.mensagem}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs capitalize" style={{ color: 'var(--color-text-secondary)' }}>{log.modulo}</span>
                    </td>
                    <td className="py-3 px-4">
                      {hasOrigem ? (
                        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--primary)' }}>
                          <span className="capitalize">{log.origem_tipo}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        )}

        {/* Paginação */}
        {!loading && (
          <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Mostrando {startIdx + 1} a {Math.min(startIdx + logsPerPage, filteredLogs.length)} de {filteredLogs.length} logs
            </p>
          
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-ghost p-2 disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                const pageNum = idx + 1
                const isActive = currentPage === pageNum
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
                    style={isActive ? { backgroundColor: 'var(--primary)', color: 'white' } : { backgroundColor: 'var(--color-border-light)', color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'var(--color-border)')}
                    onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'var(--color-border-light)')}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-ghost p-2 disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        )}
      </div>
    </motion.div>
  )
}
