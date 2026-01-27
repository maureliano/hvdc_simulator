import { getDb } from "../db";
import { iffAlarmThresholds, iffAlarmEvents, iffTestResults } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const getDatabase = async () => {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
};

/**
 * Serviço de Monitoramento de Alarmes IFF
 * Monitora scores IFF e dispara alarmes quando caem abaixo de thresholds
 */

export interface AlarmThreshold {
  id: number;
  userId: number | null;
  metricName: string;
  criticalThreshold: number;
  warningThreshold: number;
  enabled: boolean;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlarmEvent {
  id: number;
  userId: number | null;
  testResultId: number | null;
  thresholdId: number | null;
  metricName: string;
  metricValue: number;
  threshold: number;
  severity: "WARNING" | "CRITICAL";
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
  message: string;
  acknowledgedAt: Date | null;
  acknowledgedBy: string | null;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  resolutionNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Obter thresholds de alarme configurados
 */
export async function getAlarmThresholds(userId?: number): Promise<AlarmThreshold[]> {
  try {
    const db = await getDatabase();
    const query = userId
      ? await db
          .select()
          .from(iffAlarmThresholds)
          .where(
            and(
              eq(iffAlarmThresholds.userId, userId),
              eq(iffAlarmThresholds.enabled, 1)
            )
          )
      : await db
          .select()
          .from(iffAlarmThresholds)
          .where(eq(iffAlarmThresholds.enabled, 1));

    return query.map((t: any) => ({
      id: t.id,
      userId: t.userId,
      metricName: t.metricName,
      criticalThreshold: t.criticalThreshold,
      warningThreshold: t.warningThreshold,
      enabled: t.enabled === 1,
      description: t.description,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  } catch (error) {
    console.error("[Alarm Service] Error fetching thresholds:", error);
    return [];
  }
}

/**
 * Criar novo threshold de alarme
 */
export async function createAlarmThreshold(
  metricName: string,
  criticalThreshold: number,
  warningThreshold: number,
  userId?: number,
  description?: string
): Promise<AlarmThreshold | null> {
  try {
    const db = await getDatabase();
    const result = await db.insert(iffAlarmThresholds).values({
      metricName,
      criticalThreshold,
      warningThreshold,
      enabled: 1,
      userId,
      description,
    });

    // Retornar o threshold criado
    const created = await db
      .select()
      .from(iffAlarmThresholds)
      .where(eq(iffAlarmThresholds.id, result[0]));

    if (created.length === 0) return null;

    const threshold = created[0] as any;
    return {
      id: threshold.id,
      userId: threshold.userId,
      metricName: threshold.metricName,
      criticalThreshold: threshold.criticalThreshold,
      warningThreshold: threshold.warningThreshold,
      enabled: threshold.enabled === 1,
      description: threshold.description,
      createdAt: threshold.createdAt,
      updatedAt: threshold.updatedAt,
    };
  } catch (error) {
    console.error("[Alarm Service] Error creating threshold:", error);
    return null;
  }
}

/**
 * Atualizar threshold de alarme
 */
export async function updateAlarmThreshold(
  id: number,
  updates: Partial<AlarmThreshold>
): Promise<AlarmThreshold | null> {
  try {
    const db = await getDatabase();
    const updateData: any = {};
    if (updates.criticalThreshold !== undefined)
      updateData.criticalThreshold = updates.criticalThreshold;
    if (updates.warningThreshold !== undefined)
      updateData.warningThreshold = updates.warningThreshold;
    if (updates.enabled !== undefined)
      updateData.enabled = updates.enabled ? 1 : 0;
    if (updates.description !== undefined) updateData.description = updates.description;

    await db.update(iffAlarmThresholds).set(updateData).where(eq(iffAlarmThresholds.id, id));

    const updated = await db
      .select()
      .from(iffAlarmThresholds)
      .where(eq(iffAlarmThresholds.id, id));

    if (updated.length === 0) return null;

    return {
      ...updated[0],
      enabled: updated[0].enabled === 1,
    };
  } catch (error) {
    console.error("[Alarm Service] Error updating threshold:", error);
    return null;
  }
}

/**
 * Deletar threshold de alarme
 */
export async function deleteAlarmThreshold(id: number): Promise<boolean> {
  try {
    const db = await getDatabase();
    await db.delete(iffAlarmThresholds).where(eq(iffAlarmThresholds.id, id));
    return true;
  } catch (error) {
    console.error("[Alarm Service] Error deleting threshold:", error);
    return false;
  }
}

/**
 * Registrar evento de alarme
 */
export async function createAlarmEvent(
  metricName: string,
  metricValue: number,
  threshold: number,
  severity: "WARNING" | "CRITICAL",
  message: string,
  userId?: number,
  testResultId?: number,
  thresholdId?: number
): Promise<AlarmEvent | null> {
  try {
    const db = await getDatabase();
    const result = await db.insert(iffAlarmEvents).values({
      metricName,
      metricValue,
      threshold,
      severity,
      status: "ACTIVE",
      message,
      userId,
      testResultId,
      thresholdId,
    });

    const created = await db
      .select()
      .from(iffAlarmEvents)
      .where(eq(iffAlarmEvents.id, result[0]));

    if (created.length === 0) return null;

    return created[0];
  } catch (error) {
    console.error("[Alarm Service] Error creating alarm event:", error);
    return null;
  }
}

/**
 * Obter eventos de alarme ativos
 */
export async function getActiveAlarmEvents(
  userId?: number,
  limit: number = 100
): Promise<AlarmEvent[]> {
  try {
    const db = await getDatabase();
    const query = userId
      ? await db
          .select()
          .from(iffAlarmEvents)
          .where(
            and(
              eq(iffAlarmEvents.userId, userId),
              eq(iffAlarmEvents.status, "ACTIVE")
            )
          )
          .orderBy(iffAlarmEvents.createdAt)
          .limit(limit)
      : await db
          .select()
          .from(iffAlarmEvents)
          .where(eq(iffAlarmEvents.status, "ACTIVE"))
          .orderBy(iffAlarmEvents.createdAt)
          .limit(limit);

    return query;
  } catch (error) {
    console.error("[Alarm Service] Error fetching active alarms:", error);
    return [];
  }
}

/**
 * Obter histórico de eventos de alarme
 */
export async function getAlarmEventHistory(
  userId?: number,
  limit: number = 100,
  offset: number = 0
): Promise<AlarmEvent[]> {
  try {
    const db = await getDatabase();
    const query = userId
      ? await db
          .select()
          .from(iffAlarmEvents)
          .where(eq(iffAlarmEvents.userId, userId))
          .orderBy(iffAlarmEvents.createdAt)
          .limit(limit)
          .offset(offset)
      : await db
          .select()
          .from(iffAlarmEvents)
          .orderBy(iffAlarmEvents.createdAt)
          .limit(limit)
          .offset(offset);

    return query;
  } catch (error) {
    console.error("[Alarm Service] Error fetching alarm history:", error);
    return [];
  }
}

/**
 * Reconhecer evento de alarme
 */
export async function acknowledgeAlarmEvent(
  id: number,
  acknowledgedBy: string
): Promise<AlarmEvent | null> {
  try {
    const db = await getDatabase();
    await db
      .update(iffAlarmEvents)
      .set({
        status: "ACKNOWLEDGED",
        acknowledgedAt: new Date(),
        acknowledgedBy,
      })
      .where(eq(iffAlarmEvents.id, id));

    const updated = await db
      .select()
      .from(iffAlarmEvents)
      .where(eq(iffAlarmEvents.id, id));

    return updated.length > 0 ? updated[0] : null;
  } catch (error) {
    console.error("[Alarm Service] Error acknowledging alarm:", error);
    return null;
  }
}

/**
 * Resolver evento de alarme
 */
export async function resolveAlarmEvent(
  id: number,
  resolvedBy: string,
  resolutionNotes?: string
): Promise<AlarmEvent | null> {
  try {
    const db = await getDatabase();
    await db
      .update(iffAlarmEvents)
      .set({
        status: "RESOLVED",
        resolvedAt: new Date(),
        resolvedBy,
        resolutionNotes,
      })
      .where(eq(iffAlarmEvents.id, id));

    const updated = await db
      .select()
      .from(iffAlarmEvents)
      .where(eq(iffAlarmEvents.id, id));

    return updated.length > 0 ? updated[0] : null;
  } catch (error) {
    console.error("[Alarm Service] Error resolving alarm:", error);
    return null;
  }
}

/**
 * Monitorar resultado de teste IFF e disparar alarmes se necessário
 */
export async function checkIFFTestResultForAlarms(
  testResultId: number,
  userId?: number
): Promise<AlarmEvent[]> {
  try {
    const db = await getDatabase();
    // Obter resultado do teste
    const testResults = await db
      .select()
      .from(iffTestResults)
      .where(eq(iffTestResults.id, testResultId));

    if (testResults.length === 0) {
      console.warn(`[Alarm Service] Test result ${testResultId} not found`);
      return [];
    }

    const testResult = testResults[0];
    const thresholds = await getAlarmThresholds(userId);
    const createdAlarms: AlarmEvent[] = [];

    // Verificar cada threshold contra as métricas do teste
    for (const threshold of thresholds) {
      let metricValue: number | null = null;
      let shouldAlarm = false;
      let severity: "WARNING" | "CRITICAL" = "WARNING";

      // Mapear nome da métrica para valor do teste
      switch (threshold.metricName) {
        case "overallIFFScore":
          metricValue = testResult.overallIFFScore;
          break;
        case "dynamicFidelityIndex":
          metricValue = testResult.dynamicFidelityIndex;
          break;
        case "confidenceLevel":
          metricValue = testResult.confidenceLevel;
          break;
        case "overallUncertaintyPercent":
          metricValue = testResult.overallUncertaintyPercent;
          break;
        default:
          continue;
      }

      if (metricValue === null || metricValue === undefined) continue;

      // Determinar se deve disparar alarme
      if (metricValue < threshold.criticalThreshold) {
        shouldAlarm = true;
        severity = "CRITICAL";
      } else if (metricValue < threshold.warningThreshold) {
        shouldAlarm = true;
        severity = "WARNING";
      }

      if (shouldAlarm) {
        const message = `${threshold.metricName} = ${metricValue.toFixed(2)} (threshold: ${threshold.criticalThreshold})`;
        const alarmEvent = await createAlarmEvent(
          threshold.metricName,
          metricValue,
          threshold.criticalThreshold,
          severity,
          message,
          userId,
          testResultId,
          threshold.id
        );

        if (alarmEvent) {
          createdAlarms.push(alarmEvent);
          console.log(`[Alarm Service] Created ${severity} alarm for ${threshold.metricName}`);
        }
      }
    }

    return createdAlarms;
  } catch (error) {
    console.error("[Alarm Service] Error checking test result for alarms:", error);
    return [];
  }
}

/**
 * Obter estatísticas de alarmes
 */
export async function getAlarmStatistics(userId?: number) {
  try {
    // const db = await getDatabase(); // Not needed for this function
    const activeAlarms = await getActiveAlarmEvents(userId, 1000);
    const allAlarms = await getAlarmEventHistory(userId, 1000);

    const criticalCount = activeAlarms.filter((a) => a.severity === "CRITICAL").length;
    const warningCount = activeAlarms.filter((a) => a.severity === "WARNING").length;

    const alarmsByMetric: Record<string, number> = {};
    for (const alarm of allAlarms) {
      alarmsByMetric[(alarm as any).metricName] = (alarmsByMetric[(alarm as any).metricName] || 0) + 1;
    }

    return {
      totalActive: activeAlarms.length,
      criticalCount,
      warningCount,
      totalHistorical: allAlarms.length,
      alarmsByMetric,
    };
  } catch (error) {
    console.error("[Alarm Service] Error getting alarm statistics:", error);
    return {
      totalActive: 0,
      criticalCount: 0,
      warningCount: 0,
      totalHistorical: 0,
      alarmsByMetric: {},
    };
  }
}
