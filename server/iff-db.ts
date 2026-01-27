import { getDb } from "./db";
import { 
  iffTestScenarios, 
  iffTestResults, 
  iffTestEvents,
  InsertIFFTestResult,
  InsertIFFTestEvent,
  IFFTestResult,
  IFFTestEvent
} from "../drizzle/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

/**
 * Salvar resultado de teste IFF
 */
export async function saveIFFTestResult(data: InsertIFFTestResult): Promise<IFFTestResult | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(iffTestResults).values(data).returning();
    return result[0] || null;
  } catch (error) {
    console.error("[IFF DB] Failed to save test result:", error);
    throw error;
  }
}

/**
 * Recuperar histórico de testes IFF
 */
export async function getIFFTestHistory(
  userId?: number,
  limit: number = 100,
  offset: number = 0
): Promise<IFFTestResult[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const query = userId 
      ? db.select().from(iffTestResults).where(eq(iffTestResults.userId, userId))
      : db.select().from(iffTestResults);
    
    const results = await query
      .orderBy(desc(iffTestResults.createdAt))
      .limit(limit)
      .offset(offset);
    
    return results;
  } catch (error) {
    console.error("[IFF DB] Failed to get test history:", error);
    return [];
  }
}

/**
 * Recuperar teste IFF específico
 */
export async function getIFFTestResult(testId: number): Promise<IFFTestResult | null> {
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
    console.error("[IFF DB] Failed to get test result:", error);
    return null;
  }
}

/**
 * Salvar evento de teste IFF
 */
export async function saveIFFTestEvent(data: InsertIFFTestEvent): Promise<IFFTestEvent | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(iffTestEvents).values(data).returning();
    return result[0] || null;
  } catch (error) {
    console.error("[IFF DB] Failed to save test event:", error);
    throw error;
  }
}

/**
 * Recuperar eventos de teste específico
 */
export async function getIFFTestEvents(testResultId: number): Promise<IFFTestEvent[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const events = await db
      .select()
      .from(iffTestEvents)
      .where(eq(iffTestEvents.testResultId, testResultId))
      .orderBy(desc(iffTestEvents.timestamp));
    
    return events;
  } catch (error) {
    console.error("[IFF DB] Failed to get test events:", error);
    return [];
  }
}

/**
 * Recuperar estatísticas de testes
 */
export async function getIFFTestStatistics(
  userId?: number,
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalTests: number;
  averageIFFScore: number;
  highTrustworthiness: number;
  blockedDecisions: number;
  criticalEvents: number;
}> {
  const db = await getDb();
  if (!db) return {
    totalTests: 0,
    averageIFFScore: 0,
    highTrustworthiness: 0,
    blockedDecisions: 0,
    criticalEvents: 0,
  };

  try {
    const whereConditions = [];
    
    if (userId) {
      whereConditions.push(eq(iffTestResults.userId, userId));
    }
    
    if (startDate) {
      whereConditions.push(gte(iffTestResults.createdAt, startDate));
    }
    
    if (endDate) {
      whereConditions.push(lte(iffTestResults.createdAt, endDate));
    }

    const allResults = await db
      .select()
      .from(iffTestResults)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const totalTests = allResults.length;
    const averageIFFScore = totalTests > 0 
      ? allResults.reduce((sum: number, r: any) => sum + (r.overallIFFScore || 0), 0) / totalTests
      : 0;

    const highTrustworthiness = allResults.filter((r: any) => r.systemTrustworthiness === "high").length;
    const blockedDecisions = allResults.filter((r: any) => r.agenticDecision === "BLOCK").length;

    // Contar eventos críticos
    const allEvents = await db
      .select()
      .from(iffTestEvents)
      .where(eq(iffTestEvents.severity, "critical"));

    const criticalEvents = allEvents.length;

    return {
      totalTests,
      averageIFFScore,
      highTrustworthiness,
      blockedDecisions,
      criticalEvents,
    };
  } catch (error) {
    console.error("[IFF DB] Failed to get statistics:", error);
    return {
      totalTests: 0,
      averageIFFScore: 0,
      highTrustworthiness: 0,
      blockedDecisions: 0,
      criticalEvents: 0,
    };
  }
}

/**
 * Deletar teste IFF
 */
export async function deleteIFFTest(testId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Deletar eventos primeiro (foreign key)
    await db.delete(iffTestEvents).where(eq(iffTestEvents.testResultId, testId));
    
    // Deletar resultado
    await db.delete(iffTestResults).where(eq(iffTestResults.id, testId));
    
    return true;
  } catch (error) {
    console.error("[IFF DB] Failed to delete test:", error);
    return false;
  }
}

/**
 * Recuperar tendência de IFF
 */
export async function getIFFTrend(
  userId?: number,
  limit: number = 100
): Promise<{
  trend: "improving" | "stable" | "degrading";
  rate: number;
  data: Array<{ timestamp: number; score: number }>;
}> {
  const db = await getDb();
  if (!db) return { trend: "stable", rate: 0, data: [] };

  try {
    const query = userId
      ? db.select().from(iffTestResults).where(eq(iffTestResults.userId, userId))
      : db.select().from(iffTestResults);

    const results = await query
      .orderBy(desc(iffTestResults.createdAt))
      .limit(limit);

    if (results.length < 2) {
      return { trend: "stable", rate: 0, data: [] };
    }

    const data = results
      .reverse()
      .map((r: any) => ({
        timestamp: r.createdAt?.getTime() || 0,
        score: r.overallIFFScore || 0,
      }));

    // Calcular tendência
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const avgFirst = firstHalf.reduce((sum: number, d: any) => sum + d.score, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum: number, d: any) => sum + d.score, 0) / secondHalf.length;

    const rate = avgSecond - avgFirst;
    let trend: "improving" | "stable" | "degrading" = "stable";

    if (rate > 0.05) trend = "improving";
    else if (rate < -0.05) trend = "degrading";

    return { trend, rate, data };
  } catch (error) {
    console.error("[IFF DB] Failed to get trend:", error);
    return { trend: "stable", rate: 0, data: [] };
  }
}
