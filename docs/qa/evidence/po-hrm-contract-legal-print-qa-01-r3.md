# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-QA-01-R3

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-QA-01-R3` |
| **role** | qa |
| **lane** | execution · U65 zero-seed · browser-only |
| **date** | 2026-08-06 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-FE-03` READY_FOR_QA |
| **prior** | `docs/qa/evidence/po-hrm-contract-legal-print-qa-01-r2.md` · residual **R-CTR-PRINT-CAN-ISSUE** |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-contract-legal-print-qa-01-r3.FINAL.json` |
| **harness** | `scripts/qa/_tmp-po-hrm-contract-legal-print-qa-01-r3.mjs` |
| **screens** | `docs/qa/evidence/screens/po-hrm-contract-legal-print-qa-01-r3/` (00–07) |
| **honesty** | `contracts_printable_ready=false` · **DENIED** printable module GO / seed / invent UAT |
| **ack_status** | **PASS_TO_PM** |

---

## 0. L0 / hard refresh

| Check | Result |
|-------|--------|
| `qc:dev-stack` | HRM 200 · XBOS 200 · portal 5173 200 |
| `qc:fe-be-health` | **ALL PASS** |
| BE probe | clauses **200** · templates **200** · contracts **200** |
| FE hard refresh | Settings + contracts reload before mutate (FE-03 bundle) |
| Seed | **DENIED** |

---

## 1. Exit criteria matrix

| # | AC | Verdict | Evidence |
|---|-----|---------|----------|
| 1 | Preview 2xx + **can_issue=true** | 🟢 | POST `…/preview?company_id=main` → **201** `HRM-CTR-PREV-200` · `can_issue=true` · `missing_fields=[]` · body keys `pack_code`,`template_id`,`field_overrides` · **no** `company_id` |
| 2 | Lưu phiên bản in + F5 list >0 | 🟢 | POST print-versions → **201** `HRM-CTR-VER-201` · F5/API versions **count=1** |
| 3 | PDF HTML stub GET 2xx (Q-CTR-02) | 🟢 | GET pdf → **200** `text/html` (browser click + Network) |
| 4 | must_keep UF-HRM-02 + Settings CL/TPL; preview body no company_id | 🟢 | Create **201** + F5 · Settings chrome · bodyClean=true · no HRM-VAL-001 |
| 5 | No DnD storm / mojibake / Uncaught; no seed | 🟢 | dndStorm=0 · uncaught=0 · mojibake=false |
| 6 | Evidence R3 | 🟢 | this file + FINAL JSON |

**Overall:** **PASS_TO_PM** — narrow print-spine GWC only · **DENIED** `contracts_printable_ready` / module printable UAT.

---

## 2. UF / AC blocks

### SMOKE Settings CL/TPL (must_keep re-smoke)
- Path: `/hr/settings` → tab Điều khoản HĐ → hard refresh → tab Mẫu DnD
- Chrome: `ctr-clause-code` · `ctr-tpl-*` palette/canvas visible
- Honesty stamp: `contracts_printable_ready=false`
- Process: dndStorm=0 · Uncaught=0 · mojibake=false
- Verdict: 🟢

### UF-HRM-02 — Registry create + Nơi làm việc + F5
- Path: `/hr/contracts` → Thêm → employee + type → **Nơi làm việc** (`ctr-work-location`) = `Hà Nội — trụ sở chính QA CTR3-HQV9ZW` → Lưu
- Network: POST contracts → **201** `HRM-CON-201` · id `e675c27d-f2bf-4295-bc69-1fcdc4899fa9` · code `HD-QVQ6L`
- FE sau 2xx + F5: row on list
- Verdict: 🟢

### AC-CTR-PRINT-SPINE — Preview / version / PDF (R3)
- Path: list pencil → `ctr-print-spine` → pack GENERAL · template → spine override prefilled from registry (`ctr-print-override-work_location`) → **Xem trước** → **Lưu phiên bản in** → F5 → PDF
- Network preview:
  - URL: `POST /api/hrm/contracts-insurance/contracts/{id}/preview?company_id=main`
  - Body: `{"pack_code":"GENERAL","template_id":"e1e8196c-…","field_overrides":{"work_location":"Hà Nội — trụ sở chính QA CTR3-HQV9ZW"}}` — **`company_id` absent**
  - Status: **201** `HRM-CTR-PREV-200`
  - `can_issue`: **true** · `missing_fields`: `[]` · `missing_clauses`: `[]`
- Network print-versions:
  - POST → **201** `HRM-CTR-VER-201` · body same shape (no `company_id`)
  - F5 / list API: **count=1**
- PDF (Q-CTR-02):
  - GET `…/print-versions/{id}/pdf?company_id=main` → **200** `text/html; charset=utf-8`
- Verdict: 🟢

---

## 3. Residuals

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-CTR-PREVIEW-COMPANY-ID-BODY** | P0 | — | **CLOSED** (R2+R3) | query-only; bodyClean |
| **R-CTR-PRINT-CAN-ISSUE** | P1 | — | **CLOSED** (R3) | registry `work_location` + spine `field_overrides` → `can_issue=true` |
| Q-CTR-02 PDF stub | — | — | **CLOSED** this slice | HTML stub 200 |
| Honesty / printable UAT | — | — | **DENIED** | `contracts_printable_ready=false` |

---

## 4. Honesty stamp (mandatory)

| Claim | Value |
|-------|--------|
| `contracts_printable_ready` | **false** |
| Promote printable UAT / module GO | **DENIED** |
| Seed used | **DENIED** |
| Narrow slice | print-spine can_issue → version → PDF 🟢 only |

---

## 5. HDSD inventory (U76)

| Step | Cue |
|------|-----|
| Settings smoke | `settings-tab-contract-legal` · `ctr-clause-*` · `ctr-tpl-*` |
| Registry | `hdsd-contracts-create-btn` · `ctr-work-location` · Lưu |
| Print spine | `ctr-print-spine` · `ctr-print-field-overrides` · `ctr-print-override-work_location` · `ctr-print-preview-btn` · `ctr-print-save-version` · `ctr-print-versions` · `ctr-print-pdf-*` |
| F5 | after contract save · after print-version |

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | R3 browser: L0 PASS. **R-CTR-PRINT-CAN-ISSUE CLOSED** — preview **201** `can_issue=true` (work_location registry + spine override). print-versions **201** · F5 versions=1 · PDF stub **200** HTML. must_keep CL/TPL + UF-HRM-02 🟢 · body no `company_id` · process/honesty 🟢. **DENIED** printable module UAT. No seed. |
| **next_owner** | **qc** — narrow print-spine GWC (not module printable UAT) |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-contract-legal-print-qa-01-r3.md` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-QC-01
from_role: pm
to_role: qc
lane: governance
u65: zero-seed · browser evidence already captured
parent: PO-HRM-CONTRACT-LEGAL-PRINT-QA-01-R3 PASS_TO_PM
honesty: contracts_printable_ready=false — DENIED printable module GO / UAT

