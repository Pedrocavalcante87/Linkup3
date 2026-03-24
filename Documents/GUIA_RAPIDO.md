# 🚀 GUIA RÁPIDO - SISTEMA DE RECOVERY

## ⚡ Início Rápido (5 minutos)

### **1. Abrir o Projeto**
```bash
cd linkup3_full/linkup3
npm run dev
```

### **2. Abrir Console do Navegador**
Pressione `F12` e vá para a aba "Console"

### **3. Executar Primeiro Teste**
```javascript
// Ver integrações disponíveis
TEST_LIST_INTEGRATIONS()

// Escolher primeira integração e testar recovery
TEST_RESTORE('int-001')
```

### **4. Observar Resultado (3 segundos)**
- ✅ Console mostra logs coloridos
- ✅ Card da integração fica verde
- ✅ Notificação verde aparece no topo
- ✅ Status muda para "Normal"

---

## 🎯 Testes Principais

### **Teste 1: Recovery Simples**
```javascript
TEST_RESTORE('int-001')
```
**O que acontece:**
- Integração vai para ERROR
- Após 3s, volta para OK automaticamente
- Sistema dispara toda a lógica reversa

### **Teste 2: Degradação**
```javascript
TEST_DEGRADE('int-001')
```
**O que acontece:**
- OK → WARN (2s)
- WARN → ERROR (2s)
- Todos os alertas são criados

### **Teste 3: Ciclo Completo**
```javascript
TEST_FULL_CYCLE('int-001')
```
**O que acontece:**
- OK → WARN → ERROR → OK
- Ciclo completo em 8 segundos
- Demonstra todos os estados

### **Teste 4: Múltiplas Integrações**
```javascript
TEST_MULTIPLE_ERRORS()
```
**O que acontece:**
- 3 integrações vão para ERROR
- Após 3s, todas recuperam em cascata
- Demonstra atualização em massa

---

## 📋 Comandos Essenciais

```javascript
// 🆘 AJUDA
TEST_HELP()

// 📊 LISTAR
TEST_LIST_INTEGRATIONS()

// 🔄 RECOVERY
TEST_RESTORE('int-001')          // ERROR → OK
TEST_RESTORE('int-001', 5000)    // Com 5s de espera

// 📉 DEGRADAÇÃO
TEST_DEGRADE('int-001')          // OK → WARN → ERROR
TEST_DEGRADE('int-001', 1000)    // Mais rápido (1s entre mudanças)

// 🔁 CICLO
TEST_FULL_CYCLE('int-001')       // Ciclo completo

// 🔴 MÚLTIPLOS ERROS
TEST_MULTIPLE_ERRORS()           // Várias integrações

// 🔔 NOTIFICAÇÕES
TEST_RECOVERY_NOTIFICATIONS('int-001')

// 🤖 IA
TEST_AI_RECOVERY('int-001')

// ♻️ RESET
TEST_RESET_ALL()                 // Todas para OK
resetarLocalStorage()            // Reset completo
```

---

## 🔍 O Que Verificar

### **Na Página /integracoes:**
1. Status correto de cada integração
2. Cores do tema funcionando
3. Animação verde ao recuperar
4. Banner de sucesso temporário
5. Estatísticas atualizadas

### **No Console:**
1. Logs coloridos aparecem
2. Sem erros vermelhos
3. Funções TEST_* disponíveis

### **Em /logs:**
1. Log "Integração X restaurada" criado
2. Timestamp correto
3. Nível: INFO

### **Em /notificacoes:**
1. Notificação verde de sucesso
2. Mensagem clara
3. Link para /integracoes

---

## 🐛 Troubleshooting

### **Problema: Funções TEST_* não encontradas**
**Solução:**
```javascript
// Recarregar página (F5)
// Ou executar manualmente:
import('./utils/testActions.js')
```

### **Problema: Integrações não aparecem**
**Solução:**
```javascript
// Re-inicializar localStorage
resetarLocalStorage()
// Recarregar página (F5)
inicializarLocalStorage()
```

### **Problema: Console mostra erros**
**Solução:**
1. Limpar cache do navegador
2. Recarregar página (Ctrl+F5)
3. Verificar se todos os imports estão corretos

---

## 📊 Métricas e Estatísticas

```javascript
// Ver métricas de recovery
telemetry.getRecoveryMetrics()

// Retorna:
{
  totalErros: 5,
  totalRecuperacoes: 4,
  taxaRecuperacao: 80,
  mediaTempoDowntime: 2500
}

// Ver eventos de recovery
telemetry.getRecoveryEvents()

// Ver estatísticas gerais
telemetry.getStats()

// Ver histórico de automações
automationEngine.getExecutionHistory()
```

---

## 🎨 Temas

O sistema funciona perfeitamente em ambos os temas:

```javascript
// Alternar tema (se aplicável)
// O sistema detecta automaticamente e ajusta cores
```

**Cores usadas:**
- Success: Verde (#2a9d8f light / #6cd9b3 dark)
- Warning: Laranja (#f4a261 light / #ffb562 dark)
- Danger: Vermelho (#d90429 light / #ff6b6b dark)

---

## ✅ Checklist de Teste

- [ ] Executei `TEST_LIST_INTEGRATIONS()`
- [ ] Executei `TEST_RESTORE('int-001')`
- [ ] Vi card ficar verde
- [ ] Vi notificação de sucesso
- [ ] Verifiquei página de Logs
- [ ] Verifiquei página de Notificações
- [ ] Executei `TEST_FULL_CYCLE('int-001')`
- [ ] Executei `TEST_MULTIPLE_ERRORS()`
- [ ] Vi métricas com `telemetry.getRecoveryMetrics()`
- [ ] Sistema está funcionando 100%

---

## 🎓 Conceitos Principais

### **Recovery:**
Quando integração volta de ERROR → OK, o sistema:
1. Cria log de sucesso
2. Cria notificação verde
3. Fecha tickets automáticos
4. Limpa alertas
5. Reprocessa IA e Automações
6. Atualiza UI em tempo real

### **Degradação:**
Quando integração vai de OK → ERROR, o sistema:
1. Cria log de erro
2. Cria notificação crítica
3. Pode criar ticket automático
4. Dispara alertas
5. Atualiza UI com cores de aviso

### **Eventos Customizados:**
O sistema usa eventos do navegador para comunicação:
- `integracoes-updated` - Integrações mudaram
- `integracao-recuperada` - Integração recuperou
- `reprocessar-ai` - IA deve reprocessar
- `reprocessar-automations` - Automações devem reprocessar

---

## 📚 Documentação Completa

- **RECOVERY_SYSTEM.md** - Documentação técnica detalhada
- **RESUMO_RECOVERY.md** - Resumo executivo
- **GUIA_RAPIDO.md** - Este arquivo

---

## 🆘 Suporte

Se encontrar problemas:

1. **Limpar localStorage:**
   ```javascript
   resetarLocalStorage()
   ```

2. **Recarregar página completo:**
   ```
   Ctrl + Shift + R (Windows/Linux)
   Cmd + Shift + R (Mac)
   ```

3. **Verificar console:**
   - Não deve ter erros vermelhos
   - Deve ter mensagens de inicialização

4. **Verificar network:**
   - Todos os arquivos carregando
   - Sem erros 404

---

**Pronto para usar! 🚀**

Digite `TEST_HELP()` no console para começar.
