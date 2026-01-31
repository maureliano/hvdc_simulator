# Deploy 100% Gratuito em Replit

Este guia mostra como publicar a aplicação HVDC Simulator **completamente grátis** em Replit com backend, frontend e banco de dados, sem custos permanentes.

---

## ✅ Vantagens do Replit

- ✅ **100% Gratuito** - Sem cartão de crédito, sem limite de tempo
- ✅ **Full-Stack** - Frontend + Backend + Banco de dados tudo em um lugar
- ✅ **URL Pública** - Acesso permanente via URL
- ✅ **PostgreSQL Integrado** - Banco de dados gratuito
- ✅ **Sem Pausa** - Aplicação fica online 24/7 (com Replit Always On)
- ✅ **Fácil de Usar** - Interface visual intuitiva

---

## 🚀 Passo a Passo

### Passo 1: Criar Conta no Replit

1. Acesse https://replit.com
2. Clique em "Sign up"
3. Escolha "Sign up with GitHub" (recomendado)
4. Autorize o Replit a acessar sua conta GitHub

### Passo 2: Importar Projeto do GitHub

1. No Replit, clique em "Create" → "Import from GitHub"
2. Cole a URL do seu repositório GitHub:
   ```
   https://github.com/seu-usuario/hvdc_simulator
   ```
3. Clique em "Import"
4. Replit vai clonar o projeto automaticamente

### Passo 3: Configurar Banco de Dados PostgreSQL

1. No Replit, clique em "Tools" → "Database"
2. Selecione "PostgreSQL"
3. Clique em "Create Database"
4. Replit vai criar um banco de dados gratuito automaticamente
5. Copie a connection string que aparece

### Passo 4: Configurar Variáveis de Ambiente

1. No Replit, clique em "Secrets" (ícone de cadeado)
2. Adicione as seguintes variáveis:

```
DATABASE_URL=postgresql://user:password@localhost/database
NODE_ENV=production
PORT=3000
JWT_SECRET=seu_secret_aleatorio_muito_longo_aqui
VITE_APP_ID=hvdc_simulator
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
```

**Nota**: O `DATABASE_URL` é preenchido automaticamente pelo Replit

### Passo 5: Instalar Dependências

1. Abra o terminal do Replit
2. Execute:

```bash
pnpm install
```

### Passo 6: Executar Migrações do Banco de Dados

1. No terminal, execute:

```bash
pnpm db:push
```

Isso vai criar todas as tabelas no banco de dados.

### Passo 7: Iniciar a Aplicação

1. Clique em "Run" (botão verde no topo)
2. Replit vai compilar e iniciar a aplicação
3. Você verá a URL pública no console:
   ```
   Server running on https://seu-replit-url.replit.dev
   ```

### Passo 8: Acessar a Aplicação

1. Clique na URL gerada ou copie-a
2. Abra em um novo navegador
3. Pronto! Sua aplicação está online

---

## 📝 Estrutura de Arquivos no Replit

```
hvdc_simulator/
├── client/                 # Frontend React
├── server/                 # Backend Express
├── drizzle/               # Migrações do banco
├── package.json           # Dependências
├── Dockerfile             # Configuração Docker
└── .replit                # Configuração do Replit (criada automaticamente)
```

---

## 🔄 Atualizar Aplicação

### Opção 1: Via GitHub (Recomendado)

1. Faça mudanças localmente
2. Commit e push no GitHub:
   ```bash
   git add .
   git commit -m "Sua mensagem"
   git push origin main
   ```
3. No Replit, clique em "Version Control" → "Pull from GitHub"
4. Replit vai atualizar automaticamente

### Opção 2: Editar Diretamente no Replit

1. Abra os arquivos no editor do Replit
2. Faça as mudanças
3. Clique em "Run" para testar
4. Commit e push automaticamente

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'postgres'"

**Solução:**
```bash
pnpm install postgres
```

### Erro: "DATABASE_URL not set"

**Solução:**
1. Clique em "Secrets"
2. Verifique se `DATABASE_URL` está configurado
3. Clique em "Run" novamente

### Erro: "Port 3000 already in use"

**Solução:**
1. Clique em "Stop" para parar a aplicação
2. Aguarde 5 segundos
3. Clique em "Run" novamente

### Aplicação Lenta ou Travando

**Solução:**
- Replit Free tem limitações de RAM (0.5GB)
- Para melhor performance, considere upgrade (opcional)
- Ou use outra plataforma como Glitch

---

## 💡 Dicas

### 1. Manter Aplicação Online 24/7

Replit Free pausa após 1 hora de inatividade. Para manter online:

**Opção A: Usar Replit Always On (Pago)**
- Clique em "Upgrade" para ativar Always On
- Custa ~$7/mês

**Opção B: Usar Uptime Robot (Gratuito)**
1. Acesse https://uptimerobot.com
2. Crie conta gratuita
3. Adicione monitor para sua URL do Replit
4. Configure para fazer ping a cada 5 minutos
5. Isso mantém sua aplicação acordada

### 2. Backup do Banco de Dados

1. No Replit, abra o terminal
2. Execute:
   ```bash
   pg_dump $DATABASE_URL > backup.sql
   ```
3. Baixe o arquivo `backup.sql`

### 3. Adicionar Domínio Customizado

1. No Replit, vá para "Settings" → "Domains"
2. Adicione seu domínio
3. Configure DNS no seu registrador

---

## 📊 Limites Gratuitos do Replit

| Recurso | Limite |
|---------|--------|
| RAM | 0.5GB |
| Armazenamento | 5GB |
| Banco de Dados | 1GB |
| Conexões Simultâneas | 10 |
| Tempo de Execução | Ilimitado |
| Uptime | ~99% (com pausa) |

---

## 🎉 Pronto!

Sua aplicação está online **100% gratuitamente**!

**URL**: `https://seu-replit-url.replit.dev`

Para mais informações, consulte:
- Documentação Replit: https://docs.replit.com
- Comunidade Replit: https://replit.com/community

---

## 🚀 Próximos Passos

1. **Testar todas as funcionalidades** - Alarmes, tendências, pesquisa
2. **Adicionar Uptime Robot** - Para manter online 24/7 gratuitamente
3. **Compartilhar URL** - Envie para colegas/orientador
4. **Fazer backup** - Regularmente faça backup do banco de dados

Divirta-se! 🎊
