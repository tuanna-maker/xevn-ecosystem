# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEVOPS-01` READY_FOR_QA (closes `D-EMP-PLT-STALE-DIST`) |
| **program** | `PO-HRM-CONTINUOUS-W7-20260807` |
| **Date** | 2026-08-07 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · query `company_id=holding` · header `x-company-id=main` · member OOS `du-lich.ceo@xe.vn` |
| **Stamp (retest PASS)** | `EMPPLATQA-MSIZXHIM` |
| **Prior FAIL stamp** | `EMPPLATQA-MSIZICMH` |
| **DevOps stamp** | `EMPPLATDEVOPS-MSIZICMH` |
| **U65** | zero-seed · L1 API smoke only · **browser UF HOLD** |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `payroll_e2e_ready=false` · `attendance_uat_ready=false` · `recruitment_uat_ready=false` · **LOCKED** (no flip) |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (L1 API AC 1–7) — browser FE HOLD |

---

## Retest rollup (after DEVOPS-01)

| Check | Result |
|-------|--------|
| L0 `GET /api/hrm` | **200** `HRM-HEALTH-200` |
| Unauth list/effective DOC+ET | **401** `HRM-AUTH-001` (not 500/404) — `D-EMP-PLT-STALE-DIST` **CLOSED** |
| Login `ceo@xe.vn` | **201** |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-emp-qa-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-qa-01.FINAL.json` |
| Pass count | **20/20** · fail **0** |
| Seed | none (U65) |
| LIST-TOTALS / CTR GWC | **must_keep** — not reopened |

**spec_ref:** BE `po-hrm-dynamic-config-platform-emp-be-01.md` · DevOps `po-hrm-dynamic-config-platform-emp-devops-01.md` · AC-PLT-EMP-02..06

---

## L1 results (AC 1–7 map)

| # | Check | Expected | Actual | Verdict |
|---|-------|----------|--------|---------|
| 1 | `GET …/document-types?company_id=holding` | 200 rows/`[]` | **200** `HRM-EMP-DOC-200` (total≥0) | 🟢 |
| 1b | `GET …/employment-types` | 200 | **200** `HRM-EMP-ET-200` | 🟢 |
| 2 | `POST` open key `hr_doc_custom_09_*` | 2xx | **201** `HRM-EMP-DOC-201` | 🟢 |
| 2b | `POST` `CCCD` uppercase | 400 `HRM-PLT-CAT-CODE-INVALID` | **400** `HRM-PLT-CAT-CODE-INVALID` | 🟢 |
| 3 | `POST` `seasonal_temp*` | 2xx | **201** `HRM-EMP-ET-201` | 🟢 |
| 3b | `POST` `full-time` → persist `full_time` | normalize | **201** key=`full_time` | 🟢 |
| 4 | `GET …/employment-types/effective` EMP wins | 200 + EMP native | **200**; `full_time` `source=emp_native` (EMP wins) | 🟢 |
| 4b | `GET …/document-types/effective` | 200 | **200** `HRM-EMP-DOC-200` | 🟢 |
| 5 | `POST …/:id/retire` + list hide | retired; active hide | DOC/ET retire **201**; default list hide; `include_archived` shows | 🟢 |
| 6 | scope_parity group CEO main↔holding | list↔get 200 | get holding **200**; get main **200**; inMainList **true** | 🟢 |
| 6b | member OOS `du-lich.ceo` | deny (403/404/**409**) | **409** `SCOPE_CONTEXT_MISMATCH` (matrix-aligned deny) | 🟢 |
| 7 | FORBIDDEN hard-delete | no DELETE success | **404** `HRM-DATA-404` | 🟢 |
| 7b | FORBIDDEN closed/uppercase enum | 400 CODE-INVALID | `FULL_TIME` → **400** `HRM-PLT-CAT-CODE-INVALID` | 🟢 |
| 7c | honesty flip | remain false | all flags **false LOCKED** | 🟢 |

**AC-PLT-EMP browser Settings pickers:** **⬜ HOLD** — FE not in scope; PM gates `EMP-FE-01` after L1 PASS.

---

## Key network stamps (truncated)

```text
GET  /api/hrm                                              → 200 HRM-HEALTH-200
GET  /api/hrm/employees/document-types (unauth)            → 401 HRM-AUTH-001
GET  /api/hrm/employees/document-types/effective (unauth)  → 401 HRM-AUTH-001
POST /api/xbos/auth/login                                  → 201 ceo@xe.vn
GET  /api/hrm/employees/document-types?company_id=holding  → 200 HRM-EMP-DOC-200
POST /api/hrm/employees/document-types (open key)          → 201 HRM-EMP-DOC-201
POST /api/hrm/employees/document-types CCCD                → 400 HRM-PLT-CAT-CODE-INVALID
POST /api/hrm/employees/employment-types seasonal_temp*    → 201 HRM-EMP-ET-201
POST /api/hrm/employees/employment-types full-time         → 201 key=full_time
GET  /api/hrm/employees/employment-types/effective         → 200 EMP-native
POST …/document-types/:id/retire                           → 201 status=retired + list hide
GET  member OOS holding row                                → 409 SCOPE_CONTEXT_MISMATCH
DELETE …/document-types/:id                                → 404 (no hard-delete)
```

---

## Residual / defect register

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| **D-EMP-PLT-STALE-DIST** | — | **CLOSED** by DEVOPS-01 (`EMPPLATDEVOPS-MSIZICMH`) | — |
| **R-PLT-EMP-FE** | HOLD | Browser Settings DOC/ET pickers | **dev-fe** (`EMP-FE-01` after QC L1 SEAL or PM gate) |
| R-PLT-EMP-01/02 | deferred | assert wire checklist / ET consumers | dev-be (post FE) |

**not promoted:** personnel UAT · e2e linkage · honesty flip · browser UF · module UAT · Phase1 DONE · LIST-TOTALS/CTR reopen

**Seed:** none (U65)

**Probe note:** First retest run `EMPPLATQA-MSIZWASW` flagged member OOS 409 as FAIL because probe only accepted 403|404. Aligned to pilot matrix (member CEO expect **403/409**); re-run `EMPPLATQA-MSIZXHIM` **20/20 PASS**. Denial semantics correct — not a product leak.

---

## Prior FAIL (archived — stale dist)

| Stamp | Verdict | Root cause |
|-------|---------|------------|
| `EMPPLATQA-MSIZICMH` | FAIL_TO_PM | Runtime missing catalog routes → GET list **500** uuid `"document-types"`; POST/effective **404** |

See section history below / DevOps evidence for rebuild proof.

---

## completion_report

**Closed:** L1 AC 1–7 retest **PASS** after DevOps rebuild; stamp `EMPPLATQA-MSIZXHIM`; `D-EMP-PLT-STALE-DIST` verified closed (401 not 500/404); open key create; CCCD/FULL_TIME format reject; `full-time`→`full_time`; effective EMP; retire hide; group CEO scope_parity; member OOS **409** deny; hard-delete absent; honesty **LOCKED false**.

**Residual:** Browser FE HOLD (`R-PLT-EMP-FE`) — PM may dispatch QC L1 SEAL then `EMP-FE-01`; do **not** flip personnel/e2e honesty.

**Forbidden claims:** personnel UAT · employees e2e linkage · PAY/ATT/REC ready · browser UF PASS · Phase1 DONE.

---

## Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** (L1 SEAL) → then PM gates **dev-fe** `EMP-FE-01` |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qa-01.md` |
| **machine_json** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-qa-01.FINAL.json` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QC-01
from_role: pm
to_role: qc
lane: governance
priority: P0
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QA-01 PASS_TO_PM (L1 AC 1–7)
program: PO-HRM-CONTINUOUS-W7-20260807
stamp_ref: EMPPLATQA-MSIZXHIM · devops EMPPLATDEVOPS-MSIZICMH · prior FAIL EMPPLATQA-MSIZICMH

## entry_criteria
- Evidence PASS: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qa-01.md
- Machine: docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-qa-01.FINAL.json (20/20)
- DevOps closed D-EMP-PLT-STALE-DIST: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-devops-01.md
- U65 zero-seed · honesty personnel/e2e/pay/att/rec =false LOCKED
- must_keep: LIST-TOTALS / CTR GWC — do not reopen
- browser UF HOLD — do not claim Settings pickers PASS

## task
1) Audit L1 AC 1–7 evidence vs exit criteria (DOC/ET create, CCCD 400, full_time normalize, effective EMP, retire hide, scope_parity CEO + member 409 OOS, FORBIDDEN hard-delete/enum)
2) Confirm D-EMP-PLT-STALE-DIST CLOSED (unauth 401 not 500/404)
3) Gate: GO WITH CONDITIONS (FE browser) or GO L1-SEAL — residual R-PLT-EMP-FE → EMP-FE-01
4) Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qc-01.md
5) DENIED: personnel UAT · honesty flip · browser UF PASS · Phase1 DONE

## exit
ack_status PASS_TO_PM · next_dispatch_prompt = PM → EMP-FE-01 (Settings DOC/ET pickers) after QC SEAL
```

**Alt (PM may skip QC and gate FE directly):** dispatch `dev-fe` `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01` with L1 SEAL reference — QA does **not** dispatch FE.

---

## Appendix — prior FAIL body (2026-08-07 first run)

First QA run against pre-rebuild runtime: GET document-types **500** uuid `"document-types"`; POST/effective **404**; dist missing `emp-*-type.service.js`. Full FAIL narrative retained in git history / superseded by retest rollup above. Handoff then was DEVOPS-01 → QA retest (completed this wave).
