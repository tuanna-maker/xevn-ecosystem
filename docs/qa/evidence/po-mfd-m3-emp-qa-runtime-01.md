# PO-MFD-M3-EMP-QA-RUNTIME-01 — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M3-EMP-QA-RUNTIME-01` |
| **Program** | U87 · M3 Employees fidelity runtime stamp |
| **ack_status** | **PASS_TO_PM** |
| **uat_done** | `false` |
| **Employees CLOSED** | **false** (not claimed) |
| **Attendance CLOSED** | **false** (orthogonal · M2 GWC only) |
| **Account** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **portal_url** | `http://127.0.0.1:5173/hr/employees?portal=1&tenantId=xevn&companyId=main` |
| **commit** | `dc930c5` |
| **hdsd_align** | HDSD CH06 · CC→HRM→**Nhân sự** · U76 inventory |
| **U65** | zero-seed · **read-only** (no import commit · no archive confirm · no form Lưu) |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-mfd-m3-emp-qa-runtime-01-browser.json` (synced from `-browser-r2.json`) |
| **Script** | `scripts/qa/_tmp-po-mfd-m3-emp-qa-runtime-01.mjs` |

## L0 stack

| When | Check | Result |
|------|-------|--------|
| Entry | `pnpm run qc:fe-be-health` | **PASS** (ALL PASS) |
| Exit | `pnpm run qc:fe-be-health` | **PASS** (ALL PASS) |
| Script L0 | hrm/xbos/portal | **200 / 200 / 200** entry+exit |

## Method (U65 · U76 · read-only)

1. Portal API login → inject token → `/hr/employees?portal=1&companyId=main`.
2. Smoke **28** matrix surfaces (list filters, dialogs open+Hủy, profile tabs via group popovers).
3. Classify `LIVE` / `PARTIAL` / `STUB_UI` / `BROKEN` / `GĐ2-HOLD` from UI + Network GET.
4. **must_keep:** no seed · no invent Employees/Attendance CLOSED · IMPORT commit owned by `PO-MFD-M3-EMP-IMPORT-01` (shell open only here).
5. Unexpected non-GET `/api/hrm/*`: **0**.

## HDSD inventory (spot)

| Surface | Menu / control | Verdict |
|---------|----------------|---------|
| Danh sách | load + subtitle count | LIVE · GET employees 200 |
| Tìm kiếm / Trạng thái / Phòng ban / Phân trang | CH06 §2.2–2.3 | LIVE |
| Cột công ty | VI display labels | LIVE |
| Thêm NV / Nhập / Xuất / Đã xóa | header CTAs · dialogs RO | LIVE |
| Hồ sơ shell + tabs | CH06 §6 · groups HR/Career/Personal | LIVE / PARTIAL / BROKEN (#19) |
| Soft-delete dialog | ⋯→Xóa → Hủy | LIVE |
| Scope spot | list→detail `company_id=main` | LIVE (#28 spot; SCOPE-01 deep) |

## Probe rollup (28 surfaces)

| Stamp | Count | Notes |
|-------|------:|-------|
| **LIVE** | 25 | Network GETs 2xx and/or dialog/tab shell mounts |
| **PARTIAL** | 2 | #9 Xuất client dialog (Nest export depth P1) · #18 Job local-mutate honesty |
| **BROKEN** | 1 | #19 Đào tạo — GET training **200** but `EmployeeTraining` `TypeError: … reading 'completed'` |
| **STUB_UI** | 0 | — |
| **GĐ2-HOLD** | 0 | (Face Attendance orthogonal HOLD) |
| **UNKNOWN** | **0** | Exit criterion met |

| Metric | Value |
|--------|------:|
| networkOk GETs (tracked) | 55 |
| networkBad (≥400) | 0 |
| unexpected mutates | 0 |
| pageErrors | 3 (all Training `.completed`) |
| consoleErrors | 1 (`EmployeeTraining`) |

## Matrix stamps (#1–28)

| # | runtime | Network / UI proof (sample) |
|---|---------|------------------------------|
| 1 | **LIVE** | `GET …/employees?company_id=main&page=1&page_size=50` 200 |
| 2 | **LIVE** | `GET …/employees?…&keyword=Nguyen` 200 |
| 3 | **LIVE** | `GET …/employees?…&status=active` 200 |
| 4 | **LIVE** | Dept select client filter (HDSD) |
| 5 | **LIVE** | Range `m–n / total` · next disabled OK if single page |
| 6 | **LIVE** | Company column VI labels (not raw slug-only) |
| 7 | **LIVE** | Thêm NV dialog · 4 tabs · Hủy · catalogs GET |
| 8 | **LIVE** | Import Excel dialog open · **no commit** (IMPORT-01 owns preview/Hủy depth) |
| 9 | **PARTIAL** | Xuất dialog shell open · Nest export not exercised → P1 `EXPORT-01` (align IMPORT-01) |
| 10 | **LIVE** | Profile shell · `GET …/employees/:id?company_id=main` 200 |
| 11 | **LIVE** | Tab Thông tin chung |
| 12 | **LIVE** | Tab Lương · payslips GET / gate UI |
| 13 | **LIVE** | ⋯→Xóa soft-delete dialog · **Hủy** |
| 14 | **LIVE** | Đã xóa dialog · archived list GET |
| 15 | **LIVE** | Restore CTA presence · no confirm |
| 16 | **LIVE** | Contracts GET 200 |
| 17 | **LIVE** | employee-insurances GET 200 |
| 18 | **PARTIAL** | operations/tasks GET + JobList local edit / create fallback |
| 19 | **BROKEN** | training GET 200 + **pageError** `.completed` (`EmployeeTraining`) |
| 20 | **LIVE** | assets GET 200 |
| 21 | **LIVE** | employee-kpis GET 200 |
| 22 | **LIVE** | resume-files / degrees / cert / skills tabs |
| 23 | **LIVE** | discipline/rewards GETs |
| 24 | **LIVE** | Family tab shell (group Cá nhân) |
| 25 | **LIVE** | work-timeline GET 200 |
| 26 | **LIVE** | ceo CTAs create/import/deleted + row Sửa/Xóa |
| 27 | **LIVE** | Manager picker field on create form |
| 28 | **LIVE** | List→detail spot · GET `:id` 200 `company_id=main` (SCOPE-01 deep keep) |

## Residuals (honest · not Employees CLOSED)

| ID | Note | Owner |
|----|------|-------|
| **R-MFD-M3-EMP-TRAINING-CRASH** | #19 `EmployeeTraining` throws on undefined `.completed` despite GET 200 — P0 FE | `dev-fe` |
| #18 Job PARTIAL | Local mutate path / create fallback — honesty for `PO-MFD-M3-EMP-JOB-MOCK-01` | ba-process / dev-fe |
| #9 Nest export depth | Dialog shell PARTIAL; Nest export SPEC_GAP → `PO-MFD-M3-EMP-EXPORT-01` | qa P1 |
| SCOPE deep | #28 spot LIVE — keep `PO-MFD-M3-EMP-SCOPE-01` evidence | qa (done parallel) |

## Artifacts updated

- `docs/qa/professional/menu-fidelity/HRM-EMPLOYEES_FIDELITY_MATRIX.md` (runtime column + counts)
- `docs/qa/professional/menu-fidelity/HRM-EMPLOYEES_RUNTIME_LOG.md` (created)
- `docs/qa/professional/menu-fidelity/HRM-EMPLOYEES_M3_BACKLOG.md` (P0-1 CLOSED)

## Explicit non-claims

- **Employees CLOSED** = false · **uat_done** = false
- **Attendance CLOSED** = false · Face GĐ2-HOLD orthogonal
- No invent CLOSED from this RUNTIME seat

---

### completion_report

Closed **PO-MFD-M3-EMP-QA-RUNTIME-01**: U65 browser RO stamp of Employees fidelity matrix **28/28**, **UNKNOWN=0**. LIVE **25** · PARTIAL **2** (#9 Xuất Nest depth · #18 Job honesty) · BROKEN **1** (#19 Training pageError). L0 fe-be-health PASS entry+exit. Network bad **0** · unexpected mutates **0**. Residual P0 Training crash → `dev-fe` (`PO-MFD-M3-EMP-TRAINING-FIX-01`). **Not** Employees CLOSED · **not** Attendance CLOSED · **uat_done false**.

### next_owner

**pm**

### next_dispatch_prompt

```text
work_item_id: PO-MFD-M3-EMP-TRAINING-FIX-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P0
u65_zero_seed: true

entry_criteria: evidence docs/qa/evidence/po-mfd-m3-emp-qa-runtime-01.md · matrix #19 BROKEN · GET …/training 200 + EmployeeTraining TypeError reading 'completed'
exit_criteria: open profile→Đào tạo no pageError; empty/null stats.completed safe; jest or smoke; READY_FOR_QA; must_keep #1–18 #20–28; cấm invent Employees CLOSED
allowed_paths: apps/web/hrm/src/components/employee/EmployeeTraining.tsx (+ related hook/types only)
evidence_path: docs/qa/evidence/po-mfd-m3-emp-training-fix-01.md
cấm: seed · claim Employees CLOSED · touch Attendance Face
```

### evidence_path

`docs/qa/evidence/po-mfd-m3-emp-qa-runtime-01.md`

### ack_status

**PASS_TO_PM**
