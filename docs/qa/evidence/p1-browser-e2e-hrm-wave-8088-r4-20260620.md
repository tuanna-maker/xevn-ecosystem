# P1-BROWSER-E2E-HRM-WAVE-8088-R4 — QA evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-HRM-WAVE-8088-R4` |
| **role** | qa |
| **executed_at** | 2026-06-20T16:05+07 |
| **portal** | http://14.225.217.232:8088/ |
| **entry** | Post `P1-HRM-PAGESIZE-CRYPTO-8088-01` deploy (pscp + hrm-fe restart) |
| **rule** | U63/U65 browser-only · **no seed** |
| **accounts** | `ceo@xe.vn`; `du-lich.hr@xe.vn`; `du-lich.ceo@xe.vn` |
| **ack_status** | **FAIL_TO_PM** |
| **parent evidence** | [§HRM-W2-R4](./p1-browser-e2e-xbos-hrm-20260620.md#hrm-w2-r4) |

---

## Executive summary

**FAIL_TO_PM** — Wave 2 Track B R4 on `:8088` after `P1-HRM-PAGESIZE-CRYPTO-8088-01` deploy. **9/11 web UFs 🟢** (2 ⚪ mobile). R2/R3 P0 FE defects **CLOSED** (page_size clamp, contracts/employees UI, routes, crypto polyfill). **Residual P0:** member portal UI login **FAIL** for `du-lich.hr@xe.vn` and `du-lich.ceo@xe.vn` — no `xevn.portal.accessToken` after submit (UF-HRM-09/13).

| Class | R3 | R4 |
|-------|-----|-----|
| Embed / PSCP | 🟢 PASS | **🟢 PASS** |
| page_size FE clamp | 🔴 `200`→400 · list 0 | **🟢** UI `page_size=100` · list **1107** |
| Contracts UI | 🔴 0 rows | **🟢** **1104** rows |
| settings-catalogs / employee-metadata | 🔴 404 | **🟢** load + Vietnamese |
| crypto.randomUUID HTTP | 🔴 error banner | **🟢** polyfill · dialog **Tạo đề xuất** OK |
| Member UI login UF-09/13 | 🔴 no token | **🔴** unchanged — no token |
| Wave 2 web UFs 🟢 | 0/11 | **9/11** |

---

## L0 / prerequisite gates

| Gate | Result | Notes |
|------|--------|-------|
| Portal `:8088` | **PASS** HTTP **200** | PowerShell + browser |
| `/assets/hrmApi.ts` | **PASS** HTTP **200** | Vite SPA shell (same as R3 pattern) |
| `/hr/src/utils/safeRandomUuid.ts` | **PASS** HTTP **200** | Vite dev route 200; runtime polyfill active |
| hrm-api (via portal proxy) | **PASS** | `/api/hrm/employees?page_size=100` → **200** HRM-EMP-200 |
| `page_size=200` API guard | **PASS** (expected) | **400** HRM-VAL-001 — FE no longer sends 200 |
| U65 no seed | **PASS** | no `pnpm seed:*` |
| UI login `ceo@xe.vn` | **PASS** | CC shell · token present |
| CC iframe `#root` employees | **PASS** | **54416** chars · **1107** NV |

---

## UF-HRM evidence blocks (R4)

### UF-HRM-01 — Danh sách NV → mở hồ sơ (J-HRM-01)

- **Persona / URL:** `ceo@xe.vn` → `/command-center/hrm/employees`
- **Trước mutate:** iframe «Danh sách nhân viên trong công ty - **1107**»
- **Network:** iframe fetch `page_size=**100**` (×5 observed) · `page_size=200` probe → **400** (API guard OK)
- **Action:** click row **Hồ Minh An** (HLD-0061)
- **FE sau 2xx:** profile «Hồ Minh An» · Thông tin cá nhân · **không 404**
- **F5:** n/a (list→detail in-session)
- **Verdict:** 🟢 **PASS** — J-HRM-01
- **spec_ref:** J-HRM-01 · UF-HRM-01

### UF-HRM-02 — Hợp đồng + F5 (J-HRM-03)

- **URL:** `/hr/contracts?portal=1&companyId=main`
- **Trước mutate:** chip «Tất cả **1104**» · bảng rows visible
- **FE labels:** Mã HĐ · Tên nhân sự · Phòng ban · Loại hợp đồng · Tình trạng **Có hiệu lực**
- **Action:** row click TCN-0954-HD (read path)
- **F5:** n/a this block (list persist verified R4 session)
- **Verdict:** 🟢 **PASS** — D-HRM-CONTRACTS-UI-EMPTY **closed**
- **spec_ref:** J-HRM-03 · UF-HRM-02

### UF-HRM-03 — NV group CEO (J-HRM-02)

- **URL:** CC iframe list → profile; direct `/hr/employees/{uuid}?portal=1&companyId=main`
- **Trước mutate:** list **1107** · profile **Đặng Xuân Hà** TCN-0954
- **Action:** list→detail click path (iframe)
- **FE sau 2xx:** tabs Thông tin chung · Công việc · Hợp đồng · Lương & Phụ cấp — Vietnamese labels
- **Note:** employee_code URL `HLD-0061` → API uuid error (expected); UUID route OK
- **Verdict:** 🟢 **PASS** (cross-nav + profile load)
- **spec_ref:** J-HRM-02 · UF-HRM-03

### UF-HRM-04 — Bảo hiểm link NV (J-HRM-04)

- **URL:** `/hr/insurance?portal=1&companyId=main`
- **UI:** BHXH/BHYT/BHTN chips · **5** bản ghi · «Hiển thị 1 - 5 trong số 5 bản ghi»
- **Labels:** Mã NV · Tên nhân viên · Tình trạng **Đang hiệu lực**
- **Verdict:** 🟢 **PASS**
- **spec_ref:** J-HRM-04 · UF-HRM-04

### UF-HRM-05 — Chấm công (J-HRM-06)

- **URL:** `/hr/attendance?portal=1&companyId=main`
- **UI:** Tổng quan · Đi muộn về sớm · Thực tế đã nghỉ · Kế hoạch nghỉ — charts load
- **Verdict:** 🟢 **PASS** (shell + data widgets; record mutate not in scope R4)
- **spec_ref:** J-HRM-06 · UF-HRM-05

### UF-HRM-06 — Lương (J-HRM-07)

- **URL:** `/hr/payroll?portal=1&companyId=main`
- **UI:** «Trang xem dữ liệu tổng quan về tiền lương» · onboarding steps 1–5 Vietnamese
- **Verdict:** 🟢 **PASS**
- **spec_ref:** J-HRM-07 · UF-HRM-06

### UF-HRM-07 / UF-HRM-08 — Mobile

- **Verdict:** ⚪ **SKIP** (web :8088 scope)

### UF-HRM-09 — Member HRBP scope (U28-R2)

- **Persona:** `du-lich.hr@xe.vn` / `Xevn@2026`
- **Action:** `/login` → fill → **Đăng nhập**
- **Network:** stays on `/login` · **no** `xevn.portal.accessToken` after 7s
- **Scope probe:** n/a — cannot reach HRM embed
- **Verdict:** 🔴 **FAIL** — D-HRM-MEMBER-UI-LOGIN
- **spec_ref:** UF-HRM-09 · U28-R2
- **pm_dispatch_hint:** `dev-be` — member auth/login path on `:8088` (UI silent fail; `/api/auth/login` **404** from browser probe)

### UF-HRM-10 — Settings catalogs (HRM-SC-01..03)

- **URL:** `/hr/settings-catalogs?portal=1&companyId=main`
- **UI:** «Danh mục cài đặt» · Đồng bộ từ XBOS · catalog rows (Ăn ca · Quên chấm công · Hà Nội …)
- **Verdict:** 🟢 **PASS** — route 404 **closed**
- **spec_ref:** UF-HRM-10

### UF-HRM-11 — Metadata queue (UC-HRM-26)

- **URL:** `/hr/employee-metadata?portal=1&companyId=main`
- **Trước mutate:** **12** hồ sơ chờ duyệt
- **Action:** **Duyệt** first row (contact_phone)
- **Network:** approve mutation (in-session)
- **FE sau 2xx:** toast «**Đã duyệt yêu cầu metadata**» · count **12→11**
- **F5:** count remains **11**
- **Verdict:** 🟢 **PASS**
- **spec_ref:** UC-HRM-26 · UF-HRM-11

### UF-HRM-12 — Tuyển dụng requisition (UC-HRM-22)

- **URL:** `/hr/recruitment?portal=1&companyId=main` → tab **Đề xuất**
- **Crypto:** `window.isSecureContext=false` · `crypto.randomUUID` **available** (polyfill)
- **Action:** **Tạo đề xuất** → dialog opens · **15** inputs · **no** `randomUUID is not a function`
- **Verdict:** 🟢 **PASS** — D-HRM-CRYPTO-HTTP **closed**
- **spec_ref:** UC-HRM-22 · UF-HRM-12

### UF-HRM-13 — Member CEO scope (UC-HRM-SCOPE-02)

- **Persona:** `du-lich.ceo@xe.vn` / `Xevn@2026`
- **Action:** UI login same as UF-09
- **Result:** stays `/login` · **no token**
- **Verdict:** 🔴 **FAIL** — same blocker as UF-09
- **spec_ref:** UF-HRM-13

---

## Gate table

| Gate | Result |
|------|--------|
| L0 `:8088` | **PASS** |
| U65 no seed | **PASS** |
| Deploy P1-HRM-PAGESIZE-CRYPTO | **PASS** (9 FE UFs closed) |
| L2.5 J-HRM-01/02/03 | **PASS** (list→detail) |
| UF-HRM-09/13 member login | **FAIL** |
| Wave 2 exit 11/11 🟢 | **FAIL** **9/11** |

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| D-HRM-MEMBER-UI-LOGIN | `du-lich.hr@xe.vn` + `du-lich.ceo@xe.vn` UI login → no token | **dev-be** |
| R4-UF02-MUTATE | Contract save+F5 not executed (list/read PASS) | qa optional |
| R4-UF03-MUTATE | Employee field save+F5 not executed (profile PASS) | qa optional |

---

## ack_status

**FAIL_TO_PM**

### completion_report

- **Closed:** Post-deploy R4 browser U63 on `:8088`; **9/11** web UFs 🟢; R2/R3 P0 page_size/contracts/routes/crypto **verified closed**; UF-HRM-11 full mutate+F5; J-HRM-01 list→detail; U65 honored.
- **Open:** UF-HRM-09/13 member UI login — **only blocker** to 11/11.

### next_owner

`dev-be`

### next_dispatch_prompt

```
Role: dev-be
work_item_id: P1-HRM-MEMBER-UI-LOGIN-8088-01
from_role: qa
to_role: dev-be
priority: P0
entry_criteria: R4 evidence docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r4-20260620.md — UF-HRM-09/13 FAIL; du-lich.hr@xe.vn and du-lich.ceo@xe.vn UI login on http://14.225.217.232:8088/login submit → stays /login, no xevn.portal.accessToken; ceo@xe.vn OK; 9/11 other UFs 🟢
exit_criteria: Member accounts login via UI → token + redirect; du-lich.ceo@xe.vn GET main scope returns 403/409 as expected (document as PASS); du-lich.hr@xe.vn member company scope loads HRM; deploy :8088; ack_status READY_FOR_QA
evidence_path: docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r4-20260620.md
pm_dispatch_hint: After fix qa P1-BROWSER-E2E-HRM-WAVE-8088-R5 retest UF-09/13 only
```

### evidence_path

`docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r4-20260620.md`
