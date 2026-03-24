// ============================================================================
// FAKE DATA - SISTEMA ERP LINKUP³
// Dados relacionados e coerentes para simular um banco de dados completo
// ============================================================================

// ============================================================================
// MODELOS DE DADOS - SISTEMA ERP LINKUP³
// ============================================================================

// Modelo: Empresa
const EmpresaModelo = {
  id: '',
  nome: '',
  cnpj: '',
  unidade: '',
  plano: '',
  ativo: true,
  logs_ids: [],
  tickets_ids: [],
  notificacoes_ids: [],
  registros_ids: []
};

// Modelo: Usuario
const UsuarioModelo = {
  id: '',
  nome: '',
  email: '',
  cargo: '',
  empresa_id: '',
  avatar: '',
  ultimo_acesso: '',
  ativo: true,
  logs_ids: [],
  tickets_ids: [],
  notificacoes_ids: []
};

// Modelo: Registro
const RegistroModelo = {
  id: '',
  tipo: '',
  descricao: '',
  usuario_id: '',
  empresa_id: '',
  data: '',
  inconsistencia: false,
  detalhes: {},
  relacionado_fatura_id: null,
  valor: 0,
  logs_ids: [],
  tickets_ids: [],
  notificacoes_ids: []
};

// Modelo: Fatura
const FaturaModelo = {
  id: '',
  numero: '',
  empresa_id: '',
  registros_ids: [],
  valor: 0,
  vencimento: '',
  emissao: '',
  status: '',
  descricao: '',
  pago_em: null,
  metodo_pagamento: null,
  logs_ids: [],
  tickets_ids: [],
  notificacoes_ids: []
};

// Modelo: Integracao
const IntegracaoModelo = {
  id: '',
  nome: '',
  tipo: '',
  status: '',
  uptime: 0,
  ultima_sync: '',
  proxima_sync: null,
  total_syncs: 0,
  success_rate: 0,
  endpoint: '',
  ativo: true,
  logs_ids: [],
  tickets_ids: [],
  notificacoes_ids: []
};

// Modelo: LogSistema
const LogSistemaModelo = {
  id: '',
  timestamp: '',
  nivel: '',
  mensagem: '',
  modulo: '',
  origem_tipo: '',
  origem_id: '',
  usuario_id: '',
  detalhes: {},
  logs_ids: [],
  tickets_ids: [],
  notificacoes_ids: []
};

// Modelo: Notificacao
const NotificacaoModelo = {
  id: '',
  titulo: '',
  descricao: '',
  tipo: '',
  categoria: '',
  origem_modulo: '',
  origem_tipo: '',
  origem_id: '',
  read: false,
  criado_em: '',
  usuario_id: '',
  link: '',
  logs_ids: [],
  tickets_ids: [],
  notificacoes_ids: []
};

// Modelo: Ticket
const TicketModelo = {
  id: '',
  numero: '',
  assunto: '',
  descricao: '',
  prioridade: '',
  status: '',
  criado_por: '',
  atribuido_para: '',
  origem_modulo: '',
  origem_tipo: '',
  origem_id: '',
  empresa_id: '',
  criado_em: '',
  atualizado_em: '',
  resolvido_em: null,
  relacionado: {
    registro: null,
    fatura: null,
    integracao: null,
    log: null,
    notificacao: null
  },
  logs_ids: [],
  tickets_ids: [],
  notificacoes_ids: []
};

// ============================================================================
// 1. EMPRESAS (Clientes do sistema)
// ============================================================================
export const empresas = [
  {
    id: 'emp-001',
    nome: 'Hub Plural',
    cnpj: '12.345.678/0001-90',
    unidade: 'Recife - PE',
    plano: 'enterprise',
    ativo: true
  },
  {
    id: 'emp-002',
    nome: 'Coworking Santos',
    cnpj: '98.765.432/0001-10',
    unidade: 'Santos - SP',
    plano: 'professional',
    ativo: true
  },
  {
    id: 'emp-003',
    nome: 'Space Connect',
    cnpj: '45.678.901/0001-23',
    unidade: 'Brasília - DF',
    plano: 'basic',
    ativo: true
  },
  {
    id: 'emp-004',
    nome: 'Work Station BH',
    cnpj: '78.901.234/0001-56',
    unidade: 'Belo Horizonte - MG',
    plano: 'professional',
    ativo: false
  }
];

