import { Database } from "bun:sqlite";
import { rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { usersTable } from "./schema";

console.log("Using database at:", process.env.DATABASE_URL);
const sqlite = new Database(process.env.DATABASE_URL, { create: true });
export const db = drizzle({ client: sqlite, schema: { users: usersTable } });

export async function applyDbMigrations() {
	migrate(db, {
		migrationsFolder: path.resolve(import.meta.dir, "../../drizzle"),
	});
}
