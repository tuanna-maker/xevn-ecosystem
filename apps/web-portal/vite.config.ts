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
      // HRM (base `/hr/`): HTML + HMR + assets đều đi qua prefix này khi nhúng iframe từ portal.
      '/hr': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
