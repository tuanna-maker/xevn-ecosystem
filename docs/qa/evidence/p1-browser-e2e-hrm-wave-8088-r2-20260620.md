# P1-BROWSER-E2E-HRM-WAVE-8088-R2 — QA evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-HRM-WAVE-8088-R2` |
| **role** | qa |
| **executed_at** | 2026-06-20T14:20+07 |
| **portal** | http://14.225.217.232:8088/ |
| **entry** | `P1-HRM-EMBED-PSCP-SETTINGS-CATALOG-8088` READY — [devops evidence](../../ops/evidence/p1-hrm-embed-pscp-8088-20260620.md) |
| **rule** | U63/U65 browser-only · **no seed** |
| **accounts** | `ceo@xe.vn`; `du-lich.hr@xe.vn` (API login scope probe) |
| **ack_status** | **PASS_TO_PM** |
| **parent evidence** | [§HRM-W2-R2](./p1-browser-e2e-xbos-hrm-20260620.md#hrm-w2-r2) |

---

## Executive summary

Post-DevOps PSCP retest: **HRM embed mount P0 CLOSED** (`hrmApi.ts` **200**, iframe `#root` renders). **Wave 2 exit still FAIL — 0/11 web UFs 🟢** (2 ⚪ mobile). New P0 blockers prevent list→detail / mutate / F5 chains despite API data on server.

| Class | W2 (pre-fix) | R2 (post-fix) |
|-------|--------------|---------------|
| Embed mount / Vite 500 | 🔴 blank iframe | **🟢 PASS** — `#root` 40k+ chars |
| UF-HRM-01..13 browser mutate | 🔴 not reachable | 🔴 reachable UI shell; **empty tables / 404 routes** |
| Wave 2 exit 11/11 | 0/11 | **0/11** |

---

## L0 / prerequisite gates

| Gate | Result | Notes |
|------|--------|-------|
| L0 `qc:dev-stack` | **PASS** exit 0 | hrm-api + xbos-api + portal 200 |
| `hrmApi.ts` via portal | **PASS** HTTP **200** | was 500 missing `@/lib/hrmSettingsCatalogItem` |
| `hrmSettingsCatalogItem.ts` | **PASS** HTTP **200** | |
| U65 no seed | **PASS** | no `pnpm seed:*` |
| UI login `ceo@xe.vn` | **PASS** | CC shell + NHÂN SỰ rail |
| HRM iframe `#root` | **PASS** | dashboard + employees routes render |

---

## P0 blockers (R2)

### D-HRM-PAGESIZE-200 — employees list empty despite API 1107 rows

| Check | Result |
|-------|--------|
| Browser `GET /api/hrm/employees?company_id=main&page_size=5` | **200** total **1107** |
| Browser `GET ...&page_size=200` | **400** `HRM-VAL-001` page_size must not be greater than 100 |
| FE `useEmployees.ts` | `page_size: 200` (also `Dashboard.tsx`, `CompanyMembersManagement.tsx`) |
| UI `/command-center/hrm/employees` | **"Danh sách nhân viên trong công ty - 0"** · Không có dữ liệu |
| Impact | UF-HRM-01, 03, 09, 13 · J-HRM-01/02 blocked (no row to click) |

### D-HRM-CRYPTO-HTTP — `crypto.randomUUID` on HTTP pilot

| Check | Result |
|-------|--------|
| `window.isSecureContext` on `:8088` | **false** (http://14.225.217.232) |
| `typeof crypto.randomUUID` | **undefined** |
| UI banners | Dashboard + Recruitment: **"crypto.randomUUID is not a function"** |
| Impact | UF-HRM-12 and dashboard widgets; needs polyfill or HTTPS pilot |

### D-HRM-ROUTES-404 — settings / metadata routes missing on VPS bundle

| Route | Result |
|-------|--------|
| `/hr/settings-catalogs?portal=1&companyId=main` | **404** Trang không tồn tại |
| `/hr/employee-metadata?portal=1&companyId=main` | **404** |
| CC `/command-center/hrm/settings-catalogs` | loads **dashboard** not settings |
| Impact | UF-HRM-10, UF-HRM-11 |

### D-HRM-CONTRACTS-UI-EMPTY — API 1104 contracts, UI 0 rows

| Check | Result |
|-------|--------|
| Browser `GET /api/hrm/contracts-insurance/contracts?company_id=main&page_size=10` | **200** total **1104** |
| iframe fetch same | **200** len **100** |
| UI `/command-center/hrm/contracts` | table **"Không có dữ liệu"** · Hiển thị 0-0 |
| Impact | UF-HRM-02 · J-HRM-03 blocked |

---

## UF-HRM evidence blocks (R2)

### UF-HRM-01 — Danh sách NV → mở hồ sơ (J-HRM-01)

- **Persona / URL:** `ceo@xe.vn` → `/command-center/hrm/employees`
- **Trước mutate:** list count **0** (API total 1107)
- **Action:** N/A — no rows
- **Network:** perf `employees?page_size=5` **200**; FE hook likely `page_size=200` → **400**
- **FE sau 2xx:** N/A
- **F5:** n/a
- **Verdict:** 🔴 **FAIL** — J-HRM-01 list→detail blocked
- **spec_ref:** J-HRM-01 · SRS employees list

### UF-HRM-02 — Tạo/sửa hợp đồng + F5 (J-HRM-03)

- **URL:** `/command-center/hrm/contracts`
- **Trước mutate:** 0 rows (API 1104)
- **Action:** N/A
- **Verdict:** 🔴 **FAIL** — D-HRM-CONTRACTS-UI-EMPTY

### UF-HRM-03 — Tạo/sửa NV group CEO (J-HRM-02)

- **URL:** `/command-center/hrm/employees`
- **Action:** no **Thêm** flow reachable; list empty (page_size P0)
- **Verdict:** 🔴 **FAIL**

### UF-HRM-04 — Bảo hiểm link NV (J-HRM-04)

- **URL:** `/hr/insurance` embed
- **UI:** filter chips all **0** · 1 table row "Không có dữ liệu"
- **Verdict:** 🔴 **FAIL**

### UF-HRM-05 — Chấm công bản ghi (J-HRM-06)

- **URL:** `/hr/attendance`
- **UI:** shell loads (Tổng quan, Ca làm việc) · metrics empty
- **API:** `GET attendance/records` **200** total **13103**
- **Verdict:** 🔴 **FAIL** — no record visible / no mutate

### UF-HRM-06 — Lương phiếu lương (J-HRM-07)

- **URL:** `/hr/payroll`
- **UI:** blank/minimal shell
- **Verdict:** 🔴 **FAIL**

### UF-HRM-07 / UF-HRM-08 — Mobile

- **Verdict:** ⚪ **N/A** web `:8088`

### UF-HRM-09 — HRBP scope (`du-lich.hr@xe.vn`)

- **UI login:** form submit flaky in MCP session; **API login** `POST /api/xbos/auth/login` **201** token ok
- **UI HRM:** same empty employee list (page_size P0) — **no PATCH via UI**
- **Scope API (browser fetch, not UF 🟢):** member list `company_id=XE_DU_LICH` retest deferred — UI mutate blocked U63
- **Verdict:** 🔴 **FAIL** — prior probe not promoted

### UF-HRM-10 — Settings catalogs sync + item (HRM-SC-01..03)

- **URL:** `/hr/settings-catalogs` → **404**
- **API:** `GET /api/hrm/catalog-sync` **200** total **74** (parent fetch)
- **Verdict:** 🔴 **FAIL** — route missing on VPS FE bundle

### UF-HRM-11 — Metadata queue approve (UC-HRM-26)

- **URL:** `/hr/employee-metadata` → **404**
- **API:** `GET employee-metadata/change-requests` **200** total **34**
- **Verdict:** 🔴 **FAIL**

### UF-HRM-12 — Tuyển dụng requisition UI + F5 (UC-HRM-22)

- **URL:** `/hr/recruitment`
- **UI:** loads with **crypto.randomUUID** error banner · no requisition mutate executed
- **Verdict:** 🔴 **FAIL**

### UF-HRM-13 — Member CEO mutate (`du-lich.ceo@xe.vn`)

- **Status:** 🔴 **NOT EXECUTED** — blocked by UF-HRM-01 empty list + login session instability; defer R3

---

## Gate table (R2)

| Gate | Result |
|------|--------|
| L0 `:8088` | **PASS** |
| U63 no seed | **PASS** |
| Embed mount (post-PSCP) | **PASS** |
| hrmApi.ts 200 | **PASS** |
| UF-HRM-01..06,09..13 mutate+F5 | **FAIL** 0/11 |
| Wave 2 exit 11/11 🟢 | **FAIL** 0/11 |

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| D-HRM-PAGESIZE-200 | `useEmployees` / Dashboard `page_size:200` → clamp ≤100 | dev-fe |
| D-HRM-CRYPTO-HTTP | Polyfill `crypto.randomUUID` on HTTP or enforce HTTPS pilot | dev-fe |
| D-HRM-ROUTES-404 | PSCP/sync HRM routes settings-catalogs + employee-metadata | devops + dev-fe |
| D-HRM-CONTRACTS-UI-EMPTY | Contracts API 1104 · UI 0 — FE fetch/render | dev-fe |
| R-HRM-W2-R3 | Re-run UF-HRM-09/13 member personas after P0 fixes | qa |

---

## Handoff

- **completion_report:** R2 retest after PSCP — embed mount **CLOSED**; Wave 2 **0/11 🟢**; 4 new P0 defects documented; matrix §4 updated; U63/U65 honored.
- **next_owner:** `dev-fe`
- **next_dispatch_prompt:** Task dev-fe — work_item_id `P1-HRM-PAGESIZE-CRYPTO-8088-01`: entry R2 evidence `docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r2-20260620.md`; fix `useEmployees.ts`/`Dashboard.tsx` page_size≤100 (use `clampHrmPageSize`); add `crypto.randomUUID` polyfill when `!isSecureContext` on HTTP pilot; investigate contracts list empty despite API 200; exit jest + qa R3 UF-HRM-01 smoke on :8088; ack_status READY_FOR_QA.
- **evidence_path:** `docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r2-20260620.md`
- **ack_status:** **PASS_TO_PM**
