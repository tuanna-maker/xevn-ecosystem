# PCOMP-W8-MOB-ESS-DASH-01 — ESS Dashboard layer (MOB-UX-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-W8-MOB-ESS-DASH-01` |
| **from_role** | dev-mobile |
| **to_role** | qa |
| **ack_status** | `READY_FOR_QA` |
| **generated** | 2026-06-08 |
| **spec_ref** | `MOBILE_HRM_ESS_UX_BENCHMARK.md` §4.1 §7.1 · BR-ESS-01..04 |

---

## Scope closed (J-MOB-19..22)

| Journey | Deliverable | Path |
|---------|-------------|------|
| J-MOB-19 | Header avatar + name + **role** + chat stub + bell | `components/home/HomeTopBar.tsx`, `ChatStubModal.tsx` |
| J-MOB-20 | Time greeting + **date picker pill** + stats refetch on date | `DashboardDateBar.tsx`, `AttendanceStatsRow.tsx` |
| J-MOB-21 | **4 stat cards** (2×2) with deep links | `DashboardStatCards.tsx`, `utils/dashboardEss.ts` |
| J-MOB-22 | **Announcements** list section | `AnnouncementsSection.tsx`, inbox filter in `dashboardEss.ts` |

**Composite scroll order (BR-ESS-01):** ESS header → date/stats/cards/announcements → Portal (carousel/grid/feed) → Smart Hub (J-MOB-06..09, 15).

**Integration:** `features/dashboard/DashboardScreen.tsx` · `integrations/dashboardEssLoad.ts`

---

## API compose

| Metric | Source |
|--------|--------|
| Attendance stats | `GET /attendance/records?from_date=&to_date=` (self or team when manager) |
| Role subtitle | `GET /employees/{id}` → `job_title_key` |
| Stat cards | Compose attendance + `whos_out` count + pending leave + my leaves total |
| Announcements | `GET /notifications/inbox` filtered `broadcast`/`announcement`; fallback generic inbox rows |

---

## Stat card navigation

| Card | Employee | Manager |
|------|----------|---------|
| Active team | Operations | Operations |
| Off work | LeaveRequestsList | LeaveRequestsList |
| Leave requests | LeaveRequestsList | ManagerApprovals |
| My leaves | LeaveRequestsList | LeaveRequestsList |

---

## Verification (agent-run)

```text
cd apps/mobile/hrm-mobile
pnpm test   → 27 files, 155 tests PASS, exit 0
pnpm build  → tsc --noEmit PASS, exit 0
```

---

## QA matrix

| AC-ID | Persona `uat.nv0001@xe.vn` | Check |
|-------|---------------------------|-------|
| AC-ESS-19-01 | Header role line under name | PASS build |
| AC-ESS-19-02 | Chat → stub modal Phase 2 | PASS build |
| AC-ESS-19-03 | Bell → InAppNotifications | regression J-MOB-11 |
| AC-ESS-20-01 | Chào buổi … greeting | PASS build |
| AC-ESS-20-02 | Date pill change → stats row updates | device |
| AC-ESS-20-03 | Đi làm / Đi muộn / Vắng row | device |
| AC-ESS-21-01 | 4 cards tap navigates | device |
| AC-ESS-22-01 | Announcements list or empty | device |
| AC-ESS-A-REG | J-MOB-11..15 + 06..09 below portal | device scroll |

---

## Residual

| Item | Owner | Note |
|------|-------|------|
| Team tab deep link for Active Team | MOB-UX-08 | Routes to Operations until `TeamDirectoryScreen` |
| Search icon removed from header row | product | Name+role column replaces search pill per U54 |
| `home/summary?include=attendance_stats` | dev-be optional | Client compose from `/attendance/records` sufficient Phase 1 |

---

**completion_report:** MOB-UX-06 ESS dashboard layer above portal+Smart Hub; J-MOB-19..22; vitest 155/155; tsc PASS.  
**next_owner:** qa  
**next_dispatch_prompt:** QA device `PCOMP-W8-MOB-ESS-DASH-01`: L0 `pnpm run qc:dev-stack` then login `uat.nv0001@xe.vn` / `xevn-uat-2026`; verify AC-ESS-19..22 on Tab Trang chủ; change date pill and confirm stats row; tap 4 stat cards + announcement row; full scroll regression J-MOB-11..15 and J-MOB-06..09; evidence `docs/qa/evidence/pcomp-w8-mob-ess-dashboard-jmob19-22-YYYYMMDD.md`.
