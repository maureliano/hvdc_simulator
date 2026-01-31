# 🚀 Guia Completo: Deploy em AWS Lightsail

Este guia fornece instruções passo a passo para fazer deploy do **HVDC Simulator** em uma instância AWS Lightsail com PostgreSQL, Node.js e Nginx.

---

## 📋 Pré-requisitos

- Conta AWS ativa (com créditos gratuitos ou cartão de crédito)
- Git instalado localmente
- Código do projeto no GitHub
- Conhecimento básico de terminal/SSH

---

## 💰 Custos Estimados

| Serviço | Plano | Custo Mensal |
|---------|-------|-------------|
| Lightsail (1GB RAM, 1 vCPU) | Básico | $5-10 USD |
| PostgreSQL Managed Database | Básico | $15 USD |
| Transferência de dados | Primeiros 100GB | Grátis |
| **Total** | | **~$20-25 USD/mês** |

**Nota:** AWS oferece 12 meses gratuitos para novos usuários. Lightsail tem $200 em créditos gratuitos nos primeiros 2 meses.

---

## 🎯 Passo 1: Criar Instância Lightsail

### 1.1 Acessar AWS Lightsail

1. Acesse **https://lightsail.aws.amazon.com**
2. Clique em **"Create instance"**
3. Escolha a localização (recomendado: São Paulo `sa-east-1`)

### 1.2 Configurar a Instância

| Configuração | Valor |
|-------------|-------|
| **Platform** | Linux/Unix |
| **Blueprint** | Ubuntu 22.04 LTS |
| **Instance Plan** | $5/mês (1GB RAM, 1 vCPU, 40GB SSD) |
| **Instance Name** | `hvdc-simulator` |

4. Clique em **"Create instance"**
5. Aguarde 2-3 minutos para a instância iniciar

### 1.3 Configurar Firewall

1. Na página da instância, clique em **"Networking"**
2. Clique em **"Add rule"** e configure:

| Protocolo | Porta | Origem |
|-----------|-------|--------|
| TCP | 22 | Seu IP (ou 0.0.0.0/0 para qualquer lugar) |
| TCP | 80 | 0.0.0.0/0 (HTTP) |
| TCP | 443 | 0.0.0.0/0 (HTTPS) |
| TCP | 5432 | Seu IP (PostgreSQL - apenas seu IP!) |

---

## 🗄️ Passo 2: Criar Banco de Dados PostgreSQL

### 2.1 Criar Database Managed

1. No menu Lightsail, clique em **"Databases"**
2. Clique em **"Create database"**
3. Configure:

| Configuração | Valor |
|-------------|-------|
| **Engine** | PostgreSQL 14 |
| **Plan** | $15/mês (1GB RAM) |
| **Database Name** | `hvdc_simulator` |
| **Master Username** | `postgres` |
| **Master Password** | (gere uma senha forte) |
| **Region** | São Paulo (sa-east-1) |

4. Clique em **"Create database"**
5. Aguarde 5-10 minutos para criar

### 2.2 Obter Connection String

1. Quando o banco estiver pronto, clique nele
2. Na aba **"Connection details"**, copie a **Endpoint** (exemplo: `ls-abc123.cq1234567890.sa-east-1.rds.amazonaws.com`)
3. Construa a connection string:

```
postgresql://postgres:SUA_SENHA@ls-abc123.cq1234567890.sa-east-1.rds.amazonaws.com:5432/hvdc_simulator
```

---

## 💻 Passo 3: Conectar à Instância Lightsail

### 3.1 Obter Chave SSH

1. Na página da instância Lightsail, clique em **"Connect using SSH"**
2. Ou baixe a chave privada em **"Account"** → **"SSH keys"**

### 3.2 Conectar via Terminal

```bash
# Se baixou a chave privada
chmod 600 ~/Downloads/LightsailDefaultKey.pem
ssh -i ~/Downloads/LightsailDefaultKey.pem ubuntu@SEU_IP_PUBLICO

# Ou use o navegador (clique em "Connect using SSH")
```

### 3.3 Atualizar Sistema

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

---

## 🛠️ Passo 4: Instalar Dependências

### 4.1 Instalar Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

### 4.2 Instalar pnpm

```bash
npm install -g pnpm
pnpm --version
```

### 4.3 Instalar Nginx

```bash
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4.4 Instalar Git

```bash
sudo apt-get install -y git
git --version
```

---

## 📦 Passo 5: Fazer Deploy do Projeto

### 5.1 Clonar Repositório

```bash
cd /home/ubuntu
git clone https://github.com/SEU_USUARIO/hvdc_simulator.git
cd hvdc_simulator
```

### 5.2 Instalar Dependências

```bash
pnpm install
```

### 5.3 Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql://postgres:SUA_SENHA@ls-abc123.cq1234567890.sa-east-1.rds.amazonaws.com:5432/hvdc_simulator

# OAuth (Manus)
JWT_SECRET=$(openssl rand -base64 32)
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Outros
NODE_ENV=production
PORT=3000
EOF
```

### 5.4 Executar Migrations

```bash
pnpm db:push
```

### 5.5 Build do Projeto

```bash
pnpm build
```

---

## 🔧 Passo 6: Configurar Nginx como Reverse Proxy

### 6.1 Criar Configuração Nginx

```bash
sudo nano /etc/nginx/sites-available/hvdc-simulator
```

Cole o seguinte conteúdo:

