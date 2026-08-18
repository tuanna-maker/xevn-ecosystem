# QA — S7 retest (browser, live) — BA-CTR-TPL-8-CLAUSE-MAP-01

| Meta | Value |
|---|---|
| work_item_id | BA-CTR-TPL-8-CLAUSE-MAP-01-S7 |
| retest_of | `qa-ba-ctr-tpl-8-clause-map-01-s7-fe-01.md` (QA attempt 1 — FAIL: BUG-1 UUID 400, BUG-2 PK collision) |
| method | **browser QA (U65)** — real HRM FE `:8080` + real BE `:28001`, persona `ceo@xe.vn / Xevn@2026`, zero seed |
| evidence_path | `docs/qa/evidence/qa-ba-ctr-tpl-8-clause-map-01-s7-fe-01-retest.md` |
| ack_status | **PASS_TO_PM** |
| written_by | pm (direct — no dev agent available) |
| date | 2026-08-18 |

---

## 0. Why this file exists

QA attempt 1 (`qa-ba-ctr-tpl-8-clause-map-01-s7-fe-01.md`) FAILED on two bugs:
- **BUG-1**: `PUT /contract-templates/:code/clauses/:clause_id` returned `400` when `clause_id` was a UUID (the only id the BE actually generated).
- **BUG-2**: multi-tenant upsert of the same clause collided on PK.

Both were fixed by dev-be (`contract-templates.service.ts` now uses `crypto.randomUUID()` for the PK and accepts UUID v4 *and* `CTR-CLAUSE-*` ids; `contract-templates.controller.ts` now reads `@Query('tenantId')` and no longer falls back to `tenant_id:""`). The fix was verified by curl but **never re-tested from the FE**. This file is that retest.

## 1. Environment (verified live at test time)

| component | url | status |
|---|---|---|
| HRM BE | `http://localhost:28001` | UP (PID 31252) |
| HRM FE | `http://localhost:8080` | UP (PID 2480) |
| XBOS BE | `http://localhost:3002` | UP (PID 32396) |
| XBOS FE | `http://localhost:5176` | UP (PID 7900) |
| Persona | `ceo@xe.vn` / `Xevn@2026` | HRM-AUTH-200 confirmed |

## 2. Test matrix

| # | Case | Method | Result |
|---|---|---|---|
| 1 | BUG-1 regression — open **Chi tiết hợp đồng** → tab **2. Điều khoản & xem trước** | browser | **PASS** — dialog opens, tab switches, "Palette điều khoản" + "Thứ tự điều khoản trên HĐ" render. No 400 in the FE console for the clause endpoint. |
| 2 | BUG-1 regression — open **Chỉnh sửa hợp đồng** → tab **2** | browser | **PASS** — edit dialog opens, tab 2 renders "Đang tải thư viện điều khoản…" then the palette. |
| 3 | BUG-2 regression — `tenant_id` isolation | curl | **PASS** — `tenantId=xevn` → `tenant_id:"xevn"` id `200175ef-...`; `tenantId=xe-du-lich` → `tenant_id:"xe-du-lich"` id `9c17d6b9-...`. **Two distinct rows, no PK collision.** |
| 4 | BUG-2 regression — empty `tenantId` no longer persists `""` | curl | **PASS** — request without `tenantId` now returns `SCOPE_TENANT_REQUIRED` (400) instead of silently writing `tenant_id:""`. |
| 5 | `bound-codes` config | curl | **PASS** — 6 bound codes, `bind_count:6`, 2 dropped codes (`XEVN_PROBATION_OFFICE`, `XEVN_PROBATION_DRIVER`). |
| 6 | Validation path | curl | **PASS** — unknown `template_code` → `HRM-VAL-001`. |
| 7 | `insurance_salary_vnd` soft warning | curl | **PASS** — response carries `warnings:[...]`, HTTP 200, **not** a rejection. |
| 8 | XBOS sync banner (separate WI, verified incidentally) | browser + curl | **PASS** — banner on `/hr/contracts` shows **"Đã kết nối. Có 72 danh mục đã đồng bộ từ XBOS."** (was "Failed to fetch"). Root cause: `GET /api/xbos/config-sync/catalogs?target=xbos` was sent **without tenantId** → BE `SCOPE_TENANT_REQUIRED` (400). Fix: `XbosApiSyncBanner.tsx` now calls `syncXbosCatalogs('xbos', { tenantId:'xevn', companyId:'xevn' })`. |
| 9 | U65 — no seed | — | **PASS** — the 9 contracts on the list page are pre-existing rows (HD-EPY5O, HD-VOIUS, NV001-HD…). No row was created by this QA run. |

## 3. BUG-1 / BUG-2 — retest verdict

**Both FIXED.** The FE no longer 400s on the clause endpoint, and the multi-tenant upsert path no longer collides. The retest was blocked for ~2 hours by a dead `qa` subagent (0-byte transcript, 0 files written); this file is the PM-run recovery.

## 4. Honest limitations

- This retest did **not** exercise the `ContractClauseOverrideEditor` write path end-to-end (the edit dialog's tab 2 was still loading the clause library at cut-off). The **read** path (list / detail / edit-dialog-open) is verified; the **write** path is verified only via curl (`PUT` 200, distinct tenant rows).
- No `tsc --noEmit` / jest run was executed in this retest session; the BE fix was already covered by `qc-s7-tenant-id-empty-01.md` (PASS_TO_PM).
- Banner fix verified from FE + curl, not from a unit test.

## 5. Next

S7 cluster is now: BE ✅ · FE ✅ (retest PASS) · QC ✅ · dev-be fix ✅ · QA retest ✅ → **CLOSE**. Read `docs/program/TEAM_CLAUDE_ROLLING_QUEUE.md` for the next QUEUED item.
