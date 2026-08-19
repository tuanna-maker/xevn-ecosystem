# Menu TC Pack — `MOB-SETTINGS` · Mobile Cài đặt + Phạm vi công ty (Scope)

| Meta | Value |
|------|--------|
| **menu_id** | `MOB-SETTINGS` (+ roster `MOB-SCOPE` gộp pack này) |
| **surface** | `hrm-mobile` |
| **route(s)** | Profile stack: `Settings` · `Scope` · entry `Profile` → `ProfileSettingsEntry` |
| **HDSD** | Mobile Ch.12 · §12.1 Phạm vi công ty · §12.9 Cài đặt · `docs/hrm/MOBILE_W7_SRS_DELTA.md` · `docs/program/MOBILE_PERSONA_UX_MATRIX.md` |
| **SRS / FR / UC** | UC-HRM-MOB-02 · FR-UC-M01 (membership / scope) · **AT-01** (entry đơn công từ Settings) |
| **TechSpec** | `MOBILE_W7_TECHSPEC_DELTA` · scope + SecureStore local · `W1-B-04-AUTH-MOB` display labels |
| **API_CONTRACT** | `GET /api/hrm/operating-units` · mobile auth `selectMembership` / `selectOperatingUnitFilter` (AuthContext) · không mutate server từ UAT SecureStore card |
| **UF / J-*** | **J-MOB-01** (scope sau login — *entry* pack MOB-LOGIN) · scope switch trong session · **TC-AT-01** (Settings → CreateUpdateRequest) |
| **Catalog neo** | Legacy device **TC-MOB-006** · **TC-MOB-032** · **TC-MOB-033** (MOB-NAV-SETTINGS-01) |
| **author** | qa · `PO-ECO-TC-MOB-SETTINGS-01` |
| **work_item_id** | `PO-ECO-TC-MOB-SETTINGS-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |
| **Persona lock** | ESS **`uat.nv0003@xe.vn`** / `xevn-uat-2026` · QL **`uat.nv0001@xe.vn`** · Group CEO scope/OU **`ceo@xe.vn`** / `Xevn@2026` (chỉ khi test rollup OU — không dùng làm L1 duyệt nghỉ) |
| **Locks** | U65 zero-seed · U76 HDSD · U78 test-log when executed · **cấm** UAT DONE |

> Chuẩn: IEEE 829 / ISO 29119 lean — pack **thiết kế** TC; execution device = wave sau.  
> **Hồ sơ (tabs ESS, avatar, manager entry):** **`MOB-PROFILE.md`** (Wave B) — pack này chỉ **entry Cài đặt**, **toggle/bảo mật**, **quick nav**, và **Scope** đầy đủ; không nhân bản inventory tab Thông tin / Lương / Hợp đồng trên Profile.

---

## 0. Spec read ack (inventory source)

| Source | Path | Sections used |
|--------|------|----------------|
| Settings | `apps/mobile/hrm-mobile/src/features/settings/SettingsScreen.tsx` | scope card · UAT card · biometric · logout · quick nav |
| Scope | `apps/mobile/hrm-mobile/src/features/auth/ScopeScreen.tsx` | Đang dùng · OU filter · membership pick |
| Nav / testID | `utils/profileSettingsNav.ts` · `navigation/profileStackNav.ts` | `settings-screen` · `settings-scope-link` · `scope-screen` · `profile-settings-entry` |
| Copy | `utils/scopeScreenCopy.ts` · `features/auth/membershipDisplay.ts` | VI labels · không slug auth path |
| Entry | `components/profile/ProfileSettingsEntry.tsx` | Profile → Settings CTA |
| Biometric | `integrations/biometricUnlock.ts` | SecureStore flag · LocalAuthentication gate |
| OU API | `integrations/hrmOperatingUnits.ts` · `hrmListScope.ts` | `fetchHrmOperatingUnits` · `isGroupCeoMasterTenant` |
| Vitest | `navigation/__tests__/profileStackNav.test.ts` · `utils/__tests__/scopeScreenCopy.test.ts` | MOB-NAV-SETTINGS-01 wiring |
| Program | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` · roster `ECOSYSTEM_MENU_ROSTER.md` | MOB-SETTINGS · MOB-SCOPE gộp |
| Cross-pack | **`MOB-PROFILE.md`** (planned) · **`MOB-LEAVE-APPR.md`** · **`MOB-ATTENDANCE.md`** · **`MOB-HOME.md`** | downstream execution depth |

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| SCR-PROFILE-SET-ENTRY | row | `Profile` → `ProfileSettingsEntry` | CTA «Cài đặt» (*entry — chi tiết Profile thuộc MOB-PROFILE*) | visible always on Profile root |
| SCR-SETTINGS | page | `Settings` / `SettingsScreen` | Cài đặt: phạm vi read-only, bảo mật, điều hướng nhanh | content · scroll |
| SCR-SCOPE | page | `Scope` / `ScopeScreen` | Chọn kiêm nhiệm / lọc đơn vị vận hành | loading OU · error hint · empty · list |
| CARD-SET-SCOPE-RO | inline | SCR-SETTINGS | «Phạm vi đang dùng» read-only | labels OK · «—» safe |
| CARD-SET-UAT | inline | SCR-SETTINGS | «Cấu hình phạm vi (UAT)» | **hidden** prod · visible `__DEV__` or QA login |
| CARD-SCP-ACTIVE | inline | SCR-SCOPE | «Đang dùng» meta | BE labels |
| SEC-SCP-OU | section | SCR-SCOPE | «Đơn vị vận hành» | group CEO only |
| SEC-SCP-MEM | section | SCR-SCOPE | «Kiêm nhiệm» / «Phạm vi nhân viên» | 1..n rows |
| POP-ALERT-SCP-SAME | alert | Scope pick active row | «Đã chọn» · không đổi | dismiss |
| POP-ALERT-SCP-SAVED | alert | Scope pick OK | «Đã lưu» + label | dismiss |
| POP-ALERT-SCP-FAIL | alert | `selectMembership` false | «Không đổi được phạm vi…» | dismiss |
| POP-ALERT-LOCAL-SAVED | alert | UAT Lưu SecureStore | «Phạm vi local đã cập nhật.» | after biometric OK |
| POP-BIO-PROMPT | system | UAT Lưu / LocalAuthentication | Face/Touch «Mở khóa XeVN HRM» | success · cancel |
| POP-ALERT-LOGOUT | implicit | `auth.signOut()` | về Login (downstream) | — |

