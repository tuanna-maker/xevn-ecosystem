# Evidence — U78-U84-ATT-ADJ-TMDV-SCOPE-PARITY-01

| Field | Value |
|-------|--------|
| **work_item_id** | `U78-U84-ATT-ADJ-TMDV-SCOPE-PARITY-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P0 |
| **change_mode** | FIX |
| **ack_status** | **READY_FOR_QA** |
| **U65** | honored — no seed |
| **prior** | [`u78-u84-primary-att-adj-tmdv-01-r1.md`](u78-u84-primary-att-adj-tmdv-01-r1.md) |

---

## Root cause

| Root | Cause | Fix |
|------|-------|-----|
| **A — CEO F5 empty** | `attendance_update_requests.company_id` persists Plane B′ UUID; `listUpdateRequests` filtered `aur.company_id::text = 'trsport'` without UUID expand when Group CEO JWT is `main` | `expandHrmTextCompanyIds` always adds Plane B′ UUID (+ inverse slug) for every id already in scope; list uses `normalizePayrollListCompanyId` first |
| **B — Mgr Duyệt 409** | FE `resolveHrmSpreadsheetScope` forces `x-company-id=main` for any xevn portal session; approve only reads header → `SCOPE_CONTEXT_MISMATCH` vs JWT `trsport` | `normalizeMemberPortalMainHeader` (subsidiary OU only) + mutate handlers pass `resolveScopeContext().companyId`; Plane B′ slug↔UUID in `companyScopeMatches` |

must_keep: leave approve W2A holding↔main; group CEO header main stays main; FE ISO create path; U65.

---

## Files touched

- `apps/api/hrm-api/src/common/hrm-list-scope.ts` — expand Plane B′ in `expandHrmTextCompanyIds` · CODE-MEMORY APPEND
- `apps/api/hrm-api/src/common/scope-context.ts` — member portal main→JWT slug; Plane B′ UUID match
- `apps/api/hrm-api/src/attendance/attendance.service.ts` — list/guard normalizePayroll ladder · CODE-MEMORY APPEND
- `apps/api/hrm-api/src/attendance/attendance.controller.ts` — mutate uses resolved `scope.companyId` · CODE-MEMORY APPEND
- Specs: `attendance.service.spec.ts` · `hrm-list-scope.spec.ts` · `scope-context.spec.ts`

---

## Verification

### Jest

```text
pnpm exec jest src/attendance/attendance.service.spec.ts \
  src/common/hrm-list-scope.spec.ts src/common/scope-context.spec.ts
→ Test Suites: 3 passed · Tests: 64 passed
```

### Live (after dist rebuild + restart :28001)

| Probe | Result |
|-------|--------|
| Group CEO XBOS JWT `GET …/update-requests?company_id=trsport` (hdr main) | **200** total=**8** pendingTrsport≥1 (was **0**) |
| Mgr `uat.nv0002` approve `x-company-id=trsport` | **201** `HRM-ATT-REQ-203` |
| Mgr approve `x-company-id=` Plane B′ UUID | **201** |
| Mgr approve `x-company-id=main` (FE spreadsheet header) | **201** (was **409** SCOPE_CONTEXT_MISMATCH) |

UUID trsport: `10000000-0000-4000-8000-000000000002`

---

## Residual

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| FE `resolveHrmSpreadsheetScope` always main | P2 | dev-fe (parallel WI if open) | BE tolerates subsidiary OU; FE still should send operating slug for clarity |
| Browser HP+AP promote | P0 QA | qa R2 | Not claimed here — U65 FE path |

---

## completion_report

**Closed:** List slug↔UUID parity for update-requests; mgr approve scope when portal header is `main`; jest 64/64; live CEO list trsport + mgr approve main/slug/UUID 2xx; CODE-MEMORY APPEND; hrm-api dist restarted on :28001.  
**Open:** Browser R2 UF promote (CEO F5 + mgr Eye→Duyệt) — QA.

**ack_status:** READY_FOR_QA  
**next_owner:** qa  
**evidence_path:** `docs/qa/evidence/u78-u84-att-adj-tmdv-scope-parity-01.md`

### next_dispatch_prompt

```text
work_item_id: U78-U84-PRIMARY-ATT-ADJ-TMDV-01-R2
from_role: pm
to_role: qa
ack_status_target: PASS_TO_PM
priority: P0
u65_zero_seed: true
hdsd_align: true

MISSION: Retest Primary P-ATT-ADJ @ CO-TMDV after BE scope parity (list slug↔UUID + mgr approve main/header).
entry: L0 stack; hrm-api rebuilt with U78-U84-ATT-ADJ-TMDV-SCOPE-PARITY-01; no seed.
HP: ceo@xe.vn → /hr/attendance?companyId=trsport → Quản lý đơn → Đề nghị cập nhật công → Thêm đề nghị (ISO times) → POST 201 → F5 list pending visible @ OU TM-DV.
AP: uat.nv0002 Eye → Duyệt → POST approve 2xx → F5 approved (XBOS inbox N/A GOVERNANCE_LOCK).
exit: TC-HIM-ATT-TMDV-HP-001 + AP-001 promoted or FAIL with residual; U78 IEEE test-log pair; matrix cell update.
evidence_path: docs/qa/evidence/u78-u84-primary-att-adj-tmdv-01-r2.md
read_first: docs/qa/evidence/u78-u84-att-adj-tmdv-scope-parity-01.md · u78-u84-primary-att-adj-tmdv-01-r1.md
```
