import { Router } from 'express';
import { runPipeline } from '../pipeline/orchestrator.js';

export function createSubmitRouter(repo) {
  const router = Router();

  router.post('/', async (req, res) => {
    try {
      const vendors = await repo.getVendors();
      const result = await runPipeline(req.body, vendors);

      const runId = await repo.persistRun({
        normalized: result.normalized,
        status: result.status,
        finalReasoning: result.finalReasoning,
        draftedMessage: result.draftedMessage,
        durationMs: result.durationMs,
        steps: result.steps,
      });

      res.status(201).json({
        run_id: runId,
        status: result.status,
        final_reasoning: result.finalReasoning,
        drafted_message: result.draftedMessage,
        duration_ms: result.durationMs,
        steps: result.steps.map((s, i) => ({ ...s, sequence: i + 1 })),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message || 'Pipeline failed' });
    }
  });

  return router;
}
