/**
 * Dimensão 3: Validação com Hardware-in-the-Loop (HIL Validation)
 * 
 * Implementa validação do Digital Twin comparando com dados de hardware real
 * ou simulador de hardware. Valida se o modelo digital representa adequadamente
 * o comportamento do sistema físico em diferentes cenários.
 * 
 * Testes HIL:
 * - Teste de Resposta em Frequência
 * - Teste de Transitório
 * - Teste de Estabilidade
 * - Teste de Limites Operacionais
 */

export interface HILTestResult {
  test_id: string;
  test_name: string;
  timestamp: number;
  duration_ms: number;
  hardware_response: {
    voltage_kv: number;
    current_ka: number;
    power_mw: number;
    frequency_hz: number;
  };
  digital_response: {
    voltage_kv: number;
    current_ka: number;
    power_mw: number;
    frequency_hz: number;
  };
  error_metrics: {
    voltage_error_percent: number;
    current_error_percent: number;
    power_error_percent: number;
    frequency_error_hz: number;
  };
  validation_passed: boolean;
  confidence_score: number; // 0-100
}

export interface HILValidationReport {
  timestamp: number;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  pass_rate_percent: number;
  average_confidence: number;
  validation_status: "validated" | "partially_validated" | "not_validated";
  test_results: HILTestResult[];
}

export class HILValidator {
  private acceptanceThresholds = {
    voltage: 2.0, // %
    current: 2.5, // %
    power: 3.0, // %
    frequency: 0.1, // Hz
  };

  private testScenarios = {
    frequency_response: {
      name: "Frequency Response Test",
      description: "Testa resposta em frequência do Digital Twin",
      frequencies: [0.1, 0.5, 1.0, 5.0, 10.0], // Hz
    },
    transient_response: {
      name: "Transient Response Test",
      description: "Testa resposta a mudanças abruptas de carga",
      scenarios: ["step_increase", "step_decrease", "impulse"],
    },
    stability_test: {
      name: "Stability Test",
      description: "Testa estabilidade do sistema",
      duration_s: 60,
    },
    operating_limits: {
      name: "Operating Limits Test",
      description: "Testa comportamento nos limites operacionais",
      limits: ["min_voltage", "max_voltage", "max_current", "max_power"],
    },
  };

  /**
   * Executa teste HIL comparando resposta do hardware com Digital Twin
   */
  executeHILTest(
    testType: "frequency_response" | "transient_response" | "stability" | "limits",
    hardwareData: Array<{
      timestamp: number;
      voltage_kv: number;
      current_ka: number;
      power_mw: number;
      frequency_hz: number;
    }>,
    digitalData: Array<{
      timestamp: number;
      voltage_kv: number;
      current_ka: number;
      power_mw: number;
      frequency_hz: number;
    }>
  ): HILTestResult {
    if (hardwareData.length === 0 || digitalData.length === 0) {
      throw new Error("Hardware or digital data is empty");
    }

    // Sincronizar dados por timestamp
    const syncedData = this.synchronizeData(hardwareData, digitalData);

    // Calcular métricas de erro
    const errorMetrics = this.calculateErrorMetrics(syncedData);

    // Validar contra thresholds
    const validationPassed = this.validateAgainstThresholds(errorMetrics);

    // Calcular confidence score
    const confidenceScore = this.calculateConfidenceScore(errorMetrics);

    const testId = `HIL_${testType}_${Date.now()}`;

    return {
      test_id: testId,
      test_name: this.testScenarios[testType as keyof typeof this.testScenarios]?.name || testType,
      timestamp: Date.now(),
      duration_ms: syncedData[syncedData.length - 1].timestamp - syncedData[0].timestamp,
      hardware_response: hardwareData[hardwareData.length - 1],
      digital_response: digitalData[digitalData.length - 1],
      error_metrics: errorMetrics,
      validation_passed: validationPassed,
      confidence_score: confidenceScore,
    };
  }

  /**
   * Sincroniza dados de hardware e digital por timestamp
   */
  private synchronizeData(
    hardwareData: Array<{ timestamp: number; [key: string]: number }>,
    digitalData: Array<{ timestamp: number; [key: string]: number }>
  ): Array<{
    timestamp: number;
    hardware: Record<string, number>;
    digital: Record<string, number>;
  }> {
    const syncedData: Array<{
      timestamp: number;
      hardware: Record<string, number>;
      digital: Record<string, number>;
    }> = [];

    for (const hwPoint of hardwareData) {
      // Encontrar ponto digital mais próximo
      const closestDigitalPoint = digitalData.reduce((prev, curr) => {
        return Math.abs(curr.timestamp - hwPoint.timestamp) <
          Math.abs(prev.timestamp - hwPoint.timestamp)
          ? curr
          : prev;
      });

      // Verificar se timestamps estão próximos (dentro de 100ms)
      if (Math.abs(closestDigitalPoint.timestamp - hwPoint.timestamp) < 100) {
        const { timestamp: hwTs, ...hwValues } = hwPoint;
        const { timestamp: digTs, ...digValues } = closestDigitalPoint;

        syncedData.push({
          timestamp: hwPoint.timestamp,
          hardware: hwValues,
          digital: digValues,
        });
      }
    }

    return syncedData;
  }

