# R-SPINE-MGR-HIER-01-QA-BROWSER — FE set `manager_id` (Option B)

| Field | Value |
|-------|--------|
| **work_item_id** | `R-SPINE-MGR-HIER-01-QA-BROWSER` |
| **from_role** | `qa` |
| **to_role** | `pm` → **qa-device** |
| **lane** | execution |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **startedAt** | `2026-08-03T15:39:51.885Z` |
| **finishedAt** | `2026-08-03T15:40:20.152Z` |
| **ack_status** | **PASS_TO_PM** (handoff **qa-device** J-MOB-05 Option A) |
| **spec_ref** | FR-UC-H01 · FR-UC-H03 · BA `r-spine-mgr-hier-01.md` §3 Option B |
| **entry** | BE READY [`r-spine-mgr-hier-01-be.md`](r-spine-mgr-hier-01-be.md) · FE READY [`r-spine-mgr-hier-01-fe.md`](r-spine-mgr-hier-01-fe.md) · prior Option A BLOCKED [`r-spine-mgr-hier-01-qa.md`](r-spine-mgr-hier-01-qa.md) |
| **U65** | **honored** — no `pnpm seed:*` · no DB fake · FE Lưu only for PASS claim |
| **U76** | `hdsd_align: true` — inventory below |
| **U78** | [`r-spine-mgr-hier-01-qa-browser-test-log.md`](r-spine-mgr-hier-01-qa-browser-test-log.md) · [`.json`](r-spine-mgr-hier-01-qa-browser-test-log.json) |
| **harness** | `scripts/qa/_tmp-r-spine-mgr-hier-01-qa-browser.mjs` |
| **runtime** | `docs/qa/evidence/_tmp-r-spine-mgr-hier-01-qa-browser.json` |
| **screens** | `docs/qa/evidence/screens/r-spine-mgr-hier-01-qa-browser/` |
| **QA-IDLE-VIEWPORT** | **PASS** (18 timestamped clicks) |

---

## Executive verdict

**🟢 PASS_TO_PM** — Browser U65 set QL trực tiếp via FE picker + Lưu; PATCH **200** `HRM-EMP-202` with `manager_id` = HLD-0001; F5 detail GET retains same `manager_id`. Hierarchy edge ready for **qa-device J-MOB-05 Option A**.

| AC | Result |
|----|--------|
| Login `ceo@xe.vn` → `/hr/employees` | 🟢 |
| Open holding NV ≠ HLD-0001 (mobile-capable `uat.nv####`) | 🟢 **UAT-0003** / `uat.nv0003@xe.vn` |
| `hdsd-employee-form-manager-picker` → HLD-0001 / uat.nv0001 | 🟢 label `HLD-0001 — Nguyễn Văn An · STAFF` |
| Lưu → PATCH 2xx + body `manager_id` | 🟢 **200** `HRM-EMP-202` |
| F5 retains `manager_id` (GET detail) | 🟢 |
| Option C CEO-as-L1 | 🟢 **not used** |
| Seed | 🟢 **none** |

**Residual (P2, non-blocking J-MOB-05):** Profile UI after F5 may show «Quản lý trực tiếp —» when API `manager_label` is null (display-ready resolve gap). **DB/API edge is set** — leave L1 filter uses `employees.manager_id`, not UI label.

---

## Environment (L0)

| Probe | Result |
|-------|--------|
| `:28001/api/hrm` | **200** |
| `:28002/api/xbos` | **200** (prior qc:dev-stack) |
| `:5173` portal | **200** |
| Note | First wave hit stale `node dist/main.js` → `HRM-VAL-001 property manager_id should not exist`; restarted dist with DTO containing `manager_id` then retest **PASS** |

---

## hdsd_inventory (U76)

| HDSD / UI | testid / path | Verdict |
|-----------|---------------|---------|
| Login Group CEO | portal auth | 🟢 201 |
| Nhân sự → Nhân viên | `/hr/employees?portal=1&companyId=main` | 🟢 list rootChild=4 · rows≥47 |
| Hồ sơ NV (J-HRM-02) | `/hr/employees/{id}` | 🟢 |
| Chỉnh sửa | button «Chỉnh sửa» → `hdsd-employee-form-dialog` | 🟢 |
| Quản lý trực tiếp | `hdsd-employee-form-manager-picker` | 🟢 |
| Lưu / Cập nhật | `hdsd-employee-form-submit` | 🟢 PATCH 200 |
| F5 | reload profile | 🟢 GET manager_id retained |

---

## Subordinate set (handoff SoT for qa-device)

| Role | Account | Employee |
|------|---------|----------|
| **Submitter (report of HLD-0001)** | `uat.nv0003@xe.vn` / `xevn-uat-2026` | **UAT-0003** · id `2680f15f-02b6-44e1-8b42-92a6aaeb7bfb` · `company_id=holding` · `manager_id=3796d949-4513-45c0-88fa-33030a062b17` |
| **Approver L1** | `uat.nv0001@xe.vn` / `xevn-uat-2026` | **HLD-0001** · id `3796d949-4513-45c0-88fa-33030a062b17` |
| **HCNS setter (web only)** | `ceo@xe.vn` | set hierarchy — **not** L1 approver |
| **Cấm** | `ceo@xe.vn` as ManagerApprovals L1 | Option C |

