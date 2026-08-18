# PO-HRM-MVP-GD1-PAY-07 — QA import smoke (BE-02-IMPORT-01)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-07-CLUSTER-QA-01-IMPORT-SMOKE` |
| **parent seal** | `PAY07QC1` / QA `PAY07QA1-MSMEY7K3` (post-seal #48) |
| **dev handoff** | `PO-HRM-MVP-GD1-PAY-07-CLUSTER-BE-02-IMPORT-01` — see `po-hrm-mvp-gd1-pay-07-cluster-be-01.md` § IMPORT |
| **stamp** | `PAY07QAIMP-MSMEPAY7I` |
| **date** | 2026-08-10 |

## Scope (narrow)

Re-smoke **only** salary-component DTO import fix (`apps/api/hrm-api/src/payroll/dto/salary-component.dto.ts` + controller/catalog imports). **Cấm:** flip `payroll_e2e_ready` · reopen QC · full PAY-07 journey re-run.

## Commands & results

```text
cd apps/api/hrm-api
pnpm exec nest build                          → exit 0
pnpm exec jest --testPathPatterns="pay-term-guard|pay-termination.service|payroll.service.spec|pay-tncn-resolver" --no-cache
                                              → 4 suites · 54/54 · exit 0
pnpm run qc:fe-be-health (repo root, optional) → ALL PASS · exit 0
```

| Check | Result |
|-------|--------|
| `nest build` | **PASS** (exit 0) |
| PAY-07 term jest bundle | **PASS** 54/54 |
| `qc:fe-be-health` | **PASS** (L0 stack + HRM proxy) |
| Artifact present | `salary-component.dto.ts` on disk |

## Out of scope (not gating this WI)

| Suite | Result | Owner |
|-------|--------|--------|
| `payroll.controller.spec.ts` | ~~**2 failed / 12**~~ → **12/12 PASS** (`PO-HRM-MVP-GD1-PAY-07-CLUSTER-BE-02-CONTROLLER-SPEC-P2` 2026-08-10) | dev-be |

## honesty footer (unchanged)

> **payroll_e2e_ready=false** · **C-SLICE** · **≠ PAY-07 / PAY module UAT DONE** · QC seal **not** reopened

**ack_status:** **PASS_TO_PM**

## completion_report

**Closed:** BE-02-IMPORT-01 compile + PAY-07 term regression bundle unchanged after DTO ADD; L0 `qc:fe-be-health` PASS.

**Residual:** `payroll.controller.spec.ts` 2 failures (P2 mock alignment) — **not promoted** as PAY-07 blocker for import smoke.

**next_owner:** **pm** (log only — no QC redispatch per scope)

**evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-pay-07-cluster-qa-01-import-smoke.md`

### next_dispatch_prompt (pm — copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-07-CLUSTER-BE-02-CONTROLLER-SPEC-P2 (optional backlog)
role: dev-be
entry_criteria: PAY07QAIMP-MSMEPAY7I PASS · payroll.controller.spec 2/12 FAIL mock arity
exit_criteria: payroll.controller.spec 12/12 · no change to term settle guards
cấm: reopen PAY07QC1 · flip payroll_e2e_ready
```
