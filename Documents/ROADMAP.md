# Roadmap do LinkUp³

## Status atual: MVP funcional

### Concluído
- [x] Autenticação JWT com RBAC
- [x] Dashboard com KPIs e gráficos
- [x] Monitoramento de integrações em tempo real
- [x] Sistema de tickets com filtros
- [x] Central de notificações
- [x] Módulo financeiro (faturas e stats)
- [x] Módulo operacional
- [x] Stream de logs com paginação
- [x] Motor de automações (if-then)
- [x] AIEngine com insights contextuais
- [x] Onboarding guiado com checklist
- [x] Modo offline com mockBackend
- [x] Documentação OpenAPI/Swagger

### Próximos passos (ordenados por prioridade)

#### Fase 1 — Estabilização (resolver antes de novas features)
- [ ] [C1] Implementar flag VITE_USE_MOCK para separar modo mock do real
- [ ] [C2] Popular currentUser a partir do JWT real
- [ ] [C3] Unificar mecanismo de autenticação em torno do JWT
- [ ] [M1] Adicionar rate limiting nas rotas de auth
- [ ] [M2] Validar JWT_SECRET no startup do servidor
- [ ] [m2] Adicionar build.log ao .gitignore

#### Fase 2 — Produção
- [ ] Migrar banco de dados SQLite → PostgreSQL
- [ ] Variáveis de ambiente via .env validado (zod ou joi)
- [ ] CI/CD pipeline básico
- [ ] Testes unitários nos módulos críticos (AIEngine, AutomationEngine)

#### Fase 3 — Crescimento
- [ ] Multitenancy (múltiplas empresas por instância)
- [ ] Webhooks para integrações externas
- [ ] Página Lab — definir e documentar propósito
- [ ] Exportação de relatórios (PDF/CSV)