entry_criteria:
- Evidence: docs/qa/evidence/po-hrm-contract-legal-print-qa-01-r3.md
- Machine: docs/qa/evidence/_tmp-po-hrm-contract-legal-print-qa-01-r3.FINAL.json
- FE-03: docs/qa/evidence/po-hrm-contract-legal-print-fe-03.md
- Closed residuals: R-CTR-PREVIEW-COMPANY-ID-BODY · R-CTR-PRINT-CAN-ISSUE · Q-CTR-02 stub this slice

scope (NARROW — print-spine GWC only):
1) Audit QA R3 exit: preview can_issue=true · print-versions 201 · F5 versions>0 · PDF HTML 200
2) Confirm must_keep UF-HRM-02 + Settings CL/TPL not regressed; preview body still no company_id
3) Confirm process gate clean (no DnD storm / mojibake / Uncaught)
4) Stamp GO WITH CONDITIONS for print-spine slice ONLY
5) Explicit DENY: contracts_printable_ready=true · module printable UAT · invent GO full contracts

exit_criteria:
- qc evidence: docs/qa/evidence/po-hrm-contract-legal-print-qc-01.md
- verdict: GO WITH CONDITIONS | NO-GO
- residual list (if any) with owner
- honesty stamp false mandatory

ack_status: PASS_TO_PM
```
