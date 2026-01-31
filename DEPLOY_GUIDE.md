# Guia de Deploy - HVDC Simulator

Este guia descreve como publicar a aplicação HVDC Simulator gratuitamente em Railway ou Render com banco de dados PostgreSQL.

---

## 📋 Pré-requisitos

- Conta no GitHub com o repositório do projeto
- Conta no Railway (https://railway.app) ou Render (https://render.com)
- Conta no Neon (PostgreSQL gratuito: https://neon.tech)

---

## 🚀 Opção 1: Deploy em Railway (Recomendado)

### Passo 1: Criar Banco de Dados PostgreSQL no Neon

1. Acesse https://neon.tech
2. Clique em "Sign Up"
3. Faça login com GitHub
4. Crie um novo projeto
5. Copie a connection string (DATABASE_URL)
   - Formato: `postgresql://user:password@host/database?sslmode=require`

### Passo 2: Subir Código no GitHub

```bash
cd hvdc_simulator
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/hvdc_simulator.git
git push -u origin main
```

### Passo 3: Deploy em Railway

1. Acesse https://railway.app
2. Clique em "New Project"
3. Selecione "Deploy from GitHub"
4. Conecte sua conta GitHub
5. Selecione o repositório `hvdc_simulator`
6. Railway vai detectar automaticamente que é Node.js
7. Clique em "Deploy"

### Passo 4: Configurar Variáveis de Ambiente

1. No Railway, vá para "Variables"
2. Adicione as seguintes variáveis:

```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
NODE_ENV=production
PORT=3000
JWT_SECRET=seu_secret_aleatorio_aqui
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
```

3. Clique em "Deploy"

### Passo 5: Acessar Aplicação

- Railway vai gerar uma URL automática (ex: `https://hvdc-simulator-production.up.railway.app`)
- Acesse essa URL no navegador

---

## 🚀 Opção 2: Deploy em Render

### Passo 1: Criar Banco de Dados PostgreSQL no Neon

(Mesmo processo da Opção 1)

### Passo 2: Subir Código no GitHub

(Mesmo processo da Opção 1)

### Passo 3: Deploy em Render

1. Acesse https://render.com
2. Clique em "New +"
3. Selecione "Web Service"
4. Conecte seu repositório GitHub
5. Preencha os dados:
   - **Name**: hvdc-simulator
   - **Environment**: Node
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `node dist/index.js`
   - **Instance Type**: Free

### Passo 4: Configurar Variáveis de Ambiente

1. No Render, vá para "Environment"
2. Adicione as mesmas variáveis da Opção 1
3. Clique em "Deploy"

### Passo 5: Acessar Aplicação

- Render vai gerar uma URL automática
- Acesse essa URL no navegador

---

## 🗄️ Banco de Dados PostgreSQL Gratuito

### Opção A: Neon (Recomendado)

1. Acesse https://neon.tech
2. Crie conta com GitHub
3. Crie um novo projeto
4. Copie a connection string

**Limite gratuito**: 3 projetos, 3GB storage

### Opção B: Render PostgreSQL

1. No Render, crie um "PostgreSQL Database"
2. Selecione plano Free
3. Copie a connection string

**Limite gratuito**: 1 banco, 256MB storage

---

## 🔧 Configuração do Banco de Dados

Depois de fazer deploy, execute as migrações:

```bash
# Localmente, antes de fazer push
pnpm db:push
```

Ou, se já estiver em produção:

```bash
# Via SSH no servidor
npm run db:push
```

---

## 📝 Variáveis de Ambiente Necessárias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://user:pass@host/db?sslmode=require` |
| `NODE_ENV` | Ambiente | `production` |
| `PORT` | Porta do servidor | `3000` |
| `JWT_SECRET` | Secret para JWT | `seu_secret_aleatorio` |
| `VITE_APP_ID` | ID da aplicação Manus | `seu_app_id` |
| `OAUTH_SERVER_URL` | URL do servidor OAuth | `https://api.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | URL do portal OAuth | `https://portal.manus.im` |

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'postgres'"

Solução: Certifique-se de que `postgres` está no `package.json`:
```json
"postgres": "^3.4.4"
```

### Erro: "DATABASE_URL not set"

Solução: Adicione a variável de ambiente na plataforma de deploy

### Erro: "Connection refused"

Solução: Verifique se a connection string do PostgreSQL está correta

---

## 📊 Monitoramento

### Railway
- Vá para "Logs" para ver logs em tempo real
- Vá para "Metrics" para monitorar uso de CPU/memória

### Render
- Vá para "Logs" para ver logs em tempo real
- Vá para "Metrics" para monitorar uso

---

## 🔄 Atualizar Aplicação

1. Faça commit e push das mudanças:
```bash
git add .
git commit -m "Sua mensagem"
git push origin main
```

2. Railway/Render detectam automaticamente e fazem redeploy

---

## 💰 Custos

- **Railway**: Gratuito até $5/mês
- **Render**: Gratuito (com limitações)
- **Neon PostgreSQL**: Gratuito (3 projetos, 3GB)

---

## 🎉 Pronto!

Sua aplicação está online! Acesse a URL gerada e comece a usar.

Para mais informações, consulte a documentação oficial:
- Railway: https://docs.railway.app
- Render: https://render.com/docs
- Neon: https://neon.tech/docs
