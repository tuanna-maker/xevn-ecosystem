# QC Gate — QC-HRM-MD-DUAL-PLANE-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-MD-DUAL-PLANE-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance · Go/No-Go · Metadata Plane B′ anti-join LE · HOLD_DEPLOY · U65 |
| **date** | `2026-07-27` (ICT) |
| **decision** | **GO WITH CONDITIONS** — MD LE wire **409 `HRM-PLANE-409`** CLOSED (live + Jest); slug happy + persist map CLOSED; residual **Info only** listed; **NOT** Phase1/PROD |
| **scope_claim** | HRM Metadata change-requests POST/GET + audit-logs dual-plane guard only — **not** OP/CO-HC reopen · **not** browser UF · **not** Phase1/PROD/:8088 |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY · NOT `:8088` |
| **deploy** | **HOLD_DEPLOY** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — no `pnpm seed:*` · API-path POST persist proof only (not seed) |

---

## Scope (bounded)

| In scope | Explicitly out (cấm) |
|----------|----------------------|
| Gate 1: LE UUID on Metadata GET change-requests / GET audit-logs / POST change-requests → **409 `HRM-PLANE-409`** (not 200 empty) | Reopen OP dual-plane GWC · reopen CO-HC GWC |
| Gate 2: `holding`\|`main`\|`finance` → 2xx; persist `company_id` = Plane B′ map UUID | Phase1 / PROD / `:8088` DONE claim |
| Gate 3: Jest 19/19 EXIT 0 accepted | Browser UF-HRM-11 / metadata FE PASS (out of WI) |
| Gate 4: Residual Info API_DESIGN name only → GWC OK | Seed metadata / invent UF |

**must_keep CLOSED:** OP dual-plane GWC · CO-HC GWC · U65 · HOLD_DEPLOY · no Phase1/PROD  
**QA entry:** `docs/qa/evidence/qa-hrm-md-dual-plane-01-20260727.md`  
**BE entry:** `docs/qa/evidence/be-hrm-md-dual-plane-guard-01-20260727.md`  
**Control:** `docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md` §6.4

---

## Micro-checklist (exit_criteria)

| # | Criterion | Result |
|---|-----------|--------|
| 1 | LE → **409 `HRM-PLANE-409`** on list / audit / post — not 200 empty | **PASS** (QA + QC independent live) |
| 2 | `holding`\|`main`\|`finance` → 2xx; persist mapped UUID | **PASS** |
| 3 | Jest 19/19 cite EXIT 0 accepted | **PASS** (QC re-run) |
| 4 | Evidence GO / GWC; residual Info API_DESIGN name only unless blocker | **PASS** — GWC (Info residual) |
| 5 | Evidence this file → PASS_TO_PM · HOLD_DEPLOY · NOT Phase1/PROD · no OP/CO-HC reopen · U65 | **PASS** |

---

## Evidence chain audited

| Artifact | Gap / role | Verdict | Closed |
|----------|------------|---------|--------|
| `be-hrm-md-dual-plane-guard-01-20260727.md` | Persist/list/audit/decide `HRM-PLANE-409`; CODE-MEMORY G-MD-PLANE-01; Jest suites | **READY_FOR_QA** | BE guard |
| `qa-hrm-md-dual-plane-01-20260727.md` | Live L1 LE→409; slug 2xx; POST persist map; Jest 19/19 | **PASS_TO_PM** | QA L1 |
| `DATA_LINKAGE_BE_FE_QA_CONTROL.md` §6.4 | Plane B′; LE rejected; no CO-HC reopen | **PASS** checklist | Control |
| `API_DESIGN_HRM_W2_SLICE.md` C1 | Map-fail still named `HRM-VAL-001` — does not yet name **`HRM-PLANE-409`** | Info **OPEN** | optional ba-process |

---

