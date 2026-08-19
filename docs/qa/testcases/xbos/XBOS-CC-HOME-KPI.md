# Menu TC Pack — `XBOS-CC-HOME-KPI` · CC Home · KPI widgets · Rail GROUP

| Meta | Value |
|------|--------|
| **menu_id** | `XBOS-CC-HOME-KPI` |
| **surface** | `xbos-cc` |
| **route(s)** | `/command-center` · `/login` → CC shell (UF-XBOS-01) |
| **HDSD** | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §3 UF-XBOS-01 · UF-XBOS-10 · pointer UF-XBOS-11 |
| **SRS / FR / UC** | `docs/xbos/COMMAND_CENTER_P0_SRS.md` UC-CC-P0-08 · UC-CC-P0-09 · UC-XBOS-AUTH-01 · UC-XBOS-KPI |
| **TechSpec** | `docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md` · KPI rollup ADR `docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` |
| **API_CONTRACT** | `GET /api/xbos/kpi-engine/rollup` (`XBOS-KPI-202`) · `GET /api/xbos/command-center/workspace-meta` · `GET /api/xbos/workflow-engine/inbox/tasks` · alerts API (UC-CC-P0-09) |
| **UF / J-*** | UF-XBOS-01 · UF-XBOS-10 · **UF-XBOS-11 (negative — exec in member-scope pack, §4.6 pointer only)** · J-CC-01 · J-CC-03 |
| **author** | qa · PO-ECO-TC-XBOS-KPI-RAIL-01 |
| **work_item_id** | `PO-ECO-TC-XBOS-KPI-RAIL-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |

> Chuẩn: IEEE 829 / ISO 29119 lean · U65 precond execution = luồng FE (không seed) · U76 HDSD path trong Steps · **PLANNED** = catalog depth, không claim UAT DONE.

---

## 0. spec_read_ack

| Source | Path | Cited |
|--------|------|--------|
| Depth program | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` | DoD §2 · Wave A CC home/KPI |
| Template | `docs/qa/testcases/_TEMPLATE_MENU_TC_PACK.md` | Pack structure |
| FE inventory | `CommandCenterPage.tsx` (widgets §10376–10618) · `CommandCenterModuleRail.tsx` · `command-center-rail-catalog.ts` |
| KPI hook | `useCommandCenterKpiRail.ts` · `commandCenterKpi.ts` · `kpiEngineApi.ts` |
| Scope | `commandCenterScope.ts` · `resolveXbosKpiRollupCompanyId` |
| UF matrix | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §3 |
| Journey | `docs/program/PROGRAM_JOURNEY_MAP.md` J-CC-01 · J-CC-03 |

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| **CC-HOME-HEADER** | chrome | `/command-center` | Tiêu đề XeVN OS · Command Center · persona pills BOD/Quản lý/Nhân viên | default |
| **CC-HOME-RAIL** | rail | Left `CommandCenterModuleRail` | 7 phân hệ: GROUP · TÀI CHÍNH · KẾ TOÁN · NHÂN SỰ · KINH DOANH · VẬN HÀNH · CÀI ĐẶT | active · disabled · collapsed caption |
| **CC-RAIL-TOGGLE** | control | Rail footer | **Thu** / **Mở** thanh phân hệ | expanded · collapsed |
| **CC-WDG-TASKS** | widget | Home grid col-1 | **Việc cần xử lý** + chip counts theo module | loading skeleton · counts ≥0 |
| **CC-WDG-KPI** | widget | Home grid col-2 | **Chỉ số KPI tập đoàn** + % headline + Sparkline | loading · rollup · empty · error banner · mock (dev only) |
| **CC-WDG-ALERTS** | widget | Home grid col-3 | **Cảnh báo hệ thống** list scroll | empty · list · strict fail banner |
| **CC-ACT-PANEL** | section | `[data-testid=cc-inbox-panel]` | **Action Cards** + filter chips + task cards | empty honest · cards · inbox API/mock policy |
| **CC-ACT-CARD** | row | Inside ACT-PANEL | Một task: priority · title · **Mở chi tiết** · **Duyệt**/approve label | blocked capability · busy |
| **CC-ACT-FILTER** | chip bar | ACT-PANEL header | Tất cả · TÀI CHÍNH · KẾ TOÁN · KINH DOANH · NHÂN SỰ · VẬN HÀNH | selectedModule sync |
| **CC-DRW-INBOX** | drawer | **Mở chi tiết** | `WorkflowTaskDetailDrawer` approve/reject | loading · detail fail · from API |
| **CC-BAN-WORKSPACE** | banner | Header under persona | Workspace meta load fail | visible/hidden |
| **CC-BAN-STRICT** | banner | KPI / Inbox / Alerts widgets | `ApiLoadBanner` strict mode | loadFailed · usingMockFallback |
| **CC-SKELETON** | state | `loading=true` after persona switch | 3 skeleton tiles + block | transient |

