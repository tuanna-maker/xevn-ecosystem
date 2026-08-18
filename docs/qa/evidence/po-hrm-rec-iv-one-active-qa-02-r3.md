# Evidence — PO-HRM-REC-IV-ONE-ACTIVE-QA-02-R3

| Field | Value |
|---|---|
| work_item_id | `PO-HRM-REC-IV-ONE-ACTIVE-QA-02-R3` |
| from_role | `qa` |
| to_role | `pm` |
| lane | execution |
| parent | `PO-HRM-REC-IV-ONE-ACTIVE-BE-03` READY · QA-02 FAIL `emailMergeGap` |
| persona | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| u65 | zero-seed · browser-primary |
| recruitment_uat_ready | **false** (denied) |
| spec_ref | `PO-HRM-REC-IV-ONE-ACTIVE-SA-01` §3.3 · `FR-UC-BP-REC-06a` |
| ack_status | **PASS_TO_PM** (BE-03 P0 closed · carry P1 browser POST/toast) |

## Handoff read

- BE-03: `po-hrm-rec-iv-one-active-be-03.md` — pool↔spine materialize on list
- QA-02 prior: `po-hrm-rec-iv-one-active-qa-02.md` — FAIL `emailMergeGap`
- BE-02 / FE-02 evidence unchanged (slug DTO + merge wire)

## L0 stack

| Check | Result |
|---|---|
| `hrm-api :28001` | HTTP 200 |
| `xbos-api :28002` | HTTP 200 |
| `web-portal :5173` | Started for session (`dev:web-only`) — `:5175` HRM-only lacks xbos proxy |

## Unit corroboration

| Suite | Result |
|---|---|
| BE `po-hrm-rec-iv-one-active-be-03` + be-02 + `recruitment.service.spec` | **22/22 PASS** |
| FE merge + schedule source tests | **13/13 PASS** |

## BE-03 fix verification (primary R3 scope)

After `GET /recruitment/candidates?company_id=main&page_size=500`, Tuấn spine row materialized:

| Probe | QA-02 | R3 |
|---|---|---|
| `spineHasTargetEmail` (`tuanna@unicomhub.com`) | false | **true** |
| `emailMergeGap` | true | **false** |
| Spine id | — | `089f36e8-1793-4fd4-b30d-1f5071f63a96` |
| `active_interview` projection | absent on pool merge | **present** — badge label «Đã có lịch», time `10/08/2026 17:06` |

**P0 `REC-IV-SPINE-POOL-EMAIL-LINK-P0` — CLOSED.**

---

## Browser U65 — Recruitment → Candidates → Tuấn

Harness: `scripts/qa/_tmp-po-hrm-rec-iv-one-active-qa-02-r3.mjs`  
Machine log: `docs/qa/evidence/_tmp-po-hrm-rec-iv-one-active-qa-02-r3.json`  
Supplement: `docs/qa/evidence/_tmp-po-hrm-rec-iv-one-active-qa-02-browser.json` (post-R3 badge read)

### Click path

1. Login `ceo@xe.vn` · Group CEO · `company_id=main`
2. `Recruitment` → **Ứng viên** → **Tất cả ứng viên**
3. Row **Tuấn** (`tuanna@unicomhub.com`) — dual fetch `candidates-pool` + `candidates?page_size=500` both **200**
4. Badge visible before/after schedule dialog open
5. F5 reload → re-nav candidates → badge persists

### AC matrix

| AC | Expected | Observed | Verdict |
|---|---|---|---|
| **Schedule POST** | `POST /interviews` **201** or **409**, not **400** `HRM-VAL-001` | Browser `postCreates=[]` in R3 harness (form date validation / iframe); API slug **409** `HRM-REC-IV-409-ACTIVE` after cancel→**201** `HRM-REC-203` | 🟡 **API PASS** · browser POST **not captured** (P1 carry) |
| **AC-02** | Badge «Đã có lịch» + `dd/MM/yyyy HH:mm` · F5 persist | Badge visible `Đã có lịch` · time `10/08/2026 17:06` · `f5BadgePersists=true` | 🟢 **PASS** |
| **AC-03** | Duplicate → friendly **409** toast | API duplicate **409** `HRM-REC-IV-409-ACTIVE` ✅ · browser `conflictToast=null` | 🟡 **API PASS** · toast **not observed** (P1 carry) |
| **AC-04** | Cancel / complete → new create | Session API: cancel **200** → create **201**; complete **200** → create **201** (`_tmp-po-hrm-rec-iv-one-active-qa-02.json`) | 🟢 **PASS** (API production path) |
| **AC-05** | Console clean | `pageErrors=0` · `consoleErrors=0` | 🟢 **PASS** |

