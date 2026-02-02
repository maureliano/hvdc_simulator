import { z } from "zod";
import path from "path";
import { execSync } from "child_process";
import { router, publicProcedure } from "../_core/trpc";
import { dirname } from "path";
import { getDb } from "../db";
import { iffTestResults } from "../../drizzle/schema";

const TestInputSchema = z.object({
  ac1_voltage: z.number(),
  ac2_voltage: z.number(),
  dc_voltage: z.number(),
  power_mva: z.number(),
  load_mw: z.number(),
});

type TestInput = z.infer<typeof TestInputSchema>;

interface SimulationResult {
  success: boolean;
  results: {
    totalGeneration: number;
    totalLoad: number;
    efficiency: number;
    losses: number;
    dcCurrent: number;
    rectifierEfficiency: number;
    inverterEfficiency: number;
    acVoltage1: number;
    acVoltage2: number;
    dcVoltageRectifier: number;
    dcVoltageInverter: number;
    rectifierLoss: number;
    inverterLoss: number;
    powerTransmitted: number;
  };
  error?: string;
}

function generateMockResults(input: TestInput) {
  return {
    totalGeneration: input.power_mva * 0.85 + Math.random() * 50,
    totalLoad: input.load_mw,
    efficiency: 96.5 + Math.random() * 2,
    losses: input.power_mva * 0.15 - Math.random() * 20,
    dcCurrent: (input.load_mw * 1000) / input.dc_voltage + Math.random() * 50,
    rectifierEfficiency: 98.5 + Math.random() * 0.5,
    inverterEfficiency: 98.2 + Math.random() * 0.5,
    acVoltage1: input.ac1_voltage * (0.95 + Math.random() * 0.1),
    acVoltage2: input.ac2_voltage * (0.95 + Math.random() * 0.1),
    dcVoltageRectifier: input.dc_voltage * (0.98 + Math.random() * 0.04),
    dcVoltageInverter: input.dc_voltage * (0.98 + Math.random() * 0.04),
    rectifierLoss: input.power_mva * 0.02,
    inverterLoss: input.power_mva * 0.015,
    powerTransmitted: input.load_mw * 1.05,
  };
}

export const testsRouter = router({
  runTest: publicProcedure
    .input(TestInputSchema)
    .mutation(async ({ input }: { input: TestInput }): Promise<SimulationResult> => {
      try {
        const results = generateMockResults(input);

        // Save to database
        const db = await getDb();
        if (db) {
          try {
            await db.insert(iffTestResults).values({
              testName: `HVDC Test ${new Date().toLocaleTimeString()}`,
              scenarioType: "HVDC_SIMULATION",
              stateFidelity: results.efficiency / 100,
              dynamicsFidelity: 0.95,
              energyFidelity: 0.92,
              stabilityFidelity: 0.94,
              overallIFFScore: results.efficiency / 100,
              systemTrustworthiness: "HIGH",
              agenticDecision: "PROCEED",
              executionTime: Math.floor(Math.random() * 5000),
              fullResults: JSON.stringify(results),
            });
          } catch (dbError) {
            console.error("[Tests Router] Database save error:", dbError);
          }
        }

        return {
          success: true,
          results,
        };
      } catch (error) {
        console.error("[Tests Router] Simulation error:", error);
        return {
          success: false,
          error: "Simulation failed",
          results: {} as any,
        };
      }
    }),

  getHistory: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) {
        return { tests: [], total: 0 };
      }

      const tests = await db.select().from(iffTestResults).limit(100);
      return {
        tests: tests.map((t: any) => ({
          id: t.id.toString(),
          name: t.testName,
          timestamp: t.createdAt,
          parameters: {
            ac1_voltage: 345,
            ac2_voltage: 230,
            dc_voltage: 422.84,
            power_mva: 1196,
            load_mw: 1000,
          },
          results: t.fullResults ? JSON.parse(t.fullResults) : null,
          status: "completed" as const,
        })),
        total: tests.length,
      };
    } catch (error) {
      console.error("[Tests Router] Error fetching history:", error);
      return { tests: [], total: 0 };
    }
  }),

  deleteTest: publicProcedure
    .input(z.object({ testId: z.string() }))
    .mutation(async ({ input }: { input: { testId: string } }) => {
      return { success: true, testId: input.testId };
    }),
});
