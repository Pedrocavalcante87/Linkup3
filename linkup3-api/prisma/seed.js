// ─────────────────────────────────────────────
// SEED — Popula o banco com dados iniciais
// Execute com: npm run seed
//
// O seed usa "upsert" — se o dado já existe, atualiza.
// Se não existe, cria. Assim pode rodar várias vezes sem duplicar.
// ─────────────────────────────────────────────

require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('\n🌱 Iniciando seed do banco de dados...\n')

  // ── USUÁRIOS ─────────────────────────────────
  const senhaHash = await bcrypt.hash('linkup3@2026', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@linkup3.com' },
    update: {},
    create: {
      email: 'admin@linkup3.com',
      nome: 'Administrador LinkUp³',
      senha: senhaHash,
      role: 'admin'
    }
  })

  const analista = await prisma.user.upsert({
    where: { email: 'analista@linkup3.com' },
    update: {},
    create: {
      email: 'analista@linkup3.com',
      nome: 'Ana Lima',
      senha: senhaHash,
      role: 'analyst'
    }
  })

  const usuario = await prisma.user.upsert({
    where: { email: 'usuario@linkup3.com' },
    update: {},
    create: {
      email: 'usuario@linkup3.com',
      nome: 'Pedro Silva',
      senha: senhaHash,
      role: 'user'
    }
  })

  console.log('✅ Usuários criados:', admin.email, analista.email, usuario.email)

  // ── INTEGRAÇÕES ───────────────────────────────
  const integracoesData = [
    { nome: 'Gateway de Pagamento',  descricao: 'Stripe — processamento de pagamentos',     status: 'ok',    uptime: 99.8, taxaSucesso: 98.5, origem: 'Stripe' },
    { nome: 'ERP Corporativo',        descricao: 'SAP integração de pedidos e estoque',       status: 'warn',  uptime: 94.2, taxaSucesso: 91.0, origem: 'SAP' },
    { nome: 'CRM Vendas',             descricao: 'Salesforce — dados de clientes',             status: 'ok',    uptime: 99.1, taxaSucesso: 99.0, origem: 'Salesforce' },
    { nome: 'Logística & Frete',      descricao: 'API de rastreamento de entregas',            status: 'error', uptime: 78.3, taxaSucesso: 65.0, origem: 'Correios API' },
    { nome: 'Nota Fiscal Eletrônica', descricao: 'Emissão automática de NF-e',                status: 'ok',    uptime: 99.9, taxaSucesso: 99.7, origem: 'SEFAZ' },
    { nome: 'Banco de Dados Legado',  descricao: 'Migração em andamento — MySQL 5.7',         status: 'warn',  uptime: 88.0, taxaSucesso: 82.0, origem: 'Interno' },
    { nome: 'API WhatsApp Business',  descricao: 'Notificações automáticas para clientes',    status: 'ok',    uptime: 97.5, taxaSucesso: 96.0, origem: 'Meta' },
    { nome: 'Gateway de Email',       descricao: 'SendGrid — emails transacionais',            status: 'ok',    uptime: 99.5, taxaSucesso: 99.2, origem: 'SendGrid' },
    { nome: 'Sistema de Estoque',     descricao: 'Controle de inventário em tempo real',       status: 'error', uptime: 71.0, taxaSucesso: 68.5, origem: 'Interno' },
    { nome: 'Relatórios BI',          descricao: 'Power BI — dashboards executivos',           status: 'ok',    uptime: 98.8, taxaSucesso: 98.0, origem: 'Microsoft' },
  ]

  const integracoes = []
  for (const dados of integracoesData) {
    const integracao = await prisma.integracao.upsert({
      where: { id: dados.nome }, // usamos nome como chave temporária
      update: dados,
      create: dados
    }).catch(() =>
      // upsert por ID não funciona para strings não-cuid, então fazemos assim:
      prisma.integracao.findFirst({ where: { nome: dados.nome } }).then(existing => {
        if (existing) return existing
        return prisma.integracao.create({ data: dados })
      })
    )
    integracoes.push(integracao)
  }

  console.log(`✅ ${integracoes.length} integrações criadas`)

  // ── FATURAS ───────────────────────────────────
  const hoje = new Date()
  const faturasData = [
    { descricao: 'Mensalidade Enterprise — Jan/2026',  valor: 4850.00, status: 'paid',    dataVencimento: new Date('2026-01-10'), clienteNome: 'Empresa Alpha Ltda' },
    { descricao: 'Licença Software — Fev/2026',        valor: 1200.00, status: 'paid',    dataVencimento: new Date('2026-02-15'), clienteNome: 'Beta Tech S.A.' },
    { descricao: 'Suporte Premium — Mar/2026',         valor: 750.00,  status: 'open',    dataVencimento: new Date('2026-03-31'), clienteNome: 'Gama Indústrias' },
    { descricao: 'Integração WhatsApp — Fev/2026',     valor: 320.00,  status: 'overdue', dataVencimento: new Date('2026-02-05'), clienteNome: 'Delta Varejo' },
    { descricao: 'API Gateway — Mar/2026',             valor: 2100.00, status: 'open',    dataVencimento: new Date('2026-03-20'), clienteNome: 'Epsilon Corp' },
    { descricao: 'Consultoria Técnica — Jan/2026',     valor: 5500.00, status: 'paid',    dataVencimento: new Date('2026-01-25'), clienteNome: 'Empresa Alpha Ltda' },
    { descricao: 'Módulo Relatórios — Fev/2026',       valor: 980.00,  status: 'overdue', dataVencimento: new Date('2026-02-28'), clienteNome: 'Zeta Logística' },
    { descricao: 'Hospedagem Cloud — Mar/2026',        valor: 1650.00, status: 'open',    dataVencimento: new Date('2026-03-15'), clienteNome: 'Beta Tech S.A.' },
    { descricao: 'Licença Anual — 2026',               valor: 18000.00, status: 'paid',   dataVencimento: new Date('2026-01-02'), clienteNome: 'Gama Indústrias' },
    { descricao: 'Onboarding Personalizado',           valor: 3200.00, status: 'overdue', dataVencimento: new Date('2026-02-10'), clienteNome: 'Eta Soluções ME' },
  ]

  const faturas = []
  for (const dados of faturasData) {
    const existing = await prisma.fatura.findFirst({ where: { descricao: dados.descricao } })
    if (!existing) {
      const fatura = await prisma.fatura.create({ data: dados })
      faturas.push(fatura)
    } else {
      faturas.push(existing)
    }
  }

  console.log(`✅ ${faturas.length} faturas criadas`)

  // ── REGISTROS OPERACIONAIS ────────────────────
  const registrosData = [
    { descricao: 'Pedido #10234 — entregue sem NF',          valor: 450.00,  inconsistencia: true,  severidade: 'alta',  faturaId: faturas[0]?.id },
    { descricao: 'Checkin sistema legado fora do prazo',     valor: 120.00,  inconsistencia: true,  severidade: 'media', faturaId: null },
    { descricao: 'Sincronização ERP — registros duplicados', valor: 1850.00, inconsistencia: true,  severidade: 'alta',  faturaId: faturas[2]?.id },
    { descricao: 'Importação CRM concluída',                 valor: 0,       inconsistencia: false, severidade: 'baixa', faturaId: null },
    { descricao: 'Frete cobrado sem entrega confirmada',     valor: 280.00,  inconsistencia: true,  severidade: 'alta',  faturaId: faturas[3]?.id },
    { descricao: 'Backup diário executado com sucesso',      valor: 0,       inconsistencia: false, severidade: 'baixa', faturaId: null },
    { descricao: 'Divergência estoque × sistema',           valor: 95.00,   inconsistencia: true,  severidade: 'media', faturaId: null },
  ]

  for (const dados of registrosData) {
    const existing = await prisma.registroOperacional.findFirst({ where: { descricao: dados.descricao } })
    if (!existing) {
      await prisma.registroOperacional.create({ data: dados })
    }
  }

  console.log(`✅ ${registrosData.length} registros operacionais criados`)

  // ── TICKETS ───────────────────────────────────
  const ticketsData = [
    { titulo: 'API Logística retornando timeout',               descricao: 'Todas as chamadas estão retornando erro 504 há 2h', status: 'aberto',       prioridade: 'alta',  origem: 'automatico', integracaoId: integracoes[3]?.id, userId: admin.id },
    { titulo: 'Sistema de Estoque fora do ar',                  descricao: 'Integração reportou erro crítico às 14h32',         status: 'em_andamento', prioridade: 'alta',  origem: 'automatico', integracaoId: integracoes[8]?.id, userId: analista.id },
    { titulo: 'ERP com lentidão anormal',                       descricao: 'Uptime caiu para 88%, verificar servidores SAP',    status: 'aberto',       prioridade: 'media', origem: 'manual',     integracaoId: integracoes[1]?.id, userId: usuario.id },
    { titulo: 'Fatura #7 vencida há 15 dias sem pagamento',     descricao: 'Escalar para financeiro urgente',                   status: 'aberto',       prioridade: 'alta',  origem: 'automatico', userId: admin.id },
    { titulo: 'Revisão de permissões de acesso ao CRM',         descricao: 'Solicitação de auditoria trimestral',               status: 'resolvido',    prioridade: 'baixa', origem: 'manual',     userId: analista.id },
  ]

  for (const dados of ticketsData) {
    const existing = await prisma.ticket.findFirst({ where: { titulo: dados.titulo } })
    if (!existing) {
      await prisma.ticket.create({ data: dados })
    }
  }

  console.log(`✅ ${ticketsData.length} tickets criados`)

  // ── LOGS ──────────────────────────────────────
  const logsData = [
    { nivel: 'ERROR', mensagem: 'Connection timeout após 30000ms',                       modulo: 'logistica', integracaoId: integracoes[3]?.id },
    { nivel: 'ERROR', mensagem: 'Database connection pool exhausted',                    modulo: 'estoque',   integracaoId: integracoes[8]?.id },
    { nivel: 'WARN',  mensagem: 'Response time > 2000ms (avg: 2847ms)',                  modulo: 'erp',       integracaoId: integracoes[1]?.id },
    { nivel: 'INFO',  mensagem: 'Sincronização CRM concluída: 1.247 registros',          modulo: 'crm',       integracaoId: integracoes[2]?.id },
    { nivel: 'INFO',  mensagem: 'NF-e emitida com sucesso: NF-12847',                    modulo: 'nfe',       integracaoId: integracoes[4]?.id },
    { nivel: 'ERROR', mensagem: 'Sistema de Estoque: health check falhou 3x seguidas',   modulo: 'estoque',   integracaoId: integracoes[8]?.id },
    { nivel: 'WARN',  mensagem: 'Taxa de sucesso ERP caiu para 82%',                     modulo: 'erp',       integracaoId: integracoes[1]?.id },
    { nivel: 'INFO',  mensagem: 'API WhatsApp: 847 mensagens enviadas hoje',             modulo: 'whatsapp',  integracaoId: integracoes[6]?.id },
    { nivel: 'ERROR', mensagem: 'Logística: 14 requisições com erro 503 em 5 minutos',   modulo: 'logistica', integracaoId: integracoes[3]?.id },
    { nivel: 'INFO',  mensagem: 'Backup banco de dados concluído: 2.3GB',                modulo: 'sistema',   integracaoId: null },
  ]

  for (const dados of logsData) {
    await prisma.log.create({ data: dados })
  }

  console.log(`✅ ${logsData.length} logs criados`)

  // ── NOTIFICAÇÕES ──────────────────────────────
  const notificacoesData = [
    { titulo: 'Integração Logística em ERRO',          mensagem: 'API de rastreamento retornando timeout. Verificar imediatamente.', tipo: 'error',   userId: admin.id },
    { titulo: 'Sistema de Estoque offline',            mensagem: 'Health check falhou 3 vezes seguidas.',                           tipo: 'error',   userId: admin.id },
    { titulo: '3 faturas vencidas',                    mensagem: 'Total de R$ 4.500 em inadimplência.',                             tipo: 'warning', userId: admin.id },
    { titulo: 'CRM sincronizado com sucesso',          mensagem: '1.247 registros atualizados.',                                    tipo: 'success', userId: analista.id },
    { titulo: 'Ticket #2 atribuído a você',            mensagem: 'Sistema de Estoque fora do ar — prioridade ALTA',                 tipo: 'info',    userId: analista.id },
  ]

  for (const dados of notificacoesData) {
    await prisma.notificacao.create({ data: dados })
  }

  console.log(`✅ ${notificacoesData.length} notificações criadas`)

  // ── AUTOMAÇÕES PADRÃO ─────────────────────────
  const automacoesData = [
    {
      nome: 'Fatura Vencida → Ticket Alta Prioridade',
      descricao: 'Cria automaticamente um ticket quando uma fatura passa de 7 dias vencida',
      triggerType: 'fatura_atrasada',
      triggerCondicao: JSON.stringify({ dias: 7 }),
      actionType: 'criar_ticket',
      actionData: JSON.stringify({ prioridade: 'alta', titulo: 'Fatura vencida sem pagamento' }),
      enabled: true
    },
    {
      nome: 'Integração com 3+ Falhas → Notificação',
      descricao: 'Dispara notificação de erro quando integração falha 3 vezes seguidas',
      triggerType: 'integracao_falha',
      triggerCondicao: JSON.stringify({ falhasConsecutivas: 3 }),
      actionType: 'disparar_notificacao',
      actionData: JSON.stringify({ tipo: 'error', titulo: 'Integração com falhas críticas' }),
      enabled: true
    },
    {
      nome: '5+ Logs ERROR → Registro de Incidente',
      descricao: 'Cria um registro operacional quando um módulo gera 5+ erros',
      triggerType: 'log_error',
      triggerCondicao: JSON.stringify({ quantidade: 5, modulo: '*' }),
      actionType: 'criar_registro',
      actionData: JSON.stringify({ inconsistencia: true, severidade: 'alta', descricao: 'Incidente crítico detectado' }),
      enabled: true
    },
  ]

  for (const dados of automacoesData) {
    const existing = await prisma.automacao.findFirst({ where: { nome: dados.nome } })
    if (!existing) {
      await prisma.automacao.create({ data: dados })
    }
  }

  console.log(`✅ ${automacoesData.length} automações padrão criadas`)

  console.log('\n✨ Seed concluído com sucesso!')
  console.log('\n👤 Credenciais de acesso:')
  console.log('   admin@linkup3.com    / linkup3@2026  (admin)')
  console.log('   analista@linkup3.com / linkup3@2026  (analyst)')
  console.log('   usuario@linkup3.com  / linkup3@2026  (user)')
}

main()
  .catch(err => {
    console.error('❌ Erro no seed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
