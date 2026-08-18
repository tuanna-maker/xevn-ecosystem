# CD-FB-07-WF-DYNAMIC-QA — Leave dynamic resolver browser/UAT evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-07-WF-DYNAMIC-QA` |
| **Date** | 2026-07-19 |
| **Env** | Local L0 `:5173` portal + `:28001` hrm-api + `:28002` xbos-api |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · JWT `companyId=main` |
| **spec_ref** | ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620 §5/§9 · delta F4 AC-CD-F4-01..07 · UC-HRM-WF-01..02 |
| **U65** | Zero-seed · no `pnpm seed:*` · no inbox seed |
| **Scope claim** | Pilot leave only — **not** Bay.vn / full automation parity |

---

## Verdict: **FAIL_TO_PM** → residual owner **dev-be**

| AC | Result | Evidence |
|----|--------|----------|
| **AC-CD-F4-01** (leave → inbox manager đúng người, không cứng GROUP_APPROVER) | **FAIL** | Live start instance for HLD-0006 (manager = `uat.nv0001@xe.vn`) spawned tasks assigned to **`ceo@xe.vn` + `admin@xe.vn`** with `escalated:true`, `resolvedVia:"role_code"`, `escalationReason:"group_ceo"` — **not** `direct_manager` / `uat.nv0001@xe.vn` |
| AC-CD-F4-02 direct_manager | **FAIL** (live) | HRM resolver 500 when `company_id` present; unit jest PASS only |
| AC-CD-F4-03..07 | **UNTESTED** / blocked by F4-01 | Parallel / canvas / reject / ≥3 types not promoted |

**Jest (supporting):** `resolver-registry.spec.ts` **5/5 PASS** — unit matrix OK; **live integration FAIL**.

---

## L0 stack

```text
✓ hrm-api  :28001 HTTP 200
✓ xbos-api :28002 HTTP 200
✓ web-portal :5173 HTTP 200
```

Note: `pnpm run dev:xbos-api` (nest --watch) initially failed (`dist/main` missing after `deleteOutDir`); QA recovered with `nest build` + `node dist/main.js`.

---

## Browser path (U65 FE — partial)

1. Login `http://localhost:5173/login` → `ceo@xe.vn` → Command Center.
2. Open HRM Attendance / Nghỉ phép (portal embed + direct `/hr/attendance?portal=1…`).
3. Opened **Tạo yêu cầu nghỉ** dialog (employee select + date/reason fields visible).
4. **Blocked completing mutate in-session:**
   - Portal iframe soft-nav repeatedly landed on **Tuyển dụng** while URL claimed attendance (att-nav class).
   - React controlled date inputs did not retain `browser_fill` values → submit no-op (no POST leave-requests in PerformanceResourceTiming).
5. Leave list UI observed: Tổng yêu cầu **85**, Chờ duyệt **27** (pre-existing).

FE create→inbox→approve **not closed** this session; AC fail is proven on live resolver + instance start (same S2S path FE create would hit after INSERT).

---

## Root cause (dev-be) — `scope_parity` / SQL type

**File:** `apps/api/hrm-api/src/attendance/leave-workflow.bridge.ts`

```ts
companyFilter = ` AND e.company_id = $${params.length}::uuid`;
```

`employees.company_id` is **TEXT** (`holding`). Casting query param to `::uuid` yields:

`HRM-SYS-001` — `operator does not exist: text = uuid`

### Resolver matrix (HLD-0006 = `8ac84520-0d6b-4737-8341-2f9a929b5f81`)

| `company_id` query | HTTP | Result |
|--------------------|------|--------|
| _(omitted)_ | **200** | `manager_user_id=uat.nv0001@xe.vn` · `manager_employee_id=3796d949-…` |
| `holding` | **500** | `text = uuid` |
| `10000000-0000-4000-8000-000000000001` | **500** | `text = uuid` |

XBOS `XbosResolverDataSource.queryDirectManagerUserId` **always** appends `company_id` from submitter → live path always hits 500 → manager null → escalation BR-CD-F4-04 → `group_ceo` / hard-coded-class assignees.

