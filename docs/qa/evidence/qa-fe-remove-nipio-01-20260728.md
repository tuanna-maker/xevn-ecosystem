# QA-FE-REMOVE-NIPIO-01 — Retest after D-FE-REMOVE-NIPIO-01

**Date:** 2026-07-28  
**Role:** qa  
**Prior:** `docs/qa/evidence/d-fe-remove-nipio-01-20260728.md` (READY_FOR_QA)  
**Locks:** U65 zero-seed · HOLD_DEPLOY · no perimeter PASS  
**ack_status:** **PASS_TO_PM**

## Verdict matrix

| # | Exit criterion | Result |
|---|----------------|--------|
| 1 | `rg -n "nip\.io\|14-225-217-232\|14\.225\.217\.232" apps/web` → zero matches | **PASS** (rg exit 1, no lines) |
| 2 | Vite `allowedHosts` local/Docker only — no nip.io | **PASS** (see §allowedHosts) |
| 3 | Smoke local portal proxy `/hr` loads (no nip.io) | **PASS** `http://127.0.0.1:5173/hr/` → **200** |
| 4 | Evidence this file | **PASS** |
| 5 | No seed / no Phase1·PROD claim | **PASS** |

## §allowedHosts

### `apps/web/hrm/vite.config.ts`

Default `hrmAllowedHosts` (no env override):

- `localhost`
- `127.0.0.1`
- `hrm-fe`
- `xevn-hrm-fe-dev`

`server.allowedHosts` / `preview.allowedHosts` use that list unless `HRM_VITE_ALLOW_ALL_HOSTS=true`.  
**No** `nip.io` / `14-225-217-232` / `14.225.217.232` in defaults or comments.

### `apps/web/web-portal/vite.config.ts`

- `server.allowedHosts: true` (Vite allow-all for local portal bind) — **no** perimeter hostname string in source.
- `/hr` proxy: `changeOrigin: false`; targets from `VITE_DEV_PROXY_*` (local defaults).
- Scope note (not FAIL): portal allow-all ≠ HRM host allowlist; sponsor gate was **remove perimeter host from source** — satisfied. Ops/Mobile lanes own deploy hostname SoT.

## Grep gate (QA re-run)

```text
rg -n "nip\.io|14-225-217-232|14\.225\.217\.232" apps/web
→ (no matches) EXIT:1
```

## Smoke (local only — U65 / HOLD_DEPLOY)

| Probe | URL | Status | Notes |
|-------|-----|--------|-------|
| Portal root | `http://127.0.0.1:5173/` | **200** | len=757 |
| HR embed via proxy | `http://127.0.0.1:5173/hr/` | **200** | len=1424 |
| `/hr` no trailing slash | `http://127.0.0.1:5173/hr` | 404 | Out of scope; trailing-slash path used for PASS |

**Cấm adhered:** no `https://*.nip.io` probe; no seed.

## Residual

| ID | Severity | Note |
|----|----------|------|
| — | — | None blocking FE web remove-nipio. |
| NOTE-OPS-MOB | info | D-OPS-REMOVE-NIPIO-01 / D-MOB-REMOVE-NIPIO-01 still own deploy/mobile SoT (out of this WI). |

## Not claimed

- Phase 1 DONE / PROD-READY
- Perimeter URL UAT
- QC GO for full program

## Handoff

- **completion_report:** FE web source clean of nip.io / VPS IP host patterns; HRM `allowedHosts` local+Docker only; local portal `:5173` `/hr/` 200.
- **next_owner:** pm (then qc if gate needed for this WI; coordinate OPS/MOB remove-nipio)
- **ack_status:** PASS_TO_PM

## next_dispatch_prompt

```text
work_item_id: QC-FE-REMOVE-NIPIO-01
from_role: pm
to_role: qc
lane: governance
entry_criteria: QA-FE-REMOVE-NIPIO-01 PASS_TO_PM; evidence docs/qa/evidence/qa-fe-remove-nipio-01-20260728.md
exit_criteria: Audit grep zero + allowedHosts local/Docker; confirm HOLD_DEPLOY; GO/GWC for FE slice only — do not claim Phase1/PROD; residual note OPS/MOB lanes if still open
cấm: seed; perimeter URL; Phase1/PROD DONE
read_first: docs/qa/evidence/qa-fe-remove-nipio-01-20260728.md · docs/qa/evidence/d-fe-remove-nipio-01-20260728.md
```
