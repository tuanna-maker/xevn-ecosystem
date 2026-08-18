# Evidence — `PO-UC-TC-W4-BE-SYNC-XBOSS-500`

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-UC-TC-W4-BE-SYNC-XBOSS-500` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P0 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | FIX |
| **u65_zero_seed** | true |
| **UC** | XBOS-DM-HRM-10 · UC-HRM-06 |
| **prior** | [`po-uc-tc-w4-qa-e3-hrm-em-rollup.md`](po-uc-tc-w4-qa-e3-hrm-em-rollup.md) (FE sync **500**) |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| by-uc | `docs/qa/professional/by-uc/XBOS-DM-HRM-10.md` · `UC-HRM-06.md` |
| SRS/TechSpec | `docs/hrm/TECHSPEC.md` FR-HRM-06 / sync-from-xbos |
| DOMAIN | catalog SoT — **pull ≠ apply-to-members ≠ clone** |
| Code | `settings-catalogs.controller` `POST sync-from-xbos` → `syncAllFromXbos` → `CatalogSyncService` |

---

## Root cause

| Layer | Finding |
|-------|---------|
| Browser W4-E3 | `POST …/sync-from-xbos` → **500** with **undefined** `code` (~17s); follow-on GET catalogs also 500 |
| Nest log | Same window: hrm-api process **ended / restarted** mid bulk pull (`ended_at` ~02:44 while XBOS still serving `hrm-be` catalog GETs) |
| Product shape | Bulk pull was **sequential** (~32–41s for 74 keys). Long window + process restart → Vite proxy bare **500** (no Nest JSON) |
| Upstream class | When XBOS down, path already mapped `fetch failed` → **502** `HRM-SYNC-001`, but alias try-list **continued** on SYNC-001 and multiplied retries |

**Not** apply-to-members / clone. **Not** Leave L2.

Optional residual `du-lich.ceo` login 500 → same stack/JWT class as `PO-UC-TC-W4-STACK-JWT-PARITY` (ops/auth), not sync pull logic.

---

## Fix (preserve_default)

1. **`mapXbosUpstreamException`** — transport/timeout → `HRM-SYNC-001` **502** (never bare TypeError → 500).
2. **`pullCatalogFromXbos`** — **fail-fast** on `HRM-SYNC-001` (do not burn alias try-list).
3. **Safe JSON** + null-row after upsert → `ApiException` (not TypeError).
4. **`syncAllFromXbos`** — parallel batches (concurrency **8**); soft `HRM-SYNC-002` → `skippedKeys`; hard upstream → 502; wrap unexpected → `HRM-SYNC-001`.

### must_keep verified

| Invariant | Status |
|-----------|--------|
| ≠ apply-to-members | unchanged — no apply path touched |
| ≠ clone DM-09 / LOG-09 | unchanged |
| Leave L2 | untouched |
| main→holding via `resolveHrmSettingsCatalogCompanyId` | controller unchanged |

---

## Verification

| Check | Result |
|-------|--------|
| `jest` `catalog-sync-upstream.spec.ts` + `settings-catalogs.service.spec.ts` | **15/15 PASS** |
| `jest` `settings-catalogs.controller.spec.ts` | **32/32 PASS** |
| Live `ceo@xe.vn` `POST /api/hrm/settings-catalogs/sync-from-xbos` (`x-company-id: main`) | **201** `HRM-SET-201` · `pulledKeys=74` · `skippedKeys=0` · **~10s** (was ~35s) |
| Seed | **not** run |

### Sample (no secrets)

```text
POST /api/xbos/auth/login → 201
POST /api/hrm/settings-catalogs/sync-from-xbos
  Authorization: Bearer <ceo>
  x-tenant-id: xevn · x-company-id: main
→ 201 HRM-SET-201 { pulledKeys: 74, skippedKeys: 0 } ~10011ms
```

---

## Files

- `apps/api/hrm-api/src/catalog-sync/catalog-sync.service.ts`
- `apps/api/hrm-api/src/catalog-sync/catalog-sync-upstream.spec.ts` (ADD)
- `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.service.ts`
- `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.service.spec.ts`
- `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.controller.ts` (CODE-MEMORY only)

---

## Handoff

```
ack_status: READY_FOR_QA
work_item_id: PO-UC-TC-W4-BE-SYNC-XBOSS-500
evidence_path: docs/qa/evidence/po-uc-tc-w4-be-sync-xboss-500.md
next_owner: qa
```

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-BE-SYNC-XBOSS-500-QA
from_role: pm
to_role: qa
lane: execution
ack_status_target: PASS_TO_PM
priority: P0
u65_zero_seed: true

entry_criteria:
- BE READY_FOR_QA docs/qa/evidence/po-uc-tc-w4-be-sync-xboss-500.md
- L0: hrm :28001 + xbos :28002 + portal (load deploy/.env) healthy
- U65: no seed · no apply-to-members · no clone as PASS

exit_criteria (browser only):
- Persona ceo@xe.vn / Xevn@2026 → /hr/settings-catalogs?portal=1&companyId=main
- Click «Đồng bộ từ XBOS» → POST /api/hrm/settings-catalogs/sync-from-xbos → 2xx (201 HRM-SET-201)
- Toast / FE feedback shows pulled count; F5 GET settings-catalogs 200 still populated
- Network: 0 hits apply-to-members / clone / clone-bundle
- If XBOS intentionally down: expect 502 HRM-SYNC-001 (not bare 500 undefined code)
- Update by-uc XBOS-DM-HRM-10 + UC-HRM-06 execution stamp
- evidence_path: docs/qa/evidence/po-uc-tc-w4-be-sync-xboss-500-qa.md

cấm: seed · invent Leave L2 · confuse pull with apply/clone
```
