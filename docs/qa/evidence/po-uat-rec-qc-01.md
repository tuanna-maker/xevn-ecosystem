# Evidence — `PO-UAT-REC-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UAT-REC-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | L3 gate — **recruitment UAT pack slice** (P1–P5 + process FAIL-immediate gates) |
| **priority** | Process NO-GO re-prove · soft OBS · module promote DENIED |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` |
| **Verdict** | **GO WITH CONDITIONS** — recruitment UAT pack slice ACCEPT (`C-SLICE-≠-MODULE`) |
| **ack_status** | `PASS_TO_PM` |
| **parent** | `PO-UAT-REC-01` `PASS_TO_PM` |
| **program** | `PO-UAT-MODULES-PARALLEL-01` |
| **qa_ref** | [`po-uat-rec-01.md`](po-uat-rec-01.md) |
| **machine** | [`_tmp-po-uat-rec-01.FINAL.json`](_tmp-po-uat-rec-01.FINAL.json) · stamp **`UATREC-ICHFBD`** |
| **screens** | `docs/qa/evidence/screens/po-uat-rec-01/` (**16** PNG on disk) |
| **prior process** | [`po-hrm-rec-ux-qc-process-01.md`](po-hrm-rec-ux-qc-process-01.md) · **NO-GO (process)** 2026-08-06 |
| **spec_ref** | J-HRM-REC-UV-01 · J-HRM-REC-CMP-01 · J-HRM-JD-YCTD-01 · REC-IV one-active · plan chrome |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — pack PASS ≠ full recruitment module UAT / production GO |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **recruitment_uat_ready** | **false** | **DENIED** — soft OBS remain · slice ≠ full-module GO · **PM must not set true** |
| **jd_dynamic_done** | **false** | **DENIED** — pack did not certify JD writer DnD interactive |
| **remaster_program_done** | **false** | **DENIED** |
| **Module recruitment UAT** | **DENIED** as full-module promote | Pack slice GWC only |
| **product_go / production GO** | **DENIED** | Out of scope |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Machine `denied[]` includes `seed` · `recruitment_uat_ready=true` · `partial_slice_as_module_pass` |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT UAT pack reconfirm for **Tuyển dụng pack slice**: P1 UV create→list/F5 · P2 Compare YCTD · P3 YCTD↔JD bind · P4 Interview one-active (409+badge) · P5 Plan/candidates chrome · **process FAIL-immediate gates CLEAN** this run (DnD/mojibake/dup shell/Uncaught = 0). Soft OBS remain → **not** clean full-module GO / **not** `recruitment_uat_ready=true`.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| **P1** UV create → list · F5 | POST **201** `HRM-REC-202` · YCTD+position cells · F5 · stamp `UATREC-ICHFBD` | 🟢 **PASS** |
| **P2** Compare YCTD | dialog · picker · uvRows≥1 · matrix visible | 🟢 **PASS** · soft Network OBS |
| **P3** YCTD↔JD bind | POST **201** `HRM-REC-201` · `job_template_id` · jd-ref F5 | 🟢 **PASS** |
| **P4** Interview one-active | UTF-8 OK · POST **409** `HRM-REC-IV-409-ACTIVE` · badge | 🟢 **PASS** · soft console OBS |
| **P5** Plan + chrome | plans list→detail · brand=1 · dup=0 | 🟢 **PASS** |
| Process gates (4) | dnd=0 · mojibake=0 · uncaught=0 · brand=1 | 🟢 **CLEAN this run** |
| Soft OBS | CMP Network capture · IV 409 console.error | 🟡 **OPEN soft** — blocks clean GO / flag promote |
| Module / honesty flags | Explicit **false** | 🟢 honesty retained |
| Seed / API-only PASS | DENIED | 🟢 U65 |

**Cấm:** `recruitment_uat_ready=true` · invent Phase 1 DONE · claim full-module GO · seed · reopen process history as CLOSED without evidence.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| Why | Soft OBS remain (`R-REC-CMP-NET-CAPTURE` · `R-REC-IV-409-CONSOLE`) · `C-SLICE-≠-MODULE` · sponsor honesty DENIED unless **explicit full-module GO with zero P0/P1** — this seat is **GWC pack slice**, not full-module GO |
| Recommended flag state | keep `recruitment_uat_ready=false` · `jd_dynamic_done=false` |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| Process NO-GO | `po-hrm-rec-ux-qc-process-01.md` | PASS_TO_PM | History retained · four FAIL classes re-audited below |
| QA UAT pack | `po-uat-rec-01.md` | PASS_TO_PM | **ACCEPT** U65 browser · stamp `UATREC-ICHFBD` · pack verify **8/8** |
| Machine JSON | `_tmp-po-uat-rec-01.FINAL.json` | overall PASS_TO_PM | **ACCEPT** |
| Screens | 16/16 PNG cited | on disk | **ACCEPT** |

### Machine JSON spot (stamp `UATREC-ICHFBD`)

| Signal | Value | QC |
|--------|-------|-----|
| `env.STAMP` | `UATREC-ICHFBD` | 🟢 |
| `l0` portal/hrm/xbos | 200 | 🟢 |
| `pack.P1` | PASS · POST 201 `HRM-REC-202` · listOk · f5Ok · no `job_posting_id` | 🟢 |
| `pack.P2` | PASS · dialog · uvRows=1 · matrix=true · `compareNet=[]` | 🟢 product · 🟡 Network OBS |
| `pack.P3` | PASS · POST 201 `HRM-REC-201` · `job_template_id=b284e4cd-…` | 🟢 |
| `pack.P4` | PASS · utfOk · posts 409 `HRM-REC-IV-409-ACTIVE` · badge | 🟢 |
| `pack.P5` | PASS · brandMarkCount=1 · duplicateStrips=[] · Δdnd/unc=0 | 🟢 |
| `process_gates.summary` | dndHits=0 · mojibakeHits=0 · uncaughtHits=0 · duplicateShell=false | 🟢 |
| `process_gates.consoleErrors` | 409 resource + handled `Error scheduling interview` | 🟡 soft OBS (not Uncaught) |
| `honesty.recruitment_uat_ready` | **false** | 🟢 |
| `denied[]` | seed · ready=true · partial_slice_as_module_pass | 🟢 |
| `gaps` / `residuals` | `[]` | 🟢 no P0/P1 product in machine |
| `module_uat_pass` | true (QA seat claim) | ⚠ **slice claim only** — QC does **not** promote to `recruitment_uat_ready` |
| Network `/compare` | **absent** in machine `network[]` | 🟡 aligns soft OBS capture gap |
| Network applications | GET `applications?…&requisition_id=…&include=evals` **200** | 🟢 compare path data present |
| `overall` | **PASS_TO_PM** | 🟢 pack |

### Screenshot visual spot

| File | QC observation |
|------|----------------|
| `01c-after-save.png` / `01d-f5.png` | UV create + F5 path cited — P1 |
| `02b-compare-dialog.png` / `02c-compare-yctd.png` | Compare dialog + YCTD matrix — P2 FE OK |
| `03c-after-yctd-save.png` / `03d-f5.png` | YCTD↔JD bind + F5 — P3 |
| `04-interview-dialog.png` / `04b-after-schedule.png` | Interview dialog UTF-8 + after schedule — P4 |
| `05b-plan-detail.png` / `05c-candidates-chrome.png` | Plan detail + candidates chrome — P5 |
| Screens dir | **16** PNG cited; all **exist** on disk |

---

## Process NO-GO comparison (mandatory)

Prior: `po-hrm-rec-ux-qc-process-01.md` **NO-GO (process)** — DnD storm 384 · JS_THROW ×14 · interview mojibake · duplicate shell · over-read GWC as module OK.

| Prior FAIL class | This pack run | QC disposition |
|------------------|---------------|----------------|
| DnD `@hello-pangea/dnd` storm (≥10) | **0** hits · `dndStorm=false` | 🟢 **CLEAN on pack surfaces** |
| Mojibake VI (interview / labels) | P4 `utfOk=true` · `mojibakeHits=0` · `bodyHasMojibake=false` | 🟢 **CLEAN on pack surfaces** |
| Duplicate shell header | `brandMarkCount=1` · `duplicateStrips=[]` | 🟢 **CLEAN on pack surfaces** |
| Uncaught / ReferenceError | `uncaughtHits=0` · `pageErrors=[]` · referenceErrors=0 | 🟢 **CLEAN on pack surfaces** |
| Over-read GWC as module UAT | Honesty locks + this GWC wording | 🟢 **honesty retained** — no invent module ready |

**Process history:** file `po-hrm-rec-ux-qc-process-01.md` **retained** (do not delete / rewrite CLOSED invent). For the **four FAIL-immediate gates on P1–P5 surfaces**, QC stamps **SUPERSEDED by this pack re-prove** (clean).

**NON-CERTIFIED (must_keep):** JD design writer **DnD interactive drag** was a prior NO-GO driver and is **not** exercised as a drag UF in this pack → remain **NON-CERTIFIED** / out of seal for `jd_dynamic_done`. Do **not** invent process-NOGO full CLOSED for JD writer DnD.

---

## Soft OBS classification (block vs soft)

| ID | Signal | Class | Block product NO-GO? | Block `recruitment_uat_ready`? |
|----|--------|-------|----------------------|-------------------------------|
| **R-REC-CMP-NET-CAPTURE** | `compareNet=[]` while FE matrix rendered; no `/compare` in machine network (applications+evals 200 present) | **OBS** soft / harness capture | **NO** | **YES** (denies clean GO / promote) |
| **R-REC-IV-409-CONSOLE** | Expected business **409** `HRM-REC-IV-409-ACTIVE` + handled `console.error` in catch (not Uncaught) | **OBS** soft P2 — same class prior IV R4 waive | **NO** | **YES** (denies clean GO / promote) |

No PRODUCT P0/P1 residual in machine `gaps`/`residuals`. Soft OBS alone → **GWC**, not product NO-GO.

---

## Gate AC audit

| # | AC / Check | Evidence | QC |
|---|------------|----------|-----|
| 1 | L0 stack | QA MD + machine l0 200 | 🟢 |
| 2 | P1 UV 201 + FE cells + F5 | machine P1 + screens 01* | 🟢 |
| 3 | P2 Compare YCTD FE | machine P2 + screens 02* | 🟢 |
| 4 | P3 YCTD↔JD bind 201 + F5 | machine P3 + screens 03* | 🟢 |
| 5 | P4 Interview one-active 409 + badge + UTF-8 | machine P4 + screens 04* | 🟢 |
| 6 | P5 Plan chrome single brand | machine P5 + screens 05* | 🟢 |
| 7 | Process gates clean vs prior NO-GO | process_gates summary zeros | 🟢 pack surfaces |
| 8 | Soft OBS classified soft vs block | § Soft OBS | 🟢 |
| 9 | U65 zero-seed | denied seed · browser click path | 🟢 |
| 10 | Honesty `recruitment_uat_ready=false` | MD + machine + this QC | 🟢 **DENIED promote** |
| 11 | NOT Phase 1 DONE / not full-module GO | Explicit | 🟢 |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey | Prior slice QC | UAT pack 2026-08-07 | QC |
|---------|----------------|---------------------|-----|
| **J-HRM-REC-UV-01** | GWC create+list | P1 PASS | 🟢 |
| **J-HRM-REC-CMP-01** | GWC compare | P2 PASS · Network OBS | 🟢 product · 🟡 OBS |
| **J-HRM-JD-YCTD-01** | GWC bind | P3 PASS | 🟢 |
| **REC-IV one-active** | GWC IV | P4 PASS · 409 console OBS | 🟢 product · 🟡 OBS |
| Plan / candidates chrome | process shell | P5 PASS | 🟢 |
| JD writer DnD interactive | process NO-GO driver | **not in pack** | ⚪ **NON-CERTIFIED** |

### CRUD / mutate matrix (pack)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| P1 candidate create | Create | **PASS** |
| P1 list + F5 | Read | **PASS** |
| P2 compare dialog / matrix | Read | **PASS** (FE) |
| P3 requisition + JD bind | Create | **PASS** |
| P4 interview schedule (one-active) | Create (expect 409) | **PASS** business rule |
| P5 plans list→detail | Read | **PASS** |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| P1–P5 browser PASS + process gates 0 | **PRODUCT OK** (pack) | ACCEPT GWC slice |
| Prior process NO-GO four FAIL classes | **PROCESS SUPERSEDED** on pack surfaces | History file retained |
| JD writer DnD interactive | **OUT-OF-SCOPE / NON-CERTIFIED** | Not this pack UF |
| R-REC-CMP-NET-CAPTURE | **OBS** soft | Capture gap — not product FAIL |
| R-REC-IV-409-CONSOLE | **OBS** soft | Handled 409 — not Uncaught |
| Portal `:5173` | **ENV OBS** | QA L0 PASS on evidence port |
| QA `module_uat_pass=true` wording | **PROCESS OBS** | QC interprets as **pack seat PASS** only — **not** honesty flip |
| No P0/P1 product residual | **PRODUCT OK** | Machine `residuals: []` |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| Process FAIL-immediate (DnD/mojibake/dup/Uncaught) on P1–P5 | P0 process | — | **SUPERSEDED** (clean this run) | History `po-hrm-rec-ux-qc-process-01` retained |
| JD writer DnD interactive | P0 product/process (prior) | — | **OPEN NON-CERTIFIED** | Out of pack · blocks `jd_dynamic_done` |
| **R-REC-CMP-NET-CAPTURE** | P3 soft | qa optional | **OPEN soft** | Network harness empty vs FE matrix |
| **R-REC-IV-409-CONSOLE** | P2 soft | — | **OPEN soft** | Expected 409 console.error handled |
| `recruitment_uat_ready` promote | P0 honesty | **pm** | **BLOCKED** | QC DENIED |

**P0/P1 product residuals for this WI pack:** none.

**CONDITION for GWC:** soft OBS + `C-SLICE-≠-MODULE` + JD DnD NON-CERTIFIED — deny `recruitment_uat_ready=true` and deny clean full-module GO; **not** product NO-GO for pack slice.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uat-rec-01.md` | exit **0** · **8/8** | 🟢 pack ready |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uat-rec-qc-01.md` | expected **PASS** 8/8 after this file | QC pack SoT |
| QA machine overall | **PASS_TO_PM** · `module_uat_pass` seat-only | PRODUCT OK pack |
| Process gates machine summary | all zeros / duplicateShell false | PROCESS CLEAN pack |
| Spot screens 16/16 | exist on disk | ASSET OK |

---

## Scope boundary (explicit)

| In seal | Out of seal |
|---------|-------------|
| P1–P5 UAT pack reconfirm | Full recruitment module UAT / `recruitment_uat_ready=true` |
| Process FAIL-immediate clean on pack surfaces | JD writer DnD interactive certify / `jd_dynamic_done` |
| Soft OBS documented | Remaster / face_live / product GO |
| Honesty flags **false** | Phase 1 DONE · production GO · other HRM modules |

**NOT Phase 1 DONE.** **NOT** `recruitment_uat_ready`. **NOT** full-module GO.

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | See below |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-uat-rec-qc-01.md` |
| **ack_status** | **PASS_TO_PM** |

