CREATE TABLE `circuit_configs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`ac1Voltage` real DEFAULT 345 NOT NULL,
	`ac2Voltage` real DEFAULT 230 NOT NULL,
	`dcVoltage` real DEFAULT 422.84 NOT NULL,
	`powerMva` real DEFAULT 1196 NOT NULL,
	`loadMw` real DEFAULT 1000 NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `simulation_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`configId` integer,
	`parameters` text NOT NULL,
	`totalGenerationMw` real,
	`totalLoadMw` real,
	`totalLossesMw` real,
	`efficiencyPercent` real,
	`converged` integer DEFAULT 1 NOT NULL,
	`fullResults` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text NOT NULL,
	`name` text,
	`email` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	`lastSignedIn` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);