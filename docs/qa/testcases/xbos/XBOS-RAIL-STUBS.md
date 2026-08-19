# Menu TC Pack — `XBOS-RAIL-STUBS` · CC rail (Finance · Accounting · HRM-link · Business · Fleet · System)

| Meta | Value |
|------|--------|
| **menu_id** | `XBOS-RAIL-STUBS` |
| **surface** | `xbos-cc` |
| **route(s)** | `/command-center` · `/command-center?module={finance\|accounting\|business\|fleet}` · `/command-center?settings=*` · `/command-center/hrm/*` (HRM-link) |
| **HDSD** | `docs/client-delivery/hdsd/xbos/HDSD_XBOS_CH04_DASHBOARD_VAN_HANH.md` (legacy dashboard §4.x — **OOS** từ rail runtime) · CC shell UF-XBOS-01 |
| **SRS / FR / UC** | `docs/xbos/COMMAND_CENTER_P0_SRS.md` UC-CC-P0-08 · UC-CC-P0-09 · FR-UC-XBOS-DASH-01 (legacy dashboard — Phase-2) |
| **TechSpec** | `docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md` · `command-center-rail-catalog.ts` · `commandCenterUrl.ts` (`parseCommandCenterModule` / `commandCenterModuleUrl`) |
| **API_CONTRACT** | Inbox filter only: `GET /api/xbos/workflow-engine/inbox/tasks` · KPI/alerts unchanged on stub select (xref CC-HOME-KPI) · Settings menus → per-menu XBOS packs |
| **UF / J-*** | UF-XBOS-01 (shell) · stub rails **không** UF riêng Phase-1 · J-CC-01 (F5 module query) · HRM embed J-HRM-* xref |
| **author** | qa · PO-ECO-TC-XBOS-RAIL-STUBS-01 |
| **work_item_id** | `PO-ECO-TC-XBOS-RAIL-STUBS-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ · **STUB/OOS** labeled ☑ |

> **Out of scope (dedupe):** Rail **GROUP** + home **KPI widgets** + Action Cards matrix đầy đủ → `docs/qa/testcases/xbos/XBOS-CC-HOME-KPI.md` (`PO-ECO-TC-XBOS-KPI-RAIL-01`). Pack này = **5 stub phân hệ** + **HRM-link** + **System settings nav** + **legacy href OOS**.

> Chuẩn: IEEE 829 / ISO 29119 lean · U65 precond execution = luồng FE · **PLANNED** = catalog · **cấm** claim UAT DONE.

---

## 0. spec_read_ack

| Source | Path | Cited |
|--------|------|--------|
| Depth program | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` | §2 DoD · §4 stub menus |
| Roster Wave C | `docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md` | §A.5 XBOS-RAIL-* |
| Rail catalog | `apps/web/web-portal/src/data/command-center-rail-catalog.ts` | 7 modules · legacy `href` |
| Rail UI | `CommandCenterModuleRail.tsx` · `CommandCenterPage.tsx` (filter `filteredCards` · settings sidebar) |
| URL sync | `apps/web/web-portal/src/modules/hrm/commandCenterUrl.ts` | `?module=` · `?settings=` |
| Dedupe sibling | `docs/qa/testcases/xbos/XBOS-CC-HOME-KPI.md` | GROUP/KPI/ACT baseline |
| HRM embed SoT | `docs/qa/testcases/hrm-web/HRM-DASHBOARD.md` + roster §A.6 | NHÂN SỰ depth elsewhere |

---

## 0.1 STUB / OOS classification (honest)

