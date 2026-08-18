# Evidence — PO-MFD-M1-ATT-SYNTH

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M1-ATT-SYNTH` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **program** | U87 |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-04 |
| **uat_done** | false |

## completion_report

**Closed:**

- Merged M1 seats (INV-ALL, CFG-REF-01, ENTERPRISE-API-01, AT14-BYUC-01, P0-CFG-SA-01 evidence) into single ordered M2 backlog: `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_M2_BACKLOG.md`.
- Deduped 34 UNMAPPED rows → UC map (AT-01..14), UC delta, BA HOLD GĐ2, QA-RUNTIME, CFG BUILD.
- Folded PM-dispatched items with **DISPATCHED** status: `PO-MFD-M2-ATT-SCOPE-01`, `PO-MFD-M2-ATT-WIRE-BALANCE-01`; closed governance: `PO-MFD-M1-ATT-P0-CFG-SA-01`, `PO-MFD-M1-ATT-AT14-BYUC-01`.
- Updated `MFD-M1-ATT_MANIFEST.md` → **SYNTH_CLOSED**; appended synth stamp on fidelity matrix (§ Synth notes).
- **Runtime:** No `po-mfd-m1-att-runtime*` artifact — matrix **32 UNKNOWN** retained; **`PO-MFD-M1-ATT-QA-RUNTIME` remains open**.

**Residual:**

- Browser U65 not run (by design this seat).
- P0 CFG BE/FE, SHIFTS-02, QA-01 not dispatched in this seat (PM execution).
- P1/P2/GĐ2 items queued only — no waiver.

## Training quiz (MFD §6)

| # | Answer |
|---|--------|
| 1 STUB_UI/BROKEN | **9 STUB_UI** (settings/rules tablet/proxy/auto + sidebars); **0 BROKEN**; **5 PARTIAL** (schedule/OT/face/employees/rules standard) |
| 2 REF/CFG/TXN | See `HRM-ATTENDANCE_DATA_CLASS_MATRIX.md` — e.g. work_shifts=REF, attendance_rules=CFG (NO_API), records/sheets=TXN |
| 3 Payroll/Leave/WF | Enterprise API map §0 — CFG wrong → payroll systematic error; leave balance unwired; WF scope P0 |
| 4 UNMAPPED | **34** rows; **12** covered by HRM-AT-01..13; **+4** via new HRM-AT-14; rest = delta/HOLD/QA |
| 5 First P0 fix | **Scope parity** (DISPATCHED) + **CFG BE** (ADR-ready) + **leave-balance wire** (DISPATCHED); menu honesty **shift schedule** (SHIFTS-02) |

## evidence_path

- Backlog SoT: `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_M2_BACKLOG.md`
- Manifest: `docs/qa/professional/menu-fidelity/_squad/MFD-M1-ATT_MANIFEST.md`
- Matrix append: `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_FIDELITY_MATRIX.md` § Synth notes
- This file: `docs/qa/evidence/po-mfd-m1-att-synth.md`

## next_owner

**pm** — dispatch next unblocked M2 P0 execution items not already in flight.

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M1-ATT-P0-CFG-BE-01
from_role: pm
to_role: dev-be
lane: execution
program: U87
priority: P0

read_first (order):
- docs/architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md
- docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_M2_BACKLOG.md (P0-2)
- docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_DATA_CLASS_MATRIX.md §6
- docs/qa/professional/by-uc/HRM-AT-14.md
- apps/api/hrm-api/src/attendance/attendance.service.ts (work_sites, geo assert)

entry_criteria: PO-MFD-M1-ATT-P0-CFG-SA-01 PASS; SYNTH backlog published; no seed (U65)

exit_criteria:
- Nest CRUD attendance_rules (company slug scope, audit) + work-sites admin/read per ADR D3
- attendance_work_sites.company_id TEXT slug aligned with resolveScopeContext
- Unit/regression: scope-context + attendance service geo HRM-ATT-GEO-001
- evidence: docs/qa/evidence/po-mfd-m1-att-p0-cfg-be-01.md
- ack_status: READY_FOR_QA
- pm_dispatch_hint: PO-MFD-M1-ATT-P0-CFG-FE-01 after BE merge

cấm: invent columns vs Supabase types · seed pilot sites for UAT proof · Phase1 DONE claim

Parallel (if dev-be capacity): PO-MFD-M2-ATT-SHIFTS-02 dev-fe after SCOPE/BALANCE handoffs — see backlog P0-5; do not duplicate PO-MFD-M2-ATT-SCOPE-01 or PO-MFD-M2-ATT-WIRE-BALANCE-01 (already DISPATCHED).

After P0 dev wave: qa PO-MFD-M1-ATT-QA-RUNTIME (fill UNKNOWN) then PO-MFD-M2-ATT-QA-01.
```
