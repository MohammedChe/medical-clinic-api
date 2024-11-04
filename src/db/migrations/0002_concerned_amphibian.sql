PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_patients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`date_of_birth` text NOT NULL,
	`address` text NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_patients`("id", "name", "email", "phone", "date_of_birth", "address", "created_at", "updated_at") SELECT "id", "name", "email", "phone", "date_of_birth", "address", "created_at", "updated_at" FROM `patients`;--> statement-breakpoint
DROP TABLE `patients`;--> statement-breakpoint
ALTER TABLE `__new_patients` RENAME TO `patients`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `patients_email_unique` ON `patients` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `patients_phone_unique` ON `patients` (`phone`);