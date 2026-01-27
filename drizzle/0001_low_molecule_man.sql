CREATE TABLE `iff_test_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`testResultId` integer NOT NULL,
	`eventType` text NOT NULL,
	`eventName` text NOT NULL,
	`description` text,
	`severity` text NOT NULL,
	`timestamp` integer NOT NULL,
	`metricValue` real,
	`threshold` real,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `iff_test_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`scenarioId` integer,
	`testName` text NOT NULL,
	`scenarioType` text NOT NULL,
	`executionTime` integer NOT NULL,
	`overallIFFScore` real NOT NULL,
	`systemTrustworthiness` text NOT NULL,
	`dynamicFidelityIndex` real,
	`voltageErrorPercent` real,
	`currentErrorPercent` real,
	`powerErrorPercent` real,
	`frequencyErrorHz` real,
	`estimationErrorPercent` real,
	`measurementUncertaintyPercent` real,
	`communicationLatencyMs` real,
	`overallUncertaintyPercent` real,
	`confidenceLevel` real,
	`agenticDecision` text NOT NULL,
	`decisionConfidence` real,
	`fullResults` text NOT NULL,
	`notes` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `iff_test_scenarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`name` text NOT NULL,
	`description` text,
	`scenarioType` text NOT NULL,
	`parameters` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
