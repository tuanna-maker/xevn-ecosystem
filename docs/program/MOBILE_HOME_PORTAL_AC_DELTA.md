# MOB-UX-05 Home Portal Shell — Delta AC Package

**work_item_id:** `PCOMP-W8-MOB-HOME-PORTAL-BA-01`  
**from_role:** ba-process  
**to_role:** pm  
**ack_status:** `PASS_TO_PM`  
**trigger:** U53 · sponsor mockup 2026-06-08  
**program slice:** `MOB-UX-05` (Portal Shell) **trên** `MOB-UX-04` (Smart Hub — U48) · visual U49  
**evidence_path:** `docs/program/MOBILE_HOME_PORTAL_AC_DELTA.md`  
**Ngày:** 2026-06-08

---

## 1. Process objective and actors

| Actor | Vai trò |
|-------|---------|
| Nhân viên UAT | Sau login thấy **portal shell** (header, carousel, lưới icon, feed lương) **và** Smart Hub (U48) trong một scroll |
| Quản lý | Cùng shell; icon «Duyệt» / badge chuông; card «Cần duyệt» vẫn trên Home (J-MOB-07) |
| Dev-Mobile | `HomePortalHeader`, `HomeHeroCarousel`, `QuickAccessGrid`, `PayslipFeedCard`; giữ `DashboardScreen` Smart Hub blocks |
| Dev-BE | Tùy chọn mở rộng `GET /home/summary?include=…` (anniversary, latest_payslip); Phase 1 **compose client OK** |
| QA / QA-Device | L2.5 `J-MOB-11`..`15`; regression `J-MOB-06`..`09` không regress |

**Mục tiêu U53:** Trang chủ **không còn flat text-first** — tối thiểu 4 lớp mockup sponsor — **không** thay 4-tab bottom nav; **không** bỏ logic task-first U48.

**Phạm vi wave:**

| Slice | J-* | Giai đoạn |
|-------|-----|-----------|
| **MOB-UX-05a** (P0 — U53) | J-MOB-11..14 | Portal shell widgets |
| **MOB-UX-05b** (P0 gate) | J-MOB-15 | Composite scroll + U48/U49 reconcile + 4-tab regression |
| **MOB-UX-05c** (P1) | Carousel slide «Thông báo» từ inbox broadcast | Phase 2 |

---

## 2. Sponsor mockup vs research vs as-is

| Nguồn | Mô hình Home | XeVN hiện tại (`DashboardScreen.tsx`) |
|-------|--------------|--------------------------------------|
| **U53 mockup** | Header xanh + search + chuông; carousel kỷ niệm + dots; lưới **2×4 icon**; feed **Bảng lương** + CTA | ❌ Chưa có |
| **U48 research** (`MOBILE_HOME_HUB_UX_RESEARCH.md`) | Smart Hub **task-first** — Personio/Workday text sections | ✅ MOB-UX-04a/b: Việc cần làm, manager, sinh nhật, ai nghỉ |
| **U49 DS** (`MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` §11) | Visual hierarchy, avatar, celebration emotion | 🟡 Một phần (avatar greeting, `HomeCelebrationRow`) |

**Quyết định BA (reconcile):** **Portal shell (U53) = lớp trên cùng scroll**; **Smart Hub (U48) = lớp dưới** trong cùng tab **Trang chủ**. Không chọn một trong hai — mockup là **skin + shortcut**, research là **logic nghiệp vụ**.

---

## 3. Journey ID governance — J-MOB-11..15 vs W7

PM lock **U53** gán `J-MOB-11`..`15` cho **Home Portal**. Draft W7 (`MOBILE_W7_SRS_DELTA.md`) đã dùng cùng ID cho leave-doc / ESS / push — **renumber bắt buộc**:

