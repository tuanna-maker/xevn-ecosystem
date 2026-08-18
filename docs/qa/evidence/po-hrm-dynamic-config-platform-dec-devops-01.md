# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DEVOPS-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DEVOPS-01` |
| **from_role** | `devops` |
| **to_role** | `qa` |
| **date** | 2026-08-07 |
| **lane** | execution — L0 runtime rebuild (U65 zero-seed) |
| **priority** | P0 |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QA-01` FAIL · stamp `DECPLATQA-MSJ14FCK` |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **closes** | `D-DEC-PLT-STALE-DIST` (runtime missing F-DEC-CAT routes / `hr-decision-type.*`) |
| **ack_status** | **`READY_FOR_QA`** |
| **stamp** | `DECPLATDEVOPS-MSJ1K9XZ` |
| **machine JSON** | `_tmp-po-hrm-dynamic-config-platform-dec-devops-01.json` |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`hrm_personnel_uat_ready`** | **`false`** | **DENIED** flip |
| **`employees_e2e_linkage_ready`** | **`false`** | **DENIED** flip |
| **`payroll_e2e_ready` / attendance / recruitment** | **`false`** | **DENIED** flip |
| **Seed** | **DENIED** | U65 · no `pnpm seed:*` |
| **FE Settings / DEC pickers** | **HOLD** | do not dispatch FE until L1 PASS |

---

## Mission

Rebuild + restart `hrm-api` single listener `:28001` so live `dist` includes DEC platform catalog:

- `hr-decision-type.service.js` / `.constants.js` / `dto/hr-decision-type.dto.js`
- Controller routes: `decision-types`, `decision-types/effective`, CRUD + retire

---

## Steps executed

| # | Action | Result |
|---|--------|--------|
| 1 | Audit `:28001` | Listener PID **25408** · `node dist/main` · **stale** (controller mtime **20:37:56** vs src **21:08**) |
| 2 | Pre-fix probe | `GET …/decision-types` → **401** · `GET …/decision-types/effective` → **404** Cannot GET · dist **missing** `hr-decision-type.*` |
| 3 | Harden spine | `verify-dist.mjs` `DIST_SPINE` += `hr-decision-type.service/constants/dto` |
| 4 | `pnpm --filter hrm-api run build:clean` | **exit 0** · emit mtime **21:21:27** · controller **7** `decision-types*` matches incl. `/effective` |
| 5 | Stop stale tree | Stop PID **25408** (+ nest/pnpm wrappers) · port free |
| 6 | Restart listener | `start:prod` boot **21:22:03** → routes mapped · later single PID **25416** start **21:22:53** (≥ dist) · `GET /api/hrm` **200** |
| 7 | Duplicate check | **Listener count = 1** process (IPv4+IPv6 same PID **25416**) |
| 8 | `pnpm run qc:dev-stack` | HRM + XBOS + portal **HTTP 200** (Windows `UV_HANDLE_CLOSING` exit noise — ignore) |
| 9 | `pnpm run qc:fe-be-health` | **ALL PASS** exit **0** |

---

## Dist verification (post-build)

| Artifact | Status |
|----------|--------|
| `dist/decisions/hr-decision-type.service.js` | **EXISTS** · 21:21:27 |
| `dist/decisions/hr-decision-type.constants.js` | **EXISTS** · 21:21:27 |
| `dist/decisions/dto/hr-decision-type.dto.js` | **EXISTS** · 21:21:27 |
| `dist/decisions/decisions.controller.js` | `decision-types/effective` + `decision-types` + CRUD/retire (**7** matches) |

---

## Unauth smoke (exit criteria)

| Check | Expected | Actual | Verdict |
|-------|----------|--------|---------|
| `GET …/decision-types?company_id=holding` | **401/403** (not 404) | **401** `HRM-AUTH-001` Unauthorized decisions access | **PASS** |
| `GET …/decision-types/effective?company_id=holding` | **401/403** (not 404) | **401** `HRM-AUTH-001` | **PASS** |
| `GET …/decision-types` (no query) | not **404** | **400** `HRM-VAL-001` (DTO; route registered) | **PASS** (route present) |
| `GET …/decision-types/effective` (no query) | not **404** | **400** `HRM-VAL-001` | **PASS** (route present) |
| Health | 200 | **200** `HRM-HEALTH-200` | **PASS** |

**Before (QA FAIL stamp `DECPLATQA-MSJ14FCK`):** L0 `/api/hrm` 200 · `…/effective` → **404** · dist missing `hr-decision-type.*` · EMP-class stale dist.

---

## Gate table

| Gate | Result |
|------|--------|
| Rebuild dist ≥ DEC BE/src | **PASS** (21:21:27 ≥ src 21:08) |
| Single `:28001` listener | **PASS** (PID 25416) |
| Unauth list + effective → 401 not 404 | **PASS** |
| `qc:dev-stack` services 200 | **PASS** (UV exit noise ignored) |
| `qc:fe-be-health` | **PASS** |
| Seed / honesty flip / FE Settings | **DENIED** |

---

## Residual

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **AC-PLT-DEC L1 matrix** | P0 product | **qa** retest | Runtime defect closed; QA owns full L1 `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QA-01` |
| R-PLT-DEC-FE | HOLD | after L1 PASS | Settings pickers — **do not** dispatch FE yet |
| Honesty flags | LOCKED false | — | unchanged |

---

## completion_report

**Closed:** `D-DEC-PLT-STALE-DIST` — `build:clean` emitted `hr-decision-type.*`; controller registers F-DEC-CAT routes including `/effective`; single `:28001` listener restarted; unauth list+effective return **401** (not 404); spine gate extended; `qc:fe-be-health` ALL PASS.

**Residual:** Full authenticated L1 AC still for QA; FE HOLD until L1 PASS; no honesty flip.

**Forbidden claims:** personnel UAT · DEC browser UF · Phase1 DONE · FE Settings.

---

## Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **`READY_FOR_QA`** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-dec-devops-01.md` |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-dec-devops-01.json` |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QA-01
from_role: pm
to_role: qa
priority: P0
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DEVOPS-01 READY_FOR_QA (closes D-DEC-PLT-STALE-DIST)
program: PO-HRM-CONTINUOUS-W8-20260807
stamp_ref: DECPLATDEVOPS-MSJ1K9XZ · prior FAIL DECPLATQA-MSJ14FCK

entry_criteria:
- L0: hrm-api :28001 healthy; unauth GET decision-types + decision-types/effective (?company_id=holding) → 401 not 404
- evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-devops-01.md
- U65 zero-seed · no honesty flip · browser UF HOLD · FE Settings HOLD

task: Retest L1 DEC platform catalog AC (decision-types list/create/normalize, effective, retire, scope_parity, FORBIDDEN hard-delete) per prior QA matrix / F-DEC-CAT.
exit_criteria: PASS_TO_PM or FAIL_TO_PM with evidence; Do NOT dispatch FE until L1 PASS.
```
