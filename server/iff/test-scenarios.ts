/**
 * Módulo de Cenários de Testes para Framework IFF
 * 
 * Implementa diferentes cenários de falhas e erros para validação do Framework IFF
 * conforme especificação ASME V&V e ISO 30138.
 * 
 * Cenários incluem:
 * 1. Operação Normal
 * 2. Erro de Estimação (Model Error)
 * 3. Incerteza de Medição (Sensor Degradation)
 * 4. Latência de Comunicação (Communication Delay)
 * 5. Falha Trifásica (Three-Phase Fault)
 * 6. Falha Bifásica (Two-Phase Fault)
 * 7. Falha Monofásica (Single-Phase Fault)
 * 8. Ataque Cibernético (Cyber Attack - FDI)
 */

export interface TestScenarioConfig {
  scenario_type: string;
  duration_seconds: number;
  sampling_rate_hz: number;
  parameters: Record<string, number>;
}

export interface TestScenarioResult {
  scenario_id: string;
  scenario_type: string;
  timestamp: number;
  duration_seconds: number;
  total_samples: number;
  measurements: MeasurementSample[];
  statistics: ScenarioStatistics;
  fault_detected: boolean;
  fault_time_ms: number | null;
}

export interface MeasurementSample {
  timestamp: number;
  voltage_kv: number;
  current_ka: number;
  power_mw: number;
  frequency_hz: number;
  error_injected: boolean;
  error_type: string;
  error_magnitude: number;
}

export interface ScenarioStatistics {
  voltage_mean: number;
  voltage_std: number;
  current_mean: number;
  current_std: number;
  power_mean: number;
  power_std: number;
  frequency_mean: number;
  frequency_std: number;
  error_rate_percent: number;
  max_error_magnitude: number;
}

export default class TestScenarioGenerator {
  // Parâmetros nominais do sistema HVDC
  private nominalVoltage = 345.0; // kV
  private nominalCurrent = 422.84; // kA
  private nominalPower = 1196.0; // MW
  private nominalFrequency = 60.0; // Hz

  /**
   * Gera cenário de operação normal
   */
  generateNormalOperation(config: TestScenarioConfig): TestScenarioResult {
    const samples: MeasurementSample[] = [];
    const totalSamples = config.duration_seconds * config.sampling_rate_hz;

    for (let i = 0; i < totalSamples; i++) {
      const t = i / config.sampling_rate_hz;

      // Pequenas variações normais (±2%)
      const voltageVariation = this.nominalVoltage * (1 + 0.02 * Math.sin(2 * Math.PI * 0.1 * t));
      const currentVariation = this.nominalCurrent * (1 + 0.02 * Math.cos(2 * Math.PI * 0.1 * t));
      const powerVariation = this.nominalPower * (1 + 0.02 * Math.sin(2 * Math.PI * 0.15 * t));
      const frequencyVariation = this.nominalFrequency + 0.1 * Math.sin(2 * Math.PI * 0.05 * t);

      samples.push({
        timestamp: Date.now() + i * (1000 / config.sampling_rate_hz),
        voltage_kv: voltageVariation,
        current_ka: currentVariation,
        power_mw: powerVariation,
        frequency_hz: frequencyVariation,
        error_injected: false,
        error_type: "none",
        error_magnitude: 0,
      });
    }

    return this.generateResult("normal_operation", "Normal Operation", samples, config);
  }

  /**
   * Gera cenário de erro de estimação (Model Error)
   * Simula modelo matemático impreciso do Digital Twin
   */
  generateModelError(config: TestScenarioConfig): TestScenarioResult {
    const samples: MeasurementSample[] = [];
    const totalSamples = config.duration_seconds * config.sampling_rate_hz;
    const errorMagnitude = config.parameters.error_magnitude || 15; // % de erro

    for (let i = 0; i < totalSamples; i++) {
      const t = i / config.sampling_rate_hz;

      const voltageVariation = this.nominalVoltage * (1 + 0.02 * Math.sin(2 * Math.PI * 0.1 * t));
      const currentVariation = this.nominalCurrent * (1 + 0.02 * Math.cos(2 * Math.PI * 0.1 * t));
      const powerVariation = this.nominalPower * (1 + 0.02 * Math.sin(2 * Math.PI * 0.15 * t));
      const frequencyVariation = this.nominalFrequency + 0.1 * Math.sin(2 * Math.PI * 0.05 * t);

      // Injetar erro sistemático (bias)
      const errorFactor = 1 + errorMagnitude / 100;

      samples.push({
        timestamp: Date.now() + i * (1000 / config.sampling_rate_hz),
        voltage_kv: voltageVariation * errorFactor,
        current_ka: currentVariation * errorFactor,
        power_mw: powerVariation * errorFactor,
        frequency_hz: frequencyVariation + 0.5, // Erro de 0.5 Hz
        error_injected: true,
        error_type: "model_error",
        error_magnitude: errorMagnitude,
      });
    }

    return this.generateResult("model_error", "Model Error (Estimation Error)", samples, config);
  }

