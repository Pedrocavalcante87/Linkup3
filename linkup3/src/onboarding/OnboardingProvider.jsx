// ============================================================================
// ONBOARDING PROVIDER - FASE D3
// Gerencia estado do checklist de onboarding com persistência em localStorage
// ============================================================================

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ONBOARDING_ITEMS } from './onboardingConfig'
import { useSync } from '../contexts/SyncContext'
// Persiste estado do onboarding diretamente no localStorage
const ONBOARDING_KEY = 'linkup_onboarding_v1'
const saveOnboardingLocal = (state) =>
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify({ checklist: state.checklist || [], progress: state.progress || 0 }))
const setOnboardingState = saveOnboardingLocal

const OnboardingContext = createContext(null)

export function OnboardingProvider({ children }) {
  const { snapshot } = useSync()
  const [checklist, setChecklist] = useState([])
  const [progress, setProgress] = useState(0)
  const [initialized, setInitialized] = useState(false)

  // Inicializar estado do onboarding
  useEffect(() => {
    if (initialized) return
    const empresas = snapshot?.empresas || []
    const integracoes = snapshot?.integracoes || []
    const faturas = snapshot?.finance?.faturas || []
    const registros = snapshot?.operations?.registros || []
    const existing = snapshot?.onboarding

    if (existing && (existing.checklist?.length || existing.progress)) {
      setChecklist(existing.checklist || [])
      setProgress(existing.progress || 0)
      setInitialized(true)
      return
    }

    const initial = ONBOARDING_ITEMS.map(item => {
      let completed = false
      if (item.id === 'vincular_empresa') {
        completed = empresas.length > 0
      }
      if (item.id === 'configurar_integracoes') {
        completed = integracoes.some(i => i.status === 'ok' || i.status === 'online')
      }
      if (item.id === 'adicionar_usuarios') {
        completed = (snapshot?.users?.length || 0) > 1
      }
      if (item.id === 'criar_primeira_fatura') {
        completed = faturas.length > 0
      }
      if (item.id === 'registrar_primeira_inconsistencia') {
        completed = registros.some(r => r.inconsistencia)
      }
      return { ...item, completed }
    })

    const done = initial.filter(i => i.completed).length
    const prog = Math.round((done / initial.length) * 100)

    setChecklist(initial)
    setProgress(prog)
    setOnboardingState({ checklist: initial, progress: prog })
    setInitialized(true)
  }, [snapshot, initialized])

  // Persistir mudanças
  useEffect(() => {
    if (!initialized) return
    setOnboardingState({ checklist, progress })
  }, [checklist, progress, initialized])

  // Recalcular progresso
  function recalcProgress(list) {
    const done = list.filter(i => i.completed).length
    return Math.round((done / (list.length || 1)) * 100)
  }

  // Marcar item como completo
  function markItemCompleted(id) {
    setChecklist(prev => {
      const next = prev.map(i => (i.id === id ? { ...i, completed: true } : i))
      setProgress(recalcProgress(next))
      setOnboardingState({ checklist: next, progress: recalcProgress(next) })
      return next
    })
  }

  // Desmarcar item
  function markItemUnchecked(id) {
    setChecklist(prev => {
      const next = prev.map(i => (i.id === id ? { ...i, completed: false } : i))
      setProgress(recalcProgress(next))
      setOnboardingState({ checklist: next, progress: recalcProgress(next) })
      return next
    })
  }

  // Resetar onboarding
  function resetOnboarding() {
    const reset = ONBOARDING_ITEMS.map(i => ({ ...i, completed: false }))
    setChecklist(reset)
    setProgress(0)
    setOnboardingState({ checklist: reset, progress: 0 })
  }

  const value = useMemo(() => ({
    checklist,
    progress,
    markItemCompleted,
    markItemUnchecked,
    resetOnboarding
  }), [checklist, progress])

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return ctx
}
