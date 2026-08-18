# CD-FB-08-CONTRACT — BE evidence (2026-07-19)

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-08-CONTRACT` |
| **from_role** | dev-be |
| **ack_status** | **READY_FOR_QA** (BE slice) → next **dev-fe** for tab UI |
| **sponsor_lock** | U67 F5 must-fix · U65 zero-seed for UAT |
| **date** | 2026-07-19 |

---

## spec_read_ack

| Artifact | Sections |
|----------|----------|
| `docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md` | §5 F5 UC-HRM-CI-08..11 · BR-CD-F5-01..07 · AC-CD-F5-01..07 |
| `docs/program/P1-CUSTOMER-DEMO-HRM-FEEDBACK-PROGRAM.md` | F5 · CD-FB-08-CONTRACT |
| `docs/hrm/SRS.md` | §13 UC-HRM-25 · §14 UC-HRM-28 · §15.3 UC-HRM-INT-02/03 |
| `docs/hrm/DANH_MUC_XBOS_CHO_HRM.md` | §21 labor status · §33 Loại phụ cấp |
| OpenAPI | `docs/api/openapi/hrm-api.yaml` compensation-* paths |

**spec says / code does:**
- Spec: HĐ = term only; compensation = separate package with base/probation/allowance + history versions.
- Code: `employee_contracts.salary` never persisted; new tables + APIs under `/contracts-insurance/compensation-*`; revise closes prior + INSERT version (no line UPDATE).

---

## Closed (BE)

1. Migration `migrations/hrm/0017_employee_compensation_packages.sql`
   - `employee_compensation_packages` / `_lines` / `_history`
   - `employee_contracts.compensation_package_id` optional FK
2. Service `employee-compensation.service.ts` + controller routes + `ensureCompensationSchema`
3. Contract list/detail/update expose `compensation_package_id`; create ignores deprecated `salary`
4. OpenAPI paths for compensation CRUD/active/history/revise
5. `@CODE-MEMORY` on compensation service + create-contract DTO

### API contract (FE handoff)

| Method | Path | Code | Notes |
|--------|------|------|-------|
| POST | `/api/hrm/contracts-insurance/compensation-packages` | `HRM-COMP-201` | Body: `company_id`, `employee_id`, `effective_from`, `lines[]`, optional `contract_id`, `link_to_contract` |
| GET | `/api/hrm/contracts-insurance/compensation-packages?company_id=&employee_id=` | `HRM-COMP-200` | List versions + lines |
| GET | `/api/hrm/contracts-insurance/compensation-packages/active?company_id=&employee_id=&as_of=` | `HRM-COMP-200` | Payroll consumer (BR-CD-F5-07) |
| GET | `/api/hrm/contracts-insurance/compensation-packages/:id?company_id=` | `HRM-COMP-200` | Detail |
| POST | `/api/hrm/contracts-insurance/compensation-packages/:id/revise?company_id=` | `HRM-COMP-201` | New version; closes prior `effective_to` |
| GET | `/api/hrm/contracts-insurance/compensation-history?company_id=&employee_id=` | `HRM-COMP-200` | Timeline |
| PATCH | `/api/hrm/contracts-insurance/contracts/:id` | `HRM-CON-200` | Optional `compensation_package_id` |

**Line payload:**
```json
{
  "line_type": "base" | "probation" | "allowance",
  "amount": 15000000,
  "currency": "VND",
  "allowance_code": "PHU_CAP_AN",
  "taxable": true,
  "note": null
}
```

**Rules for FE:**
- Contract create form: **do not** require salary (AC-CD-F5-01).
- Tab «Đãi ngộ»: POST package with ≥1 `base`; probation only if NV/contract probation (HRM-COMP-002).
- Allowances: ≥2 different `allowance_code` from XBOS DM §33 (AC-CD-F5-03).
- Raise salary: POST `.../revise` — never PATCH lines in place (AC-CD-F5-04).
- History tab: GET `compensation-history`.
- Scope: same `company_id` + JWT as contracts list (J-HRM-01 / BR-CD-F5-06).

**Error codes:** `HRM-COMP-001` validation · `HRM-COMP-002` probation · `HRM-COMP-003` allowance_code · `HRM-COMP-404` not found.

---

## Verification

```text
pnpm --filter hrm-api exec jest --testPathPatterns="employee-compensation.service.spec|contracts-insurance.service.spec|contracts-insurance.controller.spec|app.module.spec" --no-coverage
→ Test Suites: 4 passed | Tests: 37 passed

pnpm --filter hrm-api exec tsc -p tsconfig.build.json --noEmit
→ exit 0
```

U65: no seed used for this evidence.

---

## Residual

| Item | Owner |
|------|-------|
| FE tabs Đãi ngộ + Lịch sử + remove salary required on HĐ (AC-CD-F5-01..04, AC-CD-F5-07 U65) | **dev-fe** |
| Payroll period consumer switch from any legacy `contracts.salary` (AC-CD-F5-06) | follow-up if payroll still reads legacy |
| Apply migration `0017` on env (ensureSchema also creates at runtime) | devops / local stack |
| Browser QA L2 P-CC-04 + L2.5 J-HRM-01/03 after FE | qa |

**Not claimed:** Phase 1 / PROD DONE for whole customer-demo program.

---

## completion_report

BE F5 compensation package delivered: schema + versioned APIs + history + contract link; salary deprecated on contract body; jest 37 PASS; OpenAPI updated. FE still required for tab UX / U65 browser AC.

**next_owner:** dev-fe

**next_dispatch_prompt:**

```text
work_item_id: CD-FB-08-CONTRACT
from_role: pm
to_role: dev-fe
lane: execution
entry_criteria: BE READY_FOR_QA — docs/qa/evidence/cd-fb-08-contract-be-20260719.md (API contract table)
spec_ref: CUSTOMER_DEMO_HRM_DELTA_20260620.md §5 AC-CD-F5-01..04,07
exit_criteria:
  - Contracts.tsx / EmployeeContracts: tab HĐ (term only, salary not required) + tab Đãi ngộ (package lines) + tab Lịch sử
  - Wire POST compensation-packages, revise, GET history/active; show probation + ≥2 allowance codes
  - F5 persist without seed (U65); P-CC-04 list still loads
  - evidence: docs/qa/evidence/cd-fb-08-contract-fe-YYYYMMDD.md
  - READY_FOR_QA → qa
cấm: waive F5; seed for evidence
```

**evidence_path:** `docs/qa/evidence/cd-fb-08-contract-be-20260719.md`

**ack_status:** **READY_FOR_QA**
