# QA evidence — P1-XBOS-W9-ASSET-AUDIT (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-XBOS-W9-ASSET-AUDIT` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-06 |
| **environment** | `http://localhost:5173` ONLY · `ceo@xe.vn` / `Xevn@2026` · xbos-api `:28002` · hrm-api `:28001` |
| **journeys** | **J-XBOS-12** (asset request 5-step KT flow — wave plan; row not yet in `PROGRAM_JOURNEY_MAP.md`) |
| **policy** | **U34 consumer sync** — create/transition must update list + row state without F5 |

## Executive summary

| Area | Verdict | Notes |
|------|---------|-------|
| **L0** `qc:dev-stack` + `qc:fe-be-health` | **PASS** | exit **0** · 8/8 FE↔BE |
| **J-XBOS-12** Settings → Yêu cầu tài sản create → list → transition | **PASS** | U34 consumer sync **PASS** on create (9→10 rows) and transition (Nháp→Chờ KT duyệt) |
| **API round-trip** | **PASS** | POST 201 → GET list includes row → POST transition 201 → GET status updated |
| **Vitest** `assetRequestApi.test.ts` | **PASS** | 4/4 |
| **CC settings CRUD spot (list refresh)** | **PASS (GWC)** | No new P0/P1 missing refresh; transient AR error banner P3 |

**Mock audit:** `VITE_ALLOW_MOCK_FALLBACK=false` — asset rows from live `/api/xbos/asset-requests` (`XBOS-AST-200`).

---

## Environment traceability

| Service | Port | Health |
|---------|------|--------|
| web-portal | 5173 | HTTP 200 |
| hrm-api | 28001 | `GET /api/hrm` → 200 |
| xbos-api | 28002 | `GET /api/xbos` → 200 |

**Persona:** Group CEO JWT `tenantId=xevn`, `companyId=main`, hdr `x-company-id: main` on strict asset-requests path.

---

## Commands executed

| # | Command | Exit | Notes |
|---|---------|------|-------|
| 1 | `pnpm run qc:dev-stack` | **0** | L0 |
| 2 | `pnpm run qc:fe-be-health` | **0** | 8/8 PASS |
| 3 | `pnpm --filter web-portal exec vitest run src/integrations/assetRequestApi.test.ts` | **0** | 4/4 |
| 4 | Node API probe — create/list/transition | **0** | `QA-W9-AR-1780746457821` |
| 5 | Node portal proxy `GET /api/xbos/asset-requests` | **0** | 10 items incl. UI row |
| 6 | MCP browser/CDP — `?settings=asset_requests` create + transition | — | `QA-W9-UI-1780746488297` |

---

## J-XBOS-12 — Yêu cầu tài sản (KT 5 bước)

### Click path (browser — Settings rail)

| Step | Action | URL / target | Result |
|------|--------|--------------|--------|
| 1 | Login (session) | `/command-center?settings=asset_requests` | **PASS** — `ceo@xe.vn` |
| 2 | Settings → **Yêu cầu tài sản** | `settings=asset_requests` | **PASS** — panel *Yêu cầu tài sản (KT 5 bước)* · `companyId=main` |
| 3 | Baseline list count | table tbody | **PASS** — **9** rows before UI create |
| 4 | **Tạo yêu cầu** → fill Mã / Người yêu cầu → **Lưu yêu cầu** | `QA-W9-UI-1780746488297` · `QA W9 UI Audit` | **PASS** — `POST /api/xbos/asset-requests` (via portal proxy) |
| 5 | **U34 consumer sync — list without F5** | same route table | **PASS** — count **9→10**; new row visible immediately |
| 6 | **Transition step** (UI allows) | row action **→ Chờ KT duyệt** | **PASS** — status **Nháp → Chờ KT duyệt**; next action **→ KT đã xác nhận** (no F5) |

### API evidence (direct xbos-api + portal proxy)

| Call | HTTP | Code | Pass |
|------|-----:|------|:----:|
| `GET …/asset-requests` (before) | 200 | `XBOS-AST-200` | ✅ count **8** |
| `POST …/asset-requests` `{requestCode: QA-W9-AR-*}` | 201 | `XBOS-AST-201` | ✅ |
| `GET …/asset-requests` (after create) | 200 | `XBOS-AST-200` | ✅ count **9**, row found |
| `POST …/asset-requests/{id}/transition` `{status: pending_finance}` | 201 | `XBOS-AST-200` | ✅ `statusAfter: pending_finance` |
| Portal `GET /api/xbos/asset-requests` | 200 | `XBOS-AST-200` | ✅ count **10**; UI + API rows present |

