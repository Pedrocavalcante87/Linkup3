// ============================================================================
// MOTOR DE INSIGHTS E INTELIGÊNCIA AUTOMÁTICA
// Sistema de análise contextual para o ERP LinkUp³
// ============================================================================

import {
  empresas,
  registros,
  faturas,
  integracoes,
  logsCompletos,
  notificacoesCompletas,
  ticketsCompletos
} from './fakeData'

// ============================================================================
// 1. ANALISADORES DE CONTEXTO
// ============================================================================

/**
 * Analisa saúde de uma integração
 */
export function analisarIntegracao(integracao) {
  const uptime = integracao.uptime
  const successRate = integracao.success_rate
  const status = integracao.status

  let severidade = 'baixa'
  let explicacao = 'Integração funcionando normalmente'
  let acao = 'Nenhuma ação necessária'
  let risco = 0

  // Calcular risco (0-100)
  if (uptime < 85) risco += 40
  else if (uptime < 92) risco += 25
  else if (uptime < 98) risco += 10

  if (successRate < 85) risco += 40
  else if (successRate < 90) risco += 25
  else if (successRate < 95) risco += 10

  if (status === 'error') risco += 20
  else if (status === 'warning') risco += 10

  // Determinar severidade
  if (risco >= 60) {
    severidade = 'alta'
    explicacao = `Integração crítica: uptime ${uptime}%, sucesso ${successRate}%`
    acao = 'Desativar temporariamente e revisar credenciais/endpoint'
  } else if (risco >= 30) {
    severidade = 'média'
    explicacao = `Integração instável: uptime ${uptime}%, sucesso ${successRate}%`
    acao = 'Realizar sincronização manual e monitorar próximas 24h'
  } else if (risco >= 15) {
    severidade = 'baixa'
    explicacao = 'Pequenas inconsistências detectadas'
    acao = 'Acompanhar logs para identificar padrão'
  }

  return { severidade, explicacao, acao, risco }
}

/**
 * Analisa comportamento financeiro de uma empresa
 */
export function analisarComportamentoEmpresa(empresaId) {
  const faturasEmpresa = faturas.filter(f => f.empresa_id === empresaId)
  const empresa = empresas.find(e => e.id === empresaId)

  if (!empresa || faturasEmpresa.length === 0) {
    return { severidade: 'baixa', explicacao: 'Sem histórico suficiente', acao: null }
  }

  const totalFaturas = faturasEmpresa.length
  const faturasVencidas = faturasEmpresa.filter(f => f.status === 'overdue').length
  const faturasAtraso = faturasVencidas
  const taxaInadimplencia = (faturasAtraso / totalFaturas) * 100

  let severidade = 'baixa'
  let explicacao = 'Bom histórico de pagamento'
  let acao = null

  if (taxaInadimplencia >= 40) {
    severidade = 'alta'
    explicacao = `${empresa.nome} possui ${faturasAtraso} faturas atrasadas (${taxaInadimplencia.toFixed(0)}% de inadimplência)`
    acao = 'Acionar cobrança e revisar limite de crédito'
  } else if (taxaInadimplencia >= 20) {
    severidade = 'média'
    explicacao = `${empresa.nome} com inadimplência recorrente`
    acao = 'Entrar em contato para regularização'
  }

  return { severidade, explicacao, acao, empresa: empresa.nome, faturasAtraso }
}

/**
 * Analisa registro operacional e sugere ações
 */
