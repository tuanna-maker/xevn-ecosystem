# XeVN Theme — Screen Inventory (ops-first density)

| | |
|--|--|
| **work_item_id** | `XEVN-THM-BA-01` |
| **Program** | `P1-XEVN-THEME-REMASTER-PROGRAM.md` |
| **Brand SoT** | `XEVN_BRAND_UIUX_PROPOSAL.md` (APPROVED-SPONSOR) |
| **Locks** | L-CONTRAST · L-TYPE · L-OPS · L-THEME · L-SCOPE |
| **Date** | 2026-07-22 |
| **Owner** | ba-process |
| **Status** | LOCKED for remaster waves — every row must get verdict or waiver |

---

## 0. How to read

| Field | Meaning |
|-------|---------|
| **screen_id** | Stable ID for remaster / QA evidence |
| **surface** | Route or navigator name (code truth) |
| **ops-priority** | **P0** daily tác nghiệp · **P1** tuần/chu kỳ · **P2** hỗ trợ / brand / rare |
| **clutter risks** | Pattern hiện tại dễ FAIL L-OPS |
| **AC density — stays** | Phải giữ sau remaster |
| **AC density — demotes** | Thu gọn / secondary / ẩn mặc định / bỏ chrome |

**Waves (program):**

| Wave code | Scope | Owner |
|-----------|-------|-------|
| **FE-W1** | Portal chrome + login + CC + XBOS dashboard/settings | `XEVN-THM-FE-W1` |
| **FE-W1-HRM** | HRM web (`apps/web/hrm`) toàn bộ routes (+ embed qua CC) | `XEVN-THM-FE-W1-HRM` |
| **MOB-W2** | HRM mobile mọi screen features | `XEVN-THM-MOB-W2` |

**Global AC (mọi hàng):** body/label ≥ `#374151`; page title ≥ 20px bold; web body ≥ 15px / table ≥ 14px; mobile body ≥ 17; cấm pill-cluster che form; 1 tiêu đề + 1 vùng data chính + CTA rõ trên màn P0.

---

## 1. Wave FE-W1 — Web Portal (XBOS / Command Center)

**Sources:** `apps/web/web-portal/src/App.tsx`, `Sidebar.tsx`, `CommandCenterPage.tsx` settings menus.

### 1.1 Auth & shell chrome

| screen_id | surface | ops | clutter risks | stays | demotes |
|-----------|---------|-----|---------------|-------|---------|
| **WP-AUTH-LOGIN** | `/login` (`LoginPage`) | P0 | Light gray shell; weak brand test without mark hierarchy | Dark brand shell; mark ≥64; form card; CTA primary; login 2xx+redirect | Marketing blurb; pale helper text; decorative gradients |
| **WP-SHELL-UNIFIED** | `/` (`UnifiedShellPage`) | P0 | Multi-module tiles competing with entry CTA | Clear entry to Cockpit / CC; XeVN mark in chrome | Extra KPI chips without action |
| **WP-SHELL-HEADER** | `TopHeader` (shared) | P0 | Missing mark → brand test FAIL | Mark 32–40 + wordmark; membership/scope; sticky glass thin | Stats strip in header; emoji; multi-layer shadow |
| **WP-SHELL-SIDEBAR** | `Sidebar` (`/dashboard/*`) | P1 | Long HRM child list + duplicate paths | Active route contrast; group labels | Badge spam; muted icons as only status |

### 1.2 Executive / governance routes

| screen_id | surface | ops | clutter risks | stays | demotes |
|-----------|---------|-----|---------------|-------|---------|
| **WP-COCKPIT** | `/cockpit` (`ExecutiveDashboardPage`) | P1 | Dashboard marketing: sparkline + task + route cards | Actionable KPI + deep-link to module; empty/error states | Chip cluster; decorative charts without drill-down |
| **WP-CATALOG-GOV** | `/catalog-governance` | P0 | Dense catalog tables + status colors only | Table + approve/reject CTA; scope label; contrast status+icon | Pale secondary labels; auto-reload spinner chrome |
| **WP-CC-HOME** | `/command-center` (module rail + workspace) | P0 | Module rail + settings + HRM embed competition | Rail clarity (group / system / HRM); one primary pane | Floating promo cards; duplicate nav labels |
| **WP-CC-RAIL** | `CommandCenterModuleRail` | P0 | Icon+label density on narrow rail | Selected state contrast; disabled reason | Extra module icons without route |

