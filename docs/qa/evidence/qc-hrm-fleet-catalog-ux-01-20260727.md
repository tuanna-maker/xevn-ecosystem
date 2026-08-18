# QC Gate — QC-HRM-FLEET-CATALOG-UX-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-FLEET-CATALOG-UX-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance · **G-FL-07** FE catalog/empty UX gate |
| **date** | `2026-07-27` (ICT) |
| **decision** | **GO WITH CONDITIONS** — **G-FL-07 CLOSED** (FE list-only + empty/catalog UX + L2 browser + vitest) |
| **scope_claim** | G-FL-07 FE catalog/empty UX only · FR-HRM-FL-01 #3/#4/#7/#8 display gate |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY · NOT `:8088` |
| **deploy** | **HOLD_DEPLOY** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed honored — no seed · no invent upsert · no reopen G-FL-02 |

---

## Scope (bounded — FE UX GO)

| In scope | Explicitly out (cấm) |
|----------|----------------------|
| Audit QA L2 + vitest for **G-FL-07** | Phase 1 DONE / PROD / `:8088` |
| List-only Hồ sơ xe · empty VI · keyword_empty · no create CTA · no raw keys | Reopen **G-FL-02** without FAIL |
| Catalog-missing copy unit-tested (env catalogs present → honest_empty live OK) | Claim **G-FL-01** detail get-by-id |
| Portal fleet wire + J-HRM-FL-01 provisional L2.5 | Invent **G-FL-UPSERT** / public create |
| HOLD_DEPLOY | Promote UF mutate fleet 🟢 |

**Spec SoT:** `docs/hrm/API_DESIGN_HRM_FLEET.md` §A · G-FL-07 · FR-HRM-FL-01 Diễn biến #3/#4/#7/#8 · `D-FE` + `QA-HRM-FLEET-CATALOG-UX-01`.

**Prior CLOSED (do not reopen):** `QC-HRM-FLEET-KEYWORD-01` · **G-FL-02** — `docs/qa/evidence/qc-hrm-fleet-keyword-01-20260727.md`.

---

## Micro-checklist (exit_criteria)

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Audit L2 + vitest; `verify:qc:evidence-pack` QA **8/8** | **PASS** — §Spot |
| 2 | Formal GWC: **G-FL-07 CLOSED** | **PASS** — this decision |
| 3 | Do not reopen G-FL-02; do not claim G-FL-01 / G-FL-UPSERT | **PASS** — §Residual |
| 4 | HOLD_DEPLOY · NOT Phase1/PROD/:8088 | **PASS** |
| 5 | Evidence this path → PASS_TO_PM | **PASS** |
| 6 | Append bus handoff | **PASS** (same session) |

---

## Evidence chain audited

| Artifact | Gap / role | Verdict | Closed |
|----------|------------|---------|--------|
| `docs/qa/evidence/d-fe-hrm-fleet-catalog-ux-01-20260727.md` | FE G-FL-07 deliverables | **READY_FOR_QA** | fleetCatalogUx + Fleet.tsx + portal wire · vitest 7+5 |
| `docs/qa/evidence/qa-hrm-fleet-catalog-ux-01-20260727.md` | L2 browser + vitest | **PASS** · PASS_TO_PM | honest_empty → keyword_empty · q Network 200 · no CTA |
| `docs/qa/evidence/_tmp-qa-hrm-fleet-catalog-ux-runtime.json` | Harness runtime | **PASS** | createCtaCount 0 · rawKeyLeak false · spinnerCount 0 |
| `docs/qa/evidence/screenshots/qa-hrm-fleet-catalog-ux-01-20260727.png` | Visual | **PASS** | keyword_empty VI · list-only subtitle |
| `docs/hrm/API_DESIGN_HRM_FLEET.md` §A / residual | G-FL-07 | **CLOSED** QC this WI | FE empty/catalog · no invent create |
| `docs/qa/evidence/qc-hrm-fleet-keyword-01-20260727.md` | G-FL-02 | **CLOSED** kept | **not reopened** |

**must_keep:** FL-01 list-only · U65 empty OK · no public create · HOLD_DEPLOY · G-FL-02 CLOSED.

---

