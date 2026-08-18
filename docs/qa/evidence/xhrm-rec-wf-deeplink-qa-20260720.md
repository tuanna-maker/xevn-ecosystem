# R-XHRM-REC-WF-DEEPLINK-TASKID-QA — Deep-link task id retest (QA)

| Field | Value |
|-------|--------|
| **work_item_id** | `R-XHRM-REC-WF-DEEPLINK-TASKID-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` → `qc` (close condition `C-XHRM-REC-WF-CANVAS-05-01`) |
| **date** | 2026-07-20 |
| **lane** | execution |
| **change_mode** | RETEST |
| **entry** | FE READY `docs/qa/evidence/xhrm-rec-wf-deeplink-fe-20260720.md` · parent QC GWC `C-XHRM-REC-WF-CANVAS-05-01` |
| **ack_status** | **PASS_TO_PM** |
| **spec_ref** | `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` · J-REC-WF-02/03/06 · BR-INBOX-01 · J-XBOS-01 |
| **seed** | **None** (U65) |

## Environment (L0)

| Probe | Result |
|-------|--------|
| hrm-api `:28001` | HTTP **200** |
| xbos-api `:28002` | HTTP **200** |
| web-portal `:5173` | HTTP **200** |
| Persona | `ceo@xe.vn` · Group CEO · JWT `xevn`/`main` |
| Method | Browser FE click + `window.fetch` intercept · Command Center + `/hr/recruitment` |
| Seed | **None** — no `pnpm seed:*` / inbox seed / DB fake |
| Vitest (FE pack) | `inboxDeepLink` + `commandCenterUrl` + `WorkflowTaskDetailDrawer` → **19/19 PASS** (cwd `apps/web/web-portal`) |

## Verdict summary

**PASS_TO_PM** — P2 deep-link residual **CLOSED** live:

1. **Mở chi tiết** URL carries `wfTaskId` + `wfInstanceId`; reject POSTs **task id** → **201** (not instance id; no 404).
2. Legacy **`?wfInstanceId=` only** opens drawer; after inbox/detail hydrate, reject POSTs **resolved task id** → **201** (not instance id; no brief 404).
3. Regress **J-REC-WF-02 / 03 / 06** smoke **PASS** — **must_keep** GWC; **did not reopen** J-03 green (no FAIL).

**NOT** Phase1 DONE · **NOT** PROD.

---

## AC matrix (this wave)

| # | Exit criteria | Evidence | Result |
|---|---------------|----------|--------|
| 1 | Deep-link / Mở chi tiết: complete\|reject uses **task id** not instance id; no brief 404 | See §1 | **PASS** |
| 2 | Legacy `?wfInstanceId=` only: wait for resolved task then **2xx** | See §2 | **PASS** |
| 3 | Regress J-02/03/06 smoke must_keep | See §3 | **PASS** |
| 4 | Evidence path this file | — | **PASS** |

---

## §1 — Mở chi tiết + wfTaskId (reject)

| Step | Detail |
|------|--------|
| Persona / URL | `ceo@xe.vn` → `http://localhost:5173/command-center` |
| Click path | Inbox card **Phê duyệt yêu cầu tuyển dụng HRM** → **Mở chi tiết** |
| URL after open | `?wfTaskId=c5ed8a71-85bc-41e4-92af-67f8a3dd6cc8&wfInstanceId=f2c19f2f-56d8-40ab-97c8-3d9c51f69ceb` |
| Action | Drawer → **Từ chối nhiệm vụ** → confirm **Từ chối** |
| Network | `POST /api/xbos/workflow-engine/tasks/c5ed8a71-85bc-41e4-92af-67f8a3dd6cc8/reject` → **201** |
| Assert | Path id = **task** `c5ed8a71-…` ≠ instance `f2c19f2f-…` · body **no 404** · inbox 104→103 |
| Verdict | **PASS** |

---

## §2 — Legacy `?wfInstanceId=` only

