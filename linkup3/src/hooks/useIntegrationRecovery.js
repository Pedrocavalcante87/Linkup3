/**
 * HOOK DE RECOVERY DE INTEGRAÇÕES - LINKUP³
 * Lógica reversa completa para recuperação de integrações
 * Atualiza Dashboard, Logs, Notificações, IA, Automações e Sidebar em tempo real
 */

import { useState, useEffect, useCallback } from 'react';
import { telemetry } from '../telemetry/TelemetryEvents';
import {
  detectarRecuperacao,
  detectarDegradacao,
  calcularSeveridadeMudanca
} from '../utils/systemHealth';

export function useIntegrationRecovery() {
  const [integracoes, setIntegracoes] = useState([]);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(Date.now());

  // ========================================================================
  // CARREGAR INTEGRAÇÕES DO LOCALSTORAGE
  // ========================================================================
  const carregarIntegracoes = useCallback(() => {
    try {
      const stored = localStorage.getItem('linkup_integracoes_v1');
      if (stored) {
        const data = JSON.parse(stored);
        setIntegracoes(data);
        return data;
      }
      return [];
    } catch (e) {
      console.error('Erro ao carregar integrações:', e);
      return [];
    }
  }, []);

  // ========================================================================
  // SALVAR INTEGRAÇÕES NO LOCALSTORAGE
  // ========================================================================
  const salvarIntegracoes = useCallback((novasIntegracoes) => {
    try {
      localStorage.setItem('linkup_integracoes_v1', JSON.stringify(novasIntegracoes));
      setIntegracoes(novasIntegracoes);
      setUltimaAtualizacao(Date.now());

      // Disparar evento customizado para atualização global
      window.dispatchEvent(new CustomEvent('integracoes-updated', {
        detail: novasIntegracoes
      }));

      return true;
    } catch (e) {
      console.error('Erro ao salvar integrações:', e);
      return false;
    }
  }, []);

  // ========================================================================
  // CRIAR LOG DE SISTEMA
  // ========================================================================
  const criarLog = useCallback((nivel, mensagem, modulo, origem_id = null) => {
    try {
      const logs = JSON.parse(localStorage.getItem('linkup_logs_v1') || '[]');

      const novoLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        nivel,
        mensagem,
        modulo,
        origem_tipo: 'integracao',
        origem_id,
        detalhes: {}
      };

      logs.unshift(novoLog);
      localStorage.setItem('linkup_logs_v1', JSON.stringify(logs.slice(0, 500)));

      // Disparar evento de novo log
      window.dispatchEvent(new CustomEvent('logs-updated', { detail: logs }));

      return novoLog;
    } catch (e) {
      console.error('Erro ao criar log:', e);
      return null;
    }
  }, []);

  // ========================================================================
  // CRIAR NOTIFICAÇÃO
  // ========================================================================
  const criarNotificacao = useCallback((tipo, titulo, mensagem, link = null) => {
    try {
      const notificacoes = JSON.parse(localStorage.getItem('linkup_notificacoes_v1') || '[]');

      const novaNotificacao = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tipo,
        titulo,
        mensagem,
        link,
        lida: false,
        timestamp: new Date().toISOString()
      };

      notificacoes.unshift(novaNotificacao);
      localStorage.setItem('linkup_notificacoes_v1', JSON.stringify(notificacoes.slice(0, 100)));

      // Disparar evento de nova notificação
      window.dispatchEvent(new CustomEvent('notificacoes-updated', { detail: notificacoes }));

      return novaNotificacao;
    } catch (e) {
      console.error('Erro ao criar notificação:', e);
      return null;
    }
  }, []);

  // ========================================================================
  // FECHAR TICKET AUTOMÁTICO
  // ========================================================================
  const fecharTicketAutomatico = useCallback((integracaoId) => {
    try {
      const tickets = JSON.parse(localStorage.getItem('linkup_tickets_v1') || '[]');

      // Encontrar tickets abertos relacionados a essa integração
      const ticketsAtualizados = tickets.map(ticket => {
        if (
          ticket.origem_id === integracaoId &&
          ticket.status === 'aberto' &&
          ticket.automatico === true
        ) {
          return {
            ...ticket,
            status: 'resolvido',
            resolvido_em: new Date().toISOString(),
            observacoes: 'Fechado automaticamente - integração restaurada'
          };
        }
        return ticket;
      });

      localStorage.setItem('linkup_tickets_v1', JSON.stringify(ticketsAtualizados));

      // Disparar evento de tickets atualizados
      window.dispatchEvent(new CustomEvent('tickets-updated', { detail: ticketsAtualizados }));

      return true;
    } catch (e) {
      console.error('Erro ao fechar tickets:', e);
      return false;
    }
  }, []);

  // ========================================================================
  // LIMPAR ALERTAS PENDENTES
  // ========================================================================
  const limparAlertas = useCallback((integracaoId) => {
    try {
      // Limpar notificações críticas não lidas
      const notificacoes = JSON.parse(localStorage.getItem('linkup_notificacoes_v1') || '[]');
      const notificacoesAtualizadas = notificacoes.filter(notif => {
        // Manter notificações que não são de erro desta integração
        if (notif.tipo === 'critico' && notif.mensagem.includes(integracaoId)) {
          return false; // Remover
        }
        return true; // Manter
      });

      localStorage.setItem('linkup_notificacoes_v1', JSON.stringify(notificacoesAtualizadas));
      window.dispatchEvent(new CustomEvent('notificacoes-updated', { detail: notificacoesAtualizadas }));

      return true;
    } catch (e) {
      console.error('Erro ao limpar alertas:', e);
      return false;
    }
  }, []);

  // ========================================================================
  // DISPARAR REPROCESSAMENTO GLOBAL
  // ========================================================================
  const dispararReprocessamento = useCallback(() => {
    // Registrar telemetria
    telemetry.trackSystemReprocessing('recovery', 'integracao_restaurada', {
      timestamp: Date.now()
    });

    // Disparar eventos customizados para cada módulo
    window.dispatchEvent(new CustomEvent('reprocessar-ai'));
    window.dispatchEvent(new CustomEvent('reprocessar-automations'));
    window.dispatchEvent(new CustomEvent('reprocessar-heatmap'));
    window.dispatchEvent(new CustomEvent('reprocessar-insights'));
  }, []);

  // ========================================================================
  // LÓGICA REVERSA - RECUPERAÇÃO DE INTEGRAÇÃO
  // ========================================================================
  const processarRecuperacao = useCallback((integracao, statusAnterior) => {
    // 1. Criar log de restauração
    criarLog(
      'info',
      `Integração ${integracao.nome} restaurada com sucesso`,
      'Integrações',
      integracao.id
    );

    // 2. Criar notificação verde de normalização
    criarNotificacao(
      'sucesso',
      'Integração Normalizada',
      `A integração ${integracao.nome} voltou a funcionar normalmente.`,
      '/integracoes'
    );

    // 3. Fechar ticket automático se existir
    fecharTicketAutomatico(integracao.id);

    // 4. Limpar alertas pendentes
    limparAlertas(integracao.id);

    // 5. Registrar telemetria de recuperação
    if (statusAnterior === 'error') {
      telemetry.trackIntegrationRestored(
        integracao.id,
        integracao.nome,
        0,
        { statusAnterior }
      );
    } else if (statusAnterior === 'warn') {
      telemetry.trackIntegrationNormalized(
        integracao.id,
        integracao.nome,
        statusAnterior
      );
    }

    // 6. Disparar reprocessamento global
    dispararReprocessamento();

    // 7. Disparar animação de sucesso
    window.dispatchEvent(new CustomEvent('integracao-recuperada', {
      detail: { integracaoId: integracao.id, nome: integracao.nome }
    }));

  }, [criarLog, criarNotificacao, fecharTicketAutomatico, limparAlertas, dispararReprocessamento]);

  // ========================================================================
  // LÓGICA DE DEGRADAÇÃO
  // ========================================================================
  const processarDegradacao = useCallback((integracao, statusAnterior) => {
    const severidade = calcularSeveridadeMudanca(statusAnterior, integracao.status);

    // 1. Criar log de erro
    criarLog(
      'error',
      `Integração ${integracao.nome} apresentou falha - Status: ${integracao.status}`,
      'Integrações',
      integracao.id
    );

    // 2. Criar notificação crítica
    if (integracao.status === 'error') {
      criarNotificacao(
        'critico',
        'Integração com Erro',
        `A integração ${integracao.nome} está com problemas e precisa de atenção.`,
        '/integracoes'
      );
    } else if (integracao.status === 'warn') {
      criarNotificacao(
        'alerta',
        'Integração em Atenção',
        `A integração ${integracao.nome} está apresentando instabilidade.`,
        '/integracoes'
      );
    }

    // 3. Registrar telemetria de erro
    telemetry.trackIntegrationError(
      integracao.id,
      integracao.nome,
      { statusAnterior, severidade }
    );

    // 4. Disparar reprocessamento
    dispararReprocessamento();

  }, [criarLog, criarNotificacao, dispararReprocessamento]);

  // ========================================================================
  // MUDAR STATUS DE INTEGRAÇÃO
  // ========================================================================
  const mudarStatusIntegracao = useCallback((integracaoId, novoStatus) => {
    const integracoesAtuais = carregarIntegracoes();
    const index = integracoesAtuais.findIndex(i => i.id === integracaoId);

    if (index === -1) {
      console.error(`Integração ${integracaoId} não encontrada`);
      return false;
    }

    const integracao = integracoesAtuais[index];
    const statusAnterior = integracao.status;

    // Verificar se houve mudança real
    if (statusAnterior === novoStatus) {
      return true; // Sem mudança
    }

    // Atualizar status
    integracoesAtuais[index] = {
      ...integracao,
      status: novoStatus,
      ultima_sync: new Date().toISOString()
    };

    // Salvar
    salvarIntegracoes(integracoesAtuais);

    // Registrar telemetria de mudança
    telemetry.trackIntegrationStatusChange(
      integracaoId,
      integracao.nome,
      statusAnterior,
      novoStatus
    );

    // Processar lógica de recovery ou degradação
    if (detectarRecuperacao(statusAnterior, novoStatus)) {
      processarRecuperacao(integracoesAtuais[index], statusAnterior);
    } else if (detectarDegradacao(statusAnterior, novoStatus)) {
      processarDegradacao(integracoesAtuais[index], statusAnterior);
    }

    return true;
  }, [carregarIntegracoes, salvarIntegracoes, processarRecuperacao, processarDegradacao]);

  // ========================================================================
  // LISTENER DE EVENTOS CUSTOMIZADOS
  // ========================================================================
  useEffect(() => {
    // Carregar integrações ao montar
    carregarIntegracoes();

    // Escutar eventos de atualização de integrações
    const handleIntegrationUpdate = (event) => {
      if (event.detail) {
        setIntegracoes(event.detail);
        setUltimaAtualizacao(Date.now());
      }
    };

    window.addEventListener('integracoes-updated', handleIntegrationUpdate);

    return () => {
      window.removeEventListener('integracoes-updated', handleIntegrationUpdate);
    };
  }, [carregarIntegracoes]);

  // ========================================================================
  // RETORNO DO HOOK
  // ========================================================================
  return {
    integracoes,
    ultimaAtualizacao,
    mudarStatusIntegracao,
    carregarIntegracoes,
    salvarIntegracoes,
    criarLog,
    criarNotificacao,
    fecharTicketAutomatico,
    limparAlertas,
    dispararReprocessamento
  };
}

export default useIntegrationRecovery;
