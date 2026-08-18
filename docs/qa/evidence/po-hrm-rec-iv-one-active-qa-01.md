# Evidence — PO-HRM-REC-IV-ONE-ACTIVE-QA-01 (+ R2)

| Field | Value |
|---|---|
| work_item_id | `PO-HRM-REC-IV-ONE-ACTIVE-QA-01` · R2 `PO-HRM-REC-IV-ONE-ACTIVE-QA-01-R2` |
| from_role | `qa` |
| to_role | `pm` |
| lane | execution |
| persona | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| u65 | zero-seed · browser-only acceptance |
| recruitment_uat_ready | **false** (denied) |
| spec_ref | `PO-HRM-REC-IV-ONE-ACTIVE-SA-01` §3 · `SRS_HRM_ENTERPRISE.md` `FR-UC-BP-REC-06a` |
| ack_status | **FAIL_TO_PM** |

## Handoff read

- BE: `docs/qa/evidence/po-hrm-rec-iv-one-active-be-01.md` — jest 12/12 `recruitment.service.spec.ts`
- FE: `docs/qa/evidence/po-hrm-rec-iv-one-active-fe-01.md` — vitest 7/7 (badge mapper, apiError, source wiring)

## L0 stack

```bash
pnpm run qc:fe-be-health   # exit 0 — ALL PASS (:5173 portal, :28001 hrm-api, proxy employees/catalog)
```

## Unit corroboration (QA re-run)

| Suite | Command | Result |
|---|---|---|
| BE | `pnpm --filter hrm-api test -- recruitment.service.spec.ts` | 12/12 PASS |
| FE | `pnpm test -- candidateActiveInterview*.ts apiError.recruitment-interview.test.ts CandidatesTab.source.test.ts` (apps/web/hrm) | 7/7 PASS |

Unit PASS covers Lane A logic + FE mapper only — **not** production browser path (Lane B catalog).

---

## R1 — API probe + initial browser (2026-08-06)

Machine log: `docs/qa/evidence/_tmp-po-hrm-rec-iv-one-active-qa-01.json`

### API (production path mismatch)

| Probe | Result | Verdict |
|---|---|---|
| `GET /recruitment/candidates?company_id=main` | 200 · total **0–1** (Lane A spine empty) | Lane A not UI SoT |
| `GET /recruitment/candidates-pool?company_id=main` | 200 · total **6** · **no** `active_interview` keys | 🔴 projection missing |
| `POST /recruitment/interviews` (spine) for pool candidate | **400** `HRM-VAL-001` company_id must be UUID | spine unreachable from pool rows |
| `POST /recruitment/interviews-catalog` ×2 same candidate | **201** both · **no** `HRM-REC-IV-409-ACTIVE` | 🔴 one-active not on FE path |
| Catalog rows for `Tuấn` after probe | **3×** `status=scheduled` same candidate | 🔴 cardinality violated on catalog |

### Browser (partial)

- URL: `http://127.0.0.1:5173/command-center/hrm/recruitment?tab=candidates&companyId=main`
- Screenshot: `docs/qa/evidence/po-hrm-rec-iv-one-active-qa-01/01-candidates-list.png`
- `pageErrors=0` · `consoleErrors=0`
- Badge `[data-testid=candidate-active-interview-badge]`: **not found**

---

## R2 — U65 browser Candidates slice (2026-08-06)

Machine log: `docs/qa/evidence/_tmp-po-hrm-rec-iv-one-active-qa-01-r2.json`  
Harness: `scripts/qa/_tmp-po-hrm-rec-iv-one-active-qa-01-r2.mjs`

### Click path (HDSD-aligned)

1. Login token inject · persona Group CEO · `company_id=main`
2. `Recruitment` → tab **Ứng viên** → **Tất cả ứng viên**
3. Row `Tuấn` (tuanna@unicomhub.com) — actions → **Lên lịch phỏng vấn** (calendar-clock)
4. Dialog `[data-testid=schedule-interview-dialog]` opens — title **Lên lịch phỏng vấn** (UTF-8 OK)
5. Submit attempted (date picker automation incomplete — validation blocked POST in harness)
6. F5 reload → re-read list

### Screenshots

| File | Note |
|---|---|
| `…/02-candidates-table-r2.png` | 6 ứng viên · **no** badge «Đã có lịch» on any row |
| `…/03-schedule-dialog-r2.png` | Dialog for Tuấn · vi-VN labels OK |
| `…/04-after-first-schedule-r2.png` | Still no badge |
| `…/06-after-f5-r2.png` | F5 — badge still absent |

### Network (browser session)

| Method | Endpoint | Status | Code |
|---|---|---|---|
| GET | `/api/hrm/recruitment/candidates-pool?company_id=main` | 200 | `HRM-REC-CP-200` |
| POST | `/api/hrm/recruitment/interviews-catalog` | — | **not observed** (form date validation blocked harness submit) |