  /**
   * Gera cenário de degradação de sensores
   * Simula incerteza de medição aumentando ao longo do tempo
   */
  generateSensorDegradation(config: TestScenarioConfig): TestScenarioResult {
    const samples: MeasurementSample[] = [];
    const totalSamples = config.duration_seconds * config.sampling_rate_hz;
    const initialDegradation = config.parameters.initial_degradation || 2; // %
    const degradationRate = config.parameters.degradation_rate || 0.5; // % por minuto

    for (let i = 0; i < totalSamples; i++) {
      const t = i / config.sampling_rate_hz;
      const timeMinutes = t / 60;

      // Degradação aumenta linearmente com o tempo
      const currentDegradation = initialDegradation + degradationRate * timeMinutes;

      const voltageVariation = this.nominalVoltage * (1 + 0.02 * Math.sin(2 * Math.PI * 0.1 * t));
      const currentVariation = this.nominalCurrent * (1 + 0.02 * Math.cos(2 * Math.PI * 0.1 * t));
      const powerVariation = this.nominalPower * (1 + 0.02 * Math.sin(2 * Math.PI * 0.15 * t));
      const frequencyVariation = this.nominalFrequency + 0.1 * Math.sin(2 * Math.PI * 0.05 * t);

      // Adicionar ruído gaussiano proporcional à degradação
      const noise = this.generateGaussianNoise(currentDegradation / 100);

      samples.push({
        timestamp: Date.now() + i * (1000 / config.sampling_rate_hz),
        voltage_kv: voltageVariation + noise * voltageVariation,
        current_ka: currentVariation + noise * currentVariation,
        power_mw: powerVariation + noise * powerVariation,
        frequency_hz: frequencyVariation + noise * 0.1,
        error_injected: true,
        error_type: "sensor_degradation",
        error_magnitude: currentDegradation,
      });
    }

    return this.generateResult("sensor_degradation", "Sensor Degradation", samples, config);
  }

  /**
   * Gera cenário de latência de comunicação
   * Simula atraso na transmissão de dados
   */
  generateCommunicationLatency(config: TestScenarioConfig): TestScenarioResult {
    const samples: MeasurementSample[] = [];
    const totalSamples = config.duration_seconds * config.sampling_rate_hz;
    const latencyMs = config.parameters.latency_ms || 100; // ms

    for (let i = 0; i < totalSamples; i++) {
      const t = i / config.sampling_rate_hz;

      const voltageVariation = this.nominalVoltage * (1 + 0.02 * Math.sin(2 * Math.PI * 0.1 * t));
      const currentVariation = this.nominalCurrent * (1 + 0.02 * Math.cos(2 * Math.PI * 0.1 * t));
      const powerVariation = this.nominalPower * (1 + 0.02 * Math.sin(2 * Math.PI * 0.15 * t));
      const frequencyVariation = this.nominalFrequency + 0.1 * Math.sin(2 * Math.PI * 0.05 * t);

      // Simular atraso usando valores passados
      const delayedIndex = Math.max(0, i - Math.round(latencyMs * config.sampling_rate_hz / 1000));

      samples.push({
        timestamp: Date.now() + i * (1000 / config.sampling_rate_hz),
        voltage_kv: voltageVariation,
        current_ka: currentVariation,
        power_mw: powerVariation,
        frequency_hz: frequencyVariation,
        error_injected: true,
        error_type: "communication_latency",
        error_magnitude: latencyMs,
      });
    }

    return this.generateResult("communication_latency", "Communication Latency", samples, config);
  }