// ============================================================================
// 2. USUÁRIOS (Colaboradores e admins)
// ============================================================================
export const usuarios = [
  {
    id: 'usr-001',
    nome: 'Pedro Cavalcante',
    email: 'pedro@linkup.com',
    cargo: 'Administrador',
    empresa_id: 'emp-001',
    avatar: 'P',
    ultimo_acesso: '2025-12-04T10:30:00Z',
    ativo: true
  },
  {
    id: 'usr-002',
    nome: 'Ana Silva',
    email: 'ana.silva@hubplural.com',
    cargo: 'Gerente Operacional',
    empresa_id: 'emp-001',
    avatar: 'A',
    ultimo_acesso: '2025-12-04T09:15:00Z',
    ativo: true
  },
  {
    id: 'usr-003',
    nome: 'Carlos Mendes',
    email: 'carlos@coworkingsantos.com',
    cargo: 'Financeiro',
    empresa_id: 'emp-002',
    avatar: 'C',
    ultimo_acesso: '2025-12-03T16:45:00Z',
    ativo: true
  },
  {
    id: 'usr-004',
    nome: 'Mariana Costa',
    email: 'mariana@spaceconnect.com',
    cargo: 'Recepcionista',
    empresa_id: 'emp-003',
    avatar: 'M',
    ultimo_acesso: '2025-12-04T08:00:00Z',
    ativo: true
  },
  {
    id: 'usr-005',
    nome: 'Roberto Lima',
    email: 'roberto@linkup.com',
    cargo: 'Suporte Técnico',
    empresa_id: 'emp-001',
    avatar: 'R',
    ultimo_acesso: '2025-12-04T11:20:00Z',
    ativo: true
  },
  {
    id: 'sistema',
    nome: 'Sistema',
    email: 'system@linkup.com',
    cargo: 'Automação',
    empresa_id: null,
    avatar: 'S',
    ultimo_acesso: '2025-12-04T11:30:00Z',
    ativo: true
  }
];

// ============================================================================
// 3. REGISTROS OPERACIONAIS (Check-ins, Reservas, Lançamentos)
// ============================================================================
export const registros = [
  {
    id: 'reg-001',
    tipo: 'Check-in',
    descricao: 'Check-in sala de reunião',
    usuario_id: 'usr-002',
    empresa_id: 'emp-001',
    data: '2025-12-04T09:00:00Z',
    inconsistencia: false,
    detalhes: { sala: 'Sala 3A', periodo: 'Manhã' },
    relacionado_fatura_id: 'fat-001',
    valor: 150.00
  },
  {
    id: 'reg-002',
    tipo: 'Reserva',
    descricao: 'Reserva estação de trabalho',
    usuario_id: 'usr-004',
    empresa_id: 'emp-003',
    data: '2025-12-03T14:30:00Z',
    inconsistencia: true,
    detalhes: { estacao: 'Desk 12', periodo: 'Dia inteiro', problema: 'Pagamento não localizado' },
    relacionado_fatura_id: null,
    valor: 80.00
  },
  {
    id: 'reg-003',
    tipo: 'Lançamento',
    descricao: 'Cobrança mensalidade',
    usuario_id: 'usr-003',
    empresa_id: 'emp-002',
    data: '2025-12-01T10:00:00Z',
    inconsistencia: false,
    detalhes: { referencia: 'Novembro/2025' },
    relacionado_fatura_id: 'fat-002',
    valor: 1200.00
  },
  {
    id: 'reg-004',
    tipo: 'Check-in',
    descricao: 'Check-in sala conferência',
    usuario_id: 'usr-002',
    empresa_id: 'emp-001',
    data: '2025-12-02T15:00:00Z',
    inconsistencia: false,
    detalhes: { sala: 'Sala Executiva', periodo: 'Tarde' },
    relacionado_fatura_id: 'fat-003',
    valor: 250.00
  },
  {
    id: 'reg-005',
    tipo: 'Reserva',
    descricao: 'Reserva auditório',
    usuario_id: 'usr-004',
    empresa_id: 'emp-003',
    data: '2025-11-28T11:00:00Z',
    inconsistencia: true,
    detalhes: { auditorio: 'Principal', capacidade: 50, problema: 'Duplicidade de reserva' },
    relacionado_fatura_id: null,
    valor: 500.00
  },
  {
    id: 'reg-006',
    tipo: 'Lançamento',
    descricao: 'Serviço adicional - café',
    usuario_id: 'usr-002',
    empresa_id: 'emp-001',
    data: '2025-12-04T08:30:00Z',
    inconsistencia: false,
    detalhes: { tipo: 'Coffee break', pessoas: 15 },
    relacionado_fatura_id: 'fat-001',
    valor: 45.00
  },
  {
    id: 'reg-007',
    tipo: 'Check-in',
    descricao: 'Check-in sala pequena',
    usuario_id: 'usr-003',
    empresa_id: 'emp-002',
    data: '2025-11-30T13:00:00Z',
    inconsistencia: false,
    detalhes: { sala: 'Sala 1B', periodo: 'Tarde' },
    relacionado_fatura_id: 'fat-002',
    valor: 100.00
  }
];

