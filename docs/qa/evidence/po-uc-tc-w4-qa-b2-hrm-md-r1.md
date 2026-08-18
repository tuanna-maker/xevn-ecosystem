# Evidence — PO-UC-TC-W4-QA-B2-HRM-MD-R1 (retest after FE IsJSON fix)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-B2-HRM-MD-R1` |
| **prior_seat** | `PO-UC-TC-W4-QA-B2-HRM-MD` · FAIL MD-01 · `docs/qa/evidence/po-uc-tc-w4-qa-b2-hrm-md-rollup.md` |
| **dev_fix** | `PO-UC-TC-W4-DEV-FE-B2-MD01-SUBMIT-ISJSON` · `docs/qa/evidence/po-uc-tc-w4-dev-fe-b2-md01-submit-isjson.md` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-04 |
| **u65_zero_seed** | true |
| **hdsd_align** | true |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **portal** | `http://127.0.0.1:5173` |
| **commit** | `dc930c5` |
| **runtime_json** | `docs/qa/evidence/_tmp-po-uc-tc-w4-qa-b2-hrm-md-r1-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-b2-hrm-md-r1/` |
| **script** | `scripts/qa/_tmp-po-uc-tc-w4-qa-b2-hrm-md-browser.mjs` (R1 outputs + network `businessStatus` fix) |
| **seat_verdict** | **PASS** (MD-01..04 browser HP · MD-02 regression · AU ADR §5 spot unchanged) |

> **Domain:** employee metadata change-request queue (`/hr/employee-metadata` · UF-HRM-11 · UC-HRM-26). **Not** settings-catalog pull. Leave L2 **not invented**. Phase1 / UAT DONE **not claimed**.

---

## L0 + fe-be-health

| Probe | Result |
|-------|--------|
| `qc:dev-stack` hrm / xbos / portal | **200** (Windows UV assert after green lines — ignored) |
| `qc:fe-be-health` | **ALL PASS** |
| Seed | **no** `pnpm seed:*` |

---

## HDSD inventory (U76)

1. Login holding `ceo@xe.vn`
2. `/hr/employee-metadata?portal=1&companyId=main`
3. **Gửi yêu cầu metadata mới** — Mã trường `job_title` + giá trị plain (HDSD)
4. List GET `…/change-requests` (MD-02)
5. **Duyệt** / **Từ chối** on FE-origin rows (MD-03/04)

---

## must_keep (untouched)

| Lock | Touched? |
|------|----------|
| AT-12 L1 approve CLOSED | **no** |
| CREATE-CATALOG CLOSED | **no** |
| CI01 iframe CLOSED | **no** |
| BR-WF-04 self-FD CLOSED | **no** |
| IM-01/02/04 UI_PASS | **no** |
| IM-03 AU GWC pattern | **no** (spot recheck only) |
| Leave L2 | **not invented / not PASS** |

---

## UC verdicts (browser P0 — U65)

| UC | Verdict | Evidence |
|----|---------|----------|
| **HRM-MD-01** | 🟢 **UI_PASS** | `job_title` + plain «Chuyên viên QA …» → POST **201** `HRM-META-201` · row + toast · **F5** persists · FD empty → submit disabled |
| **HRM-MD-02** | 🟢 **UI_PASS** | Land «Hàng chờ metadata» · GET **200** `HRM-META-200` · no Sync ERROR |
| **HRM-MD-03** | 🟢 **UI_PASS** | FE-origin row → **Duyệt** → POST **201** `HRM-META-202` · toast · pending gone after F5 · OBS self-approve allowed |
| **HRM-MD-04** | 🟢 **UI_PASS** | Second FE-origin row → **Từ chối** → POST **201** `HRM-META-203` · toast · F5 pending gone |

### Sample Network (no secrets)

```text
GET  /api/hrm/employee-metadata/change-requests?company_id=main&status=pending → 200 HRM-META-200
POST /api/hrm/employee-metadata/change-requests → 201 HRM-META-201  (plain job_title + wrapped requested_value)
POST …/change-requests/{id}/approve → 201 HRM-META-202
POST …/change-requests → 201 HRM-META-201  (reject target)
POST …/change-requests/{id}/reject → 201 HRM-META-203
```

### Residual closed

| ID | Status |
|----|--------|
| `R-W4-B2-MD01-SUBMIT-ISJSON` | **CLOSED** (dev-fe omit `current_value` + `{"value":…}` wrap) |

---

## AU spot (ADR §5 — unchanged vs IM03 / prior B2 rollup)

| Case | HTTP | Code | Verdict |
|------|------|------|---------|
| Member + `company_id=holding` · `x-company-id=holding` · tenant xe-du-lich | **409** | `SCOPE_CONTEXT_MISMATCH` | 🟢 |
| Member + `company_id=main` · `x-company-id=main` · tenant xevn | **409** | `SCOPE_CONTEXT_MISMATCH` | 🟢 |
| Member + `company_id=main` · `x-company-id=xe-du-lich` · tenant xe-du-lich | **200** | `HRM-META-200` (own bucket) | 🟢 |
| must_keep CEO + main | **200** | `HRM-META-200` | 🟢 |

---

## by-uc honesty stamp

| UC | execution | uat_done |
|----|-----------|----------|
| MD-01 | **UI_PASS** | **false** |
| MD-02 | **UI_PASS** | **false** |
| MD-03 | **UI_PASS** | **false** |
| MD-04 | **UI_PASS** | **false** |

---

## completion_report

- **Closed:** R1 browser retest after FE IsJSON fix — MD-01 submit 201, MD-02 list regression, MD-03/04 approve/reject HP on FE-origin rows, F5 persistence, U65 no seed.
- **Closed residual:** `R-W4-B2-MD01-SUBMIT-ISJSON`.
- **Open (program):** `uat_done` remains **false** for all MD UCs until wave QC / sponsor UAT; self-approve AU remains OBS only.

## next_owner

`qc`

## next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-QC-B2-HRM-MD-R1
from_role: pm
to_role: qc
lane: execution
priority: P0
entry_criteria: QA PASS_TO_PM docs/qa/evidence/po-uc-tc-w4-qa-b2-hrm-md-r1.md; L0 fe-be PASS; u65_zero_seed; must_keep AT-12/CREATE-CATALOG/CI01/BR-WF-04/IM/Leave L2
exit_criteria: QC audit MD-01..04 UI_PASS evidence + browser JSON/screens; confirm R-W4-B2-MD01-SUBMIT-ISJSON CLOSED; GO/GWC for W4-B2 metadata seat only (uat_done false); no Phase1 DONE claim
evidence_path: docs/qa/evidence/po-uc-tc-w4-qc-b2-hrm-md-r1.md
ack_status target: PASS_TO_PM
```
