# Evidence — W1-B-03-TC-CAT-XBOS-LABEL-01

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-03-TC-CAT-XBOS-LABEL-01` |
| **slice** | `docs/program/slices/DOC-ENT-P0-XBOS-CAT.md` |
| **entry** | QA FAIL `R-CAT-XBOS-STATUS-LABEL` · `docs/qa/evidence/w1b-03-tc-cat-qa.md` |
| **executor** | Cursor `dev-be` |
| **date** | 2026-08-03 |
| **change_mode** | FIX |
| **ack_status** | `READY_FOR_QA` |
| **u65** | zero-seed · no `pnpm seed:*` |
| **must_keep** | checksum algorithm unchanged · XBOS publisher SoT · AUTH/EMP untouched |
| **runtime** | `node dist/main.js` · `:28002` (not nest --watch) |

## spec_read_ack

```markdown
## spec_read_ack
- srs: docs/brand-new-documents-20270801/SRS_NEW.md v1.1 §3.2 · FR-UC-B04 · Diễn biến #3–4
- tech_spec: docs/brand-new-documents-20270801/TECH_SPEC_NEW.md · TS-CAT
- db_design: docs/brand-new-documents-20270801/DB_DESIGN_NEW.md §3.7 config_catalogs/items
- api_design: docs/brand-new-documents-20270801/API_CONTRACT_NEW.md §2.1–2.2
- os: _vibe-team-os/28-FE-BE-SEPARATION-DISPLAY-READY.md
- prior: docs/qa/evidence/w1b-03-tc-cat.md · W1-B-03-TC-CAT
```

## Root cause

| Layer | Finding |
|-------|---------|
| Source | `withCatalogItemDisplay` already on GET / list / publish response path |
| Build | `ConfigCatalog.items` typed as `ConfigCatalogItemDisplay[]` → bootstrap **TS2322** → `tsc` failed / **stale dist** without mapper |
| Runtime | Old `node dist/main.js` served items without `status_label` while HRM pull already enriched |

## Fix

1. Split domain vs API view:
   - `ConfigCatalog.items: ConfigCatalogItem[]` (checksum SoT)
   - `ConfigCatalogView.items: ConfigCatalogItemDisplay[]` (GET/list/publish response)
2. `toConfigCatalogItems()` strip display before apply→publish (checksum unchanged)
3. CODE-MEMORY APPEND `W1-B-03-TC-CAT-XBOS-LABEL-01`
4. Rebuild: `npx tsc -p tsconfig.build.json` EXIT **0** (`withCatalogItemDisplay` ×5 in dist)
5. Restart: `node dist/main.js` on `:28002`

## Code path

| Method | Mapper |
|--------|--------|
| `getCatalogForTarget` | `withCatalogItemDisplay(itemsRes.rows)` |
| `listCatalogsForTarget` | `withCatalogItemDisplay(row.items)` |
| `publishCatalog` | `withCatalogItemDisplay(validated.items)` (+ return via GET View) |

## Live snip (ceo JWT · holding) — re-proved after rebuild/restart

```json
{
  "work_item_id": "W1-B-03-TC-CAT-XBOS-LABEL-01",
  "httpStatus": 200,
  "code": "XBOS-CFG-201",
  "companyId": "holding",
  "version": 7,
  "checksum": "sha256:af60ffad5a89c85a3beb631de09069d5cdcbe3fda24dff3d115b56d44054a7c9",
  "itemCount": 4,
  "itemSample": {
    "code": "CEO",
    "label": "Tổng Giám đốc",
    "unit": null,
    "status": "active",
    "status_label": "Đang dùng",
    "status_tone": "success"
  },
  "has_status_label": true
}
```

Artifact: `docs/qa/evidence/_tmp-w1b-03-be-cat-status-label-snip.json`

### Probe

```text
POST /api/xbos/auth/login { ceo@xe.vn / Xevn@2026 }
GET  /api/xbos/config-sync/catalog/job_titles?target=hrm
     Authorization: Bearer <token>
     X-Tenant-ID: xevn
     X-Company-ID: holding
→ 200 XBOS-CFG-201 · items[0].status_label = "Đang dùng"
```

## Tests

| Check | Result |
|-------|--------|
| `tsc -p tsconfig.build.json` | EXIT **0** |
| Live GET `status_label` | **PASS** |
| `config-sync.service.spec.ts` | **13/13 PASS** |

## Files

- `apps/api/xbos-api/src/config-sync/config-sync.service.ts`
- `apps/api/xbos-api/dist/**` (rebuilt)

## cấm checklist

- [x] No seed
- [x] No AUTH/EMP touch
- [x] Checksum SoT unchanged (display fields not in digest)
- [x] No Phase1/UAT DONE claim

## completion_report

**Closed:** R-CAT-XBOS-STATUS-LABEL — type split unblocks dist; runtime serves GET items with `status_label`/`status_tone`; live snip `Đang dùng`; jest 13/13.

**Residual:** none for this WI (P2 picker / P1 allowlist out of scope).

**ack_status:** `READY_FOR_QA`

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: W1-B-03-TC-CAT-QA-R1
role: qa
priority: P0
entry: docs/qa/evidence/w1b-03-be-cat-status-label.md READY_FOR_QA
focus: AC1 retest — GET /api/xbos/config-sync/catalog/job_titles items[].status_label present (e.g. Đang dùng for active) + prior ACs 2–5 from w1b-03-tc-cat-qa.md still PASS
persona: ceo@xe.vn · U65 browser FE · zero-seed
exit: update matrix/evidence; PASS_TO_PM or FAIL with residual
cấm: seed · invent UF from jest alone · reopen AUTH/EMP
```