**Đếm:** pages=2 · entry row=1 · inline cards/sections=5 · alerts=5 · system bio=1 → **14** surface ids

---

## 2. Field dictionary (display + controls)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API / source | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|--------------|--------|-------|
| F-ENTRY-TITLE | Cài đặt | SCR-PROFILE-SET-ENTRY | pressable | Y | a11y `vi.settings` | — | | `profile-settings-entry` |
| F-ENTRY-SUB | Phạm vi, bảo mật và điều hướng | SCR-PROFILE-SET-ENTRY | subtitle | N | | constant | VI | |
| F-SET-HDR-TITLE | Cài đặt | SCR-SETTINGS | large title | Y | `vi.settings` | — | | AppScreenLayout |
| F-SET-HDR-SUB | Phạm vi, bảo mật và điều hướng nhanh | SCR-SETTINGS | subtitle | N | | constant | | |
| F-SET-COMPANY | Công ty (phạm vi) | CARD-SET-SCOPE-RO | read-only text | Y | **no raw slug** | `resolveCompanyDisplayVi` + OU cache | VI Plane A | line 1 scope card |
| F-SET-EMP-CODE | Mã nhân viên | CARD-SET-SCOPE-RO | read-only | Y | sanitize «—» | membership `employee_code` / fallback id | plain | |
| F-SET-ROLES | Vai trò | CARD-SET-SCOPE-RO | read-only | N | `resolveAuthRolesVi` | JWT roles → VI | comma list | empty → «Chưa có» |
| F-SET-MGR-FLAG | Giao diện quản lý | CARD-SET-SCOPE-RO | read-only | Y | | `auth.isManager` | «bật»/«ẩn» | |
| F-UAT-COMPANY-UUID | Công ty (phạm vi) | CARD-SET-UAT | text input | N* | trim · SecureStore | `STORAGE.COMPANY_UUID` | UUID/slug | *UAT card only |
| F-UAT-EMP-ID | Mã nhân viên | CARD-SET-UAT | text input | N* | trim | `STORAGE.EMPLOYEE_ID` | plain | |
| F-UAT-SAVE | Lưu vào SecureStore | CARD-SET-UAT | button | N* | biometric gate if enabled | `auth.updateLocal` | | PrimaryButton |
| F-BIO-BTN | Bật/Tắt mở khóa sinh trắc học | SCR-SETTINGS | button | N | toggles `hrm_mobile_biometric_enabled` | SecureStore | VI label swap | secondary variant |
| F-LOGOUT | Đăng xuất | SCR-SETTINGS | button | Y | | `auth.signOut` | danger | `vi.logout` |
| F-NAV-SCOPE | Phạm vi công ty | SCR-SETTINGS | ListRow | Y | | nav Scope | | `settings-scope-link` |
| F-NAV-APPR | Phê duyệt | SCR-SETTINGS | ListRow | mgr | hidden if `!isManager` | ManagerApprovals | | `vi.approvals` |
| F-NAV-AT-REQ | Đơn công | SCR-SETTINGS | ListRow | Y | AT-01 | CreateUpdateRequest | | `settings-create-update-request` |
| F-NAV-PAYROLL | Lương | SCR-SETTINGS | ListRow | Y | | TabPayslip→PayrollSummary | | single-hop payslip parity |
| F-NAV-CONTRACTS | Hợp đồng | SCR-SETTINGS | ListRow | Y | | Contracts stack | | *detail pack MOB-PROFILE gộp* |
| F-NAV-OPS | Vận hành | SCR-SETTINGS | ListRow | mgr | hidden non-mgr | Operations | | |
| F-NAV-PROFILE | Hồ sơ | SCR-SETTINGS | ListRow | Y | | Profile root | | *ESS depth MOB-PROFILE* |
| F-NAV-NOTIF | Thông báo | SCR-SETTINGS | ListRow | Y | | Notifications | | *gộp MOB-PROFILE roster* |
| F-SCP-TITLE | Phạm vi công ty | SCR-SCOPE | title | Y | | constant | | |
| F-SCP-SUB-GROUP | Chọn đơn vị vận hành hoặc xem toàn tập đoàn. | SCR-SCOPE | subtitle | N | `showOperatingUnits` | copy helper | VI | |
| F-SCP-SUB-MEMBER | Chọn công ty kiêm nhiệm — chỉ phạm vi công ty của bạn. | SCR-SCOPE | subtitle | N | member CEO | copy helper | VI | |
| F-SCP-ACT-COMPANY | Công ty | CARD-SCP-ACTIVE | text | Y | **BE label only** | `company_label` | | `scope-active-company-label` block |
| F-SCP-ACT-TENANT | Pháp nhân | CARD-SCP-ACTIVE | text | Y | | `tenant_label` | | |
| F-SCP-ACT-ROLE | Vai trò | CARD-SCP-ACTIVE | text | Y | | `role_label` | | |
| F-SCP-ACT-JOB | Chức danh | CARD-SCP-ACTIVE | text | Y | | `job_title_label` | | |
| F-SCP-DEV-WIRE | Tenant key / Query company_id / Header | CARD-SCP-ACTIVE | text | N | **`__DEV__` only** | debug | | cấm assert prod |
| F-SCP-OU-ROLLUP | Tất cả đơn vị (rollup) | SEC-SCP-OU | ListRow | N | group CEO | filter `all` | meta «Phạm vi tập đoàn» | badge «Đang dùng» |
| F-SCP-OU-ROW-* | {display_name_vi} | SEC-SCP-OU | ListRow | N | per unit | `operating_slug` | subtitle lọc theo label | rollup_order meta |
| F-SCP-MEM-ROW-* | {company_label} | SEC-SCP-MEM | ListRow | N | multi membership | pick `selectMembership` | subtitle name·code | trailing badge |
| F-SCP-HINT-LOAD | Đang tải từ GET /operating-units… | SEC-SCP-OU | hint | N | | fetch in flight | | |
| F-SCP-HINT-PILOT | Dùng danh sách pilot — không tải được từ máy chủ. | SEC-SCP-OU | hint | N | fetch fail | `PILOT_HRM_OPERATING_UNITS` | | honest degrade |
| F-SCP-HINT-MEM | Chỉ xem phạm vi công ty của bạn… | SEC-SCP-MEM | hint | N | !showOperatingUnits | | | |
| F-SCP-EMPTY | Chưa có phạm vi — đăng nhập lại… | SCR-SCOPE | empty | N | no memberships | | | AppScreenLayout empty |

