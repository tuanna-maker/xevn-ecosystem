# XHRM-REC-WF-QA-CANVAS-04 — Terminal retest after BE-TERMINAL-01 (QA)

| Field | Value |
|-------|--------|
| **work_item_id** | `XHRM-REC-WF-QA-CANVAS-04` |
| **from_role** | `qa` |
| **to_role** | `pm` → `dev-be` (approve terminal callback id) |
| **date** | 2026-07-19 |
| **lane** | execution |
| **change_mode** | RETEST |
| **entry** | browser-only · U65 zero-seed · after `XHRM-REC-WF-BE-TERMINAL-01` READY |
| **ack_status** | **FAIL_TO_PM** |
| **spec_ref** | `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` J-REC-WF-02/03/06 · AC-REC-WF-02/03/06 · UF-HRM-12 · AC-CD-F6 |
| **parent** | `docs/qa/evidence/xhrm-rec-wf-be-terminal-01-20260719.md` · prior FAIL `xhrm-rec-wf-qa-canvas-03-20260719.md` |

## Environment (L0)

| Probe | Result |
|-------|--------|
| hrm-api `:28001` | HTTP **200** |
| xbos-api `:28002` | HTTP **200** — **reloaded** with TERMINAL-01 dist (`applySameStepHatAnyPolicy` / `stampAnyOfSameHatPolicy`); stale PID 26764 (18:36) killed; fresh `node dist/main.js` PID ~28884 @ 20:10 |
| web-portal `:5173` | HTTP **200** |
| Persona | `ceo@xe.vn` · Group CEO · JWT `xevn`/`main` · portal `userId=ceo@xe.vn` |
| Method | Browser FE click + fetch intercept · top-level `/hr/*` + Command Center inbox |
| Seed | **None** (U65) |
| Defs | Active from prior waves — not re-created |
| admin@xe.vn inbox | **Not opened** (confirmed not required for XBOS instance terminal) |

## Verdict summary

**FAIL_TO_PM** — BE-TERMINAL-01 **partial close**: CEO-only approve now yields XBOS `instanceCompleted: true` + sibling `admin@xe.vn` task **skipped** (`parallelPolicy=any`) — multi-assignee block **closed**. **AC-REC-WF-03 / J-REC-WF-03 still FAIL**: HRM requisition remains `pending_approval` after terminal callback because XBOS `completeStepTask` sends **task id** as `workflowInstanceId` → HRM bridge `HRM-REC-WF-CALLBACK-SKIP reason=instance_mismatch`. Reject path (J-06) remaps `id: instance_id` → HRM `rejected` **PASS**.

**NOT** Phase1 DONE · **NOT** PROD.

## Journey matrix

| J-ID / AC | Click path | Network / observe | Result |
|-----------|------------|-------------------|--------|
| **UF-HRM-12** | `/hr/recruitment` → Yêu cầu → Thêm yêu cầu → Lưu `QA REC-WF CANVAS-04 1784550000000` | `POST /api/hrm/recruitment/requisitions` → **201** `HRM-REC-201` · id=`784509c3-b5d6-47b0-9a42-361db4c679f8` · list shows title | **PASS** |
| **J-REC-WF-02** (prefer instance) | Same row → **Gửi duyệt QT** | `POST .../submit-workflow?company_id=holding` → **201** `HRM-REC-WF-200` · `spawnMissing: false` · `workflow_instance_id: 49b385f8-b65e-4d91-9097-031a05820d64` · status `pending_approval` · FE «QT XBOS đang chạy» · spawn task payload has `parallelPolicy: any` + `parallelGroupId` | **PASS** |
| **J-REC-WF-03** | CC Inbox → **Xử lý nhanh** on CEO task `a4e08de5-…` (no admin login) | `POST .../tasks/a4e08de5-…/complete` → **201** `XBOS-WF-200` · **`instanceCompleted: true`** · XBOS instance `completed` · admin sibling `dd1db7c4-…` status `skipped` · HRM GET still `status=pending_approval` · hrm-api log: `HRM-REC-WF-CALLBACK-SKIP reason=instance_mismatch` · FE F5 list still «Chờ duyệt QT» | **FAIL** (AC terminal sync to HRM `open`/`approved`) |
| **J-REC-WF-06** | FE create `QA REC-WF CANVAS-04-REJ 1784551000000` → Gửi duyệt → Inbox **Mở chi tiết** → **Từ chối nhiệm vụ** → confirm **Từ chối** | Spawn `workflow_instance_id=284db120-…` · `POST .../tasks/59656e16-…/reject` → **201** `XBOS-WF-205` · HRM GET `status=rejected` · terminal callback **201** (no instance_mismatch) | **PASS** |
| **AC-CD-F6** | Dashboard Pipeline **6 giai đoạn** | Chờ CV / Sàng lọc / Phỏng vấn / Đề nghị / Đã tuyển / Từ chối visible · vitest 7/7 | **PASS** |
| **Leave smoke** | `/hr/attendance` → **Nghỉ phép** | Quản lý nghỉ phép · Tổng yêu cầu **86** · no ERROR banner | **PASS** (load smoke; no mutate) |

## Exit criteria checklist

| # | Criterion | Verdict |
|---|-----------|---------|
| 1 | J-03: create → Gửi duyệt → Inbox CEO Xử lý nhanh → `instanceCompleted: true` → HRM `approved`\|`open` → F5 | **FAIL** — XBOS terminal **PASS**; HRM sync **FAIL** (`instance_mismatch`) |
| 2 | Regress J-02 / J-06 / UF-HRM-12 / F6 / leave — no admin@xe.vn | **PASS** (all listed) |
| 3 | Evidence path | This file |
| 4 | PASS_TO_PM or FAIL | **FAIL_TO_PM** |

