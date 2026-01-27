/**
 * Gerador de dados de demonstração para IFF Analytics
 * 
 * Fornece dados realistas quando não há histórico de testes
 */

import { IFFFrameworkReport } from "./iff-framework";

export function generateDemoData(count: number): IFFFrameworkReport[] {
  const demoData: IFFFrameworkReport[] = [];
  const now = Date.now();
  const interval = 2000; // 2 segundos entre pontos

  for (let i = 0; i < count; i++) {
    const timestamp = now - (count - i) * interval;
    const baseScore = 85 + Math.sin(i / 20) * 10;
    const noise = (Math.random() - 0.5) * 5;
    const iffScore = Math.max(50, Math.min(100, baseScore + noise));

    const voltageError = 2 + Math.random() * 3;
    const currentError = 2.5 + Math.random() * 3;
    const powerError = 3 + Math.random() * 4;
    const frequencyError = 0.05 + Math.random() * 0.1;

    demoData.push({
      timestamp,
      report_id: `DEMO_${i}`,
      dynamic_fidelity: {
        timestamp,
        voltage_error_percent: voltageError,
        current_error_percent: currentError,
        power_error_percent: powerError,
        frequency_error_hz: frequencyError,
        dynamic_fidelity_index: iffScore,
        status:
          iffScore >= 95
            ? "excellent"
            : iffScore >= 85
              ? "good"
              : iffScore >= 70
                ? "acceptable"
                : iffScore >= 50
                  ? "poor"
                  : "critical",
      },
      uncertainty_analysis: {
        timestamp,
        voltage_uncertainty: {
          lower: 420 - 5,
          upper: 420 + 5,
          nominal: 420,
          uncertainty_percent: 1.2,
        },
        current_uncertainty: {
          lower: 1000 - 50,
          upper: 1000 + 50,
          nominal: 1000,
          uncertainty_percent: 5,
        },
        power_uncertainty: {
          lower: 1196 - 100,
          upper: 1196 + 100,
          nominal: 1196,
          uncertainty_percent: 8.4,
        },
        frequency_uncertainty: {
          lower: 60 - 0.1,
          upper: 60 + 0.1,
          nominal: 60,
          uncertainty_percent: 0.17,
        },
        overall_uncertainty_percent: 8 + Math.random() * 12,
        confidence_level: (100 - (8 + Math.random() * 12)) / 100,
        uncertainty_sources: {
          parametric: 3 + Math.random() * 2,
          measurement: 2 + Math.random() * 2,
          model: 2 + Math.random() * 2,
          environmental: 1 + Math.random() * 1,
        },
      },
      hil_validation: null,
      agentic_decision: {
        timestamp,
        decision_id: `DECISION_${i}`,
        action:
          iffScore >= 85
            ? "allow"
            : iffScore >= 70
              ? "degrade"
              : iffScore >= 50
                ? "safe_mode"
                : "block",
        operation_allowed: iffScore >= 50,
        confidence: iffScore,
        reasoning:
          iffScore >= 85
            ? "Fidelidade aceitável para operação normal"
            : iffScore >= 70
              ? "Fidelidade degradada, operação em modo reduzido"
              : iffScore >= 50
                ? "Fidelidade crítica, apenas operações seguras"
                : "Fidelidade inaceitável, operação bloqueada",
        recommendations: iffScore < 85 ? ["Calibrar sensores", "Ajustar modelo"] : [],
        blocking_reasons: iffScore < 50 ? ["Fidelidade abaixo do limite crítico"] : [],
        safety_margin: Math.max(0, iffScore - 50),
      },
      overall_iff_score: iffScore,
      system_trustworthiness:
        iffScore >= 85
          ? "high"
          : iffScore >= 70
            ? "medium"
            : iffScore >= 50
              ? "low"
              : "critical",
      recommendations:
        iffScore < 85
          ? ["Verificar qualidade de dados", "Revisar modelo matemático"]
          : [],
    });
  }

  return demoData;
}
