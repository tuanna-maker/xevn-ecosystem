# P1-EX-BE-HTTPS-CATALOG-SYNC-10 — Catalog sync status contract hardening

- **work_item_id:** `P1-EX-BE-HTTPS-CATALOG-SYNC-10`
- **from_role:** `pm`
- **to_role:** `dev-be`
- **date:** `2026-05-28`
- **input fail reference:** `docs/qa/evidence/p1-ex-qa-https-browser-01-r4-20260528.md`
- **ack_status:** `READY_FOR_QA`

## Change summary

Implemented a deterministic browser-handshake endpoint for HRM embed:

- Added static route `GET /api/hrm/catalog-sync/status` in `catalog-sync.controller`.
- Endpoint now returns **HTTP 200** with success envelope (`HRM-SYNC-203`) for valid auth/scope even when no catalogs were synced yet.
- Preserved existing semantics for `GET /api/hrm/catalog-sync/:catalogKey`:
  - missing catalog key record still returns `404` + `HRM-SYNC-002`.
  - no behavior change for pull/list endpoints and sync upstream failures.

## FE/QA contract note (explicit)

### Endpoint

`GET /api/hrm/catalog-sync/status`

### Authentication

Same as other `catalog-sync` routes:

- valid Bearer JWT scope (`tenantId` + `companyId`) **or**
- valid `x-internal-api-key`.

Unauthorized access remains `401` + `HRM-AUTH-001`.

### Success behavior (deterministic)

- **Status:** `200`
- **Code:** `HRM-SYNC-203`
- **Message:** `Catalog sync status fetched`
- **Data payload:**
  - `tenantId: string`
  - `companyId: string`
  - `key: "status"`
  - `source: "hrm"`
  - `status: "connected"`
  - `hasSyncedCatalogs: boolean`
  - `totalSyncedCatalogs: number`
  - `lastSyncedAt: string | null`

Notes for UI:

- `hasSyncedCatalogs=false` is **not an error state**; FE should keep handshake as connected and may show empty-data hint flow.
- This endpoint is now safe as a generic iframe readiness probe for `company_id=main`.

### Error behavior (backward-safe)

- `GET /api/hrm/catalog-sync/:catalogKey` with unsynced key still returns:
  - **status:** `404`
  - **code:** `HRM-SYNC-002`
  - **message:** `Catalog '<catalogKey>' not synced in HRM`
- Upstream fetch/retry/timeouts and scope format errors keep existing codes (`HRM-SYNC-001`, `HRM-SYNC-003`, etc.).

## Files changed

- `apps/api/hrm-api/src/catalog-sync/catalog-sync.controller.ts`
- `apps/api/hrm-api/src/catalog-sync/catalog-sync.service.ts`
- `apps/api/hrm-api/src/catalog-sync/catalog-sync.controller.spec.ts`

## Verification evidence

- Test command:
  - `pnpm --filter hrm-api test -- src/catalog-sync/catalog-sync.controller.spec.ts`
- Result:
  - `1` suite passed, `7` tests passed, `0` failed.
- Lint diagnostics:
  - No new linter issues on edited files.

## Completion contract

- **completion_report:** Closed deterministic handshake behavior for `/api/hrm/catalog-sync/status` with explicit 200 contract and test coverage; preserved legacy 404 behavior for unsynced concrete catalog keys. Residual: this work does not address the separate FE-side `J-HRM-02` profile rendering failure reported in QA R4.
- **next_owner:** `qa`
- **next_dispatch_prompt:** `Retest P1-EX-BE-HTTPS-CATALOG-SYNC-10 on HTTPS pilot: verify /api/hrm/catalog-sync/status returns 200 HRM-SYNC-203 across P-CC-03..08 with ceo@xe.vn companyId=main, confirm no regression for GET /api/hrm/catalog-sync/:catalogKey unsynced-key returning 404 HRM-SYNC-002, then update J-HRM-02 verdict separately.`
- **evidence_path:** `docs/qa/evidence/p1-ex-be-https-catalog-sync-10-20260528.md`
- **ack_status:** `READY_FOR_QA`