| menu_id | Rail label | Runtime navigation (actual) | Dedicated module workspace | Catalog `href` (legacy) | Class |
|---------|------------|----------------------------|----------------------------|-------------------------|--------|
| **XBOS-RAIL-FINANCE** | TÀI CHÍNH | `commandCenterModuleUrl('finance')` → `/command-center?module=finance` | **STUB:** cùng CC home layout; **chỉ** lọc Action Cards `moduleCode=finance` | `/dashboard/customers` | **STUB** — không mount CustomersPage từ rail |
| **XBOS-RAIL-ACCOUNTING** | KẾ TOÁN | `?module=accounting` | **STUB:** lọc inbox `accounting` | `/dashboard/kpi-dashboard` | **STUB** — không mount KPIDashboardPage |
| **XBOS-RAIL-BUSINESS** | KINH DOANH | `?module=business` | **STUB:** lọc inbox `moduleCode=x-bos` | `/dashboard/kpi-dashboard` | **STUB** |
| **XBOS-RAIL-FLEET** | VẬN HÀNH | `?module=fleet` | **STUB:** lọc inbox `fleet` | `/dashboard/organization` | **STUB** — không mount OrganizationPage |
| **XBOS-RAIL-HRM-LINK** | NHÂN SỰ | `hrmPortalPath('dashboard')` → `/command-center/hrm/dashboard` | **NOT STUB** — HRM embed + sidebar; depth trong `hrm-web/*` | `/dashboard/hr` | **LINK** — xref embed packs |
| **XBOS-RAIL-SYSTEM** | CÀI ĐẶT HỆ THỐNG | `commandCenterModuleUrl(SYSTEM_SETTINGS)` → `?settings=company_member_units` (default) | **NOT STUB** — settings workspace; leaf depth trong XBOS-ORG / INBOX / RBAC / CATALOG / WF packs | `/command-center` | **NAV INVENTORY** + xref |
| *(OOS legacy)* | — | Direct URL only (bookmarks / HDSD cũ) | Full pages tồn tại ngoài rail | see §1.8 | **OOS** vs rail click |

**Phase-2 / OOS nghiệp vụ:** CRM mutate (`CustomersPage` view-only banner), GL/CAPEX (`x-finance` mock cards), fleet dispatch ops — **không** có workspace CC riêng khi bấm rail stub.

---

## 1. Screen inventory (màn + popup)

### 1.1 Shared stub workspace (Finance · Accounting · Business · Fleet)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| **CC-RST-WORKSPACE** | page | `/command-center?module=*` | Cùng 3 widget home + Action Cards; `filteredCards` theo phân hệ | loading skeleton · filtered empty · filtered list |
| **CC-RST-RAIL-ACTIVE** | chrome | Left rail | Icon active ring (Wallet / Calculator / TrendingUp / Truck) | disabled (employee finance/accounting) |
| **CC-RST-ACT-HEADER** | section | `[data-testid=cc-inbox-panel]` | Title **Action Cards** + helper «Lọc theo phân hệ đang chọn trên thanh điều hướng» | — |
| **CC-RST-ACT-EMPTY** | state | Action list | Dashed «Không có việc cần xử lý trong phạm vi hiện tại.» | strict empty hint · load fail hint |
| **CC-RST-ACT-CARD** | row | Inbox task | `data-testid=cc-inbox-task-card` · `task.moduleCode` / `businessType` | same as CC-HOME (xref) |
| **CC-RST-WDG-TRIO** | widgets | Home grid | Việc cần xử lý · KPI tập đoàn · Cảnh báo — **không đổi layout** khi stub (KPI **không** module-scoped) | xref CC-HOME-KPI |

### 1.2 HRM-link (rail NHÂN SỰ)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| **CC-RST-HRM-SHELL** | layout | `/command-center/hrm/:view` | `layoutMode=hrm-embed` · `HrmApiHealthBanner` · `<Outlet />` | API down banner |
| **CC-RST-HRM-SIDEBAR** | sidebar | `HrmCollapsibleSidebar` | Menu leaf HRM (17+ keys) | collapsed · expanded |
| **CC-RST-HRM-DASH** | embed page | `…/hrm/dashboard` | Entry after rail click | xref `HRM-DASHBOARD.md` |

### 1.3 System rail (settings navigation — not business stub)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| **CC-SYS-NAV** | sidebar | `selectedModule=SYSTEM_SETTINGS` | Title **Cài đặt hệ thống** · «Chọn nhóm cấu hình» | — |
| **CC-SYS-GRP-COMPANY** | accordion | **Thiết lập công ty** | Expand/collapse | open · closed |
| **CC-SYS-MENU-*** | nav item | `activeSettingsMenu` | 13 leaf keys (see §2.3) | active highlight |
| **CC-SYS-WORKSPACE** | panel | `renderSettingsWorkspacePanel()` | Leaf UI per menu | loading skeleton · per-pack states |

