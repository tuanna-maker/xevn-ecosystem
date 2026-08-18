# Evidence — PO-MFD-M3-EMP-TRAINING-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M3-EMP-TRAINING-QA-01` |
| **role** | qa |
| **date** | 2026-08-04 |
| **startedAt** | `2026-08-04T09:39:46.Z` (browser JSON) |
| **finishedAt** | harness exit 0 |
| **commit** | `dc930c5` |
| **spec_ref** | HDSD CH06 §6.2 Đào tạo · UC-HRM-21 · matrix #19 SCR-TAB-TRAINING · J-HRM-02 |
| **hdsd_align** | **true** (U76) |
| **U65** | zero-seed · read-only · **0** mutates · no invent Employees CLOSED |
| **parent_fail** | `docs/qa/evidence/po-mfd-m3-emp-qa-runtime-01.md` · #19 BROKEN `stats.completed` |
| **fe_fix** | `docs/qa/evidence/po-mfd-m3-emp-training-fix-01.md` · READY_FOR_QA |
| **matrix** | `HRM-EMPLOYEES_FIDELITY_MATRIX.md` surface **#19** |
| **runtime_json** | `docs/qa/evidence/_tmp-po-mfd-m3-emp-training-qa-01-browser.json` |
| **harness** | `scripts/qa/_tmp-po-mfd-m3-emp-training-qa-01.mjs` |
| **screens** | `docs/qa/evidence/screens/po-mfd-m3-emp-training-qa-01/` |
| **ack_status** | **PASS_TO_PM** |
| **Employees CLOSED** | **false** |
| **Attendance CLOSED** | **false** |
| **uat_done** | **false** |

## L0 `qc:fe-be-health`

| Checkpoint | Result |
|------------|--------|
| Entry (before browser) | **ALL PASS** |
| Exit (harness probe) | hrm/xbos/portal **200** |

## Persona

| Persona | Account | Scope |
|---------|---------|-------|
| Group CEO | `ceo@xe.vn` / `Xevn@2026` | `tenantId=xevn` · `companyId=main` |

## hdsd_inventory (U76)

| HDSD / journey surface | Attempted | Result |
|------------------------|-----------|--------|
| Login Group CEO | portal proxy login | **201** |
| CH06 §2 Danh sách nhân sự | `/hr/employees?…companyId=main` | List **50** rows · no Sync ERROR |
| CH06 §6 / J-HRM-02 list→hồ sơ | Click holding rollup row | `/hr/employees/0f6e1369-…` |
| CH06 §6.2 Tab Đào tạo | nhóm HR → Đào tạo (`group:hr`) | Summary cards + empty list · **no pageError** |
| F5 → re-open Đào tạo | reload → pinned tab training | GET training **200** again · stats still 0 |

## Click path

1. Login `ceo@xe.vn` → inject portal session `companyId=main`
2. `http://127.0.0.1:5173/hr/employees?portal=1&tenantId=xevn&companyId=main`
3. Open row `0f6e1369-4170-42e3-ad6b-3d04b3ec2edd` (Nguyễn Văn QA M3 987275 · Tập đoàn XeVN)
4. Profile group **HR** → tab **Đào tạo**
5. Assert UI + Network; **F5**; re-open Đào tạo (default tab = Thông tin chung)

## Network / console

| Check | Result |
|-------|--------|
| GET `…/employees/0f6e1369-…/training?company_id=main` | **200** `HRM-EMP-PROFILE-200` · `itemCount=0` · `hasStatsKey=false` |
| After F5 + re-open | **200** same path |
| pageErrors | **[]** (no `TypeError` / `.completed`) |
| consoleErrors | **[]** |
| Unexpected mutates | **0** |

## UI (empty honesty OK)

- Summary: **Đã hoàn thành 0** · **Đang học 0** · **Tổng giờ học 0h** · **Chi phí (CTy) 0 ₫**
- List: **Chưa có chương trình đào tạo** · CTA **Thêm khóa học**
- No white crash / crash banner

## AC matrix

