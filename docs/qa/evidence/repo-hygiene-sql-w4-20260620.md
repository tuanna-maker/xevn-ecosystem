# REPO-HYGIENE-01-W4 — SQL consolidation (TM review)

**work_item_id:** `REPO-HYGIENE-01-W4`  
**Reviewer:** Technical Manager  
**Date:** 2026-06-20  
**Scope:** Review only — no SQL moves/deletes applied in this wave.

---

## Executive assessment

| Finding | Severity | Action |
|---------|----------|--------|
| `migrations/{hrm,xbos}/` is the **only** path used by `migrate-apply.mjs` / `migrate-status.mjs` | Info | Confirmed SoT — no change |
| `apps/api/xbos-api/migrations/*.sql` are **not byte-duplicates** of `migrations/xbos/` | Medium (drift risk) | Keep as reference; add README; do **not** delete |
| Wave B–E DDL lives in NestJS bootstrap (`FoundationSchemaService`, services) **and** reference SQL | Medium | Future dev-be: promote to numbered migrations; reduce runtime DDL |
| `repair-xbos-legacy-catalog-constraints.sql` overlaps `0002_catalog_scope.sql` but includes destructive dedup | High if mis-applied | **Manual-only** — do not promote without dev-be review |
| Seed: `seed-org-foundation.ts` is programmatic SoT; `seed-org-foundation-dbeaver.sql` is export snapshot | Low | Document in `docs/ops/SEED_SQL_SOT.md` |

**Verdict:** W4 exit criteria met for TM sign-off on **review + documentation**. No breaking SQL consolidation in this pass.

---

## 1. Migration SoT — `scripts/migrate-apply.mjs`

```69:69:scripts/migrate-apply.mjs
const migrationsDir = path.join(repoRoot, 'migrations', target);
```

| Target | Directory | Package scripts |
|--------|-----------|-----------------|
| HRM | `migrations/hrm/` | `migrate:hrm:apply`, `migrate:hrm:status` |
| XBOS | `migrations/xbos/` | `migrate:xbos:apply:with-deploy-env`, `migrate:xbos:status` |

`apps/api/xbos-api/migrations/` is **never read** by migrate tooling. HRM has no parallel folder under `apps/api/hrm-api/migrations/`.

**Local status (2026-06-20):** `pnpm run migrate:xbos:status` exit **0** — applied: `0001_init.sql`, `0002_catalog_scope.sql`, `0002_master_asset_registry_wave1.sql`. Pending on disk (not yet in `schema_migrations`): `0003_platform_audit_events.sql`, `0004_satellite_violation_events.sql`.

---

## 2. File inventory comparison

### `migrations/xbos/` (5 files — versioned, migrate-applied)

| File | Purpose |
|------|---------|
| `0001_init.sql` | Catalog tables (`config_catalogs`, `config_catalog_items`, audit) |
| `0002_catalog_scope.sql` | Tenant/company scope on catalogs + unique index |
| `0002_master_asset_registry_wave1.sql` | Asset registry wave 1 |
| `0003_platform_audit_events.sql` | `platform_audit_events` (NFR audit stream) |
| `0004_satellite_violation_events.sql` | `xbos_satellite_violations` (UC-XBOS-07) |

Note: two files share prefix `0002_` — lexicographic sort applies both after `0001`; acceptable but naming debt.

### `apps/api/xbos-api/migrations/` (5 files — reference, not migrate-applied)

| File | Lines (approx) | Duplicate of `migrations/xbos/`? | Runtime owner |
|------|----------------|-------------------------------------|---------------|
| `20260515_meeting_foundation.sql` | 3 (comment stub) | **No** | `FoundationSchemaService.ensureAll()` |
| `20260516_raci_governance.sql` | 91 | **No** — semantic mirror of TS | `FoundationSchemaService.ensureRaciGovernanceTables()` |
| `20260517_ecosystem_capability_registry.sql` | 24 | **No** | `scripts/seed-ecosystem-capability-registry.mjs` (CREATE TABLE inline) |
| `20260517_kpi_actuals_portal_alerts.sql` | 34 | **No** | `kpi-engine.service.ts`, `alerts.service.ts` |
| `20260518_legal_entity_profile.sql` | 53 | **No** | `FoundationSchemaService` (shareholder, document, CC matrix) |

### Overlap matrix

```
migrations/xbos/          apps/api/xbos-api/migrations/
─────────────────         ───────────────────────────────
0001_init.sql        ≠    (none)
0002_catalog_scope   ≈    (partial semantic overlap with scripts/dev/repair-xbos-legacy-catalog-constraints.sql only)
0002_master_asset    ≠    (none)
0003_platform_audit  ≠    (none)
0004_satellite       ≠    (none)
                     ≠    20260515..20260518 (orthogonal feature DDL)
```

