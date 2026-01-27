/**
 * Módulo de Persistência IFF
 * 
 * Gerencia salvamento e recuperação de resultados de testes IFF no MySQL
 */

import { getDb } from "../db";
import { 
  iffTestResults, 
  iffTestScenarios, 
  iffTestEvents,
  InsertIFFTestResult,
  InsertIFFTestScenario,
  InsertIFFTestEvent,
  IFFTestResult,
  IFFTestScenario,
  IFFTestEvent,
} from "../../drizzle/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { IFFFrameworkReport } from "./iff-framework";

export class IFFPersistence {
  /**
   * Salva resultado de teste IFF no banco de dados
   */
  async saveTestResult(
    userId: number | undefined,
    scenarioId: number | undefined,
    report: IFFFrameworkReport,
    executionTime: number,
    notes?: string
  ): Promise<IFFTestResult | null> {
    const db = await getDb();
    if (!db) return null;

    try {
      const testData: InsertIFFTestResult = {
        userId,
        scenarioId,
        testName: report.report_id,
        scenarioType: report.report_id.includes("DEMO") ? "demonstration" : "test",
        executionTime,
        overallIFFScore: report.overall_iff_score,
        systemTrustworthiness: report.system_trustworthiness,
        dynamicFidelityIndex: report.dynamic_fidelity?.dynamic_fidelity_index,
        voltageErrorPercent: report.dynamic_fidelity?.voltage_error_percent,
        currentErrorPercent: report.dynamic_fidelity?.current_error_percent,
        powerErrorPercent: report.dynamic_fidelity?.power_error_percent,
        frequencyErrorHz: report.dynamic_fidelity?.frequency_error_hz,
        estimationErrorPercent: report.uncertainty_analysis?.overall_uncertainty_percent,
        measurementUncertaintyPercent: report.uncertainty_analysis?.overall_uncertainty_percent,
        communicationLatencyMs: 0,
        overallUncertaintyPercent: report.uncertainty_analysis?.overall_uncertainty_percent,
        confidenceLevel: report.uncertainty_analysis?.confidence_level,
        agenticDecision: report.agentic_decision?.action || "unknown",
        decisionConfidence: report.agentic_decision?.confidence,
        fullResults: JSON.stringify(report),
        notes,
      };

      const result = await db.insert(iffTestResults).values(testData);
      // Buscar o último registro inserido
      const inserted = await db.select().from(iffTestResults).limit(1);
      return inserted[0] || null;
    } catch (error) {
      console.error("[IFF Persistence] Erro ao salvar teste:", error);
      return null;
    }
  }

  /**
   * Recupera histórico de testes IFF
   */
  async getTestHistory(
    userId: number | undefined,
    limit: number = 100,
    offset: number = 0,
    startDate?: Date,
    endDate?: Date
  ): Promise<IFFTestResult[]> {
    const db = await getDb();
    if (!db) return [];

    try {
      const conditions = [];
      
      if (userId) {
        conditions.push(eq(iffTestResults.userId, userId));
      }

      if (startDate) {
        conditions.push(gte(iffTestResults.createdAt, startDate));
      }
      if (endDate) {
        conditions.push(lte(iffTestResults.createdAt, endDate));
      }

      const results = await (conditions.length > 0
        ? db
            .select()
            .from(iffTestResults)
            .where(and(...conditions))
            .orderBy(desc(iffTestResults.createdAt))
            .limit(limit)
            .offset(offset)
        : db
            .select()
            .from(iffTestResults)
            .orderBy(desc(iffTestResults.createdAt))
            .limit(limit)
            .offset(offset));

      return results;
    } catch (error) {
      console.error("[IFF Persistence] Erro ao recuperar histórico:", error);
      return [];
    }
  }

  /**
   * Recupera um teste específico
   */
  async getTestById(testId: number): Promise<IFFTestResult | null> {
    const db = await getDb();
    if (!db) return null;

    try {
      const result = await db
        .select()
        .from(iffTestResults)
        .where(eq(iffTestResults.id, testId))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error("[IFF Persistence] Erro ao recuperar teste:", error);
      return null;
    }
  }

  /**
   * Recupera relatório completo de um teste
   */
  async getTestReport(testId: number): Promise<IFFFrameworkReport | null> {
    const test = await this.getTestById(testId);
    if (!test || !test.fullResults) return null;

    try {
      return JSON.parse(test.fullResults) as IFFFrameworkReport;
    } catch (error) {
      console.error("[IFF Persistence] Erro ao parsear relatório:", error);
      return null;
    }
  }

  /**
   * Salva cenário de teste
   */
  async saveScenario(
    userId: number | undefined,
    name: string,
    scenarioType: string,
    parameters: Record<string, any>,
    description?: string
  ): Promise<IFFTestScenario | null> {
    const db = await getDb();
    if (!db) return null;

    try {
      const scenarioData: InsertIFFTestScenario = {
        userId,
        name,
        scenarioType,
        parameters: JSON.stringify(parameters),
        description,
      };

      const result = await db.insert(iffTestScenarios).values(scenarioData);
      // Buscar o último registro inserido
      const inserted = await db.select().from(iffTestScenarios).limit(1);
      return inserted[0] || null;
    } catch (error) {
      console.error("[IFF Persistence] Erro ao salvar cenário:", error);
      return null;
    }
  }

