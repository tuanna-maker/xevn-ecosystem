# R-SPINE-MGR-HIER-01-BE — ADD `manager_id` write path (Option B)

| Field | Value |
|-------|--------|
| **work_item_id** | `R-SPINE-MGR-HIER-01-BE` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | FR-UC-H01 · FR-UC-H03 · DB_DESIGN `employees.manager_id` · TECH_SPEC_NEW §4.3 / §4.4 |
| **BA** | [`r-spine-mgr-hier-01.md`](r-spine-mgr-hier-01.md) §3 Option B |
| **prior QA** | [`r-spine-mgr-hier-01-qa.md`](r-spine-mgr-hier-01-qa.md) Option A BLOCKED (0 holding `manager_id`) |
| **U65** | honored — no seed; product POST/PATCH only |
| **FE peer** | `R-SPINE-MGR-HIER-01-FE` already landed (`EmployeeManagerPicker` + form submit) |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `docs/brand-new-documents-20270801/SRS_NEW.md` · FR-UC-H01 (tạo/sửa hồ sơ) · FR-UC-H03 L1 = QL trực tiếp |
| **tech_spec** | `TECH_SPEC_NEW.md` §4.3 TS-EMP · §4.4 L1 `direct_manager` |
| **db_design** | `DB_DESIGN_NEW.md` `employees.manager_id` UUID nullable self-ref |
| **api_design** | POST/PATCH `/api/hrm/employees` body `manager_id?: string \| null` |
| **change_mode** | **ADD** |
| **must_keep** | leave list `manager_employee_id` SQL; soft-delete; scope parity list↔get↔patch |
| **forbidden** | seed `manager_id` · Option C CEO-as-L1 · change leave list SQL meaning |

---

## Closed scope

1. **DTO** — `CreateEmployeeDto` / `UpdateEmployeeDto`: optional `manager_id` UUID v4 or `null` (`ValidateIf` skip null).
2. **Service write** — create INSERT + update SET `manager_id`; clear with `null`.
3. **Validation** (`employee-manager.validation.ts`):
   - `null` / empty → clear OK
   - ≠ self → `HRM-EMP-MGR-SELF`
   - active same `company_id` → else `HRM-EMP-MGR-404` / `HRM-EMP-MGR-SCOPE`
   - no reporting cycle (recursive CTE) → `HRM-EMP-MGR-CYCLE`
4. **Authz** — self ESS cannot PATCH `manager_id` (existing allowlist → `HRM-EMP-403`).
5. **TS2345** — `leave-requests.service.ts` `resolveIsSickLeaveType`: `companySlug` fallback `'holding'` (narrow; leave list SQL untouched).
6. **@CODE-MEMORY** APPEND on employees.service + leave-requests.service + DTOs + validation module.

---

## Verification

| Check | Result |
|-------|--------|
| `npx tsc -p tsconfig.build.json --noEmit` | **EXIT 0** (TS2345 cleared) |
| `jest` `employee-manager.validation.spec` + `employees.service.spec` | **41/41 PASS** |
| `jest` `leave-requests.service.spec` regression | **33/33 PASS** |

### Jest coverage map

| Case | Code |
|------|------|
| Happy PATCH set | `HRM-EMP` suite manager_id write |
| Clear null | same |
| Self reject | `HRM-EMP-MGR-SELF` |
| Cross-company | `HRM-EMP-MGR-SCOPE` |
| Cycle | `HRM-EMP-MGR-CYCLE` |
| Create with manager | INSERT includes manager uuid |
| Self ESS forbidden | `HRM-EMP-403` |

---

## Residual

| Item | Owner |
|------|--------|
| Browser U65: HCNS set QL trực tiếp on holding subordinate → HLD-0001 / `uat.nv0001` → Lưu → F5 | **qa** |
| Then qa-device J-MOB-05: subordinate submit leave → `uat.nv0001` ManagerApprovals Duyệt | **qa-device** |
| No BE change to leave list filter (must_keep) | — |

---

## Files touched

- `apps/api/hrm-api/src/employees/dto/create-employee.dto.ts`
- `apps/api/hrm-api/src/employees/dto/update-employee.dto.ts`
- `apps/api/hrm-api/src/employees/employee-manager.validation.ts` (+ `.spec.ts`)
- `apps/api/hrm-api/src/employees/employees.service.ts` (+ `.spec.ts`)
- `apps/api/hrm-api/src/attendance/leave-requests.service.ts` (TS2345 only)

---

## completion_report

**Closed:** Option B BE write path for `manager_id` with validation + jest; tsc green; leave SQL semantics unchanged.  
**Open residual:** browser FE set-manager (FE landed) + qa-device J-MOB-05 — not claimed PASS here.

**ack_status:** `READY_FOR_QA`  
**next_owner:** `qa`  
**evidence_path:** `docs/qa/evidence/r-spine-mgr-hier-01-be.md`

## next_dispatch_prompt

```text
work_item_id: R-SPINE-MGR-HIER-01-QA-BROWSER
from_role: pm
to_role: qa
priority: P0
entry_criteria: BE READY_FOR_QA (docs/qa/evidence/r-spine-mgr-hier-01-be.md); FE R-SPINE-MGR-HIER-01-FE landed (EmployeeManagerPicker); L0 stack up; U65 zero-seed
mission: Browser U65 — login ceo@xe.vn → HRM Nhân sự → mở NV holding (subordinate, not HLD-0001) → tab Vị trí → set «Quản lý trực tiếp» = HLD-0001 / uat.nv0001 → Lưu → FE sau 2xx + F5 → confirm manager_id on GET detail. Then probe GET leave-requests?status=pending&manager_employee_id=<HLD-0001 uuid>&company_id=holding (after subordinate FE leave submit) total≥1 OR handoff qa-device J-MOB-05.
exit_criteria: evidence docs/qa/evidence/r-spine-mgr-hier-01-qa-browser.md; Network PATCH/POST employees 2xx with manager_id; F5 retains; U65; then DISPATCH qa-device J-MOB-05 (approver uat.nv0001, submitter = that subordinate)
cấm: seed manager_id · API-only PASS · Option C CEO-as-L1
must_keep: leave list manager_employee_id filter; BR-WF-04
```
