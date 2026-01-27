import { sql } from "drizzle-orm";
import { mysqlTable, int, varchar, text, double, timestamp } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * MySQL/TiDB version for cloud deployment
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 50 }),
  role: varchar("role", { length: 20, enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().onUpdateNow(),
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
  updatedAt: timestamp("updatedAt").defaultNow().notNull().onUpdateNow(),
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


/**
 * IFF Test Scenarios table
 * Stores test scenario configurations for IFF Framework
 */
export const iffTestScenarios = mysqlTable("iff_test_scenarios", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  scenarioType: varchar("scenarioType", { length: 100 }).notNull(),
  parameters: text("parameters").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().onUpdateNow(),
});

export type IFFTestScenario = typeof iffTestScenarios.$inferSelect;
export type InsertIFFTestScenario = typeof iffTestScenarios.$inferInsert;

/**
 * IFF Test Results table
 * Stores detailed results from IFF Framework evaluations
 */
export const iffTestResults = mysqlTable("iff_test_results", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  scenarioId: int("scenarioId"),
  testName: varchar("testName", { length: 255 }).notNull(),
  scenarioType: varchar("scenarioType", { length: 100 }).notNull(),
  executionTime: int("executionTime").notNull(),
  overallIFFScore: double("overallIFFScore").notNull(),
  systemTrustworthiness: varchar("systemTrustworthiness", { length: 50 }).notNull(),
  dynamicFidelityIndex: double("dynamicFidelityIndex"),
  voltageErrorPercent: double("voltageErrorPercent"),
  currentErrorPercent: double("currentErrorPercent"),
  powerErrorPercent: double("powerErrorPercent"),
  frequencyErrorHz: double("frequencyErrorHz"),
  estimationErrorPercent: double("estimationErrorPercent"),
  measurementUncertaintyPercent: double("measurementUncertaintyPercent"),
  communicationLatencyMs: double("communicationLatencyMs"),
  overallUncertaintyPercent: double("overallUncertaintyPercent"),
  confidenceLevel: double("confidenceLevel"),
  agenticDecision: varchar("agenticDecision", { length: 50 }).notNull(),
  decisionConfidence: double("decisionConfidence"),
  fullResults: text("fullResults").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IFFTestResult = typeof iffTestResults.$inferSelect;
export type InsertIFFTestResult = typeof iffTestResults.$inferInsert;

/**
 * IFF Test Events table
 * Stores individual events and alarms during IFF testing
 */
export const iffTestEvents = mysqlTable("iff_test_events", {
  id: int("id").autoincrement().primaryKey(),
  testResultId: int("testResultId").notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  eventName: varchar("eventName", { length: 255 }).notNull(),
  description: text("description"),
  severity: varchar("severity", { length: 50 }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  metricValue: double("metricValue"),
  threshold: double("threshold"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IFFTestEvent = typeof iffTestEvents.$inferSelect;
export type InsertIFFTestEvent = typeof iffTestEvents.$inferInsert;

/**
 * IFF Alarm Thresholds table
 * Stores configurable alarm thresholds for IFF score monitoring
 */
export const iffAlarmThresholds = mysqlTable("iff_alarm_thresholds", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  metricName: varchar("metricName", { length: 100 }).notNull(), // e.g., "overallIFFScore", "dynamicFidelityIndex"
  criticalThreshold: double("criticalThreshold").notNull(), // Score below this triggers CRITICAL alarm
  warningThreshold: double("warningThreshold").notNull(), // Score below this triggers WARNING alarm
  enabled: int("enabled").notNull().default(1), // boolean as int
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().onUpdateNow(),
});

export type IFFAlarmThreshold = typeof iffAlarmThresholds.$inferSelect;
export type InsertIFFAlarmThreshold = typeof iffAlarmThresholds.$inferInsert;

/**
 * IFF Alarm Events table
 * Stores alarm events triggered when metrics cross thresholds
 */
export const iffAlarmEvents = mysqlTable("iff_alarm_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  testResultId: int("testResultId"),
  thresholdId: int("thresholdId"),
  metricName: varchar("metricName", { length: 100 }).notNull(),
  metricValue: double("metricValue").notNull(),
  threshold: double("threshold").notNull(),
  severity: varchar("severity", { length: 20, enum: ["WARNING", "CRITICAL"] }).notNull(),
  status: varchar("status", { length: 20, enum: ["ACTIVE", "ACKNOWLEDGED", "RESOLVED"] }).notNull().default("ACTIVE"),
  message: text("message").notNull(),
  acknowledgedAt: timestamp("acknowledgedAt"),
  acknowledgedBy: varchar("acknowledgedBy", { length: 255 }),
  resolvedAt: timestamp("resolvedAt"),
  resolvedBy: varchar("resolvedBy", { length: 255 }),
  resolutionNotes: text("resolutionNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().onUpdateNow(),
});

export type IFFAlarmEvent = typeof iffAlarmEvents.$inferSelect;
export type InsertIFFAlarmEvent = typeof iffAlarmEvents.$inferInsert;
