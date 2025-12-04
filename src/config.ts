import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const numberFromEnv = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const firstDefined = (...values: Array<string | undefined>) => values.find((v) => typeof v === 'string' && v.length > 0);

const supabaseServiceKey = firstDefined(
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  process.env.SUPABASE_SERVICE_KEY,
  process.env.SUPABASE_ADMIN_KEY,
);

const supabaseAnonKey = firstDefined(
  process.env.SUPABASE_ANON_KEY,
  process.env.SUPABASE_PUBLIC_ANON_KEY,
  process.env.SUPABASE_PUBLIC_KEY,
  // fall back to SUPABASE_KEY only if no explicit service key envs are set
  (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_KEY)
    ? process.env.SUPABASE_KEY
    : undefined,
);

export const config = {
  port: numberFromEnv(process.env.PORT, 3000),
  viewport: {
    width: numberFromEnv(process.env.VIEWPORT_WIDTH, 1280),
    height: numberFromEnv(process.env.VIEWPORT_HEIGHT, 720),
    deviceScaleFactor: numberFromEnv(process.env.DEVICE_SCALE_FACTOR, 1),
  },
  fullPage: process.env.FULL_PAGE_SCREENSHOT === 'true',
  waitUntil: (process.env.NAVIGATION_WAIT_STATE as 'load' | 'domcontentloaded' | 'networkidle' | undefined) ?? 'networkidle',
  navigationTimeoutMs: numberFromEnv(process.env.NAVIGATION_TIMEOUT_MS, 1200000),
  outputDir: process.env.OUTPUT_DIR ?? path.join(process.cwd(), 'artifacts'),
  pixelmatchThreshold: Number(process.env.PIXELMATCH_THRESHOLD ?? '0.1'),
  headless: process.env.HEADLESS !== 'false',
  postLoadWaitMs: numberFromEnv(process.env.POST_LOAD_WAIT_MS, 2000),
  maxConcurrentRuns: numberFromEnv(process.env.MAX_CONCURRENT_RUNS, 2),
  retentionDays: numberFromEnv(process.env.RETENTION_DAYS, 30),
  s3: {
    bucket: process.env.S3_BUCKET,
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    prefix: process.env.S3_PREFIX ?? '',
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    signedUrlTtlSeconds: numberFromEnv(process.env.S3_SIGNED_URL_TTL_SECONDS, 3600),
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: supabaseServiceKey,
    anonKey: supabaseAnonKey,
    bucket: process.env.SUPABASE_BUCKET ?? 'artifacts',
  },
  googleApiKey: process.env.GOOGLE_API_KEY,
};