### completion_report

**GO WITH CONDITIONS** for **recruitment UAT pack slice** (P1–P5 + process FAIL-immediate gates). Stamp `UATREC-ICHFBD` proves UV create/list/F5 · Compare YCTD FE · YCTD↔JD bind · Interview one-active 409+badge UTF-8 · Plan chrome single brand. Prior process NO-GO four FAIL classes (**DnD / mojibake / dup shell / Uncaught**) **CLEAN on pack surfaces** this run → **SUPERSEDED** for those gates; history file retained; JD writer DnD interactive remains **NON-CERTIFIED**. Soft OBS (compare Network capture + expected IV 409 console) remain → **deny** clean full-module GO and **deny** `recruitment_uat_ready=true`. U65 / seed DENIED. **C-SLICE-≠-MODULE**. **NOT** Phase 1 DONE.

### next_owner

pm

### next_dispatch_prompt

```text
work_item_id: PO-UAT-REC-PM-CLOSE-01
from_role: pm
to_role: pm (bus + backlog)
lane: governance
parent: PO-UAT-REC-QC-01 GO WITH CONDITIONS
program: PO-UAT-MODULES-PARALLEL-01

task:
  - Bus INTAKE: REC UAT pack slice GWC — P1–P5 ACCEPT · process FAIL-immediate CLEAN on pack surfaces (SUPERSEDED vs po-hrm-rec-ux-qc-process-01 for those four classes only)
  - Keep recruitment_uat_ready=false · jd_dynamic_done=false (QC DENIED promote — soft OBS + C-SLICE-≠-MODULE)
  - Retain history docs/qa/evidence/po-hrm-rec-ux-qc-process-01.md — do not invent full process CLOSED / JD DnD certified
  - Soft OBS R-REC-CMP-NET-CAPTURE · R-REC-IV-409-CONSOLE — optional later polish; non-blocking product NO-GO
  - Continue PO-UAT-MODULES-PARALLEL-01 next module lane — idle-ok this REC UAT pack lane

exit: bus updated · honesty flags unchanged · no invent Phase1 DONE · no recruitment_uat_ready=true
evidence: docs/qa/evidence/po-uat-rec-qc-01.md
```
