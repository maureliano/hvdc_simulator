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


/**
 * IFF Test Scenarios table
 * Stores test scenario configurations for IFF Framework
 */
export const iffTestScenarios = sqliteTable("iff_test_scenarios", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId"),
  name: text("name").notNull(),
  description: text("description"),
  scenarioType: text("scenarioType").notNull(),
  parameters: text("parameters").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export type IFFTestScenario = typeof iffTestScenarios.$inferSelect;
export type InsertIFFTestScenario = typeof iffTestScenarios.$inferInsert;

/**
 * IFF Test Results table
 * Stores detailed results from IFF Framework evaluations
 */
export const iffTestResults = sqliteTable("iff_test_results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId"),
  scenarioId: integer("scenarioId"),
  testName: text("testName").notNull(),
  scenarioType: text("scenarioType").notNull(),
  executionTime: integer("executionTime").notNull(),
  overallIFFScore: real("overallIFFScore").notNull(),
  systemTrustworthiness: text("systemTrustworthiness").notNull(),
  dynamicFidelityIndex: real("dynamicFidelityIndex"),
  voltageErrorPercent: real("voltageErrorPercent"),
  currentErrorPercent: real("currentErrorPercent"),
  powerErrorPercent: real("powerErrorPercent"),
  frequencyErrorHz: real("frequencyErrorHz"),
  estimationErrorPercent: real("estimationErrorPercent"),
  measurementUncertaintyPercent: real("measurementUncertaintyPercent"),
  communicationLatencyMs: real("communicationLatencyMs"),
  overallUncertaintyPercent: real("overallUncertaintyPercent"),
  confidenceLevel: real("confidenceLevel"),
  agenticDecision: text("agenticDecision").notNull(),
  decisionConfidence: real("decisionConfidence"),
  fullResults: text("fullResults").notNull(),
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export type IFFTestResult = typeof iffTestResults.$inferSelect;
export type InsertIFFTestResult = typeof iffTestResults.$inferInsert;

/**
 * IFF Test Events table
 * Stores individual events and alarms during IFF testing
 */
export const iffTestEvents = sqliteTable("iff_test_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  testResultId: integer("testResultId").notNull(),
  eventType: text("eventType").notNull(),
  eventName: text("eventName").notNull(),
  description: text("description"),
  severity: text("severity").notNull(),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
  metricValue: real("metricValue"),
  threshold: real("threshold"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export type IFFTestEvent = typeof iffTestEvents.$inferSelect;
export type InsertIFFTestEvent = typeof iffTestEvents.$inferInsert;
