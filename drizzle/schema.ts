import { pgTable, serial, varchar, text, doublePrecision, timestamp, integer } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * PostgreSQL version for local development
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 50 }),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Circuit configurations table
 * Stores HVDC circuit parameters and simulation settings
 */
export const circuitConfigs = pgTable("circuit_configs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // AC System parameters
  ac1Voltage: doublePrecision("ac1Voltage").notNull().default(345.0), // kV
  ac2Voltage: doublePrecision("ac2Voltage").notNull().default(230.0), // kV
  dcVoltage: doublePrecision("dcVoltage").notNull().default(422.84), // kV
  powerMva: doublePrecision("powerMva").notNull().default(1196.0), // MVA
  loadMw: doublePrecision("loadMw").notNull().default(1000.0), // MW
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CircuitConfig = typeof circuitConfigs.$inferSelect;
export type InsertCircuitConfig = typeof circuitConfigs.$inferInsert;

/**
 * Simulation results table
 * Stores historical simulation results
 */
export const simulationResults = pgTable("simulation_results", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  circuitConfigId: integer("circuitConfigId"),
  
  // Input parameters
  ac1Voltage: doublePrecision("ac1Voltage").notNull(),
  ac2Voltage: doublePrecision("ac2Voltage").notNull(),
  dcVoltage: doublePrecision("dcVoltage").notNull(),
  loadMw: doublePrecision("loadMw").notNull(),
  
  // Output results
  convergence: integer("convergence").notNull().default(1), // 1 = true, 0 = false
  busAc1VoltageKv: doublePrecision("busAc1VoltageKv"),
  busAc2VoltageKv: doublePrecision("busAc2VoltageKv"),
  busDc1VoltageKv: doublePrecision("busDc1VoltageKv"),
  busDc2VoltageKv: doublePrecision("busDc2VoltageKv"),
  
  transformer1PMw: doublePrecision("transformer1PMw"),
  transformer1QMvar: doublePrecision("transformer1QMvar"),
  transformer2PMw: doublePrecision("transformer2PMw"),
  transformer2QMvar: doublePrecision("transformer2QMvar"),
  
  totalLossMw: doublePrecision("totalLossMw"),
  transformer1Loss: doublePrecision("transformer1Loss"),
  transformer2Loss: doublePrecision("transformer2Loss"),
  
  overallEfficiency: doublePrecision("overallEfficiency"),
  
  executionTimeMs: integer("executionTimeMs"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SimulationResult = typeof simulationResults.$inferSelect;
export type InsertSimulationResult = typeof simulationResults.$inferInsert;

/**
 * IFF Test Results table
 * Stores Physical Fidelity Index test results
 */
export const iffTestResults = pgTable("iff_test_results", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  testName: varchar("testName", { length: 255 }).notNull(),
  scenarioType: varchar("scenarioType", { length: 100 }).notNull(),
  
  // IFF Dimensions (0-1 scale)
  stateFidelity: doublePrecision("stateFidelity").notNull(),
  dynamicsFidelity: doublePrecision("dynamicsFidelity").notNull(),
  energyFidelity: doublePrecision("energyFidelity").notNull(),
  stabilityFidelity: doublePrecision("stabilityFidelity").notNull(),
  overallIFFScore: doublePrecision("overallIFFScore").notNull(),
  
  // System metrics
  systemTrustworthiness: varchar("systemTrustworthiness", { length: 50 }).notNull(),
  agenticDecision: varchar("agenticDecision", { length: 100 }).notNull(),
  
  executionTime: integer("executionTime").notNull(),
  fullResults: text("fullResults"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type IFFTestResult = typeof iffTestResults.$inferSelect;
export type InsertIFFTestResult = typeof iffTestResults.$inferInsert;

/**
 * IFF Test Events table
 * Stores detailed events from IFF tests
 */
export const iffTestEvents = pgTable("iff_test_events", {
  id: serial("id").primaryKey(),
  testResultId: integer("testResultId").notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  metric: varchar("metric", { length: 100 }).notNull(),
  value: doublePrecision("value").notNull(),
  threshold: doublePrecision("threshold"),
  status: varchar("status", { length: 50 }).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IFFTestEvent = typeof iffTestEvents.$inferSelect;
export type InsertIFFTestEvent = typeof iffTestEvents.$inferInsert;

/**
 * Alarm Thresholds table
 * Stores configured thresholds for IFF alarming
 */
export const iffAlarmThresholds = pgTable("iff_alarm_thresholds", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  metricName: varchar("metricName", { length: 100 }).notNull(),
  criticalThreshold: doublePrecision("criticalThreshold").notNull(),
  warningThreshold: doublePrecision("warningThreshold").notNull(),
  enabled: integer("enabled").notNull().default(1),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type IFFAlarmThreshold = typeof iffAlarmThresholds.$inferSelect;
export type InsertIFFAlarmThreshold = typeof iffAlarmThresholds.$inferInsert;

/**
 * Alarm Events table
 * Stores alarm events triggered by threshold violations
 */
export const iffAlarmEvents = pgTable("iff_alarm_events", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  testResultId: integer("testResultId"),
  thresholdId: integer("thresholdId"),
  
  metricName: varchar("metricName", { length: 100 }).notNull(),
  metricValue: doublePrecision("metricValue").notNull(),
  threshold: doublePrecision("threshold").notNull(),
  
  severity: varchar("severity", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  message: text("message"),
  
  acknowledgedAt: timestamp("acknowledgedAt"),
  acknowledgedBy: varchar("acknowledgedBy", { length: 255 }),
  
  resolvedAt: timestamp("resolvedAt"),
  resolvedBy: varchar("resolvedBy", { length: 255 }),
  resolutionNotes: text("resolutionNotes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type IFFAlarmEvent = typeof iffAlarmEvents.$inferSelect;
export type InsertIFFAlarmEvent = typeof iffAlarmEvents.$inferInsert;
