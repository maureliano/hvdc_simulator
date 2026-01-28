# Framework de Pesquisa: Digital Twin Confiável em Tempo Real
## Índice de Fidelidade Física (IFF) para Operação Crítica

**Autor:** [Seu Nome]  
**Programa:** Doutorado em [Sua Área]  
**Data:** Janeiro 2026  
**Versão:** 1.0

---

## 1. Introdução e Motivação

A operação de sistemas críticos (redes elétricas, refinarias, plantas de manufatura) cada vez mais depende de Digital Twins em tempo real para monitoramento, previsão e otimização. Porém, **não existe consenso científico sobre como garantir que um Digital Twin é confiável o suficiente para ser utilizado em operação crítica**.

Este framework propõe um **Índice de Fidelidade Física (IFF)** que monitora continuamente a qualidade da simulação e toma decisões automáticas sobre sua operação, respondendo à pergunta de pesquisa:

> **Como garantir que um Digital Twin em tempo real é confiável o suficiente para ser utilizado em operação crítica?**

---

## 2. Gap de Pesquisa Identificado

Através de revisão sistemática, identificamos 4 critérios principais que **não são simultaneamente abordados** na literatura:

| Critério | Descrição | Estado Atual | Contribuição |
|----------|-----------|--------------|--------------|
| **Métrica de Fidelidade** | Define métrica explícita para quantificar fidelidade | Raramente explícito | IFF como métrica contínua |
| **Análise de Incertezas** | Aborda incerteza de medição e/ou latência | Parcialmente abordado | Propagação de incertezas em tempo real |
| **Validação HIL** | Utiliza Hardware-in-the-Loop ou co-simulação | Pouco explorado em tempo real | Arquitetura de co-simulação sincronizada |
| **Decisão Agêntica** | Decisão automática baseada em fidelidade | Inexistente | Bloqueio automático quando IFF < threshold |

---

## 3. Índice de Fidelidade Física (IFF)

### 3.1 Definição Matemática

O IFF é calculado como uma média ponderada de 4 dimensões de fidelidade:

```
IFF(t) = w₁·D₁(t) + w₂·D₂(t) + w₃·D₃(t) + w₄·D₄(t)

Onde:
- D₁(t) = Fidelidade de Estado (comparação de variáveis de estado)
- D₂(t) = Fidelidade de Dinâmica (comparação de derivadas)
- D₃(t) = Fidelidade de Energia (balanço energético)
- D₄(t) = Fidelidade de Estabilidade (análise de autovalores)

- w₁, w₂, w₃, w₄ = pesos configuráveis (∑wᵢ = 1)
- IFF ∈ [0, 1], onde 1 = fidelidade perfeita
```

### 3.2 Dimensões do IFF

#### D₁: Fidelidade de Estado
Mede o erro relativo entre variáveis simuladas e medidas:

```
D₁(t) = 1 - mean(|x_sim(t) - x_real(t)| / |x_real(t)|)
```

**Variáveis monitoradas:**
- Tensão em pontos críticos (V)
- Corrente nos ramos (A)
- Potência ativa/reativa (MW, MVAr)
- Frequência do sistema (Hz)

#### D₂: Fidelidade de Dinâmica
Mede a correspondência entre velocidades de mudança:

```
D₂(t) = 1 - mean(|dx_sim/dt - dx_real/dt| / |dx_real/dt|)
```

**Aplicação:** Detecta quando simulação é lenta/rápida demais

#### D₃: Fidelidade de Energia
Valida conservação de energia no sistema:

```
D₃(t) = 1 - |P_gerado - P_consumido - P_perdas| / P_total
```

**Aplicação:** Detecta erros em modelagem de componentes

#### D₄: Fidelidade de Estabilidade
Analisa se modos de oscilação são reproduzidos:

```
D₄(t) = 1 - max(|λ_sim - λ_real| / |λ_real|)

Onde λ são autovalores do sistema linearizado
```

**Aplicação:** Detecta quando simulação não reproduz comportamento oscilatório

### 3.3 Threshold de Operação

```
IFF ≥ 0.95  → Digital Twin CONFIÁVEL (operação crítica permitida)
0.90 ≤ IFF < 0.95  → Digital Twin PARCIALMENTE CONFIÁVEL (monitoramento recomendado)
IFF < 0.90  → Digital Twin NÃO CONFIÁVEL (bloqueio automático)
```

---

## 4. Análise de Incertezas

### 4.1 Fontes de Incerteza

| Fonte | Tipo | Magnitude Típica | Impacto |
|-------|------|------------------|--------|
| Tolerância de sensores | Medição | ±0.5-2% | Reduz D₁ |
| Latência de comunicação | Temporal | 10-100 ms | Reduz D₂ |
| Erros de modelagem | Sistemático | ±5-10% | Reduz D₃, D₄ |
| Variação de parâmetros | Paramétrico | ±3-5% | Reduz D₁, D₃ |

### 4.2 Propagação de Incertezas

Cada incerteza é propagada através do cálculo de IFF:

```
σ²_IFF = Σᵢ (∂IFF/∂xᵢ)² · σ²ᵢ

Onde σᵢ é a incerteza de cada fonte
```

**Resultado:** Intervalo de confiança para IFF em tempo real

---

## 5. Validação Hardware-in-the-Loop (HIL)

