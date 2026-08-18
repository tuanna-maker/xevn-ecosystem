# PO-MFD-M2-ATT-QA-RUNTIME-01 — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-QA-RUNTIME-01` |
| **Program** | U87 · M2 fidelity runtime refresh |
| **ack_status** | **PASS_TO_PM** |
| **uat_done** | `false` |
| **Attendance CLOSED** | **false** (not claimed) |
| **Account** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **commit** | `dc930c5` |
| **hdsd_align** | CC → HRM embed → **Chấm công** (`Attendance.tsx`) · U76 menu inventory |
| **U65** | zero-seed · read-only (no Tạo/Lưu/Duyệt/POST records) |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-mfd-m2-att-qa-runtime-01-browser.json` |
| **Script** | `scripts/qa/_tmp-po-mfd-m2-att-qa-runtime-01.mjs` |

## L0 stack

| When | Check | Result |
|------|-------|--------|
| Entry | `pnpm run qc:fe-be-health` | **PASS** |
| Exit | `pnpm run qc:fe-be-health` | **PASS** |

## Method (U65 · U76 · read-only)

1. Login portal API → inject token → open `/hr/attendance?portal=1&companyId=main`.
2. Click **42** menu surfaces (tabs, attendance submenu, shifts, requests, leave, reports, settings sidebar, rules subtabs).
3. Observe Network `/api/hrm/*` GETs (status + path); classify `LIVE` / `PARTIAL` / `STUB_UI` / `BROKEN` / `GĐ2-HOLD`.
4. **must_keep:** do not reopen mutate GWC tabs to invent FAIL; Face #9 spot only; GPS method open only (no check-in POST); export (#30) not clicked.
5. Unexpected non-GET during seat: **0**.

## HDSD inventory (spot)

| Surface | Menu / control | Verdict |
|---------|----------------|---------|
| Tổng quan | Tab Tổng quan | LIVE · GET overview 200 |
| Clock hub / Thủ công / QR / Face / GPS | Chấm công CTA + methods | LIVE / PARTIAL / GĐ2-HOLD / LIVE |
| Bảng / Bản ghi / Tuần / Tổng hợp | ▼ attendance menu | LIVE · records/sheets GETs 200 |
| Ca list / lịch / OT | Ca làm việc menu | LIVE / STUB_UI / STUB_UI |
| Đơn từ #19–27 | Quản lý đơn | LIVE (list GETs; no mutate) |
| Báo cáo | Tab Báo cáo | LIVE · fan-in 200 · export not clicked |
| Thiết lập NV + rules | Sidebar + rules strip | LIVE / STUB_UI |

## Probe rollup (42 surfaces)

| Stamp | Count | Notes |
|-------|------:|-------|
| **LIVE** | 28 | Network GETs 2xx · body mounts · no 5xx |
| **PARTIAL** | 1 | #8 QR shell (ACCEPTED_AS_IS_P1) |
| **GĐ2-HOLD** | 1 | #9 Face banner + stub copy · 0 POST |
| **STUB_UI** | 12 | #17–18 SHIFTS-02 honesty · #37–46 settings/rules stubs |
| **BROKEN** | 0 | Initial #37/#39 timeout = wrong i18n label; reprobe **STUB_UI** |

| Metric | Value |
|--------|------:|
| networkOk GETs | 379 |
| networkBad (≥400) | 0 |
| unexpected mutates | 0 |
| pageErrors | 0 |

## Stale RUNTIME_LOG corrections (vs prior M1 log)

| Matrix # | Was (stale log) | Now (this seat + P1 GWC Network) |
|---------:|-----------------|----------------------------------|
| 13 edit | BROKEN edit | **LIVE** list RO this seat; edit GWC from `RECORDS-EDIT-01-R3` kept |
| 20 / 22 / 24 | PARTIAL storm | **LIVE** GET late-early / trip / shift-change 200 idle0 |
| 31 | PARTIAL unwired CTA | **LIVE** employees GET 200 (Refresh/Import GWC R2 kept) |
| 17–18 | PARTIAL | **STUB_UI** honesty panel (`featureInDev` + GĐ2) |
| 35–36 | prior BROKEN | **LIVE** testids + rules GETs (prior R1/ScanFace closed) |
| 37 / 39 | — | **STUB_UI** (`Máy tính bảng` / `Tự động chấm công`) |

## Matrix stamps confirmed (no UNKNOWN left)

| # | runtime | Network proof (sample) |
|---|---------|------------------------|
| 1–5 | LIVE | `GET …/attendance/overview?year=2026` 200 |
| 6–7 | LIVE | clock hub + manual shell · no POST |
| 8 | PARTIAL | QR shell · work-sites/overview 200 |
| 9 | GĐ2-HOLD | Face stub + gd2Hold |
| 10 | LIVE | GPS method open · no POST (R2 GWC spot) |
| 11–16 | LIVE | sheets/records/weekly/summary/shifts GETs 200 |
| 17–18 | **STUB_UI** | honesty panel · work-shifts GET still fires on shell |
| 19–28 | LIVE | leave / late-early / OT / trip / update / shift-change GETs 200 |
| 29 | LIVE | reports fan-in · #30 PARTIAL kept (export not clicked) |
| 31–36 | LIVE | employees + rules tabs · device/app testids |
| 37–46 | STUB_UI | featureInDev / sidebar placeholders |

**Kept from P1 GWC (not re-mutated):** OVERVIEW / WEEKLY / SETTINGS-EMP / RECORDS-EDIT / REQUESTS / REPORTS · CFG-COLUMNS / DEVICE / AUTO / QR **ACCEPTED_AS_IS_P1**.

## J-* / UF

| ID | Scope this seat |
|----|-----------------|
| J-HRM-06 | List records RO only (edit already GWC R3) |
| UF-HRM-05 | Reports load spot |
| Leave J-* mutate | **not** reopened (LEAVE-WF GWC must_keep) |

## Residuals (honest · not Attendance CLOSED)

| ID | Note | Owner |
|----|------|-------|
| R-MFD-ATT-SETTINGS-STUB-CLUSTER | #40–46 + #37–39 STUB_UI | ba-data / sa (P2 backlog) |
| #17–18 STUB_UI | Roster API GĐ2 · menu honesty OK | ba-process (`GD2-ROSTER`) |
| #8 PARTIAL · #30 PARTIAL · #33 columns PARTIAL | ACCEPTED_AS_IS_P1 / export P2 | — |
| #9 Face | GĐ2-HOLD | pm |

## Artifacts updated

- `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_RUNTIME_LOG.md`
- `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_FIDELITY_MATRIX.md` (#17–18 runtime + overlay + counts)
- `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_M2_BACKLOG.md` (QA-RUNTIME seat)

---

### completion_report

Closed **PO-MFD-M2-ATT-QA-RUNTIME-01**: browser U65 read-only refresh of Attendance fidelity runtime. **0 UNKNOWN**. Stale RUNTIME_LOG rows (#13 edit, #20/#22/#24, #31) aligned to LIVE with Network GETs. #17–18 stamped **STUB_UI** (SHIFTS-02 honesty). Face #9 **GĐ2-HOLD**. No seed · no product PATCH · **uat_done false** · **Attendance not CLOSED**. P1 GWC mutate tabs not reopened for FAIL invention.

### next_owner

**pm**

### next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-QA-RUNTIME-01-INTAKE
from_role: pm
to_role: pm
lane: governance
priority: P1

entry_criteria: evidence docs/qa/evidence/po-mfd-m2-att-qa-runtime-01.md PASS_TO_PM; matrix UNKNOWN=0; RUNTIME_LOG refreshed; P1 table COMPLETE
exit_criteria: bus INTAKE recorded; decide next = (a) M3 next menu Employees/Payroll fidelity OR (b) P2 export #30 / stub cluster governance; do NOT invent Attendance CLOSED; uat_done stays false; Face #9 HOLD
must_keep: all M2 P1 GWC + ACCEPTED_AS_IS_P1; U65
cấm: seed · claim Attendance CLOSED
```

### evidence_path

`docs/qa/evidence/po-mfd-m2-att-qa-runtime-01.md`

### ack_status

**PASS_TO_PM**
