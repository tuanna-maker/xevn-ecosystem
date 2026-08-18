# PO-HRM-UI-BRAND-W3-EMP-B — Export + lifecycle + contracts/BH + manager remaster

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-EMP-B` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **Date** | 2026-08-05 |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8–§10 |
| **Inventory** | `docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md` W3-EMP-B · E09, E12–E17, E19, E25–E27 |
| **Prior** | EMP-A QA PASS · `docs/qa/evidence/po-hrm-ui-brand-w3-emp-a-qa.md` |
| **RE-DISPATCH** | prior `f3cb21cb` stalled n=2 · evidence MISS → this seat completes remaster + evidence |
| **Coordinate** | `dialog.tsx` DialogTitle floor **≥20px CLOSED** — not modified; consumers inherit |
| **change_mode** | `UPGRADE` · preserve_default · stub honesty · Employees not CLOSED invent |
| **ack_status** | **READY_FOR_QA** |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8 pale ban · §9 dual-surface iframe · §10 ops-dense modal |
| **Inventory** | E09 export · E12 salary gate · E13 soft-delete · E14 archived list · E15 restore · E16 contracts · E17 BH/finance · E19 training · E25 work history · E26 RBAC chrome · E27 manager picker |
| **Program** | `HRM_UI_BRAND_REMASTER_PROGRAM.md` W3 FE-EMP slice B |
| **Skill** | `xevn-precision-motion-theme` — body `#111827` · secondary `#4B5563` · muted placeholder/icon only |
| **must_keep** | SoftDel archive · `navigate(/employees/:id)` · stub honesty · CORE-04 OCR OUT · no QR invent · no Nest/seed · no Employees CLOSED invent |

---

## Surfaces remastered (11)

| surface_id | Path(s) | Change summary |
|------------|---------|----------------|
| E09 | `EmployeeExportDialog.tsx` | Title inherits shared ≥20 floor; section/labels sharp xevn; column grid `border-xevn-border` / surface; sticky CTA footer |
| E12 | `EmployeeSalary.tsx` | KPI cards → ops-dense `border-xevn-border bg-xevn-surface` (removed rose/amber/emerald AI gradients); history/table/net accents → `text-xevn-primary`; labels secondary |
| E13 | `Employees.tsx` SoftDel AlertDialog | Title **`text-[20px] font-bold text-xevn-text`** (not `text-xl` @14px root); desc/reason Label sharp; SoftDel wire kept |
| E14 | `DeletedEmployeesDialog.tsx` | Title inherits DialogTitle floor; archive rows border-xevn / surface; empty icon textMuted |
| E15 | Restore AlertDialog (same file) | Title **`text-[20px] font-bold`**; desc secondary; restore API path kept |
| E16 | `EmployeeContracts.tsx` + Compensation panels | Stats icons blue/green/yellow/red → xevn primary/success/warning/danger; status badges DNA tokens; history/origin badges primary |
| E17 | `EmployeeInsurance.tsx` | Summary/type chrome blue → primary; employer → success; benefits count → warning; labels secondary |
| E19 | `EmployeeTraining.tsx` | `typeColors` + KPI icons blue → primary; online → success; labels secondary; stats wire kept |
| E25 | `EmployeeWorkHistory.tsx` | Task status/KPI blue/gray → primary/success/secondary; CardTitle sharp; attachment links primary |
| E26 | `Employees.tsx` PermissionGate CTA + `PermissionFallback` | create/edit/delete/export/archive gates unchanged; chrome sharp |
| E27 | `EmployeeManagerPicker.tsx` | CODE-MEMORY APPEND EMP-B; placeholder muted / clear secondary; picker wire kept |

**CORE-04 OCR OUT:** no OCR dialog invent.  
**PROP-03e QR SKIP:** attendance QR / EmployeeQRCard not touched.  
**Stub honesty:** no fake CLOSED Employees claim; SoftDel + navigate preserved.  
**Dialog R1:** `components/ui/dialog.tsx` **not modified** this seat.

---

## CODE-MEMORY

APPEND / refresh `@CODE-MEMORY` / `@CODE-MEMORY-CHANGE` `PO-HRM-UI-BRAND-W3-EMP-B` · ADR-20260805 on:

- `components/employee/EmployeeExportDialog.tsx`
- `components/employee/DeletedEmployeesDialog.tsx`
- `components/employee/EmployeeSalary.tsx`
- `components/employee/EmployeeContracts.tsx`
- `components/employee/EmployeeCompensationPanel.tsx`
- `components/employee/EmployeeCompensationHistoryPanel.tsx`
- `components/employee/EmployeeInsurance.tsx`
- `components/employee/EmployeeTraining.tsx`
- `components/employee/EmployeeWorkHistory.tsx`
- `components/employee/EmployeeManagerPicker.tsx`
- `pages/Employees.tsx`

**Not touched:** `components/ui/dialog.tsx` (title floor CLOSED).

---

## Verify

```text
> pnpm run verify:xevn:theme-contrast
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563 · muted-fg OK (portal+HRM+TW)
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] PASS (debt 0 ≤ baseline 0; use --strict for W3 DoD)
exit 0

> pnpm run verify:xevn:theme-contrast -- --strict
[xevn-theme-contrast] STRICT PASS — 0 pale hits
exit 0
```