  /**
   * Recupera cenários de teste
   */
  async getScenarios(userId: number | undefined): Promise<IFFTestScenario[]> {
    const db = await getDb();
    if (!db) return [];

    try {
      const results = await (userId
        ? db
            .select()
            .from(iffTestScenarios)
            .where(eq(iffTestScenarios.userId, userId))
            .orderBy(desc(iffTestScenarios.createdAt))
        : db
            .select()
            .from(iffTestScenarios)
            .orderBy(desc(iffTestScenarios.createdAt)));
      return results;
    } catch (error) {
      console.error("[IFF Persistence] Erro ao recuperar cenários:", error);
      return [];
    }
  }

  /**
   * Salva evento de teste
   */
  async saveEvent(
    testResultId: number,
    eventType: string,
    eventName: string,
    severity: string,
    description?: string,
    metricValue?: number,
    threshold?: number
  ): Promise<IFFTestEvent | null> {
    const db = await getDb();
    if (!db) return null;

    try {
      const eventData: InsertIFFTestEvent = {
        testResultId,
        eventType,
        eventName,
        severity,
        description,
        metricValue,
        threshold,
        timestamp: new Date(),
      };

      const result = await db.insert(iffTestEvents).values(eventData);
      // Buscar o último registro inserido
      const inserted = await db.select().from(iffTestEvents).limit(1);
      return inserted[0] || null;
    } catch (error) {
      console.error("[IFF Persistence] Erro ao salvar evento:", error);
      return null;
    }
  }

  /**
   * Recupera eventos de um teste
   */
  async getTestEvents(testResultId: number): Promise<IFFTestEvent[]> {
    const db = await getDb();
    if (!db) return [];

    try {
      const results = await db
        .select()
        .from(iffTestEvents)
        .where(eq(iffTestEvents.testResultId, testResultId))
        .orderBy(desc(iffTestEvents.timestamp));

      return results;
    } catch (error) {
      console.error("[IFF Persistence] Erro ao recuperar eventos:", error);
      return [];
    }
  }

  /**
   * Calcula estatísticas de testes
   */
  async getStatistics(
    userId: number | undefined,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalTests: number;
    averageScore: number;
    bestScore: number;
    worstScore: number;
    trustworthinessDistribution: Record<string, number>;
    decisionDistribution: Record<string, number>;
  } | null> {
    const db = await getDb();
    if (!db) return null;

    try {
      const conditions = [];
      
      if (userId) {
        conditions.push(eq(iffTestResults.userId, userId));
      }
      if (startDate) {
        conditions.push(gte(iffTestResults.createdAt, startDate));
      }
      if (endDate) {
        conditions.push(lte(iffTestResults.createdAt, endDate));
      }

      const results = await (conditions.length > 0
        ? db.select().from(iffTestResults).where(and(...conditions))
        : db.select().from(iffTestResults));

      if (results.length === 0) {
        return {
          totalTests: 0,
          averageScore: 0,
          bestScore: 0,
          worstScore: 0,
          trustworthinessDistribution: {},
          decisionDistribution: {},
        };
      }

      const scores = results.map((r: any) => r.overallIFFScore).filter((s: any) => s !== null) as number[];
      const trustworthiness = results.map((r: any) => r.systemTrustworthiness);
      const decisions = results.map((r: any) => r.agenticDecision);

      const trustworthinessDistribution: Record<string, number> = {};
      trustworthiness.forEach((t: any) => {
        trustworthinessDistribution[t] = (trustworthinessDistribution[t] || 0) + 1;
      });

      const decisionDistribution: Record<string, number> = {};
      decisions.forEach((d: any) => {
        decisionDistribution[d] = (decisionDistribution[d] || 0) + 1;
      });

      return {
        totalTests: results.length,
        averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        bestScore: Math.max(...scores),
        worstScore: Math.min(...scores),
        trustworthinessDistribution,
        decisionDistribution,
      };
    } catch (error) {
      console.error("[IFF Persistence] Erro ao calcular estatísticas:", error);
      return null;
    }
  }

  /**
   * Deleta um teste
   */
  async deleteTest(testId: number): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;

    try {
      // Deletar eventos associados
      await db.delete(iffTestEvents).where(eq(iffTestEvents.testResultId, testId));

      // Deletar teste
      await db.delete(iffTestResults).where(eq(iffTestResults.id, testId));

      return true;
    } catch (error) {
      console.error("[IFF Persistence] Erro ao deletar teste:", error);
      return false;
    }
  }

  /**
   * Exporta dados para análise (CSV/JSON)
   */
  async exportTestData(
    userId: number | undefined,
    format: "json" | "csv" = "json"
  ): Promise<string | null> {
    const tests = await this.getTestHistory(userId, 10000);

    if (format === "json") {
      return JSON.stringify(tests, null, 2);
    } else if (format === "csv") {
      if (tests.length === 0) return "";

      const headers = [
        "ID",
        "Test Name",
        "Scenario Type",
        "IFF Score",
        "Trustworthiness",
        "Dynamic Fidelity",
        "Uncertainty %",
        "Decision",
        "Created At",
      ];

      const rows = tests.map((t) => [
        t.id,
        t.testName,
        t.scenarioType,
        t.overallIFFScore,
        t.systemTrustworthiness,
        t.dynamicFidelityIndex,
        t.overallUncertaintyPercent,
        t.agenticDecision,
        t.createdAt,
      ]);

      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      return csv;
    }

    return null;
  }
}

// Singleton instance
export const iffPersistence = new IFFPersistence();
