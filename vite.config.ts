import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    base: '/expired-personalization/',

    plugins: [react()],

    server: {
      port: 3033,
      host: '0.0.0.0',
      // (this only affects dev server; preview needs allowedHosts if you use preview)
    },

    preview: {
      port: 3033,
      host: '0.0.0.0',
      allowedHosts: ['data.nextburb.com'],
    },

    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
