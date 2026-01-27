# Sistema de Notificações de Alarme IFF

## Visão Geral

O Sistema de Notificações de Alarme monitora métricas do Framework IFF em tempo real e dispara alertas quando os valores caem abaixo de thresholds pré-configurados. O sistema suporta dois níveis de severidade (WARNING e CRITICAL) e permite gerenciamento completo do ciclo de vida dos alarmes.

## Arquitetura

### Componentes Principais

1. **Alarm Service** (`server/iff/alarm-service.ts`)
   - Gerencia thresholds de alarme
   - Cria e monitora eventos de alarme
   - Fornece estatísticas de alarmes

2. **Monitoring Service** (`server/monitoring.ts`)
   - Integração com WebSocket para emissão em tempo real
   - Dispara verificações de alarmes após testes IFF
   - Emite eventos de alarme para clientes conectados

3. **tRPC Endpoints** (`server/routers.ts`)
   - API REST para gerenciar alarmes
   - Endpoints para CRUD de thresholds
   - Queries para histórico e estatísticas

4. **UI Component** (`client/src/components/AlarmPanel.tsx`)
   - Painel de controle de alarmes
   - Configuração de thresholds
   - Visualização de alarmes ativos e histórico

## Banco de Dados

### Tabelas

#### `iff_alarm_thresholds`
Armazena configurações de thresholds para monitoramento de métricas.

```sql
CREATE TABLE iff_alarm_thresholds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  metricName VARCHAR(100) NOT NULL,
  criticalThreshold DOUBLE NOT NULL,
  warningThreshold DOUBLE NOT NULL,
  enabled INT DEFAULT 1,
  description TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
);
```

#### `iff_alarm_events`
Registra eventos de alarme disparados quando métricas cruzam thresholds.

```sql
CREATE TABLE iff_alarm_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  testResultId INT,
  thresholdId INT,
  metricName VARCHAR(100) NOT NULL,
  metricValue DOUBLE NOT NULL,
  threshold DOUBLE NOT NULL,
  severity VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  message TEXT NOT NULL,
  acknowledgedAt TIMESTAMP,
  acknowledgedBy VARCHAR(255),
  resolvedAt TIMESTAMP,
  resolvedBy VARCHAR(255),
  resolutionNotes TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
);
```

## Uso

### Configurar Thresholds

```typescript
import { trpc } from "@/lib/trpc";

const createThreshold = trpc.alarms.createThreshold.useMutation();

await createThreshold.mutateAsync({
  metricName: "overallIFFScore",
  criticalThreshold: 50,
  warningThreshold: 70,
  description: "Monitorar score IFF durante testes"
});
```

### Obter Alarmes Ativos

```typescript
const { data: alarms } = trpc.alarms.getActiveAlarms.useQuery({
  limit: 100
}, {
  refetchInterval: 5000 // Atualizar a cada 5 segundos
});
```

### Reconhecer Alarme

```typescript
const acknowledgeMutation = trpc.alarms.acknowledge.useMutation();

await acknowledgeMutation.mutateAsync({
  id: alarmId,
  acknowledgedBy: "operator_name"
});
```

### Resolver Alarme

```typescript
const resolveMutation = trpc.alarms.resolve.useMutation();

await resolveMutation.mutateAsync({
  id: alarmId,
  resolvedBy: "operator_name",
  resolutionNotes: "Issue fixed"
});
```

### Verificar Resultado de Teste

```typescript
// Automaticamente disparado após executar teste IFF
const newAlarms = await checkIFFTestResultForAlarms(testResultId, userId);
```

## Métricas Monitoradas

O sistema pode monitorar as seguintes métricas do Framework IFF:

1. **overallIFFScore** (0-100)
   - Score geral de fidelidade física
   - Recomendado: Crítico < 50, Aviso < 70

2. **dynamicFidelityIndex** (0-100)
   - Métrica de fidelidade dinâmica
   - Recomendado: Crítico < 40, Aviso < 60

3. **confidenceLevel** (0-100)
   - Nível de confiança do modelo
   - Recomendado: Crítico < 60, Aviso < 75

4. **overallUncertaintyPercent** (0-100)
   - Incerteza geral do sistema
   - Recomendado: Crítico > 30, Aviso > 20

## Níveis de Severidade

### WARNING
- Métrica abaixo do threshold de aviso
- Indica degradação do desempenho
- Requer atenção do operador
- Cor: Amarelo

### CRITICAL
- Métrica abaixo do threshold crítico
- Indica falha iminente ou perda de fidelidade
- Requer ação imediata
- Cor: Vermelho

## Ciclo de Vida dos Alarmes

```
ACTIVE → ACKNOWLEDGED → RESOLVED
  ↓           ↓            ↓
Novo      Reconhecido   Resolvido
Alarme    pelo operador  pelo operador
```

### Estados

1. **ACTIVE**
   - Alarme recém-criado
   - Requer ação do operador
   - Visível no painel de alarmes

