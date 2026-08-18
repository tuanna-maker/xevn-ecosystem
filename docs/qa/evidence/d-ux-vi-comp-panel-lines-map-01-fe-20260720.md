# D-UX-VI-COMP-PANEL-LINES-MAP-01 — FE evidence (2026-07-20)

| Field | Value |
|-------|-------|
| **work_item_id** | `D-UX-VI-COMP-PANEL-LINES-MAP-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | `docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md` · QA defect `qa-ux-vi-format-01-hrm-20260720.md` |
| **parent_fail** | `QA-UX-VI-FORMAT-01` — P0 `active.lines.map` when `lines` undefined |

## Root cause

`EmployeeCompensationPanel` rendered `active.lines.map(...)` when API returned an active package header without embedded `lines`. `useEffect` already guarded with `active?.lines?.length`; render path did not → `TypeError` → blank iframe on tab Đãi ngộ.

## Fix

| File | Change |
|------|--------|
| `apps/web/hrm/src/components/employee/EmployeeCompensationPanel.tsx` | Export `compensationPackageLines()`; `activeLines` via `useMemo`; render + hydrate use guarded array; empty-state copy when package has no line detail |
| `apps/web/hrm/src/components/employee/EmployeeCompensationHistoryPanel.tsx` | Defensive `(snapshot.lines ?? []).map` inside existing length guard |
| `apps/web/hrm/src/components/employee/EmployeeCompensationPanel.test.ts` | Regression: helper + render without lines + populated lines + no bare `active.lines.map` in code |

## must_keep

- ViMoneyInput + Calendar dd/MM/yyyy from `D-UX-VI-FORMAT-HRM-01` unchanged
- Revise/create flows and `buildCompensationLines` validation unchanged

## Sibling scan

| Component | `.lines.map` risk | Status |
|-----------|-------------------|--------|
| `EmployeeCompensationPanel.tsx` | **was P0** | Fixed |
| `EmployeeCompensationHistoryPanel.tsx` | guarded by `snapshot?.lines?.length` | Hardened with `?? []` |
| Other HRM `*Compensation*` | none | — |

## Verification

```text
pnpm --filter vite_react_shadcn_ts exec vitest run \
  src/components/employee/EmployeeCompensationPanel.test.ts \
  src/lib/compensationLines.test.ts \
  src/components/ui/__tests__/viMoneyInput.test.ts
→ 12 PASS (3 files)
```

## QA retest scope (QA-UX-VI-FORMAT-01-R2)

- Persona: `ceo@xe.vn` / `Xevn@2026` · `companyId=main`
- Path: CC → Nhân sự → DVU-0005 Hoàng Văn An → Hợp đồng → **Đãi ngộ**
- **N1** Type `20000000` → display `20.000.000` (ViMoneyInput)
- **N2** Network POST/PUT body amounts remain plain numeric
- **F5** Tab reload — no blank iframe / no `active.lines.map` console error
- Then promote insurance / job salary / payroll samples per original matrix

## completion_report

### Closed

- P0 crash on Đãi ngộ when active package omits `lines`
- Regression tests (4) + sibling history panel hardening

### Residual

- Browser U65 proof for typing/Network/F5 — **QA** on R2
- Insurance / job / payroll VI money samples not promoted in R1

## next_owner

**qa**

## next_dispatch_prompt

```text
work_item_id: QA-UX-VI-FORMAT-01-R2
from_role: pm
to_role: qa
lane: execution
entry_criteria: D-UX-VI-COMP-PANEL-LINES-MAP-01 READY_FOR_QA — docs/qa/evidence/d-ux-vi-comp-panel-lines-map-01-fe-20260720.md
persona: ceo@xe.vn / Xevn@2026 · companyId=main
UF/J-*: UF-HRM-03 compensation · AC-UX-NUM-01/02 · AC-UX-DATE-02
exit: Browser N1 typing 20000000→20.000.000 + N2 Network numeric + N3 F5 on Đãi ngộ; then insurance/job/payroll samples if time
evidence: docs/qa/evidence/qa-ux-vi-format-01-r2-hrm-20260720.md
cấm: seed · Phase1/PROD · probe-only PASS
```
