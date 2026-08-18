# Evidence — PO-UC-TC-W4-FE-NT01-PORTAL-EMBED-EMPLOYEE-ID-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-FE-NT01-PORTAL-EMBED-EMPLOYEE-ID-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-04 |
| **u65_zero_seed** | true |
| **spec_ref** | UC-HRM-12 · HRM-NT-01 · QA R1 `PO-UC-TC-W4-QA-B3-HRM-NT-R1` |

## spec_read_ack

| Doc | Ack |
|-----|-----|
| **QA evidence** | `docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-r1.md` — portal=1 `portalMembership` nulls `employee_id` |
| **Prior FE** | `docs/qa/evidence/po-uc-tc-w4-fe-nt01-inbox-mark-read-01.md` — PATCH client + hook unchanged |
| **Auth** | `AuthContext.tsx` · `portalAuthBridge.ts` · `useHrmInboxNotifications.ts` (scope via membership) |

## Root cause (FE)

`portalMembership()` always set `employee_id: null`. Embed `useEffect` / `hydrateFromPortalToken` / `refreshMemberships` rebuilt membership after mobile login, disabling `useHrmInboxNotifications`.

## Fix

| Change | Behavior |
|--------|----------|
| `getPortalEmbedEmployeeId(companyId)` | JWT `employee_id` when JWT `companyId` matches embed OU; else mobile login snapshot |
| `persistMobileMembershipsSnapshot` | Written on `signIn` from mobile login memberships |
| `portalMembership()` | Uses `getPortalEmbedEmployeeId` — **no** fake id for ceo@ without claim |
| `clearPortalSession` | Clears mobile membership snapshot |

## Verify (dev-fe)

```bash
pnpm --filter vite_react_shadcn_ts test -- portalAuthBridge.test.ts hrmApi.markInboxRead.test.ts
```

Exit **0** — 11 tests (2026-08-04).

## QA entry (R2 · same as R1)

| Persona | URL | Expect |
|---------|-----|--------|
| `uat.nv0007@xe.vn` | `/hr/login` → `/hr/notifications?portal=1&companyId=trsport` | GET inbox **200** · list visible · **Đánh dấu đã đọc** → PATCH **HRM-NOTIF-202** · F5 |
| `ceo@xe.vn` | `/hr/notifications?portal=1&companyId=main` | **EXPECTED_NO_INBOX** (honest copy, no fake unread) |

## must_keep

Mark-read PATCH client · mock badge removed · AT-12 / CI01 / `apps/api/**` · no seed

## Residual

None FE for this item — browser R2 required to close AC-NT01-MARK-01.