| ID cũ (W7 draft) | ID mới | Journey |
|------------------|--------|---------|
| J-MOB-11 (leave attachment) | **J-MOB-16** | Upload giấy nghỉ y tế |
| J-MOB-12 (ESS profile full) | **J-MOB-17** | Hồ sơ ESS đầy đủ |
| J-MOB-13 (FCM deep link) | **J-MOB-18** | Push + deep link |
| H8c «J-MOB-13 Notifications» | **⊂ J-MOB-11** | Chuông header → `InAppNotifications` |

**PM action:** Cập nhật `PROGRAM_JOURNEY_MAP.md` §Mobile thêm `J-MOB-11`..`15`; sửa tham chiếu W7 → `J-MOB-16`..`18` trong `MOBILE_W7_SRS_DELTA.md` / `MOBILE_W7_GAP_ORCHESTRATION.md` (governance, không chặn MOB-UX-05 dev).

---

## 4. To-be scroll order (TabDashboard — 4 tab giữ nguyên)

```text
┌─ HomePortalHeader (sticky) ─ avatar | search | bell ─────────────┐
├─ HomeHeroCarousel (horizontal, dots, ≥1 slide khi có data) ────┤
├─ QuickAccessGrid 2×4 (8 icon + label) ───────────────────────────┤
├─ PayslipFeedCard (latest kỳ / empty + CTA) ──────────────────────┤
├─ [U48 Smart Hub — thứ tự persona không đổi MOB-UX-04] ──────────┤
│   Manager: Cần duyệt → Việc cần làm → …                          │
│   NV:      Việc cần làm → Hôm nay → Sắp tới → Sinh nhật → Ai nghỉ│
└─ Bottom tab bar: Trang chủ | Chấm công | Đơn công | Thêm ───────┘
```

**4-tab rule (U48/U49 lock):**

| Tab | Không đổi | Portal liên quan |
|-----|-----------|------------------|
| Trang chủ | ✅ | Shell + Smart Hub |
| Chấm công | ✅ | Icon grid shortcut trùng tab (OK) |
| Đơn công | ✅ | Icon «Đơn nghỉ» có thể deep link `CreateLeaveRequest` |
| Thêm | ✅ | Icon Profile/Lương/Hợp đồng trùng More stack |

**Cấm:** Tab thứ 5; đặt Submit/Duyệt primary trên header portal; ẩn Smart Hub sections đã PASS `J-MOB-06`..`09`.

---

## 5. Gap table — mockup element vs as-is vs to-be vs owner

| # | Mockup (U53) | As-is | To-be (MOB-UX-05) | Owner | Slice |
|---|--------------|-------|-------------------|-------|-------|
| G-PORT-01 | Header nền **xanh** (`#1E40AF`) | `AppScreenLayout` large title nền grouped xám; avatar trong greeting trắng | `HomePortalHeader` sticky: `colors.primary`, avatar 40pt trái, ô search giữa, chuông phải + badge unread | **dev-mobile** | 05a |
| G-PORT-02 | **Search** global | Không có | Phase 1: tap → Alert «Tìm kiếm đồng nghiệp — sắp ra mắt» **hoặc** navigate `TabMore/Profile` stub; Phase 2: `J-MOB-17` directory | **dev-mobile** (+ **dev-be** W7-5) | 05a stub |
| G-PORT-03 | **Chuông** thông báo | Chỉ link «Xem thông báo» trong empty task | Icon bell → `TabMore/Notifications`; badge = `taskTotalCount` inbox unread **hoặc** `GET /notifications/inbox` `read_at IS NULL` count | **dev-mobile** | 05a |
| G-PORT-04 | **Carousel** kỷ niệm + minh họa + **dots** | Text banner sinh nhật 1 dòng (`birthdayBannerSection`) | `HomeHeroCarousel`: FlatList paging; slides: (1) kỷ niệm làm việc viewer, (2) sinh nhật viewer/colleague, (3) placeholder thông báo P1; dots = `slides.length` | **dev-mobile** | 05a |
| G-PORT-05 | Illustration carousel | Không | Asset SVG/PNG `assets/home/` — confetti/work anniversary; fallback gradient + emoji 🎉 | **dev-mobile** | 05a |
| G-PORT-06 | Lưới icon **2×4** (8 mục) | 2× `HomeActionCard` dọc (Chấm công, Tạo nghỉ) | `QuickAccessGrid` 4 cột × 2 hàng; icon Ionicons filled 28pt trong vòng tròn 56pt | **dev-mobile** | 05a |
| G-PORT-07 | Feed **Bảng lương** + CTA | Chỉ trong tab Thêm → Lương | `PayslipFeedCard`: kỳ mới nhất + `net_amount` VND + CTA «Xem chi tiết» | **dev-mobile** | 05a |
| G-PORT-08 | Sinh động / U49 | Flat sections text | AC-VIS-01..04 regression trên shell mới | **dev-mobile** · **qa-device** | 05b |
| G-PORT-09 | Smart Hub U48 | ✅ MOB-UX-04 | Giữ nguyên blocks; chỉ đổi vị trí **dưới** portal | **dev-mobile** | 05b |
| G-PORT-10 | API aggregate | `home/summary` celebrations/whos_out | Optional `include=latest_payslip,work_anniversary` (BE) — **không block** 05a nếu compose client | **dev-be** optional | 05a compose |

