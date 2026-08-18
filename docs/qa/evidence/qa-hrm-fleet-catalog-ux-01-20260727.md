# QA-HRM-FLEET-CATALOG-UX-01 — G-FL-07 FE catalog / empty UX (U65)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-FLEET-CATALOG-UX-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution · browser L2/L2.5 G-FL-07 · U65 zero-seed |
| **date** | 2026-07-27 |
| **workspace** | `C:\xevn-ecosystem` |
| **entry** | `D-FE-HRM-FLEET-CATALOG-UX-01` READY_FOR_QA · `docs/qa/evidence/d-fe-hrm-fleet-catalog-ux-01-20260727.md` |
| **ack_status** | **PASS_TO_PM** |
| **HOLD_DEPLOY** | yes |
| **U65** | honored — no `pnpm seed:*` · no invent fleet POST · no wipe U72 `labelMaps` |

---

## 1. Commands

| Command | Result |
|---------|--------|
| `pnpm --filter vite_react_shadcn_ts exec vitest run src/lib/fleetCatalogUx.test.ts src/lib/hrmEmbedPortalNav.test.ts` | **PASS** · 2 files · **7** tests · exit **0** |
| `pnpm --filter web-portal exec vitest run src/modules/hrm/registry.test.ts` | **PASS** · **5** tests (incl. fleet view map) · exit **0** |
| `node scripts/qa/_tmp-qa-hrm-fleet-catalog-ux-01.mjs` | **PASS** · exit **0** · runtime `docs/qa/evidence/_tmp-qa-hrm-fleet-catalog-ux-runtime.json` |
| Portal URL | `http://127.0.0.1:5173` (5175 free — used **5173**) · HRM Vite `:8080` · hrm-api `:28001` · xbos-api `:28002` |

---

## 2. Exit criteria checklist

| # | Criteria | Verdict |
|---|----------|---------|
| 1 | FE deliverables: list-only Fleet, empty OK, catalog-missing VI (no raw keys), no create CTA, no spinner storm; portal fleet wired | **PASS** · code + L2 |
| 2 | Re-run / cite vitest fleetCatalogUx + related | **PASS** · 7 + 5 |
| 3 | L2 browser portal + hrm: login → Hồ sơ xe — empty/catalog UX; GET fleet **200**; no invent seed | **PASS** · honest_empty then keyword_empty |
| 4 | Keyword UI uses `q` when present — honesty with empty OK | **PASS** · Network `?q=ZZZ-NOMATCH-…` **200** · `keyword_empty` |
| 5 | Do **not** claim G-FL-01 detail or G-FL-UPSERT; do **not** reopen G-FL-02 | **PASS** · OUT / CLOSED kept |
| 6 | Evidence → PASS_TO_PM or FAIL | **PASS** (this file) |
| 7 | Bus handoff + next_dispatch_prompt for QC | **PASS** |

---

## 3. FE deliverable audit (static)

| Artifact | Check | Verdict |
|----------|-------|---------|
| `apps/web/hrm/src/pages/Fleet.tsx` | List-only; search; empty card; catalog amber banner; **no** create CTA | **PASS** |
| `apps/web/hrm/src/lib/fleetCatalogUx.ts` | VI empty / keyword_empty / catalog_missing; status VI; no raw `hrm_fleet_*` in copy | **PASS** (unit + code) |
| `apps/web/hrm/src/hooks/useFleetVehicles.ts` | GET `q` debounce; `refetchOnWindowFocus: false`; staleTime 60s | **PASS** |
| Portal `registry` / `paths` / `HrmSidebar` | View `fleet` → `/fleet` · menu «Hồ sơ xe» | **PASS** (registry vitest + L2 sidebar) |
| FL-01 must_keep | No public create/upsert UI | **PASS** |

**Catalog-missing runtime note:** On this env catalogs settled with vehicle fields present → UI showed **honest_empty** (not banner). Catalog-missing copy / no-raw-key gate covered by **vitest** (`catalog_missing` body must not contain `hrm_fleet_`). U65: **no** seed to invent missing-catalog state.

---

## 4. L2 browser (U65)

