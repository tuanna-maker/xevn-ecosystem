# HRM Employees — Wave M3 fidelity backlog (ordered)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-MFD-M3-EMP-INVENTORY-01` |
| **Program** | U87 · `PO-MENU-FIDELITY-01` · M3 next menu after Attendance |
| **Menu** | Command Center → HRM embed → **Nhân sự** (`/employees` · `/employees/:id`) |
| **Inventory sources** | HDSD CH06 · TC pack `docs/qa/testcases/hrm-web/HRM-EMPLOYEES.md` · by-uc `HRM-EM-01..05` · `HRM-IM-01..04` · SRS cite only (UC-HRM-21 · FR-HRM-IM-01 · FR-UC-H01) — **did not overwrite** `docs/hrm/SRS.md` |
| **Matrix** | `HRM-EMPLOYEES_FIDELITY_MATRIX.md` (surface inventory · runtime **UNKNOWN** until QA) |
| **Generated** | 2026-08-04 |
| **uat_done** | `false` |
| **Employees CLOSED** | **false** — inventory only; no Dev coding this seat |
| **Attendance** | M2 wave honesty **GWC** (`PO-MFD-M2-ATT-WAVE-ROLLUP-QC-01`) · **NOT** Attendance CLOSED · Face #9 **GĐ2-HOLD** · do **not** invent Attendance CLOSED |

## Executive order (M3 pipeline)

```text
M3 Employees (first menu after Attendance — not Payroll):
  [CLOSED]     EMP-INVENTORY-01 (ba-process) — this backlog + matrix skeleton
  [CLOSED]     QA-RUNTIME-01 (qa) — UNKNOWN=0 · #19 BROKEN → TRAINING-FIX · not EMP CLOSED
  [PASS]       SCOPE-01 (qa) — list↔get-by-id org scope (ceo@ main rollup) · #28 LIVE
  [OPEN]       LIST / DETAIL / IMPORT P0 seats — after RUNTIME baseline; SCOPE green
  [HOLD]       Full profile-tab mutate depth · Job mock · KPI — P1/P2
  [FORBIDDEN]  invent Attendance CLOSED · invent Employees CLOSED · seed for UF · apps/** this seat
```

---

## P0 — Must establish before Employees M3 sign-off

| P0-7 | `PO-MFD-M3-EMP-TRAINING-FIX-01` | dev-fe | **DISPATCHED** | P0-1 | 19 | Guard stats.completed · READY_FOR_QA |

| Seq | work_item_id | Owner | Status | depends_on | Surface # | Matrix / gap | Entry | Exit |
|-----|--------------|-------|--------|------------|-----------|--------------|-------|------|
| P0-1 | `PO-MFD-M3-EMP-QA-RUNTIME-01` | qa | **CLOSED** UNKNOWN=0 · #19 BROKEN → TRAINING-FIX · not EMP CLOSED |
| P0-2 | `PO-MFD-M3-EMP-SCOPE-01` | qa | **CLOSED PASS** · #28 LIVE · not EMP CLOSED |
| P0-3 | `PO-MFD-M3-EMP-LIST-01` | qa | **CLOSED PASS** · not EMP CLOSED |
| P0-4 | `PO-MFD-M3-EMP-DETAIL-01` | qa | **CLOSED PASS** · #10–12 LIVE · not EMP CLOSED |
| P0-5 | `PO-MFD-M3-EMP-IMPORT-01` | qa | **CLOSED PASS** · #8 LIVE · #9 PARTIAL · not EMP CLOSED |
| P0-6 | `PO-MFD-M3-EMP-CREATE-UPDATE-01` | qa | **CLOSED PASS** · #7 LIVE · not EMP CLOSED |

---

## P1 — Enterprise fidelity (after P0 baseline)

| Seq | work_item_id | Owner | Status | depends_on | Surface # | Notes |
|-----|--------------|-------|--------|------------|-----------|-------|
| P1-1 | `PO-MFD-M3-EMP-SOFTDEL-01` | qa | **OPEN** | P0-3 | 13–15 | HRM-EM-04/05 · archive/restore · U65 FE create-then-archive |
| P1-2 | `PO-MFD-M3-EMP-EXPORT-01` | qa | **OPEN** | P0-3 | 9 | Client export columns; honesty if PARTIAL vs Nest |
| P1-3 | `PO-MFD-M3-EMP-MANAGER-01` | qa | **OPEN** | P0-6 | 7, 11 | FR-UC-H01/H03 · self-manager reject · display name not UUID |
| P1-4 | `PO-MFD-M3-EMP-CATALOG-01` | qa | **OPEN** | P0-6 | 7 | Dept/position picker catalog SoT · U72 labels · FR-HRM-SC-MD-02 |
| P1-5 | `PO-MFD-M3-EMP-PROFILE-TABS-01` | qa | **OPEN** | P0-4 | 16–24 | Spot core tabs load (contract/salary/training…); mutate depth may split |
| P1-6 | `PO-MFD-M3-EMP-RBAC-SALARY-01` | qa | **OPEN** | P0-4 | 12, 17 | PermissionFallback · no CMND/salary leak · AU |
| P1-7 | `PO-MFD-M3-EMP-CONTRACT-01` | qa | **OPEN** | P1-5 | 16 | Cross UC-HRM-INT-02 / contracts module — list from profile |
| P1-8 | `PO-MFD-M3-EMP-DATA-CLASS-01` | ba-data | **OPEN** | P0-1 | — | REF/CFG/TXN class for employees + nested sub-resources (ATT DATA_CLASS pattern) |