---

## 6. Icon → route map (QuickAccessGrid)

| # | Label mockup (VI) | Icon (Ionicons) | Navigation target | UC / screen | Ghi chú |
|---|-------------------|-----------------|-------------------|-------------|---------|
| 1 | **Hồ sơ** (Profile) | `person-circle` | `TabMore` → `Profile` | UC-HRM-MOB-12 | J-MOB-04 regression |
| 2 | **Sự nghiệp** (Career) | `briefcase` | `TabMore` → `Contracts` | UC-HRM-MOB-10 | Hợp đồng = proxy career Phase 1 |
| 3 | **Bảng lương** (Payroll) | `wallet` | `TabMore` → `PayrollSummary` | UC-HRM-MOB-09 | Hoặc `PayslipList` nếu 1 kỳ |
| 4 | **Khen thưởng** (Merits) | `ribbon` | Stub modal: «Module khen thưởng — Phase 2» + CTA đóng | — | Không crash; BR-PORT-STUB-01 |
| 5 | **Quy định** (Policies) | `document-text` | Stub modal Phase 2 **hoặc** `TabMore` → `Notifications` filter policy | — | BR-PORT-STUB-01 |
| 6 | **Chấm công** (Checkin) | `time` | `TabAttendance` → `CheckIn` | UC-HRM-MOB-04 | J-MOB-02 |
| 7 | **Chức năng** (Job function) | `grid` | NV: `TabRequests` → `LeaveRequestsList`; Manager: `TabMore` → `Operations` | MOB-08 / ops | Persona branch |
| 8 | **Xem thêm** (See more) | `ellipsis-horizontal-circle` | `TabMore` → `Settings` (menu links) | — | Parity Settings `navLinks` |

**AC bắt buộc:** Mỗi icon có `accessibilityLabel` = label VI; tap **≤300ms** feedback opacity; 8 ô luôn render (stub vẫn có icon).

---

## 7. API / data per widget

