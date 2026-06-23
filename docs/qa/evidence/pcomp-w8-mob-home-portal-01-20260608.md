# PCOMP-W8-MOB-HOME-PORTAL-01 — Employee portal Home (U53 mockup)

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-W8-MOB-HOME-PORTAL-01` |
| **from_role** | dev-mobile |
| **to_role** | qa |
| **ack_status** | `READY_FOR_QA` |
| **generated** | 2026-06-08 |
| **spec_ref** | USER U53 sponsor mockup · MOB-UX-04a/b Smart Hub preserved |

---

## Scope closed

| Deliverable | Path | Notes |
|-------------|------|-------|
| Home top bar | `components/home/HomeTopBar.tsx` | Primary blue header, avatar → Profile, search pill (no-op Phase 1), bell → Notifications |
| Hero carousel | `components/home/HomeHeroCarousel.tsx` | Horizontal pager, dots, gradient cards + illustration placeholder |
| Quick access grid | `components/home/QuickAccessGrid.tsx` | 2×4 colored tiles; Career/Merits stub |
| Payslip feed | `components/home/HomeFeedSection.tsx` | «Bảng lương» teaser + «Xem chi tiết» |
| Portal config + mapping | `utils/homePortal.ts` | Grid config, `buildHeroCarouselItems`, `pickLatestPayslipTeaser` |
| Theme tokens | `theme/tokens.ts` | `homeHeroGradient*`, `homeTile*` colors |
| Dashboard integration | `features/dashboard/DashboardScreen.tsx` | Portal shell above Smart Hub sections; payslip API wired |
| Unit tests | `utils/__tests__/homePortal.test.ts` (6 cases) | Grid ids, stubs, carousel mapping, payslip teaser |

**Preserved (MOB-UX-04a/b):** Việc cần làm, manager card, Hôm nay, Sắp tới, birthday banner, Sinh nhật hôm nay, Ai nghỉ hôm nay — compose/load logic unchanged.

---

## Quick-access navigation

| Tile | Action |
|------|--------|
| Hồ sơ | `TabMore` → Profile |
| Sự nghiệp | Stub (no navigation) |
| Lương | Latest payslip list or PayrollSummary |
| Khen thưởng | Stub |
| Chính sách | Contracts |
| Chấm công | CheckIn |
| Vận hành | Operations |
| Xem thêm | Tab More (Settings root) |

---

## Payslip API

`GET /payroll/payslips?company_id={getPayrollQueryCompanyId()}&employee_id={eid}` — same contract as `PayslipListScreen`. Teaser uses first row; detail deep link via `PayslipDetail`.

---

## Verification (agent-run)

```text
cd apps/mobile/hrm-mobile
pnpm test   → 26 files, 149 tests PASS, exit 0
pnpm build  → tsc --noEmit PASS, exit 0
```

---

## QA matrix

| Journey | Persona | Steps |
|---------|---------|-------|
| J-MOB-01 | `uat.nv0001@xe.vn` | Home loads branded blue header + 8-tile grid + payslip section |
| J-MOB-04 | NV with payslip seed | «Bảng lương» shows period + amount → «Xem chi tiết» → PayslipDetail |
| J-MOB-06/07 | NV / manager | «Việc cần làm» badge + deep links unchanged below portal blocks |
| J-MOB-08/09 | NV | Carousel birthdays + celebrations/whos-out sections still below hub blocks |

**Visual:** Compare Home against U53 mockup — header, carousel dots, colored grid, payslip feed above task list.

---

## Residual

| Item | Owner | Note |
|------|-------|------|
| Search pill action | dev-fe / Phase 2 | Placeholder only — accessibility hint set |
| Career / Merits tiles | product | Stub until SRS UC lands |
| Work anniversary carousel | dev-be | Only birthday/celebration data today; milestone kind reserved in mapper |
| Native device screenshot | qa-device | After QA PASS — optional APK refresh if bundle delta required |

---

## Handoff

- **next_owner:** qa
- **pm_dispatch_hint:** L2 Home tab + J-MOB-04 payslip teaser + J-MOB-06/07/08/09 regression on emulator/device
