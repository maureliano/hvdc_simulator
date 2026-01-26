# Dockerfile - Compatibilidade com Dashboard Supervisório

## ✅ Dockerfile Atual Está Correto

O Dockerfile atual **já suporta completamente** o dashboard supervisório sem necessidade de alterações. Vou explicar por quê.

---

## O Que o Dashboard Supervisório Precisa

### Dependências Backend
- ✅ **Node.js** - Para Express e Socket.IO → Já incluído (`node:22-alpine`)
- ✅ **Socket.IO** - Para WebSocket → Já instalado via `pnpm install`
- ✅ **Python + Pandapower** - Para simulação → Já instalado em ambos os stages
- ✅ **Express** - Servidor HTTP → Já incluído no projeto

### Dependências Frontend
- ✅ **React** - Framework UI → Já compilado no build (`pnpm build`)
- ✅ **Socket.IO Client** - WebSocket cliente → Já instalado via `pnpm install`
- ✅ **Componentes UI** - shadcn/ui, Recharts → Já instalados

### Arquivos Necessários
- ✅ **server/monitoring.ts** - Serviço WebSocket → Copiado em `COPY --from=builder /app/server`
- ✅ **client/src/pages/Supervisory.tsx** - Dashboard UI → Compilado no build
- ✅ **dist/index.js** - Servidor compilado → Gerado por `pnpm build`

---

## Análise do Dockerfile Atual

### Stage 1: Builder ✅

```dockerfile
FROM node:22-alpine AS builder

# ✅ Python + Pandapower instalados
RUN pip3 install --break-system-packages \
    pandapower==3.3.2 \
    numpy \
    matplotlib \
    scipy

# ✅ Dependências Node.js instaladas (incluindo socket.io)
RUN pnpm install --frozen-lockfile

# ✅ Build da aplicação (compila React + TypeScript)
RUN pnpm build
```

**O que acontece no build:**
1. `pnpm install` instala `socket.io` e `socket.io-client` (já no package.json)
2. `pnpm build` compila:
   - `client/src/pages/Supervisory.tsx` → JavaScript otimizado
   - `server/monitoring.ts` → `dist/monitoring.js`
   - `server/_core/index.ts` → `dist/index.js` (com WebSocket)

### Stage 2: Runtime ✅

```dockerfile
FROM node:22-alpine

# ✅ Python + Pandapower no runtime
RUN pip3 install --break-system-packages \
    pandapower==3.3.2 \
    numpy \
    matplotlib \
    scipy

# ✅ Arquivos necessários copiados
COPY --from=builder /app/dist ./dist              # ← Servidor compilado (com WebSocket)
COPY --from=builder /app/node_modules ./node_modules  # ← socket.io incluído
COPY --from=builder /app/server ./server          # ← Scripts Python

# ✅ Porta exposta
EXPOSE 8080

# ✅ Comando correto
CMD ["node", "dist/index.js"]  # ← Inicia servidor com WebSocket
```

**O que está incluído:**
- `dist/index.js` → Servidor Express + Socket.IO + MonitoringService
- `node_modules/socket.io` → Biblioteca WebSocket
- `server/hvdc_simulator.py` → Script de simulação Pandapower

---

## O Que Acontece ao Executar o Container

### 1. Servidor Inicia
```bash
node dist/index.js
```

### 2. Express + Socket.IO Carregam
```javascript
// dist/index.js contém:
import { monitoringService } from "../monitoring";
monitoringService.initialize(server);  // ← WebSocket ativo
```

### 3. Rotas Disponíveis
- `http://localhost:8080/` → Home (simulação estática)
- `http://localhost:8080/supervisory` → Dashboard supervisório
- `ws://localhost:8080/socket.io/` → WebSocket endpoint

### 4. MonitoringService Ativo
- Atualização automática a cada 2 segundos
- Executa `server/hvdc_simulator.py` via spawn
- Emite dados via WebSocket para clientes conectados

---

## Verificação Passo a Passo

### Build da Imagem
```bash
docker build -t hvdc-simulator .
```

**Deve incluir:**
- ✅ Instalação de socket.io (no `pnpm install`)
- ✅ Compilação de Supervisory.tsx (no `pnpm build`)
- ✅ Instalação de Pandapower (em ambos os stages)

### Executar Container
```bash
docker run -d -p 8080:8080 \
  -e DATABASE_URL="file:./dev.db" \
  -e JWT_SECRET="$(openssl rand -hex 32)" \
  --name hvdc-sim \
  hvdc-simulator
```

### Verificar Logs
```bash
docker logs -f hvdc-sim
```

**Deve aparecer:**
```
[Monitoring] WebSocket service initialized
Server running on http://localhost:8080/
```

### Testar Dashboard
```bash
# Acessar no navegador:
http://localhost:8080/supervisory

# Ou via curl:
curl http://localhost:8080/supervisory
```

### Testar WebSocket
```bash
# No console do navegador (F12):
# Deve aparecer: "WebSocket connected"
```

---

## Quando Seria Necessário Alterar o Dockerfile?

### Cenário 1: Adicionar Dependências Python
Se você adicionar novos pacotes Python:

