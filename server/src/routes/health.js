import { Router } from 'express';
import { getConfig } from '../config/env.js';
import { isGeminiConfigured } from '../llm/geminiClient.js';

export function createHealthRouter(repo, buildId) {
  const router = Router();

  router.get('/', async (_req, res) => {
    try {
      const cfg = getConfig();
      const counts = await repo.counts();

      res.json({
        ok: true,
        build: buildId,
        db: {
          ok: true,
          mode: repo.mode,
          vendors: counts.vendors,
          runs: counts.runs,
          configured: repo.mode === 'postgres' || repo.mode === 'memory',
        },
        gemini: {
          configured: isGeminiConfigured(),
          model: cfg.gemini.model,
          base: cfg.gemini.base,
          minIntervalMs: cfg.gemini.minIntervalMs,
        },
        ui: cfg.clientUrl,
        swagger: '/swagger',
      });
    } catch (err) {
      res.status(503).json({
        ok: false,
        build: buildId,
        db: { ok: false, error: err.message },
      });
    }
  });

  return router;
}
