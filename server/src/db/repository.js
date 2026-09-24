import { getDbClient } from './client.js';

let repoInstance = null;

export function getRepository() {
  if (repoInstance) return repoInstance;

  repoInstance = {
    mode: 'db',
    async ensureReady() {
      const client = await getDbClient();
      this.mode = client.type;
      await client.seedVendorsIfEmpty();
    },
    async getVendors() {
      const client = await getDbClient();
      return client.getAllVendors();
    },
    async persistRun({ normalized, status, finalReasoning, draftedMessage, durationMs, steps }) {
      const client = await getDbClient();
      return client.saveRun({
        inputJson: normalized,
        status,
        finalReasoning,
        draftedMessage,
        durationMs,
        steps,
      });
    },
    async listRuns() {
      const client = await getDbClient();
      return client.getAllRuns();
    },
    async getRunById(id) {
      const client = await getDbClient();
      const run = await client.getRunById(id);
      if (!run) return null;
      return {
        run: {
          id: run.run_id,
          submitted_at: run.submitted_at,
          input_json: run.input,
          status: run.status,
          final_reasoning: run.final_reasoning,
          drafted_message: run.drafted_message,
          duration_ms: run.duration_ms,
        },
        steps: run.steps,
      };
    },
    async counts() {
      const client = await getDbClient();
      const vendors = await client.getAllVendors();
      const runs = await client.getAllRuns();
      return { vendors: vendors.length, runs: runs.length };
    },
  };

  return repoInstance;
}
