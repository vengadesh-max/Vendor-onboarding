import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { getConfig, loadEnv } from './config/env.js';
import { getRepository } from './db/repository.js';
import { createSubmitRouter } from './routes/submit.js';
import { createRunsRouter } from './routes/runs.js';
import { createVendorsRouter } from './routes/vendors.js';
import { createHealthRouter } from './routes/health.js';
import { openApiSpec } from './openapi.js';

loadEnv();
const cfg = getConfig();

export async function createApp() {
  const repo = getRepository();
  await repo.ensureReady();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/swagger.json', (_req, res) => {
    res.json({
      ...openApiSpec,
      servers: [{ url: cfg.apiUrl, description: 'API' }],
    });
  });
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.get('/', (_req, res) => {
    res.json({
      service: 'vendor-onboarding-api',
      build: cfg.buildId,
      ui: cfg.clientUrl,
      swagger: '/swagger',
      health: '/api/health',
      db: repo.mode,
    });
  });

  app.use('/api/health', createHealthRouter(repo, cfg.buildId));
  app.use('/api/submit', createSubmitRouter(repo));
  app.use('/api/runs', createRunsRouter(repo));
  app.use('/api/vendors', createVendorsRouter(repo));

  return app;
}
