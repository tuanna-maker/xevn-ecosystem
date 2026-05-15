import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const proxyHrmApi = process.env.VITE_DEV_PROXY_HRM_API || "http://127.0.0.1:3001";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
    passWithNoTests: true,
  },
  // Bắt buộc khi nhúng qua web-portal (5175): asset phải nằm dưới /hr/* để proxy tới đúng app HRM,
  // tránh trình duyệt tải /src/main.tsx nhầm sang Vite của portal.
  base: "/hr/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api/hrm': {
        target: proxyHrmApi,
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          reactVendor: ["react", "react-dom", "react-router-dom"],
          queryVendor: ["@tanstack/react-query"],
          supabaseVendor: ["@supabase/supabase-js"],
          chartVendor: ["recharts"],
          pdfVendor: ["html2pdf.js"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