  /**
   * Calcula métricas de erro entre hardware e digital
   */
  private calculateErrorMetrics(
    syncedData: Array<{
      timestamp: number;
      hardware: Record<string, number>;
      digital: Record<string, number>;
    }>
  ): {
    voltage_error_percent: number;
    current_error_percent: number;
    power_error_percent: number;
    frequency_error_hz: number;
  } {
    let totalVoltageError = 0;
    let totalCurrentError = 0;
    let totalPowerError = 0;
    let totalFrequencyError = 0;

    for (const point of syncedData) {
      totalVoltageError += Math.abs(
        ((point.digital.voltage_kv - point.hardware.voltage_kv) /
          point.hardware.voltage_kv) *
          100
      );
      totalCurrentError += Math.abs(
        ((point.digital.current_ka - point.hardware.current_ka) /
          point.hardware.current_ka) *
          100
      );
      totalPowerError += Math.abs(
        ((point.digital.power_mw - point.hardware.power_mw) /
          point.hardware.power_mw) *
          100
      );
      totalFrequencyError += Math.abs(
        point.digital.frequency_hz - point.hardware.frequency_hz
      );
    }

    const n = syncedData.length;

    return {
      voltage_error_percent: Math.round((totalVoltageError / n) * 100) / 100,
      current_error_percent: Math.round((totalCurrentError / n) * 100) / 100,
      power_error_percent: Math.round((totalPowerError / n) * 100) / 100,
      frequency_error_hz: Math.round((totalFrequencyError / n) * 10000) / 10000,
    };
  }

  /**
   * Valida métricas contra thresholds de aceitação
   */
  private validateAgainstThresholds(errorMetrics: {
    voltage_error_percent: number;
    current_error_percent: number;
    power_error_percent: number;
    frequency_error_hz: number;
  }): boolean {
    return (
      errorMetrics.voltage_error_percent <= this.acceptanceThresholds.voltage &&
      errorMetrics.current_error_percent <= this.acceptanceThresholds.current &&
      errorMetrics.power_error_percent <= this.acceptanceThresholds.power &&
      errorMetrics.frequency_error_hz <= this.acceptanceThresholds.frequency
    );
  }

  /**
   * Calcula score de confiança baseado nos erros
   */
  private calculateConfidenceScore(errorMetrics: {
    voltage_error_percent: number;
    current_error_percent: number;
    power_error_percent: number;
    frequency_error_hz: number;
  }): number {
    // Normalizar erros (0-1)
    const normalizedVoltage = Math.min(
      1,
      errorMetrics.voltage_error_percent / this.acceptanceThresholds.voltage
    );
    const normalizedCurrent = Math.min(
      1,
      errorMetrics.current_error_percent / this.acceptanceThresholds.current
    );
    const normalizedPower = Math.min(
      1,
      errorMetrics.power_error_percent / this.acceptanceThresholds.power
    );
    const normalizedFrequency = Math.min(
      1,
      errorMetrics.frequency_error_hz / this.acceptanceThresholds.frequency
    );

    // Calcular média
    const averageNormalized =
      (normalizedVoltage + normalizedCurrent + normalizedPower + normalizedFrequency) / 4;

    // Converter para score (0-100)
    const score = (1 - averageNormalized) * 100;

    return Math.round(score * 100) / 100;
  }

  /**
   * Gera relatório de validação HIL
   */
  generateValidationReport(testResults: HILTestResult[]): HILValidationReport {
    const passedTests = testResults.filter((t) => t.validation_passed).length;
    const failedTests = testResults.length - passedTests;
    const passRate = (passedTests / testResults.length) * 100;
    const averageConfidence =
      testResults.reduce((sum, t) => sum + t.confidence_score, 0) /
      testResults.length;

    let validationStatus: "validated" | "partially_validated" | "not_validated";
    if (passRate === 100) {
      validationStatus = "validated";
    } else if (passRate >= 80) {
      validationStatus = "partially_validated";
    } else {
      validationStatus = "not_validated";
    }

    return {
      timestamp: Date.now(),
      total_tests: testResults.length,
      passed_tests: passedTests,
      failed_tests: failedTests,
      pass_rate_percent: Math.round(passRate * 100) / 100,
      average_confidence: Math.round(averageConfidence * 100) / 100,
      validation_status: validationStatus,
      test_results: testResults,
    };
  }
}

export default HILValidator;
