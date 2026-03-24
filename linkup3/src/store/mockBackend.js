// Pseudo-backend centralizado para simulação de sync/health
// Mantém coerência de integrações, logs, notificações e tickets em localStorage
//
// 🔐 SISTEMA DE ID ÚNICO PARA TICKETS (Correção Critical: Duplicação React Keys)
// =========================================================================
// Problema identificado: React warnings de keys duplicadas devido a IDs não-únicos
// Solução aplicada:
//   1. generateTicketId(): Gerador determinístico usando Date.now() + counter + integrationId
//   2. deduplicateTickets(): Normalização via Map para eliminar duplicados (última versão prevalece)
//   3. Validação preventiva: Verifica se ticket já existe antes de criar (em setIntegrationStatus e syncTick)
//   4. Deduplicação em camadas: getSnapshot() e saveTickets() aplicam limpeza automaticamente
// Garantias:
//   - IDs únicos mesmo em chamadas simultâneas (ex: TEST_MULTIPLE_ERRORS)
//   - Sem side-effects em componentes React (keys estáveis)
//   - Compatibilidade total com testes existentes (TEST_FULL_CYCLE, TEST_DEGRADE, etc.)
//   - Preparado para migração para backend real (IDs seguem padrão tick_<timestamp>_<counter>_<origin>)

import {
  integracoes as seedIntegracoes,
  logsCompletos as seedLogs,
  notificacoesCompletas as seedNotificacoes,
  ticketsCompletos as seedTickets,
  faturas as seedFaturas,
  registros as seedRegistros,
  operations as seedOperations,
  usuarios as seedUsuarios,
  empresas as seedEmpresas,
  syncRows as seedSyncRows
} from '../utils/fakeData'

const KEYS = {
  integracoes: 'linkup_integracoes_v1',
  logs: 'linkup_logs_v1',
  notificacoes: 'linkup_notificacoes_v1',
  tickets: 'linkup_tickets_v1',
  users: 'linkup_users_v1',
  onboarding: 'linkup_onboarding_v1',
  lastSynced: 'linkup_last_synced_v1'
}

const MAX_LOGS = 500
const MAX_NOTIFICACOES = 200

// Snapshot schema - todas as chaves obrigatórias
const SNAPSHOT_SCHEMA = [
  'integrations',
  'integracoes',
  'logs',
  'notifications',
  'notificationsCorrelated',
  'notificationsBySeverity',
  'notificationsByIntegration',
  'tickets',
  'finance',
  'operations',
  'users',
  'empresas',
  'onboarding',
  'telemetry',
  'automations',
  'aiCache',
  'systemHealth',
  'lastSynced',
  'syncRows'
]

const validateSnapshot = (snap) => {
  if (!snap || typeof snap !== 'object') {
    console.error('[mockBackend] Snapshot inválido: não é objeto', snap)
    return false
  }
  const missing = SNAPSHOT_SCHEMA.filter(key => !(key in snap))
  if (missing.length > 0) {
    console.error('[mockBackend] Snapshot incompleto. Chaves faltando:', missing)
    return false
  }
  return true
}

// ✅ Flag para controlar se estamos dentro de um syncTick/broadcast
let _isBroadcasting = false

const emit = (name, detail) => {
  // ✅ Guard: Se estamos em broadcast, eventos granulares são bloqueados
  if (_isBroadcasting && name !== 'sync-new-snapshot') {
    return
  }
  window.dispatchEvent(new CustomEvent(name, { detail }))
}

const NORMALIZE_STATUS_MAP = {
  critico: 'error',
  critical: 'error',
  error: 'error',
  erro: 'error',
  err: 'error',
  alerta: 'warning',
  alert: 'warning',
  warn: 'warning',
  warning: 'warning',
  aviso: 'warning',
  sucesso: 'success',
  success: 'success',
  ok: 'success',
  info: 'success'
}

const normalizeStatus = (raw) => {
  if (!raw) return 'success'
  const key = String(raw).toLowerCase()
  const normalized = NORMALIZE_STATUS_MAP[key]

  if (!normalized) {
    // ⚠️ Status desconhecido: registrar e retornar error para segurança
    console.error(`[mockBackend] ⚠️ Status desconhecido: "${raw}". Mapeado como 'error' por segurança.`)
    return 'error' // ✅ Fallback seguro: assumir erro em vez de sucesso
  }

  return normalized
}

