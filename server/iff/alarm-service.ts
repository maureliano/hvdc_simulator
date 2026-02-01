import { getDb } from "../db";
import { iffAlarmThresholds, iffAlarmEvents, iffTestResults } from "../../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";

const getDatabase = async () => {
  try {
    const db = await getDb();
    return db;
  } catch (error) {
    console.warn("Database not available, using mock data");
    return null;
  }
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
    if (!db) return []; // Return empty array if database not available
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
    console.warn("Error fetching alarm thresholds, returning empty array:", error);
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


/**
 * Buscar histórico de alarmes com filtros avançados
 */
export async function getAlarmHistoryWithFilters(
  userId: number | undefined,
  filters: {
    startDate?: Date;
    endDate?: Date;
    severity?: "WARNING" | "CRITICAL";
    metricName?: string;
    status?: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
  },
  limit: number = 100,
  offset: number = 0
): Promise<{ events: AlarmEvent[]; total: number }> {
  try {
    const db = await getDatabase();
    const whereConditions: any[] = [];

    if (userId) {
      whereConditions.push(eq(iffAlarmEvents.userId, userId));
    }

    if (filters.severity) {
      whereConditions.push(eq(iffAlarmEvents.severity, filters.severity));
    }

    if (filters.metricName) {
      whereConditions.push(eq(iffAlarmEvents.metricName, filters.metricName));
    }

    if (filters.status) {
      whereConditions.push(eq(iffAlarmEvents.status, filters.status));
    }

    if (filters.startDate) {
      whereConditions.push(
        gte(iffAlarmEvents.createdAt, filters.startDate)
      );
    }

    if (filters.endDate) {
      whereConditions.push(
        lte(iffAlarmEvents.createdAt, filters.endDate)
      );
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const events = await db
      .select()
      .from(iffAlarmEvents)
      .where(whereClause)
      .orderBy(iffAlarmEvents.createdAt)
      .limit(limit)
      .offset(offset);

    // Contar total sem limit/offset
    const countResult = await db
      .select()
      .from(iffAlarmEvents)
      .where(whereClause);

    return {
      events,
      total: countResult.length,
    };
  } catch (error) {
    console.error("[Alarm Service] Error fetching filtered alarm history:", error);
    return { events: [], total: 0 };
  }
}

/**
 * Obter métricas únicas de alarmes para filtro
 */
export async function getAlarmMetrics(userId?: number): Promise<string[]> {
  try {
    const db = await getDatabase();
    const query = userId
      ? await db
          .select({ metricName: iffAlarmEvents.metricName })
          .from(iffAlarmEvents)
          .where(eq(iffAlarmEvents.userId, userId))
          .distinct()
      : await db
          .select({ metricName: iffAlarmEvents.metricName })
          .from(iffAlarmEvents)
          .distinct();

    return query
      .map((r: any) => r.metricName)
      .filter((m: string) => m !== null && m !== undefined);
  } catch (error) {
    console.error("[Alarm Service] Error fetching alarm metrics:", error);
    return [];
  }
}


/**
 * Análise de tendências de alarmes - Frequência por período
 */
export async function getAlarmTrendAnalysis(
  userId?: number,
  daysBack: number = 30
): Promise<{
  daily: Array<{ date: string; count: number; critical: number; warning: number }>;
  hourly: Array<{ hour: number; count: number; critical: number; warning: number }>;
  byMetric: Array<{ metric: string; count: number; critical: number; warning: number }>;
}> {
  try {
    const db = await getDatabase();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const whereConditions: any[] = [gte(iffAlarmEvents.createdAt, startDate)];
    if (userId) {
      whereConditions.push(eq(iffAlarmEvents.userId, userId));
    }

    const allAlarms = await db
      .select()
      .from(iffAlarmEvents)
      .where(and(...whereConditions));

    // Análise diária
    const dailyMap: Record<string, { count: number; critical: number; warning: number }> = {};
    allAlarms.forEach((alarm: any) => {
      const date = new Date(alarm.createdAt).toLocaleDateString("pt-BR");
      if (!dailyMap[date]) {
        dailyMap[date] = { count: 0, critical: 0, warning: 0 };
      }
      dailyMap[date].count++;
      if (alarm.severity === "CRITICAL") dailyMap[date].critical++;
      else dailyMap[date].warning++;
    });

    const daily = Object.entries(dailyMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Análise por hora do dia
    const hourlyMap: Record<number, { count: number; critical: number; warning: number }> = {};
    for (let i = 0; i < 24; i++) {
      hourlyMap[i] = { count: 0, critical: 0, warning: 0 };
    }

    allAlarms.forEach((alarm: any) => {
      const hour = new Date(alarm.createdAt).getHours();
      hourlyMap[hour].count++;
      if (alarm.severity === "CRITICAL") hourlyMap[hour].critical++;
      else hourlyMap[hour].warning++;
    });

    const hourly = Object.entries(hourlyMap).map(([hour, data]) => ({
      hour: parseInt(hour),
      ...data,
    }));

    // Análise por métrica
    const metricMap: Record<string, { count: number; critical: number; warning: number }> = {};
    allAlarms.forEach((alarm: any) => {
      const metric = alarm.metricName || "Unknown";
      if (!metricMap[metric]) {
        metricMap[metric] = { count: 0, critical: 0, warning: 0 };
      }
      metricMap[metric].count++;
      if (alarm.severity === "CRITICAL") metricMap[metric].critical++;
      else metricMap[metric].warning++;
    });

    const byMetric = Object.entries(metricMap)
      .map(([metric, data]) => ({ metric, ...data }))
      .sort((a, b) => b.count - a.count);

    return { daily, hourly, byMetric };
  } catch (error) {
    console.error("[Alarm Service] Error analyzing alarm trends:", error);
    return { daily: [], hourly: [], byMetric: [] };
  }
}

/**
 * Análise de correlação entre métricas
 */
export async function getAlarmCorrelationAnalysis(
  userId?: number,
  daysBack: number = 30
): Promise<{
  correlations: Array<{
    metric1: string;
    metric2: string;
    coOccurrenceCount: number;
    percentage: number;
  }>;
  metricFrequency: Record<string, number>;
}> {
  try {
    const db = await getDatabase();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const whereConditions: any[] = [gte(iffAlarmEvents.createdAt, startDate)];
    if (userId) {
      whereConditions.push(eq(iffAlarmEvents.userId, userId));
    }

    const allAlarms = await db
      .select()
      .from(iffAlarmEvents)
      .where(and(...whereConditions));

    // Agrupar alarmes por período de tempo (1 hora)
    const timeWindowMap: Record<string, Set<string>> = {};
    allAlarms.forEach((alarm: any) => {
      const date = new Date(alarm.createdAt);
      const timeWindow = new Date(date.getTime() - (date.getTime() % (60 * 60 * 1000))).toISOString();
      
      if (!timeWindowMap[timeWindow]) {
        timeWindowMap[timeWindow] = new Set();
      }
      timeWindowMap[timeWindow].add(alarm.metricName);
    });

    // Contar co-ocorrências
    const coOccurrenceMap: Record<string, number> = {};
    const metricFrequency: Record<string, number> = {};

    Object.values(timeWindowMap).forEach((metrics) => {
      const metricArray = Array.from(metrics);
      
      // Contar frequência de cada métrica
      metricArray.forEach((metric) => {
        metricFrequency[metric] = (metricFrequency[metric] || 0) + 1;
      });

      // Contar pares de co-ocorrência
      for (let i = 0; i < metricArray.length; i++) {
        for (let j = i + 1; j < metricArray.length; j++) {
          const key = [metricArray[i], metricArray[j]].sort().join("|");
          coOccurrenceMap[key] = (coOccurrenceMap[key] || 0) + 1;
        }
      }
    });

    // Calcular percentual de co-ocorrência
    const totalWindows = Object.keys(timeWindowMap).length;
    const correlations = Object.entries(coOccurrenceMap)
      .map(([key, count]) => {
        const [metric1, metric2] = key.split("|");
        return {
          metric1,
          metric2,
          coOccurrenceCount: count,
          percentage: totalWindows > 0 ? (count / totalWindows) * 100 : 0,
        };
      })
      .sort((a, b) => b.coOccurrenceCount - a.coOccurrenceCount)
      .slice(0, 10); // Top 10 correlações

    return { correlations, metricFrequency };
  } catch (error) {
    console.error("[Alarm Service] Error analyzing alarm correlations:", error);
    return { correlations: [], metricFrequency: {} };
  }
}

/**
 * Padrões de falha - Heatmap de alarmes por hora e dia da semana
 */
export async function getAlarmHeatmapData(
  userId?: number,
  daysBack: number = 90
): Promise<Array<{ dayOfWeek: number; hour: number; count: number }>> {
  try {
    const db = await getDatabase();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const whereConditions: any[] = [gte(iffAlarmEvents.createdAt, startDate)];
    if (userId) {
      whereConditions.push(eq(iffAlarmEvents.userId, userId));
    }

    const allAlarms = await db
      .select()
      .from(iffAlarmEvents)
      .where(and(...whereConditions));

    // Criar matriz 7x24 (dia da semana x hora)
    const heatmapData: Record<string, number> = {};
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        heatmapData[`${day}|${hour}`] = 0;
      }
    }

    allAlarms.forEach((alarm: any) => {
      const date = new Date(alarm.createdAt);
      const dayOfWeek = date.getDay();
      const hour = date.getHours();
      const key = `${dayOfWeek}|${hour}`;
      heatmapData[key]++;
    });

    return Object.entries(heatmapData).map(([key, count]) => {
      const [dayOfWeek, hour] = key.split("|").map(Number);
      return { dayOfWeek, hour, count };
    });
  } catch (error) {
    console.error("[Alarm Service] Error generating alarm heatmap:", error);
    return [];
  }
}

/**
 * Estatísticas de resolução de alarmes
 */
export async function getAlarmResolutionStats(
  userId?: number,
  daysBack: number = 30
): Promise<{
  totalResolved: number;
  averageResolutionTime: number; // em minutos
  criticalResolutionTime: number;
  warningResolutionTime: number;
  unresolvedCount: number;
}> {
  try {
    const db = await getDatabase();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const whereConditions: any[] = [gte(iffAlarmEvents.createdAt, startDate)];
    if (userId) {
      whereConditions.push(eq(iffAlarmEvents.userId, userId));
    }

    const allAlarms = await db
      .select()
      .from(iffAlarmEvents)
      .where(and(...whereConditions));

    const resolvedAlarms = allAlarms.filter((a: any) => a.status === "RESOLVED");
    const unresolvedAlarms = allAlarms.filter((a: any) => a.status !== "RESOLVED");

    let totalResolutionTime = 0;
    let criticalResolutionTime = 0;
    let warningResolutionTime = 0;
    let criticalCount = 0;
    let warningCount = 0;

    resolvedAlarms.forEach((alarm: any) => {
      const createdTime = new Date(alarm.createdAt).getTime();
      const resolvedTime = new Date(alarm.resolvedAt).getTime();
      const resolutionMinutes = (resolvedTime - createdTime) / (1000 * 60);

      totalResolutionTime += resolutionMinutes;

      if (alarm.severity === "CRITICAL") {
        criticalResolutionTime += resolutionMinutes;
        criticalCount++;
      } else {
        warningResolutionTime += resolutionMinutes;
        warningCount++;
      }
    });

    return {
      totalResolved: resolvedAlarms.length,
      averageResolutionTime:
        resolvedAlarms.length > 0 ? totalResolutionTime / resolvedAlarms.length : 0,
      criticalResolutionTime: criticalCount > 0 ? criticalResolutionTime / criticalCount : 0,
      warningResolutionTime: warningCount > 0 ? warningResolutionTime / warningCount : 0,
      unresolvedCount: unresolvedAlarms.length,
    };
  } catch (error) {
    console.error("[Alarm Service] Error getting alarm resolution stats:", error);
    return {
      totalResolved: 0,
      averageResolutionTime: 0,
      criticalResolutionTime: 0,
      warningResolutionTime: 0,
      unresolvedCount: 0,
    };
  }
}