```nginx
upstream hvdc_app {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name SEU_DOMINIO.com;

    # Redirecionar HTTP para HTTPS (opcional, se usar SSL)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://hvdc_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Servir arquivos estáticos com cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 6.2 Ativar Configuração

```bash
sudo ln -s /etc/nginx/sites-available/hvdc-simulator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🚀 Passo 7: Executar Aplicação com PM2

### 7.1 Instalar PM2

```bash
sudo npm install -g pm2
```

### 7.2 Criar Arquivo de Configuração PM2

```bash
cat > /home/ubuntu/hvdc_simulator/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'hvdc-simulator',
      script: 'dist/server/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/home/ubuntu/hvdc_simulator/logs/err.log',
      out_file: '/home/ubuntu/hvdc_simulator/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};
EOF
```

### 7.3 Iniciar Aplicação

```bash
cd /home/ubuntu/hvdc_simulator
pm2 start ecosystem.config.js
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### 7.4 Verificar Status

```bash
pm2 status
pm2 logs hvdc-simulator
```

---

## 🔒 Passo 8: Configurar SSL/HTTPS (Opcional mas Recomendado)

### 8.1 Instalar Certbot

```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

### 8.2 Obter Certificado Let's Encrypt

```bash
sudo certbot certonly --nginx -d SEU_DOMINIO.com
```

### 8.3 Atualizar Configuração Nginx

```bash
sudo nano /etc/nginx/sites-available/hvdc-simulator
```

Adicione após `server_name`:

```nginx
listen 443 ssl;
ssl_certificate /etc/letsencrypt/live/SEU_DOMINIO.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/SEU_DOMINIO.com/privkey.pem;

# Redirecionar HTTP para HTTPS
server {
    listen 80;
    server_name SEU_DOMINIO.com;
    return 301 https://$server_name$request_uri;
}
```

### 8.4 Renovar Certificado Automaticamente

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 📊 Passo 9: Monitoramento e Manutenção

### 9.1 Verificar Logs

```bash
# Logs da aplicação
pm2 logs hvdc-simulator

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs do sistema
sudo journalctl -u nginx -f
```

### 9.2 Reiniciar Aplicação

```bash
pm2 restart hvdc-simulator
```

### 9.3 Atualizar Código

```bash
cd /home/ubuntu/hvdc_simulator
git pull origin main
pnpm install
pnpm build
pm2 restart hvdc-simulator
```

---

## 🆘 Troubleshooting

### Problema: "Connection refused" ao acessar aplicação

**Solução:**
```bash
# Verificar se aplicação está rodando
pm2 status

# Verificar se porta 3000 está aberta
sudo netstat -tlnp | grep 3000

# Verificar logs
pm2 logs hvdc-simulator
```

### Problema: "Cannot connect to database"

**Solução:**
```bash
# Verificar DATABASE_URL
cat /home/ubuntu/hvdc_simulator/.env

# Testar conexão
psql postgresql://postgres:SENHA@endpoint:5432/hvdc_simulator -c "SELECT 1;"
```

### Problema: "502 Bad Gateway" no Nginx

**Solução:**
```bash
# Verificar configuração Nginx
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Verificar logs
sudo tail -f /var/log/nginx/error.log
```

### Problema: Aplicação consome muita memória

**Solução:**
```bash
# Limitar memória no PM2
pm2 start ecosystem.config.js --max-memory-restart 512M

# Monitorar uso
pm2 monit
```

---

## 📈 Dicas de Otimização

### 1. Aumentar Limite de Conexões

```bash
sudo nano /etc/security/limits.conf
# Adicionar:
# * soft nofile 65535
# * hard nofile 65535
```

### 2. Otimizar Nginx

```bash
sudo nano /etc/nginx/nginx.conf
# Aumentar worker_connections para 2048
```

### 3. Backup Automático do Banco

```bash
# Criar script de backup
cat > /home/ubuntu/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p $BACKUP_DIR
pg_dump postgresql://postgres:SENHA@endpoint:5432/hvdc_simulator | gzip > $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql.gz
# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "backup-*.sql.gz" -mtime +7 -delete
EOF

# Tornar executável
chmod +x /home/ubuntu/backup-db.sh

# Agendar com cron (diariamente às 2 da manhã)
crontab -e
# Adicionar: 0 2 * * * /home/ubuntu/backup-db.sh
```

---

## ✅ Checklist de Deploy

- [ ] Instância Lightsail criada e rodando
- [ ] Banco de dados PostgreSQL criado
- [ ] Firewall configurado (portas 22, 80, 443)
- [ ] SSH conectado com sucesso
- [ ] Node.js e pnpm instalados
- [ ] Repositório clonado
- [ ] Variáveis de ambiente configuradas
- [ ] Migrations executadas
- [ ] Build realizado
- [ ] Nginx configurado
- [ ] PM2 iniciado e aplicação rodando
- [ ] Aplicação acessível via navegador
- [ ] SSL/HTTPS configurado (opcional)
- [ ] Backups agendados

---

## 🎉 Próximos Passos

1. **Configurar domínio personalizado** - Apontar DNS para IP da instância Lightsail
2. **Implementar CI/CD** - GitHub Actions para deploy automático
3. **Monitorar performance** - Usar CloudWatch ou ferramentas como New Relic
4. **Escalar aplicação** - Adicionar mais instâncias se necessário

---

## 📞 Suporte

Para dúvidas sobre AWS Lightsail, consulte a [documentação oficial](https://lightsail.aws.amazon.com/ls/docs/pt_BR/articles/amazon-lightsail-overview).

Para dúvidas sobre o projeto HVDC Simulator, consulte os guias inclusos no repositório.