// ============================================================================
// 4. FATURAS (Módulo Financeiro)
// ============================================================================
export const faturas = [
  {
    id: 'fat-001',
    numero: 'FAT-1001',
    empresa_id: 'emp-001',
    registros_ids: ['reg-001', 'reg-006'],
    valor: 195.00,
    vencimento: '2025-12-05',
    emissao: '2025-12-01',
    status: 'overdue',
    descricao: 'Serviços Dezembro/2025',
    pago_em: null,
    metodo_pagamento: null
  },
  {
    id: 'fat-002',
    numero: 'FAT-1002',
    empresa_id: 'emp-002',
    registros_ids: ['reg-003', 'reg-007'],
    valor: 1300.00,
    vencimento: '2025-12-12',
    emissao: '2025-11-28',
    status: 'open',
    descricao: 'Mensalidade Novembro/2025',
    pago_em: null,
    metodo_pagamento: null
  },
  {
    id: 'fat-003',
    numero: 'FAT-1003',
    empresa_id: 'emp-001',
    registros_ids: ['reg-004'],
    valor: 250.00,
    vencimento: '2025-12-20',
    emissao: '2025-12-02',
    status: 'paid',
    descricao: 'Reserva sala executiva',
    pago_em: '2025-12-03T10:30:00Z',
    metodo_pagamento: 'Pix'
  },
  {
    id: 'fat-004',
    numero: 'FAT-1004',
    empresa_id: 'emp-003',
    registros_ids: [],
    valor: 80.00,
    vencimento: '2024 -01-10',
    emissao: '2025-12-03',
    status: 'overdue',
    descricao: 'Pendente - Reserva sem confirmação',
    pago_em: null,
    metodo_pagamento: null
  },
  {
    id: 'fat-005',
    numero: 'FAT-1005',
    empresa_id: 'emp-001',
    registros_ids: [],
    valor: 1500.00,
    vencimento: '2025-11-28',
    emissao: '2025-11-15',
    status: 'overdue',
    descricao: 'Mensalidade Outubro/2025',
    pago_em: null,
    metodo_pagamento: null
  },
  {
    id: 'fat-006',
    numero: 'FAT-1006',
    empresa_id: 'emp-002',
    registros_ids: [],
    valor: 600.00,
    vencimento: '2025-12-15',
    emissao: '2025-12-01',
    status: 'paid',
    descricao: 'Serviços adicionais',
    pago_em: '2025-12-02T14:15:00Z',
    metodo_pagamento: 'Boleto'
  }
];

