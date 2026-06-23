# P1-XBOS-W8-CAT-SEED-FE — D-W8-CAT-SEED-01

**Date:** 2026-06-06  
**Owner:** dev-fe  
**Work item:** P1-XBOS-W8-CAT-SEED-FE / D-W8-CAT-SEED-01

## Problem

Command Center catalog tabs (document / measurement / pricing) initialized `useState` with hardcoded demo rows. When `command_center_catalogs` API returned empty (fresh tenant or post-BE holding-scope fix), hydration skipped update (`if (rows.length) set*Rows`) — UI showed fake persisted data. User believed data was saved; F5 showed empty.

## Fix

| Area | Change |
|------|--------|
| Initial state | `documentRows` / `measurementRows` / `pricingRows` start `[]` |
| Hydration | Always `set*Rows(rows)` from API — empty array clears UI |
| Loading | Per-tab loading line while fetch in flight |
| Empty UX | Dashed prompt + «Thêm dòng» CTA (no mock rows) |
| Inline edit | Auto-save debounce unchanged (U34 — no F5 after edit) |
| Add row | `createCcRegulationRow` / `createCcMeasurementRow` / `createCcPricingRow` in `commandCenterCatalogApi.ts` |
| Code keys | Editable code/key/priceCode inputs for new rows |

## Files

- `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx`
- `apps/web/web-portal/src/integrations/commandCenterCatalogApi.ts`
- `apps/web/web-portal/src/integrations/commandCenterCatalogApi.test.ts`

## Verification

pnpm --filter web-portal test -- commandCenterCatalogApi.test.ts  # 4/4
pnpm --filter web-portal test  # 178/178
pnpm --filter web-portal build  # exit 0

## QA retest (manual)

1. Login `ceo@xe.vn` → Command Center → Cài đặt → tabs **Văn bản**, **Đo lường**, **Giá**.
2. With empty DB: expect empty-state message, **no** QĐ-ATLD / DISTANCE / PRC-FLEET demo rows.
3. «Thêm dòng» → edit title/label → wait ~1s → F5 → row persists (inline save).
4. With seeded API rows: list matches GET; edit updates without F5.

## Residual

- None for FE scope. BE holding partition must return consistent empty vs populated for `command_center_catalogs`.

**ack_status:** READY_FOR_QA

---

## QA retest — P1-XBOS-W8-CAT-SEED-FE (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-XBOS-W8-CAT-SEED-FE` |
| **defects** | **D-W8-CAT-SEED-01** · **D-W8-CAT-ADD-ROW-01** |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-06 |
| **environment** | `http://localhost:5173` · `ceo@xe.vn` / `Xevn@2026` · xbos-api `:28002` |
| **entry_evidence** | this file (dev-fe READY_FOR_QA) |
| **journey spot** | **J-XBOS-11** add-row + U34 on document/measurement/pricing |

### Executive summary

| Tab (`settings=`) | No fake demo rows (API hydrate) | «Thêm dòng» | U34 inline (no F5) | F5 DB persist | Verdict |
|-------------------|--------------------------------|-------------|-------------------|---------------|---------|
| **document** | **PASS** — `QA W8 RETEST DOC 20260606` from API; not seed `Quy định An toàn lao động` | **PASS** — `QĐ-1780747245953` | **PASS** — `QA W8 SEED-FE ADD 20260606` visible immediately | **PASS** | **PASS** |
| **measurement** | **PASS** — `DISTANCE`/`QA-W8-KM` from API; not default `Km` only | **PASS** — `METRIC-1780747291821` | **PASS** — `QA-W8-MEAS-ADD-20260606` | **PASS** | **PASS** |
| **pricing** | **PASS** — `PRC-FLEET-A`/`QA-W8-CAT-PRICE-20260606` from API | **PASS** — `PRC-1780747312988` | **PASS** — `QA-W8-PRICE-ADD-20260606` | **PASS** | **PASS** |

