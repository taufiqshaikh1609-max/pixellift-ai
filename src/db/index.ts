import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

// Local Postgres (127.0.0.1 / localhost) me SSL nahi hota,
// lekin Neon / Supabase / Railway jaise hosted DB me SSL zaroori hai.
const isLocalDb =
  databaseUrl.includes("127.0.0.1") || databaseUrl.includes("localhost");

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    ...(isLocalDb ? {} : { ssl: { rejectUnauthorized: false } }),
    max: 10,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
