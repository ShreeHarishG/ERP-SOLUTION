import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  ACCESS_TOKEN_EXPIRES: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES: z.string().default('7d'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),
  FASTAPI_URL: z.string().optional(),
  FASTAPI_INTERNAL_SECRET: z.string().optional(),
  N8N_WEBHOOK_URL: z.string().optional(),
  CONTROL_TOWER_MODE: z.string().optional(),
  CONTROL_TOWER_WEBHOOK_URL: z.string().optional(),
  CONTROL_TOWER_WEBHOOK_SECRET: z.string().optional(),
  CONTROL_TOWER_OUTGOING_WEBHOOK: z.string().optional(),
  FRONTEND_ORIGIN: z.string().optional(),
  REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

function isBuildPhase() {
  return process.env.NEXT_PHASE === 'phase-production-build';
}

function parseEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('\n');
    const message = `Invalid environment variables:\n${details}`;
    if (isBuildPhase()) {
      console.warn(`[env] ${message}`);
      return {
        NODE_ENV: (process.env.NODE_ENV as 'development' | 'test' | 'production') ?? 'development',
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? 'build-placeholder-access-secret-32ch',
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? 'build-placeholder-refresh-secret-32',
        ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES ?? '15m',
        REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES ?? '7d',
        DATABASE_URL: process.env.DATABASE_URL ?? '',
        DIRECT_URL: process.env.DIRECT_URL,
        FASTAPI_URL: process.env.FASTAPI_URL,
        FASTAPI_INTERNAL_SECRET: process.env.FASTAPI_INTERNAL_SECRET,
        N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,
        CONTROL_TOWER_MODE: process.env.CONTROL_TOWER_MODE,
        CONTROL_TOWER_WEBHOOK_URL: process.env.CONTROL_TOWER_WEBHOOK_URL,
        CONTROL_TOWER_WEBHOOK_SECRET: process.env.CONTROL_TOWER_WEBHOOK_SECRET,
        CONTROL_TOWER_OUTGOING_WEBHOOK: process.env.CONTROL_TOWER_OUTGOING_WEBHOOK,
        FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN,
        REDIS_URL: process.env.REDIS_URL,
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      };
    }
    throw new Error(message);
  }

  const data = parsed.data;
  if (data.NODE_ENV === 'production') {
    if (data.JWT_ACCESS_SECRET.length < 32 || data.JWT_REFRESH_SECRET.length < 32) {
      throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be at least 32 characters in production');
    }
    if (!data.DATABASE_URL) {
      throw new Error('DATABASE_URL is required');
    }
  }

  return data;
}

export const env = parseEnv();
