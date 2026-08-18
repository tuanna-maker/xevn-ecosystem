# Evidence — PO-E2E-SPINE-01-FE-VITE-PAY-CON-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-SPINE-01-FE-VITE-PAY-CON-01` |
| **role** | dev-fe |
| **date** | 2026-08-03 |
| **priority** | P1 |
| **change_mode** | FIX · preserve · CODE-MEMORY APPEND |
| **U65** | zero-seed — no `pnpm seed:*` |
| **ack_status** | **READY_FOR_QA** |
| **blocks** | R-PO-SPINE01-CONTRACTS-VITE · R-PO-SPINE01-PAYROLL-BLANK → HP-05 HĐ · HP-06 CC payroll |
| **parent FAIL** | `docs/qa/evidence/po-e2e-spine-01-qa-w5.md` |

## spec_read_ack

- QA fail: `po-e2e-spine-01-qa-w5.md` · residuals **R-PO-SPINE01-CONTRACTS-VITE** · **R-PO-SPINE01-PAYROLL-BLANK**
- Journeys: **J-HRM-01** (/hr/contracts) · FR-UC-H04 (CC Tiền lương)
- Pages: `apps/web/hrm/src/pages/Contracts.tsx` · `Payroll.tsx`
- Restore source: git stash commit `43c479afd56531654ee3d3100a9681f60ff7c4e0` (UTF-8 binary extract — not PowerShell `>` UTF-16)
- must_keep: Leave/LV-03/04 · AUTH/EMP/CAT · HP-03/04 · HP-05 emp deep-link soft-link · Approve UX GWC — **not** reopened

## Root cause

Same class as JobTemplatesTab / profile PermissionFallback:

```
Failed to resolve import "@/components/hrm/EmptyState"
  from "src/pages/Contracts.tsx"
→ Vite 500 → /hr/contracts whitescreen

Failed to resolve import "@/components/payroll/taxSettlementFloatingUi"
  from "src/pages/Payroll.tsx"
→ Vite 500 → /hr/payroll + CC Tiền lương blank (embed/open path)
```

## Fix (restore chain from `43c479a`)

| Path | Role |
|------|------|
| `apps/web/hrm/src/components/hrm/EmptyState.tsx` (+ `.test.ts`) | primary Contracts miss |
| `apps/web/hrm/src/components/hrm/emptyStateSot.ts` | EmptyState SoT copy |
| `apps/web/hrm/src/lib/contractCreatePayload.ts` (+ `.test.ts`) | Contracts create helper |
| `apps/web/hrm/src/components/payroll/taxSettlementFloatingUi.ts` (+ test) | primary Payroll miss |
| `apps/web/hrm/src/hooks/usePayrollDomainUi.ts` | Payroll domain hook |
| `apps/web/hrm/src/components/payroll/payrollDomainUi.ts` (+ test) | reducers |
| `apps/web/hrm/src/components/payroll/salaryComponentFormSchema.ts` (+ test) | SalaryComponentsTab Zod |
| `apps/web/hrm/src/components/payroll/payrollPeriodFormSchema.ts` (+ test) | batches Zod |
| `apps/web/hrm/src/components/payroll/advanceRequestFormUi.ts` (+ test) | advance form SoT |

CODE-MEMORY **APPEND** on restored modules + `Contracts.tsx` + `Payroll.tsx`.

**Untouched:** Leave / LV-03/04 · AUTH / EMP / CAT · HP-03/04 · Approve UX GWC · no seed · no invent payroll rows.

## Verify

| Probe | Result |
|-------|--------|
| `GET :5173/hr/src/pages/Contracts.tsx` | **200** (was 500) |
| `GET :5173/hr/src/pages/Payroll.tsx` | **200** (was 500) |
| `GET :8080/hr/src/pages/Contracts.tsx` | **200** |
| `GET :8080/hr/src/pages/Payroll.tsx` | **200** |
| `GET :5173/hr/contracts` HTML | **200** · `#root` · no Internal Server Error |
| `GET :5173/hr/payroll` HTML | **200** · `#root` |
| `GET :5173/command-center/hrm/payroll` HTML | **200** · `#root` |
| `GET :8080/hr/contracts` · `/hr/payroll` HTML | **200** · `#root` |
| Payroll tabs (SalaryComponents / Payslip / …) Vite | **200** |
| vitest EmptyState + taxSettlement + payrollDomainUi + salaryComponent + contractCreate + advance + period | **48/48 PASS** |
| Seed | **none** |

CC panel already ships honest empty «Chưa có phiếu lương trên API.» when payslips empty (`HrmWorkspacePanel` payroll view). `/hr/payroll` overview shows step cards / EmbedApiEmptyState when live payslips empty — mount unblocked so content or honest empty can render (FR-UC-H04).

## Residual (QA browser)

| ID | Sev | Note |
|----|-----|------|
| Browser HP-05 HĐ list→name / Loại HĐ `--` on emp tab | QA | Vite CLOSED — validate J-HRM-01 list/empty + soft-link keep |
| Browser HP-06 CC Tiền lương content/honest empty | QA | Vite CLOSED — U78 retest |
| must_keep Leave / AUTH / EMP / CAT / HP-03/04 | — | not reopened |

## Handoff

```
ack_status: READY_FOR_QA
next_owner: qa
evidence_path: docs/qa/evidence/po-e2e-spine-01-fe-vite-pay-con-01.md
next_dispatch: PO-E2E-SPINE-01-QA-W5-R1
```
