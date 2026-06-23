# P1-UI-LABEL-FIDELITY-8088-W2 — Dev-FE evidence

**work_item_id:** `P1-UI-LABEL-FIDELITY-8088-W2`  
**date:** 2026-06-20  
**role:** dev-fe  
**spec_ref:** QA R2 G2/G3 residual `p1-qa-ui-label-browser-8088-r2-20260620.md`; sponsor U65 browser acceptance

## Problem (QA R2 :8088)

- **G3 FAIL:** Action Cards on Command Center home showed raw `business_type` snake_case subtitles: `catalog_governance`, `workflow_definition_review`, `fleet_ops`, `finance_expense`, `hrm_recruitment`, `general`, `hrm_payroll`.
- **G2 FAIL:** `Seed quy trình (dev)` still visible on VPS `:8088` — docker-compose runs **vite dev** (`import.meta.env.DEV=true`) not production nginx build.

## Changes

### 1. `workflowDisplayLabels.ts` (new)

- `resolveWorkflowBusinessTypeLabel(businessType)` — maps 7 QA keys + HRM/XBOS workflow types to Vietnamese sponsor labels.
- `shouldShowWorkflowDevSeedControls()` — hidden when `import.meta.env.PROD`; on vite dev only shown on `localhost` / `127.0.0.1` (VPS IP `:8088` → hidden). Override via `VITE_ENABLE_WORKFLOW_DEV_SEED=true|false`.

| business_type | Vietnamese subtitle |
|---------------|---------------------|
| `catalog_governance` | Quản trị danh mục |
| `workflow_definition_review` | Duyệt định nghĩa quy trình |
| `fleet_ops` | Vận hành đội xe |
| `finance_expense` | Chi phí & thanh toán |
| `hrm_recruitment` | Tuyển dụng |
| `hrm_payroll` | Tiền lương |
| `general` | Nghiệp vụ chung |

### 2. `commandCenterInboxApi.ts`

- `mapWorkflowTaskToUnifiedTask`: `subtitle` now uses `resolveWorkflowBusinessTypeLabel(businessType)` instead of raw API key.

### 3. `portalAlertMappers.ts`

- Alert detail line uses Vietnamese business type label (parity with Action Cards).

### 4. `CatalogGovernancePanel.tsx`

- Replaced `import.meta.env.DEV` gate with `shouldShowWorkflowDevSeedControls()` — Seed button absent on VPS `:8088`.

## Verification

```text
pnpm exec vitest run src/utils/workflowDisplayLabels.test.ts     → 3/3 PASS
pnpm exec vitest run src/integrations/commandCenterInboxApi.test.ts → 3/3 PASS
pnpm exec vitest run src/utils/catalogDisplayLabels.test.ts      → 4/4 PASS
pnpm run build (apps/web/web-portal)                             → exit 0
```

## Files touched

- `apps/web/web-portal/src/utils/workflowDisplayLabels.ts` (new)
- `apps/web/web-portal/src/utils/workflowDisplayLabels.test.ts` (new)
- `apps/web/web-portal/src/integrations/commandCenterInboxApi.ts`
- `apps/web/web-portal/src/integrations/commandCenterInboxApi.test.ts`
- `apps/web/web-portal/src/integrations/portalAlertMappers.ts`
- `apps/web/web-portal/src/pages/command-center/CatalogGovernancePanel.tsx`

## QA checklist (browser :8088 — parallel lane, not UF-09/15 chain)

| Gate | Check |
|------|-------|
| **G3** | CC home Action Cards — subtitle Vietnamese (e.g. **Quản trị danh mục** not `catalog_governance`); grep DOM for `catalog_governance` / `fleet_ops` → absent |
| **G2** | Catalog governance tab — **no** `Seed quy trình (dev)` button on VPS IP |
| **G1 regression** | Widget titles still **Việc cần xử lý** / **Chỉ số KPI tập đoàn** / **Cảnh báo hệ thống** |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · URL `:8088/command-center`

**Deploy note:** VPS `portal-fe` runs vite dev — rebuild container / refresh after merge; no seed in evidence (U65).

## Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** qa
- **next_dispatch_prompt:** Retest `P1-UI-LABEL-FIDELITY-8088-W2` on `:8088` — G2 Seed button hidden; G3 Action Card subtitles Vietnamese for all 13 inbox cards; confirm no snake_case `catalog_governance`/`fleet_ops` in DOM. Parallel lane only — do not block UF-09/15 chain. Evidence: update `p1-qa-ui-label-browser-8088-r3-*.md`.
