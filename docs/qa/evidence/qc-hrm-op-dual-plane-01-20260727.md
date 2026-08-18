# QC Gate — QC-HRM-OP-DUAL-PLANE-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-OP-DUAL-PLANE-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance · Go/No-Go · OP Plane B′ anti-join LE · HOLD_DEPLOY · U65 |
| **date** | `2026-07-27` (ICT) |
| **decision** | **GO WITH CONDITIONS** — OP LE wire **409 `HRM-PLANE-409`** CLOSED (live + Jest); slug happy + persist map CLOSED; residual **Info only** listed; **NOT** Phase1/PROD |
| **scope_claim** | HRM Operations tasks POST/GET + reports/summary dual-plane guard only — **not** CO-HC reopen · **not** browser UF · **not** Phase1/PROD/:8088 |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY · NOT `:8088` |
| **deploy** | **HOLD_DEPLOY** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — no `pnpm seed:*` · one API-path POST persist proof only (not seed) |

---

## Scope (bounded)

| In scope | Explicitly out (cấm) |
|----------|----------------------|
| Gate 1: LE UUID on OP tasks POST/GET + reports/summary → **409 `HRM-PLANE-409`** (not 200+0) | Reopen CO-HC / `employees/summary.by_company` GWC |
| Gate 2: `holding`\|`main` → 2xx; persist `company_id` = Plane B′ map UUID | Phase1 / PROD / `:8088` DONE claim |
| Gate 3: OP-04 slug honesty; LE no silent undercount | Browser UF OP create/list PASS (out of WI) |
| Gate 4: Residual Info listed → GWC OK | Seed tasks / invent UF |

**must_keep CLOSED:** CO-HC GWC · U65 · HOLD_DEPLOY · no Phase1/PROD  
**QA entry:** `docs/qa/evidence/qa-hrm-op-dual-plane-01-20260727.md`  
**BE entry:** `docs/qa/evidence/be-hrm-op-dual-plane-guard-01-20260727.md`  
**Control:** `docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md` §6.4

---

## Micro-checklist (exit_criteria)

| # | Criterion | Result |
|---|-----------|--------|
| 1 | LE `company_id` on OP tasks POST/GET + reports/summary → **409 `HRM-PLANE-409`** (live + Jest); not 200+0 | **PASS** |
| 2 | `holding`\|`main` → 2xx; persist response `company_id` = Plane B′ map UUID `10000000-…0001` | **PASS** |
| 3 | OP-04 slug honesty / LE no undercount path | **PASS** |
| 4 | Residual Info only (API_DESIGN code name; non-OP filter) — listed | **PASS** — GWC conditions |
| 5 | Evidence this file → PASS_TO_PM · HOLD_DEPLOY · NOT Phase1/PROD · no CO-HC reopen · U65 | **PASS** |

---

## Evidence chain audited

| Artifact | Gap / role | Verdict | Closed |
|----------|------------|---------|--------|
| `be-hrm-op-dual-plane-guard-01-20260727.md` | Persist/list/summary `HRM-PLANE-409`; Jest suites; CODE-MEMORY OP-04 mix | **READY_FOR_QA** | BE guard |
| `qa-hrm-op-dual-plane-01-20260727.md` | Live L1 LE→409; slug 2xx; POST persist map; Jest 56/56 | **PASS_TO_PM** | QA L1 |
| `DATA_LINKAGE_BE_FE_QA_CONTROL.md` §6.4 | Plane B′; LE rejected; OP-04 mix; no CO-HC reopen | **PASS** checklist | Control |
| `API_DESIGN_HRM_OPERATIONS.md` | Error code **`HRM-PLANE-409`** named §0.1 | Info **CLOSED** | `BA-HRM-OP-PLANE-409-DOC-01` |

---

