import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import CardStat from '../../components/ui/CardStat'
import BadgeStatus from '../../components/ui/BadgeStatus'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, AlertTriangle, DollarSign, X, Lightbulb, TrendingDown, CheckCircle2, Send, Eye, Search, Filter } from 'lucide-react'
import { gerarAnaliseFinanceira } from '../../utils/insights'
import { getNomeOrigem } from '../../utils/getNomeOrigem'
import { SkeletonCard, SkeletonTable } from '../../components/ui/SkeletonLoaders'
import { useSync } from '../../contexts/SyncContext'
import { useToast } from '../../contexts/ToastContext'

export default function Financeiro() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { snapshot } = useSync() || {}
  const faturas = snapshot?.finance?.faturas || []
  const registros = snapshot?.finance?.registros || []
  const notificacoesCompletas = snapshot?.notificacoesCompletas || snapshot?.notifications || []
  const empresas = snapshot?.finance?.empresas || snapshot?.empresas || []
  const logsCompletos = snapshot?.logs || []
  const ticketsCompletos = snapshot?.tickets || []
  const filter = searchParams.get('filter')
  const [selectedFatura, setSelectedFatura] = useState(null)
  const [mostrarAnalise, setMostrarAnalise] = useState(true)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const toast = useToast()

  // Simular carregamento
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // Filtrar faturas se houver filtro de overdue
  const faturasFiltradas = useMemo(() => {
    let resultado = filter === 'overdue'
      ? faturas.filter(f => f.status === 'overdue')
      : faturas

    // Busca por número/empresa
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      resultado = resultado.filter(f =>
        f.numero.toLowerCase().includes(query) ||
        f.empresa.toLowerCase().includes(query)
      )
    }

    // Filtro por status
    if (filtroStatus !== 'todos') {
      resultado = resultado.filter(f => f.status === filtroStatus)
    }

    return resultado
  }, [faturas, filter, searchQuery, filtroStatus])

  // Quick Actions
  const handleAprovar = (fatura) => {
    toast.success(`Fatura ${fatura.numero} aprovada!`)
    // Aqui seria a integração real
  }

  const handleCobrar = (fatura) => {
    toast.info(`Cobrança enviada para ${fatura.empresa}`)
    // Aqui seria a integração real
  }

  const handleVisualizarDetalhes = (fatura) => {
    setSelectedFatura(fatura)
  }

  // Análise financeira inteligente com memoização
  const analiseFinanceira = useMemo(() => {
    try {
      return gerarAnaliseFinanceira()
    } catch (error) {
      console.error('Erro ao gerar análise financeira:', error)
      return {
        totalPrevisto: 0,
        totalRecebido: 0,
        taxaInadimplencia: 0,
        comportamentoPorEmpresa: [],
        recomendacao: null
      }
    }
  }, [])

  // Cálculos de saúde financeira
  const totalInvoices = faturas.length
  const paidInvoices = faturas.filter(i => i.status === 'paid').length
  const paidPercentage = totalInvoices ? Math.round((paidInvoices / totalInvoices) * 100) : 0

  // Total inadimplente (faturas overdue)
  const totalOverdue = faturas
    .filter(i => i.status === 'overdue')
    .reduce((sum, i) => sum + i.valor, 0)

  // Pagamentos recebidos (faturas paid)
  const pagamentosRecebidos = faturas
    .filter(f => f.status === 'paid')
    .reduce((sum, f) => sum + f.valor, 0)

  // Faturas geradas automaticamente (com 2+ registros)
  const faturasAutomaticas = faturas.filter(f => f.registros_ids.length >= 2).length

  // Previsto mês atual (todas faturas abertas + overdue)
  const previstoMes = faturas
    .filter(f => f.status === 'open' || f.status === 'overdue')
    .reduce((sum, f) => sum + f.valor, 0)

  // Notificações financeiras
  const financialNotifications = notificacoesCompletas
    .filter(n => n.categoria === 'financeiro')
    .slice(0, 3)
    .map(n => ({
      ...n,
      resolvedOrigin: getNomeOrigem(n.origem_tipo, n.origem_id, snapshot)
    }))

  // Função para mapear status para BadgeStatus
  const getStatusBadge = (status) => {
    const map = {
      'paid': 'ok',
      'overdue': 'error',
      'open': 'warning',
      'pending': 'info'
    }
    return map[status] || 'ok'
  }

  return (
    <motion.div className="p-6 space-y-6 animate-slideUp">
      <div>
        <h1 className="section-title">Financeiro</h1>
        <p className="section-subtitle">Resumo de faturas e recebimentos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <CardStat title="Faturas abertas" value={faturas.filter(f => f.status === 'open').length.toString()} />
            <CardStat title="Valor em atraso" value={`R$ ${totalOverdue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} />
            <CardStat title="Recebimentos previstos" value={`R$ ${previstoMes.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} />
          </>
        )}
      </div>

      {/* Indicadores de Saúde Financeira */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-success" />
            <h3 className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Saúde Financeira</h3>
          </div>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{paidPercentage}%</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Faturas pagas no prazo</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-success" />
            <h3 className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Pagamentos Recebidos</h3>
          </div>
          <p className="text-2xl font-bold text-success">R$ {pagamentosRecebidos.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{paidInvoices} faturas pagas</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-danger" />
            <h3 className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total Inadimplente</h3>
          </div>
          <p className="text-2xl font-bold text-danger">R$ {totalOverdue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Requer atenção</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <h3 className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Faturas Geradas Automaticamente</h3>
          </div>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{faturasAutomaticas}</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Com múltiplos registros</p>
        </div>
      </div>

      {/* Alertas Financeiros Recentes */}
      <div className="card">
        <h2 className="section-title mb-4">Alertas Financeiros Recentes</h2>
        <div className="space-y-3">
          {financialNotifications.map(notif => (
            <div key={notif.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-border-light)' }}>
              <BadgeStatus status={notif.status} label={notif.resolvedOrigin} />
              <div className="flex-1">
                <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{notif.title}</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{notif.description}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{notif.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Análise Financeira Inteligente */}
      <AnimatePresence>
        {mostrarAnalise && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card"
            style={{
              border: '2px solid var(--primary)',
              background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-border-light) 100%)'
            }}
          >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              <h2 className="section-title" style={{ color: 'var(--color-text-primary)' }}>Análise Financeira Automática</h2>
            </div>
            <button
              onClick={() => setMostrarAnalise(false)}
              style={{ color: 'var(--color-text-muted)', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Comparação Previsto vs Recebido */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Total Previsto</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                R$ {analiseFinanceira.totalPrevisto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </p>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--success)' }}>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Total Recebido</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--success)' }}>
                R$ {analiseFinanceira.totalRecebido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </p>
            </div>
            <div className="rounded-lg p-4" style={{
              backgroundColor: Number(analiseFinanceira.taxaInadimplencia || 0) > 20 ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-surface)',
              border: `1px solid ${Number(analiseFinanceira.taxaInadimplencia || 0) > 20 ? 'var(--danger)' : 'var(--color-border)'}`
            }}>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Taxa de Inadimplência</p>
              <p className="text-2xl font-bold" style={{ color: Number(analiseFinanceira.taxaInadimplencia || 0) > 20 ? 'var(--danger)' : 'var(--color-text-primary)' }}>
                {Number(analiseFinanceira.taxaInadimplencia || 0).toFixed(1)}%
              </p>
              {Number(analiseFinanceira.taxaInadimplencia || 0) > 20 && (
                <div className="flex items-center gap-1 mt-2" style={{ color: 'var(--danger)' }}>
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-xs font-medium">Atenção necessária</span>
                </div>
              )}
            </div>
          </div>

          {/* Comportamento por Empresa */}
          {analiseFinanceira.comportamentoPorEmpresa.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Análise de Comportamento por Cliente</h3>
              <div className="space-y-2">
                {analiseFinanceira.comportamentoPorEmpresa.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: comp.severidade === 'alta' ? 'rgba(239, 68, 68, 0.1)' :
                                     comp.severidade === 'media' ? 'rgba(234, 179, 8, 0.1)' :
                                     'rgba(34, 197, 94, 0.1)',
                      border: `1px solid ${
                        comp.severidade === 'alta' ? 'var(--danger)' :
                        comp.severidade === 'media' ? 'var(--warning)' :
                        'var(--success)'
                      }`
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{comp.empresa}</p>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: comp.severidade === 'alta' ? 'rgba(239, 68, 68, 0.2)' :
                                             comp.severidade === 'media' ? 'rgba(234, 179, 8, 0.2)' :
                                             'rgba(34, 197, 94, 0.2)',
                              color: comp.severidade === 'alta' ? 'var(--danger)' :
                                   comp.severidade === 'media' ? 'var(--warning)' :
                                   'var(--success)'
                            }}
                          >
                            {comp.severidade}
                          </span>
                        </div>
                        <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>{comp.analise}</p>
                        {comp.recomendacao && (
                          <div className="flex items-start gap-2 mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                            <span>{comp.recomendacao}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Inadimplência</p>
                        <p className="text-lg font-bold" style={{
                          color: Number(comp.taxaInadimplencia || 0) > 40 ? 'var(--danger)' :
                                 Number(comp.taxaInadimplencia || 0) > 20 ? 'var(--warning)' :
                                 'var(--success)'
                        }}>
                          {Number(comp.taxaInadimplencia || 0).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recomendação Geral */}
          {analiseFinanceira.recomendacao && (
            <div
              className="rounded-lg p-4"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid var(--primary)'
              }}
            >
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
                <div>
                  <p className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Recomendação</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{analiseFinanceira.recomendacao}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
        )}
      </AnimatePresence>

      {/* Tabela de Faturas */}
      <div className="card">
        <h2 className="section-title">Faturas</h2>
        <p className="section-subtitle mb-4">Gestão de cobranças e status</p>

        {/* Busca e Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar por número ou cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)'
            }}
          >
            <option value="todos">Todos os status</option>
            <option value="paid">Pagas</option>
            <option value="open">Abertas</option>
            <option value="overdue">Vencidas</option>
          </select>

          {(searchQuery || filtroStatus !== 'todos') && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <Filter className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {faturasFiltradas.length} de {faturas.length}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <SkeletonTable rows={8} />
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Vencimento</th>
                <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Valor</th>
                <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {faturasFiltradas.map(fatura => {
                const empresa = empresas.find(e => e.id === fatura.empresa_id)
                return (
                  <tr
                    key={fatura.id}
                    style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td className="py-3 px-4 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{fatura.numero}</td>
                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{empresa?.nome || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{new Date(fatura.vencimento).toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>R$ {fatura.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                    <td className="py-3 px-4"><BadgeStatus status={getStatusBadge(fatura.status)} label={fatura.status} /></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleVisualizarDetalhes(fatura); }}
                          className="p-1.5 rounded hover:bg-blue-100 transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                        </button>
                        {fatura.status === 'open' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAprovar(fatura); }}
                            className="p-1.5 rounded hover:bg-green-100 transition-colors"
                            title="Aprovar pagamento"
                          >
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          </button>
                        )}
                        {fatura.status === 'overdue' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCobrar(fatura); }}
                            className="p-1.5 rounded hover:bg-red-100 transition-colors"
                            title="Enviar cobrança"
                          >
                            <Send className="w-4 h-4 text-danger" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Modal de Detalhes da Fatura */}
      <AnimatePresence>
        {selectedFatura && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
            onClick={() => setSelectedFatura(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Detalhes da Fatura {selectedFatura.numero}</h2>
                <button
                  onClick={() => setSelectedFatura(null)}
                  style={{ color: 'var(--color-text-muted)', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Valor</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>R$ {selectedFatura.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Status</p>
                    <BadgeStatus status={getStatusBadge(selectedFatura.status)} label={selectedFatura.status} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Vencimento</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{new Date(selectedFatura.vencimento).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Emissão</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{new Date(selectedFatura.emissao).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                {/* Registros Associados */}
                <div className="pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Registros Associados ({selectedFatura.registros_ids.length})</h3>
                  <div className="space-y-2">
                    {selectedFatura.registros_ids.map(regId => {
                      const registro = registros.find(r => r.id === regId)
                      return registro ? (
                        <div key={regId} className="p-2 rounded text-sm" style={{ backgroundColor: 'var(--color-border-light)' }}>
                          <div className="flex items-center justify-between">
                            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{registro.tipo} - {registro.id}</span>
                            <span style={{ color: 'var(--color-text-secondary)' }}>R$ {Number(registro.valor || 0).toFixed(2)}</span>
                          </div>
                          <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{registro.descricao}</p>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>

                {/* Logs Associados */}
                <div className="pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Logs Relacionados</h3>
                  {logsCompletos.filter(l => l.origem_tipo === 'fatura' && l.origem_id === selectedFatura.id).map(log => (
                    <div key={log.id} className="p-2 rounded text-sm mb-2" style={{ backgroundColor: 'var(--color-border-light)' }}>
                      <div className="flex items-center gap-2">
                        <BadgeStatus status={log.nivel === 'OK' ? 'ok' : log.nivel === 'WARN' ? 'warning' : 'error'} label={log.nivel} />
                        <span style={{ color: 'var(--color-text-secondary)' }}>{log.mensagem}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tickets Associados */}
                <div className="pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Tickets Relacionados</h3>
                  {ticketsCompletos.filter(t => t.origem_tipo === 'fatura' && t.origem_id === selectedFatura.id).map(ticket => (
                    <div
                      key={ticket.id}
                      onClick={() => navigate(`/chamados?ticket=${ticket.id}`)}
                      className="p-2 rounded text-sm mb-2 cursor-pointer"
                      style={{ backgroundColor: 'var(--color-border-light)', transition: 'background-color 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border-light)'}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{ticket.numero} - {ticket.assunto}</span>
                        <BadgeStatus status={ticket.status === 'resolvido' ? 'ok' : 'warning'} label={ticket.status} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Notificações Associadas */}
                <div className="pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Notificações Relacionadas</h3>
                  {notificacoesCompletas.filter(n => n.origem_tipo === 'fatura' && n.origem_id === selectedFatura.id).map(notif => (
                    <div key={notif.id} className="p-2 rounded text-sm mb-2" style={{ backgroundColor: 'var(--color-border-light)' }}>
                      <div className="flex items-start gap-2">
                        <BadgeStatus status={notif.tipo} />
                        <div>
                          <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{notif.titulo}</p>
                          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{notif.descricao}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