### 1.3 Command Center — System settings panels (`?settings=`)

| screen_id | surface | ops | clutter risks | stays | demotes |
|-----------|---------|-----|---------------|-------|---------|
| **WP-CC-SET-MEMBERS** | `company_member_units` | P0 | Legal entity + shareholder + RACI tabs overload | Member list → detail; Lưu; F5 persist | Nested marketing cards; unused mock blocks |
| **WP-CC-SET-INFRA** | `company_infrastructure` | P1 | Multi-block titles (general/location/capacity) | Form blocks + save; readable labels | Decorative block headers without data |
| **WP-CC-SET-DEPT-SYS** | `company_dept_system` | P0 | Tree + table dual chrome | Dept tree + assign head; primary CTA | Duplicate filter bars |
| **WP-CC-SET-TENANT-DEPT** | `tenant_departments` | P0 | Scope entity picker noise | Scoped dept list CRUD | Extra KPI row above table |
| **WP-CC-SET-GROUP-HR** | `company_group_hr` | P0 | Catalog field matrix density | Field catalog table + publish path | Pill toggles without labels |
| **WP-CC-SET-HRM-GOV** | `hrm_catalog_governance` | P0 | Same as catalog-gov duplicate entry | Approve/apply queue clarity | Redundant banners |
| **WP-CC-SET-HRM-APPLY** | `hrm_catalog_apply_members` | P0 | Multi-select member clutter | Apply scope + confirm CTA | Stats strip |
| **WP-CC-SET-PERM** | `permission` | P0 | RACI matrix wide + role chips | Matrix scroll + role filter; icon+text rights | Color-only permission cells |
| **WP-CC-SET-WF** | `workflow` | P0 | Canvas + step table + node chrome | Canvas Bezier; step table; reject dashed; save | Extra trigger chips; `text-[15px] text-slate-500` headers → raise contrast |
| **WP-CC-SET-ASSET** | `asset_requests` | P1 | List + form dual | Request list → detail/approve | Decorative status pills |
| **WP-CC-SET-DOC** | `document` | P1 | Catalog rows dense | Doc catalog CRUD | Unused category chips |
| **WP-CC-SET-MEASURE** | `measurement` | P2 | Rare config | Currency/measure table | Marketing headers |
| **WP-CC-SET-PRICE** | `pricing` | P2 | Rare config | Pricing table + save | Extra sparklines |

### 1.4 Dashboard XBOS routes (`/dashboard/*`)

| screen_id | surface | ops | clutter risks | stays | demotes |
|-----------|---------|-----|---------------|-------|---------|
| **WP-ORG** | `/dashboard/organization` | P1 | Org charts + cards | Org structure + edit path | TRSPORT/LGTS placeholder chrome |
| **WP-HR-LEGACY** | `/dashboard/hr` | P2 | Legacy vs CC HRM duplicate | Redirect/clarity to CC HRM | Parallel HR chrome |
| **WP-CUSTOMERS** | `/dashboard/customers` | P1 | CRM list chrome | Customer list → detail | Unused KPI strip |
| **WP-PARTNERS** | `/dashboard/partners` | P1 | Same | Partner list → detail | Decorative cards |
| **WP-KPI-POLICY** | `/dashboard/kpi-policy` | P1 | Policy form density | Policy editor + save | Step tutorial cards |
| **WP-KPI-DASH** | `/dashboard/kpi-dashboard` | P1 | Charts + filters | Filter + chart + export | Multi-metric chip clusters |
| **WP-SET-POS** | `/dashboard/settings/positions` | P1 | Catalog table | CRUD + contrast | Pale muted labels |
| **WP-SET-DEPT** | `/dashboard/settings/departments` | P1 | Same | CRUD | — |
| **WP-SET-REG** | `/dashboard/settings/regions` | P2 | Same | CRUD | — |
| **WP-SET-VEH** | `/dashboard/settings/vehicles` | P2 | Same | CRUD | — |
| **WP-SET-VEN** | `/dashboard/settings/vendors` | P2 | Same | CRUD | — |
| **WP-SET-EXP** | `/dashboard/settings/expense-categories` | P2 | Same | CRUD | — |
| **WP-SET-KPI-M** | `/dashboard/settings/kpi-metrics` | P1 | Same | CRUD | — |
| **WP-SET-KPI-F** | `/dashboard/settings/kpi-formulas` | P1 | Formula editor chrome | Formula list + editor | Tutorial cards |
| **WP-404** | `/dashboard/*` unknown | P2 | — | Clear 404 + back | Oversized display type only |