**Rail catalog (static — `commandCenterRailModules`):**

| moduleCode | Label VI | href / navigate | allowedRoles |
|------------|----------|-----------------|--------------|
| `group` | GROUP | `/command-center` · `selectedModule=all` | bod · manager · employee |
| `finance` | TÀI CHÍNH | `/dashboard/customers` (legacy href; CC sets module) | bod · manager |
| `accounting` | KẾ TOÁN | `/dashboard/kpi-dashboard` | bod · manager |
| `hrm` | NHÂN SỰ | `/command-center/hrm/...` embed | bod · manager |
| `business` | KINH DOANH | module `business` | bod · manager · employee |
| `fleet` | VẬN HÀNH | module `fleet` | bod · manager · employee |
| `system` | CÀI ĐẶT HỆ THỐNG | settings shell | bod · manager · employee |

**Đếm:** pages=1 (home workspace) · widgets=3 · rail=1 · drawer=1 · filter bars=2 · banners=3 · skeleton=1 → **screens=12**

---

## 2. Field dictionary (display / filter — không mutate form)

### 2.1 CC-HOME-HEADER

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API / source | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|--------------|--------|-------|
| HDR-FLD-TITLE | XeVN OS | CC-HOME-HEADER | h1 display | — | — | — | — | module subtitle «Command Center» |
| HDR-FLD-PERSONA-BOD | BOD | CC-HOME-HEADER | pill button | — | sets `persona=bod` | client filter tasks/alerts | — | resets module `all` |
| HDR-FLD-PERSONA-MGR | Quản lý | CC-HOME-HEADER | pill | — | `persona=manager` | same | — | |
| HDR-FLD-PERSONA-EMP | Nhân viên | CC-HOME-HEADER | pill | — | `persona=employee` | KPI subtitle «KPI cá nhân» | — | |

### 2.2 CC-HOME-RAIL

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----|-------|
| RAIL-LBL-GROUP | GROUP | CC-HOME-RAIL | icon+label | — | active when `selectedModule=all` | — | LayoutGrid icon |
| RAIL-LBL-FINANCE | TÀI CHÍNH | CC-HOME-RAIL | button | — | disabled if role ∉ allowed | — | Wallet icon |
| RAIL-LBL-ACCOUNTING | KẾ TOÁN | CC-HOME-RAIL | button | — | bod/manager only | — | |
| RAIL-LBL-HRM | NHÂN SỰ | CC-HOME-RAIL | button | — | navigates HRM embed | — | Users icon |
| RAIL-LBL-BUSINESS | KINH DOANH | CC-HOME-RAIL | button | — | filters `moduleCode=x-bos` tasks | — | |
| RAIL-LBL-FLEET | VẬN HÀNH | CC-HOME-RAIL | button | — | filters fleet tasks | — | |
| RAIL-LBL-SYSTEM | CÀI ĐẶT HỆ THỐNG | CC-HOME-RAIL | button | — | opens settings sidebar | — | Settings icon |
| RAIL-FLD-DISABLED-HINT | (tooltip) | CC-HOME-RAIL | title attr | — | «Bạn không có quyền…» | — | dashed border |

