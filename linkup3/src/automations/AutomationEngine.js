/**
 * FASE D6.3 - Motor de Automações (Mini-Zapier Interno)
 * Sistema de triggers e ações automáticas
 */

class AutomationEngine {
  constructor() {
    this.automations = []
    this.executionHistory = []
    this.loadFromStorage()
  }

  // Carregar automações do localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('linkup_automations_v1')
      if (stored) {
        this.automations = JSON.parse(stored)
      } else {
        // Automações padrão
        this.automations = this.getDefaultAutomations()
        this.saveToStorage()
      }
    } catch (e) {
      console.warn('Erro ao carregar automações:', e)
      this.automations = this.getDefaultAutomations()
    }
  }

  // Salvar automações
  saveToStorage() {
    try {
      localStorage.setItem('linkup_automations_v1', JSON.stringify(this.automations))
    } catch (e) {
      console.warn('Erro ao salvar automações:', e)
    }
  }

  // Automações padrão
  getDefaultAutomations() {
    return [
      {
        id: 'auto-1',
        name: 'Criar ticket para fatura atrasada',
        enabled: true,
        trigger: {
          type: 'fatura_atrasada',
          condition: 'dias_atraso > 7'
        },
        action: {
          type: 'criar_ticket',
          config: {
            titulo: 'Cobrança urgente',
            prioridade: 'Alta',
            categoria: 'Financeiro'
          }
        },
        createdAt: Date.now(),
        executionCount: 0
      },
      {
        id: 'auto-2',
        name: 'Notificar falha em integração',
        enabled: true,
        trigger: {
          type: 'integracao_falha',
          condition: 'falhas_consecutivas >= 3'
        },
        action: {
          type: 'disparar_notificacao',
          config: {
            tipo: 'error',
            titulo: 'Integração com falhas'
          }
        },
        createdAt: Date.now(),
        executionCount: 0
      },
      {
        id: 'auto-3',
        name: 'Registrar incidente crítico',
        enabled: true,
        trigger: {
          type: 'log_error',
          condition: 'nivel === "ERROR" && count >= 5'
        },
        action: {
          type: 'criar_registro_operacional',
          config: {
            tipo: 'Incidente',
            severidade: 'Crítica'
          }
        },
        createdAt: Date.now(),
        executionCount: 0
      }
    ]
  }

  // Adicionar nova automação
  addAutomation(automation) {
    const newAutomation = {
      id: `auto-${Date.now()}`,
      ...automation,
      createdAt: Date.now(),
      executionCount: 0,
      enabled: automation.enabled !== undefined ? automation.enabled : true
    }

    this.automations.push(newAutomation)
    this.saveToStorage()
    return newAutomation
  }

  // Atualizar automação
  updateAutomation(id, updates) {
    const index = this.automations.findIndex(a => a.id === id)
    if (index !== -1) {
      this.automations[index] = {
        ...this.automations[index],
        ...updates,
        updatedAt: Date.now()
      }
      this.saveToStorage()
      return this.automations[index]
    }
    return null
  }

  // Remover automação
  removeAutomation(id) {
    this.automations = this.automations.filter(a => a.id !== id)
    this.saveToStorage()
  }

  // Habilitar/desabilitar automação
  toggleAutomation(id) {
    const automation = this.automations.find(a => a.id === id)
    if (automation) {
      automation.enabled = !automation.enabled
      this.saveToStorage()
    }
  }

  // Executar automações baseadas em evento
  runAutomationsOnEvent(eventType, eventData) {
    const matchingAutomations = this.automations.filter(
      a => a.enabled && a.trigger.type === eventType
    )

    const results = []

    matchingAutomations.forEach(automation => {
      try {
        // Avaliar condição
        const conditionMet = this.evaluateCondition(
          automation.trigger.condition,
          eventData
        )

        if (conditionMet) {
          // Executar ação
          const result = this.executeAction(automation.action, eventData)

          // Registrar execução
          automation.executionCount++
          automation.lastExecution = Date.now()

          this.executionHistory.push({
            automationId: automation.id,
            automationName: automation.name,
            eventType,
            eventData,
            result,
            timestamp: Date.now()
          })

          results.push({
            automation: automation.name,
            success: true,
            result
          })
        }
      } catch (error) {
        console.error(`Erro ao executar automação ${automation.name}:`, error)
        results.push({
          automation: automation.name,
          success: false,
          error: error.message
        })
      }
    })

    this.saveToStorage()

    // Manter apenas últimas 100 execuções
    if (this.executionHistory.length > 100) {
      this.executionHistory = this.executionHistory.slice(-100)
    }

    return results
  }

  // Avaliar condição sem usar eval (suporta comparações simples com && e ||)
  evaluateCondition(condition, data) {
    if (!condition || typeof condition !== 'string') return true

    const context = {
      dias_atraso: data.diasAtraso ?? data.dias_atraso ?? 0,
      falhas_consecutivas: data.falhasConsecutivas ?? data.falhas_consecutivas ?? 0,
      nivel: data.nivel ?? '',
      count: data.count ?? 0
    }

    const operators = ['>=', '<=', '===', '!==', '>', '<', '==', '!=']

    const parseValue = (raw) => {
      const value = raw.trim()
      if (value in context) return context[value]
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        return value.slice(1, -1)
      }
      const numeric = Number(value)
      return Number.isNaN(numeric) ? value : numeric
    }

    const compare = (left, operator, right) => {
      switch (operator) {
        case '>': return left > right
        case '<': return left < right
        case '>=': return left >= right
        case '<=': return left <= right
        case '===': return left === right
        case '!==': return left !== right
        case '==': return left == right // eslint-disable-line eqeqeq
        case '!=': return left != right // eslint-disable-line eqeqeq
        default: return false
      }
    }

    const evaluateSimple = (expr) => {
      const operator = operators.find(op => expr.includes(op))
      if (!operator) return true
      const [leftRaw, rightRaw] = expr.split(operator)
      return compare(parseValue(leftRaw), operator, parseValue(rightRaw))
    }

    const evaluateAnd = (expr) => expr.split('&&').every(part => evaluateSimple(part.trim()))

    try {
      return condition
        .split('||')
        .some(part => evaluateAnd(part.trim()))
    } catch (e) {
      console.warn('Erro ao avaliar condição:', e)
      return false
    }
  }

  // Executar ação
  executeAction(action, data) {
    const { type, config } = action

    switch (type) {
      case 'criar_ticket':
        // Simulação - em produção chamaria API
        return {
          type: 'ticket_created',
          ticketId: `TICKET-${Date.now()}`,
          ...config
        }

      case 'disparar_notificacao':
        // Simulação - dispararia notificação real
        return {
          type: 'notification_sent',
          ...config
        }

      case 'criar_registro_operacional':
        // Simulação - criaria registro no operacional
        return {
          type: 'operational_record_created',
          ...config
        }

      case 'enviar_email':
        // Simulação - enviaria email
        return {
          type: 'email_sent',
          ...config
        }

      default:
        return { type: 'unknown_action' }
    }
  }

  // Obter todas as automações
  getAutomations() {
    return this.automations
  }

  // Obter histórico de execuções
  getExecutionHistory(limit = 50) {
    return this.executionHistory.slice(-limit).reverse()
  }

  // Estatísticas
  getStats() {
    return {
      total: this.automations.length,
      enabled: this.automations.filter(a => a.enabled).length,
      disabled: this.automations.filter(a => !a.enabled).length,
      totalExecutions: this.automations.reduce((sum, a) => sum + (a.executionCount || 0), 0),
      recentExecutions: this.executionHistory.length
    }
  }
}

