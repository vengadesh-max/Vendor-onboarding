import { getConfig, loadEnv } from '../src/config/env.js';
import { SAMPLE_PRESETS } from '../src/samples/presets.js';

loadEnv();
const BASE = process.env.API_BASE || getConfig().apiUrl;

function log(title, obj) {
  console.log(`\n=== ${title} ===`);
  console.log(typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2));
}

const health = await fetch(`${BASE}/api/health`).then((r) => r.json());
log('Health', health);

const swagger = await fetch(`${BASE}/swagger/`).then((r) => ({
  status: r.status,
  ok: r.ok,
  contentType: r.headers.get('content-type'),
}));
log('Swagger UI', swagger);

const root = await fetch(`${BASE}/`).then((r) => r.json());
log('API root', root);

const mismatch = SAMPLE_PRESETS.find((p) => p.id === 'name_mismatch');
const submitRes = await fetch(`${BASE}/api/submit`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(mismatch.data),
});
const submit = await submitRes.json();
log('Submit (name mismatch)', {
  status: submit.status,
  run_id: submit.run_id,
  final_reasoning: submit.final_reasoning,
  semantic_steps: submit.steps?.filter((s) => s.stage === 'semantic'),
  drafted_message: submit.drafted_message?.slice(0, 200),
});

if (health.gemini?.configured) {
  const hasLlmReasoning = submit.steps?.some(
    (s) => s.step_name === 'name_match_check' && s.detail.includes('LLM:')
  );
  console.log(`\nGemini name-match step used LLM: ${hasLlmReasoning ? 'yes' : 'no (fuzzy or fallback)'}`);
} else {
  console.log('\nGemini: GEMINI_API_KEY not set in server/.env — semantic steps use fuzzy/fallback only.');
}

const runs = await fetch(`${BASE}/api/runs`).then((r) => r.json());
log('Runs count', runs.length);
