import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("HVDC Simulation API", () => {
  it("should run simulation with default parameters", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.simulation.run({
      saveResult: false,
    });

    expect(result.success).toBe(true);
    expect(result.summary).toBeDefined();
    expect(result.summary.converged).toBe(true);
    expect(result.summary.total_generation_mw).toBeGreaterThan(0);
    expect(result.summary.total_load_mw).toBeGreaterThan(0);
    expect(result.summary.efficiency_percent).toBeGreaterThan(90);
    expect(result.summary.efficiency_percent).toBeLessThan(100);
  }, 30000);

  it("should run simulation with custom load", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.simulation.run({
      load_mw: 800,
      saveResult: false,
    });

    expect(result.success).toBe(true);
    expect(result.summary.total_load_mw).toBeCloseTo(800, 1);
  }, 30000);

  it("should return buses data", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.simulation.run({
      saveResult: false,
    });

    expect(result.buses).toBeDefined();
    expect(result.buses.length).toBeGreaterThan(0);
    expect(result.buses[0]).toHaveProperty("name");
    expect(result.buses[0]).toHaveProperty("vm_pu");
    expect(result.buses[0]).toHaveProperty("va_degree");
  }, 30000);

  it("should return transformers data", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.simulation.run({
      saveResult: false,
    });

    expect(result.transformers).toBeDefined();
    expect(result.transformers.length).toBeGreaterThan(0);
    expect(result.transformers[0]).toHaveProperty("name");
    expect(result.transformers[0]).toHaveProperty("loading_percent");
    expect(result.transformers[0]).toHaveProperty("pl_mw");
  }, 30000);

  it("should return DC link data", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.simulation.run({
      saveResult: false,
    });

    expect(result.lines).toBeDefined();
    expect(result.lines.length).toBeGreaterThan(0);
    expect(result.lines[0]).toHaveProperty("name");
    expect(result.lines[0]).toHaveProperty("i_ka");
    expect(result.lines[0]).toHaveProperty("loading_percent");
  }, 30000);

  it("should handle different voltage levels", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.simulation.run({
      ac1_voltage: 350,
      ac2_voltage: 240,
      saveResult: false,
    });

    expect(result.success).toBe(true);
    expect(result.summary.converged).toBe(true);
  }, 30000);
});