const normalizeTimestamp = (value) => {
  if (!value) return new Date().toISOString()
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
}

// ✅ Gerador de ID único para tickets (determinístico + incremental)
let ticketIdCounter = 0
const generateTicketId = (integrationId = 'system') => {
  ticketIdCounter++
  // Formato: tick_<timestamp>_<counter>_<integration>
  // Garante unicidade mesmo com chamadas simultâneas
  return `tick_${Date.now()}_${ticketIdCounter.toString().padStart(4, '0')}_${integrationId.substring(0, 8)}`
}

// ✅ Deduplicação de tickets: garante que não há IDs duplicados no snapshot
// Usa Map para normalizar (última versão prevalece) e retorna array limpo
const deduplicateTickets = (tickets) => {
  if (!Array.isArray(tickets)) {
    console.error('[mockBackend] ⚠️ deduplicateTickets recebeu não-array:', tickets)
    return []
  }

  // Map usando id primário (prioriza ticket.id, fallback para ticket.numero)
  const ticketMap = new Map()

  tickets.forEach(t => {
    const key = t.id || t.numero
    if (!key) {
      console.warn('[mockBackend] ⚠️ Ticket sem ID ignorado:', t)
      return
    }

    // Última versão prevalece (importante para atualizações de status)
    ticketMap.set(key, t)
  })

  const deduplicated = Array.from(ticketMap.values())

  if (deduplicated.length < tickets.length) {
    console.warn(`[mockBackend] 🔧 ${tickets.length - deduplicated.length} tickets duplicados removidos (${tickets.length} → ${deduplicated.length})`)
  }

  return deduplicated
}

