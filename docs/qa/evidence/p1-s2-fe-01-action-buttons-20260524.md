# P1-S2-FE-01 — Command Center ACTION_BUTTON_INVENTORY → API / disabled reason

| Field | Value |
|-------|--------|
| **work_item_id** | P1-S2-FE-01 |
| **date** | 2026-05-24 |
| **owner** | Dev-FE |
| **scope** | `apps/web/web-portal` Command Center + Executive cockpit (Track A) |
| **adr** | `docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` (TM C2) |

## Deliverables

1. **`commandCenterScope.ts`** — group CEO JWT `main` + KPI rollup query `holding`; HRM paths stay `main`.
2. **`capabilityActionRegistry.ts`** — Track A capability codes with `wireMode` (`api` \| `navigation` \| `client` \| `disabled`) and Vietnamese `disabledReasonVi` where applicable.
3. **`CapabilityActionButton.tsx`** — shared control: `title` / `aria-disabled` from registry + runtime guards.
4. **Wired surfaces**
   - Inbox: `BTN-A1-INBOX-DETAIL`, `BTN-A1-INBOX-QUICK` (blocked when inbox not from API).
   - Workflow drawer: complete/reject → `BTN-A1-INBOX-QUICK` API path.
   - Catalog governance: `BTN-A2-CATALOG-GOV-APPROVE` / `REJECT`.
   - Group HR: `CC-GROUP-HR-CATALOG-SYNC`; preset delete → explicit disabled reason (`BTN-A3-GROUP-HR-DELETE-PRESET`).
   - Executive dashboard: `BTN-A5-EXEC-MODULE-ACCESS` route map.
   - KPI rail scope hint: `describeScopePlaneForUi()`.
5. **`kpiEngineApi.fetchKpiRollup`** — uses `resolveXbosKpiRollupCompanyId()` for ADR-aligned rollup probe.

## Test / build

| Command | Result |
|---------|--------|
| `pnpm --filter web-portal test` | **52/52 PASS** (incl. `commandCenterScope.test.ts`, `capabilityActionRegistry.test.ts`) |
| `pnpm --filter web-portal build` | **PASS** (tsc + vite) |

## Stack / capability smoke (agent-run)

| Command | Result |
|---------|--------|
| `pnpm run qc:dev-stack` | exit **0** (hrm 28001, xbos 28002, portal 5175) |
| `pnpm run verify:capabilities -- --group A1` | pass=2 fail=0 (HTTP 401 unauthenticated smoke — endpoints reachable) |

## Files touched (summary)

- `apps/web/web-portal/src/integrations/commandCenterScope.ts` (+ test)
- `apps/web/web-portal/src/integrations/capabilityActionRegistry.ts` (+ test)
- `apps/web/web-portal/src/integrations/kpiEngineApi.ts`
- `apps/web/web-portal/src/components/command-center/CapabilityActionButton.tsx`
- `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx`
- `apps/web/web-portal/src/pages/command-center/CatalogGovernancePanel.tsx`
- `apps/web/web-portal/src/pages/command-center/WorkflowTaskDetailDrawer.tsx`
- `apps/web/web-portal/src/pages/dashboard/ExecutiveDashboardPage.tsx`

## Residual / QA notes

- Full `verify:capabilities` (all groups) not run in this slice — QA **P1-S2-QA-01** should run L2 matrix + authenticated probes.
- Org-foundation / legal-entity saves remain JWT-strict `main` per ADR §4 (no FE alias).
- Payroll overview mock (TM C4) out of scope — still on executive strict layout hide path.

## Handoff

| Field | Value |
|-------|--------|
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/p1-s2-fe-01-action-buttons-20260524.md` |
| **entry_criteria** | S2 FE-01 dispatched; ADR C2 accepted |
| **exit_criteria** | Track A buttons wired or disabled+reason; vitest/build PASS; scope rollup `main`→`holding` on KPI |