---

## Live spawn probe (product WF start — not inbox seed)

```text
POST /api/xbos/workflow-engine/instances/start
workflowCode=hrm_leave_approval
submitter.employeeId=HLD-0006
submitter.companyId=<holding UUID>
→ 201 XBOS-WF-201
instance=7e97b0c9-fef2-46df-b88e-d806f5c4b78f
```

| Task id | assignee | hat_key | resolvedVia | escalated | escalationReason |
|---------|----------|---------|-------------|-----------|------------------|
| f505d7da-… | `admin@xe.vn` | group_ceo | role_code | true | group_ceo |
| 51444b9d-… | `ceo@xe.vn` | group_ceo | role_code | true | group_ceo |

**Expected (AC-CD-F4-01 / BR-CD-F4-02):** single task `assignee_user_id=uat.nv0001@xe.vn`, `resolvedVia=direct_manager`, `escalated=false`.

Definition auto-ensured: `hrm_leave_approval` with `resolver_type=direct_manager` (graph OK).

---

## Residual / defects

| ID | Severity | Owner | Description |
|----|----------|-------|-------------|
| **D-CD-FB-07-RESOLVER-COMPANY-TEXT** | **P0** | **dev-be** | Fix `resolveManagerForWorkflow` company filter: compare TEXT (`company_id::text` / slug expand), never `::uuid` against TEXT column. Add jest for slug + UUID company_id → 200 manager. |
| D-CD-FB-07-FE-LEAVE-SOFTNAV | P2 | dev-fe | Portal iframe attendance ↔ recruitment soft-nav drift blocked FE leave submit automation. |
| AC-CD-F4-03..07 | — | qa (retest) | After P0 fix: FE leave create → manager inbox → approve/reject; parallel + canvas separately. |

---

## What is NOT claimed

- Phase 1 / PROD DONE
- Full Bay.vn parity
- AC-CD-F4 PASS
- Inbox approve path (blocked by wrong assignee)

---

## completion_report

Closed: L0 PASS; browser leave UI reachable; ADR AC-CD-F4-01 **FAIL** with reproducible live evidence — manager resolve 500 on company_id + WF start escalates to `ceo@xe.vn`/`admin@xe.vn` instead of `uat.nv0001@xe.vn`. Unit resolver jest 5/5 PASS (gap = live HRM bridge SQL). Residual P0 → **dev-be**.

**next_owner:** `pm` → dispatch **dev-be**

**ack_status:** **FAIL_TO_PM**

**evidence_path:** `docs/qa/evidence/cd-fb-07-wf-dynamic-qa-20260719.md`

**next_dispatch_prompt:**

```text
work_item_id: CD-FB-07-WF-DYNAMIC-BE-FIX-01
from_role: pm
to_role: dev-be
lane: execution
entry_criteria: QA FAIL docs/qa/evidence/cd-fb-07-wf-dynamic-qa-20260719.md — D-CD-FB-07-RESOLVER-COMPANY-TEXT P0
spec_ref: ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620 §5.1 direct_manager · BR-CD-F4-02 · leave-workflow.bridge.ts resolveManagerForWorkflow
exit_criteria:
  (1) Fix company_id filter so TEXT slug + UUID both return manager without HRM-SYS-001
  (2) jest: company_id=holding and UUID → manager_user_id for HLD-0006 fixture / mock
  (3) Live: POST workflow-engine/instances/start hrm_leave_approval for employee with manager_id → task assignee = manager email (uat.nv0001@xe.vn), resolvedVia=direct_manager, escalated=false — NOT ceo@xe.vn group_ceo escalation
  (4) evidence docs/qa/evidence/cd-fb-07-wf-dynamic-be-fix-01-YYYYMMDD.md; ack READY_FOR_QA
allowed_paths: apps/api/hrm-api/src/attendance/leave-workflow.bridge.ts, leave-workflow.controller.ts, related specs; apps/api/xbos-api/src/workflow-engine/resolver-data-source.ts only if caller must omit/normalize company_id
cấm: pnpm seed:* · Phase1/PROD claim · Bay.vn parity scope creep
```
