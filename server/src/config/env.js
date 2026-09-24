import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../../..');
const SERVER = path.join(ROOT, 'server');

let loaded = false;

export function loadEnv() {
  if (loaded) return;
  dotenv.config({ path: path.join(ROOT, '.env') });
  dotenv.config({ path: path.join(SERVER, '.env'), override: true });
  loaded = true;
}

export function getConfig() {
  loadEnv();
  const port = Number(process.env.PORT) || 4000;
  const clientPort = Number(process.env.CLIENT_PORT) || 5173;
  return {
    port,
    clientPort,
    clientUrl: process.env.CLIENT_URL || `http://localhost:${clientPort}`,
    apiUrl: process.env.API_URL || `http://localhost:${port}`,
    buildId: process.env.APP_BUILD_ID || 'postgres-gemini-v1',
    databaseUrl: process.env.DATABASE_URL?.trim() || '',
    gemini: {
      minIntervalMs: Number(process.env.GEMINI_MIN_INTERVAL_MS) || 4000,
      maxRetries: Number(process.env.GEMINI_MAX_RETRIES) ?? 1,
      base:
        process.env.GEMINI_API_BASE ||
        'https://generativelanguage.googleapis.com/v1beta',
      model:
        !process.env.GEMINI_MODEL || process.env.GEMINI_MODEL === 'gemini-3.6-flash'
          ? 'gemini-2.0-flash'
          : process.env.GEMINI_MODEL,
    },
  };
}
