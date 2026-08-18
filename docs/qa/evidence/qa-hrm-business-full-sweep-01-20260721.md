# QA-HRM-BUSINESS-FULL-SWEEP-01 — Browser evidence (2026-07-21)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-BUSINESS-FULL-SWEEP-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **FAIL_TO_PM** |
| **priority** | P0 sponsor lock — business works (not console-only) |
| **executed_at** | 2026-07-21 ~11:21–11:45 ICT |
| **URL** | `http://14.225.217.232:8088` (**Dev8088** — preferred; not localhost) |
| **persona** | `ceo@xe.vn` / `Xevn@2026` (`xevn.portal.user.userId=ceo@xe.vn`) |
| **U65** | zero-seed · FE-only · no `pnpm seed:*` · no Phase1/PROD claim |
| **Matrix SoT** | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §4b UF-HRM-MENU-* |

---

## Executive summary

**FAIL_TO_PM** — P0 attendance weekly sheet fails **business AC**: sheet opens with title «Bảng chấm công từ 01/07/2026 đến 31/07/2026 (Công chuẩn)» but grid stays on **orange spinner** + `Tổng số: 0` while `GET /api/hrm/attendance/records` storms (**1000+** calls in session; all **200** with `data:[]`). Console-clean ≠ PASS.

Sidebar UF-HRM-MENU-01..06, 08..17 load with meaningful business content (lists/counts/dialogs). **MENU-07** overview load OK; **weekly sheet path 🔴**.

FE local already claims fix `D-HRM-ATT-SHEET-EMPTY-RELOAD-LOOP-01` (`READY_FOR_QA`) but **:8088 VPS source lacks** `weeklySheetContext` / RQ `useQuery` weekly hook → **sync gap**.

---

## Environment / method

| Item | Detail |
|------|--------|
| Session | Portal JWT already valid → `/login` redirected `/command-center` |
| HRM | Direct `/hr/...` same-origin embed URLs (`portal=1&tenantId=xevn&companyId=main`) |
| Network | `window.fetch` hook on attendance weekly; Performance API on sheets list |
| VPS probe | `/hr/src/pages/Attendance.tsx` — **no** `weeklySheetContext`; `/hr/src/hooks/useWeeklyAttendanceSummary.ts` — **no** `useQuery` (pre-fix bundle) |

---

## P0 — Attendance sheet July 2026 (Công chuẩn)

### Steps

1. `/hr/attendance?portal=1&tenantId=xevn&companyId=main` → Overview loads (leave widgets / charts with 2026 dates).
2. Tab **Chấm công** dropdown → **Bảng chấm công**.
3. List **Bảng chấm công chi tiết**: `Tổng số bản ghi: 2` — both rows `01/07/2026 - 31/07/2026` · name `Bảng chấm công từ 01/07/2026 đến 31/07/2026` · type **Theo ngày** · positions `RECRUITER`.
4. `GET /api/hrm/attendance/attendance-sheets?company_id=main` → **200** (1 call on list — no sheets storm).
5. Click sheet row → weekly view title **`Bảng chấm công từ 01/07/2026 đến 31/07/2026 ( Công chuẩn )`**.
6. Poll 9s ×6 samples: **spinner always true**; footer **`Tổng số: 0`**; «Tải lại» **disabled** while spinning.
7. Network hook: continuous `GET /api/hrm/attendance/records?company_id=main&from_date=2026-07-01&to_date=2026-07-31&page=1&page_size=100` → **200**; storm count grew to **460** (~9s) then **1329+** in session.
8. Direct probe same URL with Bearer: **200** body `{"total":0,"page":1,"page_size":100,"data":[]}` — empty records is OK per FE note; **forever spinner + storm is not**.

### P0 verdict

| AC | Result |
|----|--------|
| Sheet exists after save / open | **PASS** (2 Jul sheets already present; open works) |
| Weekly/grid shows **data OR honest empty** | **FAIL** — spinner forever, not settled empty copy |
| No infinite reload / spinner loop | **FAIL** — records GET storm + stuck `.animate-spin` |
| Network 2xx/4xx recorded | **200** storm (not 4xx); business still FAIL |
| Console secondary | No `RangeError` / Invalid time observed in P0 samples (console secondary) |

**Residual ID (P0):** `D-HRM-ATT-SHEET-EMPTY-RELOAD-LOOP-01` — FE coded locally; **:8088 not synced** → DevOps sync then QA retest. Soft: duplicate Jul sheet rows ×2 (`D-HRM-ATT-SHEET-DUP-LIST-01` P3). Soft: BE does not auto-roster on sheet create (empty `data:[]` contract — only FAIL if UI claims loading forever).

Create dialog **not** re-posted (duplicate risk); open path covers «create/open» existence AC.

---

## UF-HRM-MENU-* business smoke table

