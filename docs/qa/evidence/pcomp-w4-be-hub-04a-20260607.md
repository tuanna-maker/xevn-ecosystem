# PCOMP-W4-BE-HUB-04a — Smart Hub aggregate API (MOB-UX-04a)

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-W4-BE-HUB-04a` |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | `READY_FOR_QA` |
| **generated** | 2026-06-07 |
| **spec_ref** | `docs/program/MOBILE_HOME_HUB_AC_DELTA.md` §5–6, §8.1 |

---

## Decision

**Option B — aggregate BE** implemented: `GET /api/hrm/home/summary` composes inbox, own pending leave/update, manager pending (direct reports), and attendance today in one scoped call. Reduces mobile parallel fan-out (R-HUB-04) vs Option A six-call compose.

`celebrations` / `whos_out` return empty stubs for MOB-UX-04a; populated in MOB-UX-04b.

---

## Implementation

| File | Purpose |
|------|---------|
| `apps/api/hrm-api/src/home/home.controller.ts` | Route `GET home/summary`; auth + `resolveScopeContext` |
| `apps/api/hrm-api/src/home/home.service.ts` | Aggregate logic; BR-MGR-TASK-02/03/07; BR-BDAY-01 (no `birth_year`) |
| `apps/api/hrm-api/src/home/dto/get-home-summary.query.dto.ts` | Query: `company_id`, `employee_id`, optional `include` CSV |
| `apps/api/hrm-api/src/home/home-summary.types.ts` | Response contract types |
| `apps/api/hrm-api/src/home/home.controller.spec.ts` | Controller auth, HRM-HOME-200, 409 scope mismatch |
| `apps/api/hrm-api/src/home/home.service.spec.ts` | Manager count parity, direct-report filter, privacy |
| `apps/api/hrm-api/src/app.module.ts` | Register `HomeController` + `HomeService` |

### Endpoint

```
GET /api/hrm/home/summary?company_id={slug|uuid}&employee_id={uuid}&include=tasks,manager_pending
```

**Headers:** `Authorization`, `x-tenant-id`, `x-company-id` (standard HRM).

**Success:** `code: HRM-HOME-200` — shape per delta §6.2 (`viewer`, `tasks`, `manager_pending`, empty `celebrations`/`whos_out`, `attendance_today`, `generated_at`).

**Scope:** `resolveScopeContext` on controller; `resolveHrmListScope` + workforce filter on viewer load; delegated `listInbox` / `listLeaveRequests` / `listUpdateRequests` / `listRecords` reuse existing scoped services.

**Manager (BR-MGR-TASK-02):** `manager_employee_id={viewer}` → SQL `employees.manager_id` subquery (same as attendance L615–619).

**Badge (BR-MGR-TASK-03):** `manager_pending.total_count = leave_count + update_count`; inbox excluded from manager count.

**Privacy (04a):** Response JSON contains no `birth_year` or `date_of_birth`; viewer only exposes `is_birthday_today` boolean.

---

## Verification

```bash
cd apps/api/hrm-api
npx jest home --no-cache
# Test Suites: 2 passed, 2 total
# Tests:       11 passed, 11 total
# exit 0
```

### Spec coverage

| AC / BR | Test |
|---------|------|
| BR-MGR-TASK-02 | `manager_employee_id` passed to leave + update list services |
| BR-MGR-TASK-03 | `total_count = leave_count + update_count` |
| BR-MGR-TASK-05 | Non-manager JWT → `manager_pending` zero, no manager queries |
| BR-MGR-TASK-07 | Tasks use `employee_id` own pending; separate from manager count |
| BR-BDAY-01/02 | Serialized summary has no `birth_year` / `date_of_birth` |
| Scope 409 | Controller rejects `company_id=trsport` when JWT `holding` |
| HRM-HOME-200 | Controller envelope + service delegation |

---

## QA retest probes

1. **Manager UAT** — `GET /api/hrm/home/summary?company_id=holding&employee_id={manager}` with manager JWT (`roles` includes `manager`):
   - `manager_pending.total_count` matches `ManagerApprovalsScreen` pending leave + update counts (±0).
   - `manager_pending.preview` ≥1 row when seed has direct-report pending.
2. **NV UAT** — same endpoint with employee-only JWT:
   - `viewer.is_manager === false`
   - `manager_pending.total_count === 0`
   - `tasks` includes inbox unread and/or own pending when seeded.
3. **Scope** — wrong `company_id` vs token → HTTP 409 `SCOPE_CONTEXT_MISMATCH`.
4. **Privacy** — response body must not contain `birth_year` or full DOB ISO year fields.
5. **Regression** — `pnpm --filter hrm-api test` green; optional `qc:fe-be-health` if stack up.

### Mobile integration note (dev-mobile)

Wire `hrmApiClient.getHomeSummary()` to this endpoint (or keep compose fallback documented in client). Persona order + UI in `MOB-UX-04a-MOB` — not in this BE wave.

---

## Residual

| Item | Owner | Wave |
|------|-------|------|
| `celebrations` / `whos_out` data | dev-be | MOB-UX-04b |
| `include=celebrations,whos_out` SQL | dev-be | MOB-UX-04b |
| Mobile Smart Hub UI | dev-mobile | MOB-UX-04a-MOB |
| J-MOB-06/07 device evidence | qa-device | post-mobile |

---

## Handoff

```yaml
completion_report: |
  Implemented GET /api/hrm/home/summary aggregate for MOB-UX-04a with tasks, manager_pending,
  attendance_today, scoped viewer; empty celebrations/whos_out stubs; 11/11 jest PASS.
  Residual: 04b celebrations/whos_out BE; mobile DashboardScreen refactor; QA J-MOB-06/07.

next_owner: qa

next_dispatch_prompt: |
  work_item_id: PCOMP-W4-QA-HUB-04a
  Retest MOB-UX-04a BE: GET /api/hrm/home/summary with manager + NV UAT JWT on holding scope.
  Verify BR-MGR-TASK-03 count parity vs ManagerApprovals list endpoints; 409 on scope mismatch;
  no birth_year in JSON. Evidence: docs/qa/evidence/pcomp-w4-qa-hub-04a-YYYYMMDD.md.
  J-MOB-08/09 NOT PROMOTED until 04b. ack_status: PASS_TO_PM or FAIL with defect ids.

evidence_path: docs/qa/evidence/pcomp-w4-be-hub-04a-20260607.md
ack_status: READY_FOR_QA
```
