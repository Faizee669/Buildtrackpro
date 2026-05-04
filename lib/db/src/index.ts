import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn(
    "⚠️ DATABASE_URL is not set. The application will start but database queries will fail until it is configured."
  );
}

// Silence pg SSL deprecation warning — Neon requires SSL, so we enforce it explicitly
const connectionString = process.env.DATABASE_URL ?? "";
const isNeon = connectionString.includes("neon.tech");
export const pool = new Pool({ 
  connectionString,
  ssl: isNeon ? { rejectUnauthorized: true } : undefined,
});
export const db = drizzle(pool, { schema });

export * from "./schema";