**Đếm fields:** **36** (OU rows counted as family `F-SCP-OU-ROW-*`)

---

## 3. Function inventory

| fn_id | UI (nút/menu) | screen_id | precond | API / nav | success FE + reopen | fail / edge | HDSD |
|-------|---------------|-----------|---------|-----------|---------------------|-------------|------|
| FN-PROF-TO-SETTINGS | Cài đặt (Profile) | SCR-PROFILE-SET-ENTRY | signed in | `navigateToSettings` | `settings-screen` visible | unreachable if entry missing | §12.9 · **TC-MOB-032** |
| FN-SET-SCOPE-LINK | Phạm vi công ty | SCR-SETTINGS | | `navigateToScope` | `scope-screen` | — | §12.1 · **TC-MOB-006** |
| FN-SET-NAV-AT | Đơn công | SCR-SETTINGS | | `navigateToCreateUpdateRequest` | CreateUpdateRequest mount | — | **TC-AT-01** entry |
| FN-SET-NAV-APPR | Phê duyệt | SCR-SETTINGS | `isManager` | ManagerApprovals | inbox mount | hidden non-mgr | → MOB-LEAVE-APPR |
| FN-SET-NAV-PAYROLL | Lương | SCR-SETTINGS | | TabPayslip hop | PayrollSummary | — | payslip parity |
| FN-SET-NAV-CONTRACTS | Hợp đồng | SCR-SETTINGS | | Contracts | list mount | — | MOB-PROFILE gộp |
| FN-SET-NAV-OPS | Vận hành | SCR-SETTINGS | mgr | Operations | mount | hidden | |
| FN-SET-NAV-PROFILE | Hồ sơ | SCR-SETTINGS | | Profile | Profile root | — | MOB-PROFILE |
| FN-SET-NAV-NOTIF | Thông báo | SCR-SETTINGS | | Notifications | mount | — | |
| FN-SET-BIO-TOGGLE | Bật/Tắt sinh trắc | SCR-SETTINGS | | SecureStore flag | label swaps · persists kill-app | no hardware → still toggles flag | MOB-403 |
| FN-SET-LOGOUT | Đăng xuất | SCR-SETTINGS | | signOut | Login screen | — | |
| FN-SET-UAT-PERSIST | Lưu SecureStore | CARD-SET-UAT | UAT visible | local only | Alert «Đã lưu» · `updateLocal` | biometric cancel → no save | QA/dev only |
| FN-SCP-PICK-MEM | Tap membership row | SEC-SCP-MEM | ≥1 membership | `auth.selectMembership` | Alert «Đã lưu» · labels update | fail → error alert | FR-UC-M01 |
| FN-SCP-PICK-MEM-SAME | Tap active membership | SEC-SCP-MEM | | — | «Đã chọn» no API | | |
| FN-SCP-PICK-OU | Tap OU / rollup | SEC-SCP-OU | group CEO tenant | `selectOperatingUnitFilter` | «Đã lưu» · list filters downstream | busy disabled | U39 · BR-INT-03 |
| FN-SCP-PICK-OU-SAME | Tap active OU | SEC-SCP-OU | | — | «Đã chọn» | | |
| FN-SCP-LOAD-OU | Load operating units | SCR-SCOPE | group CEO | `GET …/operating-units` | rows render | catch → pilot + hint | |
| FN-SCP-BACK | System back | SCR-SCOPE | | pop | Settings or Profile | | |

