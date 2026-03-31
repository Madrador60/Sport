import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repositoryBasePath = process.env.GITHUB_ACTIONS === 'true' ? '/Sport/' : '/';

export default defineConfig({
  base: repositoryBasePath,
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    open: true,
  },
});
