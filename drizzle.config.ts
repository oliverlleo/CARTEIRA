import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não configurada.');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/db/schema.ts',
  out: './drizzle/generated',
  dbCredentials: { url: process.env.DATABASE_URL },
  strict: true,
  verbose: true,
});
