import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CardStat from '../../components/ui/CardStat'
import ChartLine from '../../components/charts/LineChart'
import ChartBar from '../../components/charts/BarChart'
import Table from '../../components/ui/Table'
import BadgeStatus from '../../components/ui/BadgeStatus'
import { TrendingUp, AlertCircle, CheckCircle2, Clock, DollarSign, Zap, Shield, Lightbulb, X, ArrowRight, Headphones, AlertTriangle } from 'lucide-react'
import { gerarInsightsDashboard, sugerirAcoesRapidas } from '../../utils/insights'
import OnboardingChecklist from '../../onboarding/OnboardingChecklist'
import TutorialGuide from '../../onboarding/TutorialGuide'
import AssistantWidget from '../../onboarding/AssistantWidget'
import { SkeletonCard, SkeletonChart, SkeletonTable } from '../../components/ui/SkeletonLoaders'
import { useSync } from '../../contexts/SyncContext'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [mostrarInsights, setMostrarInsights] = useState(true)
  const navigate = useNavigate()
    const { snapshot, isSyncing, lastSynced } = useSync() || {}
    const [sinceLastSync, setSinceLastSync] = useState('—')

  const integrations = snapshot?.integrations || []
  const logs = snapshot?.logs || []
  const ticketsData = snapshot?.tickets || []
  const faturas = snapshot?.finance?.faturas || []
  const registros = snapshot?.operations?.registros || []
  const syncRows = snapshot?.syncRows || []

  // Simular carregamento
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // Atualiza label "há Xs" sempre que lastSynced muda
  useEffect(() => {
    const update = () => {
      if (!lastSynced) return setSinceLastSync('—')
      const d = new Date(lastSynced)
      if (Number.isNaN(d.getTime())) return setSinceLastSync('—')
      const diff = Math.max(0, Date.now() - d.getTime())
      const seconds = Math.floor(diff / 1000)
      if (seconds < 60) return setSinceLastSync(`há ${seconds}s`)
      const minutes = Math.floor(seconds / 60)
      if (minutes < 60) return setSinceLastSync(`há ${minutes}min`)
      const hours = Math.floor(minutes / 60)
      return setSinceLastSync(`há ${hours}h`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [lastSynced])

  // Gerar insights automáticos com memoização
  const insights = useMemo(() => {
    try {
      return gerarInsightsDashboard()
    } catch (error) {
      console.error('Erro ao gerar insights:', error)
      return []
    }
  }, [])
  
  const acoesRapidas = useMemo(() => {
    try {
      return sugerirAcoesRapidas()
    } catch (error) {
      console.error('Erro ao gerar ações rápidas:', error)
      return []
    }
  }, [])
  
  const insightsSeveros = useMemo(() => insights.filter(i => i.severidade === 'alta'), [insights])

  // Cálculos conectados aos dados reais
  const totalIntegrations = integrations.length || 1
  const okCount = integrations.filter(i => i.status === 'ok').length
  const warningCount = integrations.filter(i => i.status === 'warn' || i.status === 'warning').length
  const errorCount = integrations.filter(i => i.status === 'error').length
  
  const okPercent = totalIntegrations ? Math.round((okCount / totalIntegrations) * 100) : 0
  const warningPercent = totalIntegrations ? Math.round((warningCount / totalIntegrations) * 100) : 0
  const errorPercent = totalIntegrations ? Math.round((errorCount / totalIntegrations) * 100) : 0

  // Chamados abertos hoje (dados simulados)
  const openTicketsToday = ticketsData.filter(t => t.status === 'aberto').length

  // Erros operacionais (inconsistências)
  const errosOperacionais = registros.filter(r => r.inconsistencia).length

  // Erros críticos (logs ERROR)
  const criticalErrors = logs.filter(l => l.nivel === 'ERROR').length

  // Faturas em atraso
  const faturasVencidas = faturas.filter(f => f.status === 'overdue').length
  const valorVencido = faturas
    .filter(f => f.status === 'overdue')
    .reduce((sum, f) => sum + f.valor, 0)

  return (
    <div className="space-y-6">
      {/* Onboarding Checklist - FASE D3 */}
      <OnboardingChecklist />

      {/* Tutorial Guide - FASE D3 */}
      <TutorialGuide />

      {/* Assistant Widget - FASE D3 */}
      <AssistantWidget />

      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Dashboard</h1>
        <p className="text-sm mt-1 flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
          Visão geral de operações e sincronizações
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
            style={{ backgroundColor: 'var(--color-border-light)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
          >
            <span className={`w-2 h-2 rounded-full ${isSyncing ? 'animate-pulse' : ''}`} style={{ backgroundColor: isSyncing ? 'var(--warning)' : 'var(--success)' }} />
            {isSyncing ? 'Sincronizando...' : `Atualizado ${sinceLastSync}`}
          </span>
        </p>
      </div>

      {/* Banner de sincronização */}
      <AnimatePresence>
        {isSyncing && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-lg px-4 py-3 flex items-center gap-3"
            style={{ backgroundColor: 'var(--color-border-light)', border: '1px solid var(--color-border)' }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: 'var(--primary)' }}
            />
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-primary)' }}>
              <span role="img" aria-label="sync">🔄</span>
              Sincronizando dados…
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Insights Inteligentes */}
      <AnimatePresence>
        {mostrarInsights && insightsSeveros.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-xl p-6"
            style={{ 
              border: '1px solid rgba(230, 57, 70, 0.3)',
              background: 'linear-gradient(to right, rgba(230, 57, 70, 0.1), rgba(255, 183, 3, 0.1))'
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-danger/20 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-danger" />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Alertas Críticos</h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Itens que requerem atenção imediata</p>
                </div>
              </div>
              <button
                onClick={() => setMostrarInsights(false)}
                className="transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {insightsSeveros.map((insight, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(insight.link)}
                  className="p-4 rounded-lg transition-all cursor-pointer group"
                  style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                        {insight.titulo || 'Sem título'}
                      </h4>
                      <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>{insight.descricao}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Ação sugerida:</span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{insight.acao}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 transition-colors" style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ações Rápidas Sugeridas */}
      {acoesRapidas.length > 0 && (
        <div className="rounded-xl p-4" style={{ 
          border: '1px solid rgba(0, 48, 73, 0.2)',
          background: 'linear-gradient(to bottom right, rgba(0, 48, 73, 0.05), var(--color-card))'
        }}>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Ações Rápidas Recomendadas</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {acoesRapidas.map((acao, idx) => {
              const Icon = acao.icon === 'DollarSign' ? DollarSign : acao.icon === 'AlertTriangle' ? AlertTriangle : Zap
              return (
                <button
                  key={idx}
                  onClick={() => navigate(acao.link)}
                  className="p-3 rounded-lg transition-all text-left group"
                  style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-card)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" style={{ color: acao.cor === 'danger' ? 'var(--danger)' : acao.cor === 'warning' ? 'var(--warning)' : 'var(--primary)' }} />
                    <h4 className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{acao.titulo}</h4>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{acao.descricao}</p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <div onClick={() => navigate('/operacional?filter=erros')} className="cursor-pointer">
              <CardStat
                title="Erros Operacionais"
                value={errosOperacionais.toString()}
                icon={AlertCircle}
                trend={-15}
                variant="warning"
                loading={loading}
              />
            </div>
            <div onClick={() => navigate('/financeiro?filter=overdue')} className="cursor-pointer">
              <CardStat
                title="Faturas em Atraso"
                value={faturasVencidas.toString()}
                icon={DollarSign}
                trend={-5}
                loading={loading}
              />
            </div>
            <div onClick={() => navigate('/integracoes?filter=error')} className="cursor-pointer">
              <CardStat
                title="Falhas de Integração"
                value={errorCount.toString()}
                icon={Zap}
                trend={0}
                variant="info"
                loading={loading}
              />
            </div>
            <div onClick={() => navigate('/chamados')} className="cursor-pointer">
              <CardStat
                title="Chamados Abertos Hoje"
                value={openTicketsToday.toString()}
                icon={CheckCircle2}
                variant="default"
                loading={loading}
              />
            </div>
          </>
        )}
      </div>

      {/* Indicadores Secundários */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl p-6 transition-all" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-success" aria-hidden="true" />
            <h3 className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Saúde das Integrações</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--color-text-secondary)' }}>OK</span>
              <span className="font-semibold text-success">{okPercent}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--color-text-secondary)' }}>Warning</span>
              <span className="font-semibold text-warning">{warningPercent}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--color-text-secondary)' }}>Error</span>
              <span className="font-semibold text-danger">{errorPercent}%</span>
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/logs?filter=ERROR')}
          className="rounded-xl p-6 transition-all cursor-pointer"
          style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5" style={{ color: 'var(--primary)' }} aria-hidden="true" />
            <h3 className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Erros Críticos (Logs)</h3>
          </div>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{criticalErrors}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Registros com nível ERROR</p>
        </div>

        <div 
          onClick={() => navigate('/chamados')}
          className="rounded-xl p-6 transition-all cursor-pointer"
          style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--primary)' }} aria-hidden="true" />
            <h3 className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Chamados Abertos</h3>
          </div>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{openTicketsToday}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Status: Aberto</p>
        </div>

        <div 
          onClick={() => navigate('/financeiro')}
          className="rounded-xl p-6 transition-all cursor-pointer"
          style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-warning" aria-hidden="true" />
            <h3 className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Status Financeiro</h3>
          </div>
          <p className="text-lg font-bold text-danger">R$ {valorVencido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Em atraso ({faturasVencidas} faturas)</p>
          <p className="text-lg font-bold text-success mt-1">R$ {faturas.filter(f => f.status === 'paid').reduce((s, f) => s + f.valor, 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Pago</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <SkeletonChart />
            <SkeletonChart />
          </>
        ) : (
          <>
            <div className="rounded-xl p-6 transition-all" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
              <ChartLine />
            </div>
            <div className="rounded-xl p-6 transition-all" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
              <ChartBar />
            </div>
          </>
        )}
      </div>

      {/* Tabela de Sincronizações */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Sincronizações Recentes</h2>
        {loading ? (
          <SkeletonTable rows={5} />
        ) : (
          <Table
            columns={['Usuário', 'Sistema', 'Ação', 'Status']}
            rows={syncRows.slice(0, 5).map(s => [
              s.user,
              s.system,
              s.action,
              <BadgeStatus key={s.id} status={s.status} />,
            ])}
            loading={false}
            size="normal"
          />
        )}
      </div>

      {/* Timeline */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Timeline de Atividades</h2>
        <div className="space-y-4">
          {[
            { time: '09:23', event: 'Sincronização do Omie concluída', type: 'success' },
            { time: '10:15', event: 'Alerta: Bling com 2 erros de conciliação', type: 'warning' },
            { time: '11:47', event: 'Financeiro: 3 faturas pagas hoje', type: 'info' },
            { time: '13:30', event: 'Novo chamado #CH-004 aberto', type: 'default' },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="text-xs w-12 pt-1" style={{ color: 'var(--color-text-muted)' }}>{item.time}</div>
              <div className={`w-2 h-2 rounded-full mt-2 ${
                item.type === 'success' ? 'bg-success' :
                item.type === 'warning' ? 'bg-warning' :
                item.type === 'info' ? 'bg-info' : ''
              }`} style={item.type === 'default' ? { backgroundColor: 'var(--color-text-muted)' } : {}}></div>
              <p className="flex-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item.event}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
