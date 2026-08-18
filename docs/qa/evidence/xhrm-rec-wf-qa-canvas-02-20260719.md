# XHRM-REC-WF-QA-CANVAS-02 — Spawn retest after BE-SPAWN-01 (QA)

| Field | Value |
|-------|--------|
| **work_item_id** | `XHRM-REC-WF-QA-CANVAS-02` |
| **from_role** | `qa` |
| **to_role** | `pm` → `dev-be` |
| **date** | 2026-07-19 |
| **lane** | execution |
| **change_mode** | RETEST |
| **entry** | browser-only · U65 zero-seed · after `XHRM-REC-WF-BE-SPAWN-01` READY |
| **ack_status** | **FAIL_TO_PM** |
| **spec_ref** | `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` J-REC-WF-02/03/06 · AC-REC-WF-02 · UF-HRM-12 · AC-CD-F6 |
| **parent** | `docs/qa/evidence/xhrm-rec-wf-be-spawn-01-20260719.md` · prior FAIL `xhrm-rec-wf-qa-canvas-01-20260719.md` |

## Environment (L0)

| Probe | Result |
|-------|--------|
| hrm-api `:28001` | HTTP **200** |
| xbos-api `:28002` | HTTP **200** |
| web-portal `:5173` | HTTP **200** |
| Persona | `ceo@xe.vn` · Group CEO · JWT `xevn`/`main` · portal `userId=ceo@xe.vn` |
| Method | Browser FE click + fetch intercept · top-level `/hr/*` |
| Seed | **None** (U65) |
| Defs | Assumed active from J-REC-WF-01 (prior wave) — not re-created |

## Verdict summary

**FAIL_TO_PM** — Exit #1 (prefer `workflow_instance_id` / `spawnMissing: false`) **FAIL**.

BE-SPAWN-01 **partially** closed the prior class: no longer XBOS `400` `XBOS-WF-400` missing fields. Live submit now fail-closes **before** XBOS with:

`HRM-REC-WF-SPAWN-MISSING: submitter.employeeId unresolved … userId=ceo@xe.vn`

FE still shows yellow SPAWN-MISSING banner; entity `pending_approval`; `workflow_instance_id: null`. **J-REC-WF-03 / J-06** remain **🟡 BLOCKED** (U65 cấm seed inbox).

Regression **UF-HRM-12** · **AC-CD-F6** · leave tab smoke **PASS**.

**NOT** Phase1 DONE · **NOT** PROD.

## Journey matrix

| J-ID / AC | Click path | Network / observe | Result |
|-----------|------------|-------------------|--------|
| **UF-HRM-12** | `/hr/recruitment` → Yêu cầu → Thêm yêu cầu → Lưu `QA REC-WF CANVAS-02 1784480000000` | `POST /api/hrm/recruitment/requisitions` → **201** `HRM-REC-201` · id=`e26cdde6-7ce8-462a-aed3-2c42e3c7ff32` · list shows title | **PASS** |
| **J-REC-WF-02** (prefer instance) | Same row → **Gửi duyệt QT** | `POST .../requisitions/e26cdde6-…/submit-workflow?company_id=holding` → **201** `HRM-REC-WF-200` · `spawnMissing: true` · `workflow_instance_id: null` · banner SPAWN-MISSING · status «Chờ duyệt QT» | **FAIL** |
| **J-REC-WF-03** | Inbox Duyệt → HRM sync → F5 | N/A | **🟡 BLOCKED** — no instance |
| **J-REC-WF-06** | Inbox Từ chối | N/A | **🟡 BLOCKED** — same |
| **AC-CD-F6** | Dashboard Pipeline **6 giai đoạn** | Chờ CV / Sàng lọc / Phỏng vấn / Đề nghị / Đã tuyển / Từ chối visible | **PASS** |
| **Leave smoke** | `/hr/attendance` → **Nghỉ phép** | Quản lý nghỉ phép · Tổng yêu cầu 86 · no ERROR banner | **PASS** (load smoke; no mutate) |

## Exit criteria checklist

| # | Criterion | Verdict |
|---|-----------|---------|
| 1 | J-REC-WF-02 prefer `workflow_instance_id` NOT null / `spawnMissing` false | **FAIL** |
| 2 | If spawn PASS → J-03 approve + J-06 reject | **N/A BLOCKED** |
| 3 | Regression UF-HRM-12 · F6 · leave smoke | **PASS** |
| 4 | Evidence path | This file + screenshot |
| 5 | PASS_TO_PM or FAIL | **FAIL_TO_PM** |

