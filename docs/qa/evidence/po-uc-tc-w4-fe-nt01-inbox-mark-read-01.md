# Evidence — PO-UC-TC-W4-FE-NT01-INBOX-MARK-READ-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-FE-NT01-INBOX-MARK-READ-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-04 |
| **u65_zero_seed** | true |
| **spec_ref** | UC-HRM-12 · HRM-NT-01 · `PATCH /api/hrm/notifications/inbox/:id/read` → `HRM-NOTIF-202` |

## Closed (FE)

| Item | Path / behavior |
|------|----------------|
| API client mark read | `apps/web/hrm/src/integrations/hrmApi.ts` — `markHrmInboxNotificationRead` |
| Inbox list page | `apps/web/hrm/src/pages/InboxNotifications.tsx` — route `/notifications` |
| Header bell | `apps/web/hrm/src/components/layout/AppHeader.tsx` — real inbox when `VITE_HRM_API_ORIGIN` + `employee_id`; **no** mock badge «3» |
| Shared hook | `apps/web/hrm/src/hooks/useHrmInboxNotifications.ts` |
| Display map | `apps/web/hrm/src/lib/hrmInboxNotificationDisplay.ts` |
| Unit test | `apps/web/hrm/src/integrations/hrmApi.markInboxRead.test.ts` |

## Verify (dev-fe)

```bash
pnpm --filter @xevn/hrm-web test -- hrmApi.markInboxRead.test.ts
```

Exit **0** (2026-08-04 dev-fe): `pnpm --filter vite_react_shadcn_ts test -- hrmApi.markInboxRead.test.ts` — 1 passed.

## QA entry (U65 · no seed)

| Step | Action |
|------|--------|
| Persona | `uat.nv####@xe.vn` / `xevn-uat-2026` with **employee_id** on membership (not `ceo@` without employee) |
| URL | Portal HRM embed e.g. `/hr/notifications?portal=1&companyId=<OU>` |
| Pre | Ensure prior **FE-origin** fanout created ≥1 unread inbox row (leave/service workflow — no `pnpm seed:*`) |
| Act | Open bell or `/notifications` → **Đánh dấu đã đọc** on unread row |
| Network | `PATCH …/notifications/inbox/:id/read` → **2xx** + code **`HRM-NOTIF-202`** |
| FE after 2xx | Row shows **Đã đọc** / badge clears; **F5** persists `read_at` |
| Blocked path | `ceo@` without `employee_id` → honest empty message (no fake unread) |

## Residual

| ID | Owner | Note |
|----|-------|------|
| R-W4-B3-NT01-CEO-NO-EID | ba-process / product | Group CEO inbox UC needs persona with `employee_id` — documented for QA matrix |
| HRM-NT-02 | qa-device | Push token mobile-only — out of this FE item |

## must_keep (untouched)

AT-12 L1 · CREATE-CATALOG · CI01 · BR-WF-04 · IM AU GWC · `apps/api/**` · seed · Leave L2 invent · Phase1 DONE claim
