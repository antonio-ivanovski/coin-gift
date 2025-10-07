import crypto from "crypto";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Simple waitlist signups table
export const waitlistSignupsTable = sqliteTable("waitlist_signups", {
	id: text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	email: text().notNull().unique(),
	createdAt: int("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});

// Simple donations table - can exist independently of waitlist signups
export const waitlistDonationsTable = sqliteTable("waitlist_donations", {
	id: text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	signupId: text("signup_id").references(() => waitlistSignupsTable.id), // Optional - can be null for standalone donations
	amountSats: int("amount_sats").notNull(),
	status: text().notNull().default("pending"), // pending, paid, expired, cancelled
	paymentHash: text("payment_hash").notNull().unique(),
	createdAt: int("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});
