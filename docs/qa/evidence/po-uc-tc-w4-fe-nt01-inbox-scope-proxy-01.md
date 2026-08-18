# Evidence — `PO-UC-TC-W4-FE-NT01-INBOX-SCOPE-PROXY-01`

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-FE-NT01-INBOX-SCOPE-PROXY-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-04 |
| **u65_zero_seed** | true |
| **spec_ref** | UC-HRM-12 · HRM-NT-01 · QA R2 `po-uc-tc-w4-qa-b3-hrm-nt-r2.md` |

---

## Root cause (confirmed)

`useHrmInboxScope` required `VITE_HRM_API_ORIGIN` for `enabled=true`. Portal dev at `:5173` leaves origin empty; `hrmApi` already calls relative `/api/hrm/*` via Vite proxy — same UI copy as missing `employee_id`, **0** inbox GET/PATCH.

---

## Fix

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/hrmDataMode.ts` | ADD `isHrmNestApiReachable()` — origin set **or** `isHrmApiDataMode()` (portal `/hr` proxy) |
| `apps/web/hrm/src/hooks/useHrmInboxNotifications.ts` | `useHrmInboxScope.enabled` uses helper; CODE-MEMORY APPEND |
| `apps/web/hrm/src/components/dashboard/HrmApiReminders.tsx` | Same parity for dashboard inbox slice |
| `apps/web/hrm/src/components/layout/AppHeader.tsx` | CODE-MEMORY comment only (uses hook) |

**Preserved:** `ceo@xe.vn` with `employee_id` null → `enabled=false` → EXPECTED_NO_INBOX (no fake unread).

---

## Verify (automated)

```text
pnpm test src/lib/hrmDataMode.test.ts src/integrations/hrmApi.markInboxRead.test.ts
→ 20/20 PASS
```

New cases: `isHrmNestApiReachable` — origin set; `/hr/notifications` proxy without origin; legacy off without portal → false.

---

## QA retest (browser — same AC as R1/R2)

| Persona | URL | Expect |
|---------|-----|--------|
| `uat.nv0007@xe.vn` | `/hr/notifications?portal=1&tenantId=xevn&companyId=trsport` | GET inbox **200**, list visible, «Đánh dấu đã đọc» → PATCH **HRM-NOTIF-202**, F5 |
| `ceo@xe.vn` | `/hr/notifications?portal=1&companyId=main` | EXPECTED_NO_INBOX — requires-employee / rollup, **no** fake unread |

**work_item_id next:** `PO-UC-TC-W4-QA-B3-HRM-NT-R3`

---

## Handoff

```
completion_report: Fixed inbox scope gate for portal proxy; HrmApiReminders parity; 20 vitest PASS. ceo@ without employee_id unchanged.
next_owner: qa
evidence_path: docs/qa/evidence/po-uc-tc-w4-fe-nt01-inbox-scope-proxy-01.md
ack_status: READY_FOR_QA
```
