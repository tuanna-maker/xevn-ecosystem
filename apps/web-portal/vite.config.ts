import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@xevn/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
  server: {
    port: 5175,
    strictPort: true,
    proxy: {
      // Dev handoff HRM: expose HRM app at portal path `/hrm/*` (web-portal origin).
      // HRM app itself is mounted under `/hr`, so we rewrite prefix.
      '/hrm': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/hrm/, '/hr'),
      },
      // Also proxy `/hr` because HRM HTML may reference assets/routes under its basename `/hr`.
      '/hr': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
