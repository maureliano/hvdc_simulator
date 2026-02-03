-- Script para criar todas as tabelas do HVDC Simulator
-- Execute este script no seu PostgreSQL local usando pgAdmin ou psql

-- Drop existing tables if they exist (CUIDADO: isso vai deletar dados!)
DROP TABLE IF EXISTS iff_alarm_events CASCADE;
DROP TABLE IF EXISTS iff_alarm_thresholds CASCADE;
DROP TABLE IF EXISTS iff_test_events CASCADE;
DROP TABLE IF EXISTS iff_test_results CASCADE;
DROP TABLE IF EXISTS simulation_results CASCADE;
DROP TABLE IF EXISTS circuit_configs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  "openId" VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  email VARCHAR(255),
  "loginMethod" VARCHAR(50),
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSignedIn" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create circuit_configs table
CREATE TABLE circuit_configs (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  "ac1Voltage" DOUBLE PRECISION NOT NULL DEFAULT 345.0,
  "ac2Voltage" DOUBLE PRECISION NOT NULL DEFAULT 230.0,
  "dcVoltage" DOUBLE PRECISION NOT NULL DEFAULT 422.84,
  "powerMva" DOUBLE PRECISION NOT NULL DEFAULT 1196.0,
  "loadMw" DOUBLE PRECISION NOT NULL DEFAULT 1000.0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create simulation_results table
CREATE TABLE simulation_results (
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
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create iff_test_results table (CRÍTICA - esta é a tabela que estava faltando)
CREATE TABLE iff_test_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  test_name VARCHAR(255) NOT NULL,
  scenario_type VARCHAR(100) NOT NULL,
  state_fidelity DOUBLE PRECISION NOT NULL,
  dynamics_fidelity DOUBLE PRECISION NOT NULL,
  energy_fidelity DOUBLE PRECISION NOT NULL,
  stability_fidelity DOUBLE PRECISION NOT NULL,
  overall_iff_score DOUBLE PRECISION NOT NULL,
  system_trustworthiness VARCHAR(50) NOT NULL,
  agentic_decision VARCHAR(100) NOT NULL,
  execution_time INTEGER NOT NULL,
  full_results TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create iff_test_events table
CREATE TABLE iff_test_events (
  id SERIAL PRIMARY KEY,
  "testResultId" INTEGER NOT NULL,
  "eventType" VARCHAR(100) NOT NULL,
  metric VARCHAR(100) NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  threshold DOUBLE PRECISION,
  status VARCHAR(50) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create iff_alarm_thresholds table
CREATE TABLE iff_alarm_thresholds (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER,
  "metricName" VARCHAR(100) NOT NULL,
  "criticalThreshold" DOUBLE PRECISION NOT NULL,
  "warningThreshold" DOUBLE PRECISION NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create iff_alarm_events table
CREATE TABLE iff_alarm_events (
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
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_iff_test_results_user_id ON iff_test_results(user_id);
CREATE INDEX idx_iff_test_results_created_at ON iff_test_results(created_at);
CREATE INDEX idx_simulation_results_user_id ON simulation_results("userId");
CREATE INDEX idx_circuit_configs_user_id ON circuit_configs("userId");

-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
