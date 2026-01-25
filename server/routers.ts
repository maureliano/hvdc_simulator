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
import { spawn } from "child_process";
import path from "path";

// Helper function to run Python simulation
function runPythonSimulation(params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'server', 'hvdc_simulator.py');
    const python = spawn('/usr/bin/python3', [pythonScript, JSON.stringify(params)]);
    
    let stdout = '';
    let stderr = '';
    
    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed: ${stderr}`));
      } else {
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (e) {
          reject(new Error(`Failed to parse simulation results: ${e}`));
        }
      }
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

  // HVDC Simulation router
  simulation: router({
    // Run simulation with parameters (public access for standalone mode)
    run: publicProcedure
      .input(z.object({
        ac1_voltage: z.number().optional(),
        ac2_voltage: z.number().optional(),
        dc_voltage: z.number().optional(),
        power_mva: z.number().optional(),
        load_mw: z.number().optional(),
        saveResult: z.boolean().optional(),
        configId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const params = {
          ac1_voltage: input.ac1_voltage,
          ac2_voltage: input.ac2_voltage,
          dc_voltage: input.dc_voltage,
          power_mva: input.power_mva,
          load_mw: input.load_mw,
        };
        
        const result = await runPythonSimulation(params);
        
        // Save result to database if requested (only when authenticated)
        if (input.saveResult && result.success && ctx.user) {
          await saveSimulationResult({
            userId: ctx.user.id,
            configId: input.configId || null,
            parameters: JSON.stringify(params),
            totalGenerationMw: result.summary.total_generation_mw,
            totalLoadMw: result.summary.total_load_mw,
            totalLossesMw: result.summary.total_losses_mw,
            efficiencyPercent: result.summary.efficiency_percent,
            converged: result.summary.converged ? 1 : 0,
            fullResults: JSON.stringify(result),
          });
        }
        
        return result;
      }),
    
    // Get simulation history
    history: protectedProcedure
      .input(z.object({
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return await getSimulationResultsByUserId(ctx.user.id, input.limit);
      }),
  }),

  // Circuit configuration router
  config: router({
    // List all configs for current user
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getCircuitConfigsByUserId(ctx.user.id);
    }),
    
    // Get single config by ID
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getCircuitConfigById(input.id);
      }),
    
    // Create new config
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        ac1Voltage: z.number().optional(),
        ac2Voltage: z.number().optional(),
        dcVoltage: z.number().optional(),
        powerMva: z.number().optional(),
        loadMw: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await createCircuitConfig({
          userId: ctx.user.id,
          name: input.name,
          description: input.description || null,
          ac1Voltage: input.ac1Voltage || 345.0,
          ac2Voltage: input.ac2Voltage || 230.0,
          dcVoltage: input.dcVoltage || 422.84,
          powerMva: input.powerMva || 1196.0,
          loadMw: input.loadMw || 1000.0,
        });
      }),
    
    // Update existing config
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        ac1Voltage: z.number().optional(),
        ac2Voltage: z.number().optional(),
        dcVoltage: z.number().optional(),
        powerMva: z.number().optional(),
        loadMw: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        // Update not implemented for SQLite, delete and recreate instead
        throw new Error('Update not implemented, please delete and create new config');
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
});

export type AppRouter = typeof appRouter;