## Spot verify (QC independent)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-md-dual-plane-01-20260727.md` | **FAIL** 3/8 (`command_table`, `portal_url`, `journey_l25`) | PROCESS — L1 API pack expected P3; not product NO-GO |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-md-dual-plane-01-20260727.md` | **PASS** exit **0** (8/8) — this QC pack | PROCESS |
| `pnpm run qc:dev-stack` | HRM **200** · XBOS **200** · portal **200** `:5173` | ENV (L0) |
| `cd apps/api/hrm-api && pnpm exec jest --testPathPatterns=be-hrm-md-dual-plane-guard-01 --testPathPatterns=p1-web-acceptance-metadata-company-uuid --testPathPatterns=employee-metadata.controller.spec --no-coverage` | **PASS** Suites **3** · Tests **19** · EXIT **0** | PRODUCT (Jest) |
| QC live `GET …/change-requests?company_id=<LE>` (JWT LE) | **409** `HRM-PLANE-409` | PRODUCT |
| QC live `GET …/audit-logs?company_id=<LE>` | **409** `HRM-PLANE-409` | PRODUCT |
| QC live `POST …/change-requests` body LE | **409** `HRM-PLANE-409` | PRODUCT |
| QC live `GET …/change-requests?company_id=holding\|main\|finance` | **200** `HRM-META-200` | PRODUCT |
| QC live `GET …/audit-logs?company_id=holding` | **200** `HRM-META-204` | PRODUCT |
| QC live `POST …` `company_id=holding` | **201** `HRM-META-201` · `company_id=10000000-0000-4000-8000-000000000001` | PRODUCT (API path, not seed) |
| QC live `POST …` `company_id=finance` | **201** `HRM-META-201` · `company_id=10000000-0000-4000-8000-000000000004` | PRODUCT (API path, not seed) |

**Portal URL / PORTAL_DEV_URL:** `http://127.0.0.1:5173/` (L0 portal health). This WI is **L1 Network + Jest** only — no browser UF claim.

Representative XBOS LE UUID (∉ map): `78b8a663-f5e5-4f4d-a020-b8f950ec2037`  
Plane B′ holding map UUID: `10000000-0000-4000-8000-000000000001`  
Plane B′ finance map UUID: `10000000-0000-4000-8000-000000000004`

### Gate matrix (product)

| Gate | Live QC | Jest | Verdict |
|------|---------|------|---------|
| LE list → 409 `HRM-PLANE-409` | **409** | reject before list SQL | **PASS** |
| LE audit → 409 | **409** | reject before audit SQL | **PASS** |
| LE POST create → 409 | **409** | reject before INSERT | **PASS** |
| slug `holding`/`main`/`finance` list → 2xx | **200** | repository called | **PASS** |
| POST `holding` persist map UUID | **201** + `…0001` | INSERT arg = map UUID | **PASS** |
| POST `finance` persist map UUID | **201** + `…0004` | INSERT arg = map UUID | **PASS** |

### Classification (ENV vs PRODUCT)

| Signal | Type | Finding |
|--------|------|---------|
| Live **409 `HRM-PLANE-409`** on LE list/audit/post | PRODUCT | Gate 1 **CLOSED** |
| Live **200/201** slug + mapped persist UUID | PRODUCT | Gate 2 **CLOSED** |
| Jest **19/19** EXIT 0 | PRODUCT | Gate 3 **CLOSED** |
| `API_DESIGN_HRM_W2_SLICE.md` C1 missing code name `HRM-PLANE-409` | Info / spec | **OPEN** — optional ba-process (same class as prior OP Info before BA-HRM-OP-PLANE-409-DOC-01) |
| QA pack 3/8 Layer B | PROCESS P3 | Expected L1 packet; QC pack 8/8 gates GWC |
| L0 stack | ENV | Healthy — spot valid |
| Seed / OP reopen / CO-HC / Phase1 / PROD / `:8088` | OUT | **NOT claimed** · HOLD_DEPLOY |

### L2.5 journey coverage

| J-ID / slice | Status | Note |
|--------------|--------|------|
| Metadata browser UF-HRM-11 / FE after 2xx | **N/A** this packet | Entry criteria = L1 Network + Jest; browser **out of scope** |
| OP dual-plane GWC | **must_keep CLOSED** | Not reopened |
| CO-HC / UF-HRM-CO-HC | **must_keep CLOSED** | Not reopened |
| Dual-plane MD LE anti-join (API) | **PASS** | Cross-nav browser not required for this WI |

**QC:** No L2.5 product NO-GO — journey browser coverage **out of entry criteria**. Do **not** promote Metadata browser UF from this evidence.

### DATA_LINKAGE §6.4

| Check | Result |
|-------|--------|
| Identify key plane | Metadata persist/list/audit/decide = **B′** |
| Network never LE on MD UUID spine | LE → **409** |
| B′ UUID ∈ map only | Live + Jest |
| Cross-surface | Settings TEXT catalogs out of WI (BE note) — not reopened |
| No reopen CO-HC GWC | **Confirmed** |
| No reopen OP dual-plane GWC | **Confirmed** |

---

## Residual / Conditions

