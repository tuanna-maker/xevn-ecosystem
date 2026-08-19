# Menu TC Pack — `MOB-HOME` · Mobile Trang chủ + FAB «Thao tác nhanh»

| Meta | Value |
|------|--------|
| **menu_id** | `MOB-HOME` |
| **surface** | `hrm-mobile` |
| **route(s)** | Tab `TabDashboard` · `DashboardScreen` · overlay `CheckInFabOverlay` · `FabPrimaryActionSheet` |
| **HDSD** | Mobile ESS Home · `docs/program/MOBILE_HOME_PORTAL_AC_DELTA.md` · `docs/program/MOBILE_PERSONA_UX_MATRIX.md` · `MOBILE_HRM_ESS_UX_BENCHMARK.md` §13.4 |
| **SRS / FR / UC** | UC-HRM-MOB hub · UC-HRM-MOB-04 (check-in entry) · portal J-MOB-11..15 · Smart Hub J-MOB-06..09 · **AT-01** (đơn công FAB) |
| **TechSpec** | `MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` · `apps/mobile/hrm-mobile` nav/FAB · `homePortal.ts` · `dashboardPersonaLayout.ts` |
| **API_CONTRACT** | `GET /api/hrm/home/summary` (celebrations/whos_out compose) · `GET …/employees/{id}` · payslip list query · task/inbox counts (client compose) |
| **UF / J-*** | **J-MOB-01** (login→home) · **J-MOB-11..15** (portal shell) · **J-MOB-06..09** (Smart Hub regression) · **J-MOB-02** / **J-MOB-03** / **J-MOB-05** / **AT-01** — *downstream packs* |
| **Catalog neo** | TC-AT-01 (FAB đơn công entry) · roster `MOB-FAB-*` gộp pack này |
| **author** | qa · `PO-ECO-TC-MOB-HOME-01` |
| **work_item_id** | `PO-ECO-TC-MOB-HOME-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · FAB rows ☑ · Trace ☑ |
| **Persona lock** | NV **`uat.nv0003@xe.vn`** · QL **`uat.nv0001@xe.vn`** · LDR persona khi có account leader pilot (hoặc vitest `leader` matrix) |
| **Locks** | U65 zero-seed · U76 HDSD · U78 test-log when executed · **cấm** UAT DONE |

> Chuẩn: IEEE 829 / ISO 29119 lean — pack **thiết kế** TC; execution device = wave sau.  
> **Leave / Approvals chi tiết:** Wave A **`MOB-LEAVE-APPR.md`** — pack này chỉ **entry + hub**; không nhân bản wizard nghỉ / inbox Duyệt đầy đủ.

---

## 0. Spec read ack (inventory source)

| Source | Path | Sections used |
|--------|------|----------------|
| Home screen | `apps/mobile/hrm-mobile/src/features/dashboard/DashboardScreen.tsx` | load/refresh · persona layout · quick access · activity sheet |
| Root tabs | `apps/mobile/hrm-mobile/src/navigation/RootNavigator.tsx` · `mainTabIa.ts` | 4-tab `TabDashboard`…`TabProfile` |
| FAB host | `CheckInFabOverlay.tsx` · `checkInFab.ts` | hide on `CheckIn` · `check-in-fab` testID |
| FAB catalog | `navigation/fabPrimaryActions.ts` · `FabPrimaryActionSheet.tsx` | 4 action ids · persona order · nav map |
| Action grid | `utils/homePortal.ts` · `QuickAccessGrid.tsx` | 9–10 tiles · badges · stub `reports` |
| Top bar | `HomeTopBar.tsx` | avatar · notify · primary header |
| Portal AC | `docs/program/MOBILE_HOME_PORTAL_AC_DELTA.md` | J-MOB-11..15 · icon map |
| Journey | `docs/program/PROGRAM_JOURNEY_MAP.md` | J-MOB-01 · 11..15 · 06..09 |
| Roster | `docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md` | MOB-HOME · MOB-FAB-* |
| Cross-pack | `docs/qa/testcases/hrm-mobile/MOB-LEAVE-APPR.md` | FAB→Leave · FAB→Duyệt execution depth |
| Vitest SoT | `navigation/__tests__/fabPrimaryActions.test.ts` | persona row inventory |

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| SCR-HOME-DASH | tab | `TabDashboard` / `DashboardScreen` | Trang chủ scroll (portal + ESS hub) | loading shimmer · content · cache banner · pull-refresh |
| SCR-HOME-TOP | chrome | `HomeTopBar` | Header primary · avatar · chuông | company label optional |
| SCR-HOME-HERO | inline | `HomeHeroCarousel` | Carousel kỷ niệm / sinh nhật | 0 slides hidden · ≥1 slide + dots |
| SCR-HOME-GRID | inline | `QuickAccessGrid` | Lưới icon (carousel pages) | compact/regular · badge on tile |
| SCR-HOME-FEED | inline | `HomeFeedSection` / payslip teaser | Feed phiếu lương / CTA | empty + CTA · row + detail nav |
| SCR-HOME-ESS | sections | ESS blocks | Date bar · stat cards · stats row | persona order |
| SCR-HOME-MGR-HERO | card | `ManagerInboxHero` | «Cần duyệt» hero (mgr) | count · tap → approvals |
| SCR-HOME-PENDING | strip | `PendingApprovalsStrip` | Dải pending (mgr/ldr) | visible/hidden |
| SCR-HOME-LEADER | card | `LeaderPulseCard` | Pulse leader persona | ldr only |
| SCR-HOME-EXPAND | sections | `HomeExpandableSection` | Việc cần làm · Hôm nay · Sắp tới · Manager | collapsed/expanded |
| SCR-HOME-CULTURE | section | `home-culture-strip` | Sinh nhật ngang | empty OK |
| SCR-HOME-WHOS-OUT | section | `home-whos-out-section` | Ai nghỉ hôm nay | tap → leave detail |
| SCR-HOME-JOURNEY | card | `JourneyTimelineCard` | Timeline hành trình | stub/feed |
| SCR-FAB-OVERLAY | overlay | `CheckInFabOverlay` | Nút «+» giữa tab bar | hidden on `CheckIn` |
| SCR-FAB-SHEET | sheet | `FabPrimaryActionSheet` | «Thao tác nhanh» | open · dismiss |
| SHT-ACTIVITY | sheet | `HomeActivitySheet` | Hub mở rộng từ trigger | sections list |
| POP-PHASE2-STUB | modal | `Phase2StubModal` | Báo cáo / stub Phase 2 | open/close |
| CMP-SHIMMER | inline | `DashboardHomeShimmer` | Skeleton first paint | loading |

**Đếm:** tab/page=1 · chrome=1 · inline sections=12 · overlay+sheet=3 · modals=1 · shimmer=1 → **18** surface ids

---

## 2. Field dictionary (display + controls)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API / source | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|--------------|--------|-------|
| F-TOP-NAME | Tên hiển thị | SCR-HOME-TOP | text | Y | not UUID raw | membership / employee hydrate | plain VI | `displayName` |
| F-TOP-ROLE | Vai trò phụ | SCR-HOME-TOP | text | N | default «Nhân viên» | `roleSubtitle` ESS | | footnote |
| F-TOP-COMPANY | Tên công ty | SCR-HOME-TOP | text | N | scope label | operating unit / JWT | | không slug thô |
| F-TOP-AVATAR | Avatar | SCR-HOME-TOP | pressable | N | | `avatar_url` | image | testID `home-top-bar-avatar` |
| F-TOP-NOTIFY | Thông báo | SCR-HOME-TOP | icon btn | N | a11y «Thông báo» | — | | → Notifications |
| F-CACHE-BANNER | Dữ liệu ngoại tuyến | SCR-HOME-DASH | banner | N | offline cache hint | AsyncStorage | VI copy | warning tone |
| F-HERO-TITLE | Tiêu đề slide | SCR-HOME-HERO | carousel | N | ≥0 slides | home summary | | gradient |
| F-HERO-DOTS | Chỉ báo trang | SCR-HOME-HERO | dots | N | = slide count | | | |
| F-GRID-TILE-* | Nhãn icon (×9–10) | SCR-HOME-GRID | tile | Y | persona filter | `homePortal` | VI | testID `home-action-tile-{id}` |
| F-GRID-BADGE | Badge tile | SCR-HOME-GRID | badge | N | approve/notif counts | pending/tasks | integer | `…-badge` |
| F-FEED-PERIOD | Kỳ lương | SCR-HOME-FEED | text | N | latest payslip | GET payslips | dd/MM · VND | vi-VN money |
| F-FEED-NET | Thực lĩnh | SCR-HOME-FEED | text | N | | `net_amount` | thousand group | |
| F-FEED-CTA | Xem chi tiết | SCR-HOME-FEED | button | N | | nav PayslipDetail | | |
| F-ESS-DATE | Ngày chọn ESS | SCR-HOME-ESS | date bar | N | persona | local state | dd/MM/yyyy | |
| F-ESS-STAT-* | Chỉ số ESS | SCR-HOME-ESS | stat row | N | | attendance compose | number | `home-ess-stat-row-*` |
| F-MGR-HERO-COUNT | Cần duyệt (n) | SCR-HOME-MGR-HERO | card | mgr | n≥0 | pending merge | | `home-manager-inbox-hero` |
| F-PENDING-STRIP | Pending strip | SCR-HOME-PENDING | strip | mgr/ldr | | same | | `home-pending-approvals-strip` |
| F-TASK-ROW | Việc cần làm | SCR-HOME-EXPAND | list row | N | label not raw key | inbox/tasks | | J-MOB-06 |
| F-TODAY-CHK | Hôm nay chấm công | SCR-HOME-EXPAND | summary | N | | attendance today | time vi-VN | |
| F-UPCOMING-LEAVE | Sắp nghỉ | SCR-HOME-EXPAND | list | N | | leave list pick | dd/MM | |
| F-WHOS-OUT-ROW | Ai nghỉ | SCR-HOME-WHOS-OUT | person card | N | tap → detail | whos_out API | | J-MOB-09 |
| F-ACTIVITY-TRIGGER | Xem tất cả hoạt động | SCR-HOME-DASH | button | N | | opens sheet | | `home-activity-trigger` |
| F-FAB-BTN | Thao tác nhanh | SCR-FAB-OVERLAY | FAB | Y | a11y not «Chấm công» trực tiếp | — | | `check-in-fab` |
| F-FAB-SHEET-TITLE | Thao tác nhanh | SCR-FAB-SHEET | title | Y | | constant | | `fab-primary-action-sheet` |
| F-FAB-ROW-CHK | Chấm công | SCR-FAB-SHEET | row | emp/mgr | hidden ldr · BR-PERS-02 | nav CheckIn | | `fab-action-check-in` |
| F-FAB-ROW-LEAVE | Tạo đơn nghỉ | SCR-FAB-SHEET | row | all | must_keep | nav CreateLeaveRequest | | `fab-action-create-leave` |
| F-FAB-ROW-AT | Tạo đơn công | SCR-FAB-SHEET | row | all | AT-01 | nav CreateUpdateRequest | | `fab-action-create-update-request` |
| F-FAB-ROW-MGR | Duyệt đơn | SCR-FAB-SHEET | row | mgr/ldr | badge if pending>0 | nav ManagerApprovals | | `fab-action-manager-approvals` |
| F-FAB-CANCEL | Đóng | SCR-FAB-SHEET | button | Y | backdrop + cancel | dismiss | | a11y «Đóng» |
| F-STUB-LABEL | Tính năng Phase 2 | POP-PHASE2-STUB | modal title | N | reports tile | — | | `phase2-stub-modal` |

**Đếm fields:** **32** (grid counted as family + 4 FAB rows explicit)

---

## 3. Function inventory

| fn_id | UI (nút/menu) | screen_id | precond | API / nav | success FE + reopen | fail / edge | HDSD |
|-------|---------------|-----------|---------|-----------|---------------------|-------------|------|
| FN-JMOB01-LAND | Login → Home | SCR-HOME-DASH | auth OK · scope UUID | — | Tab **Trang chủ** · top bar name · no raw UUID panel | 401/scope banner | J-MOB-01 |
| FN-HOME-REFRESH | Kéo làm mới | SCR-HOME-DASH | online | home summary + compose | sections update · spinner ends | error banner/cache | |
| FN-TOP-AVATAR | Avatar | SCR-HOME-TOP | | nav Profile | Profile root | | |
| FN-TOP-NOTIFY | Chuông | SCR-HOME-TOP | | nav Notifications | Notifications screen | | J-MOB-11 bell |
| FN-GRID-TILE | Tap icon grid | SCR-HOME-GRID | | per tile map | target stack screen | stub modal | §6 delta map |
| FN-FEED-DETAIL | CTA phiếu lương | SCR-HOME-FEED | payslip exists | GET ok | PayslipDetail | empty CTA honest | J-MOB-14 |
| FN-MGR-HERO | Tap Cần duyệt | SCR-HOME-MGR-HERO | is_manager | | ManagerApprovals | hidden emp | J-MOB-07 |
| FN-ACTIVITY-OPEN | Hub trigger | SCR-HOME-DASH | | | Activity sheet sections | | |
| FN-EXPAND-TASK | Việc cần làm | SCR-HOME-EXPAND | | | expand/list | empty state | J-MOB-06 |
| FN-WHOS-OUT-TAP | Tap ai nghỉ | SCR-HOME-WHOS-OUT | row | GET leave | LeaveRequestDetail | 404 scope FAIL | J-MOB-09 |
| FN-FAB-OPEN | FAB «+» | SCR-FAB-OVERLAY | not CheckIn route | — | sheet title «Thao tác nhanh» | hidden on CheckIn | MOB-UX-10-P0 |
| FN-FAB-CLOSE | Đóng / backdrop | SCR-FAB-SHEET | sheet open | — | dismiss · no nav | | |
| FN-FAB-CHECKIN | Row Chấm công | SCR-FAB-SHEET | emp/mgr | nav TabAttendance→CheckIn | CheckIn screen | absent leader | J-MOB-02 entry |
| FN-FAB-LEAVE | Row Tạo đơn nghỉ | SCR-FAB-SHEET | all | nav CreateLeaveRequest | wizard step 0 | *detail MOB-LEAVE-APPR* | |
| FN-FAB-UPDATE | Row Tạo đơn công | SCR-FAB-SHEET | all | nav CreateUpdateRequest | create screen title | *detail MOB-ATTENDANCE* | AT-01 |
| FN-FAB-APPROVE | Row Duyệt đơn | SCR-FAB-SHEET | mgr/ldr | nav ManagerApprovals | inbox | hidden emp · *detail MOB-LEAVE-APPR* | J-MOB-05 entry |
| FN-FAB-BADGE | Badge pending | SCR-FAB-SHEET | pending>0 | poll count | badge n · a11y «n đơn chờ» | 99+ cap | |
| FN-STUB-REPORTS | Tile Báo cáo | SCR-HOME-GRID | mgr · stub | — | Phase2StubModal | no crash | |
| FN-OFFLINE-HOME | Load home offline | SCR-HOME-DASH | offline | cache | cache banner · no uncaught | no fake mutate | U65 |

**Đếm functions:** **19** (mutate on home minimal — hub navigates out)

---

## 4. Test case matrix

### Quy ước

- **TC-ID:** `TC-MOB-HOME-<area>-<nnn>` · Type: `HP` · `FD` · `BD` · `AU` · `UX` · `NAV` · `REG`
- **Layer:** DEVICE · VITEST (FAB matrix) · API (optional parity)
- **Status mặc định:** `PLANNED` (design pack — chưa device run wave này)
- **Cross-ref:** `→ MOB-LEAVE-APPR §4.x` · `→ MOB-ATTENDANCE` (planned) · không duplicate wizard

### 4.1 J-MOB-01 · Login → Home landing

| TC-ID | Type | Covers | Persona | Precond | Steps (HDSD) | Expected | Automate | Status |
|-------|------|--------|---------|---------|--------------|----------|----------|--------|
| TC-MOB-HOME-J01-HP-001 | HP | FN-JMOB01-LAND | uat.nv0003 | U65 login FE · scope UUID | Login → chọn membership → tab **Trang chủ** | `HomeTopBar` tên người · role subtitle · **không** UUID làm title chính · 4 tab labels `Trang chủ\|Đội nhóm\|Phiếu lương\|Hồ sơ` | DEVICE | PLANNED |
| TC-MOB-HOME-J01-HP-002 | HP | FN-JMOB01-LAND | uat.nv0001 | mgr scope | Same | Home loads · mgr sections order (inbox hero/strip có thể) · FAB visible | DEVICE | PLANNED |
| TC-MOB-HOME-J01-FD-001 | FD | scope error | uat.nv0003 | sim bad scope | Open Home | Banner lỗi VI · không spinner vô hạn · không crash | DEVICE | PLANNED |
| TC-MOB-HOME-J01-UX-001 | UX | FN-HOME-REFRESH | uat.nv0003 | online | Pull refresh | Indicator · content cập nhật hoặc honest empty | DEVICE | PLANNED |
| TC-MOB-HOME-J01-UX-002 | UX | FN-OFFLINE-HOME | uat.nv0003 | airplane after 1 load | Reopen Home | Cache banner nếu có · không Uncaught | DEVICE | PLANNED |

### 4.2 Portal shell · J-MOB-11..15 (regression on Home)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-HOME-PT-HP-011 | HP | F-TOP-* | uat.nv0003 | | Observe header | Nền primary · avatar ≥44 · chuông · tên + role | DEVICE | PLANNED |
| TC-MOB-HOME-PT-HP-012 | HP | SCR-HOME-HERO | uat.nv0003 | summary có celebration | Scroll hero | Carousel swipe · dots khớp slide count | DEVICE | PLANNED |
| TC-MOB-HOME-PT-HP-013 | HP | FN-GRID-TILE | uat.nv0003 | | Tap **Chấm công** · **Nghỉ phép** · **Phiếu lương** | Nav đúng CheckIn / LeaveRequestsList / PayslipList | DEVICE | PLANNED |
| TC-MOB-HOME-PT-HP-014 | HP | FN-FEED-DETAIL | uat.nv0003 | ≥1 payslip API | Feed CTA | PayslipDetail · amount vi-VN | DEVICE | PLANNED |
| TC-MOB-HOME-PT-HP-015 | REG | J-MOB-15 composite | uat.nv0003 | | Scroll full Home | Portal + ESS hub cùng scroll · 4-tab không đổi | DEVICE | PLANNED |
| TC-MOB-HOME-PT-UX-001 | UX | FN-TOP-NOTIFY | uat.nv0003 | | Tap chuông | Notifications screen | DEVICE | PLANNED |
| TC-MOB-HOME-PT-FD-001 | FD | FN-STUB-REPORTS | uat.nv0001 | mgr | Tap tile **Báo cáo** | Phase2StubModal · đóng OK | DEVICE | PLANNED |

### 4.3 Smart Hub regression · J-MOB-06..09 (on Home — không mở pack mới)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-HOME-HUB-REG-006 | REG | FN-EXPAND-TASK | uat.nv0003 | | Scroll · section Việc cần làm | Visible or honest empty · không ERROR banner | DEVICE | PLANNED |
| TC-MOB-HOME-HUB-REG-007 | REG | FN-MGR-HERO | uat.nv0001 | pending≥0 | Card Cần duyệt | Tap → ManagerApprovals | DEVICE | PLANNED |
| TC-MOB-HOME-HUB-REG-008 | REG | F-CULTURE | uat.nv0003 | birthdays in summary | Sinh nhật strip | Horizontal avatars · no birth year leak | DEVICE | PLANNED |
| TC-MOB-HOME-HUB-REG-009 | REG | FN-WHOS-OUT-TAP | uat.nv0003 | whos_out row | Tap colleague | LeaveRequestDetail · no 404 scope | DEVICE | PLANNED |

### 4.4 FAB sheet · inventory **tất cả hàng** (MOB-FAB-SHEET)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-HOME-FAB-HP-001 | HP | FN-FAB-OPEN · FN-FAB-CLOSE | uat.nv0003 | Home focused | Tap FAB → verify sheet → **Đóng** | testID `fab-primary-action-sheet` · title «Thao tác nhanh» · a11y FAB «Thao tác nhanh» not direct check-in | DEVICE | PLANNED |
| TC-MOB-HOME-FAB-HP-002 | HP | FN-FAB-CHECKIN · row inventory | uat.nv0003 | employee | Open sheet | Row **Chấm công** label+subtitle · testID `fab-action-check-in` · tap → **CheckIn** | DEVICE | PLANNED |
| TC-MOB-HOME-FAB-HP-003 | HP | FN-FAB-LEAVE · **entry only** | uat.nv0003 | | Tap **Tạo đơn nghỉ** | `CreateLeaveRequest` · stepper visible · **stop** — wizard TC → **MOB-LEAVE-APPR** TC-MOB-LV-NAV-001 | DEVICE | PLANNED |
| TC-MOB-HOME-FAB-HP-004 | HP | FN-FAB-UPDATE · AT-01 entry | uat.nv0003 | | Tap **Tạo đơn công** | `CreateUpdateRequest` screen · **stop** — submit TC → **MOB-ATTENDANCE** / catalog **TC-AT-01** | DEVICE | PLANNED |
| TC-MOB-HOME-FAB-AU-001 | AU | FN-FAB-APPROVE hidden | uat.nv0003 | not manager | Open sheet | **Không** có row `fab-action-manager-approvals` | DEVICE | PLANNED |
| TC-MOB-HOME-FAB-HP-005 | HP | FN-FAB-APPROVE · **entry only** | uat.nv0001 | mgr | Tap **Duyệt đơn** | `ManagerApprovals` · **stop** — Duyệt TC → **MOB-LEAVE-APPR** TC-MOB-LV-NAV-004 | DEVICE | PLANNED |
| TC-MOB-HOME-FAB-HP-006 | HP | FN-FAB-BADGE | uat.nv0001 | pending>0 | Open sheet | Badge on Duyệt đơn · a11y mentions count | DEVICE | PLANNED |
| TC-MOB-HOME-FAB-AU-002 | AU | BR-PERS-02 check-in hidden | leader | leader account or matrix | Open sheet | **Không** `fab-action-check-in` · vẫn có leave+AT+approve | DEVICE+VITEST | PLANNED |
| TC-MOB-HOME-FAB-HP-007 | HP | manager row order | uat.nv0001 | | Open sheet | Order: Chấm công → Tạo đơn nghỉ → Tạo đơn công → Duyệt đơn | VITEST+DEVICE | PLANNED |
| TC-MOB-HOME-FAB-UX-001 | UX | FN-FAB hide route | uat.nv0003 | on CheckIn | Observe FAB | Overlay **hidden** (`shouldHideCheckInFab`) | DEVICE | PLANNED |
| TC-MOB-HOME-FAB-UX-002 | UX | touch targets | any | | Measure row/cancel | Row min height ≥ list row · cancel ≥ primary button · sheet margin above tab bar | DEVICE | PLANNED |

### 4.5 Quick access grid · persona tiles

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-HOME-GRID-HP-001 | HP | tile badges | uat.nv0001 | pending tasks | Observe **Phê duyệt**/Duyệt tile | Badge = manager pending or task count policy | DEVICE | PLANNED |
| TC-MOB-HOME-GRID-HP-002 | HP | FN-GRID-TILE time_off | uat.nv0003 | | Tap **Nghỉ phép** | LeaveRequestsList | DEVICE | PLANNED |
| TC-MOB-HOME-GRID-AU-001 | AU | approve label emp | uat.nv0003 | | Tile approve label | **Việc** not «Duyệt» | DEVICE | PLANNED |
| TC-MOB-HOME-GRID-AU-002 | AU | reports mgr only | uat.nv0003 | employee | Grid inventory | **Không** tile `reports` | DEVICE | PLANNED |

### 4.6 Vitest parity · FAB catalog (no device)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-HOME-UNIT-001 | HP | resolveFabPrimaryActions employee | — | | `pnpm exec vitest run fabPrimaryActions.test.ts` | 3 ids check_in, create_leave, create_update_request | VITEST | PLANNED |
| TC-MOB-HOME-UNIT-002 | HP | manager + badge | — | | same | 4 rows · badge undefined when 0 | VITEST | PLANNED |
| TC-MOB-HOME-UNIT-003 | HP | leader matrix | — | | same | No check_in · badge=3 when pending | VITEST | PLANNED |

### Coverage check

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions ≥1 HP | 19 | 19 | 0 |
| FAB rows all 4 ids | 4 | FAB-HP-002..005 + AU-001/002 | 0 |
| FAB→Leave entry (no wizard dup) | 1 | FAB-HP-003 + cross-ref | 0 |
| J-MOB-01 explicit | 1 | J01-HP-001 | 0 |
| J-MOB-11..15 spot checks | 5 | PT-HP-011..015 | 0 |
| J-MOB-06..09 regression | 4 | HUB-REG-006..009 | 0 |
| Persona AU (emp/mgr/ldr) | 3 | FAB-AU + GRID-AU | 0 |

**TC count:** **34** PLANNED (design)

---

## 5. Traceability

| TC-ID | SRS / UC | TechSpec / doc | API | Catalog / J-* | HDSD |
|-------|----------|----------------|-----|---------------|------|
| TC-MOB-HOME-J01-HP-001 | UC-HRM-MOB hub | MOBILE_HOME_PORTAL_AC_DELTA | home compose | **J-MOB-01** | Login → Trang chủ |
| TC-MOB-HOME-PT-HP-013 | portal shortcuts | MOB-UX-05 §6 icon map | — | **J-MOB-11..13** | Icon grid |
| TC-MOB-HOME-PT-HP-014 | payslip feed | MOB-UX-05 | GET payslips | **J-MOB-14** | Feed CTA |
| TC-MOB-HOME-FAB-HP-003 | UC leave entry | fabPrimaryActions | — | FAB→**MOB-LEAVE-APPR** | Tạo đơn nghỉ |
| TC-MOB-HOME-FAB-HP-004 | AT-01 | R-SPINE-AT-NAV-01 | — | **TC-AT-01** | Tạo đơn công |
| TC-MOB-HOME-FAB-HP-002 | UC-HRM-MOB-04 | checkInFab | POST check-in downstream | **J-MOB-02** entry | Chấm công |
| TC-MOB-HOME-FAB-HP-005 | FR-UC-H03 entry | profileStackNav | — | **J-MOB-05** entry → MOB-LEAVE-APPR | Duyệt đơn |
| TC-MOB-HOME-HUB-REG-009 | whos out | dashboardHub | GET leave | **J-MOB-09** | Ai nghỉ → detail |

---

## 6. Out of scope / cross-pack

| Item | Owner pack | TC in MOB-HOME |
|------|------------|----------------|
| CreateLeaveRequest wizard · attach · submit | **MOB-LEAVE-APPR** | FAB-HP-003 entry only |
| ManagerApprovals Duyệt/Từ chối · filters | **MOB-LEAVE-APPR** | FAB-HP-005 · HUB-REG-007 entry |
| CheckIn GPS · POST check-in | **MOB-ATTENDANCE** (planned) | FAB-HP-002 · PT-HP-013 |
| CreateUpdateRequest submit | **MOB-ATTENDANCE** / TC-AT-01 | FAB-HP-004 entry |
| Payslip list→detail deep E2E | **MOB-PAYSLIP** | PT-HP-014 feed only |
| Team directory | **MOB-TEAM** | grid tile team |
| Login / Scope screens | **MOB-LOGIN** | precond J-MOB-01 |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-mob-home-01.md
next_owner: qa-synth (rollup PO_SPEC_TEST_REPORT + roster MOB-HOME status)
counts: screens=18 fields=32 functions=19 tcs=34 (all PLANNED design)
catalog_map: J-MOB-01 · J-MOB-06..09 REG · J-MOB-11..15 · AT-01 entry · FAB 4-row inventory
cross_ref: MOB-LEAVE-APPR (Wave A) — no wizard duplicate
```

*PO-ECO-TC-MOB-HOME-01 · WORLD-STANDARD depth pack · no UAT execution claim*
