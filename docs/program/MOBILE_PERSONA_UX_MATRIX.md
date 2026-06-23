# Mobile Persona UX Matrix — NV / Quản lý / Lãnh đạo (MOB-UX-13-BA)

**work_item_id:** `MOB-UX-13-BA`  
**from_role:** ba-process  
**to_role:** pm  
**lane:** governance  
**ack_status:** `PASS_TO_PM`  
**trigger:** Sponsor 2026-06-08 — phân biệt UX mobile theo vai; Apple HIG §3–4 (`MOBILE_APPLE_HIG_ESS_PROGRAM.md`)  
**evidence_path:** `docs/program/MOBILE_PERSONA_UX_MATRIX.md`  
**Ngày:** 2026-06-09

**SoT liên kết:** `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` §2.2–2.3 · `MOBILE_APPLE_HIG_ESS_PROGRAM.md` · `MOBILE_HOME_PORTAL_AC_DELTA.md` · `PROGRAM_JOURNEY_MAP.md`

---

## 1. Process objective and actors

| Actor | Vai trò |
|-------|---------|
| **Nhân viên** | ESS tự phục vụ: chấm công, nghỉ, phiếu lương, hành trình; không thấy form UUID / không duyệt cấp dưới |
| **Quản lý** | Inbox duyệt hero + đội snapshot; FAB ưu tiên duyệt; tile «Duyệt»; không form chấm công thủ công cho cấp dưới |
| **Lãnh đạo** | Pulse tập đoàn / đơn vị: headcount, % chấm công, đơn chờ rollup; directory rollup; không check-in tay |
| Dev-Mobile | `resolveMobilePersona()` → 3 layout Home (MOB-UX-13e); tile visibility; copy «vị trí thiết bị» |
| Dev-BE | `GET /home/summary` `viewer.is_manager`; `manager_employee_id` filters; leader aggregate optional |
| QA / QA-Device | Persona screenshot pack + J-MOB regression; Android 3-button inset |

**Mục tiêu:** Một tài liệu duy nhất để sponsor, Dev, QA trả lời «NV thấy gì khác QL khác lãnh đạo» — map web HRM → tile mobile + AC đo được.

---

## 2. Persona definition (JWT / seed signal)

### 2.1 Ba persona lane (MOB-UX-13e target)

| Persona | Mã | Resolver signal (ưu tiên) | `resolveMobilePersona()` |
|---------|-----|----------------------------|--------------------------|
| **Nhân viên** | `EMP` | JWT `roles` không có `manager`/`hr_manager`; `GET /home/summary` → `viewer.is_manager = false` | `employee` |
| **Quản lý** | `MGR` | JWT `roles` ∋ `manager` **hoặc** `hr_manager`; có `manager_employee_id` filter trả pending ≥ 0 (seed) | `manager` |
| **Lãnh đạo** | `LDR` | `job_title_key` ∈ `{CEO, COO, CFO, CHRO, CTO, DIRECTOR, …}` **và** (`default_company_id = main` **hoặc** membership rollup holding) | `leader` |

**Thứ tự ưu tiên layout:** `LDR` > `MGR` > `EMP` — lãnh đạo có thể đồng thời là quản lý; Home dùng layout lãnh đạo khi `LDR` true.

**Cấm:** Chỉ dùng một boolean `auth.isManager` cho cả 3 lane (as-is gap — MOB-UX-13e fix).

### 2.2 Tài khoản mẫu (QA / sponsor screenshot)

| Persona | Account | Mật khẩu | `employee_code` (seed) | `company_id` | Ghi chú seed |
|---------|---------|----------|------------------------|--------------|--------------|
| **Nhân viên** | `uat.nv0001@xe.vn` | `xevn-uat-2026` | `HLD-0001` | `holding` | UAT0001 · `seed:hrm:uat-mob-pilot-qual` · payslip + leave balance · **layout EMP** khi `is_manager=false` |
| **Quản lý** | `uat.nv0002@xe.vn` | `xevn-uat-2026` | `TRS-0002` | `trsport` | COO · team directory + duyệt · MOB-UX-12b/12 device SoT |
| **Lãnh đạo (slice)** | `ceo@xe.vn` | `Xevn@2026` | portal CEO | `main` / rollup | Group CEO mobile slice — pulse/báo cáo P1; **không** thay UAT NV cho ESS regression |

