/**
 * FASE D6.1 - Sistema de Telemetria e Observabilidade
 * Rastreia uso do sistema, eventos, erros e navegação
 */

class TelemetrySystem {
  constructor() {
    this.events = []
    this.pageViews = {}
    this.sessionStart = Date.now()
    this.currentPage = null
    this.pageStartTime = null
    this.heatmap = {}
    this.errors = []
    
    this.loadFromStorage()
  }

  // Carregar dados persistidos
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('linkup_telemetry_v1')
      if (stored) {
        const data = JSON.parse(stored)
        this.pageViews = data.pageViews || {}
        this.heatmap = data.heatmap || {}
        this.errors = data.errors || []
      }
    } catch (e) {
      console.warn('Erro ao carregar telemetria:', e)
    }
  }

  // Salvar dados
  saveToStorage() {
    try {
      const data = {
        pageViews: this.pageViews,
        heatmap: this.heatmap,
        errors: this.errors.slice(-100), // Últimos 100 erros
        lastUpdate: Date.now()
      }
      localStorage.setItem('linkup_telemetry_v1', JSON.stringify(data))
    } catch (e) {
      console.warn('Erro ao salvar telemetria:', e)
    }
  }

  // Registrar visita de página
  trackPageView(pageName) {
    // Finalizar página anterior
    if (this.currentPage && this.pageStartTime) {
      const duration = Date.now() - this.pageStartTime
      this.trackEvent('page_duration', {
        page: this.currentPage,
        duration,
        timestamp: Date.now()
      })
    }

    // Iniciar nova página
    this.currentPage = pageName
    this.pageStartTime = Date.now()

    // Incrementar contador
    if (!this.pageViews[pageName]) {
      this.pageViews[pageName] = {
        count: 0,
        totalTime: 0,
        lastVisit: null
      }
    }
    
    this.pageViews[pageName].count++
    this.pageViews[pageName].lastVisit = Date.now()

    this.trackEvent('page_view', { page: pageName, timestamp: Date.now() })
    this.saveToStorage()
  }

  // Adicionar tempo à página atual
  updatePageTime() {
    if (this.currentPage && this.pageStartTime) {
      const duration = Date.now() - this.pageStartTime
      if (this.pageViews[this.currentPage]) {
        this.pageViews[this.currentPage].totalTime += duration
      }
      this.pageStartTime = Date.now() // Reset timer
      this.saveToStorage()
    }
  }

  // Registrar clique no heatmap
  trackClick(itemId, itemLabel) {
    if (!this.heatmap[itemId]) {
      this.heatmap[itemId] = {
        label: itemLabel,
        clicks: 0,
        lastClick: null
      }
    }
    
    this.heatmap[itemId].clicks++
    this.heatmap[itemId].lastClick = Date.now()
    
    this.trackEvent('click', { itemId, itemLabel, timestamp: Date.now() })
    this.saveToStorage()
  }

  // Registrar evento genérico
  trackEvent(eventType, data) {
    this.events.push({
      type: eventType,
      data,
      timestamp: Date.now()
    })

    // Manter apenas últimos 500 eventos em memória
    if (this.events.length > 500) {
      this.events = this.events.slice(-500)
    }
  }

  // Registrar erro
  trackError(error, context = {}) {
    const errorData = {
      message: error.message || String(error),
      stack: error.stack,
      context,
      timestamp: Date.now(),
      page: this.currentPage
    }

    this.errors.push(errorData)
    this.trackEvent('error', errorData)
    this.saveToStorage()
  }

  // Registrar ação CRUD
  trackAction(action, resource, data = {}) {
    this.trackEvent('crud_action', {
      action, // create, read, update, delete
      resource,
      data,
      timestamp: Date.now(),
      page: this.currentPage
    })
  }

  // Obter estatísticas
  getStats() {
    const sessionDuration = Date.now() - this.sessionStart
    
    // Páginas mais visitadas
    const topPages = Object.entries(this.pageViews)
      .map(([page, data]) => ({ page, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Heatmap ordenado
    const topClicks = Object.entries(this.heatmap)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)

    // Eventos por tipo
    const eventsByType = this.events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1
      return acc
    }, {})

    return {
      sessionDuration,
      totalPageViews: Object.values(this.pageViews).reduce((sum, p) => sum + p.count, 0),
      uniquePages: Object.keys(this.pageViews).length,
      topPages,
      topClicks,
      totalClicks: Object.values(this.heatmap).reduce((sum, h) => sum + h.clicks, 0),
      totalEvents: this.events.length,
      eventsByType,
      totalErrors: this.errors.length,
      recentErrors: this.errors.slice(-10)
    }
  }

  // Resetar dados (útil para testes)
  reset() {
    this.events = []
    this.pageViews = {}
    this.heatmap = {}
    this.errors = []
    this.sessionStart = Date.now()
    this.saveToStorage()
  }

  // ========================================================================
  // EVENTOS DE RECOVERY - FASE RECOVERY
  // ========================================================================

  // Registrar erro de integração
  trackIntegrationError(integracaoId, integracaoNome, detalhes = {}) {
    const event = {
      type: 'INTEGRATION_ERROR',
      integracaoId,
      integracaoNome,
      detalhes,
      timestamp: Date.now(),
      page: this.currentPage
    }
    
    this.events.push(event)
    this.saveToStorage()
    
    return event
  }

  // Registrar recuperação de integração
  trackIntegrationRestored(integracaoId, integracaoNome, tempoDowntime = 0, detalhes = {}) {
    const event = {
      type: 'INTEGRATION_RESTORED',
      integracaoId,
      integracaoNome,
      tempoDowntime,
      detalhes,
      timestamp: Date.now(),
      page: this.currentPage
    }
    
    this.events.push(event)
    this.saveToStorage()
    
    return event
  }

  // Registrar normalização de integração (warn → ok)
  trackIntegrationNormalized(integracaoId, integracaoNome, statusAnterior, detalhes = {}) {
    const event = {
      type: 'INTEGRATION_NORMALIZED',
      integracaoId,
      integracaoNome,
      statusAnterior,
      detalhes,
      timestamp: Date.now(),
      page: this.currentPage
    }
    
    this.events.push(event)
    this.saveToStorage()
    
    return event
  }

  // Registrar mudança de status de integração
  trackIntegrationStatusChange(integracaoId, integracaoNome, statusAntigo, statusNovo, detalhes = {}) {
    const event = {
      type: 'INTEGRATION_STATUS_CHANGE',
      integracaoId,
      integracaoNome,
      statusAntigo,
      statusNovo,
      detalhes,
      timestamp: Date.now(),
      page: this.currentPage
    }
    
    this.events.push(event)
    this.saveToStorage()
    
    return event
  }

  // Registrar reprocessamento de sistema
  trackSystemReprocessing(modulo, motivo, detalhes = {}) {
    const event = {
      type: 'SYSTEM_REPROCESSING',
      modulo,
      motivo,
      detalhes,
      timestamp: Date.now(),
      page: this.currentPage
    }
    
    this.events.push(event)
    this.saveToStorage()
    
    return event
  }

  // Obter eventos de recovery por integração
  getRecoveryEvents(integracaoId = null) {
    const recoveryTypes = [
      'INTEGRATION_ERROR',
      'INTEGRATION_RESTORED',
      'INTEGRATION_NORMALIZED',
      'INTEGRATION_STATUS_CHANGE'
    ]
    
    let filtered = this.events.filter(e => recoveryTypes.includes(e.type))
    
    if (integracaoId) {
      filtered = filtered.filter(e => e.integracaoId === integracaoId)
    }
    
    return filtered.sort((a, b) => b.timestamp - a.timestamp)
  }

  // Calcular métricas de recovery
  getRecoveryMetrics() {
    const events = this.getRecoveryEvents()
    
    const erros = events.filter(e => e.type === 'INTEGRATION_ERROR')
    const recuperacoes = events.filter(e => e.type === 'INTEGRATION_RESTORED')
    const normalizacoes = events.filter(e => e.type === 'INTEGRATION_NORMALIZED')
    
    const temposDowntime = recuperacoes.map(r => r.tempoDowntime || 0)
    const mediaDowntime = temposDowntime.length > 0
      ? temposDowntime.reduce((a, b) => a + b, 0) / temposDowntime.length
      : 0
    
    return {
      totalErros: erros.length,
      totalRecuperacoes: recuperacoes.length,
      totalNormalizacoes: normalizacoes.length,
      taxaRecuperacao: erros.length > 0 ? (recuperacoes.length / erros.length) * 100 : 0,
      mediaTempoDowntime: Math.round(mediaDowntime),
      ultimoEvento: events[0] || null
    }
  }
}

// Singleton global
export const telemetry = new TelemetrySystem()

// Hook global de erros
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    telemetry.trackError(event.error || new Error(event.message), {
      source: 'window.error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    telemetry.trackError(event.reason || new Error('Unhandled Promise Rejection'), {
      source: 'unhandledrejection'
    })
  })

  // Salvar telemetria antes de sair
  window.addEventListener('beforeunload', () => {
    telemetry.updatePageTime()
    telemetry.saveToStorage()
  })

  // Atualizar tempo de página a cada 30 segundos
  setInterval(() => {
    telemetry.updatePageTime()
  }, 30000)
}

export default telemetry
