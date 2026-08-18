# QC Gate — QC-XBOS-INF-SCOPE-KEY-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-XBOS-INF-SCOPE-KEY-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance · Go/No-Go · XBOS infra `appliesToCompanyIds` key plane · HOLD_DEPLOY · U65 |
| **date** | `2026-07-27` (ICT) |
| **decision** | **GO WITH CONDITIONS** — AC-INF-KEY-01..05 browser CLOSED; PUT Plane A LE + holding root; no B′ / workforce; must_keep CO-HC/OP/MD; **J-XBOS-05 not FAIL**; residual Info/P2 only; **NOT** Phase1/PROD |
| **scope_claim** | XBOS Infrastructure foundation wizard key-plane write (FE) on local `:5173` Group CEO — **not** BE hard-reject · **not** CO-HC/OP/MD reopen · **not** Phase1/PROD/:8088 |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY · NOT `:8088` |
| **deploy** | **HOLD_DEPLOY** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — no `pnpm seed:*` · FE wizard PUT only |

---

## Scope (bounded)

| In scope | Explicitly out (cấm) |
|----------|----------------------|
| Audit QA browser AC-INF-KEY-01..05 vs ADR §4.4 + API_DESIGN §4 | Seed / API fake mutate |
| PUT body Plane A member LE + prefer `xbos-group-holding-root` | Reopen CO-HC / OP / MD GWC |
| Forbid B′ `10000000-…` + workforce `trsport\|logistics\|finance\|services` | Phase1 / PROD / `:8088` DONE |
| **J-XBOS-05** consumer path not regressed to FAIL | Full infra CRUD remaster / invent BE reject this wave |
| Residual Info BE validate P2 OK for GWC | Clean GO claiming BE validate CLOSED |

**must_keep CLOSED:** CO-HC GWC · OP dual-plane GWC · MD dual-plane GWC · U65 · HOLD_DEPLOY · no Phase1/PROD  
**QA entry:** `docs/qa/evidence/qa-xbos-inf-scope-key-01-20260727.md`  
**FE entry:** `docs/qa/evidence/fe-xbos-inf-scope-key-plane-01-20260727.md`  
**ADR:** `docs/architecture/ADR-XBOS-INF-APPLIES-TO-COMPANY-IDS-KEY-PLANE-20260727.md` §4.4  
**API_DESIGN:** `docs/xbos/API_DESIGN_XBOS_INFRASTRUCTURE.md` §4 AC-INF-KEY-01..05

---

## Micro-checklist (exit_criteria)

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Audit browser AC-INF-KEY-01..05 + PUT Plane A + holding root | **PASS** |
| 2 | No B′ / workforce slugs; must_keep CO-HC/OP/MD; **J-XBOS-05 not FAIL** | **PASS** |
| 3 | GO or GWC; residual Info BE validate P2 OK | **PASS** — **GWC** (Info/P2 residual) |
| 4 | Evidence this file → PASS_TO_PM · cấm seed · reopen GWC · Phase1 | **PASS** |

---

## Evidence chain audited

| Artifact | Gap / role | Verdict | Closed |
|----------|------------|---------|--------|
| ADR §4.4 | Write prefs: holding → `xbos-group-holding-root`; member → Plane A LE; forbid B′/workforce | **Accepted Option A** | Design SoT |
| API_DESIGN §4 | AC-INF-KEY-01..05 + PUT SHOULD/MUST NOT key plane; BE validate backlog P2 | **Normative** | Contract |
| `fe-xbos-inf-scope-key-plane-01-20260727.md` | FE normalize/persist + unit AC matrix | **READY_FOR_QA** | FE |
| `qa-xbos-inf-scope-key-01-20260727.md` | Browser U65 AC-INF-KEY-01..05; PUT/GET; forbid matrix | **PASS_TO_PM** | QA browser |
| `_tmp-qa-inf-scope-key-playwright.json` | Raw PUT/GET audits | **Corroborates** QA | Tool artifact |
| `PROGRAM_JOURNEY_MAP.md` **J-XBOS-05** | Prior ✅ L2 + GWC `p1-infra-fcat-qc-20260620.md`; this wave scope consumer not FAIL | **not FAIL** | Journey must_keep |

---

