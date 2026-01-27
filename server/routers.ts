import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  createCircuitConfig, 
  getCircuitConfigsByUserId, 
  getCircuitConfigById,
  deleteCircuitConfig,
  saveSimulationResult,
  getSimulationResultsByUserId,
  getSimulationResultById
} from "./db";
import {
  saveIFFTestResult,
  getIFFTestHistory,
  getIFFTestResult,
  saveIFFTestEvent,
  getIFFTestEvents,
  getIFFTestStatistics,
  deleteIFFTest,
  getIFFTrend
} from "./iff-db";
import {
  getAlarmThresholds,
  createAlarmThreshold,
  updateAlarmThreshold,
  deleteAlarmThreshold,
  getActiveAlarmEvents,
  getAlarmEventHistory,
  acknowledgeAlarmEvent,
  resolveAlarmEvent,
  checkIFFTestResultForAlarms,
  getAlarmStatistics
} from "./iff/alarm-service";
import { spawn } from "child_process";
import path from "path";


// Helper function to run Python simulation
function runPythonSimulation(params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), "server", "hvdc_simulator.py");
    const args = [
      String(params.ac1Voltage || 345),
      String(params.ac2Voltage || 230),
      String(params.dcVoltage || 422.84),
      String(params.loadMw || 1000),
    ];

    const python = spawn("python3", [pythonScript, ...args], {
      cwd: process.cwd(),
    });

    let stdout = "";
    let stderr = "";

    python.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    python.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    python.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed: ${stderr}`));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse simulation result: ${error}`));
      }
    });

    python.on("error", (error) => {
      reject(error);
    });
  });
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Circuit simulation router
  circuit: router({
    // Run simulation
    simulate: publicProcedure
      .input(z.object({
        ac1Voltage: z.number().optional(),
        ac2Voltage: z.number().optional(),
        dcVoltage: z.number().optional(),
        loadMw: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const result = await runPythonSimulation(input);
          return result;
        } catch (error) {
          console.error("[Simulation] Error:", error);
          throw error;
        }
      }),

    // Save configuration
    saveConfig: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        ac1Voltage: z.number(),
        ac2Voltage: z.number(),
        dcVoltage: z.number(),
        powerMva: z.number(),
        loadMw: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) return null;
        return await createCircuitConfig({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          ac1Voltage: input.ac1Voltage,
          ac2Voltage: input.ac2Voltage,
          dcVoltage: input.dcVoltage,
          powerMva: input.powerMva,
          loadMw: input.loadMw,
        });
      }),

    // Get configurations
    getConfigs: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) return [];
        return await getCircuitConfigsByUserId(ctx.user.id);
      }),

    // Get specific configuration
    getConfig: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getCircuitConfigById(input.id);
      }),

    // Delete config
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteCircuitConfig(input.id);
      }),
    
    // Get simulation history for a config
    simulations: protectedProcedure
      .input(z.object({
        configId: z.number(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        // Get by config not implemented, return empty array
        return [];
      }),
  }),

  // IFF Framework router
  iff: router({
    saveTestResult: publicProcedure
      .input(z.object({
        userId: z.number().optional(),
        testName: z.string(),
        scenarioType: z.string(),
        executionTime: z.number(),
        overallIFFScore: z.number(),
        systemTrustworthiness: z.string(),
        agenticDecision: z.string(),
        fullResults: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await saveIFFTestResult({
          userId: input.userId,
          scenarioId: undefined,
          testName: input.testName,
          scenarioType: input.scenarioType,
          executionTime: input.executionTime,
          overallIFFScore: input.overallIFFScore,
          systemTrustworthiness: input.systemTrustworthiness,
          agenticDecision: input.agenticDecision,
          fullResults: input.fullResults,
        });
      }),

    getHistory: publicProcedure
      .input(z.object({
        userId: z.number().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await getIFFTestHistory(input.userId, input.limit || 100);
      }),

    getTrend: publicProcedure
      .input(z.object({
        userId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await getIFFTrend(input.userId);
      }),

    getStatistics: publicProcedure
      .input(z.object({
        userId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await getIFFTestStatistics(input.userId);
      }),
  }),

  // Alarm management router
  alarms: router({
    // Get configured thresholds
    getThresholds: publicProcedure
      .input(z.object({
        userId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await getAlarmThresholds(input.userId);
      }),

    // Create new alarm threshold
    createThreshold: publicProcedure
      .input(z.object({
        metricName: z.string(),
        criticalThreshold: z.number(),
        warningThreshold: z.number(),
        userId: z.number().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createAlarmThreshold(
          input.metricName,
          input.criticalThreshold,
          input.warningThreshold,
          input.userId,
          input.description
        );
      }),

    // Update alarm threshold
    updateThreshold: publicProcedure
      .input(z.object({
        id: z.number(),
        criticalThreshold: z.number().optional(),
        warningThreshold: z.number().optional(),
        enabled: z.boolean().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await updateAlarmThreshold(id, updates);
      }),

    // Delete alarm threshold
    deleteThreshold: publicProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await deleteAlarmThreshold(input.id);
      }),

    // Get active alarm events
    getActiveAlarms: publicProcedure
      .input(z.object({
        userId: z.number().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await getActiveAlarmEvents(input.userId, input.limit);
      }),

    // Get alarm event history
    getHistory: publicProcedure
      .input(z.object({
        userId: z.number().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await getAlarmEventHistory(input.userId, input.limit, input.offset);
      }),

    // Acknowledge alarm event
    acknowledge: publicProcedure
      .input(z.object({
        id: z.number(),
        acknowledgedBy: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await acknowledgeAlarmEvent(input.id, input.acknowledgedBy);
      }),

    // Resolve alarm event
    resolve: publicProcedure
      .input(z.object({
        id: z.number(),
        resolvedBy: z.string(),
        resolutionNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await resolveAlarmEvent(input.id, input.resolvedBy, input.resolutionNotes);
      }),

    // Check test result for alarms
    checkTestResult: publicProcedure
      .input(z.object({
        testResultId: z.number(),
        userId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await checkIFFTestResultForAlarms(input.testResultId, input.userId);
      }),

    // Get alarm statistics
    getStatistics: publicProcedure
      .input(z.object({
        userId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await getAlarmStatistics(input.userId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
