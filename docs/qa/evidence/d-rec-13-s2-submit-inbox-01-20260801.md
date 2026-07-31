# D-REC-13-S2-SUBMIT-INBOX-01 — FE wire «Gửi duyệt QT» after YCTD create

| Field | Value |
|-------|-------|
| **work_item_id** | `D-REC-13-S2-SUBMIT-INBOX-01` |
| **program** | `P-REC-E2E-13STEP-01` · residual `R-REC-13-S2-SUBMIT-INBOX` |
| **from_role** | pm → **dev-fe** |
| **date** | 2026-08-01 |
| **change_mode** | ADD · `preserve_default: true` |
| **spec_ref** | UF-HRM-12 · J-REC-WF-02 · J-REC-WF-03 · UC-HRM-REC-WF-02/03 |
| **SoT** | `docs/qa/P1_BROWSER_E2E_RECRUITMENT_13STEP_XBOS_HRM.md` §S2 |
| **prior** | QC GWC `docs/qa/evidence/qc-rec-e2e-13step-01-20260801.md` · QA create POST 201 OK, submit not observed |
| **ack_status** | **READY_FOR_QA** |
| **policy** | U65 zero-seed · **cấm** `pnpm seed:*` / inbox seed / DB fake |

---

## Root cause (FE)

1. QA `:8088` screenshots (`s2-after-create.png` / `s2-req-list.png`) show row actions **only** «Chi tiết» + «Sửa» — **no** «Gửi duyệt QT» (stale/partial bundle vs local source that already called `submitJobRequisitionWorkflow`).
2. Local working tree had **Undo Create Diff** removing:
   - `apps/web/hrm/src/lib/recruitmentWorkflowUi.ts` (+ test)
   - `apps/web/hrm/src/components/recruitment/RecruitmentWfSpawnBanner.tsx`  
   → JobRequisitionsTab / Recruitment / Candidates imports would fail Vite resolve until restored.
3. Create path (UF-HRM-12) already POST **201** + F5; residual = submit CTA visibility + Network `POST …/submit-workflow`.

---

## Changes (narrow)

| Path | Change |
|------|--------|
| `apps/web/hrm/src/lib/recruitmentWorkflowUi.ts` | Restore lock/SPAWN helpers + **ADD** `canSubmitRequisitionWorkflow` |
| `apps/web/hrm/src/lib/recruitmentWorkflowUi.test.ts` | Restore + cases for post-create `open` / no `wi` |
| `apps/web/hrm/src/components/recruitment/RecruitmentWfSpawnBanner.tsx` | Restore SPAWN-MISSING banner |
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | Post-create strip «Gửi duyệt QT»; row/detail **secondary** CTA; `data-testid`; wire `submitJobRequisitionWorkflow` |
| `apps/web/hrm/src/lib/hdsdMutateTestIds.ts` (+ test) | `requisitionSubmitWf` · `requisitionPostCreateSubmit` · per-row helper |

**API already present (no FE invent):**  
`POST /api/hrm/recruitment/requisitions/:id/submit-workflow?company_id=…` via `submitJobRequisitionWorkflow` in `hrmApi.ts`.

**must_keep:** UF-HRM-12 create+F5 · JD/headcount · SoftDel/BH unrelated · J-REC-WF historic greens not demoted in this wave.

---

## FE click path (QA retest)

1. Login `ceo@xe.vn` · portal embed `companyId=main`.
2. `/hr/recruitment?tab=requisitions` (or CC HRM iframe equivalent).
3. **Thêm yêu cầu** → pick JD · title/dept/HC → **Lưu** → Network **POST `/requisitions` 201** (UF-HRM-12 keep).
4. Visible strip / row CTA **«Gửi duyệt QT»** (`data-testid=hdsd-requisition-submit-wf` or `hdsd-requisition-post-create-submit`).
5. Click → Network **POST `/requisitions/{id}/submit-workflow` → 2xx** (`HRM-REC-WF-200`).
6. If `spawnMissing` / banner `rec-wf-spawn-missing-banner` → **do not seed**; record BE residual (below).
7. Else → `/command-center/inbox` → recruitment task for `ceo@xe.vn` (J-REC-WF-03).
8. F5 list: row reflects `workflow_instance_id` / pending state; create+F5 still green.

---

## Verify (dev-fe)

| Command | Result |
|---------|--------|
| `pnpm --filter vite_react_shadcn_ts exec vitest run src/lib/recruitmentWorkflowUi.test.ts src/lib/hdsdMutateTestIds.test.ts` | **7/7 PASS** |
| Local `curl :28001/api/hrm/health` | **000** (API down this session) — browser spawn/inbox deferred to QA on live stack / `:8088` after FE deploy |
| Seed / inbox seed | **None** |

---

## Concurrent **dev-be** handoff (if spawn 2xx but Inbox empty / SPAWN-MISSING)

Do **not** seed. If FE POST submit-workflow returns 2xx with `spawnMissing:true` or banner shows, or Inbox has no TD task after successful spawn id:

```text
work_item_id: D-REC-13-S2-SUBMIT-INBOX-BE-01
owner: dev-be
entry: FE wire READY; Network POST submit-workflow observed
task: Diagnose recruitmentWorkflowBridge.startRecruitmentWorkflowIfConfigured for
  businessType=hrm_requisition_approval · Group CEO main · submitter from JWT;
  ensure XBOS inbox task for ceo@xe.vn (U65 — no seed).
exit: spawn.workflowInstanceId set + Inbox task visible OR honest SPAWN-MISSING with def gap
evidence: append to this file or docs/qa/evidence/d-rec-13-s2-submit-inbox-be-01-*.md
```

FE still ships button/wire regardless.

---

## Residual / not claimed

- Full 13-step DONE — **not** claimed.
- J-REC-WF-02/03 re-promote — **QA** after browser evidence only.
- SoftDel / BH — untouched.

---

## Handoff

- `completion_report`: Restored WF UI helpers + banner; post-create + row/detail «Gửi duyệt QT» → `submitJobRequisitionWorkflow`; vitest 7/7; U65 no seed.
- `next_owner`: **qa**
- `ack_status`: **READY_FOR_QA**
- `next_dispatch_prompt`: see below

```text
work_item_id: QA-REC-13-S2-SUBMIT-INBOX-RET-01
from_role: pm | to_role: qa
entry_criteria: D-REC-13-S2-SUBMIT-INBOX-01 READY_FOR_QA · docs/qa/evidence/d-rec-13-s2-submit-inbox-01-20260801.md · FE deployed to target env (:8088 or local with portal=1)
task: Browser-only U65 — ceo@xe.vn · /hr/recruitment?tab=requisitions → create YCTD (POST 201 keep UF-HRM-12) → click visible «Gửi duyệt QT» (testid hdsd-requisition-submit-wf / post-create strip) → Network POST …/submit-workflow 2xx → Inbox shows recruitment task (no seed). If SPAWN-MISSING banner → PASS FE wire + FAIL_TO_PM with D-REC-13-S2-SUBMIT-INBOX-BE-01. Evidence: docs/qa/evidence/qa-rec-13-s2-submit-inbox-ret-01-20260801.md · screens Network+list+inbox.
cấm: pnpm seed:* · API inbox seed · demote UF-HRM-12 / J-REC-WF historic without regression
exit_criteria: PASS_TO_PM with Network submit 2xx + inbox observation OR honest BE residual; matrix residual R-REC-13-S2 update
```
