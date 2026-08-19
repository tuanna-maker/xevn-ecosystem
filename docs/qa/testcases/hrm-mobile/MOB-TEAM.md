# Menu TC Pack — `MOB-TEAM` · Mobile Danh bạ đội nhóm + Chi tiết đồng nghiệp

| Meta | Value |
|------|--------|
| **menu_id** | `MOB-TEAM` (roster gộp `MOB-TEAM-DIR` + `MOB-TEAM-DETAIL`) |
| **surface** | `hrm-mobile` |
| **route(s)** | Tab `TabAttendance` (label **Đội nhóm**) · `AttendanceStack`: `TeamDirectory` · `TeamColleagueDetail` |
| **HDSD** | Mobile ESS Ch08 danh bạ · `docs/hrm/MOBILE_W7_SRS_DELTA.md` §4.4 · `MOBILE_HRM_ESS_UX_BENCHMARK.md` MOB-UX-08/12a/12b |
| **SRS / FR / UC** | **UC-HRM-MOB-16** (W7-5 directory) · **AC-DIR-01..03** · **BR-DIR-01..03** · **VAL-W7-DIR-01/03** |
| **TechSpec** | `MOBILE_W7_TECHSPEC_DELTA.md` §4.2 EmployeeDirectoryScreen · EmployeeDirectoryDetailScreen · NFR-W7-04 |
| **API_CONTRACT** | `docs/hrm/MOBILE_W7_DATA_CONTRACTS.md` §5 · `GET /employees?view=directory` · `GET /employees/{id}?view=directory&include_attendance_today=true` |
| **UF / J-*** | **J-MOB-30** (tab + row→detail L2.5) · **J-MOB-16** (directory regression) · **J-AVT-03** (colleague avatar list/detail) |
| **Catalog neo** | roster `MOB-TEAM-DIR` · `MOB-TEAM-DETAIL` · prior device evidence J-MOB-30 CLOSED (design pack re-baseline) |
| **author** | qa · `PO-ECO-TC-MOB-TEAM-01` |
| **work_item_id** | `PO-ECO-TC-MOB-TEAM-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |
| **Persona lock** | ESS **`uat.nv0002@xe.vn`** / **`uat.nv0003@xe.vn`** · QL **`uat.nv0001@xe.vn`** (mgr chip counts / scope) · **cấm** dùng seed script làm precond UAT |
| **Locks** | U65 zero-seed · U76 HDSD · U78 test-log when executed · **cấm** UAT DONE |

> Chuẩn: IEEE 829 / ISO 29119 lean — pack **thiết kế** TC; execution device = wave sau.  
> **Check-in mutate / lịch sử chấm công:** **`MOB-ATTENDANCE.md`** — chỉ **entry** từ `team-directory-checkin-link`.  
> **Self profile ESS (3 tab, avatar upload, PATCH):** **`MOB-PROFILE.md`** — colleague detail **read-only**; không duplicate ESS save.

---

## 0. Spec read ack (inventory source)

| Source | Path | Sections used |
|--------|------|----------------|
| List screen | `apps/mobile/hrm-mobile/src/features/team/TeamDirectoryScreen.tsx` | search debounce 300ms · chips · SectionList · pull refresh · check-in link |
| Detail screen | `apps/mobile/hrm-mobile/src/features/team/TeamColleagueDetailScreen.tsx` | hero · 3 sections · quick actions · shimmer |
| Row | `apps/mobile/hrm-mobile/src/components/team/TeamDirectoryRow.tsx` | avatar ring · badge · dept strip · press ≥44px |
| List integration | `apps/mobile/hrm-mobile/src/integrations/hrmTeamDirectory.ts` | `loadTeamDirectoryWithAttendance` · Plane B `company_id` |
| Detail integration | `apps/mobile/hrm-mobile/src/integrations/hrmEmployeeDirectory.ts` | `fetchEmployeeDirectoryDetail` · `view=directory` |
| Pure helpers | `apps/mobile/hrm-mobile/src/utils/teamDirectory.ts` · `teamDirectoryDetail.ts` | filters · accent-fold search · map fields · tel/mailto |
| Nav | `navigation/RootNavigator.tsx` AttendanceStack · `mainTabIa.ts` | Tab **Đội nhóm** · initial `TeamDirectory` |
| Data contract | `docs/hrm/MOBILE_W7_DATA_CONTRACTS.md` | §5 field matrix · VAL-W7-DIR-* |
| Journey | `docs/program/PROGRAM_JOURNEY_MAP.md` | J-MOB-30 · J-MOB-16 |
| Roster | `docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md` | MOB-TEAM-DIR · MOB-TEAM-DETAIL |
| Cross-pack | `MOB-HOME.md` · `MOB-PROFILE.md` · `MOB-ATTENDANCE.md` | Home tile · Profile check-in tile · CheckIn depth |

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| SCR-TEAM-TAB | tab root | `TabAttendance` → `TeamDirectory` | Danh bạ nhóm theo phòng ban | loading shimmer · list · empty · error banner |
| SCR-TEAM-SEARCH | chrome | list header | Ô tìm kiếm + chip trạng thái chấm | debounce · clear |
| SCR-TEAM-SECT | inline | SectionList headers | Tiêu đề phòng + count + color strip | sticky |
| ROW-TEAM-MEM | row | `TeamDirectoryRow` | Avatar · tên · job · dept · badge chấm | press → detail |
| SCR-TEAM-EMPTY | inline | `ListEmptyComponent` | «Không tìm thấy nhân viên» | search no match |
| SCR-TEAM-ERR | inline | `team-directory-error` | Lỗi phạm vi / API khi list trống | scope missing |
| LINK-TEAM-CHK | footer FAB | `team-directory-checkin-link` | «Chấm công của tôi» | absolute bottom |
| SCR-COL-DET | page | `TeamColleagueDetail` | Hồ sơ đồng nghiệp read-only | shimmer · content · error |
| SCR-COL-HERO | inline | `EmployeeHeroCard` | Tên · subtitle · avatar · badge chấm | `employee-detail` |
| SCR-COL-QA | inline | `QuickActionRow` | Gọi / Email (khi có dữ liệu) | 0–2 actions |
| SCR-COL-CONTACT | section | `team-colleague-section-contact` | Email · Điện thoại | masked/— per VAL-W7-DIR-03 |
| SCR-COL-WORK | section | `team-colleague-section-work` | Mã · phòng · chức danh · trạng thái LV | label VI not raw key |
| SCR-COL-ATT | section | `team-colleague-section-attendance` | Giờ chấm · trạng thái hôm nay | dd/MM/yyyy HH:mm |
| CMP-SHIM-LIST | inline | `ListShimmerPlaceholder` | Skeleton list first paint | count=8 |
| CMP-SHIM-DET | inline | `TeamColleagueDetailShimmer` | Skeleton detail | |

**Stack cross-ref (entry only):** `CheckIn` · `AttendanceHistory` → **MOB-ATTENDANCE** · không matrix depth tại pack này.

**Đếm in-scope surfaces:** tab=1 · chrome=1 · sections/rows=3 · empty/error=2 · footer link=1 · detail page + inline=6 · shimmer=2 → **16** ids (+ 2 cross-ref screens)

---

## 2. Field dictionary (display + controls)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API / source | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|--------------|--------|-------|
| F-TAB-LABEL | Đội nhóm | SCR-TEAM-TAB | tab | Y | 4-tab IA | `mainTabIa` | | TabAttendance |
| F-SEARCH | Tìm kiếm nhân viên | SCR-TEAM-SEARCH | TextInput | N | a11y label · minH 44 | client + GET `q` ≥2 chars | plain | `team-directory-search` |
| F-SEARCH-PH | Tìm theo tên, mã, phòng ban… | SCR-TEAM-SEARCH | placeholder | N | R1 | | | |
| F-CHIP-ALL | Tất cả | SCR-TEAM-SEARCH | chip | Y | count dynamic | client filter | integer badge | FilterChipRow |
| F-CHIP-IN | Đã chấm | SCR-TEAM-SEARCH | chip | N | attendance map | `checked_in` | | |
| F-CHIP-OFF | Chưa chấm | SCR-TEAM-SEARCH | chip | N | | `not_checked_in` | | |
| F-DATE-HINT | Trạng thái chấm công hôm nay | SCR-TEAM-SEARCH | text | N | today label API | load result `date` | dd/MM/yyyy | `team-directory-date` |
| F-SECT-TITLE | Tên phòng ban | SCR-TEAM-SECT | header | Y | «Khác» fallback | dept group | VI | `team-directory-section-*` |
| F-SECT-COUNT | Số NV trong phòng | SCR-TEAM-SECT | text | Y | = section.data.length | client | integer | |
| F-SECT-STRIP | Vạch màu phòng | SCR-TEAM-SECT | strip | N | deterministic hash | `resolveDepartmentColorStrip` | hex | |
| F-ROW-NAME | Họ tên | ROW-TEAM-MEM | text | Y | not UUID | `full_name` | plain VI | row title |
| F-ROW-JOB | Chức danh | ROW-TEAM-MEM | text | Y | no raw `job_title_key` | catalog resolve | VI | `*-job` testID |
| F-ROW-DEPT | Phòng ban | ROW-TEAM-MEM | text | Y | | department | VI | |
| F-ROW-CODE | Mã nhân viên | ROW-TEAM-MEM | text | N | | `employee_code` | | footnote |
| F-ROW-AVATAR | Ảnh + dot chấm | ROW-TEAM-MEM | avatar ring | N | J-AVT-03 | `avatar_url` | image | `*-avatar` |
| F-ROW-BADGE | Đã chấm / Chưa chấm | ROW-TEAM-MEM | StatusBadge | Y | BR-DIR-01 | attendance compose | label VI | `*-badge` |
| F-EMPTY | Không tìm thấy nhân viên | SCR-TEAM-EMPTY | text | N | AC-DIR-01 negative | — | | must_keep copy |
| F-ERR-SCOPE | Cần phạm vi công ty | SCR-TEAM-ERR | text | N | no company id | — | VI | |
| F-LINK-CHK | Chấm công của tôi | LINK-TEAM-CHK | button | N | ≥44px | nav CheckIn | | entry MOB-ATTENDANCE |
| F-DET-ROOT | Chi tiết đồng nghiệp | SCR-COL-DET | scroll layout | Y | read-only | GET directory detail | | `team-colleague-detail` |
| F-HERO-NAME | Họ tên | SCR-COL-HERO | text | Y | | `full_name` | VI | `employee-detail` |
| F-HERO-SUB | Phòng · Chức danh | SCR-COL-HERO | subtitle | Y | | compose heroSubtitle | VI | |
| F-HERO-AVT | Avatar colleague | SCR-COL-HERO | image | N | J-AVT-03 | `avatar_url` | | read-only |
| F-HERO-ATT-BADGE | Trạng thái chấm hero | SCR-COL-HERO | badge | N | | attendance_today | tone success/neutral | |
| F-QA-CALL | Gọi | SCR-COL-QA | quick action | N | `hasDialablePhone` | `tel:` | | hidden if — |
| F-QA-EMAIL | Email | SCR-COL-QA | quick action | N | VAL-W7-DIR-03 | `mailto:` | | hidden if masked/— |
| F-CON-EMAIL | Email | SCR-COL-CONTACT | row | N | non-HR mask | optional API | VI/mask | IconDetailRow |
| F-CON-PHONE | Điện thoại | SCR-COL-CONTACT | row | N | tenant policy | `phone_number` | | |
| F-WORK-CODE | Mã nhân viên | SCR-COL-WORK | row | Y | | `employee_code` | | |
| F-WORK-DEPT | Phòng ban | SCR-COL-WORK | row | Y | | department | VI | |
| F-WORK-JOB | Chức danh | SCR-COL-WORK | row | Y | localized | `job_title_key` → label | VI | |
| F-WORK-STATUS | Trạng thái | SCR-COL-WORK | row | Y | no raw `active` | `status` | DNA label VI | |
| F-ATT-TIME | Giờ chấm công | SCR-COL-ATT | row | N | | `check_in_at` | dd/MM/yyyy HH:mm | numeric row |
| F-ATT-STATUS | Trạng thái chấm công | SCR-COL-ATT | row | Y | | attendance label | VI | |

**Đếm fields:** **35**

---

## 3. Function inventory

| fn_id | UI (nút/menu) | screen_id | precond | API / nav | success FE + reopen | fail / edge | HDSD |
|-------|---------------|-----------|---------|-----------|---------------------|-------------|------|
| FN-TAB-TEAM | Tab **Đội nhóm** | SCR-TEAM-TAB | logged in | — | `team-directory-screen` · large title | | J-MOB-30 |
| FN-DIR-LOAD | Mở / focus tab | SCR-TEAM-TAB | scope company | GET directory + attendance | rows grouped · date hint | scope error · partial members+banner | AC-DIR-01 |
| FN-DIR-REFRESH | Kéo làm mới list | SCR-TEAM-TAB | online | same load | members refresh · chip counts update | stale gen cancelled (NFR-W7-04) | |
| FN-DIR-SEARCH | Gõ tìm kiếm | SCR-TEAM-SEARCH | | debounce 300ms · GET q if ≥2 | list filters · empty copy if none | accent-fold client (Nguyen/Nguyễn) | AC-DIR-01 |
| FN-DIR-CHIP | Chọn chip filter | SCR-TEAM-SEARCH | members loaded | client `applyTeamDirectoryFilters` | visible rows match chip · counts on chips | chip+search intersect | BR-DIR-01 |
| FN-DIR-ROW | Tap row đồng nghiệp | ROW-TEAM-MEM | row id | nav detail | `TeamColleagueDetail` same id | empty id no-op | AC-DIR-02 · J-MOB-30 |
| FN-DIR-CHK-LINK | Chấm công của tôi | LINK-TEAM-CHK | | nav `CheckIn` | CheckIn screen · **stop** MOB-ATTENDANCE | | entry |
| FN-DET-LOAD | Mở detail | SCR-COL-DET | employeeId param | GET `view=directory` | hero + 3 sections | 404/409 message VI | VAL-W7-DIR-01 |
| FN-DET-REFRESH | Pull refresh detail | SCR-COL-DET | | GET retry | fields update | error banner persist | |
| FN-DET-BACK | Back stack | SCR-COL-DET | | pop | list scroll position reasonable | | L2.5 |
| FN-QA-CALL | Quick Gọi | SCR-COL-QA | dialable phone | Linking tel | OS dialer opens | no action if — | |
| FN-QA-MAIL | Quick Email | SCR-COL-QA | mailable email | Linking mailto | OS mail client | VAL-W7-DIR-03 non-HR | |
| FN-HOME-TEAM | Home tile → directory | *(MOB-HOME)* | | nav TeamDirectory | parity with tab | | cross-ref |
| FN-PROF-CHK-ENTRY | Profile quick chấm | *(MOB-PROFILE)* | | CheckIn not list | different entry same target | | MOB-PROFILE entry only |

**Đếm functions:** **14** in-pack (+ 2 cross-ref entries documented)

---

## 4. Test case matrix

### Quy ước

- **TC-ID:** `TC-MOB-TEAM-<area>-<nnn>` · Type: `HP` · `FD` · `BD` · `AU` · `UX` · `NAV` · `REG` · `PAR`
- **Layer:** DEVICE · UNIT (vitest helpers) · API parity optional
- **Status mặc định:** `PLANNED` (design pack)
- **Precond U65:** colleagues visible chỉ sau login pilot + dữ liệu workforce sẵn có env — **không** `pnpm seed:*` trong evidence.

### 4.1 J-MOB-30 · Tab landing + L2.5 list→detail

| TC-ID | Type | Covers | Persona | Precond | Steps (HDSD) | Expected | Automate | Status |
|-------|------|--------|---------|---------|--------------|----------|----------|--------|
| TC-MOB-TEAM-J30-HP-001 | HP | FN-TAB-TEAM · FN-DIR-LOAD | uat.nv0002 | U65 login | Tab **Đội nhóm** | `team-directory-screen` · ≥1 section or honest empty · no uncaught | DEVICE | PLANNED |
| TC-MOB-TEAM-J30-HP-002 | HP | FN-DIR-ROW · FN-DET-LOAD | uat.nv0002 | ≥1 row in scope | Tap row → observe detail | `team-colleague-detail` · hero name matches list · GET detail 200 same `employee_id` | DEVICE | PLANNED |
| TC-MOB-TEAM-J30-NAV-001 | NAV | FN-DET-BACK | uat.nv0002 | detail open | Hardware/back → list | List visible · no duplicate stack crash | DEVICE | PLANNED |
| TC-MOB-TEAM-J30-REG-001 | REG | J-MOB-16 smoke | uat.nv0002 | prior J-MOB-30 PASS | Kill app → tab Đội nhóm → row→detail | Same as J30-HP-002 | DEVICE | PLANNED |

### 4.2 Search · chips · empty (AC-DIR-01 · NFR-W7-04)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-TEAM-SRCH-HP-001 | HP | FN-DIR-SEARCH | uat.nv0002 | known colleague name fragment | Type ≥2 chars of real name | Matching rows · chip counts update · debounce ≤400ms feel | DEVICE | PLANNED |
| TC-MOB-TEAM-SRCH-HP-002 | HP | accent-fold | uat.nv0002 | name with diacritics in DB | Type ASCII equivalent (e.g. Nguyen) | Client match ≥1 row (vitest parity) | UNIT+DEVICE | PLANNED |
| TC-MOB-TEAM-SRCH-FD-001 | FD | F-EMPTY | uat.nv0002 | | Search `ZzzNoMatch999` | `team-directory-empty` «Không tìm thấy nhân viên» · chips show 0 where applicable | DEVICE | PLANNED |
| TC-MOB-TEAM-SRCH-BD-001 | BD | R1 min chars | uat.nv0002 | | Type 1 char only | Client filter only · no storm GET | DEVICE | PLANNED |
| TC-MOB-TEAM-CHIP-HP-001 | HP | FN-DIR-CHIP | uat.nv0002 | mixed check-in day | Tap **Đã chấm** then **Chưa chấm** then **Tất cả** | Rows ⊆ chip predicate · badge labels VI | DEVICE | PLANNED |
| TC-MOB-TEAM-CHIP-HP-002 | HP | F-CHIP-* counts | uat.nv0002 | search active | Filter search then observe chip counts | Counts reflect searched subset not full 213 stale | DEVICE | PLANNED |

### 4.3 List UX · scope · refresh

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-TEAM-LST-UX-001 | UX | FN-DIR-REFRESH | uat.nv0002 | list loaded | Pull refresh | Refreshing ends · date hint stable dd/MM | DEVICE | PLANNED |
| TC-MOB-TEAM-LST-UX-002 | UX | F-SECT-* | uat.nv0002 | ≥2 departments | Scroll sections | Sticky headers · strip color · count matches rows | DEVICE | PLANNED |
| TC-MOB-TEAM-LST-FD-001 | FD | F-ERR-SCOPE | uat.nv0003 | sim no company scope if repro | Open tab | `team-directory-error` VI · empty list | DEVICE | PLANNED |
| TC-MOB-TEAM-LST-AU-001 | AU | active only | uat.nv0002 | | Scan list rows | No `inactive` raw status on rows · names not UUID | DEVICE | PLANNED |

### 4.4 Row presentation (AC-DIR-03 · J-AVT-03)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-TEAM-ROW-HP-001 | HP | F-ROW-* | uat.nv0002 | row with avatar | Inspect row | Avatar or initials ring · job/dept VI · badge | DEVICE | PLANNED |
| TC-MOB-TEAM-ROW-UX-001 | UX | touch target | uat.nv0002 | | Tap row pressable | `*-press` fires · min row height ≥44 | DEVICE | PLANNED |
| TC-MOB-TEAM-ROW-PAR-001 | PAR | scope parity | uat.nv0002 | list id X | Network: list contains id → detail GET same id | Both 200 or both 404 — **VAL-W7-DIR-01** | DEVICE+API | PLANNED |

### 4.5 Colleague detail sections (AC-DIR-02 · read-only)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-TEAM-DET-HP-001 | HP | SCR-COL-* sections | uat.nv0002 | detail open | Scroll Liên hệ · Công việc · Chấm công hôm nay | All section testIDs present · values — or formatted · no raw ISO | DEVICE | PLANNED |
| TC-MOB-TEAM-DET-HP-002 | HP | F-WORK-STATUS | uat.nv0002 | | Observe trạng thái LV | Label VI (e.g. Đang làm việc) not `active` | DEVICE | PLANNED |
| TC-MOB-TEAM-DET-HP-003 | HP | F-ATT-TIME | uat.nv0002 | colleague checked in today | Section chấm công | `checkInAt` dd/MM/yyyy HH:mm or — | DEVICE | PLANNED |
| TC-MOB-TEAM-DET-FD-001 | FD | FN-DET-LOAD 404 | uat.nv0002 | deep link stale id if reproducible | Open detail bad id | Error VI · no crash · shimmer ends | DEVICE | PLANNED |
| TC-MOB-TEAM-DET-UX-001 | UX | FN-DET-REFRESH | uat.nv0002 | | Pull refresh detail | Shimmer only when no fields yet | DEVICE | PLANNED |

### 4.6 PII · quick actions (VAL-W7-DIR-03)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-TEAM-PII-AU-001 | AU | VAL-W7-DIR-03 | uat.nv0003 | non-HR ESS | Open colleague detail | Email not full plaintext if policy masks · phone per tenant | DEVICE | PLANNED |
| TC-MOB-TEAM-QA-HP-001 | HP | FN-QA-CALL | uat.nv0001 | colleague with phone | Tap **Gọi** if visible | OS dialer · `tel:` scheme | DEVICE | PLANNED |
| TC-MOB-TEAM-QA-HP-002 | HP | FN-QA-MAIL | uat.nv0001 | mailable email | Tap **Email** if visible | mailto opens | DEVICE | PLANNED |
| TC-MOB-TEAM-QA-FD-001 | FD | hidden actions | uat.nv0003 | fields — | Detail without phone/email | `team-colleague-quick-actions` empty or no buttons | DEVICE | PLANNED |

### 4.7 Cross-pack entry (no CheckIn depth)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-TEAM-NAV-CHK-001 | NAV | FN-DIR-CHK-LINK | uat.nv0002 | | Tap **Chấm công của tôi** | CheckIn screen · **stop** → MOB-ATTENDANCE TC-MOB-ATT-* | DEVICE | PLANNED |
| TC-MOB-TEAM-NAV-HOME-001 | NAV | FN-HOME-TEAM | uat.nv0002 | | Home quick tile team (MOB-HOME) | Lands `team-directory-screen` same as tab | DEVICE | PLANNED |
| TC-MOB-TEAM-NAV-PROF-001 | NAV | contrast MOB-PROFILE | uat.nv0003 | | Profile tab Công việc → Chấm công tile vs Team link | Both reach CheckIn · **Profile ESS not colleague detail** | DEVICE | PLANNED |

### 4.8 Unit parity (optional gate)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-TEAM-UNIT-001 | PAR | applyTeamDirectoryFilters | CI | | `pnpm --filter hrm-mobile test teamDirectory.test.ts` | exit 0 · chip/search cases | UNIT | PLANNED |
| TC-MOB-TEAM-UNIT-002 | PAR | mapColleagueDetailFields | CI | | test employeeDetailUx / directory detail tests | hero subtitle · badge mapping | UNIT | PLANNED |

### Coverage check

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions ≥1 HP | 14 | 14 | 0 |
| J-MOB-30 L2.5 explicit | 1 | J30-HP-002 | 0 |
| J-MOB-16 regression | 1 | J30-REG-001 | 0 |
| Search happy + empty | 2 | SRCH-HP-001 · SRCH-FD-001 | 0 |
| Chip filters | 1 | CHIP-HP-001 | 0 |
| Scope parity VAL-W7-DIR-01 | 1 | ROW-PAR-001 | 0 |
| PII VAL-W7-DIR-03 | 1 | PII-AU-001 | 0 |
| Detail read-only sections | 3 | DET-HP-001..003 | 0 |
| CheckIn entry only | 1 | NAV-CHK-001 | 0 |
| MOB-PROFILE contrast | 1 | NAV-PROF-001 | 0 |
| No ESS mutate dup | policy | cross-ref §6 | 0 |

**TC count:** **32** PLANNED (design)

---

## 5. Traceability

| TC-ID | SRS / UC | TechSpec / doc | API | Catalog / J-* | HDSD |
|-------|----------|----------------|-----|---------------|------|
| TC-MOB-TEAM-J30-HP-001 | UC-HRM-MOB-16 | §4.2 Directory screen | GET `view=directory` | **J-MOB-30** | Tab Đội nhóm |
| TC-MOB-TEAM-J30-HP-002 | AC-DIR-02 | Detail screen | GET `/employees/{id}?view=directory` | **J-MOB-30** L2.5 | Tap đồng nghiệp |
| TC-MOB-TEAM-J30-REG-001 | UC-HRM-MOB-16 | W7-5 | | **J-MOB-16** | Regression directory |
| TC-MOB-TEAM-SRCH-HP-001 | AC-DIR-01 | NFR-W7-04 | GET `q` | | Tìm tên/mã |
| TC-MOB-TEAM-ROW-PAR-001 | VAL-W7-DIR-01 | Plane B company_id | list+detail | scope_parity | |
| TC-MOB-TEAM-PII-AU-001 | VAL-W7-DIR-03 | DATA_CONTRACTS §5 | directory view | privacy | Liên hệ |
| TC-MOB-TEAM-ROW-HP-001 | AC-DIR-03 | Avatar ring | | **J-AVT-03** | Avatar row |
| TC-MOB-TEAM-NAV-CHK-001 | check-in entry | CheckIn stack | | → MOB-ATTENDANCE | Chấm công của tôi |
| TC-MOB-TEAM-NAV-PROF-001 | UC-HRM-MOB-12 vs 16 | | | **MOB-PROFILE** contrast | Self vs colleague |

---

## 6. Out of scope / cross-pack

| Item | Owner pack | TC in MOB-TEAM |
|------|------------|----------------|
| CheckIn GPS mutate · AttendanceHistory | **MOB-ATTENDANCE** | NAV-CHK-001 entry only |
| Self Profile 3-tab · ESS PATCH · avatar upload | **MOB-PROFILE** | NAV-PROF-001 contrast · **no** colleague edit |
| Home hub · FAB · carousel | **MOB-HOME** | NAV-HOME-001 entry |
| Manager org chart / hierarchy edges | SRS W7 org chart OOS | list ≠ manager tree |
| Leave / Approvals | **MOB-LEAVE-APPR** | — |
| `date_of_birth` on directory | DATA_CONTRACTS forbidden | AU list scan |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-mob-team-01.md
next_owner: qa-synth (rollup PO_SPEC_TEST_REPORT + roster MOB-TEAM-DIR/DETAIL)
counts: screens=16 in-scope (+2 cross-ref) fields=35 functions=14 tcs=32 (all PLANNED design)
catalog_map: J-MOB-30 · J-MOB-16 · J-AVT-03 · VAL-W7-DIR-01/03 · AC-DIR-01..03
cross_ref: MOB-PROFILE (self ESS) · MOB-HOME (tile) · MOB-ATTENDANCE (CheckIn depth)
```

*PO-ECO-TC-MOB-TEAM-01 · WORLD-STANDARD depth pack · no UAT execution claim*
