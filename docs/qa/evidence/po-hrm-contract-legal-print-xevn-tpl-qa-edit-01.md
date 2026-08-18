# Evidence — `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QA-EDIT-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QA-EDIT-01` |
| **role** | qa |
| **lane** | execution · U65 zero-seed · browser-only |
| **date** | 2026-08-07 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-FE-EDIT-01` READY_FOR_QA |
| **prior** | QC-02 GWC CONDITION `R-CTR-XEVN-TPL-FE-EDIT-RESTORE` OPEN (`f5KeepsTpl=false`) |
| **residual** | `R-CTR-XEVN-TPL-FE-EDIT-RESTORE` |
| **spec** | CORR-01 AC-CTR-XEVN-11 · DYNAMIC LOCK · edit F5 keep picker |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-contract-legal-print-xevn-tpl-qa-edit-01.FINAL.json` |
| **harness** | `scripts/qa/_tmp-po-hrm-contract-legal-print-xevn-tpl-qa-edit-01.mjs` |
| **screens** | `docs/qa/evidence/screens/po-hrm-contract-legal-print-xevn-tpl-qa-edit-01/` (00–07) |
| **stamp** | `EDIT-IFUBE8` · tpl `XEVN_CUSTOM_EDIT-IFUBE8` · HĐ `HD-FUZ5S` · id `596d9280-…` |
| **honesty** | `contracts_printable_ready=false` · **DENIED** printable UAT / seed / API-only PASS |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** · `f5KeepsTpl=true` |

---

## 0. L0 / health

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM / XBOS / portal **200** (Windows UV assertion after PASS — non-blocking) |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| Seed | **none** (U65) |

---

## 1. Verdict matrix

| ID | Verdict | Evidence |
|----|---------|----------|
| **AC-CREATE-TPL-9** | 🟢 **PASS** | Settings → create open-catalog `XEVN_CUSTOM_EDIT-IFUBE8` → POST **2xx** · F5 row còn |
| **AC-CREATE-BIND-PICKER** | 🟢 **PASS** | Create HĐ spine → select #9 · trigger shows `XEVN_CUSTOM_EDIT-IFUBE8` |
| **AC-CREATE-SAVE-F5** | 🟢 **PASS** | Create POST **2xx** bound `template_code=#9` · F5 list `HD-FUZ5S` |
| **R-CTR-XEVN-TPL-FE-EDIT-RESTORE** | 🟢 **PASS** | F5 → **Sửa** (no re-select) · picker ≠ «— Chưa chọn —» · `f5KeepsTpl=true` |
| **PROCESS-HYGIENE** | 🟢 **PASS** | dndStorm=0 · Uncaught=0 · mojibake=false |
| **print-spine** (must_keep) | 🟢 **PASS** | `ctr-print-spine` visible on create + edit |
| **UF-HRM-02** (must_keep) | 🟢 **PASS** | Create HĐ 2xx + F5 list |
| **open-catalog** (must_keep) | 🟢 **PASS** | Custom #9 created (not ceiling-8) |
| **Q-CTR** (must_keep) | 🟢 **PASS** | Not reopened |
| **Honesty** | 🟢 | `contracts_printable_ready=false` retained |

---

## 2. Residual retest (browser U65)

### Goal
Close QC-02 CONDITION: create bind template #9 → F5 → open **Sửa** → print template picker still shows #9 (not empty «— Chưa chọn —»).

### Click path
1. Login `ceo@xe.vn` → `/hr/settings?tab=contract-legal` → templates
2. Tạo mẫu `XEVN_CUSTOM_EDIT-IFUBE8` · pack GENERAL · matrix null · Hiệu lực → Lưu → F5 row
3. `/hr/contracts` → Thêm → spine GENERAL → chọn option #9 → Lưu → Network POST **2xx** `template_code=XEVN_CUSTOM_EDIT-IFUBE8`
4. **F5** list → row `HD-FUZ5S`
5. Click **Sửa** (pencil) — **do not** re-select template
6. Assert `ctr-print-template` trigger text contains `XEVN_CUSTOM_EDIT-IFUBE8` · not «— Chưa chọn —»
7. Optional: Preview without re-select → body `template_code=#9`

### Machine signals

