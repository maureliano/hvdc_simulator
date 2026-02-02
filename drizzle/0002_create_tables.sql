CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  "openId" VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  email VARCHAR(255),
  "loginMethod" VARCHAR(50),
  role VARCHAR(20) DEFAULT 'user' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "lastSignedIn" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS circuit_configs (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  "ac1Voltage" DOUBLE PRECISION NOT NULL DEFAULT 345.0,
  "ac2Voltage" DOUBLE PRECISION NOT NULL DEFAULT 230.0,
  "dcVoltage" DOUBLE PRECISION NOT NULL DEFAULT 422.84,
  "powerMva" DOUBLE PRECISION NOT NULL DEFAULT 1196.0,
  "loadMw" DOUBLE PRECISION NOT NULL DEFAULT 1000.0,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS simulation_results (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "circuitConfigId" INTEGER,
  "ac1Voltage" DOUBLE PRECISION NOT NULL,
  "ac2Voltage" DOUBLE PRECISION NOT NULL,
  "dcVoltage" DOUBLE PRECISION NOT NULL,
  "loadMw" DOUBLE PRECISION NOT NULL,
  convergence INTEGER NOT NULL DEFAULT 1,
  "busAc1VoltageKv" DOUBLE PRECISION,
  "busAc2VoltageKv" DOUBLE PRECISION,
  "busDc1VoltageKv" DOUBLE PRECISION,
  "busDc2VoltageKv" DOUBLE PRECISION,
  "transformer1PMw" DOUBLE PRECISION,
  "transformer1QMvar" DOUBLE PRECISION,
  "transformer2PMw" DOUBLE PRECISION,
  "transformer2QMvar" DOUBLE PRECISION,
  "totalLossMw" DOUBLE PRECISION,
  "transformer1Loss" DOUBLE PRECISION,
  "transformer2Loss" DOUBLE PRECISION,
  "overallEfficiency" DOUBLE PRECISION,
  "executionTimeMs" INTEGER,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS iff_test_results (
  id SERIAL PRIMARY KEY,
  "user_id" INTEGER,
  "test_name" VARCHAR(255) NOT NULL,
  "scenario_type" VARCHAR(100) NOT NULL,
  "state_fidelity" DOUBLE PRECISION NOT NULL,
  "dynamics_fidelity" DOUBLE PRECISION NOT NULL,
  "energy_fidelity" DOUBLE PRECISION NOT NULL,
  "stability_fidelity" DOUBLE PRECISION NOT NULL,
  "overall_iff_score" DOUBLE PRECISION NOT NULL,
  "system_trustworthiness" VARCHAR(50) NOT NULL,
  "agentic_decision" VARCHAR(100) NOT NULL,
  "execution_time" INTEGER NOT NULL,
  "full_results" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS iff_test_events (
  id SERIAL PRIMARY KEY,
  "testResultId" INTEGER NOT NULL,
  "eventType" VARCHAR(100) NOT NULL,
  metric VARCHAR(100) NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  threshold DOUBLE PRECISION,
  status VARCHAR(50) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS iff_alarm_thresholds (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER,
  "metricName" VARCHAR(100) NOT NULL,
  "criticalThreshold" DOUBLE PRECISION NOT NULL,
  "warningThreshold" DOUBLE PRECISION NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS iff_alarm_events (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER,
  "testResultId" INTEGER,
  "thresholdId" INTEGER,
  "metricName" VARCHAR(100) NOT NULL,
  "metricValue" DOUBLE PRECISION NOT NULL,
  threshold DOUBLE PRECISION NOT NULL,
  severity VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  message TEXT,
  "acknowledgedAt" TIMESTAMP,
  "acknowledgedBy" VARCHAR(255),
  "resolvedAt" TIMESTAMP,
  "resolvedBy" VARCHAR(255),
  "resolutionNotes" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