## Spot verify (QC independent)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-op-dual-plane-01-20260727.md` | **FAIL** 3/8 (`command_table`, `portal_url`, `journey_l25`) | PROCESS — L1 API pack expected P3; not product NO-GO |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-op-dual-plane-01-20260727.md` | **PASS** exit **0** (8/8) — this QC pack | PROCESS |
| `pnpm run qc:dev-stack` | HRM **200** · XBOS **200** · portal **200** `:5173` | ENV (L0) |
| `cd apps/api/hrm-api && pnpm exec jest --testPathPatterns=be-hrm-op-dual-plane-guard-01 --testPathPatterns=operations.service.spec --testPathPatterns=hrm-list-scope.spec --no-coverage` | **PASS** Suites **3** · Tests **56** · EXIT **0** | PRODUCT (Jest) |
| QC live `GET …/operations/tasks?company_id=<LE>` (JWT LE + `tenantId=xevn`) | **409** `HRM-PLANE-409` | PRODUCT |
| QC live `GET …/operations/reports/summary?company_id=<LE>` | **409** `HRM-PLANE-409` | PRODUCT |
| QC live `POST …/operations/tasks` body LE | **409** `HRM-PLANE-409` | PRODUCT |
| QC live `GET …/tasks?company_id=holding` | **200** `HRM-OPS-200` | PRODUCT |
| QC live `GET …/reports/summary?company_id=holding` | **200** `HRM-OPS-200` | PRODUCT |
| QC live `POST …/tasks` `company_id=holding` | **201** `HRM-OPS-201` · `company_id=10000000-0000-4000-8000-000000000001` | PRODUCT (API path, not seed) |

**Portal URL / PORTAL_DEV_URL:** `http://127.0.0.1:5173/` (L0 portal health). This WI is **L1 Network + Jest** only — no browser UF claim.

Representative XBOS LE UUID (∉ map): `78b8a663-f5e5-4f4d-a020-b8f950ec2037`  
Plane B′ holding map UUID: `10000000-0000-4000-8000-000000000001`

### Gate matrix (product)

| Gate | Live QC | Jest | Verdict |
|------|---------|------|---------|
| LE list → 409 `HRM-PLANE-409` | **409** | reject before list SQL | **PASS** |
| LE summary → 409 (no fake 0) | **409** | reject before `FROM public.hrm_tasks` | **PASS** |
| LE POST create → 409 | **409** | reject before INSERT | **PASS** |
| slug `holding` list/summary → 2xx | **200** | mapped UUID filter / honest zeros | **PASS** |
| POST `holding` persist map UUID | **201** + map UUID | INSERT arg = map UUID | **PASS** |
| OP-04 LE undercount path | blocked by **409** | **PASS** | **PASS** |

### Classification (ENV vs PRODUCT)

| Signal | Type | Finding |
|--------|------|---------|
| Live **409 `HRM-PLANE-409`** on LE wire | PRODUCT | Gate 1 **CLOSED** |
| Live **200/201** slug + mapped persist UUID | PRODUCT | Gate 2 **CLOSED** |
| OP-04 LE cannot silent-zero | PRODUCT | Gate 3 **CLOSED** |
| API_DESIGN missing code name `HRM-PLANE-409` | Info / spec | **CLOSED** — `BA-HRM-OP-PLANE-409-DOC-01` §0.1 |
| `pushCompanyIdUuidFilter` non-OP pass-through | Info (BE/MD) | Owned by `D-HRM-MD-DUAL-PLANE-GUARD-01` — not OP reopen |
| QA pack 3/8 Layer B | PROCESS P3 | Expected L1 packet; QC pack 8/8 gates GWC |
| L0 stack | ENV | Healthy — spot valid |
| Seed / CO-HC / Phase1 / PROD / `:8088` | OUT | **NOT claimed** · HOLD_DEPLOY |

### L2.5 journey coverage

| J-ID / slice | Status | Note |
|--------------|--------|------|
| OP browser UF create/list/summary | **N/A** this packet | Entry criteria = L1 Network + Jest; browser **out of scope** |
| CO-HC / UF-HRM-CO-HC | **must_keep CLOSED** | Not reopened |
| Dual-plane OP LE anti-join (API) | **PASS** | Cross-nav browser not required for this WI |

**QC:** No L2.5 product NO-GO — journey browser coverage **out of entry criteria**. Do **not** promote OP browser UF from this evidence.

### DATA_LINKAGE §6.4

| Check | Result |
|-------|--------|
| Identify key plane | OP persist/list/summary = **B′** |
| Network never LE on OP UUID spine | LE → **409** |
| B′ UUID ∈ map only | Live + Jest |
| OP-04 plane mix explained | BE CODE-MEMORY + Jest; LE fail-closed |
| No reopen CO-HC GWC | **Confirmed** |

---

## Residual / Conditions