### 2.3 CC-WDG-TASKS

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----|--------|-------|
| WDG-TASK-TITLE | Việc cần xử lý | CC-WDG-TASKS | text | — | — | inbox aggregate | — | |
| WDG-TASK-COUNT-ALL | (số lớn) | CC-WDG-TASKS | display | — | `taskCounts.all` | filtered in-progress | integer | no thousand group |
| WDG-TASK-SUB | Việc đang xử lý (đã lọc phạm vi) | CC-WDG-TASKS | text | — | persona filter | — | — | |
| WDG-TASK-CHIP-FIN | TÀI CHÍNH: N | CC-WDG-TASKS | chip | — | `taskCounts.finance` | — | integer | |
| WDG-TASK-CHIP-ACC | KẾ TOÁN: N | CC-WDG-TASKS | chip | — | accounting | — | integer | |
| WDG-TASK-CHIP-BIZ | KINH DOANH: N | CC-WDG-TASKS | chip | — | xbos module | — | integer | |
| WDG-TASK-CHIP-HRM | NHÂN SỰ: N | CC-WDG-TASKS | chip | — | hrm | — | integer | |
| WDG-TASK-CHIP-FLEET | VẬN HÀNH: N | CC-WDG-TASKS | chip | — | fleet | — | integer | |

### 2.4 CC-WDG-KPI

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----|--------|-------|
| WDG-KPI-TITLE | Chỉ số KPI tập đoàn | CC-WDG-KPI | text | — | no raw metric keys | — | — | display-label rule |
| WDG-KPI-HEADLINE | (N%) | CC-WDG-KPI | display | — | last spark point | `GET …/kpi-engine/rollup` | percent 0–200 cap | `—` if empty |
| WDG-KPI-SUB-GROUP | Tổng hợp tập đoàn | CC-WDG-KPI | text | — | persona ≠ employee | rollup series | — | |
| WDG-KPI-SUB-EMP | KPI cá nhân | CC-WDG-KPI | text | — | persona=employee | — | — | |
| WDG-KPI-SPARK | Sparkline chart | CC-WDG-KPI | SVG/visual | — | `rollupToSparkline` | series[].points | — | empty = no chart junk |
| WDG-KPI-BANNER | Không tải KPI rollup… | CC-WDG-BAN | banner | — | strict no mock | rollup null | VI message | scope plane text |

### 2.5 CC-WDG-ALERTS

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----|-------|
| WDG-ALR-TITLE | Cảnh báo hệ thống | CC-WDG-ALERTS | text | — | UC-CC-P0-09 | portal alerts | — | |
| WDG-ALR-EMPTY | Không có cảnh báo trong phạm vi. | CC-WDG-ALERTS | text | — | scoped empty OK | — | not ERROR if API OK |
| WDG-ALR-ROW-TITLE | (alert title) | CC-WDG-ALERTS | list item | — | level icon critical/warn/info | alerts API | line-clamp-2 | |

### 2.6 CC-ACT-PANEL / CARD

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----|-------|
| ACT-FLT-ALL | Tất cả | CC-ACT-FILTER | chip | — | `selectedModule=all` | — | sync rail GROUP |
| ACT-FLT-FINANCE | TÀI CHÍNH | CC-ACT-FILTER | chip | — | finance filter | — | |
| ACT-FLT-ACCOUNTING | KẾ TOÁN | CC-ACT-FILTER | chip | — | accounting | — | |
| ACT-FLT-BUSINESS | KINH DOANH | CC-ACT-FILTER | chip | — | x-bos tasks | — | |
| ACT-FLT-HRM | NHÂN SỰ | CC-ACT-FILTER | chip | — | navigates HRM | — | leaves home |
| ACT-FLT-FLEET | VẬN HÀNH | CC-ACT-FILTER | chip | — | fleet | — | |
| ACT-CARD-PRIORITY | (badge) | CC-ACT-CARD | badge | — | priorityLabel | — | — | |
| ACT-CARD-TITLE | task.title | CC-ACT-CARD | text | — | — | inbox DTO | — | |
| ACT-CARD-SUB | task.subtitle | CC-ACT-CARD | text | — | optional | — | — | |
| ACT-CARD-ASSIGNEE | Người nhận: … | CC-ACT-CARD | text | — | — | assigneeName | — | |
| ACT-CARD-DUE | Hạn: dd/MM/yyyy | CC-ACT-CARD | text | — | vi-VN date | dueAt | dd/MM/yyyy | |
| ACT-BTN-DETAIL | Mở chi tiết | CC-ACT-CARD | button | — | BTN-A1-INBOX-DETAIL | GET detail | blocked if not API | |
| ACT-BTN-APPROVE | Duyệt / label dynamic | CC-ACT-CARD | button | — | leave → `hdsd-cc-leave-approve` | POST complete | U65 real task | |