| # | AC | Verdict |
|---|-----|---------|
| 1 | L0 fe-be health PASS | 🟢 |
| 2 | List → profile → Đào tạo (HDSD §6.2) | 🟢 |
| 3 | GET training **2xx** | 🟢 |
| 4 | No pageError on `stats.completed` | 🟢 |
| 5 | Summary cards render (zeros OK) | 🟢 |
| 6 | F5 + re-open still OK | 🟢 |
| 7 | U65 zero-seed · 0 mutates | 🟢 |
| 8 | must_keep LIST/CREATE/DETAIL/IMPORT/SCOPE not regress-claimed | 🟢 untouched |
| 9 | Not invent Employees CLOSED | 🟢 |

## Matrix stamp

| Surface # | Prior | After TRAINING-QA-01 | Note |
|-----------|-------|----------------------|------|
| **19** Đào tạo | **BROKEN** | **LIVE** | Crash residual CLOSED; CRUD depth out of this RO seat |
| **1–6, 7, 8, 10–12, 28** | LIVE | **must_keep** | Not re-stamped this seat |

Rollup after stamp: LIVE **26** · PARTIAL **2** (#9 · #18) · BROKEN **0** · UNKNOWN **0** · Employees CLOSED **false**

## Screens

| File | Content |
|------|---------|
| `01-list.png` | Employees list main |
| `02-detail-shell.png` | Profile shell |
| `03-training-tab.png` | Đào tạo stats 0 + empty honesty |
| `04-training-f5.png` | After F5 re-open |

## Defects / residuals

| ID | Severity | Status | Note |
|----|----------|--------|------|
| R-MFD-M3-EMP-TRAINING-CRASH | P0 | **CLOSED** | Fixed FE + browser retest LIVE |
| #9 Xuất Nest depth | P1 | OPEN | `PO-MFD-M3-EMP-EXPORT-01` |
| #18 Job honesty | P2 | OPEN | ba-process / mock signal |
| Training CRUD mutate | P1/P2 | OPEN | RO seat only — Thêm/Lưu/F5 not exercised |

## completion_report

**Closed:** `PO-MFD-M3-EMP-TRAINING-QA-01` — U65 browser retest of FE fix for Employee profile → Đào tạo. GET training **200** with empty list (`hasStatsKey=false`); summary cards show zeros; **0** pageErrors / console TypeError on `.completed`; F5 → re-open still LIVE. Matrix **#19 LIVE**. L0 entry+exit PASS. **0** mutates · no seed.

**Residual / not claimed:** Employees menu **not** CLOSED; Attendance **not** CLOSED; `#9` PARTIAL Xuất; `#18` PARTIAL Job; Training CRUD depth not promoted.

**ack_status:** **PASS_TO_PM**

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M3-EMP-EXPORT-01
from_role: pm
to_role: qa
lane: execution
priority: P1
u65_zero_seed: true
ack_status target: PASS_TO_PM

## Context
#19 Training LIVE closed under PO-MFD-M3-EMP-TRAINING-QA-01.
Next EMP residual: matrix #9 Xuất PARTIAL (client dialog; Nest export depth).

entry_criteria:
- L0 qc:fe-be-health PASS
- portal /hr/employees?companyId=main · ceo@xe.vn
- must_keep #1-6 #7 #8 #10-12 #19 #28 LIVE — do not regress Training

exit_criteria:
1. Browser Xuất dialog → columns / format; honesty vs Nest export
2. Stamp #9 LIVE or keep PARTIAL with SPEC_GAP owner
3. evidence docs/qa/evidence/po-mfd-m3-emp-export-01.md
4. NOT claim Employees CLOSED
cấm: seed · invent CLOSED · touch Attendance Face

ALTERNATE (gate):
work_item_id: PO-MFD-M3-EMP-TRAINING-QC-01
to_role: qc
entry: evidence po-mfd-m3-emp-training-qa-01.md · matrix #19 LIVE
exit: GO/GWC spot on Training crash residual CLOSED; Employees still not CLOSED
```
