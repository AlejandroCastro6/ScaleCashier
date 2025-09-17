// import { Pool, neonConfig } from '@neondatabase/serverless';
// import { drizzle } from 'drizzle-orm/neon-serverless';
// import ws from "ws";
// import * as schema from "@shared/schema";
//
// neonConfig.webSocketConstructor = ws;
//
// if (!process.env.DATABASE_URL) {
//   throw new Error(
//     "DATABASE_URL must be set. Did you forget to provision a database?",
//   );
// }
//
// export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// export const db = drizzle({ client: pool, schema });

// import { Pool, neonConfig } from '@neondatabase/serverless';
// import { drizzle } from 'drizzle-orm/neon-serverless';
import {Pool} from 'pg';
import {drizzle} from 'drizzle-orm/node-postgres';
import { eq } from "drizzle-orm";
// import { schema } from './schema';
import * as schema from "@shared/schema";
import 'dotenv/config'


// neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

type DatabaseWithClient = ReturnType<typeof drizzle> & {
  client: Pool;
  eq: typeof eq;
};

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// export const db = drizzle({ client: pool, schema });
export const db: DatabaseWithClient =  Object.assign(drizzle(pool), { client: pool, schema, eq});
