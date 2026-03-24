// ============================================================================
// SIMULADOR DE EVENTOS EM TEMPO REAL (Fake WebSocket)
// Gera notificações automáticas a cada 10-25 segundos
// ============================================================================

import { empresas, integracoes, faturas, registros, ticketsCompletos } from './fakeData'

let eventCounter = 1000

/**
 * Gera um evento aleatório simulando tempo real
 */
export function gerarEventoAleatorio() {
  const tiposEvento = [
    'fatura_atrasada',
    'pagamento_confirmado',
    'fatura_gerada',
    'integracao_caiu',
    'integracao_voltou',
    'sincronizacao_concluida',
    'inconsistencia_nova',
    'reserva_duplicada',
    'checkin_automatico',
    'ticket_aberto',
    'ticket_atualizado',
    'ticket_encerrado'
  ]

  const tipo = tiposEvento[Math.floor(Math.random() * tiposEvento.length)]
  eventCounter++

  switch (tipo) {
    case 'fatura_atrasada':
      return gerarEventoFaturaAtrasada()
    case 'pagamento_confirmado':
      return gerarEventoPagamentoConfirmado()
    case 'fatura_gerada':
      return gerarEventoFaturaGerada()
    case 'integracao_caiu':
      return gerarEventoIntegracaoCaiu()
    case 'integracao_voltou':
      return gerarEventoIntegracaoVoltou()
    case 'sincronizacao_concluida':
      return gerarEventoSincronizacaoConcluida()
    case 'inconsistencia_nova':
      return gerarEventoInconsistenciaNova()
    case 'reserva_duplicada':
      return gerarEventoReservaDuplicada()
    case 'checkin_automatico':
      return gerarEventoCheckinAutomatico()
    case 'ticket_aberto':
      return gerarEventoTicketAberto()
    case 'ticket_atualizado':
      return gerarEventoTicketAtualizado()
    case 'ticket_encerrado':
      return gerarEventoTicketEncerrado()
    default:
      return gerarEventoGenerico()
  }
}

// ============================================================================
// GERADORES DE EVENTOS FINANCEIROS
// ============================================================================

function gerarEventoFaturaAtrasada() {
  const empresa = empresas[Math.floor(Math.random() * empresas.length)]
  const valor = (Math.random() * 5000 + 500).toFixed(2)
  
  return {
    id: `not-${eventCounter}`,
    title: `Fatura vencida - ${empresa.nome}`,
    description: `Fatura de R$ ${valor} está ${Math.floor(Math.random() * 15 + 1)} dias em atraso`,
    time: 'Agora',
    timestamp: new Date().toISOString(),
    status: 'error',
    categoria: 'financeiro',
    tipo: 'error',
    origem_modulo: 'financeiro',
    origem_tipo: 'fatura',
    origem_id: `FAT-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
    read: false
  }
}

function gerarEventoPagamentoConfirmado() {
  const empresa = empresas[Math.floor(Math.random() * empresas.length)]
  const valor = (Math.random() * 3000 + 200).toFixed(2)
  
  return {
    id: `not-${eventCounter}`,
    title: `Pagamento confirmado - ${empresa.nome}`,
    description: `Recebimento de R$ ${valor} processado com sucesso`,
    time: 'Agora',
    timestamp: new Date().toISOString(),
    status: 'success',
    categoria: 'financeiro',
    tipo: 'success',
    origem_modulo: 'financeiro',
    origem_tipo: 'fatura',
    origem_id: `FAT-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
    read: false
  }
}

function gerarEventoFaturaGerada() {
  const empresa = empresas[Math.floor(Math.random() * empresas.length)]
  const valor = (Math.random() * 2000 + 100).toFixed(2)
  
  return {
    id: `not-${eventCounter}`,
    title: `Nova fatura gerada - ${empresa.nome}`,
    description: `Fatura automática de R$ ${valor} criada a partir de ${Math.floor(Math.random() * 5 + 1)} registros`,
    time: 'Agora',
    timestamp: new Date().toISOString(),
    status: 'info',
    categoria: 'financeiro',
    tipo: 'info',
    origem_modulo: 'financeiro',
    origem_tipo: 'fatura',
    origem_id: `FAT-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
    read: false
  }
}

// ============================================================================
// GERADORES DE EVENTOS DE INTEGRAÇÃO
// ============================================================================

function gerarEventoIntegracaoCaiu() {
  const integracao = integracoes[Math.floor(Math.random() * integracoes.length)]
  
  return {
    id: `not-${eventCounter}`,
    title: `Integração falhou - ${integracao.nome}`,
    description: `Falha na sincronização: timeout após 30s. Última tentativa sem sucesso.`,
    time: 'Agora',
    timestamp: new Date().toISOString(),
    status: 'error',
    categoria: 'integração',
    tipo: 'error',
    origem_modulo: 'integração',
    origem_tipo: 'integracao',
    origem_id: integracao.id,
    read: false
  }
}

function gerarEventoIntegracaoVoltou() {
  const integracao = integracoes[Math.floor(Math.random() * integracoes.length)]
  
  return {
    id: `not-${eventCounter}`,
    title: `Integração restaurada - ${integracao.nome}`,
    description: `Conexão reestabelecida com sucesso. Sistema operando normalmente.`,
    time: 'Agora',
    timestamp: new Date().toISOString(),
    status: 'success',
    categoria: 'integração',
    tipo: 'success',
    origem_modulo: 'integração',
    origem_tipo: 'integracao',
    origem_id: integracao.id,
    read: false
  }
}

function gerarEventoSincronizacaoConcluida() {
  const integracao = integracoes[Math.floor(Math.random() * integracoes.length)]
  const qtd = Math.floor(Math.random() * 50 + 10)
  
  return {
    id: `not-${eventCounter}`,
    title: `Sincronização concluída - ${integracao.nome}`,
    description: `${qtd} registros sincronizados com sucesso em ${Math.floor(Math.random() * 5 + 1)}s`,
    time: 'Agora',
    timestamp: new Date().toISOString(),
    status: 'success',
    categoria: 'integração',
    tipo: 'success',
    origem_modulo: 'integração',
    origem_tipo: 'integracao',
    origem_id: integracao.id,
    read: false
  }
}

// ============================================================================
// GERADORES DE EVENTOS OPERACIONAIS
// ============================================================================

function gerarEventoInconsistenciaNova() {
  const empresa = empresas[Math.floor(Math.random() * empresas.length)]
  const valor = (Math.random() * 1000 + 50).toFixed(2)
  
  return {
    id: `not-${eventCounter}`,
    title: `Inconsistência detectada - ${empresa.nome}`,
    description: `Registro de R$ ${valor} sem fatura associada requer verificação`,
    time: 'Agora',
    timestamp: new Date().toISOString(),
    status: 'warning',
    categoria: 'operacional',
    tipo: 'warning',
    origem_modulo: 'operacional',
    origem_tipo: 'registro',
    origem_id: `REG-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
    read: false
  }
}