Pale/purple grep on EMP-B paths: **0** `text-muted-foreground` · **0** `purple-|indigo-|violet-|text-blue-` on remastered chrome (DNA status may use success/warning/danger tokens).

---

## Wire preservation (spot)

| Wire | Status |
|------|--------|
| SoftDel ⋯→Xóa→AlertDialog→`softDeleteEmployee` archive | kept |
| Đã xóa → restore → `restoreEmployee` | kept |
| Row click / Xem → `navigate(/employees/${id})` | kept |
| Export XLSX/CSV client columns | kept |
| Salary PermissionGate `view_salary` + payslip API path | kept |
| Contracts / compensation create-revise | kept (chrome only) |
| Training getStats / EMPTY_TRAINING_STATS | kept |
| Manager picker manager_id + exclude self | kept |
| CORE-04 OCR / PROP-03e QR | OUT / SKIP |

---

## Screenshots

Browser capture deferred to QA (U65 FE path). Recommended:

1. Employees → Xuất — sharp title (≥20) + sticky export CTA (E09)
2. SoftDel ⋯→Xóa AlertDialog title ≥20 + Đã xóa → Khôi phục (E13–E15)
3. Profile → Lương — ops-dense KPI cards, no pastel gradients (E12)
4. Hợp đồng / BH / Đào tạo / Lịch sử CV — primary/DNA icons, secondary labels (E16–E17, E19, E25)
5. Form → Quản lý trực tiếp picker (E27)

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| R1 | Browser U65 smoke E09→E27 | **QA** |
| R2 | W3-EMP-C nested P2 (E18, E20–E24) | PM → later FE slice |
| R3 | Open Q §3 B1–B5 blank — A1–A5 interim | Sponsor / SA |
| R4 | Remaster program DONE / Employees CLOSED | **forbidden** this wave |

---

## Handoff

```yaml
work_item_id: PO-HRM-UI-BRAND-W3-EMP-B
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w3-emp-b.md
completion_report: |
  RE-DISPATCH close: remastered E09, E12–E17, E19, E25–E27 Precision Motion
  (ADR §8–§10). SoftDel/restore AlertDialog titles text-[20px]; Salary KPI
  ops-dense (no AI pastel gradients); blue→xevn-primary on contracts/BH/
  training/history; Export sticky; ManagerPicker kept. theme-contrast
  soft+strict exit 0. OCR OUT · QR SKIP · SoftDel + navigate kept.
  dialog.tsx not touched. No Nest/seed. Not remaster DONE / Employees CLOSED.
next_owner: qa
next_dispatch_prompt: |
  Task qa work_item_id=PO-HRM-UI-BRAND-W3-EMP-B-QA
  entry: L0 stack up; U65 zero-seed; EMP-A QA PASS; ADR §8–§10
  checks:
    1) pnpm run verify:xevn:theme-contrast -- --strict exit 0
    2) ceo@xe.vn → HRM Nhân sự → Xuất — sharp title + sticky CTA (E09)
    3) SoftDel ⋯→Xóa AlertDialog title ≥20px; Đã xóa → Khôi phục (E13–E15)
    4) Profile Lương — ops-dense cards no pastel gradients; labels secondary (E12)
    5) Hợp đồng / BH / Đào tạo / Lịch sử CV — primary/DNA chrome; no purple/blue AI (E16–E17,E19,E25)
    6) Form → Quản lý trực tiếp picker readable (E27); list→detail navigate still works
  exit: evidence docs/qa/evidence/po-hrm-ui-brand-w3-emp-b-qa.md · PASS_TO_PM
  cấm: seed · OCR invent · QR invent · claim Employees CLOSED · Nest · remaster DONE
pm_dispatch_hint: After EMP-B-QA PASS → W3-EMP-C if inventory P2 open, else QC brand wave when PORT/ATT also PASS
```

### next_dispatch_prompt (copy-ready)

```text
Task qa work_item_id=PO-HRM-UI-BRAND-W3-EMP-B-QA
role: qa · U65 browser-only · zero-seed
read_first: docs/qa/evidence/po-hrm-ui-brand-w3-emp-b.md · ADR-20260805 §8–§10 · inventory W3-EMP-B
entry: L0 portal+hrm; EMP-A QA PASS; theme foundation green; Dialog title floor CLOSED (do not regress)
checks:
  1) pnpm run verify:xevn:theme-contrast -- --strict exit 0
  2) ceo@xe.vn → HRM → Nhân sự → Xuất (E09) sharp title + sticky export CTA
  3) SoftDel ⋯→Xóa (E13) AlertDialog title ≥20px + Đã xóa → Khôi phục (E14–E15) — archive wire works
  4) Profile → Lương (E12) — ops-dense KPI (no rose/amber/emerald gradients); labels secondary
  5) Hợp đồng / BH / Đào tạo / Lịch sử CV (E16–E17,E19,E25) — no purple/blue AI KPI; secondary labels
  6) Form → Quản lý trực tiếp (E27); row → /employees/:id still works
exit: docs/qa/evidence/po-hrm-ui-brand-w3-emp-b-qa.md · PASS_TO_PM
cấm: seed · OCR invent · QR invent · Employees CLOSED invent · remaster DONE · regress DialogTitle floor
```
