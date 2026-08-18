# dev-be fix — BA-CTR-TPL-8-CLAUSE-MAP-01-S7-BE-FIX-01
date: 2026-08-18
ack_status: READY_FOR_QA

## Changes
- L40-48: assertClauseIdFormat — added UUID_V4_RE regex constant, now accepts UUID v4 AND CTR-CLAUSE-* prefix (OR logic)
- L142: PK = crypto.randomUUID() (replaced TCO-{templateCode}-{clauseId} composite key)

## Verify
- tsc: 0 errors in contract-templates module ✅ (272 pre-existing errors in attendance spec files, unrelated)
- BUG-1 curl (UUID clause_id → 200/404 not 400): PASS — returned 404 (row not found, no validation rejection)
- BUG-1 curl (CTR-CLAUSE-001 → 200/404 not 400): PASS — returned 404 (HRM-NF-001, not HRM-VAL-001)
- BUG-2 curl (2 tenant upsert same clause → both 200): PASS
  - tenant-aaa id: 025daebb-e4d7-47d3-8628-2ae9cd197a4e
  - tenant-bbb id: 03fb8c06-3d04-4385-8cd5-d0d144e841eb
  - Both returned HTTP 200 with distinct UUID PKs, no 500 conflict
- Server restart: already running in hot-reload / watch mode (server accepted new code without manual restart)

## Evidence
Tenant A response: {"success":true,"code":"HRM-CTR-TPL-200","data":{"item":{"id":"025daebb-e4d7-47d3-8628-2ae9cd197a4e","tenant_id":"tenant-aaa",...}}}
Tenant B response: {"success":true,"code":"HRM-CTR-TPL-200","data":{"item":{"id":"03fb8c06-3d04-4385-8cd5-d0d144e841eb","tenant_id":"tenant-bbb",...}}}
