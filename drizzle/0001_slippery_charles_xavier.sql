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
