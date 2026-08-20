/**
 * @CODE-MEMORY
 * Screen: Vite HRM FE (local/dev only)
 * UC: N/A (tooling)
 * BR: N/A
 * SRS: N/A — sponsor TG-INTAKE remove perimeter host from source
 * TechSpec: N/A
 * Purpose: Cấu hình Vite HRM chỉ local + Docker sibling (`hrm-fe`). Proxy Nest `:28001`. Cấm hostname perimeter trong source.
 * WorkItem: D-FE-REMOVE-NIPIO-01
 * Coded: 2026-07-28
 * Callers: `pnpm --filter hrm` / portal proxy `/hr`
 * Callees: Nest `VITE_DEV_PROXY_HRM_API` → 127.0.0.1:28001
 * FEActions: N/A
 * BEChain: N/A
 * Impact: Thêm lại host perimeter → FE phụ thuộc hostname ngoài local/dev.
 * must_keep: Proxy local/dev; `allowedHosts` localhost|127.0.0.1|hrm-fe|xevn-hrm-fe-dev; HOLD_DEPLOY
 * SOLID: Config tách khỏi hostname deploy SoT (Ops).
 * LastVerified: docs/qa/evidence/d-fe-remove-nipio-01-20260728.md
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: D-FE-REMOVE-NIPIO-01
 * Date: 2026-07-28
 * Change: Xóa hostname perimeter khỏi `allowedHosts` mặc định; comment chỉ local/Docker.
 * must_keep: Vite proxy `/api/hrm` → 127.0.0.1:28001; `HRM_VITE_ALLOWED_HOSTS` / `HRM_VITE_ALLOW_ALL_HOSTS` override
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: D-FE-HRM-VITE-HMR-PROXY-01
 * Date: 2026-08-19
 * Change: Docker/VPS (`HRM_VITE_DISABLE_HMR=true`) tắt HMR — iframe :8088/hr không còn WS tới localhost:8080.
 * must_keep: local `pnpm` không set env → HMR overlay:false; cấm hardcode IP perimeter
 */
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createRequire } from "module";
import { componentTagger } from "lovable-tagger";

/**
 * D-UX-C1-ENV-REACT-DEDUPE-01 — single React instance for Vite + @xevn/ui source alias.
 * Workspace hoist can resolve bare `react` → 18.2.0 while `react-dom@18.3.1` peers 18.3.1
 * → Invalid hook call / useEffect null white screen.
 */
const requireFromConfig = createRequire(import.meta.url);
const reactDomDir = path.dirname(requireFromConfig.resolve("react-dom/package.json"));
const reactDir = path.dirname(
  requireFromConfig.resolve("react/package.json", { paths: [reactDomDir] }),
);

/** Local + Docker sibling Host only — portal-fe may send Host `hrm-fe`. */
const hrmAllowedHosts = (
  process.env.HRM_VITE_ALLOWED_HOSTS?.split(",").map((h) => h.trim()).filter(Boolean) ?? [
    "localhost",
    "127.0.0.1",
    "hrm-fe",
    "xevn-hrm-fe-dev",
  ]
) as string[] | true;

/** Docker/VPS: Vite vẫn inject @vite/client khi `hmr: false` → WS localhost:8080. Gỡ script sau inject. */
const disableHrmHmr = process.env.HRM_VITE_DISABLE_HMR === "true";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  /** Khớp deploy HRM_BE_PORT (28001). Local .env thường trỏ :3001 — loadEnv bắt buộc (không đọc process.env). */
  const proxyHrmApi = env.VITE_DEV_PROXY_HRM_API || "http://127.0.0.1:28001";

  return {
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    passWithNoTests: true,
  },
  // Bắt buộc khi nhúng qua web-portal (5175): asset phải nằm dưới /hr/* để proxy tới đúng app HRM,
  // tránh trình duyệt tải /src/main.tsx nhầm sang Vite của portal.
  base: "/hr/",
  server: {
    host: "::",
    port: 8080,
    // Docker portal-fe proxy may send Host: hrm-fe — default Vite blocks unknown hosts with 403.
    allowedHosts:
      process.env.HRM_VITE_ALLOW_ALL_HOSTS === "true" ? true : hrmAllowedHosts,
    // VPS portal :8088 proxies HTTP /hr → hrm-fe:8080; Vite default HMR targets localhost:8080
    // (browser machine) → ERR_CONNECTION_REFUSED. Disable HMR in Docker; keep overlay-off locally.
    hmr: disableHrmHmr
      ? false
      : {
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
  plugins: [
    react(),
    !disableHrmHmr && mode === "development" && componentTagger(),
    disableHrmHmr && {
      name: "xevn-strip-vite-hmr-client",
      apply: "serve" as const,
      transformIndexHtml: {
        order: "post" as const,
        handler(html: string) {
          return html.replace(/<script[^>]*src="[^"]*@vite\/client"[^>]*><\/script>\s*/gi, "");
        },
      },
    },
  ].filter(Boolean),
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-router-dom",
      "@tanstack/react-query",
    ],
  },
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
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Shared VI format SoT (D-UX-VI-FORMAT-SHARED-01) — same as web-portal
      "@xevn/ui": path.resolve(__dirname, "../../../packages/ui/src"),
      // Force same physical copies as react-dom peer (not workspace-hoisted 18.2.0)
      react: reactDir,
      "react-dom": reactDomDir,
    },
  },
  };
});
