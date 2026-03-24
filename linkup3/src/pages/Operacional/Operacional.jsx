import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Table from '../../components/ui/Table'
import CardStat from '../../components/ui/CardStat'
import { motion } from 'framer-motion'
import { User, ListTodo, AlertOctagon, DollarSign, AlertTriangle, Lightbulb, HelpCircle } from 'lucide-react'
import BadgeStatus from '../../components/ui/BadgeStatus'
import { analisarRegistro } from '../../utils/insights'
import { useSync } from '../../contexts/SyncContext'

export default function Operacional() {
  const { snapshot } = useSync() || {}
  const registros = snapshot?.operations?.registros || snapshot?.finance?.registros || []
  const faturas = snapshot?.finance?.faturas || []
  const ticketsCompletos = snapshot?.tickets || []
  const logsCompletos = snapshot?.logs || []
  const usuarios = snapshot?.users || []
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const filter = searchParams.get('filter')

  // Filtrar registros se houver filtro de erro
  const registrosFiltrados = filter === 'erros' 
    ? registros.filter(r => r.inconsistencia)
    : registros

  // Usuário com mais inconsistências
  const userInconsistencies = registros.reduce((acc, op) => {
    if (op.inconsistencia) {
      const userName = usuarios.find(u => u.id === op.usuario_id)?.nome || 'Desconhecido'
      acc[userName] = (acc[userName] || 0) + 1
    }
    return acc
  }, {})
  
  const topUser = Object.entries(userInconsistencies).sort((a, b) => b[1] - a[1])[0] || ['Nenhum', 0]

  // Impacto financeiro estimado (soma valores de registros com inconsistência)
  const impactoFinanceiro = registros
    .filter(r => r.inconsistencia)
    .reduce((sum, r) => sum + (r.valor || 0), 0)

  // Total de registros por usuário (top 3)
  const registrosPorUsuario = registros.reduce((acc, r) => {
    const userName = usuarios.find(u => u.id === r.usuario_id)?.nome || 'Desconhecido'
    acc[userName] = (acc[userName] || 0) + 1
    return acc
  }, {})
  const top3Users = Object.entries(registrosPorUsuario)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  // Eventos críticos recentes
  const criticalEvents = registros.filter(op => op.inconsistencia)

  // Função para abrir ticket relacionado ao registro
  const handleAbrirTicket = (registro) => {
    navigate(`/chamados?origem_tipo=registro&origem_id=${registro.id}`)
  }

  return (
    <motion.div className="p-6 space-y-6 animate-scaleSubtle">
      <div>
        <h1 className="section-title">Operacional</h1>
        <p className="section-subtitle">Atividades recentes e indicadores operacionais</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardStat title="Registros hoje" value={registros.length.toString()} />
        <CardStat title="Inconsistências detectadas" value={registros.filter(r => r.inconsistencia).length.toString()} />
        <CardStat title="Taxa de Erro" value="3.2%" />
      </div>

      {/* Novos Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-danger" />
            <h3 className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Impacto Financeiro Estimado</h3>
          </div>
          <p className="text-2xl font-bold text-danger">R$ {impactoFinanceiro.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Valor em inconsistências</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <User className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <h3 className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Registros por Usuário</h3>
          </div>
          <div className="space-y-2">
            {top3Users.map(([user, count], idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--color-text-secondary)' }}>{user}</span>
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <AlertOctagon className="w-5 h-5 text-warning" />
            <h3 className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Mais Inconsistências</h3>
          </div>
          <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{topUser[0]}</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{topUser[1]} {topUser[1] === 1 ? 'ocorrência' : 'ocorrências'}</p>
        </div>
      </div>

      {/* Eventos Críticos Recentes */}
      <div className="card">
        <h2 className="section-title mb-4">Eventos Críticos Recentes</h2>
        <div className="space-y-3">
          {criticalEvents.map((event, idx) => {
            const fatura = faturas.find(f => f.id === event.relacionado_fatura_id)
            const ticket = ticketsCompletos.find(t => t.origem_tipo === 'registro' && t.origem_id === event.id)
            const log = logsCompletos.find(l => l.origem_tipo === 'registro' && l.origem_id === event.id)
            const usuario = usuarios.find(u => u.id === event.usuario_id)
            
            // Análise inteligente do registro
            const analise = analisarRegistro(event)

            return (
              <div key={idx} className="rounded-lg transition-all overflow-hidden" style={{ border: '1px solid rgba(230, 57, 70, 0.2)' }}>
                <div className="flex items-center gap-4 p-4" style={{ backgroundColor: 'rgba(230, 57, 70, 0.05)' }}>
                  <AlertOctagon className="w-5 h-5 text-danger flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{event.tipo} - {event.id}</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Usuário: {usuario?.nome || 'N/A'}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{event.descricao}</p>
                    
                    {/* Deep links */}
                    <div className="flex gap-2 mt-2">
                      {fatura && (
                        <button 
                          onClick={() => navigate(`/financeiro?fatura=${fatura.id}`)}
                          className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded hover:bg-primary-200"
                        >
                          Ver Fatura
                        </button>
                      )}
                      {ticket && (
                        <button 
                          onClick={() => navigate(`/chamados?ticket=${ticket.id}`)}
                          className="text-xs px-2 py-1 bg-warning-100 text-warning-700 rounded hover:bg-warning-200"
                        >
                          Ver Ticket
                        </button>
                      )}
                      {log && (
                        <button 
                          onClick={() => navigate(`/logs?registro=${event.id}`)}
                          className="text-xs px-2 py-1 rounded"
                          style={{ backgroundColor: 'var(--color-border-light)', color: 'var(--color-text-secondary)' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border-light)'}
                        >
                          Ver Log
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <BadgeStatus 
                      status={analise.severidade === 'alta' ? 'error' : 'warning'} 
                      label={`Severidade: ${analise.severidade}`} 
                    />
                    {analise.valor > 200 && !ticket && (
                      <button
                        onClick={() => handleAbrirTicket(event)}
                        className="text-xs px-3 py-1.5 bg-danger text-white rounded hover:bg-danger/90 transition-colors animate-pulse"
                      >
                        Abrir Ticket Urgente
                      </button>
                    )}
                    {(!ticket && analise.valor <= 200) && (
                      <button
                        onClick={() => handleAbrirTicket(event)}
                        className="text-xs px-3 py-1.5 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                      >
                        Abrir Ticket
                      </button>
                    )}
                  </div>
                </div>

                {/* Módulo: Possíveis Causas (IA) */}
                <div className="p-4" style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-4 h-4 mt-0.5" style={{ color: 'var(--primary)' }} />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Possíveis Causas</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside" style={{ color: 'var(--color-text-secondary)' }}>
                        {event.detalhes.problema && (
                          <li>{event.detalhes.problema}</li>
                        )}
                        {!fatura && (
                          <li>Fatura não vinculada ao registro</li>
                        )}
                        <li>Valor não reconciliado no sistema financeiro</li>
                        {event.valor > 100 && (
                          <li>Valor elevado requer validação manual</li>
                        )}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 p-2 rounded" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                    <Lightbulb className="w-4 h-4 text-warning" />
                    <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>Ação sugerida:</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{analise.acao}</p>
                  </div>
                </div>
              </div>
            )
          })}
          {criticalEvents.length === 0 && (
            <p className="text-center py-4" style={{ color: 'var(--color-text-muted)' }}>Nenhum evento crítico recente</p>
          )}
        </div>
      </div>

      {/* Tabela Original */}
      <div className="card">
        <h2 className="section-title">Registros recentes</h2>
        <p className="section-subtitle mb-3">Últimas entradas e status</p>
        <Table
          columns={["ID", "Tipo", "Usuário", "Inconsistência"]}
          rows={registros.map(r => [r.id, r.tipo, usuarios.find(u => u.id === r.usuario_id)?.nome || 'N/A', r.inconsistencia ? 'SIM' : 'NÃO'])}
        />
      </div>
    </motion.div>
  )
}
