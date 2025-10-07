CREATE TABLE `waitlist_donations` (
	`id` text PRIMARY KEY NOT NULL,
	`signup_id` text,
	`amount_sats` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`signup_id`) REFERENCES `waitlist_signups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `waitlist_donations_payment_hash_unique` ON `waitlist_donations` (`payment_hash`);--> statement-breakpoint
CREATE TABLE `waitlist_signups` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `waitlist_signups_email_unique` ON `waitlist_signups` (`email`);