| ID | Severity | Status | Owner |
|----|----------|--------|-------|
| **C-MD-PLANE-API-DESIGN-409** | Info | **OPEN** — `API_DESIGN_HRM_W2_SLICE.md` C1 still names map-fail as `HRM-VAL-001`; impl/evidence use **`HRM-PLANE-409`** | `ba-process` optional (`BA-HRM-MD-PLANE-409-DOC-01`) |
| **C-MD-PLANE-QA-PACK-01** | P3 PROCESS | OPEN | QA optional enrich L1 packs for Layer B 8/8 |
| Browser UF-HRM-11 / metadata FE after 2xx | Out of WI | not_promoted | future UF if PM opens |
| Optional UUID→TEXT migrate G-MD-PLANE-01 | Deferred | not this WI | sponsor unlock |
| Phase1 / PROD / `:8088` | — | **NOT claimed** | HOLD_DEPLOY |
| OP dual-plane GWC | — | **CLOSED** must_keep | — |
| CO-HC GWC | — | **CLOSED** must_keep | — |

**Note:** Prior OP residual `C-OP-PLANE-NONOP-UUID-FILTER` (metadata LE guard ownership) is **CLOSED** by this WI product gates — Metadata service-layer anti-join LE is live.

---

## Verdict

**GO WITH CONDITIONS**

- **Closed (product):** Metadata dual-plane anti-join LE on change-requests POST/GET + audit-logs — live **409 `HRM-PLANE-409`** (QC independent + QA); slug `holding`/`main`/`finance` **2xx**; POST `holding`/`finance` persist Plane B′ map UUIDs `…0001` / `…0004`; Jest **19/19** re-run EXIT 0; §6.4 PASS.
- **Conditions (Info):** API_DESIGN C1 missing `HRM-PLANE-409` name (optional ba-process) · HOLD_DEPLOY · **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** `:8088`.
- **must_keep:** OP dual-plane GWC **CLOSED** · CO-HC GWC **CLOSED** · U65 zero-seed · no Phase1/PROD claim.
- **cấm honored:** no seed · no OP/CO-HC reopen · no PROD claim · no invent browser UF PASS.

---

## Handoff

### completion_report

**Closed:** QC gate **GO WITH CONDITIONS** for `QC-HRM-MD-DUAL-PLANE-01`. Independent QC spot on L0-up stack: LE wire on GET change-requests / GET audit-logs / POST change-requests → **409 `HRM-PLANE-409`**; `holding`/`main`/`finance` list → **200**; POST `holding` → **201** with `company_id=10000000-…0001`; POST `finance` → **201** with `…0004`. Jest **19/19**. §6.4 checklist PASS. OP + CO-HC not reopened. U65. QC evidence-pack **8/8**. HOLD_DEPLOY · **NOT** Phase1/PROD/:8088.

**Residual:** Info — API_DESIGN C1 name `HRM-PLANE-409` OPEN (optional ba-process); QA pack P3 enrich optional; browser UF not claimed; G-MD-PLANE-01 migrate deferred.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QC-HRM-MD-DUAL-PLANE-01
from_role: qc
to_role: pm
lane: governance intake · MD dual-plane GWC · HOLD_DEPLOY
priority: P1 residual chain

entry_criteria:
- QC-HRM-MD-DUAL-PLANE-01 = GO WITH CONDITIONS
- evidence: docs/qa/evidence/qc-hrm-md-dual-plane-01-20260727.md
- QA: docs/qa/evidence/qa-hrm-md-dual-plane-01-20260727.md
- BE: docs/qa/evidence/be-hrm-md-dual-plane-guard-01-20260727.md

action:
1. Bus INTAKE: mark D-HRM-MD-DUAL-PLANE-GUARD-01 / QA-HRM-MD-DUAL-PLANE-01 CLOSED under GWC (do NOT reopen OP or CO-HC)
2. Continue DATA_LINKAGE §6.2 next P1 residual (e.g. SA-G-INT-03-PLANE-A-BRIDGE-01 and/or QA-HRM-MOB-UUID-PLANE-01)
3. Optional Info: ba-process delta name HRM-PLANE-409 in API_DESIGN_HRM_W2_SLICE.md C1 (does not block next P1)
4. Keep HOLD_DEPLOY; do NOT claim Phase1/PROD/:8088
5. pnpm run pm:idle:check → dispatch next P1 from DATA_LINKAGE §6.2 / PM_OPEN_BACKLOG
cấm: seed · reopen OP/CO-HC · treat L1 MD PASS as browser UF PASS · Phase1/PROD/:8088
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/qc-hrm-md-dual-plane-01-20260727.md`

### pm_dispatch_hint

`PM-INTAKE` — MD dual-plane GWC CLOSED on product gates; continue §6.2 next P1 (bridge / mobile UUID); optional ba-process API_DESIGN MD code name; HOLD_DEPLOY · NOT Phase1/PROD/:8088 · do not reopen OP/CO-HC.