Also FE-set earlier same session (same manager): `uat.nv0005@xe.vn` / UAT-0005 `3f40ee4c-4874-4e94-940d-9d64f7d08603` — alternate submitter if needed.

---

## Click path (timestamped)

| # | at (UTC) | action |
|---|----------|--------|
| 1–2 | 15:39:51Z | API login ceo → **201** |
| 3–4 | 15:39:52–57Z | `/hr/employees` · list render |
| 5–6 | 15:39:57Z | Pick UAT-0003 → detail URL |
| 7–8 | 15:40:01–04Z | Chỉnh sửa · picker visible |
| 9–12 | 15:40:04–07Z | Search `HLD-0001` → select · label display-ready |
| 13–14 | 15:40:07–12Z | Cập nhật → PATCH **200** `manager_id` |
| 15–18 | 15:40:14–20Z | FE after 2xx · F5 · Công việc tab · ASSERT F5 **PASS** |

---

## Network proof (browser)

| method | status | url | note |
|--------|--------|-----|------|
| POST | **201** | `/api/xbos/auth/login` | ceo |
| GET | **200** | `/api/hrm/employees?company_id=main…` | list |
| GET | **200** | `/api/hrm/employees/2680f15f-…?company_id=main` | pre · `manager_id` null |
| PATCH | **200** | `/api/hrm/employees/2680f15f-…` | body `manager_id` = HLD-0001 UUID · `HRM-EMP-202` |
| GET | **200** | same id after F5 | `manager_id` **retained** |

Console pageerror / resolve errors: **0**.

---

## case_matrix

| Case | Intent | Verdict | Note |
|------|--------|---------|------|
| **A fail** | ≠ self as manager | 🟢 | Selected HLD-0001; self not sole pick |
| **B success** | HDSD Edit → picker → Lưu → F5 | 🟢 | PATCH+F5 API; UI label residual P2 |
| **C logic** | Option B hierarchy; not CEO-as-L1 | 🟢 | submitter ≠ HLD-0001; approver = uat.nv0001 |

---

## Defects / residual

| ID | Sev | Detail | Owner | Status |
|----|-----|--------|-------|--------|
| R-SPINE-MGR-RUNTIME-STALE | P0 env | Live API rejected `manager_id` until dist restart | devops/dev-be | **CLOSED** this wave (restart + retest) |
| R-SPINE-MGR-UI-LABEL-F5 | P2 | Profile «Quản lý trực tiếp» may show — when `manager_label` null after F5 | dev-fe | **OPEN** — does not block J-MOB-05 |

---

## completion_report

**Closed:** U65 browser set `manager_id` on holding subordinate **UAT-0003** (`uat.nv0003@xe.vn`) → HLD-0001 via FE picker + Lưu; PATCH 200; F5 GET retains; U76 inventory + U78 test-log; Option C not used; zero seed.

**Open residual:** qa-device J-MOB-05 Option A (submit leave as nv0003 → approve as nv0001); P2 profile display label after F5.

**ack_status:** `PASS_TO_PM`  
**next_owner:** `qa-device`  
**evidence_path:** `docs/qa/evidence/r-spine-mgr-hier-01-qa-browser.md`

## next_dispatch_prompt

```text
work_item_id: R-SPINE-MGR-HIER-01-QA-DEVICE-JMOB05
from_role: pm
to_role: qa-device
lane: execution
priority: P0
entry_criteria: R-SPINE-MGR-HIER-01-QA-BROWSER PASS_TO_PM (docs/qa/evidence/r-spine-mgr-hier-01-qa-browser.md) — FE set manager_id; U65 zero-seed; AT-01 nav QC GWC CLOSED
persona_lock (Option A — NOT ceo as L1):
  submitter: uat.nv0003@xe.vn / xevn-uat-2026 · emp UAT-0003 · id 2680f15f-02b6-44e1-8b42-92a6aaeb7bfb · manager_id=3796d949-4513-45c0-88fa-33030a062b17 (HLD-0001)
  approver: uat.nv0001@xe.vn / xevn-uat-2026 · HLD-0001 · id 3796d949-4513-45c0-88fa-33030a062b17
  cấm: ceo@xe.vn as L1 · seed manager_id · inbox seed
mission: J-MOB-05 Option A — submitter FE-submit leave on device → approver opens ManagerApprovals Nghỉ phép ≥1 → Duyệt 2xx → F5 queue clear.
hdsd_align: true · test_log_required: true
exit_criteria: evidence docs/qa/evidence/r-spine-mgr-hier-01-qa-device-jmob05.md (+ test-log); AC leave L1 for uat.nv0001; no Option C
spec_ref: FR-UC-H03 · J-MOB-05 · r-spine-mgr-hier-01.md Option A · BA §7 AC
```
