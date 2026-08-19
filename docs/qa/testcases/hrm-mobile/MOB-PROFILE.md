# Menu TC Pack — `MOB-PROFILE` · Mobile Profile stack (Hồ sơ · Cài đặt · Phạm vi · Hợp đồng · Đơn công · Thông báo)

| Meta | Value |
|------|--------|
| **menu_id** | `MOB-PROFILE` (+ gộp roster `MOB-SETTINGS` · `MOB-SCOPE` · `MOB-CONTRACTS` · `MOB-NOTIFICATIONS` · list `UpdateRequests`) |
| **surface** | `hrm-mobile` |
| **route(s)** | Tab `TabProfile` · `ProfileStack`: `Profile` · `Settings` · `Scope` · `Contracts` · `UpdateRequests` · `Notifications` |
| **HDSD** | Mobile ESS Ch09–12 · `docs/hrm/MOBILE_W7_SRS_DELTA.md` §4.5 · `docs/program/MOBILE_PERSONA_UX_MATRIX.md` · HDSD §12.1 / §12.9 |
| **SRS / FR / UC** | UC-HRM-MOB-12 (ESS profile) · UC-HRM-MOB-02 (scope) · FR-UC-M01 · J-AVT-02 (avatar) · BR-ESS-01 |
| **TechSpec** | `MOBILE_W7_TECHSPEC_DELTA.md` · DynamicProfileForm · `profileStackNav.ts` · `membershipDisplay` |
| **API_CONTRACT** | `GET/PATCH /api/hrm/employees/{id}` · `GET settings-catalogs/employee-fields` · `PATCH custom_fields` · avatar upload · `GET /contracts-insurance/contracts` · `GET …/insurance/expiring` · `GET /attendance/update-requests` · `GET/PATCH /notifications/inbox` |
| **UF / J-*** | **J-MOB-17** (Profile tabs) · **J-MOB-12** (ESS device regression) · *Leave / FAB / wizard → **MOB-LEAVE-APPR*** · *FAB home → **MOB-HOME*** |
| **Catalog neo** | TC-MOB-032/006 (Settings→Scope) · AT-01 Settings entry · roster MOB-PROFILE |
| **author** | qa · `PO-ECO-TC-MOB-PROFILE-01` |
| **work_item_id** | `PO-ECO-TC-MOB-PROFILE-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |
| **Persona lock** | ESS **`uat.nv0003@xe.vn`** / `xevn-uat-2026` · QL **`uat.nv0001@xe.vn`** · **cấm** `ceo@xe.vn` làm L1 mobile leave duyệt |
| **Locks** | U65 zero-seed · U76 HDSD · U78 test-log when executed · **cấm** UAT DONE |

> Chuẩn: IEEE 829 / ISO 29119 lean — pack **thiết kế** TC; execution device = wave sau.  
> **Leave wizard / ManagerApprovals Duyệt:** **`MOB-LEAVE-APPR.md`** — chỉ **entry** từ Profile / Settings / UpdateRequests header / Notifications deep link.  
> **CreateUpdateRequest submit / UpdateRequestDetail:** **`MOB-ATTENDANCE.md`** — list + empty CTA + Settings shortcut **entry only**.

---

## 0. Spec read ack (inventory source)

| Source | Path | Sections used |
|--------|------|----------------|
| Profile stack | `apps/mobile/hrm-mobile/src/navigation/RootNavigator.tsx` · `ProfileStackNavigator` | 14 stack screens — **in-scope depth** 6 + cross-ref 8 |
| Nav helpers | `navigation/profileStackNav.ts` | Settings · Scope · Contracts · UpdateRequests · Notifications |
| Profile root | `features/profile/ProfileScreen.tsx` | 3 tabs · hero · ESS · HR patch · quick grid · documents |
| Dynamic form | `components/profile/DynamicProfileForm.tsx` | catalog fields · `profile-ess-save` |
| Settings | `features/settings/SettingsScreen.tsx` | scope summary · quick nav · biometric · logout |
| Scope | `features/auth/ScopeScreen.tsx` | membership · operating units |
| Contracts | `features/contracts/ContractsScreen.tsx` | contracts + insurance sections |
| Update list | `features/attendance/UpdateRequestsScreen.tsx` | chips · list→detail · header leave shortcuts |
| Notifications | `features/notifications/InAppNotificationsScreen.tsx` | inbox · mark read · deep nav |
| Quick actions | `utils/profileQuickActions.ts` | 4 tiles payslip/leave/checkin/approvals |
| QA harness | `utils/profileSettingsNav.ts` | `profile-settings-entry` · `settings-screen` · `settings-scope-link` · `scope-screen` |
| Journey | `docs/program/PROGRAM_JOURNEY_MAP.md` | J-MOB-17 · J-MOB-12 |
| Roster | `docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md` | MOB-PROFILE gộp SETTINGS/SCOPE/CONTRACTS/NOTIFICATIONS |
| Cross-pack | `MOB-HOME.md` · `MOB-LEAVE-APPR.md` · `MOB-ATTENDANCE.md` | FAB / wizard / đơn công submit không duplicate |

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| SCR-PROF-TAB | tab root | `TabProfile` → `Profile` | Hồ sơ ESS 3 segment | loading · content · missing employee |
| SCR-PROF-INFO | segment | tab **Thông tin** · `profile-tab-info` | Hero · settings row · ESS form · HR block | saving · upload avatar |
| SCR-PROF-WORK | segment | tab **Công việc** · `profile-tab-work` | Metrics · quick grid · task card · sections | empty work |
| SCR-PROF-DOC | segment | tab **Tài liệu** · `profile-tab-documents` | Payslip + contract teasers | empty docs |
| SCR-SETTINGS | page | `Settings` · `settings-screen` | Phạm vi · bảo mật · điều hướng nhanh | UAT override card (dev/QA login) |
| SCR-SCOPE | page | `Scope` · `scope-screen` | Chọn membership / OU filter | busy · units error |
| SCR-CONTRACTS | page | `Contracts` | Hợp đồng + BH sắp hết hạn | shimmer · error · empty · list |
| SCR-UPD-LIST | page | `UpdateRequests` | Danh sách đơn công (chips) | shimmer · empty · error · list |
| SCR-NOTIF | page | `Notifications` | Inbox in-app | shimmer · empty · error · list |
| ROW-PROF-SETTINGS | row | Profile → Cài đặt | `profile-settings-entry` | — |
| ROW-PROF-MGR | row | Profile → Phê duyệt | `ProfileManagerApprovalsEntry` | mgr only · badge |
| POP-ALERT-SAVE | alert | ESS / HR / scope persist | Native Alert «Đã lưu» | |
| POP-ALERT-ERR | alert | API fail avatar / ESS | formatHrmError VI | |
| POP-ALERT-LOGOUT | confirm implicit | Settings logout | signOut | |

**Stack cross-ref only (không matrix depth ở pack này):** `LeaveRequestsList` · `CreateLeaveRequest` · `LeaveRequestDetail` · `ManagerApprovals` · `CreateUpdateRequest` · `UpdateRequestDetail` · `Operations` · `Journey`.

**Đếm in-scope surfaces:** tab/segments=4 · pages=5 · rows=2 · alerts=3 → **14** ids (+ 8 cross-ref screens documented §6)

---

## 2. Field dictionary (display + controls)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API / source | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|--------------|--------|-------|
| F-PROF-TAB-INFO | Thông tin | SCR-PROF-TAB | segment | Y | J-MOB-17 | local | | `profile-tab-bar` |
| F-PROF-TAB-WORK | Công việc | SCR-PROF-TAB | segment | Y | | local | | |
| F-PROF-TAB-DOC | Tài liệu | SCR-PROF-TAB | segment | Y | | local | | |
| F-HERO-NAME | Họ tên | SCR-PROF-INFO | text | Y | not UUID title | `full_name` | plain VI | `profile-employee-hero` |
| F-HERO-SUB | Phòng · vai trò | SCR-PROF-INFO | text | N | sanitize | dept · job title | | |
| F-HERO-STATUS | Trạng thái lao động | SCR-PROF-INFO | badge | N | DNA active | `status` | label VI | |
| F-HERO-AVATAR | Ảnh đại diện | SCR-PROF-INFO | pressable | N | J-AVT-02 upload | PATCH avatar_url | image | pick/remove |
| F-SETTINGS-ROW | Cài đặt | ROW-PROF-SETTINGS | row | N | | nav Settings | | `profile-settings-entry` |
| F-MGR-ROW | Phê duyệt | ROW-PROF-MGR | row+badge | mgr | pending≥0 | snapshot count | integer | hidden emp |
| F-ESS-FORM | Trường catalog | SCR-PROF-INFO | dynamic | N* | allowlist self phone | `custom_fields` | vi-VN | `dynamic-profile-form` |
| F-ESS-SAVE | Lưu thông tin | SCR-PROF-INFO | button | N | dirty draft | PATCH custom_fields | | `profile-ess-save` ≥44px |
| F-HR-NAME | Họ tên (HR) | SCR-PROF-INFO | text | hr role | `canHrFullEmployeePatch` | PATCH employee | | `profile-hr-save` |
| F-HR-JOB | Chức danh (HR) | SCR-PROF-INFO | text | hr | | `job_title_key` | | |
| F-METRIC-* | Chỉ số công việc | SCR-PROF-WORK | grid | N | leave/attendance compose | multiple GET | number · dd/MM | `profile-status-metric-grid` |
| F-QA-PAYSLIP | Phiếu lương | SCR-PROF-WORK | tile | N | | nav TabPayslip | | `profile-quick-payslip` |
| F-QA-LEAVE | Nghỉ phép | SCR-PROF-WORK | tile | N | **entry** | LeaveRequestsList | | `profile-quick-leave` |
| F-QA-CHECKIN | Chấm công | SCR-PROF-WORK | tile | N | | TabAttendance CheckIn | | `profile-quick-checkin` |
| F-QA-APPROVE | Phê duyệt | SCR-PROF-WORK | tile+badge | mgr | | ManagerApprovals | | `profile-quick-approvals` |
| F-TASK-CARD | Nhiệm vụ hiện tại | SCR-PROF-WORK | card | N | pending leave/update | compose | | `profile-task-card` |
| F-DOC-PAY | Phiếu lương gần đây | SCR-PROF-DOC | card | N | | payslip list | VND vi-VN | `profile-doc-payslip-*` |
| F-DOC-CON | Hợp đồng teaser | SCR-PROF-DOC | card | N | tap → Contracts | contracts GET | dd/MM | `profile-doc-contract-*` |
| F-SET-COMPANY | Công ty (phạm vi) | SCR-SETTINGS | read-only | Y | display not slug | membership + OU | VI | SurfaceCard |
| F-SET-EMP-CODE | Mã nhân viên | SCR-SETTINGS | read-only | Y | | `employee_code` | | |
| F-SET-ROLES | Vai trò | SCR-SETTINGS | read-only | Y | | `resolveAuthRolesVi` | VI | |
| F-SET-MGR-FLAG | Giao diện quản lý | SCR-SETTINGS | read-only | Y | | `auth.isManager` | bật/ẩn | |
| F-SET-SCOPE-LINK | Phạm vi công ty | SCR-SETTINGS | row | Y | | nav Scope | | `settings-scope-link` |
| F-SET-CREATE-UPD | Đơn công (shortcut) | SCR-SETTINGS | row | Y | AT-01 | CreateUpdateRequest | | `settings-create-update-request` |
| F-SET-NAV-* | Điều hướng nhanh | SCR-SETTINGS | list rows | N | mgr filter approvals/ops | nested ProfileStack / TabPayslip | | contracts · notif · profile |
| F-SET-BIO | Sinh trắc học | SCR-SETTINGS | button | N | local SecureStore | toggle | | secondary variant |
| F-SET-LOGOUT | Đăng xuất | SCR-SETTINGS | button | Y | | signOut | danger | |
| F-SCOPE-ACTIVE | Đang dùng | SCR-SCOPE | label | Y | BE labels | membership row | VI | `scope-active-company-label` |
| F-SCOPE-MEM-ROW | Membership | SCR-SCOPE | list row | Y | select switches JWT context | `selectMembership` | | subtitle BE |
| F-SCOPE-OU-ROW | Đơn vị vận hành | SCR-SCOPE | list row | group CEO | slug filter | operating units | | hidden member CEO |
| F-CON-HEADER | Hợp đồng lao động và BH | SCR-CONTRACTS | header | Y | | — | | |
| F-CON-ROW | Loại HĐ + range | SCR-CONTRACTS | card | N | statusLabel VI | GET contracts | dd/MM | `contracts-section-contracts` |
| F-INS-ROW | Nhà BH + hết hạn | SCR-CONTRACTS | card | N | 90-day window | GET expiring | dd/MM | `contracts-section-insurance` |
| F-UPD-FILTER | Tất cả / trạng thái | SCR-UPD-LIST | chips | Y | status query | `status=` | label VI | FilterChipRow |
| F-UPD-ROW | NV — loại đơn | SCR-UPD-LIST | list row | N | type VI | update_type | dd/MM date | tap → detail |
| F-UPD-HDR-LEAVE | Nghỉ phép (header) | SCR-UPD-LIST | link | N | **cross-ref** | LeaveRequestsList | | headerRight |
| F-UPD-HDR-CREATE-LV | + Tạo nghỉ | SCR-UPD-LIST | link | N | **entry MOB-LEAVE-APPR** | CreateLeaveRequest | | |
| F-UPD-HDR-CREATE-AT | + Tạo đơn công | SCR-UPD-LIST | link | N | **entry MOB-ATTENDANCE** | CreateUpdateRequest | | |
| F-NOTIF-ROW | Tiêu đề thông báo | SCR-NOTIF | card | N | copy VI | inbox GET | time label | `inbox-row-{id}` |
| F-NOTIF-READ | Đã đọc / mới | SCR-NOTIF | badge | N | | `read_at` | | PATCH read |

**Đếm fields:** **42**

---

## 3. Function inventory

| fn_id | UI (nút/menu) | screen_id | precond | API / nav | success FE + reopen | fail / edge | HDSD |
|-------|---------------|-----------|---------|-----------|---------------------|-------------|------|
| FN-TAB-PROF | Tab **Hồ sơ** | SCR-PROF-TAB | logged in | — | Profile large title · tab bar | | J-MOB-17 |
| FN-SEG-SWITCH | Chuyển 3 segment | SCR-PROF-TAB | | — | testID tab-* visible | no crash mid-save | J-MOB-17 |
| FN-PROF-REFRESH | Kéo làm mới Profile | SCR-PROF-TAB | online | GET employee + compose | hero updated | missing employee hint | |
| FN-AVATAR-UP | Đổi avatar | SCR-PROF-INFO | online | upload + PATCH | hero image updates | alert error | J-AVT-02 |
| FN-ESS-SAVE | Lưu ESS | SCR-PROF-INFO | dirty phone | PATCH custom_fields | toast/alert · F5 tab | offline block | BR-ESS-01 |
| FN-HR-SAVE | Lưu HR block | SCR-PROF-INFO | hr role | PATCH employee | name/job persist | 403 hidden | |
| FN-GO-SETTINGS | Cài đặt row | ROW-PROF-SETTINGS | | nav Settings | `settings-screen` | | §12.9 |
| FN-GO-MGR-PROF | Phê duyệt row | ROW-PROF-MGR | is_manager | | ManagerApprovals · **stop** MOB-LEAVE-APPR | hidden emp | entry |
| FN-QA-LEAVE | Quick Nghỉ phép | SCR-PROF-WORK | | nav LeaveRequestsList | list screen · **stop** | | cross-ref |
| FN-QA-CHK | Quick Chấm công | SCR-PROF-WORK | | TabAttendance CheckIn | CheckIn · **stop** MOB-ATTENDANCE | | |
| FN-QA-APPR | Quick Phê duyệt | SCR-PROF-WORK | mgr | deferred rAF nav | ManagerApprovals | badge | MOB-LEAVE-APPR entry |
| FN-QA-PAY | Quick Phiếu lương | SCR-PROF-WORK | | TabPayslip | PayslipList | | payslip pack |
| FN-DOC-OPEN-PAY | Tap payslip doc | SCR-PROF-DOC | row | | PayslipDetail | | |
| FN-DOC-OPEN-CON | Tap contract doc | SCR-PROF-DOC | row | | Contracts full list | | |
| FN-SET-SCOPE | Phạm vi link | SCR-SETTINGS | | nav Scope | `scope-screen` | | TC-MOB-006 |
| FN-SET-QUICK | Quick nav row | SCR-SETTINGS | | nested stack | target screen title | mgr-only hidden | |
| FN-SET-AT-ENTRY | Đơn công shortcut | SCR-SETTINGS | | CreateUpdateRequest | **stop** MOB-ATTENDANCE | | AT-01 |
| FN-SET-BIO | Toggle sinh trắc | SCR-SETTINGS | | local | label flip | | |
| FN-SET-LOGOUT | Đăng xuất | SCR-SETTINGS | | signOut | Login screen | | |
| FN-SCOPE-PICK | Chọn membership | SCR-SCOPE | ≥1 membership | selectMembership | active label · home refresh | busy disable | UC-MOB-02 |
| FN-SCOPE-OU | Chọn OU (group) | SCR-SCOPE | group CEO tenant | filter slug | list scope changes | error banner | |
| FN-CON-LOAD | Mở Hợp đồng | SCR-CONTRACTS | scope UUID | dual GET | sections or empty | partial error banner | |
| FN-CON-REFRESH | Pull refresh contracts | SCR-CONTRACTS | | GET | data refresh | 409 scope FAIL | |
| FN-UPD-LIST | Mở Danh sách đơn công | SCR-UPD-LIST | scope | GET update-requests | rows or empty | scope error | |
| FN-UPD-FILTER | Đổi chip trạng thái | SCR-UPD-LIST | | GET filtered | list updates | | |
| FN-UPD-DET-ENTRY | Tap row | SCR-UPD-LIST | row | | UpdateRequestDetail · **stop** MOB-ATTENDANCE | 404 FAIL | |
| FN-UPD-EMPTY-CREATE | Empty CTA tạo | SCR-UPD-LIST | empty | | CreateUpdateRequest entry | | |
| FN-NOTIF-LOAD | Mở Thông báo | SCR-NOTIF | cid+eid | GET inbox | rows or empty | auth missing msg | |
| FN-NOTIF-READ | Tap row | SCR-NOTIF | row | PATCH read + nav | target screen · read badge | alert on PATCH fail | deep link |
| FN-HOME-BELL | Home → Notifications | *(MOB-HOME)* | | | SCR-NOTIF | | cross-ref MOB-HOME |

**Đếm functions:** **30** (mutate: ESS save · avatar · scope pick · notif read)

---

## 4. Test case matrix

### Quy ước

- **TC-ID:** `TC-MOB-PROF-<area>-<nnn>` · Type: `HP` · `FD` · `BD` · `AU` · `UX` · `NAV` · `REG`
- **Layer:** DEVICE · API (parity optional)
- **Status mặc định:** `PLANNED` (design pack)
- **Cross-ref:** `→ MOB-LEAVE-APPR` · `→ MOB-ATTENDANCE` · `→ MOB-HOME` — không duplicate wizard / submit

### 4.1 J-MOB-17 · Profile tab landing + segments

| TC-ID | Type | Covers | Persona | Precond | Steps (HDSD) | Expected | Automate | Status |
|-------|------|--------|---------|---------|--------------|----------|----------|--------|
| TC-MOB-PROF-J17-HP-001 | HP | FN-TAB-PROF · FN-SEG-SWITCH | uat.nv0003 | U65 login · tab **Hồ sơ** | Observe `profile-screen` · tap **Công việc** · **Tài liệu** · back **Thông tin** | Each `profile-tab-*` mounts · SegmentedTabBar ≥44px · no uncaught | DEVICE | PLANNED |
| TC-MOB-PROF-J17-HP-002 | HP | F-HERO-* · F-ESS-FORM | uat.nv0003 | employee GET 200 | Tab Thông tin | Hero name/code not UUID · `dynamic-profile-form` or honest `profile-ess-missing` | DEVICE | PLANNED |
| TC-MOB-PROF-J17-UX-001 | UX | FN-PROF-REFRESH | uat.nv0003 | online | Pull refresh on Profile | Loading ends · data stable or empty hint | DEVICE | PLANNED |
| TC-MOB-PROF-J17-REG-001 | REG | J-MOB-12 device | uat.nv0003 | prior PASS evidence | Repeat tab switch after kill-reopen app | Tabs state sane · ESS save testID still present | DEVICE | PLANNED |

### 4.2 ESS mutate · avatar (U65 FE path)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-PROF-ESS-HP-001 | HP | FN-ESS-SAVE | uat.nv0003 | editable phone field in catalog | Change phone → **Lưu** → kill-reopen tab Thông tin | PATCH 2xx · value persists · no raw API error toast | DEVICE | PLANNED |
| TC-MOB-PROF-ESS-FD-001 | FD | FN-ESS-SAVE offline | uat.nv0003 | airplane | Tap Lưu | Blocked/offline guard · no silent drop | DEVICE | PLANNED |
| TC-MOB-PROF-AVT-HP-001 | HP | FN-AVATAR-UP | uat.nv0003 | gallery permission | Pick photo → upload | Hero shows new image · PATCH 2xx | DEVICE | PLANNED |
| TC-MOB-PROF-AVT-FD-001 | FD | FN-AVATAR-UP cancel | uat.nv0003 | | Cancel picker | No PATCH · prior avatar unchanged | DEVICE | PLANNED |

### 4.3 Profile entries · quick grid (no leave/approve depth)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-PROF-NAV-HP-001 | HP | FN-GO-SETTINGS | uat.nv0003 | | Tap Cài đặt row | `settings-screen` visible | DEVICE | PLANNED |
| TC-MOB-PROF-NAV-HP-002 | HP | FN-QA-LEAVE entry | uat.nv0003 | tab Công việc | Tap **Nghỉ phép** tile | LeaveRequestsList · **stop** — wizard TC → MOB-LEAVE-APPR | DEVICE | PLANNED |
| TC-MOB-PROF-NAV-HP-003 | HP | FN-QA-CHK entry | uat.nv0003 | | Tap **Chấm công** | CheckIn screen · **stop** → MOB-ATTENDANCE | DEVICE | PLANNED |
| TC-MOB-PROF-NAV-AU-001 | AU | F-MGR-ROW hidden | uat.nv0003 | not manager | Tab Thông tin | No manager approvals entry row | DEVICE | PLANNED |
| TC-MOB-PROF-NAV-HP-004 | HP | FN-GO-MGR-PROF entry | uat.nv0001 | mgr pending≥0 | Tap Phê duyệt row or quick tile | ManagerApprovals paints · **stop** → MOB-LEAVE-APPR TC-MOB-LV-NAV-004 | DEVICE | PLANNED |
| TC-MOB-PROF-DOC-HP-001 | HP | FN-DOC-OPEN-CON | uat.nv0003 | ≥1 contract on profile | Tab Tài liệu → tap contract card | Contracts screen · sections match API | DEVICE | PLANNED |

### 4.4 Settings + Scope

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-PROF-SET-HP-001 | HP | F-SET-* display | uat.nv0003 | | Open Settings from Profile | Company label VI · mã NV · roles · mgr flag | DEVICE | PLANNED |
| TC-MOB-PROF-SET-HP-002 | HP | FN-SET-SCOPE | uat.nv0003 | | Tap **Phạm vi công ty** | `scope-screen` · active company label | DEVICE | PLANNED |
| TC-MOB-PROF-SET-HP-003 | HP | FN-SET-AT-ENTRY | uat.nv0003 | | Tap row **Đơn công** / requests shortcut | CreateUpdateRequest title · **stop** → MOB-ATTENDANCE | DEVICE | PLANNED |
| TC-MOB-PROF-SET-AU-001 | AU | F-SET-NAV approvals | uat.nv0003 | employee | Settings quick nav list | **Không** row Phê duyệt | DEVICE | PLANNED |
| TC-MOB-PROF-SET-HP-004 | HP | FN-SET-LOGOUT | uat.nv0003 | | Tap Đăng xuất | Login screen · no back-token leak | DEVICE | PLANNED |
| TC-MOB-PROF-SCP-HP-001 | HP | FN-SCOPE-PICK | uat.nv0003 | ≥2 memberships if avail. | Scope → chọn membership khác | «Đang dùng» updates · Home/Profile reload labels | DEVICE | PLANNED |
| TC-MOB-PROF-SCP-FD-001 | FD | FN-SCOPE-OU error | group CEO | units API fail | Open Scope OU section | Error VI · no crash | DEVICE | PLANNED |

### 4.5 Contracts

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-PROF-CON-HP-001 | HP | FN-CON-LOAD | uat.nv0003 | contracts API data from HR path | Settings → Hợp đồng or Profile doc | `contracts-section-contracts` rows · dates dd/MM · status VI not raw `active` | DEVICE | PLANNED |
| TC-MOB-PROF-CON-HP-002 | HP | F-INS-ROW | uat.nv0003 | expiring insurance | Scroll BH section | Provider · policy · expiry dd/MM | DEVICE | PLANNED |
| TC-MOB-PROF-CON-UX-001 | UX | FN-CON-REFRESH | uat.nv0003 | | Pull refresh | Shimmer ends · list stable | DEVICE | PLANNED |
| TC-MOB-PROF-CON-FD-001 | FD | scope missing | uat.nv0003 | sim no attendance company | Open Contracts | Banner scope VI · `contracts-empty` or error · no infinite spinner | DEVICE | PLANNED |

### 4.6 UpdateRequests list (submit → MOB-ATTENDANCE)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-PROF-UPD-HP-001 | HP | FN-UPD-LIST · FN-UPD-FILTER | uat.nv0003 | U65 prior create from FE if any | Open UpdateRequests · chip **Đang xét** | Rows or `update-requests-empty` honest | DEVICE | PLANNED |
| TC-MOB-PROF-UPD-NAV-001 | NAV | FN-UPD-DET-ENTRY | uat.nv0003 | ≥1 row | Tap row | UpdateRequestDetail id · **stop** → MOB-ATTENDANCE | DEVICE | PLANNED |
| TC-MOB-PROF-UPD-NAV-002 | NAV | FN-UPD-HDR-CREATE-LV entry | uat.nv0003 | | Header **+ Tạo nghỉ** | CreateLeaveRequest step 0 · **stop** → MOB-LEAVE-APPR | DEVICE | PLANNED |
| TC-MOB-PROF-UPD-NAV-003 | NAV | FN-UPD-EMPTY-CREATE | uat.nv0003 | empty list | Tap empty CTA | CreateUpdateRequest · **stop** → MOB-ATTENDANCE | DEVICE | PLANNED |

### 4.7 Notifications (in stack)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-PROF-NOT-HP-001 | HP | FN-NOTIF-LOAD | uat.nv0003 | | Profile/Settings → Thông báo | List or `inbox-empty-state` · no 500 banner | DEVICE | PLANNED |
| TC-MOB-PROF-NOT-HP-002 | HP | FN-NOTIF-READ | uat.nv0003 | unread row exists | Tap row | PATCH read 2xx · navigates leave/update/mgr target · no 404 scope | DEVICE | PLANNED |
| TC-MOB-PROF-NOT-UX-001 | UX | FN-NOTIF-LOAD refresh | uat.nv0003 | | Pull refresh | `inbox-row-*` stable · error cleared if transient | DEVICE | PLANNED |
| TC-MOB-PROF-NOT-CROSS-001 | NAV | FN-HOME-BELL | uat.nv0003 | | Home chuông → same screen | Parity with Settings nav · **MOB-HOME** PT-UX-001 | DEVICE | PLANNED |

### Coverage check

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions ≥1 HP | 30 | 30 | 0 |
| J-MOB-17 explicit | 1 | J17-HP-001 | 0 |
| ESS mutate + avatar | 2 | ESS-HP-001 · AVT-HP-001 | 0 |
| Settings→Scope TC-MOB-006 | 1 | SET-HP-002 | 0 |
| Contracts list+empty | 2 | CON-HP-001 · CON-FD-001 | 0 |
| UpdateRequests list entry only | 3 | UPD-* | 0 |
| Notifications in stack | 2 | NOT-HP-001/002 | 0 |
| Leave/approve no wizard dup | policy | NAV-HP-002/004 · UPD-NAV-002 cross-ref | 0 |
| Persona AU mgr/emp | 2 | NAV-AU-001 · SET-AU-001 | 0 |

**TC count:** **36** PLANNED (design)

---

## 5. Traceability

| TC-ID | SRS / UC | TechSpec / doc | API | Catalog / J-* | HDSD |
|-------|----------|----------------|-----|---------------|------|
| TC-MOB-PROF-J17-HP-001 | UC-HRM-MOB-12 | MOBILE_W7 §4.5 | GET employee | **J-MOB-17** | Tab Hồ sơ 3 segment |
| TC-MOB-PROF-J17-REG-001 | UC-HRM-MOB-12 | PCOMP-W7-MOB-PROFILE-FULL-01 | | **J-MOB-12** | ESS regression |
| TC-MOB-PROF-ESS-HP-001 | BR-ESS-01 | DynamicProfileForm | PATCH custom_fields | | Sửa phone |
| TC-MOB-PROF-AVT-HP-001 | J-AVT-02 | avatar upload | PATCH avatar_url | | Đổi ảnh |
| TC-MOB-PROF-SET-HP-002 | UC-HRM-MOB-02 | profileSettingsNav | | **TC-MOB-006** | Phạm vi công ty |
| TC-MOB-PROF-SET-HP-003 | AT-01 | R-SPINE-AT-NAV-01 | POST update-requests downstream | **TC-AT-01** entry | Settings đơn công |
| TC-MOB-PROF-NAV-HP-002 | leave hub | profileQuickActions | | **J-MOB-03 entry** → MOB-LEAVE-APPR | Nghỉ phép tile |
| TC-MOB-PROF-NAV-HP-004 | FR-UC-H03 entry | profileStackNav rAF | | **J-MOB-05 entry** → MOB-LEAVE-APPR | Phê duyệt |
| TC-MOB-PROF-CON-HP-001 | contracts ESS | ContractsScreen | GET contracts | roster MOB-CONTRACTS | Hợp đồng |
| TC-MOB-PROF-UPD-NAV-001 | UC-HRM-MOB-06b | UpdateRequestsScreen | GET update-requests | MOB-UPDATE-LIST | List→detail entry |
| TC-MOB-PROF-NOT-HP-002 | inbox | InAppNotificationsScreen | GET/PATCH inbox | MOB-NOTIFICATIONS | Deep link |

---

## 6. Out of scope / cross-pack

| Item | Owner pack | TC in MOB-PROFILE |
|------|------------|-------------------|
| CreateLeaveRequest wizard · attach · submit | **MOB-LEAVE-APPR** | NAV-HP-002 · UPD-NAV-002 entry only |
| LeaveRequestsList · LeaveRequestDetail depth | **MOB-LEAVE-APPR** | Quick tile + header link entry |
| ManagerApprovals Duyệt/Từ chối | **MOB-LEAVE-APPR** | NAV-HP-004 entry |
| CreateUpdateRequest submit · MGR approve CC | **MOB-ATTENDANCE** | SET-HP-003 · UPD-NAV-001/003 entry |
| FAB leave / approve | **MOB-HOME** | NOT-CROSS-001 bell only |
| Payslip list→detail E2E | **MOB-PAYSLIP** | DOC-HP-001 · QA-PAY entry |
| Operations · Journey screens | **MOB-OPERATIONS** / **MOB-JOURNEY** wave C | Settings quick nav mention only |
| HR full patch block (non-HR user) | AU in ESS-HP | implied ESS only |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-mob-profile-01.md
next_owner: qa-synth (rollup PO_SPEC_TEST_REPORT + roster MOB-PROFILE / gộp SETTINGS status)
counts: screens=14 in-scope (+8 cross-ref) fields=42 functions=30 tcs=36 (all PLANNED design)
catalog_map: J-MOB-17 · J-MOB-12 REG · TC-MOB-006 · AT-01 entry · MOB-CONTRACTS · MOB-NOTIFICATIONS
cross_ref: MOB-LEAVE-APPR · MOB-ATTENDANCE · MOB-HOME — no leave wizard duplicate
```

*PO-ECO-TC-MOB-PROFILE-01 · WORLD-STANDARD depth pack · no UAT execution claim*