### 1.5 HRM embed shell (portal side — remaster in FE-W1; content in FE-W1-HRM)

| screen_id | surface | ops | clutter risks | stays | demotes |
|-----------|---------|-----|---------------|-------|---------|
| **WP-HRM-EMBED** | `/command-center/hrm/*` (`HrmWorkspaceRoute`) | P0 | Double chrome (portal + iframe) | Soft-nav sync; no double sticky fight; loading/error | Extra portal banners over embed |
| **WP-HRM-DEEPLINK-*** | Sidebar deep links → `.../hrm/{module}` | P0 | Path alias drift | Deep link opens correct HRM page | — |

**FE-W1 count:** 35 screen rows (auth/shell + CC settings + dashboard + embed shell).

---

## 2. Wave FE-W1-HRM — HRM Web (`apps/web/hrm`)

**Sources:** `apps/web/hrm/src/App.tsx` + page tab inventories.  
**Note:** Standalone routes mirror embed paths under `/command-center/hrm/...`.

### 2.1 Public / auth

| screen_id | surface | ops | clutter risks | stays | demotes |
|-----------|---------|-----|---------------|-------|---------|
| **HRM-LANDING** | `/landing` | P2 | Marketing stats (10,000+…) | Brand mark + CTA login | Stat strip; AI-marketing copy |
| **HRM-LOGIN** | `/login` | P0 | Light shell; small type | Dark shell option A or light+hero mark; form; error recovery | Pale placeholders as body text |
| **HRM-REGISTER** | `/register` | P2 | Long form | Required fields + CTA | Extra promo columns |
| **HRM-ONBOARD** | `/onboarding` | P2 | Wizard chrome | Step progress + primary CTA | Decorative illustrations |
| **HRM-FORGOT** | `/forgot-password` | P1 | — | Email submit + success state | Extra tips wall |
| **HRM-RESET** | `/reset-password` | P1 | — | Password rules readable | Tiny muted hints |
| **HRM-PRIVACY** | `/privacy-policy` | P2 | Dense legal | Readable body contrast | — |
| **HRM-GUIDE** | `/guide` | P2 | Long doc | TOC + readable type | Chip tags |
| **HRM-PLAT-ADMIN** | `/platform-admin` | P1 | Admin matrix | Scoped admin actions | Dashboard fluff |
| **HRM-404** | `*` | P2 | — | Back to home | — |

### 2.2 Core ops modules (P0)