**Phụ (subordinate):** `uat.nv0005@xe.vn` — báo cáo cho `uat.nv0001` khi seed manager pending (`SUBORDINATE_SEQ=5`).

**Pre-flight QA:**

```bash
pnpm run seed:hrm:1000-uat
pnpm run seed:hrm:uat-mob-pilot-qual
```

---

## 3. Tab bar và FAB — visibility theo persona

### 3.1 Bottom tab (4-tab lock — không đổi)

| Tab | Label | Icon | EMP | MGR | LDR | Ghi chú |
|-----|-------|------|-----|-----|-----|---------|
| `TabDashboard` | Trang chủ | home | ✅ | ✅ | ✅ | Layout scroll khác nhau §4 |
| `TabAttendance` | Đội nhóm | people | ✅ | ✅ | ✅ | LDR: rollup directory; EMP: colleagues same dept |
| `TabPayslip` | Phiếu lương | wallet | ✅ | ✅ | ✅ | LDR: có thể ẩn hero nếu không có payslip self — vẫn giữ tab |
| `TabProfile` | Hồ sơ | person | ✅ | ✅ badge optional | ✅ | MGR: badge khi pending inbox > 0 |

**Cấm:** Tab thứ 5; đổi label theo persona (D-MOB-UX09-IA-01 backlog tách).

### 3.2 Center FAB sheet (`resolveFabPrimaryActions`)

| Hàng FAB | EMP | MGR | LDR |
|----------|-----|-----|-----|
| Chấm công | ✅ | ✅ | ❌ **ẩn** (BR-PERS-CHK-01) |
| Tạo đơn nghỉ | ✅ | ✅ | ✅ (self only) |
| Duyệt đơn (+ badge) | ❌ | ✅ | ✅ (rollup count) |

### 3.3 Stack ẩn / không promote

| Màn | EMP | MGR | LDR |
|-----|-----|-----|-----|
| `CheckInScreen` manual UUID/lat | ❌ FAIL | ❌ FAIL | N/A |
| `ManagerApprovalsScreen` | ẩn menu | ✅ promoted | ✅ |
| Leader «Báo cáo nhanh» widget | ❌ | 🟡 read-only | ✅ P1 |

---

## 4. Home hub — khác biệt theo persona

### 4.1 Thứ tự scroll (Apple HIG — ≤ 2 section trước action grid cho EMP polish 13c)

| Lớp | EMP | MGR | LDR |
|-----|-----|-----|-----|
| 1. Portal header + carousel | ✅ | ✅ | ✅ + subtitle đơn vị |
| 2. **Hero inbox** | — | **«Cần duyệt (n)»** card P0 | **«Pulse tập đoàn»** KPI row P1 |
| 3. Pending strip (J-MOB-31) | own tasks | mgr pending | rollup pending |
| 4. Action grid 3×2 (≥ 9 tiles) | ✅ full ESS | tile «Duyệt» | ẩn «Chấm công» tile optional |
| 5. Payslip feed teaser | ✅ | ✅ | optional |
| 6. Smart Hub (U48) | Việc cần làm → Hôm nay → Sinh nhật → Ai nghỉ | Cần duyệt → Việc → … | Báo cáo nhanh → Việc rollup |
| 7. Hành trình / văn hóa (13g) | timeline self | team tenure | org milestones P1 |

### 4.2 Copy và data (BR-PERS-UI)

| Rule | EMP | MGR | LDR |
|------|-----|-----|-----|
| Greeting | `full_name` + `employee_code` | + «Quản lý» subtitle | + chức danh VI từ catalog |
| Stats labels | «Đơn chờ» / «Đồng nghiệp» | «Đơn chờ duyệt» / «Đội đang làm» | «NV active» / «% có mặt» |
| Ngôn ngữ UI | 100% VI — không raw `job_title_key` | same | same |
| Vị trí check-in | «Vị trí thiết bị» / «Đang lấy vị trí…» | same | N/A (no check-in) |

