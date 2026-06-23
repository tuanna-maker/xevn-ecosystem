# P1-DEPLOY-MEMBER-SESSION-8088 — VPS deploy evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-MEMBER-SESSION-403-8088-01` |
| **executed_at** | 2026-06-20 |
| **host** | `14.225.217.232:8088` |
| **owner** | PM Shell (U66) |

## Files synced (pscp)

- `apps/web/web-portal/src/integrations/authSession.ts`
- `apps/web/web-portal/src/hooks/useCompanyFilterOptions.ts`
- `apps/web/web-portal/src/contexts/GlobalFilterContext.tsx`
- `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx`
- `apps/web/web-portal/src/components/auth/RequireAuth.tsx`
- `apps/web/web-portal/src/contexts/AuthContext.tsx`
- `apps/web/web-portal/src/integrations/authSession.test.ts`
- `apps/web/web-portal/src/hooks/useCompanyFilterOptions.test.ts`

## Restart

`docker compose --env-file .env restart portal-fe`

## Smoke

- `http://127.0.0.1:8088/` → HTTP **200**

**ack_status:** READY_FOR_QA (`P1-BROWSER-E2E-HRM-WAVE-8088-R6`)
