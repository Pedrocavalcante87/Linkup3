import { useState, useEffect, useCallback } from 'react'
import { telemetry } from '../telemetry/TelemetryEvents'

/**
 * Hook para acessar sistema de telemetria
 */
export function useTelemetry() {
  const [stats, setStats] = useState(null)

  // Atualizar estatísticas
  const refreshStats = useCallback(() => {
    setStats(telemetry.getStats())
  }, [])

  useEffect(() => {
    refreshStats()
    
    // Atualizar a cada 5 segundos
    const interval = setInterval(refreshStats, 5000)
    return () => clearInterval(interval)
  }, [refreshStats])

  // Rastrear página
  const trackPage = useCallback((pageName) => {
    telemetry.trackPageView(pageName)
    refreshStats()
  }, [refreshStats])

  // Rastrear clique
  const trackClick = useCallback((itemId, itemLabel) => {
    telemetry.trackClick(itemId, itemLabel)
    refreshStats()
  }, [refreshStats])

  // Rastrear evento
  const trackEvent = useCallback((eventType, data) => {
    telemetry.trackEvent(eventType, data)
    refreshStats()
  }, [refreshStats])

  // Rastrear erro
  const trackError = useCallback((error, context) => {
    telemetry.trackError(error, context)
    refreshStats()
  }, [refreshStats])

  // Rastrear ação CRUD
  const trackAction = useCallback((action, resource, data) => {
    telemetry.trackAction(action, resource, data)
    refreshStats()
  }, [refreshStats])

  return {
    stats,
    trackPage,
    trackClick,
    trackEvent,
    trackError,
    trackAction,
    refreshStats
  }
}

export default useTelemetry
