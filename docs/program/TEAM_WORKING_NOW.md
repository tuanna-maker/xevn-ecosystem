# TEAM_WORKING_NOW
_Last updated: 2026-08-18 10:15 (PM direct — S7 cluster CLOSED, XBOS banner fixed)_

## Status: S7 cluster CLOSED — ALL GREEN

| lane | WI | ack_status |
|---|---|---|
| BE | BA-CTR-TPL-8-CLAUSE-MAP-01-S7-BE-01 | PASS_TO_PM |
| FE | BA-CTR-TPL-8-CLAUSE-MAP-01-S7-FE-01 | READY_FOR_QA |
| QC | qc-s7-tenant-id-empty-01 | PASS_TO_PM |
| dev-be fix | BA-CTR-TPL-8-S7-BE-FIX-01 | READY_FOR_QA |
| **QA retest** | **qa-ba-ctr-tpl-8-clause-map-01-s7-fe-01-retest** | **PASS_TO_PM** |

- **QA retest** (`docs/qa/evidence/qa-ba-ctr-tpl-8-clause-map-01-s7-fe-01-retest.md`, 4728 B verified): browser QA on real FE `:8080` + curl on `:28001`. BUG-1 (UUID clause_id 400) and BUG-2 (PK collision multi-tenant) both **FIXED**. `tenant_id:"xevn"` id `200175ef-...` vs `tenant_id:"xe-du-lich"` id `9c17d6b9-...` — distinct rows. Empty `tenantId` now → `SCOPE_TENANT_REQUIRED` (no more `tenant_id:""`).
- Honest limitation recorded: `ContractClauseOverrideEditor` **write** path not exercised end-to-end in the retest (read path + curl PUT verified); no `tsc`/jest re-run this session.

### Fix timeline (2026-08-18)
1. QA #1 → FAIL_TO_PM: BUG-1 + BUG-2
2. PM decision: A) relax validation, B) UUID PK
3. dev-be → READY_FOR_QA: both bugs fixed, curl live pass
4. QA retest agent **died** (0-byte transcript, 0 files) → **PM recovered** the retest directly via browser + curl → PASS_TO_PM

### XBOS sync banner (separate, also closed)
- Root cause: `XbosApiSyncBanner.tsx` called `syncXbosCatalogs('xbos')` with **no tenantId** → BE `SCOPE_TENANT_REQUIRED` (400) → "Failed to fetch".
- Fix: `syncXbosCatalogs('xbos', { tenantId:'xevn', moduleId:'xevn' })`. Banner on `/hr/contracts` now reads **"Đã kết nối. Có 72 danh mục đã đồng bộ từ XBOS."**
- Agent a53f9cfcfdff2b8b2 (0-byte, wrote nothing) → killed; fix recovered by PM.

## Next (zero-residual)
- S7 done → read `docs/program/TEAM_CLAUDE_ROLLING_QUEUE.md` for next QUEUED item.
- **4 dead agents still outstanding** (all 0-byte transcripts, 0 files): a0be5814 JD dynamic BE, a4f73082 JD dynamic FE, a5fdadd0 QA retest (now superseded by PM retest), a0c00f7b promote-matrix BE. Needs re-dispatch or handoff.
- Sponsor asked to hand off to another Claude / antigravity — transfer prompt + consolidated memory package prepared on request.

## Environment (verified live)
- HRM BE: :28001 (PID 31252) · HRM FE: :8080 (PID 2480) · XBOS BE: :3002 (PID 32396) · XBOS FE: :5176 (PID 7900)

## Forbidden zones (Cursor-held)
- apps/web/hrm/src/components/payroll/policy-pack/**
- ContractCreateStep1GeneralGrid.tsx + ContractCbReadOnlyCard.tsx + ContractCreateWizardDialog.tsx
- apps/api/hrm-api/src/contracts-insurance/**
- apps/api/hrm-api/src/payroll/**