export function analisarRegistro(registro) {
  if (!registro.inconsistencia) {
    return { severidade: 'baixa', explicacao: 'Registro válido', acao: null }
  }

  let severidade = 'média'
  let explicacao = 'Inconsistência detectada'
  let acao = 'Revisar manualmente'

  // Se valor alto, aumenta severidade
  if (registro.valor > 200) {
    severidade = 'alta'
    explicacao = `Inconsistência de alto valor: R$ ${registro.valor.toFixed(2)}`
    acao = 'Abrir ticket urgente e investigar'
  }

  // Se já existe ticket relacionado
  const ticketRelacionado = ticketsCompletos.find(
    t => t.origem_tipo === 'registro' && t.origem_id === registro.id
  )

  if (ticketRelacionado) {
    acao = `Ticket ${ticketRelacionado.numero} já aberto - acompanhar resolução`
  }

  return { severidade, explicacao, acao, valor: registro.valor }
}

/**
 * Analisa ticket e sugere prioridade automática
 */
export function analisarTicket(ticket) {
  let prioridadeSugerida = ticket.prioridade
  let razao = ''

  // Ticket relacionado a integração = alta prioridade
  if (ticket.origem_modulo === 'integração') {
    prioridadeSugerida = 'alta'
    razao = 'Tickets de integração afetam múltiplos sistemas'
  }

  // Ticket com múltiplos logs = revisar urgente
  const logsRelacionados = logsCompletos.filter(
    l => l.origem_tipo === 'ticket' && l.origem_id === ticket.id
  )

  if (logsRelacionados.length >= 2) {
    prioridadeSugerida = 'alta'
    razao = `${logsRelacionados.length} logs relacionados - possível problema recorrente`
  }

  // Ticket aberto há muito tempo
  const diasAberto = Math.floor(
    (new Date() - new Date(ticket.criado_em)) / (1000 * 60 * 60 * 24)
  )

  if (diasAberto > 3 && ticket.status === 'aberto') {
    prioridadeSugerida = 'alta'
    razao = `Ticket aberto há ${diasAberto} dias sem resolução`
  }

  return {
    prioridadeSugerida,
    razao,
    precisaAjuste: prioridadeSugerida !== ticket.prioridade
  }
}

// ============================================================================
// 2. DETECÇÃO DE PADRÕES E ANOMALIAS
// ============================================================================

/**
 * Detecta padrões em logs (erros repetidos, picos)
 */
export function detectarPadroesLogs(sourceLogs = logsCompletos) {
  const padroes = []
  const dataset = Array.isArray(sourceLogs) ? sourceLogs : []

  // Agrupar logs por mensagem
  const logsPorMensagem = dataset.reduce((acc, log) => {
    const key = log.mensagem
    if (!acc[key]) acc[key] = []
    acc[key].push(log)
    return acc
  }, {})

  // Detectar erros repetidos
  Object.entries(logsPorMensagem).forEach(([mensagem, logs]) => {
    if (logs.length >= 2 && logs.some(l => l.nivel === 'ERROR')) {
      padroes.push({
        tipo: 'erro_repetido',
        severidade: 'alta',
        mensagem: mensagem,
        count: logs.length,
        modulo: logs[0].modulo,
        ultimaOcorrencia: logs[logs.length - 1].timestamp,
        sugestao: 'Investigar causa raiz deste erro recorrente e verificar logs relacionados'
      })
    }
  })

  // Detectar picos de WARN
  const warningsRecentes = dataset.filter(l => l.nivel === 'WARN')
  if (warningsRecentes.length >= 3) {
    padroes.push({
      tipo: 'pico_warnings',
      severidade: 'média',
      mensagem: `Avisos recorrentes detectados no sistema`,
      count: warningsRecentes.length,
      modulo: warningsRecentes[0].modulo,
      ultimaOcorrencia: warningsRecentes[warningsRecentes.length - 1].timestamp,
      sugestao: 'Revisar configurações do sistema e verificar integrações'
    })
  }

  return padroes
}

/**
 * Agrupa notificações correlacionadas
 */
