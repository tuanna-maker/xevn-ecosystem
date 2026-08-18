# Evidence — PO-HRM-MVP-GD1-PAY-04-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-04-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` · U89 Wave-39 residual |
| **date** | 2026-08-10 |
| **uc_ids** | `UC-BP-PAY-04` · `FR-UC-BP-PAY-04` · `J-HRM-PAY-04-06` (preview) · J-01..04/07 remain **HOLD** until live mid-period data |
| **depends_on** | `PAY04QC1-MSMCR4GWC1` · BE segments[] @ API-01 §5 · QA HOLD J-PAY-04-01..04/07 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD narrow · display-only · preserve_default |
| **honesty** | `payroll_e2e_ready=false` · **≠ PAY-04 / FR-UC-BP-PAY-04 DONE** · **≠ PAY module UAT** · must_keep **PAY01QC1** · **PAY02QC1** |
| **U65** | zero-seed · browser bind GET payslip after list click · no `pnpm seed:*` |
| **portal_url** | `http://127.0.0.1:5173/hr/payroll?portal=1&tenantId=xevn&companyId=main` · hrm-api `:28001` · `ceo@xe.vn` |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- api: docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md §5 SplitSegmentDto · §4.6 F-PAY-PAYSLIP-01
- qc_residual: docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-qc-01.md § Residual FE-01
- must_keep: PAY01QC1-MSMBGWC1 · PAY02QC1-MSMC4GWC1 · payroll_e2e_ready=false · no FE net merge (O9/O11)
- sponsor_confirm: PAY04QC1 GWC · BE GET segments[] L1 PASS
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| `getPayrollPayslipById` → `GET /api/hrm/payroll/payslips/:id?company_id=&include_segments=true` | **PASS** |
| Detail dialog binds header gross/deduction/net from BE (not sum segments) | **PASS** |
| `PayslipSplitSegmentsPanel` — segmentSeq · dates dd/MM/yyyy · money vi-VN · hours no group | **PASS** |
| Honesty footer `pay-04-honesty` · C-SLICE ≠ module UAT | **PASS** |
| Nest `/core` = 0 on payroll payslip path | **PASS** |
| vitest | **2 files · 9 PASS** |

### Files touched

- `apps/web/hrm/src/integrations/hrmApi.ts` — `HrmPayslipSplitSegment` · `HrmPayslipDetail` · `getPayrollPayslipById`
- `apps/web/hrm/src/hooks/usePayrollPayslipDetail.ts`
- `apps/web/hrm/src/lib/payPayslipSplitDisplay.ts` (+ `.test.ts`)
- `apps/web/hrm/src/components/payroll/PayslipSplitSegmentsPanel.tsx`
- `apps/web/hrm/src/components/payroll/PayrollPayslipsApiTab.tsx`
- `apps/web/hrm/src/lib/poHrmMvpGd1Pay04ClusterFe01.source.test.ts`

### Network assert path (QA — U65)

```text
1) Login ceo@xe.vn → Lương → tab danh sách phiếu lương (pay-payslips-api-precision)
   → GET /api/hrm/payroll/payslips?company_id=main **200**
2) Click Eye một dòng → dialog mở
   → GET /api/hrm/payroll/payslips/{id}?company_id=main **200** `HRM-PAY-200`
   → FE: pay-payslip-header-net hiển thị net từ response header
3) Nếu response.segments.length > 0 hoặc split=true:
   → pay-payslip-split-segments table · segment dates dd/MM/yyyy · money grouped
   → **DENY** FE tự cộng segments thành net
4) Nếu segments rỗng: chỉ pay-04-honesty footer (C-SLICE)
5) F5 dialog đóng/mở lại → cùng binding
6) J-HRM-PAY-04-01..04/07: **HOLD** nếu chưa có NV segment_count≥2 từ FE — không seed
```

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/payPayslipSplitDisplay.test.ts \
  src/lib/poHrmMvpGd1Pay04ClusterFe01.source.test.ts
```

| Command | Result |
|---------|--------|
| vitest (above) | exit **0** · **9** tests PASS |

---

## 4. Residual (not closed by FE-01)

| ID | Owner |
|----|--------|
| J-HRM-PAY-04-01..04/07 live mid-period U65 | **qa** when CORE/FE data path exists · zero-seed |
| PAY module UAT · `payroll_e2e_ready` | **pm** — **DENY** flip |
| PAY-03 / PAY-05 depth | queued #45+ |

---

## 5. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | FE bind preview `segments[]` display-ready on payslip detail dialog; GET by id with include_segments; vitest 9 PASS; must_keep PAY01/PAY02; honesty unchanged. |
| **next_owner** | **qa** |
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-fe-01.md` |
