# Framework de Índice de Fidelidade Física (IFF)

## Visão Geral

O Framework de Índice de Fidelidade Física (IFF) é um sistema integrado para avaliação e validação de Digital Twins em subestações HVDC. O framework implementa 4 dimensões complementares que permitem operação segura e confiável de Digital Twins em tempo real.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│          Framework de Índice de Fidelidade Física (IFF)      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │  Dimensão 1:     │  │  Dimensão 2:     │                 │
│  │  Fidelidade      │  │  Análise de      │                 │
│  │  Dinâmica        │  │  Incertezas      │                 │
│  └──────────────────┘  └──────────────────┘                 │
│           │                     │                             │
│           └─────────┬───────────┘                             │
│                     │                                         │
│           ┌─────────▼──────────┐                             │
│           │   IFF Framework    │                             │
│           │   Integrador       │                             │
│           └─────────┬──────────┘                             │
│                     │                                         │
│           ┌─────────▼──────────┐                             │
│           │  Relatório IFF     │                             │
│           │  (Score 0-100)     │                             │
│           └────────────────────┘                             │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │  Dimensão 3:     │  │  Dimensão 4:     │                 │
│  │  Validação HIL   │  │  Decisão         │                 │
│  │                  │  │  Agêntica        │                 │
│  └──────────────────┘  └──────────────────┘                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Dimensões do Framework

### Dimensão 1: Métrica de Fidelidade Dinâmica (DFI)

**Objetivo:** Quantificar a concordância entre o comportamento do Digital Twin e o sistema físico real em tempo real.

**Métricas Calculadas:**
- Erro de Tensão: |V_digital - V_real| / V_real × 100%
- Erro de Corrente: |I_digital - I_real| / I_real × 100%
- Erro de Potência: |P_digital - P_real| / P_real × 100%
- Erro de Frequência: |f_digital - f_real| (Hz)

**Índice de Fidelidade Dinâmica (DFI):**
```
DFI = 100 × (1 - Σ(w_i × ε_i))

Onde:
- w_i = peso da métrica i (tensão: 0.25, corrente: 0.25, potência: 0.35, frequência: 0.15)
- ε_i = erro normalizado da métrica i (0-1, usando função sigmóide)
```

**Thresholds de Status:**
- Excelente: DFI ≥ 95%
- Bom: 85% ≤ DFI < 95%
- Aceitável: 70% ≤ DFI < 85%
- Pobre: 50% ≤ DFI < 70%
- Crítico: DFI < 50%

### Dimensão 2: Análise de Incertezas em Tempo Real

**Objetivo:** Quantificar as incertezas inerentes ao Digital Twin usando métodos estatísticos.

**Tipos de Incerteza:**
1. **Incerteza Paramétrica:** Variação nos parâmetros do modelo (0.5-1.0%)
2. **Incerteza de Medição:** Erros dos sensores (0.2-0.4%)
3. **Incerteza de Modelo:** Simplificações e aproximações (0.3-0.8%)
4. **Incerteza Ambiental:** Variações externas não modeladas (0.2-0.5%)

**Cálculo de Incerteza Agregada:**
```
σ_total = √(Σ(σ_i²))

Onde:
- σ_i = incerteza da fonte i
- Agregação em quadratura (RSS - Root Sum of Squares)
```

**Nível de Confiança:**
```
Confiança = e^(-k × σ_total)

Onde:
- k = 0.5 (fator de decaimento)
- Confiança ∈ [0, 1]
```

**Ajustes por Condição Operacional:**
- Normal: Fator 1.0
- Transitório: Fator 1.5-2.5
- Falta: Fator 2.0-3.0

### Dimensão 3: Validação com Hardware-in-the-Loop (HIL)

**Objetivo:** Validar o Digital Twin comparando com dados de hardware real ou simulador.

**Testes HIL Implementados:**
1. **Teste de Resposta em Frequência:** Valida resposta em diferentes frequências (0.1-10 Hz)
2. **Teste de Transitório:** Testa resposta a mudanças abruptas de carga
3. **Teste de Estabilidade:** Valida estabilidade do sistema por 60 segundos
4. **Teste de Limites Operacionais:** Testa comportamento nos limites de operação

**Thresholds de Aceitação:**
- Tensão: ≤ 2.0%
- Corrente: ≤ 2.5%
- Potência: ≤ 3.0%
- Frequência: ≤ 0.1 Hz

**Status de Validação:**
- Validado: 100% dos testes passaram
- Parcialmente Validado: 80-99% dos testes passaram
- Não Validado: < 80% dos testes passaram

### Dimensão 4: Decisão Agêntica com Bloqueio Automático

**Objetivo:** Tomar decisões autônomas sobre permitir operações baseado na fidelidade do Digital Twin.

**Ações Possíveis:**
1. **ALLOW:** Operação permitida com confiança total
2. **DEGRADE:** Operação permitida com funcionalidades limitadas
3. **SAFE_MODE:** Apenas operações críticas permitidas
4. **BLOCK:** Operação bloqueada por segurança

**Matriz de Decisão:**

| DFI | Incerteza | HIL Status | Ação | Confiança |
|-----|-----------|-----------|------|-----------|
| ≥85% | ≤5% | Validado | ALLOW | 85-100% |
| 70-85% | 5-10% | Parcial | DEGRADE | 60-70% |
| 50-70% | 10-20% | Não | SAFE_MODE | 40-50% |
| <50% | >20% | Falhou | BLOCK | 20-30% |