---

## 5. Use-case catalog (persona-scoped)

| UC-ID | Tên | Persona | API / màn | Happy | Alternate | Exception |
|-------|-----|---------|-----------|-------|-----------|-----------|
| **UC-MOB-PERS-01** | Login ESS | ALL | `POST /auth/mobile/login` | 200 + token + `employee` | membership > 1 → Scope screen | 401 `HRM-AUTH-001` |
| **UC-MOB-PERS-02** | Home layout EMP | EMP | `TabDashboard` | «Việc cần làm» trước grid; không «Cần duyệt» | empty tasks → empty state VI | `is_manager=true` nhầm → **FAIL** AC-PERS-EMP-02 |
| **UC-MOB-PERS-03** | Home layout MGR | MGR | `GET /home/summary?include=manager_pending` | Card «Cần duyệt (n)» n>0 sau seed | n=0 → empty không crash | pending API 403 → banner lỗi |
| **UC-MOB-PERS-04** | Home layout LDR | LDR | compose reports + summary | Pulse counters > 0 khi rollup seed | counters 0 → «Chưa có số liệu» | scope 409 → không crash |
| **UC-MOB-PERS-05** | Chấm công vị trí thiết bị | EMP, MGR | `CheckInScreen` + `POST /attendance/records` | Auto lat/lng; tên+ mã NV | permission denied → «Không lấy được vị trí thiết bị» | UUID field visible → **FAIL** AC-PERS-LOC-01 |
| **UC-MOB-PERS-06** | Duyệt đơn cấp dưới | MGR, LDR | `ManagerApprovalsScreen` | Approve → snackbar VI | reject + lý do | raw `HRM-ATT-REQ-203` on UI → FAIL |
| **UC-MOB-PERS-07** | Directory đội nhóm | ALL | `TeamDirectoryScreen` | list → row → detail (J-MOB-30) | filter chip | raw job key on row → FAIL |
| **UC-MOB-PERS-08** | Hành trình / văn hóa | EMP | Home timeline card (13g) | tenure + celebration | no data → ẩn section | English raw keys → FAIL |

---

## 6. Web HRM module → Mobile tile map (linkage + AC)

> Nguồn web: `HRM_MENU_DATA_LINKAGE_MATRIX.md` §2.2. Prefix API `/api/hrm`.

