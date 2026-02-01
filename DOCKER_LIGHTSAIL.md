# 🐳 Rodar HVDC Simulator em Docker no AWS Lightsail

Este guia fornece instruções passo a passo para rodar a aplicação completa (Node.js + PostgreSQL + Nginx) em Docker no AWS Lightsail.

---

## 📋 Pré-requisitos

- Instância AWS Lightsail (recomendado: 2GB RAM mínimo)
- Amazon Linux 2 ou Ubuntu 22.04
- Acesso SSH à instância

---

## 🚀 Passo 1: Conectar à Instância Lightsail

```bash
# Conectar via SSH
ssh -i ~/Downloads/LightsailDefaultKey.pem ec2-user@SEU_IP_PUBLICO

# Ou para Ubuntu:
ssh -i ~/Downloads/LightsailDefaultKey.pem ubuntu@SEU_IP_PUBLICO
```

---

## 🐳 Passo 2: Instalar Docker

### Para Amazon Linux 2:

```bash
# Atualizar sistema
sudo yum update -y

# Instalar Docker
sudo yum install -y docker

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Iniciar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Adicionar usuário ao grupo docker
sudo usermod -aG docker ec2-user

# Aplicar novo grupo (sem logout)
newgrp docker
```

### Para Ubuntu 22.04:

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
sudo apt install -y docker.io docker-compose

# Iniciar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Adicionar usuário ao grupo docker
sudo usermod -aG docker ubuntu

# Aplicar novo grupo
newgrp docker
```

---

## ✅ Passo 3: Verificar Instalação

```bash
docker --version
docker-compose --version
```

Deve aparecer algo como:
```
Docker version 24.x.x
Docker Compose version 2.x.x
```

---

## 📥 Passo 4: Clonar Repositório

```bash
# Clonar projeto
git clone https://github.com/SEU_USUARIO/hvdc_simulator.git
cd hvdc_simulator

# Verificar arquivos Docker
ls -la | grep -i docker
```

Deve aparecer:
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`

---

## ⚙️ Passo 5: Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/hvdc_simulator

# OAuth (deixe como está ou em branco para modo standalone)
JWT_SECRET=seu-secret-key-aqui-pode-ser-qualquer-coisa
VITE_APP_ID=dev-local
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Application
NODE_ENV=production
PORT=3000
EOF
```

---

## 🐳 Passo 6: Build e Iniciar Containers

```bash
# Build da imagem Docker
docker-compose build

# Iniciar containers (PostgreSQL + App + Nginx)
docker-compose up -d

# Verificar status
docker-compose ps
```

Deve aparecer algo como:
```
NAME                 STATUS
hvdc-postgres        Up 2 minutes (healthy)
hvdc-app             Up 1 minute
hvdc-nginx           Up 1 minute
```

---

## 🗃️ Passo 7: Executar Migrations

```bash
# Executar migrations no container
docker-compose exec app npm run db:push
```

Deve aparecer:
```
✓ Migrations executed successfully
```

---

## 🌐 Passo 8: Acessar Aplicação

Abra no navegador:

```
http://SEU_IP_PUBLICO
```

Você verá a aplicação rodando! 🎉

---

## 📝 Comandos Úteis

| Comando | O que faz |
|---------|-----------|
| `docker-compose up -d` | Iniciar containers em background |
| `docker-compose down` | Parar e remover containers |
| `docker-compose ps` | Ver status dos containers |
| `docker-compose logs app` | Ver logs da aplicação |
| `docker-compose logs postgres` | Ver logs do banco |
| `docker-compose exec app npm run db:push` | Executar migrations |
| `docker-compose restart app` | Reiniciar aplicação |
| `docker-compose pull` | Atualizar imagens |

---

## 🆘 Troubleshooting

### Erro: "Cannot connect to Docker daemon"

```bash
# Iniciar Docker
sudo systemctl start docker

# Ou adicionar ao grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

### Erro: "database hvdc_simulator already exists"

Isso é normal na primeira execução. Continue para o próximo passo.

### Erro: "Connection refused"

Aguarde 30 segundos para o PostgreSQL iniciar:

```bash
# Verificar logs
docker-compose logs postgres

# Reiniciar
docker-compose restart
```

### Porta 3000 ou 80 já em uso

```bash
# Ver portas em uso
sudo netstat -tulpn | grep LISTEN

# Matar processo
sudo kill -9 PID
```

---

## 🔄 Atualizar Código

Quando houver atualizações no GitHub:

```bash
# Puxar código
git pull origin main

# Rebuild
docker-compose build

# Reiniciar
docker-compose up -d

# Migrations (se houver)
docker-compose exec app npm run db:push
```

---

## 🔒 Configurar SSL/HTTPS

### Opção 1: Let's Encrypt (Recomendado)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx  # Ubuntu
# ou
sudo yum install -y certbot python3-certbot-nginx  # Amazon Linux

# Obter certificado
sudo certbot certonly --standalone -d seu-dominio.com

# Copiar certificados para projeto
sudo cp /etc/letsencrypt/live/seu-dominio.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/seu-dominio.com/privkey.pem ./ssl/
sudo chown $USER:$USER ./ssl/*

# Atualizar nginx.conf para usar SSL
# (veja seção nginx.conf abaixo)

# Reiniciar
docker-compose restart nginx
```

### Opção 2: Auto-renovação com Certbot

```bash
# Adicionar cron job
sudo crontab -e

# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet && docker-compose restart nginx
```

---

## 📊 Monitorar Aplicação

### Ver Logs em Tempo Real

```bash
# Logs da aplicação
docker-compose logs -f app

# Logs do banco
docker-compose logs -f postgres

# Todos os logs
docker-compose logs -f
```

### Usar Uptime Robot (Gratuito)

1. Acesse https://uptimerobot.com
2. Crie monitor: `http://SEU_IP:3000/health`
3. Intervalo: 5 minutos
4. Receberá alertas se aplicação cair

---

## 🧹 Limpeza e Manutenção

### Remover Containers Parados

```bash
docker-compose down -v
```

### Limpar Imagens Não Usadas

```bash
docker image prune -a
```

### Backup do Banco de Dados

```bash
# Fazer backup
docker-compose exec postgres pg_dump -U postgres hvdc_simulator > backup-$(date +%Y%m%d).sql

# Restaurar
docker-compose exec -T postgres psql -U postgres hvdc_simulator < backup-20260131.sql
```

---

## 📈 Performance

### Aumentar Recursos

Se a aplicação ficar lenta:

1. Upgrade da instância Lightsail (2GB → 4GB RAM)
2. Aumentar limite de memória no docker-compose.yml:

```yaml
services:
  app:
    mem_limit: 1g
    memswap_limit: 2g
```

3. Reiniciar: `docker-compose restart`

---

## 🎯 Próximos Passos

1. **Configurar domínio personalizado** - Aponte DNS para IP da instância
2. **Configurar SSL/HTTPS** - Use Let's Encrypt
3. **Monitorar aplicação** - Use Uptime Robot
4. **Fazer backups** - Backup automático do banco
5. **Escalar** - Se necessário, use Load Balancer do Lightsail

---

## 📞 Suporte

Se tiver problemas:

1. Verifique logs: `docker-compose logs app`
2. Reinicie containers: `docker-compose restart`
3. Verifique conectividade: `docker-compose exec app curl localhost:3000`

---

**Sucesso! Sua aplicação está rodando em Docker no Lightsail!** 🚀
