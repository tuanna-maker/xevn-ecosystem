# MOBILE HRM ESS UX Benchmark — Sponsor Mockup Set (U54)

**work_item_id:** `PCOMP-W8-MOB-ESS-BENCHMARK-01` · **U55 addendum:** `PCOMP-W8-MOB-ZENHR-BENCHMARK-01`  
**from_role:** ba-process  
**to_role:** pm  
**lane:** governance  
**ack_status:** `PASS_TO_PM`  
**trigger:** U54 · sponsor HRM mobile mockup set (5 screens A–E) · 2026-06-08 · **U55 ZenHR ESS 11-panel reference** · 2026-06-08  
**evidence_path:** `docs/program/MOBILE_HRM_ESS_UX_BENCHMARK.md`  
**Ngày:** 2026-06-08

**Related:** `MOBILE_HOME_PORTAL_AC_DELTA.md` (U53) · `MOBILE_HOME_HUB_AC_DELTA.md` (U48) · `MOBILE_HRM_BENCHMARK_TOP_APPS.md` (U46 Personio) · `MOBILE_W7_DATA_CONTRACTS.md` · `PROGRAM_JOURNEY_MAP.md` · **§13 ZenHR (U55)**

---

## 1. Executive summary

### 1.1 Sponsor minimum bar (U54)

Sponsor yêu cầu mobile ESS **đạt mức tối thiểu** của bộ mockup 5 màn (SET A–E): dashboard có **stats + announcements + persona header**, luồng **duyệt nghỉ** có modal xác nhận + snackbar Undo, **My Leaves** có balance cards + tab Review|Approved|Rejected + empty illustration, **form nghỉ** có balance theo loại + date modal + confirm submit, **Team / Payslip / Profile** là tab-first surfaces (search, filter chips, current-task card).

Đây là **bar cao hơn U53** (portal shell) và **rộng hơn U48** (Smart Hub task-first): U54 gộp **ESS manager + employee leave + team directory + tab IA** trong một benchmark thống nhất.

### 1.2 So với U48 Personio research

| Khía cạnh | U48 / Personio pattern (`MOBILE_HOME_HUB_UX_RESEARCH.md`, `MOBILE_HRM_BENCHMARK_TOP_APPS.md`) | U54 mockup | XeVN as-is |
|-----------|----------------------------------------------------------------------------------------------|------------|------------|
| Home entry | Task-first widgets: Việc cần làm, Cần duyệt, Sinh nhật, Ai nghỉ | **Stats row** (Work/Late/Absence) + **4 KPI cards** + **Announcements** | Smart Hub ✅ (J-MOB-06..09); **không** stats row / announcements |
| Leave balance | Hiển thị khi chọn loại nghỉ (Personio) | Available vs Used cards + dropdown balance | Placeholder «Liên hệ HR» (`CreateLeaveRequestScreen.tsx`) |
| Manager approve | Push + task list; filter inbox | Card/employee + **inline Decline/Accept** + icon modal + **Undo snackbar** | `ManagerApprovalsScreen` — select row + sticky footer; **Alert** success, **không** snackbar Undo |
| My Leaves | Time off page + status | Tabs Review\|Approved\|Rejected + **group by submission date** + empty illustration | `LeaveRequestsListScreen` — filter chips (all/pending/approved/rejected) + section by **status group**, không tab UX mockup |
| Tab IA | Personio: Home + modules | **Dashboard \| Team \| Payslip \| Profile** | **Trang chủ \| Chấm công \| Đơn công \| Thêm** (4-tab lock U48/U53) |
| Team | Who's Out widget (U48 04b) | **Team tab**: search + filter + check-in status | `whos_out` on Home only; **không** `TeamScreen` |
| Payslip | Documents hub | Dedicated tab + **month filter chips** | `PayslipListScreen` trong More stack; filter theo `periodId` route param, **không** chip row mockup |
| Profile | ESS fields | **Current task card** (progress, priority) + employee details | `ProfileScreen` — avatar + form fields; **không** task card |

**Kết luận BA:** U54 = **Personio/BambooHR ESS polish** trên nền đã có (API leave/payroll/attendance). Phase 1 **không** bỏ Smart Hub (U48) hay Portal shell (U53); bổ sung **lớp ESS** và **wave polish** theo roadmap §6.

### 1.3 So với U53 portal shell

**U53 là subset của SET A only** — không cover SET B–E.

| SET A element (U54) | U53 (`MOBILE_HOME_PORTAL_AC_DELTA.md`) | Gap U54-only |
|---------------------|----------------------------------------|--------------|
| Profile header (avatar+name+role+**chat**+bell) | J-MOB-11: avatar+search+bell (`HomeTopBar.tsx`) | **Role line**, **chat icon** (stub), name in header not greeting block |
| **Good Morning** + **date picker** | Không trong U53 | **New** — `resolveHomeGreeting` text only, no date picker |
| **Attendance stats row** (Total Work/Late/Absence) | Không | **New** — `todaySection` 1-line check-in only |
| **4 quick stat cards** (Active Team/Off work/Leave Requests/My Leaves) | U53: 8-icon grid (`QuickAccessGrid`) — **khác layout** | **New component** `DashboardStatCards` |
| **Announcements list** | U53 P1: carousel slide broadcast | **New** — dedicated list section, not carousel |
| Bottom tabs Dashboard\|Team\|Payslip\|Profile | U53: **giữ** 4-tab Trang chủ\|Chấm công\|Đơn công\|Thêm | **MOB-UX-09** IA decision |
| Carousel + 2×4 grid + payslip feed | U53 **P0** J-MOB-12..14 | U54 mockup **không** nhấn carousel/grid — **coexist**: portal widgets **under** ESS stats per reconcile §1.4 |

### 1.4 Reconcile rule (U48 + U53 + U54)

```text
TabDashboard scroll (to-be composite):
├─ ESS header (U54) — role, chat stub, extends J-MOB-11
├─ Greeting + date picker + attendance stats + 4 stat cards (U54 — MOB-UX-06)
├─ Announcements list (U54 — MOB-UX-06)
├─ Portal shell (U53) — carousel, QuickAccessGrid, PayslipFeedCard (J-MOB-12..14)
└─ Smart Hub (U48) — Việc cần làm, Cần duyệt, Sinh nhật, Ai nghỉ (J-MOB-06..09, J-MOB-15)
```

