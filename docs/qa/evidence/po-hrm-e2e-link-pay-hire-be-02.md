# Evidence — PO-HRM-E2E-LINK-PAY-HIRE-BE-02

| Field | Value |
|-------|-------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-HIRE-BE-02` |
| from_role | dev-be |
| to_role | pm |
| ack_status | **`READY_FOR_QA`** |
| parent | `PO-HRM-E2E-LINK-PAY-HIRE-QA-01` FAIL (`R-PAY-HIRE-BE-STALE`) |
| change_mode | FIX-only narrow |
| date | 2026-08-06 |
| honesty | `payroll_e2e_ready=false` |

## Root cause closed

| ID | Issue | Fix |
|----|-------|-----|
| **R-PAY-HIRE-BE-STALE** | `pnpm --filter hrm-api build` FAIL — `recruitment.service.ts:703` TS2322 (`unknown` → `string` on `companyId` / `companySlug`) blocked dist refresh; live `:28001` returned **404** on eligibility/enroll | Narrow cast via `requisitionCompanyId = String(existing.company_id ?? query.company_id ?? '')` before workflow spawn |

## Files touched

- `apps/api/hrm-api/src/recruitment/recruitment.service.ts` — TS2322 fix only (no payroll logic change)

## Build / test evidence

| Command | Result |
|---------|--------|
| `pnpm --filter hrm-api build` | **exit 0** (postbuild `verify-dist.mjs` OK) |
| `pnpm exec jest payroll.service.spec.ts payroll.controller.spec.ts` | **26/26 passed** (2 suites) |

## Live stack verification (`:28001`)

Persona: `ceo@xe.vn` / `Xevn@2026` · JWT via `POST :28002/api/xbos/auth/login` · headers `x-company-id=main`, `x-tenant-id=xevn`

Period probe: `GET /api/hrm/payroll/periods?company_id=main` → **200** `HRM-PAY-200` · `periodId=d8a3c74f-9678-4529-8f63-65f1d39e1385`

| Method | Path | Status | Code | Notes |
|--------|------|--------|------|-------|
| GET | `/api/hrm/payroll/periods/{id}/eligibility` | **200** | `HRM-PAY-200` | **53** items with `eligible` / `reasons[]` — **not 404** |
| POST | `/api/hrm/payroll/periods/{id}/enroll` `{ mode: "auto_eligible" }` | **409** | `HRM-PAY-003` | Route live — period already `processed`; draft period would return 2xx enroll |

Nest dev restart log confirms route mapping:

```
Mapped {/api/hrm/payroll/periods/:periodId/eligibility, GET}
Mapped {/api/hrm/payroll/periods/:periodId/enroll, POST}
```

## Residual (not BE-02 scope)

| ID | Owner | Note |
|----|-------|------|
| **R-PAY-HIRE-BATCHES-HIDDEN** | dev-fe | `PayrollBatchesTab` gated when `livePayslips.length >= 1` |
| **R-PAY-HIRE-ELIGIBILITY-FE** | dev-fe | FE does not wire GET eligibility UI |

## completion_report

- **Closed:** hrm-api build blocker (recruitment TS2322); dist refreshed; eligibility + enroll routes deployed on live `:28001` (200/409 — not 404); payroll unit/controller specs green.
- **Open:** FE enroll surface + browser AC-PAY-HIRE-04/05; draft-period enroll 2xx browser proof; ATT-412 process matrix.
- **Honesty:** `payroll_e2e_ready=false` unchanged.

## next_owner

`qa` (after `PO-HRM-E2E-LINK-PAY-HIRE-FE-02` READY_FOR_QA)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-QA-02
from_role: pm
to_role: qa
lane: execution
entry_criteria:
- PO-HRM-E2E-LINK-PAY-HIRE-BE-02 READY_FOR_QA (this file)
- PO-HRM-E2E-LINK-PAY-HIRE-FE-02 READY_FOR_QA (enroll UI reachable)
- U65 zero-seed browser-only

read_first:
- docs/qa/evidence/po-hrm-e2e-link-pay-hire-be-02.md
- docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-01.md (superseded failures)

task:
- Re-run AC-PAY-HIRE-04/05: enroll POST 2xx → FE list refresh → F5 persistence
- Verify GET eligibility 200 + reasons[] (BE); FE renders if FE-02 wired
- Verify process / HRM-PAY-ATT-412 on draft period without closed sheet
- Confirm eligibility/enroll Network not 404 on :28001

exit_criteria:
- evidence_path: docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-02.md
- ack_status: PASS_TO_PM or FAIL_TO_PM with residuals
```