export function agruparNotificacoesCorrelacionadas(sourceNotificacoes = notificacoesCompletas) {
  const grupos = []
  const dataset = Array.isArray(sourceNotificacoes) ? sourceNotificacoes : []

  const normalized = dataset.map(n => ({
    ...n,
    status: n.status || n.tipo || 'info',
    title: n.title || n.titulo || 'Notificação',
    description: n.description || n.descricao || n.mensagem || '',
    time: n.time || n.criado_em || n.timestamp,
  }))

  normalized.forEach(notif => {
    // Buscar notificações relacionadas à mesma origem
    const relacionadas = normalized.filter(
      n => n.origem_id === notif.origem_id &&
           n.origem_tipo === notif.origem_tipo &&
           n.id !== notif.id
    )

    if (relacionadas.length > 0) {
      const jaExiste = grupos.some(g =>
        g.some(n => n.id === notif.id)
      )

      if (!jaExiste) {
        grupos.push([notif, ...relacionadas])
      }
    }
  })

  return grupos.map(grupo => {
    // Determinar severidade do grupo
    const temCritico = grupo.some(n => n.status === 'error')
    const temAviso = grupo.some(n => n.status === 'warning')
    const severidadeGrupo = temCritico ? 'alta' : temAviso ? 'media' : 'baixa'

    // Determinar tipo de relação
    const tipoRelacao = 'mesma_origem'
    const relacionado = grupo[0].relacionado || null

    return {
      origem_tipo: grupo[0].origem_tipo,
      origem_id: grupo[0].origem_id,
      origem_modulo: grupo[0].origem_modulo,
      quantidade: grupo.length,
      notificacoes: grupo,
      acao: `Ver detalhes em ${grupo[0].origem_modulo}`,
      severidadeGrupo,
      tipoRelacao,
      relacionado
    }
  })
}

// ============================================================================
// 3. GERADOR DE INSIGHTS GLOBAIS
// ============================================================================

/**
 * Gera insights automáticos para o dashboard
 */
export function gerarInsightsDashboard() {
  const insights = []

  // 1. Integração instável
  integracoes.forEach(int => {
    const analise = analisarIntegracao(int)
    if (analise.severidade === 'alta' || analise.severidade === 'média') {
      insights.push({
        tipo: 'integracao',
        severidade: analise.severidade,
        titulo: `Integração ${int.nome} ${analise.severidade === 'alta' ? 'crítica' : 'instável'}`,
        descricao: analise.explicacao,
        acao: analise.acao,
        link: '/integracoes'
      })
    }
  })

  // 2. Inconsistências operacionais
  const inconsistenciasHoje = registros.filter(r => {
    const hoje = new Date().toISOString().split('T')[0]
    const dataRegistro = r.data.split('T')[0]
    return r.inconsistencia && dataRegistro === hoje
  })

  if (inconsistenciasHoje.length > 0) {
    insights.push({
      tipo: 'operacional',
      severidade: inconsistenciasHoje.length >= 3 ? 'alta' : 'média',
      titulo: `${inconsistenciasHoje.length} inconsistências detectadas hoje`,
      descricao: 'Reservas ou lançamentos com problemas financeiros',
      acao: 'Revisar e corrigir manualmente',
      link: '/operacional?filter=erros'
    })
  }

  // 3. Inadimplência recorrente
  empresas.forEach(emp => {
    const analise = analisarComportamentoEmpresa(emp.id)
    if (analise.severidade === 'alta' || analise.severidade === 'média') {
      insights.push({
        tipo: 'financeiro',
        severidade: analise.severidade,
        titulo: `${analise.empresa} com inadimplência`,
        descricao: analise.explicacao,
        acao: analise.acao,
        link: '/financeiro'
      })
    }
  })

  // 4. Tickets críticos não resolvidos
  const ticketsCriticos = ticketsCompletos.filter(
    t => t.prioridade === 'alta' && t.status !== 'resolvido'
  )

  if (ticketsCriticos.length >= 2) {
    insights.push({
      tipo: 'tickets',
      severidade: 'alta',
      titulo: `${ticketsCriticos.length} tickets críticos aguardando resolução`,
      descricao: 'Prioridade alta requer atenção imediata',
      acao: 'Escalar para equipe técnica',
      link: '/prioridades'
    })
  }

  // Ordenar por severidade
  const ordem = { alta: 0, média: 1, baixa: 2 }
  insights.sort((a, b) => ordem[a.severidade] - ordem[b.severidade])

  return insights
}

