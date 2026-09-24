import { getConfig, loadEnv } from './config/env.js';
import { createApp } from './app.js';

loadEnv();
const cfg = getConfig();

const app = await createApp();
const port = cfg.port;

const server = app.listen(port, () => {
  console.log(`Vendor onboarding API on http://localhost:${port} (${cfg.buildId})`);
  console.log(`  Swagger: http://localhost:${port}/swagger`);
  console.log(`  UI: ${cfg.clientUrl}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} in use — change PORT in .env or stop other Node processes.`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
