import postgres from "postgres";
let sqlInstance: ReturnType<typeof postgres> | undefined;
export function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
  if (!sqlInstance) sqlInstance = postgres(process.env.DATABASE_URL, {
    max: 1, idle_timeout: 20, connect_timeout: 10, ssl: "require"
  });
  return sqlInstance;
}