| Widget | Data cần | API / nguồn (Phase 1) | Fallback / empty |
|--------|----------|------------------------|------------------|
| **Header avatar** | `avatar_url`, tên | `GET /employees/{viewer_id}` (đã gọi trong `load`) | Initials `HrmAvatar` |
| **Bell badge** | Unread inbox count | `GET /notifications/inbox?company_id&employee_id&limit=12` — count `read_at == null` | Ẩn badge khi 0 |
| **Carousel — sinh nhật** | Celebrations today | `GET /home/summary?include=celebrations` hoặc compose (`hrmHomeSummary.ts`) | Ẩn slide |
| **Carousel — kỷ niệm làm việc** | `hired_at` MM-DD = today; years ≥ 1 | `GET /employees/{viewer_id}` field `hired_at`; client tính năm | Ẩn slide; BE optional `work_anniversary` in summary |
| **Carousel — thông báo** | Unread broadcast | Inbox row `event_type` broadcast (P1) | Slide placeholder P0 nếu 0 slide khác: gradient + «Chào mừng bạn» |
| **Icon grid** | Static config | Local `homeQuickAccessConfig.ts` + persona flags | — |
| **Payslip feed** | Latest payslip | `GET /payroll/payslips?company_id&employee_id` → sort `period_label` desc, lấy `[0]` | Empty: «Chưa có bảng lương» + CTA «Xem kỳ lương» → `PayrollSummary` |
| **Payslip CTA detail** | `payslip.id`, `period_label` | Same list | `TabMore` → `PayslipDetail` params |
| **Smart Hub** | (giữ MOB-UX-04) | `home/summary`, inbox, leave, attendance compose | `MOBILE_HOME_HUB_AC_DELTA.md` §6 |

**Scope:** Mọi call dùng `company_id` UUID từ `auth.getAttendanceCompanyId()` / header resolver — cùng rule J-MOB-06..09.

---

## 8. Journey acceptance criteria (J-MOB-11..15)

### 8.1 J-MOB-11 — Portal header (avatar + search + bell)

**Persona:** `uat.nv0001@xe.vn` / `xevn-uat-2026` · device ≥720×1280.

| AC-ID | Điều kiện | Pass | Fail |
|-------|-----------|------|------|
| AC-PORT-11-01 | Login → Tab Trang chủ | Header nền **`#1E40AF`** (hoặc `colors.primary`) full-bleed width; safe area top không clip | Header trắng/xám như cũ |
| AC-PORT-11-02 | Avatar có URL | Tap avatar → `TabMore/Profile` | Dead tap |
| AC-PORT-11-03 | Search visible | Ô search (placeholder «Tìm kiếm…») hiển thị giữa header | Không có search |
| AC-PORT-11-04 | Tap search Phase 1 | Stub không crash; copy rõ «sắp ra mắt» **hoặc** mở Profile | Crash / blank |
| AC-PORT-11-05 | Inbox ≥1 unread | Bell badge số **≥1** khớp inbox unread ±0 | Badge sai / thiếu |
| AC-PORT-11-06 | Tap bell | Navigate `InAppNotifications` (J-MOB H8c path) | Không navigate |
| AC-PORT-11-07 | VoiceOver | 3 control: avatar, search, notifications — label tiếng Việt | Thiếu label |

**Evidence:** `docs/qa/evidence/pcomp-w8-mob-portal-jmob11-YYYYMMDD.md`

---

### 8.2 J-MOB-12 — Hero carousel (kỷ niệm / sinh nhật / dots)

| AC-ID | Điều kiện | Pass | Fail |
|-------|-----------|------|------|
| AC-PORT-12-01 | ≥1 slide data | Carousel hiển thị **≥1** card cao **≥120pt** với illustration **hoặc** gradient + emoji | Chỉ text 1 dòng cũ |
| AC-PORT-12-02 | ≥2 slides | Pagination **dots** bottom center; swipe ngang đổi slide | Không dots khi >1 slide |
| AC-PORT-12-03 | Viewer work anniversary | Copy dạng «Kỷ niệm {n} năm gắn bó» — **không** lộ năm tháng đầy đủ nếu policy BR-ANNIV-01 | Lộ `hired_at` ISO |
| AC-PORT-12-04 | Viewer birthday | Slide «Chúc mừng sinh nhật» — BR-BDAY-01 (no birth year) | Lộ năm sinh |
| AC-PORT-12-05 | 0 slides nghiệp vụ | 1 slide welcome placeholder (gradient) — **không** blank gap | Khoảng trống lớn |
| AC-PORT-12-06 | API celebrations 500 | Slide khác vẫn render; lỗi không white screen | Crash Home |

