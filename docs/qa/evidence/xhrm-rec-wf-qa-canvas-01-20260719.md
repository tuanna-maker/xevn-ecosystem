# XHRM-REC-WF-QA-CANVAS-01 — Recruitment WF canvas + spawn retest (QA)

| Field | Value |
|-------|--------|
| **work_item_id** | `XHRM-REC-WF-QA-CANVAS-01` |
| **from_role** | `qa` |
| **to_role** | `pm` → `dev-be` (spawn payload) |
| **date** | 2026-07-19 |
| **lane** | execution |
| **change_mode** | RETEST |
| **entry** | browser-only · U65 zero-seed · after `XHRM-REC-WF-FE-CANVAS-01` READY |
| **ack_status** | **FAIL_TO_PM** |
| **spec_ref** | `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` J-REC-WF-01/02/03/06 · AC-REC-WF-01/02 · UF-HRM-12 · AC-CD-F6 |
| **parent** | `docs/qa/evidence/xhrm-rec-wf-fe-canvas-01-20260719.md` · prior GWC `xhrm-rec-wf-qc-01-20260719.md` |

## Environment (L0)

| Probe | Result |
|-------|--------|
| hrm-api `:28001` | HTTP **200** during J-01 / submit / start (end-of-wave `qc:dev-stack` later saw fetch failed — **OPS P3**) |
| xbos-api `:28002` | HTTP **200** |
| web-portal `:5173` | HTTP **200** |
| Persona | `ceo@xe.vn` · Group CEO · JWT `xevn`/`main` |
| Method | Browser FE click + fetch intercept · CC settings + top-level `/hr/*` |
| Seed | **None** (U65) |

## Verdict summary

**FAIL_TO_PM** — **J-REC-WF-01 PASS** (FE canvas created/activated three codes; F5 còn). **UF-HRM-12** + **AC-CD-F6** + leave tab smoke **PASS**. With defs **active**, submit/start still return **201** + `spawnMissing: true` / `workflow_instance_id: null` — XBOS `POST .../instances/start` **400** `XBOS-WF-400` `workflowCode, businessType, businessId, submitter.employeeId required`. Exit criterion #2 (prefer instance id when def active) **FAIL**. **J-REC-WF-03 / J-06** remain **🟡 BLOCKED** (no instance; cấm seed). Elevates **C-XHRM-REC-WF-04** / **D-XHRM-REC-WF-SPAWN-PAYLOAD** to **P0**.

**NOT** Phase1 DONE · **NOT** PROD.

## Journey matrix

| J-ID / AC | Click path | Network / observe | Result |
|-----------|------------|-------------------|--------|
| **J-REC-WF-01** | CC → Cài đặt → Hệ thống quy trình → Mẫu QT ×3 → Lưu → F5 | `POST /api/xbos/workflow-engine/definitions` **201** `XBOS-WF-201` ×3 (`hrm_recruitment_plan_approval`, `hrm_requisition_approval`, `hrm_candidate_pipeline`); F5 chips **đã có** | **PASS** |
| **J-REC-WF-02** (prefer instance) | `/hr/recruitment` → Yêu cầu → **Gửi duyệt QT** on `QA REC-WF CANVAS 1784464500000` (`07328e31-…`) | `POST .../requisitions/07328e31-…/submit-workflow?company_id=holding` → **201** `HRM-REC-WF-200` · `spawnMissing: true` · `workflow_instance_id: null` · banner SPAWN-MISSING · status «Chờ duyệt QT» | **FAIL** (def active but no instance) |
| **J-REC-WF-04** smoke | Ứng viên → Chờ CV → **Bắt đầu QT** on `QA Pool 1780114706910` | `POST .../candidates-pool/289a9388-…/start-pipeline?company_id=main` → **201** `HRM-REC-CP-WF-200` · `workflow_instance_id: null` | **FAIL** same class (2xx SPAWN path) |
| **J-REC-WF-03** | Inbox Duyệt → HRM sync → F5 | N/A | **🟡 BLOCKED** — no `workflow_instance_id` (U65 cấm seed) |
| **J-REC-WF-06** | Inbox Từ chối | N/A | **🟡 BLOCKED** — same |
| **UF-HRM-12** | Thêm yêu cầu → Lưu `QA REC-WF CANVAS 1784464500000` | `POST /api/hrm/recruitment/requisitions` → **201** `HRM-REC-201` · list shows title | **PASS** |
| **AC-CD-F6** | Dashboard Pipeline **6 giai đoạn** | Live funnel 6 cols (Chờ CV…Từ chối) | **PASS** |
| **Leave smoke** | `/hr/attendance` → tab **Nghỉ phép** | Page load; leave UI visible; no ERROR banner | **PASS** (load smoke; no mutate) |

## Exit criteria checklist

