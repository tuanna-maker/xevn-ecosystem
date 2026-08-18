# QA-HRM-REC-WF-OPTION-B-01 — RETEST after SPAWN-FIX (local)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-REC-WF-OPTION-B-01` |
| **variant** | retest after `D-HRM-REC-WF-OPTION-B-SPAWN-FIX-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-07-25 |
| **prior FAIL** | `docs/qa/evidence/qa-hrm-rec-wf-option-b-01-20260725.md` |
| **BE READY** | `docs/qa/evidence/be-hrm-rec-wf-option-b-spawn-fix-01-20260725.md` |
| **spec_ref** | ADR-HRM-SETTINGS-SOT-REC-WF-COMPANY-20260723 §3 Option B · TechSpec §18.2 · AC-REC-WF-OPT-B-01/02 · J-REC-WF-02/03 |
| **U65** | zero-seed · **local only** · HOLD_DEPLOY · **cấm** seed · :8088 required · Bay.vn · R2 claim · Phase1/PROD |
| **ack_status** | **READY_FOR_QC** |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `du-lich.ceo@xe.vn` / `Xevn@2026` |
| **pack_fix** | `QA-HRM-REC-WF-OPTION-B-01-PACK-01` — Layer B Command table only (no product re-matrix) |

---

## Executive summary

**READY_FOR_QC** — SPAWN-FIX + dual-def version INSERT closed prior P0 live fails on **localhost** (product claims unchanged; PACK-01 Layer B only):

1. **J-REC-WF-02:** Holding `submit-workflow` with **Bearer alone** (no `x-user-id`) → `spawnMissing:false` + `workflow_instance_id` set (`HRM-REC-WF-200`).
2. **Dual-def:** FE/API `POST /definitions` second partition row → **201** `XBOS-WF-201` with auto `version` 2 (VISUN LE) and version 3 (`xe-du-lich`) — **no UNIQUE 500**.
3. **AC-REC-WF-OPT-B-02:** Holding spawn picks **group-wide** def `944c9abf-…` (not member override).
4. **AC-REC-WF-OPT-B-01:** Member CEO (`xe-du-lich` / `main`) spawn picks override `dd86a5e9-…` (`applyingEntityId=xe-du-lich`) — **≠** holding def.
5. **must_keep:** SPAWN-MISSING false-negative fixed when active def exists.
6. **J-REC-WF-03:** Inbox smoke PASS — pending tasks related to spawned instance (`related≥2`).

Not claiming Bay.vn / R2 / Phase1 / PROD / :8088.

---

## Environment

| Item | Result |
|------|--------|
| Host | **localhost only** (1B HOLD_DEPLOY — :8088 **not** required) |
| Portal | `http://127.0.0.1:5173` — green during primary probe; flaky ECONNREFUSED later (residual ops) |
| hrm-api | `:28001` **200** during AC runs (nest `dist/main.js`; watch/dist race residual) |
| xbos-api | `:28002` **200** stable |
| Seed | **none** |
| Probe | `scripts/tmp-qa-hrm-rec-wf-option-b-01-retest.mjs` + direct XBOS/HRM partition pick script |

---

## L1 unit (local)

| Suite | Result |
|-------|--------|
| xbos `workflow-apply-scope` + `workflow-engine.service` | **26/26 PASS** |
| hrm `resolve-submitter-user-id` + `recruitment-workflow.bridge` | **23/23 PASS** |

---

## Verdict matrix

| ID | Criterion | Verdict | Evidence |
|----|-----------|---------|----------|
| **J-REC-WF-02** | Holding submit → instance when active def; Bearer alone OK | **PASS** | Portal probe: `spawnMissing=false` `wi=228cb199-…`; direct: `wi=a2123edd-…` |
| **AC-REC-WF-OPT-B-DUAL** | ≥2 active defs same code, distinct partition, no UNIQUE 500 | **PASS** | VISUN LE POST → id `f5630dfa-…` **v2**; `xe-du-lich` POST → id `dd86a5e9-…` **v3** |
| **AC-REC-WF-OPT-B-02** | Holding/Group CEO → group-wide when present | **PASS** | detail `definition_id=944c9abf-a566-4e45-965c-ce441632e746` apply=(group) |
| **AC-REC-WF-OPT-B-01** | Member spawn → member override (not silent group) | **PASS** | `du-lich.ceo` → `definition_id=dd86a5e9-2151-48d1-b1c8-c5cdc2dc9c71` match override; ≠ holding |
| **must_keep SPAWN-MISSING** | Banner only when truly no applicable def | **PASS** | Active def present → `spawnMissing:false` |
| **J-REC-WF-03** | Inbox smoke if instance spawned | **PASS** | `pending=149` `related=2` for `wi=a2123edd-…` step `group_ceo` |

---

## Click / API paths (U65 — no seed)

### A) Dual-def (DUAL-01 closed)

```
Login ceo@xe.vn
→ POST /api/xbos/workflow-engine/definitions
   { workflowCode:hrm_requisition_approval, graph.applyingEntityId:VISUN_LE }
→ 201 XBOS-WF-201 id=f5630dfa-… version=2
→ POST … applyingEntityId=xe-du-lich
→ 201 id=dd86a5e9-… version=3
```

### B) J-REC-WF-02 + AC-02 (Bearer only)

