/**
 * FASE D6.2 - Motor de IA Contextual baseado em regras
 * Análise local sem APIs externas
 */

// ========== ANÁLISE FINANCEIRA ==========
export function analyzeFinancial(faturas = []) {
  const insights = []
  const recommendations = []
  const alerts = []

  if (!faturas || faturas.length === 0) {
    return { insights, recommendations, alerts, score: 100 }
  }

  const totalPrevisto = faturas.reduce((sum, f) => sum + (f.valor || 0), 0)
  const recebido = faturas.filter(f => f.status === 'Paga')
  const totalRecebido = recebido.reduce((sum, f) => sum + (f.valor || 0), 0)
  const inadimplentes = faturas.filter(f => f.status === 'Atrasada')
  const taxaInadimplencia = (inadimplentes.length / faturas.length) * 100

  // Insights
  insights.push({
    type: 'financial_overview',
    message: `${faturas.length} faturas no período: ${recebido.length} pagas, ${inadimplentes.length} atrasadas`,
    severity: 'info'
  })

  if (taxaInadimplencia > 30) {
    alerts.push({
      type: 'high_default',
      message: `Taxa de inadimplência crítica: ${taxaInadimplencia.toFixed(1)}%`,
      severity: 'critical',
      action: 'Revisar política de crédito e cobrança imediatamente'
    })
    recommendations.push('Implementar cobrança automática para clientes recorrentes')
    recommendations.push('Revisar limite de crédito de clientes inadimplentes')
  } else if (taxaInadimplencia > 15) {
    alerts.push({
      type: 'medium_default',
      message: `Taxa de inadimplência elevada: ${taxaInadimplencia.toFixed(1)}%`,
      severity: 'warning',
      action: 'Intensificar ações de cobrança'
    })
    recommendations.push('Enviar lembretes automáticos 3 dias antes do vencimento')
  }

  // Análise de tendências (últimos 30 dias vs 30 dias anteriores)
  const now = Date.now()
  const last30Days = faturas.filter(f => {
    const fDate = new Date(f.dataVencimento).getTime()
    return (now - fDate) <= 30 * 24 * 60 * 60 * 1000
  })

  const previous30Days = faturas.filter(f => {
    const fDate = new Date(f.dataVencimento).getTime()
    const diff = now - fDate
    return diff > 30 * 24 * 60 * 60 * 1000 && diff <= 60 * 24 * 60 * 60 * 1000
  })

  if (last30Days.length > 0 && previous30Days.length > 0) {
    const inadimplenciaAtual = (last30Days.filter(f => f.status === 'Atrasada').length / last30Days.length) * 100
    const inadimplenciaAnterior = (previous30Days.filter(f => f.status === 'Atrasada').length / previous30Days.length) * 100

    if (inadimplenciaAtual > inadimplenciaAnterior * 1.5) {
      insights.push({
        type: 'trend_worsening',
        message: 'Inadimplência cresceu 50% no último mês',
        severity: 'warning'
      })
    } else if (inadimplenciaAtual < inadimplenciaAnterior * 0.7) {
      insights.push({
        type: 'trend_improving',
        message: 'Inadimplência reduziu 30% no último mês - parabéns!',
        severity: 'success'
      })
    }
  }

  // Score de saúde financeira (0-100)
  let score = 100
  score -= taxaInadimplencia * 2 // Penalidade por inadimplência
  score -= (faturas.filter(f => f.status === 'Pendente').length / faturas.length) * 10
  score = Math.max(0, Math.min(100, score))

  return { insights, recommendations, alerts, score: Math.round(score) }
}

