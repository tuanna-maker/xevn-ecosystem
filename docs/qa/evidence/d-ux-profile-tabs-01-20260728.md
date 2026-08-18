# D-UX-PROFILE-TABS-01 — Profile C2 tab groups (Core / HR / Career / Personal)

| Field | Value |
|-------|-------|
| **work_item_id** | `D-UX-PROFILE-TABS-01` |
| **from_role** | pm |
| **to_role** | dev-fe |
| **date** | 2026-07-28 |
| **change_mode** | ADD |
| **ack_status** | **READY_FOR_QA** |
| **locks** | U65 · HOLD_DEPLOY · Payroll/D5/C1 untouched |

## Spec / scope

- SoT: `docs/program/UX-UI-PROFILE-C2-SYNTHESIS.md` · `docs/program/UX-UI-ERP-ANALYSIS.md` P0-3
- Matrix: `docs/qa/evidence/ux-ui-erp-screen-matrix-01.md` P2-f · UX-07
- Goal: 15 tabs → 4 groups; lazy non-Core; PermissionFallback for salary; click depth ≤2; no regress pin `localStorage`
- Out of scope: Payroll · Attendance C1 · D5 Zod · mobile 15-tab port · deploy

## What shipped

| Area | Change |
|------|--------|
| Tab IA | Core strip (general / work / contract / salary) always visible; **HR** / **Career** / **Personal** group popovers replace flat 11-item «More» |
| Mapping | HR: insurance, training, assets, rewards · Career: cv, kpi, workHistory, degrees, certificates, skills · Personal: family |
| Lazy | Non-Core panels via `React.lazy` + `Suspense` (`profile-tab-lazy-fallback`) |
| UX-07 | `PermissionFallback` VI + CTA «Liên hệ HR» on salary tab, insurance tab, and general financial/insurance cards (no silent null) |
| Pin | `employee-pinned-tabs` localStorage kept; DnD unpin nesting rule preserved (BTN-NEST-01) |
| i18n | `employeeProfile.groups.*` + `permissionFallback.*` (vi + en) |

### Files touched

- `apps/web/hrm/src/pages/EmployeeProfile.tsx` (CODE-MEMORY APPEND)
- `apps/web/hrm/src/lib/employeeProfileTabGroups.ts` + `.test.ts` (ADD)
- `apps/web/hrm/src/components/auth/PermissionFallback.tsx` (ADD)
- `apps/web/hrm/src/pages/employeeProfileBtnNest.test.ts` (marker update)
- `apps/web/hrm/src/i18n/locales/vi.json` · `en.json`

## Proxy click path (≤2)

### Path A — Core happy path (1 click)

| Step | Click | Result |
|-----:|-------|--------|
| 0 | Land `/employees/:id` | General tab |
| 1 | Tab **Hợp đồng** / **Lương** / **Công việc** | Panel opens |

**Depth = 1**

### Path B — Grouped non-Core (≤2)

| Step | Click | Result |
|-----:|-------|--------|
| 1 | Group **Nhân sự** / **Sự nghiệp** / **Cá nhân** (`profile-group-*`) | Popover panel |
| 2 | Tab item (`profile-group-tab-*`) | Panel opens; tab auto-pinned (same as legacy More) |

**Depth = 2**

### Path C — Pinned revisit (1 click)

| Step | Click | Result |
|-----:|-------|--------|
| 1 | Pinned chip after prior visit | Panel opens; pin order from localStorage |

## QA selectors

- `employee-profile-page`
- `profile-tab-groups`
- `profile-tab-general` \| `work` \| `contract` \| `salary`
- `profile-group-hr` \| `career` \| `personal`
- `profile-group-panel-*` · `profile-group-tab-*`
- `profile-pinned-tab-*`
- `permission-fallback` · `permission-fallback-contact-hr`
- `profile-tab-lazy-fallback` (brief on first non-Core open)

## Verify (dev)

```bash
cd apps/web/hrm
pnpm exec vitest run src/lib/employeeProfileTabGroups.test.ts src/pages/employeeProfileBtnNest.test.ts
# 8/8 PASS
pnpm exec tsc --noEmit -p tsconfig.json
# exit 0 (Profile paths clean)
```

## must_keep / not touched

- Payroll.tsx · Attendance C1 · D5 Zod salary-components · unrelated HRM screens
- Pin key `employee-pinned-tabs` + tab **ids** stable
- U72 label binds on general tab

## Residual

- Browser UF for groups (QA) — Persona `ceo@xe.vn`, list→detail J-HRM employee, deny-salary persona for PermissionFallback
- Other locale files (zh/my/lo/km) fall back to `defaultValue` VI/EN until i18n sweep

## completion_report

Closed Profile C2a: 4 tab groups + lazy non-Core + PermissionFallback salary/UX-07; unit 8/8; tsc clean on touched paths. Residual = browser QA-UX-PROFILE-C2-01.

## next_owner

qa

## next_dispatch_prompt

```text
work_item_id: QA-UX-PROFILE-C2-01
from_role: pm
to_role: qa
lane: execution
entry_criteria: D-UX-PROFILE-TABS-01 READY_FOR_QA; L0 stack; U65 zero-seed; HOLD_DEPLOY
read_first: docs/qa/evidence/d-ux-profile-tabs-01-20260728.md · docs/program/UX-UI-PROFILE-C2-SYNTHESIS.md
scope:
  - Browser UF Profile: Core 1-click (general→contract/salary); HR/Career/Personal group ≤2 clicks
  - Assert pin localStorage survives F5; unpin/DnD no DOM nest console error
  - Salary without view_salary → permission-fallback visible (not blank)
  - Network: no Payroll/D5 regression claim; Profile file only
  - J-*: list→detail employee deep link company_id
exit_criteria: evidence docs/qa/evidence/qa-ux-profile-c2-01-20260728.md; PASS_TO_PM or FAIL with defect
cấm: seed · API fake · touch Payroll
```

## ack_status

**READY_FOR_QA**
