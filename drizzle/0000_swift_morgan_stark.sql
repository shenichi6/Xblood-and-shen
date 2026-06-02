CREATE TABLE `arenas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`width` int NOT NULL,
	`height` int NOT NULL,
	`safe_zone_radius` int NOT NULL,
	`fire_ring_damage` int NOT NULL,
	`fire_ring_shrink_speed` decimal(5,2) NOT NULL,
	`obstacles` json NOT NULL DEFAULT ('[]'),
	`background_url` varchar(500),
	`theme` varchar(50),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `arenas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `character_appearances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`character_type` enum('tank','mage','rogue') NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`primary_color` varchar(7) NOT NULL,
	`secondary_color` varchar(7) NOT NULL,
	`accent_color` varchar(7) NOT NULL,
	`sprite_url` varchar(500),
	`icon_url` varchar(500),
	`animation_frames` int DEFAULT 4,
	`animation_speed` decimal(3,2) DEFAULT '1.0',
	`particle_effect_type` varchar(50),
	`glow_intensity` decimal(3,2) DEFAULT '1.0',
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `character_appearances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `character_spell_mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`character_type` enum('tank','mage','rogue') NOT NULL,
	`spell_id` int NOT NULL,
	`slot_index` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `character_spell_mappings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `character_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`character_type` enum('tank','mage','rogue') NOT NULL,
	`max_hp` int NOT NULL,
	`speed` int NOT NULL,
	`attack_power` int NOT NULL,
	`defense` int NOT NULL,
	`spell_power` int NOT NULL,
	`cooldown_reduction` decimal(3,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `character_stats_id` PRIMARY KEY(`id`),
	CONSTRAINT `character_stats_character_type_unique` UNIQUE(`character_type`)
);
--> statement-breakpoint
CREATE TABLE `game_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`session_id` varchar(64) NOT NULL,
	`player1_id` varchar(64) NOT NULL,
	`player2_id` varchar(64),
	`status` enum('waiting','active','completed','abandoned') DEFAULT 'waiting',
	`winner_id` varchar(64),
	`player1_character_type` enum('tank','mage','rogue'),
	`player2_character_type` enum('tank','mage','rogue'),
	`arena_id` int,
	`duration` int,
	`player1_final_hp` int,
	`player2_final_hp` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	CONSTRAINT `game_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `game_sessions_session_id_unique` UNIQUE(`session_id`)
);
--> statement-breakpoint
CREATE TABLE `pickup_definitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('health_potion','mana_potion','spell_powerup','speed_boost') NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`value` int NOT NULL,
	`duration` int,
	`icon_url` varchar(500),
	`particle_color` varchar(7),
	`spawn_weight` decimal(3,2) DEFAULT '1.0',
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pickup_definitions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `spells` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`cooldown` decimal(5,2) NOT NULL,
	`cast_time` decimal(5,2) NOT NULL,
	`range` int NOT NULL,
	`mana_cost` int DEFAULT 0,
	`effects` json NOT NULL,
	`animation_name` varchar(100),
	`sound_effect_url` varchar(500),
	`particle_effect_type` varchar(50),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `spells_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
