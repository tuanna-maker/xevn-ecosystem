# P1-DEPLOY-HRM-WAVE2-FE-8088 — VPS deploy evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-PAGESIZE-CRYPTO-8088-01` |
| **executed_at** | 2026-06-20 |
| **host** | `14.225.217.232:8088` |

## Deploy
pscp 19 files (hrm src + portal LoginPage) → restart `hrm-fe`, `portal-fe`

## Smoke
- `safeRandomUuid.ts` HTTP **200**
- `/hr/settings-catalogs` HTTP **200**

## QA R4 result
**9/11 web UF 🟢** — residual UF-HRM-09/13 member UI login

**ack_status:** READY_FOR_QA (R5 UF-09/13 after dev-be member login)
