# UC-CC-P0-04 — Permission matrix round-trip

**Status:** Implemented (dev verification)

## Pass evidence

1. `GET /api/xbos/position-rbac/matrix?roleId=` returns `{ roleId, rows[] }`.
2. `PUT /api/xbos/position-rbac/matrix` upserts `xbos_cc_permission_matrix_cell`.
3. FE `patchPermissionMatrixRow` debounces to `savePermissionMatrix` (no `publishVersionChange`).

## Manual smoke

- Toggle view/write on row `pm-org-1` → reload page → values restored from API.

## Script

`node scripts/verify-capability-e2e.mjs --code BTN-CC-P0-PERM-MATRIX`
