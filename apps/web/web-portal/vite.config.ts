import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/recharts')) {
            return 'charts-vendor'
          }
          if (id.includes('node_modules/dagre')) {
            return 'workflow-vendor'
          }
          if (id.includes('node_modules')) {
            return 'vendor'
          }
          return undefined
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@xevn/ui': path.resolve(__dirname, '../../../packages/ui/src'),
    },
  },
  server: {
    port: 5175,
    strictPort: true,
    proxy: {
      // HRM (base `/hr/`): HTML + HMR + assets đều đi qua prefix này khi nhúng iframe từ portal.
      '/hr': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // HRM API gọi cùng origin từ portal/iframe -> proxy sang NestJS.
      '/api/hrm': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/xbos': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
})