  /**
   * Gera cenário de falha trifásica
   * Simula perda completa de tensão em todas as fases
   */
  generateThreePhaseFault(config: TestScenarioConfig): TestScenarioResult {
    const samples: MeasurementSample[] = [];
    const totalSamples = config.duration_seconds * config.sampling_rate_hz;
    const faultStartTime = config.parameters.fault_start_time || 2; // segundos
    const faultDuration = config.parameters.fault_duration || 0.5; // segundos

    let faultDetected = false;
    let faultTimeMs = 0;

    for (let i = 0; i < totalSamples; i++) {
      const t = i / config.sampling_rate_hz;

      let voltage = this.nominalVoltage * (1 + 0.02 * Math.sin(2 * Math.PI * 0.1 * t));
      let current = this.nominalCurrent * (1 + 0.02 * Math.cos(2 * Math.PI * 0.1 * t));
      let power = this.nominalPower * (1 + 0.02 * Math.sin(2 * Math.PI * 0.15 * t));
      let frequency = this.nominalFrequency + 0.1 * Math.sin(2 * Math.PI * 0.05 * t);

      let errorInjected = false;
      let errorType = "none";
      let errorMagnitude = 0;

      // Simular falha trifásica
      if (t >= faultStartTime && t < faultStartTime + faultDuration) {
        voltage = 0; // Tensão cai para zero
        current = 0; // Corrente cai para zero
        power = 0; // Potência cai para zero
        frequency = 0; // Frequência cai para zero
        errorInjected = true;
        errorType = "three_phase_fault";
        errorMagnitude = 100;

        if (!faultDetected) {
          faultDetected = true;
          faultTimeMs = i * (1000 / config.sampling_rate_hz);
        }
      }

      samples.push({
        timestamp: Date.now() + i * (1000 / config.sampling_rate_hz),
        voltage_kv: voltage,
        current_ka: current,
        power_mw: power,
        frequency_hz: frequency,
        error_injected: errorInjected,
        error_type: errorType,
        error_magnitude: errorMagnitude,
      });
    }

    const result = this.generateResult("three_phase_fault", "Three-Phase Fault", samples, config);
    result.fault_detected = faultDetected;
    result.fault_time_ms = faultTimeMs;

    return result;
  }

  /**
   * Gera cenário de falha bifásica
   * Simula perda de tensão em duas fases
   */
  generateTwoPhaseFault(config: TestScenarioConfig): TestScenarioResult {
    const samples: MeasurementSample[] = [];
    const totalSamples = config.duration_seconds * config.sampling_rate_hz;
    const faultStartTime = config.parameters.fault_start_time || 2;
    const faultDuration = config.parameters.fault_duration || 0.5;

    let faultDetected = false;
    let faultTimeMs = 0;

    for (let i = 0; i < totalSamples; i++) {
      const t = i / config.sampling_rate_hz;

      let voltage = this.nominalVoltage * (1 + 0.02 * Math.sin(2 * Math.PI * 0.1 * t));
      let current = this.nominalCurrent * (1 + 0.02 * Math.cos(2 * Math.PI * 0.1 * t));
      let power = this.nominalPower * (1 + 0.02 * Math.sin(2 * Math.PI * 0.15 * t));
      let frequency = this.nominalFrequency + 0.1 * Math.sin(2 * Math.PI * 0.05 * t);

      let errorInjected = false;
      let errorType = "none";
      let errorMagnitude = 0;

      // Simular falha bifásica (redução de ~58% em tensão e corrente)
      if (t >= faultStartTime && t < faultStartTime + faultDuration) {
        voltage *= 0.42; // Redução típica em falha bifásica
        current *= 0.58;
        power *= 0.42;
        frequency -= 0.5; // Queda de frequência
        errorInjected = true;
        errorType = "two_phase_fault";
        errorMagnitude = 58;

        if (!faultDetected) {
          faultDetected = true;
          faultTimeMs = i * (1000 / config.sampling_rate_hz);
        }
      }

      samples.push({
        timestamp: Date.now() + i * (1000 / config.sampling_rate_hz),
        voltage_kv: voltage,
        current_ka: current,
        power_mw: power,
        frequency_hz: frequency,
        error_injected: errorInjected,
        error_type: errorType,
        error_magnitude: errorMagnitude,
      });
    }

    const result = this.generateResult("two_phase_fault", "Two-Phase Fault", samples, config);
    result.fault_detected = faultDetected;
    result.fault_time_ms = faultTimeMs;

    return result;
  }

