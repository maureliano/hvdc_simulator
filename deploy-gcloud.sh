#!/bin/bash

###############################################################################
# Script de Deployment Automatizado - HVDC Simulator
# Google Cloud Shell
###############################################################################

set -e  # Parar em caso de erro

echo "=========================================="
echo "  HVDC Simulator - Deployment Script"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para printar mensagens coloridas
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}➜ $1${NC}"
}

###############################################################################
# Passo 1: Verificar Node.js
###############################################################################

print_info "Verificando Node.js..."

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js encontrado: $NODE_VERSION"
    
    # Verificar se é versão 22
    if [[ ! $NODE_VERSION =~ ^v22 ]]; then
        print_info "Instalando Node.js 22 via NVM..."
        
        # Instalar NVM se não existir
        if [ ! -d "$HOME/.nvm" ]; then
            curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        fi
        
        # Carregar NVM
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        
        # Instalar Node 22
        nvm install 22
        nvm use 22
        nvm alias default 22
        
        print_success "Node.js 22 instalado"
    fi
else
    print_error "Node.js não encontrado. Instalando..."
    
    # Instalar NVM
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    
    # Carregar NVM
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    # Instalar Node 22
    nvm install 22
    nvm use 22
    nvm alias default 22
    
    print_success "Node.js 22 instalado"
fi

###############################################################################
# Passo 2: Instalar PNPM
###############################################################################

print_info "Verificando PNPM..."

if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    print_success "PNPM encontrado: $PNPM_VERSION"
else
    print_info "Instalando PNPM..."
    npm install -g pnpm
    print_success "PNPM instalado"
fi

###############################################################################
# Passo 3: Instalar Python e Pandapower
###############################################################################

print_info "Verificando Python..."

if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_success "Python encontrado: $PYTHON_VERSION"
else
    print_error "Python não encontrado. Instale Python 3 manualmente."
    exit 1
fi

print_info "Instalando Pandapower e dependências..."

pip3 install --user pandapower numpy matplotlib scipy --quiet

# Verificar instalação
if python3 -c "import pandapower" 2>/dev/null; then
    PANDAPOWER_VERSION=$(python3 -c "import pandapower; print(pandapower.__version__)")
    print_success "Pandapower instalado: v$PANDAPOWER_VERSION"
else
    print_error "Falha ao instalar Pandapower"
    exit 1
fi

###############################################################################
# Passo 4: Configurar Variáveis de Ambiente
###############################################################################

print_info "Configurando variáveis de ambiente..."

if [ ! -f .env ]; then
    cat > .env << 'EOF'
# Banco de Dados (SQLite - recomendado para Google Cloud Shell)
DATABASE_URL=file:./dev.db

# Servidor
NODE_ENV=development
PORT=8080

# JWT Secret (ALTERAR EM PRODUÇÃO!)
JWT_SECRET=development_secret_key_change_in_production

# OAuth (configurar se necessário)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Owner
OWNER_OPEN_ID=default_owner
OWNER_NAME=HVDC Admin

# Frontend
VITE_APP_TITLE=HVDC Simulator
VITE_APP_LOGO=/logo.svg
EOF
    print_success "Arquivo .env criado"
else
    print_success "Arquivo .env já existe"
fi

###############################################################################
# Passo 5: Instalar Dependências do Projeto
###############################################################################

print_info "Instalando dependências do projeto..."

pnpm install

print_success "Dependências instaladas"

###############################################################################
# Passo 6: Configurar Banco de Dados
###############################################################################

print_info "Aplicando migrações do banco de dados..."

DATABASE_URL="file:./dev.db" pnpm db:push

print_success "Banco de dados configurado"

###############################################################################
# Passo 7: Build da Aplicação
###############################################################################

print_info "Compilando aplicação..."

pnpm build

print_success "Build concluído"

###############################################################################
# Passo 8: Executar Testes
###############################################################################

print_info "Executando testes..."

if pnpm test; then
    print_success "Todos os testes passaram"
else
    print_error "Alguns testes falharam. Verifique os logs."
fi

###############################################################################
# Finalização
###############################################################################

echo ""
echo "=========================================="
echo "  ✓ Deployment Concluído com Sucesso!"
echo "=========================================="
echo ""
echo "Para iniciar o servidor:"
echo ""
echo "  Desenvolvimento:  pnpm dev"
echo "  Produção:         pnpm start"
echo ""
echo "Acesse a aplicação via Web Preview na porta 8080"
echo ""
echo "Para manter rodando em background:"
echo "  npm install -g pm2"
echo "  pm2 start npm --name hvdc-simulator -- start"
echo ""