**Evidence:** `docs/qa/evidence/pcomp-w8-mob-portal-jmob12-YYYYMMDD.md`

---

### 8.3 J-MOB-13 — Quick access icon grid 2×4

| AC-ID | Điều kiện | Pass | Fail |
|-------|-----------|------|------|
| AC-PORT-13-01 | Home load | **8** icon + label VI đúng §6 map | ≠8 ô / sai label |
| AC-PORT-13-02 | Layout | 2 hàng × 4 cột; icon circle **56pt**; label `caption` ≥12pt | List dọc 2 card |
| AC-PORT-13-03 | Tap «Chấm công» | → `CheckIn` tab Chấm công | Wrong screen |
| AC-PORT-13-04 | Tap «Bảng lương» | → `PayrollSummary` hoặc `PayslipList` | Dead link |
| AC-PORT-13-05 | Tap stub (Merits/Policies) | Modal/toast Phase 2 — **không** crash | Unhandled |
| AC-PORT-13-06 | Manager persona | Icon «Chức năng» → `Operations` (not leave list) | NV route |
| AC-PORT-13-07 | 4-tab bar | Sau navigate, tab bar vẫn **4** tab, tab active đúng | Tab thứ 5 / mất tab |

**Evidence:** `docs/qa/evidence/pcomp-w8-mob-portal-jmob13-YYYYMMDD.md`

---

### 8.4 J-MOB-14 — Payslip feed card + CTA

**Persona:** NV có ≥1 payslip seed UAT.

| AC-ID | Điều kiện | Pass | Fail |
|-------|-----------|------|------|
| AC-PORT-14-01 | API trả ≥1 payslip | Card «Bảng lương» hiển thị `period_label` + **Thực lĩnh** VND (`formatVnd`) | Không card khi có data |
| AC-PORT-14-02 | Tap CTA «Xem chi tiết» | → `PayslipDetail` đúng `payslipId` (J-MOB-04 cross-nav) | 404 / wrong id |
| AC-PORT-14-03 | 0 payslip | Empty card + CTA «Xem kỳ lương» → `PayrollSummary` | Blank / error đỏ |
| AC-PORT-14-04 | API 500 payslip | Card lỗi cục bộ; portal + Smart Hub vẫn scroll | White screen |
| AC-PORT-14-05 | Visual U49 | Card `SurfaceCard` elevation; số tiền **title2** tabular-nums | Plain text list |

**Evidence:** `docs/qa/evidence/pcomp-w8-mob-portal-jmob14-YYYYMMDD.md`

---

### 8.5 J-MOB-15 — Portal + Smart Hub composite (U48/U49/4-tab)

| AC-ID | Điều kiện | Pass | Fail |
|-------|-----------|------|------|
| AC-PORT-15-01 | Full scroll | Thứ tự: Header → Carousel → Grid → Payslip feed → **Smart Hub sections** | Smart Hub biến mất |
| AC-PORT-15-02 | J-MOB-06 regression | Section «Việc cần làm» vẫn PASS AC-MOB-HUB-06-01..03 | Regress task-first |
| AC-PORT-15-03 | J-MOB-07 regression (manager) | «Cần duyệt (n)» vẫn trên Home dưới feed | Chỉ tab Thêm |
| AC-PORT-15-04 | J-MOB-08/09 regression | Sinh nhật + Ai nghỉ vẫn render (có thể gộp carousel **và** section — không duplicate tên raw) | Mất widget 04b |
| AC-PORT-15-05 | AC-VIS-01 (U49) | ≥**4** visual layers trên Home (header, carousel/grid, feed, task card) | Flat wall of text |
| AC-PORT-15-06 | Pull-to-refresh | Refresh cập nhật portal + hub trong **≤1** spinner cycle | Partial stale |
| AC-PORT-15-07 | Bottom tabs | `RootNavigator` 4 tab — labels `vi.dashboard/attendance/requests/more` unchanged | Tab count/label đổi |

