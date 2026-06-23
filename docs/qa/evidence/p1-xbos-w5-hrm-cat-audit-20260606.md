# QA evidence — P1-XBOS-W5-HRM-CAT-AUDIT (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-XBOS-W5-HRM-CAT-AUDIT` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **ack_status** | **FAIL_TO_PM** |
| **executed_at** | 2026-06-06 |
| **environment** | `http://localhost:5173` ONLY · `ceo@xe.vn` / `Xevn@2026` · hrm-api `:28001` · xbos-api `:28002` |
| **matrix** | P-CC-09 (spot) · journeys **J-XBOS-08**, **J-XBOS-02** (spot) |
| **mental_model** | `docs/program/XBOS_CC_BUSINESS_MENTAL_MODEL.md` § J-XBOS-08, J-XBOS-02 |

## Executive summary

| Journey / area | Verdict | Notes |
|----------------|---------|-------|
| **L0** `qc:dev-stack` + `qc:fe-be-health` | **PASS** | exit **0** · 8/8 FE↔BE |
| **J-XBOS-08** Settings → Danh mục NS → sync HRM → HRM embed | **FAIL** | POST sync **201** but GET `effectiveItems` never shows field — **scope_parity** write `main` vs read `holding` |
| **J-XBOS-02** (spot) inbox load | **PASS** | UI + API **200** `XBOS-CAT-212` · empty inbox OK per P-CC-09 |
| **J-XBOS-02** (spot) approve flow | **GWC** | No pending tasks; dev seed **409** / UI *seed workflow failed* — approve not exercised |
| **J-XBOS-02** API catalog-sync pull | **PASS** | localhost repro of nip.io probe — POST pull **201** `HRM-SYNC-200` |

**Mock audit:** `VITE_ALLOW_MOCK_FALLBACK=false` (`apps/web/web-portal/.env.local`). Settings summary card shows **3 trường** (default scaffold) until **Cấu hình chi tiết** fetches live HRM (**37 trường**) — not silent mock on config path.

---

## Environment traceability

| Service | Port | Health |
|---------|------|--------|
| web-portal | 5173 | HTTP 200 |
| hrm-api | 28001 | `GET /api/hrm` → 200 |
| xbos-api | 28002 | `GET /api/xbos` → 200 |

**Persona:** Group CEO JWT `tenantId=xevn`, `companyId=main`. Catalog partition for overview/sync: **`holding`** (ADR-GROUP-CEO-MAIN-HOLDING-SCOPE).

---

## Commands executed

| # | Command | Exit | Notes |
|---|---------|------|-------|
| 1 | `pnpm run qc:dev-stack` | **0** | L0 |
| 2 | `pnpm run qc:fe-be-health` | **0** | 8/8 PASS |
| 3 | `PORTAL_DEV_URL=http://localhost:5173 node scripts/tmp-p1-s5-do-jxbos-02-deploy-probe.mjs` | **0** | J-XBOS-02 API slice |
| 4 | MCP browser — settings + HRM embed routes | — | See steps below |
| 5 | Node API probe — settings-catalogs sync + inbox | **1** | Confirms sync read-back FAIL |

---

## J-XBOS-08 — Danh mục hồ sơ nhân sự → sync HRM → HRM embed

### Click path (browser)

| Step | Action | URL / target | Result |
|------|--------|--------------|--------|
| 1 | Login | `/login` | **PASS** — `ceo@xe.vn` |
| 2 | Settings → Danh mục hồ sơ nhân sự | `/command-center?settings=company_group_hr` | **PASS** — scope bar Tập đoàn; summary lists default **3 trường** (GWC card vs live API) |
| 3 | **Cấu hình chi tiết** | modal `#group-hr-fields-config-title` | **PASS** — dialog opens; **37 trường** / 8 catalog groups from `GET /api/hrm/settings-catalogs` (live HRM, not mock fallback) |
| 4 | Configure field | draft `QA W5 HRM Cat Audit 20260606` · code `company_group_hr_profile__personal__qa_w5_hrm_cat_audit_20260606` | **PASS** UI draft (modal closed before **Thêm field** click completed — retried via API) |
| 5 | Sync HRM (**Xác nhận áp dụng** / `POST …/extension-items`) | `POST /api/hrm/settings-catalogs/hrm_employee_personal_fields/extension-items` + `x-catalog-write-mode: immediate` | **PARTIAL** — HTTP **201** `HRM-SET-202` `upserted:1` |
| 6 | Verify read-back | `GET /api/hrm/settings-catalogs` | **FAIL** — `qa_w5_hrm_cat_audit_20260606` / `qa_w5_direct` **not** in `hrmExtensionItems` nor `effectiveItems` for `hrm_employee_personal_fields` |
| 7 | HRM embed employee surface | `/command-center/hrm/employees` | **GWC** — route loads (nav + embed shell **200**); iframe field-level verify **not accessible** in MCP; blocked by step 6 anyway |

### API evidence (sync scope parity — root cause)

