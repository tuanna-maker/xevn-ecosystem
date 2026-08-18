# Evidence — W1-B-03-TC-CAT

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-03-TC-CAT` |
| **slice** | `docs/program/slices/DOC-ENT-P0-XBOS-CAT.md` |
| **executor** | Cursor `dev-be` |
| **date** | 2026-08-03 |
| **change_mode** | UPGRADE (preserve_default true) |
| **ack_status** | `READY_FOR_QA` |

## spec_read_ack

```markdown
## spec_read_ack
- srs: docs/brand-new-documents-20270801/SRS_NEW.md v1.1 §3.2 · FR-UC-B04 · Diễn biến #3–6
- tech_spec: docs/brand-new-documents-20270801/TECH_SPEC_NEW.md · TS-CAT catalog ownership XBOS→HRM
- db_design: docs/brand-new-documents-20270801/DB_DESIGN_NEW.md §3.7 config_catalogs/items · §3.8 synced_catalogs
- api_design: docs/brand-new-documents-20270801/API_CONTRACT_NEW.md §2.1–2.4
- os: projects/_vibe-team-os/28-FE-BE-SEPARATION-DISPLAY-READY.md · OS 25 SOLID BE boundary
- slice: docs/program/slices/DOC-ENT-P0-XBOS-CAT.md
- change_mode: UPGRADE
- sponsor_confirm: W1-B packet / Cursor owns coding after AUTH+EMP GWC
```

## solid_convention_ack

| Principle | Applied |
|-----------|---------|
| **S** | Display mapping in pure `catalog-sync-display.ts` / `withCatalogItemDisplay` — not in controller |
| **O** | ADD top-level view fields; keep `payload` for L1 settings-catalogs consumers |
| **D** | Service depends on pure mapper; FE binds response — no FE join XBOS+HRM |
| **FE–BE boundary (OS 28)** | Items expose `code`/`label`/`status_label`/`status_tone`; no invent L0 on HRM |
| **must_keep** | XBOS publisher SoT · checksum algorithm unchanged · no hard-delete platform · U65 no seed |

## Audit vs OS 28 (before → after)

| Surface | Before | After (UPGRADE) |
|---------|--------|-----------------|
| XBOS GET/publish/list items | `code`/`label`/`status` only | + `status_label` / `status_tone` (response-only; not in checksum) |
| HRM pull/list/get | envelope + opaque `payload` (FE dig `payload.items`) | + top-level `name`/`domain`/`items[]`/`item_count`/`published_version` |
| HRM `synced_catalogs.version` | local pull counter (`version+1`) | XBOS **publisher** version from payload (FR-UC-B04 khóa mang) |
| Miss / empty | honest 404 / empty items | unchanged (no invent) |

### R-CAT-PULL-ENVELOPE (closed in BE evidence)

| Operation | Success code | Message |
|-----------|--------------|---------|
| POST pull/:catalogKey | **`HRM-SYNC-200`** | Catalog pulled from XBOS |
| GET :catalogKey | `HRM-SYNC-201` | Synced catalog fetched |
| GET list | `HRM-SYNC-202` | Synced catalogs listed |
| GET status | `HRM-SYNC-203` | Catalog sync status fetched |

API_CONTRACT_NEW drift note («HRM-SET-201 / tương đương») → **confirmed live codes = `HRM-SYNC-20x`**. FE must bind these codes (not invent SET).

## Display-ready contract (FE bind)

### XBOS `POST …/publish` · `GET …/catalog/:key` · list

```json
{
  "items": [
    {
      "code": "CEO",
      "label": "Tổng giám đốc",
      "status": "active",
      "status_label": "Đang dùng",
      "status_tone": "success"
    }
  ]
}
```

### HRM `POST /catalog-sync/pull/:key` · `GET /catalog-sync/:key` · list row

```json
{
  "key": "job_titles",
  "name": "…",
  "domain": "…",
  "version": 7,
  "published_version": 7,
  "item_count": 1,
  "items": [
    {
      "code": "CEO",
      "label": "Tổng giám đốc",
      "status": "active",
      "status_label": "Đang dùng",
      "status_tone": "success",
      "origin": "xbos",
      "unit": null
    }
  ],
  "payload": { "…": "raw XBOS snapshot — must_keep for settings-catalogs merge" }
}
```

## Files touched

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/catalog-sync/catalog-sync-display.ts` | **NEW** mapper |
| `apps/api/hrm-api/src/catalog-sync/catalog-sync-display.spec.ts` | **NEW** jest |
| `apps/api/hrm-api/src/catalog-sync/catalog-sync.service.ts` | UPGRADE map + publisher version upsert · CODE-MEMORY APPEND |
| `apps/api/xbos-api/src/config-sync/config-sync.service.ts` | UPGRADE item display · CODE-MEMORY APPEND |
| `apps/api/xbos-api/src/config-sync/config-sync.service.spec.ts` | assert status_label on publish |
| `docs/qa/evidence/w1b-03-tc-cat.md` | this evidence |

