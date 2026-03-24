# 🎯 Guia de Tom de Voz - LinkUp³

**Versão:** 1.0 | **Data:** Dez/2024 | **Fase:** 2A - Transformação de Linguagem

---

## 🧭 Posicionamento

**LinkUp³ é um FACILITADOR, não um DECISOR.**

O sistema não toma decisões, não executa automaticamente, não resolve sozinho.
**O sistema observa, contextualiza, sugere. O gestor decide e age.**

---

## 📐 Estrutura de Comunicação

Todas as mensagens seguem o padrão:

```
[O QUE ACONTECEU] → [IMPACTO NO NEGÓCIO] → [AÇÃO SUGERIDA]
```

**Exemplo:**

- ❌ **ANTES:** "Integração normalizada"
- ✅ **DEPOIS:** "Conexão com Elofy restabelecida. Dados voltaram a sincronizar. Recomendamos monitorar nas próximas horas."

---

## ✅ PERMITIDO

### ✓ Linguagem Facilitadora

- "Detectamos que..."
- "Identificamos que..."
- "Sugerimos verificar..."
- "Recomendamos..."
- "Considere..."
- "Pode impactar..."
- "Está afetando..."

### ✓ Contexto de Negócio

- "Clientes podem estar afetados"
- "Fluxo de caixa pode ser comprometido"
- "SLA em risco"
- "Satisfação do cliente ameaçada"

### ✓ Próxima Ação Clara

- "Verifique credenciais na página de integrações"
- "Acesse o módulo financeiro para revisar aprovações"
- "Recomendamos priorizar este atendimento"

---

## ❌ PROIBIDO

### ✗ Linguagem Autônoma/Decisora

- ❌ "Integração normalizada" → Muito técnico
- ❌ "Resolvido automaticamente" → Sistema como decisor
- ❌ "Processado com sucesso" → Não dá contexto
- ❌ "Erro ao processar" → Não explica impacto

### ✗ Jargão Técnico sem Tradução

- ❌ "Gateway indisponível" → Usar "Sistema de pagamento não responde"
- ❌ "Sincronização interrompida" → Usar "Dados pararam de atualizar"
- ❌ "Timeout na API" → Usar "Serviço não respondeu no tempo esperado"

### ✗ Alarmes Vazios

- ❌ "Instabilidade detectada" → Falta impacto e ação
- ❌ "Erro no sistema" → Vago demais
- ❌ "Alerta crítico" → Não contextualiza

---

## 📝 CATÁLOGO DE TRANSFORMAÇÕES

### 🔗 Integrações

| ❌ ANTES                | ✅ DEPOIS                                                                                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Integração normalizada  | **[Sistema]: Conexão restabelecida**<br>Dados voltaram a sincronizar. Recomendamos monitorar estabilidade.                                                 |
| Instabilidade detectada | **[Sistema]: Instabilidade identificada**<br>[Sistema] está com resposta lenta. Dados podem não estar atualizados. Recomendamos investigar.                |
| Falha na integração X   | **Acompanhamento sugerido: [Sistema] sem resposta**<br>Detectamos falha recorrente. Sincronização interrompida. Verifique status do serviço e credenciais. |

---

### 💰 Financeiro

| ❌ ANTES                                           | ✅ DEPOIS                                                                                                                                 |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Fatura processada com sucesso                      | **Processamento financeiro concluído sem pendências**<br>Todas as faturas do período foram processadas.                                   |
| Fatura pendente de aprovação                       | **Fatura aguardando há 7+ dias pode afetar fluxo de caixa**<br>Recomendamos revisar aprovações pendentes no módulo financeiro.            |
| Erro ao processar pagamento - Gateway indisponível | **Gateway de pagamento não responde - clientes podem estar afetados**<br>Verifique status do provedor e notifique clientes se necessário. |
| Limite de crédito próximo ao máximo                | **Limite operacional em 85% - atenção ao planejamento**<br>Avalie necessidade de ajuste de crédito antes de atingir o limite.             |

---

### 🎫 Suporte

