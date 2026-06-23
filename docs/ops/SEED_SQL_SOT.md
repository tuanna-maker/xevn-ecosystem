# Seed SQL — source of truth (XBOS org foundation)

**Updated:** 2026-06-20 (REPO-HYGIENE-01-W4)

## Programmatic SoT (preferred)

| Artifact | Path | How to run |
|----------|------|------------|
| Seed script | `apps/api/xbos-api/scripts/seed-org-foundation.ts` | `cd apps/api/xbos-api && npm run seed:org` |
| Data JSON | `apps/api/xbos-api/data/org-seed-member-companies.json` | Edit then re-run `seed:org` |
| Excel path (optional) | env `SEED_EXCEL_PATH` + `--from-excel` | `npm run seed:org:excel` pipeline |
| Bootstrap chain | `scripts/bootstrap-xevn-xbos.mjs` | Calls `npm run seed:org` in xbos-api |

The TypeScript seed:

- Ensures schema (CREATE TABLE IF NOT EXISTS + legal-entity profile columns)
- Loads holding + member companies from JSON
- Is referenced by QA evidence, `PILOT_SCOPE_DATA_MATRIX.md`, and `docs/danh sách công ty và vai trò.md`

## Manual / DBeaver snapshot (secondary)

| Artifact | Path | When to use |
|----------|------|-------------|
| DBeaver SQL export | `apps/api/xbos-api/scripts/seed-org-foundation-dbeaver.sql` | Manual paste in DBeaver when Node/ts-node unavailable |

**Caveats:**

- Export is a **point-in-time snapshot** — may drift from `seed-org-foundation.ts` (e.g. fewer `xbos_legal_entity` columns, hardcoded INSERT blocks).
- Performs `DELETE FROM … WHERE tenant_id = 'xevn'` before insert — destructive for tenant `xevn`.
- Not invoked by `package.json` or CI.

**Rule:** After changing org structure, update JSON + re-run `seed:org`. Regenerate or retire the DBeaver file if manual path is still needed.

## Related seeds (other domains)

| Domain | Script | DB |
|--------|--------|-----|
| Ecosystem capability registry | `scripts/seed-ecosystem-capability-registry.mjs` | `xevn_xbos` |
| HRM tenant catalog | `pnpm seed:hrm:tenant-position-catalog` | `xevn_hrm` |
| Tourism portal users | `scripts/seed-tourism-portal-users.mjs` | requires org seed first |

## Evidence

TM review: `docs/qa/evidence/repo-hygiene-sql-w4-20260620.md`