**Cấm:** Xóa Smart Hub hoặc Portal để «match mockup flat»; QA FAIL MOB-UX-06 nếu regress J-MOB-06..09 hoặc J-MOB-11..15.

---

## 2. Process objective and actors

| Actor | Vai trò |
|-------|---------|
| Nhân viên UAT | Dashboard stats, My Leaves tabs+balance, Leave form, Payslip tab, Profile |
| Quản lý UAT | Dashboard team stats, Leave Requests approve (SET B), Team tab check-in status |
| Dev-Mobile | Screens/components per wave MOB-UX-06..09 |
| Dev-BE | `leave-balance`, team attendance aggregate, announcements/inbox filter, directory (`MOBILE_W7_DATA_CONTRACTS.md`) |
| QA / QA-Device | L2.5 **J-MOB-19..30** + regression J-MOB-01..18 |

**Account matrix:**

| Persona | Account | Journeys |
|---------|---------|----------|
| Employee | `uat.nv0001@xe.vn` / `xevn-uat-2026` | J-MOB-19..22, 25..29, payslip/profile ext |
| Manager | `uat.mgr0001@xe.vn` or seeded manager with pending leave | J-MOB-23..24, 21 (team stats), J-MOB-30 |

---

## 3. Journey catalog — J-MOB-19..30

> **ID governance:** J-MOB-01..10 core · J-MOB-11..15 portal (U53) · J-MOB-16..18 W7 (leave doc / ESS full / push). **J-MOB-19..30 reserved for U54 ESS** — no collision.

| ID | SET | Journey (one line) | Primary screen / file |
|----|-----|-------------------|------------------------|
| **J-MOB-19** | A | Login → Dashboard → header shows avatar+name+**role**+chat+bell; tap bell → inbox | `DashboardScreen.tsx` + `HomeTopBar.tsx` |
| **J-MOB-20** | A | Dashboard → **Good Morning** + **date picker** → attendance stats row updates (Work/Late/Absence) | `DashboardScreen.tsx` (new `DashboardDateBar`, `AttendanceStatsRow`) |
| **J-MOB-21** | A | Dashboard → 4 stat cards tap → correct destinations (team/off/leave requests/my leaves) | `DashboardStatCards.tsx` (new) |
| **J-MOB-22** | A | Dashboard → **Announcements** list → tap item → detail or inbox | `AnnouncementsSection.tsx` (new) |
| **J-MOB-23** | B | Manager → Leave Requests → card per employee + **online dot** → **Decline/Accept** inline | `ManagerLeaveInboxScreen.tsx` or refactor `ManagerApprovalsScreen.tsx` |
| **J-MOB-24** | B | Manager → tap Accept/Decline → **confirm modal** (icon) → **snackbar** + **Undo** | Same + `ConfirmActionModal`, `UndoSnackbar` |
| **J-MOB-25** | C | Employee → My Leaves → **Total period** + **Available / Used** cards | `LeaveRequestsListScreen.tsx` + balance header |
| **J-MOB-26** | C | My Leaves → tabs **Review\|Approved\|Rejected** → list **grouped by submission date** | `LeaveRequestsListScreen.tsx` |
| **J-MOB-27** | C | My Leaves → **empty state** illustration → **Apply for Leave** CTA → form | `LeaveRequestsListScreen.tsx` → `CreateLeaveRequestScreen.tsx` |
| **J-MOB-28** | D | Leave form → Title, Type dropdown shows **balance left**, contact, description | `CreateLeaveRequestScreen.tsx` |
| **J-MOB-29** | D | Leave form → **date range modal** → Submit → **confirm modal** | `CreateLeaveRequestScreen.tsx` + `HrmDateField` modal |
| **J-MOB-30** | E | **Team** tab → search + filter + member **check-in status** | `TeamDirectoryScreen.tsx` (new) — W7-5 directory + attendance today |

**SET E extensions (no new J-ID — trace existing):**

| Surface | Journey ext | File |
|---------|-------------|------|
| Payslip tab | J-MOB-04 + month chips | `PayslipListScreen.tsx` / new tab wrapper |
| Profile | J-MOB-17 (W7 ESS full) + current task card | `ProfileScreen.tsx` |

---

## 4. Per-screen gap tables

### 4.1 SET A — Dashboard

| Mockup element | As-is file | To-be | API | Owner | Wave |
|----------------|------------|-------|-----|-------|------|
| Avatar + name + role + chat + bell | `HomeTopBar.tsx` — avatar, search, bell; role/chat **missing** | Extend header: `job_title` subtitle; chat → stub modal BR-ESS-CHAT-01; bell badge inbox | `GET /employees/{id}`; `GET /notifications/inbox` | dev-mobile | MOB-UX-06 |
| Good Morning + date | `dashboardHome.ts` `resolveHomeGreeting`; no picker | `DashboardDateBar`: localized greeting + `DateTimePicker` chip; drives stats query date | `GET /attendance/records?date=` | dev-mobile | MOB-UX-06 |
| Stats row: Total Work / Late / Absence | `DashboardScreen` `todaySection` — check-in summary only | `AttendanceStatsRow` 3 metrics for selected date | `GET /attendance/records`; optional `home/summary?include=attendance_stats` | dev-mobile + dev-be optional | MOB-UX-06 |
| 4 cards: Active Team / Off work / Leave Requests / My Leaves | Partial: manager card J-MOB-07; whos_out count | `DashboardStatCards` 2×2; persona-specific values + deep links | Compose: `employees?status=active`, `home/summary whos_out`, pending leave counts | dev-mobile | MOB-UX-06 |
| Announcements list | Inbox only via bell; carousel P1 in U53 | `AnnouncementsSection` list (title, date, chevron) | `GET /notifications/inbox?event_type=broadcast` or announcements endpoint | dev-mobile | MOB-UX-06 |
| Bottom tabs Dashboard\|Team\|Payslip\|Profile | `RootNavigator.tsx` 4-tab VI labels | See §5 MOB-UX-09 | — | dev-mobile + PM lock | MOB-UX-09 |
| Portal carousel + grid + payslip feed (U53 overlap) | `HomeHeroCarousel`, `QuickAccessGrid`, `HomeFeedSection` | **Keep** below ESS layers (§1.4) | Existing portal APIs | dev-mobile | MOB-UX-05 (in-flight) |
| Smart Hub sections (U48 overlap) | `DashboardScreen` tasks/manager/birthday/whos_out | **Keep** below portal (J-MOB-15) | `home/summary`, leave, inbox | — | regression only |