**Đếm fields:** 38

---

## 3. Function inventory (đủ mọi function)

| fn_id | UI (nút/menu) | screen_id | precond | API | success FE | fail | HDSD |
|-------|---------------|-----------|---------|-----|------------|------|------|
| **AUTH-FN-LOGIN** | Đăng nhập | `/login` | credentials | POST auth **201** `XBOS-AUTH-200` | redirect CC | 401 | UF-01 · J-CC-01 |
| **HDR-FN-PERSONA** | BOD / Quản lý / Nhân viên | CC-HOME-HEADER | logged in | — | reload home skeleton → widgets | — | UF-01 |
| **RAIL-FN-GROUP** | GROUP | CC-HOME-RAIL | — | — | home widgets visible | — | UF-01/10 |
| **RAIL-FN-MODULE** | TÀI CHÍNH…VẬN HÀNH | CC-HOME-RAIL | role allowed | — | module selected / navigate | disabled tooltip | UF-01 |
| **RAIL-FN-HRM** | NHÂN SỰ | CC-HOME-RAIL | — | — | HRM embed mount | — | cross-nav |
| **RAIL-FN-SYSTEM** | CÀI ĐẶT HỆ THỐNG | CC-HOME-RAIL | — | GET settings data | settings sidebar | — | out of pack scope |
| **RAIL-FN-TOGGLE** | Thu / Mở | CC-RAIL-TOGGLE | collapseEnabled | — | rail width/caption | — | UX |
| **KPI-FN-LOAD** | (mount home) | CC-WDG-KPI | Group CEO JWT `main` | `GET /kpi-engine/rollup` **200** `XBOS-KPI-202` | headline % + sparkline | banner 409/null | UF-10 · J-CC-03 |
| **KPI-FN-EMPTY** | (rollup 200 empty series) | CC-WDG-KPI | strict mode | rollup empty | `—` no error storm | not mock unless flag | D-8088-KPI-01 |
| **META-FN-LOAD** | (mount) | CC-HOME-HEADER | — | `GET …/workspace-meta` | no header banner | CC-BAN-WORKSPACE | UC-CC-P0-08 |
| **INBOX-FN-LOAD** | (mount) | CC-ACT-PANEL | — | workflow inbox tasks | cards or honest empty | strict banner | UC-CC-P0-09 |
| **ALR-FN-LOAD** | (mount) | CC-WDG-ALERTS | — | alerts API | list or empty copy | strict banner | UC-CC-P0-09 |
| **ACT-FN-FILTER** | Filter chips | CC-ACT-FILTER | tasks loaded | — | `filteredCards` updates | empty list OK | UF-01 |
| **ACT-FN-DETAIL** | Mở chi tiết | CC-ACT-CARD | inbox from API | GET instance detail | drawer open | blocked mock | inbox pack xref |
| **ACT-FN-QUICK-APPROVE** | Duyệt nhanh | CC-ACT-CARD | real task U65 | POST complete **201** `XBOS-WF-200` | card leaves list F5 | 4xx toast | UF-08 xref |
| **DRW-FN-CLOSE** | Đóng drawer | CC-DRW-INBOX | open | — | panel visible again | — | L2.5 |

**Đếm functions:** 16 (read/load 8 · navigate 5 · mutate approve 1 · login 1 · drawer 1)

---

## 4. Test case matrix (chi tiết)

**Persona mặc định (Group):** `ceo@xe.vn` / `Xevn@2026` · URL `:8088/command-center` hoặc `:5173/command-center`.

**Quy ước TC-ID:** `TC-{CC|RAIL|WDG|KPI|ACT|J}-{HP|FD|BD|AU|UX}-{nnn}`

### 4.1 Auth & shell — UF-XBOS-01 · J-CC-01