/**
 * Gera análise financeira automática
 */
export function gerarAnaliseFinanceira() {
  const totalPrevisto = faturas
    .filter(f => f.status === 'open' || f.status === 'overdue')
    .reduce((sum, f) => sum + f.valor, 0)

  const totalRecebido = faturas
    .filter(f => f.status === 'paid')
    .reduce((sum, f) => sum + f.valor, 0)

  const totalVencido = faturas
    .filter(f => f.status === 'overdue')
    .reduce((sum, f) => sum + f.valor, 0)

  // Previsão de inadimplência (baseado em histórico)
  const taxaInadimplencia = faturas.length > 0
    ? (faturas.filter(f => f.status === 'overdue').length / faturas.length) * 100
    : 0

  // Comportamento por empresa
  const comportamentoPorEmpresa = empresas.map(emp => {
    const analise = analisarComportamentoEmpresa(emp.id)
    return {
      empresa: emp.nome,
      ...analise
    }
  }).filter(c => c.severidade !== 'baixa')

  return {
    totalPrevisto,
    totalRecebido,
    totalVencido,
    taxaInadimplencia: taxaInadimplencia,
    comportamentoPorEmpresa,
    recomendacao: totalVencido > 1000
      ? 'Acionar cobrança urgente - valor inadimplente elevado'
      : totalVencido > 0
      ? 'Monitorar faturas vencidas'
      : 'Situação financeira saudável'
  }
}

/**
 * Sugere ações rápidas contextuais
 */
export function sugerirAcoesRapidas() {
  const acoes = []

  // Faturas vencidas
  const faturasVencidas = faturas.filter(f => f.status === 'overdue')
  if (faturasVencidas.length > 0) {
    acoes.push({
      titulo: 'Resolver faturas atrasadas',
      descricao: `${faturasVencidas.length} faturas vencidas`,
      link: '/financeiro?filter=overdue',
      icon: 'DollarSign',
      cor: 'danger'
    })
  }

  // Inconsistências críticas
  const inconsistenciasCriticas = registros.filter(
    r => r.inconsistencia && r.valor > 200
  )
  if (inconsistenciasCriticas.length > 0) {
    acoes.push({
      titulo: 'Ver inconsistências críticas',
      descricao: `${inconsistenciasCriticas.length} registros de alto valor`,
      link: '/operacional?filter=erros',
      icon: 'AlertTriangle',
      cor: 'warning'
    })
  }

  // Integrações falhando
  const integracoesFalhas = integracoes.filter(i => i.status === 'error')
  if (integracoesFalhas.length > 0) {
    acoes.push({
      titulo: 'Corrigir integrações',
      descricao: `${integracoesFalhas.length} integrações com erro`,
      link: '/integracoes?filter=error',
      icon: 'Zap',
      cor: 'danger'
    })
  }

  return acoes
}

// ============================================================================
// 4. HELPERS DE CLASSIFICAÇÃO
// ============================================================================

/**
 * Retorna cor baseada em severidade
 */
export function getCorSeveridade(severidade) {
  const mapa = {
    alta: 'danger',
    média: 'warning',
    baixa: 'info'
  }
  return mapa[severidade] || 'info'
}

/**
 * Retorna ícone baseado em tipo de insight
 */
export function getIconeInsight(tipo) {
  const mapa = {
    integracao: 'Zap',
    operacional: 'AlertTriangle',
    financeiro: 'DollarSign',
    tickets: 'Headphones'
  }
  return mapa[tipo] || 'Info'
}
