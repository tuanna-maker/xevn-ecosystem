import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const proxyHrmWeb = process.env.VITE_DEV_PROXY_HRM_WEB || 'http://127.0.0.1:8080'
const proxyHrmApi = process.env.VITE_DEV_PROXY_HRM_API || 'http://127.0.0.1:3001'
const proxyXbosApi = process.env.VITE_DEV_PROXY_XBOS_API || 'http://127.0.0.1:3002'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/recharts')) return 'charts-vendor'
          if (id.includes('node_modules/dagre')) return 'workflow-vendor'
          if (id.includes('node_modules')) return 'vendor'
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
    host: true,
    allowedHosts: true,
    port: 5175,
    strictPort: true,
    proxy: {
      '/hr': { target: proxyHrmWeb, changeOrigin: true },
      '/api/hrm': { target: proxyHrmApi, changeOrigin: true },
      '/api/xbos': { target: proxyXbosApi, changeOrigin: true },
    },
  },
})