// ============================================================================
// 5. INTEGRAÇÕES (APIs externas)
// ============================================================================
export const integracoes = [
  {
    id: 'int-001',
    nome: 'Kommo',
    tipo: 'CRM',
    status: 'ok',
    uptime: 99.8,
    ultima_sync: '2025-12-04T10:30:00Z',
    proxima_sync: '2025-12-04T11:30:00Z',
    total_syncs: 1245,
    success_rate: 98.5,
    endpoint: 'https://api.kommo.com/v4',
    ativo: true
  },
  {
    id: 'int-002',
    nome: 'OfficeRnD',
    tipo: 'Coworking Management',
    status: 'warning',
    uptime: 95.2,
    ultima_sync: '2025-12-02T08:00:00Z',
    proxima_sync: '2025-12-04T12:00:00Z',
    total_syncs: 856,
    success_rate: 94.1,
    endpoint: 'https://api.officernd.com/v1',
    ativo: true
  },
  {
    id: 'int-003',
    nome: 'Lovable',
    tipo: 'Automação',
    status: 'error',
    uptime: 78.3,
    ultima_sync: '2025-11-30T15:20:00Z',
    proxima_sync: null,
    total_syncs: 423,
    success_rate: 76.8,
    endpoint: 'https://api.lovable.dev/v2',
    ativo: false
  },
  {
    id: 'int-004',
    nome: 'Bling',
    tipo: 'ERP Financeiro',
    status: 'ok',
    uptime: 99.1,
    ultima_sync: '2025-12-04T09:45:00Z',
    proxima_sync: '2025-12-04T10:45:00Z',
    total_syncs: 2103,
    success_rate: 99.2,
    endpoint: 'https://bling.com.br/Api/v3',
    ativo: true
  },
  {
    id: 'int-005',
    nome: 'Omie',
    tipo: 'ERP Completo',
    status: 'ok',
    uptime: 98.7,
    ultima_sync: '2025-12-04T10:00:00Z',
    proxima_sync: '2025-12-04T11:00:00Z',
    total_syncs: 1789,
    success_rate: 97.9,
    endpoint: 'https://app.omie.com.br/api/v1',
    ativo: true
  }
];

// ============================================================================
// 6. LOGS (Auditoria completa do sistema)
// ============================================================================
export const logsCompletos = [
  {
    id: 'log-001',
    timestamp: '2025-12-04T11:32:00Z',
    nivel: 'OK',
    mensagem: 'Sincronização Kommo concluída com sucesso',
    modulo: 'integração',
    origem_tipo: 'integracao',
    origem_id: 'int-001',
    usuario_id: 'sistema',
    detalhes: { registros_sincronizados: 124, tempo_execucao: '2.3s' }
  },
  {
    id: 'log-002',
    timestamp: '2025-12-04T10:02:00Z',
    nivel: 'WARN',
    mensagem: 'Duplicidade detectada em reserva',
    modulo: 'operacional',
    origem_tipo: 'registro',
    origem_id: 'reg-005',
    usuario_id: 'usr-004',
    detalhes: { conflito: 'Horário já reservado', acao: 'Bloqueada' }
  },
  {
    id: 'log-003',
    timestamp: '2025-12-04T09:10:00Z',
    nivel: 'ERROR',
    mensagem: 'Falha na conexão com Lovable API',
    modulo: 'integração',
    origem_tipo: 'integracao',
    origem_id: 'int-003',
    usuario_id: 'sistema',
    detalhes: { erro: 'Connection timeout', tentativas: 3, ultima_tentativa: '2025-11-30T15:20:00Z' }
  },
  {
    id: 'log-004',
    timestamp: '2025-12-04T08:45:00Z',
    nivel: 'OK',
    mensagem: 'Fatura FAT-1003 marcada como paga',
    modulo: 'financeiro',
    origem_tipo: 'fatura',
    origem_id: 'fat-003',
    usuario_id: 'usr-003',
    detalhes: { metodo: 'Pix', valor: 250.00 }
  },
  {
    id: 'log-005',
    timestamp: '2025-12-04T07:20:00Z',
    nivel: 'WARN',
    mensagem: 'Fatura FAT-1001 vencida',
    modulo: 'financeiro',
    origem_tipo: 'fatura',
    origem_id: 'fat-001',
    usuario_id: 'sistema',
    detalhes: { dias_atraso: 1, valor: 195.00 }
  },
  {
    id: 'log-006',
    timestamp: '2025-12-04T06:15:00Z',
    nivel: 'OK',
    mensagem: 'Check-in registrado com sucesso',
    modulo: 'operacional',
    origem_tipo: 'registro',
    origem_id: 'reg-001',
    usuario_id: 'usr-002',
    detalhes: { sala: 'Sala 3A', periodo: 'Manhã' }
  },
  {
    id: 'log-007',
    timestamp: '2025-12-03T16:30:00Z',
    nivel: 'WARN',
    mensagem: 'OfficeRnD sem sincronização há 48h',
    modulo: 'integração',
    origem_tipo: 'integracao',
    origem_id: 'int-002',
    usuario_id: 'sistema',
    detalhes: { ultima_sync: '2025-12-02T08:00:00Z', status: 'warning' }
  },
  {
    id: 'log-008',
    timestamp: '2025-12-03T14:45:00Z',
    nivel: 'ERROR',
    mensagem: 'Inconsistência detectada - pagamento não localizado',
    modulo: 'operacional',
    origem_tipo: 'registro',
    origem_id: 'reg-002',
    usuario_id: 'usr-004',
    detalhes: { tipo: 'reserva', valor_esperado: 80.00, fatura: 'não encontrada' }
  },
  {
    id: 'log-009',
    timestamp: '2025-12-02T10:30:00Z',
    nivel: 'OK',
    mensagem: 'Ticket TKT-003 resolvido',
    modulo: 'suporte',
    origem_tipo: 'ticket',
    origem_id: 'tkt-003',
    usuario_id: 'usr-005',
    detalhes: { tempo_resolucao: '4h 30min', satisfacao: 'alta' }
  },
  {
    id: 'log-010',
    timestamp: '2025-12-01T09:00:00Z',
    nivel: 'OK',
    mensagem: 'Fatura FAT-1002 gerada automaticamente',
    modulo: 'financeiro',
    origem_tipo: 'fatura',
    origem_id: 'fat-002',
    usuario_id: 'sistema',
    detalhes: { registros_incluidos: 2, valor_total: 1300.00 }
  }
];

