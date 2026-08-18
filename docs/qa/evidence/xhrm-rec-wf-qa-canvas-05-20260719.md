# XHRM-REC-WF-QA-CANVAS-05 — Complete instance-id remap retest (QA)

| Field | Value |
|-------|--------|
| **work_item_id** | `XHRM-REC-WF-QA-CANVAS-05` |
| **from_role** | `qa` |
| **to_role** | `pm` → `qc` (wave gate) |
| **date** | 2026-07-19 |
| **lane** | execution |
| **change_mode** | RETEST |
| **entry** | browser-only · U65 zero-seed · after `XHRM-REC-WF-BE-COMPLETE-INSTANCE-01` READY |
| **ack_status** | **PASS_TO_PM** |
| **spec_ref** | `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` J-REC-WF-02/03/06 · AC-REC-WF-02/03/06 · UF-HRM-12 · AC-CD-F6 |
| **parent** | `docs/qa/evidence/xhrm-rec-wf-be-complete-instance-01-20260719.md` · prior FAIL `xhrm-rec-wf-qa-canvas-04-20260719.md` |

## Environment (L0)

| Probe | Result |
|-------|--------|
| hrm-api `:28001` | HTTP **200** |
| xbos-api `:28002` | HTTP **200** — **reloaded** with COMPLETE-INSTANCE-01 dist (`notifyInstance` / `id: instanceId` in `completeStepTask`); stale TERMINAL-01 PID killed; clean rebuild (tsbuildinfo wipe) → `node dist/main.js` PID ~31000 / shell `589795` |
| web-portal `:5173` | HTTP **200** |
| Persona | `ceo@xe.vn` · Group CEO · JWT `xevn`/`main` · portal `userId=ceo@xe.vn` |
| Method | Browser FE click + fetch intercept · top-level `/hr/*` + Command Center inbox |
| Seed | **None** (U65) |
| Defs | Active from prior waves — not re-created |
| admin@xe.vn inbox | **Not opened** |

## Verdict summary

**PASS_TO_PM** — BE-COMPLETE-INSTANCE-01 **closed** live: CEO approve → XBOS `instanceCompleted: true` → HRM terminal callback **201** (no `instance_mismatch`) → requisition `status=open` («Đang tuyển») + F5. J-02 / J-06 / UF-12 / F6 / leave regress **PASS**.

**NOT** Phase1 DONE · **NOT** PROD.

## Journey matrix

| J-ID / AC | Click path | Network / observe | Result |
|-----------|------------|-------------------|--------|
| **UF-HRM-12** | `/hr/recruitment` → Yêu cầu → Thêm yêu cầu → Lưu `QA REC-WF CANVAS-05 1784562000000` | `POST /api/hrm/recruitment/requisitions` → **201** `HRM-REC-201` · id=`ecfb288a-158d-4fec-9155-666cc828086f` · list shows title | **PASS** |
| **J-REC-WF-02** (prefer instance) | Same row → **Gửi duyệt QT** | `POST .../submit-workflow?company_id=holding` → **201** `HRM-REC-WF-200` · `spawnMissing: false` · `workflow_instance_id: 64a74167-c6de-495d-9e11-feaa62a75cdc` · status `pending_approval` · FE «QT XBOS đang chạy» · `parallelPolicy: any` | **PASS** |
| **J-REC-WF-03** | CC Inbox → **Xử lý nhanh** on CEO task `6b8813dd-…` (no admin login) | `POST .../tasks/6b8813dd-…/complete` → **201** `XBOS-WF-200` · **`instanceCompleted: true`** · HRM GET `status=open` · hrm-api: `POST .../recruitment/workflow/terminal` **201** (no `instance_mismatch`) · F5 list «Đang tuyển» | **PASS** |
| **J-REC-WF-06** | FE create `QA REC-WF CANVAS-05-REJ 1784563000000` → Gửi duyệt → Inbox **Mở chi tiết** → **Từ chối nhiệm vụ** → confirm **Từ chối** | Spawn `workflow_instance_id=73e3a1f3-…` · `POST .../tasks/e5c9b132-…/reject` → **201** `XBOS-WF-205` · HRM GET `status=rejected` | **PASS** |
| **AC-CD-F6** | Dashboard Pipeline **6 giai đoạn** | Chờ CV / Sàng lọc / Phỏng vấn / Đề nghị / Đã tuyển / Từ chối visible · vitest 7/7 | **PASS** |
| **Leave smoke** | `/hr/attendance` → **Nghỉ phép** | Quản lý nghỉ phép · Tổng yêu cầu **86** · no ERROR banner | **PASS** (load smoke; no mutate) |

## Exit criteria checklist

