# P1-INC-P0-HRM-DASH-01-DO-FE-DEPLOY — HRM Vite + portal pilot deploy

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-INC-P0-HRM-DASH-01-DO-FE-DEPLOY` |
| **parent** | `P1-INC-P0-HRM-DASH-01` |
| **from_role** | `devops` |
| **to_role** | `qa` |
| **date** | `2026-06-01` |
| **pilot_url** | `https://14-225-217-232.nip.io` |
| **VPS HEAD (git)** | `15a3cbe` |
| **ack_status** | **READY_FOR_QA** |

---

## Problem (entry)

User still saw **`isSupabaseConfigured`** on nip.io `/hr/` after BE hot-patch. `origin/main` at pull had **15a3cbe** (xbos workspace-meta) but **HRM FE P1-SUPA-FE-02** was **not merged to main** — VPS still served old hooks + Vite without `allowedHosts` for nip.io (403 on `/hr/`).

---

## Steps executed

1. **Audit VPS** — xevn containers Up; non-xevn (asms, tasmos, postgres) unaffected.
2. **`git pull origin main`** on `/opt/xevn-ecosystem` → **15a3cbe** (xbos BE-META + `xbos-group-legal-scope.ts`).
3. **`merge-vps-port-env.mjs --apply-canonical`** — ports unchanged (8088/8080/3001/28002).
4. **`docker compose up -d --build`** — hrm-fe, portal-fe, hrm-be, xbos-be (no `compose down`).
5. **FE hot-sync (pscp)** — P0 supabase strip not on main:
   - `apps/web/hrm/src/integrations/supabase/client.ts`
   - `apps/web/hrm/src/hooks/useSubscriptionPlans.ts` (+ test)
   - `apps/web/hrm/src/hooks/useCompanySubscription.ts`, `usePermissions.ts`, `usePlatformAdmin.ts`
   - `apps/web/hrm/vite.config.ts` (`allowedHosts` + `.nip.io`)
6. **BE compile fix** — `15a3cbe` failed until `scope-context.ts` synced (adds `normalizePortalScopeRequest`); restart **xbos-be** → L0 200.
7. **AuthContext** — reverted to **git HEAD** on VPS (local copy required missing `hrmListScope`); supabase guard uses synced `client.ts` (`isSupabaseConfigured = false`).
8. **Restart** `hrm-fe`, `portal-fe`, `xbos-be`; smoke after ~30–50s boot.

### Safety

- No `docker compose down`
- No stop/rm non-`xevn-` containers

---

## Gate results

| Gate | Result | Evidence |
|------|--------|----------|
| VPS safety | **PASS** | targeted restart / up only |
| Non-xevn Up | **PASS** | asms_*, tasmos_* Up |
| Git BE on pilot | **PASS** | HEAD `15a3cbe` |
| L0 HRM `:3001/api/hrm/metrics` | **PASS** | HTTP 200 |
| L0 XBOS `:28002` + portal proxy | **PASS** | HTTP 200 |
| nip.io `/hr/` (Vite) | **PASS** | HTTP **200** (was 403 pre-`vite.config`) |
| HRM module `useSubscriptionPlans` | **PASS** | served `supabaseEnabled = false`; no `enabled: isSupabaseConfigured` |
| nip.io API probe | **PASS** | `verdict_api: true`; workspace-meta `asOf` 2026 |
| Crash strings in `/hr/` HTML | **PASS** | no `isSupabaseConfigured is not defined` |

---

## Smoke outputs

### FE bundle (`scripts/tmp-fe-deploy-hr-smoke.mjs`)

```json
{
  "checks": {
    "hr_status": 200,
    "module_has_supabaseEnabled": true,
    "module_undefined_ref": false,
    "crash_isSupabaseConfigured": false
  },
  "pass": true
}
```

### API (`scripts/tmp-p1-inc-p0-hrm-dash-01-qa-r2-probe.mjs`)

```json
{
  "workspace_meta": {
    "asOf": "2026-05-25T04:42:24.224Z",
    "epoch_fail": false,
    "pass": true
  },
  "verdict_api": true
}
```

---

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| **Push FE + scope-context to `main`** | dev-be / dev-fe / PM | Pilot uses pscp hot-sync; `git pull` alone does **not** ship P1-SUPA-FE-02 |
| **15a3cbe incomplete on main** | dev-be | Needs `scope-context.ts` with `normalizePortalScopeRequest` in same commit/PR |
| Browser L2.5 `/command-center/hrm/dashboard` | QA | Mandatory UI retest after FE deploy |
| `deploy-dev-server.ps1` plink quoting | devops | Base64 remote script failed EOF; used direct plink/pscp this wave |

---

## Handoff

- **completion_report:** Pulled **15a3cbe** on VPS; synced HRM FE supabase strip + `vite.config` allowedHosts; fixed xbos-be compile with `scope-context.ts`; nip.io `/hr/` **200** and Vite serves `supabaseEnabled = false`. L0 API probe **PASS**. Non-xevn containers safe.
- **next_owner:** `qa`
- **next_dispatch_prompt:** `work_item_id: P1-INC-P0-HRM-DASH-01-QA-R4 — Retest https://14-225-217-232.nip.io/command-center/hrm/dashboard as ceo@xe.vn/Xevn@2026 after DO-FE-DEPLOY (docs/ops/evidence/p1-inc-p0-hrm-dash-01-do-fe-deploy-20260601.md). Exit: DevTools no ReferenceError isSupabaseConfigured; dashboard renders; workspace-meta asOf year≥2020; L2.5 J-HRM-DASH PASS; ack PASS_TO_PM or FAIL with screenshot.`
- **evidence_path:** `docs/ops/evidence/p1-inc-p0-hrm-dash-01-do-fe-deploy-20260601.md`
- **ack_status:** **READY_FOR_QA**
