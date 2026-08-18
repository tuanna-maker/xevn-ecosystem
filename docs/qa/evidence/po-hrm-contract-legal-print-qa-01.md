# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-QA-01` |
| **role** | qa |
| **lane** | execution · U65 zero-seed · browser-only |
| **date** | 2026-08-06 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-FE-01` READY · `PO-HRM-CONTRACT-LEGAL-PRINT-BE-01` READY |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-contract-legal-print-qa-01.FINAL.json` |
| **harness** | `scripts/qa/_tmp-po-hrm-contract-legal-print-qa-01.mjs` |
| **screens** | `docs/qa/evidence/screens/po-hrm-contract-legal-print-qa-01/` (00–12) |
| **honesty** | `contracts_printable_ready=false` · **DENIED** printable UAT / seed / API-only PASS |
| **ack_status** | **FAIL_TO_PM** (R1) → see **R2** `docs/qa/evidence/po-hrm-contract-legal-print-qa-01-r2.md` |

> **R2 (2026-08-06):** FE-02 retest — `R-CTR-PREVIEW-COMPANY-ID-BODY` **CLOSED** (preview 201, body no `company_id`). Still **FAIL_TO_PM** on print-version/PDF: `can_issue=false` missing `work_location`. Honesty false.

---

## 0. L0 / BE restart

| Check | Result |
|-------|--------|
| `qc:dev-stack` | HRM 200 · XBOS 200 · portal 5173 200 (portal restarted mid-wave) |
| BE restart | Killed stale `:28001` · started `node dist/main.js` (dist already had `contract-clauses` routes) |
| Live probe | GET clauses **200** `HRM-CTR-CL-200` · templates **200** `HRM-CTR-TPL-200` |
| `nest build` | **FAIL** TS2345 `contract-legal-print.service.ts:1038` `custom_fields` — OBS residual; QA used existing dist emit |

---

## 1. Round history (same work_item — APPEND)

### R0 — BE not live (stale dist)

| AC / UF | Verdict |
|---------|---------|
| AC-CTR-CL-01 | 🟡 **BLOCKED-BE** (POST clauses **404**) |
| AC-CTR-TPL-DND | 🟡 **BLOCKED-BE** (chrome OK · no mutate 2xx) |
| AC-CTR-PRINT-SPINE | 🟡 **BLOCKED-BE** (honesty + library error honest) |
| UF-HRM-02 | not completed that pass |
| Process | Settings chrome OK · no DnD storm |

*Not FE FAIL — BE routes missing on running process.*

### R1 — LIVE BE (this evidence)

| ID | Verdict | Evidence highlight |
|----|---------|-------------------|
| **SETTINGS_CHROME** | 🟢 | Tab Điều khoản HĐ · form · honesty `=false` · no mojibake · loadError=false |
| **AC-CTR-CL-01** | 🟢 | Create `LEGAL_*` (LEGAL_BASIS) + `JOB_*` → POST **201** → Hiệu lực → **F5** rows `active` |
| **AC-CTR-TPL-DND** | 🟢 | Palette→canvas DnD ×2 · reorder · Lưu POST **201** · activate · **F5** orderMatch=true |
| **UF-HRM-02** | 🟢 | Thêm HĐ → formReady → Lưu POST **201** `HRM-CON-201` · F5 list `HD-Q22SA` |
| **AC-CTR-PRINT-SPINE** | 🔴 | Edit pencil → spine visible · template select · **Xem trước POST 400** `HRM-VAL-001` `property company_id should not exist` · no version · no PDF |
| **HONESTY** | 🟢 | Settings + spine show `contracts_printable_ready=false` |
| **PROCESS_GATE** | 🟢 | dndStorm=0 · Uncaught=0 · pageErrors=0 · (1 console Failed to load 400 — expected handled) |

---

## 2. UF evidence blocks (R1)

### AC-CTR-CL-01 — Settings clause create→active→F5
- Path: `/hr/settings` → tab **Điều khoản HĐ** → `ctr-clause-*` → Lưu → **Hiệu lực**
- Network: POST `/contract-clauses` → **201** · POST `…/activate` → **2xx**
- Codes: `LEGAL_CTRQA-HQ0R2B` · `JOB_CTRQA-HQ0R2B`
- F5: both rows visible · status **active**
- Verdict: 🟢