**Corroboration (API same persona, pre-browser):** duplicate `POST interviews-catalog` → **201** (not 409); pool GET still lacks `active_interview`.

### AC matrix (R2 browser + API corroboration)

| AC | SRS step | Expected | Observed | Verdict |
|---|---|---|---|---|
| AC-REC-IV-01 | Badge «Đã có lịch» from BE projection | List row shows badge when ACTIVE | Pool list has 3+ catalog `scheduled` for Tuấn · **no badge** · pool JSON no `active_interview` | 🔴 FAIL |
| AC-REC-IV-02 | Datetime `dd/MM/yyyy HH:mm` | vi-VN from projection | No time element rendered | 🔴 FAIL |
| AC-REC-IV-03 | Duplicate create → 409 UX | Toast with one-active message | Catalog duplicate **201** · no toast · code not `HRM-REC-IV-409-ACTIVE` on catalog path | 🔴 FAIL |
| AC-REC-IV-04 | Cancel/complete → new create → F5 | Badge updates / persists | Not exercisable on spine from UI; catalog has stacked ACTIVE | 🔴 FAIL |
| AC-REC-IV-05 | Null datetime → `—` | No crash | N/A (no badge path) | ⚪ N/A |
| AC-no-crash | — | 0 Uncaught | `pageErrors=0` | 🟢 PASS |

### Root cause (spec says / code does)

| Layer | Spec / BE-01 | Production UI path |
|---|---|---|
| List | `active_interview` on candidate list projection | FE `listCandidatesPool` → `public.candidates` **without** projection |
| Create | `POST /recruitment/interviews` + `HRM-REC-IV-409-ACTIVE` | FE `createInterviewCatalog` → `POST /recruitment/interviews-catalog` **no** one-active gate |
| Data | Lane A `recruitment_candidates` + `recruitment_interviews` | UI shows Lane B pool; spine list empty / UUID mismatch |

---

## Residual defects (dispatch required)

| ID | Sev | Owner | Summary |
|---|---|---|---|
| `REC-IV-LANE-B-WIRE-P0` | P0 | dev-fe + dev-be | Wire Candidates tab to spine list + schedule APIs **or** port one-active + projection to `candidates-pool` + `interviews-catalog` |
| `REC-IV-POOL-PROJECTION-P0` | P0 | dev-be | `GET candidates-pool` must expose display-ready `active_interview` (same shape as Lane A list) |
| `REC-IV-CATALOG-409-P0` | P0 | dev-be | Enforce `HRM-REC-IV-409-ACTIVE` on catalog create/update path used by `ScheduleInterviewDialog` |
| `REC-IV-DATA-HYGIENE-P2` | P2 | dev-be/ops | Candidate `Tuấn` has 3+ concurrent `scheduled` catalog rows from QA/API probes — clean or cancel extras before re-test |

**Not promoted:** `recruitment_uat_ready`, module GO, REC-03 scope.

---

## completion_report

R2 U65 browser executed on Recruitment → Candidates (`ceo@xe.vn`). List loads 6 pool candidates with zero console crash. **No** «Đã có lịch» badge or vi-VN datetime on any row despite existing catalog scheduled interviews. Schedule dialog opens with correct UTF-8; full FE mutate→F5 badge path **blocked** by Lane B vs Lane A split: pool API lacks projection, catalog create bypasses `HRM-REC-IV-409-ACTIVE`. BE/FE unit tests PASS on isolated modules only. **Overall FAIL_TO_PM.**

## next_owner

`pm` → dispatch `dev-be` + `dev-fe` (joint narrow slice)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-REC-IV-ONE-ACTIVE-BE-FE-WIRE-02
from_role: pm
to_role: dev-be
lane: execution
change_mode: FIX narrow
read_first:
1) docs/qa/evidence/po-hrm-rec-iv-one-active-qa-01.md (R2 FAIL root cause)
2) docs/program/specs/PO-HRM-REC-IV-ONE-ACTIVE-SA-01.md §3
parent: PO-HRM-REC-IV-ONE-ACTIVE-QA-01
entry_criteria:
- QA R2 FAIL_TO_PM with lane mismatch evidence
task:
- Option A (preferred): add active_interview projection to GET candidates-pool; enforce one-active on POST/PATCH interviews-catalog (409 HRM-REC-IV-409-ACTIVE)
- Option B: switch ScheduleInterviewDialog + CandidatesTab list to spine endpoints (listCandidates + POST /recruitment/interviews) with company_id scope fix for group CEO
- must_keep: U65 zero-seed; recruitment_uat_ready=false; no REC-03 scope
exit_criteria:
- QA re-run R2 AC table all PASS: badge+datetime, 409 toast, F5 persist after cancel→create
- jest/vitest regression
evidence_path: docs/qa/evidence/po-hrm-rec-iv-one-active-be-02.md
ack_status: READY_FOR_QA
Then FE if only projection consumer changes: PO-HRM-REC-IV-ONE-ACTIVE-FE-02
```