## Root cause (product — class shift)

| Wave | Class | Evidence |
|------|-------|----------|
| CANVAS-01 | Payload incomplete → XBOS **400** | `submitter.employeeId required` |
| **CANVAS-02** | Employee resolve miss → SPAWN-MISSING **before** XBOS | HRM log: `submitter.employeeId unresolved … userId=ceo@xe.vn` (pid on `dev:hrm-api` 692158) |

BE residual note in BE-SPAWN-01 evidence anticipated this: *If `ceo@xe.vn` has no `employees` row → still SPAWN-MISSING (data, not payload)*. Live confirms for Group CEO persona used in all UAT waves.

Portal localStorage user = `{ userId: "ceo@xe.vn", displayName: "CEO Tập đoàn" }` — no employee UUID for FE to pass.

## Screenshots

| File | Captures |
|------|----------|
| `docs/qa/evidence/xhrm-rec-wf-qa-canvas-02-spawn-missing-20260719.png` | After Gửi duyệt — SPAWN-MISSING banner + CANVAS-02 row «Chờ duyệt QT» |

## command_table

| Command | Exit | Result |
|---------|------|--------|
| `pnpm run qc:dev-stack` | healthy print (Windows UV noise) | hrm/xbos/portal **200** — **PASS** |
| `pnpm exec vitest run src/lib/recruitmentWorkflowUi.test.ts src/lib/recruitmentFunnel.test.ts` (cwd `apps/web/hrm`) | **0** | 2 files / **7** tests PASS (F6 must_keep) |

## Residuals

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| **D-XHRM-REC-WF-SUBMITTER-EMPLOYEE** | **P0** | `dev-be` (+ data/ops if employee master) | Group CEO `ceo@xe.vn` cannot resolve `employees.id` → spawn always SPAWN-MISSING under U65; blocks J-02/03/06. Options: ensure employee row for pilot persona **without QA seed in evidence**, OR resolve via membership/JWT claim, OR allow controlled service-account submitter for holding admins. |
| **R-XHRM-REC-WF-J03-J06** | P1 blocked | qa after spawn PASS | Inbox approve/reject only after instance |
| **C-XHRM-REC-WF-SPAWN-PAYLOAD** | **CLOSED class** | — | XBOS-WF-400 missing fields no longer observed on this submit path |

## Forbidden honored

- No `pnpm seed:*` / inbox seed / DB mutate to create employee
- No Phase1 / PROD claim
- No overwrite of F6 green (funnel re-observed + vitest)

## completion_report

**Closed:** Live retest after BE-SPAWN-01; confirmed payload class closed (unresolved employee, not XBOS 400); UF-HRM-12 create 201; F6 6 cols + vitest; leave tab smoke; U65 zero-seed.

**Open / FAIL:** Prefer instance when def active — still SPAWN-MISSING because `ceo@xe.vn` employeeId unresolved; J-03/06 blocked; escalate **D-XHRM-REC-WF-SUBMITTER-EMPLOYEE** P0.

## next_owner

`dev-be`

## next_dispatch_prompt

```text
work_item_id: XHRM-REC-WF-BE-SPAWN-02
from_role: pm
to_role: dev-be
lane: execution
change_mode: FIX
residual_auto_fix: true

## read_first
1. docs/qa/evidence/xhrm-rec-wf-qa-canvas-02-20260719.md (FAIL_TO_PM)
2. apps/api/hrm-api/src/recruitment/recruitment-workflow.bridge.ts resolveSubmitterEmployeeId
3. docs/qa/evidence/xhrm-rec-wf-be-spawn-01-20260719.md residual note

## entry
BE-SPAWN-01 READY was retested: submit no longer XBOS-WF-400.
Live: HRM-REC-WF-SPAWN-MISSING submitter.employeeId unresolved userId=ceo@xe.vn
U65 zero-seed; defs active; persona ceo@xe.vn

## deliver
1. Make Group CEO spawn path resolve a valid submitter.employeeId for ceo@xe.vn (product resolve — membership/JWT/employee master — NOT QA seed in evidence)
2. Jest: unresolved email still SPAWN-MISSING; resolved path returns workflow_instance_id when def active
3. must_keep: leave bridge · F6 map · UF-HRM-12

## exit
READY_FOR_QA — evidence; next_dispatch_prompt for XHRM-REC-WF-QA-CANVAS-03 retest J-02 instance + J-03/06
```

## ack_status

**FAIL_TO_PM**
