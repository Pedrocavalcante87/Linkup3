/**
 * SISTEMA DE TESTES GLOBAIS - LINKUP³
 * Funções auxiliares para testar fluxos de recovery e degradação de integrações
 */

import { telemetry } from '../telemetry/TelemetryEvents'
import { integracoesAPI } from '../services/api'

// ============================================================================
// UTILITÁRIOS DE ARMAZENAMENTO (via API real)
// ============================================================================

async function getIntegracoes() {
  return integracoesAPI.listar().catch(() => [])
}

async function mudarStatusIntegracao(id, novoStatus) {
  const integracoes = await getIntegracoes()
  const alvo = integracoes.find(i => i.id === id)
  if (!alvo) {
    console.warn(`Integração ${id} não encontrada`)
    return null
  }
  const statusAnterior = alvo.status
  await integracoesAPI.atualizar(id, { status: novoStatus })
  // Notifica contexto global
  window.dispatchEvent(new Event('linkup-data-changed'))

  telemetry.trackEvent('STATUS_CHANGE', {
    integracao_id: id,
    status_anterior: statusAnterior,
    status_novo: novoStatus,
    timestamp: Date.now()
  })

  return { id, status: novoStatus }
}

/**
 * Testa fluxo de recuperação completo
 * Simula: ERROR → aguarda → OK
 * @param {string|string[]} ids - ID(s) da(s) integração(ões)
 * @param {number} tempoEspera - Tempo em ms antes da recuperação (padrão: 3000)
 */
