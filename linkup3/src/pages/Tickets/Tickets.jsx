import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, AlertCircle, Headphones, ExternalLink, Lightbulb, TrendingUp, Link2, Search, Filter, CheckCircle2, Clock, PlayCircle } from 'lucide-react'
import { analisarTicket } from '../../utils/insights'
import BadgeStatus from '../../components/ui/BadgeStatus'
import { useToast } from '../../contexts/ToastContext'
import { useSync } from '../../contexts/SyncContext'
import { ticketsAPI } from '../../services/api'

export default function Tickets() {
  const { snapshot } = useSync() || {}
  const ticketsSnapshot = snapshot?.tickets || []
  const empresas = snapshot?.empresas || snapshot?.finance?.empresas || []
  const registros = snapshot?.operations?.registros || snapshot?.finance?.registros || []
  const faturas = snapshot?.finance?.faturas || []
  const integracoes = snapshot?.integracoes || snapshot?.integrations || []
  const logsCompletos = snapshot?.logs || []
  const notificacoesCompletas = snapshot?.notifications || []
  const usuarios = snapshot?.users || []

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

  const [ticketsRaw, setTicketsRaw] = useState(ticketsSnapshot)

  useEffect(() => {
    setTicketsRaw(prev => {
      const snapshotIds = new Set(ticketsSnapshot.map(t => t.id || t.numero))
      const manual = (prev || []).filter(t => !snapshotIds.has(t.id || t.numero))
      return [...ticketsSnapshot, ...manual]
    })
  }, [ticketsSnapshot])

  const viewTickets = useMemo(() => (
    (ticketsRaw || []).map(t => {
      const numero = t.numero || t.id
      const empresaNome = empresas.find(e => e.id === t.empresa_id)?.nome || t.client || t.cliente || 'N/A'
      return {
        id: numero,
        subject: t.assunto || t.subject || 'Chamado',
        client: empresaNome,
        priority: t.prioridade || t.priority || 'média',
        status: t.status || 'aberto',
        updated: t.updated || formatTempoRelativo(t.atualizado_em || t.criado_em),
        raw: t
      }
    })
  ), [ticketsRaw, empresas])

  const [tickets, setTickets] = useState(viewTickets)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroPrioridade, setFiltroPrioridade] = useState('todas')
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'média'
  })
  const toast = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const subjectInputRef = useRef(null)

  useEffect(() => {
    setTickets(viewTickets)
  }, [viewTickets])

  // Busca e filtros inteligentes
  const ticketsFiltrados = useMemo(() => {
    let resultado = [...viewTickets]

    // Filtro por busca (ID, assunto, cliente)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      resultado = resultado.filter(t =>
        t.id.toLowerCase().includes(query) ||
        t.subject.toLowerCase().includes(query) ||
        t.client.toLowerCase().includes(query)
      )
    }

    // Filtro por status
    if (filtroStatus !== 'todos') {
      resultado = resultado.filter(t => t.status === filtroStatus)
    }

    // Filtro por prioridade
    if (filtroPrioridade !== 'todas') {
      resultado = resultado.filter(t => t.priority === filtroPrioridade)
    }

    return resultado
  }, [viewTickets, searchQuery, filtroStatus, filtroPrioridade])

  useEffect(() => {
    setTickets(ticketsFiltrados)
  }, [ticketsFiltrados])

  // Filtros de URL
  const ticketFilter = searchParams.get('ticket')
  const origemModulo = searchParams.get('origem_modulo')
  const origemTipo = searchParams.get('origem_tipo')
  const origemId = searchParams.get('origem_id')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (showModal && subjectInputRef.current) {
      subjectInputRef.current.focus()
    }
  }, [showModal])

  // Se há filtro de ticket específico, abrir modal de detalhes
  useEffect(() => {
    if (ticketFilter) {
      const ticket = ticketsRaw.find(t => (t.numero || t.id) === ticketFilter)
      if (ticket) setSelectedTicket(ticket)
    }
  }, [ticketFilter, ticketsRaw])

  // Estatísticas de tickets
  const abertos = ticketsRaw.filter(t => t.status === 'aberto').length
  const emAndamento = ticketsRaw.filter(t => t.status === 'em andamento').length
  const resolvidos = ticketsRaw.filter(t => t.status === 'resolvido').length

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.subject.trim() || !formData.description.trim()) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    try {
      const persisted = await ticketsAPI.criar({
        titulo: formData.subject,
        descricao: formData.description,
        prioridade: formData.priority,
      })
      // Dispara recarregamento global via SyncContext
      window.dispatchEvent(new Event('linkup-data-changed'))
      setShowModal(false)
      setFormData({ subject: '', description: '', priority: 'média' })
      toast.success(`Chamado ${persisted.titulo || formData.subject} criado com sucesso!`)
    } catch (err) {
      toast.error('Erro ao criar chamado. Tente novamente.')
    }
  }

  const getPriorityBadge = (priority) => {
    const map = {
      'alta': 'error',
      'média': 'warning',
      'baixa': 'ok'
    }
    return <BadgeStatus status={map[priority]} label={priority} />
  }

  const getStatusBadge = (status) => {
    const map = {
      'aberto': 'warning',
      'em andamento': 'info',
      'resolvido': 'ok'
    }
    return <BadgeStatus status={map[status]} label={status} />
  }

  return (
    <motion.div className="p-6 space-y-6 animate-slideUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Chamados</h1>
          <p className="section-subtitle">Gerenciamento de tickets de suporte</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Abrir chamado
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>Abertos</h3>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{abertos}</p>
        </div>
        <div className="card">
          <h3 className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>Em Andamento</h3>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{emAndamento}</p>
        </div>
        <div className="card">
          <h3 className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>Resolvidos</h3>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{resolvidos}</p>
        </div>
      </div>

      {/* Busca e Filtros Rápidos */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar por ID, assunto ou cliente..."
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

          {/* Filtro Status */}
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
            <option value="aberto">Abertos</option>
            <option value="em andamento">Em andamento</option>
            <option value="resolvido">Resolvidos</option>
          </select>

          {/* Filtro Prioridade */}
          <select
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value)}
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)'
            }}
          >
            <option value="todas">Todas as prioridades</option>
            <option value="alta">Alta</option>
            <option value="média">Média</option>
            <option value="baixa">Baixa</option>
          </select>

          {/* Contador de resultados */}
          {(searchQuery || filtroStatus !== 'todos' || filtroPrioridade !== 'todas') && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <Filter className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {tickets.length} de {viewTickets.length}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title mb-4">Lista de Chamados</h2>
        {tickets.length === 0 && !loading ? (
          <div className="text-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full mx-auto mb-4" style={{ backgroundColor: 'var(--color-border-light)' }}>
              <Headphones className="w-8 h-8" style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
            </div>
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>Nenhum chamado aberto</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-2 inline" />
              Abrir primeiro chamado
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Assunto</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Cliente</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Prioridade</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Atualizado</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => {
                  const ticketCompleto = ticketsRaw.find(tc => (tc.numero || tc.id) === t.id) || t.raw
                  const analise = ticketCompleto ? analisarTicket(ticketCompleto) : null

                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTicket(ticketCompleto)}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: '1px solid var(--color-border)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border-light)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className="py-3 px-4 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        <div className="flex items-center gap-2">
                          {t.id}
                          {analise && analise.prioridadeSugerida !== t.priority && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {analise.prioridadeSugerida}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t.subject}</p>
                          {analise && analise.classificacao && (
                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                              <span className="font-medium">{analise.classificacao}</span>
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t.client}</td>
                      <td className="py-3 px-4">{getPriorityBadge(t.priority)}</td>
                      <td className="py-3 px-4">{getStatusBadge(t.status)}</td>
                      <td className="py-3 px-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t.updated}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Abrir Chamado */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-labelledby="modal-title"
              aria-modal="true"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" style={{ color: 'var(--primary)' }} aria-hidden="true" />
                  <h2 id="modal-title" className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Novo Chamado</h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                  style={{ color: 'var(--color-text-muted)', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                  aria-label="Fechar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="ticket-subject" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Assunto *
                  </label>
                  <input
                    id="ticket-subject"
                    ref={subjectInputRef}
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-600 outline-none"
                    style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                    placeholder="Descreva brevemente o problema"
                    required
                    aria-required="true"
                  />
                </div>

                <div>
                  <label htmlFor="ticket-description" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Descrição *
                  </label>
                  <textarea
                    id="ticket-description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-600 outline-none resize-none"
                    style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                    rows="4"
                    placeholder="Descreva o problema em detalhes"
                    required
                    aria-required="true"
                  />
                </div>

                <div>
                  <label htmlFor="ticket-priority" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Prioridade
                  </label>
                  <select
                    id="ticket-priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-600 outline-none"
                    style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                  >
                    <option value="baixa">Baixa</option>
                    <option value="média">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg transition-colors"
                    style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Abrir Chamado
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Detalhes do Ticket */}
      <AnimatePresence>
        {selectedTicket && (() => {
          const analise = analisarTicket(selectedTicket)
          const ticketId = selectedTicket.numero || selectedTicket.id
          const logsRelacionados = logsCompletos.filter(l =>
            l.origem_tipo === 'ticket' && l.origem_id === ticketId
          )
          const notificacoesRelacionadas = notificacoesCompletas.filter(n =>
            n.relacionado === ticketId || n.origem_id === ticketId
          )

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
              onClick={() => setSelectedTicket(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Detalhes do Chamado {ticketId}</h2>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    style={{ color: 'var(--color-text-muted)', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Análise Inteligente */}
                {analise && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                      <h3 className="font-semibold text-blue-900">Análise Automática</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white/70 p-3 rounded border border-blue-200">
                        <p className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>Classificação</p>
                        <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{analise.classificacao}</p>
                      </div>
                      <div className="bg-white/70 p-3 rounded border border-blue-200">
                        <p className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>Prioridade Sugerida</p>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(analise.prioridadeSugerida)}
                          {analise.prioridadeSugerida !== selectedTicket.prioridade && (
                            <span className="text-xs" style={{ color: 'var(--primary)' }}>(atual: {selectedTicket.prioridade})</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/70 p-3 rounded border border-blue-200">
                      <p className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>Justificativa</p>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{analise.justificativa}</p>
                    </div>
                    {analise.recomendacao && (
                      <div className="mt-3 bg-blue-100 p-3 rounded border border-blue-300">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Recomendação de Resolução</p>
                        <p className="text-sm text-blue-800">{analise.recomendacao}</p>
                      </div>
                    )}
                  </div>
                )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Assunto</p>
                    <p className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>{selectedTicket.assunto}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Status</p>
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Prioridade</p>
                    {getPriorityBadge(selectedTicket.prioridade)}
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Criado em</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{new Date(selectedTicket.criado_em).toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Descrição</p>
                  <p className="text-sm p-3 rounded" style={{ backgroundColor: 'var(--color-border-light)', color: 'var(--color-text-secondary)' }}>{selectedTicket.descricao}</p>
                </div>

                {/* Relacionamentos Inteligentes */}
                {(logsRelacionados.length > 0 || notificacoesRelacionadas.length > 0) && (
                  <div className="pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Link2 className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Eventos Relacionados</h3>
                    </div>

                    <div className="space-y-3">
                      {logsRelacionados.length > 0 && (
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                          <p className="text-xs font-semibold text-orange-900 mb-2">
                            {logsRelacionados.length} Log{logsRelacionados.length > 1 ? 's' : ''} Associado{logsRelacionados.length > 1 ? 's' : ''}
                          </p>
                          <div className="space-y-1.5">
                            {logsRelacionados.slice(0, 3).map(log => (
                              <div key={log.id} className="text-xs bg-white/70 p-2 rounded border border-orange-200">
                                <span className={`font-semibold ${
                                  log.nivel === 'ERROR' ? 'text-red-600' :
                                  log.nivel === 'WARN' ? 'text-yellow-600' :
                                  'text-green-600'
                                }`}>[{log.nivel}]</span> {log.mensagem}
                              </div>
                            ))}
                            {logsRelacionados.length > 3 && (
                              <button
                                onClick={() => navigate(`/logs?ticket=${ticketId}`)}
                                className="text-xs text-orange-700 hover:text-orange-900 font-medium"
                              >
                                Ver todos os {logsRelacionados.length} logs →
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {notificacoesRelacionadas.length > 0 && (
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <p className="text-xs font-semibold text-purple-900 mb-2">
                            {notificacoesRelacionadas.length} Notificação{notificacoesRelacionadas.length > 1 ? 'ões' : ''} Relacionada{notificacoesRelacionadas.length > 1 ? 's' : ''}
                          </p>
                          <div className="space-y-1.5">
                            {notificacoesRelacionadas.slice(0, 3).map(notif => (
                              <div key={notif.id} className="text-xs bg-white/70 p-2 rounded border border-purple-200">
                                <span className="font-medium">{notif.title || notif.titulo || notif.descricao}</span>
                              </div>
                            ))}
                            {notificacoesRelacionadas.length > 3 && (
                              <button
                                onClick={() => navigate(`/notificacoes`)}
                                className="text-xs text-purple-700 hover:text-purple-900 font-medium"
                              >
                                Ver todas as {notificacoesRelacionadas.length} notificações →
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Origem do Ticket */}
                <div className="pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Origem do Ticket</h3>
                  {selectedTicket.origem_tipo ? (
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--color-border-light)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize" style={{ color: 'var(--color-text-secondary)' }}>
                          {selectedTicket.origem_modulo} → {selectedTicket.origem_tipo}
                        </span>
                        <BadgeStatus status="info" label={selectedTicket.origem_id} />
                      </div>
                      {selectedTicket.origem_tipo === 'registro' && (() => {
                        const registro = registros.find(r => r.id === selectedTicket.origem_id)
                        return registro ? (
                          <div>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}><strong>Tipo:</strong> {registro.tipo}</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}><strong>Descrição:</strong> {registro.descricao}</p>
                            <button
                              onClick={() => navigate(`/operacional?registro=${registro.id}`)}
                              className="text-xs px-2 py-1 mt-2 bg-primary-100 text-primary-700 rounded hover:bg-primary-200"
                            >
                              Ver Registro
                            </button>
                          </div>
                        ) : null
                      })()}
                      {selectedTicket.origem_tipo === 'fatura' && (() => {
                        const fatura = faturas.find(f => f.id === selectedTicket.origem_id)
                        return fatura ? (
                          <div>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}><strong>Número:</strong> {fatura.numero}</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}><strong>Valor:</strong> R$ {fatura.valor.toFixed(2)}</p>
                            <button
                              onClick={() => navigate(`/financeiro?fatura=${fatura.id}`)}
                              className="text-xs px-2 py-1 mt-2 bg-primary-100 text-primary-700 rounded hover:bg-primary-200"
                            >
                              Ver Fatura
                            </button>
                          </div>
                        ) : null
                      })()}
                      {selectedTicket.origem_tipo === 'integracao' && (() => {
                        const integracao = integracoes.find(i => i.id === selectedTicket.origem_id)
                        return integracao ? (
                          <div>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}><strong>Nome:</strong> {integracao.nome}</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}><strong>Status:</strong> {integracao.status}</p>
                            <button
                              onClick={() => navigate(`/integracoes?integracao=${integracao.id}`)}
                              className="text-xs px-2 py-1 mt-2 bg-primary-100 text-primary-700 rounded hover:bg-primary-200"
                            >
                              Ver Integração
                            </button>
                          </div>
                        ) : null
                      })()}
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Sem origem específica</p>
                  )}
                </div>

                {/* Logs Relacionados */}
                <div className="pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Logs Relacionados</h3>
                  {logsCompletos.filter(l => l.origem_tipo === 'ticket' && l.origem_id === selectedTicket.id).map(log => (
                    <div key={log.id} className="p-2 rounded text-sm mb-2" style={{ backgroundColor: 'var(--color-border-light)' }}>
                      <div className="flex items-center gap-2">
                        <BadgeStatus status={log.nivel === 'OK' ? 'ok' : log.nivel === 'WARN' ? 'warning' : 'error'} label={log.nivel} />
                        <span style={{ color: 'var(--color-text-secondary)' }}>{log.mensagem}</span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{new Date(log.timestamp).toLocaleString('pt-BR')}</p>
                    </div>
                  ))}
                  {logsCompletos.filter(l => l.origem_tipo === 'ticket' && l.origem_id === selectedTicket.id).length === 0 && (
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Nenhum log registrado para este ticket</p>
                  )}
                </div>

                {/* Notificações Relacionadas */}
                <div className="pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Notificações Relacionadas</h3>
                  {notificacoesCompletas.filter(n => n.origem_tipo === 'ticket' && n.origem_id === selectedTicket.id).map(notif => (
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
                  {notificacoesCompletas.filter(n => n.origem_tipo === 'ticket' && n.origem_id === selectedTicket.id).length === 0 && (
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Nenhuma notificação relacionada</p>
                  )}
                </div>
              </div>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </motion.div>
  )
}
