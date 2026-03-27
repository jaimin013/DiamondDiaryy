import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Get connection string from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is not set. Please provide your PostgreSQL connection string.",
  );
}

// Create PostgreSQL client
const client = postgres(connectionString);
const db = drizzle(client);

export { db };
