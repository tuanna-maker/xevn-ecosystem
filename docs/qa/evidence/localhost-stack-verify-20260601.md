# Localhost stack verification — 2026-06-01

**Machine:** dev workstation (agent-run)  
**Verdict:** **ALL PASS** — safe for partner-style UAT on localhost (not nip.io until FE deploy).

## URLs (use these)

| Mục | URL |
|-----|-----|
| **Command Center (chính)** | http://localhost:5173/command-center |
| **HRM → Lương (payroll)** | http://localhost:5173/command-center/hrm/payroll |
| **HRM → Tổng quan** | http://localhost:5173/command-center/hrm/dashboard |
| HRM SPA trực tiếp (debug) | http://localhost:8080/hr/ |

**Đăng nhập:** `ceo@xe.vn` / `Xevn@2026`

## Gates run

```text
pnpm run qc:dev-stack     → exit 0 (HRM 28001, XBOS 28002, portal 5173)
pnpm run qc:fe-be-health  → ALL PASS (login, employees, catalog-sync, proxies)
```

## API spot checks

- `workspace-meta?companyId=main` → `asOf: 2026-05-25T04:42:24.224Z` (not epoch)
- `/command-center/hrm/payroll` → HTTP 200

## Why nip.io still broken for user

Pilot VPS had **xbos-api** hot-patch only; **HRM frontend bundle** on `/hr/` was still pre-fix → `isSupabaseConfigured is not defined`. Local source has fix (`supabaseEnabled = false` in `useSubscriptionPlans.ts`).

## Keep stack running

Terminals must stay up: `hrm-api` (:28001), `xbos-api` (:28002), `pnpm run dev:web` (portal :5173 + HRM :8080).
