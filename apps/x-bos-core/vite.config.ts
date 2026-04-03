import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    // Cổng 5173 trùng thói quen mở `localhost:5173` — tránh xem nhầm bản build cũ trên port khác.
    port: 5173,
    strictPort: true,
    headers: { 'Cache-Control': 'no-store' },
  },
});