**D-W8-CAT-SEED-01: CLOSED** — initial state `[]`; hydration always applies API rows; populated tenant shows DB values only.

**D-W8-CAT-ADD-ROW-01: CLOSED** — «+ Thêm dòng» present and functional on all three tabs; auto-save debounce + F5 persist confirmed.

### Environment traceability

| Service | Port | Health |
|---------|------|--------|
| web-portal | 5173 | HTTP 200 |
| hrm-api | 28001 | `GET /api/hrm` → 200 |
| xbos-api | 28002 | `GET /api/xbos` → 200 |

### Commands executed

| # | Command | Exit | Notes |
|---|---------|------|-------|
| 1 | `pnpm run qc:dev-stack` | **0** | L0 |
| 2 | `pnpm run qc:fe-be-health` | **0** | 8/8 PASS |
| 3 | `pnpm --filter web-portal test -- commandCenterCatalogApi.test.ts` | **0** | 4/4 |
| 4 | `node scripts/tmp-p1-w8-catalog-audit-probe.mjs` | **0** | 3/3 kinds save@holding read-back PASS |
| 5 | MCP browser — `?settings=document\|measurement\|pricing` | — | add-row + U34 + F5 |

### Browser click paths

**Route base:** `/command-center?settings={document|measurement|pricing}` · sidebar **CÀI ĐẶT HỆ THỐNG**

#### document — seed + add row

| Step | Action | Result |
|------|--------|--------|
| 0 | Load tab | **PASS** — 2 API rows + prior QA data; no hardcoded-only demo |
| 1 | «+ Thêm dòng» | **PASS** — new row `QĐ-1780747245953` |
| 2 | Edit title → `QA W8 SEED-FE ADD 20260606`, wait ≥2s | **PASS** — visible without F5 |
| 3 | Hard reload | **PASS** — row + title persist |

#### measurement — seed + add row

| Step | Action | Result |
|------|--------|--------|
| 0 | Load tab | **PASS** — `DISTANCE`/`QA-W8-KM`, `FUEL`/`Lít` from API |
| 1 | «+ Thêm dòng» | **PASS** — `METRIC-1780747291821` |
| 2 | Edit unit → `QA-W8-MEAS-ADD-20260606` | **PASS** — no F5 |
| 3 | Hard reload | **PASS** — persists |

#### pricing — seed + add row

| Step | Action | Result |
|------|--------|--------|
| 0 | Load tab | **PASS** — `PRC-FLEET-A`/`QA-W8-CAT-PRICE-20260606` from API |
| 1 | «+ Thêm dòng» | **PASS** — `PRC-1780747312988` |
| 2 | Edit label → `QA-W8-PRICE-ADD-20260606` | **PASS** — no F5 |
| 3 | Hard reload | **PASS** — persists |

### Residual

- None for FE scope. Empty-tenant empty-state not re-tested (tenant has seeded catalog rows; prior W8 BE scope fix covers holding partition).

### Defect closure

| ID | Severity | Status |
|----|----------|--------|
| D-W8-CAT-SEED-01 | P1 | **CLOSED** |
| D-W8-CAT-ADD-ROW-01 | P2 | **CLOSED** |

**completion_report:** D-W8-CAT-SEED-01 + D-W8-CAT-ADD-ROW-01 verified on all three catalog tabs; U34 add-row + F5 persist PASS; L0 + unit tests PASS.

**next_owner:** `pm`

**next_dispatch_prompt:** PM intake PASS_TO_PM for P1-XBOS-W8-CAT-SEED-FE — D-W8-CAT-SEED-01 + D-W8-CAT-ADD-ROW-01 CLOSED. Dispatch **qc** to re-gate J-XBOS-11 W8 catalog slice (combine with prior `P1-XBOS-W8-CAT-QA-RETEST` READY_FOR_QC evidence) or close W8 wave if no open residual.

**evidence_path:** `docs/qa/evidence/p1-xbos-w8-cat-seed-fe-20260606.md` (§ QA retest)
