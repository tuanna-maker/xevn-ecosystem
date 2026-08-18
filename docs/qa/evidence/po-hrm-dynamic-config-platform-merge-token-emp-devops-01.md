# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DEVOPS-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DEVOPS-01` |
| **from_role** | `devops` |
| **to_role** | `qa` |
| **date** | 2026-08-07 |
| **lane** | execution — L0 runtime rebuild (U65 zero-seed) |
| **priority** | P0 |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-QA-01` FAIL · stamp `EMPTOKQA-MSJ1R7MT` |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **closes** | `D-EMP-TOK-STALE-DIST` (runtime missing `emp-merge-token-register.js` / `emp_catalog` / DOC·ET register hooks) |
| **ack_status** | **`READY_FOR_QA`** |
| **stamp** | `EMPTOKDEVOPS-6A75EE71` |
| **machine JSON** | `_tmp-po-hrm-dynamic-config-platform-merge-token-emp-devops-01.json` |
| **ref_qa** | `docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-qa-01.md` |
| **ref_be** | `docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-be-01.md` |
| **peer** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DEVOPS-01` (EMP/DEC stale-dist) |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`hrm_personnel_uat_ready`** | **`false`** | **DENIED** flip |
| **`employees_e2e_linkage_ready`** | **`false`** | **DENIED** flip |
| **`contracts_printable_ready`** | **`false`** | **DENIED** flip |
| **`custom.emp.*` LIVE** | **HOLD** | **DENIED** invent |
| **Seed** | **DENIED** | U65 · no `pnpm seed:*` |
| **EMP-QC-01 / EMP-QC-02** | **SEAL RETAIN** | not reopened |

---

## Mission

Rebuild + restart `hrm-api` single listener `:28001` so live `dist` includes EMP MergeToken register side-effect:

- `emp-merge-token-register.js`
- `MERGE_TOKEN_ORIGINS` includes `emp_catalog` (retain `allowance_catalog`)
- DOC/ET compiled services wire `upsertEmpCatalogMergeToken` inside `withTransaction`

---

## Steps executed

| # | Action | Result |
|---|--------|--------|
| 1 | Audit `:28001` | Listener PID **25416** · `node dist/main` start **21:22:53** · **stale** vs src register **21:23:53** / DOC **21:26** / ET **21:26** |
| 2 | Pre-fix dist probe | `emp-merge-token-register.js` **MISSING** · constants has `allowance_catalog` only (no `emp_catalog`) · DOC/ET dist predated BE-01 hooks |
| 3 | Harden spine | `verify-dist.mjs` `DIST_SPINE` += `emp-merge-token-register.js` + `merge-token.constants.js` + `merge-tokens.controller.js` |
| 4 | `pnpm --filter hrm-api run build:clean` | **exit 0** · emit mtime **21:39:15** · verify-dist **0** |
| 5 | Stop stale tree | Stop PID **25416** · port **28001 FREE** |
| 6 | Restart listener | `start:prod` → single PID **4100** start **21:40:09** (≥ dist) · `GET /api/hrm` **200** |
| 7 | Duplicate check | **Listener count = 1** (PID **4100**) |
| 8 | `pnpm run qc:dev-stack` | HRM + XBOS + portal **HTTP 200** (Windows `UV_HANDLE_CLOSING` exit noise — ignore; peer DEC) |
| 9 | `pnpm run qc:fe-be-health` | **ALL PASS** exit **0** |

---

## Dist verification (post-build)

| Artifact | Status |
|----------|--------|
| `dist/merge-tokens/emp-merge-token-register.js` | **EXISTS** · 21:39:15 · contains `emp_catalog` |
| `dist/merge-tokens/merge-token.constants.js` | **EXISTS** · `allowance_catalog` + **`emp_catalog`** |
| `dist/merge-tokens/merge-tokens.controller.js` | **EXISTS** |
| `dist/employees/emp-document-type.service.js` | requires register · `withTransaction` · `upsertEmpCatalogMergeToken` |
| `dist/employees/emp-employment-type.service.js` | requires register · `withTransaction` · `upsertEmpCatalogMergeToken` |
| `node scripts/verify-dist.mjs` | **exit 0** |