// ============================================================================
// 7. NOTIFICAÇÕES (Central de alertas)
// ============================================================================
export const notificacoesCompletas = [
  {
    id: 'not-001',
    titulo: 'Fatura FAT-1001 vencida',
    descricao: 'Fatura de R$ 195,00 está atrasada há 1 dia',
    tipo: 'error',
    categoria: 'financeiro',
    origem_modulo: 'financeiro',
    origem_tipo: 'fatura',
    origem_id: 'fat-001',
    read: false,
    criado_em: '2025-12-04T07:20:00Z',
    usuario_id: 'usr-001'
  },
  {
    id: 'not-002',
    titulo: 'Sincronização Kommo concluída',
    descricao: '124 registros sincronizados com sucesso',
    tipo: 'success',
    categoria: 'integração',
    origem_modulo: 'integração',
    origem_tipo: 'integracao',
    origem_id: 'int-001',
    read: false,
    criado_em: '2025-12-04T11:32:00Z',
    usuario_id: 'usr-001'
  },
  {
    id: 'not-003',
    titulo: 'Inconsistência detectada',
    descricao: 'Reserva reg-002 possui inconsistência - pagamento não localizado',
    tipo: 'warning',
    categoria: 'operacional',
    origem_modulo: 'operacional',
    origem_tipo: 'registro',
    origem_id: 'reg-002',
    read: false,
    criado_em: '2025-12-03T14:45:00Z',
    usuario_id: 'usr-001'
  },
  {
    id: 'not-004',
    titulo: 'OfficeRnD sem sincronização',
    descricao: 'Última sincronização há 2 dias - verificar conexão',
    tipo: 'warning',
    categoria: 'integração',
    origem_modulo: 'integração',
    origem_tipo: 'integracao',
    origem_id: 'int-002',
    read: true,
    criado_em: '2025-12-03T16:30:00Z',
    usuario_id: 'usr-001'
  },
  {
    id: 'not-005',
    titulo: 'Falha na integração Lovable',
    descricao: 'Erro de conexão - verificar credenciais e endpoint',
    tipo: 'error',
    categoria: 'integração',
    origem_modulo: 'integração',
    origem_tipo: 'integracao',
    origem_id: 'int-003',
    read: true,
    criado_em: '2025-12-04T09:10:00Z',
    usuario_id: 'usr-001'
  },
  {
    id: 'not-006',
    titulo: 'Pagamento recebido',
    descricao: 'Fatura FAT-1003 de R$ 250,00 foi paga via Pix',
    tipo: 'success',
    categoria: 'financeiro',
    origem_modulo: 'financeiro',
    origem_tipo: 'fatura',
    origem_id: 'fat-003',
    read: true,
    criado_em: '2025-12-04T08:45:00Z',
    usuario_id: 'usr-001'
  },
  {
    id: 'not-007',
    titulo: 'Novo ticket aberto',
    descricao: 'TKT-001 - Erro na sincronização Kommo (prioridade alta)',
    tipo: 'info',
    categoria: 'suporte',
    origem_modulo: 'suporte',
    origem_tipo: 'ticket',
    origem_id: 'tkt-001',
    read: false,
    criado_em: '2025-12-01T14:00:00Z',
    usuario_id: 'usr-005'
  },
  {
    id: 'not-008',
    titulo: 'Duplicidade em reserva',
    descricao: 'Auditório já reservado para o horário solicitado (reg-005)',
    tipo: 'warning',
    categoria: 'operacional',
    origem_modulo: 'operacional',
    origem_tipo: 'registro',
    origem_id: 'reg-005',
    read: true,
    criado_em: '2025-11-28T11:05:00Z',
    usuario_id: 'usr-004'
  }
];

