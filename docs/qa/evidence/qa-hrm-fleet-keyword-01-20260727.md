# QA-HRM-FLEET-KEYWORD-01 — Contract + L1 keyword honesty (G-FL-02)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-FLEET-KEYWORD-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution · contract + L1 list keyword (U65 zero-seed) |
| **date** | 2026-07-27 |
| **workspace** | `C:\xevn-ecosystem` |
| **entry** | `BE-HRM-FLEET-KEYWORD-01` READY_FOR_QA · `docs/qa/evidence/be-hrm-fleet-keyword-01-20260727.md` |
| **ack_status** | **PASS_TO_PM** |
| **U65** | honored — no `pnpm seed:*` · no invent fleet rows · no public upsert · no FE wipe |

---

## 1. Commands

| Command | Result |
|---------|--------|
| `pnpm run verify:openapi-hrm-p1-s3b` | **PASS** · **58** checks · **EXIT 0** |
| L0 `qc:dev-stack` (HRM+XBOS+portal) | HRM `:28001` **200** · XBOS **200** · portal `:5173` **200** (node UV assert noise after print; health lines OK) |
| L1 `GET /api/hrm/fleet/vehicles?limit=5` (internal key · `x-tenant-id` · `x-company-id=main`) | **PASS** · HTTP **200** · `code=HRM-FLEET-200` · `total=0` `data=[]` (empty-or-list OK) |
| L1 `GET …?keyword=ZZZ-NOMATCH-FLEET-KEYWORD-QA-20260727` | **PASS** · HTTP **200** · `HRM-FLEET-200` · `total=0` `data=[]` (honest empty) |
| L1 `GET …?q=` same non-match | **PASS** · same envelope honesty |
| L1 mutate probe `POST /api/hrm/fleet/vehicles` | **PASS must_keep** · HTTP **404** (no public create) |
| L1 mutate probe `PUT /api/hrm/fleet/vehicles/x` | **PASS must_keep** · HTTP **404** (no public update) |

**Scope headers (same for all GETs):** `x-internal-api-key` (from deploy `.env`, not logged) · `x-tenant-id` · `x-company-id=main`.

---

## 2. Exit criteria checklist

| # | Criteria | Verdict |
|---|----------|---------|
| 1 | OpenAPI has `keyword`\|`q` + **CLOSED G-FL-02** + FR-HRM-FL-01 **#4** | **PASS** · yaml `1.3.4-fleet-keyword` · params present · description cites CLOSED G-FL-02 + #4 |
| 2 | `pnpm run verify:openapi-hrm-p1-s3b` EXIT 0 | **PASS** · 58/58 |
| 3 | L1 without keyword → 200 `HRM-FLEET-200` empty-or-list OK | **PASS** · empty list |
| 4 | L1 non-matching `keyword` → 200 `total=0` `data=[]` same scope | **PASS** · also `q` alias |
| 5 | No public POST/PUT fleet vehicles (must_keep FL-01) | **PASS** · OpenAPI path **get-only**; runtime POST/PUT **404** |
| 6 | Evidence + PASS_TO_PM / FAIL | **PASS** (this file) |
| 7 | Append bus | **PASS** |

---

## 3. Contract audit (static)

### 3.1 OpenAPI `GET /fleet/vehicles` · `fleetListVehicles`

| Check | Evidence |
|-------|----------|
| Version | `1.3.4-fleet-keyword` |
| Params | `keyword` (maxLength 100) · `q` (alias, prefer when both) |
| F.1 #4 | description: «FR-HRM-FL-01 #4» + Diễn biến `#1/#2/#3/#4/#6/#8` |
| G-FL-02 | «Keyword filter = CLOSED G-FL-02 (BE-HRM-FLEET-KEYWORD-01)» |
| Methods | Path block has **`get:` only** — next path `/operations/tasks` (no `post`/`put`/`patch` under `/fleet/vehicles`) |
| Envelope | `code: HRM-FLEET-200` · `FleetVehicleList` · example `emptyHonest` |

### 3.2 API_DESIGN residual

| ID | File | Status confirmed |
|----|------|------------------|
| **G-FL-02** | `docs/hrm/API_DESIGN_HRM_FLEET.md` §A + residual table | **CLOSED** 2026-07-27 · cites BE-HRM-FLEET-KEYWORD-01 |

---

## 4. Classification

| Layer | Result |
|-------|--------|
| L0 stack | HRM healthy `:28001` |
| Contract / OpenAPI | **PASS** |
| L1 list + keyword honesty | **PASS** (U65 zero-seed) |
| L2 / L2.5 browser UF | **OUT of scope** this WI |
| Phase1 / PROD | **NOT claimed** |

**U65 note:** Baseline list already empty on this env — non-match cannot be differentiated from “no rows” without seeding vehicles. Gate requires honest empty for non-match (**observed**); populated-list filter differentiation deferred / not claimed (cấm seed).

---

## 5. Residual (honest — not blockers for this WI)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **G-FL-01** | Info | ba / fe optional | Detail get-by-id non-goal |
| **G-FL-UPSERT** | Info/P2 | future write FR | must_keep — no public HTTP (reconfirmed 404) |
| **G-FL-07** | P2 | fe+qa | Catalog-missing UX (PM already DISPATCHED `D-FE-HRM-FLEET-CATALOG-UX-01`) |
| **G-SCOPE-01** | P0 standing | on-touch | Rollup standing |

**Non-claims:** Phase1/PROD · UF 🟢 · seed fleet rows · public upsert · FE wipe · browser L2.5 fleet.

---

## 6. Handoff

### completion_report

**Closed:** `QA-HRM-FLEET-KEYWORD-01` — OpenAPI `keyword`/`q` + CLOSED G-FL-02 + FR-HRM-FL-01 #4 confirmed; `verify:openapi-hrm-p1-s3b` **58 PASS EXIT 0**; L1 GET without keyword → `HRM-FLEET-200` empty OK; L1 non-matching `keyword`/`q` → honest `total=0` `data=[]`; must_keep FL-01 — OpenAPI get-only + runtime POST/PUT **404**; API_DESIGN G-FL-02 CLOSED ack; U65 no seed.

**Residual:** G-FL-01 · G-FL-UPSERT · G-FL-07 (FE wave in flight) · G-SCOPE-01 standing — out of this WI.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QA-HRM-FLEET-KEYWORD-01
from_role: qa
to_role: pm
lane: governance intake
entry_criteria: QA-HRM-FLEET-KEYWORD-01 PASS_TO_PM · evidence docs/qa/evidence/qa-hrm-fleet-keyword-01-20260727.md
action:
  1) Mark G-FL-02 QA-verified CLOSED on bus / residual trackers
  2) Do NOT claim Phase1/PROD / UF browser fleet from this WI
  3) Continue parallel FE wave D-FE-HRM-FLEET-CATALOG-UX-01 (G-FL-07) when READY_FOR_QA → Task qa
  4) Optional later (not this WI): browser UF fleet keyword when FE search wired — still U65 zero-seed
ack_status target: INTAKE then next execution/governance dispatch
```

### evidence_path

`docs/qa/evidence/qa-hrm-fleet-keyword-01-20260727.md`

### ack_status

**PASS_TO_PM**

### pm_dispatch_hint

`G-FL-02` QA CLOSED · continue `D-FE-HRM-FLEET-CATALOG-UX-01` / G-FL-07 · no Phase1/PROD claim