| Step | Detail |
|------|--------|
| Prep | Open another recruitment card → capture `wfInstanceId=61da30f8-7be4-48b2-9c7b-e95ff52cd195` (paired task was `c2938604-…` via Mở chi tiết) |
| Deep-link | Navigate `http://localhost:5173/command-center?wfInstanceId=61da30f8-7be4-48b2-9c7b-e95ff52cd195` (**no** `wfTaskId`) |
| Observe | Drawer **Chi tiết nhiệm vụ** / instance detail loads; action **Từ chối nhiệm vụ** enabled after hydrate (inbox match / pending resolve) |
| Action | **Từ chối nhiệm vụ** → confirm **Từ chối** |
| Network | `POST /api/xbos/workflow-engine/tasks/fb306f8c-b3a0-40e3-be55-d5bcaa98e4c5/reject` → **201** |
| Assert | Path id = **task** `fb306f8c-…` ≠ instance `61da30f8-…` · **no** `…/tasks/61da30f8-…/reject` · no UI 404 |
| Note | Multi-pending steps on instance; FE resolved an actionable step task id before mutate (not instance id stub) |
| Verdict | **PASS** |

---

## §3 — Regress J-REC-WF-02 / 03 / 06 smoke (must_keep)

| J-ID | Smoke path | Network / observe | Result |
|------|------------|-------------------|--------|
| **J-REC-WF-06** | Covered by §1–§2 reject via drawer deep-link | reject **201** with **task id** | **PASS** (smoke; GWC not reopened) |
| **J-REC-WF-03** | CC Inbox → **Xử lý nhanh** on remaining **Phê duyệt yêu cầu tuyển dụng HRM** | `POST …/tasks/9451ca54-069b-416c-9acb-f385b6161533/complete` → **201** · task id (not instance) | **PASS** smoke — **must_keep**; **no FAIL** → **do not reopen** GWC J-03 |
| **J-REC-WF-02** | `/hr/recruitment` → Yêu cầu → **Gửi duyệt QT** on live row `QA REC-WF CANVAS-03-REJ 1784465965346` | `POST …/requisitions/56c8238d-…/submit-workflow?company_id=holding` → **201** `HRM-REC-WF-200` · `spawnMissing: false` · `workflow_instance_id: 62f335e0-…` · FE «QT XBOS đang chạy» | **PASS** smoke |

### must_keep honored

- Parent QC GWC J-03 / AC-REC-WF-03 **not** reopened (no FAIL evidence).
- Card **Xử lý nhanh** with real `cardId` still POSTs task id (**PASS**).
- No Phase1 / PROD claim · no seed.

---

## Forbidden check

| Forbidden | Honored |
|-----------|---------|
| `pnpm seed:*` / inbox seed / DB fake | **Yes** |
| Phase1 DONE / PROD-READY claim | **Yes** — not claimed |
| Reopen J-03 green without FAIL | **Yes** — smoke only |

---

## Residual

| ID | Severity | Notes |
|----|----------|-------|
| — | — | None for this P2 slice. Parent GWC standing conditions (J-01/04/05 out of slice, Phase1/PROD forbid) unchanged. |

---

## completion_report

**Closed:** `R-XHRM-REC-WF-DEEPLINK-TASKID` / QC condition **C-XHRM-REC-WF-CANVAS-05-01** — browser U65 proves deep-link + legacy instance-only mutate use **task id** → **2xx**, no instance-id 404 race; J-02/03/06 smoke must_keep intact.

**Open:** QC gate to close residual condition on parent CANVAS-05 GWC.

## next_owner

`qc`

## next_dispatch_prompt

```text
work_item_id: R-XHRM-REC-WF-DEEPLINK-TASKID-QC
from_role: pm
to_role: qc
lane: governance
change_mode: GATE

## entry
QA PASS_TO_PM — docs/qa/evidence/xhrm-rec-wf-deeplink-qa-20260720.md
FE READY — docs/qa/evidence/xhrm-rec-wf-deeplink-fe-20260720.md
parent condition C-XHRM-REC-WF-CANVAS-05-01 (optional P2 deeplink)

## deliver
1. Audit L0 + browser AC §1–§3: Mở chi tiết wfTaskId reject 201; legacy wfInstanceId-only reject 201 task id; J-02/03/06 smoke must_keep
2. Close C-XHRM-REC-WF-CANVAS-05-01 if evidence pack OK
3. Keep parent CANVAS-05 GWC; cấm reopen J-03 without FAIL; cấm Phase1/PROD/seed
4. Evidence: docs/qa/evidence/xhrm-rec-wf-deeplink-qc-20260720.md

## exit
GO / GWC / NO-GO · PASS_TO_PM
```

## ack_status

**PASS_TO_PM**
