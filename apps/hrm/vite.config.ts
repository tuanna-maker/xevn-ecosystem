import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Bắt buộc khi nhúng qua web-portal (5175): asset phải nằm dưới /hr/* để proxy tới đúng app HRM,
  // tránh trình duyệt tải /src/main.tsx nhầm sang Vite của portal.
  base: "/hr/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
