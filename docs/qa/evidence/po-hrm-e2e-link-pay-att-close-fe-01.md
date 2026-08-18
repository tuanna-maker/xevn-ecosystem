# Evidence — PO-HRM-E2E-LINK-PAY-ATT-CLOSE-FE-01

| Field | Value |
|-------|-------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-ATT-CLOSE-FE-01` |
| from_role | dev-fe |
| to_role | qa |
| ack_status | **`READY_FOR_QA`** |
| parent | `PO-HRM-E2E-LINK-PAY-ATT-CLOSE-01` · residual **R-ATT-SHEET-SUBMIT-SIGN-GAP** |
| date | 2026-08-06 |
| spec_ref | FR-UC-BP-ATT-10 · FR-UC-BP-ATT-11 · J-HRM-06c · BR-BP-TS-02 |
| u65 | zero-seed · browser-only · cấm seed / payroll_e2e_ready=true |

## Root cause (QA run B)

1. **Sau POST 201 tạo bảng Jan 2026** — FE đóng dialog nhưng **không** chọn `result.id` → harness/ user mở **row đầu list** (sheet khác tháng / trạng thái khác).
2. **Submit → sign panel** — sau POST submit, parent list refetch có độ trễ → panel vẫn render `att-sign-panel-hold-draft` thay vì `att-sign-panel` + nút ký.

## Fix (FE)

| File | Change |
|------|--------|
| `apps/web/hrm/src/pages/Attendance.tsx` | `handleAddSheet`: sau `createSheet` 201 → `handleOpenSheet(result.id)` (weekly view + sign panel đúng sheet) |
| `Attendance.tsx` | `handleSheetMutated` await `refetchAttendanceSheets()` trước khi panel re-render |
| `Attendance.tsx` | `data-active-sheet-id` trên `att-weekly-precision` để harness assert đúng sheet |
| `AttendanceSheetSignPanel.tsx` | `statusBoost` từ POST submit response → chuyển draft→submitted ngay; `loadSignatures()` sau mutate |

## must_keep

- `att-sheet-submit` · `att-sign-panel-hold-draft` · `att-sign-panel` · `att-sign-confirm-*` · `att-sign-close-sheet`
- U65 no seed; scope `company_id=main` qua AuthContext (không đổi)

## Verification (dev)

| Check | Result |
|-------|--------|
| `vitest run src/hooks/useAttendanceSheets.test.ts` | **2/2 PASS** |
| `tsc --noEmit -p tsconfig.app.json` | **PASS** (no errors on touched paths) |
| Linter touched files | **0 issues** |

## QA retest matrix (browser U65)

| Step | Expected |
|------|----------|
| Login `ceo@xe.vn` → `/hr/attendance` → Bảng chấm công | List load |
| **att-sheets-add** → tạo Jan 2026 (01/01–28/01/2026) → Lưu | POST 201; **auto weekly view**; `data-active-sheet-id` = id mới |
| **att-sign-panel-hold-draft** visible | **att-sheet-submit** enabled |
| Click **Gửi chờ ký** | POST submit 2xx → **att-sign-panel** + 3× **att-sign-confirm-*** |
| Ký NV → QL → HCNS | POST signatures 201 ×3 |
| **att-sign-close-sheet** | enabled → POST close 201 → status closed |
| F5 | Sheet vẫn closed |
| Payroll Jan draft → eligibility | `eligible_count ≥ 1` (cần BE month linkage nếu vẫn 0 — `PO-HRM-E2E-LINK-PAY-ATT-CLOSE-BE-01`) |

## Residual (not FE)

| ID | Owner | Note |
|----|-------|------|
| R-PAY-ATT-MONTH-LINK | dev-be | Payroll `NO_CLOSED_SHEET` nếu evaluator không khớp tháng Jan |
| R-PAY-PERIOD-ROW-NAV | dev-fe | Payroll list row click — ngoài scope wave này |

## completion_report

- **Closed:** Auto-navigate vào sheet vừa tạo; submit→sign panel transition; await refetch on mutate.
- **Not closed (QA):** Full J-HRM-06c + AC-PAY-HIRE-04 browser on Jan 2026 closed sheet.
- **Not promoted:** `payroll_e2e_ready` — chờ QA retest parent `PO-HRM-E2E-LINK-PAY-ATT-CLOSE-01`.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-01-QA-RET
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-FE-01 READY_FOR_QA

read_first:
- docs/qa/evidence/po-hrm-e2e-link-pay-att-close-fe-01.md
- docs/qa/evidence/po-hrm-e2e-link-pay-att-close-01.md (prior FAIL)

entry_criteria: L0 PASS; portal :5175; ceo@xe.vn company_id=main; U65 zero-seed
exit_criteria:
- FE create Jan 2026 sheet → auto weekly + att-sheet-submit → submit → 3 signatures → close 201
- assert data-active-sheet-id = created id (not first list row)
- J-HRM-06c PASS for payroll month; probe eligibility eligible_count ≥ 1 or document BE residual
evidence: docs/qa/evidence/po-hrm-e2e-link-pay-att-close-01.md (update verdict)
ack_status: PASS_TO_PM or FAIL_TO_PM
```