| ID | Severity | Status | Owner |
|----|----------|--------|-------|
| **C-OP-PLANE-API-DESIGN-409** | Info | **CLOSED** 2026-07-27 — named in `API_DESIGN_HRM_OPERATIONS.md` §0.1 · evidence `ba-hrm-op-plane-409-doc-01-20260727.md` | `ba-process` (`BA-HRM-OP-PLANE-409-DOC-01`) |
| **C-OP-PLANE-NONOP-UUID-FILTER** | Info | **OPEN** — non-OP UUID pass-through (home/inbox); MD WI owns metadata LE guard | `D-HRM-MD-DUAL-PLANE-GUARD-01` / parallel |
| **C-OP-PLANE-QA-PACK-01** | P3 PROCESS | OPEN | QA optional enrich L1 packs for Layer B 8/8 |
| Browser UF OP after 2xx | Out of WI | not_promoted | future UF if PM opens |
| Phase1 / PROD / `:8088` | — | **NOT claimed** | HOLD_DEPLOY |
| CO-HC GWC | — | **CLOSED** must_keep | — |

---

## Verdict

**GO WITH CONDITIONS**

- **Closed (product):** OP dual-plane anti-join LE on tasks POST/GET + reports/summary — live **409 `HRM-PLANE-409`** (QC independent + QA); slug `holding`/`main` **2xx**; POST `holding` persists Plane B′ map UUID `10000000-…0001`; OP-04 LE cannot undercount via silent 0; Jest **56/56** re-run EXIT 0.
- **Conditions (Info):** API_DESIGN `HRM-PLANE-409` name **CLOSED** (`BA-HRM-OP-PLANE-409-DOC-01`) · non-OP UUID filter residual (MD WI) still OPEN · HOLD_DEPLOY · **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** `:8088`.
- **must_keep:** CO-HC GWC **CLOSED** (not reopened) · U65 zero-seed · no Phase1/PROD claim.
- **cấm honored:** no seed · no CO-HC reopen · no PROD claim · no invent browser UF PASS.

---

## Handoff

### completion_report

**Closed:** QC gate **GO WITH CONDITIONS** for `QC-HRM-OP-DUAL-PLANE-01`. Independent QC spot on L0-up stack: LE wire on GET tasks / GET summary / POST tasks → **409 `HRM-PLANE-409`**; `holding` list/summary → **200 `HRM-OPS-200`**; POST `holding` → **201** with `company_id=10000000-0000-4000-8000-000000000001`. Jest **56/56**. §6.4 checklist PASS. CO-HC not reopened. U65. QC evidence-pack **8/8**. HOLD_DEPLOY · **NOT** Phase1/PROD/:8088.

**Residual:** Info — API_DESIGN name `HRM-PLANE-409` **CLOSED** (`BA-HRM-OP-PLANE-409-DOC-01`); non-OP UUID pass-through → MD dual-plane WI; QA pack P3 enrich optional; browser UF not claimed.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QC-HRM-OP-DUAL-PLANE-01
from_role: qc
to_role: pm
lane: governance intake · OP dual-plane GWC · HOLD_DEPLOY
priority: P1 residual chain

entry_criteria:
- QC-HRM-OP-DUAL-PLANE-01 = GO WITH CONDITIONS
- evidence: docs/qa/evidence/qc-hrm-op-dual-plane-01-20260727.md
- QA: docs/qa/evidence/qa-hrm-op-dual-plane-01-20260727.md
- BE: docs/qa/evidence/be-hrm-op-dual-plane-guard-01-20260727.md

action:
1. Bus INTAKE: mark D-HRM-OP-DUAL-PLANE-GUARD-01 / QA-HRM-OP-DUAL-PLANE-01 CLOSED under GWC (do NOT reopen CO-HC)
2. Continue dual-plane residual #2: D-HRM-MD-DUAL-PLANE-GUARD-01 (or status if already in-flight) — same anti-LE for metadata
3. Optional Info: ba-process delta name HRM-PLANE-409 in API_DESIGN_HRM_OPERATIONS.md (does not block MD WI)
4. Keep HOLD_DEPLOY; do NOT claim Phase1/PROD/:8088
5. pnpm run pm:idle:check → dispatch next P1 from DATA_LINKAGE §6.2 / PM_OPEN_BACKLOG
cấm: seed · reopen CO-HC · treat L1 OP PASS as browser UF PASS · Phase1/PROD/:8088
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/qc-hrm-op-dual-plane-01-20260727.md`

### pm_dispatch_hint

`PM-INTAKE` — OP dual-plane GWC CLOSED on product gates; continue MD dual-plane guard; optional ba-process API_DESIGN code name; HOLD_DEPLOY · NOT Phase1/PROD/:8088 · do not reopen CO-HC.