### 4.2 SET B — Leave Requests (manager)

| Mockup element | As-is file | To-be | API | Owner | Wave |
|----------------|------------|-------|-----|-------|------|
| Card per employee + online status | `ManagerApprovalsScreen` — `ListRow` select pattern; **no online dot** | `ManagerLeaveCard` with avatar, name, leave meta, **presence dot** (green/grey) | Pending leave list + optional `last_seen` / check-in today | dev-mobile | MOB-UX-07 |
| Decline / Accept buttons on card | Sticky footer after **select row** | **Inline** pair on each card (mockup) | `POST .../approve`, `POST .../reject` | dev-mobile | MOB-UX-07 |
| Confirm modal (approve/decline + icon) | `Alert` native on success/error; reject `Modal` + reason | `ConfirmActionModal` — illustration icon, title, confirm/cancel | Same POST | dev-mobile | MOB-UX-07 |
| Snackbar + Undo | **None** — `Alert.alert('Thành công')` | `UndoSnackbar` 5s window → `POST` revert if API supports or re-approve draft | Reject: no undo API → **optimistic UI** + re-fetch; document BR-ESS-UNDO-01 | dev-mobile | MOB-UX-07 |
| Filter leave-only | `FilterChipRow` all/att/leave | Default **leave** for SET B screen; att in unified inbox elsewhere | Existing list APIs | dev-mobile | MOB-UX-07 |

### 4.3 SET C — My Leaves (employee)

| Mockup element | As-is file | To-be | API | Owner | Wave |
|----------------|------------|-------|-----|-------|------|
| Total Leave period header | **Missing** | `LeaveBalanceHeader`: «Kỳ nghỉ {year}» | `GET /attendance/leave-balance` (W7-4) | dev-be → dev-mobile | MOB-UX-07 |
| Available vs Leave Used cards | **Missing** | Two `SurfaceCard` metrics | `leave-balance` `available_days`, `used_days` | dev-be → dev-mobile | MOB-UX-07 |
| Tabs Review \| Approved \| Rejected | Filter chips all/pending/approved/rejected | **Segmented tab bar** UI; map: Review=pending, Approved, Rejected | `GET /leave-requests?status=` | dev-mobile | MOB-UX-07 |
| Grouped by submission date | Sections by `leaveStatusSectionOrder` (status group) | Sections by **`created_at` date** (e.g. «12 June 2026») | Same list + client group | dev-mobile | MOB-UX-07 |
| Empty state illustration + CTA | Text-only empty | `EmptyLeaveIllustration` + `PrimaryButton` «Đăng ký nghỉ» | — | dev-mobile | MOB-UX-07 |
| Apply for Leave CTA | Header «+ Tạo đơn» (`useLayoutEffect`) | Sticky FAB or footer CTA matching mockup | Navigate `CreateLeaveRequest` | dev-mobile | MOB-UX-07 |

### 4.4 SET D — Leave Form

| Mockup element | As-is file | To-be | API | Owner | Wave |
|----------------|------------|-------|-----|-------|------|
| Title field | Wizard steps; reason in step 3 | Explicit **Title** `FormField` (maps to `reason` or new `title` if BE adds) | `POST /leave-requests` body | dev-mobile | MOB-UX-07 |
| Leave Type dropdown + balance left | Step 1 type chips; balance placeholder | Dropdown picker + **«Còn lại: X ngày»** chip | `GET /attendance/leave-balance?leave_type=` | dev-be → dev-mobile | MOB-UX-07 |
| Contact field | **Missing** | `contact_phone` or `handoverTo` labeled «Liên hệ» | Optional body field | dev-mobile | MOB-UX-07 |
| Date range picker modal | `HrmDateField` inline per step 0 | **Single modal** calendar range (mockup) | Client validation | dev-mobile | MOB-UX-07 |
| Description | `reason` field | Multiline description | POST body | dev-mobile | MOB-UX-07 |
| Submit + Confirm modal | Step 4 send; `Alert` on error | Review step + `ConfirmActionModal` before POST | POST create | dev-mobile | MOB-UX-07 |
| 4-step wizard polish | `STEPS` array 4 steps | **Option:** collapse to 1 scroll form + confirm (mockup) or keep wizard with mockup visual | — | dev-mobile | MOB-UX-07 |

### 4.5 SET E — Team / Payslip / Profile

| Mockup element | As-is file | To-be | API | Owner | Wave |
|----------------|------------|-------|-----|-------|------|
| Team: search | **No TeamScreen** | `TeamDirectoryScreen` + search input | `GET /employees?view=directory&q=` | dev-be W7-5 → dev-mobile | MOB-UX-08 |
| Team: filter | — | Filter chips (all / checked-in / off) | Directory + `attendance/records?date=today` join client-side | dev-mobile | MOB-UX-08 |
| Team: check-in status per row | — | Badge «Đã chấm» / «Chưa chấm» | `GET /attendance/records` | dev-mobile | MOB-UX-08 |
| Payslip: list + month chips | `PayslipListScreen` FlatList; period via route | Horizontal **month chips** on dedicated tab | `GET /payroll/payslips` group by period | dev-mobile | MOB-UX-09 |
| Payslip: tap → detail | ✅ `PayslipDetailScreen` | Keep J-MOB-04 | existing | — | regression |
| Profile: current task card | **Missing** | `ProfileTaskCard` — title, progress bar, priority badge | `home/summary` tasks preview or stub from inbox | dev-mobile | MOB-UX-09 |
| Profile: employee details | `ProfileScreen` form fields | Read-only detail block + edit avatar | `GET/PATCH /employees/{id}` | dev-mobile | MOB-UX-09 / J-MOB-17 |