### 1.4 Legacy dashboard pages (OOS — not reached by rail click)

| screen_id | Loại | Route | Mô tả | Class |
|-----------|------|-------|-------|--------|
| **OOS-DASH-CUSTOMERS** | page | `/dashboard/customers` | Khách hàng & Đối tác · view-only toolbar | **OOS** rail |
| **OOS-DASH-ORG** | page | `/dashboard/organization` | Sơ đồ tổ chức + toolbar HDSD | **OOS** rail |
| **OOS-DASH-KPI** | page | `/dashboard/kpi-dashboard` | KPI dashboard page (distinct from CC widget) | **OOS** rail |
| **OOS-DASH-COCKPIT** | page | `/dashboard/cockpit` | Executive cockpit demo layout | **OOS** rail |

**Đếm:** stub workspace=6 · HRM-link=3 · System nav=4 · OOS legacy=4 → **screens=17** (chrome/widgets xref CC-HOME not double-counted)

---

## 2. Field dictionary

### 2.1 CC-RST-RAIL (stub modules — visible labels)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----|-------|
| RST-RAIL-FIN | TÀI CHÍNH | CC-RST-RAIL-ACTIVE | rail button | — | `allowedRoles: bod, manager` | — | Wallet icon |
| RST-RAIL-ACC | KẾ TOÁN | CC-RST-RAIL-ACTIVE | rail button | — | bod/manager only | — | Calculator |
| RST-RAIL-BIZ | KINH DOANH | CC-RST-RAIL-ACTIVE | rail button | — | employee allowed | — | TrendingUp |
| RST-RAIL-FLT | VẬN HÀNH | CC-RST-RAIL-ACTIVE | rail button | — | employee allowed | — | Truck |
| RST-RAIL-HRM | NHÂN SỰ | CC-RST-RAIL-ACTIVE | rail button | — | navigates embed | — | Users |
| RST-RAIL-SYS | CÀI ĐẶT HỆ THỐNG | CC-RST-RAIL-ACTIVE | rail button | — | opens settings | — | Settings |
| RST-RAIL-DIS | (tooltip) | CC-RST-RAIL-ACTIVE | title | — | «Bạn không có quyền truy cập phân hệ này» | — | employee + finance/acc |

### 2.2 CC-RST-WORKSPACE (visible when stub selected)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----|-------|
| RST-URL-MOD | (query) | CC-RST-WORKSPACE | `?module=` | — | F5 restore via `parseCommandCenterModule` | — | finance/accounting/business/fleet |
| RST-ACT-TITLE | Action Cards | CC-RST-ACT-HEADER | h2 | — | — | — | SETTINGS_SECTION_TITLE_CLASS |
| RST-ACT-HELP | Lọc theo phân hệ đang chọn… | CC-RST-ACT-HEADER | p | — | sync rail selection | — | |
| RST-CHIP-ALL | Tất cả | CC-RST-ACT-HEADER | chip | — | `selectedModule=all` | — | xref CC-HOME |
| RST-CHIP-FIN | TÀI CHÍNH | CC-RST-ACT-HEADER | chip | — | sync finance | — | |
| RST-CHIP-ACC | KẾ TOÁN | CC-RST-ACT-HEADER | chip | — | sync accounting | — | |
| RST-CHIP-BIZ | KINH DOANH | CC-RST-ACT-HEADER | chip | — | sync business | — | |
| RST-CHIP-HRM | NHÂN SỰ | CC-RST-ACT-HEADER | chip | — | leaves to embed | — | |
| RST-CHIP-FLT | VẬN HÀNH | CC-RST-ACT-HEADER | chip | — | sync fleet | — | |
| RST-CARD-MOD | `{sourceSystem} · {moduleCode}` | CC-RST-ACT-CARD | text | — | business → `x-bos` | inbox DTO | display-label |
| RST-WDG-COUNT-FIN | TÀI CHÍNH: N | CC-RST-WDG-TRIO | chip in widget | — | global counts (not hidden on stub) | aggregate | **STUB honesty:** widget still shows all modules |
| RST-WDG-KPI | Chỉ số KPI tập đoàn | CC-RST-WDG-TRIO | widget | — | **not filtered** by stub module | rollup API | xref TC-KPI-* |

