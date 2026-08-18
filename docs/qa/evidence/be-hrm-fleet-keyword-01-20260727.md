# BE-HRM-FLEET-KEYWORD-01 — G-FL-02 keyword plate/name filter

| Field | Value |
|-------|--------|
| **work_item_id** | `BE-HRM-FLEET-KEYWORD-01` |
| **from_role** | `pm` |
| **to_role** | `dev-be` |
| **lane** | execution · close G-FL-02 (sponsor zero-residual) |
| **change_mode** | ADD · preserve_default |
| **date** | 2026-07-27 |
| **ack_status** | **READY_FOR_QA** |

---

## 1. spec_read_ack

| Plane | Path · ack |
|-------|------------|
| **srs** | khách `docs/client-delivery/hrm/SRS_HRM_KHACH.md` §3.49 **FR-HRM-FL-01** Diễn biến **#4** (tìm biển số / tên trong ĐV) · #1/#2/#3/#6/#8 giữ |
| **tech_spec** | `docs/hrm/TECHSPEC.md` §16.5 row 49 · envelope `HRM-FLEET-200` |
| **db_design** | `docs/hrm/DB_DESIGN_HRM_FLEET.md` · `hrm_fleet_vehicles` TEXT Plane B · soft name in `fleet_fields` |
| **api_design** | `docs/hrm/API_DESIGN_HRM_FLEET.md` §A F.1 · residual **G-FL-02** → **CLOSED** |
| **uc_ids** | FR-HRM-FL-01 / HRM-FL-01 |
| **sponsor_confirm** | PM DISPATCHED BE-HRM-FLEET-KEYWORD-01 2026-07-27 · U65 · HOLD_DEPLOY |
| **must_keep** | FL-01 GET list only · no public upsert · U65 empty OK · HOLD_DEPLOY · prior OA deepen |

---

## 2. Deliverables

| Artifact | Change |
|----------|--------|
| `fleet.service.ts` | `resolveFleetSearchTerm` · ILIKE `license_plate` + soft name keys in `fleet_fields` · `@CODE-MEMORY` |
| `fleet.controller.ts` | Query `keyword` / `q` → service · `@CODE-MEMORY-CHANGE` APPEND |
| `fleet.controller.spec.ts` | +2 tests forward keyword / prefer q |
| `fleet.service.spec.ts` | **ADD** · resolve term + SQL ILIKE asserts · empty no ILIKE |
| `docs/api/openapi/hrm-api.yaml` | version `1.3.4-fleet-keyword` · params `keyword`/`q` · F.1 #4 · **CLOSED G-FL-02** |
| `scripts/verify-openapi-hrm-p1-s3b.mjs` | version + #4 + CLOSED + keyword needles |
| `API_DESIGN_HRM_FLEET.md` | Nghiệp vụ #4 · Request map · residual **G-FL-02 CLOSED** |
| `DB_DESIGN_HRM_FLEET.md` | Gap G-FL-02 marked CLOSED |
| `TECHSPEC.md` §16.5 row 49 | query includes `keyword?`/`q?` · G-FL-02 CLOSED |

**forbidden honored:** no public upsert invent · no seed · no FE wipe · no Phase1/PROD claim · HOLD_DEPLOY.

---

## 3. Contract (runtime)

| Item | Behavior |
|------|----------|
| Params | `keyword?` · `q?` (prefer `q`; trim; max 100) |
| Match | `license_plate ILIKE` **OR** `fleet_fields` keys: `driver_name`, `manufacturer`, `model`, `route_name`, `name`, `vehicle_name` |
| Scope | Still `tenant_id` + `resolveHrmListScope` / `pushCompanyIdFilter` — keyword never bypasses ĐV |
| Empty | omit/blank keyword = full in-scope list; no match = `{ total:0, data:[] }` 200 honesty |
| Write | **unchanged** — no controller mutate |

---

## 4. Verification

| Command | Result |
|---------|--------|
| `pnpm --filter hrm-api exec jest --testPathPatterns="fleet.controller.spec\|fleet.service.spec" --no-coverage` | **PASS** · 2 suites · **8** tests · EXIT 0 |
| `pnpm run verify:openapi-hrm-p1-s3b` | **PASS** · **58** checks · EXIT 0 |

---

## 5. Residual (honest)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **G-FL-02** | P2 | — | **CLOSED** this WI |
| **G-FL-01** | Info | ba / fe optional | Detail get-by-id non-goal |
| **G-FL-UPSERT** | Info/P2 | future write FR | **must_keep** — no public HTTP |
| **G-FL-07** | P2 | fe+qa | Catalog-missing UX |
| **G-SCOPE-01** | P0 standing | on-touch | Rollup covered in controller spec |

**Non-claims:** Phase1/PROD · UF 🟢 via seed · public fleet write.

---

## 6. Handoff

### completion_report

**Closed:** G-FL-02 — optional `keyword`/`q` on `GET /api/hrm/fleet/vehicles` filters plate + soft name keys in `fleet_fields` within list scope; OpenAPI F.1 + verify needles; API_DESIGN/DB_DESIGN/TECHSPEC residual marked CLOSED; CODE-MEMORY APPEND; jest 8/8; verify 58 PASS; FL-01 list-only + U65 + no public upsert preserved; HOLD_DEPLOY.

**Residual:** G-FL-01 detail · G-FL-UPSERT · G-FL-07 catalog UX — out of this WI.

### next_owner

`qa`

### next_dispatch_prompt

```text
work_item_id: QA-HRM-FLEET-KEYWORD-01
from_role: pm
to_role: qa
lane: execution · contract + L1 list keyword (U65 zero-seed)
entry_criteria: BE-HRM-FLEET-KEYWORD-01 READY_FOR_QA · evidence docs/qa/evidence/be-hrm-fleet-keyword-01-20260727.md
read_first:
  - docs/hrm/API_DESIGN_HRM_FLEET.md §A (keyword/q · G-FL-02 CLOSED)
  - docs/api/openapi/hrm-api.yaml GET /fleet/vehicles parameters keyword|q
  - docs/qa/evidence/be-hrm-fleet-keyword-01-20260727.md
exit_criteria:
  1) OpenAPI has keyword|q + CLOSED G-FL-02 + FR-HRM-FL-01 #4
  2) verify:openapi-hrm-p1-s3b EXIT 0
  3) L1 (no seed): GET /api/hrm/fleet/vehicles without keyword → 200 HRM-FLEET-200 empty-or-list OK
  4) L1: GET …?keyword=<non-matching> → 200 total=0 data=[] (honest empty) · same scope headers
  5) Confirm no public POST/PUT fleet vehicles (must_keep FL-01)
  6) Matrix/API_DESIGN G-FL-02 CLOSED ack · evidence docs/qa/evidence/qa-hrm-fleet-keyword-01-20260727.md
cấm: seed fleet rows · invent upsert · Phase1/PROD · FE wipe
ack_status target: PASS_TO_PM or FAIL_TO_PM
```

### evidence_path

`docs/qa/evidence/be-hrm-fleet-keyword-01-20260727.md`

### ack_status

**READY_FOR_QA**
