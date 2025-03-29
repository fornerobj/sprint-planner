import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import { config } from "dotenv";

config({ path: ".env" }); // or .env.local
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema });
