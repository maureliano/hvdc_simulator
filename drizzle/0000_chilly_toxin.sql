CREATE TABLE `circuit_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`ac1Voltage` double NOT NULL DEFAULT 345,
	`ac2Voltage` double NOT NULL DEFAULT 230,
	`dcVoltage` double NOT NULL DEFAULT 422.84,
	`powerMva` double NOT NULL DEFAULT 1196,
	`loadMw` double NOT NULL DEFAULT 1000,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `circuit_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iff_alarm_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`testResultId` int,
	`thresholdId` int,
	`metricName` varchar(100) NOT NULL,
	`metricValue` double NOT NULL,
	`threshold` double NOT NULL,
	`severity` varchar(20) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
	`message` text NOT NULL,
	`acknowledgedAt` timestamp,
	`acknowledgedBy` varchar(255),
	`resolvedAt` timestamp,
	`resolvedBy` varchar(255),
	`resolutionNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `iff_alarm_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iff_alarm_thresholds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`metricName` varchar(100) NOT NULL,
	`criticalThreshold` double NOT NULL,
	`warningThreshold` double NOT NULL,
	`enabled` int NOT NULL DEFAULT 1,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `iff_alarm_thresholds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iff_test_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`testResultId` int NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`eventName` varchar(255) NOT NULL,
	`description` text,
	`severity` varchar(50) NOT NULL,
	`timestamp` timestamp NOT NULL,
	`metricValue` double,
	`threshold` double,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `iff_test_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iff_test_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`scenarioId` int,
	`testName` varchar(255) NOT NULL,
	`scenarioType` varchar(100) NOT NULL,
	`executionTime` int NOT NULL,
	`overallIFFScore` double NOT NULL,
	`systemTrustworthiness` varchar(50) NOT NULL,
	`dynamicFidelityIndex` double,
	`voltageErrorPercent` double,
	`currentErrorPercent` double,
	`powerErrorPercent` double,
	`frequencyErrorHz` double,
	`estimationErrorPercent` double,
	`measurementUncertaintyPercent` double,
	`communicationLatencyMs` double,
	`overallUncertaintyPercent` double,
	`confidenceLevel` double,
	`agenticDecision` varchar(50) NOT NULL,
	`decisionConfidence` double,
	`fullResults` text NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `iff_test_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iff_test_scenarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(255) NOT NULL,
	`description` text,
	`scenarioType` varchar(100) NOT NULL,
	`parameters` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `iff_test_scenarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `simulation_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`configId` int,
	`parameters` text NOT NULL,
	`totalGenerationMw` double,
	`totalLoadMw` double,
	`totalLossesMw` double,
	`efficiencyPercent` double,
	`converged` int NOT NULL DEFAULT 1,
	`fullResults` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `simulation_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(255),
	`loginMethod` varchar(50),
	`role` varchar(20) NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