| Web route / module | UC web | Mobile surface | Tile / Tab | API mobile (primary) | Persona | AC-ID | Min density / pass |
|--------------------|--------|----------------|------------|----------------------|---------|-------|-------------------|
| `/employees` | HRM-EM-02 | **Đội nhóm** tab | Tab `TabAttendance` | `GET /employees?view=directory` | ALL | **AC-PERS-TILE-DIR-01** | ≥ 1 row; tap → detail J-MOB-30 |
| `/employees/:id` | HRM-EM-03 | `TeamColleagueDetailScreen` | row tap | `GET /employees/:id` | ALL | **AC-PERS-TILE-DIR-02** | `full_name` + role VI; not UUID |
| `/contracts` | HRM-CI-03 | **Hồ sơ** → Hợp đồng | tile «Hồ sơ» / Profile contracts | `GET /contracts-insurance/contracts?employee_id=self` | EMP, MGR | **AC-PERS-TILE-CON-01** | ≥ 1 contract UAT NV |
| `/insurance` | HRM-CI-02 | Profile / Giấy tờ | tile «Giấy tờ» (stub P2) | `GET …/insurance/expiring` | EMP | **AC-PERS-TILE-INS-01** | expiring 200 or stub modal |
| `/recruitment` | HRM-RC-02 | Manager tile backlog | tile «Vận hành»/leader widget P2 | `GET /recruitment/requisitions` | MGR, LDR | **AC-PERS-TILE-REC-01** | Phase 2 — stub «Sắp ra mắt» |
| `/attendance` | HRM-AT-02 | **Chấm công** | tile «Chấm công» + FAB | `POST/GET /attendance/records` | EMP, MGR | **AC-PERS-TILE-ATT-01** | ≥ 1 record / 30 ngày; **AC-PERS-LOC-01** |
| `/attendance` history | HRM-AT-11 | Lịch sử chấm công | CheckIn → History link (13a) | `GET /attendance/records` | EMP, MGR | **AC-PERS-TILE-ATT-02** | heatmap/tab P0 |
| `/attendance` leave | HRM-AT-06 | **Nghỉ phép** | tile «Nghỉ phép» | `GET/POST /attendance/leave-requests` | EMP | **AC-PERS-TILE-LVE-01** | J-MOB-03 list→detail |
| leave balance | HRM-AT-08 | My Leaves balance | tile «Nghỉ phép» | `GET /attendance/leave-balance` | EMP | **AC-PERS-TILE-LVE-02** | numeric balance UAT0001 |
| `/payroll` | HRM-PR-02 | **Phiếu lương** tab | `TabPayslip` + tile «Lương» | `GET /payroll/payslips?employee_id=` | EMP, MGR | **AC-PERS-TILE-PAY-01** | J-MOB-04; net hero J-MOB-34 |
| `/performance` | HRM-PF-01 | Home widget «Đánh giá kỳ» | Smart Hub widget P1 (13g) | `GET /performance/cycles` | MGR, LDR | **AC-PERS-TILE-PF-01** | read-only; empty OK |
| `/reports` | HRM-PR-06, HRM-OP-04 | Leader «Báo cáo nhanh» | Home LDR section (13e) | `GET /operations/reports/summary` | LDR | **AC-PERS-TILE-RPT-01** | counters > 0 post-seed |
| `/tasks` | HRM-OP-02 | **Vận hành** | tile «Vận hành» / «Việc» | `GET /operations/tasks` | EMP | **AC-PERS-TILE-TSK-01** | optional pilot |
| `/internal-services` | HRM-SV-02 | Vận hành stack | `OperationsScreen` | `GET /operations/service-requests` | EMP, MGR | **AC-PERS-TILE-SR-01** | optional |
| `/settings` | HRM-SC-01 | **Xem thêm** | tile «Xem thêm» → Settings | `GET /settings-catalogs` | ALL | **AC-PERS-TILE-SET-01** | catalog ≥ 8 keys |
| `/decisions` | UC-HRM-27 | — | deferred | none | — | N/A | Phase 2 |
| `/processes` | XBOS workflow | tile «Chính sách» | stub / notifications | catalog ref | ALL | **AC-PERS-TILE-POL-01** | stub không crash |
| Dashboard embed | UC-HRM-20 | Home Smart Hub | `GET /home/summary` | ALL | **AC-PERS-TILE-HUB-01** | tasks + celebrations |
| Mobile login | UC-HRM-MOB-01 | Auth | `POST /auth/mobile/login` | ALL | **AC-PERS-TILE-AUTH-01** | J-MOB-01 |
| Notifications | UC-HRM-MOB-13 | Header bell | `GET /notifications/inbox` | ALL | **AC-PERS-TILE-NTF-01** | badge count |
| Profile ESS | UC-HRM-MOB-12 | **Hồ sơ** tab | `GET /employees/:id` self | ALL | **AC-PERS-TILE-PRF-01** | J-MOB-17 tabs |
| Offline sync | UC-HRM-MOB-14 | Check-in queue | idempotent POST | EMP | **AC-PERS-TILE-OFF-01** | retry PASS |

### 6.1 Action grid tile order (11 tiles — `getQuickAccessTiles`)