| UF-ID | Menu / path | Meaningful action | Business note | Flag |
|-------|-------------|-------------------|---------------|------|
| **UF-HRM-MENU-01** | Dashboard `/hr/` | Load tiles | NV **1108**, chấm công **13103**, TD **57**, kỳ lương **80**; no Sync ERROR / tech chrome | 🟢 |
| **UF-HRM-MENU-02** | Employees `/hr/employees` | List → click row DVU-0015 | 1108 employees; profile **Dương Văn An** opens | 🟢 |
| **UF-HRM-MENU-02b** | Employee → **Lương & Phụ cấp** | Open tab | Lương cơ bản **15.800.000 ₫**; Kỳ lương / Ngày trả present; no Invalid time; no `hrm-api` badge | 🟢 |
| **UF-HRM-MENU-03** | Contracts `/hr/contracts` | Load list | **1104** HĐ visible / loading more | 🟢 |
| **UF-HRM-MENU-04** | Insurance `/hr/insurance` | Load list | **1043** records; BHYT expiry alert business OK | 🟢 |
| **UF-HRM-MENU-05** | Decisions `/hr/decisions` | Load | Honest empty counts (all **0**) + Thêm quyết định | 🟢 |
| **UF-HRM-MENU-06** | Recruitment `/hr/recruitment` | Load dashboard/tabs | Subnav Yêu cầu / Tin / Ứng viên; no UC-id chrome | 🟢 |
| **UF-HRM-MENU-07** | Attendance `/hr/attendance` | Overview + **open Jul sheet weekly** | Overview OK; **weekly P0 FAIL** (spinner/storm) | 🔴 |
| **UF-HRM-MENU-08** | Payroll `/hr/payroll` | Load payslip list | **1834 / 1834** bản ghi; no `hrm-api` label | 🟢 |
| **UF-HRM-MENU-09** | Performance `/hr/performance` | Load cycles | Cycle UI + date fields present | 🟢 |
| **UF-HRM-MENU-10** | AI `/hr/ai` | Load | UniAI assistant landing | 🟢 |
| **UF-HRM-MENU-11** | Tasks `/hr/tasks` | Load | Quản lý công việc + Tạo công việc | 🟢 |
| **UF-HRM-MENU-12** | Processes `/hr/processes` | Load | Honest empty «Chưa có quy trình nào»; no DM codes | 🟢 |
| **UF-HRM-MENU-13** | Internal services `/hr/internal-services` | Load | Báo cơm / Đặt xe / VPP counters visible | 🟢 |
| **UF-HRM-MENU-14** | Tools `/hr/tools-equipment` | Load | Phase stub copy (API CCDC chưa) — allowed | 🟢 |
| **UF-HRM-MENU-15** | Company `/hr/company` | Load | 5 công ty / Thêm công ty | 🟢 |
| **UF-HRM-MENU-16** | Reports `/hr/reports` | Load | Báo cáo tabs 2026 | 🟢 |
| **UF-HRM-MENU-17** | Settings + catalogs + metadata | Load + sync stamp | Settings OK; catalogs sync stamp **17/07/2026**; metadata queue 11 + human «Quy trình» (0× `xbos.employee_metadata`) | 🟢 |

**Dev8088 column:** this run promotes §4b smoke on `:8088` for 01–06, 08–17; **07 remains 🔴** until weekly retest PASS.

---

## Console note (secondary)

- P0 weekly FAIL class is **business / fetch thrash**, not console crash.
- No P0 `RangeError: Invalid time` observed on menus exercised.
- Console-clean alone would **not** change FAIL verdict.

---

## Defects / residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **D-HRM-ATT-SHEET-EMPTY-RELOAD-LOOP-01** | **P0** | **devops** sync FE → `:8088`, then **qa** retest | Local FE `READY_FOR_QA`; VPS still pre-fix → spinner + records storm |
| D-HRM-ATT-SHEET-DUP-LIST-01 | P3 | fe optional | Two identical Jul 2026 sheet rows in list |
| BE auto-roster on create | soft | product / be if SRS | Empty `records[]` after sheet create is contract-OK; UI must settle empty |

---

## Handoff

- **ack_status:** `FAIL_TO_PM`
- **completion_report:** Closed full sidebar business smoke on Dev8088; **P0 attendance weekly FAIL** blocks PASS. Other menus 🟢 with real counts / honest empty. No seed. No Phase1/PROD.
- **next_owner:** `devops` (sync FE attendance weekly fix to `:8088`) → then `qa` retest P0 only
- **next_dispatch_prompt:** |

```text
work_item_id: D-DO-SYNC-8088-ATT-WEEKLY-FIX-01
from_role: pm
to_role: devops
priority: P0
entry_criteria: FE D-HRM-ATT-SHEET-EMPTY-RELOAD-LOOP-01 READY_FOR_QA evidence present; QA FAIL on :8088 proves VPS missing weeklySheetContext / RQ weekly hook
exit_criteria: :8088 serves fixed Attendance weekly bundle; probe /hr/src/hooks/useWeeklyAttendanceSummary.ts contains useQuery; /hr/src/pages/Attendance.tsx contains weeklySheetContext
evidence_path: docs/qa/evidence/d-do-sync-8088-att-weekly-fix-01-20260721.md
cấm: seed · claim QA PASS without browser retest
next after sync: Task qa — reopen Jul sheet; assert spinner settles; records GET ≤2 idle; honest empty OK if data:[]
```

- **evidence_path:** `docs/qa/evidence/qa-hrm-business-full-sweep-01-20260721.md`
