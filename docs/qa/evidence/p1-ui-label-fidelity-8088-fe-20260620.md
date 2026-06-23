# P1-UI-LABEL-FIDELITY-8088 — Dev-FE evidence

**work_item_id:** `P1-UI-LABEL-FIDELITY-8088`  
**date:** 2026-06-20  
**role:** dev-fe  
**spec_ref:** `.cursorrules` §2 UI/UX; sponsor U65 browser acceptance

## Problem (sponsor UAT :8088)

Command Center home showed technical widget keys (`Task_Counter`, `KPI_Sparkline`, `Alert_List`). Catalog governance and HRM settings exposed raw `catalog_key`, `hat_key`, `wf_*` ids to end users.

## Changes

### 1. CommandCenterPage.tsx (home widgets)

| Before | After |
|--------|-------|
| `Task_Counter` | **Việc cần xử lý** |
| `KPI_Sparkline` | **Chỉ số KPI tập đoàn** |
| `Alert_List` | **Cảnh báo hệ thống** |

### 2. CatalogGovernancePanel.tsx

- `Seed quy trình (dev)` button + `wf_hrm_catalog_extension_xe_du_lich` id → **hidden in production** (`import.meta.env.DEV` only).
- Inbox cards: batch UUID → muted `Mã lô: 8219900a…` (full id in `title` tooltip).
- `hat_key` badge → Vietnamese via `resolveHatKeyDisplayLabel` (e.g. `group_ceo` → **Phê duyệt tập đoàn**).
- Detail table column **Danh mục** → business name via `resolveCatalogKeyDisplayLabel` (e.g. `positions` → **Chức danh**).

### 3. SettingsCatalogsTab.tsx + vi.json

- `catalogKeyField`: **Danh mục** (removed "(catalog key)" from user label).
- Catalog card title: `resolveCatalogKeyDisplayLabel(cat.catalogKey, cat.name)`; raw key only in `title` tooltip.
- Subtitle: domain + sync status only (no visible `catalogKey`).
- Add-item form: **Select dropdown** by catalog display name (not free-text key input).

### 4. Shared utilities

- `apps/web/web-portal/src/utils/catalogDisplayLabels.ts` (+ vitest 4/4)
- `apps/web/hrm/src/lib/catalogDisplayLabels.ts`

## Verification

```text
grep apps/web Task_Counter|KPI_Sparkline|Alert_List  → 0 matches (JSX user-visible)
pnpm exec vitest run src/utils/catalogDisplayLabels.test.ts  → 4/4 PASS
apps/web/web-portal pnpm run build  → exit 0
apps/web/hrm pnpm run build         → exit 0
```

## Files touched

- `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx`
- `apps/web/web-portal/src/pages/command-center/CatalogGovernancePanel.tsx`
- `apps/web/web-portal/src/utils/catalogDisplayLabels.ts`
- `apps/web/web-portal/src/utils/catalogDisplayLabels.test.ts`
- `apps/web/hrm/src/components/settings/SettingsCatalogsTab.tsx`
- `apps/web/hrm/src/lib/catalogDisplayLabels.ts`
- `apps/web/hrm/src/i18n/locales/vi.json`
- `apps/web/hrm/src/i18n/locales/en.json`

## QA checklist (browser :8088 — U65 zero-seed)

| UF | Check |
|----|-------|
| **UF-01** | Command Center home — widget titles Vietnamese; no `Task_Counter` / `KPI_Sparkline` / `Alert_List` |
| **UF-09/15** | Catalog governance tab — no `wf_*` in production UI; danh mục column shows **Chức danh** not `positions`; hat badge Vietnamese |
| HRM Settings → Danh mục | Form label **Danh mục**; dropdown by name; card subtitle without raw key |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · URL `:8088` Command Center + HRM embed settings.

## Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** qa
