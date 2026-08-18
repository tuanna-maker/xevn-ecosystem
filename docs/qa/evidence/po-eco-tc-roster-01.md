# PO-ECO-TC-ROSTER-01 — Ecosystem menu roster evidence

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-ECO-TC-ROSTER-01` |
| **role** | qa |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **policy** | U65 zero-seed · **không** claim UAT / Phase1 DONE |
| **roster SoT** | `docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md` |
| **program** | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` (U83) |

## Method

1. Diff prior roster (~39 rows) vs `AppSidebar.tsx` (`mainNavItems` L75–96 · `settingsNavItems` L99–103 · `/guide` L533–540).
2. HRM routes: `apps/web/hrm/src/App.tsx` L168–192 (`/settings-catalogs` L179 · `/employee-metadata` L180 · `/employees/:id` L171).
3. Portal CC: `apps/web/web-portal/src/App.tsx` L54–61 · `CommandCenterPage.tsx` `companySetupSubMenus` L1208–1224 · `settingsMenusAfterCompany` L1226–1237 · `SettingsMenuKey` L352–363.
4. CC HRM embed keys: `apps/web/web-portal/src/modules/hrm/types.ts` L5–24.
5. CC rail: `apps/web/web-portal/src/data/command-center-rail-catalog.ts` L7–50.
6. Portal sidebar HRM children: `apps/web/web-portal/src/components/layout/Sidebar.tsx` L84–192 · dashboard settings L203–257.
7. Mobile: `RootNavigator.tsx` stacks L131–233 · FAB `fabPrimaryActions.ts` L26–127.
8. Cross-check UF: `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §3 (UF-XBOS-01..15) · §4/§4b (UF-HRM-MENU-01..17).

## Totals

| Surface | Leaf rows (inventory) | Wave A DISPATCHED | Wave B PLANNED (pack WI) | Wave C PLANNED |
|---------|----------------------|-------------------|--------------------------|----------------|
| **xbos-cc** | 52 | 14 | 28 | 10 |
| **hrm-web** | 22 | 4 | 16 | 2 |
| **mobile** | 28 | 8 | 17 | 3 |
| **All** | **102** | **26** | **61** | **15** |

Distinct TC pack files (after gộp embed → hrm-web): **~56**.

## Master table (leaf inventory)

| menu_id | surface | route / entry | source file:line | wave | pack status |
|---------|---------|---------------|------------------|------|-------------|
| XBOS-LOGIN | xbos-cc | `/login` | `web-portal/src/App.tsx:44` | B | PLANNED |
| XBOS-UNIFIED-HOME | xbos-cc | `/` | `web-portal/src/App.tsx:54` | C | PLANNED |
| XBOS-COCKPIT | xbos-cc | `/cockpit` | `web-portal/src/App.tsx:55` | B | PLANNED |
| XBOS-CC-HOME | xbos-cc | `/command-center` | `web-portal/src/App.tsx:58` | B | PLANNED |
| XBOS-CC-INBOX-WF | xbos-cc | `/command-center/inbox` | `web-portal/src/App.tsx:57` | A | DISPATCHED |
| XBOS-CATALOG-GOV-PAGE | xbos-cc | `/catalog-governance` | `web-portal/src/App.tsx:56` | A | DISPATCHED |
| XBOS-CC-SETUP-MEMBER | xbos-cc | `?settings=company_member_units` | `CommandCenterPage.tsx:1208-1212` | A | DISPATCHED |
| XBOS-CC-SETUP-INFRA | xbos-cc | `?settings=company_infrastructure` | `CommandCenterPage.tsx:1214-1217` | C | PLANNED |
| XBOS-CC-SETUP-DEPT-SYS | xbos-cc | `?settings=company_dept_system` | `CommandCenterPage.tsx:1219-1223` | A | DISPATCHED |
| XBOS-LEGAL-PROFILE | xbos-cc | member unit form | `CommandCenterPage.tsx:967+` | A | DISPATCHED |
| XBOS-SHAREHOLDERS | xbos-cc | tab Cổ đông | `CommandCenterPage.tsx:1620+` | A | DISPATCHED |
| XBOS-LEGAL-DOCS | xbos-cc | tab Tài liệu | `legalEntityProfileApi.ts:162+` | A | DISPATCHED |
| XBOS-RACI | xbos-cc | tab RACI · `?settings=raci` | `CommandCenterPage.tsx:967,1414-1415` | B | PLANNED |
| XBOS-ORG-UNITS | xbos-cc | tenant_departments / org | `CommandCenterPage.tsx:1227` | A | DISPATCHED |
| XBOS-CC-SET-GROUP-HR | xbos-cc | `company_group_hr` | `CommandCenterPage.tsx:1228` | B | PLANNED |
| XBOS-CATALOG-GOV | xbos-cc | `hrm_catalog_governance` | `CommandCenterPage.tsx:1229` | A | DISPATCHED |
| XBOS-CATALOG-APPLY | xbos-cc | `hrm_catalog_apply_members` | `CommandCenterPage.tsx:1230` | A | DISPATCHED |
| XBOS-RBAC-MATRIX | xbos-cc | `permission` | `CommandCenterPage.tsx:1231` | B | PLANNED |
| XBOS-WF-DESIGNER | xbos-cc | `workflow` | `CommandCenterPage.tsx:1232` | B | PLANNED |
| XBOS-ASSET-REQUESTS | xbos-cc | `asset_requests` | `CommandCenterPage.tsx:1233` | C | PLANNED |
| XBOS-CATALOG-CC-DOC | xbos-cc | `document` | `CommandCenterPage.tsx:1234` | B | PLANNED |
| XBOS-CATALOG-CC-MEASURE | xbos-cc | `measurement` | `CommandCenterPage.tsx:1235` | B | PLANNED |
| XBOS-CATALOG-CC-PRICE | xbos-cc | `pricing` | `CommandCenterPage.tsx:1236` | B | PLANNED |
| XBOS-MEMBER-SCOPE | xbos-cc | member CEO persona | `USER_FLOW_OPERABILITY_MATRIX.md:UF-XBOS-11` | B | PLANNED |
| XBOS-RAIL-GROUP | xbos-cc | `/command-center` | `command-center-rail-catalog.ts:8-12` | B | PLANNED |
| XBOS-RAIL-FINANCE | xbos-cc | `/dashboard/customers` | `command-center-rail-catalog.ts:14-18` | C | PLANNED |
| XBOS-RAIL-ACCOUNTING | xbos-cc | `/dashboard/kpi-dashboard` | `command-center-rail-catalog.ts:20-24` | C | PLANNED |
| XBOS-RAIL-HRM-LINK | xbos-cc | `/dashboard/hr` | `command-center-rail-catalog.ts:26-30` | C | PLANNED |
| XBOS-RAIL-BUSINESS | xbos-cc | `/dashboard/kpi-dashboard` | `command-center-rail-catalog.ts:32-36` | C | PLANNED |
| XBOS-RAIL-FLEET | xbos-cc | `/dashboard/organization` | `command-center-rail-catalog.ts:38-42` | C | PLANNED |
| XBOS-RAIL-SYSTEM | xbos-cc | `/command-center` | `command-center-rail-catalog.ts:44-48` | C | PLANNED |
| XBOS-HRM-EMBED-DASH | xbos-cc | `/command-center/hrm/dashboard` | `modules/hrm/types.ts:6` | B | PLANNED |
| XBOS-HRM-EMBED-EMP | xbos-cc | `…/hrm/employees` | `types.ts:7` · `Sidebar.tsx:95` | A | DISPATCHED |
| XBOS-HRM-EMBED-CON | xbos-cc | `…/hrm/contracts` | `types.ts:8` | B | PLANNED |
| XBOS-HRM-EMBED-INS | xbos-cc | `…/hrm/insurance` | `types.ts:9` | B | PLANNED |
| XBOS-HRM-EMBED-DEC | xbos-cc | `…/hrm/decisions` | `types.ts:10` | B | PLANNED |
| XBOS-HRM-EMBED-REC | xbos-cc | `…/hrm/recruitment` | `types.ts:11` | A | DISPATCHED |
| XBOS-HRM-EMBED-ATT | xbos-cc | `…/hrm/attendance` | `types.ts:12` | A | DISPATCHED |
| XBOS-HRM-EMBED-PAY | xbos-cc | `…/hrm/payroll` | `types.ts:13` | B | PLANNED |
| XBOS-HRM-EMBED-PERF | xbos-cc | `…/hrm/performance` | `types.ts:14` | B | PLANNED |
| XBOS-HRM-EMBED-AI | xbos-cc | `…/hrm/hrm_ai` | `types.ts:15` | B | PLANNED |
| XBOS-HRM-EMBED-TASK | xbos-cc | `…/hrm/tasks` | `types.ts:16` | B | PLANNED |
| XBOS-HRM-EMBED-PROC | xbos-cc | `…/hrm/processes` | `types.ts:17` | B | PLANNED |
| XBOS-HRM-EMBED-SVC | xbos-cc | `…/hrm/internal_services` | `types.ts:18` | B | PLANNED |
| XBOS-HRM-EMBED-TOOLS | xbos-cc | `…/hrm/tools_equipment` | `types.ts:19` | B | PLANNED |
| XBOS-HRM-EMBED-FLEET | xbos-cc | `…/hrm/fleet` | `types.ts:20` | B | PLANNED |
| XBOS-HRM-EMBED-CO | xbos-cc | `…/hrm/company` | `types.ts:21` | B | PLANNED |
| XBOS-HRM-EMBED-RPT | xbos-cc | `…/hrm/reports` | `types.ts:22` | B | PLANNED |
| XBOS-HRM-EMBED-SET | xbos-cc | `…/hrm/settings` | `types.ts:23` | B | PLANNED |
| XBOS-HRM-EMBED-GUIDE | xbos-cc | `…/hrm/guide` | `types.ts:24` · `Sidebar.tsx:185` | C | PLANNED |
| XBOS-DASH-ORG | xbos-cc | `/dashboard/organization` | `Sidebar.tsx:54` | C | PLANNED |
| XBOS-DASH-SET-POS | xbos-cc | `/dashboard/settings/positions` | `App.tsx:82` | C | PLANNED |
| XBOS-DASH-SET-DEPT | xbos-cc | `/dashboard/settings/departments` | `App.tsx:83` | C | PLANNED |
| XBOS-DASH-SET-REG | xbos-cc | `/dashboard/settings/regions` | `App.tsx:84` | C | PLANNED |
| XBOS-DASH-SET-VEH | xbos-cc | `/dashboard/settings/vehicles` | `App.tsx:85` | C | PLANNED |
| XBOS-DASH-SET-VND | xbos-cc | `/dashboard/settings/vendors` | `App.tsx:86` | C | PLANNED |
| XBOS-DASH-SET-EXP | xbos-cc | `/dashboard/settings/expense-categories` | `App.tsx:87` | C | PLANNED |
| XBOS-DASH-SET-KPI-M | xbos-cc | `/dashboard/settings/kpi-metrics` | `App.tsx:88` | C | PLANNED |
| XBOS-DASH-SET-KPI-F | xbos-cc | `/dashboard/settings/kpi-formulas` | `App.tsx:89` | C | PLANNED |
| HRM-DASHBOARD | hrm-web | `/` | `AppSidebar.tsx:76` | B | PLANNED |
| HRM-EMPLOYEES | hrm-web | `/employees` | `AppSidebar.tsx:81` | A | DISPATCHED |
| HRM-EMPLOYEE-PROFILE | hrm-web | `/employees/:id` | `App.tsx:171` | A | DISPATCHED |
| HRM-CONTRACTS | hrm-web | `/contracts` | `AppSidebar.tsx:82` | B | PLANNED |
| HRM-INSURANCE | hrm-web | `/insurance` | `AppSidebar.tsx:83` | B | PLANNED |
| HRM-DECISIONS | hrm-web | `/decisions` | `AppSidebar.tsx:84` | B | PLANNED |
| HRM-RECRUITMENT | hrm-web | `/recruitment` | `AppSidebar.tsx:87` | A | DISPATCHED |
| HRM-ATTENDANCE | hrm-web | `/attendance` | `AppSidebar.tsx:88` | A | DISPATCHED |
| HRM-PAYROLL | hrm-web | `/payroll` | `AppSidebar.tsx:89` | B | PLANNED |
| HRM-PERFORMANCE | hrm-web | `/performance` | `AppSidebar.tsx:90` | B | PLANNED |
| HRM-AI | hrm-web | `/ai` | `AppSidebar.tsx:91` | B | PLANNED |
| HRM-TASKS | hrm-web | `/tasks` | `AppSidebar.tsx:92` | B | PLANNED |
| HRM-PROCESSES | hrm-web | `/processes` | `AppSidebar.tsx:93` | B | PLANNED |
| HRM-INTERNAL-SERVICES | hrm-web | `/internal-services` | `AppSidebar.tsx:94` | B | PLANNED |
| HRM-TOOLS | hrm-web | `/tools-equipment` | `AppSidebar.tsx:95` | B | PLANNED |
| HRM-FLEET | hrm-web | `/fleet` | `AppSidebar.tsx:96` · `App.tsx:192` | B | PLANNED |
| HRM-COMPANY | hrm-web | `/company` | `AppSidebar.tsx:100` | B | PLANNED |
| HRM-REPORTS | hrm-web | `/reports` | `AppSidebar.tsx:101` | B | PLANNED |
| HRM-SETTINGS | hrm-web | `/settings` | `AppSidebar.tsx:102` · `App.tsx:178` | B | PLANNED |
| HRM-SETTINGS-CATALOGS | hrm-web | `/settings-catalogs` | `App.tsx:179` | B | PLANNED |
| HRM-EMPLOYEE-METADATA | hrm-web | `/employee-metadata` | `App.tsx:180` · `EmployeeMetadataPage.tsx:3` | B | PLANNED |
| HRM-GUIDE | hrm-web | `/guide` | `AppSidebar.tsx:533-540` · `App.tsx:153` | C | PLANNED |
| MOB-LOGIN | mobile | `Login` | `RootNavigator.tsx:514` | B | PLANNED |
| MOB-HOME | mobile | Tab Home | `RootNavigator.tsx:378-382` | B | PLANNED |
| MOB-FAB-SHEET | mobile | FAB sheet | `fabPrimaryActions.ts:50-55` | B | PLANNED |
| MOB-FAB-CHECKIN | mobile | `fab-action-check-in` | `fabPrimaryActions.ts:59-68` | B | PLANNED |
| MOB-FAB-LEAVE | mobile | `fab-action-create-leave` | `fabPrimaryActions.ts:70-79` | A | DISPATCHED |
| MOB-FAB-UPDATE | mobile | `fab-action-create-update-request` | `fabPrimaryActions.ts:81-90` | B | PLANNED |
| MOB-FAB-APPROVE | mobile | `fab-action-manager-approvals` | `fabPrimaryActions.ts:92-101` | A | DISPATCHED |
| MOB-TEAM-DIR | mobile | `TeamDirectory` | `RootNavigator.tsx:139-145` | B | PLANNED |
| MOB-TEAM-DETAIL | mobile | `TeamColleagueDetail` | `RootNavigator.tsx:147-155` | B | PLANNED |
| MOB-CHECKIN | mobile | `CheckIn` | `RootNavigator.tsx:157` | B | PLANNED |
| MOB-ATT-HISTORY | mobile | `AttendanceHistory` | `RootNavigator.tsx:159` | B | PLANNED |
| MOB-PAYSLIP-LIST | mobile | `PayslipList` | `RootNavigator.tsx:175` | B | PLANNED |
| MOB-PAYSLIP-DETAIL | mobile | `PayslipDetail` | `RootNavigator.tsx:177` | B | PLANNED |
| MOB-PAYROLL-SUM | mobile | `PayrollSummary` | `RootNavigator.tsx:179` | B | PLANNED |
| MOB-PROFILE | mobile | `Profile` | `RootNavigator.tsx:195` | B | PLANNED |
| MOB-SETTINGS | mobile | `Settings` | `RootNavigator.tsx:211` | B | PLANNED |
| MOB-SCOPE | mobile | `Scope` | `RootNavigator.tsx:213` | B | PLANNED |
| MOB-NOTIFICATIONS | mobile | `Notifications` | `RootNavigator.tsx:209` | B | PLANNED |
| MOB-CONTRACTS | mobile | `Contracts` | `RootNavigator.tsx:215` | B | PLANNED |
| MOB-OPERATIONS | mobile | `Operations` | `RootNavigator.tsx:217` | B | PLANNED |
| MOB-JOURNEY | mobile | `Journey` | `RootNavigator.tsx:229` | C | PLANNED |
| MOB-LEAVE-LIST | mobile | `LeaveRequestsList` | `RootNavigator.tsx:197-201` | A | DISPATCHED |
| MOB-LEAVE-CREATE | mobile | `CreateLeaveRequest` | `RootNavigator.tsx:223` | A | DISPATCHED |
| MOB-LEAVE-DETAIL | mobile | `LeaveRequestDetail` | `RootNavigator.tsx:227` | A | DISPATCHED |
| MOB-UPDATE-LIST | mobile | `UpdateRequests` | `RootNavigator.tsx:219` | B | PLANNED |
| MOB-UPDATE-CREATE | mobile | `CreateUpdateRequest` | `RootNavigator.tsx:221` | B | PLANNED |
| MOB-UPDATE-DETAIL | mobile | `UpdateRequestDetail` | `RootNavigator.tsx:225` | B | PLANNED |
| MOB-APPROVALS | mobile | `ManagerApprovals` | `RootNavigator.tsx:203-207` | A | DISPATCHED |

## Gaps vs prior roster (closed)

| Gap class | Resolution |
|-----------|------------|
| HRM `/settings-catalogs` · `/employee-metadata` | Added `HRM-SETTINGS-CATALOGS` · `HRM-EMPLOYEE-METADATA` |
| HRM profile deep link | Added `HRM-EMPLOYEE-PROFILE` |
| HRM `/guide` footer nav | Added `HRM-GUIDE` |
| CC settings leaves (10 keys) | §A.4 rows + deep links |
| CC HRM embed 19 views | §A.6 mirrors `HrmWorkspaceMenuKey` |
| Mobile stack screens + FAB | §C 28 rows |
| CC inbox dedicated route | `XBOS-CC-INBOX-WF` distinct from home |
| Portal dashboard master data | §A.7 Wave C |

## Residual (not roster blockers)

- TC **pack files** under `docs/qa/testcases/{xbos,hrm-web,hrm-mobile}/` — mostly **not created** yet (Wave A in flight).
- `PO-ECO-TC-SYNTH-W1` waits Wave A seat completion.
- HRM auth routes (`/login`, `/register`, …) — **out of U83 menu depth v1**; add Wave C if sponsor expands auth pack.

## Wave B / C — copy-ready dispatch WI ids

**Wave B (priority packs — program §5):**

```
PO-ECO-TC-HRM-CONTRACTS-01
PO-ECO-TC-HRM-INSURANCE-01
PO-ECO-TC-HRM-DECISIONS-01
PO-ECO-TC-HRM-PAYROLL-01
PO-ECO-TC-HRM-SETTINGS-01
PO-ECO-TC-XBOS-RACI-01
PO-ECO-TC-XBOS-RBAC-01
PO-ECO-TC-XBOS-KPI-RAIL-01
PO-ECO-TC-XBOS-CATALOG-CC-01
PO-ECO-TC-XBOS-WF-01
PO-ECO-TC-MOB-HOME-01
PO-ECO-TC-MOB-ATTENDANCE-01
PO-ECO-TC-MOB-SETTINGS-01
PO-ECO-TC-MOB-PROFILE-01
PO-ECO-TC-HRM-PERFORMANCE-01
```

**Wave C (stub / rail / dashboard master / guide):**

```
PO-ECO-TC-XBOS-RAIL-STUBS-01
PO-ECO-TC-XBOS-DASH-SETTINGS-01
PO-ECO-TC-HRM-GUIDE-01
PO-ECO-TC-MOB-OPERATIONS-01
PO-ECO-TC-MOB-JOURNEY-01
```

---

## Handoff

```
completion_report: Roster expanded 39→102 leaves; diff vs AppSidebar, App.tsx, CommandCenter settings keys, HrmWorkspaceMenuKey, RootNavigator, FAB; ECOSYSTEM_MENU_ROSTER.md + this evidence updated. No product code.
next_owner: pm
next_dispatch_prompt: (see below)
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-eco-tc-roster-01.md
```