| screen_id | surface | ops | clutter risks | stays | demotes |
|-----------|---------|-----|---------------|-------|---------|
| **HRM-INDEX** | `/` (`Index`) | P1 | Home widgets | Entry to employees/attendance | Marketing tiles |
| **HRM-DASH** | `/dashboard` (maps Employees permission) | P0 | Confusing alias vs Employees | Clear list entry | Duplicate dashboards |
| **HRM-EMP-LIST** | `/employees` | P0 | Filter bar + status pills + dense table | Search + filters + table + create; list→detail J-* | Color-only status; `text-xs` cells |
| **HRM-EMP-PROFILE** | `/employees/:id` | P0 | Many tabs + pin chrome + colored tab icons | Main tabs general/work/contract/salary; Lưu; F5 | Extra pinned chrome; rainbow icon pills; secondary tabs behind «More» default |
| **HRM-ATT** | `/attendance` | P0 | 7 top tabs + dropdowns + colored pills | Overview KPI readable; sheets/records; leave; requests | Rainbow tab pills → neutral active; unused checkinout/QR/face submenu chrome if empty |
| **HRM-ATT-LEAVE** | Attendance tab `leave` (+ LeaveTab) | P0 | Balance chips + filters | Leave list → detail/approve; balance visible | Auto-reload empty storm chrome |
| **HRM-ATT-REQ** | Attendance tab `requests` | P0 | 9 submenu items | Leave / update-attendance / OT primary | Rare menus (compensatory summary) collapsed |
| **HRM-ATT-SHEETS** | Attendance submenu sheets/records/weekly | P0 | Dense grid | Sheet table + save; empty honest | Stats above without action |
| **HRM-PAY** | `/payroll` | P0 | 7 tabs + step tutorial cards + gradients | Components/policy/calculate/payment tables | Overview step video cards; gradient icon tiles |
| **HRM-PAY-PAYMENT** | Payroll tab `payment` | P0 | Form dialogs dense | Payment run list + create; money vi-VN | Tutorial side panels |
| **HRM-CTR** | `/contracts` | P0 | Wide table + filters | List → detail/create; date dd/MM/yyyy | Pale muted columns |
| **HRM-INS** | `/insurance` | P0 | Same | List → mutate; amounts grouped | Extra KPI strip |
| **HRM-DEC** | `/decisions` | P0 | Type tabs + status filters | Create→list→F5; status+icon | Density sample only ≠ skip contrast |
| **HRM-CO** | `/company` | P0 | 4 tabs (`companies|members|departments|subscription`) | Dept/member ops tabs first | Subscription marketing |

### 2.3 Recruitment & performance (P1)

| screen_id | surface | ops | clutter risks | stays | demotes |
|-----------|---------|-----|---------------|-------|---------|
| **HRM-REC** | `/recruitment` | P1 | 11 colored top tabs + nested dropdowns | Jobs/candidates/interviews/requisitions primary | Rainbow `bg-*-500` tab icons; dashboard mock cards |
| **HRM-REC-CAND** | Rec tab `candidates` | P0 | Pipeline filters | List → candidate detail; hire link | Decorative stage pills |
| **HRM-REC-JOB** | Rec tab `jobs` / requisitions | P0 | Dual menus | JD/requisition CRUD | Campaign promo chrome |
| **HRM-PERF** | `/performance` | P1 | Eval cards | Cycle list → score entry | Marketing overview |

### 2.4 Settings & catalogs (P1)

| screen_id | surface | ops | clutter risks | stays | demotes |
|-----------|---------|-----|---------------|-------|---------|
| **HRM-SET** | `/settings` | P1 | 8 tabs (account…catalogs) | Account/security/roles/catalogs | Branding fluff if unused |
| **HRM-SET-CAT** | `/settings-catalogs` | P0 | Catalog sync banners | Pull/apply status clear; table contrast | Duplicate sync ERROR banners |
| **HRM-EMP-META** | `/employee-metadata` | P0 | Field type matrix | Metadata CRUD | Extra chips |

### 2.5 Secondary modules (P1–P2)

| screen_id | surface | ops | clutter risks | stays | demotes |
|-----------|---------|-----|---------------|-------|---------|
| **HRM-REP** | `/reports` | P1 | 7 report tabs + charts | Year filter + tab content | Overview marketing charts |
| **HRM-TASK** | `/tasks` | P1 | Status pill tabs | Task list + filters | Tiny pill labels |
| **HRM-PROC** | `/processes` | P1 | processes/policies tabs | Process list | Policy marketing |
| **HRM-SVC** | `/internal-services` | P2 | meal/vehicle/supply pill tabs | Tab content tables | Rounded-full pill cluster |
| **HRM-TOOLS** | `/tools-equipment` | P2 | inventory/assignments pills | Inventory table | Same pill style → neutral tabs |
| **HRM-AI** | `/ai` (`UniAI`) | P2 | Chat + tabs chrome | Chat input contrast | Decorative AI glow |

**Employee profile sub-surfaces (count under HRM-EMP-PROFILE remaster, not separate wave):**  
`general`, `work`, `contract`, `salary`, `cv`, `kpi`, `insurance`, `training`, `assets`, `rewards`, `workHistory`, `degrees`, `certificates`, `skills`, `family`.

