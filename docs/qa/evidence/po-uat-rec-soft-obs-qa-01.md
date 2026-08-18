# Evidence — `PO-UAT-REC-SOFT-OBS-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UAT-REC-SOFT-OBS-QA-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | execution · soft OBS retest (pack GWC residual) |
| **parent** | `PO-UAT-REC-SOFT-OBS-FE-01` READY_FOR_QA |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed · browser-only · no invent flags |
| **persona** | `ceo@xe.vn` · `company_id=main` |
| **portal** | `http://127.0.0.1:5173` |
| **L0** | portal/hrm/xbos **200** · `qc:fe-be-health` ALL PASS |
| **machine_json** | `docs/qa/evidence/_tmp-po-uat-rec-soft-obs-qa-01.FINAL.json` |
| **harness** | `scripts/qa/_tmp-po-uat-rec-soft-obs-qa-01.mjs` |
| **screens** | `docs/qa/evidence/screens/po-uat-rec-soft-obs-qa-01/` |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **recruitment_uat_ready** | **false** | **DENIED invent** — soft OBS close ≠ module UAT ready |
| **jd_dynamic_done** | **false** | **DENIED** — JD DnD interactive still NON-CERTIFIED |
| Seed in evidence | **none** | U65 |

---

## Soft OBS verdict

| OBS ID | Prior | This run | Verdict |
|--------|-------|----------|---------|
| **R-REC-CMP-NET-CAPTURE** | OPEN soft (`compareNet=[]` while matrix FE) | `compareNetLen=1` GET `/compare` **200** + matrix FE + uvRows=1 | **CLOSED** |
| **R-REC-IV-409-CONSOLE** | OPEN soft (`console.error('Error scheduling interview')` on expected 409) | POST **409** `HRM-REC-IV-409-ACTIVE` · toast · badge · **0** `Error scheduling interview` | **CLOSED** |

---

## Retest detail

### P2 — Compare YCTD (`J-HRM-REC-CMP-01`)

- Click path: `/hr/recruitment?tab=evaluations` → So sánh → dialog → YCTD picker
- Tried 2 YCTD options under U65 (first empty UV); landed on `YCTD UAT REC UATREC-ICEHPX` · `uvRows=1`
- Network: **GET** `/api/hrm/recruitment/compare?company_id=main&requisition_id=e1c8c160-…&candidate_ids=11a5906f-…` → **200**
- FE: `hdsd-rec-compare-matrix` visible · no `job_postings` SoT
- Screens: `02-evaluations` · `02b-compare-dialog` · `02c-compare-yctd`
- Verdict: 🟢 **PASS** · soft OBS **CLOSED**

### P4 — Interview one-active

- Click path: Candidates → Tuấn → calendar → dialog «Lên lịch phỏng vấn»
- UTF-8 labels OK (no mojibake)
- Network: POST interviews → **409** `HRM-REC-IV-409-ACTIVE`
- FE: toast visible · badge «Đã có lịch» visible
- Console: **no** `Error scheduling interview` (soft OBS closed)
- Note: Chromium may still emit native `Failed to load resource: 409 (Conflict)` — **not** app `console.error` catch; process Uncaught=0
- Screens: `04-candidates` · `04b-interview-dialog` · `04c-after-schedule`
- Verdict: 🟢 **PASS** · soft OBS **CLOSED**

### Process FAIL-immediate (P2/P4 path)

| Gate | Result |
|------|--------|
| DnD storm (`@hello-pangea/dnd` / drag handle) | **0** |
| Mojibake | **0** |
| Duplicate shell | **false** |
| Uncaught / ReferenceError / TypeError | **0** |
| Verdict | 🟢 **PASS** (CLEAN) |

---

## Gaps / residuals

| ID | Status | Note |
|----|--------|------|
| R-REC-CMP-NET-CAPTURE | **CLOSED** | Proven GET `/compare` when uvRows≥1 |
| R-REC-IV-409-CONSOLE | **CLOSED** | No app `Error scheduling interview` on expected 409 |
| `recruitment_uat_ready` | **OPEN false** | QC flag decision — **do not invent true** |
| JD DnD NON-CERTIFIED | **OPEN** | out of WI · `jd_dynamic_done=false` |
| C-SLICE-≠-MODULE | **OPEN** | Pack GWC history retained; soft OBS close alone ≠ full-module GO |

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Soft OBS retest PASS: P2 Compare GET `/compare` 200 + matrix (R-REC-CMP-NET-CAPTURE CLOSED); P4 Interview 409 ACTIVE + toast/badge without `Error scheduling interview` (R-REC-IV-409-CONSOLE CLOSED); process FAIL-immediate CLEAN. Honesty: `recruitment_uat_ready=false`, `jd_dynamic_done=false`. |
| **next_owner** | **qc** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-uat-rec-soft-obs-qa-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt

```text
work_item_id: PO-UAT-REC-SOFT-OBS-QC-01
from_role: pm
to_role: qc
lane: governance
parent: PO-UAT-REC-SOFT-OBS-QA-01 PASS_TO_PM
entry_criteria: QA soft OBS CLOSED evidence; prior pack GWC po-uat-rec-qc-01
evidence_ref: docs/qa/evidence/po-uat-rec-soft-obs-qa-01.md
machine: docs/qa/evidence/_tmp-po-uat-rec-soft-obs-qa-01.FINAL.json
prior: docs/qa/evidence/po-uat-rec-qc-01.md · po-uat-rec-soft-obs-fe-01.md

task:
  - Audit soft OBS R-REC-CMP-NET-CAPTURE + R-REC-IV-409-CONSOLE CLOSED vs QA evidence (compareNet GET 200; no Error scheduling interview on 409 ACTIVE)
  - Confirm process FAIL-immediate still CLEAN on pack surfaces
  - Recruitment flag decision: may CLOSE soft OBS conditions for cleaner GO/GWC wording — still do NOT invent recruitment_uat_ready=true (C-SLICE-≠-MODULE + JD DnD NON-CERTIFIED remain)
  - Cấm: invent recruitment_uat_ready=true · claim jd_dynamic_done · reopen process NO-GO invent

exit: GO | GO WITH CONDITIONS | NO-GO · evidence docs/qa/evidence/po-uat-rec-soft-obs-qc-01.md
```
