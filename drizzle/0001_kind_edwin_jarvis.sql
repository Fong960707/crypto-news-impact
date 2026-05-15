CREATE TABLE `coin_impacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`newsId` int NOT NULL,
	`coinSymbol` varchar(20) NOT NULL,
	`coinName` varchar(100),
	`sentiment` enum('bullish','bearish','neutral') NOT NULL,
	`impactLevel` enum('high','medium','low') NOT NULL,
	`analysis` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coin_impacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`summary` text,
	`content` text,
	`source` varchar(255),
	`sourceUrl` text,
	`category` enum('policy','regulation','geopolitics','market','technology','other') DEFAULT 'other',
	`publishedAt` timestamp NOT NULL,
	`fetchedAt` timestamp NOT NULL DEFAULT (now()),
	`isAnalyzed` boolean NOT NULL DEFAULT false,
	`externalId` varchar(255),
	CONSTRAINT `news_id` PRIMARY KEY(`id`),
	CONSTRAINT `news_externalId_unique` UNIQUE(`externalId`)
);
--> statement-breakpoint
CREATE TABLE `user_coins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`sessionId` varchar(128),
	`coinSymbol` varchar(20) NOT NULL,
	`coinName` varchar(100) NOT NULL,
	`isCustom` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_coins_id` PRIMARY KEY(`id`)
);
