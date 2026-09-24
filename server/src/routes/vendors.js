import { Router } from 'express';

export function createVendorsRouter(repo) {
  const router = Router();

  router.get('/', async (_req, res) => {
    try {
      const rows = await repo.getVendors();
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
