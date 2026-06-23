# PCOMP-W4-MOB-UX-02b — Home hub Personio widgets

**work_item_id:** `PCOMP-W4-MOB-UX-02b`  
**Date:** 2026-06-07  
**Owner:** Dev-Mobile  
**ack_status:** `READY_FOR_QA`  
**Entry:** QC MUX-03 GO · `MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` §3.2 · `MOBILE_HRM_BENCHMARK_TOP_APPS.md` §3.2 Personio Home

---

## Scope closed

| Deliverable | Path | Status |
|-------------|------|--------|
| Personio Home layout | `DashboardScreen.tsx` — greeting, action cards, today, upcoming | ✅ |
| Home action card | `HomeActionCard.tsx` — DS tokens, 56pt+ touch, chevron | ✅ |
| Home data helpers | `utils/dashboardHome.ts` — greeting, upcoming filter, today summary | ✅ |
| Unit tests | `utils/__tests__/dashboardHome.test.ts` (6 cases) | ✅ |

**No API/auth/scope contract changes.**

---

## Benchmark §3.2 mapping

| Widget | Implementation |
|--------|----------------|
| Xin chào, {tên} · {công ty} | `resolveHomeGreeting` from JWT memberships |
| Chấm công hôm nay → | `HomeActionCard` → `TabAttendance/CheckIn` |
| Tạo đơn nghỉ phép → | `HomeActionCard` → `TabRequests/CreateLeaveRequest` |
| Hôm nay · Check-in | `resolveTodayCheckInSummary` + attendance records API |
| Hôm nay · đơn chờ duyệt | pending leave + update requests for employee |
| Sắp tới (nghỉ phép) | `pickUpcomingLeaves` (approved/pending, start ≥ today) → `ListRow` |

Removed developer UI: system health KPI, employee sample list, raw company UUID hints.

---

## Design system tokens

- Grouped background via `AppScreenLayout grouped` (`#F2F2F7`)
- Typography: title2 greeting/sections, title3 action cards, body today lines, callout subtitles
- Spacing: `layout.sectionGap`, `layout.itemGap`, `layout.cardPadding`
- Cache banner uses `statusToneColor('warning')` — no hardcoded hex in feature screen
- Primary actions in card stack (thumb-zone friendly per §5.1)

---

## Verification (agent-run)

```text
cd apps/mobile/hrm-mobile
pnpm test   → 17 files, 83 tests PASS, exit 0
pnpm build  → tsc --noEmit PASS, exit 0
```

---

## Residual

| Item | Owner | Note |
|------|-------|------|
| Device screenshot J-MOB Home | qa-device | Visual retest greeting + navigation taps |
| Leave balance on Home | dev-be + BA | Phase 2 Personio balance widget |
| Manager pending on Home | MOB-UX-03b | Employee home shows own pending only |
| Native haptic on CTA | Phase 2 | §3.4 micro-interactions |

---

## Handoff

- **next_owner:** qa
- **J-MOB retest:** Home tab load → tap Chấm công → back → tap Tạo đơn nghỉ → upcoming row → detail
- **Account:** `uat.nv####@xe.vn` / `xevn-uat-2026` or pilot matrix CEO
