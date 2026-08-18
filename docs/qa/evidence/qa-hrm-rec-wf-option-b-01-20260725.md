# QA-HRM-REC-WF-OPTION-B-01 — REC-WF Option B company partition (retest)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-REC-WF-OPTION-B-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-07-25 |
| **prior** | pm→qa DISPATCHED 2026-07-23 (no verdict) · BE `be-hrm-rec-wf-option-b-01-20260723.md` READY_FOR_QA |
| **spec_ref** | `ADR-HRM-SETTINGS-SOT-REC-WF-COMPANY-20260723.md` §3 Option B · TechSpec §18.2 · AC-REC-WF-OPT-B-01/02 · must_keep **J-REC-WF-02/03** |
| **U65** | zero-seed · FE/API mutate only · **cấm** seed · Bay.vn claim · R2 claim · Phase1/PROD |
| **ack_status** | **FAIL_TO_PM** |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · member `du-lich.ceo@xe.vn` / `Xevn@2026` |

---

## Executive summary

**FAIL_TO_PM** — Option B **unit pick logic PASS** locally (jest 25/25), but **live AC-REC-WF-OPT-B-01/02 cannot PASS**:

1. **Local L0 incomplete:** `hrm-api` **does not compile** (3 TS errors) → no local U65 FE stack; only `xbos-api :28002` up.
2. **Dev8088 live:** Group CEO / member CEO `submit-workflow` → **201** `HRM-REC-WF-200` with **`spawnMissing: true`** / `workflow_instance_id: null` even when active `hrm_requisition_approval` exists (and after temporary FE PUT `applyingEntityId=VISUN`). **J-REC-WF-02 instance spawn regresses** vs R2 🟢 `bm-qa-rec-wf-spawn-r2` (must_keep banner path still 2xx).
3. **Dual active defs (Option B precond) blocked:** FE `POST /definitions` for second partition row → **500** `duplicate key … tenant_id_workflow_code_version_key` for versions 2/6/99; list shows only **one** active row (v1 group-wide). Cannot observe member-override vs group-wide `definition_id` on instance.
4. **J-REC-WF-03** inbox smoke **BLOCKED** (no instance to approve).

Not claiming Bay.vn / R2 / Phase1 / PROD.

---

## Environment

| Item | Result |
|------|--------|
| Local `qc:dev-stack` | **FAIL** — hrm `:28001` down (TS compile); xbos `:28002` **200**; portal `:5173` down |
| Local `hrm-api` watch | **3 errors** — `employees.service.ts` `memberTenantId` / `masterTenantPartition` not on `HrmListScopeContext`; `operating-units.service.ts` QueryFn typing |
| Dev8088 | `http://14.225.217.232:8088` portal+XBOS proxy **200**; HRM mutate APIs respond (list/create/submit) |
| Seed | **none** |
| Probe script | `scripts/tmp-qa-hrm-rec-wf-option-b-01.mjs` |

---

## L1 — Option B unit (local xbos-api)

| Suite | Result |
|-------|--------|
| `workflow-apply-scope` + `workflow-engine.service` | **25/25 PASS** (includes AC-REC-WF-OPT-B partition pick cases) |

Confirms **pick** preference (member override → group-wide → G-BM-REC-02) in isolation. **Does not** close live AC or J-*.

---

## Verdict matrix

| ID | Criterion | Verdict | Evidence |
|----|-----------|---------|----------|
| **AC-REC-WF-OPT-B-01** | Member spawn → member override def (not silent group/other) | **FAIL / untstable** | Dual active defs **not creatable** via FE; member submit `spawnMissing:true` → no `definition_id` |
| **AC-REC-WF-OPT-B-02** | Holding/main Group CEO → group-wide when present | **FAIL / untstable** | Holding submit `spawnMissing:true` (active group-wide `944c9abf-…` present) |
| **J-REC-WF-02** | Submit → instance **or** SPAWN-MISSING banner | **PARTIAL** | **201** + `spawnMissing:true` (banner AC OK) · **instance spawn FAIL** vs prior R2 🟢 |
| **J-REC-WF-03** | Inbox duyệt → HRM sync | **BLOCKED** | No `workflow_instance_id` (U65 cấm seed inbox) |
| **must_keep** SPAWN-MISSING rules | 2xx + pending, no 500 | **PASS** | `HRM-REC-WF-200` |

---

## Click / API paths (U65)

### A) Group CEO — holding spawn (AC-02 / J-02)

```
Login ceo@xe.vn → POST /api/hrm/recruitment/requisitions?company_id=holding
→ 201 HRM-REC-201 id=0f25c5a8-… / db1c12bd-…
→ POST …/submit-workflow?company_id=holding
→ 201 HRM-REC-WF-200 spawnMissing=true workflow_instance_id=null status=pending_approval
```

