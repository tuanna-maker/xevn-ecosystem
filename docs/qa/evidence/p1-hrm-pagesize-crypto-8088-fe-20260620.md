# P1-HRM-PAGESIZE-CRYPTO-8088-01 — Dev-FE evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-PAGESIZE-CRYPTO-8088-01` |
| **role** | dev-fe |
| **executed_at** | 2026-06-20 |
| **spec_ref** | `docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md` Wave 2 |
| **ack_status** | **READY_FOR_QA** |

---

## Summary

Closed R3 P0 FE blockers for `:8088` HRM wave: `page_size` capped ≤100, `crypto.randomUUID` polyfill on HTTP, SPA routes for settings-catalogs + employee-metadata, contracts list uses paginated API + `main` scope, portal embed session bridge bootstrapped in `main.tsx`.

---

## Fixes (D-HRM-*)

| ID | Change | Files |
|----|--------|-------|
| D-HRM-PAGESIZE-200 | `listAllEmployees` + `HRM_API_MAX_PAGE_SIZE` (100) in `useEmployees`, `Dashboard`, `CompanyMembersManagement`, `AddInsuranceDialog`, `useAttendanceRecords`; `listAttendanceRecords` / `listOperationsTasks` clamp in `hrmApi` | `useEmployees.ts`, `Dashboard.tsx`, `CompanyMembersManagement.tsx`, `AddInsuranceDialog.tsx`, `useAttendanceRecords.ts`, `hrmApi.ts` |
| D-HRM-CRYPTO-HTTP | `safeRandomUuid` + `installSafeRandomUuidPolyfill()` at bootstrap; wired in API clients | `safeRandomUuid.ts`, `main.tsx`, `hrmApi.ts`, `tenantScopeApi.ts`, `hrmOperatingUnits.ts`, `hrmMobileAuth.ts`, `EmployeeJobList.tsx` |
| D-HRM-ROUTES-404 | Routes `/hr/settings-catalogs`, `/hr/employee-metadata` | `App.tsx`, `SettingsCatalogsPage.tsx`, `EmployeeMetadataPage.tsx` |
| D-HRM-CONTRACTS-UI-EMPTY | `useContracts` → `listAllEmployeeContracts` + `coerceHrmListCompanyId` | `useContracts.ts`, `Contracts.tsx` |
| D-HRM-MEMBER-UI-LOGIN (partial) | `initPortalEmbedSessionBridge()` in `main.tsx`; portal login email normalized lowercase | `main.tsx`, `portalEmbedSessionBridge.ts`, `LoginPage.tsx` (web-portal) |

---

## Verification

| Check | Result |
|-------|--------|
| `pnpm --filter vite_react_shadcn_ts run build` | **exit 0** |
| vitest targeted | **24/24 PASS** (`safeRandomUuid`, `hrmDataMode`, `portalEmbedSessionBridge`, `useEmployees.pageSize`, `useContracts.binding`) |
| `rg page_size: 200 apps/web/hrm/src` | **0** (employees hooks) |

---

## Deploy bundle (pscp :8088)

**Source directory:** `apps/web/hrm/dist/`

**Entry + new route chunks (post-build):**

| Path | Notes |
|------|-------|
| `apps/web/hrm/dist/index.html` | SPA shell |
| `apps/web/hrm/dist/assets/index-*.js` | Main bundle (polyfill + embed bridge) |
| `apps/web/hrm/dist/assets/SettingsCatalogsPage-*.js` | UF-HRM-10 route |
| `apps/web/hrm/dist/assets/EmployeeMetadataPage-*.js` | UF-HRM-11 route |
| `apps/web/hrm/dist/assets/SettingsCatalogsTab-*.js` | Catalog tab module |
| `apps/web/hrm/dist/assets/Contracts-*.js` | Contracts binding fix |
| `apps/web/hrm/dist/assets/useEmployees-*.js` | page_size cap |

Sync full `dist/` tree to VPS HRM static root (same path as prior PSCP wave).

---

## Residual (QA R4)

| Item | Owner | Notes |
|------|-------|-------|
| Member portal login `du-lich.*` no token on prod | dev-be / devops | If `xbos_portal_user` rows missing when `NODE_ENV=production` && `SEED_PORTAL_USERS≠true`, login 401/403 — not FE; verify auth API on `:8088` |
| Deploy to `:8088` | PM / devops | Rebuild + pscp before QA R4 |

---

## Handoff

- **completion_report:** All five R3 FE P0 items implemented; build + vitest PASS; deploy bundle listed.
- **next_owner:** `qa` (after PM/devops deploy)
- **next_dispatch_prompt:** PM deploy `apps/web/hrm/dist/` to `:8088` via pscp; then Task qa — work_item_id `P1-BROWSER-E2E-HRM-WAVE-8088-R4`: entry `docs/qa/evidence/p1-hrm-pagesize-crypto-8088-fe-20260620.md`; browser U63 full Wave 2 UF-HRM-01..13 on `http://14.225.217.232:8088/`; accounts `ceo@xe.vn`, `du-lich.hr@xe.vn`, `du-lich.ceo@xe.vn`; verify page_size≤100 employees list, contracts rows, routes `/hr/settings-catalogs` + `/hr/employee-metadata`, UF-HRM-12 requisition without crypto error; ack PASS_TO_PM or FAIL_TO_PM.
- **evidence_path:** `docs/qa/evidence/p1-hrm-pagesize-crypto-8088-fe-20260620.md`
- **ack_status:** **READY_FOR_QA**