---

## Unauth smoke (exit criteria)

| Check | Expected | Actual | Verdict |
|-------|----------|--------|---------|
| `GET …/merge-tokens?domain=EMP&company_id=holding` | **401/403** (not 404) | **401** | **PASS** |
| `GET …/merge-tokens?domain=EMP` (no company) | not **404** | **400** (DTO/validation; route registered) | **PASS** (route present) |
| Health `GET /api/hrm` | 200 | **200** `HRM-HEALTH-200` | **PASS** |

**Before (QA FAIL stamp `EMPTOKQA-MSJ1R7MT`):** routes mounted (401/400) but register artifact missing → DOC/ET PUT 2xx with empty merge-tokens list.

---

## Gate table

| Gate | Result |
|------|--------|
| Rebuild dist ≥ EMP BE/src register | **PASS** (21:39:15 ≥ src 21:23–21:26) |
| Single `:28001` listener | **PASS** (PID 4100) |
| Unauth merge-tokens → 401 not 404 | **PASS** (`company_id=holding`) |
| Dist grep `emp_catalog` + register.js | **PASS** |
| DOC/ET dist register hooks | **PASS** |
| `qc:dev-stack` services 200 | **PASS** (UV exit noise ignored) |
| `qc:fe-be-health` | **PASS** |
| Seed / honesty flip / EMP UAT invent | **DENIED** |

---

## Residual

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **AC-PLT-EMP-TOK-01..03** (+05) | P0 product | **qa** retest | Runtime defect closed; QA owns browser Settings DOC/ET → merge-tokens |
| **R-EMP-TOK-EXT** | P2 | after TOK PASS | `custom.emp.*` HOLD |
| Honesty flags | LOCKED false | — | unchanged |
| EMP-QC seals | retain | — | not reopened |

---

## completion_report

**Closed:** `D-EMP-TOK-STALE-DIST` — `build:clean` emitted `emp-merge-token-register.js`; `MERGE_TOKEN_ORIGINS` includes `emp_catalog`; DOC/ET dist services wire register hooks in TX; spine gate extended; single `:28001` listener restarted (PID 4100); unauth `GET merge-tokens?domain=EMP&company_id=holding` → **401** (not 404); `qc:fe-be-health` ALL PASS.

**Residual:** Full authenticated browser AC `AC-PLT-EMP-TOK-01..03+05` for QA retest; no honesty flip; seals retained; `custom.emp` HOLD.

**Forbidden claims:** personnel UAT · employees_e2e · printable · custom.emp LIVE · EMP-QC reopen · Phase1 DONE.

---

## Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **`READY_FOR_QA`** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-devops-01.md` |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-merge-token-emp-devops-01.json` |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-QA-01
from_role: pm
to_role: qa
priority: P0
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DEVOPS-01 READY_FOR_QA (closes D-EMP-TOK-STALE-DIST)
program: PO-HRM-CONTINUOUS-W8-20260807
stamp_ref: EMPTOKDEVOPS-6A75EE71 · prior FAIL EMPTOKQA-MSJ1R7MT
ref_devops: docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-devops-01.md
ref_be: docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-be-01.md

entry_criteria:
- L0: hrm-api :28001 healthy; unauth GET /api/hrm/merge-tokens?domain=EMP&company_id=holding → 401 not 404
- dist: emp-merge-token-register.js present; MERGE_TOKEN_ORIGINS has emp_catalog; DOC/ET services call upsertEmpCatalogMergeToken
- U65 zero-seed · browser-only Settings DOC/ET → assert merge-tokens
- Honesty LOCKED false: hrm_personnel_uat_ready=false · employees_e2e=false · DENY printable / custom.emp LIVE / reopen EMP-QC

task: Retest AC-PLT-EMP-TOK-01..03+05 (DOC Lưu→F5 emp.doc.* origin=emp_catalog; ET create/normalize→emp.et.*; resolve-preview labels; must_keep seals).
exit_criteria: PASS_TO_PM or FAIL_TO_PM with evidence; do NOT invent EMP UAT / flip honesty.
```