**Attendance sub-surfaces:** overview, attendance(+checkinout/qr/face/gps/sheets/records/weekly/summary), shifts(+list/schedule/overtime), requests(+9), leave, reports, settings.

**Payroll sub-surfaces:** overview, components, policy, data, calculate, payment, reports.

**FE-W1-HRM count:** 34 top-level route rows + documented sub-tab surfaces (must remaster with parent).

---

## 3. Wave MOB-W2 — HRM Mobile

**Sources:** `apps/mobile/hrm-mobile/src/navigation/RootNavigator.tsx`, `src/features/**/*Screen.tsx`.  
**Tokens:** `theme/tokens.ts` (align MOB-00 before screen paint).

### 3.1 Auth & cold start

| screen_id | surface | ops | clutter risks | stays | demotes |
|-----------|---------|-----|---------------|-------|---------|
| **MOB-SPLASH** | `SplashIntro` (pre-nav) | P0 | Glow drift vs primary | Dark shell; mark 160; one motion | Neon pulse loop |
| **MOB-LOGIN** | `LoginScreen` | P0 | Light bg vs brand shell option | Logo ≥72; form; touch ≥44; error copy | Extra marketing text |
| **MOB-SCOPE** | `ScopeScreen` | P0 | Tech jargon in subtitle | VN copy only; membership pick; CTA | Slug/UUID in UI |

### 3.2 Tab roots

| screen_id | surface | ops | clutter risks | stays | demotes |
|-----------|---------|-----|---------------|-------|---------|
| **MOB-HOME** | Tab Home → `DashboardScreen` | P0 | Large screen; metric cards cluster | Check-in CTA; leave balance; inbox entry | Chip strip without action; pale secondary |
| **MOB-TAB-TEAM** | Tab Team → Attendance stack root | P0 | — | Directory entry | — |
| **MOB-TAB-PAY** | Tab Payslip stack | P0 | Empty list chrome | Payslip list entry | Decorative payroll cards |
| **MOB-TAB-PROFILE** | Tab Profile stack | P0 | Badge overload | Profile + approvals badge | Extra badge types |

### 3.3 Team / attendance stack

| screen_id | surface | ops | clutter risks | stays | demotes |
|-----------|---------|-----|---------------|-------|---------|
| **MOB-TEAM-DIR** | `TeamDirectoryScreen` | P0 | Row density | Search + row → detail; touch ≥44 | Status color-only |
| **MOB-TEAM-DET** | `TeamColleagueDetailScreen` | P0 | Field dump | Readable sections | Muted tiny labels |
| **MOB-CHECKIN** | `CheckInScreen` | P0 | Map/GPS chrome | Check-in/out CTA; success state | Extra tips |
| **MOB-ATT-HIST** | `AttendanceHistoryScreen` | P1 | Long list | Period filter + rows | KPI header fluff |

### 3.4 ESS leave / requests / approvals (Profile stack)

| screen_id | surface | ops | clutter risks | stays | demotes |
|-----------|---------|-----|---------------|-------|---------|
| **MOB-LEAVE-LIST** | `LeaveRequestsListScreen` | P0 | Balance header + list | Balance chip; list → detail | Auto empty reload |
| **MOB-LEAVE-CREATE** | `CreateLeaveRequestScreen` | P0 | Multi-step + attachment | Steps 0–2; balance chip; submit; attachment gate | Extra helper walls |
| **MOB-LEAVE-DET** | `LeaveRequestDetailScreen` | P0 | Metric grid | Status + dates + approve path if mgr | Color-only status |
| **MOB-UPD-LIST** | `UpdateRequestsScreen` | P1 | — | List → detail/create | — |
| **MOB-UPD-CREATE** | `CreateUpdateRequestScreen` | P1 | Form length | Required fields + submit | — |
| **MOB-UPD-DET** | `UpdateRequestDetailScreen` | P1 | — | Detail + status | — |
| **MOB-APPR** | `ManagerApprovalsScreen` | P0 | Mixed leave/update queue | Approve/reject ≥44; clear row | Chip filters excess |

### 3.5 Payroll / contracts / ops / profile