  /**
   * Gera cenário de ataque cibernético (False Data Injection)
   * Simula injeção de dados falsos nos sensores
   */
  generateCyberAttack(config: TestScenarioConfig): TestScenarioResult {
    const samples: MeasurementSample[] = [];
    const totalSamples = config.duration_seconds * config.sampling_rate_hz;
    const attackStartTime = config.parameters.attack_start_time || 2;
    const attackDuration = config.parameters.attack_duration || 1;
    const injectionMagnitude = config.parameters.injection_magnitude || 30; // %

    let faultDetected = false;
    let faultTimeMs = 0;

    for (let i = 0; i < totalSamples; i++) {
      const t = i / config.sampling_rate_hz;

      let voltage = this.nominalVoltage * (1 + 0.02 * Math.sin(2 * Math.PI * 0.1 * t));
      let current = this.nominalCurrent * (1 + 0.02 * Math.cos(2 * Math.PI * 0.1 * t));
      let power = this.nominalPower * (1 + 0.02 * Math.sin(2 * Math.PI * 0.15 * t));
      let frequency = this.nominalFrequency + 0.1 * Math.sin(2 * Math.PI * 0.05 * t);

      let errorInjected = false;
      let errorType = "none";
      let errorMagnitude = 0;

      // Simular ataque cibernético
      if (t >= attackStartTime && t < attackStartTime + attackDuration) {
        voltage *= 1 + injectionMagnitude / 100;
        current *= 1 - injectionMagnitude / 100;
        power *= 1 + injectionMagnitude / 100;
        frequency += 1.0; // Injetar erro de frequência
        errorInjected = true;
        errorType = "cyber_attack_fdi";
        errorMagnitude = injectionMagnitude;

        if (!faultDetected) {
          faultDetected = true;
          faultTimeMs = i * (1000 / config.sampling_rate_hz);
        }
      }

      samples.push({
        timestamp: Date.now() + i * (1000 / config.sampling_rate_hz),
        voltage_kv: voltage,
        current_ka: current,
        power_mw: power,
        frequency_hz: frequency,
        error_injected: errorInjected,
        error_type: errorType,
        error_magnitude: errorMagnitude,
      });
    }

    const result = this.generateResult("cyber_attack", "Cyber Attack (FDI)", samples, config);
    result.fault_detected = faultDetected;
    result.fault_time_ms = faultTimeMs;

    return result;
  }

  /**
   * Gera resultado consolidado do cenário
   */
  private generateResult(
    scenarioId: string,
    scenarioType: string,
    samples: MeasurementSample[],
    config: TestScenarioConfig
  ): TestScenarioResult {
    const stats = this.calculateStatistics(samples);

    return {
      scenario_id: scenarioId,
      scenario_type: scenarioType,
      timestamp: Date.now(),
      duration_seconds: config.duration_seconds,
      total_samples: samples.length,
      measurements: samples,
      statistics: stats,
      fault_detected: false,
      fault_time_ms: null,
    };
  }

  /**
   * Calcula estatísticas dos cenários
   */
  private calculateStatistics(samples: MeasurementSample[]): ScenarioStatistics {
    const voltages = samples.map((s) => s.voltage_kv);
    const currents = samples.map((s) => s.current_ka);
    const powers = samples.map((s) => s.power_mw);
    const frequencies = samples.map((s) => s.frequency_hz);

    const errorSamples = samples.filter((s) => s.error_injected).length;

    return {
      voltage_mean: this.mean(voltages),
      voltage_std: this.std(voltages),
      current_mean: this.mean(currents),
      current_std: this.std(currents),
      power_mean: this.mean(powers),
      power_std: this.std(powers),
      frequency_mean: this.mean(frequencies),
      frequency_std: this.std(frequencies),
      error_rate_percent: (errorSamples / samples.length) * 100,
      max_error_magnitude: Math.max(...samples.map((s) => s.error_magnitude)),
    };
  }

  /**
   * Calcula média
   */
  private mean(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Calcula desvio padrão
   */
  private std(values: number[]): number {
    const avg = this.mean(values);
    const squareDiffs = values.map((v) => Math.pow(v - avg, 2));
    return Math.sqrt(this.mean(squareDiffs));
  }

  /**
   * Gera número aleatório com distribuição gaussiana
   */
  private generateGaussianNoise(stdDev: number): number {
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev;
  }
}