| # | Criterion | Verdict |
|---|-----------|---------|
| 1 | J-03: create → Gửi duyệt → Inbox CEO Xử lý nhanh → `instanceCompleted: true` → HRM `approved`\|`open` → F5 (no instance_mismatch) | **PASS** — HRM `open` / FE «Đang tuyển»; terminal **201** |
| 2 | Regress J-02 / J-06 / UF-HRM-12 / F6 / leave — no admin@xe.vn | **PASS** (all listed) |
| 3 | Evidence path | This file |
| 4 | PASS_TO_PM or FAIL | **PASS_TO_PM** |

## Root cause closed (vs CANVAS-04)

| Layer | CANVAS-04 | CANVAS-05 |
|-------|-----------|-----------|
| XBOS complete notify | `workflowInstanceId = task.id` → HRM skip | `notifyInstance.id = instanceId` → terminal **201** |
| HRM after CEO approve | stayed `pending_approval` | `open` + F5 «Đang tuyển» |
| Multi-assignee any-of-hat | already PASS (TERMINAL-01) | still PASS (`instanceCompleted: true`) |

hrm-api log excerpt (approve):

```text
HRM-REC-WF-CALLBACK-SKIP reason=plan_req_step_noop ... id=ecfb288a-...
POST /api/hrm/recruitment/workflow/step → 201
POST /api/hrm/recruitment/workflow/terminal → 201
```

No `reason=instance_mismatch` for `ecfb288a`.

## Screenshots

| File | Captures |
|------|----------|
| `docs/qa/evidence/xhrm-rec-wf-qa-canvas-05-leave-smoke-20260719.png` | Leave tab smoke — Quản lý nghỉ phép · 86 requests |
| `docs/qa/evidence/xhrm-rec-wf-qa-canvas-05-f6-20260719.png` | Recruitment dashboard (pipeline 6 stages present) |

## command_table

| Command | Exit | Result |
|---------|------|--------|
| L0 probes `:28001`/`:28002`/`:5173` | healthy | **PASS** |
| xbos-api rebuild + reload | — | dist has `notifyInstance`; PID fresh |
| `pnpm exec vitest run src/lib/recruitmentWorkflowUi.test.ts src/lib/recruitmentFunnel.test.ts` (cwd `apps/web/hrm`) | **0** | 2 files / **7** tests PASS (F6 must_keep) |

## Residuals

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| **D-XHRM-REC-WF-COMPLETE-INSTANCE-ID** | **CLOSED** | — | Live J-03 HRM sync PASS |
| **R-XHRM-REC-WF-DEEPLINK-TASKID** | P2 | `dev-fe` | Carry — synthetic `wfInstanceId` drawer briefly POSTed reject with **instance id** → 404; card/drawer path with task `cardId` OK (J-06 used task `e5c9b132-…`) |

## Forbidden honored

- No `pnpm seed:*` / inbox seed / DB mutate for evidence
- No Phase1 / PROD claim
- No overwrite of F6 green (funnel re-observed + vitest)
- No requirement to open `admin@xe.vn` for XBOS terminal
- PASS not claimed on probe-only (J-02/03/06 from FE click paths)

## completion_report

**Closed:** Retest after BE-COMPLETE-INSTANCE-01 + xbos reload; J-03 approve → `instanceCompleted: true` → HRM `open` + F5 **PASS** (no instance_mismatch); J-02 prefer instance **PASS**; J-06 reject → HRM `rejected` **PASS**; UF-HRM-12 create 201; F6 6 cols + vitest; leave smoke; U65 zero-seed.

**Open:** P2 deep-link taskId residual only (carry).

## next_owner

`qc`

## next_dispatch_prompt

```text
work_item_id: XHRM-REC-WF-QC-CANVAS-05
from_role: pm
to_role: qc
lane: governance
change_mode: GATE

## entry
XHRM-REC-WF-QA-CANVAS-05 PASS_TO_PM — evidence docs/qa/evidence/xhrm-rec-wf-qa-canvas-05-20260719.md
J-03 closed (complete instance-id remap); J-02/J-06/UF12/F6/leave PASS; U65 zero-seed

## deliver
1. Audit evidence vs AC-REC-WF-03 / J-REC-WF-03 — confirm no instance_mismatch; HRM open after CEO approve
2. GWC or GO for rec-wf canvas wave; retain P2 R-XHRM-REC-WF-DEEPLINK-TASKID as condition if needed
3. Evidence docs/qa/evidence/xhrm-rec-wf-qc-canvas-05-20260719.md

## exit
GO / GWC / NO-GO; cấm seed · Phase1/PROD
```

## ack_status

**PASS_TO_PM**
