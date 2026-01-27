/**
 * Framework de Índice de Fidelidade Física (IFF)
 *
 * Integra as 4 dimensões para criar um sistema completo de avaliação
 * e decisão sobre a confiabilidade de Digital Twins em subestações HVDC.
 */

import DynamicFidelityCalculator, {
  DynamicMeasurement,
  DynamicFidelityMetrics,
} from "./dynamic-fidelity";
import UncertaintyAnalyzer, { UncertaintyAnalysis } from "./uncertainty-analysis";
import HILValidator, { HILTestResult, HILValidationReport } from "./hil-validation";
import AgenticDecisionMaker, {
  DecisionContext,
  AgenticDecision,
} from "./agentic-decision";
import { generateDemoData } from "./demo-data";

export interface IFFFrameworkReport {
  timestamp: number;
  report_id: string;
  dynamic_fidelity: DynamicFidelityMetrics;
  uncertainty_analysis: UncertaintyAnalysis;
  hil_validation: HILValidationReport | null;
  agentic_decision: AgenticDecision;
  overall_iff_score: number; // 0-100
  system_trustworthiness: "high" | "medium" | "low" | "critical";
  recommendations: string[];
}

export class IFFFramework {
  private dynamicFidelityCalculator: DynamicFidelityCalculator;
  private uncertaintyAnalyzer: UncertaintyAnalyzer;
  private hilValidator: HILValidator;
  private agenticDecisionMaker: AgenticDecisionMaker;
  private reportHistory: IFFFrameworkReport[] = [];

  constructor() {
    this.dynamicFidelityCalculator = new DynamicFidelityCalculator();
    this.uncertaintyAnalyzer = new UncertaintyAnalyzer();
    this.hilValidator = new HILValidator();
    this.agenticDecisionMaker = new AgenticDecisionMaker();
  }

  /**
   * Executa avaliação completa do IFF
   */
  evaluateDigitalTwin(
    digitalMeasurement: DynamicMeasurement,
    realMeasurement: DynamicMeasurement,
    hilTestResults: HILTestResult[] | null = null,
    operationType: "control" | "measurement" | "prediction" | "optimization" = "measurement"
  ): IFFFrameworkReport {
    const reportId = `IFF_${Date.now()}`;
    const timestamp = Date.now();

    // Dimensão 1: Métrica de Fidelidade Dinâmica
    const dynamicFidelity = this.dynamicFidelityCalculator.calculateDynamicFidelity(
      digitalMeasurement,
      realMeasurement
    );

    // Dimensão 2: Análise de Incertezas
    const uncertaintyAnalysis = this.uncertaintyAnalyzer.analyzeUncertainties(
      {
        voltage_kv: digitalMeasurement.voltage_kv,
        current_ka: digitalMeasurement.current_ka,
        power_mw: digitalMeasurement.power_mw,
        frequency_hz: digitalMeasurement.frequency_hz,
      },
      this.determineOperatingCondition(digitalMeasurement, realMeasurement)
    );

    // Dimensão 3: Validação HIL
    let hilValidation: HILValidationReport | null = null;
    if (hilTestResults && hilTestResults.length > 0) {
      hilValidation = this.hilValidator.generateValidationReport(hilTestResults);
    }

    // Dimensão 4: Decisão Agêntica
    const decisionContext: DecisionContext = {
      operation_type: operationType,
      dynamic_fidelity_index: dynamicFidelity.dynamic_fidelity_index,
      overall_uncertainty_percent: uncertaintyAnalysis.overall_uncertainty_percent,
      hil_validation_status: hilValidation?.validation_status || "not_validated",
      system_status: this.determineSystemStatus(dynamicFidelity),
      risk_level: "low", // Será calculado internamente
    };

    const agenticDecision = this.agenticDecisionMaker.makeDecision(decisionContext);

    // Calcular score IFF geral
    const overallIFFScore = this.calculateOverallIFFScore(
      dynamicFidelity.dynamic_fidelity_index,
      uncertaintyAnalysis.confidence_level,
      hilValidation?.pass_rate_percent || 0
    );

    // Determinar confiabilidade do sistema
    const trustworthiness = this.determineTrustworthiness(
      overallIFFScore,
      agenticDecision.operation_allowed
    );

    // Gerar recomendações
    const recommendations = this.generateRecommendations(
      dynamicFidelity,
      uncertaintyAnalysis,
      hilValidation,
      agenticDecision,
      overallIFFScore
    );

    const report: IFFFrameworkReport = {
      timestamp,
      report_id: reportId,
      dynamic_fidelity: dynamicFidelity,
      uncertainty_analysis: uncertaintyAnalysis,
      hil_validation: hilValidation,
      agentic_decision: agenticDecision,
      overall_iff_score: overallIFFScore,
      system_trustworthiness: trustworthiness,
      recommendations,
    };

    // Armazenar no histórico
    this.reportHistory.push(report);

    return report;
  }

  /**
   * Determina condição operacional baseado nas medições
   */
  private determineOperatingCondition(
    digital: DynamicMeasurement,
    real: DynamicMeasurement
  ): "normal" | "transient" | "fault" {
    const frequencyError = Math.abs(digital.frequency_hz - real.frequency_hz);
    const voltageError = Math.abs(digital.voltage_kv - real.voltage_kv) / real.voltage_kv;

    if (frequencyError > 0.2 || voltageError > 0.1) {
      return "fault";
    } else if (frequencyError > 0.1 || voltageError > 0.05) {
      return "transient";
    }
    return "normal";
  }