**Đếm functions:** **18**

---

## 4. Test case matrix

### Quy ước TC-ID

`TC-MOB-SET-*` (Settings) · `TC-MOB-SCP-*` (Scope) · Type: `HP` · `FD` · `BD` · `AU` · `UX` · `REG` (regression legacy)

| TC-ID | Type | Covers | Persona | Precond | Steps (HDSD) | Expected | Layer | Automate | Status |
|-------|------|--------|---------|---------|--------------|----------|-------|----------|--------|
| **TC-MOB-SET-HP-001** | HP | FN-PROF-TO-SETTINGS | uat.nv0003 | Login · Tab Hồ sơ | Tap **Cài đặt** (`profile-settings-entry`) | `settings-screen` · title Cài đặt · card phạm vi có mã NV | MOBILE | MANUAL / adb | PLANNED |
| **TC-MOB-SET-HP-002** | HP | FN-SET-SCOPE-LINK | uat.nv0003 | On Settings | Tap **Phạm vi công ty** | `scope-screen` · «Đang dùng» labels VI | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SET-HP-003** | HP | F-SET-COMPANY..MGR | uat.nv0003 | Settings | Read «Phạm vi đang dùng» | Không slug `trsport`/`main` thô · roles VI · mgr «ẩn» for ESS | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SET-HP-004** | HP | FN-SET-NAV-AT | uat.nv0003 | Settings | Tap **Đơn công** | CreateUpdateRequest mount · testID path | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SET-HP-005** | HP | FN-SET-NAV-PAYROLL | uat.nv0003 | Settings | Tap **Lương** | Tab Phiếu lương → PayrollSummary · no double stack crash | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SET-HP-006** | HP | FN-SET-NAV-PROFILE | uat.nv0003 | Settings | Tap **Hồ sơ** | Profile root · *không* assert tab ESS (MOB-PROFILE) | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SET-HP-007** | HP | FN-SET-BIO-TOGGLE | uat.nv0003 | Settings | Tap **Bật** sinh trắc → kill app → reopen Settings | Label «Tắt…» · flag persisted | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SET-HP-008** | HP | FN-SET-LOGOUT | uat.nv0003 | Settings | **Đăng xuất** | Login screen · token cleared | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SET-AU-001** | AU | F-NAV-APPR · F-NAV-OPS | uat.nv0001 | QL login | Open Settings quick nav | **Phê duyệt** + **Vận hành** visible | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SET-AU-002** | AU | F-NAV-APPR · F-NAV-OPS | uat.nv0003 | ESS login | Open Settings | Rows **ẩn** (filtered `show:false`) | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SET-FD-001** | FD | FN-SET-UAT-PERSIST | QA build | Biometric **on** · UAT card visible | Sửa UUID → **Lưu** → cancel Face/Touch | **No** «Đã lưu» alert · SecureStore unchanged | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SET-BD-001** | BD | F-SET-ROLES | account no roles | Settings | Read vai trò line | «Chưa có» | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SET-AU-003** | AU | CARD-SET-UAT | release APK | Prod / no QA login | Settings scroll | **Không** card «Cấu hình phạm vi (UAT)» | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SET-REG-032** | REG | FN-PROF-TO-SETTINGS | uat.nv0003 | | Repeat MOB-NAV-SETTINGS-01 path | Same as HP-001 · maps legacy **TC-MOB-032** | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SET-REG-006** | REG | FN-SET-SCOPE-LINK | uat.nv0003 | | Repeat Scope link | Same as HP-002 · maps legacy **TC-MOB-006** | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SCP-HP-001** | HP | CARD-SCP-ACTIVE | uat.nv0003 | Scope | Read «Đang dùng» | `scope-active-company-label` · company/tenant/role/job **≠** raw UUID/slug | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SCP-HP-002** | HP | FN-SCP-PICK-MEM-SAME | uat.nv0003 | Scope | Tap row đang «Đang dùng» | Alert «Đã chọn» · no loading stuck | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SCP-HP-003** | HP | FN-SCP-PICK-MEM | multi-mem user | ≥2 memberships | Tap **other** row | Alert «Đã lưu» · header/home scope labels update · kill app still selected | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SCP-FD-001** | FD | FN-SCP-PICK-MEM | forced fail | simulate `selectMembership` false | Tap other mem | Alert lỗi VI · stay on Scope | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SCP-HP-004** | HP | SEC-SCP-OU | ceo@xe.vn | Group CEO tenant | Scope | Section **Đơn vị vận hành** + rollup row | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SCP-HP-005** | HP | FN-SCP-PICK-OU | ceo@xe.vn | OU list loaded | Tap member unit (not active) | «Đã lưu» · badge moves · downstream list filter (spot home/team) | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SCP-HP-006** | HP | FN-SCP-PICK-OU-SAME | ceo@xe.vn | | Tap active OU | «Đã chọn» | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SCP-FD-002** | FD | FN-SCP-LOAD-OU | ceo@xe.vn | API down / airplane | Open Scope | Hint pilot · rows from `PILOT_HRM_OPERATING_UNITS` · no crash | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SCP-AU-001** | AU | SEC-SCP-OU | uat.nv0003 | Member scope | Scope | **No** OU section · membership hint visible | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SCP-BD-001** | BD | F-SCP-EMPTY | logged out partial state | corrupt session | Scope | emptyMessage «Chưa có phạm vi…» | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SCP-REG-033** | REG | F-SCP-ACT-* | uat.nv0003 | | W1-B-04 label bind | Labels match BE auth payload · maps **TC-MOB-033** | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SCP-UX-001** | UX | FN-SCP-BACK | uat.nv0003 | Settings→Scope | Hardware back | Returns Settings · no orphan stack | MOBILE | MANUAL | PLANNED |
| **TC-MOB-SET-UNIT-001** | HP | scopeScreenCopy | — | vitest | `pnpm --filter hrm-mobile test scopeScreenCopy` | exit 0 · VI roles · OU subtitle Plane A | UNIT | AUTOMATED | PLANNED |
| **TC-MOB-SET-UNIT-002** | HP | profileStackNav | — | vitest | `profileStackNav.test.ts` MOB-NAV-SETTINGS | settings/scope testIDs wired | UNIT | AUTOMATED | PLANNED |
| **TC-MOB-SET-UNIT-003** | HP | membershipDisplay | — | vitest | `membershipDisplay.test.ts` | company_label priority | UNIT | AUTOMATED | PLANNED |
| **TC-MOB-SET-REG-011** | REG | FN-SET-NAV-* | uat.nv0003 | | Quick nav smoke (no 500 banner) | Contracts · Notifications open | MOBILE | REG | PLANNED |
| **TC-MOB-SET-REG-027** | REG | Scope+Settings | uat.nv0003 | | Profile→Settings→Scope→Back→Home | No tab trap · J-MOB-01 shell OK | MOBILE | REG | PLANNED |
| **TC-MOB-SET-REG-028** | REG | FN-SET-LOGOUT | uat.nv0003 | | Logout → login → home | Session clean · no ghost mgr UI | MOBILE | REG | PLANNED |