// Singleton
export const automationEngine = new AutomationEngine()

// ============================================================================
// SISTEMA DE RECOVERY AUTOMÁTICO - FASE RECOVERY
// ============================================================================

/**
 * Adicionar automações de recovery padrão
 */
export function adicionarAutomacoesRecovery() {
  const recoveryAutomations = [
    {
      id: 'recovery-1',
      name: 'Notificar recuperação de integração',
      enabled: true,
      trigger: {
        type: 'integracao_restaurada',
        condition: 'status === "ok" && status_anterior === "error"'
      },
      action: {
        type: 'disparar_notificacao',
        config: {
          tipo: 'success',
          titulo: 'Integração Restaurada',
          mensagem: 'A integração voltou ao normal'
        }
      },
      createdAt: Date.now(),
      executionCount: 0,
      category: 'recovery'
    },
    {
      id: 'recovery-2',
      name: 'Fechar ticket ao restaurar integração',
      enabled: true,
      trigger: {
        type: 'integracao_restaurada',
        condition: 'ticket_automatico === true'
      },
      action: {
        type: 'fechar_ticket',
        config: {
          motivo: 'Integração restaurada automaticamente'
        }
      },
      createdAt: Date.now(),
      executionCount: 0,
      category: 'recovery'
    },
    {
      id: 'recovery-3',
      name: 'Log de normalização',
      enabled: true,
      trigger: {
        type: 'integracao_normalizada',
        condition: 'status === "ok" && status_anterior === "warn"'
      },
      action: {
        type: 'criar_log',
        config: {
          nivel: 'info',
          modulo: 'Integrações',
          mensagem: 'Integração normalizada com sucesso'
        }
      },
      createdAt: Date.now(),
      executionCount: 0,
      category: 'recovery'
    }
  ];

  // Adicionar automações se ainda não existem
  recoveryAutomations.forEach(automation => {
    const exists = automationEngine.automations.find(a => a.id === automation.id);
    if (!exists) {
      automationEngine.automations.push(automation);
    }
  });

  automationEngine.saveToStorage();
}

