
import { useState, useEffect, useCallback } from 'react'
import { automationEngine } from '../automations/AutomationEngine'

/**
 * Hook para gerenciar automações
 */
export function useAutomations() {
  const [automations, setAutomations] = useState([])
  const [stats, setStats] = useState(null)
  const [executionHistory, setExecutionHistory] = useState([])

  // Carregar automações
  const refreshAutomations = useCallback(() => {
    setAutomations(automationEngine.getAutomations())
    setStats(automationEngine.getStats())
    setExecutionHistory(automationEngine.getExecutionHistory(20))
  }, [])

  useEffect(() => {
    refreshAutomations()
  }, [refreshAutomations])

  // Adicionar automação
  const addAutomation = useCallback((automation) => {
    automationEngine.addAutomation(automation)
    refreshAutomations()
  }, [refreshAutomations])

  // Atualizar automação
  const updateAutomation = useCallback((id, updates) => {
    automationEngine.updateAutomation(id, updates)
    refreshAutomations()
  }, [refreshAutomations])

  // Remover automação
  const removeAutomation = useCallback((id) => {
    automationEngine.removeAutomation(id)
    refreshAutomations()
  }, [refreshAutomations])

  // Toggle enabled/disabled
  const toggleAutomation = useCallback((id) => {
    automationEngine.toggleAutomation(id)
    refreshAutomations()
  }, [refreshAutomations])

  // Executar automações em evento
  const runAutomationsOnEvent = useCallback((eventType, eventData) => {
    const results = automationEngine.runAutomationsOnEvent(eventType, eventData)
    refreshAutomations()
    return results
  }, [refreshAutomations])

  return {
    automations,
    stats,
    executionHistory,
    addAutomation,
    updateAutomation,
    removeAutomation,
    toggleAutomation,
    runAutomationsOnEvent,
    refreshAutomations
  }
}

export default useAutomations
