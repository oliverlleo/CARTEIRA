import 'server-only';
import { createNeonAuth } from '@neondatabase/auth/next/server';
import { serverEnv } from '@/lib/env';

const env = serverEnv();

export const auth = createNeonAuth({
  baseUrl: env.NEON_AUTH_BASE_URL,
  cookies: { secret: env.NEON_AUTH_COOKIE_SECRET },
  logLevel: 'warn',
});