| # | Tile ID | Label VI | Web module | Route / stack | EMP | MGR | LDR |
|---|---------|----------|------------|---------------|-----|-----|-----|
| 1 | `time_off` | Nghỉ phép | `/attendance` leave | Leave list / create | ✅ | ✅ | ✅ |
| 2 | `expenses` | Chi phí | — | stub P2 | ✅ stub | ✅ stub | ✅ stub |
| 3 | `letters` | Giấy tờ | insurance/docs | stub P2 | ✅ stub | ✅ stub | ✅ stub |
| 4 | `profile` | Hồ sơ | `/employees/:id` | Profile | ✅ | ✅ | ✅ |
| 5 | `career` | Sự nghiệp | `/contracts` proxy | stub → contracts P1 | ✅ stub | ✅ stub | ✅ |
| 6 | `payroll` | Lương | `/payroll` | Payslip stack | ✅ | ✅ | ✅ |
| 7 | `merits` | Khen thưởng | — | stub P2 | ✅ stub | ✅ stub | ✅ stub |
| 8 | `policies` | Chính sách | `/processes` | stub modal | ✅ | ✅ | ✅ |
| 9 | `checkin` | Chấm công | `/attendance` | CheckIn | ✅ | ✅ | ❌ |
| 10 | `tasks` | **Việc** / **Duyệt** | tasks / approvals | Ops / ManagerApprovals | label **Việc** | label **Duyệt** | **Duyệt** |
| 11 | `more` | Xem thêm | `/settings` | Settings | ✅ | ✅ | ✅ |

---

## 7. Business rules

| BR-ID | Condition | Action | Outcome |
|-------|-----------|--------|---------|
| **BR-PERS-01** | JWT resolved | Map `EMP`/`MGR`/`LDR` per §2.1 | Deterministic Home layout |
| **BR-PERS-02** | `LDR` true | Hide FAB «Chấm công»; hide check-in tile optional | Leader không check-in tay |
| **BR-PERS-03** | `MGR` true | Show «Cần duyệt» before ESS stats; FAB «Duyệt đơn» | Manager inbox first |
| **BR-PERS-04** | `EMP` true | No `manager_employee_id` list on Home load | Self-scope only |
| **BR-PERS-LOC-01** | Check-in UI | Label **«Vị trí thiết bị»** / **«Đang lấy vị trí…»** | **Cấm** «GPS», «geofence», «Bật GPS» |
| **BR-PERS-LOC-02** | Check-in POST | `expo-location` `getCurrentPositionAsync` → `latitude`/`longitude` | **Cấm** manual lat/lng fields |
| **BR-PERS-DIS-01** | Any list row | Show `full_name` + `employee_code` | **Cấm** raw UUID text field |
| **BR-PERS-VI-01** | All labels | Vietnamese from `vi.ts` / `resolveRoleSubtitle` | **Cấm** English raw keys on UI |
| **BR-PERS-TAB-01** | Bottom nav | Exactly 4 tabs §3.1 | No 5th tab |
| **BR-PERS-SAFE-01** | Android 3-button | `insets.bottom` ≥ 24dp fallback | Tab/FAB không che system nav |
| **BR-PERS-LINK-01** | Tile with FK data | Same `company_id` + `employee_id` scope as web matrix §2.3 | 409 → banner, not mock |
| **BR-PERS-STUB-01** | `stub: true` tile | Modal «Sắp ra mắt» + dismiss | No crash; no 500 |

---

## 8. Acceptance criteria (measurable)

| AC-ID | Persona | Pass | Fail |
|-------|---------|------|------|
| **AC-PERS-EMP-01** | EMP | Screenshot `uat.nv0001`: Home không có «Cần duyệt (n)» khi `is_manager=false` | Manager card visible |
| **AC-PERS-EMP-02** | EMP | «Việc cần làm» section trước action grid | Grid trước tasks |
| **AC-PERS-MGR-01** | MGR | Screenshot `uat.nv0002`: «Cần duyệt» hoặc pending strip n≥0 sau seed | No manager affordances |
| **AC-PERS-MGR-02** | MGR | Tile #10 label «Duyệt»; tap → approvals | Label «Việc» |
| **AC-PERS-LDR-01** | LDR | Screenshot `ceo@xe.vn` slice: pulse/báo cáo section (P1 stub OK with copy) | Same as EMP only |
| **AC-PERS-LDR-02** | LDR | FAB không có «Chấm công» | Check-in in FAB |
| **AC-PERS-LOC-01** | EMP,MGR | Check-in: zero «GPS»/«geofence»/UUID input | Any banned string |
| **AC-PERS-LOC-02** | EMP,MGR | Success check-in shows NV name + mã | UUID only |
| **AC-PERS-GRID-01** | ALL | ≥ 9 tiles visible; 100% VI labels | < 9 tiles or English |
| **AC-PERS-TAB-01** | ALL | 4 tabs §3.1; Android nav không overlap | 5 tabs or overlap |
| **AC-PERS-J30-01** | MGR | `uat.nv0002` Đội nhóm list → detail back | 404 / raw keys |
| **AC-PERS-SWIPE-01** | MGR | Swipe action on pending row (13f) when implemented | No swipe backlog OK MOB-UX-13-QA |