### 2.3 CC-SYS-NAV (System rail — menu labels only)

| field_id | UI label (VI) | settings key | pack xref |
|----------|---------------|--------------|-----------|
| SYS-NAV-TITLE | Cài đặt hệ thống | — | — |
| SYS-NAV-HELP | Chọn nhóm cấu hình | — | — |
| SYS-NAV-CO-GRP | Thiết lập công ty | accordion | — |
| SYS-MNU-MEM | Đơn vị thành viên | `company_member_units` | `XBOS-ORG-SHARE.md` |
| SYS-MNU-INF | Hạ tầng cơ sở | `company_infrastructure` | ORG pack |
| SYS-MNU-DEPT-SYS | Hệ thống Phòng/Ban | `company_dept_system` | ORG pack |
| SYS-MNU-TDEPT | Phòng/Ban pháp nhân | `tenant_departments` | ORG pack |
| SYS-MNU-GHR | Danh mục hồ sơ nhân sự | `company_group_hr` | metadata |
| SYS-MNU-CAT-GOV | Duyệt danh mục HRM | `hrm_catalog_governance` | `XBOS-INBOX-CAT.md` |
| SYS-MNU-CAT-APPLY | Áp dụng danh mục HRM | `hrm_catalog_apply_members` | INBOX-CAT |
| SYS-MNU-RBAC | Hệ thống phân quyền | `permission` | `XBOS-RBAC-MATRIX.md` |
| SYS-MNU-WF | Hệ thống quy trình | `workflow` | `XBOS-WF-DESIGNER.md` |
| SYS-MNU-ASSET | Yêu cầu tài sản | `asset_requests` | roster PLANNED |
| SYS-MNU-DOC | Hệ thống văn bản/Quy định | `document` | `XBOS-CATALOG-CC.md` |
| SYS-MNU-MEAS | Hệ thống đo lường/Tiền tệ | `measurement` | CATALOG-CC |
| SYS-MNU-PRICE | Thiết lập hệ thống giá | `pricing` | CATALOG-CC |

### 2.4 OOS legacy — CustomersPage (direct URL inventory)

| field_id | UI label (VI) | screen_id | control | notes |
|----------|---------------|-----------|---------|-------|
| OOS-CUS-BANNER | View-only / CRM notice | OOS-DASH-CUSTOMERS | InfoBanner | mutate deferred |
| OOS-CUS-TOOL-ADD | Thêm mới | OOS-DASH-CUSTOMERS | toolbar | notice only |
| OOS-CUS-TOOL-SEARCH | Tìm kiếm | OOS-DASH-CUSTOMERS | input | filters table |
| OOS-CUS-TOOL-EXPORT | Xuất | OOS-DASH-CUSTOMERS | button | CSV |
| OOS-CUS-TBL | DataTable columns | OOS-DASH-CUSTOMERS | grid | business-master customers |

### 2.5 OOS legacy — OrganizationPage (direct URL inventory)

| field_id | UI label (VI) | screen_id | control | notes |
|----------|---------------|-----------|---------|-------|
| OOS-ORG-TOOL-RELOAD | Tải lại | OOS-DASH-ORG | toolbar | |
| OOS-ORG-TOOL-FILTER | Bộ lọc | OOS-DASH-ORG | toggle | departments-only |
| OOS-ORG-TOOL-SEARCH | Tìm kiếm | OOS-DASH-ORG | input | tree filter |
| OOS-ORG-TOOL-EXPORT | Xuất | OOS-DASH-ORG | button | CSV |
| OOS-ORG-TREE | TreeView | OOS-DASH-ORG | tree | orgFoundationApi |

**Đếm fields:** rail=7 · workspace=12 · system nav=16 · OOS customers=5 · OOS org=5 → **45**

---

## 3. Function inventory

