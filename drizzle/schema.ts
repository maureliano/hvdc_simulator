import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, double } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Circuit configurations table
 * Stores HVDC circuit parameters and simulation settings
 */
export const circuitConfigs = mysqlTable("circuit_configs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // AC System parameters
  ac1Voltage: double("ac1Voltage").notNull().default(345.0), // kV
  ac2Voltage: double("ac2Voltage").notNull().default(230.0), // kV
  dcVoltage: double("dcVoltage").notNull().default(422.84), // kV
  powerMva: double("powerMva").notNull().default(1196.0), // MVA
  loadMw: double("loadMw").notNull().default(1000.0), // MW
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CircuitConfig = typeof circuitConfigs.$inferSelect;
export type InsertCircuitConfig = typeof circuitConfigs.$inferInsert;

/**
 * Simulation results table
 * Stores historical simulation results
 */
export const simulationResults = mysqlTable("simulation_results", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  configId: int("configId"),
  
  // Simulation parameters used
  parameters: text("parameters").notNull(), // JSON string
  
  // Results summary
  totalGenerationMw: double("totalGenerationMw"),
  totalLoadMw: double("totalLoadMw"),
  totalLossesMw: double("totalLossesMw"),
  efficiencyPercent: double("efficiencyPercent"),
  converged: int("converged").notNull().default(1), // boolean as int
  
  // Full results JSON
  fullResults: text("fullResults").notNull(), // JSON string with all details
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SimulationResult = typeof simulationResults.$inferSelect;
export type InsertSimulationResult = typeof simulationResults.$inferInsert;
