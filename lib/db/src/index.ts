import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
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
