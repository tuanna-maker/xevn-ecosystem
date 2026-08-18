# XHRM-REC-WF-QA-02 — Retest requisition submit-workflow (QA)

| Field | Value |
|-------|--------|
| **work_item_id** | `XHRM-REC-WF-QA-02` |
| **from_role** | qa |
| **to_role** | pm → qc |
| **date** | 2026-07-19 |
| **lane** | execution |
| **change_mode** | RETEST |
| **entry** | browser-only · U65 zero-seed · after `XHRM-REC-WF-BE-02` READY |
| **ack_status** | **PASS_TO_PM** |
| **spec_ref** | `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` J-REC-WF-02 · AC-REC-WF-02 · UF-HRM-12 |
| **parent** | `docs/qa/evidence/xhrm-rec-wf-be-02-20260719.md` · prior FAIL `xhrm-rec-wf-qa-01-20260719.md` |

## Environment (L0)

| Probe | Result |
|-------|--------|
| hrm-api `:28001` | HTTP **200** (restarted mid-wave after DB `ECONNRESET` crash) |
| xbos-api `:28002` | HTTP **200** |
| web-portal `:5173` | HTTP **200** |
| Persona | `ceo@xe.vn` · Group CEO · JWT `xevn`/`main` |
| Method | Browser FE click + fetch intercept · top-level `/hr/recruitment` |
| Seed | **None** (U65) |

## Verdict summary

**PASS_TO_PM** — P0 D-XHRM-REC-WF-SUBMIT-SCOPE **closed**. Requisition `POST .../submit-workflow` returns **201** `HRM-REC-WF-200` with `spawnMissing: true` (not 500). FE shows yellow **SPAWN-MISSING** banner; entity `pending_approval`, `workflow_instance_id: null`. Smokes UF-HRM-12 + J-REC-WF-04 PASS. J-03/06 remain **🟡 BLOCKED** (no instance → no inbox task; cấm seed).

## Journey matrix (this retest)

| J-ID | Click path | Network | Result |
|------|------------|---------|--------|
| **J-REC-WF-02** | Recruitment → Yêu cầu → **Gửi duyệt QT** on `QA REC-WF UF12 20260719` (`a498335c-…`) | `POST .../requisitions/a498335c-…/submit-workflow?company_id=holding` → **201** `HRM-REC-WF-200` · `spawnMissing: true` · `workflow_instance_id: null` · status `pending_approval` | **PASS** |
| **J-REC-WF-04** | Ứng viên → Tất cả → **Bắt đầu QT** on `QA Pool 1780114706910` | `POST .../candidates-pool/289a9388-…/start-pipeline?company_id=main` → **201** `HRM-REC-CP-WF-200` · `spawnMissing: true` | **PASS** (smoke) |
| **J-REC-WF-03** | Inbox Duyệt | N/A | **🟡 BLOCKED** — no `workflow_instance_id` (U65 cấm seed) |
| **J-REC-WF-06** | Inbox Từ chối | N/A | **🟡 BLOCKED** — same |
| **UF-HRM-12** | Thêm yêu cầu → Lưu `QA REC-WF UF12 retest 1784462430654` | `POST /api/hrm/recruitment/requisitions` → **201** `HRM-REC-201` · list refresh · `workflow_instance_id: null` | **PASS** |
| **AC-CD-F6** | Dashboard Pipeline 6 giai đoạn | Live aggregate | **PASS** (observed on entry) |

## Exit criteria checklist

| # | Criterion | Verdict |
|---|-----------|---------|
| 1 | J-REC-WF-02 submit-workflow **2xx** (not 500) | **PASS** — **201** |
| 2 | SPAWN-MISSING banner **or** instance id | **PASS** — banner + `spawnMissing: true` |
| 3 | Smoke J-REC-WF-04 | **PASS** |
| 4 | Smoke UF-HRM-12 | **PASS** |
| 5 | If instance → try J-03/06 | **N/A** — no instance |
| 6 | Evidence path | This file + screenshot |
| 7 | PASS_TO_PM or FAIL | **PASS_TO_PM** |

## Screenshots

| File | Captures |
|------|----------|
| `docs/qa/evidence/xhrm-rec-wf-qa-02-spawn-missing-20260719.png` | Requisition list after Gửi duyệt QT — yellow SPAWN-MISSING + status «Chờ duyệt QT» |

## Residuals (not blockers for this retest)

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| **R-XHRM-REC-WF-NO-DEF** | P2 / expected | PM / XBOS admin (FE canvas) | No active `hrm_requisition_approval` / `hrm_candidate_pipeline` def → SPAWN-MISSING alternate is correct AC |
| **R-XHRM-REC-WF-SPAWN-PAYLOAD** | P2 | optional BE | HRM log on submit: XBOS `400` `workflowCode, businessType, businessId, submitter.employeeId required` — still mapped to SPAWN-MISSING 2xx; revisit when FE creates defs |
| **R-XHRM-REC-WF-LOCKED-UNTESTED** | P2 | qa later | LOCKED UI/409 needs active instance |
| **R-XHRM-REC-WF-J03-J06** | P2 | qa later | Inbox approve/reject after FE-created def + successful spawn |
| **OPS-HRM-DB-RESET** | P3 ops | devops | Mid-wave hrm-api crash `Connection terminated unexpectedly` during first create attempt; restart → UF12 retry PASS |

## Forbidden honored

- No `pnpm seed:*` / inbox seed
- No Phase1 / PROD claim
- No overwrite of F6 green (funnel re-observed)

## completion_report

Closed: Browser retest of BE-02 fix — J-REC-WF-02 **PASS** (201 + SPAWN-MISSING); UF-HRM-12 + J-REC-WF-04 smoke **PASS**; prior P0 500 **gone**.

Open: J-03/06 blocked until FE canvas def + instance; LOCKED untested; optional spawn payload completeness when defs exist.

## next_owner

`qc`

## next_dispatch_prompt

```text
work_item_id: XHRM-REC-WF-QC-01
from_role: pm
to_role: qc
lane: governance
change_mode: GATE
residual_auto_fix: true

## read_first
1. docs/qa/evidence/xhrm-rec-wf-qa-02-20260719.md
2. docs/qa/evidence/xhrm-rec-wf-be-02-20260719.md
3. docs/qa/evidence/xhrm-rec-wf-qa-01-20260719.md (prior FAIL closed)

## entry
QA PASS_TO_PM on XHRM-REC-WF-QA-02; U65 browser evidence; L0 local

## deliver
1. Audit: J-REC-WF-02 submit-workflow 201 + SPAWN-MISSING closes D-XHRM-REC-WF-SUBMIT-SCOPE
2. Confirm smokes UF-HRM-12 + J-REC-WF-04 PASS; J-03/06 BLOCKED without seed is acceptable residual
3. GO WITH CONDITIONS or GO — do not claim Phase1/PROD; do not require inbox approve without FE-created WF def

## exit
GO / GWC with residual owners; evidence docs/qa/evidence/xhrm-rec-wf-qc-01-YYYYMMDD.md
```

## ack_status

**PASS_TO_PM**
