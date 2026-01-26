# Como Usar o Dashboard Supervisório

## Arquitetura Atual

O **Dashboard Supervisório** está **integrado** na mesma aplicação HVDC Simulator. Ambos compartilham:
- Mesmo servidor backend (Express + WebSocket)
- Mesma API de simulação (Pandapower)
- Mesmo banco de dados (SQLite)
- Mesma porta (3000 por padrão)

---

## Opção 1: Acessar Dashboard na Aplicação Existente (Recomendado)

### Passo 1: Iniciar o Servidor

```bash
cd /opt/hvdc_simulator
pnpm dev
```

### Passo 2: Acessar as Rotas

**Simulação Estática (Home):**
```
http://localhost:3000/
```

**Dashboard Supervisório (Tempo Real):**
```
http://localhost:3000/supervisory
```

### Navegação

Na página Home, clique no botão **"Dashboard Supervisório"** no canto superior direito para ir direto ao dashboard em tempo real.

---

## Opção 2: Redirecionar Home para Dashboard (Dashboard como Padrão)

Se você quer que o dashboard supervisório seja a página inicial:

### Editar `client/src/App.tsx`

```typescript
// Trocar a ordem das rotas
<Switch>
  <Route path={"/"} component={Supervisory} />  {/* Dashboard como padrão */}
  <Route path={"/simulation"} component={Home} />  {/* Simulação em /simulation */}
  <Route path={"/404"} component={NotFound} />
  <Route component={NotFound} />
</Switch>
```

Agora:
- `http://localhost:3000/` → Dashboard Supervisório
- `http://localhost:3000/simulation` → Simulação Estática

---

## Opção 3: Criar Aplicação Standalone (Separada)

Se você quer uma aplicação completamente separada apenas com o dashboard:

### Estrutura Proposta

```
hvdc_dashboard/          ← Nova aplicação standalone
├── server/
│   ├── monitoring.ts    ← Serviço WebSocket
│   ├── index.ts         ← Servidor Express
│   └── hvdc_simulator.py
├── client/
│   └── src/
│       └── pages/
│           └── Dashboard.tsx
└── package.json
```

### Vantagens
- ✅ Aplicação mais leve (sem simulação estática)
- ✅ Deploy independente
- ✅ Pode rodar em porta diferente
- ✅ Foco total em monitoramento

### Desvantagens
- ❌ Duplicação de código (Pandapower, WebSocket)
- ❌ Mais complexo de manter
- ❌ Precisa sincronizar mudanças

---

## Opção 4: Usar Proxy Reverso (Nginx)

Configure Nginx para rotear apenas o dashboard:

### Configuração Nginx

```nginx
server {
    listen 8080;
    server_name dashboard.example.com;

    location / {
        proxy_pass http://localhost:3000/supervisory;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Agora:
- `http://dashboard.example.com:8080` → Dashboard Supervisório
- `http://localhost:3000` → Aplicação completa

---

## Recomendação

### Para Uso Imediato
**Use Opção 1** - Acesse `http://localhost:3000/supervisory` diretamente.

### Para Dashboard como Página Principal
**Use Opção 2** - Troque a rota padrão no App.tsx.

### Para Deploy Separado
**Use Opção 4** - Configure Nginx ou outro proxy reverso.

### Para Aplicação Completamente Independente
**Use Opção 3** - Crie novo projeto (mais trabalhoso).

---

## Como Funciona o Dashboard Supervisório

### Fluxo de Dados

```
┌─────────────────────────────────────────┐
│  Browser (http://localhost:3000/supervisory)  │
└────────────────┬────────────────────────┘
                 │
                 │ 1. Página carrega
                 ▼
┌─────────────────────────────────────────┐
│  React Component (Supervisory.tsx)      │
│  - Conecta WebSocket                    │
│  - Escuta evento "monitoringData"       │
└────────────────┬────────────────────────┘
                 │
                 │ 2. WebSocket conectado
                 ▼
┌─────────────────────────────────────────┐
│  Express + Socket.IO (server)           │
│  - MonitoringService ativo              │
│  - Emite dados a cada 2 segundos        │
└────────────────┬────────────────────────┘
                 │
                 │ 3. Executa simulação
                 ▼
┌─────────────────────────────────────────┐
│  Pandapower (Python)                    │
│  - Simula circuito HVDC                 │
│  - Retorna JSON com resultados          │
└────────────────┬────────────────────────┘
                 │
                 │ 4. Dados processados
                 ▼
┌─────────────────────────────────────────┐
│  MonitoringService                      │
│  - Transforma em MonitoringData         │
│  - Detecta alarmes                      │
│  - Emite via WebSocket                  │
└────────────────┬────────────────────────┘
                 │
                 │ 5. Atualiza UI
                 ▼
┌─────────────────────────────────────────┐
│  Dashboard UI                           │
│  - Métricas em tempo real               │
│  - Gráficos atualizados                 │
│  - Alarmes exibidos                     │
└─────────────────────────────────────────┘
```

