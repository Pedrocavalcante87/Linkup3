// ─────────────────────────────────────────────
// DOCUMENTAÇÃO OpenAPI 3.0 — LINKUP³ API
//
// Este arquivo descreve todos os endpoints da API.
// Ao iniciar o servidor, acesse: http://localhost:3001/docs
//
// Como funciona:
//  - "components.schemas" define os tipos de dados reutilizáveis
//  - "paths" define cada endpoint com seus parâmetros e respostas
//  - "securitySchemes" configura o modelo de autenticação JWT
// ─────────────────────────────────────────────

const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LinkUp³ API',
      version: '1.0.0',
      description: `
## API de Monitoramento de Integrações Empresariais

**Autenticação:** Bearer Token (JWT)

Para utilizar os endpoints protegidos:
1. Faça \`POST /auth/login\` com suas credenciais
2. Copie o \`token\` da resposta
3. Clique no botão **Authorize 🔒** acima e cole: \`Bearer <seu_token>\`

**Credenciais de teste:**
| Email | Senha | Role |
|---|---|---|
| admin@linkup3.com | linkup3@2026 | admin |
| analista@linkup3.com | linkup3@2026 | analyst |
| usuario@linkup3.com | linkup3@2026 | user |
      `,
      contact: {
        name: 'LinkUp³ Dev',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido em POST /auth/login',
        },
      },
      schemas: {
        // ── Erros ──────────────────────────────
        Erro: {
          type: 'object',
          properties: {
            erro: { type: 'string', example: 'Mensagem de erro descritiva' },
          },
        },
        // ── Auth ───────────────────────────────
        Usuario: {
          type: 'object',
          properties: {
            id:    { type: 'string', example: 'cmmv1eqfw0001z9v59xiztuof' },
            nome:  { type: 'string', example: 'Admin LinkUp3' },
            email: { type: 'string', example: 'admin@linkup3.com' },
            role:  { type: 'string', enum: ['admin', 'analyst', 'user'] },
          },
        },
        LoginBody: {
          type: 'object',
          required: ['email', 'senha'],
          properties: {
            email: { type: 'string', example: 'admin@linkup3.com' },
            senha: { type: 'string', example: 'linkup3@2026' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token:   { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5c...' },
            usuario: { $ref: '#/components/schemas/Usuario' },
          },
        },
        RegisterBody: {
          type: 'object',
          required: ['email', 'nome', 'senha'],
          properties: {
            email: { type: 'string', example: 'novo@linkup3.com' },
            nome:  { type: 'string', example: 'Novo Usuário' },
            senha: { type: 'string', example: 'senha_segura_123' },
            role:  { type: 'string', enum: ['admin', 'analyst', 'user'], default: 'user' },
          },
        },
        // ── Integração ─────────────────────────
        Integracao: {
          type: 'object',
          properties: {
            id:          { type: 'string' },
            nome:        { type: 'string', example: 'API Pagamentos' },
            descricao:   { type: 'string', example: 'Integração com gateway de pagamentos' },
            origem:      { type: 'string', example: 'stripe' },
            status:      { type: 'string', enum: ['ok', 'warn', 'error'] },
            uptime:      { type: 'number', example: 99.8 },
            taxaSucesso: { type: 'number', example: 98.5 },
            createdAt:   { type: 'string', format: 'date-time' },
          },
        },
        IntegracaoBody: {
          type: 'object',
          required: ['nome'],
          properties: {
            nome:      { type: 'string', example: 'Nova Integração' },
            descricao: { type: 'string' },
            origem:    { type: 'string' },
            status:    { type: 'string', enum: ['ok', 'warn', 'error'], default: 'ok' },
          },
        },
        // ── Ticket ─────────────────────────────
        Ticket: {
          type: 'object',
          properties: {
            id:           { type: 'string' },
            titulo:       { type: 'string', example: 'Falha na sincronização' },
            descricao:    { type: 'string' },
            prioridade:   { type: 'string', enum: ['baixa', 'média', 'alta'] },
            status:       { type: 'string', enum: ['aberto', 'em andamento', 'resolvido'] },
            integracaoId: { type: 'string', nullable: true },
            createdAt:    { type: 'string', format: 'date-time' },
          },
        },
        TicketBody: {
          type: 'object',
          required: ['titulo'],
          properties: {
            titulo:       { type: 'string', example: 'Erro na sincronização' },
            descricao:    { type: 'string' },
            prioridade:   { type: 'string', enum: ['baixa', 'média', 'alta'], default: 'média' },
            integracaoId: { type: 'string' },
            origem:       { type: 'string' },
          },
        },
        // ── Log ────────────────────────────────
        Log: {
          type: 'object',
          properties: {
            id:           { type: 'string' },
            nivel:        { type: 'string', enum: ['INFO', 'WARN', 'ERROR'] },
            mensagem:     { type: 'string', example: 'Timeout ao chamar API externa' },
            modulo:       { type: 'string', example: 'pagamentos' },
            integracaoId: { type: 'string', nullable: true },
            createdAt:    { type: 'string', format: 'date-time' },
          },
        },
        LogBody: {
          type: 'object',
          required: ['nivel', 'mensagem'],
          properties: {
            nivel:        { type: 'string', enum: ['INFO', 'WARN', 'ERROR'] },
            mensagem:     { type: 'string', example: 'Descrição do evento' },
            modulo:       { type: 'string' },
            integracaoId: { type: 'string' },
          },
        },
        // ── Fatura ─────────────────────────────
        Fatura: {
          type: 'object',
          properties: {
            id:          { type: 'string' },
            descricao:   { type: 'string', example: 'Fatura XPTO Ltda - Março/2026' },
            clienteNome: { type: 'string', example: 'XPTO Ltda' },
            valor:       { type: 'number', example: 4500.00 },
            status:      { type: 'string', enum: ['open', 'paid', 'overdue'] },
            dataVencimento: { type: 'string', format: 'date-time' },
            createdAt:   { type: 'string', format: 'date-time' },
          },
        },
        FaturaBody: {
          type: 'object',
          required: ['descricao', 'valor'],
          properties: {
            descricao:      { type: 'string' },
            clienteNome:    { type: 'string' },
            valor:          { type: 'number', example: 1500.00 },
            status:         { type: 'string', enum: ['open', 'paid', 'overdue'], default: 'open' },
            dataVencimento: { type: 'string', format: 'date-time' },
          },
        },
        FinanceiroStats: {
          type: 'object',
          properties: {
            totalFaturas:       { type: 'integer' },
            totalValor:         { type: 'number' },
            valorPago:          { type: 'number' },
            valorVencido:       { type: 'number' },
            faturasPagas:       { type: 'integer' },
            faturasVencidas:    { type: 'integer' },
            faturasAbertas:     { type: 'integer' },
            taxaInadimplencia:  { type: 'number', example: 12.5 },
          },
        },
        // ── Notificação ─────────────────────────
        Notificacao: {
          type: 'object',
          properties: {
            id:        { type: 'string' },
            titulo:    { type: 'string', example: 'Integração com erro' },
            mensagem:  { type: 'string' },
            tipo:      { type: 'string', enum: ['info', 'warning', 'error', 'success'] },
            lida:      { type: 'boolean' },
            userId:    { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // ── Registro Operacional ────────────────
        RegistroOperacional: {
          type: 'object',
          properties: {
            id:             { type: 'string' },
            descricao:      { type: 'string', example: 'Cobrança duplicada detectada' },
            valor:          { type: 'number', example: 1200.00 },
            inconsistencia: { type: 'boolean' },
            severidade:     { type: 'string', enum: ['baixa', 'media', 'alta'], nullable: true },
            faturaId:       { type: 'string', nullable: true },
            createdAt:      { type: 'string', format: 'date-time' },
          },
        },
        RegistroBody: {
          type: 'object',
          required: ['descricao', 'valor'],
          properties: {
            descricao:      { type: 'string' },
            valor:          { type: 'number', example: 500.00 },
            inconsistencia: { type: 'boolean', default: false },
            faturaId:       { type: 'string' },
          },
        },
        OperacionalStats: {
          type: 'object',
          properties: {
            total:                { type: 'integer' },
            totalInconsistentes:  { type: 'integer' },
            impactoFinanceiro:    { type: 'number' },
            altaSeveridade:       { type: 'integer' },
          },
        },
        // ── Automação ───────────────────────────
        Automacao: {
          type: 'object',
          properties: {
            id:               { type: 'string' },
            nome:             { type: 'string', example: 'Alerta de erro em pagamentos' },
            descricao:        { type: 'string' },
            triggerType:      { type: 'string', example: 'status_change' },
            triggerCondicao:  { type: 'string', example: '{"status":"error"}' },
            actionType:       { type: 'string', example: 'criar_ticket' },
            actionData:       { type: 'string', example: '{"prioridade":"alta"}' },
            ativa:            { type: 'boolean' },
            createdAt:        { type: 'string', format: 'date-time' },
          },
        },
        AutomacaoBody: {
          type: 'object',
          required: ['nome', 'triggerType', 'actionType'],
          properties: {
            nome:             { type: 'string' },
            descricao:        { type: 'string' },
            triggerType:      { type: 'string', example: 'status_change' },
            triggerCondicao:  { type: 'object', example: { status: 'error' } },
            actionType:       { type: 'string', example: 'criar_ticket' },
            actionData:       { type: 'object', example: { prioridade: 'alta' } },
          },
        },
      },
    },
    // Segurança padrão para todos os endpoints (exceto os sem "security: []")
    security: [{ bearerAuth: [] }],

    // ─────────────────────────────────────────
    // PATHS — todos os endpoints da API
    // ─────────────────────────────────────────
    paths: {

      // ════════════════════════════════════════
      // AUTH
      // ════════════════════════════════════════
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Fazer login',
          description: 'Retorna um token JWT válido por 8h. Use-o no cabeçalho `Authorization: Bearer <token>`.',
          security: [],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginBody' } } },
          },
          responses: {
            200: {
              description: 'Login realizado com sucesso',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } },
            },
            400: { description: 'Campos obrigatórios ausentes', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
            401: { description: 'Email ou senha inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
          },
        },
      },

      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Cadastrar novo usuário',
          security: [],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterBody' } } },
          },
          responses: {
            201: { description: 'Usuário criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Usuario' } } } },
            409: { description: 'Email já cadastrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
          },
        },
      },

      '/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Dados do usuário logado',
          responses: {
            200: { description: 'Dados do usuário', content: { 'application/json': { schema: { $ref: '#/components/schemas/Usuario' } } } },
            401: { description: 'Token inválido ou ausente' },
          },
        },
      },

      // ════════════════════════════════════════
      // INTEGRAÇÕES
      // ════════════════════════════════════════
      '/integracoes': {
        get: {
          tags: ['Integrações'],
          summary: 'Listar todas as integrações',
          description: 'Retorna integrações ordenadas por nome, incluindo contagem de tickets e logs.',
          responses: {
            200: {
              description: 'Lista de integrações',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Integracao' } } } },
            },
          },
        },
        post: {
          tags: ['Integrações'],
          summary: 'Criar integração (admin)',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/IntegracaoBody' } } },
          },
          responses: {
            201: { description: 'Integração criada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Integracao' } } } },
            400: { description: 'Campo nome ausente' },
            403: { description: 'Permissão insuficiente (requer role admin)' },
          },
        },
      },

      '/integracoes/{id}': {
        get: {
          tags: ['Integrações'],
          summary: 'Buscar integração por ID',
          description: 'Retorna tickets abertos (últimos 5) e logs recentes (últimos 10).',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Integração encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Integracao' } } } },
            404: { description: 'Não encontrada' },
          },
        },
        put: {
          tags: ['Integrações'],
          summary: 'Atualizar integração',
          description: 'Atualiza campos da integração. Se status mudar para `error`, cria log automático.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/IntegracaoBody' } } },
          },
          responses: {
            200: { description: 'Atualizada com sucesso' },
            404: { description: 'Não encontrada' },
          },
        },
        delete: {
          tags: ['Integrações'],
          summary: 'Remover integração (admin)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Removida com sucesso' },
            403: { description: 'Permissão insuficiente' },
            404: { description: 'Não encontrada' },
          },
        },
      },

      // ════════════════════════════════════════
      // TICKETS
      // ════════════════════════════════════════
      '/tickets': {
        get: {
          tags: ['Tickets'],
          summary: 'Listar tickets',
          parameters: [
            { name: 'status',       in: 'query', schema: { type: 'string', enum: ['aberto', 'em andamento', 'resolvido'] } },
            { name: 'prioridade',   in: 'query', schema: { type: 'string', enum: ['baixa', 'média', 'alta'] } },
            { name: 'integracaoId', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            200: {
              description: 'Lista de tickets',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Ticket' } } } },
            },
          },
        },
        post: {
          tags: ['Tickets'],
          summary: 'Criar ticket',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/TicketBody' } } },
          },
          responses: {
            201: { description: 'Ticket criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Ticket' } } } },
            400: { description: 'Campo titulo ausente' },
          },
        },
      },

      '/tickets/{id}': {
        get: {
          tags: ['Tickets'],
          summary: 'Buscar ticket por ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Ticket encontrado' },
            404: { description: 'Não encontrado' },
          },
        },
        put: {
          tags: ['Tickets'],
          summary: 'Atualizar ticket',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status:    { type: 'string', enum: ['aberto', 'em andamento', 'resolvido'] },
                    prioridade:{ type: 'string', enum: ['baixa', 'média', 'alta'] },
                    titulo:    { type: 'string' },
                    descricao: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Ticket atualizado' },
            404: { description: 'Não encontrado' },
          },
        },
        delete: {
          tags: ['Tickets'],
          summary: 'Remover ticket (admin)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Removido' },
            403: { description: 'Permissão insuficiente' },
          },
        },
      },

      // ════════════════════════════════════════
      // FINANCEIRO
      // ════════════════════════════════════════
      '/financeiro/stats': {
        get: {
          tags: ['Financeiro'],
          summary: 'KPIs financeiros',
          description: 'Totalizadores exibidos nos cards do Dashboard.',
          responses: {
            200: {
              description: 'Estatísticas financeiras',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/FinanceiroStats' } } },
            },
          },
        },
      },

      '/financeiro/faturas': {
        get: {
          tags: ['Financeiro'],
          summary: 'Listar faturas',
          parameters: [
            { name: 'status',      in: 'query', schema: { type: 'string', enum: ['open', 'paid', 'overdue'] } },
            { name: 'clienteNome', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            200: {
              description: 'Lista de faturas',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Fatura' } } } },
            },
          },
        },
        post: {
          tags: ['Financeiro'],
          summary: 'Criar fatura',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/FaturaBody' } } },
          },
          responses: {
            201: { description: 'Fatura criada' },
            400: { description: 'Campos obrigatórios ausentes' },
          },
        },
      },

      '/financeiro/faturas/{id}': {
        get: {
          tags: ['Financeiro'],
          summary: 'Buscar fatura por ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Fatura encontrada' },
            404: { description: 'Não encontrada' },
          },
        },
        put: {
          tags: ['Financeiro'],
          summary: 'Atualizar fatura',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['open', 'paid', 'overdue'] },
                    valor:  { type: 'number' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Fatura atualizada' },
            404: { description: 'Não encontrada' },
          },
        },
      },

      // ════════════════════════════════════════
      // LOGS
      // ════════════════════════════════════════
      '/logs': {
        get: {
          tags: ['Logs'],
          summary: 'Listar logs (com paginação)',
          parameters: [
            { name: 'nivel',        in: 'query', schema: { type: 'string', enum: ['INFO', 'WARN', 'ERROR'] } },
            { name: 'modulo',       in: 'query', schema: { type: 'string' } },
            { name: 'integracaoId', in: 'query', schema: { type: 'string' } },
            { name: 'pagina',       in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limite',       in: 'query', schema: { type: 'integer', default: 50, maximum: 200 } },
          ],
          responses: {
            200: {
              description: 'Lista paginada de logs',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      logs:         { type: 'array', items: { $ref: '#/components/schemas/Log' } },
                      total:        { type: 'integer' },
                      pagina:       { type: 'integer' },
                      totalPaginas: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Logs'],
          summary: 'Criar log',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LogBody' } } },
          },
          responses: {
            201: { description: 'Log criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Log' } } } },
            400: { description: 'Campos obrigatórios ausentes' },
          },
        },
      },

      '/logs/limpar': {
        delete: {
          tags: ['Logs'],
          summary: 'Limpar logs antigos (admin)',
          description: 'Remove logs mais antigos que `dias` dias. Padrão: 30 dias.',
          parameters: [
            { name: 'dias', in: 'query', schema: { type: 'integer', default: 30 } },
          ],
          responses: {
            200: { description: 'Logs removidos', content: { 'application/json': { schema: { type: 'object', properties: { mensagem: { type: 'string' }, removidos: { type: 'integer' } } } } } },
            403: { description: 'Permissão insuficiente' },
          },
        },
      },

      // ════════════════════════════════════════
      // NOTIFICAÇÕES
      // ════════════════════════════════════════
      '/notificacoes': {
        get: {
          tags: ['Notificações'],
          summary: 'Listar notificações do usuário logado',
          parameters: [
            { name: 'lida', in: 'query', schema: { type: 'boolean' }, description: 'Filtrar por lidas/não lidas' },
          ],
          responses: {
            200: {
              description: 'Notificações do usuário',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      notificacoes:   { type: 'array', items: { $ref: '#/components/schemas/Notificacao' } },
                      totalNaoLidas:  { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Notificações'],
          summary: 'Criar notificação (admin)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['titulo', 'mensagem'],
                  properties: {
                    titulo:   { type: 'string' },
                    mensagem: { type: 'string' },
                    tipo:     { type: 'string', enum: ['info', 'warning', 'error', 'success'], default: 'info' },
                    userId:   { type: 'string', description: 'Se omitido, envia para o usuário logado' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Notificação criada' },
          },
        },
      },

      '/notificacoes/marcar-todas': {
        put: {
          tags: ['Notificações'],
          summary: 'Marcar todas como lidas',
          responses: {
            200: {
              description: 'Notificações marcadas',
              content: { 'application/json': { schema: { type: 'object', properties: { mensagem: { type: 'string' } } } } },
            },
          },
        },
      },

      '/notificacoes/{id}/lida': {
        put: {
          tags: ['Notificações'],
          summary: 'Marcar notificação como lida',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Marcada como lida' },
            404: { description: 'Não encontrada' },
          },
        },
      },

      '/notificacoes/{id}': {
        delete: {
          tags: ['Notificações'],
          summary: 'Remover notificação',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Removida' },
            404: { description: 'Não encontrada' },
          },
        },
      },

      // ════════════════════════════════════════
      // OPERACIONAL
      // ════════════════════════════════════════
      '/operacional/stats': {
        get: {
          tags: ['Operacional'],
          summary: 'KPIs operacionais',
          responses: {
            200: {
              description: 'Estatísticas operacionais',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/OperacionalStats' } } },
            },
          },
        },
      },

      '/operacional/registros': {
        get: {
          tags: ['Operacional'],
          summary: 'Listar registros operacionais',
          parameters: [
            { name: 'inconsistencia', in: 'query', schema: { type: 'boolean' } },
            { name: 'severidade',     in: 'query', schema: { type: 'string', enum: ['baixa', 'media', 'alta'] } },
          ],
          responses: {
            200: {
              description: 'Lista de registros',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/RegistroOperacional' } } } },
            },
          },
        },
        post: {
          tags: ['Operacional'],
          summary: 'Criar registro operacional',
          description: 'Regra: se `valor > 200` e `inconsistencia = true`, a `severidade` é setada automaticamente como `alta`.',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RegistroBody' } } },
          },
          responses: {
            201: { description: 'Registro criado' },
          },
        },
      },

      '/operacional/registros/{id}': {
        get: {
          tags: ['Operacional'],
          summary: 'Buscar registro por ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Registro encontrado' },
            404: { description: 'Não encontrado' },
          },
        },
        put: {
          tags: ['Operacional'],
          summary: 'Atualizar registro',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RegistroBody' } } },
          },
          responses: {
            200: { description: 'Atualizado' },
            404: { description: 'Não encontrado' },
          },
        },
      },

      // ════════════════════════════════════════
      // AUTOMAÇÕES
      // ════════════════════════════════════════
      '/automacoes': {
        get: {
          tags: ['Automações'],
          summary: 'Listar automações',
          responses: {
            200: {
              description: 'Lista de automações',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Automacao' } } } },
            },
          },
        },
        post: {
          tags: ['Automações'],
          summary: 'Criar automação (admin/analyst)',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AutomacaoBody' } } },
          },
          responses: {
            201: { description: 'Automação criada' },
            400: { description: 'Campos obrigatórios ausentes' },
            403: { description: 'Permissão insuficiente' },
          },
        },
      },

      '/automacoes/{id}': {
        get: {
          tags: ['Automações'],
          summary: 'Buscar automação por ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Automação encontrada' },
            404: { description: 'Não encontrada' },
          },
        },
        put: {
          tags: ['Automações'],
          summary: 'Atualizar / ativar / desativar automação',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nome:        { type: 'string' },
                    descricao:   { type: 'string' },
                    ativa:       { type: 'boolean' },
                    actionType:  { type: 'string' },
                    actionData:  { type: 'object' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Atualizada' },
            404: { description: 'Não encontrada' },
          },
        },
        delete: {
          tags: ['Automações'],
          summary: 'Remover automação (admin)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Removida' },
            403: { description: 'Permissão insuficiente' },
          },
        },
      },

      '/automacoes/{id}/executar': {
        post: {
          tags: ['Automações'],
          summary: 'Executar automação manualmente',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Automação executada', content: { 'application/json': { schema: { type: 'object', properties: { mensagem: { type: 'string' }, automacao: { $ref: '#/components/schemas/Automacao' } } } } } },
            404: { description: 'Não encontrada' },
          },
        },
      },

      // ════════════════════════════════════════
      // HEALTH
      // ════════════════════════════════════════
      '/health': {
        get: {
          tags: ['Sistema'],
          summary: 'Health check',
          description: 'Verifica se a API está no ar. Não requer autenticação.',
          security: [],
          responses: {
            200: {
              description: 'API operacional',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status:    { type: 'string', example: 'ok' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  // swagger-jsdoc lerá este arquivo em busca de comentários JSDoc com @swagger
  // (não temos aqui, mas a opção é obrigatória na config)
  apis: [],
}

const swaggerSpec = swaggerJsdoc(options)

module.exports = swaggerSpec