**409 / 54321:** none on exercised asset-request paths.

### Console / network

- No **409** `companyId mismatches token scope` on asset-requests during audit.
- One session showed **ApiLoadBanner** *Không tải danh sách yêu cầu tài sản* while table already had live rows — **cleared on fresh navigation** (see **D-W9-AR-BANNER-01** P3).

---

## U34 consumer sync — CC settings spot check (list refresh after save)

| Settings panel | Pattern | Spot result |
|----------------|---------|-------------|
| **Yêu cầu tài sản** | `createAssetRequest` / `transitionAssetRequest` → `await reload()` | **PASS** — verified browser 9→10 + status cell update |
| **Hệ thống quy trình** | `setWorkflows` patch + return to list (W7 evidence) | **PASS** — 7 rows on spot load |
| **Đơn vị thành viên** | `reloadMemberAndLegalEntities()` after legal save | **PASS** (code + W1 retest) |
| **Phòng/Ban** | `deptTemplatesHook.reload()` after template save | **PASS** (W4 retest) |
| **Hạ tầng** | `setInfrastructureSites` + `saveInfrastructureSettingsToDb` | **PASS** (W2 retest) |
| **Văn bản / Đo / Giá** | Inline row state + debounced `saveCcCatalogRows` | **PASS** — edits visible in-table immediately (no separate list view) |

**Finding:** No **new** P0/P1 «save OK but list stale until F5» on exercised CC settings paths. Document inline edit automation via DOM `.value` remains flaky (React state) — not a product defect (same class as **D-W7-WF-FORM-AUTO-01**).

---

## Defect table

| ID | Severity | Summary | Owner | Blocks journey? |
|----|----------|---------|-------|-----------------|
| **D-W9-AR-BANNER-01** | **P3** | Transient `ApiLoadBanner` error on asset panel while live rows render; gone after clean `?settings=asset_requests` load | `dev-fe` | No — U34 list sync **PASS** |
| **SPEC-GAP-J-XBOS-12** | **P3** | `J-XBOS-12` referenced in `XBOS_CC_WAVE_EXECUTION_PLAN.md` but absent from `PROGRAM_JOURNEY_MAP.md` | `ba-process` / `pm` | No for this audit |

---

## Handoff

| Field | Value |
|-------|--------|
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/p1-xbos-w9-asset-audit-20260606.md` |

### completion_report

- **Closed:** **J-XBOS-12** asset request flow on localhost:5173 — create → immediate list row (**U34 PASS**), transition step updates status + next action (**U34 PASS**). API + portal proxy + vitest **PASS**. CC settings spot check found no new list-refresh P0/P1.
- **Open (residual):** **D-W9-AR-BANNER-01** (P3 transient banner), **SPEC-GAP-J-XBOS-12** (journey map row). Prior wave defects (W7 inbox drawer, W5 cat sync, etc.) unchanged.

### next_owner

`pm`

### next_dispatch_prompt

```
work_item_id: P1-XBOS-W9-QC-SLICE
from_role: pm
to_role: qc
lane: governance

QA W9 asset audit PASS_TO_PM — docs/qa/evidence/p1-xbos-w9-asset-audit-20260606.md. J-XBOS-12 PASS (U34 consumer sync on create + transition). Dispatch QC wave-close slice: confirm L0–L2 on settings=asset_requests, promote J-XBOS-12 in PROGRAM_JOURNEY_MAP.md (or BA add row first), accept D-W9-AR-BANNER-01 as P3 GWC or defer to dev-fe. Then PM unlock W10/matrix QC per XBOS_CC_WAVE_EXECUTION_PLAN.md.
```

### pm_dispatch_hint

- **qc** `P1-XBOS-W9-QC-SLICE` — promote J-XBOS-12 after spot read of this evidence
- **dev-fe** optional `P1-XBOS-W9-AR-BANNER-01` — clear `loadFailed` banner when subsequent `reload()` succeeds
- **ba-process** add **J-XBOS-12** row to `PROGRAM_JOURNEY_MAP.md`