---

## 5. Tab IA — MOB-UX-09 reconcile

### 5.1 As-is vs sponsor mockup

| # | As-is (`RootNavigator.tsx`) | U54 mockup tabs |
|---|----------------------------|-----------------|
| 1 | Trang chủ (`TabDashboard`) | **Dashboard** |
| 2 | Chấm công (`TabAttendance` → CheckIn) | *(mockup không có tab Chấm công riêng — check-in via Dashboard/Team)* |
| 3 | Đơn công (`TabRequests` → leave/update stacks) | *(partial overlap My Leaves / Leave Requests)* |
| 4 | Thêm (`TabMore` → payslip, profile, settings…) | **Team**, **Payslip**, **Profile** split |

### 5.2 Options (PM lock required)

| Option | Tab bar | Pros | Cons | BA recommendation |
|--------|---------|------|------|-------------------|
| **A — Relabel 4-tab (default)** | Trang chủ \| Đội nhóm \| Phiếu lương \| Hồ sơ | Không phá U48/U53 4-tab rule; map mockup semantics | Chấm công/Đơn công → icon grid + Dashboard shortcuts | **Phase 1 default** — MOB-UX-09 |
| **B — Literal mockup 4-tab** | Dashboard \| Team \| Payslip \| Profile | Pixel-close sponsor | **Mất** dedicated Chấm công + Đơn công tabs; breaking change J-MOB-02/03 | Cần sponsor sign-off |
| **C — Hybrid 5th hidden** | 4 visible + Check-in FAB | Best UX parity | Violates 4-tab lock | **Reject** unless PM waives BR-PORT-02 |

**Decision default (BA):** **Option A** — relabel:

- Tab 1 `Trang chủ` → subtitle ESS Dashboard (unchanged route `TabDashboard`)
- Tab 2 `Chấm công` → **`Đội nhóm`** → `TeamDirectoryScreen` (manager/team view); Check-in via QuickAccess + Dashboard stat
- Tab 3 `Đơn công` → **`Phiếu lương`** → `PayslipListScreen` root (month chips)
- Tab 4 `Thêm` → **`Hồ sơ`** → `ProfileScreen` root; overflow (Settings, Approvals, Contracts) via header menu or «Xem thêm»

**Regression:** J-MOB-02 Check-in path = Dashboard icon + stat card · J-MOB-03 leave list = Dashboard «My Leaves» card + legacy `TabRequests` reachable from grid.

---

## 6. Wave roadmap

| Wave | work_item_id (proposed) | Scope | J-* | Depends |
|------|-------------------------|-------|-----|---------|
| **MOB-UX-05** | PCOMP-W8-MOB-HOME-PORTAL-01 | Portal shell (U53) — **in-flight** | J-MOB-11..15 | — |
| **MOB-UX-06** | PCOMP-W8-MOB-ESS-DASH-01 | Dashboard stats, date picker, 4 cards, announcements | J-MOB-19..22 | MOB-UX-05a recommended first |
| **MOB-UX-07** | PCOMP-W8-MOB-ESS-LEAVE-01 | Manager approve UX, My Leaves tabs/balance, Leave form polish | J-MOB-23..29 | W7-4 `leave-balance` BE |
| **MOB-UX-08** | PCOMP-W8-MOB-ESS-TEAM-01 | Team directory screen | J-MOB-30 | W7-5 directory API |
| **MOB-UX-09** | PCOMP-W8-MOB-ESS-IA-01 | Tab relabel/remap, Payslip tab chips, Profile task card | J-MOB-04 ext, J-MOB-17 | MOB-UX-06..08 |
| **MOB-UX-10** | PCOMP-W8-MOB-ZENHR-* (U55) | ZenHR polish: pending strip, action grid, center FAB, net salary hero, timeline badges | J-MOB-31..35 | MOB-UX-06..09 · see §13.5 |

**Sequence:** MOB-UX-05 → **06** → **07** (parallel **08** after W7-5 BE) → **09** gate → **10** ZenHR polish (10b FAB P0 optional parallel after 06 QA).

---

## 7. Acceptance criteria — QA device pass/fail

### 7.1 SET A — Dashboard (J-MOB-19..22)

**Persona:** `uat.nv0001@xe.vn` · device ≥720×1280 · L0 stack PASS.

| AC-ID | Điều kiện | Pass | Fail |
|-------|-----------|------|------|
| AC-ESS-19-01 | Tab Trang chủ load | Header shows avatar + **display name** + **role/title** line | Missing role |
| AC-ESS-19-02 | Tap chat icon | Stub modal «Chat nội bộ — Phase 2» — no crash | Crash / dead |
| AC-ESS-19-03 | Tap bell | → `InAppNotifications`; badge matches unread ±0 | J-MOB-11 regress |
| AC-ESS-20-01 | Greeting | «Chào …» / Good morning equivalent by local hour | Generic static only |
| AC-ESS-20-02 | Date picker | Change date → stats row refetch | Stats static |
| AC-ESS-20-03 | Stats row | 3 labels Work/Late/Absence (or VI equivalent) with numeric values | Missing row |
| AC-ESS-21-01 | Stat cards | **4** cards visible; tap navigates (no dead) | <4 cards |
| AC-ESS-21-02 | Manager persona | «Active Team» / off work counts ≠ NV-only zeros when seed | Wrong scope |
| AC-ESS-22-01 | Announcements | ≥1 row when inbox broadcast seeded; empty state OK | Error banner |
| AC-ESS-22-02 | Tap announcement | Opens detail or inbox thread | 404 |
| AC-ESS-A-REG | Full scroll | J-MOB-11..15 + J-MOB-06..09 still PASS | Any regress |

**Evidence:** `docs/qa/evidence/pcomp-w8-mob-ess-dashboard-jmob19-22-YYYYMMDD.md`

### 7.2 SET B — Manager leave (J-MOB-23..24)

**Persona:** manager with ≥1 pending leave · qual seed if 0.