| fn_id | UI (nút/menu) | screen_id | precond | API / navigate | success FE | fail / STUB | HDSD |
|-------|---------------|-----------|---------|----------------|------------|-------------|------|
| **RST-FN-FIN-SELECT** | TÀI CHÍNH rail | CC-RST-RAIL | bod/manager | `navigate(?module=finance)` | rail active; cards filtered | disabled employee | UF-01 |
| **RST-FN-ACC-SELECT** | KẾ TOÁN rail | CC-RST-RAIL | bod/manager | `?module=accounting` | filter accounting | disabled employee | UF-01 |
| **RST-FN-BIZ-SELECT** | KINH DOANH rail | CC-RST-RAIL | any allowed | `?module=business` | filter `x-bos` | — | UF-01 |
| **RST-FN-FLT-SELECT** | VẬN HÀNH rail | CC-RST-RAIL | any allowed | `?module=fleet` | filter fleet | — | UF-01 |
| **RST-FN-F5-MODULE** | (browser F5) | CC-RST-WORKSPACE | on `?module=` | — | `parseCommandCenterModule` restores selection | broken if query stripped | J-CC-01 |
| **RST-FN-CHIP-SYNC** | Filter chips | CC-RST-ACT-HEADER | on home | — | chip highlight = rail module | HRM chip → embed | xref CC-HOME |
| **RST-FN-HRM-RAIL** | NHÂN SỰ rail | CC-RST-HRM | — | `/command-center/hrm/dashboard` | embed mount | HRM API banner | HRM-DASHBOARD |
| **RST-FN-HRM-FILTER** | NHÂN SỰ chip | CC-RST-ACT | — | same as rail | leaves stub workspace | — | |
| **SYS-FN-OPEN** | CÀI ĐẶT rail | CC-SYS-NAV | — | `?settings=company_member_units` | sidebar visible | — | settings packs |
| **SYS-FN-MENU** | Leaf settings menu | CC-SYS-MENU | — | `setActiveSettingsMenu` | workspace title updates | — | per pack |
| **SYS-FN-DEEP-LINK** | URL `?settings=` | CC-SYS-NAV | bookmark | `parseCommandCenterSettingsDeepLink` | menu restored | alias normalize | commandCenterUrl |
| **OOS-FN-CUSTOMERS** | (manual URL) | OOS-DASH-CUSTOMERS | auth | GET business-master | table load | strict banner | HDSD §4.3 **OOS rail** |
| **OOS-FN-ORG** | (manual URL) | OOS-DASH-ORG | auth | org tree API | tree render | empty honest | HDSD §4.2 **OOS rail** |
| **OOS-FN-LEGACY-HREF** | (audit) | — | — | compare catalog `href` vs rail onClick | **must not** auto-navigate to `/dashboard/*` on rail click | SPEC honesty | catalog vs runtime |

**Đếm functions:** 14

---

## 4. Test case matrix

**Persona mặc định (Group stub rails):** `ceo@xe.vn` / `Xevn@2026` · `:8088/command-center`.

**Quy ước TC-ID:** `TC-RST-{HP|FD|BD|AU|UX|OOS|PTR}-{nnn}` — **không** trùng `TC-RAIL-*` / `TC-KPI-*` (CC-HOME-KPI).

### 4.1 Finance rail — STUB

| TC-ID | Type | Covers | Precond | Steps (HDSD / UF-01) | Expected | Layer | Status |
|-------|------|--------|---------|----------------------|----------|-------|--------|
| TC-RST-HP-001 | HP | RST-FN-FIN-SELECT | Group CEO | Login → CC → click **TÀI CHÍNH** | URL `/command-center?module=finance`; rail active; Action Cards only `moduleCode=finance` (or empty honest) | UI | PLANNED |
| TC-RST-HP-002 | HP | RST-FN-F5-MODULE | on finance | F5 | Module finance still selected; no Vite error | UI | PLANNED |
| TC-RST-UX-001 | UX | RST-WDG-KPI | finance selected | Observe KPI widget | KPI widget **still** group rollup (not finance-specific) — document **STUB** behavior | UI | PLANNED |
| TC-RST-AU-001 | AU | RST-RAIL-DIS | persona **Nhân viên** | Click **TÀI CHÍNH** | Disabled dashed icon; no `?module=finance` | UI | PLANNED |
| TC-RST-OOS-001 | OOS | OOS-FN-LEGACY-HREF | — | Rail click finance | **Must not** land `/dashboard/customers` | UI | PLANNED |