// ========== DETECÇÃO DE INCIDENTES EM LOGS ==========
export function detectIncidents(logs = []) {
  const incidents = []
  const patterns = []

  if (!logs || logs.length === 0) {
    return { incidents, patterns }
  }

  // Agrupar por módulo e nível
  const errorsByModule = {}
  const errorsByMessage = {}

  logs.forEach(log => {
    if (log.nivel === 'ERROR') {
      // Por módulo
      if (!errorsByModule[log.modulo]) {
        errorsByModule[log.modulo] = []
      }
      errorsByModule[log.modulo].push(log)

      // Por mensagem (detecção de padrões)
      const msgKey = log.mensagem.substring(0, 50) // Primeiros 50 chars
      if (!errorsByMessage[msgKey]) {
        errorsByMessage[msgKey] = []
      }
      errorsByMessage[msgKey].push(log)
    }
  })

  // Detectar módulos com muitos erros
  Object.entries(errorsByModule).forEach(([modulo, erros]) => {
    if (erros.length >= 5) {
      incidents.push({
        type: 'module_errors',
        severity: 'critical',
        module: modulo,
        count: erros.length,
        message: `${modulo}: ${erros.length} erros detectados`,
        recommendation: `Investigar falhas recorrentes no módulo ${modulo}`
      })
    } else if (erros.length >= 3) {
      incidents.push({
        type: 'module_warnings',
        severity: 'warning',
        module: modulo,
        count: erros.length,
        message: `${modulo}: ${erros.length} erros detectados`,
        recommendation: 'Monitorar de perto este módulo'
      })
    }
  })

  // Detectar erros recorrentes (mesmo padrão)
  Object.entries(errorsByMessage).forEach(([msgPattern, erros]) => {
    if (erros.length >= 3) {
      patterns.push({
        type: 'recurring_error',
        pattern: msgPattern,
        count: erros.length,
        severity: erros.length >= 5 ? 'critical' : 'warning',
        firstOccurrence: erros[0].timestamp,
        lastOccurrence: erros[erros.length - 1].timestamp,
        affectedModules: [...new Set(erros.map(e => e.modulo))]
      })
    }
  })

  // Detectar picos de erros (mais de 10 erros em 5 minutos)
  const now = Date.now()
  const last5Min = logs.filter(log => {
    const logTime = new Date(log.timestamp).getTime()
    return (now - logTime) <= 5 * 60 * 1000 && log.nivel === 'ERROR'
  })

  if (last5Min.length >= 10) {
    incidents.push({
      type: 'error_spike',
      severity: 'critical',
      count: last5Min.length,
      message: `Pico de ${last5Min.length} erros nos últimos 5 minutos`,
      recommendation: 'Verificar se há um incidente em curso'
    })
  }

  return { incidents, patterns }
}

// ========== ANÁLISE DE INTEGRAÇÕES ==========
export function detectIntegrationPatterns(integrations = []) {
  const issues = []
  const recommendations = []

  if (!integrations || integrations.length === 0) {
    return { issues, recommendations }
  }

  integrations.forEach(integracao => {
    const { nome, status, ultimaSincronizacao, registros } = integracao

    // Integração offline
    if (status === 'offline' || status === 'Erro') {
      issues.push({
        type: 'integration_down',
        severity: 'critical',
        integration: nome,
        message: `${nome} está offline`,
        recommendation: `Reconectar ${nome} imediatamente`
      })
    }

    // Integração lenta (última sinc há mais de 2 horas)
    if (ultimaSincronizacao) {
      const lastSync = new Date(ultimaSincronizacao).getTime()
      const hoursSinceSync = (Date.now() - lastSync) / (1000 * 60 * 60)

      if (hoursSinceSync > 2 && status === 'Ativo') {
        issues.push({
          type: 'integration_stale',
          severity: 'warning',
          integration: nome,
          message: `${nome}: última sincronização há ${hoursSinceSync.toFixed(1)}h`,
          recommendation: 'Verificar se há problemas de conectividade'
        })
      }
    }

    // Baixo volume (menos de 10 registros)
    if (registros !== undefined && registros < 10 && status === 'Ativo') {
      recommendations.push(`${nome}: volume baixo de dados (${registros} registros) - verificar configuração`)
    }
  })

  // Integração global
  const totalIntegrations = integrations.length
  const activeIntegrations = integrations.filter(i => i.status === 'Ativo' || i.status === 'online').length
  const healthScore = (activeIntegrations / totalIntegrations) * 100

  if (healthScore < 50) {
    issues.push({
      type: 'integration_health_critical',
      severity: 'critical',
      message: `Apenas ${activeIntegrations}/${totalIntegrations} integrações ativas`,
      recommendation: 'Revisar todas as integrações imediatamente'
    })
  }

  return { issues, recommendations, healthScore: Math.round(healthScore) }
}