2. **ACKNOWLEDGED**
   - Operador reconheceu o alarme
   - Ação está em progresso
   - Registra quem reconheceu e quando

3. **RESOLVED**
   - Problema foi resolvido
   - Registra quem resolveu, quando e notas de resolução
   - Mantido no histórico para auditoria

## Integração com WebSocket

O sistema emite eventos em tempo real via WebSocket:

### Eventos Emitidos

```typescript
// Alarmes ativos
io.emit("alarmEvents", {
  timestamp: Date.now(),
  activeAlarms: AlarmEvent[],
  totalActive: number
});

// Novos alarmes disparados
io.emit("newAlarmEvents", {
  timestamp: Date.now(),
  newAlarms: AlarmEvent[],
  count: number
});
```

### Escuta de Eventos (Frontend)

```typescript
import { io } from "socket.io-client";

const socket = io();

socket.on("alarmEvents", (data) => {
  console.log("Alarmes ativos:", data.activeAlarms);
});

socket.on("newAlarmEvents", (data) => {
  console.log("Novos alarmes:", data.newAlarms);
  // Mostrar notificação ao usuário
});
```

## Endpoints tRPC

### Queries

#### `alarms.getThresholds`
Obter thresholds configurados.

```typescript
trpc.alarms.getThresholds.useQuery({ userId: 1 });
```

#### `alarms.getActiveAlarms`
Obter alarmes ativos.

```typescript
trpc.alarms.getActiveAlarms.useQuery({ 
  userId: 1, 
  limit: 100 
});
```

#### `alarms.getHistory`
Obter histórico de alarmes.

```typescript
trpc.alarms.getHistory.useQuery({ 
  userId: 1, 
  limit: 100, 
  offset: 0 
});
```

#### `alarms.getStatistics`
Obter estatísticas de alarmes.

```typescript
trpc.alarms.getStatistics.useQuery({ userId: 1 });
```

### Mutations

#### `alarms.createThreshold`
Criar novo threshold.

```typescript
trpc.alarms.createThreshold.useMutation({
  onSuccess: () => refetchThresholds()
});
```

#### `alarms.updateThreshold`
Atualizar threshold existente.

```typescript
trpc.alarms.updateThreshold.useMutation();
```

#### `alarms.deleteThreshold`
Deletar threshold.

```typescript
trpc.alarms.deleteThreshold.useMutation();
```

#### `alarms.acknowledge`
Reconhecer alarme.

```typescript
trpc.alarms.acknowledge.useMutation();
```

#### `alarms.resolve`
Resolver alarme.

```typescript
trpc.alarms.resolve.useMutation();
```

#### `alarms.checkTestResult`
Verificar resultado de teste para alarmes.

```typescript
trpc.alarms.checkTestResult.useMutation();
```

## Exemplo de Uso Completo

```typescript
import { AlarmPanel } from "@/components/AlarmPanel";

export function IFFDashboard() {
  return (
    <div className="space-y-6">
      <h1>Dashboard IFF</h1>
      
      {/* Painel de Alarmes */}
      <AlarmPanel />
      
      {/* Outros componentes */}
    </div>
  );
}
```

## Boas Práticas

1. **Configurar Thresholds Apropriados**
   - Baseado em requisitos de fidelidade física
   - Considerar variações normais do sistema
   - Revisar periodicamente

2. **Monitorar Regularmente**
   - Verificar alarmes ativos diariamente
   - Resolver alarmes prontamente
   - Manter histórico para análise

3. **Documentar Resoluções**
   - Incluir notas de resolução detalhadas
   - Registrar ações tomadas
   - Facilitar investigação futura

4. **Revisar Estatísticas**
   - Analisar tendências de alarmes
   - Identificar métricas problemáticas
   - Ajustar thresholds conforme necessário

## Testes

O sistema inclui testes vitest abrangentes:

```bash
pnpm test server/iff/alarm-service.test.ts
```

Cobertura de testes:
- Criação e atualização de thresholds
- Ciclo de vida de alarmes
- Níveis de severidade
- Transições de estado
- Tratamento de erros
- Estatísticas

## Troubleshooting

### Alarmes não aparecem

1. Verificar se thresholds estão configurados
2. Verificar se WebSocket está conectado
3. Verificar logs do servidor

### Alarmes não são disparados

1. Verificar valores de threshold
2. Verificar se testes IFF estão sendo executados
3. Verificar banco de dados

### Erro "Database not available"

1. Verificar conexão com banco de dados
2. Verificar variável DATABASE_URL
3. Reiniciar servidor

## Futuras Melhorias

- [ ] Notificações por email
- [ ] Alertas por SMS
- [ ] Integração com sistemas de monitoramento externos
- [ ] Análise preditiva de alarmes
- [ ] Agrupamento automático de alarmes relacionados
- [ ] Escalação automática de alarmes críticos
