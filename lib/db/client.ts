import 'server-only';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { serverEnv } from '@/lib/env';
import * as schema from '@/lib/db/schema';

const env = serverEnv();
export const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });
