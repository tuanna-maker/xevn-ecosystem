# P1-BROWSER-E2E-HRM-WAVE-8088-R3 — QA evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-HRM-WAVE-8088-R3` |
| **role** | qa |
| **executed_at** | 2026-06-20T15:20+07 |
| **portal** | http://14.225.217.232:8088/ |
| **entry** | Post `P1-HRM-EMBED-PSCP-SETTINGS-CATALOG-8088`; expected `P1-HRM-PAGESIZE-CRYPTO-8088-01` deploy |
| **rule** | U63/U65 browser-only · **no seed** |
| **accounts** | `ceo@xe.vn`; `du-lich.hr@xe.vn`; `du-lich.ceo@xe.vn` |
| **ack_status** | **FAIL_TO_PM** |
| **parent evidence** | [§HRM-W2-R3](./p1-browser-e2e-xbos-hrm-20260620.md#hrm-w2-r3) |

---

## Executive summary

**FAIL_TO_PM** — Wave 2 Track B R3 full browser attempt on `:8088`. **Embed prerequisite PASS** (`hrmApi.ts` **200**, `hrmSettingsCatalogItem.ts` **200**, CC iframe `#root` **4428** chars after load). **Wave 2 exit FAIL — 0/11 web UFs 🟢** (2 ⚪ mobile). R2 P0 blockers **unchanged on VPS** — `page_size=200`→**400**, contracts/employees UI **0 rows**, routes **404**, `crypto.randomUUID` on HTTP.

| Class | R2 | R3 |
|-------|-----|-----|
| Embed mount / Vite 500 | 🟢 PASS | **🟢 PASS** (unchanged) |
| UF-HRM-01..13 mutate+F5 | 0/11 🟢 | **0/11 🟢** |
| Member UI login (UF-09/13) | flaky | **🔴 FAIL** — no token after submit |

---

## L0 / prerequisite gates

| Gate | Result | Notes |
|------|--------|-------|
| Portal `:8088` | **PASS** HTTP **200** | PowerShell probe |
| hrm-api `:3001` | **PASS** | `/api/hrm/employees` → **400** (service up, no auth) |
| `hrmApi.ts` via portal | **PASS** HTTP **200** | CDP fetch |
| `hrmSettingsCatalogItem.ts` | **PASS** HTTP **200** | PSCP fix verified |
| U65 no seed | **PASS** | no `pnpm seed:*` |
| UI login `ceo@xe.vn` | **PASS** | CC shell + NHÂN SỰ |
| HRM iframe `#root` (CC `/command-center/hrm/employees`, 8s wait) | **PASS** | **4428** chars; not blank |
| `page_size=200` probe (authenticated) | **FAIL** | **400** `page_size must not be greater than 100` |
| `isSecureContext` / `crypto.randomUUID` | **FAIL** | HTTP pilot — `randomUUID` **undefined** |

---

## P0 blockers (R3 — carry from R2, not fixed on VPS)

### D-HRM-PAGESIZE-200

| Check | Result |
|-------|--------|
| Browser `GET /api/hrm/employees?company_id=main&page_size=200` | **400** `page_size must not be greater than 100` |
| CC iframe UI | **"Danh sách nhân viên trong công ty - 0"** · Không có dữ liệu |
| Impact | UF-HRM-01, 03, 09, 13 · J-HRM-01/02 blocked |

### D-HRM-CONTRACTS-UI-EMPTY

| Check | Result |
|-------|--------|
| Browser `GET /api/hrm/contracts-insurance/contracts?company_id=main&page_size=10` | **200** |
| UI `/hr/contracts` | **"Không có dữ liệu"** · Hiển thị 0-0 |
| Impact | UF-HRM-02 · J-HRM-03 blocked |

### D-HRM-ROUTES-404

| Route | SPA result |
|-------|------------|
| `/hr/settings-catalogs?portal=1&companyId=main` | **404** Trang không tồn tại |
| `/hr/employee-metadata?portal=1&companyId=main` | **404** Trang không tồn tại |
| Impact | UF-HRM-10, UF-HRM-11 |

### D-HRM-CRYPTO-HTTP

| Check | Result |
|-------|--------|
| `window.isSecureContext` on `:8088` | **false** |
| Recruitment UI banner | **"crypto.randomUUID is not a function"** |
| Impact | UF-HRM-12 requisition mutate blocked |

### D-HRM-MEMBER-UI-LOGIN (R3 new)

| Account | UI login result |
|---------|-----------------|
| `du-lich.hr@xe.vn` | Submit → stays on `/login` · **no** `xevn.portal.accessToken` |
| `du-lich.ceo@xe.vn` | Same — **no token** after 6s |
| Impact | UF-HRM-09, UF-HRM-13 scope personas not reachable via UI U63 |

---

## UF-HRM evidence blocks (R3)

### UF-HRM-01 — Danh sách NV → mở hồ sơ (J-HRM-01)

- **Persona / URL:** `ceo@xe.vn` → `/command-center/hrm/employees`
- **Trước mutate:** list count **0** (iframe: Danh sách nhân viên trong công ty - 0)
- **Action:** N/A — no rows to click
- **Network:** `page_size=200` → **400** HRM-VAL-001
- **FE sau 2xx:** Không có dữ liệu
- **F5:** n/a
- **Verdict:** 🔴 **FAIL** — J-HRM-01 list→detail blocked
- **spec_ref:** J-HRM-01 · UF-HRM-01

### UF-HRM-02 — Tạo/sửa hợp đồng + F5 (J-HRM-03)

- **URL:** `/hr/contracts?portal=1&companyId=main`
- **Trước mutate:** 0 rows · filter chips all **0**
- **Network:** contracts API **200** (authenticated)
- **FE sau 2xx:** Không có dữ liệu · Hiển thị 0-0
- **Verdict:** 🔴 **FAIL** — D-HRM-CONTRACTS-UI-EMPTY

### UF-HRM-03 — Tạo/sửa NV group CEO (J-HRM-02)

- **URL:** `/command-center/hrm/employees`
- **Action:** list empty — no Thêm / row click
- **Verdict:** 🔴 **FAIL** — D-HRM-PAGESIZE-200

### UF-HRM-04 — Bảo hiểm link NV (J-HRM-04)

- **URL:** `/hr/insurance?portal=1&companyId=main`
- **UI:** BHXH/BHYT/BHTN chips **0** · Không có dữ liệu
- **Verdict:** 🔴 **FAIL** — no NV link / empty table

### UF-HRM-05 — Chấm công bản ghi (J-HRM-06)

- **URL:** `/hr/attendance?portal=1&companyId=main`
- **UI:** Tổng quan shell loads · metrics **0** · no visible record row to mutate
- **Verdict:** 🔴 **FAIL**

### UF-HRM-06 — Lương phiếu lương (J-HRM-07)

- **URL:** `/hr/payroll?portal=1&companyId=main`
- **UI:** Onboarding shell (Hướng dẫn cho người bắt đầu) — **no payslip list/detail mutate**
- **Verdict:** 🔴 **FAIL**

### UF-HRM-07 / UF-HRM-08 — Mobile

- **Verdict:** ⚪ **N/A** web `:8088`

### UF-HRM-09 — HRBP scope (`du-lich.hr@xe.vn`)

- **UI login:** Email/password → **Đang đăng nhập…** → remains `/login` · token absent
- **HRM mutate:** **not reached** — U63 blocked
- **Verdict:** 🔴 **FAIL** — D-HRM-MEMBER-UI-LOGIN + page_size P0 when ceo path used

### UF-HRM-10 — Settings catalogs sync + item (HRM-SC-01..03)

- **URL:** `/hr/settings-catalogs?portal=1&companyId=main`
- **UI:** **404** Trang không tồn tại
- **Verdict:** 🔴 **FAIL** — D-HRM-ROUTES-404

### UF-HRM-11 — Metadata queue approve (UC-HRM-26)

- **URL:** `/hr/employee-metadata?portal=1&companyId=main`
- **UI:** **404** Trang không tồn tại
- **Verdict:** 🔴 **FAIL** — D-HRM-ROUTES-404

### UF-HRM-12 — Tuyển dụng requisition UI + F5 (UC-HRM-22)

- **URL:** `/hr/recruitment?portal=1&companyId=main`
- **UI:** Dashboard loads · banner **crypto.randomUUID is not a function** · no requisition create/save executed
- **Verdict:** 🔴 **FAIL** — D-HRM-CRYPTO-HTTP

### UF-HRM-13 — Member CEO mutate (`du-lich.ceo@xe.vn`)

- **UI login:** Same as UF-09 — **no token** after submit
- **Mutate:** **not executed**
- **Verdict:** 🔴 **FAIL** — D-HRM-MEMBER-UI-LOGIN

---

## Gate table (R3)

| Gate | Result |
|------|--------|
| L0 `:8088` + `:3001` | **PASS** |
| U63/U65 no seed | **PASS** |
| Embed mount + PSCP | **PASS** |
| UF-HRM-01..06,09..13 mutate+F5 | **FAIL** **0/11** |
| Wave 2 exit 11/11 🟢 | **FAIL** **0/11** |

---

## Residual

| ID | Item | Owner | pm_dispatch_hint |
|----|------|-------|------------------|
| D-HRM-PAGESIZE-200 | `useEmployees.ts` / Dashboard `page_size:200` → ≤100 | dev-fe | Deploy fix to `:8088` then qa R4 |
| D-HRM-CONTRACTS-UI-EMPTY | Contracts API 200 · UI 0 rows | dev-fe | Same wave as page_size |
| D-HRM-ROUTES-404 | settings-catalogs + employee-metadata SPA routes | dev-fe + devops | PSCP full HRM route bundle to VPS |
| D-HRM-CRYPTO-HTTP | Polyfill on HTTP `:8088` | dev-fe | UF-HRM-12 |
| D-HRM-MEMBER-UI-LOGIN | Member portal login no token (UF-09/13) | dev-fe + dev-be | Verify auth endpoint + account seed policy (no QA seed) |
| R-HRM-W2-R4 | Re-run full 11 UF after deploy | qa | `P1-BROWSER-E2E-HRM-WAVE-8088-R4` |

---

## Handoff

- **completion_report:** R3 Track B executed — embed/PSCP **PASS**; all 11 web UFs attempted browser U63; **0/11 🟢**; R2 P0s **not remediated on VPS**; member UI login **new FAIL** for UF-09/13; matrix §4 updated; U65 honored.
- **next_owner:** `dev-fe` (+ `devops` route deploy)
- **next_dispatch_prompt:** Task dev-fe — work_item_id `P1-HRM-PAGESIZE-CRYPTO-8088-01`: entry R3 evidence `docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r3-20260620.md`; fix+**deploy** to `:8088` clamp page_size≤100 in `useEmployees.ts`/`Dashboard.tsx`/`CompanyMembersManagement.tsx`; add `crypto.randomUUID` polyfill when `!isSecureContext`; fix contracts list render; register SPA routes settings-catalogs + employee-metadata; investigate member login UI for du-lich.* accounts; exit jest + devops sync VPS; ack_status READY_FOR_QA → qa `P1-BROWSER-E2E-HRM-WAVE-8088-R4`.
- **evidence_path:** `docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r3-20260620.md`
- **ack_status:** **FAIL_TO_PM**
