# XHRM-REC-WF-QA-01 — Recruitment Workflow Bridge (QA)

| Field | Value |
|-------|--------|
| **work_item_id** | `XHRM-REC-WF-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-07-19 |
| **lane** | execution |
| **entry** | browser-only · U65 zero-seed · FE+BE READY |
| **ack_status** | **FAIL_TO_PM** |
| **spec_ref** | `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` J-REC-WF-01..06 · AC-REC-WF-* · UF-HRM-12 · AC-CD-F6-* |

## Environment (L0)

| Probe | Result |
|-------|--------|
| hrm-api `:28001` | HTTP **200** |
| xbos-api `:28002` | HTTP **200** |
| web-portal `:5173` | HTTP **200** |
| Persona | `ceo@xe.vn` / Group CEO · JWT `xevn`/`main` |
| Method | Browser FE click path + Network (fetch intercept) · top-level `/hr/recruitment` (same-origin) |
| Seed | **None** (U65) |

## Verdict summary

**FAIL_TO_PM** — P0 on `POST .../requisitions/:id/submit-workflow` (**500** `tenantId?.trim is not a function`) blocks J-REC-WF-02 happy/alternate on requisition path. Candidate `start-pipeline` **SPAWN-MISSING** banner **PASS**. UF-HRM-12 + AC-CD-F6 6 columns **PASS**. Inbox approve/reject **🟡 BLOCKED** (no instance → no task; cấm seed).

## Journey matrix (L2.5)

| J-ID | Click path | Network | Result |
|------|------------|---------|--------|
| **J-REC-WF-01** | Portal → `settings=workflow` → list «Hệ thống quy trình» + **Thêm quy trình mới** | Definitions UI load | **PARTIAL** — canvas reachable; **no** `hrm_recruitment_*` / `hrm_requisition_*` / `hrm_candidate_pipeline` codes observed in UI list (alternate SPAWN-MISSING expected). Did not create new def this wave (downstream blocked by req 500). |
| **J-REC-WF-02** | Recruitment → Yêu cầu → **Gửi duyệt QT** on `QA REC-WF UF12 20260719` | `POST .../requisitions/{id}/submit-workflow?company_id=holding` → **500** `HRM-SYS-001` `tenantId?.trim is not a function` | **FAIL** — neither 2xx spawn nor SPAWN-MISSING banner |
| **J-REC-WF-03** | XBOS Inbox → Duyệt → HRM sync | N/A | **🟡 BLOCKED** — no inbox task (spawn never produced `workflow_instance_id`); U65 cấm seed inbox |
| **J-REC-WF-04** | Ứng viên → Tất cả ứng viên → **Bắt đầu QT** | `POST .../candidates-pool/{id}/start-pipeline?company_id=main` → **201** `HRM-REC-CP-WF-200` · `spawnMissing: true` · `workflow_instance_id: null` | **PARTIAL PASS** — SPAWN-MISSING banner + toast; LOCKED / stage-sync after inbox **N/A** (no active instance) |
| **J-REC-WF-05** | Dashboard Tuyển dụng · Pipeline 6 giai đoạn | Aggregate live | **PASS** — Chờ CV/Mới · Sàng lọc · Phỏng vấn · Đề nghị · Đã tuyển · Từ chối |
| **J-REC-WF-06** | Inbox Từ chối | N/A | **🟡 BLOCKED** — same as J-03 (no FE-sourced inbox task) |

## Exit criteria checklist

| # | Criterion | Verdict |
|---|-----------|---------|
| 1 | J-REC-WF-01..06 FE click + Network 2xx where applicable | **FAIL** (J-02 500; J-03/06 blocked) |
| 2 | SPAWN-MISSING banner when spawn null | **PASS** on candidate start-pipeline (screenshot) |
| 3 | LOCKED when `workflow_instance_id` active | **N/A / not exercised** — no active instance after spawn miss |
| 4 | AC-CD-F6 6 columns intact | **PASS** |
| 5 | UF-HRM-12 create without WF | **PASS** — POST **201** `HRM-REC-201`; list + F5/detail persist; `workflow_instance_id: null` |
| 6 | Evidence path | This file |
| 7 | PASS_TO_PM or FAIL + residuals | **FAIL_TO_PM** |

## must_keep regression

| ID | Evidence | Verdict |
|----|----------|---------|
| **UF-HRM-12** | Create «QA REC-WF UF12 20260719» → POST `/api/hrm/recruitment/requisitions` **201** · company_id=`holding` · list refresh · detail J-HRM-05 | **PASS** |
| **J-HRM-05** | Chi tiết dialog: title/department/status/holding + «Gửi duyệt QT» / «Sửa trạng thái» when unlocked | **PASS** |
| **AC-CD-F6-*** | Dashboard «Pipeline ứng viên (6 giai đoạn)» 6 labels | **PASS** |
| Leave / Catalog bridges | Not mutated this wave; leave smoke deferred (not in blocker chain) | **N/A** (no regression observed on recruitment FE) |

## Root cause (P0) — code cite

`submitJobRequisitionWorkflow` passes **full headers object** into `toHrmListScopeContext`, which expects `string | undefined` and calls `.trim()`:

```526:526:apps/api/hrm-api/src/recruitment/recruitment.controller.ts
        toHrmListScopeContext(headers),