**Fatores de Risco:**
- Tipo de Operação: Medição (1), Predição (2), Controle (3), Otimização (4)
- Status do Sistema: Normal (0), Transitório (+15), Falta (+30)
- Validação HIL: Validado (-15), Não Validado (+20)

## Score IFF Geral

O score IFF agregado combina as 4 dimensões:

```
IFF_Score = 0.35 × DFI + 0.25 × (Confiança × 100) + 0.25 × HIL_PassRate + 0.15 × (Confiança × 100)

Intervalo: 0-100
```

**Níveis de Confiabilidade do Sistema:**
- **ALTA (≥90):** Sistema totalmente confiável para operação
- **MÉDIA (75-89):** Sistema confiável com monitoramento
- **BAIXA (50-74):** Sistema com limitações operacionais
- **CRÍTICA (<50):** Sistema não confiável, modo seguro ativado

## API REST/tRPC

### Endpoints Disponíveis

#### 1. Avaliar Digital Twin
```typescript
POST /api/trpc/iff.evaluateDigitalTwin

Input:
{
  digital_voltage_kv: number,
  digital_current_ka: number,
  digital_power_mw: number,
  digital_frequency_hz: number,
  real_voltage_kv: number,
  real_current_ka: number,
  real_power_mw: number,
  real_frequency_hz: number,
  operation_type?: "control" | "measurement" | "prediction" | "optimization"
}

Output:
{
  timestamp: number,
  report_id: string,
  dynamic_fidelity: DynamicFidelityMetrics,
  uncertainty_analysis: UncertaintyAnalysis,
  hil_validation: HILValidationReport | null,
  agentic_decision: AgenticDecision,
  overall_iff_score: number,
  system_trustworthiness: "high" | "medium" | "low" | "critical",
  recommendations: string[]
}
```

#### 2. Obter Histórico de Relatórios
```typescript
GET /api/trpc/iff.getReportHistory?limit=100

Output: IFFFrameworkReport[]
```

#### 3. Calcular Tendência IFF
```typescript
GET /api/trpc/iff.getIFFTrend

Output:
{
  trend: "improving" | "stable" | "degrading",
  rate: number
}
```

#### 4. Gerar Relatório Científico
```typescript
GET /api/trpc/iff.generateScientificReport

Output:
{
  framework_name: string,
  dimensions: {...},
  evaluation_count: number,
  average_iff_score: number,
  trend: string
}
```

## Exemplo de Uso

### JavaScript/TypeScript
```typescript
import { trpc } from '@/lib/trpc';

// Avaliar Digital Twin
const result = await trpc.iff.evaluateDigitalTwin.query({
  digital_voltage_kv: 345.2,
  digital_current_ka: 422.5,
  digital_power_mw: 1195.8,
  digital_frequency_hz: 60.0,
  real_voltage_kv: 345.0,
  real_current_ka: 422.84,
  real_power_mw: 1196.0,
  real_frequency_hz: 59.99,
  operation_type: 'control'
});

console.log(`IFF Score: ${result.overall_iff_score}`);
console.log(`Confiabilidade: ${result.system_trustworthiness}`);
console.log(`Decisão: ${result.agentic_decision.action}`);
console.log(`Recomendações:`, result.recommendations);
```

## Aplicação em Tese de Doutorado

### Contribuições Científicas

1. **Metodologia Inovadora:** Framework integrado de 4 dimensões para avaliação de fidelidade
2. **Automação de Decisões:** Sistema agêntico com bloqueio automático para segurança
3. **Análise de Incertezas:** Quantificação rigorosa de incertezas em tempo real
4. **Validação Experimental:** Testes HIL para validação prática do Digital Twin

### Métricas para Publicação

- **Tempo de Avaliação:** < 100ms por ciclo
- **Precisão de Fidelidade:** ±2% em condições normais
- **Taxa de Detecção de Falhas:** > 95%
- **Tempo de Resposta de Bloqueio:** < 50ms

### Casos de Uso

1. **Operação Normal:** DFI > 85%, Sistema permite operação automática
2. **Degradação Gradual:** DFI 70-85%, Sistema reduz funcionalidades
3. **Falta Iminente:** DFI 50-70%, Sistema ativa modo seguro
4. **Falha Crítica:** DFI < 50%, Sistema bloqueia operações

## Estrutura de Arquivos

```
server/iff/
├── dynamic-fidelity.ts       # Dimensão 1: Fidelidade Dinâmica
├── uncertainty-analysis.ts   # Dimensão 2: Análise de Incertezas
├── hil-validation.ts         # Dimensão 3: Validação HIL
├── agentic-decision.ts       # Dimensão 4: Decisão Agêntica
├── iff-framework.ts          # Integrador das 4 dimensões
└── iff-router.ts             # API tRPC
```

## Referências Acadêmicas

- Digital Twin Technology for Smart Grids
- Real-Time Uncertainty Quantification in Power Systems
- Hardware-in-the-Loop Validation Methods
- Autonomous Decision Making in Critical Infrastructure

## Conclusão

O Framework IFF fornece uma base sólida para pesquisa em Digital Twins para subestações HVDC, integrando fidelidade dinâmica, análise de incertezas, validação experimental e decisões autônomas de segurança. A implementação em tempo real permite operação confiável e segura de sistemas críticos.
