# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEVOPS-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEVOPS-01` |
| **from_role** | `devops` |
| **to_role** | `qa` |
| **date** | 2026-08-07 |
| **lane** | execution — L0 runtime rebuild (U65 zero-seed) |
| **priority** | P0 |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QA-01` FAIL · stamp `EMPPLATQA-MSIZICMH` |
| **program** | `PO-HRM-CONTINUOUS-W7-20260807` |
| **closes** | `D-EMP-PLT-STALE-DIST` (runtime missing EMP catalog routes) |
| **ack_status** | **`READY_FOR_QA`** |
| **stamp** | `EMPPLATDEVOPS-MSIZICMH` |
| **machine JSON** | `_tmp-po-hrm-dynamic-config-platform-emp-devops-01.json` |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`hrm_personnel_uat_ready`** | **`false`** | **DENIED** flip |
| **`employees_e2e_linkage_ready`** | **`false`** | **DENIED** flip |
| **`payroll_e2e_ready` / attendance / recruitment** | **`false`** | **DENIED** flip |
| **Seed** | **DENIED** | U65 · no `pnpm seed:*` |
| **LIST-TOTALS / CTR GWC seats** | **must_keep** | not reopened |
| **FE Settings pickers** | **HOLD** | do not dispatch FE until L1 PASS |

---

## Mission

Rebuild + restart `hrm-api` single listener `:28001` so live `dist` includes EMP platform catalog:

- `emp-document-type.service.js` / `emp-employment-type.service.js`
- Controller routes: `document-types*`, `employment-types*`, `effective`, `retire`

---

## Steps executed

| # | Action | Result |
|---|--------|--------|
| 1 | Audit `:28001` | Single listener PID **16152** · `node dist/main` · **stale** |
| 2 | Compare src vs dist | SRC has `document-types` (8) + `emp-*-type.service.ts` · DIST **MISSING** both services · controller **0** `document-types` matches |
| 3 | Stop stale process | `Stop-Process 16152` · port **28001 free** |
| 4 | `pnpm run build:clean` (hrm-api) | **exit 0** · DIST mtime **20:37:48–20:37:50** · both services emit · controller **7** `document-types` / **7** `employment-types` |
| 5 | Restart listener | Single PID **25408** · start **20:38:01** (≥ dist) · `GET /api/hrm` **200** |
| 6 | Duplicate check | **Listener count = 1** process (IPv4+IPv6 same PID) |
| 7 | Harden spine | `verify-dist.mjs` `DIST_SPINE` += `emp-document-type` + `emp-employment-type` · `verify-dist` exit **0** |
| 8 | `pnpm run qc:dev-stack` | HRM + XBOS + portal **HTTP 200** (Windows `UV_HANDLE_CLOSING` exit noise — ignore) |
| 9 | `pnpm run qc:fe-be-health` | **ALL PASS** exit **0** |

---

## Dist verification (post-build)

| Artifact | Status |
|----------|--------|
| `dist/employees/emp-document-type.service.js` | **EXISTS** · 20:37:48 |
| `dist/employees/emp-employment-type.service.js` | **EXISTS** · 20:37:48 |
| `dist/employees/employees.controller.js` | `document-types`×7 · `employment-types`×7 · `effective`/`retire` present |

---

## Unauth smoke (exit criteria)

| Check | Expected | Actual | Verdict |
|-------|----------|--------|---------|
| `GET …/document-types?company_id=holding` | **401** (not 500 UUID) | **401** `HRM-AUTH-001` | **PASS** |
| `GET …/document-types/effective?company_id=holding` | **401** (not 404) | **401** `HRM-AUTH-001` | **PASS** |
| `GET …/employment-types?company_id=holding` | **401** | **401** `HRM-AUTH-001` | **PASS** |
| `GET …/employment-types/effective?company_id=holding` | **401** (not 404) | **401** `HRM-AUTH-001` | **PASS** |
| `POST …/document-types` (empty body) | not **404** | **400** `HRM-VAL-001` (route registered) | **PASS** (route present) |
| Health | 200 | **200** `HRM-HEALTH-200` | **PASS** |

**Before (QA FAIL):** list → **500** `uuid: "document-types"`; effective/POST → **404**.

---

## Gate table

| Gate | Result |
|------|--------|
| Rebuild dist ≥ BE-01 source | **PASS** (20:37:50) |
| Single `:28001` listener | **PASS** (PID 25408) |
| Unauth catalog → 401 not 500/404 | **PASS** |
| `qc:dev-stack` services 200 | **PASS** (UV exit noise ignored) |
| `qc:fe-be-health` | **PASS** |
| Seed / honesty flip / LIST-TOTALS·CTR reopen | **DENIED** |

---

## Residual

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **AC-PLT-EMP 1–7** | P0 product | **qa** retest | Runtime defect closed; QA owns full L1 matrix `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QA-01` |
| R-PLT-EMP-FE | HOLD | after L1 PASS | Settings pickers — **do not** dispatch FE yet |
| Honesty flags | LOCKED false | — | unchanged |

---

## completion_report

**Closed:** `D-EMP-PLT-STALE-DIST` — `build:clean` emitted EMP catalog services; single `:28001` listener restarted; unauth list/effective return **401** (not 500/404); POST catalog not 404; `qc:fe-be-health` ALL PASS; spine gate extended.

**Residual:** Full AC 1–7 authenticated L1 still for QA; FE HOLD until L1 PASS; no honesty flip.

**Forbidden claims:** personnel UAT · employees e2e linkage · browser UF · Phase1 DONE · LIST-TOTALS/CTR reopen.

---

## Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **`READY_FOR_QA`** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-devops-01.md` |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-devops-01.json` |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QA-01
from_role: pm
to_role: qa
priority: P0
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEVOPS-01 READY_FOR_QA (closes D-EMP-PLT-STALE-DIST)
program: PO-HRM-CONTINUOUS-W7-20260807
stamp_ref: EMPPLATDEVOPS-MSIZICMH · prior FAIL EMPPLATQA-MSIZICMH

entry_criteria:
- L0: hrm-api :28001 healthy; unauth GET document-types|employment-types (+ /effective) → 401 not 500/404
- evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-devops-01.md
- U65 zero-seed · no honesty flip · browser UF HOLD · do not reopen LIST-TOTALS / CTR GWC

task: Retest L1 AC 1–7 (document-types / employment-types create, normalize, effective emp_override, retire, scope_parity, FORBIDDEN hard-delete) per prior QA script/matrix.
exit_criteria: PASS_TO_PM or FAIL_TO_PM with evidence; Do NOT dispatch FE until L1 PASS.
```
