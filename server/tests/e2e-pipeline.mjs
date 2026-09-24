import { loadEnv } from '../src/config/env.js';
import { getRepository } from '../src/db/repository.js';
import { runPipeline } from '../src/pipeline/orchestrator.js';
import { SAMPLE_PRESETS } from '../src/samples/presets.js';

loadEnv();

const expected = {
  happy: 'approved',
  name_mismatch: 'pending',
  wrong_tax_format: 'rejected',
  missing_doc: 'pending',
  duplicate: 'rejected',
};

const repo = getRepository();
await repo.ensureReady();
const vendors = await repo.getVendors();

let failed = 0;
for (const preset of SAMPLE_PRESETS) {
  const result = await runPipeline(preset.data, vendors);
  const exp = expected[preset.id];
  const ok = result.status === exp;
  console.log(`${ok ? 'OK' : 'FAIL'} ${preset.id}: ${result.status} (expected ${exp})`);
  if (!ok) failed++;
}
process.exit(failed ? 1 : 0);
