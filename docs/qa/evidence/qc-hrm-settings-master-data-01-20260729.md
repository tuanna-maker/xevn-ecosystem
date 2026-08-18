# QC Gate Decision

## Verdict

**PASS**

## Reason

Settings master-data CRUD verified: POST/PATCH/DELETE on settings-catalogs/items with scope partition (main->holding) and UNIQUE constraints on (tenant_id,company_id,catalog_key,code) prevent orphan references; HOLD_DEPLOY honored, U65 zero-seed, C1/D5/P0-c/Profile satisfied.

---

## Evidence Summary

- **Module:** apps/api/hrm-api/src/settings-catalogs/settings-catalogs.service.ts
- **Master keys:** hrm-settings-master-keys.ts (14 catalog families)
- **Controller:** settings-catalogs.controller.ts — auth+scope on all routes
- **DDL:** migrations/hrm/0006_catalog_scope.sql + ensureExtensionSchema()
- **Prior QC gates:** qc-hrm-settings-md-jt-01-20260725.md (GWC), qc-hrm-settings-md-pos-01-20260727.md (GWC), qc-hrm-settings-md-leave-jt-01-20260725.md (GWC)
- **Pack:** verify:qc:evidence-pack exit 0 (8/8) on primary QA pack

## Classification

| Check | Status |
|-------|--------|
| CRUD POST/PATCH/DELETE | PASS |
| Picker list + search | PASS (AC-SET-FS-01..05) |
| Scope partition main->holding | PASS (D-HRM-SET-ITEM-PERSIST-01) |
| UNIQUE constraint (tenant,company,key,code) | PASS |
| XBOS-origin hard-delete blocked | PASS (soft-deactivate only) |
| Seed gated (HRM-CAT-POS-SEED-FORBIDDEN) | PASS |
| Empty catalog honest (no hardcode) | PASS |
| HOLD_DEPLOY | honored — no :8088 claim |
| U65 | strictly local-only values |
| C1/D5/P0-c/Profile | satisfied |
| Full Settings MD matrix | NOT promoted (out of scope) |
| Phase1/PROD | NOT claimed |
