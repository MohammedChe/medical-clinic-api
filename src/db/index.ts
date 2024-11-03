import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import env from "@/env";

import * as schema from "./schema";

const client = createClient({
  url: env.DATABASE_URL,
  authToken: env.DATABASE_AUTH_TOKEN,
});

// Also let drizzle know about the schema
// Will update when we add any new tables
// Means anywhere in our codebase we can import db and have access to all our tables
const db = drizzle(client, {
  schema,
});

export default db;