**Journey probes (device — MOB-UX-13-QA):**

| J-ID | Persona | Path |
|------|---------|------|
| **J-MOB-36** | EMP | Login `uat.nv0001` → Home EMP layout → tile Nghỉ → detail |
| **J-MOB-37** | MGR | Login `uat.nv0002` → «Cần duyệt» → Duyệt → snackbar |
| **J-MOB-38** | LDR | Login `ceo@xe.vn` → Home LDR pulse → Đội nhóm rollup |
| **J-MOB-02** | EMP | Check-in «Vị trí thiết bị» regression (all personas có check-in) |

---

## 9. Activity flow — persona resolve (MOB-UX-13e)

```text
Login success
  → read JWT roles[], job_title_key, default_company_id
  → GET /home/summary → viewer.is_manager
  → if job_title ∈ LEADER_KEYS && rollup scope → LDR
  → else if is_manager → MGR
  → else → EMP
  → render Home order §4.1 + filter tiles §6.1 + FAB §3.2
```

**Exception:** Summary API fail → fallback EMP layout + error banner (không crash).

---

## 10. Handoff package

| To role | work_item_id | Entry | Exit | Evidence |
|---------|--------------|-------|------|----------|
| **PM** | MOB-UX-13-PROGRAM | This doc PASS | Dispatch MOB-UX-13a..g + QA | `MOBILE_PERSONA_UX_MATRIX.md` |
| **Dev-Mobile** | MOB-UX-13e | §2–§4 persona layouts | `resolveMobilePersona()` + 3 screenshots | vitest persona + device |
| **Dev-Mobile** | MOB-UX-13a | BR-PERS-LOC-* | Check-in hero no UUID/GPS copy | `CheckInScreen.tsx` |
| **Dev-BE** | MOB-UX-13e optional | Leader aggregates | `home/summary` include rollup | `home.service.ts` |
| **QA-Device** | MOB-UX-13-QA | §8 AC + J-MOB-36..38 | Persona pack @ nip.io | `docs/qa/evidence/mob-ux-13-qa-*.md` |

**Residual (not blocking BA):**

| ID | Item | Owner |
|----|------|-------|
| R-PERS-01 | `ceo@xe.vn` mobile login seed chưa trong `uat-mob-pilot-qual` | devops |
| R-PERS-02 | `/performance` widget P1 chưa có component | dev-mobile 13g |
| R-PERS-03 | Recruitment manager tile P2 | backlog |

---

## 11. Open risks

| Risk | Mitigation |
|------|------------|
| `uat.nv0001` seed gán CEO + subordinate → UI manager khi `is_manager=true` | QA chụp EMP pack chỉ khi API `viewer.is_manager=false` **hoặc** dùng account không có role manager |
| Leader slice thiếu mobile password parity | Document portal `ceo@xe.vn` / `Xevn@2026`; block LDR AC nếu login fail — ghi BLOCKED bus |
| Web module không có mobile parity (decisions, tools) | Explicit N/A — không claim fidelity |

---

*BA closure:* `MOB-UX-13-BA` · map web `HRM_MENU_DATA_LINKAGE_MATRIX` → mobile tiles · persona NV/QL/LDR · BR vị trí thiết bị · `PASS_TO_PM`
