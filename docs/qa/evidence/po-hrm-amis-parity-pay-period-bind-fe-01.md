# Evidence — `PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-FE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-FE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-07 |
| **lane** | execution |
| **priority** | P0 |
| **parent** | `PO-HRM-AMIS-PARITY-RESEARCH-01` |
| **depends_on** | `PO-HRM-AMIS-PARITY-PAY-TPL-FE-01` · BE `pay-sheet-templates` + period bind |
| **change_mode** | **ADD** |
| **ack_status** | **`READY_FOR_QA`** |
| **honesty** | **`payroll_e2e_ready=false`** · **U65 zero-seed** |

### Honesty locks

| Flag | Value |
|------|-------|
| **`payroll_e2e_ready`** | **`false`** |
| **Seed** | **DENIED** (U65) |
| **Pack≠mẫu** | **ENFORCED** — create dialog uses `/pay-sheet-templates` only; cấm `salary-templates` picker |
| **Process LIVE** | **DENIED** — bind snapshot on create only |

---

## spec_read_ack

| Artifact | Used |
|----------|------|
| `po-hrm-amis-parity-pay-tpl-fe-01.md` | Settings CRUD prior · API helpers |
| `PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md` | F-PAY-PERIOD-01 EXPAND · `paySheetTemplateId` on POST |
| `po-hrm-amis-parity-pay-depth-01.md` | **AC-PAY-TPL-03** · RJ-PAY-ENROLL-01 |

### solid_convention_ack (FE–BE)

- POST `/api/hrm/payroll/periods` body `paySheetTemplateId` → BE bind snapshot (`sheet_template_snapshot_json.template_name`).
- FE maps display from snapshot via `resolvePaySheetTemplateDisplayFromPeriod` — không FE net / không invent cột.
- Zod bắt buộc chọn mẫu active trước Network.

---

## Delivered

| Surface | Path / testid |
|---------|----------------|
| Tạo kỳ dialog | `/payroll` → **Lập bảng lương** · `pay-batch-create-dialog-precision` |
| Mẫu picker | `pay-period-pay-sheet-tpl-select` · options `pay-period-pay-sheet-tpl-option-{code}` |
| Alias note | `pay-period-pay-sheet-tpl-alias-note` — pack enroll ≠ mẫu kỳ |
| Submit | `hdsd-pay-period-create-submit` → POST `…/periods` + `paySheetTemplateId` |
| List column | **Mẫu bảng lương** · `pay-batch-row-tpl-{periodId}` |
| Detail header | Subtitle `Mẫu: {name}` when bound |
| Hook | `usePaySheetTemplates` — `listPaySheetTemplates` `active_only=true` |
| Helpers | `payrollPaySheetTemplateSelect.ts` · `resolvePaySheetTemplateDisplayFromPeriod` |

### Click path (QA U65 browser — AC-PAY-TPL-03)

1. Login `ceo@xe.vn` / `Xevn@2026` → HRM **Tiền lương** → tab **Đợt tính lương**.
2. **Cài đặt → Mẫu bảng lương**: đảm bảo có ≥1 mẫu **active** (prior UF TPL-FE-01).
3. **Lập bảng lương** → nhập tên + tháng/năm → chọn **Mẫu bảng lương** * (active) → **Lập bảng lương**.
4. Network: **POST** `/api/hrm/payroll/periods` **201** `HRM-PAY-201` · body có `paySheetTemplateId`.
5. Response `data`: `pay_sheet_template_id` + `sheet_template_snapshot_json.template_name`.
6. Row list / detail: cột **Mẫu bảng lương** + subtitle hiển thị tên snapshot.
7. **F5** → kỳ còn; mẫu còn nếu GET list trả snapshot (xem residual BE list).
8. Regression: tab **Tính lương → Gói thành phần** vẫn `/salary-templates` + banner pack≠mẫu — không dùng làm picker tạo kỳ.

---

## Unit evidence

```text
pnpm exec vitest run \
  src/lib/paySheetTemplateCatalog.test.ts \
  src/components/payroll/payrollPaySheetTemplateSelect.test.ts \
  src/components/payroll/__tests__/payrollPeriodFormSchema.test.ts
→ Test Files 3 passed · Tests 13 passed
```

---

## Residual / not promoted

| ID | Note | Owner |
|----|------|-------|
| **R-PAY-PERIOD-LIST-TPL** | `GET /payroll/periods` list SELECT chưa trả `pay_sheet_template_id` / snapshot — F5 row có thể `—` sau refetch | **dev-be** expand `mapPeriod` + list SQL |
| Browser UF PASS | **QA** — seat READY_FOR_QA only |
| Process / SRC LIVE | Out of scope · honesty false |

---

## completion_report

### Closed

1. Tạo kỳ: SELECT active `pay_sheet_templates` (không `salary_templates` pack).
2. POST `paySheetTemplateId` → snapshot on create (BE bind).
3. Hiển thị `template_name` trên row + detail từ snapshot DTO.
4. Zod required mẫu · alias note pack≠mẫu · vitest 13 PASS.
5. `payroll_e2e_ready=false`.

### Residual

Browser U65 QA · BE list snapshot fields for F5 row persistence.

---

## Handoff

| Field | Value |
|-------|--------|
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-fe-01.md` |
| **ack_status** | **`READY_FOR_QA`** |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P0
prior: PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-FE-01 READY_FOR_QA
U65: browser-only · zero-seed

## Mission
Browser AC-PAY-TPL-03: Settings có mẫu active → Lập bảng lương → chọn mẫu * → POST paySheetTemplateId 201 → row/detail tên mẫu → F5.
Cấm dùng salary-templates enroll làm mẫu kỳ. Cấm claim payroll_e2e_ready=true.
Nếu F5 row mất tên mẫu → FAIL + ghi R-PAY-PERIOD-LIST-TPL → dev-be.

## read_first
1. docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-fe-01.md
2. docs/qa/evidence/po-hrm-amis-parity-pay-tpl-fe-01.md
3. docs/qa/evidence/po-hrm-amis-parity-pay-depth-01.md § AC-PAY-TPL-03

## exit
evidence: docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-qa-01.md
honesty: payroll_e2e_ready=false
PASS_TO_PM if UF PASS (flag BE list residual if F5 gap)
```
