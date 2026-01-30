/**
 * Events Router - Endpoints para visualização de histórico de eventos e alarmes
 */

import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { iffTestResults, iffAlarmEvents } from "../drizzle/schema";
import { desc } from "drizzle-orm";

export const eventsRouter = router({
  // Get all events (tests + alarms)
  getAll: publicProcedure
    .input(z.object({
      userId: z.number().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      eventType: z.enum(["test", "alarm", "all"]).optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { userId, startDate, endDate, eventType = "all", limit = 100, offset = 0 } = input;
      
      const db = await getDb();
      if (!db) return [];

      try {
        const events: any[] = [];
        
        // Fetch test results
        if (eventType === "test" || eventType === "all") {
          let testQuery = db.select().from(iffTestResults);
          if (userId) {
            testQuery = testQuery.where((t: any) => t.userId === userId) as any;
          }
          const tests = await testQuery.orderBy(desc(iffTestResults.createdAt)).limit(limit + offset);
          
          events.push(...tests.map((t: any) => ({
            id: `test-${t.id}`,
            type: "test",
            timestamp: t.createdAt,
            title: t.testName,
            description: `IFF Score: ${(t.overallIFFScore * 100).toFixed(2)}%`,
            severity: t.overallIFFScore < 0.7 ? "CRITICAL" : t.overallIFFScore < 0.85 ? "WARNING" : "INFO",
            data: t,
          })));
        }
        
        // Fetch alarm events
        if (eventType === "alarm" || eventType === "all") {
          let alarmQuery = db.select().from(iffAlarmEvents);
          if (userId) {
            alarmQuery = alarmQuery.where((a: any) => a.userId === userId) as any;
          }
          const alarms = await alarmQuery.orderBy(desc(iffAlarmEvents.createdAt)).limit(limit + offset);
          
          events.push(...alarms.map((a: any) => ({
            id: `alarm-${a.id}`,
            type: "alarm",
            timestamp: a.createdAt,
            title: `${a.severity} - ${a.metricName}`,
            description: `Value: ${a.value.toFixed(2)} (Threshold: ${a.threshold?.toFixed(2) || "N/A"})`,
            severity: a.severity,
            status: a.status,
            data: a,
          })));
        }
        
        // Sort by timestamp and apply date filters
        let filtered = events.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (startDate) filtered = filtered.filter((e: any) => new Date(e.timestamp) >= startDate);
        if (endDate) filtered = filtered.filter((e: any) => new Date(e.timestamp) <= endDate);
        
        return filtered.slice(offset, offset + limit);
      } catch (error) {
        console.error("[Events] Error fetching events:", error);
        return [];
      }
    }),

  // Get event statistics
  getStats: publicProcedure
    .input(z.object({
      userId: z.number().optional(),
      daysBack: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { userId, daysBack = 30 } = input;
      const db = await getDb();
      if (!db) return null;

      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);
        
        // Count tests
        let testQuery = db.select().from(iffTestResults);
        if (userId) {
          testQuery = testQuery.where((t: any) => t.userId === userId) as any;
        }
        const tests = await testQuery;
        const recentTests = tests.filter((t: any) => new Date(t.createdAt) >= startDate);
        
        // Count alarms
        let alarmQuery = db.select().from(iffAlarmEvents);
        if (userId) {
          alarmQuery = alarmQuery.where((a: any) => a.userId === userId) as any;
        }
        const alarms = await alarmQuery;
        const recentAlarms = alarms.filter((a: any) => new Date(a.createdAt) >= startDate);
        
        return {
          totalTests: tests.length,
          recentTests: recentTests.length,
          totalAlarms: alarms.length,
          recentAlarms: recentAlarms.length,
          criticalAlarms: recentAlarms.filter((a: any) => a.severity === "CRITICAL").length,
          warningAlarms: recentAlarms.filter((a: any) => a.severity === "WARNING").length,
          averageIFFScore: tests.length > 0 ? tests.reduce((sum: number, t: any) => sum + t.overallIFFScore, 0) / tests.length : 0,
        };
      } catch (error) {
        console.error("[Events] Error calculating stats:", error);
        return null;
      }
    }),

  // Get events by type
  getByType: publicProcedure
    .input(z.object({
      type: z.enum(["test", "alarm"]),
      userId: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { type, userId, limit = 50 } = input;
      const db = await getDb();
      if (!db) return [];

      try {
        if (type === "test") {
          let query = db.select().from(iffTestResults);
          if (userId) {
            query = query.where((t: any) => t.userId === userId) as any;
          }
          return await query.orderBy(desc(iffTestResults.createdAt)).limit(limit);
        } else {
          let query = db.select().from(iffAlarmEvents);
          if (userId) {
            query = query.where((a: any) => a.userId === userId) as any;
          }
          return await query.orderBy(desc(iffAlarmEvents.createdAt)).limit(limit);
        }
      } catch (error) {
        console.error(`[Events] Error fetching ${type} events:`, error);
        return [];
      }
    }),

  // Get event timeline data
  getTimeline: publicProcedure
    .input(z.object({
      userId: z.number().optional(),
      daysBack: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { userId, daysBack = 7 } = input;
      const db = await getDb();
      if (!db) return [];

      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);
        
        const events: any[] = [];
        
        // Get tests
        let testQuery = db.select().from(iffTestResults);
        if (userId) {
          testQuery = testQuery.where((t: any) => t.userId === userId) as any;
        }
        const tests = await testQuery;
        events.push(...tests
          .filter((t: any) => new Date(t.createdAt) >= startDate)
          .map((t: any) => ({
            date: new Date(t.createdAt).toISOString().split("T")[0],
            type: "test",
            count: 1,
            severity: t.overallIFFScore < 0.7 ? "CRITICAL" : t.overallIFFScore < 0.85 ? "WARNING" : "INFO",
          })));
        
        // Get alarms
        let alarmQuery = db.select().from(iffAlarmEvents);
        if (userId) {
          alarmQuery = alarmQuery.where((a: any) => a.userId === userId) as any;
        }
        const alarms = await alarmQuery;
        events.push(...alarms
          .filter((a: any) => new Date(a.createdAt) >= startDate)
          .map((a: any) => ({
            date: new Date(a.createdAt).toISOString().split("T")[0],
            type: "alarm",
            count: 1,
            severity: a.severity,
          })));
        
        // Group by date
        const timeline = events.reduce((acc: any, event: any) => {
          const existing = acc.find((e: any) => e.date === event.date);
          if (existing) {
            existing.events.push(event);
            existing.totalCount++;
            if (event.severity === "CRITICAL") existing.criticalCount++;
            if (event.severity === "WARNING") existing.warningCount++;
          } else {
            acc.push({
              date: event.date,
              events: [event],
              totalCount: 1,
              criticalCount: event.severity === "CRITICAL" ? 1 : 0,
              warningCount: event.severity === "WARNING" ? 1 : 0,
            });
          }
          return acc;
        }, []);
        
        return timeline.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } catch (error) {
        console.error("[Events] Error fetching timeline:", error);
        return [];
      }
    }),
});
