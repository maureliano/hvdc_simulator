# Framework de Índice de Fidelidade Física (IFF)

## Implementação Conforme Documento de Qualificação

Este documento descreve a implementação do Framework IFF baseado no documento de qualificação da tese de doutorado, incluindo as 4 dimensões de avaliação de confiabilidade de Digital Twins em subestações HVDC.

---

## 1. Introdução e Contexto

### 1.1 Problema Fundamental

A pesquisa aborda a questão crítica: **"Como garantir que um Digital Twin é confiável em tempo real?"**

O Framework IFF integra três fontes independentes de incerteza:

1. **Erro de Estimação (E)**: Diferença entre estimativa do DT e medições do sistema físico
2. **Incerteza de Medição (σ)**: Degradação de sensores e qualidade dos dados
3. **Latência de Comunicação (τ)**: Atrasos na transmissão de dados

### 1.2 Alinhamento com Padrões

- **ISO 30138**: Fidelidade de Digital Twins (Geométrica, Movimento, Funcional)
- **ASME V&V**: Verificação, Validação e Quantificação de Incertezas

---

## 2. Arquitetura do Framework IFF

### 2.1 Quatro Dimensões de Avaliação

#### Dimensão 1: Métrica de Fidelidade Dinâmica (DFI)

**Definição**: Quantifica a qualidade da representação dinâmica do Digital Twin.

**Fórmula**:
```
DFI = 100 × (1 - MAPE)

onde MAPE = Mean Absolute Percentage Error
MAPE = (1/4) × (E_voltage + E_current + E_power + E_frequency)
```

**Thresholds** (ISO 30138):
- **Excelente**: DFI ≥ 95 (MAPE ≤ 5%)
- **Bom**: DFI ≥ 85 (MAPE ≤ 15%)
- **Aceitável**: DFI ≥ 70 (MAPE ≤ 30%)
- **Pobre**: DFI ≥ 50 (MAPE ≤ 50%)
- **Crítico**: DFI < 50 (MAPE > 50%)

**Componentes Medidos**:
- Erro de Tensão (%): `|V_DT - V_real| / |V_real| × 100`
- Erro de Corrente (%): `|I_DT - I_real| / |I_real| × 100`
- Erro de Potência (%): `|P_DT - P_real| / |P_real| × 100`
- Erro de Frequência (Hz): `|f_DT - f_real|`

**Implementação**: `server/iff/dynamic-fidelity.ts`

---

#### Dimensão 2: Análise de Incertezas em Tempo Real

**Definição**: Quantifica as três fontes de incerteza e seu impacto combinado.

**Componentes**:

1. **Erro de Estimação (E)**
   - Causas: Modelo incompleto, parâmetros mal calibrados, dinâmicas não modeladas
   - Impacto: Decisões de controle incorretas, detecção de falhas atrasada

2. **Incerteza de Medição (σ)**
   - Causas: Degradação de sensores, ruído eletrônico, condições ambientais
   - Impacto: Redução de confiabilidade, filtros Kalman menos eficazes
   - Fórmula: `σ_sensor(t) = √[(1/N) × Σ(x_i - μ)²]`

3. **Latência de Comunicação (τ)**
   - Causas: Congestionamento de rede, overhead de protocolos
   - Impacto: Degradação de estabilidade (>100ms é crítico)
   - Fórmula: `τ(t) = t_recebimento - t_envio`

**Índice de Incerteza Integrada**:
```
UncertaintyIndex = w_E × normalize(E) + w_σ × normalize(σ) + w_τ × normalize(τ)

onde w_E = 0.4, w_σ = 0.35, w_τ = 0.25 (pesos baseados em ISO 30138)
```

**Implementação**: `server/iff/uncertainty-analysis.ts`

---

#### Dimensão 3: Validação com Hardware-in-the-Loop (HIL)

**Definição**: Valida sincronismo entre DT e sistema físico em tempo real.

**Características**:
- Simula sistema físico em tempo real (1ms time step típico)
- Conecta controlador real ao simulador
- Mede resposta do controlador a estímulos simulados
- Valida comportamento sem riscos

**Métricas HIL**:
- Latência de Comunicação Real: Medida entre simulador e controlador
- Sincronismo: Diferença de fase entre DT e sistema físico
- Tempo de Resposta: Latência do controlador a eventos

**Validação ASME V&V**:
- **Verificação**: Código/modelo implementado corretamente?
- **Validação**: Modelo representa sistema físico adequadamente?
- **Quantificação**: Caracterizar fontes e magnitudes de incerteza

**Implementação**: `server/iff/hil-validation.ts`

---

#### Dimensão 4: Decisão Agêntica com Bloqueio Automático

**Definição**: Mecanismo automático que bloqueia controle baseado em DT quando fidelidade cai.

**Lógica de Decisão**:

