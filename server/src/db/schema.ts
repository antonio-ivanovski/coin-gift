import crypto from "crypto";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users_table", {
	id: int()
		.primaryKey()
		.$defaultFn(() => crypto.randomBytes(8).readInt32BE()),
	name: text().notNull(),
	age: int().notNull(),
	email: text().notNull().unique(),
});