| Signal | Value |
|--------|-------|
| `f5KeepsTpl` | **true** |
| `ids.editTrigText` | `Mẫu EDIT restore EDIT-IFUBE8 (XEVN_CUSTOM_EDIT-IFUBE8) · HĐLĐ EDIT EDIT-IFUBE8` |
| `ids.isEmptyPick` | **false** |
| Preview no-reselect | `prevOk=true` · `bodyHasTpl=true` · `bodyCode=XEVN_CUSTOM_EDIT-IFUBE8` |
| residual status | **CLOSED** |

### Screenshot
- `06-edit-after-f5-picker.png` — dialog **Chỉnh sửa hợp đồng** · picker **bound #9** (not empty) · honesty banner `contracts_printable_ready=false`

### Verdict
🟢 **PASS** — CONDITION `R-CTR-XEVN-TPL-FE-EDIT-RESTORE` **CLOSED** for product. Demote prior QA-02 OBS / QC-02 CONDITION.

---

## 3. must_keep (retained)

| Item | Status |
|------|--------|
| print-spine | PASS |
| UF-HRM-02 | PASS |
| open catalog | PASS |
| Q-CTR CLOSED | not reopened |
| AC-11 create/picker core | not demoted |

---

## 4. Residual

| ID | Sev | Owner | Status |
|----|-----|-------|--------|
| `R-CTR-XEVN-TPL-FE-EDIT-RESTORE` | P1 | dev-fe | **CLOSED** — `f5KeepsTpl=true` |
| Printable module UAT | — | — | **DENIED** (`contracts_printable_ready=false`) |
| Phase 1 DONE | — | — | **NOT claimed** |

---

## 5. Honesty

```text
contracts_printable_ready = false
```

**DENIED:** invent printable ready · seed · API-only UF 🟢 · Phase 1 DONE · reopen Q-CTR.

**C-SLICE-≠-MODULE** — this seat closes edit-restore CONDITION only; not contracts printable module UAT.

---

## 6. L2.5 / journey note

| Journey | Scope | QA |
|---------|-------|-----|
| Edit F5 restore (AC-11 edit UI) | This seat | 🟢 PASS |
| J-HRM-CTR-07 create/picker/preview | Prior QA-02 sealed | retained · not reopened |
| Module printable UAT | Out of scope | **DENIED** |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | U65 browser retest **PASS** — create bind #9 `XEVN_CUSTOM_EDIT-IFUBE8` → F5 → Sửa picker still #9 (`f5KeepsTpl=true`); preview no-reselect bodyHasTpl; must_keep spine/UF-02/open-catalog; honesty false; residual CLOSED |
| **next_owner** | **qc** — delta close GWC CONDITION |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qa-edit-01.md` |
| **pm_dispatch_hint** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QC-EDIT-01` — QC delta close CONDITION `R-CTR-XEVN-TPL-FE-EDIT-RESTORE` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QC-EDIT-01
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QA-EDIT-01 PASS_TO_PM
residual_auto_fix: true

## Goal
QC delta — close GWC CONDITION R-CTR-XEVN-TPL-FE-EDIT-RESTORE after QA-EDIT PASS (f5KeepsTpl=true).

## read_first
1. docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qa-edit-01.md
2. docs/qa/evidence/_tmp-po-hrm-contract-legal-print-xevn-tpl-qa-edit-01.FINAL.json
3. docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qc-02.md (CONDITION OPEN baseline)
4. PNG 06-edit-after-f5-picker.png

## entry
- QA-EDIT overall PASS · stamp EDIT-IFUBE8 · HD-FUZ5S
- f5KeepsTpl=true · editTrig shows XEVN_CUSTOM_EDIT-IFUBE8 · not «— Chưa chọn —»
- previewWithoutReselect bodyHasTpl=true
- honesty contracts_printable_ready=false · DENIED invent printable UAT
- must_keep: print-spine · UF-HRM-02 · open catalog · Q-CTR not reopened

## exit
- CONDITION CLOSED on QC evidence delta
- retain GO WITH CONDITIONS honesty / C-SLICE-≠-MODULE OR promote slice note only
- cấm: contracts_printable_ready=true · Phase 1 DONE · reopen sealed AC-11 create

evidence_path: docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qc-edit-01.md
ack_status: PASS_TO_PM
```
