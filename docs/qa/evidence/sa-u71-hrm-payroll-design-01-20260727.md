# SA-U71-HRM-PAYROLL-DESIGN-01 — Physical DB/API F.1 (Payroll)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-PAYROLL-DESIGN-01` |
| **lane** | governance · U71 P1 |
| **date** | 2026-07-27 |
| **change_mode** | ADD |
| **forbidden** | `apps/**` (not touched) |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| DB_DESIGN | `docs/hrm/DB_DESIGN_HRM_PAYROLL.md` | **ADDED** |
| API_DESIGN (F.1) | `docs/hrm/API_DESIGN_HRM_PAYROLL.md` | **ADDED** |
| Thin pointers | `docs/tech-spec/DB_DESIGN_HRM_PAYROLL.md` · `API_DESIGN_HRM_PAYROLL.md` | **ADDED** |
| Index | `docs/tech-spec/README.md` §2 + §3 + §5 must_keep | **UPDATED** |

---

## 2. F.1 checklist (API_DESIGN)

| Endpoint | Mục đích | Nghiệp vụ | Bước SRS | Verdict |
|----------|----------|-----------|----------|---------|
| `GET …/payroll/periods` | ✅ | ✅ | FR-PR-01 #7/#8 · UC-HRM-31 · PR-05 #2 picker | **PASS** |
| `POST …/payroll/periods` | ✅ | ✅ | FR-PR-01 #3–#8 · `HRM-PAY-201` | **PASS** |
| `GET …/payroll/payslips` | ✅ | ✅ | **FR-PR-05** #1–#6/#8 · UC-HRM-24 · INT-03 | **PASS** |
| `GET …/payroll/payslips/:id` | ✅ | ✅ | FR-PR-05 #7 — **target** (TechSpec non-blocking) | **PASS** (contract) |
| `POST …/periods/:id/process` | ✅ | ✅ | FR-PR-03 #2–#9 · G-PR-03 residual noted | **PASS** |
| `POST …/periods/:id/close` | ✅ | ✅ | FR-PR-04 · unlock read after close | **PASS** |

---

## 3. DB spine (facts from TechSpec + runtime ensureSchema)

| Table | Key invariants locked |
|-------|----------------------|
| `payroll_periods` | TEXT `company_id`; UK company+date range; status `draft`/`processed`/`closed`; overlap → `HRM-PAY-002` |
| `payroll_payslips` | Hard FK `period_id` CASCADE; soft `employee_id`; UK `(period_id, employee_id)`; money NUMERIC |

**must_keep cited:** employees soft hub · CI/leave/recruitment pairs untouched · Plane B slug · U65 empty list · NFR money FE.

**Runtime cite:** `PayrollService.ensureSchema` (`apps/api/hrm-api/src/payroll/payroll.service.ts`) — design documents, does not change code.

---

## 4. Residual

| ID | Note | Next |
|----|------|------|
| **G-PR-03** | Process must leave slips visible to PR-05; verify emit/upsert vs status-only flip | `dev-be`+`dev-fe` when execution opens |
| Get-by-id | Target F.1; runtime list-only today | Optional Dev ADD |
| OpenAPI deepen | yaml bước SRS annotations | Execution wave |
| Advance / salary-templates | Out of this pack (annex) | Separate U71 if sponsor opens |
| Next U71 P1 | XBOS RACI/RBAC/CC catalogs | PM backlog §3 |

---

## 5. Handoff

### completion_report

**Closed:** U71 physical F.1 pair for HRM Payroll — DB (`payroll_periods` + `payroll_payslips`, TEXT slug, hard period / soft emp) + API (periods list/create, payslips list/get-target, process/close upstream); tech-spec README indexed; thin pointers; employees/CI/leave/recruitment must_keep preserved; no `apps/**`.

**Residual:** G-PR-03 process→payslip visibility; get-by-id optional; advance/templates annex; XBOS RACI still missing physical pair.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: SA-U71-XBOS-RACI-RBAC-CAT-DESIGN-01
role: sa
lane: governance · U71 P1
change_mode: ADD
read_first:
  - docs/tech-spec/README.md §3
  - docs/xbos/TECHSPEC.md §14.14–14.16
  - docs/qa/evidence/sa-u71-spec-gap-scan-01-20260727.md
  - .cursor/rules/spec-db-api-design-gate.mdc
deliver:
  - docs/xbos/DB_DESIGN_XBOS_RACI_RBAC_CAT.md (or split slices)
  - docs/xbos/API_DESIGN_XBOS_RACI_RBAC_CAT.md — each endpoint F.1
  - Update docs/tech-spec/README.md §2 + thin pointers
must_keep: org-legal / SHR / catalog-gov / workflow pairs
forbidden: apps/**
exit: F.1 pair; PASS_TO_PM
evidence_path: docs/qa/evidence/sa-u71-xbos-raci-rbac-cat-design-01-20260727.md
```

Optional parallel (execution, not this SA wave):

```text
work_item_id: BE-HRM-G-PR-03-PROCESS-SLIPS-01
role: dev-be
entry: read docs/hrm/DB_DESIGN_HRM_PAYROLL.md + API_DESIGN_HRM_PAYROLL.md §5
exit: process emits/upserts payslips; PR-05 list shows slips; jest + READY_FOR_QA
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/sa-u71-hrm-payroll-design-01-20260727.md`

### pm_dispatch_hint

`SA-U71-XBOS-RACI-RBAC-CAT-DESIGN-01` — next U71 P1 physical write; or `BE-HRM-G-PR-03-PROCESS-SLIPS-01` when opening Payroll execution.