| TC-ID | Type | Covers | Precond | Steps (HDSD) | Expected | Layer | Auto | Status |
|-------|------|--------|---------|--------------|----------|-------|------|--------|
| TC-CC-HP-001 | HP | AUTH-FN-LOGIN · UF-01 | logged out | `/login` → email/password → **Đăng nhập** | **201** JWT; land `/command-center`; CC-HOME-HEADER visible | UI | MANUAL | PLANNED |
| TC-CC-HP-002 | HP | RAIL-FN-GROUP · UF-01 | after login | Observe left rail + 3 widgets + Action Cards | Labels **Việc cần xử lý** · **Chỉ số KPI tập đoàn** · **Cảnh báo hệ thống** (no raw keys) | UI | MANUAL | PLANNED |
| TC-CC-HP-003 | HP | J-CC-01 | TC-CC-HP-001 | F5 on `/command-center` | Session persists; widgets reload without Vite overlay | UI | MANUAL | PLANNED |
| TC-CC-UX-001 | UX | CC-SKELETON | logged in | Switch persona **Quản lý** | Brief skeleton then widgets; no uncaught | UI | MANUAL | PLANNED |
| TC-CC-FD-001 | FD | AUTH-FN-LOGIN | logged out | Wrong password | **401**; stay login; no CC shell | UI | MANUAL | PLANNED |

### 4.2 Rail GROUP & module navigation

| TC-ID | Type | Covers | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|-------|----------|-------|------|--------|
| TC-RAIL-HP-001 | HP | RAIL-FN-GROUP | on settings/other module | Click **GROUP** | `selectedModule=all`; home widgets; URL `/command-center` | UI | MANUAL | PLANNED |
| TC-RAIL-HP-002 | HP | RAIL-FN-HRM | Group CEO | Click **NHÂN SỰ** | Navigate HRM embed; home widgets hidden | UI | MANUAL | PLANNED |
| TC-RAIL-HP-003 | HP | RAIL-FN-SYSTEM | Group CEO | Click **CÀI ĐẶT HỆ THỐNG** | Settings sidebar; home widgets not primary | UI | MANUAL | PLANNED |
| TC-RAIL-HP-004 | HP | RAIL-FN-MODULE | bod persona | Click **KINH DOANH** | Module active; Action filter sync `business` | UI | MANUAL | PLANNED |
| TC-RAIL-UX-001 | UX | RAIL-FN-TOGGLE | collapse enabled | **Thu** then **Mở** | Icons remain usable; captions sr-only when collapsed | UI | MANUAL | PLANNED |
| TC-RAIL-AU-001 | AU | RAIL-LBL-FINANCE disabled | `persona=employee` | Hover **TÀI CHÍNH** | Dashed icon + tooltip «Bạn không có quyền…»; no navigate | UI | MANUAL | PLANNED |
| TC-RAIL-AU-002 | AU | filterRailByRole | employee | All disallowed modules | Same disabled pattern for finance/accounting if role blocked | UI | MANUAL | PLANNED |

### 4.3 KPI widget — UF-XBOS-10 · J-CC-03

| TC-ID | Type | Covers | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|-------|----------|-------|------|--------|
| TC-KPI-HP-001 | HP | KPI-FN-LOAD · UF-10 | `ceo@xe.vn` · xbos-api up | Open CC home · DevTools | `GET …/kpi-engine/rollup` **200** `XBOS-KPI-202`; WDG-KPI-HEADLINE shows `%` or honest `—` | UI | MANUAL | PLANNED |
| TC-KPI-HP-002 | HP | WDG-KPI-SPARK · J-CC-03 | rollup has points | Observe sparkline | Chart renders; periods mapped; no 409 banner | UI | MANUAL | PLANNED |
| TC-KPI-HP-003 | HP | HDR-FN-PERSONA + KPI | switch **Nhân viên** | Subtitle **KPI cá nhân** | Label changes; no crash | UI | MANUAL | PLANNED |
| TC-KPI-BD-001 | BD | KPI-FN-EMPTY | rollup **200** empty series | strict prod (no mock) | Headline `—`; **no** red ERROR banner (D-8088-KPI-01) | UI | MANUAL | PLANNED |
| TC-KPI-FD-001 | FD | KPI-FN-LOAD | xbos-api down / rollup fail | Open CC | WDG-KPI-BANNER visible; **no** silent mock in strict env | UI | MANUAL | PLANNED |
| TC-KPI-FD-002 | FD | scope 409 | mis-scoped companyId query | Network tab | **409** suppressed log; UI banner not white screen | UI/API | MANUAL | PLANNED |
| TC-KPI-UX-001 | UX | WDG-KPI-TITLE | any | Inspect widget title | Vietnamese label; **no** `metricCode` raw in UI | UI | MANUAL | PLANNED |
| TC-WDG-UNIT-001 | UNIT | mapRollupPointsToSparkline | — | jest `commandCenterKpi.test.ts` | actual/target → % cap 200 | UNIT | AUTOMATED | PLANNED |
| TC-WDG-UNIT-002 | UNIT | useCommandCenterKpiRail | — | jest `useCommandCenterKpiRail.test.ts` | source rollup/mock/empty transitions | UNIT | AUTOMATED | PLANNED |

