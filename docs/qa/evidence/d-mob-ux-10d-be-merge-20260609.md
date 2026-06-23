# D-MOB-UX-10d-BE-MERGE — Attendance scope fix repo merge

| Field | Value |
|-------|-------|
| **work_item_id** | `D-MOB-UX-10d-BE-MERGE` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **date** | 2026-06-09 |
| **ack_status** | **READY_FOR_QA** |

---

## Executive verdict

**READY_FOR_QA** — VPS-only hotfix (`normalizePayrollListCompanyId` on attendance `listRecords` / `getRecordById`) is merged into the monorepo working tree. Mobile `company_uuid` query param maps to JWT `holding` slug before `resolveHrmListScope`, restoring workforce filter parity. Jest attendance module **50/50 PASS** including new D-MOB-UX-10d UUID path specs.

---

## Root cause (recap)

Mobile attendance history sends `company_id=<company_uuid>` (legal entity UUID). `attendance_records` scope used UUID directly in `resolveHrmListScope` → employee subquery matched `company_id = <uuid>` while workforce rows use slug `holding` → **total=0** / record 404. Payroll already had `normalizePayrollListCompanyId`; attendance lacked it until D-MOB-UX-10d-01 VPS patch.

---

## Repo changes (not VPS-only)

| File | Change |
|------|--------|
| `apps/api/hrm-api/src/common/hrm-list-scope.ts` | Export `normalizePayrollListCompanyId`, `expandHrmTextCompanyIds`; slug-based `pushWorkforceEmployeeScopeFilter`; tenant-aware `assertResourceInHrmScope` |
| `apps/api/hrm-api/src/attendance/attendance.service.ts` | `listRecords` + `getRecordById` call `normalizePayrollListCompanyId` before scope; `listUpdateRequests` uses `expandHrmTextCompanyIds` + `pushCompanyIdTextColumnFilter` |
| `apps/api/hrm-api/src/attendance/attendance.controller.ts` | `GET .../records/:recordId` passes scoped query DTO |
| `apps/api/hrm-api/src/attendance/dto/get-attendance-record.query.dto.ts` | New — `company_id` required on get-by-id |
| `apps/api/hrm-api/src/common/hrm-list-scope.spec.ts` | `normalizePayrollListCompanyId` UUID→holding (J-MOB-04/05) |
| `apps/api/hrm-api/src/attendance/attendance.service.spec.ts` | D-MOB-UX-10d `listRecords` + `getRecordById` mobile UUID probes; J-MOB-05 update-request ANY filter |
| `scripts/seed-hrm-uat-mob-attendance-pills.mjs` | Idempotent UAT pill seed (`pnpm run seed:hrm:uat-mob-attendance-pills`) |

### Scope parity (list ↔ get-by-id)

Both `listRecords` and `getRecordById` share:

```ts
const scopeCompanyId = normalizePayrollListCompanyId(authorization, query.company_id);
const scope = resolveHrmListScope(authorization, scopeCompanyId, scopeContext);
pushWorkforceEmployeeScopeFilter(filters, values, scope);
```

---

## Jest — mobile UUID path (D-MOB-UX-10d)

| Spec | Assertion |
|------|-----------|
| `listRecords maps mobile company_uuid query to holding slug workforce scope` | SQL uses `company_id = $1::text` with param `holding` when query sends holding UUID |
| `getRecordById maps mobile company_uuid query to holding slug workforce scope` | Same normalization; returns scoped row |
| `normalizePayrollListCompanyId maps mobile company_uuid query to holding slug` | Unit test in `hrm-list-scope.spec.ts` |

Token fixture: `uat.nv0001@xe.vn`, `companyId: holding`, `company_uuid: 6efaa5d6-a4a8-4bfd-805a-3c4f003e4013`.

---

## Commands (exit codes)

| Command | Exit | Result |
|---------|------|--------|
| `pnpm --filter hrm-api exec jest --testPathPatterns=attendance` | **0** | **50/50** tests PASS (5 suites) |

---

## QA retest hints (L1 + L2.5)

| Journey | Account | Probe |
|---------|---------|-------|
| J-MOB-UX-10d attendance pills | `uat.nv0001@xe.vn` / `xevn-uat-2026` | `GET /api/hrm/attendance/records?company_id=<company_uuid>&page=1&page_size=20` → total ≥ 3, mix present/pending/absent |
| J-HRM-06 get-by-id | same | `GET /api/hrm/attendance/records/:id?company_id=<company_uuid>` → 200, not 404 |

Pre-req: `pnpm run seed:hrm:uat-mob-attendance-pills` on target DB (evidence: `docs/qa/evidence/d-mob-ux-10d-seed-20260609.md`).

---

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| Uncommitted working tree | PM/Dev | BE + seed script in git diff; commit when sponsor requests |
| VPS rebuild | `devops` | Redeploy from repo commit after merge PR — current nip.io may still run pre-merge image until rebuild |

---

## Handoff

- **next_owner:** `qa`
- **pm_dispatch_hint:** Retest J-MOB-UX-10d @ nip.io or local stack after `qc:fe-be-health` PASS; confirm pill timeline total ≥ 3 with `company_uuid` param.