**Evidence:** `docs/qa/evidence/pcomp-w8-mob-portal-jmob15-YYYYMMDD.md` + attach R3 hub evidence nếu API unchanged.

---

## 9. Business rule matrix

### 9.1 Portal shell (`BR-PORT-*`)

| Mã | Điều kiện | Hành động | Kết quả |
|----|-----------|-----------|---------|
| BR-PORT-01 | Render Home TabDashboard | Portal shell **luôn** trên Smart Hub trong scroll | U53 min layout |
| BR-PORT-02 | 4-tab nav | Không thêm/xóa tab ở MOB-UX-05 | DS lock |
| BR-PORT-03 | Icon stub (Merits/Policies) | Modal informative; **không** mock data giả | Phase 2 UC |
| BR-PORT-04 | Search Phase 1 | Stub allowed; **cấm** gọi API directory chưa spec | W7-5 gate |
| BR-PORT-05 | Bell badge | Unread = inbox only; **không** cộng manager pending vào bell (pending ở card J-MOB-07) | Tránh double count |
| BR-PORT-06 | Payslip feed | Chỉ payslip `employee_id=viewer`; scope company UUID | ADR scope |
| BR-PORT-07 | Carousel priority | Order slides: (1) viewer birthday, (2) viewer work anniversary, (3) colleague celebration summary, (4) welcome | Deterministic |
| BR-PORT-08 | Duplicate birthday UI | Carousel **hoặc** banner 1 dòng — **không** cả hai cùng copy verbatim | UX polish |

### 9.2 Work anniversary (`BR-ANNIV-*`)

| Mã | Điều kiện | Hành động | Kết quả |
|----|-----------|-----------|---------|
| BR-ANNIV-01 | Hiển thị kỷ niệm | Show **số năm** (`n`) + copy chúc mừng; **cấm** show full `hired_at` ISO on UI | Privacy parity BR-BDAY |
| BR-ANNIV-02 | `hired_at` null | Skip slide | No crash |
| BR-ANNIV-03 | `< 1` năm làm việc | Skip work anniversary slide | No «0 năm» |
| BR-ANNIV-04 | Timezone | `Asia/Ho_Chi_Minh` for «today» | Same as BR-BDAY-04 |

### 9.3 Inherit Smart Hub (`BR-PORT-HUB-*`)

| Mã | Rule |
|----|------|
| BR-PORT-HUB-01 | Mọi BR `BR-MGR-TASK-*`, `BR-BDAY-*`, `BR-INBOX-HUB-*` từ `MOBILE_HOME_HUB_AC_DELTA.md` **vẫn hiệu lực** dưới portal |
| BR-PORT-HUB-02 | QA FAIL MOB-UX-05 nếu regress bất kỳ **PASS** `J-MOB-06`..`09` API/device |

---

## 10. Handoff package

| Role | Entry | Exit | Artifact |
|------|-------|------|----------|
| **dev-mobile** `PCOMP-W8-MOB-HOME-PORTAL-01` | Doc này §5–§8 | Vitest grid/header; device screenshot; `READY_FOR_QA` | `apps/mobile/hrm-mobile/src/features/dashboard/*` |
| **dev-be** (optional) `PCOMP-W8-MOB-HOME-PORTAL-BE-01` | `include=latest_payslip,work_anniversary` | `home.service` + spec; không break 04b | `home.controller.ts` |
| **qa** | Stack L0 + account UAT | L2.5 J-MOB-11..15 + regression 06..09 | `docs/qa/evidence/pcomp-w8-mob-portal-*` |
| **qa-device** | APK release path | AC-VIS + carousel swipe | `pcomp-w8-mob-portal-device-*` |
| **PM** | PASS_TO_PM này | Journey map rows + dispatch QA | `PROGRAM_JOURNEY_MAP.md` |