| AC-ID | Điều kiện | Pass | Fail |
|-------|-----------|------|------|
| AC-ESS-23-01 | Open leave approvals | ≥1 **card** with employee name + leave type + dates | List-only select |
| AC-ESS-23-02 | Online indicator | Presence dot visible (green if checked-in today else grey) | Always absent |
| AC-ESS-23-03 | Inline Accept | Tap Accept → confirm modal (not immediate POST) | No modal |
| AC-ESS-24-01 | Confirm approve | Modal icon + confirm → success **snackbar** | Alert-only |
| AC-ESS-24-02 | Undo | Snackbar «Hoàn tác» within 5s → reverts UI or shows undo unavailable per BR-ESS-UNDO-01 | No undo affordance |
| AC-ESS-24-03 | Decline path | Decline → reason modal → confirm → snackbar | Missing decline modal |
| AC-ESS-24-04 | API | Approve **201**; list refreshes; no raw HRM-ATT-REQ-203 | Error leak |

**Evidence:** `docs/qa/evidence/pcomp-w8-mob-ess-manager-jmob23-24-YYYYMMDD.md`

### 7.3 SET C — My Leaves (J-MOB-25..27)

| AC-ID | Điều kiện | Pass | Fail |
|-------|-----------|------|------|
| AC-ESS-25-01 | Open My Leaves | Period header + **Available** + **Used** cards | No balance header |
| AC-ESS-25-02 | Balance API down | Cards show «Liên hệ HR» — screen still usable | White screen |
| AC-ESS-26-01 | Tabs | Segmented **Review \| Approved \| Rejected** — correct filter | Chips only |
| AC-ESS-26-02 | Grouping | Section headers = **submission date** (not only status) | Flat list |
| AC-ESS-26-03 | Row tap | → `LeaveRequestDetail` (J-MOB-03 ext) | No detail |
| AC-ESS-27-01 | Empty Review tab | Illustration + «Đăng ký nghỉ» CTA | Text-only |
| AC-ESS-27-02 | CTA | → `CreateLeaveRequest` | Wrong route |

**Evidence:** `docs/qa/evidence/pcomp-w8-mob-ess-myleaves-jmob25-27-YYYYMMDD.md`

### 7.4 SET D — Leave form (J-MOB-28..29)

| AC-ID | Điều kiện | Pass | Fail |
|-------|-----------|------|------|
| AC-ESS-28-01 | Form fields | Title, Type, Contact, Description visible | Wizard-only hidden |
| AC-ESS-28-02 | Type change | Balance chip updates per type (or HR fallback) | Static placeholder |
| AC-ESS-29-01 | Date range | Modal picker sets start/end; invalid range blocked | ISO text fields |
| AC-ESS-29-02 | Submit | Confirm modal before POST | Direct POST |
| AC-ESS-29-03 | Success | Return list Review tab with new **pending** row | Stale list |

**Evidence:** `docs/qa/evidence/pcomp-w8-mob-ess-leaveform-jmob28-29-YYYYMMDD.md`

### 7.5 SET E — Team / Payslip / Profile (J-MOB-30 + ext)

| AC-ID | Điều kiện | Pass | Fail |
|-------|-----------|------|------|
| AC-ESS-30-01 | Team tab | Search filters list by name/code | No search |
| AC-ESS-30-02 | Filter chips | Check-in filter changes rows | No-op |
| AC-ESS-30-03 | Row status | Check-in badge matches API for today | Random |
| AC-ESS-E-01 | Payslip tab | Month chips filter list; tap → detail (J-MOB-04) | No chips |
| AC-ESS-E-02 | Profile tab | Current task card with progress bar | No task card |
| AC-ESS-E-03 | Profile details | Employee fields match `GET /employees/{id}` | Stale/mock |
| AC-ESS-IA-01 | 4-tab bar | Labels per Option A §5.2; no 5th tab | Tab count ≠4 |

**Evidence:** `docs/qa/evidence/pcomp-w8-mob-ess-team-profile-jmob30-YYYYMMDD.md`

---

## 8. Business rule matrix (ESS)

| Mã | Điều kiện | Hành động | Kết quả |
|----|-----------|-----------|---------|
| BR-ESS-01 | Render Dashboard | ESS layers (§1.4) **above** portal + Smart Hub | U54+U53+U48 composite |
| BR-ESS-02 | Date picker | Default today `Asia/Ho_Chi_Minh`; stats scoped to picker date | Deterministic |
| BR-ESS-03 | Stat cards | Manager sees team aggregates; NV sees self + pending counts | Persona branch |
| BR-ESS-04 | Announcements | Only `broadcast` or `announcement` inbox types | No payroll PII in feed |
| BR-ESS-CHAT-01 | Tap chat | Stub modal Phase 2 — **cấm** external URL | No crash |
| BR-ESS-05 | Manager approve | Confirm modal **bắt buộc** before POST approve/reject | No accidental tap |
| BR-ESS-UNDO-01 | Undo snackbar | If no revert API: Undo → navigate to re-approve flow or toast «Không thể hoàn tác» | Honest UX |
| BR-ESS-06 | Leave balance | If `leave-balance` 404: show HR contact — **cấm** fake numbers | W7-4 gate |
| BR-ESS-07 | My Leaves tabs | Review=`pending`; Rejected includes `rejected`+`cancelled` | Map SRS status |
| BR-ESS-08 | Tab IA Option A | Check-in reachable without dedicated tab | J-MOB-02 path preserved |
| BR-ESS-09 | Scope | All ESS calls use JWT `company_id` UUID resolver | ADR scope ladder |
| BR-ESS-10 | QA gate | MOB-UX-06+ FAIL if J-MOB-06..15 regress | Zero-defect |

---

## 9. Handoff package

| Role | Entry | Exit | Artifact |
|------|-------|------|----------|
| **PM** | PASS_TO_PM này | Dispatch MOB-UX-06..09; update `PROGRAM_JOURNEY_MAP.md` J-MOB-19..30; lock tab Option A/B | This doc |
| **dev-be** | `MOBILE_W7_DATA_CONTRACTS.md` | `leave-balance` GET + seed; directory `view=directory`; optional `home/summary` stats | `attendance.controller.ts` |
| **dev-mobile** | §4 gap tables per wave | Component tests + `READY_FOR_QA` per wave | `apps/mobile/hrm-mobile/src/features/**` |
| **qa-device** | L0 + UAT accounts | AC-ESS-* pass/fail evidence per SET | `docs/qa/evidence/pcomp-w8-mob-ess-*` |

