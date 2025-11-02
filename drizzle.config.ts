import { config as dotenvConfig } from "dotenv";
import { existsSync } from "fs";
import { defineConfig } from "drizzle-kit";

// Prefer .env.local if present (common in Next.js projects). Fallback to .env.
if (existsSync(".env.local")) {
  dotenvConfig({ path: ".env.local" });
} else {
  dotenvConfig();
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error(
    "Missing required environment variable DATABASE_URL.\n" +
      "Please set DATABASE_URL in your environment or create a .env.local file with:\n" +
      "DATABASE_URL=postgres://user:password@host:5432/dbname"
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
  verbose: true,
  strict: true,
});
