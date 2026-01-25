#!/bin/bash

###############################################################################
# Script de Configuração de Variáveis de Ambiente
# HVDC Simulator
###############################################################################

echo "=========================================="
echo "  Configuração de Variáveis de Ambiente"
echo "=========================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se .env já existe
if [ -f .env ]; then
    echo -e "${YELLOW}Arquivo .env já existe.${NC}"
    read -p "Deseja sobrescrever? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Operação cancelada."
        exit 0
    fi
fi

echo "Configurando variáveis de ambiente..."
echo ""

# Função para gerar secret aleatório
generate_secret() {
    openssl rand -base64 32 2>/dev/null || echo "change_this_secret_$(date +%s)"
}

# Perguntar tipo de deployment
echo "Tipo de deployment:"
echo "1) Desenvolvimento (SQLite)"
echo "2) Produção (MySQL)"
read -p "Escolha (1 ou 2): " deploy_type

if [ "$deploy_type" = "2" ]; then
    # Produção - MySQL
    read -p "Host do MySQL: " db_host
    read -p "Porta do MySQL [3306]: " db_port
    db_port=${db_port:-3306}
    read -p "Nome do banco de dados: " db_name
    read -p "Usuário do banco: " db_user
    read -sp "Senha do banco: " db_pass
    echo ""
    
    DATABASE_URL="mysql://${db_user}:${db_pass}@${db_host}:${db_port}/${db_name}"
    NODE_ENV="production"
else
    # Desenvolvimento - SQLite
    DATABASE_URL="file:./dev.db"
    NODE_ENV="development"
fi

# Porta do servidor
read -p "Porta do servidor [8080]: " port
port=${port:-8080}

# Gerar JWT Secret
JWT_SECRET=$(generate_secret)

# Owner info
read -p "Nome do proprietário [HVDC Admin]: " owner_name
owner_name=${owner_name:-"HVDC Admin"}
read -p "OpenID do proprietário [default_owner]: " owner_openid
owner_openid=${owner_openid:-"default_owner"}

# Criar arquivo .env
cat > .env << EOF
###############################################################################
# HVDC Simulator - Environment Variables
# Generated: $(date)
###############################################################################

# Banco de Dados
DATABASE_URL=${DATABASE_URL}

# Servidor
NODE_ENV=${NODE_ENV}
PORT=${port}

# Segurança
JWT_SECRET=${JWT_SECRET}

# OAuth (Manus)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Owner
OWNER_OPEN_ID=${owner_openid}
OWNER_NAME=${owner_name}

# Frontend
VITE_APP_TITLE=HVDC Simulator
VITE_APP_LOGO=/logo.svg
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=

# Application ID
VITE_APP_ID=hvdc_simulator_$(date +%s)

# Built-in Forge API (se disponível)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=
EOF

echo ""
echo -e "${GREEN}✓ Arquivo .env criado com sucesso!${NC}"
echo ""
echo "Configurações:"
echo "  - Banco de dados: ${DATABASE_URL}"
echo "  - Ambiente: ${NODE_ENV}"
echo "  - Porta: ${port}"
echo "  - JWT Secret: ${JWT_SECRET:0:20}..."
echo ""
echo "IMPORTANTE: Guarde o JWT_SECRET em local seguro!"
echo ""
echo "Próximos passos:"
echo "  1. Revisar o arquivo .env"
echo "  2. Executar: pnpm install"
echo "  3. Executar: pnpm db:push"
echo "  4. Executar: pnpm start"
echo ""
