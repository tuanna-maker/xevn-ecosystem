# P1-S1-BE-04 — Audit emit + satellite alerts (UC-XBOS-06/07)

| Field | Value |
|-------|--------|
| **work_item_id** | P1-S1-BE-04 |
| **date** | 2026-05-23 |
| **owner** | Dev-BE |
| **ADR** | `docs/decisions/ADR-XBOS-M01-OPENAPI-BOUNDARIES.md` (audit emit only S1) |
| **BA** | `docs/xbos/S1_BA_PROCESS_XBOS_UC03-07.md` (AC-S1-06-01, AC-S1-07-01) |

## Scope delivered

| UC | S1 behavior | Route / hook | Code |
|----|-------------|--------------|------|
| UC-XBOS-06 | Emit on catalog publish (no `GET /audit` per ADR) | `config-sync` publish → `PlatformAuditService.emit` | `config_catalog.publish` |
| UC-XBOS-07 | Satellite violation ingest + dedupe | `POST /alerts/violation-ingest` | `XBOS-ALERT-202` |

### SRS → runtime code mapping (UC-07)

| SRS | Runtime | HTTP |
|-----|---------|------|
| `XBOS-ERR-VALIDATION` | `XBOS-ALERT-001` | 400 |
| `XBOS-ERR-MODULE-INVALID` | `XBOS-ALERT-002` | 400 |
| `XBOS-ERR-DATETIME-INVALID` | `XBOS-ALERT-003` | 400 |
| `XBOS-OK-ALERT-INGEST` | `XBOS-ALERT-202` | 200 (accepted body; SRS lists 202) |

### UC-07 behavior

- Internal auth (`Authorization` or `x-internal-api-key`).
- `resolveTenantOnlyContext` on `tenantId`.
- Persist `xbos_satellite_violations` with `(tenant_id, correlation_id)` dedupe.
- `high`/`critical` → optional `xbos_portal_alerts` row for CC rail.
- Platform audit `satellite.violation.ingest` on new events only.

## Files touched

- `apps/api/xbos-api/src/alerts/*` (controller, service, DTO, constants, specs)
- `apps/api/xbos-api/src/platform/platform-audit.service.spec.ts`
- `apps/api/xbos-api/src/config-sync/config-sync.service.ts` (+ spec)
- `apps/api/xbos-api/src/app.module.ts`
- `migrations/xbos/0004_satellite_violation_events.sql`
- `docs/api/openapi/xbos-api.yaml` (`alertsViolationIngest`)
- `scripts/verify-openapi-m01.mjs`

## Verification

```text
cd apps/api/xbos-api
pnpm test   → 22 suites, 91 tests PASS
pnpm build  → PASS

repo root:
node scripts/verify-openapi-m01.mjs → PASS
```

### QA smoke (manual / UAT)

| ID | Steps | Pass when |
|----|-------|-----------|
| ALERT-01 | `POST /api/xbos/alerts/violation-ingest` with internal key + BRD sample payload | 200 `XBOS-ALERT-202`, `duplicate: false` |
| ALERT-02 | Repeat same `correlationId` | 200, `duplicate: true`, same `eventId` |
| ALERT-03 | `moduleCode=UNKNOWN` | 400 `XBOS-ALERT-002` |
| AUDIT-01 | Publish catalog via `config-sync` | Row in `platform_audit_events` action `config_catalog.publish` |

## Handoff

- **to_role:** qa, pm
- **ack_status:** READY_FOR_QA
- **hrm-api:** not touched (no jest run required)
