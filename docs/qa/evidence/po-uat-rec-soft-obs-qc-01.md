# Evidence — `PO-UAT-REC-SOFT-OBS-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UAT-REC-SOFT-OBS-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | L3 gate — soft OBS close delta on recruitment UAT pack GWC |
| **Verdict** | **GO WITH CONDITIONS** — soft OBS **CLOSED**; pack GWC wording tightened; **NOT** full-module GO |
| **ack_status** | `PASS_TO_PM` |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` |
| **parent** | `PO-UAT-REC-SOFT-OBS-QA-01` `PASS_TO_PM` |
| **prior_pack_gwc** | [`po-uat-rec-qc-01.md`](po-uat-rec-qc-01.md) · **GWC** pack slice (`C-SLICE-≠-MODULE`) |
| **qa_ref** | [`po-uat-rec-soft-obs-qa-01.md`](po-uat-rec-soft-obs-qa-01.md) |
| **machine** | [`_tmp-po-uat-rec-soft-obs-qa-01.FINAL.json`](_tmp-po-uat-rec-soft-obs-qa-01.FINAL.json) · stamp **`SOFTOBS-IDRTR4`** |
| **screens** | `docs/qa/evidence/screens/po-uat-rec-soft-obs-qa-01/` |
| **spec_ref** | J-HRM-REC-CMP-01 · REC-IV one-active · process FAIL-immediate |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | Soft OBS close ≠ `recruitment_uat_ready=true` · `C-SLICE-≠-MODULE` retained |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **recruitment_uat_ready** | **false** | **DENIED invent** — soft OBS CLOSED alone ≠ full-module GO · **PM must not set true** |
| **jd_dynamic_done** | **false** | **DENIED** — JD writer DnD interactive remains **NON-CERTIFIED** |
| **Module recruitment UAT** | **DENIED** as full-module promote | Pack GWC + soft OBS delta only |
| **product_go / production GO** | **DENIED** | Out of scope |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Machine `denied[]` includes seed · ready=true · jd_dynamic_done=true |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT soft OBS close delta on top of prior recruitment UAT pack GWC (`po-uat-rec-qc-01`):

| Item | Prior pack GWC | Soft OBS QA | QC |
|------|----------------|-------------|-----|
| **R-REC-CMP-NET-CAPTURE** | OPEN soft (`compareNet=[]`) | GET `/compare` **200** · `compareNetLen=1` · matrix FE · uvRows=1 | 🟢 **CLOSED** |
| **R-REC-IV-409-CONSOLE** | OPEN soft (`Error scheduling interview`) | POST **409** `HRM-REC-IV-409-ACTIVE` · toast · badge · `scheduleConsoleError=[]` | 🟢 **CLOSED** |
| Process FAIL-immediate (4) | CLEAN on pack surfaces | dnd=0 · mojibake=0 · dup=false · Uncaught=0 | 🟢 **still CLEAN** |
| Chromium native `Failed to load resource: 409` | — | Present in `consoleErrors` | 🟢 **not** app `console.error` · not Uncaught · **not** reopen soft OBS |
| `C-SLICE-≠-MODULE` | OPEN | OPEN | 🟡 **CONDITION retained** |
| JD DnD NON-CERTIFIED | OPEN | OPEN (out of WI) | 🟡 **CONDITION retained** |
| `recruitment_uat_ready` | DENIED | false honesty | 🔴 **still DENIED invent true** |

**GWC wording tighten (allowed):** soft OBS conditions may be marked **CLOSED** — no longer block cleaner pack-slice GWC wording.

**Still NOT clean full-module GO / NOT invent `recruitment_uat_ready=true`:** residual CONDITIONS = `C-SLICE-≠-MODULE` + JD DnD NON-CERTIFIED (and no explicit full-module GO seat).

**Cấm:** invent `recruitment_uat_ready=true` · claim `jd_dynamic_done` · seed · invent Phase 1 DONE · reopen process NO-GO invent.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| Why | Soft OBS CLOSED removes prior soft blockers to *flag promote*, but **`C-SLICE-≠-MODULE` + JD DnD NON-CERTIFIED** remain — sponsor honesty requires **explicit full-module GO** with zero P0/P1 before true |
| Recommended flag state | keep `recruitment_uat_ready=false` · `jd_dynamic_done=false` |
| May PM tighten bus/GWC residual text (soft OBS CLOSED)? | **YES** |

---

## Soft OBS audit vs QA evidence

### R-REC-CMP-NET-CAPTURE → CLOSED

| Signal | QA MD | Machine FINAL | QC |
|--------|-------|---------------|-----|
| Journey | J-HRM-REC-CMP-01 · evaluations → So sánh | `pack.P2_COMPARE_YCTD` | 🟢 |
| Network | GET `/api/hrm/recruitment/compare?…` **200** | `compareNet[0].status=200` · `compare:true` | 🟢 |
| FE | `hdsd-rec-compare-matrix` · no job_postings SoT | `compareOk=true` · `softClosed=true` | 🟢 |
| Screen | `02c-compare-yctd.png` | cited | 🟢 visual: YCTD `UATREC-ICEHPX` · 1 UV selected · dialog OK · no mojibake |
| Verdict | CLOSED | `soft_obs.R-REC-CMP-NET-CAPTURE=CLOSED` | 🟢 **ACCEPT CLOSED** |

### R-REC-IV-409-CONSOLE → CLOSED

| Signal | QA MD | Machine FINAL | QC |
|--------|-------|---------------|-----|
| Journey | Candidates → Tuấn → Lên lịch | `pack.P4_INTERVIEW_SCHEDULE` | 🟢 |
| Network | POST interviews **409** `HRM-REC-IV-409-ACTIVE` | `lastInterviewPost.code=HRM-REC-IV-409-ACTIVE` | 🟢 |
| FE | toast + badge «Đã có lịch» | `toast=true` · `badge=true` | 🟢 screen `04c-after-schedule.png` |
| App console | **0** `Error scheduling interview` | `scheduleConsoleError=[]` | 🟢 |
| Native Chromium 409 resource | Documented as non-app | `consoleErrors` has native Failed to load resource 409 only | 🟢 **ACCEPT** — does **not** reopen OBS |
| Verdict | CLOSED | `soft_obs.R-REC-IV-409-CONSOLE=CLOSED` | 🟢 **ACCEPT CLOSED** |

---

## Process FAIL-immediate (still CLEAN)

| Gate | Soft OBS QA machine | QC |
|------|---------------------|-----|
| DnD storm (`@hello-pangea/dnd` / drag handle) | `dndHits=0` · `dndStorm=false` | 🟢 CLEAN |
| Mojibake | `mojibakeHits=0` · `bodyHasMojibake=false` | 🟢 CLEAN |
| Duplicate shell | `dupShell=false` · brandMarkCount=0 on path | 🟢 CLEAN |
| Uncaught / ReferenceError / TypeError | `uncaughtHits=0` · `pageErrors=[]` | 🟢 CLEAN |
| Process verdict | `process_gates.verdict=PASS` | 🟢 **PASS** |

Prior process history `po-hrm-rec-ux-qc-process-01.md` **retained**. Four FAIL-immediate classes remain **SUPERSEDED on pack surfaces** (no reopen invent). JD writer DnD interactive remains **NON-CERTIFIED**.

---

## L2.5 journey matrix (U19 — soft OBS delta)

| Journey | Prior pack GWC | Soft OBS retest | QC |
|---------|----------------|-----------------|-----|
| **J-HRM-REC-CMP-01** | P2 PASS · Network OBS OPEN | P2 PASS · Network GET `/compare` 200 | 🟢 **OBS CLOSED** |
| **REC-IV one-active** | P4 PASS · console OBS OPEN | P4 PASS · no app `Error scheduling interview` | 🟢 **OBS CLOSED** |
| J-HRM-REC-UV-01 / JD-YCTD / Plan chrome | Pack GWC seal | not re-run this WI | ⚪ retain prior pack GWC |
| JD writer DnD interactive | NON-CERTIFIED | out of WI | ⚪ **NON-CERTIFIED** |

### CRUD / mutate (soft OBS scope)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| P2 compare GET + matrix FE | Read | **PASS** · OBS CLOSED |
| P4 interview schedule one-active | Create (expect 409) | **PASS** business · OBS CLOSED |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| Soft OBS CLOSED (CMP Network + IV console) | **PRODUCT OK** (delta) | ACCEPT close |
| Process gates 0 on P2/P4 path | **PROCESS CLEAN** | Retain SUPERSEDED disposition |
| Chromium native 409 resource log | **OBS ENV/browser** | Not app console.error · not Uncaught |
| QA evidence pack verify **3/8** | **PROCESS OBS** | QC consolidates **8/8** here — **not** product demote |
| `C-SLICE-≠-MODULE` | **CONDITION** | Pack ≠ module UAT |
| JD DnD NON-CERTIFIED | **CONDITION** | Blocks `jd_dynamic_done` |
| invent `recruitment_uat_ready=true` | **HONESTY BLOCK** | QC DENIED |
| No P0/P1 product residual in machine | **PRODUCT OK** | `residuals: []` · `gaps: []` |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-REC-CMP-NET-CAPTURE** | soft | — | **CLOSED** | GET `/compare` 200 proven |
| **R-REC-IV-409-CONSOLE** | soft | — | **CLOSED** | No app `Error scheduling interview` on 409 ACTIVE |
| Process FAIL-immediate (4) on pack | P0 process | — | **SUPERSEDED / CLEAN** | History retained |
| JD writer DnD interactive | P0 prior | — | **OPEN NON-CERTIFIED** | Out of WI · blocks `jd_dynamic_done` |
| **C-SLICE-≠-MODULE** | honesty | **pm** | **OPEN** | Pack GWC ≠ full-module GO |
| `recruitment_uat_ready` promote | P0 honesty | **pm** | **BLOCKED** | QC DENIED invent true |

**P0/P1 product residuals for this WI:** none.

**CONDITION for GWC (tightened):** soft OBS **CLOSED**; remaining CONDITIONS = `C-SLICE-≠-MODULE` + JD DnD NON-CERTIFIED — deny `recruitment_uat_ready=true` and deny clean full-module GO; **not** product NO-GO for pack slice / soft OBS delta.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uat-rec-soft-obs-qa-01.md` | exit **1** · **3/8** (command_table · crud_or_matrix · residual_section) | **PROCESS OBS** — QC consolidates below |
| QA machine overall | **PASS_TO_PM** · soft_obs both CLOSED · honesty false | PRODUCT OK delta |
| Process gates machine summary | dnd/mojibake/uncaught=0 · dupShell false | PROCESS CLEAN |
| Spot screens compare + after-schedule | exist · UTF-8 OK · toast+badge visible | ASSET OK |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uat-rec-soft-obs-qc-01.md` | expected **PASS** 8/8 after this file | QC pack SoT |

---

## Scope boundary (explicit)

| In seal | Out of seal |
|---------|-------------|
| Soft OBS R-REC-CMP-NET-CAPTURE + R-REC-IV-409-CONSOLE CLOSED | Full recruitment module UAT / `recruitment_uat_ready=true` |
| Process FAIL-immediate reconfirm CLEAN on P2/P4 | JD writer DnD certify / `jd_dynamic_done` |
| Tighten GWC residual wording (soft OBS closed) | Remaster / face_live / product GO / Phase 1 DONE |
| Honesty flags **false** | Explicit full-module GO without sponsor seat |

**NOT Phase 1 DONE.** **NOT** `recruitment_uat_ready`. **NOT** full-module GO. **NOT** `jd_dynamic_done`.

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | See below |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-uat-rec-soft-obs-qc-01.md` |
| **ack_status** | **PASS_TO_PM** |

