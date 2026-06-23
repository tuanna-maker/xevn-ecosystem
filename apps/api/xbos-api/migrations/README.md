# XBOS SQL — reference migrations (not migrate-applied)

This folder holds **human-readable DDL reference** aligned with NestJS runtime bootstrap. It is **not** the source of truth for `schema_migrations`.

## Source of truth for versioned DDL

Apply migrations from the repo root:

```text
../../../../migrations/xbos/
```

Commands (from monorepo root):

```bash
pnpm run migrate:xbos:status
pnpm run migrate:xbos:apply:with-deploy-env
```

Implemented in `scripts/migrate-apply.mjs` → reads only `migrations/{hrm,xbos}/`.

## What this folder is for

| File | Runtime owner (actual DDL execution) |
|------|--------------------------------------|
| `20260515_meeting_foundation.sql` | `FoundationSchemaService` (stub comment; logic in TS) |
| `20260516_raci_governance.sql` | `FoundationSchemaService.ensureRaciGovernanceTables()` |
| `20260517_ecosystem_capability_registry.sql` | `scripts/seed-ecosystem-capability-registry.mjs` |
| `20260517_kpi_actuals_portal_alerts.sql` | `kpi-engine.service.ts`, `alerts.service.ts` |
| `20260518_legal_entity_profile.sql` | `FoundationSchemaService` (shareholders, documents, CC matrix) |

These files are **not duplicates** of `migrations/xbos/*.sql`. Do not delete without updating SRS/TechSpec traceability and confirming bootstrap removal.

## TM review

See `docs/qa/evidence/repo-hygiene-sql-w4-20260620.md` (REPO-HYGIENE-01-W4).
