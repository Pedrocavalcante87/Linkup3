/**
 * SISTEMA DE SAÚDE GLOBAL - LINKUP³
 * Lógica unificada para cálculo de status, cores e estados de integrações
 */

// ============================================================================
// FUNÇÕES DE CÁLCULO DE SAÚDE
// ============================================================================

/**
 * Calcula o nível de saúde baseado no status
 * @param {string} status - Status da integração (ok, warn, error)
 * @returns {string} - Nível de saúde (success, warning, danger, neutral)
 */
export function calcularSaudeIntegracao(status) {
  if (!status) return "neutral";
  
  const statusNormalizado = status.toLowerCase();
  
  if (statusNormalizado === "ok" || statusNormalizado === "success") {
    return "success";
  }
  
  if (statusNormalizado === "warn" || statusNormalizado === "warning") {
    return "warning";
  }
  
  if (statusNormalizado === "error" || statusNormalizado === "danger") {
    return "danger";
  }
  
  return "neutral";
}

/**
 * Obtém a variável CSS correspondente ao status
 * @param {string} status - Status da integração
 * @returns {string} - Variável CSS (var(--success), var(--warning), etc)
 */
export function obterCorStatus(status) {
  const saude = calcularSaudeIntegracao(status);
  
  const mapa = {
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--danger)",
    neutral: "var(--neutral-500)"
  };
  
  return mapa[saude] || mapa.neutral;
}

/**
 * Obtém a cor de fundo (light) correspondente ao status
 * @param {string} status - Status da integração
 * @returns {string} - Variável CSS de cor clara
 */
export function obterCorFundoStatus(status) {
  const saude = calcularSaudeIntegracao(status);
  
  const mapa = {
    success: "var(--success-light)",
    warning: "var(--warning-light)",
    danger: "var(--danger-light)",
    neutral: "var(--neutral-100)"
  };
  
  return mapa[saude] || mapa.neutral;
}

/**
 * Obtém o texto descritivo do status
 * @param {string} status - Status da integração
 * @returns {string} - Texto descritivo
 */
export function obterTextoStatus(status) {
  const saude = calcularSaudeIntegracao(status);
  
  const mapa = {
    success: "Normal",
    warning: "Atenção",
    danger: "Erro",
    neutral: "Desconhecido"
  };
  
  return mapa[saude] || mapa.neutral;
}

/**
 * Obtém o ícone correspondente ao status (nome do ícone lucide-react)
 * @param {string} status - Status da integração
 * @returns {string} - Nome do ícone
 */
export function obterIconeStatus(status) {
  const saude = calcularSaudeIntegracao(status);
  
  const mapa = {
    success: "CheckCircle",
    warning: "AlertTriangle",
    danger: "XCircle",
    neutral: "HelpCircle"
  };
  
  return mapa[saude] || mapa.neutral;
}

// ============================================================================
// ANÁLISE DE TRANSIÇÃO DE STATUS
// ============================================================================

/**
 * Detecta se houve mudança de status
 * @param {string} statusAntigo - Status anterior
 * @param {string} statusNovo - Status atual
 * @returns {boolean} - Se houve mudança
 */
export function detectarMudancaStatus(statusAntigo, statusNovo) {
  return calcularSaudeIntegracao(statusAntigo) !== calcularSaudeIntegracao(statusNovo);
}

/**
 * Detecta se houve recuperação (transição de error/warn para ok)
 * @param {string} statusAntigo - Status anterior
 * @param {string} statusNovo - Status atual
 * @returns {boolean} - Se houve recuperação
 */
export function detectarRecuperacao(statusAntigo, statusNovo) {
  const saudeAntiga = calcularSaudeIntegracao(statusAntigo);
  const saudeNova = calcularSaudeIntegracao(statusNovo);
  
  return (saudeAntiga === "danger" || saudeAntiga === "warning") && saudeNova === "success";
}

/**
 * Detecta se houve degradação (transição de ok para warn/error)
 * @param {string} statusAntigo - Status anterior
 * @param {string} statusNovo - Status atual
 * @returns {boolean} - Se houve degradação
 */
export function detectarDegradacao(statusAntigo, statusNovo) {
  const saudeAntiga = calcularSaudeIntegracao(statusAntigo);
  const saudeNova = calcularSaudeIntegracao(statusNovo);
  
  return saudeAntiga === "success" && (saudeNova === "danger" || saudeNova === "warning");
}