### Ciclo de Atualização

1. **Conexão inicial** → Cliente conecta WebSocket ao carregar página
2. **Primeira simulação** → Servidor executa simulação imediatamente
3. **Loop contínuo** → A cada 2 segundos, nova simulação é executada
4. **Broadcast** → Dados são enviados para todos os clientes conectados
5. **Renderização** → React atualiza componentes automaticamente

---

## Comandos Úteis

### Iniciar Aplicação Completa
```bash
cd /opt/hvdc_simulator
pnpm dev
```

### Acessar Dashboard Diretamente
```bash
# Abrir navegador em:
http://localhost:3000/supervisory
```

### Verificar WebSocket
```bash
# No console do navegador (F12):
# Deve aparecer: "WebSocket connected"
```

### Testar Atualização em Tempo Real
```bash
# 1. Abrir dashboard
# 2. Ir para tab "Controles"
# 3. Ajustar sliders
# 4. Clicar "Aplicar Parâmetros"
# 5. Observar métricas atualizando
```

---

## Troubleshooting

### Dashboard não carrega

**Problema:** Página em branco ou erro 404

**Solução:**
```bash
# Verificar se servidor está rodando
curl http://localhost:3000/supervisory

# Reiniciar servidor
pnpm dev
```

### WebSocket não conecta

**Problema:** "WebSocket disconnected" no console

**Solução:**
```bash
# Verificar logs do servidor
# Deve aparecer: "[Monitoring] WebSocket service initialized"

# Verificar porta
netstat -tuln | grep 3000
```

### Dados não atualizam

**Problema:** Métricas ficam em "---" ou não mudam

**Solução:**
```bash
# Verificar se Pandapower está instalado
python3 -c "import pandapower; print(pandapower.__version__)"

# Se não estiver instalado:
sudo pip3 install --break-system-packages pandapower numpy scipy matplotlib
```

### Erro de simulação

**Problema:** Alarmes críticos ou erro no console

**Solução:**
```bash
# Verificar script Python
python3 server/hvdc_simulator.py 345 230 422.84 1000

# Deve retornar JSON válido
```

---

## Configurações Avançadas

### Mudar Intervalo de Atualização

**Arquivo:** `server/monitoring.ts`

```typescript
// Linha ~100
this.monitoringInterval = setInterval(() => {
  this.runSimulationAndEmit();
}, 2000); // ← Mudar para 1000 (1s), 5000 (5s), etc.
```

### Mudar Porta do Servidor

**Arquivo:** `.env`

```bash
PORT=8080  # ← Mudar porta padrão
```

### Desabilitar Simulação Estática

**Arquivo:** `client/src/App.tsx`

```typescript
<Switch>
  <Route path={"/"} component={Supervisory} />
  {/* <Route path={"/simulation"} component={Home} /> */}  ← Comentar
  <Route path={"/404"} component={NotFound} />
  <Route component={NotFound} />
</Switch>
```

---

## Resumo

| Opção | Comando | URL | Uso |
|-------|---------|-----|-----|
| **Dashboard Integrado** | `pnpm dev` | `http://localhost:3000/supervisory` | ✅ Recomendado |
| **Home como Dashboard** | Editar App.tsx | `http://localhost:3000/` | Trocar rota padrão |
| **Proxy Reverso** | Configurar Nginx | `http://dashboard.example.com` | Deploy separado |
| **Standalone** | Criar novo projeto | `http://localhost:8080/` | Aplicação independente |

---

**Recomendação Final:** Acesse diretamente `http://localhost:3000/supervisory` após iniciar o servidor com `pnpm dev`. É a forma mais simples e mantém tudo integrado.