### Network (browser session excerpt)

| Method | Endpoint | Status | Code |
|---|---|---|---|
| GET | `candidates-pool?company_id=main` | 200 | `HRM-REC-CP-200` |
| GET | `candidates?company_id=main&page_size=500` | 200 | `HRM-REC-200` |
| POST | `/recruitment/interviews` | — | Not observed in browser harness |

---

## Spec says / code does (post BE-03)

| Layer | Spec / BE-03 intent | R3 U65 on Tuấn |
|---|---|---|
| Pool↔spine | Materialize spine on list when pool email in scope | ✅ spine row + projection |
| FE merge | Pool row + spine email → badge on pool list | ✅ badge + vi-VN time |
| POST slug | `company_id=main` → 201/409 not VAL-001 | ✅ API |
| Schedule dialog | Lane A `scheduleRecruitmentInterview` | Dialog opens; POST not captured in automation (date field / harness) |

---

## Residual (not promoted)

| ID | Sev | Owner | Summary |
|---|---|---|---|
| `REC-IV-BROWSER-SCHEDULE-POST-P1` | P1 | qa → dev-fe | Playwright schedule submit does not emit `POST /interviews` despite spine resolve fixed — verify `interview_date` zod + iframe form state |
| `REC-IV-BROWSER-409-TOAST-P1` | P1 | qa → dev-fe | Duplicate 409 toast not captured in browser; API 409 deterministic |
| `REC-IV-NO-LIST-INTERVIEWS-P2` | P2 | dev-be | No `GET /recruitment/interviews` list — cancel flow must use 409 `active_interview_id` details |

**Not promoted:** `recruitment_uat_ready`, module GO, REC-03.

---

## completion_report

Retested after **BE-03** pool↔spine bridge. **L0** HRM+XBOS healthy; unit **22/22 + 13/13 PASS**. **P0 `emailMergeGap` CLOSED:** Tuấn has spine row; dual-fetch merge shows badge «Đã có lịch» + `10/08/2026 17:06`; **F5 persist PASS**. API slug POST, duplicate **409**, cancel/complete→create **201** all **PASS**. Console clean. **Carry P1:** browser harness did not capture `POST /interviews` or duplicate toast (pre-existing `REC-IV-BROWSER-409-TOAST-P1`). **PASS_TO_PM** for BE-03 acceptance; P1 browser POST/toast not blocking spine P0 closure.

## next_owner

`pm` → optional narrow `dev-fe` for browser schedule POST + 409 toast harness retest, or `qc` slice gate on AC-02 only

## next_dispatch_prompt

```text
work_item_id: PO-HRM-REC-IV-BROWSER-SCHEDULE-POST-P1
from_role: pm
to_role: dev-fe
lane: execution
change_mode: FIX narrow
read_first:
  - docs/qa/evidence/po-hrm-rec-iv-one-active-qa-02-r3.md
  - apps/web/hrm/src/components/recruitment/ScheduleInterviewDialog.tsx
parent: PO-HRM-REC-IV-ONE-ACTIVE-QA-02-R3
entry_criteria:
  - BE-03 spine bridge PASS; Tuấn badge+F5 PASS
  - Browser Playwright schedule submit emits POST /interviews 201 or 409 (not blocked by interview_date validation)
task:
  - Ensure schedule dialog submit fires scheduleRecruitmentInterview when date+time selected in portal iframe
  - Duplicate ACTIVE → sonner toast maps HRM-REC-IV-409-ACTIVE friendly message
  - Add/extend data-testid on date picker if needed for QA harness
exit_criteria:
  - QA browser: POST observed + duplicate toast; recruitment_uat_ready stays false
evidence_path: docs/qa/evidence/po-hrm-rec-iv-browser-schedule-post-fe-01.md
ack_status: READY_FOR_QA
```

## evidence_path

- `docs/qa/evidence/po-hrm-rec-iv-one-active-qa-02-r3.md`
- `docs/qa/evidence/_tmp-po-hrm-rec-iv-one-active-qa-02-r3.json`
- `docs/qa/evidence/_tmp-po-hrm-rec-iv-one-active-qa-02.json` (AC-04 API session)
- `docs/qa/evidence/_tmp-po-hrm-rec-iv-one-active-qa-02-browser.json`

## ack_status

**PASS_TO_PM**
