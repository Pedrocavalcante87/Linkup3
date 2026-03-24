# 🚀 SETUP — Como Rodar o LinkUp³ do Zero

**Versão:** 1.0 | **Atualizado:** 23/03/2026
**Status do backend:** ⚠️ Em desenvolvimento ativo

---

## ⚠️ Antes de Começar — Leia Isso

O projeto tem **dois modos de operação**:

| Modo                              | Quando usar                                | Como ligar           |
| --------------------------------- | ------------------------------------------ | -------------------- |
| **Mock (frontend isolado)**       | Desenvolvimento de UI, sem precisar da API | Só rodar o frontend  |
| **API Real (frontend + backend)** | Testar integração, desenvolver novas rotas | Rodar os dois juntos |

O frontend detecta automaticamente se a API está rodando. Se não estiver, cai em comportamento undefined — **sempre suba os dois** ao trabalhar no backend.

---

## 📋 Pré-requisitos

| Ferramenta | Versão mínima | Verificar com   |
| ---------- | ------------- | --------------- |
| Node.js    | 18+           | `node -v`       |
| npm        | 9+            | `npm -v`        |
| Git        | qualquer      | `git --version` |

---

## 📁 Estrutura do Workspace

```
linkup3_full/
├── linkup3/          ← Frontend React + Vite (porta 5173)
├── linkup3-api/      ← Backend Express + Prisma (porta 3001)
└── Documents/        ← Toda a documentação
```

---

## 1️⃣ Clonando / Abrindo o Projeto

```bash
# Se for clone novo:
git clone <url-do-repositorio>
cd linkup3_full

# Se já tem o projeto localmente, apenas abra o VS Code na pasta linkup3_full
```

---

## 2️⃣ Configurando o Backend (`linkup3-api`)

### 2.1 Instalar dependências

```bash
cd linkup3-api
npm install
```

### 2.2 Criar o arquivo `.env`

Crie o arquivo `linkup3-api/.env` com o conteúdo abaixo:

```env
# Banco de dados SQLite (arquivo local — não precisa instalar nada)
DATABASE_URL="file:./prisma/dev.db"

# Chave secreta para assinar os tokens JWT
# Em produção: use uma string longa e aleatória (min 32 caracteres)
JWT_SECRET="linkup3-dev-secret-key-2026"

# Porta do servidor (padrão 3001)
PORT=3001

# Ambiente
NODE_ENV=development
```

> **Importante:** O arquivo `.env` NÃO deve ser commitado no Git. Cada dev cria o seu.

### 2.3 Criar e popular o banco de dados

```bash
# Dentro de linkup3-api/

# 1. Aplica as migrations (cria as tabelas no SQLite)
npm run db:migrate

# 2. Popula o banco com dados iniciais
npm run seed
```

**Após o seed, os seguintes usuários estarão disponíveis:**

| Email                | Senha        | Role    |
| -------------------- | ------------ | ------- |
| admin@linkup3.com    | linkup3@2026 | admin   |
| analista@linkup3.com | linkup3@2026 | analyst |
| usuario@linkup3.com  | linkup3@2026 | user    |

### 2.4 Rodar o servidor

```bash
# Modo desenvolvimento (reinicia ao salvar arquivos)
npm run dev

# Modo produção
npm start
```

**Servidor disponível em:** `http://localhost:3001`
**Documentação Swagger:** `http://localhost:3001/docs`

---

## 3️⃣ Configurando o Frontend (`linkup3`)

### 3.1 Instalar dependências

```bash
cd linkup3
npm install
```

### 3.2 Configurar variável de ambiente (opcional)

Por padrão, o frontend aponta para `http://localhost:3001`.
Se precisar mudar, crie `linkup3/.env`:

```env
VITE_API_URL=http://localhost:3001
```

### 3.3 Rodar o frontend

```bash
npm run dev
```

**Frontend disponível em:** `http://localhost:5173`

---

## 4️⃣ Rodando Tudo Junto (recomendado)

Use dois terminais simultâneos:

**Terminal 1 — Backend:**

```bash
cd linkup3-api
npm run dev
```

**Terminal 2 — Frontend:**

```bash
cd linkup3
npm run dev
```

Depois acesse: **http://localhost:5173**

---

## 🔄 Comandos Úteis do Backend

| Comando              | O que faz                                        |
| -------------------- | ------------------------------------------------ |
| `npm run dev`        | Inicia servidor com hot-reload (nodemon)         |
| `npm start`          | Inicia servidor sem hot-reload                   |
| `npm run seed`       | Popula o banco com dados iniciais                |
| `npm run db:migrate` | Aplica migrations pendentes                      |
| `npm run db:reset`   | **DESTRÓI** o banco e recria do zero             |
| `npm run db:studio`  | Abre o Prisma Studio (interface visual do banco) |

> **`db:reset` é destrutivo** — apaga todos os dados. Só use em dev quando precisar começar do zero.

---

## 🔄 Comandos Úteis do Frontend

| Comando           | O que faz                              |
| ----------------- | -------------------------------------- |
| `npm run dev`     | Inicia em modo desenvolvimento         |
| `npm run build`   | Gera build de produção em `dist/`      |
| `npm run preview` | Prévia do build de produção localmente |

---

## 🛠️ Problemas Comuns

### "Cannot find module" ou erros de import

```bash
# Reinstala as dependências do zero
rm -rf node_modules
npm install
```

### Banco de dados corrompido ou inconsistente

```bash
cd linkup3-api
npm run db:reset   # ⚠️ apaga tudo
npm run seed       # repopula
```

### Porta já em uso

```bash
# Ver qual processo está usando a porta 3001 (Windows)
netstat -ano | findstr :3001

# Matar o processo (substitua pelo PID encontrado)
taskkill /PID <numero_pid> /F
```

### CORS bloqueando requisições

Verifique se o frontend está rodando em `localhost:5173` ou `localhost:3000`.
Outras origens precisam ser adicionadas em `linkup3-api/src/app.js` (array `origin` do CORS).

### Token JWT expirado

Faça logout e login novamente. O token expira em 8h (configurado no `auth.js`).

---

## 🔍 Verificação Rápida

Após subir tudo, teste:

```bash
# Verificar se a API está de pé
curl http://localhost:3001/health
# Esperado: {"status":"ok","timestamp":"..."}

# Ou no navegador, acesse:
# http://localhost:3001/docs     ← Swagger UI
# http://localhost:5173          ← Frontend
```

---

## 📚 Próximos passos

- Entender a API: veja [BACKEND_API.md](BACKEND_API.md)
- Entender o frontend: veja [ARQUITETURA_FRONTEND.md](ARQUITETURA_FRONTEND.md)
- Testar o sistema de recovery: veja [GUIA_RAPIDO.md](GUIA_RAPIDO.md)
