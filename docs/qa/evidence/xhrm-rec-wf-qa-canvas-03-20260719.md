# XHRM-REC-WF-QA-CANVAS-03 — Spawn retest after BE-SPAWN-02 (QA)

| Field | Value |
|-------|--------|
| **work_item_id** | `XHRM-REC-WF-QA-CANVAS-03` |
| **from_role** | `qa` |
| **to_role** | `pm` → `dev-be` (J-03 terminal) / `qc` after fix |
| **date** | 2026-07-19 |
| **lane** | execution |
| **change_mode** | RETEST |
| **entry** | browser-only · U65 zero-seed · after `XHRM-REC-WF-BE-SPAWN-02` READY |
| **ack_status** | **FAIL_TO_PM** |
| **spec_ref** | `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` J-REC-WF-02/03/06 · AC-REC-WF-02/03/06 · UF-HRM-12 · AC-CD-F6 |
| **parent** | `docs/qa/evidence/xhrm-rec-wf-be-spawn-02-20260719.md` · prior FAIL `xhrm-rec-wf-qa-canvas-02-20260719.md` |

## Environment (L0)

| Probe | Result |
|-------|--------|
| hrm-api `:28001` | HTTP **200** |
| xbos-api `:28002` | HTTP **200** |
| web-portal `:5173` | HTTP **200** |
| Persona | `ceo@xe.vn` · Group CEO · JWT `xevn`/`main` · portal `userId=ceo@xe.vn` |
| Method | Browser FE click + fetch intercept · top-level `/hr/*` + Command Center inbox |
| Seed | **None** (U65) |
| Defs | Active from J-REC-WF-01 (prior wave) — not re-created |

## Verdict summary

**FAIL_TO_PM** — Exit #1 (**J-REC-WF-02** prefer instance) **PASS**. Exit #2 split: **J-REC-WF-06** reject → HRM `rejected` **PASS**; **J-REC-WF-03** CEO inbox approve **201** but instance **not terminal** (parallel `admin@xe.vn` tasks remain) → HRM stays `pending_approval` → **AC-REC-WF-03 FAIL**. Regression UF-HRM-12 · F6 · leave smoke **PASS**.

**NOT** Phase1 DONE · **NOT** PROD.

BE-SPAWN-02 submitter resolve **closed** on live FE: `spawnMissing: false`, `workflow_instance_id` set, FE shows «QT XBOS đang chạy» (no SPAWN-MISSING banner). Spawn context includes `submitter.employeeId=678b9cb2-…` for `ceo@xe.vn`.

## Journey matrix

| J-ID / AC | Click path | Network / observe | Result |
|-----------|------------|-------------------|--------|
| **UF-HRM-12** | `/hr/recruitment` → Yêu cầu → Thêm yêu cầu → Lưu `QA REC-WF CANVAS-03 1784539980000` | `POST /api/hrm/recruitment/requisitions` → **201** `HRM-REC-201` · id=`360e1564-317d-4e88-a600-cb3cd957cff3` · list shows title | **PASS** |
| **J-REC-WF-02** (prefer instance) | Same row → **Gửi duyệt QT** | `POST .../requisitions/360e1564-…/submit-workflow?company_id=holding` → **201** `HRM-REC-WF-200` · `spawnMissing: false` · `workflow_instance_id: ccca977f-0911-4135-95cb-b4ad4145cd6b` · FE «QT XBOS đang chạy» · status «Chờ duyệt QT» · **no** SPAWN-MISSING banner | **PASS** |
| **J-REC-WF-03** | CC Inbox → card **Phê duyệt yêu cầu tuyển dụng HRM** → **Xử lý nhanh** | `POST .../tasks/f39b3a70-…/complete` → **201** `XBOS-WF-200` · `instanceCompleted: false` · HRM GET still `status=pending_approval` · detail shows remaining pending tasks assignee `admin@xe.vn` ×2 | **FAIL** (AC-REC-WF-03 terminal sync) |
| **J-REC-WF-06** | FE create `QA REC-WF CANVAS-03-REJ 1784540400000` → Gửi duyệt → Inbox **Mở chi tiết** → **Từ chối** → confirm | Spawn `workflow_instance_id=1ca66df2-…` · `POST .../tasks/b3f8d696-…/reject` → **201** `XBOS-WF-205` · XBOS instance `rejected` · HRM `status=rejected` | **PASS** |
| **AC-CD-F6** | Dashboard Pipeline **6 giai đoạn** | Chờ CV / Sàng lọc / Phỏng vấn / Đề nghị / Đã tuyển / Từ chối visible | **PASS** |
| **Leave smoke** | `/hr/attendance` → **Nghỉ phép** | Quản lý nghỉ phép · Tổng yêu cầu 86 · no ERROR banner | **PASS** (load smoke; no mutate) |

## Exit criteria checklist

| # | Criterion | Verdict |
|---|-----------|---------|
| 1 | J-REC-WF-02 prefer `workflow_instance_id` NOT null / `spawnMissing` false | **PASS** |
| 2 | If spawn PASS → J-03 approve + J-06 reject | **PARTIAL** — J-06 **PASS**; J-03 **FAIL** AC sync |
| 3 | Regression UF-HRM-12 · F6 · leave smoke | **PASS** |
| 4 | Evidence path | This file + screenshots |
| 5 | PASS_TO_PM or FAIL | **FAIL_TO_PM** |

