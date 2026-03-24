import { useState, useEffect, useCallback } from 'react'
import { telemetry } from '../telemetry/TelemetryEvents'

/**
 * Hook para heatmap de navegação
 */
export function useHeatmap() {
  const [heatmapData, setHeatmapData] = useState([])

  const refreshHeatmap = useCallback(() => {
    const stats = telemetry.getStats()
    setHeatmapData(stats.topClicks || [])
  }, [])

  useEffect(() => {
    refreshHeatmap()
  }, [refreshHeatmap])

  const trackItemClick = useCallback((itemId, itemLabel) => {
    telemetry.trackClick(itemId, itemLabel)
    refreshHeatmap()
  }, [refreshHeatmap])

  return {
    heatmapData,
    trackItemClick,
    refreshHeatmap
  }
}

export default useHeatmap
