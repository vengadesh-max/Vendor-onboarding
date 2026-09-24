import { loadEnv } from '../src/config/env.js';
import { runPipeline } from '../src/pipeline/orchestrator.js';

loadEnv();

const mockVendor = {
  company_name: 'Sharma Global Exports Ltd',
  country: 'IN',
  tax_id: '22AAAAA0000A1Z5',
  bank_account_number: '9876543210',
  email: 'contact@sharmaglobal.com',
  extracted_bank_holder_name: 'Rajesh Sharma',
  required_documents: ['tax_certificate', 'bank_letter']
};

console.log('⚡ Benchmark: Measuring pipeline latency...');
const started = Date.now();

try {
  const result = await runPipeline(mockVendor, []);
  const duration = Date.now() - started;
  console.log(`✅ Pipeline finished in ${duration}ms (${(duration/1000).toFixed(2)} seconds)!`);
  console.log('Status:', result.status);
  console.log('Final reasoning:', result.finalReasoning);
} catch (err) {
  console.error('Pipeline error:', err.message);
}