```
POST /api/hrm/recruitment/requisitions?company_id=holding  → 201
POST …/submit-workflow?company_id=holding
  headers: Authorization Bearer + x-tenant/company  (NO x-user-id)
→ 201 HRM-REC-WF-200 spawnMissing=false workflow_instance_id=<uuid>
GET /api/xbos/workflow-engine/instances/<wi>/detail
→ definition_id=944c9abf-… (group-wide)
```

### C) AC-01 member override pick

```
Login du-lich.ceo@xe.vn (tenant xe-du-lich, company main)
→ POST requisitions company_id=main → 201 id=d4717866-…
→ POST submit-workflow → spawnMissing=false wi=354eca26-…
→ GET instances/…/detail → definition_id=dd86a5e9-… (xe-du-lich override)
```

### D) J-REC-WF-03

```
GET /api/xbos/workflow-engine/tasks?status=pending&pageSize=100
→ related tasks for holding wi (step group_ceo) — smoke list only; no approve seed
```

---

## Probe note (not a product fail)

- `GET /workflow-engine/instances/:id` → **404** `Cannot GET` (route is **`/instances/:id/detail`**). First probe pass used wrong path → false AC FAIL; corrected path confirms pick.
- Group CEO cannot create requisition under `company_id=visun` / `tenant=visun` → **409** `SCOPE_CONTEXT_MISMATCH` (expected token `main`/`xevn`). VISUN LE dual-def **create** OK; live pick for VISUN spawn not exercised (no VISUN-membership persona). AC-01 proven with **actual member persona** `xe-du-lich`.

---

## Residuals (`residual_auto_fix: true`)

| ID | Sev | Owner | Notes |
|----|-----|-------|-------|
| **R-HRM-LOCAL-STACK-FLAKY-01** | P2 | `devops` | Portal `:5173` + hrm `:28001` intermittent down during session (dist wipe / port contention). Not Option B logic fail. |
| **R-WF-INSTANCE-GET-PATH-01** | P3 | `dev-be` / docs | Document SoT path `instances/:id/detail` for QA probes (no bare GET). |
| **AC-REC-WF-OPT-B-03** | P2 | `qa` later | Fallback / sole-member G-BM-REC-02 — not in this exit. |
| VISUN LE live spawn pick | P3 | — | Dual-def VISUN row exists; spawn under visun blocked by scope for Group CEO; defer unless VISUN persona available. |
| Bay.vn / R2 / Phase1 / PROD / :8088 | — | — | **Explicitly not claimed** |

---

## Command table

| Command | Exit | Verdict |
|---------|------|---------|
| `pnpm --filter xbos-api test -- workflow-apply-scope` | 0 | PASS (26/26) |
| `pnpm --filter hrm-api test -- resolve-submitter-user-id` | 0 | PASS (23/23) |
| `node scripts/tmp-qa-hrm-rec-wf-option-b-01-retest.mjs` | 0 | PASS |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-rec-wf-option-b-01-20260725-retest.md` | 0 | PASS (8/8) after PACK-01 |

**Portal URL:** `http://127.0.0.1:5173` · `PORTAL_DEV_URL=http://127.0.0.1:5173`

**Pack note (PACK-01):** Command table appended for Layer B integrity only — product PASS claims unchanged; full Option B matrix not re-run.

---

## completion_report

**Closed:** Retest after SPAWN-FIX — J-REC-WF-02 Bearer-only instance spawn **PASS**; dual-def UNIQUE **PASS**; AC-OPT-B-01/02 partition pick **PASS** (member `xe-du-lich` override + holding group-wide); SPAWN-MISSING false-negative **PASS**; J-REC-WF-03 inbox smoke **PASS**; L1 26+23 jest **PASS**. Prior FAIL defects D-SPAWN-8088 / D-DUAL / local compile for this WI **CLOSED** on local. **PACK-01:** Layer B `## Command table` added → `verify:qc:evidence-pack` exit **0** → **READY_FOR_QC**.

**Open:** Local stack flaky (P2 devops); instance GET path doc (P3); OPT-B-03 defer; VISUN-persona spawn pick not live (P3).

## next_owner

`qc`

## next_dispatch_prompt

```text
work_item_id: QC-HRM-REC-WF-OPTION-B-01
from_role: pm
to_role: qc
entry_criteria: QA READY_FOR_QC docs/qa/evidence/qa-hrm-rec-wf-option-b-01-20260725-retest.md · verify:qc:evidence-pack exit 0 (PACK-01) · U65 · HOLD_DEPLOY · local only · prior NO-GO process closed
exit_criteria:
  (1) Re-gate Option B local — expect GO WITH CONDITIONS (stack flaky P2 + GET path P3)
  (2) Confirm prior FAIL spawnMissing/UNIQUE closed; cấm promote Phase1/PROD/:8088/Bay.vn/R2
  (3) Residual R-HRM-LOCAL-STACK-FLAKY-01 → devops if sponsor browser window needed
  (4) Close C-OPT-B-QA-PACK-01 (process pack now PASS)
evidence_path: docs/qa/evidence/qc-hrm-rec-wf-option-b-01-20260725.md
```

**evidence_path:** `docs/qa/evidence/qa-hrm-rec-wf-option-b-01-20260725-retest.md`

**ack_status:** **READY_FOR_QC**