### 4.4 Task & alert widgets (home scope)

| TC-ID | Type | Covers | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|-------|----------|-------|------|--------|
| TC-WDG-HP-001 | HP | WDG-TASK-COUNT | inbox tasks exist (FE-created U65) | Compare chip sums vs list | Counts consistent with filtered in-progress; integers | UI | MANUAL | PLANNED |
| TC-WDG-HP-002 | HP | WDG-ALR-ROW | alerts API data | Scroll alert list | Icons by level; titles readable VI | UI | MANUAL | PLANNED |
| TC-WDG-BD-001 | BD | WDG-ALR-EMPTY | no alerts in scope | Load home | Copy «Không có cảnh báo trong phạm vi.» — **not** FAIL if API OK | UI | MANUAL | PLANNED |
| TC-WDG-FD-001 | FD | META-FN-LOAD | workspace-meta fail | strict | CC-BAN-WORKSPACE message VI | UI | MANUAL | PLANNED |
| TC-WDG-FD-002 | FD | INBOX-FN-LOAD strict | no API inbox | Action panel | Honest empty hint; approve buttons blocked | UI | MANUAL | PLANNED |

### 4.5 Action Cards filter & inbox (home panel)

| TC-ID | Type | Covers | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|-------|----------|-------|------|--------|
| TC-ACT-HP-001 | HP | ACT-FN-FILTER | ≥1 task multi-module | Click **KINH DOANH** chip | Only `x-bos` module cards; chip highlighted | UI | MANUAL | PLANNED |
| TC-ACT-HP-002 | HP | ACT-FN-FILTER | tasks | **Tất cả** | Full scoped list restored | UI | MANUAL | PLANNED |
| TC-ACT-HP-003 | HP | ACT-FN-DETAIL | API inbox task | **Mở chi tiết** | CC-DRW-INBOX; GET detail **200** | UI | MANUAL | PLANNED |
| TC-ACT-HP-004 | HP | ACT-FN-QUICK-APPROVE | leave task U65 | **Duyệt** (`hdsd-cc-leave-approve`) | POST **201**; task leaves list; F5 | UI | MANUAL | PLANNED |
| TC-ACT-FD-001 | FD | ACT-BTN-APPROVE blocked | mock inbox source | Click Duyệt | Blocked reason VI; no fake POST | UI | MANUAL | PLANNED |
| TC-ACT-FD-002 | FD | ACT-FLT-HRM | on home | Click **NHÂN SỰ** filter | Navigates HRM dashboard (leaves home KPI view) | UI | MANUAL | PLANNED |
| TC-ACT-UX-001 | UX | ACT empty | filter no match | Select module with 0 tasks | Dashed empty «Không có việc cần xử lý…» | UI | MANUAL | PLANNED |

### 4.6 Member-scope negatives — pointer UF-XBOS-11 (exec elsewhere)

> **Không duplicate** full member matrix tại đây — negative rollup / GMU scope thuộc roster **member CEO** (`du-lich.ceo@xe.vn`). Catalog giữ **pointer TC** để synth + UAT matrix trace.

