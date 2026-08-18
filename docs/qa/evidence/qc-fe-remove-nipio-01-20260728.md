# QC-FE-REMOVE-NIPIO-01 — Gate FE remove nip.io (slice only)

**Date:** 2026-07-28  
**Role:** qc  
**work_item_id:** QC-FE-REMOVE-NIPIO-01  
**Upstream:** QA-FE-REMOVE-NIPIO-01 · D-FE-REMOVE-NIPIO-01  
**Locks:** U65 zero-seed · HOLD_DEPLOY · no perimeter · no nginx reload  
**decision:** **GO WITH CONDITIONS** (FE slice only)  
**ack_status:** **PASS_TO_PM**

## Scope adjudicated

| In scope | Out of scope (not this GO) |
|----------|----------------------------|
| `apps/web` source purge of `nip.io` / `14-225-217-232` / `14.225.217.232` | Phase 1 DONE / PROD-READY |
| HRM Vite `allowedHosts` local + Docker sibling only | Perimeter URL UAT / `:8088` claim |
| Portal vite comments + `/hr` proxy local defaults | nginx reload / VPS cutover |
| Local smoke cited by QA (`127.0.0.1:5173/hr/` 200) | Mobile APK embed / device promote |

**NOT Phase 1 DONE. NOT PROD-READY.**

## Evidence pack / process

| Check | Result |
|-------|--------|
| QA evidence readable | **PASS** `docs/qa/evidence/qa-fe-remove-nipio-01-20260728.md` |
| Dev evidence readable | **PASS** `docs/qa/evidence/d-fe-remove-nipio-01-20260728.md` |
| CRUD/J-* minigate pack | **N/A** — tooling host-removal slice (not UF/CRUD wave) |
| Seed in evidence | **None** (U65) |

## Independent QC audit

### 1) Grep `apps/web`

```text
rg -n "nip\.io|14-225-217-232|14\.225\.217\.232" apps/web
→ (no matches) EXIT:1
```

**PASS** — QC re-run confirms zero matches (aligns QA).

### 2) `allowedHosts` (HRM)

File: `apps/web/hrm/vite.config.ts`

Default `hrmAllowedHosts` (no env override):

- `localhost`
- `127.0.0.1`
- `hrm-fe`
- `xevn-hrm-fe-dev`

`server.allowedHosts` / `preview.allowedHosts` use that list unless `HRM_VITE_ALLOW_ALL_HOSTS=true`.  
CODE-MEMORY `must_keep` cites local/Docker + **HOLD_DEPLOY**.

**PASS** — no perimeter hostname in defaults or comments.

### 3) Portal Vite

File: `apps/web/web-portal/vite.config.ts`

- `server.allowedHosts: true` (local allow-all bind) — **no** perimeter hostname string in source.
- `/hr` proxy: `changeOrigin: false`; targets from `VITE_DEV_PROXY_*` (local defaults).
- CODE-MEMORY `must_keep`: HOLD_DEPLOY.

**PASS** for sponsor gate (remove perimeter host from source). Portal allow-all ≠ HRM allowlist — accepted as local-dev tooling, not deploy SoT.

### 4) HOLD_DEPLOY

| Source | HOLD_DEPLOY |
|--------|-------------|
| D-FE evidence | yes |
| QA-FE evidence | yes |
| HRM + portal CODE-MEMORY must_keep | yes |
| Sibling OPS/MOB evidence (coord) | yes (nginx not reloaded; no APK promote) |

**CONFIRMED** — this gate does not authorize deploy/nginx/APK.

### 5) QA smoke (accepted, not re-probed perimeter)

| Probe | Cited | QC note |
|-------|-------|---------|
| `http://127.0.0.1:5173/` | 200 | Local only — OK |
| `http://127.0.0.1:5173/hr/` | 200 | Local only — OK |

No `*.nip.io` / VPS perimeter probe in QA or QC (cấm adhered).

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| Grep zero + allowedHosts local/Docker | PRODUCT closed | Accept |
| Portal `allowedHosts: true` | Process/Info | Accept — local tooling; not perimeter string |
| HOLD_DEPLOY | Process lock | **Condition** — keep |
| OPS/MOB remove-nipio open/partial | Out-of-slice | **Condition** — note only |

## Decision: GO WITH CONDITIONS

**GO WITH CONDITIONS** for **FE web slice only** (`QC-FE-REMOVE-NIPIO-01` / `D-FE-REMOVE-NIPIO-01` / `QA-FE-REMOVE-NIPIO-01`).

### Conditions (bounded)

| ID | Severity | Condition |
|----|----------|-----------|
| C-FE-NIPIO-HOLD-DEPLOY | Process | **HOLD_DEPLOY** remains — no nginx reload, no perimeter promote, no Phase1/PROD claim from this WI. |
| C-FE-NIPIO-OPS-MOB | Info | Sibling lanes still own deploy/mobile SoT: **OPS** QA `qa-ops-remove-nipio-01` PASS_TO_PM (live nginx Info under HOLD); **MOB** `d-mob-remove-nipio-01` still **READY_FOR_QA** (APK rebuild deferred). Closing those lanes is **not** implied by this FE GO. |

### Product residual (FE)

None blocking.

## Not claimed

- Phase 1 DONE / PROD-READY
- Full-program remove-nipio GO
- Perimeter URL / `:8088` UAT PASS
- nginx reload / mobile device promote

## Handoff

- **completion_report:** FE slice gate closed GWC — grep zero, HRM allowedHosts local/Docker only, HOLD_DEPLOY confirmed; OPS/MOB noted open/partial outside this WI.
- **next_owner:** pm
- **evidence_path:** `docs/qa/evidence/qc-fe-remove-nipio-01-20260728.md`
- **ack_status:** PASS_TO_PM

## next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QC-FE-REMOVE-NIPIO-01
from_role: qc
to_role: pm
lane: governance
entry_criteria: QC-FE-REMOVE-NIPIO-01 GO WITH CONDITIONS; evidence docs/qa/evidence/qc-fe-remove-nipio-01-20260728.md
action: Close FE remove-nipio WI on bus; keep HOLD_DEPLOY; do NOT claim Phase1/PROD.
next execution (parallel if quota):
  1) QA-MOB-REMOVE-NIPIO-01 — entry D-MOB READY_FOR_QA docs/qa/evidence/d-mob-remove-nipio-01-20260728.md; grep apps/mobile; assert local/eas host SoT; U65; HOLD_DEPLOY; no APK promote unless sponsor unlocks
  2) QC-OPS-REMOVE-NIPIO-01 — entry QA-OPS PASS_TO_PM docs/qa/evidence/qa-ops-remove-nipio-01-20260728.md; audit source purge + HOLD_DEPLOY (no nginx reload); GWC/GO OPS slice only
cấm: seed; perimeter PASS; Phase1/PROD DONE; nginx reload from this chain
```