## Spot verify (QC)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-fleet-catalog-ux-01-20260727.md` | **PASS** exit **0** — **8/8** | PROCESS |
| `pnpm --filter vite_react_shadcn_ts exec vitest run src/lib/fleetCatalogUx.test.ts src/lib/hrmEmbedPortalNav.test.ts` | **PASS** exit **0** — **7** tests (QC re-run) | PRODUCT |
| QA cite: `pnpm --filter web-portal exec vitest run src/modules/hrm/registry.test.ts` | **PASS** · **5** tests (accepted cite) | PRODUCT |
| QA cite: `node scripts/qa/_tmp-qa-hrm-fleet-catalog-ux-01.mjs` | **PASS** · runtime JSON verdict PASS | PRODUCT |
| Portal URL | `http://127.0.0.1:5173` (QA; 5175 free) · embed `/hr/fleet` | ENV note — port OK |
| Screenshot spot | keyword `ZZZ-NOMATCH-…` · title «Không tìm thấy xe khớp từ khóa» · no create CTA | PRODUCT |

### L2 / FE UX spot (independent audit of QA pack)

| AC | Observation | Verdict |
|----|-------------|---------|
| List-only | Subtitle «chỉ xem (không tạo mới…)» · `createCtaCount: 0` | **PASS** |
| Empty (#3) | `honest_empty` · «Chưa có hồ sơ xe» | **PASS** |
| Keyword (#4) | Network `?q=ZZZ-NOMATCH-…` **200** · `keyword_empty` | **PASS** (G-FL-02 not reopened — consume only) |
| Catalog-missing (#7) | Live banner not observed (catalogs present) · vitest `catalog_missing` no raw `hrm_fleet_` in copy | **PASS** unit + honest ENV |
| No raw keys | `rawKeyLeak: false` · screenshot body clean | **PASS** |
| No spinner storm | `spinnerCount: 0` | **PASS** |
| No mutate | `mutateHits: []` · no POST/PUT/PATCH/DELETE | **PASS** FL-01 |
| Portal wire | Sidebar «Hồ sơ xe» · CC `/command-center/hrm/fleet` | **PASS** |

### Read-only module matrix (FL-01)

| Module / AC | Create | Read | Update | Delete | Note |
|-------------|--------|------|--------|--------|------|
| Hồ sơ xe `/fleet` list | **OUT** must_keep | **PASS** L2 | **OUT** | **OUT** | G-FL-07 CLOSED |
| Empty / keyword_empty UX | — | **PASS** | — | — | #3/#4 |
| Catalog-missing copy | — | **PASS** unit | — | — | #7 · live N/A env |
| G-FL-02 keyword `q` | — | **CLOSED** prior | — | — | do not reopen |
| G-FL-01 get-by-id | — | **OUT** | — | — | not claimed |
| G-FL-UPSERT public write | **OUT** | — | **OUT** | — | not claimed |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| Vitest fleetCatalogUx + embed nav 7 PASS (QC re-run) | PRODUCT | **PASS** |
| L2 honest_empty + keyword_empty + Network q 200 | PRODUCT | **PASS** |
| No create CTA / no raw keys / no mutate | PRODUCT | **PASS** must_keep |
| Catalog-missing live banner absent | ENV (catalogs present) | **OK** — unit gate covers #7; U65 no invent missing-catalog |
| Portal `:5173` vs `:5175` | ENV | **OK** — QA documented; stack served |
| QA evidence pack 8/8 | PROCESS | **PASS** |
| Seed / invent upsert / Phase1/PROD | PROCESS U65 | **PASS** — none claimed |
| G-FL-02 reopen | PROCESS | **PASS** — not reopened |
| Phase1 / PROD / `:8088` | OUT OF SLICE | **NOT claimed** · HOLD_DEPLOY |

---

## L2.5 journey coverage

| J-ID / slice | Status | Note |
|--------------|--------|------|
| **J-HRM-FL-01** (provisional) | **PASS** | Sidebar → list empty VI → keyword → Network `q` · list-only · no detail deep-link |
| Cross-nav embed CC → `/hr/fleet` | **PASS** | No 404/409 on list GET |
| Formal `PROGRAM_JOURNEY_MAP` fleet J-* | **deferred** | Provisional id OK — BA may formalize later · **not** FAIL this WI |
| G-FL-01 detail journey | **OUT** | Not claimed |
| Fleet UF mutate | **OUT** | FL-01 read-only |

**QC:** L2.5 provisional PASS for in-scope list/empty/search. Do **not** promote fleet mutate UF 🟢. Do **not** claim Phase1 journey map complete.

---

## Residual (honest — conditions / OUT)

| ID | Sev | Status | Owner | Note |
|----|-----|--------|-------|------|
| **G-FL-07** | P2 | **CLOSED** | — | QC GWC this WI — FE catalog/empty UX |
| **G-FL-02** | P2 | **CLOSED** | — | Prior keyword QC — **do not reopen** without FAIL |
| **G-FL-01** | Info | **OUT** | ba/fe optional | Detail get-by-id — unless sponsor |
| **G-FL-UPSERT** | Info/P2 | **OUT** | future write FR | must_keep — no public create — unless sponsor |
| **G-SCOPE-01** | P0 standing | standing | on-touch | Not reopened |
| Catalog-missing live banner | Info | ENV optional | — | Unit-tested; live N/A when catalogs present |
| J-HRM-FL-01 formal map | Info | deferred | ba optional | Provisional PASS logged |

**Conditions for GWC:**
1. **HOLD_DEPLOY** — no `:8088` / PROD promote from this packet
2. **NOT Phase 1 DONE** / NOT PROD-READY
3. G-FL-01 / G-FL-UPSERT remain OUT unless sponsor opens FR
4. G-FL-02 remains CLOSED — do not reopen without FAIL
5. Provisional J-HRM-FL-01 may be formalized by BA later — not a reopen of G-FL-07

---

## Decision

### **GO WITH CONDITIONS**

- **Closed:** `G-FL-07` — FE list-only Hồ sơ xe · honest empty VI · keyword_empty via `q` · catalog-missing copy (unit) · no raw keys · no create CTA · no spinner storm · portal wired · QA L2 + vitest PASS · evidence pack 8/8.
- **Deploy:** **HOLD_DEPLOY**
- **Claims forbidden:** Phase1 DONE · PROD-READY · `:8088` · G-FL-01 detail · G-FL-UPSERT · reopen G-FL-02 · seed fleet
- **No Dev reopen** of G-FL-07 / G-FL-02 without product FAIL evidence

---

## Handoff

### completion_report

**Closed:** `QC-HRM-FLEET-CATALOG-UX-01` — audited FE+QA evidence; `verify:qc:evidence-pack` QA MD **8/8 PASS**; QC vitest re-run **7 PASS**; L2 runtime + screenshot corroborate list-only / honest_empty / keyword_empty / Network `q` 200 / no CTA / no raw keys / no mutate; **G-FL-07 CLOSED**; G-FL-02 **not** reopened; G-FL-01 / G-FL-UPSERT **not** claimed.

**Residual / conditions:** HOLD_DEPLOY · NOT Phase1/PROD/:8088 · G-FL-01 / G-FL-UPSERT OUT · G-SCOPE-01 standing · catalog-missing live banner ENV optional (unit PASS).

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QC-HRM-FLEET-CATALOG-UX-01
from_role: qc
to_role: pm
lane: governance intake
entry_criteria: QC-HRM-FLEET-CATALOG-UX-01 PASS_TO_PM · evidence docs/qa/evidence/qc-hrm-fleet-catalog-ux-01-20260727.md
decision: GO WITH CONDITIONS — G-FL-07 CLOSED · HOLD_DEPLOY · NOT Phase1/PROD/:8088
action:
  1) Mark G-FL-07 QC-verified CLOSED on residual trackers / bus — do NOT reopen without FAIL
  2) Keep G-FL-02 CLOSED (qc-hrm-fleet-keyword-01) — do NOT reopen
  3) Do NOT dispatch invent upsert / G-FL-01 detail unless sponsor opens FR
  4) Do NOT claim Phase1/PROD/:8088 from this FE UX gate
  5) Optional BA: formalize J-HRM-FL-01 in PROGRAM_JOURNEY_MAP (non-blocking)
ack_status target: INTAKE then next execution/governance dispatch (other OPEN residuals only)
```

### evidence_path

`docs/qa/evidence/qc-hrm-fleet-catalog-ux-01-20260727.md`

### ack_status

**PASS_TO_PM**

### pm_dispatch_hint

`G-FL-07` QC **GWC CLOSED** · HOLD_DEPLOY · G-FL-02 stays CLOSED · no G-FL-01/UPSERT · no Phase1/PROD