### completion_report

**GO WITH CONDITIONS** for soft OBS close delta on recruitment UAT pack. Stamp `SOFTOBS-IDRTR4` proves **R-REC-CMP-NET-CAPTURE CLOSED** (GET `/compare` 200 + matrix) and **R-REC-IV-409-CONSOLE CLOSED** (409 ACTIVE + toast/badge without app `Error scheduling interview`). Process FAIL-immediate still **CLEAN**. Prior pack GWC (`po-uat-rec-qc-01`) retained; GWC wording may drop open soft OBS. **DENIED** invent `recruitment_uat_ready=true` / `jd_dynamic_done` — CONDITIONS remain **`C-SLICE-≠-MODULE` + JD DnD NON-CERTIFIED**. U65 / seed DENIED. **NOT** Phase 1 DONE / full-module GO.

### next_owner

pm

### next_dispatch_prompt

```text
work_item_id: PO-UAT-REC-PM-SOFT-OBS-CLOSE-01
from_role: pm
to_role: pm (bus + backlog)
lane: governance
parent: PO-UAT-REC-SOFT-OBS-QC-01 GO WITH CONDITIONS
prior_pack: docs/qa/evidence/po-uat-rec-qc-01.md (GWC pack slice)

task:
  - Bus INTAKE: soft OBS R-REC-CMP-NET-CAPTURE + R-REC-IV-409-CONSOLE CLOSED (SOFTOBS-IDRTR4); process FAIL-immediate still CLEAN
  - Tighten GWC residual wording — soft OBS no longer OPEN; keep pack GWC + C-SLICE-≠-MODULE
  - Keep recruitment_uat_ready=false · jd_dynamic_done=false (QC DENIED invent — C-SLICE + JD DnD NON-CERTIFIED remain)
  - Do NOT claim full-module GO / Phase1 DONE / jd_dynamic_done
  - Continue PO-UAT-MODULES-PARALLEL-01 next open lane — idle-ok this REC soft-OBS delta

exit: bus updated · honesty flags unchanged · no invent recruitment_uat_ready=true
evidence: docs/qa/evidence/po-uat-rec-soft-obs-qc-01.md
```
