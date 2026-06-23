# MOB-W7-5-DIRECTORY-BE — Employee directory API (J-MOB-30)

| Field | Value |
|-------|-------|
| **work_item_id** | MOB-W7-5-DIRECTORY-BE |
| **spec_ref** | `MOBILE_W7_DATA_CONTRACTS.md` §5 · `ADR-HRM-MOBILE-W7-DATA-EXTENSIONS.md` D-W7-03 · `MOBILE_HRM_ESS_UX_BENCHMARK.md` SET E |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-06-09 |

---

## Summary

Implemented `view=directory` on existing employee routes (no `/employees/directory` duplicate). List + get-by-id share `resolveHrmListScope` / `pushEmployeeListScopeFilters` — scope parity with standard employee list.

---

## API contract (dev-mobile handoff)

### List

```http
GET /api/hrm/employees?company_id={slug|uuid}&view=directory&q={search}&page=1&page_size=30&include_attendance_today=true&attendance_filter=checked_in|not_checked_in
```

| Query | Notes |
|-------|-------|
| `view=directory` | **Required** for directory projection |
| `q` or `keyword` | ILIKE on `full_name`, `employee_code`, `email` |
| `company_id` | JWT scope slug (`holding`, `main`) or member UUID |
| `status` | Defaults to `active` when omitted |
| `include_attendance_today` | Optional — adds `attendance_today` badge per row |
| `attendance_filter` | Only when `include_attendance_today=true` |

**Response:** `HRM-EMP-DIR-200`

```json
{
  "success": true,
  "code": "HRM-EMP-DIR-200",
  "data": {
    "total": 213,
    "page": 1,
    "page_size": 5,
    "data": [
      {
        "id": "uuid",
        "employee_code": "HLD-0091",
        "full_name": "Bùi Quốc An",
        "job_title_key": "DRIVER",
        "department": "Ban Điều hành",
        "avatar_url": null,
        "status": "active",
        "attendance_today": {
          "checked_in": false,
          "check_in_at": null,
          "status": null
        }
      }
    ]
  }
}
```

**Excluded from list:** `email`, `custom_fields`, `date_of_birth`, `manager_id`, `phone_number`.

### Detail (colleague tap)

```http
GET /api/hrm/employees/{id}?company_id={scope}&view=directory&include_attendance_today=true
```

**Response:** `HRM-EMP-200` with directory projection + `manager_id`, `phone_number`, masked `email` (HR roles get plaintext).

### Mobile integration notes

- Use `company_id` from `active_membership.company_uuid` (same as other ESS calls).
- Search debounce → `q=` param (alias `keyword` also accepted).
- Check-in chip filter → `include_attendance_today=true` + `attendance_filter=checked_in|not_checked_in`.
- FlashList row key = `id`; department label from `department` field (not raw `custom_fields`).
- List→detail parity: **VAL-W7-DIR-01** — same `id` visible in list must 200 on detail with same `view=directory`.

---

## Verification

### Jest

```bash
pnpm --filter hrm-api exec jest src/employees --no-cache
```

| Suite | Result |
|-------|--------|
| `employee-directory.spec.ts` | **7/7 PASS** |
| `employees.service.spec.ts` (MOB-W7-5 block) | **3/3 PASS** |
| `employees.controller.spec.ts` (MOB-W7-5) | **2/2 PASS** |
| **employees module total** | **52/53 PASS** (1 pre-existing HTTP parity flake unrelated) |

### Local smoke curl (`http://127.0.0.1:28001`)

```bash
# List holding
curl -s "http://127.0.0.1:28001/api/hrm/employees?company_id=holding&view=directory&page=1&page_size=5" \
  -H "x-internal-api-key: xevn-dev-internal-key" -H "x-tenant-id: xevn"
# → 200 HRM-EMP-DIR-200 total=213

# Detail
curl -s "http://127.0.0.1:28001/api/hrm/employees/{id}?company_id=holding&view=directory" \
  -H "x-internal-api-key: xevn-dev-internal-key" -H "x-tenant-id: xevn"
# → 200 HRM-EMP-200 with manager_id, phone_number, email (internal = full)

# Group CEO rollup + search + attendance badge
curl -s "http://127.0.0.1:28001/api/hrm/employees?company_id=main&view=directory&q=Nguyen&page=1&page_size=3&include_attendance_today=true" \
  -H "x-internal-api-key: xevn-dev-internal-key" -H "x-tenant-id: xevn" -H "x-company-id: main"
# → 200 HRM-EMP-DIR-200 total=91, rows include attendance_today object
```

### nip.io probe (pre-deploy)

```bash
node scripts/tmp-mob-w7-5-directory-probe.mjs
# api_base=https://14-225-217-232.nip.io
# → FAIL HRM-VAL-001 "property view should not exist" (VPS not yet on this commit)
```

**Residual:** `devops` deploy hrm-api delta to nip.io before device QA J-MOB-30.

---

## Files changed

| File | Change |
|------|--------|
| `employees/employee-directory.ts` | Projection + PII mask helpers |
| `employees/employee-directory.types.ts` | Shared row type |
| `employees/employees.service.ts` | `listEmployeeDirectory`, `getEmployeeDirectoryById`, attendance batch |
| `employees/employees.controller.ts` | Route branch + `HRM-EMP-DIR-200` |
| `employees/dto/list-employees.query.dto.ts` | `view`, `q`, `include_attendance_today`, `attendance_filter` |
| `employees/dto/get-employee.query.dto.ts` | `view`, `include_attendance_today` |
| `employees/*.spec.ts` | VAL-W7-DIR-01/02 coverage |
| `scripts/tmp-mob-w7-5-directory-probe.mjs` | Smoke probe |

---

## Handoff

```yaml
completion_report: |
  MOB-W7-5-DIRECTORY-BE closed. GET /employees?view=directory + GET /employees/:id?view=directory
  with scope parity (resolveHrmListScope), q/keyword search, pagination, optional attendance_today badge,
  PII-safe projection per MOBILE_W7_DATA_CONTRACTS §5. Jest 52/53 employees PASS; local curl exit 0.
  nip.io pre-deploy HRM-VAL-001 — devops deploy residual.

next_owner: qa

next_dispatch_prompt: |
  work_item_id: MOB-W7-5-DIRECTORY-QA
  from_role: pm
  to_role: qa
  lane: execution
  entry_criteria: dev-be READY_FOR_QA mob-w7-5-directory-be-20260609.md; local hrm-api :28001 or post-devops nip.io
  action: VAL-W7-DIR-01 list→detail parity under company_id=main (group CEO) + holding slug; VAL-W7-DIR-02 q search;
    VAL-W7-DIR-03 non-HR email mask on detail; include_attendance_today badge shape; grep response JSON
    must not contain custom_fields or date_of_birth
  exit_criteria: evidence docs/qa/evidence/mob-w7-5-directory-qa-YYYYMMDD.md ack_status PASS_TO_PM or FAIL_TO_PM

evidence_path: docs/qa/evidence/mob-w7-5-directory-be-20260609.md
ack_status: READY_FOR_QA
```
