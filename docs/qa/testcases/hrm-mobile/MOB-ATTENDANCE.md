# Menu TC Pack — `MOB-ATTENDANCE` · Mobile chấm công · lịch sử · đơn công / đi muộn

| Meta | Value |
|------|--------|
| **menu_id** | `MOB-ATTENDANCE` |
| **surface** | `hrm-mobile` |
| **route(s)** | Att stack: `CheckIn` · `AttendanceHistory` · Profile stack: `CreateUpdateRequest` · `UpdateRequests` · `UpdateRequestDetail` · FAB sheet · Home `AttendanceStatsRow` |
| **HDSD** | Mobile ESS Ch08–10 · `docs/hrm/MOBILE_W7_SRS_DELTA.md` §4.1 · `docs/program/MOBILE_PERSONA_UX_MATRIX.md` · AT-01 nav `r-spine-at-nav-01` |
| **SRS / FR / UC** | FR-UC-M04 · UC-HRM-MOB-04 (check-in) · UC-HRM-MOB-06b (update-request) · **J-MOB-02** |
| **TechSpec** | `docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md` · `MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` §3–4 |
| **API_CONTRACT** | `POST/GET /api/hrm/attendance/records` · `POST/GET /api/hrm/attendance/update-requests` · `POST …/{id}/approve` · `POST …/{id}/reject` |
| **UF / J-*** | **J-MOB-02** (Check-in GPS) · **AT-01..04** (catalog) · *Leave FAB / wizard → **`MOB-LEAVE-APPR.md`* |
| **Cross-pack** | **`MOB-LEAVE-APPR.md`** — `create_leave` FAB · `CreateLeaveRequest` wizard · filter **Nghỉ phép** on `ManagerApprovals` (**không** lặp TC nghỉ ở pack này) |
| **author** | qa · PO-ECO-TC-MOB-ATTENDANCE-01 |
| **work_item_id** | `PO-ECO-TC-MOB-ATTENDANCE-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |
| **Persona lock** | ESS **`uat.nv0003@xe.vn`** / `xevn-uat-2026` · QL duyệt đơn công **`uat.nv0001@xe.vn`** · Leader persona: **không** FAB Chấm công |
| **Locks** | U65 zero-seed · U76 HDSD · U78 test-log when executed · **cấm** UAT DONE |

> Chuẩn: IEEE 829 / ISO 29119 lean — TC quan sát được trên device; precond «data từ FE» (check-in / tạo đơn công trước duyệt); không seed workflow.

---

## 0. Spec read ack (inventory source)

| Source | Path | Sections used |
|--------|------|----------------|
| Att stack | `navigation/RootNavigator.tsx` · `types.ts` `AttendanceStackParamList` | CheckIn · AttendanceHistory · TeamDirectory (OOS team) |
| Check-in | `features/attendance/CheckInScreen.tsx` | hero · location · sticky CTA · POST records |
| History | `features/attendance/AttendanceHistoryScreen.tsx` | calendar · day filter · timeline badges |
| FAB | `navigation/fabPrimaryActions.ts` · `FabPrimaryActionSheet.tsx` · `checkInFab.ts` | check_in · create_update_request · hide on CheckIn |
| Create đơn công | `features/attendance/CreateUpdateRequestScreen.tsx` | POST update-requests |
| List/detail đơn | `UpdateRequestsScreen.tsx` · `UpdateRequestDetailScreen.tsx` | chips · list→detail |
| Home late | `components/home/AttendanceStatsRow.tsx` · `DashboardScreen.tsx` | `attendance-stat-late` → CreateUpdateRequest |
| Settings entry | `features/settings/SettingsScreen.tsx` | `settings-create-update-request` |
| MGR approve CC | `ManagerApprovalsScreen.tsx` | filter **Chỉnh sửa CC** · `ManagerAttendanceCard` |
| Labels | `utils/attendanceUpdateTypes.ts` · `attendanceTimelineBadge.ts` | U72 · đi muộn pill |
| Check-in body | `utils/checkInLocation.ts` | POST body · coords optional |
| Catalog | `docs/qa/PO_SPEC_TEST_CASE_CATALOG.md` §4 | TC-AT-01..08 |
| Journey | `docs/program/PROGRAM_JOURNEY_MAP.md` | J-MOB-02 |
| Leave pack | `docs/qa/testcases/hrm-mobile/MOB-LEAVE-APPR.md` | FAB leave · MGR leave tab only |

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| SCR-FAB-SHEET | sheet (modal) | FAB `check-in-fab` | «Thao tác nhanh» — rows persona | open / dismiss |
| SCR-CHECKIN | page | `TabAttendance` → `CheckIn` | Chấm công vào · hero NV · vị trí thiết bị | loading profile · scope warn · ready |
| SCR-HIST | page | `AttendanceHistory` | Lịch tháng + chi tiết ngày | shimmer · error banner · empty day · list |
| SCR-HOME-STATS | inline | Home dashboard | 3 ô Đi làm / **Đi muộn** / Vắng | loading · counts |
| SCR-SETTINGS-UPD | row | Settings → Đơn công | Shortcut tạo đơn | signed in |
| SCR-CREATE-UPD | page | Profile → `CreateUpdateRequest` | Form đơn công / đi muộn | busy submit |
| SCR-UPD-LIST | page | Profile → `UpdateRequests` | Danh sách đơn công của tôi | shimmer · chips · empty · error |
| SCR-UPD-DET | page | `UpdateRequestDetail` `{id}` | Chi tiết đơn | loading · error · empty · content |
| SCR-MGR-ATT | section | `ManagerApprovals` filter **Chỉnh sửa CC** | Cards duyệt đơn công (*leave tab → MOB-LEAVE-APPR*) | empty · cards · modals |
| POP-ALERT-SUCCESS | alert | Sau POST check-in / đơn công | Native Alert | OK |
| POP-ALERT-OFFLINE | alert | Offline mutate | Block hoặc queue check-in | |
| POP-MGR-CONFIRM | modal | Duyệt/Từ chối đơn CC | `ConfirmActionModal` (*shared screen*) | confirm/cancel |
| CAL-MONTH | component | SCR-HIST header | `AttendanceMonthCalendar` | month nav · marked days |

**Đếm:** pages=6 · tabs=0 · sheets=1 · dialogs/alerts=3 · calendar=1 · mgr section=1

**OOS this pack:** `TeamDirectory` / `TeamColleagueDetail` (cùng Att tab — pack MOB-TEAM future) · full `ManagerApprovals` leave UX → **MOB-LEAVE-APPR**.

---

## 2. Field dictionary (đủ mọi trường)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API / DB | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|----------|--------|-------|
| F-CHK-SUBTITLE | Hôm nay · ngày | SCR-CHECKIN | read-only | — | | `attendance_date` | dd/MM/yyyy | AppScreenLayout subtitle |
| F-CHK-HERO-NAME | Họ tên | SCR-CHECKIN | hero | Y | hydrate GET employees | `full_name` | | `CheckInHeroCard` |
| F-CHK-HERO-CODE | Mã NV | SCR-CHECKIN | hero | Y | membership fallback | `employee_code` | | |
| F-CHK-AVATAR | Ảnh đại diện | SCR-CHECKIN | image | N | | `avatar_url` | | |
| F-CHK-LOC-LABEL | Vị trí thiết bị | SCR-CHECKIN | text | N | BR-ATT-01 optional coords | — | VI copy | testID `check-in-location-label` |
| F-CHK-LOC-COORDS | Tọa độ | SCR-CHECKIN | text | N | when ready | `latitude`/`longitude` | 5 decimals | testID `check-in-location-coords` |
| F-CHK-SCOPE-WARN | Phạm vi công ty | SCR-CHECKIN | banner | N | !cid | — | | vào Cài đặt |
| F-CHK-CTA-IN | Chấm công vào | SCR-CHECKIN | button | Y | scope+employee | POST body | | testID `check-in-submit` |
| F-CHK-CTA-HIST | Lịch sử chấm công | SCR-CHECKIN | ghost btn | N | | nav | | testID `check-in-history` |
| F-HIST-MONTH | Lịch tháng | SCR-HIST | calendar | Y | GET by month bounds | `from_date`/`to_date` | yyyy-MM | month change reload |
| F-HIST-DAY-HINT | Chọn ngày… | SCR-HIST | hint | N | | | | |
| F-HIST-DAY-TITLE | Chi tiết ngày | SCR-HIST | header | N | filter | | dd/MM/yyyy | testID `attendance-day-detail` |
| F-HIST-ROW-DATE | Ngày công (row) | SCR-HIST | list | — | | `attendance_date` | dd/MM/yyyy | |
| F-HIST-ROW-IN | Giờ vào | SCR-HIST | subtitle | N | | `check_in_at` | dd/MM/yyyy HH:mm | |
| F-HIST-ROW-BADGE | Trạng thái pill | SCR-HIST | badge | — | late/present/absent | `status` | VI label | testID `attendance-timeline-badge` |
| F-HOME-PRESENT | Đi làm | SCR-HOME-STATS | stat | N | dashboard aggregate | — | number | |
| F-HOME-LATE | Đi muộn | SCR-HOME-STATS | stat pressable | N | AT-01 hub | nav create | | testID `attendance-stat-late` |
| F-HOME-ABSENT | Vắng | SCR-HOME-STATS | stat | N | | — | number | |
| F-FAB-CHECKIN | Chấm công | SCR-FAB-SHEET | row | N* | *hidden leader | nav CheckIn | | testID `fab-action-check-in` |
| F-FAB-UPD | Tạo đơn công | SCR-FAB-SHEET | row | Y | subtitle đi muộn/điều chỉnh | nav CreateUpdateRequest | | testID `fab-action-create-update-request` |
| F-FAB-LEAVE | Tạo đơn nghỉ | SCR-FAB-SHEET | row | — | **xref MOB-LEAVE-APPR** | | | testID `fab-action-create-leave` |
| F-UPD-CODE | Mã nhân viên | SCR-CREATE-UPD | text | Y | meta hydrate | `employee_code` | | |
| F-UPD-NAME | Họ tên | SCR-CREATE-UPD | text | Y | | `employee_name` | | |
| F-UPD-DEPT | Phòng ban (tuỳ chọn) | SCR-CREATE-UPD | text | N | | `department` | | |
| F-UPD-TYPE | Loại điều chỉnh | SCR-CREATE-UPD | text | Y | default `adjust_check_in` | `update_type` | wire or VI | free text field pilot |
| F-UPD-REASON | Lý do | SCR-CREATE-UPD | multiline | Y | non-empty trim | `reason` | | |
| F-UPD-DATE | Ngày công (body) | SCR-CREATE-UPD | hidden | Y | today ISO | `attendance_date` | yyyy-MM-dd | auto on submit |
| F-UPD-LIST-FILTER | Tất cả / trạng thái | SCR-UPD-LIST | chips | Y | pending default | `status=` query | VI `statusLabel` | |
| F-UPD-LIST-TITLE | Row title | SCR-UPD-LIST | list | — | U72 type label | `update_type` | VI | not raw snake |
| F-UPD-LIST-SUB | Ngày công row | SCR-UPD-LIST | list | — | | `attendance_date` | dd/MM/yyyy | |
| F-UPD-LIST-STATUS | Badge trạng thái | SCR-UPD-LIST | badge | — | | `status` | | |
| F-DET-STATUS | Trạng thái | SCR-UPD-DET | badge | — | U72 | `status` | VI | |
| F-DET-EMP | Nhân viên | SCR-UPD-DET | row | — | | `employee_name` | | |
| F-DET-DATE | Ngày công | SCR-UPD-DET | row | — | | `attendance_date` | dd/MM/yyyy | |
| F-DET-REASON | Lý do | SCR-UPD-DET | row | — | sanitize seed | `reason` | | |
| F-DET-APPROVER | Người duyệt | SCR-UPD-DET | row | N | if approved | `approver_name` | | |
| F-DET-REJECT | Lý do từ chối | SCR-UPD-DET | row | N | if rejected | `rejected_reason` | | |
| F-MGR-ATT-FILTER | Chỉnh sửa CC | SCR-MGR-ATT | chip | mgr | | GET update-requests pending | | |
| F-MGR-ATT-CARD | Card NV + loại | SCR-MGR-ATT | card | — | | `update_type` | VI | `ManagerAttendanceCard` |

**Đếm fields:** **38**

---

## 3. Function inventory (đủ mọi function)

| fn_id | UI (nút/menu) | screen_id | precond | API | success FE + reopen | fail / edge | HDSD |
|-------|---------------|-----------|---------|-----|---------------------|-------------|------|
| FN-FAB-OPEN | FAB «Thao tác nhanh» | global | logged in | — | sheet `fab-primary-action-sheet` | hidden on CheckIn | Home |
| FN-FAB-GO-CHECKIN | Chấm công (sheet) | SCR-FAB-SHEET | persona ≠ leader | — | → CheckIn · FAB hidden | leader AU | J-MOB-02 entry |
| FN-FAB-GO-UPD | Tạo đơn công | SCR-FAB-SHEET | scope | — | → CreateUpdateRequest | | AT-01 |
| FN-FAB-GO-LEAVE | Tạo đơn nghỉ | SCR-FAB-SHEET | | — | → CreateLeaveRequest | **xref MOB-LEAVE-APPR** | |
| FN-HOME-LATE | Tap «Đi muộn» | SCR-HOME-STATS | handler wired | — | → CreateUpdateRequest | stat-only if no handler | AT-01 hub |
| FN-HOME-CHECKIN | Hub tile check-in | Home | | — | → CheckIn | | J-MOB-02 |
| FN-SETTINGS-UPD | Settings «Đơn công» | SCR-SETTINGS-UPD | | — | → CreateUpdateRequest | | AT-01 |
| FN-CHK-LOAD | Focus load profile+GPS | SCR-CHECKIN | | GET employees | hero filled | missing eid alert | |
| FN-CHK-SUBMIT | Chấm công vào | SCR-CHECKIN | cid+eid · online | POST `/attendance/records` **2xx** | Alert success · history shows row | 4xx formatHrmError | J-MOB-02 |
| FN-CHK-OFFLINE-Q | Chấm công offline | SCR-CHECKIN | offline | queue POST | Alert «Đã xếp hàng» | no silent drop | |
| FN-CHK-GO-HIST | Lịch sử chấm công | SCR-CHECKIN | | GET records | → AttendanceHistory | | |
| FN-HIST-LOAD | Load tháng | SCR-HIST | cid+eid | GET records query | calendar marks | scope banner | |
| FN-HIST-MONTH | Đổi tháng | SCR-HIST | | GET reload | marks update | | |
| FN-HIST-DAY | Chọn ngày lịch | SCR-HIST | | filter local | day detail + rows | empty day copy | |
| FN-HIST-REFRESH | Kéo làm mới | SCR-HIST | | GET | rows refresh | error banner | |
| FN-UPD-CREATE-SUBMIT | Gửi đơn | SCR-CREATE-UPD | online · meta | POST update-requests **201** | Alert success · list pending | offline block · 4xx | TC-AT-01 |
| FN-UPD-LIST-LOAD | Load list | SCR-UPD-LIST | cid | GET update-requests | rows | error | |
| FN-UPD-LIST-FILTER | Chip trạng thái | SCR-UPD-LIST | | GET filtered | rows match | empty OK | |
| FN-UPD-LIST-OPEN | Tap row | SCR-UPD-LIST | | GET list contains id | → Detail | not found err | list→detail |
| FN-UPD-LIST-EMPTY-CTA | + Tạo đơn (empty) | SCR-UPD-LIST | no rows | — | → Create | testID `update-requests-empty-create` | |
| FN-UPD-DET-LOAD | Load detail | SCR-UPD-DET | cid | GET list find id | fields match | «Không tìm thấy» | |
| FN-MGR-ATT-APPROVE | Duyệt đơn CC | SCR-MGR-ATT | mgr · pending | POST `…/approve` **203** | card gone · NV detail approved | 4xx | TC-AT-02 |
| FN-MGR-ATT-REJECT | Từ chối đơn CC | SCR-MGR-ATT | mgr | POST `…/reject` | card gone · reason on detail | | |
| FN-PROF-CHECKIN | Profile shortcut | Profile | | — | → CheckIn | | |

**Đếm functions:** **24** (mutate: **5** — check-in submit, offline queue, create update, mgr approve, mgr reject)

---

## 4. Test case matrix

### Quy ước

- **TC-ID:** `TC-MOB-ATT-<area>-<nnn>` · Type: `HP` · `FD` · `BD` · `AU` · `UX` · `NAV`
- **Layer:** DEVICE · API (proxy) when noted
- **Status:** `PLANNED` (design pack — chưa device run wave này)
- **Precond U65:** Check-in / tạo đơn công từ UI mobile trước bước duyệt QL — **cấm** seed inbox

### 4.1 FAB · entry · cross-nav (late / adjust)

| TC-ID | Type | Covers | Persona | Precond | Steps (HDSD) | Expected | Automate | Status |
|-------|------|--------|---------|---------|--------------|----------|----------|--------|
| TC-MOB-ATT-NAV-001 | NAV | FN-FAB-OPEN · FN-FAB-GO-CHECKIN | uat.nv0003 | Login · scope UUID | Home → FAB → «Chấm công» | `CheckIn` · title Chấm công · FAB **ẩn** on screen | DEVICE | PLANNED |
| TC-MOB-ATT-NAV-002 | NAV | FN-FAB-GO-UPD · AT-01 | uat.nv0003 | | FAB → «Tạo đơn công» | `CreateUpdateRequest` title «Đơn công» | DEVICE | PLANNED |
| TC-MOB-ATT-NAV-003 | NAV | FN-HOME-LATE | uat.nv0003 | | Home → tap ô **Đi muộn** | → CreateUpdateRequest (same as NAV-002) | DEVICE | PLANNED |
| TC-MOB-ATT-NAV-004 | NAV | FN-SETTINGS-UPD | uat.nv0003 | | Cài đặt → «Đơn công» (`settings-create-update-request`) | → CreateUpdateRequest | DEVICE | PLANNED |
| TC-MOB-ATT-NAV-005 | NAV | FN-UPD-LIST-EMPTY-CTA | uat.nv0003 | list empty pending | Profile path → Đơn công → empty CTA | → Create | DEVICE | PLANNED |
| TC-MOB-ATT-NAV-006 | NAV | FN-FAB-GO-LEAVE xref | uat.nv0003 | | FAB «Tạo đơn nghỉ» | Lands CreateLeaveRequest — **execute TC trong MOB-LEAVE-APPR §4.1** | DEVICE | **XREF** |
| TC-MOB-ATT-AU-001 | AU | FN-FAB-GO-CHECKIN hidden | leader persona | LDR login | Open FAB sheet | **Không** có row «Chấm công» · vẫn có «Tạo đơn công» | DEVICE | PLANNED |

### 4.2 CheckIn · J-MOB-02

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-ATT-CHK-HP-001 | HP | FN-CHK-SUBMIT · J-MOB-02 | uat.nv0003 | cid+eid · GPS prompt allow/deny OK | CheckIn → «Chấm công vào» | POST records **2xx** · Alert Thành công · **không** raw code English-only | DEVICE+API | PLANNED |
| TC-MOB-ATT-CHK-HP-002 | HP | FN-CHK-GO-HIST chain | uat.nv0003 | after HP-001 | «Lịch sử chấm công» → chọn **hôm nay** | Row có giờ vào dd/MM/yyyy HH:mm · badge hợp lệ (Đúng giờ/Đi muộn) | DEVICE | PLANNED |
| TC-MOB-ATT-CHK-UX-001 | UX | F-CHK-LOC-* | uat.nv0003 | | Observe «Vị trí thiết bị» | Copy VI · **không** chữ GPS/geofence · coords khi ready | DEVICE | PLANNED |
| TC-MOB-ATT-CHK-UX-002 | UX | sticky footer | uat.nv0003 | | Scroll + submit | `check-in-sticky-footer` không bị che home indicator | DEVICE | PLANNED |
| TC-MOB-ATT-CHK-FD-001 | FD | scope missing | uat.nv0003 | scope cleared | Open CheckIn | Banner phạm vi · submit Alert «Thiếu phạm vi» · **no POST** | DEVICE | PLANNED |
| TC-MOB-ATT-CHK-FD-002 | FD | FN-CHK-OFFLINE-Q | uat.nv0003 | airplane mode | Submit check-in | Alert «Đã xếp hàng» · **no** fake 2xx online | DEVICE | PLANNED |
| TC-MOB-ATT-CHK-FD-003 | FD | duplicate / API 4xx | uat.nv0003 | already checked in today if BR | Second submit same day | Alert lỗi VI · list không duplicate bất thường | DEVICE | PLANNED |

### 4.3 AttendanceHistory

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-ATT-HIST-HP-001 | HP | FN-HIST-LOAD · DAY | uat.nv0003 | ≥1 record tháng hiện tại | Open history · tap day có mark | «Chi tiết ngày dd/MM/yyyy» · ≥1 row | DEVICE | PLANNED |
| TC-MOB-ATT-HIST-HP-002 | HP | FN-HIST-MONTH | uat.nv0003 | records prior month | Prev month on calendar | GET query `from_date`/`to_date` đúng tháng · marks refresh | DEVICE+API | PLANNED |
| TC-MOB-ATT-HIST-UX-001 | UX | F-HIST-ROW-BADGE | uat.nv0003 | late row if any | Observe pill | Label **Đi muộn** / **Đúng giờ** — not raw `late`/`present` | DEVICE | PLANNED |
| TC-MOB-ATT-HIST-UX-002 | UX | empty day | uat.nv0003 | day without records | Select empty day | «Không có bản ghi cho ngày đã chọn» | DEVICE | PLANNED |
| TC-MOB-ATT-HIST-FD-001 | FD | scope error | uat.nv0003 | invalid cid sim | Open history | Error banner VI · shimmer không vô hạn | DEVICE | PLANNED |
| TC-MOB-ATT-HIST-FD-002 | FD | epoch guard | uat.nv0003 | | Any row check_in | **Không** 01/01/1970 junk | DEVICE | PLANNED |

### 4.4 CreateUpdateRequest (đi muộn / điều chỉnh)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-ATT-UPD-CR-HP-001 | HP | FN-UPD-CREATE-SUBMIT · TC-AT-01 | uat.nv0003 | meta NV loaded | Sửa lý do «Xin đi muộn sáng nay» · «Gửi đơn» | POST **201** `HRM-ATT-REQ-201` · Alert success · list **Đang xét** có row | DEVICE+API | PLANNED |
| TC-MOB-ATT-UPD-CR-HP-002 | HP | F-UPD-TYPE late path | uat.nv0003 | | Set loại `forgot_check_in` or pilot late copy · submit | Row title label VI (Giờ vào / —) not snake | DEVICE | PLANNED |
| TC-MOB-ATT-UPD-CR-FD-001 | FD | offline | uat.nv0003 | airplane | Gửi đơn | Alert offline · **no POST** | DEVICE | PLANNED |
| TC-MOB-ATT-UPD-CR-FD-002 | FD | missing meta | uat.nv0003 | employee meta empty sim | Gửi đơn | Alert MISSING_EMPLOYEE_META · no POST | DEVICE | PLANNED |
| TC-MOB-ATT-UPD-CR-FD-003 | FD | TC-AT-03 validation | uat.nv0003 | | Clear lý do → submit | **4xx** or FE block · no orphan row | DEVICE+API | PLANNED |

### 4.5 UpdateRequests list → detail

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-ATT-UPD-LST-HP-001 | HP | FN-UPD-LIST-OPEN | uat.nv0003 | after CR-HP-001 | Tab pending → tap row | → Detail · status badge VI | DEVICE | PLANNED |
| TC-MOB-ATT-UPD-LST-HP-002 | HP | list→detail→back | uat.nv0003 | | Open detail · back · reopen | Same id · no 404 scope | DEVICE | PLANNED |
| TC-MOB-ATT-UPD-LST-UX-001 | UX | FN-UPD-LIST-FILTER | uat.nv0003 | mixed status rows | Chips Tất cả / Đã duyệt / Từ chối | Rows match filter | DEVICE | PLANNED |
| TC-MOB-ATT-UPD-LST-FD-001 | FD | bad id | uat.nv0003 | deep link invalid | Open UpdateRequestDetail | «Không tìm thấy đơn công» | DEVICE | PLANNED |
| TC-MOB-ATT-UPD-DET-HP-001 | HP | F-DET-* | uat.nv0003 | pending | Detail fields | Reason sanitized · dates dd/MM/yyyy | DEVICE | PLANNED |

### 4.6 Manager approve đơn công (Chỉnh sửa CC only)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-ATT-MGR-HP-001 | HP | FN-MGR-ATT-APPROVE · TC-AT-02 | uat.nv0001 | pending update from **0003** · U65 chain | ManagerApprovals → filter **Chỉnh sửa CC** → Duyệt → confirm | POST approve **203** · **0003** detail **Đã duyệt** · F5/kill reopen | DEVICE+API | PLANNED |
| TC-MOB-ATT-MGR-HP-002 | HP | FN-MGR-ATT-REJECT | uat.nv0001 | second pending | Từ chối + lý do | POST reject · **0003** tab Từ chối | DEVICE+API | PLANNED |
| TC-MOB-ATT-MGR-UX-001 | UX | filter isolation | uat.nv0001 | leave+att pending | Chip **Nghỉ phép** | Leave cards — **TC execute MOB-LEAVE-APPR §4.6** · chip CC không lẫn leave | DEVICE | **XREF** |
| TC-MOB-ATT-MGR-FD-001 | FD | offline approve | uat.nv0001 | pending att | airplane → Duyệt | Alert block · no POST | DEVICE | PLANNED |
| TC-MOB-ATT-MGR-AU-001 | AU | not self-approve | uat.nv0003 | NV tries own att | **0003** open ManagerApprovals if visible | Không duyệt đơn của chính mình · 4xx if forced API | DEVICE | PLANNED |

### 4.7 Catalog map · regression

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-ATT-X-001 | HP | TC-AT-01 map | uat.nv0003 | | Same UPD-CR-HP-001 | Catalog **TC-AT-01** MOBILE submit | DEVICE | PLANNED |
| TC-MOB-ATT-X-002 | HP | TC-AT-02 map | uat.nv0001 | | Same MGR-HP-001 | Catalog **TC-AT-02** approve | DEVICE | PLANNED |
| TC-MOB-ATT-X-003 | FD | TC-AT-03 map | uat.nv0003 | | Same UPD-CR-FD-003 | Catalog **TC-AT-03** validation | DEVICE | PLANNED |
| TC-MOB-ATT-X-004 | HP | TC-AT-04 · J-HRM-06 mirror | uat.nv0003 | after MGR approve | History month contains adjusted day | Record reflects approved change · no epoch | DEVICE | PLANNED |
| TC-MOB-ATT-X-005 | HP | TC-AT-06 J-MOB-02 regress | uat.nv0003 | | FAB check-in smoke after leave wave | J-MOB-02 not broken | DEVICE | PLANNED |
| TC-MOB-ATT-X-006 | UX | TC-AT-05 geofence | uat.nv0003 | contract OOS mobile UI | Document MANUAL/API | **PLANNED** contract 422 out-of-range — **no fake GPS seed** | MANUAL | PLANNED |

### Coverage check

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions ≥1 HP | 24 | 24 | 0 |
| Mutate fn ≥1 FD | 5 | 5 | 0 |
| Required fields FD/BD | 4 (code, name, reason, scope) | 4 | 0 |
| Sheet open + row navigate | 1 | NAV-001..002 | 0 |
| J-MOB-02 explicit | 1 | CHK-HP-001 + X-005 | 0 |
| AT-01 nav + submit | 1 | NAV-002 + UPD-CR-HP-001 | 0 |
| Leave FAB duplicate | 0 in this pack | XREF NAV-006 | 0 |

**TC count:** **36** PLANNED + **2** XREF (leave-only) + **1** MANUAL contract (AT-05)

---

## 5. Traceability

| TC-ID | SRS / UC | TechSpec | API | Catalog | HDSD |
|-------|----------|----------|-----|---------|------|
| TC-MOB-ATT-CHK-HP-001 | UC-HRM-MOB-04 · J-MOB-02 | MOBILE_W7 §4.1 | POST records | TC-AT-06 | Chấm công vào |
| TC-MOB-ATT-UPD-CR-HP-001 | AT-01 · UC-HRM-MOB-06b | update-requests | POST 201 | TC-AT-01 | Tạo đơn công / đi muộn |
| TC-MOB-ATT-MGR-HP-001 | AT-02 | ManagerApprovals | POST approve 203 | TC-AT-02 | QL duyệt CC |
| TC-MOB-ATT-HIST-HP-001 | ESS history | calendar | GET records | TC-AT-04 | Lịch sử |
| TC-MOB-ATT-NAV-002 | AT-01 nav GWC | FAB sheet | — | TC-AT-01 nav | FAB / hub |
| TC-MOB-ATT-NAV-006 | Leave create | — | — | — | **MOB-LEAVE-APPR** |
| TC-MOB-ATT-MGR-UX-001 | Leave approve | — | leave approve | TC-LV-02 | **MOB-LEAVE-APPR** |

---

## 6. Out of scope / stub

| Item | Reason | TC status |
|------|--------|-----------|
| Full leave wizard / balance / attach | Pack **MOB-LEAVE-APPR** | XREF only |
| ManagerApprovals **Nghỉ phép** tab | MOB-LEAVE-APPR §4.6 | XREF |
| `UpdateRequests` header «+ Tạo đơn nghỉ» | Leave entry — MOB-LEAVE-APPR | XREF note in FN inventory |
| Team directory colleague | MOB-TEAM future | OOS |
| Web UF-HRM-05 attendance sheet | TC-AT-08 web pack | OOS |
| Geofence 422 mobile UI | TC-AT-05 contract-only | MANUAL X-006 |
| UAT DONE / matrix 🟢 | Depth catalog only | N/A |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-mob-attendance-01.md
next_owner: qa-synth (rollup PO_SPEC_TEST_REPORT + roster pack_path)
counts: screens=14 fields=38 functions=24 tcs=39 (36 PLANNED + 2 XREF + 1 MANUAL)
catalog_map: TC-AT-01..04 · TC-AT-06 · J-MOB-02
cross_pack: MOB-LEAVE-APPR (create_leave · MGR leave tab only)
```

*PO-ECO-TC-MOB-ATTENDANCE-01 · WORLD-STANDARD depth pack · no UAT execution claim*
