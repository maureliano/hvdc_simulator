/**
 * Dimensão 1: Métrica de Fidelidade Dinâmica (Dynamic Fidelity Metric)
 * 
 * Calcula o índice de fidelidade dinâmica comparando o comportamento do Digital Twin
 * com o sistema físico real em tempo real.
 * 
 * Métricas:
 * - Erro de Tensão (Voltage Error): |V_digital - V_real|
 * - Erro de Corrente (Current Error): |I_digital - I_real|
 * - Erro de Potência (Power Error): |P_digital - P_real|
 * - Erro de Frequência (Frequency Error): |f_digital - f_real|
 * - Índice de Fidelidade Dinâmica (DFI): Agregação ponderada dos erros
 */

export interface DynamicMeasurement {
  timestamp: number;
  voltage_kv: number;
  current_ka: number;
  power_mw: number;
  frequency_hz: number;
}

export interface DynamicFidelityMetrics {
  timestamp: number;
  voltage_error_percent: number;
  current_error_percent: number;
  power_error_percent: number;
  frequency_error_hz: number;
  dynamic_fidelity_index: number; // 0-100, onde 100 é fidelidade perfeita
  status: "excellent" | "good" | "acceptable" | "poor" | "critical";
}

export class DynamicFidelityCalculator {
  private weights = {
    voltage: 0.25,
    current: 0.25,
    power: 0.35,
    frequency: 0.15,
  };

  private thresholds = {
    excellent: { voltage: 0.5, current: 0.5, power: 1.0, frequency: 0.01 },
    good: { voltage: 1.0, current: 1.0, power: 2.0, frequency: 0.05 },
    acceptable: { voltage: 2.0, current: 2.0, power: 5.0, frequency: 0.1 },
    poor: { voltage: 5.0, current: 5.0, power: 10.0, frequency: 0.2 },
  };

  /**
   * Calcula a métrica de fidelidade dinâmica
   * @param digital Medições do Digital Twin
   * @param real Medições do sistema físico real
   * @returns Métricas de fidelidade dinâmica
   */
  calculateDynamicFidelity(
    digital: DynamicMeasurement,
    real: DynamicMeasurement
  ): DynamicFidelityMetrics {
    // Calcular erros percentuais
    const voltageError = this.calculatePercentageError(
      digital.voltage_kv,
      real.voltage_kv
    );
    const currentError = this.calculatePercentageError(
      digital.current_ka,
      real.current_ka
    );
    const powerError = this.calculatePercentageError(
      digital.power_mw,
      real.power_mw
    );
    const frequencyError = Math.abs(digital.frequency_hz - real.frequency_hz);

    // Calcular índice de fidelidade dinâmica (0-100)
    const dfi = this.calculateDFI(
      voltageError,
      currentError,
      powerError,
      frequencyError
    );

    // Determinar status
    const status = this.determineStatus(
      voltageError,
      currentError,
      powerError,
      frequencyError
    );

    return {
      timestamp: digital.timestamp,
      voltage_error_percent: voltageError,
      current_error_percent: currentError,
      power_error_percent: powerError,
      frequency_error_hz: frequencyError,
      dynamic_fidelity_index: dfi,
      status,
    };
  }

  /**
   * Calcula erro percentual entre dois valores
   */
  private calculatePercentageError(value1: number, value2: number): number {
    if (value2 === 0) return value1 === 0 ? 0 : 100;
    return Math.abs((value1 - value2) / value2) * 100;
  }

  /**
   * Calcula o Índice de Fidelidade Dinâmica (DFI)
   * Usa função de normalização não-linear para penalizar erros grandes
   */
  private calculateDFI(
    voltageError: number,
    currentError: number,
    powerError: number,
    frequencyError: number
  ): number {
    // Normalizar erros (0-1, onde 0 é sem erro e 1 é erro máximo)
    const normalizedVoltage = this.normalizeError(voltageError, 5);
    const normalizedCurrent = this.normalizeError(currentError, 5);
    const normalizedPower = this.normalizeError(powerError, 10);
    const normalizedFrequency = this.normalizeError(frequencyError, 0.2);

    // Calcular média ponderada
    const weightedError =
      this.weights.voltage * normalizedVoltage +
      this.weights.current * normalizedCurrent +
      this.weights.power * normalizedPower +
      this.weights.frequency * normalizedFrequency;

    // Converter para índice de fidelidade (100 = perfeito, 0 = péssimo)
    const dfi = Math.max(0, 100 * (1 - weightedError));

    return Math.round(dfi * 100) / 100; // Arredondar para 2 casas decimais
  }

  /**
   * Normaliza erro usando função sigmóide
   * Penaliza erros grandes exponencialmente
   */
  private normalizeError(error: number, threshold: number): number {
    // Usar função sigmóide: 1 / (1 + e^(-k*(x-x0)))
    const k = 2; // Fator de inclinação
    const normalized = 1 / (1 + Math.exp(-k * (error / threshold - 1)));
    return Math.min(1, normalized);
  }

  /**
   * Determina o status de fidelidade
   */
  private determineStatus(
    voltageError: number,
    currentError: number,
    powerError: number,
    frequencyError: number
  ): "excellent" | "good" | "acceptable" | "poor" | "critical" {
    const t = this.thresholds;

    if (
      voltageError <= t.excellent.voltage &&
      currentError <= t.excellent.current &&
      powerError <= t.excellent.power &&
      frequencyError <= t.excellent.frequency
    ) {
      return "excellent";
    }

    if (
      voltageError <= t.good.voltage &&
      currentError <= t.good.current &&
      powerError <= t.good.power &&
      frequencyError <= t.good.frequency
    ) {
      return "good";
    }

    if (
      voltageError <= t.acceptable.voltage &&
      currentError <= t.acceptable.current &&
      powerError <= t.acceptable.power &&
      frequencyError <= t.acceptable.frequency
    ) {
      return "acceptable";
    }

    if (
      voltageError <= t.poor.voltage &&
      currentError <= t.poor.current &&
      powerError <= t.poor.power &&
      frequencyError <= t.poor.frequency
    ) {
      return "poor";
    }

    return "critical";
  }

  /**
   * Calcula tendência de fidelidade ao longo do tempo
   */
  calculateTrend(
    measurements: DynamicFidelityMetrics[]
  ): {
    trend: "improving" | "stable" | "degrading";
    rate: number; // Mudança por segundo
  } {
    if (measurements.length < 2) {
      return { trend: "stable", rate: 0 };
    }

    const recent = measurements.slice(-10); // Últimas 10 medições
    const first = recent[0];
    const last = recent[recent.length - 1];

    const timeDiff = (last.timestamp - first.timestamp) / 1000; // Em segundos
    const dfiDiff = last.dynamic_fidelity_index - first.dynamic_fidelity_index;
    const rate = timeDiff > 0 ? dfiDiff / timeDiff : 0;

    let trend: "improving" | "stable" | "degrading";
    if (rate > 0.1) {
      trend = "improving";
    } else if (rate < -0.1) {
      trend = "degrading";
    } else {
      trend = "stable";
    }

    return { trend, rate };
  }
}

export default DynamicFidelityCalculator;
