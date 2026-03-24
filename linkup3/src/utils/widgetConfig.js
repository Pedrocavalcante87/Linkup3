/**
 * FASE D6.4 - Gerenciamento de Widgets do Dashboard
 */

export const AVAILABLE_WIDGETS = [
  { id: 'stats', name: 'Estatísticas', type: 'card', component: 'CardStat' },
  { id: 'chart-revenue', name: 'Gráfico de Receitas', type: 'chart', component: 'LineChart' },
  { id: 'chart-tickets', name: 'Gráfico de Tickets', type: 'chart', component: 'BarChart' },
  { id: 'heatmap', name: 'Mapa de Uso', type: 'heatmap', component: 'Heatmap' },
  { id: 'ai-insights', name: 'Insights da IA', type: 'ai', component: 'AIInsights' },
  { id: 'timeline', name: 'Linha do Tempo', type: 'timeline', component: 'Timeline' }
]

export function getDefaultWidgets() {
  return [
    { id: 'stats', order: 0, visible: true },
    { id: 'chart-revenue', order: 1, visible: true },
    { id: 'chart-tickets', order: 2, visible: true },
    { id: 'heatmap', order: 3, visible: true }
  ]
}

export function loadWidgetsConfig() {
  try {
    const stored = localStorage.getItem('linkup_dashboard_widgets_v1')
    return stored ? JSON.parse(stored) : getDefaultWidgets()
  } catch (e) {
    return getDefaultWidgets()
  }
}

export function saveWidgetsConfig(widgets) {
  localStorage.setItem('linkup_dashboard_widgets_v1', JSON.stringify(widgets))
}