window.TEST_RESTORE = async function(ids, tempoEspera = 3000) {
  try {
    // Permite string única ou array
    const lista = Array.isArray(ids) ? ids : [ids];

    console.group(`🔬 TESTE DE RECUPERAÇÃO - ${lista.join(', ')}`);

    for (const id of lista) {
      const integracoes = getIntegracoes();
      const integracao = integracoes.find(i => i.id === id);

      if (!integracao) {
        console.error(`❌ Integração ${id} não encontrada`);
        continue;
      }

      // Passo 1: Mudar para ERROR
      mudarStatusIntegracao(id, 'error');

      // Aguardar um pouco entre o erro e a recuperação
      await new Promise(resolve => setTimeout(resolve, tempoEspera));

      // Passo 2: Restaurar para OK
      mudarStatusIntegracao(id, 'ok');

      // Pequeno delay entre integrações
      if (lista.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.groupEnd();
  } catch (err) {
    console.error("❌ Erro durante teste de recovery:", err);
  }
};

/**
 * Testa fluxo de degradação completo
 * Simula: OK → WARN → ERROR
 * @param {string|string[]} ids - ID(s) da(s) integração(ões)
 * @param {number} intervalo - Intervalo entre mudanças em ms (padrão: 2000)
 */
window.TEST_DEGRADE = async function(ids, intervalo = 2000) {
  try {
    const lista = Array.isArray(ids) ? ids : [ids];

    console.group(`🔬 TESTE DE DEGRADAÇÃO - ${lista.join(', ')}`);

    for (const id of lista) {
      const integracoes = getIntegracoes();
      const integracao = integracoes.find(i => i.id === id);

      if (!integracao) {
        console.error(`❌ Integração ${id} não encontrada`);
        continue;
      }

      mudarStatusIntegracao(id, 'ok');
      await new Promise(resolve => setTimeout(resolve, intervalo));

      mudarStatusIntegracao(id, 'warn');
      await new Promise(resolve => setTimeout(resolve, intervalo));

      mudarStatusIntegracao(id, 'error');

      if (lista.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }


    console.groupEnd();
  } catch (err) {
    console.error("❌ Erro durante teste de degradação:", err);
  }
};

/**
 * Testa ciclo completo: OK → ERROR → OK
 * ✅ DEFENSIVO: Valida integração antes de cada mudança de status
 * @param {string|string[]} ids - ID(s) da(s) integração(ões)
 */
window.TEST_FULL_CYCLE = async function(ids) {
  try {
    // ✅ Validação de entrada
    if (!ids) {
      console.error('❌ TEST_FULL_CYCLE: Nenhum ID fornecido. Use TEST_LIST_INTEGRATIONS() para ver IDs disponíveis.');
      return;
    }

    const lista = Array.isArray(ids) ? ids : [ids];
    const integracoesDisponiveis = getIntegracoes();

    // ✅ Pré-validação: verifica se todos os IDs existem
    const idsInvalidos = lista.filter(id => !integracoesDisponiveis.find(i => i.id === id));
    if (idsInvalidos.length > 0) {
      console.error(`❌ Integrações não encontradas: ${idsInvalidos.join(', ')}`);
      return;
    }

    console.group(`🔬 TESTE CICLO COMPLETO - ${lista.join(', ')}`);

    for (const id of lista) {
      // Revalida antes de cada operação
      const integracoesAtuais = await getIntegracoes();
      const integracao = integracoesAtuais.find(i => i.id === id);

      if (!integracao) {
        console.error(`❌ [${id}] Integração desapareceu durante teste`);
        continue;
      }

      await mudarStatusIntegracao(id, 'ok');
      await new Promise(resolve => setTimeout(resolve, 2000));

      await mudarStatusIntegracao(id, 'warn');
      await new Promise(resolve => setTimeout(resolve, 2000));

      await mudarStatusIntegracao(id, 'error');
      await new Promise(resolve => setTimeout(resolve, 2000));

      await mudarStatusIntegracao(id, 'ok');

      if (lista.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }


    console.groupEnd();
  } catch (err) {
    console.error("❌ Erro durante teste de ciclo completo:", err);
    console.error("Stack trace:", err.stack);
  }
};

/**
 * Lista todas as integrações disponíveis
 */
window.TEST_LIST_INTEGRATIONS = async function() {
  const integracoes = await getIntegracoes();

  console.group('📋 INTEGRAÇÕES DISPONÍVEIS');
  console.table(integracoes.map(i => ({
    ID: i.id,
    Nome: i.nome,
    Status: i.status,
    Tipo: i.tipo,
    Uptime: `${i.uptime}%`
  })));

  console.groupEnd();
};

/**
 * Reseta todas as integrações para status OK
 */
window.TEST_RESET_ALL = async function() {
  const integracoes = await getIntegracoes();
  for (const integracao of integracoes) {
    await integracoesAPI.atualizar(integracao.id, { status: 'ok' })
  }
  window.dispatchEvent(new Event('linkup-data-changed'))
  console.table(integracoes.map(i => ({ ID: i.id, Nome: i.nome })))
}

/**
 * Simula múltiplas integrações com erro
 */
window.TEST_MULTIPLE_ERRORS = async function() {
  const integracoes = await getIntegracoes();
  const idsParaErrar = integracoes.slice(0, 3).map(i => i.id);

  for (let index = 0; index < idsParaErrar.length; index++) {
    await new Promise(resolve => setTimeout(resolve, index * 500));
    await mudarStatusIntegracao(idsParaErrar[index], 'error');
  }

  await new Promise(resolve => setTimeout(resolve, 3000));

  for (let index = 0; index < idsParaErrar.length; index++) {
    await new Promise(resolve => setTimeout(resolve, index * 1000));
    await mudarStatusIntegracao(idsParaErrar[index], 'ok');
  }
};

/**
 * Testa notificações e logs de recovery
 */
window.TEST_RECOVERY_NOTIFICATIONS = async function(id) {
  const integracoes = await getIntegracoes();
  const integracao = integracoes.find(i => i.id === id);

  if (!integracao) {
    console.error(`❌ Integração ${id} não encontrada`);
    return;
  }

  await mudarStatusIntegracao(id, 'error');

  telemetry.trackEvent('INTEGRATION_ERROR', {
    integracao_id: id,
    integracao_nome: integracao.nome,
    timestamp: Date.now()
  });

  await new Promise(resolve => setTimeout(resolve, 3000));

  await mudarStatusIntegracao(id, 'ok');

  telemetry.trackEvent('INTEGRATION_RESTORED', {
    integracao_id: id,
    integracao_nome: integracao.nome,
    timestamp: Date.now(),
    tempo_downtime: 3000
  });
};

/**
 * Simula análise de IA em recovery
 */
window.TEST_AI_RECOVERY = async function(id) {
  const integracoes = await getIntegracoes();
  const integracao = integracoes.find(i => i.id === id);

  if (!integracao) {
    console.error(`❌ Integração ${id} não encontrada`);
    return;
  }

  await mudarStatusIntegracao(id, 'error');

  await new Promise(resolve => setTimeout(resolve, 2000));
  await mudarStatusIntegracao(id, 'warn');

  await new Promise(resolve => setTimeout(resolve, 2000));
  await mudarStatusIntegracao(id, 'ok');
};

// ============================================================================
// VALIDADOR AUTOMÁTICO DE SNAPSHOT
// ============================================================================

/**
 * Valida consistência e integridade do snapshot
 * 🎯 Detecta: IDs duplicados, referências órfãs, dados corrompidos
 */
window.VALIDATE_SNAPSHOT = async function() {
  console.group('🔍 VALIDAÇÃO DE SNAPSHOT');

  // Busca snapshot atual da API
  const [integracoes, ticketsData, logsData, notifsData] = await Promise.all([
    integracoesAPI.listar().catch(() => []),
    import('../services/api').then(m => m.ticketsAPI.listar()).catch(() => []),
    import('../services/api').then(m => m.logsAPI.listar({ limite: 200 })).catch(() => ({ logs: [] })),
    import('../services/api').then(m => m.notificacoesAPI.listar()).catch(() => ({ notificacoes: [] })),
  ])
  const snap = {
    integracoes,
    integrations: integracoes,
    tickets: Array.isArray(ticketsData) ? ticketsData : [],
    logs: logsData.logs || [],
    notifications: notifsData.notificacoes || [],
    users: [],
    empresas: [],
    lastSynced: new Date().toISOString(),
  }
  let errosEncontrados = 0;
  let avisos = 0;

  // ✅ 1. Validar estrutura obrigatória
  const chavesObrigatorias = [
    'integrations', 'integracoes', 'logs', 'notifications',
    'tickets', 'finance', 'operations', 'users', 'empresas',
    'systemHealth', 'lastSynced'
  ];

  const chavesFaltando = chavesObrigatorias.filter(key => !(key in snap));
  if (chavesFaltando.length > 0) {
    console.error(`❌ Chaves obrigatórias faltando: ${chavesFaltando.join(', ')}`);
    errosEncontrados += chavesFaltando.length;
  } else {
    // estrutura ok
  }

  // ✅ 2. Validar unicidade de IDs em tickets
  const tickets = snap.tickets || [];
  const ticketIds = tickets.map(t => t.id || t.numero).filter(Boolean);
  const ticketIdsDuplicados = ticketIds.filter((id, idx) => ticketIds.indexOf(id) !== idx);

  if (ticketIdsDuplicados.length > 0) {
    console.error(`❌ ${ticketIdsDuplicados.length} IDs de tickets duplicados:`, [...new Set(ticketIdsDuplicados)]);
    errosEncontrados += ticketIdsDuplicados.length;
  } else {
    // sem duplicatas em tickets
  }

  // ✅ 3. Validar unicidade de IDs em integrações
  const integracoes = snap.integracoes || [];
  const integracaoIds = integracoes.map(i => i.id).filter(Boolean);
  const integracaoIdsDuplicados = integracaoIds.filter((id, idx) => integracaoIds.indexOf(id) !== idx);

  if (integracaoIdsDuplicados.length > 0) {
    console.error(`❌ ${integracaoIdsDuplicados.length} IDs de integrações duplicados:`, [...new Set(integracaoIdsDuplicados)]);
    errosEncontrados += integracaoIdsDuplicados.length;
  } else {
    // sem duplicatas em integrações
  }

  // ✅ 4. Validar referências de tickets (origem_id deve existir)
  const ticketsComOrigem = tickets.filter(t => t.origem_id && t.origem_tipo === 'integracao');
  const integracaoIdsSet = new Set(integracaoIds);
  const referenciaOrfas = ticketsComOrigem.filter(t => !integracaoIdsSet.has(t.origem_id));

  if (referenciaOrfas.length > 0) {
    console.warn(`⚠️ ${referenciaOrfas.length} tickets com referências órfãs (integração não existe):`);
    referenciaOrfas.forEach(t => console.warn(`   - Ticket ${t.id} → Integração ${t.origem_id} (não encontrada)`));
    avisos += referenciaOrfas.length;
  } else {
    // integridade referencial ok
  }

  // ✅ 5. Validar status das integrações
  const statusValidos = ['ok', 'warn', 'error'];
  const integracoesStatusInvalido = integracoes.filter(i => !statusValidos.includes(i.status));

  if (integracoesStatusInvalido.length > 0) {
    console.error(`❌ ${integracoesStatusInvalido.length} integrações com status inválido:`);
    integracoesStatusInvalido.forEach(i => console.error(`   - ${i.id}: status="${i.status}" (esperado: ok/warn/error)`));
    errosEncontrados += integracoesStatusInvalido.length;
  } else {
    // status de integrações ok
  }

  // ✅ 6. Validar tickets automáticos (devem ter origem_id)
  const ticketsAutomaticos = tickets.filter(t => t.automatico);
  const ticketsAutomaticosSemOrigem = ticketsAutomaticos.filter(t => !t.origem_id);

  if (ticketsAutomaticosSemOrigem.length > 0) {
    console.warn(`⚠️ ${ticketsAutomaticosSemOrigem.length} tickets automáticos sem origem_id:`);
    ticketsAutomaticosSemOrigem.forEach(t => console.warn(`   - Ticket ${t.id}: ${t.assunto}`));
    avisos += ticketsAutomaticosSemOrigem.length;
  } else {
    // tickets automáticos ok
  }

  // ✅ 7. Validar notificações duplicadas
  const notifications = snap.notifications || [];
  const notifIds = notifications.map(n => n.id).filter(Boolean);
  const notifIdsDuplicados = notifIds.filter((id, idx) => notifIds.indexOf(id) !== idx);

  if (notifIdsDuplicados.length > 0) {
    console.error(`❌ ${notifIdsDuplicados.length} IDs de notificações duplicados:`, [...new Set(notifIdsDuplicados)]);
    errosEncontrados += notifIdsDuplicados.length;
  } else {
    // sem duplicatas em notificações
  }

  // ✅ 8. Validar logs duplicados
  const logs = snap.logs || [];
  const logIds = logs.map(l => l.id).filter(Boolean);
  const logIdsDuplicados = logIds.filter((id, idx) => logIds.indexOf(id) !== idx);

  if (logIdsDuplicados.length > 0) {
    console.error(`❌ ${logIdsDuplicados.length} IDs de logs duplicados:`, [...new Set(logIdsDuplicados)]);
    errosEncontrados += logIdsDuplicados.length;
  } else {
    // sem duplicatas em logs
  }

  // 📊 Resumo final
  if (errosEncontrados === 0 && avisos === 0) {
    // snapshot válido
  } else {
    if (errosEncontrados > 0) {
      console.error(`❌ ${errosEncontrados} ERRO(S) CRÍTICO(S) encontrado(s)`);
    }
    if (avisos > 0) {
      console.warn(`⚠️ ${avisos} AVISO(S) encontrado(s)`);
    }
  }
  console.groupEnd();

  return { erros: errosEncontrados, avisos };
};

/**
 * Monitora snapshot em tempo real (executa validação a cada 15s)
 */
window.START_SNAPSHOT_MONITOR = function() {
  if (window.__snapshotMonitor) {
    console.warn('⚠️ Monitor de snapshot já está ativo');
    return;
  }

  window.__snapshotMonitor = setInterval(async () => {
    const result = await VALIDATE_SNAPSHOT();
    if (result.erros > 0) {
      console.error(`🚨 ALERTA: ${result.erros} erros detectados no snapshot!`);
    }
  }, 15000);
};

/**
 * Para monitor de snapshot
 */
window.STOP_SNAPSHOT_MONITOR = function() {
  if (window.__snapshotMonitor) {
    clearInterval(window.__snapshotMonitor);
    window.__snapshotMonitor = null;
  } else {
    console.warn('⚠️ Monitor de snapshot não está ativo');
  }
};

// ============================================================================
// INFORMAÇÕES DE AJUDA
// ============================================================================

window.TEST_HELP = function() {
  // Use TEST_HELP() no console do browser para ver os comandos disponíveis
  const help = `
╔═══════════════════════════════════════════════════════════════
║           SISTEMA DE TESTES - LINKUP³ RECOVERY                ║
╠═══════════════════════════════════════════════════════════════
║  TEST_LIST_INTEGRATIONS()  - listar integrações               ║
║  TEST_RESTORE(id)          - simular recovery (ERROR→OK)    ║
║  TEST_DEGRADE(id)          - simular degradação (OK→ERROR)  ║
║  TEST_FULL_CYCLE(id)       - ciclo completo                  ║
║  TEST_MULTIPLE_ERRORS()    - múltiplos erros                 ║
║  TEST_RECOVERY_NOTIFICATIONS(id) - testar notificações       ║
║  TEST_AI_RECOVERY(id)      - testar IA em recovery           ║
║  TEST_RESET_ALL()          - resetar tudo para OK            ║
║  VALIDATE_SNAPSHOT()       - validar integridade             ║
║  START_SNAPSHOT_MONITOR()  - monitor contínuo (15s)         ║
║  STOP_SNAPSHOT_MONITOR()   - parar monitor                   ║
╚═══════════════════════════════════════════════════════════════
  `;
  console.info(help);
};
║                                                               ║
║  📋 Listar integrações:                                       ║
║     TEST_LIST_INTEGRATIONS()                                  ║
║                                                               ║
║  🔄 Teste de recuperação (ERROR → OK):                        ║
║     TEST_RESTORE('int-001')              // Single            ║
║     TEST_RESTORE(['int-002','int-003'])  // Multiple          ║
║                                                               ║
║  📉 Teste de degradação (OK → WARN → ERROR):                  ║
║     TEST_DEGRADE('int-001')              // Single            ║
║     TEST_DEGRADE(['int-002','int-003'])  // Multiple          ║
║                                                               ║
║  🔁 Ciclo completo (OK → ERROR → OK):                         ║
║     TEST_FULL_CYCLE('int-001')           // Single            ║
║     TEST_FULL_CYCLE(['int-002','int-003']) // Multiple        ║
║                                                               ║
║  🔴 Múltiplos erros simultâneos:                              ║
║     TEST_MULTIPLE_ERRORS()                                    ║
║                                                               ║
║  🔔 Testar notificações de recovery:                          ║
║     TEST_RECOVERY_NOTIFICATIONS('id_integracao')              ║
║                                                               ║
║  🤖 Testar análise de IA:                                     ║
║     TEST_AI_RECOVERY('id_integracao')                         ║
║                                                               ║
║  ♻️  Resetar tudo para OK:                                     ║
║     TEST_RESET_ALL()                                          ║
║                                                               ║
║  � VALIDAÇÃO DE SNAPSHOT (NOVO):                             ║
║     VALIDATE_SNAPSHOT()              // Validação única       ║
║     START_SNAPSHOT_MONITOR()         // Monitora a cada 15s   ║
║     STOP_SNAPSHOT_MONITOR()          // Para monitor          ║
║                                                               ║
║  💡 Dicas:                                                    ║
║     • Todos os testes aceitam IDs únicos ou arrays            ║
║     • Use TEST_LIST_INTEGRATIONS() para ver IDs disponíveis   ║
║     • Execute VALIDATE_SNAPSHOT() após testes pesados         ║
║     • Veja as animações na página de Integrações              ║
║     • Verifique logs, notificações e sidebar                  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
};

// Sistema de testes carregado

// ============================================================================
// EXPORTS
// ============================================================================

export {
  mudarStatusIntegracao,
  getIntegracoes
};
