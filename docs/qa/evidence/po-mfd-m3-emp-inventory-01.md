# Evidence — `PO-MFD-M3-EMP-INVENTORY-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M3-EMP-INVENTORY-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | governance — M3 Employees fidelity **inventory only** |
| **priority** | P1 |
| **u65_zero_seed** | `true` |
| **Verdict** | **PASS** inventory skeleton ready |
| **ack_status** | `PASS_TO_PM` |
| **NOT claimed** | Attendance CLOSED · Face LIVE · Employees CLOSED · `uat_done=true` · PROD-READY · Phase 1 DONE · Dev coding Employees |

---

## Objective

Open M3 next-menu fidelity for **HRM Employees** (CC→HRM→Nhân sự) after M2 Attendance wave honesty **GWC** — inventory + backlog seats only; no product code; no invent Attendance CLOSED.

---

## Artifacts created (on disk)

| Artifact | Path | Status |
|----------|------|--------|
| M3 backlog | `docs/qa/professional/menu-fidelity/HRM-EMPLOYEES_M3_BACKLOG.md` | **CREATED** — P0/P1/P2 seats + entry/exit |
| Fidelity matrix | `docs/qa/professional/menu-fidelity/HRM-EMPLOYEES_FIDELITY_MATRIX.md` | **CREATED** — 28 surfaces · runtime **UNKNOWN** |
| Evidence | `docs/qa/evidence/po-mfd-m3-emp-inventory-01.md` | this file |

**Not modified:** `docs/hrm/SRS.md` · `apps/**` · Attendance CLOSED stamps.

---

## Sources read (spec / HDSD / TC — no invent)

| Source | Use |
|--------|-----|
| `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH06_HRM_NHAN_SU.md` | Menu path · list/create/import/profile steps (U76) |
| `docs/qa/testcases/hrm-web/HRM-EMPLOYEES.md` | Screen inv (40) · FN (72) · TC-EMP-* · API routes |
| `docs/qa/professional/by-uc/HRM-EM-01..05.md` | UC pack titles · LIKELY_IMPL ≠ UAT |
| `docs/qa/professional/by-uc/HRM-IM-01..04.md` | Import pack ids |
| `docs/hrm/SRS.md` (cite only) | UC-HRM-21 · FR-HRM-IM-01 · FR-UC-H01 · FR-HRM-EMP-COL-01 |
| ATT M2 backlog + WAVE-ROLLUP QC | Honesty lock: Attendance **not** CLOSED · Face #9 HOLD |

---

## Surface inventory summary

| Metric | Value |
|--------|------:|
| Matrix rows | **28** |
| Runtime UNKNOWN | **28** |
| P0 seats opened | **6** (`QA-RUNTIME` · `SCOPE` · `LIST` · `DETAIL` · `IMPORT` · `CREATE-UPDATE`) |
| P1 seats | **8** |
| P2 seats | **6** |
| Employees CLOSED | **false** |
| Attendance CLOSED | **false** (orthogonal) |

Top P0 work_item_ids:

1. `PO-MFD-M3-EMP-QA-RUNTIME-01`
2. `PO-MFD-M3-EMP-SCOPE-01`
3. `PO-MFD-M3-EMP-LIST-01`
4. `PO-MFD-M3-EMP-DETAIL-01`
5. `PO-MFD-M3-EMP-IMPORT-01`
6. `PO-MFD-M3-EMP-CREATE-UPDATE-01`

---

## Process decisions

| Decision | Rationale |
|----------|-----------|
| Employees **before** Payroll as M3 first menu | QC `next_dispatch` + PM DISPATCHED inventory |
| First execution seat = **QA-RUNTIME** (or parallel **SCOPE**) | Match ATT honesty pattern: stamp UNKNOWN before mutate UF; scope parity is historical P0 risk |
| Job tab flagged P2 honesty candidate | TC pack FN-JOB-* HOLD mock — confirm at RUNTIME; no Dev invent |
| No apps/** | Inventory governance only |

---

## Explicit honesty locks

- M2 Attendance = wave honesty **GWC** only — **not** product Attendance CLOSED.
- Face #9 remains **GĐ2-HOLD**.
- Employees module **not** CLOSED; `uat_done=false`.
- Blueprint HRM Enterprise = separate sponsor lane.
- U65: no seed in any future UF path.

---

## completion_report

Closed `PO-MFD-M3-EMP-INVENTORY-01`: created `HRM-EMPLOYEES_M3_BACKLOG.md` (P0/P1/P2 with owners + entry/exit) and `HRM-EMPLOYEES_FIDELITY_MATRIX.md` (28 surfaces, runtime UNKNOWN). Mapped P0 seats `PO-MFD-M3-EMP-*` from HDSD CH06 + menu TC pack + HRM-EM/IM by-uc; did not overwrite SRS; did not invent Attendance CLOSED; did not start Employees Dev coding.

**Residual:** All 28 runtimes UNKNOWN until QA-RUNTIME; SCOPE/LIST/DETAIL/IMPORT not yet executed; Job/KPI honesty pending RUNTIME; Payroll M3 not opened.

---

## next_owner

`pm` → dispatch **qa**

---

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M3-EMP-QA-RUNTIME-01
from_role: pm
to_role: qa
lane: execution
priority: P0
u65_zero_seed: true

Context: M3 Employees inventory CLOSED (PO-MFD-M3-EMP-INVENTORY-01). Matrix 28 rows all UNKNOWN. Attendance NOT CLOSED (M2 GWC honesty only · Face #9 HOLD). Employees NOT CLOSED.

Job (browser U65 RO — no seed · no invent CLOSED):
1. Read docs/qa/professional/menu-fidelity/HRM-EMPLOYEES_FIDELITY_MATRIX.md + HRM-EMPLOYEES_M3_BACKLOG.md P0-1.
2. Persona ceo@xe.vn → CC→HRM→Nhân sự (embed or /hr/employees); stamp each surface #1–28 runtime LIVE|PARTIAL|STUB_UI|BROKEN from Network+UI (RO preferred; mutate only if needed for presence check — prefer no mutate).
3. Update matrix runtime column + summary counts; evidence docs/qa/evidence/po-mfd-m3-emp-qa-runtime-01.md.
4. Spot note org-scope risk on #28 for follow-on PO-MFD-M3-EMP-SCOPE-01 (list→detail under main + member).

Exit: UNKNOWN=0 · ack_status PASS_TO_PM · NOT Employees CLOSED · NOT Attendance CLOSED · NOT Face LIVE.
Optional parallel after or with RUNTIME: PO-MFD-M3-EMP-SCOPE-01 (qa) J-HRM-01/02 scope parity.
```

---

## ack_status

**PASS_TO_PM**
