# Guia de Deployment - HVDC Simulator no Google Cloud Shell

Este guia fornece instruções completas para implementar o HVDC Simulator no Google Cloud Shell, incluindo configuração de ambiente, instalação de dependências e execução da aplicação.

---

## 📋 Pré-requisitos

- Conta Google Cloud Platform (GCP)
- Acesso ao Google Cloud Shell
- Conhecimento básico de terminal Linux

---

## 🚀 Passo a Passo de Deployment

### Passo 1: Acessar Google Cloud Shell

1. Acesse o [Google Cloud Console](https://console.cloud.google.com)
2. Clique no ícone do **Cloud Shell** no canto superior direito (ícone de terminal)
3. Aguarde o ambiente inicializar

### Passo 2: Clonar ou Fazer Upload do Projeto

**Opção A: Upload via Cloud Shell**

```bash
# No Cloud Shell, faça upload dos arquivos do projeto
# Use o botão "Upload" no menu do Cloud Shell
# Ou use o comando abaixo para criar o diretório
mkdir -p ~/hvdc_simulator
cd ~/hvdc_simulator
```

**Opção B: Clonar de um repositório Git (se disponível)**

```bash
git clone <seu-repositorio-git> ~/hvdc_simulator
cd ~/hvdc_simulator
```

### Passo 3: Instalar Node.js 22 e PNPM

O Google Cloud Shell vem com Node.js, mas precisamos da versão 22:

```bash
# Instalar NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recarregar configurações do shell
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Instalar Node.js 22
nvm install 22
nvm use 22
nvm alias default 22

# Verificar versão
node --version  # Deve mostrar v22.x.x

# Instalar PNPM globalmente
npm install -g pnpm

# Verificar instalação
pnpm --version
```

### Passo 4: Instalar Python e Pandapower

```bash
# Atualizar pip
python3 -m pip install --upgrade pip

# Instalar Pandapower e dependências
pip3 install --user pandapower numpy matplotlib scipy

# Verificar instalação
python3 -c "import pandapower; print('Pandapower version:', pandapower.__version__)"
```

### Passo 5: Configurar Banco de Dados

**Opção A: Usar SQLite (Desenvolvimento/Teste)**

```bash
# Criar arquivo .env
cat > .env << 'EOF'
DATABASE_URL=file:./dev.db
NODE_ENV=development
PORT=8080
EOF
```

**Opção B: Usar Cloud SQL MySQL (Produção)**

```bash
# 1. Criar instância Cloud SQL no console GCP
# 2. Obter string de conexão
# 3. Configurar .env

cat > .env << 'EOF'
DATABASE_URL=mysql://usuario:senha@/nome_banco?host=/cloudsql/projeto:regiao:instancia
NODE_ENV=production
PORT=8080
EOF
```

### Passo 6: Instalar Dependências do Projeto

```bash
cd ~/hvdc_simulator

# Instalar dependências Node.js
pnpm install

# Aplicar migrações do banco de dados
pnpm db:push
```

### Passo 7: Build da Aplicação

```bash
# Compilar aplicação para produção
pnpm build
```

### Passo 8: Iniciar o Servidor

**Modo Desenvolvimento:**

```bash
pnpm dev
```

**Modo Produção:**

```bash
pnpm start
```

### Passo 9: Acessar a Aplicação

O Google Cloud Shell fornece um recurso de "Web Preview":

1. Clique no botão **Web Preview** no Cloud Shell
2. Selecione **Preview on port 8080** (ou a porta configurada)
3. Uma nova aba será aberta com a aplicação

**Ou acesse via URL:**

```
https://8080-<seu-cloud-shell-url>.cloudshell.dev
```

---

## 🔧 Configurações Avançadas

### Variáveis de Ambiente Necessárias

Crie um arquivo `.env` completo:

```bash
cat > .env << 'EOF'
# Banco de Dados
DATABASE_URL=mysql://user:password@host:3306/hvdc_simulator

# Servidor
NODE_ENV=production
PORT=8080

# JWT Secret (gerar com: openssl rand -base64 32)
JWT_SECRET=sua_chave_secreta_aqui

# OAuth (se necessário)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Outros
OWNER_OPEN_ID=seu_open_id
OWNER_NAME=Seu Nome
EOF
```

### Executar em Background

Para manter a aplicação rodando mesmo após fechar o Cloud Shell:

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicação com PM2
pm2 start npm --name "hvdc-simulator" -- start

# Ver logs
pm2 logs hvdc-simulator

# Parar aplicação
pm2 stop hvdc-simulator

# Reiniciar
pm2 restart hvdc-simulator
```

### Configurar Firewall (se necessário)

```bash
# Permitir tráfego na porta 8080
gcloud compute firewall-rules create allow-hvdc-simulator \
  --allow tcp:8080 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow HVDC Simulator access"
```

---

## 🐳 Deployment com Docker (Alternativa)

### Criar Dockerfile

```dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar Python e Pandapower
RUN apk add --no-cache python3 py3-pip gcc musl-dev python3-dev
RUN pip3 install pandapower numpy matplotlib scipy

# Copiar arquivos do projeto
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Imagem de produção
FROM node:22-alpine

WORKDIR /app

# Instalar Python e Pandapower
RUN apk add --no-cache python3 py3-pip
RUN pip3 install pandapower numpy matplotlib scipy

# Copiar arquivos compilados
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/server ./server
COPY --from=builder /app/drizzle ./drizzle

EXPOSE 8080

CMD ["node", "dist/index.js"]
```

### Build e Deploy com Docker

```bash
# Build da imagem
docker build -t hvdc-simulator .

# Executar container
docker run -d -p 8080:8080 \
  -e DATABASE_URL="sua_database_url" \
  -e JWT_SECRET="sua_chave_secreta" \
  --name hvdc-simulator \
  hvdc-simulator

# Ver logs
docker logs -f hvdc-simulator
```

---

## 📊 Monitoramento e Logs

### Ver Logs da Aplicação

```bash
# Logs em tempo real
tail -f logs/app.log

# Últimas 100 linhas
tail -n 100 logs/app.log

# Buscar erros
grep -i error logs/app.log
```

### Verificar Status do Servidor

```bash
# Verificar se o processo está rodando
ps aux | grep node

# Verificar porta em uso
netstat -tulpn | grep 8080

# Testar endpoint
curl http://localhost:8080/api/health
```

---

## 🔒 Segurança

### Recomendações de Segurança

1. **Nunca commitar o arquivo `.env`** com credenciais reais
2. **Usar HTTPS em produção** (configurar certificado SSL)
3. **Limitar acesso ao banco de dados** (whitelist de IPs)
4. **Rotacionar JWT_SECRET regularmente**
5. **Implementar rate limiting** para APIs
6. **Manter dependências atualizadas**:

```bash
pnpm update
pip3 install --upgrade pandapower
```

---

## 🐛 Troubleshooting

### Erro: "Module 'pandapower' not found"

```bash
# Verificar instalação
python3 -c "import pandapower"

# Reinstalar se necessário
pip3 install --user --force-reinstall pandapower
```

### Erro: "Port 8080 already in use"

```bash
# Encontrar processo usando a porta
lsof -i :8080

# Matar processo
kill -9 <PID>

# Ou usar outra porta
PORT=8081 pnpm start
```

### Erro: "Database connection failed"

```bash
# Verificar string de conexão no .env
cat .env | grep DATABASE_URL

# Testar conexão com banco
pnpm db:push
```

### Aplicação lenta ou travando

```bash
# Verificar uso de recursos
top

# Verificar memória
free -h

# Limpar cache do Node
rm -rf node_modules/.cache
```

---

## 📦 Backup e Restore

### Backup do Banco de Dados

```bash
# MySQL
mysqldump -u usuario -p hvdc_simulator > backup_$(date +%Y%m%d).sql

# SQLite
cp dev.db backup_$(date +%Y%m%d).db
```

### Restore do Banco de Dados

```bash
# MySQL
mysql -u usuario -p hvdc_simulator < backup_20260125.sql

# SQLite
cp backup_20260125.db dev.db
```

---

## 🔄 Atualização da Aplicação

```bash
cd ~/hvdc_simulator

# Fazer backup
cp -r . ../hvdc_simulator_backup

# Atualizar código (git pull ou upload novos arquivos)
git pull origin main

# Reinstalar dependências
pnpm install

# Aplicar migrações
pnpm db:push

# Rebuild
pnpm build

# Reiniciar servidor
pm2 restart hvdc-simulator
```

---

## 📞 Suporte

Para problemas ou dúvidas:

1. Verificar logs da aplicação
2. Consultar documentação do Pandapower: https://pandapower.readthedocs.io
3. Verificar status do Google Cloud: https://status.cloud.google.com

---

## ✅ Checklist de Deployment

- [ ] Node.js 22 instalado
- [ ] PNPM instalado
- [ ] Python 3 e Pandapower instalados
- [ ] Banco de dados configurado
- [ ] Arquivo .env criado com todas as variáveis
- [ ] Dependências instaladas (`pnpm install`)
- [ ] Migrações aplicadas (`pnpm db:push`)
- [ ] Build realizado (`pnpm build`)
- [ ] Servidor iniciado
- [ ] Aplicação acessível via Web Preview
- [ ] Testes executados com sucesso
- [ ] Logs monitorados

---

**Deployment concluído com sucesso! 🎉**
