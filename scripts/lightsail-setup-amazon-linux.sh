#!/bin/bash

###############################################################################
# HVDC Simulator - AWS Lightsail Setup Script (Amazon Linux 2)
# Este script automatiza todo o setup da aplicação em uma instância Lightsail
# com Amazon Linux 2 (mais leve e rápido que Ubuntu)
# 
# Uso: bash lightsail-setup-amazon-linux.sh
###############################################################################

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

###############################################################################
# PASSO 1: Atualizar Sistema
###############################################################################
print_header "PASSO 1: Atualizando Sistema"

sudo yum update -y
sudo yum upgrade -y
print_success "Sistema atualizado"

###############################################################################
# PASSO 2: Instalar Node.js (Amazon Linux 2)
###############################################################################
print_header "PASSO 2: Instalando Node.js 20"

# Amazon Linux usa yum, não apt-get
sudo yum install -y nodejs npm
print_success "Node.js $(node --version) instalado"
print_success "NPM $(npm --version) instalado"

###############################################################################
# PASSO 3: Instalar Nginx
###############################################################################
print_header "PASSO 3: Instalando Nginx"

sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
print_success "Nginx instalado e iniciado"

###############################################################################
# PASSO 4: Instalar PM2
###############################################################################
print_header "PASSO 4: Instalando PM2"

sudo npm install -g pm2
print_success "PM2 $(pm2 --version) instalado"

###############################################################################
# PASSO 5: Instalar Git
###############################################################################
print_header "PASSO 5: Instalando Git"

sudo yum install -y git
print_success "Git $(git --version | cut -d' ' -f3) instalado"

###############################################################################
# PASSO 6: Instalar PostgreSQL Client
###############################################################################
print_header "PASSO 6: Instalando PostgreSQL Client"

sudo yum install -y postgresql15
print_success "PostgreSQL Client instalado"

###############################################################################
# PASSO 7: Instalar Ferramentas Adicionais
###############################################################################
print_header "PASSO 7: Instalando Ferramentas Adicionais"

sudo yum install -y curl wget openssl
print_success "Ferramentas instaladas"

###############################################################################
# PASSO 8: Clonar Repositório
###############################################################################
print_header "PASSO 8: Clonando Repositório"

read -p "Digite a URL do seu repositório GitHub (ex: https://github.com/seu-usuario/hvdc_simulator.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    print_error "URL do repositório não fornecida"
    exit 1
fi

cd /home/ec2-user
git clone "$REPO_URL" hvdc_simulator 2>/dev/null || {
    print_warning "Repositório já existe, atualizando..."
    cd hvdc_simulator
    git pull origin main
    cd ..
}

cd /home/ec2-user/hvdc_simulator
print_success "Repositório clonado/atualizado"

###############################################################################
# PASSO 9: Instalar Dependências com NPM
###############################################################################
print_header "PASSO 9: Instalando Dependências com NPM"

# Usar limite de memória para evitar OOM
NODE_OPTIONS="--max-old-space-size=1024" npm install
print_success "Dependências instaladas"

###############################################################################
# PASSO 10: Configurar Variáveis de Ambiente
###############################################################################
print_header "PASSO 10: Configurando Variáveis de Ambiente"

if [ -f /home/ec2-user/hvdc_simulator/.env ]; then
    print_warning "Arquivo .env já existe, pulando..."
else
    read -p "Digite a DATABASE_URL (PostgreSQL connection string): " DATABASE_URL
    read -p "Digite o VITE_APP_ID (Manus OAuth): " VITE_APP_ID
    
    if [ -z "$DATABASE_URL" ] || [ -z "$VITE_APP_ID" ]; then
        print_error "Variáveis obrigatórias não fornecidas"
        exit 1
    fi
    
    JWT_SECRET=$(openssl rand -base64 32)
    
    cat > /home/ec2-user/hvdc_simulator/.env << EOF
# Database
DATABASE_URL=$DATABASE_URL

# OAuth (Manus)
JWT_SECRET=$JWT_SECRET
VITE_APP_ID=$VITE_APP_ID
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Application
NODE_ENV=production
PORT=3000
EOF
    
    print_success "Arquivo .env criado"
fi

