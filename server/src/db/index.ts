import { Database } from "bun:sqlite";
import path from "node:path";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { usersTable } from "./schema";

if (!process.env.DB_FILE_NAME) throw new Error("DB_FILE_NAME is not set");

const sqlite = new Database(process.env.DB_FILE_NAME);
export const db = drizzle({ client: sqlite, schema: { users: usersTable } });

export async function applyDbMigrations() {
	migrate(db, {
		migrationsFolder: path.resolve(import.meta.dir, "../drizzle"),
	});
}