/**
 * Calcula a severidade da mudança de status
 * @param {string} statusAntigo - Status anterior
 * @param {string} statusNovo - Status atual
 * @returns {string} - Severidade (critica, alta, media, baixa, nenhuma)
 */
export function calcularSeveridadeMudanca(statusAntigo, statusNovo) {
  const saudeAntiga = calcularSaudeIntegracao(statusAntigo);
  const saudeNova = calcularSaudeIntegracao(statusNovo);
  
  if (saudeAntiga === saudeNova) return "nenhuma";
  
  // De OK para ERROR = crítica
  if (saudeAntiga === "success" && saudeNova === "danger") return "critica";
  
  // De ERROR para OK = alta (recuperação importante)
  if (saudeAntiga === "danger" && saudeNova === "success") return "alta";
  
  // De OK para WARN ou WARN para ERROR = média
  if ((saudeAntiga === "success" && saudeNova === "warning") ||
      (saudeAntiga === "warning" && saudeNova === "danger")) return "media";
  
  // De ERROR para WARN ou WARN para OK = baixa
  if ((saudeAntiga === "danger" && saudeNova === "warning") ||
      (saudeAntiga === "warning" && saudeNova === "success")) return "baixa";
  
  return "baixa";
}

// ============================================================================
// UTILITÁRIOS DE HEALTH CHECK
// ============================================================================

/**
 * Verifica se uma integração está saudável
 * @param {object} integracao - Objeto da integração
 * @returns {boolean} - Se está saudável
 */
export function integracaoSaudavel(integracao) {
  if (!integracao) return false;
  return calcularSaudeIntegracao(integracao.status) === "success";
}

/**
 * Verifica se uma integração precisa atenção
 * @param {object} integracao - Objeto da integração
 * @returns {boolean} - Se precisa atenção
 */
export function integracaoPrecisaAtencao(integracao) {
  if (!integracao) return false;
  const saude = calcularSaudeIntegracao(integracao.status);
  return saude === "warning" || saude === "danger";
}

/**
 * Calcula saúde geral do sistema baseado em múltiplas integrações
 * @param {array} integracoes - Array de integrações
 * @returns {object} - { status, porcentagem, total, ok, warn, error }
 */
export function calcularSaudeGeral(integracoes) {
  if (!integracoes || integracoes.length === 0) {
    return {
      status: "neutral",
      porcentagem: 0,
      total: 0,
      ok: 0,
      warn: 0,
      error: 0
    };
  }
  
  const contadores = {
    success: 0,
    warning: 0,
    danger: 0,
    neutral: 0
  };
  
  integracoes.forEach(integracao => {
    const saude = calcularSaudeIntegracao(integracao.status);
    contadores[saude]++;
  });
  
  const total = integracoes.length;
  const ok = contadores.success;
  const warn = contadores.warning;
  const error = contadores.danger;
  
  // Se tem erro, status geral é danger
  if (error > 0) {
    return {
      status: "danger",
      porcentagem: Math.round((ok / total) * 100),
      total,
      ok,
      warn,
      error
    };
  }
  
  // Se tem warning, status geral é warning
  if (warn > 0) {
    return {
      status: "warning",
      porcentagem: Math.round((ok / total) * 100),
      total,
      ok,
      warn,
      error
    };
  }
  
  // Se tudo ok, status geral é success
  return {
    status: "success",
    porcentagem: 100,
    total,
    ok,
    warn,
    error
  };
}

/**
 * Formata duração de tempo de forma amigável
 * @param {number} ms - Milissegundos
 * @returns {string} - Tempo formatado
 */
export function formatarTempoRecuperacao(ms) {
  const segundos = Math.floor(ms / 1000);
  
  if (segundos < 60) return `${segundos}s`;
  
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `${minutos}min`;
  
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `${horas}h`;
  
  const dias = Math.floor(horas / 24);
  return `${dias}d`;
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  calcularSaudeIntegracao,
  obterCorStatus,
  obterCorFundoStatus,
  obterTextoStatus,
  obterIconeStatus,
  detectarMudancaStatus,
  detectarRecuperacao,
  detectarDegradacao,
  calcularSeveridadeMudanca,
  integracaoSaudavel,
  integracaoPrecisaAtencao,
  calcularSaudeGeral,
  formatarTempoRecuperacao
};
