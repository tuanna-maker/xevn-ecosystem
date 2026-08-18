# Evidence — PO-HRM-REC-IV-ONE-ACTIVE-QA-02

| Field | Value |
|---|---|
| work_item_id | `PO-HRM-REC-IV-ONE-ACTIVE-QA-02` |
| from_role | `qa` |
| to_role | `pm` |
| lane | execution |
| persona | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| u65 | zero-seed · browser-primary for UF badge/409 UX |
| recruitment_uat_ready | **false** (denied) |
| spec_ref | `PO-HRM-REC-IV-ONE-ACTIVE-SA-01` §3 · `FR-UC-BP-REC-06a` |
| ack_status | **FAIL_TO_PM** |
| prior | `po-hrm-rec-iv-one-active-qa-01.md` (R2 FAIL) |

## Handoff read

- BE-02: `po-hrm-rec-iv-one-active-be-02.md` — DTO slug · jest **16/16**
- FE-02: `po-hrm-rec-iv-one-active-fe-02.md` — pool merge + Lane A schedule · vitest **13/13**
- SA: `docs/program/specs/PO-HRM-REC-IV-ONE-ACTIVE-SA-01.md`

## L0 stack

```bash
pnpm run qc:fe-be-health   # exit 0 — ALL PASS (session start 2026-08-06 ~16:52 UTC+7)
```

## Unit corroboration (QA re-run)

| Suite | Command | Result |
|---|---|---|
| BE | `pnpm --filter hrm-api test -- recruitment.service.spec.ts po-hrm-rec-iv-one-active-be-02.spec.ts` | **16/16 PASS** |
| FE | `pnpm test -- candidateActiveInterview*.ts CandidatesTab.source.test.ts apiError.recruitment-interview.test.ts ScheduleInterviewDialog.source.test.ts` | **13/13 PASS** |

## Runtime note (BE-02 deploy)

| Probe | First run (~16:52) | After hrm-api watch reload (~16:57) |
|---|---|---|
| `POST /recruitment/interviews` `company_id=main` | **400** `HRM-VAL-001` «company_id must be a UUID» (stale process) | **201** `HRM-REC-203` or **409** `HRM-REC-IV-409-ACTIVE` |
| `dist/.../schedule-interview.dto.js` | Mixed stale `@IsUUID` in running process | `@IsString()` `@MaxLength(80)` on disk |

Entry criteria «hrm-api restarted with BE-02» was **not met at first probe**; hot reload during session restored slug acceptance. `pnpm --filter hrm-api build` still fails **TS2322** in `recruitment.service.ts:703` (watch incremental compiles DTO path only).

---

## API matrix (production path · persona token)

Machine log: `docs/qa/evidence/_tmp-po-hrm-rec-iv-one-active-qa-02.json`

Spine probe candidate: `qa.oneactive.hbvn6t@xe.vn` (`73a7f4e2-…`) — only spine row for `company_id=main`.

| AC | Expected | Observed | Verdict |
|---|---|---|---|
| **AC-01** POST slug `company_id=main` → 201 or 409 `HRM-REC-IV-409-ACTIVE`, **not** 400 `HRM-VAL-001` | After reload: first POST **409** `HRM-REC-IV-409-ACTIVE`; duplicate POST **409** same code | 🟢 **PASS** |
| **AC-03** Duplicate create → deterministic 409 | HTTP **409** `HRM-REC-IV-409-ACTIVE` (API) | 🟢 **PASS** (API) · browser toast **not observed** (see below) |
| **AC-04** Cancel / complete → new create succeeds | PATCH cancel **200** → POST **201** `HRM-REC-203`; PATCH complete **200** → POST **201** | 🟢 **PASS** |

List projection (API) after mutate:

```json
{
  "has_active_interview": true,
  "active_interview_badge_label": "Đã có lịch",
  "active_interview_display_time_vi_vn": "07/08/2026 16:56"
}
```

---

## Browser U65 — Recruitment → Candidates (`tuanna@unicomhub.com`)

Harness: `scripts/qa/_tmp-po-hrm-rec-iv-one-active-qa-02.mjs`  
Supplement: `scripts/qa/_tmp-po-hrm-rec-iv-one-active-qa-02-browser.mjs`

### Click path

1. Login inject · Group CEO · `company_id=main`
2. `Recruitment` → **Ứng viên** → **Tất cả ứng viên** (6 pool rows)
3. Row **Tuấn** (`tuanna@unicomhub.com`) → **Lên lịch phỏng vấn** (form date/time + submit attempted)
4. F5 reload

### Data linkage (root cause AC-02)

| Lane | Tuấn email | qa.oneactive email |
|---|---|---|
| Pool (`candidates-pool`) | ✅ present | ❌ absent from UI list |
| Spine (`candidates`) | ❌ **no row** | ✅ present + ACTIVE projection |

`emailMergeGap: true` — FE `mergeActiveInterviewOntoPoolCandidates` cannot attach badge to Tuấn; `resolveSpineRecruitmentCandidateId` blocks Lane A POST before network (no spine email match).

