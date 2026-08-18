# Evidence — PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-FE-CB-01

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-FE-CB-01` |
| **parent** | `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-SRC-02-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution |
| **priority** | P1 |
| **date** | 2026-08-07 |
| **ack_status** | **`READY_FOR_QA`** |
| **residual closed** | **R-EMP-SH-FE-CB-CLICK** |
| **honesty** | `payroll_e2e_ready=false` · U65 zero-seed · no AMIS DONE |

## Mission

Fix Đãi ngộ / C&B package create-revise FE save so U65 path POSTs **2xx** with **`component_code` on lines** — no product-path mirror required for SRC-02.

## Root cause (QA SRC-02-01)

| Observation | Cause |
|-------------|--------|
| `fe_cb.ok=false` · `posts=[]` | Client validation aborted **before** fetch |
| Probation checkbox auto-on when any HĐ is thử việc | Empty probation amount → `buildCompensationLines` fail → toast, no POST |
| Lines omitted `component_code` | SRC-02 / BE DTO optional but FE must emit for emp_cb bind |

## Fix summary

| # | Change |
|---|--------|
| 1 | `buildCompensationLines` emits `component_code` (`base` / `probation` / `lower(allowance_code)`) |
| 2 | Reject base ≤0 / empty so silent zero cannot POST |
| 3 | Stop auto-checking probation from contract type (opt-in or hydrate from active package only) |
| 4 | HDSD `data-testid` on Đãi ngộ tab + create/revise + money/allowance fields |
| 5 | `HrmCompensationLineInput` / record types include `component_code` |

## Files touched

- `apps/web/hrm/src/lib/compensationLines.ts` (+ tests)
- `apps/web/hrm/src/components/employee/EmployeeCompensationPanel.tsx` (+ tests)
- `apps/web/hrm/src/components/employee/EmployeeContracts.tsx` (tab testid)
- `apps/web/hrm/src/hooks/useEmployeeCompensation.ts` (CODE-MEMORY)
- `apps/web/hrm/src/integrations/hrmApi.ts` (types)

## Verification

```bash
cd apps/web/hrm
pnpm exec vitest run src/lib/compensationLines.test.ts src/components/employee/EmployeeCompensationPanel.test.ts --reporter=dot
# 14 passed · 2 files · exit 0
```

| Check | Result |
|-------|--------|
| `component_code` on base/allowance lines | PASS — `base` · `phu_cap_an` · `phu_cap_xang` |
| Empty probation + includeProbation | PASS — reject (no POST) |
| HDSD create testids when no active pkg | PASS |
| `payroll_e2e_ready` | **false** (honesty) |

## HDSD inventory (U76 — for QA latch)

| testid | Surface |
|--------|---------|
| `hdsd-emp-contracts-tab-dai-ngo` | Contracts → tab Đãi ngộ |
| `hdsd-emp-compensation-panel` | Panel root |
| `hdsd-emp-comp-base` | Lương cơ bản ViMoney |
| `hdsd-emp-comp-allowance-amount-0/1` | Phụ cấp amounts |
| `hdsd-emp-comp-create` | Tạo gói đãi ngộ |
| `hdsd-emp-comp-revise` | Tăng lương / revise |

## must_keep

- Revise = new version (not PATCH lines)
- ≥2 distinct allowance codes (DM §33)
- Salary not on HĐ body
- U65 zero-seed · `payroll_e2e_ready=false`

## completion_report

Closed: R-EMP-SH-FE-CB-CLICK — FE create/revise payload now includes `component_code`; probation no longer auto-blocks empty save; HDSD testids for U65 click. Vitest 14 PASS. Residual: browser U65 retest still required (no claim FE-CB 🟢 without QA Network 2xx). Honesty: `payroll_e2e_ready=false`.

## next_owner

qa

## next_dispatch_prompt

```text
work_item_id: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-SRC-02-02
from_role: pm
to_role: qa
lane: execution
priority: P1
parent: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-FE-CB-01

## Mission
U65 retest FE-CB-COMPONENT — Đãi ngộ create/revise must POST 2xx with component_code; no product-path mirror.

## entry
- evidence: docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-fe-cb-01.md
- residual closed claim: R-EMP-SH-FE-CB-CLICK
- L0 stack up · persona ceo@xe.vn · company_id=main
- HDSD: hdsd-emp-contracts-tab-dai-ngo · hdsd-emp-comp-base · hdsd-emp-comp-allowance-amount-* · hdsd-emp-comp-create|revise

## exit
- FE-CB-COMPONENT 🟢: Network POST …/compensation-packages (or …/revise) 2xx; body lines[].component_code present (base + phu_cap_an)
- F5 active package shows component_code
- cấm: seed · product-path mirror as PASS substitute
- honesty: payroll_e2e_ready=false · no AMIS DONE
- evidence_path: docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qa-src-02-02.md
- ack_status: PASS_TO_PM | FAIL_TO_PM
```

## evidence_path

`docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-fe-cb-01.md`

## ack_status

**READY_FOR_QA**
