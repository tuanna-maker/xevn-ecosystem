# P1-INC-P0-HRM-DASH-01 — HRM dashboard ReferenceError fix

| Field | Value |
|-------|-------|
| **work_item_id** | P1-INC-P0-HRM-DASH-01 |
| **owner** | Dev-FE |
| **date** | 2026-06-01 |
| **ack_status** | **READY_FOR_QA** |
| **priority** | P0 |

## Before (user screenshot / console)

- URL: `https://14-225-217-232.nip.io/command-center/hrm/dashboard`
- Console: `ReferenceError: isSupabaseConfigured is not defined`
- Stack: `useSubscriptionPlans.ts:35` → `TrialExpiredGuard` → `AppLayout` — white screen / crash before dashboard render.

**Root cause:** `apps/web/hrm/src/hooks/useSubscriptionPlans.ts` used `enabled: isSupabaseConfigured` without import (regression after P1-SUPA-FE-02 strip of `@/integrations/supabase/client` imports).

## After (fix)

- Module-level `const supabaseEnabled = false` (Supabase zero policy; no re-import of supabase client).
- Both `useSubscriptionPlans` and `useActiveSubscriptionPlans` use `enabled: supabaseEnabled`.
- `queryFn` returns `[]` when enabled (defensive; queries stay disabled in portal embed).
- `TrialExpiredGuard` / `AppLayout`: unchanged logic; early `getHrmPortalMode()` return still bypasses trial overlay in embed; hooks no longer throw on mount.

## Files changed

| File | Change |
|------|--------|
| `apps/web/hrm/src/hooks/useSubscriptionPlans.ts` | `supabaseEnabled = false`; fix `enabled` |
| `apps/web/hrm/src/hooks/useSubscriptionPlans.test.ts` | Module import smoke |

## Verification

| Check | Result |
|-------|--------|
| `pnpm --filter vite_react_shadcn_ts test` | exit **0** — vitest **116/116** |
| `pnpm --filter vite_react_shadcn_ts build` | exit **0** |
| `workspace-meta` (portal CC) | **N/A** — lives in `apps/web/web-portal` (`commandCenterWorkspaceApi.ts`); not in HRM bundle; unrelated to this ReferenceError |

## QA smoke (mandatory — browser)

| Step | Expected |
|------|----------|
| Login `ceo@xe.vn` / `Xevn@2026` | PASS |
| Open exact URL `/command-center/hrm/dashboard` (nip.io pilot) | Dashboard renders; employee KPI cards load |
| DevTools Console | **0** red errors; no `isSupabaseConfigured` |
| Network | No calls to `54321`; HRM APIs via `/api/hrm/*` proxy |

**Journey:** J-HRM-DASH (embed dashboard) per `docs/program/PROGRAM_JOURNEY_MAP.md`.

## Residual

- Subscription plan catalog remains disabled until Nest platform-admin API exists (intentional `supabaseEnabled = false`).
