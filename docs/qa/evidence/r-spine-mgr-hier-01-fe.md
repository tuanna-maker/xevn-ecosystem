# R-SPINE-MGR-HIER-01-FE — EmployeeFormDialog «Quản lý trực tiếp»

| Field | Value |
|-------|--------|
| **work_item_id** | `R-SPINE-MGR-HIER-01-FE` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | FR-UC-H01 · FR-UC-H03 · `docs/qa/evidence/r-spine-mgr-hier-01.md` §3 Option B |
| **locks** | **U65** zero-seed · **U76** HDSD testids · cấm claim UAT DONE |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| **BA / Option B** | `r-spine-mgr-hier-01.md` §3 — EmployeeFormDialog thiếu manager picker; need FE path set `manager_id` |
| **SRS** | FR-UC-H01 hồ sơ NV (tab Vị trí) · FR-UC-H03 L1 = `direct_manager` từ `employees.manager_id` |
| **DB** | `DB_DESIGN_*` `employees.manager_id` UUID nullable self-ref |
| **Parallel BE** | `R-SPINE-MGR-HIER-01-BE` adds `manager_id` on Create/Update DTO — FE wires field regardless |

---

## 2. Closed (FE)

| Change | Path |
|--------|------|
| ADD `EmployeeManagerPicker` typeahead (server keyword, exclude self, clear) | `apps/web/hrm/src/components/employee/EmployeeManagerPicker.tsx` |
| Wire picker on EmployeeFormDialog basic/Vị trí → submit `manager_id` | `EmployeeFormDialog.tsx` |
| POST/PATCH payload `manager_id` | `hrmApi.ts` · `useEmployeeMutations.ts` |
| Map `manager_id` + `manager_label` (stop hardcoding `null`) | `useEmployee.ts` · `useEmployees.ts` |
| Profile workInfo shows «Quản lý trực tiếp» display-ready (label or resolve by id) | `EmployeeProfile.tsx` |
| HDSD testid `hdsd-employee-form-manager-picker` | `hdsdMutateTestIds.ts` |
| i18n VI/EN | `employeeForm.directManager` / `selectDirectManager` / `searchEmployee` |
| @CODE-MEMORY APPEND | dialog · picker · mutations · map · profile · hdsd ids |

**must_keep honored:** LeaveOverviewRecentPanel / leave approve UX untouched; SoftDel mount guard retained.

---

## 3. Unit evidence

```text
cd apps/web/hrm && pnpm exec vitest run \
  src/components/employee/EmployeeFormDialog.mount-guard.test.ts \
  src/hooks/useEmployee.test.ts \
  src/lib/hdsdMutateTestIds.test.ts
```

**Result (2026-08-03):** 3 files · **20/20 PASS**.

---

## 4. QA browser script (U65 · U76)

**Persona:** `ceo@xe.vn` / `Xevn@2026` (group CEO)  
**Goal:** Set subordinate’s QL trực tiếp = HLD-0001 (`uat.nv0001`) so Option A J-MOB-05 can retest.

### hdsd_align inventory

| HDSD / UI | testid / path |
|-----------|----------------|
| Nhân sự → list | `/hr/employees` (or portal embed) |
| Mở hồ sơ NV (submitter candidate) | row click → `/employees/:id` |
| Sửa | Edit → `hdsd-employee-form-dialog` |
| Quản lý trực tiếp | `hdsd-employee-form-manager-picker` |
| Lưu | `hdsd-employee-form-submit` |

### Steps

1. Login → HRM Nhân sự → mở NV holding (not HLD-0001) to become report.
2. Edit → set **Quản lý trực tiếp** = search `HLD-0001` / `uat.nv0001` → select (label shows code — name, not raw UUID alone).
3. Lưu → Network **PATCH** `/api/hrm/employees/:id` body includes `manager_id` → **2xx**.
4. FE sau 2xx: toast success; dialog closes; profile **Quản lý trực tiếp** shows display-ready name.
5. **F5** → manager still shown (not UUID-only).
6. Optional L1 probe (not UF): `GET leave-requests?status=pending&manager_employee_id=<HLD-0001 uuid>` after subordinate FE leave submit.

**cấm:** `pnpm seed:*` · API/DB fake `manager_id` · claim UAT DONE.

**Depends:** BE wave must accept `manager_id` on PATCH (whitelist DTO). If 400 unknown property → FAIL_TO_PM with BE residual.

---

## completion_report

**Closed:** FE Option B path — picker «Quản lý trực tiếp» on UC-H01 form → POST/PATCH `manager_id` → profile display-ready after refetch/F5. HDSD testid + CODE-MEMORY APPEND. Leave UX untouched.

**Residual:** Browser U65 QA + BE DTO wave must be live; then qa-device J-MOB-05 Option A with submitter = report of HLD-0001 / approver `uat.nv0001`.

**ack_status:** READY_FOR_QA  
**next_owner:** `qa`  
**evidence_path:** `docs/qa/evidence/r-spine-mgr-hier-01-fe.md`

### next_dispatch_prompt

```text
work_item_id: R-SPINE-MGR-HIER-01-QA-FE
role: qa
priority: P0
lane: execution
entry_criteria: R-SPINE-MGR-HIER-01-FE READY_FOR_QA · BE R-SPINE-MGR-HIER-01-BE accepts manager_id on PATCH · U65 zero-seed · stack L0
mission: Browser set report→HLD-0001 (uat.nv0001) then handoff qa-device J-MOB-05 Option A retest.
steps:
  1) ceo@xe.vn → /hr/employees → open holding NV (future submitter) → Edit → hdsd-employee-form-manager-picker → chọn HLD-0001 / uat.nv0001 → Lưu.
  2) Network PATCH manager_id 2xx; FE profile «Quản lý trực tiếp» display-ready; F5 còn.
  3) U76 inventory in evidence; cấm seed.
  4) PASS → dispatch qa-device J-MOB-05: subordinate submits leave → uat.nv0001 approves ManagerApprovals.
exit_criteria: UF evidence block FE after 2xx+F5; then J-MOB-05 Option A AC or BLOCKED with reason
evidence_path: docs/qa/evidence/r-spine-mgr-hier-01-qa-fe.md
ack_status: PASS_TO_PM or FAIL_TO_PM
spec_ref: FR-UC-H01 · FR-UC-H03 · r-spine-mgr-hier-01.md §3 · r-spine-mgr-hier-01-fe.md
```
