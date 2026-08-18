# Evidence — PO-HRM-MVP-GD1-PAY-09-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-09-CLUSTER-FE-01` |
| **role** | dev-fe |
| **date** | 2026-08-10 |
| **depends_on** | `PAY09QC1-MSMGBGWC1` GWC · BE-01/02 · API-01 F-PAY-GROUP-01 · BA AC-PAY-GROUP-* |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · C-SLICE · **≠ FR-UC-BP-PAY-09 / PAY module UAT DONE** |
| **must_keep** | PAY01QC1..PAY08QC1 · PAY-08 payslip lifecycle · no reorder PAY pipeline |

## spec_read_ack

- BA: `docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-BA-01.md` — AC-PAY-GROUP-CATALOG-SOT · PERIOD-SCOPE · REPORT-FILTER · O18 honesty
- API: `docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-API-01.md` §4.1–4.5 · §4.2 members preview
- QC prior: `docs/qa/evidence/po-hrm-mvp-gd1-pay-09-cluster-qc-01.md` — J-09-01/02/03/04 FE HOLD

## Closed scope (narrow FE-01)

| Item | Status |
|------|--------|
| `GET/POST/PATCH /api/hrm/payroll/groups*` + members preview in `hrmApi.ts` | PASS |
| `PayrollGroupsCatalogTab` — CRUD · rule fields · retire · members preview | PASS |
| `PayrollPeriodGroupScopePanel` — PATCH `payroll_group_id` on period detail | PASS |
| Create period optional `payroll_group_id` (`PayrollBatchesTab`) | PASS |
| Payslip list `payroll_group_id` filter + label column (`PayrollPayslipsApiTab`) | PASS |
| Menu: Lương → Chính sách → Phân nhóm bảng lương | PASS |
| Honesty footers · deny hardcode VP/KD/TX/VH · no FE net/group SoT | PASS |

## Files touched

- `apps/web/hrm/src/integrations/hrmApi.ts`
- `apps/web/hrm/src/lib/payPay09GroupRing.ts` (+ `.test.ts`)
- `apps/web/hrm/src/lib/poHrmMvpGd1Pay09ClusterFe01.source.test.ts`
- `apps/web/hrm/src/hooks/usePayrollGroups.ts`
- `apps/web/hrm/src/hooks/usePayrollBatches.ts`
- `apps/web/hrm/src/hooks/usePayrollPayslips.ts`
- `apps/web/hrm/src/components/payroll/PayrollGroupsCatalogTab.tsx`
- `apps/web/hrm/src/components/payroll/PayrollPeriodGroupScopePanel.tsx`
- `apps/web/hrm/src/components/payroll/PayrollBatchesTab.tsx`
- `apps/web/hrm/src/components/payroll/PayrollPayslipsApiTab.tsx`
- `apps/web/hrm/src/pages/Payroll.tsx`

## U65 click path (QA)

```text
Persona: ceo@xe.vn · companyId=main
URL: http://127.0.0.1:5173/hr/payroll?portal=1&tenantId=xevn&companyId=main

J-HRM-PAY-09-01 — Catalog CRUD
1) Lương → Chính sách → Phân nhóm bảng lương
2) Thêm nhóm → mã/tên/ưu tiên/rule → Lưu → Network POST /payroll/groups 201
3) F5 → row còn · Sửa / Ngừng sử dụng → PATCH 2xx

J-HRM-PAY-09-02 — Members preview
4) Menu ⋮ → Xem thành viên → chọn kỳ → Tải preview
5) GET /payroll/groups/:id/members?period_id= 200 · bảng NV hoặc empty hợp lệ

J-HRM-PAY-09-03 — Period scope
6) Tính lương → Danh sách kỳ → mở kỳ draft
7) Khối «Phạm vi nhóm» → chọn nhóm → Lưu phạm vi → PATCH periods 2xx · F5 label còn
8) (Optional) Tạo kỳ mới → chọn «Phạm vi nhóm» trên dialog → POST periods có payroll_group_id

J-HRM-PAY-09-04 — Report filter
9) Tính lương → Danh sách phiếu lương (payslips-api tab khi có data)
10) Lọc theo nhóm → GET payslips?payroll_group_id= 200 · cột Nhóm lương read-only

Regression: PAY-08 payslip detail/publish paths untouched · no seed · payroll_e2e_ready=false footer visible
```

## Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/payPay09GroupRing.test.ts \
  src/lib/poHrmMvpGd1Pay09ClusterFe01.source.test.ts
```

**Result:** 8 tests PASS (2026-08-10)

## Residual (not promoted)

- **J-HRM-PAY-09-06** mid-month split U65 browser (PAY-04 peer)
- **≠** `payroll_e2e_ready` · **≠** PAY-09 module DONE · **≠** full enroll filter UI on enroll dialog
- AMIS/wire depth **O19/O20 HOLD**

## completion_report

**Closed:** PAY-09 narrow FE — tenant group catalog CRUD UI, members preview, period scope bind on batch create/detail, payslip list group filter; API client + vitest/source guards; honesty/must_keep PAY01..08.

**Residual:** QA U65 browser evidence for J-09-01..04; mid-month journey HOLD.

**next_owner:** qa

**next_dispatch_prompt:** See handoff below.

**evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-pay-09-cluster-fe-01.md`