// ============================================================================
// 8. TICKETS (Sistema de suporte)
// ============================================================================
export const ticketsCompletos = [
  {
    id: 'tkt-001',
    numero: 'TKT-001',
    assunto: 'Erro na sincronização Kommo',
    descricao: 'Sincronização retornando timeout intermitente nas últimas 3 tentativas',
    prioridade: 'alta',
    status: 'em andamento',
    criado_por: 'usr-002',
    atribuido_para: 'usr-005',
    origem_modulo: 'integração',
    origem_tipo: 'integracao',
    origem_id: 'int-001',
    empresa_id: 'emp-001',
    criado_em: '2025-12-01T14:00:00Z',
    atualizado_em: '2025-12-04T10:30:00Z',
    resolvido_em: null
  },
  {
    id: 'tkt-002',
    numero: 'TKT-002',
    assunto: 'Dúvida sobre relatório financeiro',
    descricao: 'Como exportar relatório de faturas vencidas do último trimestre?',
    prioridade: 'média',
    status: 'aberto',
    criado_por: 'usr-003',
    atribuido_para: 'usr-001',
    origem_modulo: 'financeiro',
    origem_tipo: 'fatura',
    origem_id: 'fat-001',
    empresa_id: 'emp-002',
    criado_em: '2025-12-03T09:30:00Z',
    atualizado_em: '2025-12-03T09:30:00Z',
    resolvido_em: null
  },
  {
    id: 'tkt-003',
    numero: 'TKT-003',
    assunto: 'Solicitar nova integração - Slack',
    descricao: 'Gostaria de receber notificações do sistema via Slack',
    prioridade: 'baixa',
    status: 'resolvido',
    criado_por: 'usr-002',
    atribuido_para: 'usr-005',
    origem_modulo: 'integração',
    origem_tipo: null,
    origem_id: null,
    empresa_id: 'emp-001',
    criado_em: '2025-11-28T10:00:00Z',
    atualizado_em: '2025-12-02T10:30:00Z',
    resolvido_em: '2025-12-02T10:30:00Z'
  },
  {
    id: 'tkt-004',
    numero: 'TKT-004',
    assunto: 'Bug na exportação de dados',
    descricao: 'Ao exportar registros em CSV, campos de data aparecem vazios',
    prioridade: 'alta',
    status: 'resolvido',
    criado_por: 'usr-004',
    atribuido_para: 'usr-005',
    origem_modulo: 'operacional',
    origem_tipo: 'registro',
    origem_id: 'reg-003',
    empresa_id: 'emp-003',
    criado_em: '2025-11-25T13:20:00Z',
    atualizado_em: '2025-11-27T16:45:00Z',
    resolvido_em: '2025-11-27T16:45:00Z'
  },
  {
    id: 'tkt-005',
    numero: 'TKT-005',
    assunto: 'Lovable API desconectada',
    descricao: 'Integração com Lovable apresentando erro de autenticação desde 30/11',
    prioridade: 'alta',
    status: 'aberto',
    criado_por: 'sistema',
    atribuido_para: 'usr-005',
    origem_modulo: 'integração',
    origem_tipo: 'integracao',
    origem_id: 'int-003',
    empresa_id: 'emp-001',
    criado_em: '2025-12-04T09:10:00Z',
    atualizado_em: '2025-12-04T09:10:00Z',
    resolvido_em: null
  },
  {
    id: 'tkt-006',
    numero: 'TKT-006',
    assunto: 'Inconsistência em reserva de auditório',
    descricao: 'Reserva reg-005 sem fatura vinculada - necessário correção manual',
    prioridade: 'média',
    status: 'em andamento',
    criado_por: 'usr-004',
    atribuido_para: 'usr-002',
    origem_modulo: 'operacional',
    origem_tipo: 'registro',
    origem_id: 'reg-005',
    empresa_id: 'emp-003',
    criado_em: '2025-11-28T11:05:00Z',
    atualizado_em: '2025-12-03T15:20:00Z',
    resolvido_em: null
  },
  {
    id: 'tkt-007',
    numero: 'TKT-007',
    assunto: 'Pagamento não identificado',
    descricao: 'Cliente efetuou Pix mas sistema não localizou fatura automaticamente',
    prioridade: 'alta',
    status: 'aberto',
    criado_por: 'usr-003',
    atribuido_para: 'usr-001',
    origem_modulo: 'financeiro',
    origem_tipo: 'fatura',
    origem_id: 'fat-004',
    empresa_id: 'emp-002',
    criado_em: '2025-12-04T08:00:00Z',
    atualizado_em: '2025-12-04T08:00:00Z',
    resolvido_em: null
  }
];