###############################################################################
# PASSO 11: Executar Migrations
###############################################################################
print_header "PASSO 11: Executando Migrations do Banco de Dados"

NODE_OPTIONS="--max-old-space-size=1024" npm run db:push
print_success "Migrations executadas"

###############################################################################
# PASSO 12: Build do Projeto
###############################################################################
print_header "PASSO 12: Fazendo Build do Projeto"

NODE_OPTIONS="--max-old-space-size=1024" npm run build
print_success "Build concluído"

###############################################################################
# PASSO 13: Criar Diretórios de Logs
###############################################################################
print_header "PASSO 13: Criando Diretórios de Logs"

mkdir -p /home/ec2-user/hvdc_simulator/logs
mkdir -p /home/ec2-user/backups
print_success "Diretórios criados"

###############################################################################
# PASSO 14: Configurar PM2
###############################################################################
print_header "PASSO 14: Configurando PM2"

cat > /home/ec2-user/hvdc_simulator/ecosystem.config.js << 'EOF'
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
      error_file: '/home/ec2-user/hvdc_simulator/logs/err.log',
      out_file: '/home/ec2-user/hvdc_simulator/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'dist'],
      max_memory_restart: '512M'
    }
  ]
};
EOF

cd /home/ec2-user/hvdc_simulator
sudo pm2 start ecosystem.config.js
sudo pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user

print_success "PM2 configurado e aplicação iniciada"

###############################################################################
# PASSO 15: Configurar Nginx
###############################################################################
print_header "PASSO 15: Configurando Nginx"

read -p "Digite seu domínio (ex: hvdc.example.com) ou deixe em branco para usar IP: " DOMAIN

if [ -z "$DOMAIN" ]; then
    DOMAIN="localhost"
    print_warning "Usando localhost. Configure seu domínio depois."
fi

sudo tee /etc/nginx/conf.d/hvdc-simulator.conf > /dev/null << EOF
upstream hvdc_app {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://hvdc_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

sudo nginx -t
sudo systemctl restart nginx

print_success "Nginx configurado"

###############################################################################
# PASSO 16: Criar Script de Backup
###############################################################################
print_header "PASSO 16: Criando Script de Backup"

cat > /home/ec2-user/backup-db.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/home/ec2-user/backups"
mkdir -p $BACKUP_DIR

# Extrair DATABASE_URL do .env
DATABASE_URL=$(grep DATABASE_URL /home/ec2-user/hvdc_simulator/.env | cut -d'=' -f2)

# Fazer backup
pg_dump "$DATABASE_URL" | gzip > $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql.gz

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "backup-*.sql.gz" -mtime +7 -delete

echo "Backup realizado: $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql.gz"
EOF

chmod +x /home/ec2-user/backup-db.sh

# Agendar backup diário
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ec2-user/backup-db.sh") | crontab -

print_success "Script de backup criado e agendado"

###############################################################################
# RESUMO FINAL
###############################################################################
print_header "✓ SETUP CONCLUÍDO COM SUCESSO!"

echo -e "${GREEN}Sua aplicação HVDC Simulator está rodando!${NC}\n"

echo "📊 Informações da Aplicação:"
echo "  - URL: http://$DOMAIN"
echo "  - Porta: 3000 (interno)"
echo "  - Status: $(pm2 status | grep hvdc-simulator | awk '{print $10}')"
echo ""

echo "📝 Comandos Úteis:"
echo "  - Ver status: pm2 status"
echo "  - Ver logs: pm2 logs hvdc-simulator"
echo "  - Reiniciar: pm2 restart hvdc-simulator"
echo "  - Parar: pm2 stop hvdc-simulator"
echo "  - Atualizar código: cd /home/ec2-user/hvdc_simulator && git pull && npm install && npm run build && pm2 restart hvdc-simulator"
echo ""

echo "🔐 Próximos Passos:"
echo "  1. Configure seu domínio DNS apontando para este servidor"
echo "  2. Configure SSL/HTTPS com: sudo certbot certonly --nginx -d $DOMAIN"
echo "  3. Monitore logs: pm2 logs hvdc-simulator"
echo ""

print_success "Setup completo! Acesse http://$DOMAIN para ver sua aplicação."
