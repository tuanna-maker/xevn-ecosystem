# PCOMP-W4-MOB-UX-04a — Smart Hub v2 (J-MOB-06/07)

**work_item_id:** `PCOMP-W4-MOB-UX-04a`  
**Date:** 2026-06-07  
**Owner:** Dev-Mobile  
**ack_status:** `READY_FOR_QA`  
**Entry:** `docs/program/MOBILE_HOME_HUB_AC_DELTA.md` §4.1–4.2, §7, §8.2 (Option A compose)

---

## Scope closed

| Deliverable | Path | AC |
|-------------|------|-----|
| Hub merge + manager count helpers | `utils/dashboardHub.ts` | BR-MGR-TASK-06/07/08, BR-INBOX-HUB |
| Smart Hub Dashboard | `features/dashboard/DashboardScreen.tsx` | AC-MOB-HUB-06, AC-MOB-HUB-07, §7 persona order |
| Unit tests | `utils/__tests__/dashboardHub.test.ts` (8 cases) | Fixture merge, dedupe, manager count |
| Safe area | `AppScreenLayout safeAreaTop` unchanged (MOB-UX-SAFE-01) | Tab-root inset |

**API path:** Option A — compose 6 existing endpoints (2 batches, ≤4 parallel per batch). No new `GET /home/summary` dependency.

---

## Section order (§7)

| Persona | Block order (top → bottom) |
|---------|---------------------------|
| NV | Greeting → Quick actions → **Việc cần làm** → Hôm nay → Sắp tới |
| Manager | Greeting → **Cần duyệt (n)** → Quick actions → Việc cần làm → Hôm nay → Sắp tới |

---

## API compose (batch)

| Batch | Endpoints | Purpose |
|-------|-----------|---------|
| 1 (4× parallel) | `attendance/records` today, `leave-requests` (all), own pending leave, own pending update | Hôm nay + Sắp tới + own tasks |
| 2 (1–3× parallel) | `notifications/inbox?limit=5`, manager pending leave + update (`manager_employee_id`) | Việc cần làm + Cần duyệt |

Partial failure: module-level `tasksError` / `managerError`; greeting + other sections still render (AC-MOB-HUB-06-06).

Initial load: `loading={false}` on layout — sections visible immediately; pull-to-refresh uses `refreshing` (AC-MOB-HUB-06-01).

---

## AC mapping

| AC-ID | Implementation |
|-------|----------------|
| AC-MOB-HUB-06-01 | Greeting + section shells render without full-screen spinner |
| AC-MOB-HUB-06-02 | «Việc cần làm» badge = `taskTotalCount`; `ListRow` previews from inbox + own pending |
| AC-MOB-HUB-06-03 | Empty copy «Bạn đã xử lý hết việc hôm nay» + CTAs Tạo đơn nghỉ / Xem thông báo |
| AC-MOB-HUB-06-04 | Own pending leave → `LeaveRequestDetail`; inbox approved → detail by `leave_request_id` |
| AC-MOB-HUB-06-05 | «Xem tất cả» → `InAppNotifications` |
| AC-MOB-HUB-06-06 | `Promise.allSettled` + per-module error text |
| AC-MOB-HUB-07-01 | `auth.isManager` → `SurfaceCard` «Cần duyệt (n)» above quick actions |
| AC-MOB-HUB-07-02 | `resolveManagerPendingCount` = leave + update manager queries (same as tab badge) |
| AC-MOB-HUB-07-03 | `buildManagerPreviewRows` when n > 0 |
| AC-MOB-HUB-07-04 | Card / rows → `TabMore/ManagerApprovals` |
| AC-MOB-HUB-07-06 | Manager card hidden when `!auth.isManager` |

**NOT in scope (04b/c):** J-MOB-08 birthday, J-MOB-09 whos-out, J-MOB-10 quick-action pin.

---

## Verification (agent-run)

```text
cd apps/mobile/hrm-mobile
pnpm test   → 20 files, 104 tests PASS, exit 0
pnpm build  → tsc --noEmit PASS, exit 0
```

---

## QA device matrix

| Journey | Persona | Steps |
|---------|---------|-------|
| J-MOB-06 | `uat.nv0001@xe.vn` | Login → Home ≤2s «Việc cần làm» → tap pending row → detail; empty CTA; pull refresh |
| J-MOB-07 | Manager UAT (J-MOB-05 seed) | Home «Cần duyệt (n)» before Hôm nay → tap → ManagerApprovals → approve → Home refresh n−1 |

Compare manager count with `RootNavigator` tab badge (same query params).

---

## Residual

| Item | Owner | Note |
|------|-------|------|
| J-MOB-06-07 offline cache tasks | dev-mobile 04b | `ASYNC_CACHE.DASHBOARD_V1` persists snapshot; task list not separately keyed |
| `GET /home/summary` aggregate | dev-be | Optional latency win; 04a PASS without |
| J-MOB-08/09/10 | MOB-UX-04b/c | DEFERRED per AC delta §4.5 gate |

---

## Handoff

```yaml
completion_report: |
  Closed MOB-UX-04a Smart Hub P0: DashboardScreen refactored with «Việc cần làm» (inbox + own pending,
  badge, empty CTAs, deep links) and manager «Cần duyệt (n)» on Home per persona §7. Pure helpers in
  dashboardHub.ts with dedupe BR-MGR-TASK-08. Compose 6 endpoints in 2 batches. Vitest 104/104 PASS.
  Residual: offline task cache granularity; 04b celebrations/whos-out; optional BE home/summary.

next_owner: qa

next_dispatch_prompt: |
  work_item_id: PCOMP-W4-MOB-UX-04a-QA
  Dispatch qa-device: Retest J-MOB-06 and J-MOB-07 per docs/qa/evidence/pcomp-w4-mob-ux-04a-20260607.md.
  NV account uat.nv0001@xe.vn — verify «Việc cần làm» badge, empty CTAs, tap own pending → LeaveRequestDetail,
  «Xem tất cả» → Notifications. Manager account with pending direct reports — verify «Cần duyệt (n)» on Home
  (above quick actions), count matches TabMore badge ±0, tap → ManagerApprovals, approve one → pull refresh n−1.
  Evidence: docs/qa/evidence/pcomp-w4-mob-hub-jmob06-20260607.md (screenshot + logcat). ack_status: PASS_TO_PM
  or FAIL with route/J-id.

evidence_path: docs/qa/evidence/pcomp-w4-mob-ux-04a-20260607.md
ack_status: READY_FOR_QA
```
