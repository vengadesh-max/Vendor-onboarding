import { Router } from 'express';

function companyNameFromInput(input_json) {
  if (!input_json) return 'Unknown';
  try {
    const data = typeof input_json === 'string' ? JSON.parse(input_json) : input_json;
    return data.company_name || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

export function createRunsRouter(repo) {
  const router = Router();

  router.get('/', async (_req, res) => {
    try {
      const rows = await repo.listRuns();
      const list = rows.map((r) => ({
        id: r.id,
        company_name: r.company_name || companyNameFromInput(r.input_json),
        submitted_at: r.submitted_at,
        status: r.status,
        duration_ms: r.duration_ms,
      }));
      res.json(list);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid run id' });
    }
    try {
      const detail = await repo.getRunById(id);
      if (!detail) return res.status(404).json({ error: 'Run not found' });

      const { run, steps } = detail;
      const input =
        typeof run.input_json === 'string'
          ? JSON.parse(run.input_json)
          : run.input_json;

      res.json({
        run_id: run.id,
        submitted_at: run.submitted_at,
        status: run.status,
        final_reasoning: run.final_reasoning,
        drafted_message: run.drafted_message,
        duration_ms: run.duration_ms,
        input,
        steps,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
