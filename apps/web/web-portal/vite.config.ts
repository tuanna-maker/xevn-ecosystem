/**
 * @CODE-MEMORY
 * Screen: Vite web-portal (local/dev)
 * UC: N/A (tooling)
 * BR: N/A
 * SRS: N/A — sponsor TG-INTAKE remove perimeter host from source
 * TechSpec: N/A
 * Purpose: Portal Vite proxy `/hr` + `/api/hrm` + `/api/xbos` về localhost/Docker sibling. Không gắn hostname perimeter trong comment/config.
 * WorkItem: D-FE-REMOVE-NIPIO-01
 * Coded: 2026-07-28
 * Callers: `pnpm run dev:web` · portal :5173
 * Callees: HRM web `VITE_DEV_PROXY_HRM_WEB` · Nest HRM/XBOS ports
 * FEActions: N/A
 * BEChain: N/A
 * Impact: `changeOrigin: true` trên `/hr` → Host sai (`hrm-fe`) khi Vite HRM lọc allowedHosts.
 * must_keep: Proxy local/dev; `changeOrigin: false` trên `/hr`; HOLD_DEPLOY
 * SOLID: Host deploy SoT thuộc Ops — FE chỉ local/dev.
 * LastVerified: docs/qa/evidence/d-fe-remove-nipio-01-20260728.md
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: D-FE-REMOVE-NIPIO-01
 * Date: 2026-07-28
 * Change: Comment proxy `/hr` bỏ tham chiếu perimeter; giữ `changeOrigin: false` cho Docker Host `hrm-fe`.
 * must_keep: VITE_DEV_PROXY_* defaults 127.0.0.1
 */
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
      // Local/Docker Vite may receive sibling Host headers — allow all in dev only (static prod build ignores this).
      allowedHosts: true,
      // Unified Portal / Command Center — cổng quen thuộc localhost:5173 (x-bos-core chuyển 5176).
      port: 5173,
      strictPort: true,
      proxy: {
        // HRM (base `/hr/`): HTML + HMR + assets đều đi qua prefix này khi nhúng iframe từ portal.
        // Keep browser Host — changeOrigin would rewrite Host and trip Vite allowedHosts on hrm-fe.
        '/hr': {
          target: proxyHrmWeb,
          changeOrigin: false,
          secure: false,
          ws: true,
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
