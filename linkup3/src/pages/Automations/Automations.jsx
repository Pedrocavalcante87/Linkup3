import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Plus, Play, Pause, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useAutomations } from '../../hooks/useAutomations'

export default function Automations() {
  const { automations, stats, executionHistory, addAutomation, toggleAutomation, removeAutomation } = useAutomations()
  const [showForm, setShowForm] = useState(false)
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    trigger: { type: 'fatura_atrasada', condition: 'dias_atraso > 7' },
    action: { type: 'criar_ticket', config: {} }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    addAutomation(newAutomation)
    setShowForm(false)
    setNewAutomation({ name: '', trigger: { type: 'fatura_atrasada', condition: 'dias_atraso > 7' }, action: { type: 'criar_ticket', config: {} } })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Automações</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Configure ações automáticas baseadas em eventos</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Automação
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total de Automações</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{stats?.total || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Ativas</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--success)' }}>{stats?.enabled || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Desativadas</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-text-muted)' }}>{stats?.disabled || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Execuções Totais</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{stats?.totalExecutions || 0}</p>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="card mb-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Nova Automação</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Nome</label>
              <input type="text" value={newAutomation.name} onChange={(e) => setNewAutomation({...newAutomation, name: e.target.value})} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Trigger</label>
              <select value={newAutomation.trigger.type} onChange={(e) => setNewAutomation({...newAutomation, trigger: {...newAutomation.trigger, type: e.target.value}})} className="input">
                <option value="fatura_atrasada">Fatura Atrasada</option>
                <option value="integracao_falha">Integração com Falha</option>
                <option value="log_error">Log de Erro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Ação</label>
              <select value={newAutomation.action.type} onChange={(e) => setNewAutomation({...newAutomation, action: {...newAutomation.action, type: e.target.value}})} className="input">
                <option value="criar_ticket">Criar Ticket</option>
                <option value="disparar_notificacao">Disparar Notificação</option>
                <option value="criar_registro_operacional">Criar Registro Operacional</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Criar</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancelar</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Lista de Automações */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          <Zap className="w-5 h-5 inline mr-2" />
          Automações Configuradas
        </h3>
        <div className="space-y-3">
          {automations.map(auto => (
            <div key={auto.id} className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-border-light)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{auto.name}</h4>
                    {auto.enabled ? (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>Ativa</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>Pausada</span>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Trigger: {auto.trigger.type} | Ação: {auto.action.type}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    Executada {auto.executionCount || 0} vezes
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleAutomation(auto.id)} className="btn-ghost p-2">
                    {auto.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button onClick={() => removeAutomation(auto.id)} className="btn-ghost p-2 text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Histórico de Execuções */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          <Clock className="w-5 h-5 inline mr-2" />
          Histórico Recente
        </h3>
        <div className="space-y-2">
          {executionHistory.map((exec, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: 'var(--color-border-light)' }}>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{exec.automationName}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{new Date(exec.timestamp).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
