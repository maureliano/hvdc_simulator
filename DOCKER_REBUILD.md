# Docker Rebuild - Correções Aplicadas

## Problemas Corrigidos

### 1. ❌ Erro: `spawn python3.11 ENOENT`
**Causa:** Alpine Linux não tem `python3.11`, apenas `python3`

**Solução:** Alterado em `server/monitoring.ts` linha 128:
```typescript
// Antes
const pythonProcess = spawn("python3.11", [

// Depois
const pythonProcess = spawn("python3", [
```

### 2. ❌ Erro: `Cannot read properties of undefined (reading 'map')`
**Causa:** Script Python falhava silenciosamente, retornando output vazio

**Solução:** Adicionado tratamento robusto de erros em `server/monitoring.ts`:
```typescript
// Novo: Detecta output vazio
if (!stdout || stdout.trim().length === 0) {
  reject(new Error("Python script returned empty output"));
  return;
}

// Novo: Valida formato JSON
if (!result || typeof result !== "object") {
  reject(new Error("Invalid simulation result format"));
  return;
}

// Novo: Melhor mensagem de erro com preview do output
reject(new Error(`Failed to parse simulation result: ${error}. Output: ${stdout.substring(0, 200)}`));
```

### 3. ❌ Erro: `[OAuth] ERROR: OAUTH_SERVER_URL is not configured`
**Causa:** Modo standalone não precisa de OAuth, mas gerava erro

**Solução:** Alterado em `server/_core/sdk.ts`:
```typescript
// Antes
if (!ENV.oAuthServerUrl) {
  console.error("[OAuth] ERROR: OAUTH_SERVER_URL is not configured!");
}

// Depois
if (ENV.oAuthServerUrl) {
  console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
} else {
  console.log("[OAuth] Standalone mode - OAuth disabled");
}
```

---

## Como Fazer Rebuild do Docker

### Passo 1: Parar Container Antigo
```bash
docker stop hvdc-sim
docker rm hvdc-sim
```

### Passo 2: Remover Imagem Antiga
```bash
docker rmi hvdc-simulator
```

### Passo 3: Fazer Rebuild
```bash
cd /path/to/hvdc_simulator
docker build -t hvdc-simulator .
```

**Saída esperada:**
```
[+] Building 45.2s (15/15) FINISHED
 => [builder 1/7] FROM node:22-alpine
 => [builder 2/7] RUN apk add --no-cache python3 py3-pip gcc g++ make musl-dev python3-dev libffi-dev openssl-dev
 => [builder 3/7] WORKDIR /app
 => [builder 4/7] RUN npm install -g pnpm
 => [builder 5/7] COPY package.json pnpm-lock.yaml ./
 => [builder 6/7] RUN pnpm install --frozen-lockfile
 => [builder 7/7] RUN pip3 install --no-cache-dir --break-system-packages pandapower==3.3.2 numpy matplotlib scipy
 => [stage-1 1/8] FROM node:22-alpine
 => [stage-1 2/8] RUN apk add --no-cache python3 py3-pip
 => [stage-1 3/8] RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
 => [stage-1 4/8] WORKDIR /app
 => [stage-1 5/8] RUN pip3 install --no-cache-dir --break-system-packages pandapower==3.3.2 numpy matplotlib scipy
 => [stage-1 6/8] COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
 => [stage-1 7/8] COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
 => [stage-1 8/8] COPY --from=builder --chown=nodejs:nodejs /app/server ./server
 => exporting to image
 => => naming to docker.image:hvdc-simulator
```

### Passo 4: Executar Container Novo
```bash
docker run -d -p 8080:8080 \
  -e DATABASE_URL="file:./dev.db" \
  -e JWT_SECRET="$(openssl rand -hex 32)" \
  --name hvdc-sim \
  hvdc-simulator
```

### Passo 5: Verificar Logs
```bash
docker logs -f hvdc-sim
```

**Saída esperada:**
```
[OAuth] Standalone mode - OAuth disabled
[Monitoring] WebSocket service initialized
Server running on http://localhost:8080/
[Monitoring] Simulation running: 345 kV, 230 kV, 422.84 kV, 1000 MW
```

**NÃO deve aparecer:**
- ❌ `spawn python3.11 ENOENT`
- ❌ `Cannot read properties of undefined`
- ❌ `[OAuth] ERROR: OAUTH_SERVER_URL is not configured`

### Passo 6: Testar Dashboard
```bash
# Abrir navegador
http://localhost:8080/supervisory

# Deve aparecer:
# - Métricas atualizando a cada 2 segundos
# - WebSocket conectado
# - Sem erros no console
```

---

## Verificação Completa

### 1. Health Check
```bash
curl http://localhost:8080/api/health
# Deve retornar: {"status":"ok"}
```

### 2. Página Home
```bash
curl http://localhost:8080/
# Deve retornar HTML da página
```

### 3. Dashboard Supervisório
```bash
curl http://localhost:8080/supervisory
# Deve retornar HTML do dashboard
```

### 4. WebSocket
```bash
# No navegador (F12 > Console):
# Deve aparecer: "WebSocket connected"
```

### 5. Simulação Ativa
```bash
# No navegador (F12 > Console):
# Deve aparecer: "Monitoring data received" a cada 2 segundos
```

---

## Troubleshooting

### Problema: Build falha com `pip3: command not found`
**Solução:** Usar Alpine 3.18 ou anterior (não 3.19+)
```dockerfile
FROM node:22-alpine3.18
```

### Problema: Container inicia mas não simula
**Solução:** Verificar se Pandapower foi instalado
```bash
docker exec hvdc-sim python3 -c "import pandapower; print(pandapower.__version__)"
# Deve retornar: 3.3.2
```

### Problema: Porta 8080 já em uso
**Solução:** Usar porta diferente
```bash
docker run -d -p 9000:8080 --name hvdc-sim hvdc-simulator
# Acessar: http://localhost:9000
```

### Problema: Banco de dados não persiste
**Solução:** Adicionar volume
```bash
docker run -d -p 8080:8080 \
  -v hvdc-data:/app/data \
  -e DATABASE_URL="file:./data/dev.db" \
  --name hvdc-sim \
  hvdc-simulator
```

---

## Arquivos Modificados

| Arquivo | Mudança | Linha |
|---------|---------|-------|
| `server/monitoring.ts` | `python3.11` → `python3` | 128 |
| `server/monitoring.ts` | Tratamento de erros robusto | 147-172 |
| `server/_core/sdk.ts` | OAuth opcional em modo standalone | 33-37 |

---

## Próximos Passos

1. **Fazer rebuild:** `docker build -t hvdc-simulator .`
2. **Parar container antigo:** `docker stop hvdc-sim && docker rm hvdc-sim`
3. **Executar novo:** `docker run -d -p 8080:8080 ... hvdc-simulator`
4. **Verificar logs:** `docker logs -f hvdc-sim`
5. **Testar dashboard:** `http://localhost:8080/supervisory`

---

## Resumo das Correções

✅ **Python 3.11 → Python 3** - Compatibilidade com Alpine Linux  
✅ **Tratamento de erros** - Melhor diagnóstico de problemas  
✅ **OAuth opcional** - Modo standalone sem erros  

**Status:** Pronto para rebuild e teste  
**Tempo estimado:** 2-3 minutos para build completo