| TC-ID | Type | Covers | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|-------|----------|-------|------|--------|
| TC-AU-PTR-001 | AU | UF-XBOS-11 · KPI negative | Member CEO session | Login `du-lich.ceo@xe.vn` → CC home | `GET …/kpi-engine/rollup` **403/409** `SCOPE_CONTEXT_MISMATCH`; **no** group rollup headline as PASS | UI/API | MANUAL | PLANNED |
| TC-AU-PTR-002 | AU | UF-XBOS-11 · GMU | Member CEO | Probe `group-member-units` rollup | **403** expected — full steps in UF-XBOS-11 browser row | API | MANUAL | PLANNED |
| TC-AU-PTR-003 | AU | cross-ref | — | Trace matrix | Prior 🟢 UF-XBOS-11 evidence remains SoT until U78 run on this pack | DOC | — | PLANNED |

**Execution owner for TC-AU-PTR-001/002:** QA browser wave UF-XBOS-11 · cite `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §3 row 11 · **not** Group CEO persona.

### 4.7 Journey cross-check (L2.5)

| TC-ID | Type | J-ID | Steps | Expected | Status |
|-------|------|------|-------|----------|--------|
| TC-J-HP-001 | HP | J-CC-01 | Login → CC home load | Shell + rail GROUP active | PLANNED |
| TC-J-HP-002 | HP | J-CC-03 | Home KPI widget + Network | Rollup **200**; no 409 on load for Group CEO | PLANNED |
| TC-J-HP-003 | HP | L2.5 | Rail GROUP → HRM → browser back / GROUP | Return home widgets without 404 | PLANNED |

### Coverage check

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions ≥1 HP | 16 | 16 | 0 |
| Mutate/quick approve ≥1 FD | 1 | TC-ACT-FD-001 | 0 |
| KPI load ≥ HP+FD+BD | KPI-FN-LOAD | TC-KPI-HP-* + FD + BD | 0 |
| Rail modules ≥1 HP each (in-scope home) | GROUP,HRM,SYSTEM,BUSINESS | TC-RAIL-HP-* | 0 |
| Member negative pointer | UF-XBOS-11 | TC-AU-PTR-* | 0 |
| Drawer open path | ACT-FN-DETAIL | TC-ACT-HP-003 | 0 |
| Popups | CC-DRW-INBOX | covered via detail HP | 0 |

**TC total:** 36 · **Status:** all **PLANNED** (catalog only)

---

## 5. Traceability

| TC-ID | SRS / UC | TechSpec / ADR | API | HDSD / UF |
|-------|----------|----------------|-----|-----------|
| TC-CC-HP-001 | UC-XBOS-AUTH-01 | JWT §2 | POST login | UF-XBOS-01 |
| TC-CC-HP-002 | UC-CC-P0-08/09 | workspace + strict | meta · inbox · alerts | UF-XBOS-01 |
| TC-KPI-HP-001 | UC-XBOS-KPI | ADR main/holding scope | `GET kpi-engine/rollup` | UF-XBOS-10 |
| TC-KPI-FD-002 | UC-XBOS-KPI | resolveXbosKpiRollupCompanyId | 409 path | UF-XBOS-10 |
| TC-AU-PTR-001 | U28-R2 negative | ADR member scope | rollup 409 | **UF-XBOS-11** |
| TC-ACT-HP-004 | UC-CC-P0-06/09 | inbox complete | POST WF complete | UF-XBOS-08 xref |
| TC-J-HP-002 | — | — | rollup | J-CC-03 |

---

## 6. Out of scope / stub

| Item | Reason | TC status |
|------|--------|-----------|
| Settings sub-menus (legal/shareholders…) | Pack `XBOS-ORG-SHARE` | OOS |
| Full inbox/WF canvas | Pack INBOX/WF wave | OOS — ACT panel entry only |
| Legacy `/dashboard/*` href targets | Rail catalog href legacy; CC uses module state | OOS unless deep-link defect |
| Finance/accounting external dashboards | Not CC home mutate | STUB navigate smoke optional |
| Member CEO positive KPI | Business rule — member sees company scope only | **UF-XBOS-11** |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-xbos-kpi-rail-01.md
next_owner: qa-synth
counts: screens=12 fields=38 functions=16 tcs=36
member_negative: pointer TC-AU-PTR-001..003 → UF-XBOS-11 (no duplicate full matrix)
```
