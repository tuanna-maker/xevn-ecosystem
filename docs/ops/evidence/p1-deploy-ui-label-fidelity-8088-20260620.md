# P1-DEPLOY-UI-LABEL-FIDELITY-8088 — VPS deploy evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-DEPLOY-UI-LABEL-FIDELITY-8088` |
| **executed_at** | 2026-06-20 |
| **host** | `14.225.217.232:8088` |
| **owner** | PM Shell (U66) |

## Files synced (pscp)

- `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx`
- `apps/web/web-portal/src/pages/command-center/CatalogGovernancePanel.tsx`
- `apps/web/web-portal/src/utils/catalogDisplayLabels.ts`
- `apps/web/hrm/src/components/settings/SettingsCatalogsTab.tsx`
- `apps/web/hrm/src/lib/catalogDisplayLabels.ts`
- `apps/web/hrm/src/i18n/locales/vi.json`
- `apps/web/hrm/src/i18n/locales/en.json`

## Restart

`docker compose restart portal-fe hrm-fe`

## Smoke (VPS grep source)

```
Việc cần xử lý
Chỉ số KPI tập đoàn
```

No `Task_Counter` / `KPI_Sparkline` / `Alert_List` in CommandCenterPage.tsx on VPS.

**ack_status:** READY_FOR_QA (`P1-QA-UI-LABEL-BROWSER-8088-R2`)