**Conclusion:** These are **two parallel tracks**, not duplicate copies:

1. **Track A — Versioned migrations** (`migrations/xbos/`) for catalog, asset registry, audit, satellite events.
2. **Track B — Reference SQL + NestJS bootstrap** for org foundation, RACI, KPI, legal profile, capability registry.

Track B tables exist in production DB via `OnModuleInit` bootstrap, not via `schema_migrations` entries for the dated files.

---

## 3. References to `apps/api/xbos-api/migrations/` (grep)

| Path | Reference |
|------|-----------|
| `docs/xbos/RACI_GOVERNANCE_SRS.md` | `20260516_raci_governance.sql` |
| `docs/xbos/RACI_GOVERNANCE_TRACEABILITY.md` | same |
| `docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md` | `20260518_legal_entity_profile.sql` |
| `docs/xbos/TECHSPEC.md` | `20260515_meeting_foundation.sql` |
| `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` | folder listed as ER source |

**Do not delete** without updating governance docs and proving zero runtime dependency — files are cited as spec/traceability anchors even though migrate tooling ignores them.

---

## 4. `scripts/dev/repair-xbos-legacy-catalog-constraints.sql`

| Aspect | Assessment |
|--------|------------|
| Purpose | Repair pre-scope catalog DBs: add `tenant_id`/`company_id`, drop legacy UNIQUE on `catalog_key` alone, dedupe rows, recreate scoped indexes |
| Overlap with `0002_catalog_scope.sql` | Partial — migration adds columns + index; repair script adds **data normalization**, **DELETE dedup**, and **config_catalog_items** scope |
| Repo references | Only `REPO_HYGIENE_CLEANUP_PROGRAM.md` — no `package.json` hook |
| Prod safety | **Destructive** (`DELETE` ranked duplicates) — unsuitable as blind migration |

**TM classification:** **MANUAL-ONLY** — run by DBA/DevOps on legacy dev/VPS when catalog 409/unique violations occur. Header comment added in file.

**Optional future (dev-be, not W4):** If promoted, use new file `migrations/xbos/0005_repair_legacy_catalog.sql` only after:

- Idempotency review on prod-sized data
- Confirmation VPS prod already has scoped indexes (may be no-op)
- QA regression on catalog publish/pull

---

## 5. Seed SQL (summary — detail in `docs/ops/SEED_SQL_SOT.md`)

| Artifact | Role |
|----------|------|
| `apps/api/xbos-api/scripts/seed-org-foundation.ts` | **SoT** — `npm run seed:org` |
| `apps/api/xbos-api/data/org-seed-member-companies.json` | Data source for TS seed |
| `apps/api/xbos-api/scripts/seed-org-foundation-dbeaver.sql` | Manual DBeaver export — **not** kept in sync automatically |
| `scripts/bootstrap-xevn-xbos.mjs` | Orchestration calls `seed:org` |

---

## 6. Recommended actions (prioritized)

| # | Owner | Action | Gate |
|---|-------|--------|------|
| R1 | Done (W4) | `apps/api/xbos-api/migrations/README.md` — dual-track explanation + pointer to `migrations/xbos/` | — |
| R2 | Done (W4) | `docs/ops/SEED_SQL_SOT.md` | — |
| R3 | dev-be (backlog) | Apply pending `0003`, `0004` on dev/VPS via `pnpm migrate:xbos:apply:with-deploy-env` | QA L0 |
| R4 | dev-be + SA | Promote Track B DDL from `FoundationSchemaService` → `migrations/xbos/0005+`; deprecate runtime CREATE TABLE | ADR + regression |
| R5 | ba-docs | Update `TECHSPEC_HE_SINH_THAI_XEVN.md` §7 — single migration SoT path | Hygiene W5 |
| R6 | devops | Keep `repair-xbos-legacy-catalog-constraints.sql` manual; document in runbook if VPS needs it | On incident only |

---

## 7. Risk register

| Risk | Level | Mitigation |
|------|-------|------------|
| New env relies on API bootstrapping instead of migrations | Medium | R4 — consolidate DDL |
| Docs cite wrong migration path | Low | R5 doc update |
| Accidental repair script on prod | High | Manual-only label; no package.json entry |
| `0003`/`0004` not applied locally | Low | R3 — apply on next dev stack refresh |

---

## Handoff

- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/repo-hygiene-sql-w4-20260620.md`
- **pm_dispatch_hint:** `REPO-HYGIENE-BE-0003-0004` — dev-be apply pending xbos migrations 0003/0004 on dev stack; optional backlog `REPO-HYGIENE-BE-TRACK-B` for Track B DDL promotion (requires SA ADR, out of W4 scope).
