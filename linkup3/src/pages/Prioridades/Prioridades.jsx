import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Clock, ExternalLink, Filter, TrendingUp, Check, X as XIcon, ArrowRight } from 'lucide-react'
import PageContainer from '../../components/layout/PageContainer'
import BadgeStatus from '../../components/ui/BadgeStatus'
import { useSync } from '../../contexts/SyncContext'
import { useToast } from '../../contexts/ToastContext'

export default function Prioridades() {
  const navigate = useNavigate()
  const { snapshot } = useSync() || {}
  const [filtroSeveridade, setFiltroSeveridade] = useState('todas') // todas | alta | média
  const [itensResolvidos, setItensResolvidos] = useState(new Set())
  const toast = useToast()

  // Quick Actions
  const handleResolver = (item, e) => {
    e.stopPropagation()
    setItensResolvidos(prev => new Set([...prev, item.id]))
    toast.success(`${item.tipo} marcado como resolvido!`)
  }

  const handleEscalar = (item, e) => {
    e.stopPropagation()
    toast.info(`${item.tipo} escalado para equipe técnica`)
    navigate(item.link)
  }

  const handleIgnorar = (item, e) => {
    e.stopPropagation()
    setItensResolvidos(prev => new Set([...prev, item.id]))
    toast.warning(`${item.tipo} ignorado`)
  }

  // Consolidar TODOS os itens que precisam de ação
  const itensPrioritarios = useMemo(() => {
    const items = []

    // 1. TICKETS CRÍTICOS NÃO RESOLVIDOS
    const tickets = snapshot?.tickets || []
    tickets
      .filter(t => t.prioridade === 'alta' && t.status !== 'resolvido' && t.status !== 'fechado')
      .forEach(ticket => {
        items.push({
          id: `ticket-${ticket.id}`,
          tipo: 'Ticket',
          severidade: 'alta',
          titulo: ticket.assunto || ticket.numero || `Ticket #${ticket.id}`,
          descricao: ticket.descricao?.substring(0, 150) || 'Sem descrição',
          origem: 'Suporte',
          link: `/chamados?id=${ticket.id}`,
          timestamp: ticket.criado_em || ticket.atualizado_em,
          acao: 'Resolver chamado',
          impacto: 'Cliente pode estar aguardando atendimento'
        })
      })

    // 2. INTEGRAÇÕES COM ERRO/WARNING
    const integracoes = snapshot?.integrations || []
    integracoes
      .filter(int => int.status === 'error' || int.status === 'warn')
      .forEach(int => {
        const severidade = int.status === 'error' ? 'alta' : 'média'
        items.push({
          id: `integracao-${int.id}`,
          tipo: 'Integração',
          severidade,
          titulo: `${int.nome}: ${int.status === 'error' ? 'Sem resposta' : 'Instável'}`,
          descricao: int.status === 'error'
            ? 'Sincronização interrompida. Dados podem estar desatualizados.'
            : 'Conexão intermitente. Recomendamos verificar credenciais.',
          origem: 'Integrações',
          link: `/integracoes?id=${int.id}`,
          timestamp: int.ultimo_sync || new Date().toISOString(),
          acao: int.status === 'error' ? 'Restabelecer conexão' : 'Monitorar estabilidade',
          impacto: int.status === 'error'
            ? 'Dados críticos podem não estar sincronizando'
            : 'Performance pode estar degradada'
        })
      })

    // 3. FATURAS VENCIDAS
    const faturas = snapshot?.finance?.faturas || []
    faturas
      .filter(f => f.status === 'overdue')
      .forEach(fatura => {
        items.push({
          id: `fatura-${fatura.id}`,
          tipo: 'Financeiro',
          severidade: 'alta',
          titulo: `Fatura #${fatura.numero} vencida`,
          descricao: `Valor: R$ ${fatura.valor?.toFixed(2)}. Vencimento: ${new Date(fatura.vencimento).toLocaleDateString()}`,
          origem: 'Financeiro',
          link: `/financeiro?id=${fatura.id}`,
          timestamp: fatura.vencimento,
          acao: 'Acionar cobrança',
          impacto: 'Fluxo de caixa pode estar comprometido'
        })
      })

    // 4. REGISTROS COM INCONSISTÊNCIA
    const registros = snapshot?.operations?.registros || []
    registros
      .filter(r => r.inconsistencia)
      .forEach(registro => {
        items.push({
          id: `registro-${registro.id}`,
          tipo: 'Operacional',
          severidade: 'média',
          titulo: `Registro #${registro.id}: ${registro.inconsistencia}`,
          descricao: 'Inconsistência detectada que pode impactar dados operacionais.',
          origem: 'Operacional',
          link: `/operacional?id=${registro.id}`,
          timestamp: registro.criado_em || registro.data,
          acao: 'Validar registro',
          impacto: 'Relatórios podem apresentar divergências'
        })
      })

    // 5. LOGS DE ERRO NÃO TRATADOS (últimas 24h)
    const logs = snapshot?.logs || []
    const ultimoDia = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const errosRecentes = logs
      .filter(log =>
        log.nivel === 'ERROR' &&
        new Date(log.timestamp) > ultimoDia
      )

    // Agrupar erros por módulo
    const errosPorModulo = errosRecentes.reduce((acc, log) => {
      const modulo = log.modulo || 'sistema'
      if (!acc[modulo]) acc[modulo] = []
      acc[modulo].push(log)
      return acc
    }, {})

    Object.entries(errosPorModulo).forEach(([modulo, erros]) => {
      if (erros.length >= 3) { // Só alerta se 3+ erros no mesmo módulo
        items.push({
          id: `log-${modulo}`,
          tipo: 'Sistema',
          severidade: 'alta',
          titulo: `${erros.length} erros em ${modulo}`,
          descricao: `Múltiplas falhas detectadas nas últimas 24h. Última: ${erros[erros.length - 1].mensagem?.substring(0, 80)}`,
          origem: 'Logs',
          link: `/logs?modulo=${modulo}&nivel=ERROR`,
          timestamp: erros[erros.length - 1].timestamp,
          acao: 'Investigar causa raiz',
          impacto: 'Funcionalidade pode estar comprometida'
        })
      }
    })

    return items
  }, [snapshot])

  // Filtrar por severidade
  const itensFiltrados = useMemo(() => {
    let items = itensPrioritarios.filter(item => !itensResolvidos.has(item.id))
    if (filtroSeveridade === 'todas') return items
    return items.filter(item => item.severidade === filtroSeveridade)
  }, [itensPrioritarios, filtroSeveridade, itensResolvidos])

  // Ordenar: alta primeiro, depois por timestamp
  const itensOrdenados = useMemo(() => {
    return [...itensFiltrados].sort((a, b) => {
      // Prioridade: alta > média
      if (a.severidade === 'alta' && b.severidade !== 'alta') return -1
      if (a.severidade !== 'alta' && b.severidade === 'alta') return 1
      // Dentro da mesma severidade, mais recente primeiro
      return new Date(b.timestamp) - new Date(a.timestamp)
    })
  }, [itensFiltrados])

  const contadores = useMemo(() => ({
    alta: itensPrioritarios.filter(i => i.severidade === 'alta').length,
    media: itensPrioritarios.filter(i => i.severidade === 'média').length,
    total: itensPrioritarios.length
  }), [itensPrioritarios])

  return (
    <PageContainer
      title="Central de Prioridades"
      subtitle="Itens que requerem decisão agrupados por urgência"
    >
      {/* Header com contadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div
          className="p-4 rounded-lg cursor-pointer transition-all"
          style={{
            backgroundColor: filtroSeveridade === 'alta' ? 'rgba(230, 57, 70, 0.1)' : 'var(--color-card)',
            border: filtroSeveridade === 'alta' ? '2px solid var(--danger)' : '1px solid var(--color-border)'
          }}
          onClick={() => setFiltroSeveridade(filtroSeveridade === 'alta' ? 'todas' : 'alta')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Urgentes</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--danger)' }}>{contadores.alta}</p>
            </div>
            <AlertTriangle className="w-8 h-8" style={{ color: 'var(--danger)' }} />
          </div>
        </div>

        <div
          className="p-4 rounded-lg cursor-pointer transition-all"
          style={{
            backgroundColor: filtroSeveridade === 'média' ? 'rgba(255, 183, 3, 0.1)' : 'var(--color-card)',
            border: filtroSeveridade === 'média' ? '2px solid var(--warning)' : '1px solid var(--color-border)'
          }}
          onClick={() => setFiltroSeveridade(filtroSeveridade === 'média' ? 'todas' : 'média')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Atenção</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--warning)' }}>{contadores.media}</p>
            </div>
            <Clock className="w-8 h-8" style={{ color: 'var(--warning)' }} />
          </div>
        </div>

        <div
          className="p-4 rounded-lg cursor-pointer transition-all"
          style={{
            backgroundColor: filtroSeveridade === 'todas' ? 'rgba(0, 119, 182, 0.1)' : 'var(--color-card)',
            border: filtroSeveridade === 'todas' ? '2px solid var(--primary)' : '1px solid var(--color-border)'
          }}
          onClick={() => setFiltroSeveridade('todas')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Total</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>{contadores.total}</p>
            </div>
            <TrendingUp className="w-8 h-8" style={{ color: 'var(--primary)' }} />
          </div>
        </div>
      </div>

      {/* Lista de prioridades */}
      {itensOrdenados.length === 0 ? (
        <div
          className="p-12 rounded-xl text-center"
          style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
        >
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--success)' }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Nenhuma prioridade pendente
          </h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Todos os itens críticos foram resolvidos. Continue monitorando o dashboard.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {itensOrdenados.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(item.link)}
              className="p-5 rounded-xl transition-all cursor-pointer group"
              style={{
                backgroundColor: 'var(--color-card)',
                border: `2px solid ${item.severidade === 'alta' ? 'var(--danger)' : 'var(--warning)'}`,
                borderLeft: `6px solid ${item.severidade === 'alta' ? 'var(--danger)' : 'var(--warning)'}`
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <BadgeStatus status={item.severidade === 'alta' ? 'error' : 'warning'}>
                      {item.severidade === 'alta' ? 'URGENTE' : 'ATENÇÃO'}
                    </BadgeStatus>
                    <span className="text-xs font-medium px-2 py-1 rounded" style={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      color: 'var(--color-text-secondary)'
                    }}>
                      {item.tipo}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(item.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  {/* Título */}
                  <h3 className="text-lg font-bold mb-2 group-hover:underline" style={{ color: 'var(--color-text-primary)' }}>
                    {item.titulo}
                  </h3>

                  {/* Descrição */}
                  <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {item.descricao}
                  </p>

                  {/* Impacto + Ação */}
                  <div className="flex flex-col gap-2 mb-3">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-semibold" style={{ color: 'var(--danger)' }}>Impacto:</span>
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{item.impacto}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>Ação sugerida:</span>
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{item.acao}</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={(e) => handleResolver(item, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                      style={{
                        backgroundColor: 'var(--success)',
                        color: 'white'
                      }}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Resolver
                    </button>
                    <button
                      onClick={(e) => handleEscalar(item, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'white'
                      }}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      Ir para detalhes
                    </button>
                    <button
                      onClick={(e) => handleIgnorar(item, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                      style={{
                        backgroundColor: 'var(--color-border)',
                        color: 'var(--color-text-secondary)'
                      }}
                    >
                      <XIcon className="w-3.5 h-3.5" />
                      Ignorar
                    </button>
                  </div>
                </div>

                {/* Ícone de ação */}
                <ExternalLink className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" style={{ color: 'var(--primary)' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