Active def SoT on 8088: only `hrm_requisition_approval` **v1** `944c9abf-a566-4e45-965c-ce441632e746` apply=`''` (group-wide).

### B) Member CEO — visun tenant spawn (AC-01)

```
Login du-lich.ceo@xe.vn (tenant xe-du-lich, company main)
→ POST requisitions 201 id=4872189d-…
→ POST submit-workflow 201 spawnMissing=true wi=null
```

Group CEO `company_id=visun` create → **409** `SCOPE_CONTEXT_MISMATCH` (expected token `main`).

### C) Dual-def FE attempt (Option B precond)

```
POST /api/xbos/workflow-engine/definitions { workflowCode:hrm_requisition_approval, version:2|6|99, graph.applyingEntityId:VISUN LE }
→ 500 XBOS-SYS-001 duplicate key … xbos_workflow_definition_tenant_id_workflow_code_version_key
```

List still **1** active row. Matches BE residual: UNIQUE `(tenant_id, workflow_code, version)` blocks multi-company active rows without schema/upsert fix.

### D) R2-style VISUN apply smoke (must_keep regression)

```
PUT definitions/944c9abf-… applyingEntityId=VISUN → 200 XBOS-WF-201
→ holding submit-workflow → still spawnMissing=true
→ restore apply='' → 200
```

**Regression:** R2 evidence had `spawnMissing:false` + instance under VISUN apply; **2026-07-25 Dev8088 = SPAWN-MISSING**.

---

## Defects / residuals (`residual_auto_fix: true`)

| ID | Sev | Owner | Notes |
|----|-----|-------|-------|
| **D-HRM-REC-WF-SPAWN-8088-01** | **P0** | `dev-be` (+ `devops` if binary lag) | J-REC-WF-02 instance spawn `spawnMissing:true` despite active def; diagnose HRM bridge log (`submitter.employeeId` / XBOS start status/code). Blocks AC-OPT-B observation + J-03. |
| **D-HRM-REC-WF-OPTION-B-DUAL-01** | **P0** | `dev-be` | FE cannot ADD second active partition row (UNIQUE/upsert). Option B live AC needs ≥2 active defs (group + member) or alternate product path. |
| **D-HRM-API-LOCAL-TS-01** | **P0** | `dev-be` | Local `hrm-api` watch: `employees.service` uses `HrmListScopeContext.memberTenantId` / `masterTenantPartition` (fields on scope result type, not context); `operating-units` QueryFn. Blocks U32 local L0. |
| AC-REC-WF-OPT-B-03 | P2 | qa later | Fallback / G-BM-REC-02 sole-member — not executed (spawn + dual blocked) |
| R2 fail-closed / Bay.vn | — | — | **Explicitly not claimed** |

---

## completion_report

**Closed:** Retest executed; L1 Option B jest **25/25**; Dev8088 FE/API paths documented; SPAWN-MISSING must_keep 2xx confirmed; dual-def UNIQUE failure reproduced; local compile blocker filed.

**Open / FAIL:** Live **AC-REC-WF-OPT-B-01/02** · **J-REC-WF-02 instance** · **J-REC-WF-03** · local L0 HRM.

---

## next_owner

`dev-be` (spawn + dual-def + local TS) → then `qa` retest this WI → `qc` only after PASS.

## next_dispatch_prompt

```text
work_item_id: D-HRM-REC-WF-OPTION-B-SPAWN-FIX-01
from_role: pm
to_role: dev-be
entry_criteria: FAIL_TO_PM docs/qa/evidence/qa-hrm-rec-wf-option-b-01-20260725.md · U65 zero-seed · HOLD_DEPLOY
exit_criteria:
  (1) Fix D-HRM-REC-WF-SPAWN-8088-01 — Group CEO holding + member CEO submit-workflow return spawnMissing:false + workflow_instance_id when active hrm_requisition_approval exists (must_keep SPAWN-MISSING only when truly no applicable def)
  (2) Fix D-HRM-REC-WF-OPTION-B-DUAL-01 — allow ≥2 active defs same workflow_code with distinct company partition (group-wide + VISUN) without UNIQUE false-fail on FE POST; document version/partition strategy
  (3) Fix D-HRM-API-LOCAL-TS-01 — hrm-api compiles; qc:dev-stack L0 local green for hrm+xbos
  (4) Jest Option B still 25/25; READY_FOR_QA → re-dispatch QA-HRM-REC-WF-OPTION-B-01
cấm: seed · Bay.vn · R2 claim · Phase1/PROD · wipe J-REC-WF must_keep banner semantics
evidence_path: docs/qa/evidence/be-hrm-rec-wf-option-b-spawn-fix-01-20260725.md
```

**evidence_path:** `docs/qa/evidence/qa-hrm-rec-wf-option-b-01-20260725.md`

**ack_status:** **FAIL_TO_PM**
