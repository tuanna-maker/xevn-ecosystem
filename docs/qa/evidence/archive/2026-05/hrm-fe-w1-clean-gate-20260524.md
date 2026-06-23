# HRM FE W1 QC clean gate — Dev-FE evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `W1-HRM-QC-CLEAN-GATE` |
| **from_role** | Dev-FE |
| **to_role** | QA |
| **ack_status** | `READY_FOR_QA` |
| **date** | 2026-05-24 |

## Scope

Embed pilot guard closure for Decisions API mode and Employee Profile Supabase-only tabs in Command Center embed (`VITE_HRM_USE_API` / `shouldSkipSupabaseDataFetches`).

## Implementation summary

### 1. `useDecisions` — API mode in embed

- **File:** `apps/web/hrm/src/hooks/useDecisions.ts`
- **Guard:** `shouldSkipSupabaseDataFetches()` → `useApiMode`; Supabase `hr_decisions` / `employees` paths skipped when true.
- **API path:** `listHrDecisions`, `listEmployees`, `createHrDecision`, `updateHrDecision`, `deleteHrDecision` via `@/integrations/hrmApi`.
- **Consumer:** `apps/web/hrm/src/pages/Decisions.tsx` (sidebar menu Quyết định nhân sự).
- **Audit:** listed in `hrmEmbedPilotGuardAudit.test.ts` (`hooks/useDecisions.ts`).

### 2. `EmbedGuardedTab` on Employee Profile

- **Component:** `apps/web/hrm/src/components/hrm/EmbedGuardedTab.tsx` — blocks Supabase-only tab children in embed with Vietnamese placeholder (points user to sidebar API menus).
- **Page:** `apps/web/hrm/src/pages/EmployeeProfile.tsx` — 13 profile sub-tabs wrapped (Công việc, Bằng cấp, Chứng chỉ, Kỹ năng, Gia đình, Hợp đồng, Lương, Sơ yếu lý lịch, KPI, Bảo hiểm, Đào tạo, Tài sản, Khen thưởng / Kỷ luật).
- **Audit:** `pages/EmployeeProfile.tsx` in pilot Supabase module list (no direct Supabase import on page; guard via `EmbedGuardedTab`).

### 3. Web portal build hygiene

- **File:** `apps/web/web-portal/src/pages/command-center/CommandCenterModuleRail.tsx`
- **Fix:** removed unused import `parseCommandCenterModule` (TS6133).

## Commands & exit codes

| Command | CWD / filter | Exit code | Result |
|---------|----------------|-----------|--------|
| `pnpm --filter vite_react_shadcn_ts test` | repo root (`apps/web/hrm`) | **0** | 21 files, **83** tests passed; includes `hrmEmbedPilotGuardAudit.test.ts` (**35** tests) |
| `pnpm --filter web-portal build` | repo root | **0** | `tsc && vite build` success |

### Vitest highlight (embed guard audit)

```
✓ src/lib/hrmEmbedPilotGuardAudit.test.ts (35 tests)
Test Files  21 passed (21)
     Tests  83 passed (83)
```

## QA handoff

| Item | Entry | Exit |
|------|-------|------|
| **entry_criteria** | W1 HRM embed decisions + profile tab guard merged | — |
| **exit_criteria** | L2 P-CC HRM Decisions load without `54321`; Employee Profile embed tabs show guard (no Supabase fetch); vitest audit green | QA sign-off on matrix row |
| **evidence_path** | `docs/qa/evidence/hrm-fe-w1-clean-gate-20260524.md` | — |
| **J-*** (suggested)** | `PROGRAM_JOURNEY_MAP.md` — HRM Decisions list; J-HRM employee profile deep link if in sprint scope | — |

### Smoke (QA)

- Account: `ceo@xe.vn` / `Xevn@2026`, `company_id=main`.
- Command Center → HRM → **Quyết định nhân sự**: list loads via Nest API (no console `54321`).
- HRM embed → **Nhân viên** → open profile → switch guarded tabs: amber placeholder, no Supabase errors.
- Prerequisites: `pnpm run qc:dev-stack` / `qc:fe-be-health` per `pm-fe-be-live-health-gate.mdc`.

## Files touched (this wave)

- `apps/web/web-portal/src/pages/command-center/CommandCenterModuleRail.tsx` (TS6133 import cleanup)
- `docs/qa/evidence/hrm-fe-w1-clean-gate-20260524.md` (this file)

*No git commit per dispatch.*
