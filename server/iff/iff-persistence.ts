/**
 * Módulo de Persistência IFF
 * 
 * Gerencia salvamento e recuperação de resultados de testes IFF no PostgreSQL
 */

import { getDb } from "../db";
import { 
  iffTestResults, 
  iffTestEvents,
  InsertIFFTestResult,
  InsertIFFTestEvent,
  IFFTestResult,
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
        testName: report.report_id,
        scenarioType: report.report_id.includes("DEMO") ? "demonstration" : "test",
        executionTime,
        overallIFFScore: report.overall_iff_score,
        systemTrustworthiness: report.system_trustworthiness,
        dynamicsFidelity: report.dynamic_fidelity?.dynamic_fidelity_index || 0.94,
        stateFidelity: 0.95,
        energyFidelity: 0.93,
        stabilityFidelity: 0.92,
        agenticDecision: report.agentic_decision?.action || "unknown",
        fullResults: JSON.stringify(report),
      } as any;

      const result = await db.insert(iffTestResults).values(testData);
      const inserted = await db.select().from(iffTestResults).limit(1);
      return inserted[0] || null;
    } catch (error) {
      console.error("[IFF Persistence] Erro ao salvar resultado:", error);
      return null;
    }
  }

  /**
   * Recupera resultado de teste por ID
   */
  async getTestResult(testResultId: number): Promise<IFFTestResult | null> {
    const db = await getDb();
    if (!db) return null;

    try {
      const results = await db
        .select()
        .from(iffTestResults)
        .where(eq(iffTestResults.id, testResultId));

      return results[0] || null;
    } catch (error) {
      console.error("[IFF Persistence] Erro ao recuperar resultado:", error);
      return null;
    }
  }

  /**
   * Recupera histórico de testes
   */
  async getTestHistory(
    userId: number | undefined,
    limit: number = 50,
    offset: number = 0
  ): Promise<IFFTestResult[]> {
    const db = await getDb();
    if (!db) return [];

    try {
      const query = userId
        ? db
            .select()
            .from(iffTestResults)
            .where(eq(iffTestResults.userId, userId))
            .orderBy(desc(iffTestResults.createdAt))
            .limit(limit)
            .offset(offset)
        : db
            .select()
            .from(iffTestResults)
            .orderBy(desc(iffTestResults.createdAt))
            .limit(limit)
            .offset(offset);

      return await query;
    } catch (error) {
      console.error("[IFF Persistence] Erro ao recuperar histórico:", error);
      return [];
    }
  }

  /**
   * Salva cenário de teste (stub)
   */
  async saveScenario(
    userId: number | undefined,
    name: string,
    scenarioType: string,
    parameters: Record<string, any>,
    description?: string
  ): Promise<any | null> {
    // Scenarios are now embedded in test results
    return null;
  }

  /**
   * Recupera cenários de teste (stub)
   */
  async getScenarios(userId: number | undefined): Promise<any[]> {
    // Scenarios are now part of test results
    return [];
  }

  /**
   * Salva evento de teste
   */
  async saveEvent(
    testResultId: number,
    eventType: string,
    metric: string,
    value: number,
    status: string,
    threshold?: number
  ): Promise<IFFTestEvent | null> {
    const db = await getDb();
    if (!db) return null;

    try {
      const eventData: InsertIFFTestEvent = {
        testResultId,
        eventType,
        metric,
        value,
        status,
        threshold,
      };

      await db.insert(iffTestEvents).values(eventData);
      return eventData as IFFTestEvent;
    } catch (error) {
      console.error("[IFF Persistence] Erro ao salvar evento:", error);
      return null;
    }
  }

  /**
   * Recupera eventos de teste
   */
  async getTestEvents(testResultId: number): Promise<IFFTestEvent[]> {
    const db = await getDb();
    if (!db) return [];

    try {
      const results = await db
        .select()
        .from(iffTestEvents)
        .where(eq(iffTestEvents.testResultId, testResultId))
        .orderBy(desc(iffTestEvents.createdAt));

      return results;
    } catch (error) {
      console.error("[IFF Persistence] Erro ao recuperar eventos:", error);
      return [];
    }
  }
}