## Spot verify (QC independent)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-xbos-inf-scope-key-01-20260727.md` | **FAIL** 2/8 (`command_table`, `crud_or_matrix`) | PROCESS P3 — product content present; not product NO-GO |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-xbos-inf-scope-key-01-20260727.md` | **PASS** exit **0** (8/8) — this QC pack | PROCESS |
| QA cite `qc:dev-stack` | HRM `:28001` + XBOS `:28002` + portal `:5173` **HTTP 200** | ENV (L0) |
| QA cite Vitest `infrastructureEntityKeyResolver` + `foundationCategoryList` | **19/19 PASS** | PRODUCT (unit) |
| QC audit Playwright JSON PUT category scope | `["xbos-group-holding-root","88665f2e-86d5-410f-8219-1044ff8ec257"]` · `anyBprime=false` · `anyWorkforce=false` · `anyHoldingRoot=true` | PRODUCT |
| QC audit GET post-save scopes | SAVE-CTRL = root + XE_TMDV LE; legacy FCAT = root + Plane A UUID `f01bb8dc-…` (not B′) | PRODUCT |

**Portal URL:** `http://127.0.0.1:5173/command-center?settings=company_infrastructure`  
**Persona:** `ceo@xe.vn` / `Xevn@2026`  
**Edited category:** `QA-FCAT-SAVE-CTRL-20260620`

### AC-INF-KEY gate matrix (product)

| ID | Spec (API_DESIGN §4 / ADR §4.4) | QA + QC audit | Verdict |
|----|----------------------------------|---------------|---------|
| **AC-INF-KEY-01** | Tick member → PUT Plane A LE UUID | PUT includes `88665f2e-86d5-410f-8219-1044ff8ec257` (XE_TMDV) | 🟢 **PASS** |
| **AC-INF-KEY-02** | Tick holding → prefer `xbos-group-holding-root` | PUT includes root (not `main`-only) | 🟢 **PASS** |
| **AC-INF-KEY-03** | LE in scope → custom fields path / consumer | Unit resolve PASS; live defs under holding root; LE in `appliesToCompanyIds` | 🟢 **PASS** |
| **AC-INF-KEY-04** | Holding-only → member not falsely in-scope | Pre-tick only TẬP ĐOÀN pressed; other members `pressed=false` | 🟢 **PASS** |
| **AC-INF-KEY-05** | F5 / re-open → chips match GET (alias OK) | Post-save reopen: TẬP ĐOÀN + XE_TMDV pressed; GET confirms ids | 🟢 **PASS** |

### Forbid / key-plane matrix

| Check | Result |
|-------|--------|
| Plane B′ `10000000-…` in PUT/GET edited path | **absent** |
| Workforce slugs `trsport\|logistics\|finance\|services` | **absent** |
| Holding write without root (`main`-only) | **absent** — root present |
| Partition `company_id` confused as array SoT | **Not claimed** — orthogonal per ADR §2 |

### Classification (ENV vs PRODUCT)

| Signal | Type | Finding |
|--------|------|---------|
| Browser PUT holding root + Plane A LE | PRODUCT | AC-INF-KEY-01/02 **CLOSED** |
| F5 chip round-trip + alias | PRODUCT | AC-INF-KEY-05 **CLOSED** |
| No B′ / workforce in Network | PRODUCT | Forbid matrix **CLOSED** |
| Vitest 19/19 | PRODUCT | FE unit **CLOSED** |
| L0 stack `:5173`/`:28001`/`:28002` | ENV | Healthy per QA |
| QA pack Layer B 2/8 fail | PROCESS P3 | Expected format gap; QC pack 8/8 gates GWC |
| BE hard-reject forbidden keys | Info / P2 backlog | `D-XBOS-INF-SCOPE-KEY-VALIDATE-01` **OPEN** — GWC OK (ADR §6) |
| Legacy LE `f01bb8dc-…` on older FCAT | Info | Still Plane A form — **not** key-plane FAIL |
| Seed / CO-HC·OP·MD reopen / Phase1 / PROD / `:8088` | OUT | **NOT claimed** · HOLD_DEPLOY |

### L2.5 journey coverage

| J-ID / slice | In this gate? | Status | Note |
|--------------|---------------|--------|------|
| **J-XBOS-05** | Yes (must_keep / consumer) | **PASS (prior) · not FAIL this wave** | Foundation → scope → custom fields; QA reconfirm LE in scope + defs under holding root; prior GWC `p1-infra-fcat-qc-20260620.md` |
| J-XBOS-01..04, 06..12 | No | **Deferred / prior** | Out of this key-plane WI |
| CO-HC / OP / MD GWC | must_keep | **CLOSED — not reopened** | No HRM dual-plane / headcount touch |

**QC:** L2.5 product NO-GO **not** triggered — **J-XBOS-05** remains non-FAIL with scope-key consumer path intact. Full journey remaster **not** claimed as new promote from this WI alone.

