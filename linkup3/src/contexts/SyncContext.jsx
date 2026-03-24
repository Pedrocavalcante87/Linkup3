import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import {
  integracoesAPI,
  ticketsAPI,
  logsAPI,
  notificacoesAPI,
  financeiroAPI,
  operacionalAPI,
  automacoesAPI
} from '../services/api'

const SyncContext = createContext({})

// ─────────────────────────────────────────────
// fetchSnapshot — busca todos os dados da API em paralelo
// e os organiza no mesmo formato que as páginas esperam.
// "Promise.all" faz todas as requisições ao mesmo tempo —
// em vez de esperar uma acabar para começar a outra.
// ─────────────────────────────────────────────
async function fetchSnapshot() {
  const [
    integracoes,
    { tickets },
    { logs },
    { notificacoes, totalNaoLidas },
    faturas,
    registros,
    automacoes,
    finStats,
    opStats,
  ] = await Promise.all([
    integracoesAPI.listar(),
    ticketsAPI.listar().then(d => ({ tickets: Array.isArray(d) ? d : [] })),
    logsAPI.listar({ limite: 200 }).then(d => ({ logs: d.logs || [] })),
    notificacoesAPI.listar().then(d => ({
      notificacoes: d.notificacoes || [],
      totalNaoLidas: d.totalNaoLidas || 0
    })),
    financeiroAPI.faturas().then(d => Array.isArray(d) ? d : []),
    operacionalAPI.registros().then(d => Array.isArray(d) ? d : []),
    automacoesAPI.listar().then(d => Array.isArray(d) ? d : []),
    financeiroAPI.stats().catch(() => ({})),
    operacionalAPI.stats().catch(() => ({})),
  ])

  const agora = new Date().toISOString()

  // Normaliza o status das integrações para o formato que os componentes esperam
  const integracoesNorm = integracoes.map(i => ({
    ...i,
    status: i.status || 'ok',
    uptime: i.uptime ?? 100,
    taxaSucesso: i.taxaSucesso ?? 100,
  }))

  // Monta o snapshot no mesmo "shape" que as páginas usam
  return {
    integrations:  integracoesNorm, // Dashboard usa este
    integracoes:   integracoesNorm, // Integrações/Tickets usam este
    logs,
    notifications: notificacoes,    // NotificationsContext usa este
    notificationsUnread: totalNaoLidas,
    tickets,
    finance: {
      faturas,
      ...finStats,
    },
    operations: {
      registros,
      ...opStats,
    },
    automacoes,
    users:    [],
    empresas: [],
    syncRows: [],
    lastSynced: agora,
  }
}

export function SyncProvider({ children, intervalMs = 15000 }) {
  const [isSyncing, setIsSyncing]   = useState(false)
  const [lastSynced, setLastSynced] = useState(null)
  const [snapshot, setSnapshot]     = useState(null)
  const [error, setError]           = useState(null)
  const timerRef = useRef(null)

  const applySnapshot = useCallback((snap) => {
    setSnapshot(snap)
    setLastSynced(snap.lastSynced)
    setError(null)
  }, [])

  // Carrega dados da API e atualiza o snapshot
  const runSync = useCallback(async () => {
    setIsSyncing(true)
    try {
      const snap = await fetchSnapshot()
      applySnapshot(snap)
    } catch (err) {
      // Se não tiver token ainda (antes do login) é normal falhar silenciosamente
      if (!localStorage.getItem('authToken')) return
      console.error('[SyncContext] Erro ao buscar dados da API:', err.message)
      setError(err.message)
    } finally {
      setIsSyncing(false)
    }
  }, [applySnapshot])

  // Carrega na primeira renderização e prepara o intervalo de polling
  useEffect(() => {
    runSync()
    timerRef.current = setInterval(runSync, intervalMs)
    return () => clearInterval(timerRef.current)
  }, [runSync, intervalMs])

  // Recarrega ao receber eventos internos (ex: ticket criado na página de Tickets)
  useEffect(() => {
    const handler = () => runSync()
    window.addEventListener('linkup-data-changed', handler)
    return () => window.removeEventListener('linkup-data-changed', handler)
  }, [runSync])

  return (
    <SyncContext.Provider value={{ snapshot, isSyncing, lastSynced, error, syncNow: runSync }}>
      {children}
    </SyncContext.Provider>
  )
}

export const useSync = () => useContext(SyncContext)

export default SyncProvider