### 4.1 Coverage check

| Check | Count required | Count in matrix | GAP |
|-------|----------------|-----------------|-----|
| Functions với ≥1 HP | 18 | 18 | **0** |
| Functions mutate với ≥1 FD | 6 (mem/OU pick, UAT persist, bio, logout, load OU) | 6 | **0** |
| Required display fields với ≥1 TC | 8 (scope cards + active block) | 8 (HP-003, SCP-HP-001, BD-001, AU-*) | **0** |
| Alerts/popups với ≥1 TC | 5 | 5 (SCP same/saved/fail, UAT FD, bio) | **0** |
| Legacy TC-MOB-006/032/033 | 3 | REG-006/032/033 | **0** |

**TC count:** **30** PLANNED (design)

### 4.2 Quick nav inventory (Settings → downstream)

| ListRow title | testID | Persona | Downstream pack | Pack TC |
|---------------|--------|---------|-----------------|---------|
| Phạm vi công ty | `settings-scope-link` | all | **this pack §4 Scope** | SET-HP-002 |
| Phê duyệt | — | mgr | MOB-LEAVE-APPR | entry only SET-AU-001 |
| Đơn công | `settings-create-update-request` | all | MOB-ATTENDANCE | SET-HP-004 · TC-AT-01 |
| Lương | — | all | MOB-PAYSLIP / Profile | SET-HP-005 |
| Hợp đồng | — | all | MOB-PROFILE gộp | SET-REG-011 |
| Vận hành | — | mgr | Operations module | SET-AU-001 |
| Hồ sơ | — | all | MOB-PROFILE | SET-HP-006 |
| Thông báo | — | all | MOB-PROFILE gộp | SET-REG-011 |

