# D-UX-EMPTY-STATE-FE-01 — EmptyState SoT + wire (Wave B)

| Field | Value |
|-------|-------|
| **work_item_id** | `D-UX-EMPTY-STATE-FE-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **date** | 2026-07-28 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD |
| **locks** | U65 · HOLD_DEPLOY · preserve_default · cấm seed/deploy |

## Spec read ack

| Artifact | Cite |
|----------|------|
| SRS / ANALYSIS | `docs/program/UX-UI-ERP-ANALYSIS.md` §3 Loading/Empty/Error · UX-10 · § Wave B `EmptyState` 3 moods |
| Synthesis | `docs/program/UX-UI-ERP-REMAINING-SYNTHESIS.md` — Wave B ACTIVE (sponsor U74 CHỐT) |
| QC GWC must_keep | Clock-In C1 · taxSettlementFloatingUi · D5 Zod · P0-c Advance UX-06 · Profile C2 |

## Closed scope

1. **SoT** `apps/web/hrm/src/components/hrm/EmptyState.tsx` + `emptyStateSot.ts`
   - Moods: `none` | `error` | `permission`
   - VI defaults + CTA (`Thêm mới` / `Thử lại` / `Liên hệ HR`)
   - `data-testid="hrm-empty-state"` + `data-mood`
2. **Wired ≥2 high-traffic surfaces (UX-10 / bland inventory)**
   - **Dashboard** — payroll chart empty, dept salary empty, newest employees empty → actionable VI CTA (`/payroll`, `/employees`)
   - **Contracts** — list empty (`none` + Thêm/Xóa bộ lọc) + load-fail (`error` + Thử lại)
3. **Vitest:** `pnpm test -- src/components/hrm/EmptyState.test.ts` → **6/6 PASS**
4. **must_keep:** không đụng `Payroll.tsx` / Attendance Clock-In / Profile / taxSettlement / Advance / D5 Zod paths (diff name-only empty on those)

## Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/components/hrm/EmptyState.tsx` | ADD SoT component |
| `apps/web/hrm/src/components/hrm/emptyStateSot.ts` | ADD mood copy constants |
| `apps/web/hrm/src/components/hrm/EmptyState.test.ts` | ADD vitest smoke |
| `apps/web/hrm/src/pages/Dashboard.tsx` | Wire EmptyState (UX-10) + CODE-MEMORY |
| `apps/web/hrm/src/pages/Contracts.tsx` | Wire EmptyState none/error + CODE-MEMORY-CHANGE |

## Verify commands

```bash
cd apps/web/hrm
pnpm test -- src/components/hrm/EmptyState.test.ts
# expect: 6 passed
```

## QA click path (browser — U65 zero-seed)

| # | Path | AC |
|---|------|-----|
| 1 | Login `ceo@xe.vn` → Dashboard | Khi chart/newest empty: thấy `dashboard-*-empty` + CTA VI (không chỉ «Chưa có dữ liệu») |
| 2 | Menu Hợp đồng → list empty hoặc filter không khớp | `contracts-list-empty` + CTA Thêm / Xóa bộ lọc |
| 3 | (optional) Network fail list contracts | `contracts-list-empty-error` mood=error + Thử lại |
| 4 | must_keep smoke | Attendance Clock-In hub mount; Payroll tax settlement tab mount; Profile Core tabs; Advance create dialog cancel→reopen clean |

## Residual

| ID | Severity | Note |
|----|----------|------|
| R1 | P2 | Các list khác vẫn bland (`DataTable` default) — migrate Wave B follow-up, ngoài DoD ≥2 surfaces |
| R2 | INFO | `packages/ui` EmptyState cũ (no mood) giữ nguyên — HRM SoT là nguồn Wave B |

## Handoff

- **next_owner:** qa
- **ack_status:** READY_FOR_QA
- **next_dispatch_prompt:** (copy-ready below)

```text
work_item_id: QA-UX-EMPTY-STATE-01
from_role: pm
to_role: qa
lane: execution
entry_criteria: D-UX-EMPTY-STATE-FE-01 READY_FOR_QA; evidence docs/qa/evidence/d-ux-empty-state-fe-01-20260728.md; U65 browser-only zero-seed
read_first:
  - docs/qa/evidence/d-ux-empty-state-fe-01-20260728.md
  - docs/program/UX-UI-ERP-ANALYSIS.md §3 · UX-10 · EmptyState moods
exit_criteria:
  1) Vitest EmptyState.test.ts 6/6 (re-run or cite FE evidence)
  2) Browser: Dashboard empty zones show EmptyState + VI CTA (testid dashboard-payroll-chart-empty / dashboard-dept-salary-empty / dashboard-newest-employees-empty)
  3) Browser: Contracts list empty → contracts-list-empty + CTA; if load fail path available → mood=error + Thử lại
  4) must_keep smoke: Clock-In C1 mount · Payroll taxSettlementFloatingUi · Profile C2 · Advance UX-06 cancel→reopen no stale
  5) evidence_path: docs/qa/evidence/qa-ux-empty-state-01-20260728.md
  6) PASS_TO_PM hoặc FAIL với residual + screenshot
cấm: seed · deploy · Phase1 DONE · đè C1/D5/P0-c/Profile
```