**Not touched:** AUTH/EMP CLOSED paths · NEW docs pack · settings-catalogs picker (residual) · seed

## Jest

```text
pnpm --filter hrm-api exec jest src/catalog-sync/catalog-sync-display.spec.ts src/catalog-sync/catalog-sync.controller.spec.ts src/catalog-sync/p1-web-acceptance-be-sync401.spec.ts src/catalog-sync/p1-web-acceptance-xbos-sync-url.spec.ts --no-cache
→ Test Suites: 4 passed, 4 total
→ Tests:       21 passed, 21 total

pnpm --filter xbos-api exec jest src/config-sync/config-sync.service.spec.ts src/config-sync/config-sync.controller.spec.ts --no-cache
→ Test Suites: 2 passed, 2 total
→ Tests:       30 passed, 30 total

pnpm --filter hrm-api exec jest src/settings-catalogs/settings-catalogs.service.spec.ts --no-cache
→ Test Suites: 1 passed, 1 total
→ Tests:       7 passed, 7 total (regression)
```

## QA smoke plan (U65 — zero seed · FE-only)

1. L0: `pnpm run qc:dev-stack` exit 0
2. Login `ceo@xe.vn` / portal Settings catalog (XBOS)
3. Publish one allow-list key (e.g. `job_titles` or `departments`) → Network **`XBOS-CFG-203`** · response `items[].status_label`
4. Apply-to-members (optional if UI) → **`XBOS-CFG-204`**
5. HRM Settings → Pull catalog → Network **`HRM-SYNC-200`** · body has top-level `items[]` + `published_version` matching XBOS version
6. GET `/api/hrm/catalog-sync/{key}` → **`HRM-SYNC-201`** · same display-ready items
7. Picker consumer (Settings / YCTD / employee form) reads synced values — no mock platform; miss = empty/404 honest
8. F5 — synced data remains

**cấm:** `pnpm seed:*` · API fake inbox · claim UF 🟢 from probe alone

## Residual

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| R-CAT-PICKER-LABEL | P2 | `settings-catalogs` picker still returns `status` without `status_label` (out of slice B paths) — optional UPGRADE next | dev-be / FE bind catalog-sync items |
| R-CAT-ALLOWLIST | P1 defer | apply-to-members family allow-list vs control gap — SA prior OPEN | sa |
| R-CAT-BROWSER | P0 gate | U65 browser publish→pull→picker not run (BE-only) | qa |

## must_keep verified

- XBOS remains publisher SoT (HRM pull only)
- Checksum algorithm `sha256:items-canonical-v1` unchanged (display fields not hashed)
- `payload` retained on HRM sync response
- No hard-delete platform path added
- U65: no seed in this wave
- AUTH/EMP paths untouched
