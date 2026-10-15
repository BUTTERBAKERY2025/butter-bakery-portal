import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const url = process.env.DATABASE_URL;
// Hosted Postgres (Supabase pooler) needs TLS; Supabase signs with its own CA, so encrypt without chain verification.
const needsTls = /supabase\.(co|com)|sslmode=require/.test(url) && !/sslmode=disable/.test(url);
export const pool = new Pool({
  connectionString: url.replace(/[?&]sslmode=[^&]*/g, ""),
  ...(needsTls ? { ssl: { rejectUnauthorized: false } } : {}),
});
export const db = drizzle(pool, { schema });

export * from "./schema";
export * from "./brand-sections";