### 5.1 Arquitetura

```
┌─────────────────────────────────────────────────┐
│         Sistema Real (SCADA/RTU)                │
│  Medições: V, I, P, Q, f                        │
└────────────────┬────────────────────────────────┘
                 │ (latência τ)
                 ↓
┌─────────────────────────────────────────────────┐
│     Digital Twin (Simulação em Tempo Real)      │
│  - Pandapower para fluxo de potência            │
│  - Atualização a cada Δt = 100 ms               │
│  - Cálculo de IFF em paralelo                   │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│      Módulo de Decisão Agêntica                 │
│  - Monitora IFF em tempo real                   │
│  - Bloqueia operação se IFF < 0.90              │
│  - Registra todas as decisões                   │
└─────────────────────────────────────────────────┘
```

### 5.2 Métricas de Sincronização

- **Latência de atualização:** tempo entre medição e atualização do DT
- **Jitter:** variação da latência
- **Taxa de sincronização:** % de ciclos onde DT está sincronizado

---

## 6. Decisão Agêntica

### 6.1 Lógica de Decisão

```
IF IFF(t) < 0.90 THEN
  - Enviar ALERTA CRÍTICO
  - Bloquear recomendações do Digital Twin
  - Notificar operador
  - Registrar evento
ELSE IF IFF(t) < 0.95 THEN
  - Enviar AVISO
  - Permitir recomendações com cautela
  - Aumentar frequência de validação
ELSE
  - Digital Twin OPERACIONAL
  - Permitir recomendações normais
END IF
```

### 6.2 Histórico de Decisões

Cada decisão é registrada com:
- Timestamp
- Valor de IFF
- Razão da decisão
- Ação tomada
- Confirmação do operador

---

## 7. Implementação no HVDC Simulator

### 7.1 Componentes Implementados

**Backend (server/iff/alarm-service.ts):**
- Cálculo de IFF em tempo real
- Monitoramento de 4 dimensões
- Propagação de incertezas
- Decisões automáticas

**Frontend (client/src/pages/):**
- Dashboard de monitoramento de IFF
- Histórico de alarmes
- Análise de tendências
- Visualização de incertezas

**Banco de Dados:**
- Tabelas: iff_test_results, iff_alarm_thresholds, iff_alarm_events
- Histórico completo de testes e decisões

### 7.2 Experimentos Implementados

**Experimento 1: Validação de Fidelidade**
- Executar 100 simulações com diferentes cenários
- Comparar com dados reais (ou sintéticos validados)
- Calcular IFF para cada cenário
- Resultado: Distribuição de IFF

**Experimento 2: Análise de Incertezas**
- Injetar ruído em medições (±1%, ±2%, ±5%)
- Medir impacto em IFF
- Calcular σ_IFF para cada nível de ruído
- Resultado: Curva de sensibilidade

**Experimento 3: Validação HIL**
- Sincronizar Digital Twin com sistema real
- Medir latência e jitter
- Verificar se sincronização mantém IFF > 0.95
- Resultado: Métricas de sincronização

**Experimento 4: Decisões Agênticas**
- Simular degradação gradual do Digital Twin
- Observar quando IFF cruza thresholds
- Verificar se decisões são tomadas corretamente
- Resultado: Histórico de decisões

---

## 8. Resultados Esperados

### 8.1 Contribuições Científicas

1. **Métrica unificada de fidelidade** que combina 4 dimensões
2. **Framework de análise de incertezas** para Digital Twins em tempo real
3. **Arquitetura de co-simulação HIL** sincronizada
4. **Algoritmo de decisão agêntica** baseado em fidelidade

### 8.2 Dados Experimentais

- 100+ simulações com métricas de fidelidade
- Análise de incertezas com 5 níveis de ruído
- Validação HIL com latência variável
- 1000+ eventos de decisão agêntica

### 8.3 Publicações Esperadas

- **Artigo principal:** "Digital Twin Confiável em Tempo Real: Framework IFF para Operação Crítica"
- **Artigo secundário:** "Análise de Incertezas em Digital Twins: Propagação de Erros de Medição e Latência"
- **Conferência:** IEEE PES, CIGRE, ou similar

---

## 9. Conclusão

Este framework responde simultaneamente aos 4 critérios do gap de pesquisa:

✅ **Métrica de Fidelidade:** IFF como métrica contínua e multidimensional  
✅ **Análise de Incertezas:** Propagação de erros de medição e latência  
✅ **Validação HIL:** Arquitetura de co-simulação sincronizada  
✅ **Decisão Agêntica:** Bloqueio automático baseado em IFF  

O HVDC Simulator serve como **case study completo** que demonstra a viabilidade e eficácia do framework em um sistema crítico real.

---

## 10. Referências (Exemplo)

[Adicionar referências do seu trabalho]

- IEEE Standard 1451 - Smart Sensor Interface
- IEC 61850 - Communication Networks and Systems in Power Systems
- NIST Framework for Cyber-Physical Systems
- [Seus papers citados]

---

## Apêndice A: Equações Detalhadas

[Adicionar derivações matemáticas completas]

---

## Apêndice B: Dados Experimentais

[Tabelas e gráficos com resultados]

---

**Documento de Pesquisa - Confidencial**  
**Última atualização:** 28 de janeiro de 2026