```
IF IFF_Score < Threshold_Crítico (50)
  THEN Action = BLOCK_CONTROL
       Reason = "Fidelidade crítica"
       
ELSE IF IFF_Score < Threshold_Alerta (70)
  THEN Action = ALERT_OPERATOR
       Reason = "Fidelidade degradada"
       
ELSE IF IFF_Score >= Threshold_Operacional (85)
  THEN Action = ALLOW_CONTROL
       Reason = "Fidelidade aceitável"
```

**Mecanismo de Histerese**:
- Evita oscilações entre bloqueio/desbloqueio
- Zona morta de 5 pontos de IFF
- Prioriza segurança sobre disponibilidade

**Recomendações Automáticas**:
- Calibração de sensores
- Ajuste de modelo matemático
- Redução de latência de comunicação
- Manutenção preventiva

**Implementação**: `server/iff/agentic-decision.ts`

---

## 3. Cenários de Testes

### 3.1 Operação Normal

**Descrição**: Sistema operando dentro dos parâmetros nominais com pequenas variações.

**Parâmetros**:
- Variações de ±2% nas medições
- Sem erros injetados
- Duração: 10-60 segundos

**Resultado Esperado**: DFI ≥ 95 (Excelente)

---

### 3.2 Erro de Estimação (Model Error)

**Descrição**: Modelo matemático impreciso do Digital Twin.

**Parâmetros**:
- Magnitude do erro: 1-50%
- Erro sistemático (bias) em todas as medições
- Duração: 5-60 segundos

**Resultado Esperado**: DFI degrada conforme magnitude do erro

---

### 3.3 Degradação de Sensores

**Descrição**: Incerteza de medição aumentando ao longo do tempo.

**Parâmetros**:
- Degradação inicial: 0-10%
- Taxa de degradação: 0.1-2% por minuto
- Ruído gaussiano proporcional à degradação

**Resultado Esperado**: DFI degrada linearmente com o tempo

---

### 3.4 Latência de Comunicação

**Descrição**: Atraso na transmissão de dados entre sistema físico e DT.

**Parâmetros**:
- Latência: 10-500 ms
- Simula atraso usando valores passados
- Duração: 5-60 segundos

**Resultado Esperado**: DFI degrada com latência > 100ms

---

### 3.5 Falha Trifásica (Three-Phase Fault)

**Descrição**: Perda completa de tensão em todas as fases.

**Parâmetros**:
- Tempo de início: 1-10 segundos
- Duração da falha: 0.1-2 segundos
- Tensão cai para zero

**Resultado Esperado**:
- DFI cai drasticamente durante falha
- Bloqueio automático ativado
- Tempo de detecção: < 50ms

---

### 3.6 Falha Bifásica (Two-Phase Fault)

**Descrição**: Perda de tensão em duas fases.

**Parâmetros**:
- Redução típica: ~58% em tensão/corrente
- Queda de frequência: ~0.5 Hz
- Duração: 0.1-2 segundos

**Resultado Esperado**:
- DFI reduz em ~42%
- Bloqueio automático se DFI < 50

---

### 3.7 Ataque Cibernético (False Data Injection - FDI)

**Descrição**: Injeção de dados falsos nos sensores.

**Parâmetros**:
- Magnitude de injeção: 5-100%
- Afeta tensão, corrente, potência e frequência
- Duração: 0.5-2 segundos

**Resultado Esperado**:
- DFI cai drasticamente
- Bloqueio automático ativado
- Detecção de anomalia em tempo real

---

## 4. Fluxo de Avaliação IFF

### 4.1 Pipeline de Cálculo

```
1. Coletar Medições
   ├─ Digital Twin: V_DT, I_DT, P_DT, f_DT
   └─ Sistema Físico: V_real, I_real, P_real, f_real

2. Calcular Dimensão 1: Fidelidade Dinâmica
   ├─ Calcular erros percentuais
   ├─ Calcular MAPE
   └─ Gerar DFI e status

3. Calcular Dimensão 2: Incertezas
   ├─ Quantificar erro de estimação
   ├─ Quantificar incerteza de medição
   ├─ Quantificar latência
   └─ Gerar índice integrado

4. Validar Dimensão 3: HIL
   ├─ Medir latência real
   ├─ Validar sincronismo
   └─ Confirmar validação ASME V&V

5. Tomar Decisão Dimensão 4: Agêntica
   ├─ Calcular IFF Score integrado
   ├─ Aplicar lógica de decisão
   ├─ Gerar recomendações
   └─ Bloquear/Permitir controle

6. Gerar Relatório
   ├─ Consolidar métricas
   ├─ Documentar decisão
   └─ Armazenar para auditoria
```

---

## 5. Endpoints da API tRPC

### 5.1 Avaliação de Fidelidade

