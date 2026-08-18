# Evidence rollup — PO-UC-TC-W4-QA-B1-HRM-IM

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-B1-HRM-IM` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-04 |
| **u65_zero_seed** | true |
| **hdsd_align** | true |
| **persona** | `ceo@xe.vn` holding (`companyId=main`) · AU `du-lich.ceo@xe.vn` |
| **portal** | `http://127.0.0.1:5173` |
| **commit** | `dc930c5` |
| **runtime_json** | `docs/qa/evidence/_tmp-po-uc-tc-w4-qa-b1-hrm-im-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-b1-hrm-im/` |
| **script** | `scripts/qa/_tmp-po-uc-tc-w4-qa-b1-hrm-im-browser.mjs` |
| **seat_verdict** | **PARTIAL** (P0 HP mutate PASS · AU member→main list **200** residual) |

> **Domain remap:** Dispatch text said «Insurance» — by-uc SoT `HRM-IM-01..04` = **Import/Export nhân sự** (HDSD CH06 §5), **không** phải Bảo hiểm BH. Leave L2 **not invented**. Phase1 / UAT DONE **not claimed**.

---

## L0 + fe-be-health

| Probe | Result |
|-------|--------|
| `qc:dev-stack` hrm/xbos/portal | **200** (script exit code noise on Windows after PASS — health lines green) |
| `qc:fe-be-health` | **ALL PASS** (login · employees · catalog-sync · proxy) |
| Seed | **không** chạy `pnpm seed:*` |

---

## HDSD inventory (U76)

1. Login holding `ceo@xe.vn` / `Xevn@2026`
2. Menu / deep-link **Nhân viên** → `/hr/employees?portal=1&companyId=main` (HDSD CH06)
3. **Nhập Excel** → dialog Import
4. **Tải file mẫu (.xlsx)** (IM-04)
5. Chọn CSV → bảng **xem trước** (IM-01) → **Import N** commit (IM-02) → F5 list
6. **Xuất** → chọn cột → tải `danh_sach_nhan_vien_*.xlsx` (IM-03)
7. AU probe: member `du-lich.ceo` + `company_id=main`

---

## must_keep (untouched this seat)

| Lock | Touched? |
|------|----------|
| AT-12 L1 approve CLOSED | **no** |
| CREATE-CATALOG CLOSED | **no** |
| CI01 iframe CLOSED | **no** |
| BR-WF-04 self-FD CLOSED | **no** |
| Leave L2 | **not invented / not PASS** |

---

## UC verdicts (browser P0)

| UC | Verdict | P0 evidence |
|----|---------|-------------|
| **HRM-IM-04** | 🟢 **UI_PASS** | OPEN dialog · **Tải file mẫu** → `GET …/spreadsheet/templates/employee_import?format=xlsx` **200** |
| **HRM-IM-01** | 🟢 **UI_PASS** | OPEN · FD empty required → preview **200** `SHEET-200` errors=2 · HP CSV → preview **200** `SHEET-200` rowCount=1 · FE preview table · AU aux CEO+`x-company-id=du-lich` → **409** `SCOPE_CONTEXT_MISMATCH` |
| **HRM-IM-02** | 🟢 **UI_PASS** | POST `…/import/commit` **201** `SHEET-201` `importedCount=1` · F5 list shows `QA-IM-W4B1E63RYV` · employees total 58→59 |
| **HRM-IM-03** | 🟡 **UI_PARTIAL** | OPEN Xuất · GET employees **200** total=59 · deselect-all warning · client download `danh_sach_nhan_vien_2026-08-04.xlsx` · **AU FAIL:** member GET `company_id=main` → **200** `HRM-EMP-200` (expect 403/409) |

### Sample Network (no secrets)

```text
GET  /api/hrm/employees?…company_id=main → 200 HRM-EMP-200 total=58..59
GET  /api/hrm/spreadsheet/templates/employee_import?format=xlsx → 200
POST /api/hrm/spreadsheet/import/preview → 200 SHEET-200 (errors=2 / rowCount=1)
POST /api/hrm/spreadsheet/import/commit → 201 SHEET-201 importedCount=1
# Export = client XLSX (no spreadsheet export API required for HP)
# AU member → GET employees?company_id=main → 200 HRM-EMP-200  (residual)
# AU aux CEO preview x-company-id=du-lich → 409 SCOPE_CONTEXT_MISMATCH
```

### Stamp

- `EMP_CODE=QA-IM-W4B1E63RYV` · email `qa.im.w4b1e63ryv@xe.vn`

---

## by-uc honesty stamp

Updated `docs/qa/professional/by-uc/{HRM-IM-01,HRM-IM-02,HRM-IM-03,HRM-IM-04}.md`:

| UC | execution | uat_done |
|----|-----------|----------|
| IM-01 | UI_PASS | **false** |
| IM-02 | UI_PASS | **false** |
| IM-03 | UI_PARTIAL | **false** |
| IM-04 | UI_PASS | **false** |

---

## Residual → PM dispatch

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-W4-B1-AU-MEMBER-MAIN-200** | P1 | **CLOSED** (2026-08-04) | Retest `PO-UC-TC-W4-QA-IM03-AU-MEMBER-MAIN-01`: ADR §5 own bucket **200** total=0 ≠ group 59; holding/xevn headers **409**. Evidence: `po-uc-tc-w4-qa-im03-au-member-main-01.md`. |
| IM-01 `.txt` invalid-type | P2 | qa/fe | Playwright `setInputFiles` bypasses `accept=`; real UI may rely on file picker filter — not product FAIL |
| Leave L2 | — | — | **not touched** |
| Phase1 / UAT DONE | — | — | **not claimed** |

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-QA-B1-HRM-IM
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-b1-hrm-im-rollup.md
next_owner: pm
uat_done: false
seat_verdict: PARTIAL
```

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-BE-AU-MEMBER-MAIN-SCOPE-01
from_role: pm
to_role: dev-be
lane: execution
ack_status_target: READY_FOR_QA
priority: P1
u65_zero_seed: true

## CONTEXT
W4-B1 HRM-IM seat PARTIAL. P0 Import/Export HP PASS. Residual AU:
du-lich.ceo@xe.vn GET /api/hrm/employees?company_id=main → 200 HRM-EMP-200
(TC-HRM-IM-03-SCOPE-AU-001 expected 403/409). CEO preview mismatch path already 409 OK.

## ENTRY
- Read docs/qa/evidence/po-uc-tc-w4-qa-b1-hrm-im-rollup.md residual R-W4-B1-AU-MEMBER-MAIN-200
- ADR-GROUP-CEO-MAIN-HOLDING-SCOPE + hrm-list-scope
- must_keep: IM-01/02/04 UI_PASS paths · AT-12 · CREATE-CATALOG · CI01 · BR-WF-04 · no Leave L2 invent

## EXIT
- Member JWT cannot list holding main as own scope (403/409 deterministic) OR BA waiver with ADR cite
- Jest/scope-context regression
- evidence_path: docs/qa/evidence/po-uc-tc-w4-be-au-member-main-scope-01.md
- READY_FOR_QA → retest IM-03 AU only (U65 browser/API aux)
```
