import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// DATABASE_USER / DATABASE_PASSWORD, when set, replace the credentials inside DATABASE_URL
// (lets the portal use its own least-privilege role while keeping the host the admin pasted).
// On the Supabase pooler the user is "<role>.<project-ref>"; the ref is kept from the URL.
function withCredentials(raw: string): string {
  const user = process.env.DATABASE_USER;
  const pass = process.env.DATABASE_PASSWORD;
  if (!user && !pass) return raw;
  const u = new URL(raw);
  if (user) {
    const ref = decodeURIComponent(u.username).split(".")[1];
    u.username = encodeURIComponent(ref && !user.includes(".") ? `${user}.${ref}` : user);
  }
  if (pass) u.password = encodeURIComponent(pass);
  return u.toString();
}
const url = withCredentials(process.env.DATABASE_URL);
// Hosted Postgres (Supabase pooler) needs TLS; Supabase signs with its own CA, so encrypt without chain verification.
const needsTls = /supabase\.(co|com)|sslmode=require/.test(url) && !/sslmode=disable/.test(url);
export const pool = new Pool({
  connectionString: url.replace(/[?&]sslmode=[^&]*/g, ""),
  ...(needsTls ? { ssl: { rejectUnauthorized: false } } : {}),
});
export const db = drizzle(pool, { schema });

export * from "./schema";
export * from "./brand-sections";