// ========== SUGESTÃO DE PRIORIDADE DE TICKETS ==========
export function suggestTicketPriority(ticket) {
  let score = 0
  let suggestedPriority = 'Baixa'
  const reasons = []

  // Palavras-chave críticas
  const criticalKeywords = ['crítico', 'urgente', 'parado', 'bloqueado', 'produção', 'crash', 'indisponível']
  const highKeywords = ['importante', 'erro', 'falha', 'problema', 'bug']

  const description = (ticket.descricao || '').toLowerCase()
  const title = (ticket.titulo || '').toLowerCase()

  criticalKeywords.forEach(word => {
    if (description.includes(word) || title.includes(word)) {
      score += 10
      reasons.push(`Palavra-chave crítica detectada: "${word}"`)
    }
  })

  highKeywords.forEach(word => {
    if (description.includes(word) || title.includes(word)) {
      score += 5
      reasons.push(`Palavra-chave importante: "${word}"`)
    }
  })

  // Cliente específico (simulação)
  if (ticket.empresa && ['TechCorp', 'MegaSoft'].includes(ticket.empresa)) {
    score += 8
    reasons.push('Cliente VIP detectado')
  }

  // Tempo de espera
  if (ticket.criadoEm) {
    const hoursSinceCreation = (Date.now() - new Date(ticket.criadoEm).getTime()) / (1000 * 60 * 60)
    if (hoursSinceCreation > 24) {
      score += 6
      reasons.push(`Ticket aguardando há ${hoursSinceCreation.toFixed(0)}h`)
    }
  }

  // Calcular prioridade sugerida
  if (score >= 15) {
    suggestedPriority = 'Crítica'
  } else if (score >= 8) {
    suggestedPriority = 'Alta'
  } else if (score >= 4) {
    suggestedPriority = 'Média'
  }

  return {
    suggestedPriority,
    confidenceScore: Math.min(score * 5, 100),
    reasons
  }
}

// ========== RESUMO SEMANAL ==========
export function generateWeeklySummary(data = {}) {
  const { faturas = [], logs = [], integrations = [], tickets = [] } = data

  const financialAnalysis = analyzeFinancial(faturas)
  const logIncidents = detectIncidents(logs)
  const integrationIssues = detectIntegrationPatterns(integrations)

  const summary = {
    period: 'Últimos 7 dias',
    generatedAt: new Date().toISOString(),

    financial: {
      score: financialAnalysis.score,
      status: financialAnalysis.score >= 80 ? 'Excelente' :
              financialAnalysis.score >= 60 ? 'Bom' :
              financialAnalysis.score >= 40 ? 'Atenção' : 'Crítico',
      alerts: financialAnalysis.alerts.length,
      recommendations: financialAnalysis.recommendations.length
    },

    operations: {
      totalLogs: logs.length,
      errors: logs.filter(l => l.nivel === 'ERROR').length,
      incidents: logIncidents.incidents.length,
      patterns: logIncidents.patterns.length
    },

    integrations: {
      total: integrations.length,
      active: integrations.filter(i => i.status === 'Ativo' || i.status === 'online').length,
      healthScore: integrationIssues.healthScore || 0,
      issues: integrationIssues.issues.length
    },

    tickets: {
      total: tickets.length,
      open: tickets.filter(t => t.status !== 'Encerrado').length,
      critical: tickets.filter(t => t.prioridade === 'Crítica').length
    },

    topRecommendations: [
      ...financialAnalysis.recommendations.slice(0, 3),
      ...integrationIssues.recommendations.slice(0, 2)
    ].slice(0, 5)
  }

  return summary
}

export default {
  analyzeFinancial,
  detectIncidents,
  detectIntegrationPatterns,
  suggestTicketPriority,
  generateWeeklySummary
}

// ============================================================================
// SISTEMA DE REPROCESSAMENTO AUTOMÁTICO - FASE RECOVERY
// ============================================================================

/**
 * Reprocessa toda a análise de IA quando uma integração muda de status
 */