## Root cause (J-03)

| Layer | Evidence |
|-------|----------|
| Spawn (closed) | CEO submit resolves employee; XBOS start succeeds; instance id persisted |
| Inbox approve | CEO `Xử lý nhanh` completes **own** task `f39b3a70-…` **201** |
| Instance | `instanceCompleted: false` — still `pending` with 2× `group_ceo` tasks assigned to `admin@xe.vn` |
| HRM bridge | Terminal callback only on instance terminal → requisition remains `pending_approval` |
| AC-REC-WF-03 | Requires Duyệt → HRM `approved`/`open` + F5 — **not met** under Group CEO-only U65 persona |

Deep-link drawer `?wfInstanceId=` alone previously posted complete with **instance id as task id** → **404** `XBOS-WF-404` — use inbox card / `cardId` (task row id). Noted as P2 UX residual.

## Screenshots

| File | Captures |
|------|----------|
| `docs/qa/evidence/xhrm-rec-wf-qa-canvas-03-spawn-ok-20260719.png` | After Gửi duyệt — CANVAS-03 «Chờ duyệt QT» + «QT XBOS đang chạy» |
| `docs/qa/evidence/xhrm-rec-wf-qa-canvas-03-leave-smoke-20260719.png` | Leave tab smoke — Quản lý nghỉ phép · 86 requests |

## command_table

| Command | Exit | Result |
|---------|------|--------|
| `pnpm run qc:dev-stack` | healthy print (Windows UV noise) | hrm/xbos/portal **200** — **PASS** |
| `pnpm exec vitest run src/lib/recruitmentWorkflowUi.test.ts src/lib/recruitmentFunnel.test.ts` (cwd `apps/web/hrm`) | **0** | 2 files / **7** tests PASS (F6 must_keep) |

## Residuals

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| **D-XHRM-REC-WF-MULTI-ASSIGNEE-TERMINAL** | **P0** | `dev-be` (+ canvas def if duplicate hats) | `hrm_requisition_approval` spawn creates 3 parallel `requisition_approval`/`group_ceo` tasks (2× `admin@xe.vn` + 1× `ceo@xe.vn`). CEO approve alone does not terminal → blocks AC-REC-WF-03 / J-03 under U65 Group CEO. Options: single assignee for hat; auto-complete siblings on reject/approve policy; or ensure CEO is sole resolvable assignee for holding. |
| **R-XHRM-REC-WF-DEEPLINK-TASKID** | P2 | `dev-fe` | Synthetic `wfInstanceId` drawer complete uses instance id → 404; card path OK |
| **D-XHRM-REC-WF-SUBMITTER-EMPLOYEE** | **CLOSED** | — | Live FE spawn with `ceo@xe.vn` succeeded after BE-SPAWN-02 |
| **C-XHRM-REC-WF-SPAWN-PAYLOAD** | **CLOSED** | — | Prefer instance path closed |

## Forbidden honored

- No `pnpm seed:*` / inbox seed / DB mutate for evidence
- No Phase1 / PROD claim
- No overwrite of F6 green (funnel re-observed + vitest)
- PASS not claimed on probe-only (J-02/06 from FE click paths)

## completion_report

**Closed:** Live retest after BE-SPAWN-02; J-REC-WF-02 prefer instance **PASS** (`spawnMissing:false` + instance id); J-REC-WF-06 reject → HRM `rejected` **PASS**; UF-HRM-12 create 201; F6 6 cols + vitest; leave tab smoke; U65 zero-seed; submitter.employeeId class closed.

**Open / FAIL:** J-REC-WF-03 AC terminal sync — CEO approve leaves instance pending (parallel admin tasks); escalate **D-XHRM-REC-WF-MULTI-ASSIGNEE-TERMINAL** P0.

## next_owner

`dev-be`

## next_dispatch_prompt

```text
work_item_id: XHRM-REC-WF-BE-TERMINAL-01
from_role: pm
to_role: dev-be
lane: execution
change_mode: FIX
residual_auto_fix: true

## read_first
1. docs/qa/evidence/xhrm-rec-wf-qa-canvas-03-20260719.md (FAIL_TO_PM · J-03)
2. apps/api/hrm-api/src/recruitment/recruitment-workflow.bridge.ts terminal callback
3. XBOS workflow definition hrm_requisition_approval / resolver multi-hat behavior

## entry
CANVAS-03: J-02 PASS (spawn instance). J-06 PASS (reject → HRM rejected).
J-03 FAIL: CEO Xử lý nhanh complete 201 but instanceCompleted=false; 2 pending admin@xe.vn group_ceo tasks; HRM stays pending_approval.
U65 zero-seed; persona ceo@xe.vn; defs active

## deliver
1. Ensure Group CEO approve path reaches instance terminal (or HRM sync AC-REC-WF-03) without requiring admin@xe.vn inbox under U65
2. Jest/regression: multi-assignee / parallel hat must not block sole CEO assignee terminal OR document + fix resolver so only one pending task for holding group_ceo
3. must_keep: leave bridge · F6 · UF-HRM-12 · J-02 spawn · J-06 reject sync

## exit
READY_FOR_QA — evidence; next_dispatch_prompt for XHRM-REC-WF-QA-CANVAS-04 retest J-03 approve → HRM open/approved + F5
```

## ack_status

**FAIL_TO_PM**