---

## P2 — Polish / deferred depth

| Seq | work_item_id | Owner | Status | Surface # | Notes |
|-----|--------------|-------|--------|-----------|-------|
| P2-1 | `PO-MFD-M3-EMP-JOB-MOCK-01` | ba-process | **OPEN** | 18 | TC pack FN-JOB-* HOLD mock — honesty STUB vs LIVE; no invent Nest jobs |
| P2-2 | `PO-MFD-M3-EMP-KPI-01` | ba-process | **OPEN** | 21 | KPI tab — classify LIVE/PARTIAL/STUB after RUNTIME |
| P2-3 | `PO-MFD-M3-EMP-PIN-TABS-01` | qa | **OPEN** | 10 | localStorage pin/drag UX — P2 polish |
| P2-4 | `PO-MFD-M3-EMP-NESTED-CRUD-01` | qa | **OPEN** | 19–24 | degrees/skills/family/… mutate packs — after P1 tabs |
| P2-5 | `PO-MFD-M3-EMP-OPENAPI-01` | sa | **OPEN** | — | Nest employees OpenAPI vs TC API_CONTRACT honesty |
| P2-6 | `PO-MFD-M3-EMP-GD2-HOLD-SCAN-01` | ba-process | **OPEN** | TBD | After RUNTIME: promote any GĐ2-HOLD surfaces (no Face invent from ATT) |

---

## GĐ2-HOLD / honesty (provisional — confirm after RUNTIME)

| Surface # | UI | work_item_id | Owner | Action |
|-----------|-----|--------------|-------|--------|
| 18* | Tab Việc làm (job list) | `PO-MFD-M3-EMP-JOB-MOCK-01` | ba-process | TC pack marks local/mock — **do not** claim LIVE until RUNTIME |
| ATT #9 | Face clock (Attendance) | `PO-MFD-M2-ATT-GD2-FACE-01` | pm | **Orthogonal** — still HOLD; not Employees scope |

\* Confirm STUB vs LIVE in `PO-MFD-M3-EMP-QA-RUNTIME-01` before Dev.

---

## UC / TC pack map (do not duplicate by-uc)

| Pack / UC | Title | M3 seats |
|-----------|-------|----------|
| HRM-EM-01 | Tạo hồ sơ nhân viên | P0-6 |
| HRM-EM-02 | Xem danh sách nhân viên | P0-3 |
| HRM-EM-03 | Cập nhật hồ sơ nhân viên | P0-4 · P0-6 |
| HRM-EM-04 | Lưu trữ (xóa mềm) | P1-1 |
| HRM-EM-05 | Khôi phục đã lưu trữ | P1-1 |
| HRM-IM-01..04 | Import Excel preview/commit | P0-5 |
| Menu TC | `HRM-EMPLOYEES.md` (40 screens · 72 fn · TC-EMP-*) | Trace for all seats |
| HDSD | `HDSD_XEVN_CH06_HRM_NHAN_SU.md` | Browser path SoT (U76) |
| Journey | J-HRM-01 · J-HRM-02 · J-HRM-IM-01 · UF-HRM-01/03/MENU-02 | P0-2..P0-5 |

---

## Cross-program honesty locks

| Lock | Rule |
|------|------|
| Attendance | M2 **wave honesty GWC only** — **not** Attendance CLOSED · Face #9 HOLD · `uat_done` false |
| Employees | Inventory skeleton — **not** Employees CLOSED · **no** `apps/**` Dev this seat |
| Payroll | **Not** first M3 menu — defer until Employees P0 baseline or sponsor override |
| Blueprint HRM Enterprise | Separate sponsor lane — do not mix into M3 fidelity seats |
| U65 | Zero seed; FE-only mutate; probe ≠ 🟢 UF |

---

## Recommended next dispatch (PM)

1. **`PO-MFD-M3-EMP-QA-RUNTIME-01`** (qa) — stamp matrix runtime (first P0).
2. Parallel optional: **`PO-MFD-M3-EMP-SCOPE-01`** (qa) — org scope list→detail under `ceo@xe.vn` main + member spot.

---

## Mindmap / program alignment

| Program | This backlog |
|---------|--------------|
| M1/M2 Attendance | Closed as **wave honesty GWC** — residual Face HOLD / stubs — **not** product CLOSED |
| M3 Employees | **This file** opens inventory + P0/P1/P2 seats |
| M3 Payroll | Out of scope until Employees P0 progress or sponsor |

---

## Handoff

| Field | Value |
|-------|--------|
| **ack_status** | Inventory seat → `PASS_TO_PM` via evidence `po-mfd-m3-emp-inventory-01.md` |
| **next_owner** | pm → dispatch **qa** `PO-MFD-M3-EMP-QA-RUNTIME-01` (or SCOPE-01) |
| **forbidden** | Dev coding Employees this seat · invent Attendance/Employees CLOSED · seed |