### 4.2 Accounting rail — STUB

| TC-ID | Type | Covers | Precond | Steps | Expected | Layer | Status |
|-------|------|--------|---------|-------|----------|-------|--------|
| TC-RST-HP-003 | HP | RST-FN-ACC-SELECT | bod/manager | Click **KẾ TOÁN** | `?module=accounting`; cards filtered | UI | PLANNED |
| TC-RST-AU-002 | AU | RST-RAIL-ACC | employee | Click **KẾ TOÁN** | Disabled (same as finance) | UI | PLANNED |
| TC-RST-OOS-002 | OOS | OOS-FN-LEGACY-HREF | — | Rail accounting | **Must not** open `/dashboard/kpi-dashboard` | UI | PLANNED |

### 4.3 Business rail — STUB

| TC-ID | Type | Covers | Precond | Steps | Expected | Layer | Status |
|-------|------|--------|---------|-------|----------|-------|--------|
| TC-RST-HP-004 | HP | RST-FN-BIZ-SELECT | any allowed persona | Click **KINH DOANH** | `?module=business`; cards show `x-bos` / businessType kinh doanh | UI | PLANNED |
| TC-RST-HP-005 | HP | RST-FN-CHIP-SYNC | on business | Click chip **TÀI CHÍNH** then **KINH DOANH** | Rail/chip sync module selection | UI | PLANNED |
| TC-RST-BD-001 | BD | CC-RST-ACT-EMPTY | no x-bos tasks U65 | Select business | Dashed empty copy; **not** ERROR banner if inbox API OK | UI | PLANNED |

### 4.4 Fleet rail — STUB

| TC-ID | Type | Covers | Precond | Steps | Expected | Layer | Status |
|-------|------|--------|---------|-------|----------|-------|--------|
| TC-RST-HP-006 | HP | RST-FN-FLT-SELECT | Group CEO | Click **VẬN HÀNH** | `?module=fleet`; fleet tasks only | UI | PLANNED |
| TC-RST-OOS-003 | OOS | OOS-FN-LEGACY-HREF | — | Rail fleet | **Must not** open `/dashboard/organization` | UI | PLANNED |
| TC-RST-OOS-004 | OOS | OOS-FN-ORG | direct nav audit | Open `/dashboard/organization` (bookmark) | Org page loads **independently** of rail; toolbar HDSD visible — **OOS** catalog href | UI | PLANNED |

### 4.5 HRM-link — xref (not stub)

| TC-ID | Type | Covers | Precond | Steps | Expected | Layer | Status |
|-------|------|--------|---------|-------|----------|-------|--------|
| TC-RST-HP-007 | HP | RST-FN-HRM-RAIL | Group CEO | Click **NHÂN SỰ** | `/command-center/hrm/dashboard`; `HrmApiHealthBanner`; HRM sidebar | UI | PLANNED |
| TC-RST-HP-008 | HP | RST-FN-HRM-FILTER | on CC home | Click chip **NHÂN SỰ** | Same embed entry as rail | UI | PLANNED |
| TC-RST-PTR-001 | PTR | HRM depth | — | Trace | Execute leaf TCs in `HRM-DASHBOARD.md` + roster §A.6 — **not** duplicated here | DOC | PLANNED |

### 4.6 System rail — settings nav inventory

| TC-ID | Type | Covers | Precond | Steps | Expected | Layer | Status |
|-------|------|--------|---------|-------|----------|-------|--------|
| TC-RST-HP-009 | HP | SYS-FN-OPEN | Group CEO | Click **CÀI ĐẶT HỆ THỐNG** | Settings sidebar **Cài đặt hệ thống**; default member units workspace | UI | PLANNED |
| TC-RST-HP-010 | HP | SYS-FN-MENU | settings open | Expand **Thiết lập công ty** → click **Hệ thống Phòng/Ban** | `activeSettingsMenu=company_dept_system`; title updates | UI | PLANNED |
| TC-RST-HP-011 | HP | SYS-FN-MENU | — | Click **Hệ thống quy trình** | Workflow list workspace — detail TCs in `XBOS-WF-DESIGNER.md` | UI | PLANNED |
| TC-RST-HP-012 | HP | SYS-FN-DEEP-LINK | — | Open `/command-center?settings=permission` | RBAC menu selected — matrix TCs in `XBOS-RBAC-MATRIX.md` | UI | PLANNED |
| TC-RST-PTR-002 | PTR | System leaf depth | — | Trace | **13** settings keys map to existing XBOS packs (§2.3); no second full matrix | DOC | PLANNED |