### Browser network

| Method | Endpoint | Status | Note |
|---|---|---|---|
| GET | `candidates-pool` + `candidates?page_size=500` | 200 | Dual fetch (FE-02) ✅ |
| POST | `/recruitment/interviews` | — | **Not observed** on Tuấn (spine resolve gate) |
| POST | `candidates-pool/.../start-pipeline` | — | **Not observed** (pipeline btn did not emit POST in harness) |

### AC matrix (browser)

| AC | Expected | Observed | Verdict |
|---|---|---|---|
| **AC-02** Badge «Đã có lịch» + `dd/MM/yyyy HH:mm`; F5 persist | No badge/time on Tuấn row; F5 still absent | 🔴 **FAIL** |
| **AC-03** Duplicate schedule → friendly 409 toast | No `POST interviews` in browser session; API duplicate 409 only | 🟡 **API PASS / browser not exercised** |
| **AC-05** Console clean | `pageErrors=0` · `consoleErrors=0` | 🟢 **PASS** |

Screenshots dir: `docs/qa/evidence/po-hrm-rec-iv-one-active-qa-02/` (harness writes when portal up).

---

## Spec says / code does

| Layer | BE-02 + FE-02 intent | U65 browser on Tuấn |
|---|---|---|
| POST slug | DTO accepts `main` · service returns 409 one-active | ✅ API after reload |
| FE merge | Pool row + spine email → badge | ❌ Tuấn pool-only |
| FE schedule | Lane A `scheduleRecruitmentInterview` | ❌ Blocked — no spine id for `tuanna@unicomhub.com` |

---

## Residual defects

| ID | Sev | Owner | Summary |
|---|---|---|---|
| `REC-IV-SPINE-POOL-EMAIL-LINK-P0` | P0 | dev-be + dev-fe | Pool row Tuấn (and typical pool imports) lack spine `recruitment_candidates` row — schedule + badge blocked |
| `REC-IV-BROWSER-409-TOAST-P1` | P1 | qa → dev-fe | Retest duplicate 409 toast after spine link exists; this run API-only |
| `REC-IV-BE-BUILD-TS2322-P1` | P1 | dev-be | Full `pnpm --filter hrm-api build` fails · deploy risk |
| `REC-IV-RUNTIME-RELOAD-P2` | P2 | devops | First probe hit stale DTO until watch reload — gate hrm-api restart on READY_FOR_QA |

**Not promoted:** `recruitment_uat_ready`, module GO, REC-03.

---

## completion_report

Retested after BE-02 + FE-02 READY. **L0 PASS**; unit **16/16 + 13/13 PASS**. API slug POST, duplicate **409** `HRM-REC-IV-409-ACTIVE`, cancel/complete→create **201** all **PASS** once hrm-api served BE-02 DTO. **Browser UF FAIL:** Tuấn pool row has **no spine email match** — no `POST /interviews` from schedule dialog, no «Đã có lịch» badge or F5 persist; duplicate 409 toast not captured in browser. Console clean. **Overall FAIL_TO_PM** (AC-02 blocker; AC-03 browser slice incomplete).

## next_owner

`pm` → dispatch `dev-be` (spine↔pool link / start-pipeline creates spine with pool email) then `qa` retest

## next_dispatch_prompt

```text
work_item_id: PO-HRM-REC-IV-ONE-ACTIVE-SPINE-POOL-LINK-03
from_role: pm
to_role: dev-be
lane: execution
change_mode: FIX narrow
read_first:
  - docs/qa/evidence/po-hrm-rec-iv-one-active-qa-02.md
  - docs/program/specs/PO-HRM-REC-IV-ONE-ACTIVE-SA-01.md §3.3
parent: PO-HRM-REC-IV-ONE-ACTIVE-QA-02
entry_criteria:
  - QA-02 FAIL AC-02 emailMergeGap Tuấn pool-only
task:
  - Ensure pool candidate (e.g. tuanna@unicomhub.com) has spine recruitment_candidates row with same email OR start-pipeline POST creates spine + returns id
  - Fix hrm-api build TS2322 recruitment.service.ts:703 for clean deploy
  - must_keep: BE-02 slug DTO; FE-02 merge + Lane A schedule; U65 no seed scripts
exit_criteria:
  - QA-02-R3 browser: Tuấn schedule → POST 201/409 not VAL-001; badge + vi-VN time; F5; duplicate toast
evidence_path: docs/qa/evidence/po-hrm-rec-iv-one-active-be-03.md
ack_status: READY_FOR_QA
Then QA: PO-HRM-REC-IV-ONE-ACTIVE-QA-02-R3
```

## evidence_path

- `docs/qa/evidence/po-hrm-rec-iv-one-active-qa-02.md`
- `docs/qa/evidence/_tmp-po-hrm-rec-iv-one-active-qa-02.json`
- `docs/qa/evidence/_tmp-po-hrm-rec-iv-one-active-qa-02-browser.json`

## ack_status

**FAIL_TO_PM**
