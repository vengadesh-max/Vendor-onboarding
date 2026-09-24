import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd() + '/..', '');
  const apiPort = env.PORT || '4000';
  const clientPort = Number(env.CLIENT_PORT) || 5173;

  return {
    plugins: [react()],
    envDir: '..',
    server: {
      port: clientPort,
      proxy: {
        '/api': {
          target: env.API_URL || `http://localhost:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
  };
});
