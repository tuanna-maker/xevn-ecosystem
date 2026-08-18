# P1-HRM-FULL-MENU-QA-RETEST-RESUME-01 — Residual checklist retest

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-FULL-MENU-QA-RETEST-RESUME-01` |
| **date** | 2026-07-17 |
| **env** | `http://14.225.217.232:8088` |
| **prior** | `docs/qa/evidence/p1-hrm-full-menu-qa-retest-20260717.md` |
| **entry** | `docs/qa/evidence/d-xbos-auth-28002-restore-20260717.md` (xbos-be `:28002` healthy; login **201**) |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **U65** | zero-seed · browser-only · sequential (no parallel spam) |
| **ack_status** | **PASS_TO_PM** |

---

## Executive verdict

**PASS_TO_PM** — Login smoke **201**; residual items **4b–7** closed 🟢. Minor residuals (non-blocking): overview/turnover headcount **1041** vs employees list **1107**; payroll status **cells** still show raw `processed` (header fix verified).

Screenshot: `docs/qa/evidence/p1-hrm-full-menu-qa-retest-resume-reports-20260717.png` (Biến động NS · Nhân viên hiện tại **1041**).

---

## Login smoke (gate)

| Check | Result |
|-------|--------|
| `POST /api/xbos/auth/login` via portal (browser `fetch`) | **201** · `success: true` · `code: XBOS-AUTH-200` · `hasToken: true` |
| Not 500 | Confirmed |

---

## Residual checklist

| # | Item | Verdict | Evidence |
|---|------|---------|----------|
| **4b** | Insurance happy path + **J-HRM-04** employee link | 🟢 | Hard iframe `/hr/insurance`: BHYT list painted (names/codes/expiry); **no** ERROR/RATE-429 banner. `GET …/insurance?page=1…` **200**. Employee name links present (`a[href*=/hr/employees/]`). Click **Trần Quốc Chi** → `/hr/employees/177f9058-…` profile; `GET /api/hrm/employees/{id}?company_id=main` **200**; **no** 404 / «Không tìm thấy»; profile shows VTH-0402 / COO. Detail primary GET **≤1** (plus work-timeline); **no** multi-page employees list on profile. |
| **4c** | Internal services list/detail happy | 🟢 | `/command-center/hrm/internal_services` → iframe `/hr/internal-services`. `GET /api/hrm/operations/service-requests?company_id=main` **200** (transfer ~38KB). UI: Báo cơm **20** / Đặt xe **15** / VPP **15**; list rows + status. Eye icon → dialog **«Chi tiết yêu cầu»** (Huỳnh Văn An / Báo cơm / Từ chối). No ERROR banner. |
| **5** | Payroll status column header «Trạng thái» | 🟢 | `/hr/payroll`: table headers `Mã NV \| Họ và tên \| Kỳ lương \| Thực lĩnh \| Trạng thái`. **No** `[object Object]` / i18n dump in header. 1834 rows painted. Residual P2: cell values still raw `processed` (not VN label) — out of header AC. |
| **6** | Employees scale W1 · **J-HRM-02** | 🟢 | List hard-nav: `GET …/employees?page=1&page_size=50` **once** + `…/summary` **200**; UI **1107**. Row action → profile `ff16d855-…` Phạm Đức Hùng / HLD-0996. Profile: **1** unique `GET …/employees/{id}?company_id=main` **200** (+ work-timeline); **0** `employees?page=N` chain on profile. No 404. |
| **7** | Báo cáo | 🟢 | Overview: **no** `ReferenceError: attendanceError` in iframe console hooks. `GET …/payroll/reports/reconciliation?company_id=main` **200** on load; FE block **«Đối soát kỳ lương (HRM-PR-06)»** (Nháp 10 / Đã xử lý 10 / Đã khóa 60). **0** payslips GETs on overview; copy: «không tải full payslips trên overview». Tab **Biến động NS**: **Nhân viên hiện tại = 1041** (not ~95). Uses `employees/summary` + not page-length undercount. |

---

## Per-item detail notes

### 4b Insurance / J-HRM-04

- Happy paint after page=1 (also continued pages 2–5 in background — not FAIL for this residual AC).
- J-HRM-04 click path: Insurance list → employee name link → profile under `companyId=main`.

### 4c Internal services

- List + detail dialog both observed in browser (dialog may portal to parent document).

### 5 Payroll i18n header

- Header AC **PASS**. Cell localization residual tracked as P2 only.

### 6 Employees J-HRM-02

- W1 list fan-out controlled (page=1 only on list mount).
- Profile network clean vs multi-page list storm.

### 7 Reports

| Sub-gate | Result |
|----------|--------|
| No `attendanceError` | 🟢 |
| Reconciliation on overview | 🟢 API + FE |
| No payslips dump | 🟢 |
| Biến động NS ≠ ~95 | 🟢 **1041** |

**P2 residual:** Overview/turnover **1041** vs Nhân sự list **1107** (cardinality semantics / filter — not the prior page_size=100→95 undercount class).

---

## Carry-forward from prior wave (not re-opened here)

| Item | Prior | This resume |
|------|-------|-------------|
| 1 Dashboard D-DASH-01 | 🟡 | unchanged |
| 2 Attendance leave | 🟢 | unchanged |
| 3 Recruitment | 🟡 | unchanged |
| 4a Insurance ERROR path | 🟢 | unchanged; 4b happy closed |

Ops blocker `D-P1-HRM-RETEST-XBOS-28002-DOWN-01` — **cleared** by entry evidence (login 201).

---

## Seeds / API-only

- **Seed:** none.
- **API-only PASS:** none claimed — all verdicts from browser FE + iframe PerformanceResourceTiming / fetch intercept.

---

## Handoff packet

- `work_item_id:` `P1-HRM-FULL-MENU-QA-RETEST-RESUME-01`
- `from_role:` qa
- `to_role:` pm
- `ack_status:` **PASS_TO_PM**
- `evidence_path:` `docs/qa/evidence/p1-hrm-full-menu-qa-retest-resume-20260717.md`
- `completion_report:` |
  Resume residual 4b–7 after xbos `:28002` restore. Login **201**. 🟢 Insurance happy + J-HRM-04 profile 200. 🟢 Internal services list+detail dialog. 🟢 Payroll header «Trạng thái» (no i18n object). 🟢 Employees W1 list page=1 + J-HRM-02 ≤1 detail GET / no list-page chain. 🟢 Reports: no attendanceError; recon wired on overview; no payslips dump; Biến động NS **1041** (not ~95). U65 no seed. P2: 1041 vs list 1107; payroll cell raw `processed`.
- `next_owner:` **qc** (wave gate) or **pm** (close program / triage P2)
- `next_dispatch_prompt:` |
  ```
  work_item_id: P1-HRM-FULL-MENU-QA-RETEST-QC-01
  from_role: pm
  to_role: qc
  entry_criteria: docs/qa/evidence/p1-hrm-full-menu-qa-retest-resume-20260717.md PASS_TO_PM; prior partial docs/qa/evidence/p1-hrm-full-menu-qa-retest-20260717.md; xbos restore docs/qa/evidence/d-xbos-auth-28002-restore-20260717.md
  task: QC Go/No-Go on full-menu fix-bundle retest residual close (4b–7 🟢). Note P2 residuals: reports headcount 1041 vs employees 1107; payroll status cell raw "processed". Do not require seed. Cite J-HRM-02/J-HRM-04 evidence.
  exit_criteria: GO or GO WITH CONDITIONS with residual owners; evidence docs/qa/evidence/qc-p1-hrm-full-menu-retest-20260717.md
  ```
