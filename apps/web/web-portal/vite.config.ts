import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/** Trong Docker Compose, sibling services không phải localhost (xem deploy/xevn-ecosystem/docker-compose.yml). */
const proxyHrmWeb = process.env.VITE_DEV_PROXY_HRM_WEB || 'http://127.0.0.1:8080'
const proxyHrmApi = process.env.VITE_DEV_PROXY_HRM_API || 'http://127.0.0.1:3001'
const proxyXbosApi = process.env.VITE_DEV_PROXY_XBOS_API || 'http://127.0.0.1:3002'

// https://vitejs.dev/config/
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
    // Cho phép Host: <IP VPS> / tên miền khi chạy Vite dev trong Docker — mặc định Vite có thể từ chối hoặc không phục vụ đúng SPA khi truy cập qua IP công cộng.
    // Chỉ dùng cho môi trường dev; production build tĩnh không dùng cấu hình này.
    allowedHosts: true,
    port: 5175,
    strictPort: true,
    proxy: {
      // HRM (base `/hr/`): HTML + HMR + assets đều đi qua prefix này khi nhúng iframe từ portal.
      '/hr': {
        target: proxyHrmWeb,
        changeOrigin: true,
      },
      // HRM API gọi cùng origin từ portal/iframe -> proxy sang NestJS.
      '/api/hrm': {
        target: proxyHrmApi,
        changeOrigin: true,
      },
      '/api/xbos': {
        target: proxyXbosApi,
        changeOrigin: true,
      },
    },
  },
})
