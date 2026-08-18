# Evidence — `PO-HRM-AMIS-PARITY-PAY-TPL-FE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-TPL-FE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-07 |
| **lane** | execution |
| **priority** | P0 |
| **depends_on** | `PO-HRM-AMIS-PARITY-PAY-TPL-QC-01` GO WITH CONDITIONS |
| **parallel** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-01` — separate surfaces (formulas tab ≠ mẫu Settings) |
| **change_mode** | **ADD** |
| **ack_status** | **`READY_FOR_QA`** |
| **honesty** | **`payroll_e2e_ready=false`** · **DENIED** flip / module UAT / AMIS DONE |

### Honesty locks

| Flag | Value |
|------|-------|
| **`payroll_e2e_ready`** | **`false`** (badge on panel + catalog const) |
| **DnD formula canvas** | **DENIED** — form GĐ1 only |
| **Merge pack as mẫu** | **DENIED** — enroll tab banner + Settings note |
| **FE net / formula engine** | **DENIED** — OV-C = definition_id picker only |
| **Seed** | **DENIED** (U65) |

---

## spec_read_ack

| Artifact | Used |
|----------|------|
| `po-hrm-amis-parity-pay-tpl-qc-01.md` | Residual **R-PAY-TPL-FE** · GWC CONDITIONS · ready=false |
| `po-hrm-amis-parity-pay-tpl-qa-01.md` | L1 AC1–7 path contract |
| `PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md` | F-PAY-SHEET-TPL-LIST/UPSERT/LINES/ARCHIVE · OV-C · pack≠mẫu |
| `po-hrm-amis-parity-pay-depth-01.md` | OV-C Option B · RJ-PAY-DND-01 · RJ-PAY-ENROLL-01 |
| Existing payroll Settings / formula neo | Coordinated — did **not** merge PayFormulaAuthorPanel / salary-templates pack |

### solid_convention_ack (FE–BE)

- FE binds Nest display-ready camelCase (`code`/`name`/`displayLabel`/`status`/`formulaOverride*`).
- No FE amount/net invent; no evaluate AST; OV-C = published `formulaOverrideDefinitionId` picker.
- Enroll pack (`/salary-templates*`) remains separate UI + API.

---

## Delivered

| Surface | Path / testid |
|---------|----------------|
| Settings tab | `/settings` → **Mẫu bảng lương** · `settings-tab-pay-sheet-tpl` |
| Panel | `PaySheetTemplateSettingsPanel` · `pay-sheet-tpl-settings-panel` |
| API client | `hrmApi` `list/create/update/lines/archive/bind` → `/api/hrm/payroll/pay-sheet-templates*` |
| Catalog helpers | `lib/paySheetTemplateCatalog.ts` (+ vitest **6 PASS**) |
| Pack≠mẫu | `SalaryTemplatesTab` banner `pay-salary-template-pack-alias-note` |

### Click path (QA U65 browser)

1. Login `ceo@xe.vn` / `Xevn@2026` → portal HRM embed.
2. **Cài đặt** → tab **Mẫu bảng lương** (`settings-tab-pay-sheet-tpl`).
3. Nhập mã + tên → **Tạo mẫu** (`hdsd-pay-sheet-tpl-save-header`) → Network **POST** `…/pay-sheet-templates` **201** `HRM-PAY-TPL-201`.
4. Thêm cột: chọn thành phần + nhãn + (tuỳ chọn) OV-C formula → **Lưu cột** → **PUT** `…/lines` **200**.
5. F5 / **Tải lại** → row còn trong `pay-sheet-tpl-list-table`.
6. **Lưu trữ** → row ẩn khỏi list mặc định (soft-hide).
7. Regression: Payroll → Tính lương → gói enroll vẫn `/salary-templates` + banner pack≠mẫu.

### Optional bind period

API helper `bindPaySheetTemplateToPeriod` wired in `hrmApi` — **UI bind on period dialog skipped** (blast control; primary AC via Settings CRUD).

---

## Unit evidence

```text
pnpm exec vitest run src/lib/paySheetTemplateCatalog.test.ts
→ Test Files 1 passed · Tests 6 passed
```

---

## Residual / not promoted

| ID | Note |
|----|------|
| Period bind UX on Tạo kỳ | Optional — API ready, UI deferred |
| Formula DnD / LIVE process | Out of scope · honesty false |
| Browser UF PASS | **QA next** — this seat READY_FOR_QA only |

---

## completion_report

### Closed

1. Settings GĐ1 mẫu bảng lương wired to Nest `pay-sheet-templates*` (list/create/patch/lines/archive).
2. Lines: component · display_label · sort_order · OV-C `formula_override_definition_id` picker.
3. Soft archive hide; display-ready vi-VN labels; pack≠mẫu banner on enroll tab.
4. CODE-MEMORY APPEND VI · solid_convention_ack FE–BE · vitest 6 PASS.
5. Honesty: `payroll_e2e_ready=false`.

### Residual

Browser U65 QA · optional period bind UX · formula/process waves separate.

---

## Handoff

| Field | Value |
|-------|--------|
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-tpl-fe-01.md` |
| **ack_status** | **`READY_FOR_QA`** |
| **next_dispatch_prompt** | see below |

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-TPL-QA-02
from_role: pm
to_role: qa
lane: execution
priority: P0
prior: PO-HRM-AMIS-PARITY-PAY-TPL-FE-01 READY_FOR_QA
U65: browser-only · zero-seed

## Mission
Browser UF Settings → Mẫu bảng lương: create → edit lines (label/sort/OV-C) → F5 list → archive soft-hide.
Confirm enroll SalaryTemplatesTab remains pack-only (banner + /salary-templates).
Cấm claim payroll_e2e_ready=true.

## read_first
1. docs/qa/evidence/po-hrm-amis-parity-pay-tpl-fe-01.md
2. docs/qa/evidence/po-hrm-amis-parity-pay-tpl-qc-01.md
3. docs/program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md

## exit
evidence: docs/qa/evidence/po-hrm-amis-parity-pay-tpl-qa-02.md
honesty: payroll_e2e_ready=false
PASS_TO_PM → QC slice if UF PASS
```
