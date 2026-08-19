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
    // KPI/org UI — cổng 5176 (Unified Portal / Command Center dùng web-portal :5173).
    port: 5176,
    strictPort: true,
    headers: { 'Cache-Control': 'no-store' },
    // XBOS BE binds XBOS_BE_PORT (28002 per deploy/xevn-ecosystem/.env:64 + docker-compose).
    // FE must NOT fetch the BE origin directly — that hits the BE CORS policy. Proxy /api/xbos
    // through Vite (same-origin) instead, matching the HRM FE pattern (proxy /api/hrm → :28001).
    proxy: {
      '/api/xbos': {
        target: process.env.VITE_DEV_PROXY_XBOS_API || 'http://127.0.0.1:3002',
        changeOrigin: true,
      },
    },
  },
});
