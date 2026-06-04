import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const proxyHrmApi = process.env.VITE_DEV_PROXY_HRM_API || "http://127.0.0.1:3001";

/** Docker portal-fe proxy uses Host `hrm-fe`; HTTPS pilot uses nip.io — both must pass Vite host check. */
const hrmAllowedHosts = (
  process.env.HRM_VITE_ALLOWED_HOSTS?.split(",").map((h) => h.trim()).filter(Boolean) ?? [
    "localhost",
    "127.0.0.1",
    "hrm-fe",
    "xevn-hrm-fe-dev",
    "14-225-217-232.nip.io",
    ".nip.io",
  ]
) as string[] | true;

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
    // Docker portal-fe proxy may send Host: hrm-fe; perimeter uses nip.io — default Vite blocks with 403.
    allowedHosts:
      process.env.HRM_VITE_ALLOW_ALL_HOSTS === "true" ? true : hrmAllowedHosts,
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
  preview: {
    host: "::",
    port: 8080,
    allowedHosts:
      process.env.HRM_VITE_ALLOW_ALL_HOSTS === "true" ? true : hrmAllowedHosts,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          reactVendor: ["react", "react-dom", "react-router-dom"],
          queryVendor: ["@tanstack/react-query"],
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