---

## 10. Assumptions, dependencies, risks

| ID | Item | Owner | Note |
|----|------|-------|------|
| A-ESS-01 | `leave-balance` not implemented | dev-be W7-4 | MOB-UX-07 blocked for real balance — placeholder OK with BR-ESS-06 |
| A-ESS-02 | No chat UC | PM Phase 2 | BR-ESS-CHAT-01 stub |
| A-ESS-03 | Undo API absent | dev-be optional | BR-ESS-UNDO-01 honest fallback |
| A-ESS-04 | U53 portal in-flight | dev-mobile | Compose order §1.4 |
| R-ESS-01 | Tab relabel confuses pilot users | PM | Training note in USER_SERVICE_STATUS |
| R-ESS-02 | Manager SET B vs unified `ManagerApprovalsScreen` | dev-mobile | Split leave-only screen or filter default leave |
| D-ESS-01 | W7-5 directory API | dev-be | Blocks MOB-UX-08 |

---

## 11. U53 reconciliation summary

| U53 artifact | U54 relationship |
|--------------|------------------|
| `MOBILE_HOME_PORTAL_AC_DELTA.md` | **Subset:** SET A portal widgets only (header partial, carousel, grid, payslip feed) |
| J-MOB-11..15 | **Coexist** with J-MOB-19..22 — regression mandatory |
| G-PORT-01..10 | Unchanged owner/wave; ESS gaps = **G-ESS-01..12** in §4 |
| 4-tab lock BR-PORT-02 | Extended by BR-ESS-08 / MOB-UX-09 Option A |

---

## 12. Traceability

| Requirement | Journey | AC prefix |
|-------------|---------|-----------|
| U54 sponsor mockup | J-MOB-19..30 | AC-ESS-* |
| U53 portal | J-MOB-11..15 | AC-PORT-* |
| U48 Smart Hub | J-MOB-06..09, 15 | AC-MOB-HUB-* |
| U46 Personio benchmark | MOB-UX-06..07 | §1.2 |
| UC-HRM-MOB-06/07/08 | J-MOB-23..29 | leave flows |
| UC-HRM-MOB-09 | J-MOB-04, payslip tab | payroll |
| UC-HRM-MOB-12/16 | J-MOB-17, 30 | profile/team |
| UC-HRM-MOB-06c | J-MOB-25..28 | W7-4 balance |

---

---

## 13. ZenHR ESS reference — 11-panel benchmark (U55)

**work_item_id:** `PCOMP-W8-MOB-ZENHR-BENCHMARK-01`  
**trigger:** U55 · sponsor ZenHR Employee Self-Service mobile reference · 2026-06-08  
**palette note:** ZenHR dùng **teal/cyan** accent + **center FAB (+)** trên tab bar; XeVN giữ token `#1E40AF` primary + `#06B6D4` accent (`tokens.ts`) — **không** clone teal wholesale; chỉ adopt **layout patterns**.

### 13.1 Executive — ZenHR «smart» patterns vs XeVN 4-tab lock

| # | ZenHR smart pattern | Why it works | XeVN as-is (2026-06-08) | Gap class |
|---|---------------------|--------------|-------------------------|-----------|
| 1 | **Pending actions prominence** — «My Pending Actions» strip ngay dưới welcome, count badge | Giảm depth tới inbox/approve; manager thấy việc trong 1 tap | Smart Hub «Cần duyệt (n)» card (J-MOB-07) **below** ESS+portal scroll; badge chỉ trên tab **Thêm** | **P1 polish** |
| 2 | **Colorful My Actions grid** — Time Off / Expenses / Letters tiles màu riêng | Phân biệt module nhanh hơn monochrome icon | U53 `QuickAccessGrid` 8 tile xanh dương (`J-MOB-13`); không có Expenses/Letters | **P1 polish** |
| 3 | **Center FAB primary check-in** — (+) nổi giữa tab bar, luôn reachable | Chấm công = hành vi hàng ngày #1; 1 tap không cần tab | Tab **Chấm công** riêng (`TabAttendance` → `CheckInScreen`); **không** FAB; form dev-style không map | **P0 UX** |
| 4 | **Net salary green hero card** — Latest Net Salary lớn, nền xanh, history bên dưới | Payslip = emotional anchor; số net nổi bật | `PayrollSummaryScreen` = period list; `PayslipListScreen` = flat rows — **không** hero | **P1 polish** |
| 5 | **Inline approve** — Reject/Approve trên từng card pending | Không select-then-footer; ít bước hơn | `ManagerApprovalsScreen` — chọn row + sticky footer (J-MOB-05 PASS functional, UX lệch mockup) | **P0 UX** (MOB-UX-07) |
| 6 | **Map + live clock on check-in** | Trust + geo context | `CheckInScreen` — lat/lng text fields; **không** map preview / live clock | **P2 optional** |
| 7 | **Attendance timeline badges** — «On Time» / «Late» per day row | Scan lịch sử nhanh | `AttendanceHistoryScreen` — status text only | **P1 polish** |
| 8 | **Searchable employee directory** | ESS social graph | **Không** `TeamDirectoryScreen` (MOB-UX-08) | **P0** (planned J-MOB-30) |

**4-tab lock reconcile (U48/U53/U54):** ZenHR dùng bottom nav + **center FAB** — **không** thêm tab thứ 5. BA **recommend Option FAB-B** (§13.4).

### 13.2 Panel-by-panel map — ZenHR → U54 SET → XeVN as-is → wave owner

