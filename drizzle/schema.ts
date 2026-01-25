import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

/**
 * Core user table backing auth flow.
 * SQLite version for Google Cloud Shell deployment
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Circuit configurations table
 * Stores HVDC circuit parameters and simulation settings
 */
export const circuitConfigs = sqliteTable("circuit_configs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  
  // AC System parameters
  ac1Voltage: real("ac1Voltage").notNull().default(345.0), // kV
  ac2Voltage: real("ac2Voltage").notNull().default(230.0), // kV
  dcVoltage: real("dcVoltage").notNull().default(422.84), // kV
  powerMva: real("powerMva").notNull().default(1196.0), // MVA
  loadMw: real("loadMw").notNull().default(1000.0), // MW
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export type CircuitConfig = typeof circuitConfigs.$inferSelect;
export type InsertCircuitConfig = typeof circuitConfigs.$inferInsert;

/**
 * Simulation results table
 * Stores historical simulation results
 */
export const simulationResults = sqliteTable("simulation_results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  configId: integer("configId"),
  
  // Simulation parameters used
  parameters: text("parameters").notNull(), // JSON string
  
  // Results summary
  totalGenerationMw: real("totalGenerationMw"),
  totalLoadMw: real("totalLoadMw"),
  totalLossesMw: real("totalLossesMw"),
  efficiencyPercent: real("efficiencyPercent"),
  converged: integer("converged").notNull().default(1), // boolean as int
  
  // Full results JSON
  fullResults: text("fullResults").notNull(), // JSON string with all details
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export type SimulationResult = typeof simulationResults.$inferSelect;
export type InsertSimulationResult = typeof simulationResults.$inferInsert;