---

## 5. Traceability

| TC-ID | SRS / UC | TechSpec / doc | API | Catalog / J-* | HDSD |
|-------|----------|----------------|-----|---------------|------|
| TC-MOB-SET-HP-001 | UC-HRM-MOB-02 | MOBILE_W7 · MOB-NAV-SETTINGS-01 | — | **TC-MOB-032** | §12.9 |
| TC-MOB-SET-HP-002 | UC-HRM-MOB-02 | same | — | **TC-MOB-006** | §12.1 |
| TC-MOB-SCP-HP-001 | FR-UC-M01 | W1-B-04-AUTH-MOB | auth labels | **TC-MOB-033** | §12.1 |
| TC-MOB-SET-HP-004 | UC-HRM-MOB-06b | R-SPINE-AT-NAV-01 | update-requests | **TC-AT-01** | Đơn công |
| TC-MOB-SCP-HP-004..006 | U39 rollup | ADR scope ladder | GET operating-units | J-MOB-01 scope leg | Group CEO |
| TC-MOB-SET-REG-027 | portal shell | MOB-UX-11 | — | **J-MOB-01** | cross-nav |

---

## 6. Out of scope / cross-pack

| Item | Owner pack | TC in MOB-SETTINGS |
|------|------------|-------------------|
| Profile tabs (Thông tin / Lương / HĐ / tab swipe) | **MOB-PROFILE** | SET-HP-006 entry only · **no** field inventory |
| ProfileManagerApprovalsEntry · pending badge | **MOB-PROFILE** + MOB-LEAVE-APPR | SET-AU-001 Settings row only |
| CreateUpdateRequest submit / validation | **MOB-ATTENDANCE** | SET-HP-004 nav entry |
| ManagerApprovals Duyệt/Từ chối | **MOB-LEAVE-APPR** | SET-AU-001 nav entry |
| Login / password form | **MOB-LOGIN** | precond |
| Home FAB paths to Settings | **MOB-HOME** | FN-TOP-AVATAR → Profile → Settings (optional REG) |
| Contracts / Notifications list-detail | **MOB-PROFILE** roster | SET-REG-011 smoke mount |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-mob-settings-01.md
next_owner: qa-synth (rollup PO_SPEC_TEST_REPORT + roster MOB-SETTINGS / MOB-SCOPE)
counts: screens=14 fields=36 functions=18 tcs=30 (all PLANNED design)
catalog_map: TC-MOB-006 · TC-MOB-032 · TC-MOB-033 · TC-AT-01 entry · MOB-SCOPE gộp
cross_ref: MOB-PROFILE (no ESS duplicate) · MOB-LEAVE-APPR · MOB-ATTENDANCE · MOB-HOME
```

*PO-ECO-TC-MOB-SETTINGS-01 · WORLD-STANDARD depth pack · no UAT execution claim*