/**
 * Executar automações de recovery quando integração muda de status
 */
export function executarAutomacoesRecovery(evento) {
  const { tipo, integracaoId, statusAnterior, statusNovo, integracao } = evento;

  // Mapear tipo de evento para trigger de automação
  const triggerMap = {
    'INTEGRATION_RESTORED': 'integracao_restaurada',
    'INTEGRATION_NORMALIZED': 'integracao_normalizada',
    'INTEGRATION_ERROR': 'integracao_falha'
  };

  const triggerType = triggerMap[tipo];
  if (!triggerType) return;

  // Executar automações relevantes
  automationEngine.runTrigger(triggerType, {
    integracaoId,
    status_anterior: statusAnterior,
    status: statusNovo,
    integracao,
    ticket_automatico: true
  });
}

/**
 * Reprocessar automações quando sistema muda
 */
export function reprocessarAutomacoes() {
  try {
    // Carregar dados atualizados
    const integracoes = JSON.parse(localStorage.getItem('linkup_integracoes_v1') || '[]');
    const faturas = JSON.parse(localStorage.getItem('linkup_faturas_v1') || '[]');
    const logs = JSON.parse(localStorage.getItem('linkup_logs_v1') || '[]');

    // Verificar condições de trigger para cada automação ativa
    integracoes.forEach(integracao => {
      if (integracao.status === 'error') {
        automationEngine.runTrigger('integracao_falha', integracao);
      }
    });

    faturas.forEach(fatura => {
      if (fatura.status === 'Atrasada') {
        const diasAtraso = Math.floor(
          (Date.now() - new Date(fatura.vencimento).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diasAtraso > 7) {
          automationEngine.runTrigger('fatura_atrasada', { ...fatura, dias_atraso: diasAtraso });
        }
      }
    });

    // Verificar logs de erro recentes
    const logsRecentes = logs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      return log.nivel === 'ERROR' && (Date.now() - logTime) < 3600000; // 1 hora
    });

    if (logsRecentes.length >= 10) {
      automationEngine.runTrigger('muitos_erros_sistema', { count: logsRecentes.length });
    }

  } catch (e) {
    console.error('Erro ao reprocessar automações:', e);
  }
}

// Registrar listener de reprocessamento
if (typeof window !== 'undefined') {
  window.addEventListener('reprocessar-automations', () => {
    reprocessarAutomacoes();
  });

  // Adicionar automações de recovery ao carregar
  setTimeout(() => {
    adicionarAutomacoesRecovery();
  }, 1000);
}

export default automationEngine
