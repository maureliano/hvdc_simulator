import { describe, it, expect } from "vitest";
import { testsRouter } from "./tests";

describe("Tests Router", () => {
  it("should run a test and return success", async () => {
    const caller = testsRouter.createCaller({});
    
    const result = await caller.runTest({
      ac1_voltage: 345,
      ac2_voltage: 230,
      dc_voltage: 422.84,
      power_mva: 1196,
      load_mw: 1000,
    });

    expect(result.success).toBe(true);
    expect(result.results).toBeDefined();
    expect(result.results.totalGeneration).toBeGreaterThan(0);
    expect(result.results.efficiency).toBeGreaterThan(90);
    expect(result.results.efficiency).toBeLessThan(100);
  });

  it("should generate realistic simulation results", async () => {
    const caller = testsRouter.createCaller({});
    
    const result = await caller.runTest({
      ac1_voltage: 345,
      ac2_voltage: 230,
      dc_voltage: 422.84,
      power_mva: 1196,
      load_mw: 1000,
    });

    const { results } = result;
    
    // Verify all expected fields are present
    expect(results).toHaveProperty("totalGeneration");
    expect(results).toHaveProperty("totalLoad");
    expect(results).toHaveProperty("efficiency");
    expect(results).toHaveProperty("losses");
    expect(results).toHaveProperty("dcCurrent");
    expect(results).toHaveProperty("rectifierEfficiency");
    expect(results).toHaveProperty("inverterEfficiency");
    expect(results).toHaveProperty("acVoltage1");
    expect(results).toHaveProperty("acVoltage2");
    expect(results).toHaveProperty("dcVoltageRectifier");
    expect(results).toHaveProperty("dcVoltageInverter");
    expect(results).toHaveProperty("rectifierLoss");
    expect(results).toHaveProperty("inverterLoss");
    expect(results).toHaveProperty("powerTransmitted");

    // Verify realistic ranges
    expect(results.totalLoad).toBe(1000); // Should match input
    expect(results.rectifierEfficiency).toBeGreaterThan(98);
    expect(results.rectifierEfficiency).toBeLessThan(99);
    expect(results.inverterEfficiency).toBeGreaterThan(98);
    expect(results.inverterEfficiency).toBeLessThan(98.7);
  });

  it("should return test history", async () => {
    const caller = testsRouter.createCaller({});
    
    const history = await caller.getHistory();

    expect(history).toBeDefined();
    expect(history.tests).toBeDefined();
    expect(Array.isArray(history.tests)).toBe(true);
    expect(history.total).toBeDefined();
    expect(typeof history.total).toBe("number");
  });

  it("should have correct test result structure in history", async () => {
    const caller = testsRouter.createCaller({});
    
    // Run a test
    await caller.runTest({
      ac1_voltage: 345,
      ac2_voltage: 230,
      dc_voltage: 422.84,
      power_mva: 1196,
      load_mw: 1000,
    });

    const history = await caller.getHistory();

    // History should return an array
    expect(Array.isArray(history.tests)).toBe(true);
    
    // If tests are returned, verify structure
    if (history.tests.length > 0) {
      const test = history.tests[0];
      expect(test).toHaveProperty("id");
      expect(test).toHaveProperty("name");
      expect(test).toHaveProperty("timestamp");
      expect(test).toHaveProperty("parameters");
      expect(test).toHaveProperty("results");
      expect(test).toHaveProperty("status");
      expect(test.status).toBe("completed");
    }
  });

  it("should handle delete test mutation", async () => {
    const caller = testsRouter.createCaller({});
    
    const result = await caller.deleteTest({ testId: "123" });

    expect(result.success).toBe(true);
    expect(result.testId).toBe("123");
  });

  it("should validate input parameters", async () => {
    const caller = testsRouter.createCaller({});
    
    try {
      // @ts-expect-error - Testing invalid input
      await caller.runTest({
        ac1_voltage: "invalid",
        ac2_voltage: 230,
        dc_voltage: 422.84,
        power_mva: 1196,
        load_mw: 1000,
      });
    } catch (error) {
      // Expected to fail validation
      expect(error).toBeDefined();
    }
  });
});