| ❌ ANTES                                | ✅ DEPOIS                                                                                                                                       |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket resolvido automaticamente        | **Ticket fechado - cliente confirmou resolução**<br>O chamado foi finalizado após validação.                                                    |
| Ticket sem resposta há mais de 48h      | **Ticket aguarda resposta há 48h - SLA em risco**<br>Recomendamos priorizar este atendimento para manter qualidade do serviço.                  |
| Falha ao enviar email de notificação    | **Sistema de email não enviou notificação - cliente pode não saber**<br>Verifique configuração SMTP e notifique cliente manualmente se crítico. |
| Fila de atendimento acima da capacidade | **Volume de chamados 20% acima do normal - avaliar recursos**<br>Pico de demanda detectado. Considere reforço temporário.                       |

---

### ⚙️ Operacional

| ❌ ANTES                            | ✅ DEPOIS                                                                                                                                                             |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Check-in realizado com sucesso      | **Operação de check-in registrada sem inconsistências**<br>Fluxo operacional funcionando normalmente.                                                                 |
| Registro duplicado detectado        | **Possível duplicação em registro - validação manual sugerida**<br>Identificamos entrada similar recente. Verifique para evitar cobrança duplicada.                   |
| Falha na sincronização de registros | **Sincronização operacional interrompida - dados podem estar desatualizados**<br>Recomendamos verificar conectividade e reiniciar sincronização manual se necessário. |
| Ocupação da unidade acima de 90%    | **Ocupação em 90% - planejamento de capacidade recomendado**<br>Considere ajustar disponibilidade ou preparar expansão.                                               |
| Inconsistência detectada em reserva | **Conflito identificado em reserva - cliente pode ser impactado**<br>Detectamos sobreposição de horários. Resolva antes do atendimento para evitar insatisfação.      |

---

## 🎯 NÍVEIS DE SEVERIDADE

### 🟢 OK (Informativo)

- **Tom:** Neutro, confirmatório
- **Exemplo:** "Processamento concluído sem pendências. Fluxo operacional funcionando normalmente."

### 🟡 WARN (Atenção)

- **Tom:** Preventivo, não alarmista
- **Exemplo:** "Fatura aguardando há 7+ dias. Recomendamos revisar para evitar impacto no fluxo de caixa."

### 🔴 ERROR (Ação Imediata)

- **Tom:** Claro, urgente, com próxima ação explícita
- **Exemplo:** "Gateway não responde - clientes podem estar afetados. Verifique status do provedor e notifique clientes se necessário."

---

## 🧪 TESTE DE VALIDAÇÃO (10 SEGUNDOS)

**Pergunta:** Um gestor não-técnico consegue entender em <10 segundos:

1. **O que aconteceu?**
2. **Por que isso importa?**
3. **O que fazer agora?**

Se a resposta for **NÃO** para qualquer pergunta, a mensagem precisa ser reescrita.

---

## 🚫 ANTI-PADRÕES

### ❌ Sistema como Decisor

```
"Ticket resolvido automaticamente"
→ Implica que o sistema decide sozinho
```

### ❌ Jargão sem Tradução

```
"Timeout na API REST do gateway de pagamento"
→ Gestor não-técnico não entende
```

### ❌ Alarme sem Contexto

```
"Erro crítico detectado"
→ Não diz ONDE, não explica IMPACTO, não sugere AÇÃO
```

### ❌ Sucesso sem Valor

```
"Operação executada com sucesso"
→ Não adiciona informação útil
```

---

## 📊 MÉTRICAS DE SUCESSO

- **Clareza:** 95%+ dos gestores entendem sem explicação adicional
- **Velocidade:** <10 segundos para compreender mensagem completa
- **Ação:** 80%+ sabem qual próximo passo tomar
- **Confiança:** Sistema visto como "assistente confiável", não "caixa preta"

---

## 🔄 MANUTENÇÃO

Este guia deve ser atualizado quando:

- Novos módulos forem adicionados
- Feedback de usuários indicar confusão
- Novos tipos de eventos surgirem
- Testes de usabilidade revelarem gaps

**Responsável:** Equipe de Produto
**Revisão:** Trimestral

---

## 📖 REFERÊNCIAS

- [ESPECIFICACAO_SOFTWARE.md](./ESPECIFICACAO_SOFTWARE.md) - Arquitetura do sistema
- [PROPOSTA_COMERCIAL_LINKUP3.md](./PROPOSTA_COMERCIAL_LINKUP3.md) - Posicionamento de mercado
- [GUIA_RAPIDO.md](./GUIA_RAPIDO.md) - Onboarding de usuários

---

**Última atualização:** Dez/2024
**Versão:** 1.0 - Transformação de Linguagem (Fase 2A)