| Step | Evidence |
|------|----------|
| Persona | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| Click path | Login (XBOS token inject) → `http://127.0.0.1:5173/command-center/hrm/fleet` → embed `…/hr/fleet?portal=1&tenantId=xevn&companyId=main` |
| Empty (#3) | `data-empty-kind=honest_empty` · title **«Chưa có hồ sơ xe»** · no create CTA · spinnerCount **0** |
| Keyword (#4) | Typed `ZZZ-NOMATCH-FLEET-UX-20260727` → empty **`keyword_empty`** · title **«Không tìm thấy xe khớp từ khóa»** |
| Network | `GET /api/hrm/fleet/vehicles?company_id=main&limit=500` → **200**; then `…&q=ZZZ-NOMATCH-FLEET-UX-20260727` → **200** |
| Mutate | No POST/PUT/PATCH/DELETE fleet vehicles observed |
| Raw keys | No `hrm_fleet_*` in visible body |
| Screenshot | `docs/qa/evidence/screenshots/qa-hrm-fleet-catalog-ux-01-20260727.png` |

### Runtime harness excerpt

```json
{
  "verdict": "PASS",
  "emptyKind": "honest_empty → keyword_empty",
  "networkFleetGet": 200,
  "qHit": "…/fleet/vehicles?company_id=main&q=ZZZ-NOMATCH-FLEET-UX-20260727&limit=500",
  "createCtaCount": 0,
  "rawKeyLeak": false,
  "spinnerCount": 0
}
```

Full: `docs/qa/evidence/_tmp-qa-hrm-fleet-catalog-ux-runtime.json`

---

## 5. L2.5 journey matrix

| Journey | Click path | Verdict | Notes |
|---------|------------|---------|-------|
| **J-HRM-FL-01** (provisional · FR-HRM-FL-01 #2/#3/#4) | CC HRM sidebar **Hồ sơ xe** → list empty VI → keyword search → Network `q` | **PASS** | List-only; **no** detail deep-link (G-FL-01 OUT) |
| Cross-nav embed | Portal `/command-center/hrm/fleet` → iframe `/hr/fleet` load stable | **PASS** | No 404/409 on list GET |

`PROGRAM_JOURNEY_MAP.md` has no named fleet J-* yet — provisional id logged for QC; BA may formalize later (**not** FAIL this WI).

### Read-only module matrix (FL-01)

| Module | C/R/U/D | Matrix note | Verdict |
|--------|---------|-------------|---------|
| Hồ sơ xe /fleet | **Read-only** list | Create/Update/Delete **OUT** (G-FL-UPSERT / FL-01) | **PASS** must_keep |
| Keyword filter | Read + `q` | G-FL-02 **CLOSED** — do not reopen | **PASS** |
| Catalog-missing UX | Display gate | G-FL-07 FE verified | **PASS** |

---

## 6. Spec trace

| Plane | Ack |
|-------|-----|
| SRS | `SRS_HRM_KHACH.md` §3.49 FR-HRM-FL-01 Diễn biến **#3** empty · **#4** keyword · **#7** catalog-missing · **#8** success |
| API_DESIGN | `docs/hrm/API_DESIGN_HRM_FLEET.md` §A · G-FL-07 FE CLOSED pending QA → **QA verified** this WI |
| G-FL-02 | **CLOSED** — cite `qa-hrm-fleet-keyword-01-20260727.md` + `qc-hrm-fleet-keyword-01` · **not reopened** |

---

## 7. Residual

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **G-FL-07** | P2 | `qc` | FE+QA CLOSED this WI — QC gate `QC-HRM-FLEET-CATALOG-UX-01` |
| **G-FL-01** | Info | ba / fe optional | Detail get-by-id **OUT** — not claimed |
| **G-FL-UPSERT** | Info/P2 | future write FR | **must_keep** — no invent public create |
| **G-FL-02** | — | — | **CLOSED** — do not reopen |
| **G-SCOPE-01** | P0 standing | on-touch | Scope parity standing |
| Catalog-missing live banner | Info | env | Not observed (catalogs present); unit-tested |

**Non-claims:** Phase1 / PROD / `:8088` · UF mutate fleet · seed fleet · G-FL-01 detail · reopen G-FL-02.

---

## 8. Handoff

### completion_report

**Closed:** `QA-HRM-FLEET-CATALOG-UX-01` — G-FL-07 FE catalog/empty UX verified: vitest **7+5 PASS**; L2 browser `:5173` `ceo@xe.vn` → Hồ sơ xe list-only; honest empty VI; keyword → Network `q` **200** + `keyword_empty`; no create CTA; no raw keys; no spinner storm; no fleet mutate; portal fleet wired; U65 zero-seed; G-FL-02 not reopened; G-FL-01/UPSERT not claimed.

**Residual:** QC gate for G-FL-07 · G-FL-01 · G-FL-UPSERT · G-SCOPE-01 standing · HOLD_DEPLOY.

### next_owner

`qc`

### next_dispatch_prompt

```text
work_item_id: QC-HRM-FLEET-CATALOG-UX-01
from_role: pm
to_role: qc
lane: governance · G-FL-07 FE catalog/empty UX gate · HOLD_DEPLOY
entry_criteria: QA-HRM-FLEET-CATALOG-UX-01 PASS_TO_PM · evidence docs/qa/evidence/qa-hrm-fleet-catalog-ux-01-20260727.md
read_first:
  - docs/qa/evidence/qa-hrm-fleet-catalog-ux-01-20260727.md
  - docs/qa/evidence/d-fe-hrm-fleet-catalog-ux-01-20260727.md
  - docs/hrm/API_DESIGN_HRM_FLEET.md §A · G-FL-07
  - docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.49 FR-HRM-FL-01 #3/#4/#7/#8
exit_criteria:
  1) Audit QA commands + L2 runtime + screenshot — confirm list-only / empty VI / q Network / no create CTA / no raw keys
  2) pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-fleet-catalog-ux-01-20260727.md → 8/8
  3) Mark G-FL-07 QC CLOSED or NO-GO with residual owner
  4) Do NOT reopen G-FL-02; do NOT claim G-FL-01 detail or G-FL-UPSERT; HOLD_DEPLOY; NOT Phase1/PROD/:8088
  5) Evidence docs/qa/evidence/qc-hrm-fleet-catalog-ux-01-20260727.md → PASS_TO_PM
cấm: seed fleet · invent upsert · Phase1/PROD claim
ack_status target: PASS_TO_PM (GO WITH CONDITIONS expected)
```

### evidence_path

`docs/qa/evidence/qa-hrm-fleet-catalog-ux-01-20260727.md`

### ack_status

**PASS_TO_PM**

### pm_dispatch_hint

`G-FL-07` QA CLOSED · dispatch `QC-HRM-FLEET-CATALOG-UX-01` · HOLD_DEPLOY · do not reopen G-FL-02 · no Phase1/PROD
