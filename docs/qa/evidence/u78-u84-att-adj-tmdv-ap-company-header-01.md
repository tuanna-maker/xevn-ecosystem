# Evidence — U78-U84-ATT-ADJ-TMDV-AP-COMPANY-HEADER-01

| Field | Value |
|-------|--------|
| **work_item_id** | `U78-U84-ATT-ADJ-TMDV-AP-COMPANY-HEADER-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P0 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | FIX |
| **U65** | honored — no seed |
| **prior** | [`u78-u84-primary-att-adj-tmdv-01-r1.md`](u78-u84-primary-att-adj-tmdv-01-r1.md) · residual `R-U84-ATT-ADJ-TMDV-AP-SCOPE-HEADER` |
| **parallel** | BE `U78-U84-ATT-ADJ-TMDV-SCOPE-PARITY-01` (list slug↔UUID) — do not claim R2 until both READY |

---

## Root cause

| Layer | Behavior |
|-------|----------|
| `requestHrm` headers | `inferRuntimeScope()` → `resolveHrmSpreadsheetScope` |
| Spreadsheet scope | Portal session + JWT tenant `xevn` **early-return** `x-company-id: main` (catalog/settings U39) |
| List/create | Use query/body `company_id=trsport` first → OK for mgr |
| Approve | Controller only `resolveScopeContext({ companyId: header })` → FE sent `main` vs membership `trsport` → **409** `SCOPE_CONTEXT_MISMATCH` |
| L1 diagnostic | POST approve + `x-company-id: trsport` → **201** `HRM-ATT-REQ-203` |

---

## Fix (preserve_default)

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/hrmSpreadsheetScope.ts` | ADD `resolveHrmMutateCompanyScope` — prefer JWT member company / OU hint; **does not** force catalog `main` |
| `apps/web/hrm/src/integrations/hrmApi.ts` | approve/reject/delete/update update-requests pass mutate scope → `x-company-id` |
| `apps/web/hrm/src/hooks/useAttendanceUpdateRequests.ts` | Pass `currentCompanyId` into mutate APIs; guard when missing |
| `AttendanceUpdateRequestTab.tsx` | CODE-MEMORY APPEND only (hook already used) |
| Tests | `hrmSpreadsheetScope.test.ts` + `useAttendanceUpdateRequests.test.ts` |

**must_keep:** ISO create compose (`attendanceUpdateRequestTime`); leave approve path untouched; spreadsheet catalog `main` early-return intact.

---

## Verify

```text
pnpm --filter vite_react_shadcn_ts test -- src/lib/hrmSpreadsheetScope.test.ts src/hooks/useAttendanceUpdateRequests.test.ts
→ 2 files · 10 tests PASS
```

| Assertion | Result |
|-----------|--------|
| Member JWT `trsport` → mutate scope `companyId=trsport` | ✅ |
| Spreadsheet scope still `main` for same JWT (catalog) | ✅ |
| Group JWT `main` + OU hint `trsport` → mutate `trsport` | ✅ |
| Hook source passes `currentCompanyId` to approve/reject/delete | ✅ |

---

## QA R2 gate (coordinate)

**Do not run Primary R2 until:**

1. This WI READY_FOR_QA (FE header) — **this evidence**
2. BE `U78-U84-ATT-ADJ-TMDV-SCOPE-PARITY-01` READY_FOR_QA (CEO list slug)

Then: `U78-U84-PRIMARY-ATT-ADJ-TMDV-01-R2` — mgr `uat.nv0002` Eye → **Duyệt** → Network POST approve **2xx** with `x-company-id: trsport` (or active membership company) → F5 approved.

---

## completion_report

**Closed:** FE Duyệt path wires operating-unit `x-company-id` via `resolveHrmMutateCompanyScope` + `currentCompanyId`; vitest 10/10; CODE-MEMORY APPEND; catalog spreadsheet scope / leave approve / ISO create preserved.  
**Open:** Browser R2 promote blocked until BE list scope parity also READY; UAT/Phase1 not claimed.

**ack_status:** READY_FOR_QA  
**next_owner:** pm → qa R2 only after BE scope parity ALSO READY_FOR_QA  
**evidence_path:** `docs/qa/evidence/u78-u84-att-adj-tmdv-ap-company-header-01.md`

### next_dispatch_prompt

```text
work_item_id: U78-U84-PRIMARY-ATT-ADJ-TMDV-01-R2
from_role: pm
to_role: qa
ack_status_target: PASS_TO_PM
priority: P0
u65_zero_seed: true
entry_criteria: FE U78-U84-ATT-ADJ-TMDV-AP-COMPANY-HEADER-01 READY_FOR_QA AND BE U78-U84-ATT-ADJ-TMDV-SCOPE-PARITY-01 READY_FOR_QA (both landed)
MISSION: Primary P-ATT-ADJ @ CO-TMDV retest HP+AP after FE approve x-company-id + BE list slug parity.
Persona AP: uat.nv0002 · company trsport · HDSD Eye → Duyệt
exit_criteria: CEO create→F5 pending @ companyId=trsport; mgr FE Duyệt POST approve 2xx with x-company-id=trsport → F5 approved; Network prove header; U78 test-log; promote TC-HIM-ATT-TMDV-HP-001 + AP-001 or residual clear.
cấm: seed · invent XBOS inbox · PASS without FE click path
evidence_path: docs/qa/evidence/u78-u84-primary-att-adj-tmdv-01-r2.md
read_first: docs/qa/evidence/u78-u84-att-adj-tmdv-ap-company-header-01.md · docs/qa/evidence/u78-u84-att-adj-tmdv-scope-parity-01.md · u78-u84-primary-att-adj-tmdv-01-r1.md
```