---

## 11. Assumptions, dependencies, risks

| ID | Mục | Owner | Ghi chú |
|----|-----|-------|---------|
| A-PORT-01 | Illustration asset chưa có trên CDN | dev-mobile | Gradient fallback PASS 05a |
| A-PORT-02 | Merits/Policies chưa có UC SRS | PM Phase 2 | Stub BR-PORT-03 |
| A-PORT-03 | W7 J-ID renumber | PM/BA | §3 — tránh trace drift |
| R-PORT-01 | Carousel + banner birthday trùng | dev-mobile | BR-PORT-08 |
| R-PORT-02 | Search stub sponsor không hài lòng | PM | Trigger W7 directory early |
| D-PORT-01 | Phụ thuộc payslip seed UAT | devops | J-MOB-14 empty alternate OK |

---

## 12. Open clarifications (closed defaults)

| Câu hỏi | Quyết định BA (2026-06-08) |
|---------|----------------------------|
| Portal vs Smart Hub? | **Cả hai** — portal trên, hub dưới (U53 + U48) |
| Bỏ 2 HomeActionCard? | **Có** — thay bằng icon grid; actions vẫn reachable |
| Work anniversary data? | Client từ `employees.hired_at`; BE aggregate optional |
| Search Phase 1? | Stub allowed (BR-PORT-04) |

---

## 13. Traceability

| Requirement | Journey | AC-ID |
|-------------|---------|-------|
| U53 mockup shell | J-MOB-11..14 | AC-PORT-11..14 |
| U48 task-first | J-MOB-15 (+ 06..09) | AC-PORT-15, AC-MOB-HUB-* |
| U49 visual | J-MOB-15 | AC-VIS-01..04 |
| UC-HRM-MOB-03 | J-MOB-15 | Dashboard evolution |
| UC-HRM-MOB-09 | J-MOB-14 | Payslip feed |
| UC-HRM-MOB-13 | J-MOB-11 | Bell → inbox |

**Related:** `MOBILE_HOME_HUB_AC_DELTA.md` · `MOBILE_HOME_HUB_UX_RESEARCH.md` · `MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` §11 · `MOBILE_HRM_ESS_UX_BENCHMARK.md` (U54 — **U53 = subset SET A portal only**) · `DashboardScreen.tsx` · `home.controller.ts`

---

**completion_report:** Đóng PCOMP-W8-MOB-HOME-PORTAL-BA-01 — delta AC J-MOB-11..15, gap table G-PORT-01..10, icon→route map 8 mục, API/widget matrix, reconcile U48 Smart Hub + U49 visual + 4-tab; renumber W7 J-MOB-11..13 → J-MOB-16..18.  
**next_owner:** pm → dev-mobile (in-flight `PCOMP-W8-MOB-HOME-PORTAL-01`) → qa  
**next_dispatch_prompt:** PM dispatch QA `PCOMP-W8-MOB-HOME-PORTAL-QA-01`: đọc `docs/program/MOBILE_HOME_PORTAL_AC_DELTA.md`; chạy L0 `pnpm run qc:dev-stack`; retest device `uat.nv0001@xe.vn` — J-MOB-11 header xanh+search+bell, J-MOB-12 carousel+dots, J-MOB-13 grid 8 icon, J-MOB-14 payslip feed CTA→detail, J-MOB-15 composite + regression J-MOB-06..09; evidence `docs/qa/evidence/pcomp-w8-mob-portal-jmob11-20260608.md` (merge 11–15); cập nhật `PROGRAM_JOURNEY_MAP.md` rows J-MOB-11..15.  
**evidence_path:** `docs/program/MOBILE_HOME_PORTAL_AC_DELTA.md`  
**ack_status:** `PASS_TO_PM`