| Panel | ZenHR pattern (sponsor ref) | U54 SET / journey | XeVN as-is | Gap | Wave owner |
|-------|----------------------------|-------------------|------------|-----|------------|
| **Z-P01** | Welcome «Rahaf» + avatar header | SET A · J-MOB-19, J-MOB-20 | MOB-UX-06 ✅ `HomeTopBar` + `DashboardDateBar` greeting | Minor — first-name welcome vs «Chào buổi…» | MOB-UX-10 polish |
| **Z-P02** | **My Pending Actions** — horizontal cards, counts | SET A stat card «Leave Requests» · J-MOB-07 | `DashboardStatCards` + Smart Hub manager card; **không** dedicated pending strip | **Strip component missing** | **MOB-UX-10** · J-MOB-31 |
| **Z-P03** | **My Actions** icon grid — Time Off / Expenses / Letters | U53 overlap · J-MOB-13 (8-icon grid) | `QuickAccessGrid` — Chấm công/Bảng lương/…; **không** Expenses/Letters | Category tiles + stub Phase 2 | **MOB-UX-10** · J-MOB-32 |
| **Z-P04** | Employee **directory** searchable | SET E · J-MOB-30 | **No TeamScreen**; Operations placeholder | Full screen missing | **MOB-UX-08** · dev-be W7-5 |
| **Z-P05** | Clock in/out — **map + time + FAB** check-in | J-MOB-02 (functional) | `CheckInScreen` — GPS toggle, no map, tab not FAB | Map/clock/FAB shell | **MOB-UX-10** · J-MOB-33 |
| **Z-P06** | Profile photo + **Personal Information** | SET E · J-MOB-17 | `ProfileScreen` ✅ avatar PATCH + form fields | Task card missing (U54) | MOB-UX-09 |
| **Z-P07** | Request Time Off — **calendar modal** | SET D · J-MOB-28..29 | `CreateLeaveRequestScreen` 4-step wizard | Modal range + confirm | **MOB-UX-07** |
| **Z-P08** | **My Approvals** inline Reject/Approve | SET B · J-MOB-23..24 | `ManagerApprovalsScreen` select+footer | Inline + modal + snackbar | **MOB-UX-07** |
| **Z-P09** | Attendance **timeline** — «On Time» badge | *(U54 không cover)* | `AttendanceHistoryScreen` plain status | Visual timeline badges | **MOB-UX-10** · J-MOB-35 |
| **Z-P10** | Payroll — **Latest Net Salary** green hero + history | SET E payslip · J-MOB-04 ext | `PayslipListScreen` list only | Hero card missing | **MOB-UX-10** · J-MOB-34 |
| **Z-P11** | Shell — **teal branding + center FAB (+)** | MOB-UX-09 tab IA | 4-tab `#1E40AF`; no center FAB | FAB overlay pattern | **MOB-UX-10** · J-MOB-33 |

**Coverage summary:** U54 SET A–E covers **~7/11** ZenHR panels (partial on Z-P02, Z-P03, Z-P05, Z-P10). ZenHR-only gaps = **Z-P09 timeline**, **Z-P11 FAB shell**, **Z-P02 pending strip prominence**.

### 13.3 Journey catalog — J-MOB-31..35 (U55 delta)

> **ID governance:** J-MOB-31..35 reserved for **ZenHR polish** — no collision with J-MOB-19..30 (U54). Execute primarily in **MOB-UX-10** after MOB-UX-06..09 baseline.

| ID | Panel | Journey (one line) | Primary file / component | Depends |
|----|-------|-------------------|--------------------------|---------|
| **J-MOB-31** | Z-P02 | Home → **My Pending Actions** strip → tap row → approval/detail/inbox | `PendingActionsStrip.tsx` (new) on `DashboardScreen` | MOB-UX-06 ✅; inbox API |
| **J-MOB-32** | Z-P03 | Home → **My Actions** grid (Time Off / Expenses / Letters) → navigate or stub | `MyActionsGrid.tsx` (new) — extends/replaces slice of `QuickAccessGrid` | MOB-UX-06 ✅ |
| **J-MOB-33** | Z-P05, Z-P11 | Any tab → **center FAB (+)** → CheckIn; map preview + live clock optional | `RootNavigator.tsx` FAB slot + `CheckInScreen` | J-MOB-02 API |
| **J-MOB-34** | Z-P10 | Payroll/Payslip tab → **net salary hero** (green) → scroll history → row → detail | `PayslipHeroCard.tsx` on `PayslipListScreen` or tab root | J-MOB-04 API |
| **J-MOB-35** | Z-P09 | Chấm công → Lịch sử → timeline rows with **On Time / Late / Absent** badge | `AttendanceHistoryScreen.tsx` | `GET /attendance/records` |

**Cross-nav AC (U19):** J-MOB-31 row tap must open concrete detail (leave/update/inbox) — not dead link. J-MOB-34 hero tap → latest `PayslipDetail`. J-MOB-35 row tap → optional day detail stub Phase 2.

### 13.4 FAB placement — options vs 4-tab lock

| Option | Implementation | Pros | Cons | BA recommendation |
|--------|----------------|------|------|-------------------|
| **A — TabAttendance only FAB** | FAB on `CheckInScreen` / Attendance stack root | Không đụng `RootNavigator` tab bar; J-MOB-02 path preserved | FAB **không** global; kém ZenHR «always there» | Acceptable fallback |
| **B — Center FAB overlay (default)** | `tabBarButton` custom mid-slot **above** tab bar; action = `navigate('TabAttendance', { screen: 'CheckIn' })` — **no 5th tab route** | ZenHR parity; 1-tap check-in from Home; **giữ 4 tab** | Tab bar layout refactor; safe-area on small devices | **Phase 1 recommend** — MOB-UX-10 |
| **C — Floating FAB on Home only** | `DashboardScreen` bottom-right FAB → CheckIn | Minimal nav change | Mất FAB khi user ở tab khác | Secondary if Option B blocked |
| **D — 5th Check-in tab** | Literal ZenHR clone | Pixel parity | **Violates** BR-PORT-02 / U48 4-tab lock | **Reject** |

**Decision default (BA U55):** **Option B** — center FAB overlay bound to CheckIn; palette = XeVN `colors.accent` / `colors.success` for FAB fill (not ZenHR teal clone). Tab labels remain Option A §5.2 (MOB-UX-09).

### 13.5 MOB-UX-10 polish wave backlog

