# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-QA-01-R2

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-QA-01-R2` |
| **role** | qa |
| **lane** | execution · U65 zero-seed · browser-only |
| **date** | 2026-08-06 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-FE-02` READY_FOR_QA |
| **prior** | `docs/qa/evidence/po-hrm-contract-legal-print-qa-01.md` R1 · residual **R-CTR-PREVIEW-COMPANY-ID-BODY** |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-contract-legal-print-qa-01-r2.FINAL.json` |
| **harness** | `scripts/qa/_tmp-po-hrm-contract-legal-print-qa-01-r2.mjs` |
| **screens** | `docs/qa/evidence/screens/po-hrm-contract-legal-print-qa-01-r2/` (00–07) |
| **honesty** | `contracts_printable_ready=false` · **DENIED** printable module GO / seed / invent UAT |
| **ack_status** | **FAIL_TO_PM** |

---

## 0. L0 / hard refresh

| Check | Result |
|-------|--------|
| `qc:dev-stack` | HRM 200 · XBOS 200 · portal 5173 200 |
| `qc:fe-be-health` | **ALL PASS** |
| BE probe | clauses **200** · templates **200** · contracts **200** |
| FE hard refresh | Settings + contracts reload before mutate (FE-02 bundle) |
| Seed | **DENIED** |

---

## 1. Exit criteria matrix

| # | AC | Verdict | Evidence |
|---|-----|---------|----------|
| 1 | AC-CTR-PRINT-SPINE preview | 🟢 | POST `…/preview?company_id=main` → **201** `HRM-CTR-PREV-200` · body keys `pack_code`,`template_id` only · **no** `company_id` · **no** `HRM-VAL-001` · preview body UI visible |
| 2 | Lưu phiên bản in + F5 list >0 | 🔴 | `can_issue=false` → **Lưu phiên bản in** disabled · versions list count=0 after F5 |
| 3 | PDF HTML stub GET 2xx | 🔴 | Not reached (no print-version id) · Q-CTR-02 N/A |
| 4 | Smoke must_keep CL/TPL + UF-HRM-02 | 🟢 | Settings clause+TPL chrome · UF-HRM-02 create **201** `HRM-CON-201` + F5 · no DnD storm / mojibake / Uncaught |
| 5 | Honesty false | 🟢 | Settings + spine show `contracts_printable_ready=false` |
| 6 | Evidence R2 | 🟢 | this file + FINAL JSON |

**Overall:** **FAIL_TO_PM** — FE-02 residual closed; print-version/PDF exit not met.

---

## 2. UF / AC blocks

### SMOKE Settings CL/TPL (must_keep re-smoke)
- Path: `/hr/settings` → tab Điều khoản HĐ → hard refresh → tab Mẫu DnD
- Chrome: `ctr-clause-code` · `ctr-tpl-*` palette/canvas visible
- Process: dndStorm=0 · Uncaught=0 · mojibake=false
- Verdict: 🟢 (mutate already 🟢 on QA-01 R1 — not re-created)

### UF-HRM-02 — Registry create + F5
- Path: `/hr/contracts` → Thêm → employee + type → Lưu
- Network: POST contracts → **201** `HRM-CON-201` · id `b5fdd9cc-…` · code `HD-QDKM8`
- FE sau 2xx + F5: row on list
- Verdict: 🟢

### AC-CTR-PRINT-SPINE — Preview / version / PDF
- Path: list pencil → `ctr-print-spine` → pack GENERAL · template `TPL_CTRQA-*` → **Xem trước**
- Network preview:
  - URL: `POST /api/hrm/contracts-insurance/contracts/{id}/preview?company_id=main`
  - Body: `{"pack_code":"GENERAL","template_id":"e1e8196c-…"}` — **`company_id` absent**
  - Status: **201** `HRM-CTR-PREV-200`
  - `can_issue`: **false**
  - `missing_fields`: `[{ field: "work_location", message: "Work location is required" }]`
  - `missing_clauses`: `[]`
- **Lưu phiên bản in:** button disabled (`!preview.can_issue`)
- print-versions list after F5: **0**
- PDF: not reached
- Verdict: 🟡 **PARTIAL** (preview gate PASS · issue/PDF FAIL)

---

## 3. Residuals

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-CTR-PREVIEW-COMPANY-ID-BODY** | P0 | dev-fe | **CLOSED** | FE-02 query-only; browser bodyClean=true; no HRM-VAL-001 |
| **R-CTR-PRINT-CAN-ISSUE** | **P1** | **dev-fe** (+ BA if form AC) | **OPEN** | BE requires `work_location` for `can_issue`; UF-HRM-02 / `Contracts.tsx` registry form **has no** `work_location` field; 0/15 contracts in scope have `work_location` set → cannot save print-version / PDF via FE |
| Q-CTR-02 PDF stub | P2 | — | blocked | Wait for version 2xx |
| Honesty / printable UAT | — | — | **DENIED** | `contracts_printable_ready=false` |

---

## 4. Honesty stamp (mandatory)

| Claim | Value |
|-------|--------|
| `contracts_printable_ready` | **false** |
| Promote printable UAT / module GO | **DENIED** |
| Seed used | **DENIED** |
| Narrow slice | Preview company_id fix 🟢 · issue/PDF 🔴 |

---

## 5. HDSD inventory (U76)

| Step | Cue |
|------|-----|
| Settings smoke | `settings-tab-contract-legal` · `ctr-clause-*` · `ctr-tpl-*` |
| Registry | `hdsd-contracts-create-btn` · form dialog · Lưu |
| Print spine | `ctr-print-spine` · `ctr-print-preview-btn` · `ctr-print-save-version` (disabled) · honesty |
| F5 | after contract save · after preview attempt |

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | R2 browser: L0 PASS. **R-CTR-PREVIEW-COMPANY-ID-BODY CLOSED** — preview POST `?company_id=` **201**, body no `company_id`. must_keep CL/TPL chrome + UF-HRM-02 🟢 · process/honesty 🟢. **FAIL exit** print-version/PDF: `can_issue=false` missing `work_location` (registry form gap). Honesty false. No seed. |
| **next_owner** | **dev-fe** (capture `work_location` on registry create/edit **or** spine `field_overrides` UI) → qa R3 for version+PDF |
| **ack_status** | **FAIL_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-contract-legal-print-qa-01-r2.md` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-FE-03
from_role: pm
to_role: dev-fe
lane: execution
u65: zero-seed
parent: PO-HRM-CONTRACT-LEGAL-PRINT-QA-01-R2 FAIL_TO_PM
evidence_in: docs/qa/evidence/po-hrm-contract-legal-print-qa-01-r2.md
residual: R-CTR-PRINT-CAN-ISSUE P1 — preview 201 but can_issue=false missing work_location; save-version disabled; PDF not reached
honesty: contracts_printable_ready=false — DENIED printable GO

entry_criteria:
- FE-02 CLOSED (company_id query-only) — do not regress
- Spec: validatePreview requires work_location; ContractPreviewDto allows field_overrides
- Registry Contracts.tsx create/edit currently has NO work_location input

task (pick one ADD path — preserve UF-HRM-02):
A) Add work_location (vi label Nơi làm việc) on contracts registry create/edit + POST/PUT payload so merge can_issue can pass after FE save; OR
B) Expose field_overrides on ctr-print-spine for work_location (and other missing Đ.21) before Lưu phiên bản in
must_keep: UF-HRM-02 CRUD · Settings CL/TPL DnD · preview body still no company_id

exit_criteria: READY_FOR_QA · evidence docs/qa/evidence/po-hrm-contract-legal-print-fe-03.md
then: PM Task qa PO-HRM-CONTRACT-LEGAL-PRINT-QA-01-R3 — preview 2xx → save print-version 2xx → F5 versions>0 → PDF stub 2xx
forbidden: seed · claim printable UAT · wipe registry · reintroduce company_id in preview body
```
