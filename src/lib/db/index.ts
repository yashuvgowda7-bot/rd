import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
console.log('[DB] Initializing Neon connection');
export const db = drizzle(sql, { schema });