| screen_id | surface | ops | clutter risks | stays | demotes |
|-----------|---------|-----|---------------|-------|---------|
| **MOB-PAY-LIST** | `PayslipListScreen` | P0 | Empty state | List ≥1 when data; → detail | Placeholder marketing |
| **MOB-PAY-DET** | `PayslipDetailScreen` | P0 | Number density | vi-VN money; sections | Tiny gray amounts |
| **MOB-PAY-SUM** | `PayrollSummaryScreen` | P1 | Summary cards | Period summary | Extra charts |
| **MOB-CTR** | `ContractsScreen` | P1 | List | Contract rows readable | — |
| **MOB-OPS** | `OperationsScreen` | P2 | Sparse | Clear empty | Fake metrics |
| **MOB-PROFILE** | `ProfileScreen` | P0 | Dynamic form + metrics | ESS editable fields; save | Metric chip cluster |
| **MOB-NOTIF** | `InAppNotificationsScreen` | P1 | List | Notification rows + deep link | Unread color-only |
| **MOB-SETTINGS** | `SettingsScreen` | P1 | Grouped list | Scope/logout/settings rows | — |
| **MOB-JOURNEY** | `JourneyScreen` | P2 | Timeline chrome | Timeline readable | Decorative motion |

**MOB-W2 count:** 26 screens (+ splash).

---

## 4. Ops-priority rollup

| Priority | Intent | Examples |
|----------|--------|----------|
| **P0** | Daily login → list → mutate → F5 / approve | Login, CC settings org/WF/perm, employees, attendance leave/sheets, contracts, payroll payment, mobile check-in/leave/approvals/payslip |
| **P1** | Weekly / cycle | Recruitment, reports, tasks, KPI, catalog apply, performance, most settings |
| **P2** | Brand / rare / support | Landing, guide, AI, internal services, tools, measurement/pricing, journey |

**Remaster order (BA recommendation):**

1. FE-W1: `WP-AUTH-LOGIN` → `WP-SHELL-HEADER` → `WP-CC-*` P0 settings → embed shell  
2. FE-W1-HRM: `HRM-LOGIN` → `HRM-EMP-*` → `HRM-ATT-*` → `HRM-CTR/INS/DEC/PAY` → recruitment → rest  
3. MOB-W2: splash/login/scope → home/check-in/leave/approvals → payslip → remaining  

---

## 5. Cross-cutting clutter ban-list (AC for Dev)

| Pattern | FAIL if still on P0 after remaster |
|---------|-------------------------------------|
| Rainbow colored tab icon pills (`bg-orange-500` etc. as primary chrome) | Attendance / Recruitment / Payroll top nav |
| `text-slate-400` / `text-muted-foreground` for table body/labels | Any ops table |
| `text-xs` / `text-[11px]` for primary business text | Web P0 |
| Marketing step/video gradient cards above payroll ops | Payroll overview |
| Double sticky chrome portal+iframe | HRM embed |
| Stats strip with no click-through | Cockpit / dashboards |
| Status communicated by color alone | All surfaces |

---

## 6. Traceability

| Artifact | Role |
|----------|------|
| `P1-XEVN-THEME-REMASTER-PROGRAM.md` | Program waves / locks |
| `XEVN_BRAND_UIUX_PROPOSAL.md` | Token + brand shell AC |
| `apps/web/web-portal/src/App.tsx` | Portal routes |
| `apps/web/hrm/src/App.tsx` | HRM routes |
| `apps/mobile/hrm-mobile/src/navigation/RootNavigator.tsx` | Mobile screens |
| QA follow-up | `XEVN-THM-QA-01` visual matrix per screen_id sample |

**Out of scope this inventory:** HTML khách (ba-docs `XEVN-THM-DOCS-P0`); API/SRS business rules.

---

## 7. Counts (gate)

| Wave | Top-level screen_id rows |
|------|--------------------------|
| FE-W1 | 35 |
| FE-W1-HRM | 34 (+ sub-tabs documented) |
| MOB-W2 | 26 (+ splash) |
| **Total inventory rows** | **95+** |

Every row: remaster verdict or waiver (owner + expiry) before program DoD.