export function reprocessarAnaliseCompleta() {
  try {
    // Carregar dados atualizados
    const integracoes = JSON.parse(localStorage.getItem('linkup_integracoes_v1') || '[]');
    const logs = JSON.parse(localStorage.getItem('linkup_logs_v1') || '[]');
    const faturas = JSON.parse(localStorage.getItem('linkup_faturas_v1') || '[]');
    const tickets = JSON.parse(localStorage.getItem('linkup_tickets_v1') || '[]');

    // Reprocessar análises
    const financial = analyzeFinancial(faturas);
    const incidents = detectIncidents(logs);
    const integrationPatterns = detectIntegrationPatterns(integracoes);
    const summary = generateWeeklySummary({ integracoes, logs, faturas, tickets });

    // Salvar resultados no localStorage para cache
    const aiCache = {
      timestamp: Date.now(),
      financial,
      incidents,
      integrationPatterns,
      summary
    };

    localStorage.setItem('linkup_ai_cache_v1', JSON.stringify(aiCache));

    // Disparar evento de análise atualizada
    window.dispatchEvent(new CustomEvent('ai-reprocessed', { detail: aiCache }));

    return aiCache;
  } catch (e) {
    console.error('Erro ao reprocessar IA:', e);
    return null;
  }
}

/**
 * Obter cache de análise de IA
 */
export function obterCacheIA() {
  try {
    const cache = localStorage.getItem('linkup_ai_cache_v1');
    return cache ? JSON.parse(cache) : null;
  } catch (e) {
    console.error('Erro ao obter cache de IA:', e);
    return null;
  }
}

/**
 * Analisar recovery de integração específica
 */
export function analisarRecoveryIntegracao(integracaoId, statusAnterior, statusNovo) {
  const insights = [];
  const recommendations = [];

  // Carregar histórico de mudanças
  const telemetria = JSON.parse(localStorage.getItem('linkup_telemetry_v1') || '{}');
  const eventos = telemetria.events || [];

  // Filtrar eventos desta integração
  const eventosIntegracao = eventos.filter(e =>
    (e.type === 'INTEGRATION_ERROR' ||
     e.type === 'INTEGRATION_RESTORED' ||
     e.type === 'INTEGRATION_NORMALIZED') &&
    e.integracaoId === integracaoId
  );

  const totalErros = eventosIntegracao.filter(e => e.type === 'INTEGRATION_ERROR').length;
  const totalRecuperacoes = eventosIntegracao.filter(e => e.type === 'INTEGRATION_RESTORED').length;

  // Análise de padrão de falhas
  if (totalErros > 5) {
    insights.push({
      type: 'frequent_failures',
      message: `Integração com histórico de ${totalErros} falhas recentes`,
      severity: 'warning'
    });
    recommendations.push('Investigar causa raiz das falhas recorrentes');
    recommendations.push('Considerar ajuste de timeout ou configuração');
  }

  // Taxa de recuperação
  if (totalRecuperacoes > 0) {
    const taxaRecuperacao = (totalRecuperacoes / totalErros) * 100;

    if (taxaRecuperacao >= 90) {
      insights.push({
        type: 'good_recovery',
        message: `Excelente taxa de recuperação: ${taxaRecuperacao.toFixed(0)}%`,
        severity: 'success'
      });
    } else if (taxaRecuperacao < 50) {
      insights.push({
        type: 'poor_recovery',
        message: `Taxa de recuperação baixa: ${taxaRecuperacao.toFixed(0)}%`,
        severity: 'critical'
      });
      recommendations.push('Melhorar mecanismo de retry e fallback');
    }
  }

  // Tempo médio de downtime
  const recuperacoes = eventosIntegracao.filter(e => e.type === 'INTEGRATION_RESTORED');
  if (recuperacoes.length > 0) {
    const tempos = recuperacoes.map(r => r.tempoDowntime || 0);
    const mediaDowntime = tempos.reduce((a, b) => a + b, 0) / tempos.length;

    if (mediaDowntime > 300000) { // > 5 minutos
      insights.push({
        type: 'long_downtime',
        message: `Tempo médio de downtime: ${(mediaDowntime / 60000).toFixed(1)} min`,
        severity: 'warning'
      });
      recommendations.push('Reduzir tempo de detecção e recuperação automática');
    }
  }

  return { insights, recommendations };
}

// Registrar listener de reprocessamento
if (typeof window !== 'undefined') {
  window.addEventListener('reprocessar-ai', () => {
    reprocessarAnaliseCompleta();
  });
}