// ============================================================================
// 9. DADOS AUXILIARES (Gráficos e Dashboard)
// ============================================================================

// Dados para gráfico de linha (evolução mensal)
export const lineData = [
  { month: 'Jul', value: 820 },
  { month: 'Ago', value: 1150 },
  { month: 'Set', value: 1420 },
  { month: 'Out', value: 1680 },
  { month: 'Nov', value: 2100 },
  { month: 'Dez', value: 2380 }
];

// Dados para gráfico de barras (produtividade por unidade)
export const barData = [
  { name: 'Hub Plural', value: 1450 },
  { name: 'Coworking Santos', value: 980 },
  { name: 'Space Connect', value: 680 },
  { name: 'Work Station BH', value: 320 }
];

// Sincronizações recentes (para tabela do Dashboard)
export const syncRows = [
  { id: 1, user: 'Pedro Cavalcante', system: 'Kommo', action: 'Sincronização automática', status: 'success' },
  { id: 2, user: 'Ana Silva', system: 'OfficeRnD', action: 'Importação de reservas', status: 'success' },
  { id: 3, user: 'Carlos Mendes', system: 'Bling', action: 'Conciliação financeira', status: 'warning' },
  { id: 4, user: 'Sistema', system: 'Lovable', action: 'Tentativa de conexão', status: 'error' },
  { id: 5, user: 'Mariana Costa', system: 'Omie', action: 'Exportação de faturas', status: 'success' },
  { id: 6, user: 'Sistema', system: 'Kommo', action: 'Sincronização de contatos', status: 'success' },
  { id: 7, user: 'Roberto Lima', system: 'OfficeRnD', action: 'Atualização de dados', status: 'warning' }
];

// ============================================================================
// HELPERS - Calcular tempo relativo (ex: "há 2h", "ontem", "há 3 dias")
// ============================================================================
function calcularTempoRelativo(timestamp) {
  const agora = new Date('2025-12-04T11:30:00Z');
  const data = new Date(timestamp);
  const diffMs = agora - data;
  const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHoras < 1) return 'agora';
  if (diffHoras < 24) return `há ${diffHoras}h`;
  if (diffDias === 1) return 'ontem';
  if (diffDias < 7) return `há ${diffDias} dias`;
  return data.toLocaleDateString('pt-BR');
}

// ============================================================================
// EXPORTS PARA COMPATIBILIDADE COM PÁGINAS EXISTENTES
// ============================================================================

