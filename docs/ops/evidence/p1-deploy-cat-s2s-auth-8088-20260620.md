# P1-DEPLOY-CAT-S2S-AUTH-8088 — VPS deploy evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-DEPLOY-CAT-S2S-AUTH-8088` |
| **executed_at** | 2026-06-20T07:23:49Z |
| **host** | `14.225.217.232:8088` |
| **owner** | PM Shell (U66) |
| **U65** | zero-seed probe only |

## Deploy actions

1. `pscp` `apps/api/hrm-api/src/settings-catalogs/xbos-catalog-workflow.bridge.ts`
2. `pscp` `deploy/xevn-ecosystem/docker-compose.yml`
3. `docker compose --env-file .env up -d --force-recreate hrm-be xbos-be`

## Probe results

| Run | Time | extension HTTP | code | workflowInstanceId | spawnPass |
|-----|------|----------------|------|-------------------|-----------|
| R1 (cold start) | 07:22:56 | 409 | SCOPE_CONTEXT_MISMATCH | null | FAIL |
| R2 | 07:23:49 | 201 | HRM-SET-209 | `c18c2e16-fcc5-4c3f-8037-1a2be6261068` | **PASS** |

R1 failure: containers still warming / transient 409 during parallel QA traffic. R2 confirms S2S auth fix live — no more **401 XBOS-AUTH-001**.

## Residual

- Probe `inboxSpawnPass: false` (before=0, after=0) — workflowInstanceId created but inbox count unchanged in 3s window. QA browser UF-09/15 must verify inbox UI + Duyệt chain.

## Next

- QA `P1-BROWSER-E2E-XBOS-WAVE-8088-R6-S2S`: UF-09/15 on `:8088`, inbox ≥1 → Duyệt → F5

**ack_status:** READY_FOR_QA