  /**
   * Determina status do sistema baseado em fidelidade
   */
  private determineSystemStatus(
    dynamicFidelity: DynamicFidelityMetrics
  ): "normal" | "transient" | "fault" {
    if (dynamicFidelity.status === "critical") {
      return "fault";
    } else if (dynamicFidelity.status === "poor") {
      return "transient";
    }
    return "normal";
  }

  /**
   * Calcula score IFF geral (0-100)
   */
  private calculateOverallIFFScore(
    dfi: number,
    confidenceLevel: number,
    hilPassRate: number
  ): number {
    // Pesos para cada dimensão
    const weights = {
      dynamic_fidelity: 0.35,
      uncertainty: 0.25,
      hil_validation: 0.25,
      confidence: 0.15,
    };

    const score =
      dfi * weights.dynamic_fidelity +
      (confidenceLevel * 100) * weights.uncertainty +
      hilPassRate * weights.hil_validation +
      (confidenceLevel * 100) * weights.confidence;

    return Math.round(score * 100) / 100;
  }

  /**
   * Determina nível de confiabilidade do sistema
   */
  private determineTrustworthiness(
    iffScore: number,
    operationAllowed: boolean
  ): "high" | "medium" | "low" | "critical" {
    if (iffScore >= 90 && operationAllowed) {
      return "high";
    } else if (iffScore >= 75 && operationAllowed) {
      return "medium";
    } else if (iffScore >= 50) {
      return "low";
    }
    return "critical";
  }

  /**
   * Gera recomendações baseadas na análise
   */
  private generateRecommendations(
    dynamicFidelity: DynamicFidelityMetrics,
    uncertainty: UncertaintyAnalysis,
    hilValidation: HILValidationReport | null,
    decision: AgenticDecision,
    iffScore: number
  ): string[] {
    const recommendations: string[] = [];

    // Recomendações baseadas em fidelidade dinâmica
    if (dynamicFidelity.status === "critical") {
      recommendations.push("CRÍTICO: Fidelidade dinâmica crítica. Investigar imediatamente.");
    } else if (dynamicFidelity.status === "poor") {
      recommendations.push("Fidelidade dinâmica reduzida. Aumentar frequência de calibração.");
    }

    // Recomendações baseadas em incerteza
    if (uncertainty.overall_uncertainty_percent > 15) {
      recommendations.push("Incerteza elevada. Revisar parâmetros do modelo.");
    }

    // Recomendações baseadas em validação HIL
    if (hilValidation && hilValidation.pass_rate_percent < 80) {
      recommendations.push(
        `HIL: ${hilValidation.failed_tests} testes falharam. Executar diagnóstico.`
      );
    } else if (!hilValidation) {
      recommendations.push("Executar validação HIL para aumentar confiabilidade.");
    }

    // Recomendações da decisão agêntica
    recommendations.push(...decision.recommendations);

    // Recomendações gerais baseadas em IFF score
    if (iffScore < 70) {
      recommendations.push("IFF score baixo. Considerar modo degradado ou seguro.");
    }

    return recommendations;
  }

  /**
   * Retorna histórico de relatórios
   */
  getReportHistory(limit: number = 100): IFFFrameworkReport[] {
    // Se não há histórico, gera dados de demonstração
    if (this.reportHistory.length === 0) {
      return generateDemoData(limit);
    }
    return this.reportHistory.slice(-limit);
  }

  /**
   * Calcula tendência do IFF ao longo do tempo
   */
  calculateIFFTrend(): {
    trend: "improving" | "stable" | "degrading";
    rate: number;
  } {
    if (this.reportHistory.length < 2) {
      return { trend: "stable", rate: 0 };
    }

    const recent = this.reportHistory.slice(-10);
    const first = recent[0];
    const last = recent[recent.length - 1];

    const timeDiff = (last.timestamp - first.timestamp) / 1000; // Em segundos
    const scoreD = last.overall_iff_score - first.overall_iff_score;
    const rate = timeDiff > 0 ? scoreD / timeDiff : 0;

    let trend: "improving" | "stable" | "degrading";
    if (rate > 0.5) {
      trend = "improving";
    } else if (rate < -0.5) {
      trend = "degrading";
    } else {
      trend = "stable";
    }

    return { trend, rate };
  }

  /**
   * Gera relatório em formato JSON para artigo científico
   */
  generateScientificReport(): {
    framework_name: string;
    dimensions: {
      dynamic_fidelity: string;
      uncertainty_analysis: string;
      hil_validation: string;
      agentic_decision: string;
    };
    evaluation_count: number;
    average_iff_score: number;
    trend: string;
  } {
    const avgIFFScore =
      this.reportHistory.reduce((sum, r) => sum + r.overall_iff_score, 0) /
      Math.max(1, this.reportHistory.length);

    const trend = this.calculateIFFTrend();

    return {
      framework_name: "Índice de Fidelidade Física (IFF)",
      dimensions: {
        dynamic_fidelity: "Métrica de Fidelidade Dinâmica",
        uncertainty_analysis: "Análise de Incertezas em Tempo Real",
        hil_validation: "Validação com Hardware-in-the-Loop",
        agentic_decision: "Decisão Agêntica com Bloqueio Automático",
      },
      evaluation_count: this.reportHistory.length,
      average_iff_score: Math.round(avgIFFScore * 100) / 100,
      trend: `${trend.trend} (${Math.round(trend.rate * 100) / 100} pontos/segundo)`,
    };
  }
}

export default IFFFramework;