function gerarEventoReservaDuplicada() {
  const empresa = empresas[Math.floor(Math.random() * empresas.length)]
  
  return {
    id: `not-${eventCounter}`,
    title: `Reserva duplicada - ${empresa.nome}`,
    description: `Detectado registro duplicado no sistema. Revisar manualmente.`,
    time: 'Agora',
    timestamp: new Date().toISOString(),
    status: 'warning',
    categoria: 'operacional',
    tipo: 'warning',
    origem_modulo: 'operacional',
    origem_tipo: 'registro',
    origem_id: `REG-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
    read: false
  }
}

function gerarEventoCheckinAutomatico() {
  const empresa = empresas[Math.floor(Math.random() * empresas.length)]
  
  return {
    id: `not-${eventCounter}`,
    title: `Check-in automático - ${empresa.nome}`,
    description: `Registro processado e fatura gerada automaticamente`,
    time: 'Agora',
    timestamp: new Date().toISOString(),
    status: 'success',
    categoria: 'operacional',
    tipo: 'success',
    origem_modulo: 'operacional',
    origem_tipo: 'registro',
    origem_id: `REG-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
    read: false
  }
}

// ============================================================================
// GERADORES DE EVENTOS DE TICKETS
// ============================================================================

function gerarEventoTicketAberto() {
  const assuntos = [
    'Erro na integração com Omie',
    'Fatura duplicada no sistema',
    'Problema no cálculo de comissão',
    'Inconsistência em relatório',
    'Falha no envio de email'
  ]
  const assunto = assuntos[Math.floor(Math.random() * assuntos.length)]
  
  return {
    id: `not-${eventCounter}`,
    title: `Novo ticket aberto`,
    description: `${assunto} - Prioridade alta`,
    time: 'Agora',
    timestamp: new Date().toISOString(),
    status: 'warning',
    categoria: 'suporte',
    tipo: 'warning',
    origem_modulo: 'suporte',
    origem_tipo: 'ticket',
    origem_id: `TKT-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
    read: false
  }
}

function gerarEventoTicketAtualizado() {
  const ticket = ticketsCompletos[Math.floor(Math.random() * ticketsCompletos.length)]
  
  return {
    id: `not-${eventCounter}`,
    title: `Ticket atualizado - ${ticket.numero}`,
    description: `Nova mensagem adicionada ao ticket: ${ticket.assunto}`,
    time: 'Agora',
    timestamp: new Date().toISOString(),
    status: 'info',
    categoria: 'suporte',
    tipo: 'info',
    origem_modulo: 'suporte',
    origem_tipo: 'ticket',
    origem_id: ticket.numero,
    read: false
  }
}

function gerarEventoTicketEncerrado() {
  const ticket = ticketsCompletos[Math.floor(Math.random() * ticketsCompletos.length)]
  
  return {
    id: `not-${eventCounter}`,
    title: `Ticket resolvido - ${ticket.numero}`,
    description: `${ticket.assunto} foi encerrado com sucesso`,
    time: 'Agora',
    timestamp: new Date().toISOString(),
    status: 'success',
    categoria: 'suporte',
    tipo: 'success',
    origem_modulo: 'suporte',
    origem_tipo: 'ticket',
    origem_id: ticket.numero,
    read: false
  }
}

// ============================================================================
// EVENTO GENÉRICO (FALLBACK)
// ============================================================================

function gerarEventoGenerico() {
  return {
    id: `not-${eventCounter}`,
    title: 'Atualização do sistema',
    description: 'Sincronização de dados concluída',
    time: 'Agora',
    timestamp: new Date().toISOString(),
    status: 'info',
    categoria: 'sistema',
    tipo: 'info',
    origem_modulo: 'sistema',
    origem_tipo: 'sistema',
    origem_id: 'SYS-001',
    read: false
  }
}

/**
 * Inicia o stream de eventos fake
 * @returns {Function} Função para parar o stream
 */
export function iniciarStreamDeEventos(callback) {
  let timeoutId = null
  let isActive = true
  
  const intervalo = () => {
    if (!isActive) return
    
    const delay = Math.random() * 15000 + 10000 // 10-25 segundos
    
    timeoutId = setTimeout(() => {
      if (!isActive) return
      const evento = gerarEventoAleatorio()
      callback(evento)
      intervalo() // Reagendar próximo evento
    }, delay)
  }

  intervalo()

  // Retornar função de cleanup
  return () => {
    isActive = false
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}
