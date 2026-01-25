# Multi-stage build para HVDC Simulator
# Otimizado para Google Cloud Run e Cloud Shell

###############################################################################
# Stage 1: Builder - Compilar aplicação
###############################################################################
FROM node:22-alpine AS builder

# Instalar dependências de sistema necessárias
RUN apk add --no-cache \
    python3 \
    py3-pip \
    gcc \
    g++ \
    make \
    musl-dev \
    python3-dev \
    libffi-dev \
    openssl-dev

# Criar diretório de trabalho
WORKDIR /app

# Instalar PNPM
RUN npm install -g pnpm

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar dependências Node.js
RUN pnpm install --frozen-lockfile

# Instalar Pandapower e dependências Python
RUN pip3 install --no-cache-dir \
    pandapower==3.3.2 \
    numpy \
    matplotlib \
    scipy

# Copiar código fonte
COPY . .

# Build da aplicação
RUN pnpm build

###############################################################################
# Stage 2: Runtime - Imagem final otimizada
###############################################################################
FROM node:22-alpine

# Instalar apenas dependências de runtime
RUN apk add --no-cache \
    python3 \
    py3-pip

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Criar diretório de trabalho
WORKDIR /app

# Instalar Pandapower (runtime)
RUN pip3 install --no-cache-dir \
    pandapower==3.3.2 \
    numpy \
    matplotlib \
    scipy

# Copiar arquivos necessários do builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/server ./server
COPY --from=builder --chown=nodejs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nodejs:nodejs /app/shared ./shared

# Criar diretórios necessários
RUN mkdir -p logs && chown nodejs:nodejs logs

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 8080

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicialização
CMD ["node", "dist/index.js"]
