# P1-INC-P0-HRM-DASH-01-DO-DEPLOY — xbos-api BE-META pilot deploy

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-INC-P0-HRM-DASH-01-DO-DEPLOY` |
| **parent** | `P1-INC-P0-HRM-DASH-01` |
| **from_role** | `devops` |
| **to_role** | `qa` |
| **date** | `2026-06-01` |
| **pilot_url** | `https://14-225-217-232.nip.io` |
| **entry_qa** | `docs/qa/evidence/p1-inc-p0-hrm-dash-01-qa-r2-20260601.md` (FAIL — epoch `asOf` on pilot) |
| **entry_be** | `docs/qa/evidence/p1-inc-p0-hrm-dash-01-be-meta-20260601.md` |
| **ack_status** | **READY_FOR_QA** |

---

## Problem (entry)

QA-R2 on nip.io: `GET /api/xbos/command-center/workspace-meta?tenantId=xevn&companyId=main` still returned **`asOf: 1970-01-01T00:00:00.000Z`**. BE-META fix existed locally (jest PASS) but was **not on VPS** — `origin/main` at `5106a0c` lacks uncommitted BE-META files.

---

## Steps executed

1. **Audit VPS** — `xevn-xbos-be-dev` Up 3h; ports `28002`, `8088` bound; non-xevn containers (asms, tasmos, postgres) Up.
2. **Sync BE-META files** (pscp, no `compose down`):
   - `apps/api/xbos-api/src/command-center/command-center.service.ts`
   - `apps/api/xbos-api/src/command-center/command-center.controller.ts`
   - `apps/api/xbos-api/src/common/xbos-group-legal-scope.ts` (new on VPS)
3. **Restart** `xbos-be` only: `docker compose --env-file .env restart xbos-be` (~90s Nest boot).
4. **Smoke** direct + portal proxy + nip.io workspace-meta probe.

### Deploy note

BE-META is **local-only** (not pushed to `origin/main`). Hot-deploy via pscp + volume mount (`../..:/app`). PM/Dev-BE should commit + push for git-pull parity on next full deploy.

---

## Gate results

| Gate | Result | Evidence |
|------|--------|----------|
| VPS safety (no compose down) | **PASS** | `restart xbos-be` only |
| Non-xevn containers Up | **PASS** | asms_*, tasmos_*, postgres Up |
| L0 direct `:28002/api/xbos/` | **PASS** | HTTP **200** |
| L0 portal `:8088/api/xbos/` | **PASS** | HTTP **200** |
| L0 nip.io `/api/xbos/` | **PASS** | HTTP **200** |
| **workspace-meta `asOf` (nip.io)** | **PASS** | `2026-05-25T04:42:24.224Z` — year **2026**, not epoch |
| Login `ceo@xe.vn` | **PASS** | HTTP **201** |

---

## Smoke outputs

### VPS localhost

```text
direct :28002/api/xbos/ -> HTTP 200
portal :8088/api/xbos/ -> HTTP 200
```

### nip.io probe (`scripts/tmp-p1-inc-p0-hrm-dash-01-qa-r2-probe.mjs`)

```json
{
  "ts": "2026-06-01T04:14:15.922Z",
  "base": "https://14-225-217-232.nip.io",
  "checks": {
    "l0_xbos": { "status": 200, "pass": true },
    "login": { "status": 201, "pass": true, "tenant": "xevn", "company": "main" },
    "workspace_meta": {
      "status": 200,
      "path": "/api/xbos/command-center/workspace-meta?tenantId=xevn&companyId=main",
      "asOf": "2026-05-25T04:42:24.224Z",
      "epoch_fail": false,
      "year": 2026,
      "pass": true
    },
    "l0_hrm": { "status": 200, "pass": true }
  },
  "verdict_api": true
}
```

Exit code: **0** (was **1** pre-deploy in QA-R2).

### Comparison QA-R2 → post-deploy

| Signal | QA-R2 | Post-deploy |
|--------|-------|-------------|
| `data.asOf` | `1970-01-01T00:00:00.000Z` | `2026-05-25T04:42:24.224Z` |
| `epoch_fail` | `true` | `false` |
| `verdict_api` | `false` | `true` |

---

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| Commit + push BE-META to `main` | dev-be / PM | VPS hot-patch only; next `git pull` would revert without merge |
| UI banners (workspace-meta / 1970) | QA-R3 | API fixed; FE first-paint race may still show blue banner — separate P2 if persists |
| Browser L2.5 `/command-center/hrm/dashboard` | QA-R3 | Mandatory retest per exit criteria |

---

## Handoff

- **completion_report:** Deployed BE-META to pilot via pscp + `xbos-be` restart. nip.io `workspace-meta` `asOf` is **2026-05-25** (not epoch). L0 direct/portal/nip.io **200**. Non-xevn containers unaffected. BE-META not yet on `origin/main` — git parity follow-up required.
- **next_owner:** `qa`
- **next_dispatch_prompt:** `work_item_id: P1-INC-P0-HRM-DASH-01-QA-R3 — Retest nip.io https://14-225-217-232.nip.io/command-center/hrm/dashboard as ceo@xe.vn/Xevn@2026 after devops deploy (docs/ops/evidence/p1-inc-p0-hrm-dash-01-do-deploy-20260601.md). Exit: workspace-meta asOf year≥2020 (API probe + UI no 01/01/1970); L2.5 J-HRM-DASH PASS; ack PASS_TO_PM or FAIL with evidence.`
- **evidence_path:** `docs/ops/evidence/p1-inc-p0-hrm-dash-01-do-deploy-20260601.md`
- **ack_status:** **READY_FOR_QA**