const normalizeNotification = (n) => {
  const status = normalizeStatus(n.status || n.tipo)
  const origemTipo = n.origem_tipo || n.origemTipo || null
  const origemId = n.origem_id || n.origemId || null
  const origemModulo = n.origem_modulo || n.origemModulo || null
  return {
    id: n.id || `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: n.titulo || n.title || 'Notificação',
    description: n.mensagem || n.descricao || n.description || '',
    status,
    timestamp: normalizeTimestamp(n.timestamp || n.criado_em || n.time),
    read: n.read ?? n.lida ?? false,
    category: n.categoria || n.category || origemModulo || 'geral',
    origem_tipo: origemTipo,
    origem_id: origemId,
    origem_modulo: origemModulo,
    link: n.link || null,
    rel: {
      integrationId: origemTipo === 'integracao' ? origemId : null,
      logId: origemTipo === 'log' ? origemId : null,
      ticketId: origemTipo === 'ticket' ? origemId : null,
      automationId: origemTipo === 'automation' ? origemId : null,
    }
  }
}

const normalizeNotificationList = (list) => {
  const base = normalizeArray(list)
  const seen = new Set()
  return base
    .map(normalizeNotification)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .filter(n => {
      if (seen.has(n.id)) return false
      seen.add(n.id)
      return true
    })
}

const buildCorrelated = (list) => {
  const groups = {}
  list.forEach(n => {
    const key = `${n.origem_tipo || 'na'}::${n.origem_id || 'na'}`
    if (!groups[key]) groups[key] = []
    groups[key].push(n)
  })
  return Object.values(groups)
    .filter(g => g.length > 1)
    .map(group => ({
      origem_tipo: group[0].origem_tipo,
      origem_id: group[0].origem_id,
      origem_modulo: group[0].origem_modulo,
      notificacoes: group,
      severidadeGrupo: group.some(n => n.status === 'error') ? 'alta' : group.some(n => n.status === 'warning') ? 'media' : 'baixa',
      tipoRelacao: 'mesma_origem'
    }))
}

const indexBySeverity = (list) => list.reduce((acc, n) => {
  acc[n.status] = acc[n.status] || []
  acc[n.status].push(n)
  return acc
}, {})

const indexByIntegration = (list) => list.reduce((acc, n) => {
  const key = n.rel?.integrationId || null
  if (!key) return acc
  acc[key] = acc[key] || []
  acc[key].push(n)
  return acc
}, {})

const rand = () => Math.random()

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (e) {
    console.error('mockBackend read error', key, e)
    return fallback
  }
}

const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('mockBackend write error', key, e)
  }
}

const seedIfNeeded = () => {
  if (!localStorage.getItem(KEYS.integracoes)) {
    writeJSON(KEYS.integracoes, seedIntegracoes)
  }
  if (!localStorage.getItem(KEYS.logs)) {
    writeJSON(KEYS.logs, seedLogs.slice(0, 200))
  }
  if (!localStorage.getItem(KEYS.notificacoes)) {
    writeJSON(KEYS.notificacoes, seedNotificacoes.slice(0, 80))
  }
  if (!localStorage.getItem(KEYS.tickets)) {
    writeJSON(KEYS.tickets, seedTickets)
  }
  if (!localStorage.getItem(KEYS.users)) {
    writeJSON(KEYS.users, seedUsuarios)
  }
  if (!localStorage.getItem(KEYS.onboarding)) {
    writeJSON(KEYS.onboarding, { checklist: [], progress: 0 })
  }
  if (!localStorage.getItem(KEYS.lastSynced)) {
    localStorage.setItem(KEYS.lastSynced, new Date().toISOString())
  }
}

const pushLog = (logs, { nivel = 'info', mensagem, modulo = 'sync', origem_tipo = 'sistema', origem_id = null }) => {
  const novoLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    nivel,
    mensagem,
    modulo,
    origem_tipo,
    origem_id,
    detalhes: {}
  }
  const next = [novoLog, ...logs].slice(0, MAX_LOGS)
  writeJSON(KEYS.logs, next)
  // ✅ Remove duplicação: apenas evento de criação
  emit('log-criado', novoLog)
  return next
}

const normalizeArray = (value, fallback = []) => (Array.isArray(value) ? value : fallback)

const broadcastSnapshot = (snap) => {
  if (!validateSnapshot(snap)) {
    console.error('[mockBackend] Tentativa de broadcast de snapshot inválido bloqueada')
    return snap
  }
  emit('sync-new-snapshot', snap)
  return snap
}

const pushNotificacao = (notificacoes, payload) => {
  const base = normalizeArray(notificacoes)
  const normalized = normalizeNotification({ ...payload, id: payload.id })

  // ✅ Permitir notificações do sistema sem origem específica
  if (!normalized.origem_tipo || !normalized.origem_id) {
    // Notificações globais do sistema
    normalized.origem_tipo = 'sistema'
    normalized.origem_id = 'global'
  }

  const next = [normalized, ...base].slice(0, MAX_NOTIFICACOES)
  const stored = normalizeNotificationList(next)
  writeJSON(KEYS.notificacoes, stored)
  // ✅ Remove duplicação: apenas evento de criação, não de lista atualizada
  emit('notificacao-criada', normalized)
  return stored
}

const saveIntegracoes = (lista) => {
  writeJSON(KEYS.integracoes, lista)
  // ✅ Removido evento redundante: snapshot completo já contém integrações
  // emit('integracoes-updated', lista) // BLOQUEADO: causa recompute redundante
}

const saveTickets = (lista) => {
  // ✅ Deduplica antes de persistir (última linha de defesa)
  const deduplicated = deduplicateTickets(lista)
  writeJSON(KEYS.tickets, deduplicated)
  // ✅ Removido evento redundante: snapshot completo já contém tickets
  // emit('tickets-updated', deduplicated) // BLOQUEADO: causa recompute redundante
}

const saveUsers = (lista) => {
  writeJSON(KEYS.users, lista)
  emit('users-updated', lista)
}

const saveOnboarding = (state) => {
  writeJSON(KEYS.onboarding, state)
  emit('onboarding-updated', state)
}

export const addTicket = (ticket) => {
  seedIfNeeded()
  const current = readJSON(KEYS.tickets, seedTickets)
  const now = new Date().toISOString()

  // ✅ Garante ID único: se não fornecido, gera deterministicamente
  const ticketId = ticket.id || ticket.numero || generateTicketId(ticket.origem_id || 'manual')

  const novo = {
    id: ticketId,
    numero: ticketId, // ✅ Mantém consistência id/numero
    status: 'aberto',
    criado_em: now,
    atualizado_em: now,
    ...ticket // ✅ Spread por último para permitir override consciente
  }

  // ✅ Deduplica antes de salvar
  const next = deduplicateTickets([novo, ...current])
  saveTickets(next)
  emit('ticket-criado', novo)
  return novo
}

export const updateTicket = (ticketId, updates = {}) => {
  seedIfNeeded()
  const current = readJSON(KEYS.tickets, seedTickets)
  const next = current.map(t => {
    const idMatch = t.id === ticketId || t.numero === ticketId
    if (!idMatch) return t
    return { ...t, ...updates, atualizado_em: new Date().toISOString() }
  })
  saveTickets(next)
  return next.find(t => t.id === ticketId || t.numero === ticketId)
}

export const getSnapshot = () => {
  seedIfNeeded()
  const integracoes = readJSON(KEYS.integracoes, seedIntegracoes)
  const logs = readJSON(KEYS.logs, seedLogs.slice(0, 200))
  const notificacoesRaw = readJSON(KEYS.notificacoes, seedNotificacoes.slice(0, 80))
  const notificacoes = normalizeNotificationList(notificacoesRaw)

  // ✅ Sempre deduplica tickets antes de incluir no snapshot
  const ticketsRaw = readJSON(KEYS.tickets, seedTickets)
  const tickets = deduplicateTickets(ticketsRaw)

  const users = readJSON(KEYS.users, seedUsuarios)
  const onboarding = readJSON(KEYS.onboarding, { checklist: [], progress: 0 })
  const lastSynced = localStorage.getItem(KEYS.lastSynced) || new Date().toISOString()

  // Saúde simples
  const okCount = integracoes.filter(i => i.status === 'ok').length
  const warnCount = integracoes.filter(i => i.status === 'warn').length
  const errorCount = integracoes.filter(i => i.status === 'error').length

  return {
    integrations: integracoes,
    integracoes,
    logs,
    notifications: notificacoes,
    notificationsCorrelated: buildCorrelated(notificacoes),
    notificationsBySeverity: indexBySeverity(notificacoes),
    notificationsByIntegration: indexByIntegration(notificacoes),
    tickets,
    finance: {
      faturas: seedFaturas,
      registros: seedRegistros,
      empresas: seedEmpresas,
      syncRows: seedSyncRows
    },
    operations: {
      registros: seedRegistros,
      operations: seedOperations
    },
    users,
    empresas: seedEmpresas,
    onboarding,
    telemetry: readJSON('linkup_telemetry_v1', []),
    automations: readJSON('linkup_automations_v1', []),
    aiCache: readJSON('linkup_ai_cache_v1', {}),
    systemHealth: {
      ok: okCount,
      warn: warnCount,
      error: errorCount,
      total: integracoes.length
    },
    lastSynced,
    syncRows: seedSyncRows
  }
}

const mutateStatus = (integracao) => {
  // 25% chance de mudar status: preferir pequenos ajustes
  if (rand() < 0.75) return integracao
  const next = { ...integracao }
  if (integracao.status === 'ok' && rand() < 0.3) next.status = 'warn'
  else if (integracao.status === 'ok' && rand() < 0.15) next.status = 'error'
  else if (integracao.status === 'warn' && rand() < 0.4) next.status = 'error'
  else if (integracao.status === 'warn' && rand() < 0.4) next.status = 'ok'
  else if (integracao.status === 'error' && rand() < 0.5) next.status = 'warn'
  else if (integracao.status === 'error' && rand() < 0.25) next.status = 'ok'
  if (next.status !== integracao.status) {
    next.ultima_sync = new Date().toISOString()
    next.total_syncs = (next.total_syncs || 0) + 1
  }
  return next
}

const formatStatusMsg = (nome, from, to) => {
  if (to === 'ok') return `Integração ${nome} recuperada (${from} → OK)`
  if (to === 'warn') return `Integração ${nome} com degradação leve (${from} → WARN)`
  if (to === 'error') return `Integração ${nome} falhou (${from} → ERROR)`
  return `Integração ${nome} alterou status (${from} → ${to})`
}

export const setIntegrationStatus = (integrationId, newStatus) => {
  seedIfNeeded()
  const snapshot = getSnapshot()
  const exists = snapshot.integracoes.find(i => i.id === integrationId)
  if (!exists) {
    console.warn('Integração não encontrada', integrationId)
    return null
  }

  const updatedIntegracoes = snapshot.integracoes.map(i =>
    i.id === integrationId
      ? { ...i, status: newStatus, ultima_sync: new Date().toISOString(), total_syncs: (i.total_syncs || 0) + 1 }
      : i
  )

  let logs = snapshot.logs
  let notificacoes = snapshot.notifications
  let tickets = snapshot.tickets

  if (exists.status !== newStatus) {
    const statusMsg = formatStatusMsg(exists.nome, exists.status, newStatus)
    logs = pushLog(logs, {
      nivel: newStatus === 'error' ? 'ERROR' : newStatus === 'warn' ? 'WARN' : 'OK',
      mensagem: statusMsg,
      modulo: 'integração',
      origem_tipo: 'integracao',
      origem_id: integrationId
    })
    notificacoes = pushNotificacao(notificacoes, {
      status: newStatus === 'error' ? 'error' : newStatus === 'warn' ? 'warning' : 'success',
      titulo: newStatus === 'ok' ? `${exists.nome}: Conexão estável` : newStatus === 'warn' ? `${exists.nome}: Atenção necessária` : `${exists.nome}: Falha detectada`,
      mensagem: newStatus === 'ok' ? `A conexão com ${exists.nome} foi restabelecida. Recomendamos monitorar a estabilidade.` : newStatus === 'warn' ? `${exists.nome} está com instabilidade. Pode impactar sincronização de dados. Verifique credenciais e status do serviço.` : `${exists.nome} não está respondendo. Operações dependentes podem estar comprometidas. Acesse a página de integrações para detalhes.`,
      link: '/integracoes',
      origem_tipo: 'integracao',
      origem_id: integrationId,
      origem_modulo: 'integração'
    })

    if (newStatus === 'error') {
      // ✅ Verifica se já existe ticket aberto para esta integração
      const ticketExistente = tickets.find(
        t => t.origem_id === integrationId &&
             t.status === 'aberto' &&
             t.automatico
      )

      if (!ticketExistente) {
        const ticketId = generateTicketId(integrationId)
        const novoTicket = {
          id: ticketId,
          numero: ticketId, // ✅ Usa mesmo ID para numero (consistência)
          assunto: `Acompanhamento: ${exists.nome} não está respondendo`,
          descricao: `Detectamos que ${exists.nome} apresentou falha de conexão. Isso pode impactar a sincronização de dados. Sugerimos verificar credenciais, status do serviço externo e logs de erro.`,
          prioridade: 'alta',
          status: 'aberto',
          origem_id: integrationId,
          origem_tipo: 'integracao',
          automatico: true,
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString()
        }
        tickets = [novoTicket, ...tickets]
        emit('ticket-criado', novoTicket)
      }
    } else if (newStatus === 'ok') {
      tickets = tickets.map(t => {
        if (t.origem_id === integrationId && t.status === 'aberto' && t.automatico) {
          return { ...t, status: 'resolvido', atualizado_em: new Date().toISOString(), resolvido_em: new Date().toISOString() }
        }
        return t
      })
    }
  }

  saveIntegracoes(updatedIntegracoes)
  saveTickets(tickets)
  // ✅ Persiste notificações sem emitir evento redundante
  writeJSON(KEYS.notificacoes, normalizeNotificationList(notificacoes))
  localStorage.setItem(KEYS.lastSynced, new Date().toISOString())

  // ✅ Snapshot completo é broadcastado, contém tudo
  const finalSnapshot = getSnapshot()
  broadcastSnapshot(finalSnapshot)
  return finalSnapshot
}

export const syncTick = () => {
  const snapshot = getSnapshot()
  const updatedIntegracoes = snapshot.integracoes.map(mutateStatus)
  const changed = updatedIntegracoes.filter((i, idx) => i.status !== snapshot.integracoes[idx].status)

  let logs = snapshot.logs
  let notificacoes = snapshot.notifications || []
  let tickets = snapshot.tickets

  // ✅ EVENTOS DE INTEGRAÇÕES (existente)
  if (changed.length) {
    changed.forEach((i) => {
      logs = pushLog(logs, {
        nivel: i.status === 'error' ? 'ERROR' : i.status === 'warn' ? 'WARN' : 'OK',
        mensagem: formatStatusMsg(i.nome, snapshot.integracoes.find(x => x.id === i.id)?.status || 'desconhecido', i.status),
        modulo: 'integração',
        origem_tipo: 'integracao',
        origem_id: i.id
      })
      notificacoes = pushNotificacao(notificacoes, {
        status: i.status === 'error' ? 'error' : i.status === 'warn' ? 'warning' : 'success',
        titulo: i.status === 'ok' ? `${i.nome}: Conexão restabelecida` : i.status === 'warn' ? `${i.nome}: Instabilidade identificada` : `${i.nome}: Falha de comunicação`,
        mensagem: i.status === 'ok' ? `${i.nome} voltou a responder normalmente. Sincronização ativa. Monitore a estabilidade nas próximas horas.` : i.status === 'warn' ? `${i.nome} está com resposta lenta ou intermitente. Dados podem não estar atualizados. Recomendamos investigar.` : `${i.nome} parou de responder. Sincronização interrompida. Verifique status do serviço e credenciais de acesso.`,
        link: '/integracoes',
        origem_tipo: 'integracao',
        origem_id: i.id,
        origem_modulo: 'integração'
      })
      // Tickets automáticos: abrir em error, fechar em ok
      if (i.status === 'error') {
        // ✅ Verifica duplicação antes de criar ticket
        const ticketExistente = tickets.find(
          t => t.origem_id === i.id &&
               t.status === 'aberto' &&
               t.automatico
        )

        if (!ticketExistente) {
          const ticketId = generateTicketId(i.id)
          const novoTicket = {
            id: ticketId,
            numero: ticketId, // ✅ Usa mesmo ID para numero (consistência)
            assunto: `Acompanhamento sugerido: ${i.nome} sem resposta`,
            descricao: `A integração ${i.nome} apresentou falha de comunicação. Recomendamos verificar: 1) Status do serviço externo, 2) Credenciais de acesso, 3) Logs de erro recentes. Isso pode impactar sincronização de dados críticos.`,
            prioridade: 'alta',
            status: 'aberto',
            origem_id: i.id,
            origem_tipo: 'integracao',
            automatico: true,
            criado_em: new Date().toISOString(),
            atualizado_em: new Date().toISOString()
          }
          tickets = [novoTicket, ...tickets]
        }
      } else if (i.status === 'ok') {
        tickets = tickets.map(t => {
          if (t.origem_id === i.id && t.status === 'aberto' && t.automatico) {
            return { ...t, status: 'resolvido', atualizado_em: new Date().toISOString(), resolvido_em: new Date().toISOString() }
          }
          return t
        })
      }
    })
  }

  // ✅ EVENTOS DO MÓDULO FINANCEIRO (10% de chance a cada tick)
  if (Math.random() < 0.1) {
    const eventosFinanceiro = [
      { nivel: 'OK', msg: 'Processamento financeiro concluído sem pendências', tipo: 'fatura', detalhes: 'Todas as faturas do período foram processadas.' },
      { nivel: 'WARN', msg: 'Fatura aguardando há 7+ dias pode afetar fluxo de caixa', tipo: 'fatura', detalhes: 'Recomendamos revisar aprovações pendentes no módulo financeiro.' },
      { nivel: 'ERROR', msg: 'Gateway de pagamento não responde - clientes podem estar afetados', tipo: 'fatura', detalhes: 'Verifique status do provedor de pagamentos e notifique clientes se necessário.' },
      { nivel: 'OK', msg: 'Relatório mensal disponível para análise', tipo: 'sistema', detalhes: 'Consolidação financeira do período foi gerada.' },
      { nivel: 'WARN', msg: 'Limite operacional em 85% - atenção ao planejamento', tipo: 'sistema', detalhes: 'Avalie necessidade de ajuste de crédito antes de atingir o limite.' }
    ]
    const evento = eventosFinanceiro[Math.floor(Math.random() * eventosFinanceiro.length)]

    logs = pushLog(logs, {
      nivel: evento.nivel,
      mensagem: evento.msg,
      modulo: 'financeiro',
      origem_tipo: evento.tipo,
      origem_id: evento.tipo === 'fatura' ? snapshot.finance?.faturas?.[0]?.id : null
    })

    if (evento.nivel !== 'OK') {
      notificacoes = pushNotificacao(notificacoes, {
        status: evento.nivel === 'ERROR' ? 'error' : 'warning',
        titulo: evento.nivel === 'ERROR' ? 'Financeiro: Ação necessária' : 'Financeiro: Atenção recomendada',
        mensagem: `${evento.msg}. ${evento.detalhes}`,
        link: '/financeiro',
        origem_tipo: evento.tipo,
        origem_id: evento.tipo === 'fatura' ? snapshot.finance?.faturas?.[0]?.id : null,
        origem_modulo: 'financeiro'
      })
    }
  }

  // ✅ EVENTOS DO MÓDULO SUPORTE (8% de chance a cada tick)
  if (Math.random() < 0.08) {
    const eventosSuporte = [
      { nivel: 'OK', msg: 'Ticket fechado - cliente confirmou resolução', tipo: 'ticket', detalhes: 'O chamado foi finalizado após validação.' },
      { nivel: 'WARN', msg: 'Ticket aguarda resposta há 48h - SLA em risco', tipo: 'ticket', detalhes: 'Recomendamos priorizar este atendimento para manter qualidade do serviço.' },
      { nivel: 'ERROR', msg: 'Sistema de email não enviou notificação - cliente pode não saber', tipo: 'sistema', detalhes: 'Verifique configuração SMTP e notifique cliente manualmente se crítico.' },
      { nivel: 'OK', msg: 'Documentação de suporte atualizada com novos artigos', tipo: 'sistema', detalhes: 'Base de conhecimento expandida para melhorar autoatendimento.' },
      { nivel: 'WARN', msg: 'Volume de chamados 20% acima do normal - avaliar recursos', tipo: 'sistema', detalhes: 'Pico de demanda detectado. Considere reforço temporário.' }
    ]
    const evento = eventosSuporte[Math.floor(Math.random() * eventosSuporte.length)]

    logs = pushLog(logs, {
      nivel: evento.nivel,
      mensagem: evento.msg,
      modulo: 'suporte',
      origem_tipo: evento.tipo,
      origem_id: evento.tipo === 'ticket' ? snapshot.tickets?.[0]?.id : null
    })

    if (evento.nivel !== 'OK') {
      notificacoes = pushNotificacao(notificacoes, {
        status: evento.nivel === 'ERROR' ? 'error' : 'warning',
        titulo: evento.nivel === 'ERROR' ? 'Suporte: Intervenção necessária' : 'Suporte: Acompanhamento recomendado',
        mensagem: `${evento.msg}. ${evento.detalhes}`,
        link: '/chamados',
        origem_tipo: evento.tipo,
        origem_id: evento.tipo === 'ticket' ? snapshot.tickets?.[0]?.id : null,
        origem_modulo: 'suporte'
      })
    }
  }

  // ✅ EVENTOS DO MÓDULO OPERACIONAL (12% de chance a cada tick)
  if (Math.random() < 0.12) {
    const eventosOperacional = [
      { nivel: 'OK', msg: 'Operação de check-in registrada sem inconsistências', tipo: 'registro', detalhes: 'Fluxo operacional funcionando normalmente.' },
      { nivel: 'WARN', msg: 'Possível duplicação em registro - validação manual sugerida', tipo: 'registro', detalhes: 'Identificamos entrada similar recente. Verifique para evitar cobrança duplicada.' },
      { nivel: 'ERROR', msg: 'Sincronização operacional interrompida - dados podem estar desatualizados', tipo: 'sistema', detalhes: 'Recomendamos verificar conectividade e reiniciar sincronização manual se necessário.' },
      { nivel: 'OK', msg: 'Consolidação operacional diária disponível', tipo: 'sistema', detalhes: 'Métricas do período foram processadas e estão prontas para análise.' },
      { nivel: 'WARN', msg: 'Ocupação em 90% - planejamento de capacidade recomendado', tipo: 'sistema', detalhes: 'Considere ajustar disponibilidade ou preparar expansão.' },
      { nivel: 'ERROR', msg: 'Conflito identificado em reserva - cliente pode ser impactado', tipo: 'registro', detalhes: 'Detectamos sobreposição de horários. Resolva antes do atendimento para evitar insatisfação.' }
    ]
    const evento = eventosOperacional[Math.floor(Math.random() * eventosOperacional.length)]

    logs = pushLog(logs, {
      nivel: evento.nivel,
      mensagem: evento.msg,
      modulo: 'operacional',
      origem_tipo: evento.tipo,
      origem_id: evento.tipo === 'registro' ? snapshot.operations?.registros?.[0]?.id : null
    })

    if (evento.nivel !== 'OK') {
      notificacoes = pushNotificacao(notificacoes, {
        status: evento.nivel === 'ERROR' ? 'error' : 'warning',
        titulo: evento.nivel === 'ERROR' ? 'Operacional: Ação imediata' : 'Operacional: Verificação sugerida',
        mensagem: `${evento.msg}. ${evento.detalhes}`,
        link: '/operacional',
        origem_tipo: evento.tipo,
        origem_id: evento.tipo === 'registro' ? snapshot.operations?.registros?.[0]?.id : null,
        origem_modulo: 'operacional'
      })
    }
  }

  saveIntegracoes(updatedIntegracoes)
  saveTickets(tickets)
  localStorage.setItem(KEYS.lastSynced, new Date().toISOString())

  // ✅ Normaliza e persiste notificações sem emitir evento redundante
  const normalizedNotifs = normalizeNotificationList(notificacoes)
  writeJSON(KEYS.notificacoes, normalizedNotifs)

  // ✅ Evento Único: sync-new-snapshot contém tudo
  const finalSnapshot = getSnapshot()
  return broadcastSnapshot(finalSnapshot)
}

export const forceSync = () => syncTick()

// Notificações (mutações seguras)
export const addNotification = (payload) => {
  seedIfNeeded()
  const current = normalizeNotificationList(readJSON(KEYS.notificacoes, seedNotificacoes))
  const next = pushNotificacao(current, payload)
  return next[0]
}

export const markNotificationRead = (notificationId) => {
  seedIfNeeded()
  const current = normalizeNotificationList(readJSON(KEYS.notificacoes, seedNotificacoes))
  const next = current.map(n => n.id === notificationId ? { ...n, read: true, lida: true } : n)
  writeJSON(KEYS.notificacoes, next)
  emit('notificacoes-updated', next)
  return next
}

export const markAllNotificationsRead = () => {
  seedIfNeeded()
  const current = normalizeNotificationList(readJSON(KEYS.notificacoes, seedNotificacoes))
  const next = current.map(n => ({ ...n, read: true, lida: true }))
  writeJSON(KEYS.notificacoes, next)
  emit('notificacoes-updated', next)
  return next
}

// Usuários / Perfil
export const updateUserProfile = (userId, updates = {}) => {
  seedIfNeeded()
  const current = readJSON(KEYS.users, seedUsuarios)
  const next = current.map(u => (u.id === userId ? { ...u, ...updates } : u))
  saveUsers(next)
  return next.find(u => u.id === userId) || null
}

// Onboarding
export const getOnboardingState = () => {
  seedIfNeeded()
  return readJSON(KEYS.onboarding, { checklist: [], progress: 0 })
}

export const setOnboardingState = (state) => {
  seedIfNeeded()
  const next = { checklist: state.checklist || [], progress: state.progress || 0 }
  saveOnboarding(next)
  return next
}

// Leitura segura de seções do snapshot
export const getSnapshotSection = (path, snap) => {
  const source = snap || getSnapshot()
  if (!path) return source
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), source)
}