```dockerfile
RUN pip3 install --break-system-packages \
    pandapower==3.3.2 \
    numpy \
    matplotlib \
    scipy \
    pandas \          # ← Novo
    scikit-learn      # ← Novo
```

### Cenário 2: Adicionar Dependências Node.js
Se você adicionar novos pacotes npm:

```bash
# Adicionar ao package.json
pnpm add redis ioredis

# Rebuild da imagem
docker build -t hvdc-simulator .
```

### Cenário 3: Mudar Porta
Se você quiser usar porta diferente:

```dockerfile
EXPOSE 3000  # ← Mudar de 8080 para 3000
ENV PORT=3000
```

### Cenário 4: Adicionar Volumes Persistentes
Se você quiser persistir dados:

```dockerfile
# Adicionar antes de USER nodejs
RUN mkdir -p /app/data && chown nodejs:nodejs /app/data
VOLUME ["/app/data"]
```

---

## Comparação: Antes vs Depois do Dashboard

### Antes (Só Simulação Estática)
```
Dockerfile
├── Node.js ✅
├── Python + Pandapower ✅
├── Express ✅
└── React (Home) ✅
```

### Depois (Com Dashboard Supervisório)
```
Dockerfile
├── Node.js ✅ (mesmo)
├── Python + Pandapower ✅ (mesmo)
├── Express ✅ (mesmo)
├── Socket.IO ✅ (adicionado via pnpm install)
├── React (Home) ✅ (mesmo)
└── React (Supervisory) ✅ (adicionado, compilado no build)
```

**Diferença:** Apenas novos arquivos TypeScript/React compilados no build. Nenhuma mudança no Dockerfile necessária.

---

## Dockerfile Otimizado (Opcional)

Se você quiser otimizar ainda mais (reduzir tamanho da imagem):

```dockerfile
###############################################################################
# Stage 2: Runtime - Imagem final otimizada
###############################################################################
FROM node:22-alpine

# Instalar apenas dependências de runtime
RUN apk add --no-cache \
    python3 \
    py3-pip

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Instalar Pandapower (runtime)
RUN pip3 install --no-cache-dir --break-system-packages \
    pandapower==3.3.2 \
    numpy \
    matplotlib \
    scipy

# Copiar apenas node_modules de produção (sem devDependencies)
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# Instalar apenas dependências de produção
RUN npm install --omit=dev  # ← Mais leve

COPY --from=builder --chown=nodejs:nodejs /app/server ./server
COPY --from=builder --chown=nodejs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nodejs:nodejs /app/shared ./shared

# Criar diretórios necessários
RUN mkdir -p logs && chown nodejs:nodejs logs

USER nodejs
EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/index.js"]
```

**Mudança:** `npm install --omit=dev` instala apenas dependências de produção, reduzindo tamanho.

---

## Teste de Integração Completo

### 1. Build
```bash
docker build -t hvdc-simulator .
```

### 2. Run
```bash
docker run -d -p 8080:8080 \
  -e DATABASE_URL="file:./dev.db" \
  -e JWT_SECRET="secret123" \
  --name hvdc-sim \
  hvdc-simulator
```

### 3. Verificar Logs
```bash
docker logs hvdc-sim | grep -i "monitoring"
# Deve aparecer: [Monitoring] WebSocket service initialized
```

### 4. Testar Simulação Estática
```bash
curl http://localhost:8080/
# Deve retornar HTML da página Home
```

### 5. Testar Dashboard Supervisório
```bash
curl http://localhost:8080/supervisory
# Deve retornar HTML da página Supervisory
```

### 6. Testar WebSocket
```bash
# Abrir navegador: http://localhost:8080/supervisory
# Console deve mostrar: "WebSocket connected"
# Métricas devem atualizar a cada 2 segundos
```

### 7. Testar Health Check
```bash
docker inspect hvdc-sim | grep -i health
# Deve mostrar: "Status": "healthy"
```

---

## Conclusão

### ✅ Dockerfile Atual Está Perfeito

O Dockerfile atual **já suporta completamente** o dashboard supervisório porque:

1. **Socket.IO** é instalado automaticamente via `pnpm install` (já no package.json)
2. **Código do dashboard** é compilado no `pnpm build` junto com o resto da aplicação
3. **Python + Pandapower** já estavam instalados para a simulação estática
4. **Servidor Express** já estava configurado, apenas adicionamos WebSocket

### Nenhuma Mudança Necessária

Você pode usar o Dockerfile exatamente como está. O dashboard supervisório funciona out-of-the-box após o build.

### Próximos Passos

1. **Build da imagem:**
```bash
docker build -t hvdc-simulator .
```

2. **Executar container:**
```bash
docker run -d -p 8080:8080 \
  -e DATABASE_URL="file:./dev.db" \
  -e JWT_SECRET="$(openssl rand -hex 32)" \
  --name hvdc-sim \
  hvdc-simulator
```

3. **Acessar dashboard:**
```
http://localhost:8080/supervisory
```

---

**Status:** ✅ Dockerfile compatível com dashboard supervisório  
**Mudanças necessárias:** ❌ Nenhuma  
**Pronto para deploy:** ✅ Sim
