import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@xyflow/react')) return 'flowVendor';
            if (id.includes('zustand')) return 'stateVendor';
            if (id.includes('react-router-dom')) return 'routerVendor';
            if (id.includes('react') || id.includes('lucide-react') || id.includes('framer-motion')) {
              return 'reactVendor';
            }
            return 'vendor';
          }

          if (id.includes('/src/pages/kpi/')) return 'kpiPages';
          if (id.includes('/src/pages/policy/') || id.includes('/src/pages/MetadataConfigPage')) {
            return 'policyPages';
          }

          if (id.includes('/src/components/flow/') || id.includes('/src/utils/orgFlowLayout')) {
            return 'orgFlow';
          }

          return undefined;
        },
      },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    host: true,
    // Cổng 5173 trùng thói quen mở `localhost:5173` — tránh xem nhầm bản build cũ trên port khác.
    port: 5173,
    strictPort: true,
    headers: { 'Cache-Control': 'no-store' },
  },
});
