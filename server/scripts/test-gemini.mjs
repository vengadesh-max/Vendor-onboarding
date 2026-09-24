import { loadEnv, getConfig } from '../src/config/env.js';
import { generateContent, isGeminiConfigured } from '../src/llm/geminiClient.js';

loadEnv();

function normalizeKey(raw) {
  const k = (raw || '').trim();
  if (!k) return k;
  const half = k.length / 2;
  if (k.length > 20 && k.slice(0, half) === k.slice(half)) {
    return k.slice(0, half);
  }
  return k;
}

if (process.env.GEMINI_API_KEY) {
  process.env.GEMINI_API_KEY = normalizeKey(process.env.GEMINI_API_KEY);
}

if (!isGeminiConfigured()) {
  console.error('FAIL: GEMINI_API_KEY not set in root .env');
  process.exit(1);
}

const cfg = getConfig();
console.log(`Testing Gemini (${cfg.gemini.model}), interval ${cfg.gemini.minIntervalMs}ms...`);

try {
  const reply = await generateContent(
    'Respond JSON only: {"ok":true}',
    'ping',
    { model: 'gemini-3.6-flash', jsonMode: true, maxRetries: 0, maxOutputTokens: 64 }
  );
  console.log('OK:', reply.slice(0, 200));
} catch (err) {
  console.error('FAIL:', err.message);
  process.exit(1);
}
