# P1-DEPLOY-CAT-INBOX-ASSIGNEE-8088 — VPS hotfix evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-DEPLOY-CAT-INBOX-ASSIGNEE-8088` |
| **executed_at** | 2026-06-20 |
| **host** | `14.225.217.232:8088` |

## Root cause
Stale workflow graph assigned `ceo@xevn.vn`; UI inbox filters `ceo@xe.vn` → Hộp thư (0).

## Actions
1. pscp `catalog-governance.service.ts` (canonical `GROUP_APPROVER_USER`)
2. `docker compose up -d --force-recreate xbos-be`
3. SQL hotfix via `scripts/qa/vps-cat-inbox-assignee-hotfix.mjs`: **93 rows** updated

## Post-fix smoke
| assignee | inbox count |
|----------|-------------|
| `ceo@xe.vn` | **93** |
| `ceo@xevn.vn` | 0 |

**ack_status:** READY_FOR_QA (UF-09/15 R6 retest)