### Create / update matrix (foundation scope write)

| Op | Path | Result |
|----|------|--------|
| **Update** | Wizard → Phạm vi pháp nhân → PUT `/api/xbos/infrastructure/settings` | **PASS** — scope ids persist |
| **Read** | GET settings + F5 reopen chips | **PASS** — match GET |
| Create / Delete category | Out of WI | not_promoted |

---

## Residual / Conditions

| ID | Severity | Status | Owner |
|----|----------|--------|-------|
| **D-XBOS-INF-SCOPE-KEY-VALIDATE-01** | P2 Info | **OPEN** — optional BE reject B′ + workforce on PUT; jest; no OP/MD/CO-HC touch | `dev-be` (optional; ADR §6) |
| **C-INF-KEY-QA-PACK-01** | P3 PROCESS | **OPEN** — QA pack missing formal `pnpm`/exit command table + L2.5 PASS-row wording for Layer B 8/8 | `qa` optional APPEND |
| Legacy LE `f01bb8dc-…` on `QA-FCAT-062101` | Info | **OPEN** — Plane A UUID not on current member-units list; not B′ | defer / data hygiene if PM opens |
| Phase1 / PROD / `:8088` | — | **NOT claimed** | HOLD_DEPLOY |
| CO-HC / OP / MD GWC | — | **CLOSED** must_keep | — |
| **J-XBOS-05** | — | **not FAIL** · prior GWC retained | — |

---

## Verdict

**GO WITH CONDITIONS**

- **Closed (product):** AC-INF-KEY-01..05 browser U65 on `:5173` Group CEO; PUT persists `xbos-group-holding-root` + Plane A LE `88665f2e-…`; F5/re-open chips match GET; Network clean of B′ and workforce member slugs; FE unit 19/19; L0 healthy; **J-XBOS-05** consumer path **not FAIL**; must_keep CO-HC/OP/MD **not reopened**.
- **Conditions:** Optional BE validate P2 Info OPEN · QA pack Layer B P3 optional enrich · HOLD_DEPLOY · **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** `:8088`.
- **cấm honored:** no seed · no GWC reopen on CO-HC/OP/MD · no Phase1 claim · no apps/** rewrite by QC.

---

## Handoff

### completion_report

**Closed:** QC gate **GO WITH CONDITIONS** for `QC-XBOS-INF-SCOPE-KEY-01`. Audited QA browser pack + Playwright JSON against ADR §4.4 and API_DESIGN §4: AC-INF-KEY-01..05 **PASS**; PUT body Plane A + holding root; forbid B′/workforce **PASS**; must_keep CO-HC/OP/MD; **J-XBOS-05 not FAIL**. QA Layer B pack 2/8 PROCESS P3 (not product NO-GO); this QC pack targets 8/8. HOLD_DEPLOY · **NOT** Phase1/PROD/:8088.

**Residual:** Info/P2 — `D-XBOS-INF-SCOPE-KEY-VALIDATE-01` optional BE; P3 QA pack enrich optional; legacy FCAT LE Info.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QC-XBOS-INF-SCOPE-KEY-01
from_role: qc
to_role: pm
lane: governance intake · INF scope-key GWC · HOLD_DEPLOY
priority: P2 residual optional

entry_criteria:
- QC-XBOS-INF-SCOPE-KEY-01 = GO WITH CONDITIONS
- evidence: docs/qa/evidence/qc-xbos-inf-scope-key-01-20260727.md

actions:
1) Bus INTAKE GWC — AC-INF-KEY-01..05 CLOSED; must_keep CO-HC/OP/MD; J-XBOS-05 not FAIL
2) Do NOT reopen product FE/QA on this slice
3) Optional later: Task dev-be D-XBOS-INF-SCOPE-KEY-VALIDATE-01 (P2) — reject B′ + workforce slugs on PUT; jest; no OP/MD/CO-HC touch
4) Optional: QA APPEND command_table + L2.5 PASS-row to qa-xbos-inf-scope-key-01 for Layer B 8/8 (P3)
5) cấm: seed · Phase1 DONE · PROD/:8088 · reopen CO-HC/OP/MD GWC

exit_criteria:
- Bus records GWC + residual owners
- Next program wave per PM backlog (not this WI reopen)
```

### evidence_path

`docs/qa/evidence/qc-xbos-inf-scope-key-01-20260727.md`

### ack_status

**PASS_TO_PM**

### pm_dispatch_hint

`PM-INTAKE-QC-XBOS-INF-SCOPE-KEY-01` — GWC closed product; optional BE validate P2 only; no Dev reopen FE.