**Write path** (`appendExtension` controller): uses `resolveScopeContext` → persists with `company_id=**main**` (JWT claim).

**Read path** (`GET overview` controller): uses `resolveHrmSettingsCatalogCompanyId` → reads extensions from `company_id=**holding**` for group CEO on `xevn`.

Repro (direct hrm-api `:28001`, same JWT):

```text
POST /api/hrm/settings-catalogs/hrm_employee_personal_fields/extension-items
  → 201 HRM-SET-202 upserted:1
GET  /api/hrm/settings-catalogs
  → 200 HRM-SET-200 · personal hrmExtensionItems (10 rows) · no qa_w5_direct
```

Reference: `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.controller.ts` — `overview()` maps via `resolveHrmSettingsCatalogCompanyId`; `appendExtension()` does **not**.

### Console / network

- No **409** on settings-catalogs **GET** for `ceo@xe.vn` / `main`.
- No HRM API Sync ERROR banner on tested settings routes.
- Sync failure is **silent read-back gap**, not HTTP error on UI toast when using API probe.

---

## J-XBOS-02 (spot) — Duyệt danh mục HRM

### Click path (browser)

| Step | Action | Result |
|------|--------|--------|
| 1 | `/command-center?settings=hrm_catalog_governance` | **PASS** — panel renders |
| 2 | Inbox load on mount | **PASS** — **Hộp thư (0)** · *Không có tác vụ chờ duyệt.* · no ERROR banner |
| 3 | **Làm mới** | **PASS** — inbox remains stable empty |
| 4 | **Seed quy trình (dev)** | **FAIL** — UI toast *seed workflow failed* (409 class — see API) |
| 5 | Approve flow | **N/A (GWC)** — no pending task to approve |

### API (spot)

| Call | HTTP | Code | Pass |
|------|-----:|------|:----:|
| `GET /api/xbos/catalog-governance/inbox?assigneeUserId=ceo@xe.vn` | 200 | `XBOS-CAT-212` | ✅ |
| `POST /api/xbos/catalog-governance/workflows/seed-xe-du-lich-catalog` | 409 | `SCOPE_CONTEXT_MISMATCH` | ❌ (blocks dev approve seed) |
| `POST /api/hrm/catalog-sync/pull/contract_types?tenantId=xevn&companyId=holding` | 201 | `HRM-SYNC-200` | ✅ |

Prior nip.io J-XBOS-02 closure remains valid; **localhost API slice PASS** on 2026-06-06.

---

## Defect table

| ID | Severity | Summary | Owner | Blocks J-XBOS-08? |
|----|----------|---------|-------|-------------------|
| **D-W5-HRM-CAT-SYNC-01** | **P0** | `POST extension-items` writes `company_id=main`; `GET settings-catalogs` reads `holding` — sync appears success (**201**) but field never visible · tag **`scope_parity`** | `dev-be` | **YES** |
| **D-W5-HRM-CAT-LIST-01** | P2 | Summary card **3 trường** vs modal **37 trường** before opening config — confusing UX, not mock fallback | `dev-fe` | No |
| **D-W5-CAT-GOV-SEED-01** | P1 | Catalog governance dev seed **409** on localhost for group CEO — cannot seed approve demo data | `dev-be` | No (spot approve GWC) |

---

## Residual / not promoted

- **J-XBOS-08** — not promoted ✅ on journey map until D-W5-HRM-CAT-SYNC-01 closed + retest embed field visibility.
- **J-XBOS-02** — inbox spot **PASS**; full approve L2.5 still **GWC** without seeded workflow task.
- Phase 1 / PROD — unchanged.

---

## Handoff

- **completion_report:** W5 HRM catalog audit on localhost — L0/L1 PASS; J-XBOS-08 **FAIL** on sync read-back (**scope_parity** P0); J-XBOS-02 spot inbox **PASS**, approve seed **FAIL/GWC**; J-XBOS-02 API pull **PASS**.
- **next_owner:** `pm` → `dev-be`
- **next_dispatch_prompt:** Fix P1-XBOS-W5-HRM-CAT-AUDIT blocker **D-W5-HRM-CAT-SYNC-01**: in `settings-catalogs.controller.ts` `appendExtension()` (and related write paths), use `resolveHrmSettingsCatalogCompanyId(authorization, scope.tenantId, scope.companyId)` for `appendExtensionItems` partition — same as `GET overview()`. Add regression spec mirroring `hrm-list-scope.spec.ts` (main JWT → holding write+read). Optional: fix **D-W5-CAT-GOV-SEED-01** for group CEO localhost seed. Then QA retest J-XBOS-08 steps 5–7 + inbox approve if seeded.
- **evidence_path:** `docs/qa/evidence/p1-xbos-w5-hrm-cat-audit-20260606.md`
- **ack_status:** **FAIL_TO_PM**
- **pm_dispatch_hint:** `P1-XBOS-W5-HRM-CAT-BE-SYNC-01` — scope_parity settings-catalogs extension write partition
