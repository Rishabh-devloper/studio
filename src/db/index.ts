import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// It's safe to create the client once per process in Next.js App Router
const connectionString = process.env.DATABASE_URL as string;
if (!connectionString) {
  // Do not throw to avoid build-time crashes; runtime usage will fail clearly
  console.warn("DATABASE_URL is not set. Drizzle will not be able to connect.");
}

const sql = connectionString ? neon(connectionString) : undefined as any;

export const db = drizzle({ client: sql, schema });
export { schema };