```

Sibling endpoints correctly use `toHrmListScopeContext(tenantId)`. Plan `submit-workflow` and candidate `start-pipeline` controllers do **not** use this buggy call — consistent with start-pipeline **201** SPAWN-MISSING working.

## Screenshots

| File | Captures |
|------|----------|
| `docs/qa/evidence/xhrm-rec-wf-qa-01-spawn-missing-20260719.png` | Candidate list + yellow **SPAWN-MISSING** banner after Bắt đầu QT |

## Residuals (dispatch)

| ID | Severity | Owner | Symptom | Fix hint |
|----|----------|-------|---------|----------|
| **D-XHRM-REC-WF-SUBMIT-SCOPE** | **P0** | **dev-be** | Requisition `submit-workflow` **500** `tenantId?.trim is not a function` | Change `toHrmListScopeContext(headers)` → `toHrmListScopeContext(tenantId)`; add jest regression on submit-workflow controller/service |
| **R-XHRM-REC-WF-NO-DEF** | P2 / expected | PM / XBOS admin (FE canvas) | No recruitment workflow_code in canvas list | J-REC-WF-01 create active `hrm_requisition_approval` / `hrm_candidate_pipeline` via FE after P0 fix — still **no seed** |
| **R-XHRM-REC-WF-LOCKED-UNTESTED** | P2 | qa (retest) | LOCKED UI/409 not browser-proven | After spawn OK with instance id |

## Forbidden honored

- No `pnpm seed:*` / inbox seed
- No Phase1 / PROD claim
- No overwrite of F6 green without regression (F6 funnel re-verified PASS)

## completion_report

Closed: U65 browser matrix for REC-WF; UF-HRM-12 + F6 + SPAWN-MISSING (candidate) evidence; P0 root-cause identified on requisition submit controller.

Open: J-REC-WF-02 FAIL (500); J-03/06 blocked; LOCKED untested; recruitment WF definitions absent on canvas.

## next_owner

`dev-be` (P0 fix) → `qa` retest → `qc` only after QA PASS

## next_dispatch_prompt

```text
work_item_id: XHRM-REC-WF-BE-02
from_role: pm
to_role: dev-be
lane: execution
change_mode: FIX
residual_auto_fix: true

## read_first
1. docs/qa/evidence/xhrm-rec-wf-qa-01-20260719.md (P0 D-XHRM-REC-WF-SUBMIT-SCOPE)
2. apps/api/hrm-api/src/recruitment/recruitment.controller.ts submitJobRequisitionWorkflow
3. apps/api/hrm-api/src/common/hrm-list-scope-context.ts

## deliver
1. Fix toHrmListScopeContext(headers) → toHrmListScopeContext(tenantId) on requisition submit-workflow
2. Jest: submit-workflow returns 2xx with spawnMissing true when definition missing (not 500)
3. Do not touch leave/catalog bridges; no F6 enum REPLACE; no seed

## exit
READY_FOR_QA + evidence docs/qa/evidence/xhrm-rec-wf-be-02-YYYYMMDD.md
pm_dispatch_hint: XHRM-REC-WF-QA-02 retest J-REC-WF-02 submit → SPAWN-MISSING or instance; then J-03/06 if def exists via FE canvas
```

## ack_status

**FAIL_TO_PM**
