# Evidence — PO-HRM-REC-IV-ONE-ACTIVE-QA-02-R4

| Field | Value |
|---|---|
| work_item_id | `PO-HRM-REC-IV-ONE-ACTIVE-QA-02-R4` |
| from_role | `qa` |
| to_role | `pm` |
| lane | execution |
| parent | `PO-HRM-REC-IV-BROWSER-SCHEDULE-POST-P1` READY |
| persona | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| u65 | zero-seed · browser-primary · **no API pre-cancel / no seed** |
| recruitment_uat_ready | **false** (denied) |
| spec_ref | `FR-UC-BP-REC-06a` · AC-01 browser POST · AC-03 duplicate 409 toast |
| ack_status | **PASS_TO_PM** |

## Handoff read

- FE fix: `docs/qa/evidence/po-hrm-rec-iv-browser-schedule-post-fe-01.md`
- R3 baseline: `docs/qa/evidence/po-hrm-rec-iv-one-active-qa-02-r3.md`

## L0 stack

| Check | Result |
|---|---|
| `pnpm run qc:fe-be-health` | **ALL PASS** (HRM :28001 · XBOS :28002 · portal :5173) |

## Unit corroboration

| Suite | Result |
|---|---|
| FE `ScheduleInterviewDialog` + `apiError` + `candidateActiveInterview` + `CandidatesTab` | **14/14 PASS** |

## Browser U65 — Recruitment → Candidates → Tuấn

Harness: `scripts/qa/_tmp-po-hrm-rec-iv-one-active-qa-02-r4.mjs`  
Machine log: `docs/qa/evidence/_tmp-po-hrm-rec-iv-one-active-qa-02-r4.json`  
Screenshots: `docs/qa/evidence/po-hrm-rec-iv-one-active-qa-02-r4/01–05`

### Click path (HDSD-aligned)

1. Login `ceo@xe.vn` · Group CEO · `company_id=main`
2. Command Center → **Tuyển dụng** → **Ứng viên** → **Tất cả ứng viên**
3. Row **Tuấn** (`tuanna@unicomhub.com`) — dual fetch pool + spine both **200**
4. Calendar icon → **Lên lịch phỏng vấn** dialog → click `[data-testid=schedule-interview-submit]` (default date tomorrow — no manual calendar)
5. **FE after 201:** badge «Đã có lịch» + `07/08/2026 09:00`
6. Re-open dialog → submit duplicate → **409** + Sonner toast
7. **F5** → re-nav candidates → badge persists

### AC matrix (dispatch scope)

| AC | Expected | Observed | Verdict |
|---|---|---|---|
| **1 — Schedule POST** | `POST /api/hrm/recruitment/interviews` **201** or **409** in Network; not blocked by date validation | First submit **201** `HRM-REC-203`; duplicate **409** `HRM-REC-IV-409-ACTIVE`; `postCreates.length=2` | 🟢 **PASS** |
| **2 — Duplicate toast** | Sonner toast friendly `HRM-REC-IV-409-ACTIVE` («hiệu lực» / «đã có lịch») | Toast: *«Không thể lên lịch phỏng vấn — Ứng viên đã có lịch phỏng vấn đang hiệu lực…»* | 🟢 **PASS** |
| **3 — AC-02 regression** | Badge «Đã có lịch» + `dd/MM/yyyy HH:mm` · F5 persist | Badge `07/08/2026 09:00` · `f5BadgePersists=true` · vi-VN pattern | 🟢 **PASS** |
| **4 — Console** | No Uncaught / no page errors · no seed | `pageErrors=0` · `consoleErrors=2` — **expected handled 409 path** (network 409 + `console.error` in catch); no `ReferenceError` | 🟢 **PASS (OBS)** |

### Network (browser POST excerpt)

| Step | Method | Endpoint | Status | Code |
|---|---|---|---|---|
| First schedule | POST | `/api/hrm/recruitment/interviews` | **201** | `HRM-REC-203` |
| Duplicate | POST | `/api/hrm/recruitment/interviews` | **409** | `HRM-REC-IV-409-ACTIVE` |

### Console OBS (not blocking)

Duplicate submit intentionally triggers handled 409. Console shows:

1. `Failed to load resource: … 409 (Conflict)` — browser network log on expected conflict POST
2. `Error scheduling interview: ApiClientError: Ứng viên đã có lịch…` — `console.error` in `ScheduleInterviewDialog` catch (toast already shown)

**Not promoted:** module GO · `recruitment_uat_ready` · `REC-IV-NO-LIST-INTERVIEWS-P2`.

Optional P2 (dev-fe): suppress `console.error` for known `HRM-REC-IV-409-ACTIVE` when Sonner toast maps friendly message.

---

## P1 carry closure

| Residual (R3) | R4 |
|---|---|
| `REC-IV-BROWSER-SCHEDULE-POST-P1` | **CLOSED** — default date + submit testid → browser POST 201 |
| `REC-IV-BROWSER-409-TOAST-P1` | **CLOSED** — Sonner toast captured on duplicate 409 |

---

## completion_report

Retested after **PO-HRM-REC-IV-BROWSER-SCHEDULE-POST-P1** (default `interview_date` + Sonner). **L0 ALL PASS**; FE unit **14/14 PASS**. Browser U65 on Tuấn: schedule submit emits **POST 201** then duplicate **POST 409** — not blocked by date validation. Sonner toast shows friendly `HRM-REC-IV-409-ACTIVE` message («đang hiệu lực»). **AC-02 regression PASS** — badge + vi-VN datetime persist after F5. Zero-seed (no API pre-cancel). Console: 2 expected handled-409 logs, 0 Uncaught/pageErrors. **P1 browser POST + toast CLOSED.** **PASS_TO_PM.**

## next_owner

`pm` → optional `qc` slice gate on REC-IV one-active browser AC; optional P2 console.error suppress

## next_dispatch_prompt

```text
work_item_id: PO-HRM-REC-IV-ONE-ACTIVE-QC-SLICE-01
from_role: pm
to_role: qc
lane: execution
read_first:
  - docs/qa/evidence/po-hrm-rec-iv-one-active-qa-02-r4.md
  - docs/qa/evidence/po-hrm-rec-iv-one-active-qa-02-r3.md
parent: PO-HRM-REC-IV-ONE-ACTIVE-QA-02-R4 PASS_TO_PM
entry_criteria:
  - R4 browser AC-01 POST 201/409 + AC-03 Sonner toast + AC-02 F5 PASS
  - recruitment_uat_ready remains false
task:
  - Slice GO/GWC on REC-IV one-active browser lane only (not module UAT)
  - Audit OBS console.error on expected 409 — waive or P2
exit_criteria:
  - GO or GWC with explicit not-promoted list
evidence_path: docs/qa/evidence/po-hrm-rec-iv-one-active-qc-slice-01.md
ack_status: PASS_TO_PM
```

## evidence_path

- `docs/qa/evidence/po-hrm-rec-iv-one-active-qa-02-r4.md`
- `docs/qa/evidence/_tmp-po-hrm-rec-iv-one-active-qa-02-r4.json`
- `docs/qa/evidence/po-hrm-rec-iv-one-active-qa-02-r4/` (screenshots 01–05)

## ack_status

**PASS_TO_PM**
