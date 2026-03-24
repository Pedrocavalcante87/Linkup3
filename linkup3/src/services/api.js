// ─────────────────────────────────────────────
// CLIENTE HTTP CENTRAL — src/services/api.js
//
// Toda comunicação com a API passa por aqui.
// Benefícios:
//  - Token JWT adicionado automaticamente em todas as requisições
//  - Erros 401 redirecionam para login automaticamente
//  - URL base configurável via variável de ambiente
// ─────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ── Helpers ────────────────────────────────────

function getToken() {
  return localStorage.getItem('authToken')
}

function getHeaders(extra = {}) {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra
  }
}

// Trata a resposta HTTP — lança erro se não for 2xx
async function handleResponse(res) {
  if (res.status === 401) {
    // Token expirado ou inválido → força logout
    localStorage.removeItem('authToken')
    localStorage.removeItem('linkup_user')
    window.location.href = '/login'
    throw new Error('Sessão expirada')
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.erro || `Erro ${res.status}`)
  }

  return data
}

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: getHeaders(),
    ...(body ? { body: JSON.stringify(body) } : {})
  })
  return handleResponse(res)
}

// ── Auth ────────────────────────────────────────

export const authAPI = {
  login: (email, senha) => request('POST', '/auth/login', { email, senha }),
  me: () => request('GET', '/auth/me'),
}

// ── Integrações ─────────────────────────────────

export const integracoesAPI = {
  listar: () => request('GET', '/integracoes'),
  buscar: (id) => request('GET', `/integracoes/${id}`),
  criar: (dados) => request('POST', '/integracoes', dados),
  atualizar: (id, dados) => request('PUT', `/integracoes/${id}`, dados),
  remover: (id) => request('DELETE', `/integracoes/${id}`),
}

// ── Tickets ─────────────────────────────────────

export const ticketsAPI = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString()
    return request('GET', `/tickets${params ? '?' + params : ''}`)
  },
  buscar: (id) => request('GET', `/tickets/${id}`),
  criar: (dados) => request('POST', '/tickets', dados),
  atualizar: (id, dados) => request('PUT', `/tickets/${id}`, dados),
  remover: (id) => request('DELETE', `/tickets/${id}`),
}

// ── Financeiro ──────────────────────────────────

export const financeiroAPI = {
  stats: () => request('GET', '/financeiro/stats'),
  faturas: (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString()
    return request('GET', `/financeiro/faturas${params ? '?' + params : ''}`)
  },
  buscarFatura: (id) => request('GET', `/financeiro/faturas/${id}`),
  criarFatura: (dados) => request('POST', '/financeiro/faturas', dados),
  atualizarFatura: (id, dados) => request('PUT', `/financeiro/faturas/${id}`, dados),
}

// ── Logs ────────────────────────────────────────

export const logsAPI = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString()
    return request('GET', `/logs${params ? '?' + params : ''}`)
  },
  criar: (dados) => request('POST', '/logs', dados),
}

// ── Notificações ────────────────────────────────

export const notificacoesAPI = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString()
    return request('GET', `/notificacoes${params ? '?' + params : ''}`)
  },
  marcarLida: (id) => request('PUT', `/notificacoes/${id}/lida`),
  marcarTodas: () => request('PUT', '/notificacoes/marcar-todas'),
  remover: (id) => request('DELETE', `/notificacoes/${id}`),
}

// ── Operacional ─────────────────────────────────

export const operacionalAPI = {
  stats: () => request('GET', '/operacional/stats'),
  registros: (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString()
    return request('GET', `/operacional/registros${params ? '?' + params : ''}`)
  },
  buscar: (id) => request('GET', `/operacional/registros/${id}`),
  criar: (dados) => request('POST', '/operacional/registros', dados),
  atualizar: (id, dados) => request('PUT', `/operacional/registros/${id}`, dados),
}

// ── Automações ──────────────────────────────────

export const automacoesAPI = {
  listar: () => request('GET', '/automacoes'),
  buscar: (id) => request('GET', `/automacoes/${id}`),
  criar: (dados) => request('POST', '/automacoes', dados),
  atualizar: (id, dados) => request('PUT', `/automacoes/${id}`, dados),
  remover: (id) => request('DELETE', `/automacoes/${id}`),
  executar: (id) => request('POST', `/automacoes/${id}/executar`),
}
