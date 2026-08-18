# D-HDSD-MUTATE-BE-01 — HDSD mutate BE residuals (leave + insurance)

| Field | Value |
|-------|--------|
| **Date** | 2026-07-30 |
| **Role** | dev-be |
| **work_item_id** | `D-HDSD-MUTATE-BE-01` |
| **Program** | `P-HDSD-QA-SRS-01` |
| **Residuals** | R-HDSD-W2-02 (UF-HRM-09 leave POST 400) · R-HDSD-W2-03 (insurance transient 500) |
| **Env** | hrm-api `:28001` · xbos `:28002` · `ceo@xe.vn` / `Xevn@2026` |
| **Constraints** | U65 zero-seed · HOLD_DEPLOY · change_mode FIX |

---

## 1. Root cause

### R-HDSD-W2-02 — Leave `HRM-ATT-LEAVE-TYPE` 400

| Layer | Finding |
|-------|---------|
| **Symptom** | `POST /api/hrm/attendance/leave-requests` → **400** `HRM-ATT-LEAVE-TYPE` with `LVT_01` + holding UUID `company_id` |
| **Prior fix** | `D-HRM-LEAVE-REQ-CREATE-BE-01` (2026-07-27) — partition `resolveHrmSettingsCatalogCompanyId` + TEXT persist — **already in src + dist-uat-w6** |
| **Live repro (pre-fix wave)** | Settings `leave_types` **empty** (no L1 sync) → assert rejects same custom message as «code not in catalog» |
| **After manual pull** | `POST /api/hrm/catalog-sync/pull/leave_types?company_id=holding` → **201**; same leave body → **201** `HRM-LEAVE-201` |
| **Fix** | Lazy XBOS pull `leave_types` once when effective catalog empty **before** assert (parity FE Settings sync — not seed) |

### R-HDSD-W2-03 — Insurance transient 500

| Layer | Finding |
|-------|---------|
| **Symptom** | Tab BHXH load — intermittent **500**; console `chk_contract_date_range` constraint noise |
| **Cause** | `ensureSchema()` on every `listInsurance` **DROP + ADD** `chk_contract_date_range`; legacy rows with `start_date > end_date` make ADD fail → 500 |
| **Fix** | Single `DO $$` block: repair invalid ranges (`end_date := start_date`) then ADD constraint **only if missing** — no DROP per request |

---

## 2. Changes

| File | Change |
|------|--------|
| `apps/api/hrm-api/src/attendance/leave-requests.service.ts` | `ensureLeaveTypeCatalogAvailable()` + optional `CatalogSyncService`; lazy pull before assert |
| `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.ts` | Idempotent contract date-range constraint migration |
| `leave-requests.service.spec.ts` | Test lazy pull path |
| `contracts-insurance.service.spec.ts` | Test schema migration + mock guard for `DO $$` |

---

## 3. Verification

### jest

```bash
cd apps/api/hrm-api
pnpm exec jest leave-requests.service.spec.ts contracts-insurance.service.spec.ts --no-cache
# exit 0 — 45/45 PASS
```

### build

```bash
pnpm --filter hrm-api run build
# exit 0
```

### Live API (L1 — `:28001` running pre-restart dist)

| Probe | Before catalog pull | After pull / with catalog |
|-------|-------------------|---------------------------|
| `GET settings-catalogs/leave_types/items?company_id=main` | total **0** | total **4** (`LVT_01`…`LVT_04`) |
| `POST leave-requests` (`LVT_01`, holding UUID) | **400** `HRM-ATT-LEAVE-TYPE` | **201** `HRM-LEAVE-201` |
| `GET contracts-insurance/insurance?company_id=main` ×3 | **200** (transient 500 class addressed in code) | **200** |

**Note:** Restart hrm-api from fresh `dist/` (or update `dist-uat-w6` freeze) for lazy-pull + insurance schema fix on running `:28001`.

---

## 4. Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **evidence_path:** `docs/qa/evidence/d-hdsd-mutate-be-01-20260730.md`

### QA retest matrix

| TC | Account | Action | PASS when |
|----|---------|--------|-----------|
| TC-HDSD-08-02-01 / UF-HRM-09 | `ceo@xe.vn` | Attendance → Nghỉ phép → Tạo → `LVT_01` → Gửi | **POST 201** (no manual pull required after restart) · F5 list row |
| TC-HDSD-06-03-01 / UF-HRM-06 | `ceo@xe.vn` | HĐ → tab BHXH | Insurance APIs **200** stable · no `chk_contract_date_range` 500 in console |

### completion_report

**Closed:** Leave create path — lazy XBOS `leave_types` pull when L1 empty + existing partition/TEXT persist; insurance list — idempotent date-range constraint without per-request DROP. jest 45/45; build PASS.

**Open:** Restart `:28001` with new build for live lazy-pull; optional P1 FE slug `company_id` (not blocking).

### next_dispatch_prompt

```
work_item_id: QA-HDSD-MUTATE-RET-01
from_role: dev-be
to_role: qa
program: P-HDSD-QA-SRS-01
entry_criteria: hrm-api restarted from build including D-HDSD-MUTATE-BE-01; L0 :28001 200; ceo@xe.vn; U65 zero-seed
exit_criteria:
- TC-HDSD-08-02-01 UF-HRM-09: POST leave-requests 2xx LVT_01 + F5 persist (cold env without prior manual catalog pull)
- TC-HDSD-06-03-01: insurance tab Network all 200; no chk_contract_date_range 500
- evidence: docs/qa/evidence/qa-hdsd-mutate-ret-01-20260730.md
ack_status: PASS_TO_PM
read_first: docs/qa/evidence/d-hdsd-mutate-be-01-20260730.md · docs/qa/evidence/hdsd-uat-ch05-09-20260730.md §residual
cấm: seed · :8088 without sponsor
```
