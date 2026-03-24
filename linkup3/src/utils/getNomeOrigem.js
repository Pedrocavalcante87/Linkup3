// Utilitário para resolver o nome da origem de uma notificação
// Suporta integracao, fatura, ticket, operacao/registro
export function getNomeOrigem(tipo, id, snapshot = {}) {
  if (!tipo || !id) {
    console.warn('getNomeOrigem fallback por dados ausentes', { tipo, id })
    return 'Desconhecido'
  }

  const normalizarTipo = (tRaw) => {
    const t = String(tRaw).toLowerCase()
    if (['integracao', 'integração', 'integration'].includes(t)) return 'integracao'
    if (['fatura', 'invoice', 'fat'].includes(t)) return 'fatura'
    if (['ticket', 'chamado', 'suporte'].includes(t)) return 'ticket'
    if (['operacao', 'operação', 'registro', 'operacional'].includes(t)) return 'operacao'
    return t
  }

  const t = normalizarTipo(tipo)
  const { integracoes = [], finance = {}, tickets = [], operations = {} } = snapshot || {}

  if (t === 'integracao') {
    const match = integracoes.find(i => i.id === id || i.slug === id || i.nome === id)
    if (match?.nome) return match.nome
    console.warn('getNomeOrigem fallback integracao', { id, integracoesLen: integracoes.length })
    return `Integração ${id}`
  }

  if (t === 'fatura') {
    const faturas = finance.faturas || []
    const match = faturas.find(f => f.id === id || f.numero === id)
    if (match?.numero) return match.numero
    console.warn('getNomeOrigem fallback fatura', { id, faturasLen: faturas.length })
    return `Fatura ${id}`
  }

  if (t === 'ticket') {
    const match = tickets.find(tk => tk.id === id || tk.numero === id)
    if (match?.numero) return match.numero
    if (match?.assunto) return match.assunto
    console.warn('getNomeOrigem fallback ticket', { id, ticketsLen: tickets.length })
    return `Ticket ${id}`
  }

  if (t === 'operacao') {
    const registros = operations.registros || []
    const match = registros.find(r => r.id === id || r.codigo === id)
    if (match?.titulo) return match.titulo
    if (match?.descricao) return match.descricao
    console.warn('getNomeOrigem fallback operacao', { id, registrosLen: registros.length })
    return `Operação ${id}`
  }

  console.warn('getNomeOrigem tipo não mapeado, usando id', { tipo: t, id })
  return id
}
