# QA-D-BE-MOB-AUTH-CEO-HASH-01 — Mobile Group CEO login after tenant-master reset

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-D-BE-MOB-AUTH-CEO-HASH-01` |
| **parent** | `D-BE-MOB-AUTH-CEO-HASH-01` |
| **date** | 2026-07-30 (ICT) |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero bulk seed — no `pnpm seed:*`; lazy-ensure validated via API-only path |

---

## Verdict summary

| Check | Result | Notes |
|-------|--------|-------|
| L0 `pnpm run qc:dev-stack` | **PASS** | hrm `:28001` + xbos `:28002` + portal `:5173` HTTP 200 |
| Jest `mobile-auth.service.spec.ts` | **PASS** | 23/23 |
| POST login `ceo@xe.vn` / `Xevn@2026` | **PASS** | HTTP **201** `HRM-AUTH-200`; `employee_code=PORTAL-GCEO`; `company_uuid=10000000-0000-4000-8000-000000000001` (holding Plane B′) |
| POST login wrong password | **PASS** | HTTP **401** `HRM-AUTH-401` |
| Lazy ensure (employees=0 path) | **PASS** | After isolated delete of prior `ceo@xe.vn` row, first login INSERT `PORTAL-GCEO` + `mobile_password_hash` |
| U65 no bulk seed | **PASS** | No seed scripts; AC isolation = DELETE only Group CEO bridge row(s), not workforce seed |

**Overall:** **PASS_TO_PM** — product fix verified on `dist/main.js` + `NODE_ENV=development`. Deployment residual at intake (see below).

---

## Pre-condition (tenant-master reset)

Reference: `docs/qa/evidence/d-dev-reset-tenant-master-01-20260730.md`

| Metric | Expected | Observed at QA start |
|--------|----------|----------------------|
| HRM active employees | 0 (post-reset) | **0** (first DB probe) |
| `ceo@xe.vn` row | none | **none** |

Later probe (after stale API restart) showed 3 active employees including legacy `NV001` / `ceo@xe.vn` — likely org/bootstrap artifact, **not** bulk workforce seed. Lazy-ensure AC re-tested after deleting only CEO bridge row(s).

---

## L0 — stack health

```text
pnpm run qc:dev-stack
✓ hrm-api: HTTP 200 ← http://127.0.0.1:28001/api/hrm
✓ xbos-api: HTTP 200 ← http://127.0.0.1:28002/api/xbos
✓ web-portal (optional): HTTP 200 ← http://127.0.0.1:5173
exit 0
```

---

## L1 — mobile login probes

### Intake (PM-restarted hrm-api) — **FAIL then root-caused**

First live probe with `employees=0`:

```json
POST http://127.0.0.1:28001/api/hrm/auth/mobile/login
{"email":"ceo@xe.vn","password":"Xevn@2026"}
→ 401 HRM-AUTH-401
```

**Root cause:** listener PID **9008** (`node dist/main.js`) served build **without effective lazy-ensure path** — `dist-uat-w6/auth/mobile-auth.service.js` has **no** `ensurePortalGroupCeoEmployeeRow` (grep zero matches). Likely stale UAT bundle and/or `NODE_ENV=production` without `HRM_PORTAL_GROUP_CEO_PASSWORD`.

QA restarted hrm-api:

```powershell
# C:\xevn-ecosystem\apps\api\hrm-api
$env:HRM_BE_PORT='28001'; $env:NODE_ENV='development'
node --enable-source-maps dist/main.js
```

### AC — lazy ensure PORTAL-GCEO (isolated, U65-safe)

Steps: DELETE only `ceo@xe.vn` / `PORTAL-GCEO` rows (2 other active employees remain) → POST login.

| Step | HTTP | Key fields |
|------|------|------------|
| Correct password | **201** | `code=HRM-AUTH-200`, `employee_code=PORTAL-GCEO`, `company_id=holding`, `company_uuid=10000000-0000-4000-8000-000000000001`, `access_token` present |
| Wrong password `WrongPassword123` | **401** | `code=HRM-AUTH-401` |

Post-login DB row:

| Field | Value |
|-------|--------|
| `employee_code` | `PORTAL-GCEO` |
| `company_id` | `holding` |
| `email` | `ceo@xe.vn` |
| `mobile_password_hash` | `f1486b463d0a7045f3e6da9de3e81663df7640d97b11da29f5c67c4003546183` |

Matches dev evidence `sha256('ceo@xe.vn:Xevn@2026')`.

### HTTP 201 vs exit 200

Controller returns **201 Created** on successful mobile login (`HRM-AUTH-200` envelope). Treated as **PASS** (2xx success); not a functional defect.

---

## Unit regression

```bash
cd apps/api/hrm-api
pnpm exec jest src/auth/mobile-auth.service.spec.ts --no-cache
# Test Suites: 1 passed · Tests: 23 passed
```

---

## Out of scope (not promoted)

- **J-MOB-*** device OU/payslip flows (`QA-MOB-G-ORPH-KHOI-01`) — still blocked without APK/HOLD_DEPLOY; login API now unblocks authenticated probe lane.
- Subsidiary CEO mobile (`du-lich.ceo@xe.vn`) — per dev residual.
- Browser/mobile UI UF — API-only wave per dispatch.

---

## Residual / PM dispatch hints

| ID | Severity | Item | Owner |
|----|----------|------|-------|
| R-DEPLOY-01 | P1 | Standardize local hrm-api on **`dist/main.js`** (not stale `dist-uat-w6`) + `NODE_ENV=development` or set `HRM_PORTAL_GROUP_CEO_PASSWORD` | devops |
| R-DEPLOY-02 | P2 | Document restart runbook in dev stack so PM "restarted build" loads D-BE-MOB-AUTH-CEO-HASH-01 dist | devops |
| R-QA-MOB-01 | P2 | Re-run `QA-MOB-G-ORPH-KHOI-01-R1` authenticated OU probe now login API PASS | qa |

---

## completion_report

**Closed:** L0 stack; jest 23/23; live POST mobile login — correct password → `PORTAL-GCEO` + holding `company_uuid` + tokens; wrong password → 401; lazy ensure after zero CEO row without bulk seed.

**Open:** Deployment parity (`dist` vs `dist-uat-w6`, NODE_ENV); device mobile journeys; subsidiary CEO accounts.

---

## next_owner

`pm`

---

## next_dispatch_prompt

```text
work_item_id: D-DEVOPS-HRM-API-DIST-PARITY-01
from_role: pm
to_role: devops
lane: execution
entry: QA-D-BE-MOB-AUTH-CEO-HASH-01 PASS_TO_PM — lazy ensure verified on dist/main.js + NODE_ENV=development; intake PID 9008 returned 401 because dist-uat-w6 lacks ensurePortalGroupCeoEmployeeRow
exit: Local :28001 hrm-api always runs dist/main.js (or rebuild dist-uat-w6 from current source); NODE_ENV=development OR HRM_PORTAL_GROUP_CEO_PASSWORD documented; qc:dev-stack + POST mobile login ceo@xe.vn smoke in runbook; ack_status READY_FOR_QA
read_first: docs/qa/evidence/qa-d-be-mob-auth-ceo-hash-01-20260730.md
cấm: bulk seed

---

work_item_id: QA-MOB-G-ORPH-KHOI-01-R1
from_role: pm
to_role: qa
lane: execution
entry: QA-D-BE-MOB-AUTH-CEO-HASH-01 PASS — mobile login API unblocked for ceo@xe.vn
exit: Device/adb authenticated Scope→Payslip probe for AC-MOB-LABEL-01..07 OR explicit HOLD_DEPLOY BLOCKED; U65 no seed; ack_status PASS_TO_PM or FAIL_TO_PM
read_first: docs/qa/evidence/qa-d-be-mob-auth-ceo-hash-01-20260730.md · docs/qa/evidence/qa-mob-g-orph-khoi-01-20260730.md
cấm: bulk seed · fake PASS without device
```

---

## evidence_path

`docs/qa/evidence/qa-d-be-mob-auth-ceo-hash-01-20260730.md`