| Slice | work_item_id (proposed) | Scope | J-* | Owner | Priority |
|-------|-------------------------|-------|-----|-------|----------|
| **MOB-UX-10a** | `PCOMP-W8-MOB-ZENHR-PENDING-01` | Pending Actions strip + My Actions colorful grid | J-MOB-31, J-MOB-32 | dev-mobile | P1 |
| **MOB-UX-10b** | `PCOMP-W8-MOB-ZENHR-FAB-01` | Center FAB shell + CheckIn map/clock polish | J-MOB-33 | dev-mobile | P0 |
| **MOB-UX-10c** | `PCOMP-W8-MOB-ZENHR-PAY-01` | Net salary green hero + payslip history on tab | J-MOB-34 | dev-mobile | P1 |
| **MOB-UX-10d** | `PCOMP-W8-MOB-ZENHR-ATT-01` | Attendance timeline On Time/Late badges | J-MOB-35 | dev-mobile | P1 |
| **MOB-UX-10 gate** | `PCOMP-W8-MOB-ZENHR-QA-01` | Device regression J-MOB-31..35 + J-MOB-19..30 + 4-tab | all | qa-device | After 10a–10d |

**Sequence:** After **MOB-UX-07..09** close (or parallel **10b** if PM prioritizes FAB). **10a** can start post MOB-UX-06 QA PASS. **10c** independent of leave-balance.

### 13.6 Acceptance criteria — ZenHR polish (AC-ZEN-*)

| AC-ID | Journey | Pass | Fail |
|-------|---------|------|------|
| AC-ZEN-31-01 | J-MOB-31 | Pending strip visible when count ≥1; tap opens correct detail | Hidden when pending; dead tap |
| AC-ZEN-32-01 | J-MOB-32 | ≥3 action tiles (Time Off live; Expenses/Letters stub Phase 2) | Monochrome only / crash on stub |
| AC-ZEN-33-01 | J-MOB-33 | Center FAB visible on ≥2 tabs; tap → CheckIn; tab count still **4** | 5th tab; FAB missing |
| AC-ZEN-34-01 | J-MOB-34 | Hero shows latest **net** amount; green hero styling; list below | Flat list only |
| AC-ZEN-35-01 | J-MOB-35 | History rows show On Time/Late/Absent badge matching API status | Plain text only |

**Evidence path:** `docs/qa/evidence/pcomp-w8-mob-zenhr-jmob31-35-YYYYMMDD.md`

### 13.7 Business rules (ZenHR delta)

| Mã | Điều kiện | Hành động | Kết quả |
|----|-----------|-----------|---------|
| BR-ZEN-01 | Render center FAB | Navigate CheckIn — **không** add tab route | 4-tab lock preserved |
| BR-ZEN-02 | Expenses / Letters tile tap | Stub modal «Phase 2» — **cấm** crash | Honest UX |
| BR-ZEN-03 | Net salary hero | Use latest payslip `net_amount`; mask if null | No fake salary |
| BR-ZEN-04 | Pending strip | Employee: own pending requests; Manager: team pending approvals | Persona branch |
| BR-ZEN-05 | Palette | XeVN tokens — accent FAB, success hero; **không** rebrand to ZenHR teal | Brand consistency |

### 13.8 Reconcile MOB-UX-06 in-flight

| MOB-UX-06 deliverable | ZenHR panel | Status |
|----------------------|-------------|--------|
| J-MOB-19 header role+chat | Z-P01 partial | ✅ READY_FOR_QA |
| J-MOB-20 greeting+date | Z-P01 | ✅ |
| J-MOB-21 stat cards | Z-P02 partial (cards ≠ pending strip) | ✅ — **10a** adds strip |
| J-MOB-22 announcements | — | ✅ |
| QuickAccessGrid (U53) | Z-P03 partial | In-flight MOB-UX-05 — **10a** adds My Actions subset |

**No rework** on MOB-UX-06 for ZenHR; polish is **additive** MOB-UX-10.

---

## 14. Traceability (updated U55)

| Requirement | Journey | AC prefix | Wave |
|-------------|---------|-----------|------|
| U54 sponsor mockup | J-MOB-19..30 | AC-ESS-* | MOB-UX-06..09 |
| **U55 ZenHR ESS** | **J-MOB-31..35** | **AC-ZEN-*** | **MOB-UX-10** |
| U53 portal | J-MOB-11..15 | AC-PORT-* | MOB-UX-05 |
| U48 Smart Hub | J-MOB-06..09, 15 | AC-MOB-HUB-* | MOB-UX-04 |

---

**completion_report (U54):** Đóng PCOMP-W8-MOB-ESS-BENCHMARK-01 — benchmark U54 SET A–E vs as-is mobile; executive reconcile U48 Personio + U53 portal; gap tables §4; J-MOB-19..30; waves MOB-UX-06..09; AC-ESS pass/fail per screen; tab IA Option A default.  
**completion_report (U55):** Đóng PCOMP-W8-MOB-ZENHR-BENCHMARK-01 — §13 ZenHR 11-panel map (Z-P01..11); smart-pattern gap vs 4-tab; J-MOB-31..35; MOB-UX-10 backlog; FAB Option B recommend; reconcile MOB-UX-06 ✅ in-flight.  
**next_owner:** pm  
**next_dispatch_prompt:** PM tiếp tục execution lane: (1) QA device retest `PCOMP-W8-MOB-ESS-DASH-01` MOB-UX-06 J-MOB-19..22 nếu chưa verdict; (2) dispatch dev-mobile `PCOMP-W8-MOB-ESS-LEAVE-01` MOB-UX-07 per §4.2–4.4 J-MOB-23..29 (inline approve, balance cards — W7-4 leave-balance BE); (3) sau MOB-UX-07..09 hoặc song song P0: dispatch `PCOMP-W8-MOB-ZENHR-FAB-01` MOB-UX-10b — đọc §13.4 Option B center FAB + J-MOB-33, không thêm tab thứ 5; (4) cập nhật `PROGRAM_JOURNEY_MAP.md` rows J-MOB-31..35 từ §13.3.  
**evidence_path:** `docs/program/MOBILE_HRM_ESS_UX_BENCHMARK.md` (§13–14)  
**ack_status:** `PASS_TO_PM`