| # | Criterion | Verdict |
|---|-----------|---------|
| 1 | J-REC-WF-01 Lưu 3 codes → F5 còn | **PASS** |
| 2 | submit/start prefer `workflow_instance_id` when def active | **FAIL** — still SPAWN-MISSING |
| 3 | J-REC-WF-03 / J-06 if spawn succeeded | **N/A BLOCKED** — spawn did not succeed |
| 4 | Regression UF-HRM-12 · AC-CD-F6 · leave smoke | **PASS** |
| 5 | Evidence path | This file + screenshots |
| 6 | PASS_TO_PM or FAIL | **FAIL_TO_PM** |

## Root cause (product)

| Layer | Evidence |
|-------|----------|
| HRM log | `HRM-REC-WF-SPAWN-MISSING: XBOS start failed … status=400 code=XBOS-WF-400 msg=workflowCode, businessType, businessId, submitter.employeeId required` (id=`07328e31-…`) |
| XBOS log | `POST /api/xbos/workflow-engine/instances/start` **400** same message (`userId=hrm-be`, `companyId=holding`) |
| FE | Yellow **SPAWN-MISSING** banner still cites canvas path (defs already exist — copy lag OK; product issue is payload) |

Defs on canvas are **not** the blocker anymore — **HRM→XBOS start payload** incomplete (at least `submitter.employeeId`).

## Screenshots

| File | Captures |
|------|----------|
| `docs/qa/evidence/xhrm-rec-wf-qa-canvas-01-j01-f5-20260719.png` | F5 — Mẫu QT 3 codes **đã có** |
| `docs/qa/evidence/xhrm-rec-wf-qa-canvas-01-spawn-missing-20260719.png` | Requisition after Gửi duyệt — SPAWN-MISSING + «Chờ duyệt QT» |

## command_table

| Command | Exit | Result |
|---------|------|--------|
| `pnpm run qc:dev-stack` (wave start) | healthy print (Windows UV noise) | hrm/xbos/portal **200** — **PASS** |
| `pnpm --filter web-portal exec vitest run src/data/hrm-recruitment-workflow-presets.test.ts src/integrations/workflowMapper.test.ts` | **0** | 2 files / **17** tests PASS |
| `pnpm exec vitest run src/lib/recruitmentWorkflowUi.test.ts src/lib/recruitmentFunnel.test.ts` (cwd `apps/web/hrm`) | **0** | 2 files / **7** tests PASS (F6 must_keep) |
| `pnpm run qc:dev-stack` (wave end) | FAIL print | hrm **fetch failed** · xbos/portal 200 — **OPS P3** residual |

## Residuals

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| **D-XHRM-REC-WF-SPAWN-PAYLOAD** | **P0** | `dev-be` | With active `hrm_requisition_approval` / `hrm_candidate_pipeline`, XBOS start still 400 missing required fields — block J-03/06 |
| **R-XHRM-REC-WF-J03-J06** | P1 blocked | qa after BE | Inbox approve/reject only after successful spawn |
| **R-XHRM-REC-WF-LOCKED-UNTESTED** | P2 | qa later | Needs instance |
| **C-XHRM-REC-WF-03** | CLOSED product | — | FE canvas defs created this wave |
| **OPS-HRM-DOWN-ENDWAVE** | P3 | devops | hrm-api unreachable at final `qc:dev-stack`; not used to claim product PASS |

## Forbidden honored

- No `pnpm seed:*` / inbox seed
- No Phase1 / PROD claim
- No overwrite of F6 green (funnel re-observed)

## completion_report

**Closed:** J-REC-WF-01 FE canvas create/activate 3 codes + F5; UF-HRM-12 create 201; AC-CD-F6 6 cols; leave tab smoke; U65 zero-seed.

**Open / FAIL:** Prefer `workflow_instance_id` when def active — still SPAWN-MISSING via XBOS-WF-400 payload; J-03/06 blocked; escalate spawn payload to **dev-be** P0.

## next_owner

`dev-be`

## next_dispatch_prompt

```text
work_item_id: XHRM-REC-WF-BE-SPAWN-01
from_role: pm
to_role: dev-be
lane: execution
change_mode: FIX
residual_auto_fix: true

## read_first
1. docs/qa/evidence/xhrm-rec-wf-qa-canvas-01-20260719.md (FAIL_TO_PM)
2. docs/decisions/ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md spawn payload
3. apps/api/hrm-api/src/recruitment/recruitment-workflow.bridge.ts

## entry
J-REC-WF-01 PASS — defs active: hrm_requisition_approval, hrm_candidate_pipeline, hrm_recruitment_plan_approval
U65 zero-seed; ceo@xe.vn

## deliver
1. Fix HRM → XBOS POST /workflow-engine/instances/start payload so required fields present (workflowCode, businessType, businessId, submitter.employeeId)
2. Jest/spec: spawn with active def returns workflow_instance_id (not only SPAWN-MISSING mapping)
3. Do not seed inbox; do not touch leave bridge / F6 funnel

## exit
READY_FOR_QA — evidence path; next_dispatch_prompt for XHRM-REC-WF-QA-CANVAS-02 retest J-02 instance + J-03/06
```

## ack_status

**FAIL_TO_PM**
