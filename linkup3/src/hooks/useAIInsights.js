import { useState, useEffect, useMemo } from 'react'
import AIEngine from '../ai/AIEngine'
import { useSync } from '../contexts/SyncContext'

/**
 * Hook para insights de IA em tempo real
 */
export function useAIInsights() {
  const { snapshot } = useSync()
  const [insights, setInsights] = useState({
    financial: null,
    logs: null,
    integrations: null,
    summary: null
  })

  const [alerts, setAlerts] = useState([])
  const [recommendations, setRecommendations] = useState([])

  // Análise financeira
  const financialAnalysis = useMemo(() => {
    const faturas = snapshot?.finance?.faturas || []
    return AIEngine.analyzeFinancial(faturas)
  }, [snapshot])

  // Análise de logs
  const logAnalysis = useMemo(() => {
    const logs = snapshot?.logs || []
    return AIEngine.detectIncidents(logs)
  }, [snapshot])

  // Análise de integrações
  const integrationAnalysis = useMemo(() => {
    const integracoes = snapshot?.integracoes || snapshot?.integrations || []
    return AIEngine.detectIntegrationPatterns(integracoes)
  }, [snapshot])

  // Resumo semanal
  const weeklySummary = useMemo(() => {
    return AIEngine.generateWeeklySummary({
      faturas: snapshot?.finance?.faturas || [],
      logs: snapshot?.logs || [],
      integrations: snapshot?.integracoes || snapshot?.integrations || [],
      tickets: snapshot?.tickets || []
    })
  }, [snapshot])

  // Consolidar insights
  useEffect(() => {
    setInsights({
      financial: financialAnalysis,
      logs: logAnalysis,
      integrations: integrationAnalysis,
      summary: weeklySummary
    })

    // Consolidar alertas
    const allAlerts = [
      ...financialAnalysis.alerts,
      ...logAnalysis.incidents.map(i => ({ ...i, source: 'logs' })),
      ...integrationAnalysis.issues.map(i => ({ ...i, source: 'integrations' }))
    ]
    setAlerts(allAlerts.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    }))

    // Consolidar recomendações
    const allRecommendations = [
      ...financialAnalysis.recommendations,
      ...integrationAnalysis.recommendations,
      ...weeklySummary.topRecommendations
    ]
    setRecommendations([...new Set(allRecommendations)].slice(0, 10))
  }, [financialAnalysis, logAnalysis, integrationAnalysis, weeklySummary])

  // Sugerir prioridade de ticket
  const suggestPriority = (ticket) => {
    return AIEngine.suggestTicketPriority(ticket)
  }

  return {
    insights,
    alerts,
    recommendations,
    suggestPriority,
    financialScore: financialAnalysis.score,
    integrationHealth: integrationAnalysis.healthScore
  }
}

export default useAIInsights
