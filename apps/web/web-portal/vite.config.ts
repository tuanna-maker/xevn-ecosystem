import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv reads .env, .env.local, .env.[mode], .env.[mode].local
  // This is necessary to access VITE_* vars in the config file (not just in client code).
  const env = loadEnv(mode, process.cwd(), '')

  /** Trong Docker Compose, sibling services không phải localhost (xem deploy/xevn-ecosystem/docker-compose.yml). */
  const proxyHrmWeb = env.VITE_DEV_PROXY_HRM_WEB || 'http://127.0.0.1:8080'
  /** Khớp deploy/xevn-ecosystem HRM_BE_PORT (28001). Cổ 3001 gây proxy 500 khi API không lắng nghe đó. */
  const proxyHrmApi = env.VITE_DEV_PROXY_HRM_API || 'http://127.0.0.1:28001'
  /** Khớp deploy/xevn-ecosystem XBOS_BE_PORT (28002). Cổ 3002 gây proxy 500 khi API không lắng nghe đó. */
  const proxyXbosApi = env.VITE_DEV_PROXY_XBOS_API || 'http://127.0.0.1:28002'

  return {
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
      // Unified Portal / Command Center — cổng quen thuộc localhost:5173 (x-bos-core chuyển 5176).
      port: 5173,
      strictPort: true,
      proxy: {
        // HRM (base `/hr/`): HTML + HMR + assets đều đi qua prefix này khi nhúng iframe từ portal.
        // Preserve browser Host (nip.io) — changeOrigin would send Host: hrm-fe and trip Vite allowedHosts.
        '/hr': {
          target: proxyHrmWeb,
          changeOrigin: false,
          secure: false,
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
  }
})
