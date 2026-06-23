# Mobile ESS — Apple HIG Program + Persona Lanes (MOB-UX-13)

**work_item_id:** `MOB-UX-13-PROGRAM`  
**trigger:** Sponsor 2026-06-08 — màn phụ vẫn đơn điệu; Home quá tải + tiếng Anh; Chấm công hiện UUID + «GPS/geofence»; tab bar đè Android 3 nút; spacing sát (Nghỉ phép, Phê duyệt); chưa phân biệt NV / QL / lãnh đạo; thiếu văn hóa + hành trình; thiếu vuốt.

**SoT thiết kế:** `MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` — **Apple HIG là chuẩn số 1** (SF scale, grouped inset lists, large titles, thumb zone, Dynamic Type path).

---

## 1. Sponsor pain → work item map

| Ảnh / triệu chứng | Root cause code | Wave |
|-------------------|-----------------|------|
| Chấm công: UUID + «Bật GPS/geofence» | `CheckInScreen` dev form, manual lat/lng | **13a** |
| Nghỉ phép: card + tab sát, nhiều trống | `LeaveRequestsListScreen` spacing chưa DS §3 | **13d** |
| Phê duyệt: header + chip sát, FAB che | `ManagerApprovalsScreen` + tab/FAB inset | **13b+d** |
| Home: English + quá nhiều block | `DashboardScreen` feed + raw keys | **13c** |
| Tab đè Android 3-button | `insets.bottom` = 0 trên một số OEM | **13b** |
| Không khác NV vs QL vs lãnh đạo | Chỉ `auth.isManager` boolean | **13e** + BA persona |
| Thiếu sinh động / văn hóa / hành trình | Chưa port web modules | **13f** + **13g** |

---

## 2. Apple HIG bắt buộc (100% target)

| HIG principle | XeVN rule |
|---------------|-----------|
| **Typography** | Body **17pt**, footnote **13pt**, tab label **10pt**; **không** 16px default RN |
| **Grouped lists** | `UITableView` style: `#F2F2F7` bg, white inset sections, **12pt** section gap, **8pt** inner row gap |
| **Large Title** | Stack `headerLargeTitle` — subtitle **một dòng** dưới title, không lặp title 2 lần |
| **Touch targets** | Min **44×44** pt; chip/tab không < 44 height |
| **Safe areas** | Tab bar = 49 + **navigation bar inset** Android (`SafeAreaProvider` + `initialWindowMetrics` + fallback 24dp) |
| **Motion** | Swipe back native; list **swipe actions** (iOS pattern) trên đơn chờ duyệt |
| **Localization** | **100% tiếng Việt UI** — `resolveRoleSubtitle`, `mapEmploymentStatusVi`, catalog label từ HRM seed |
| **Data** | Hiển thị `full_name` + `employee_code` từ JWT/session — **không** UUID text field |

**Vị trí smartphone (không GPS/geofence):** Dùng `expo-location` `getCurrentPositionAsync` — copy UI «Vị trí thiết bị» / «Đang lấy vị trí…»; gửi `latitude`/`longitude` kèm check-in; **không** toggle manual lat/lng; **không** từ «geofence».

---

## 3. Persona lanes (nghiệp vụ)

| Persona | JWT / seed signal | Home hub khác biệt | Tab / FAB |
|---------|-------------------|--------------------|-----------|
| **Nhân viên** | default `uat.nv####` | ESS: chấm công, nghỉ, phiếu lương, **hành trình** | FAB: chấm công + đơn |
| **Quản lý** | `isManager` + `manager_employee_id` | **Inbox duyệt** hero + team snapshot; ẩn UUID forms | Tab Hồ sơ badge; FAB ưu tiên duyệt |
| **Lãnh đạo** | `job_title_key` ∈ {CEO, DIRECTOR, …} hoặc scope rollup `main` | **Pulse tập đoàn**: headcount, chấm công %, đơn chờ rollup | Tab Đội nhóm → directory rollup; không form chấm công tay |

BA deliverable: `docs/program/MOBILE_PERSONA_UX_MATRIX.md` (trace → `HRM_MENU_DATA_LINKAGE_MATRIX.md`).

---

## 4. Web → Mobile feature port (Phase 13)

| Web route / module | Mobile target | Priority |
|--------------------|---------------|----------|
| `/attendance` history + calendar | `AttendanceHistoryScreen` + heatmap tab | P0 (13a) |
| `/performance` cycles | Home widget «Đánh giá kỳ» (read-only) | P1 (13g) |
| `/reports` summary | Leader home «Báo cáo nhanh» | P1 (13e) |
| Operations tasks / services | Đã có — polish + manager lane | P0 (13d done) |
| Internal culture (birthdays, tenure) | `HomeCelebrationRow` expand + «Hành trình» timeline | P1 (13g) |
| Recruitment pipeline | Manager-only «Tuyển dụng» tile | P2 backlog |

---

## 5. Wave breakdown

| ID | Owner | Scope |
|----|-------|-------|
| **MOB-UX-13a** | dev-mobile | CheckIn Apple hero: tên+ mã NV, auto location, lịch sử link; bỏ UUID field + GPS toggle |
| **MOB-UX-13b** | dev-mobile | Android `navigationBar` inset; tab bar + FAB + `StickyFooter` không che 3-button |
| **MOB-UX-13c** | dev-mobile | Home: giảm feed blocks; **action grid 3×4**; 100% Việt; data từ `dashboardEss` |
| **MOB-UX-13d** | dev-mobile | Leave + Approvals: grouped inset, section spacing 12/16, empty state không sát header |
| **MOB-UX-13e** | dev-mobile | `resolveMobilePersona()` → 3 home layouts |
| **MOB-UX-13f** | dev-mobile | `react-native-gesture-handler` swipe actions on approval/leave rows |
| **MOB-UX-13g** | dev-mobile | Journey timeline card + culture strip on home |
| **MOB-UX-13-BA** | ba-process | Persona matrix + web port AC |
| **MOB-UX-13-QA** | qa-device | J-MOB regression + persona probes + Android 3-button device matrix |

**npm thêm:** `expo-location` (13a); đã có `react-native-gesture-handler`.

---

## 6. Acceptance (sponsor screenshot class)

- Chấm công: **không** UUID input; **không** «GPS»/«geofence»; có tên NV từ DB
- Nghỉ phép / Phê duyệt: section gap ≥ 12pt; tab bar không đè system nav
- Home: ≤ 2 scroll sections trước action grid; **≥ 9** menu tiles; không English raw keys
- 3 persona: screenshot pack khác nhau trên `uat.nv0001` / manager account / `ceo@xe.vn` mobile slice

**NOT Phase 1 DONE** until MOB-UX-13-QA + QC GO.