## Root cause (J-03 HRM sync)

| Layer | Evidence |
|-------|----------|
| Spawn any-of-hat (CLOSED vs CANVAS-03) | New spawn stamps `parallelPolicy: any`; CEO complete → sibling admin **skipped**; `instanceCompleted: true` |
| XBOS instance | `GET .../instances/49b385f8-…/detail` → status **`completed`** |
| Terminal callback body bug | `completeStepTask` calls `notifyHrmRecruitmentCallback(task, 'terminal', …)` with raw task row → `workflowInstanceId = task.id` (`a4e08de5-…`) |
| HRM bridge | Stored `workflow_instance_id=49b385f8-…` ≠ payload task id → **`instance_mismatch` skip** · status stays `pending_approval` |
| Contrast reject | `rejectStepTask` remaps `{ ...before, id: before.instance_id }` before notify → J-06 HRM `rejected` **PASS** |

Code contrast:

- Reject (works): `notifyHrmRecruitmentCallback({ ...before, id: before.instance_id }, 'terminal', …)`
- Complete (broken): `notifyHrmRecruitmentCallback(task, 'terminal', …)` where `task.id` is step-task UUID

## Screenshots

| File | Captures |
|------|----------|
| `docs/qa/evidence/xhrm-rec-wf-qa-canvas-04-leave-smoke-20260719.png` | Leave tab smoke — Quản lý nghỉ phép · 86 requests |

## command_table

| Command | Exit | Result |
|---------|------|--------|
| `pnpm run qc:dev-stack` | healthy print (Windows UV noise) | hrm/xbos/portal **200** — **PASS** |
| xbos-api reload | — | killed stale 18:36 process; started dist with TERMINAL-01 symbols |
| `pnpm exec vitest run src/lib/recruitmentWorkflowUi.test.ts src/lib/recruitmentFunnel.test.ts` (cwd `apps/web/hrm`) | **0** | 2 files / **7** tests PASS (F6 must_keep) |

## Residuals

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| **D-XHRM-REC-WF-COMPLETE-INSTANCE-ID** | **P0** | `dev-be` | Approve/complete terminal callback must send **instance id** (mirror reject remap). Until fixed, AC-REC-WF-03 / J-03 cannot PASS under U65 Group CEO. |
| **D-XHRM-REC-WF-MULTI-ASSIGNEE-TERMINAL** | **CLOSED** (XBOS layer) | — | Live FE: `instanceCompleted: true` without admin inbox |
| **R-XHRM-REC-WF-DEEPLINK-TASKID** | P2 | `dev-fe` | Carry — synthetic `wfInstanceId` drawer complete uses instance id → 404; card path OK |

## Forbidden honored

- No `pnpm seed:*` / inbox seed / DB mutate for evidence
- No Phase1 / PROD claim
- No overwrite of F6 green (funnel re-observed + vitest)
- No requirement to open `admin@xe.vn` for XBOS terminal
- PASS not claimed on probe-only (J-02/03/06 from FE click paths)

## completion_report

**Closed:** Retest after BE-TERMINAL-01 + xbos reload; J-02 prefer instance **PASS**; XBOS multi-assignee any-of-hat terminal **PASS** (`instanceCompleted: true`, admin skipped, no admin inbox); J-06 reject → HRM `rejected` **PASS**; UF-HRM-12 create 201; F6 6 cols + vitest; leave smoke; U65 zero-seed.

**Open / FAIL:** J-REC-WF-03 AC HRM sync — terminal callback `instance_mismatch` (complete sends task id); escalate **D-XHRM-REC-WF-COMPLETE-INSTANCE-ID** P0.

## next_owner

`dev-be`

## next_dispatch_prompt

```text
work_item_id: XHRM-REC-WF-BE-COMPLETE-INSTANCE-01
from_role: pm
to_role: dev-be
lane: execution
change_mode: FIX
residual_auto_fix: true

## read_first
1. docs/qa/evidence/xhrm-rec-wf-qa-canvas-04-20260719.md (FAIL_TO_PM · instance_mismatch)
2. apps/api/xbos-api/src/workflow-engine/workflow-engine.service.ts — completeStepTask notifyHrmRecruitmentCallback(task) vs rejectStepTask remap id: instance_id
3. apps/api/hrm-api/src/recruitment/recruitment-workflow.bridge.ts handleRequisitionTerminal instance_mismatch guard

## entry
CANVAS-04: J-02 PASS; XBOS CEO approve instanceCompleted=true + admin skipped PASS; J-06 PASS.
J-03 FAIL: HRM stays pending_approval; log HRM-REC-WF-CALLBACK-SKIP reason=instance_mismatch because complete sends task.id as workflowInstanceId.
U65 zero-seed; persona ceo@xe.vn; defs active

## deliver
1. Mirror reject path: remap notify payload id/workflowInstanceId to instance_id on complete/terminal (and step if needed)
2. Jest: complete → terminal callback body uses instance UUID; must_keep reject path + leave notify + parallel any
3. READY_FOR_QA — next XHRM-REC-WF-QA-CANVAS-05 retest J-03 → HRM open|approved + F5

## exit
READY_FOR_QA — evidence; cấm seed · Phase1/PROD
```

## ack_status

**FAIL_TO_PM**
