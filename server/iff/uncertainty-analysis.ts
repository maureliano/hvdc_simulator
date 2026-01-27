/**
 * Dimensão 2: Análise de Incertezas em Tempo Real (Real-Time Uncertainty Analysis)
 * 
 * Quantifica as incertezas inerentes ao Digital Twin usando métodos estatísticos
 * e análise de sensibilidade. Identifica fontes de incerteza e seu impacto na fidelidade.
 * 
 * Tipos de Incerteza:
 * - Incerteza Paramétrica: Variação nos parâmetros do modelo
 * - Incerteza de Medição: Erros dos sensores
 * - Incerteza de Modelo: Simplificações e aproximações
 * - Incerteza Ambiental: Variações externas não modeladas
 */

export interface UncertaintyBound {
  lower: number;
  upper: number;
  nominal: number;
  uncertainty_percent: number;
}

export interface UncertaintyAnalysis {
  timestamp: number;
  voltage_uncertainty: UncertaintyBound;
  current_uncertainty: UncertaintyBound;
  power_uncertainty: UncertaintyBound;
  frequency_uncertainty: UncertaintyBound;
  overall_uncertainty_percent: number;
  confidence_level: number; // 0-1, onde 1 é 100% confiança
  uncertainty_sources: {
    parametric: number; // %
    measurement: number; // %
    model: number; // %
    environmental: number; // %
  };
}

export class UncertaintyAnalyzer {
  /**
   * Incertezas padrão para cada tipo de medição (em %)
   */
  private baseUncertainties = {
    voltage: {
      parametric: 0.5,
      measurement: 0.2,
      model: 0.3,
      environmental: 0.2,
    },
    current: {
      parametric: 0.8,
      measurement: 0.3,
      model: 0.5,
      environmental: 0.3,
    },
    power: {
      parametric: 1.0,
      measurement: 0.4,
      model: 0.8,
      environmental: 0.5,
    },
    frequency: {
      parametric: 0.01,
      measurement: 0.005,
      model: 0.01,
      environmental: 0.005,
    },
  };

  /**
   * Calcula análise de incertezas
   */
  analyzeUncertainties(
    nominalValues: {
      voltage_kv: number;
      current_ka: number;
      power_mw: number;
      frequency_hz: number;
    },
    operatingCondition: "normal" | "transient" | "fault" = "normal"
  ): UncertaintyAnalysis {
    // Ajustar incertezas baseado na condição de operação
    const uncertaintyFactors = this.getUncertaintyFactors(operatingCondition);

    // Calcular incertezas para cada grandeza
    const voltageUncertainty = this.calculateUncertaintyBound(
      nominalValues.voltage_kv,
      this.baseUncertainties.voltage,
      uncertaintyFactors.voltage
    );

    const currentUncertainty = this.calculateUncertaintyBound(
      nominalValues.current_ka,
      this.baseUncertainties.current,
      uncertaintyFactors.current
    );

    const powerUncertainty = this.calculateUncertaintyBound(
      nominalValues.power_mw,
      this.baseUncertainties.power,
      uncertaintyFactors.power
    );

    const frequencyUncertainty = this.calculateUncertaintyBound(
      nominalValues.frequency_hz,
      this.baseUncertainties.frequency,
      uncertaintyFactors.frequency,
      true // isFrequency
    );

    // Calcular incerteza geral (agregação)
    const overallUncertainty = this.aggregateUncertainties(
      voltageUncertainty.uncertainty_percent,
      currentUncertainty.uncertainty_percent,
      powerUncertainty.uncertainty_percent,
      frequencyUncertainty.uncertainty_percent
    );

    // Calcular nível de confiança
    const confidenceLevel = this.calculateConfidenceLevel(overallUncertainty);

    // Decompor fontes de incerteza
    const uncertaintySources = this.decomposeUncertaintySources(
      this.baseUncertainties,
      uncertaintyFactors
    );

    return {
      timestamp: Date.now(),
      voltage_uncertainty: voltageUncertainty,
      current_uncertainty: currentUncertainty,
      power_uncertainty: powerUncertainty,
      frequency_uncertainty: frequencyUncertainty,
      overall_uncertainty_percent: overallUncertainty,
      confidence_level: confidenceLevel,
      uncertainty_sources: uncertaintySources,
    };
  }

