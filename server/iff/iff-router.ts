/**
 * Router tRPC para Framework IFF
 *
 * Expõe endpoints para avaliação de Digital Twins e decisões de segurança
 */

import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import IFFFramework from "./iff-framework";

// Instância global do framework
const iffFramework = new IFFFramework();

export const iffRouter = router({
  /**
   * Avalia Digital Twin e retorna relatório IFF completo
   */
  evaluateDigitalTwin: publicProcedure
    .input(
      z.object({
        digital_voltage_kv: z.number(),
        digital_current_ka: z.number(),
        digital_power_mw: z.number(),
        digital_frequency_hz: z.number(),
        real_voltage_kv: z.number(),
        real_current_ka: z.number(),
        real_power_mw: z.number(),
        real_frequency_hz: z.number(),
        operation_type: z.enum(["control", "measurement", "prediction", "optimization"]).optional(),
      })
    )
    .query(({ input }) => {
      const report = iffFramework.evaluateDigitalTwin(
        {
          timestamp: Date.now(),
          voltage_kv: input.digital_voltage_kv,
          current_ka: input.digital_current_ka,
          power_mw: input.digital_power_mw,
          frequency_hz: input.digital_frequency_hz,
        },
        {
          timestamp: Date.now(),
          voltage_kv: input.real_voltage_kv,
          current_ka: input.real_current_ka,
          power_mw: input.real_power_mw,
          frequency_hz: input.real_frequency_hz,
        },
        null,
        input.operation_type || "measurement"
      );

      return report;
    }),

  /**
   * Retorna histórico de avaliações IFF
   */
  getReportHistory: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
      })
    )
    .query(({ input }) => {
      return iffFramework.getReportHistory(input.limit || 100);
    }),

  /**
   * Calcula tendência do IFF
   */
  getIFFTrend: publicProcedure.query(() => {
    return iffFramework.calculateIFFTrend();
  }),

  /**
   * Gera relatório científico para artigo
   */
  generateScientificReport: publicProcedure.query(() => {
    return iffFramework.generateScientificReport();
  }),

  /**
   * Retorna último relatório
   */
  getLatestReport: publicProcedure.query(() => {
    const history = iffFramework.getReportHistory(1);
    return history.length > 0 ? history[0] : null;
  }),
});

export default iffRouter;