```typescript
// Calcular fidelidade dinâmica
trpc.iff.calculateDynamicFidelity({
  digital_twin_measurement: { voltage_kv, current_ka, power_mw, frequency_hz },
  physical_system_measurement: { voltage_kv, current_ka, power_mw, frequency_hz }
})

// Analisar incertezas
trpc.iff.analyzeUncertainties({
  estimation_error_percent: number,
  measurement_uncertainty_percent: number,
  communication_latency_ms: number
})

// Validar com HIL
trpc.iff.validateWithHIL({
  simulation_time_ms: number,
  hil_time_step_ms: number,
  measurement_count: number
})

// Tomar decisão agêntica
trpc.iff.makeAgenticDecision({
  iff_score: number,
  dynamic_fidelity_index: number,
  uncertainty_level: number,
  hil_validation_passed: boolean
})
```

### 5.2 Cenários de Testes

```typescript
// Gerar cenários
trpc.iff.generateNormalOperation({ duration_seconds, sampling_rate_hz })
trpc.iff.generateModelError({ duration_seconds, sampling_rate_hz, error_magnitude_percent })
trpc.iff.generateSensorDegradation({ duration_seconds, initial_degradation_percent, degradation_rate_percent_per_minute })
trpc.iff.generateCommunicationLatency({ duration_seconds, latency_ms })
trpc.iff.generateThreePhaseFault({ duration_seconds, fault_start_time_seconds, fault_duration_seconds })
trpc.iff.generateTwoPhaseFault({ duration_seconds, fault_start_time_seconds, fault_duration_seconds })
trpc.iff.generateCyberAttack({ duration_seconds, attack_start_time_seconds, attack_duration_seconds, injection_magnitude_percent })

// Gerar relatório científico
trpc.iff.generateScientificReport({
  iff_score: number,
  dynamic_fidelity_index: number,
  uncertainty_level: number,
  hil_validation_passed: boolean,
  test_scenarios_completed: number
})
```

---

## 6. Dashboard IFF Analytics

### 6.1 Visualizações

- **Gráfico de Tendência**: Evolução do IFF Score ao longo do tempo
- **Distribuição de Decisões**: Histograma de ações agênticas (Allow/Alert/Block)
- **Heatmap de Confiabilidade**: Matriz temporal de status de fidelidade
- **Estatísticas Resumidas**: Média, desvio padrão, min/max de métricas

### 6.2 Filtros Interativos

- Período de tempo (últimas 1h, 24h, 7 dias, customizado)
- Tipo de operação (controle, medição, predição, otimização)
- Cenário de teste (normal, erro, falha, ataque)
- Componente (tensão, corrente, potência, frequência)

---

## 7. Página de Testes de Cenários

### 7.1 Interface Interativa

- Seleção de cenário com descrição
- Controles deslizantes para parâmetros
- Botão de execução com indicador de progresso
- Exibição de resultados em tempo real

### 7.2 Resultados Disponíveis

- Estatísticas consolidadas (média, desvio padrão)
- Taxa de erro e magnitude máxima
- Detecção de falha e tempo de detecção
- Exportação de dados para análise

---

## 8. Validação e Testes

### 8.1 Suite de Testes Vitest

- 15 testes cobrindo todas as 4 dimensões
- Validação de cálculos matemáticos
- Verificação de thresholds
- Testes de lógica de decisão

### 8.2 Reprodutibilidade Científica

- Todos os cálculos determinísticos
- Sementes aleatórias fixas para testes
- Documentação completa de fórmulas
- Rastreabilidade de decisões

---

## 9. Estrutura de Arquivos

```
server/iff/
├── dynamic-fidelity.ts          # Dimensão 1: Fidelidade Dinâmica
├── uncertainty-analysis.ts      # Dimensão 2: Análise de Incertezas
├── hil-validation.ts            # Dimensão 3: Validação HIL
├── agentic-decision.ts          # Dimensão 4: Decisão Agêntica
├── test-scenarios.ts            # Gerador de Cenários de Testes
├── iff-framework.ts             # Integrador do Framework
├── iff-router.ts                # Router tRPC
└── iff-framework.test.ts        # Testes Vitest

client/src/pages/
├── IFFAnalytics.tsx             # Dashboard de Análise
└── IFFTestScenarios.tsx         # Página de Testes
```

---

## 10. Próximos Passos para Artigo Científico

1. **Executar todos os cenários de testes** e coletar dados
2. **Gerar gráficos e tabelas** para publicação
3. **Análise estatística** dos resultados
4. **Comparação com métricas existentes** (MAPE, índices tradicionais)
5. **Documentação de conclusões** e trabalhos futuros

---

## 11. Referências

- ISO/IEC CD TR 30138:2025 - Digital Twin Fidelity Metric
- ASME V&V-10 - Verification and Validation in Computational Solid Mechanics
- Documento de Qualificação da Tese (Capítulos 1-4)
- Revisão Sistemática de Literatura (25 artigos analisados)

---

**Versão**: 1.0  
**Data**: Janeiro 2026  
**Autor**: Pesquisa de Doutorado  
**Status**: Implementação Completa