  /**
   * Calcula limites de incerteza para uma grandeza
   */
  private calculateUncertaintyBound(
    nominalValue: number,
    baseUncertainties: Record<string, number>,
    factor: number,
    isFrequency: boolean = false
  ): UncertaintyBound {
    // Somar todas as fontes de incerteza em quadratura
    const totalUncertaintyPercent = Math.sqrt(
      Object.values(baseUncertainties).reduce((sum, u) => sum + u * u, 0)
    ) * factor;

    let lower: number, upper: number;

    if (isFrequency) {
      // Para frequência, usar valor absoluto
      const delta = (nominalValue * totalUncertaintyPercent) / 100;
      lower = nominalValue - delta;
      upper = nominalValue + delta;
    } else {
      // Para outras grandezas, usar percentual
      lower = nominalValue * (1 - totalUncertaintyPercent / 100);
      upper = nominalValue * (1 + totalUncertaintyPercent / 100);
    }

    return {
      lower: Math.round(lower * 1000) / 1000,
      upper: Math.round(upper * 1000) / 1000,
      nominal: nominalValue,
      uncertainty_percent: Math.round(totalUncertaintyPercent * 100) / 100,
    };
  }

  /**
   * Obtém fatores de incerteza baseado na condição de operação
   */
  private getUncertaintyFactors(
    operatingCondition: "normal" | "transient" | "fault"
  ): Record<string, number> {
    const factors = {
      normal: { voltage: 1.0, current: 1.0, power: 1.0, frequency: 1.0 },
      transient: { voltage: 1.5, current: 1.8, power: 2.0, frequency: 2.5 },
      fault: { voltage: 2.0, current: 2.5, power: 3.0, frequency: 3.0 },
    };

    return factors[operatingCondition];
  }

  /**
   * Agrega incertezas de múltiplas grandezas
   */
  private aggregateUncertainties(
    voltageUncertainty: number,
    currentUncertainty: number,
    powerUncertainty: number,
    frequencyUncertainty: number
  ): number {
    // Usar raiz quadrada da soma dos quadrados (RSS)
    const rss = Math.sqrt(
      voltageUncertainty ** 2 +
        currentUncertainty ** 2 +
        powerUncertainty ** 2 +
        frequencyUncertainty ** 2
    );

    return Math.round(rss * 100) / 100;
  }

  /**
   * Calcula nível de confiança (0-1)
   * Baseado na incerteza geral
   */
  private calculateConfidenceLevel(overallUncertainty: number): number {
    // Usar função de decaimento exponencial
    // Confiança = e^(-k*incerteza), onde k é uma constante
    const k = 0.5;
    const confidence = Math.exp(-k * overallUncertainty);
    return Math.round(confidence * 10000) / 10000;
  }

  /**
   * Decompõe as fontes de incerteza
   */
  private decomposeUncertaintySources(
    baseUncertainties: Record<string, Record<string, number>>,
    factors: Record<string, number>
  ): {
    parametric: number;
    measurement: number;
    model: number;
    environmental: number;
  } {
    // Calcular média das incertezas de cada fonte
    const sources = {
      parametric: 0,
      measurement: 0,
      model: 0,
      environmental: 0,
    };

    let count = 0;
    for (const [key, uncertainties] of Object.entries(baseUncertainties)) {
      const factor = factors[key] || 1.0;
      for (const [source, value] of Object.entries(uncertainties)) {
        sources[source as keyof typeof sources] += value * factor;
      }
      count++;
    }

    // Normalizar
    const total = Object.values(sources).reduce((a, b) => a + b, 0);
    for (const key in sources) {
      sources[key as keyof typeof sources] = Math.round(
        (sources[key as keyof typeof sources] / total) * 10000
      ) / 100;
    }

    return sources;
  }

  /**
   * Análise de sensibilidade: qual parâmetro mais afeta a fidelidade?
   */
  performSensitivityAnalysis(
    nominalValues: Record<string, number>,
    perturbation: number = 0.01 // 1% de perturbação
  ): Record<string, number> {
    const sensitivity: Record<string, number> = {};

    for (const [param, value] of Object.entries(nominalValues)) {
      // Perturbar parâmetro
      const perturbedValue = value * (1 + perturbation);
      const delta = perturbedValue - value;

      // Calcular impacto (simplificado)
      sensitivity[param] = Math.abs(delta / value) * 100;
    }

    return sensitivity;
  }
}

export default UncertaintyAnalyzer;