### 4.7 Legacy dashboard OOS (catalog href honesty)

| TC-ID | Type | Covers | Precond | Steps | Expected | Layer | Status |
|-------|------|--------|---------|-------|----------|-------|--------|
| TC-RST-OOS-005 | OOS | OOS-FN-CUSTOMERS | auth | Navigate `/dashboard/customers` | View-only banner; search/export; **no** rail path | UI | PLANNED |
| TC-RST-OOS-006 | OOS | OOS-DASH-COCKPIT | dev demo flag | `/dashboard/cockpit` if enabled | Demo layout — **OOS** Phase-1 UF | UI | PLANNED |

### 4.8 Journey / dedupe pointers

| TC-ID | Type | Covers | Precond | Steps | Expected | Status |
|-------|------|--------|---------|-------|----------|--------|
| TC-RST-PTR-003 | PTR | CC-HOME-KPI | — | Synth | `TC-RAIL-HP-004` (business) in CC-HOME-KPI **cross_ref** TC-RST-HP-004 — single U78 execution | PLANNED |
| TC-RST-PTR-004 | PTR | KPI widget | — | Synth | KPI TCs remain in `XBOS-CC-HOME-KPI.md` only | PLANNED |
| TC-RST-J-001 | HP | J-CC-01 | login | CC → finance → F5 | Session + module query persist | PLANNED |

### Coverage check

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Each STUB rail ≥1 HP | finance, accounting, business, fleet | TC-RST-HP-001..006 | 0 |
| STUB rail ≥1 AU (role) | finance + accounting | TC-RST-AU-001..002 | 0 |
| Legacy href OOS ≥1 TC per href class | customers, kpi-dash, org | TC-RST-OOS-001..004 | 0 |
| HRM-link entry | rail + chip | TC-RST-HP-007..008 | 0 |
| System nav open + 2 leaf samples | SYS | TC-RST-HP-009..012 | 0 |
| Honest STUB KPI not scoped | RST-UX-001 | 1 | 0 |
| Dedupe pointers | CC-HOME-KPI | TC-RST-PTR-* | 0 |

**TC total:** 28 · **Status:** all **PLANNED** (catalog · **no UAT DONE**)

---

## 5. Traceability

| TC-ID | SRS / UC | TechSpec / code | HDSD / UF |
|-------|----------|-----------------|-----------|
| TC-RST-HP-001..006 | UC-CC-P0-09 (inbox filter) | `CommandCenterPage` filteredCards · `commandCenterModuleUrl` | UF-XBOS-01 |
| TC-RST-OOS-* | FR-UC-XBOS-DASH-01 (legacy) | `command-center-rail-catalog.ts` href vs `CommandCenterModuleRail` onClick | HDSD CH04 §4.2–4.3 **OOS rail** |
| TC-RST-HP-007..008 | HRM embed UC | `hrmPortalPath` · `HrmCollapsibleSidebar` | roster §A.6 |
| TC-RST-HP-009..012 | UC-CC settings | `renderSettingsSidebar` · deep link parse | XBOS-ORG / WF / RBAC / CAT packs |
| TC-RST-PTR-* | — | Synth dedupe | PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM §4 |

---

## 6. Automate hints

| Target | Suite | Notes |
|--------|-------|-------|
| `parseCommandCenterModule` | jest `commandCenterUrl.test.ts` | `?module=finance` F5 parity |
| `commandCenterModuleUrl` | same | must not emit `/dashboard/*` for stub modules |
| `filterRailByRole` | unit / component | employee finance disabled |
| Stub rails UI | Playwright | defer until promoted from synth · U65 inbox |

---

*PO-ECO-TC-XBOS-RAIL-STUBS-01 · READY_FOR_SYNTH · 17 screens · 45 fields · 14 fn · 28 TC PLANNED/STUB/OOS*
