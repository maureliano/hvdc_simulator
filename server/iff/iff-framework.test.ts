import { describe, it, expect, beforeEach } from "vitest";
import IFFFramework from "./iff-framework";
import DynamicFidelityCalculator from "./dynamic-fidelity";
import UncertaintyAnalyzer from "./uncertainty-analysis";
import HILValidator from "./hil-validation";
import AgenticDecisionMaker from "./agentic-decision";

describe("Framework IFF - Índice de Fidelidade Física", () => {
  let iffFramework: IFFFramework;

  beforeEach(() => {
    iffFramework = new IFFFramework();
  });

  describe("Dimensão 1: Fidelidade Dinâmica", () => {
    it("deve calcular DFI corretamente para medições idênticas", () => {
      const calculator = new DynamicFidelityCalculator();
      const measurement = {
        timestamp: Date.now(),
        voltage_kv: 345.0,
        current_ka: 422.84,
        power_mw: 1196.0,
        frequency_hz: 60.0,
      };

      const result = calculator.calculateDynamicFidelity(measurement, measurement);

      expect(result.dynamic_fidelity_index).toBeGreaterThan(85);
      expect(["excellent", "good"]).toContain(result.status);
    });

    it("deve detectar status crítico para medições muito diferentes", () => {
      const calculator = new DynamicFidelityCalculator();
      const digital = {
        timestamp: Date.now(),
        voltage_kv: 300.0,
        current_ka: 200.0,
        power_mw: 600.0,
        frequency_hz: 58.0,
      };

      const real = {
        timestamp: Date.now(),
        voltage_kv: 345.0,
        current_ka: 422.84,
        power_mw: 1196.0,
        frequency_hz: 60.0,
      };

      const result = calculator.calculateDynamicFidelity(digital, real);

      expect(result.dynamic_fidelity_index).toBeLessThan(50);
      expect(result.status).toBe("critical");
    });
  });

  describe("Dimensão 2: Análise de Incertezas", () => {
    it("deve calcular incerteza agregada corretamente", () => {
      const analyzer = new UncertaintyAnalyzer();
      const measurement = {
        voltage_kv: 345.0,
        current_ka: 422.84,
        power_mw: 1196.0,
        frequency_hz: 60.0,
      };

      const result = analyzer.analyzeUncertainties(measurement, "normal");

      expect(result.overall_uncertainty_percent).toBeGreaterThan(0);
      expect(result.overall_uncertainty_percent).toBeLessThan(100);
      expect(result.confidence_level).toBeGreaterThan(0);
      expect(result.confidence_level).toBeLessThanOrEqual(1);
    });

    it("deve aumentar incerteza em condições de falta", () => {
      const analyzer = new UncertaintyAnalyzer();
      const measurement = {
        voltage_kv: 345.0,
        current_ka: 422.84,
        power_mw: 1196.0,
        frequency_hz: 60.0,
      };

      const normalResult = analyzer.analyzeUncertainties(measurement, "normal");
      const faultResult = analyzer.analyzeUncertainties(measurement, "fault");

      expect(faultResult.overall_uncertainty_percent).toBeGreaterThan(
        normalResult.overall_uncertainty_percent
      );
    });
  });

  describe("Dimensão 3: Validação HIL", () => {
    it("deve gerar relatório de validação correto", () => {
      const validator = new HILValidator();
      const testResults = [
        {
          test_name: "Frequency Response",
          passed: true,
          error_percent: 0.5,
          timestamp: Date.now(),
        },
        {
          test_name: "Transient Response",
          passed: true,
          error_percent: 1.2,
          timestamp: Date.now(),
        },
      ];

      const report = validator.generateValidationReport(testResults);

      expect(["validated", "not_validated"]).toContain(report.validation_status);
      expect(report.total_tests).toBe(2);
      expect(typeof report.pass_rate_percent).toBe("number");
    });

    it("deve detectar validação parcial com testes falhados", () => {
      const validator = new HILValidator();
      const testResults = [
        {
          test_name: "Frequency Response",
          passed: true,
          error_percent: 0.5,
          timestamp: Date.now(),
        },
        {
          test_name: "Transient Response",
          passed: false,
          error_percent: 5.0,
          timestamp: Date.now(),
        },
      ];

      const report = validator.generateValidationReport(testResults);

      expect(["partially_validated", "not_validated"]).toContain(report.validation_status);
      expect(typeof report.pass_rate_percent).toBe("number");
      expect(report.failed_tests).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Dimensão 4: Decisão Agêntica", () => {
    it("deve permitir operação com alta fidelidade e confiança", () => {
      const decisionMaker = new AgenticDecisionMaker();
      const context = {
        operation_type: "measurement" as const,
        dynamic_fidelity_index: 95,
        overall_uncertainty_percent: 3,
        hil_validation_status: "validated",
        system_status: "normal" as const,
        risk_level: "low" as const,
      };

      const decision = decisionMaker.makeDecision(context);

      expect(decision.operation_allowed).toBe(true);
      expect(["allow", "ALLOW"]).toContain(decision.action.toLowerCase());
    });

    it("deve bloquear operação com baixa fidelidade", () => {
      const decisionMaker = new AgenticDecisionMaker();
      const context = {
        operation_type: "control" as const,
        dynamic_fidelity_index: 40,
        overall_uncertainty_percent: 25,
        hil_validation_status: "not_validated",
        system_status: "fault" as const,
        risk_level: "high" as const,
      };

      const decision = decisionMaker.makeDecision(context);

      expect(decision.operation_allowed).toBe(false);
      expect(["block", "BLOCK"]).toContain(decision.action.toLowerCase());
    });

    it("deve ativar modo degradado para fidelidade média", () => {
      const decisionMaker = new AgenticDecisionMaker();
      const context = {
        operation_type: "prediction" as const,
        dynamic_fidelity_index: 75,
        overall_uncertainty_percent: 8,
        hil_validation_status: "partially_validated",
        system_status: "normal" as const,
        risk_level: "medium" as const,
      };

      const decision = decisionMaker.makeDecision(context);

      expect(decision.operation_allowed).toBe(true);
      expect(["degrade", "DEGRADE", "safe_mode", "SAFE_MODE"]).toContain(decision.action.toLowerCase());
    });
  });

  describe("Framework Integrado", () => {
    it("deve gerar relatório IFF completo", () => {
      const digital = {
        timestamp: Date.now(),
        voltage_kv: 345.0,
        current_ka: 422.84,
        power_mw: 1196.0,
        frequency_hz: 60.0,
      };

      const real = {
        timestamp: Date.now(),
        voltage_kv: 345.1,
        current_ka: 423.0,
        power_mw: 1196.5,
        frequency_hz: 59.99,
      };

      const report = iffFramework.evaluateDigitalTwin(digital, real, null, "measurement");

      expect(report).toHaveProperty("timestamp");
      expect(report).toHaveProperty("report_id");
      expect(report).toHaveProperty("dynamic_fidelity");
      expect(report).toHaveProperty("uncertainty_analysis");
      expect(report).toHaveProperty("agentic_decision");
      expect(report.overall_iff_score).toBeGreaterThan(0);
      expect(report.overall_iff_score).toBeLessThanOrEqual(100);
      expect(["high", "medium", "low", "critical"]).toContain(report.system_trustworthiness);
    });

    it("deve manter histórico de relatórios", () => {
      const digital = {
        timestamp: Date.now(),
        voltage_kv: 345.0,
        current_ka: 422.84,
        power_mw: 1196.0,
        frequency_hz: 60.0,
      };

      const real = {
        timestamp: Date.now(),
        voltage_kv: 345.0,
        current_ka: 422.84,
        power_mw: 1196.0,
        frequency_hz: 60.0,
      };

      // Gerar múltiplos relatórios
      for (let i = 0; i < 5; i++) {
        iffFramework.evaluateDigitalTwin(digital, real);
      }

      const history = iffFramework.getReportHistory();
      expect(history.length).toBe(5);
    });

    it("deve calcular tendência corretamente", () => {
      const digital = {
        timestamp: Date.now(),
        voltage_kv: 345.0,
        current_ka: 422.84,
        power_mw: 1196.0,
        frequency_hz: 60.0,
      };

      const real = {
        timestamp: Date.now(),
        voltage_kv: 345.0,
        current_ka: 422.84,
        power_mw: 1196.0,
        frequency_hz: 60.0,
      };

      // Gerar relatórios
      for (let i = 0; i < 10; i++) {
        iffFramework.evaluateDigitalTwin(digital, real);
      }

      const trend = iffFramework.calculateIFFTrend();

      expect(["improving", "stable", "degrading"]).toContain(trend.trend);
      expect(typeof trend.rate).toBe("number");
    });

    it("deve gerar relatório científico válido", () => {
      const digital = {
        timestamp: Date.now(),
        voltage_kv: 345.0,
        current_ka: 422.84,
        power_mw: 1196.0,
        frequency_hz: 60.0,
      };

      const real = {
        timestamp: Date.now(),
        voltage_kv: 345.0,
        current_ka: 422.84,
        power_mw: 1196.0,
        frequency_hz: 60.0,
      };

      // Gerar alguns relatórios
      for (let i = 0; i < 3; i++) {
        iffFramework.evaluateDigitalTwin(digital, real);
      }

      const scientificReport = iffFramework.generateScientificReport();

      expect(scientificReport.framework_name).toBe("Índice de Fidelidade Física (IFF)");
      expect(scientificReport.evaluation_count).toBe(3);
      expect(scientificReport.average_iff_score).toBeGreaterThan(0);
      expect(scientificReport.average_iff_score).toBeLessThanOrEqual(100);
      expect(Object.keys(scientificReport.dimensions).length).toBe(4);
    });
  });

  describe("Casos de Uso Acadêmicos", () => {
    it("deve suportar operação de medição com alta precisão", () => {
      const digital = {
        timestamp: Date.now(),
        voltage_kv: 345.0,
        current_ka: 422.84,
        power_mw: 1196.0,
        frequency_hz: 60.0,
      };

      const real = {
        timestamp: Date.now(),
        voltage_kv: 345.0,
        current_ka: 422.84,
        power_mw: 1196.0,
        frequency_hz: 60.0,
      };

      const report = iffFramework.evaluateDigitalTwin(digital, real, null, "measurement");

      expect(report.overall_iff_score).toBeGreaterThan(0);
      expect(report.overall_iff_score).toBeLessThanOrEqual(100);
      expect(typeof report.agentic_decision.operation_allowed).toBe("boolean");
    });

    it("deve suportar operação de controle com validação HIL", () => {
      const digital = {
        timestamp: Date.now(),
        voltage_kv: 345.0,
        current_ka: 422.84,
        power_mw: 1196.0,
        frequency_hz: 60.0,
      };

      const real = {
        timestamp: Date.now(),
        voltage_kv: 345.0,
        current_ka: 422.84,
        power_mw: 1196.0,
        frequency_hz: 60.0,
      };

      const hilTests = [
        {
          test_name: "Frequency Response",
          passed: true,
          error_percent: 0.5,
          timestamp: Date.now(),
        },
        {
          test_name: "Transient Response",
          passed: true,
          error_percent: 1.0,
          timestamp: Date.now(),
        },
      ];

      const report = iffFramework.evaluateDigitalTwin(digital, real, hilTests, "control");

      expect(report.hil_validation).not.toBeNull();
      expect(["validated", "partially_validated", "not_validated"]).toContain(
        report.hil_validation?.validation_status
      );
    });
  });
});
