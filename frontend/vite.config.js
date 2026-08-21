import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['farming-researchers-mail-your.trycloudflare.com'],
    port: 5173
  }
});
