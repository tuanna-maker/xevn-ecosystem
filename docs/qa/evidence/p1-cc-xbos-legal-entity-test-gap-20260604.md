# XBOS legal-entity — test gap closure (2026-06-04)

| Field | Value |
|-------|--------|
| work_item_id | P1-CC-XBOS-LEGAL-TEST-01 |
| trigger | User save XE_DU_LICH → HTTP **502**; prior wave only mocked controller tests |

## Gap admitted

| Before | Issue |
|--------|--------|
| `org-foundation.controller.spec.ts` | Mocked `OrgFoundationService` — scope only, no DB upsert |
| `tmp-cc-legal-entity-crud-probe.mjs` | Only holding POST/PUT, **no member tenant headers** |
| Pilot sign-off | Probe L2 did not include CC save path |

## Added

| Artifact | Purpose |
|----------|---------|
| `org-foundation.service.spec.ts` | Real `upsertLegalEntity` with DB mock — partition `xe-du-lich` |
| Controller test | PUT `xe-du-lich` + `xe-tmdv` group CEO |
| `scripts/tmp-cc-legal-entity-member-save-probe.mjs` | All members PUT + reload (mirrors FE) |
| `pnpm run test:xbos:legal-entity` | Jest org-foundation slice |
| `pnpm run test:xbos:cc-member-save` | Live pilot gate |

## Commands run (2026-06-04)

```bash
pnpm run test:xbos:legal-entity
# 17/17 PASS (controller + service)

PORTAL_DEV_URL=https://14-225-217-232.nip.io pnpm run test:xbos:cc-member-save
# 4/4 member PUT PASS, reload PASS
```

## HTTP 502 vs 409

| Code | Meaning |
|------|---------|
| **409** | Scope — fixed by `resolveXbosGroupLegalMutationScopeContext` |
| **502** | Gateway — **xbos-be down/restarting** or proxy cannot reach Nest; not business validation |

## ack_status

PASS — pilot member save probe green after deploy; user should hard-refresh and retry save.