// Faturas (versão simplificada para compatibilidade com página Financeiro)
export const invoices = faturas.map(f => ({
  id: f.numero,
  due: f.vencimento.split('-').reverse().join('/'),
  amount: `R$ ${f.valor.toFixed(2).replace('.', ',')}`,
  status: f.status,
  client: empresas.find(e => e.id === f.empresa_id)?.nome || 'N/A'
}));

// Operações (versão simplificada para compatibilidade com página Operacional)
export const operations = registros.map(r => ({
  id: r.id,
  type: r.tipo,
  user: usuarios.find(u => u.id === r.usuario_id)?.nome || 'N/A',
  inconsistency: r.inconsistencia
}));

// Integrações (versão simplificada para compatibilidade)
export const integrations = integracoes.map(i => ({
  name: i.nome,
  status: i.status,
  last: i.ultima_sync.split('T')[0].split('-').reverse().join('/')
}));

// Logs (versão simplificada para compatibilidade com página Logs)
export const logs = logsCompletos.map(l => ({
  time: new Date(l.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  level: l.nivel,
  message: l.mensagem,
  module: l.modulo
}));

// Notifications (versão simplificada para compatibilidade)
export const notifications = notificacoesCompletas.map(n => ({
  id: parseInt(n.id.split('-')[1]),
  title: n.titulo,
  time: calcularTempoRelativo(n.criado_em),
  category: n.categoria,
  status: n.tipo,
  description: n.descricao,
  read: n.read
}));

// Tickets (versão simplificada para compatibilidade)
export const tickets = ticketsCompletos.map(t => ({
  id: t.numero,
  subject: t.assunto,
  client: empresas.find(e => e.id === t.empresa_id)?.nome || 'N/A',
  priority: t.prioridade,
  status: t.status,
  updated: calcularTempoRelativo(t.atualizado_em)
}));

// Usuário atual (para Profile)
export const currentUser = {
  name: usuarios[0].nome,
  email: usuarios[0].email,
  role: usuarios[0].cargo,
  avatar: usuarios[0].avatar,
  preferences: {
    notifications: true,
    advancedMetrics: true
  }
};

// ============================================================================
// INICIALIZAÇÃO DO LOCALSTORAGE - FASE RECOVERY
// ============================================================================

/**
 * Inicializa localStorage com dados fake se não existirem
 * Usado para testes do sistema de recovery
 */
export function inicializarLocalStorage() {
  try {
    // Verificar se já foi inicializado
    const jaInicializado = localStorage.getItem('linkup_initialized_v1');

    if (!jaInicializado) {
      // Integrações
      localStorage.setItem('linkup_integracoes_v1', JSON.stringify(integracoes));

      // Logs
      localStorage.setItem('linkup_logs_v1', JSON.stringify(logsCompletos.slice(0, 100)));

      // Faturas
      localStorage.setItem('linkup_faturas_v1', JSON.stringify(faturas));

      // Tickets
      localStorage.setItem('linkup_tickets_v1', JSON.stringify(ticketsCompletos));

      // Notificações
      localStorage.setItem('linkup_notificacoes_v1', JSON.stringify(notificacoesCompletas));

      // Marcar como inicializado
      localStorage.setItem('linkup_initialized_v1', 'true');
      localStorage.setItem('linkup_initialized_at', new Date().toISOString());

    }
  } catch (e) {
    console.error('❌ Erro ao inicializar localStorage:', e);
  }
}

/**
 * Resetar localStorage para estado inicial
 */
export function resetarLocalStorage() {
  localStorage.removeItem('linkup_initialized_v1');
  localStorage.removeItem('linkup_integracoes_v1');
  localStorage.removeItem('linkup_logs_v1');
  localStorage.removeItem('linkup_faturas_v1');
  localStorage.removeItem('linkup_tickets_v1');
  localStorage.removeItem('linkup_notificacoes_v1');
  localStorage.removeItem('linkup_telemetry_v1');
  localStorage.removeItem('linkup_automations_v1');
  localStorage.removeItem('linkup_ai_cache_v1');
  localStorage.removeItem('linkup_initialized_at');
}

// Expor funções globalmente para facilitar testes
if (typeof window !== 'undefined') {
  window.inicializarLocalStorage = inicializarLocalStorage;
  window.resetarLocalStorage = resetarLocalStorage;
}

// Auto-inicializar ao carregar
inicializarLocalStorage();
