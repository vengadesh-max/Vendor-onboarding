import { SAMPLE_PRESETS } from '../src/samples/presets.js';

const port = process.env.PORT || 4000;
const BASE = process.env.API_BASE || `http://localhost:${port}`;

async function submit(label, data) {
  const res = await fetch(`${BASE}/api/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || res.statusText);
  console.log(`${label}: ${json.status} (run ${json.run_id})`);
  return json;
}

const expected = {
  happy: 'approved',
  name_mismatch: 'pending',
  wrong_tax_format: 'rejected',
  missing_doc: 'pending',
  duplicate: 'rejected',
};

const health = await fetch(`${BASE}/api/health`).then((r) => r.json());
console.log('Health:', health);
if (health.build && health.build !== 'pipeline-v2-doc-precheck') {
  console.warn('Warning: API build may be stale — restart the server on this port.');
}

for (const preset of SAMPLE_PRESETS) {
  const json = await submit(preset.label, preset.data);
  const exp = expected[preset.id];
  if (exp && json.status !== exp) {
    console.error(`  EXPECTED ${exp}, got ${json.status}`);
    process.exitCode = 1;
  }
}

console.log('Smoke test finished.');