### AC-CTR-TPL-DND — Template order persist
- Path: tab **Mẫu theo loại (DnD)** · `ctr-tpl-*` · drag palette→canvas · reorder · Lưu · activate
- Network: POST templates **201** `HRM-CTR-TPL-201` · activate 2xx
- F5: `ctr-tpl-row-TPL_CTRQA-HQ0R2B` · canvas orderMatch=true
- Process: no missing drag handle storm
- Verdict: 🟢

### UF-HRM-02 — Registry CRUD regression
- Path: `/hr/contracts` → Thêm → employee + type → Lưu
- Network: POST contracts → **201** `HRM-CON-201` · id `619e4c5f-…` · code `HD-Q22SA`
- FE sau 2xx + F5: row on list
- Verdict: 🟢 · must_keep OK

### AC-CTR-PRINT-SPINE — Preview / version / PDF
- Path: list pencil (2nd icon) → edit dialog · `ctr-print-spine` · pick pack/template · **Xem trước**
- Network: POST `…/contracts/{id}/preview` → **400** `HRM-VAL-001` · message **`property company_id should not exist`**
- Root cause: FE `previewContractPrint` JSON body includes `company_id`; BE `ContractPreviewDto` forbidNonWhitelisted
- print-versions list: **200** count=0 (never issued)
- PDF: not reached · Q-CTR-02 stub N/A until version exists
- Verdict: 🔴 · **not** invent printable success

---

## 3. HDSD inventory (U76)

| Step | Cue |
|------|-----|
| Settings clause | `settings-tab-contract-legal` · `ctr-clause-save` · Hiệu lực |
| Template DnD | `ctr-tpl-palette` · `ctr-tpl-canvas` · `ctr-tpl-save` |
| Registry | `hdsd-contracts-create-btn` · `hdsd-contracts-form-*` |
| Print spine | `ctr-print-spine` · `ctr-print-preview-btn` · honesty |
| F5 | after clause / template / contract save |

---

## 4. Honesty stamp (mandatory)

| Claim | Value |
|-------|--------|
| `contracts_printable_ready` | **false** |
| Promote printable UAT / module GO | **DENIED** |
| Seed used | **DENIED** |
| Narrow slice | Settings CL+TPL + UF-HRM-02 🟢 · print preview 🔴 |

---

## 5. Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-CTR-PREVIEW-COMPANY-ID-BODY** | **P0** | **dev-fe** | Strip `company_id` from POST preview / print-version body (or BE whitelist). Blocks AC-CTR-PRINT-* mutate. |
| OBS-HRM-API-NEST-BUILD-TS2345 | P1 | dev-be | `nest build` TS2345 custom_fields; dist restart workaround |
| Q-CTR-02 | P2 | SA/DevOps | PDF HTML stub — assert after preview/version green |

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | R0 BLOCKED-BE appended. R1 live BE: AC-CTR-CL-01 🟢 · TPL DnD 🟢 · UF-HRM-02 🟢 · process/honesty 🟢 · **AC-CTR-PRINT-SPINE 🔴** FE body `company_id` → HRM-VAL-001. Honesty false. No seed. |
| **next_owner** | **dev-fe** (P0 preview body) → qa R2 |
| **ack_status** | **FAIL_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-contract-legal-print-qa-01.md` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-FE-02
from_role: pm
to_role: dev-fe
lane: execution
parent: PO-HRM-CONTRACT-LEGAL-PRINT-QA-01 FAIL_TO_PM
entry_criteria: QA evidence docs/qa/evidence/po-hrm-contract-legal-print-qa-01.md · residual R-CTR-PREVIEW-COMPANY-ID-BODY
spec_ref: ContractPreviewDto / CreatePrintVersionDto — no company_id in body; FE hrmApi previewContractPrint + createContractPrintVersion
task: Remove company_id from POST body for /contracts/:id/preview and /print-versions (keep company_id query/header per other HRM mutate). Reuse Settings DnD + UF-HRM-02 must_keep. Honesty contracts_printable_ready=false.
exit_criteria: READY_FOR_QA · evidence docs/qa/evidence/po-hrm-contract-legal-print-fe-02.md
forbidden: seed · claim printable UAT · wipe registry
then: PM Task qa PO-HRM-CONTRACT-LEGAL-PRINT-QA-01 R2 — preview 2xx → save print-version → open PDF HTML stub 2xx
```
