# Evidence — `PO-UAT-REC-JD-DND-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UAT-REC-JD-DND-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | L3 gate — **JD writer DnD slice ONLY** (storm=0 · palette→canvas) |
| **Verdict** | **GO WITH CONDITIONS** — JD DnD **CERTIFIED** (`C-SLICE-≠-MODULE`) · **NOT** full-module recruitment UAT |
| **ack_status** | `PASS_TO_PM` |
| **portal_url** | `http://127.0.0.1:5173` · HRM embed `/hr` · Thư viện JD |
| **parent** | `PO-UAT-REC-JD-DND-QA-01` `PASS_TO_PM` |
| **prior soft OBS** | [`po-uat-rec-soft-obs-qc-01.md`](po-uat-rec-soft-obs-qc-01.md) · soft OBS **CLOSED** · JD DnD was **NON-CERTIFIED** |
| **process baseline** | [`po-hrm-rec-ux-qc-process-01.md`](po-hrm-rec-ux-qc-process-01.md) · prior **NO-GO process** (384 DnD class) — history retained |
| **fe_ref** | [`po-uat-rec-jd-dnd-fe-01.md`](po-uat-rec-jd-dnd-fe-01.md) · `READY_FOR_QA` · commit `dc930c5` |
| **qa_ref** | [`po-uat-rec-jd-dnd-qa-01.md`](po-uat-rec-jd-dnd-qa-01.md) |
| **machine** | [`_tmp-po-uat-rec-jd-dnd-qa-01.FINAL.json`](_tmp-po-uat-rec-jd-dnd-qa-01.FINAL.json) · stamp **`JDDND-IEAW8L`** |
| **screens** | `docs/qa/evidence/screens/po-uat-rec-jd-dnd-qa-01/` |
| **spec_ref** | UF-JD-DND-01 · process FAIL-immediate (DnD/mojibake/Uncaught) · J-HRM-JD-02 writer usable completeness |
| **U65** | observe-only · zero-seed · no `apps/**` · no invent Lưu |
| **OS honesty** | DnD CERTIFIED ≠ `recruitment_uat_ready` · ≠ `jd_dynamic_done` · `C-SLICE-≠-MODULE` retained |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **recruitment_uat_ready** | **false** | **DENIED invent** — DnD slice CERTIFIED ≠ full-module GO · **PM must not set true** |
| **jd_dynamic_done** | **false** | **DENIED invent** — DnD CERTIFIED closes storm residual only · **not** full JD-dynamic program DONE |
| **JD DnD interactive** | **CERTIFIED** | Stamp `JDDND-IEAW8L` · storm=0 · palette→canvas · supersedes soft-OBS **NON-CERTIFIED** residual |
| **Module recruitment UAT** | **DENIED** | Slice ≠ module seal |
| **product_go / production GO** | **DENIED** | Out of scope |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | QA: Hủy only · resolve POST only · no job-templates persist |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT QA browser certify for **JD writer DnD slice** after FE-01:

| Item | Soft OBS QC prior | QA `JDDND-IEAW8L` | QC |
|------|-------------------|-------------------|-----|
| DnD storm (`Unable to find drag handle` / `any`) | NON-CERTIFIED residual · pack path dnd=0 only | singular=**0** · plural=**0** · `dndHits=0` · `dndStorm=false` | 🟢 **CERTIFIED** (writer path) |
| Palette → canvas | out of WI | mode=`palette-to-canvas` · groups **6→7** · ok=true | 🟢 **ACCEPT** |
| Writer usable after drop | — | dialog + submit chrome up | 🟢 **ACCEPT** |
| Uncaught / ReferenceError | CLEAN on pack | `pageErrors=[]` · ref=0 · type=0 | 🟢 **CLEAN** |
| Mojibake VI | CLEAN on pack | UTF-8 VI OK · no true mojibake | 🟢 **CLEAN** |
| Process FAIL-immediate | CLEAN pack · history NO-GO retained | `process_gates.verdict=PASS` | 🟢 **PASS** this seat |
| `C-SLICE-≠-MODULE` | retained | honesty false | 🟡 **CONDITION retained** |
| `recruitment_uat_ready` / `jd_dynamic_done` | DENIED | DENIED | 🔴 **still DENIED invent true** |

**GWC wording (allowed):** Soft-OBS residual **JD DnD NON-CERTIFIED** → **CLOSED / CERTIFIED** for writer DnD interactive on Thư viện JD · Thêm JD path.

**Still NOT clean full-module GO / NOT invent flags:** CONDITIONS remain **`C-SLICE-≠-MODULE`** + honesty **`recruitment_uat_ready=false`** + **`jd_dynamic_done=false`**. Process history NO-GO (`po-hrm-rec-ux-qc-process-01`) **retained** as baseline (384-class **not reproduced** on this FE-01 surface).

**Cấm:** invent `recruitment_uat_ready=true` · invent `jd_dynamic_done=true` · seed · invent Phase 1 DONE · claim full recruitment UAT / module GO from this seat · over-read soft-OBS CLOSED as module UAT-ready.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| May PM set `jd_dynamic_done=true`? | **NO** |
| Why | This seat = **JD DnD storm=0 CERTIFY ONLY** · `C-SLICE-≠-MODULE` · full JD-dynamic / recruitment module not sealed · prior process NO-GO history retained |
| Recommended flag state | keep **`recruitment_uat_ready=false`** · **`jd_dynamic_done=false`** |
| May PM update residual text (JD DnD CERTIFIED)? | **YES** — replace NON-CERTIFIED with **CERTIFIED (slice)** |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| Process honesty baseline | `po-hrm-rec-ux-qc-process-01.md` | NO-GO process · 384 DnD | History retained · not reopened invent |
| Soft OBS QC | `po-uat-rec-soft-obs-qc-01.md` | GWC · soft OBS CLOSED · JD **NON-CERTIFIED** | Gap this WI closes |
| FE-01 | `po-uat-rec-jd-dnd-fe-01.md` | READY_FOR_QA · canvas sameNode + dndReady | **ACCEPT** entry |
| QA | `po-uat-rec-jd-dnd-qa-01.md` | PASS_TO_PM · stamp `JDDND-IEAW8L` | **ACCEPT** |
| Machine FINAL | `_tmp-po-uat-rec-jd-dnd-qa-01.FINAL.json` | verdict PASS · honesty false | **ACCEPT** |
| QA pack verify | `verify:qc:evidence-pack` on QA MD | exit **1** · **6/8** (journey_l25 · residual_section) | 🟡 **PROCESS OBS** — QC consolidates **8/8** here |

### Machine JSON spot (stamp `JDDND-IEAW8L`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `JDDND-IEAW8L` | 🟢 |
| `l0` hrm/xbos/portal5173 | 200/200/200 | 🟢 |
| `honesty.recruitment_uat_ready` | **false** | 🟢 |
| `honesty.jd_dynamic_done` | **false** | 🟢 |
| `honesty.seed_used` | **false** | 🟢 U65 |
| `process_gates.dndHits` / `dndStorm` | **0** / **false** | 🟢 |
| `unable_find_drag_handle` / `any` | **0** / **0** | 🟢 |
| `mojibakeHits` / `uncaughtHits` | **0** / **0** | 🟢 |
| `pageErrors` / `consoleErrors` | `[]` / `[]` | 🟢 |
| `process_gates.verdict` | **PASS** | 🟢 |
| DnD mode | `palette-to-canvas` · groups **6→7** · ok | 🟢 |
| Network | POST `jd-pack-rules/resolve` **200** only | 🟢 no Lưu persist |
| `denied[]` | ready=true · jd_dynamic_done · seed · Phase1 · product GO | 🟢 |
| `residuals` | `[]` | 🟢 no P0/P1 product this seat |

### Screenshot visual spot

| File | QC observation |
|------|----------------|
| `02-jd-writer-before-dnd.png` | Writer **Thêm JD template** · chức danh **CEO Tổng Giám đốc** · palette + canvas · VI labels OK · drag handles visible · no mojibake |
| `03-jd-writer-after-dnd.png` | Same writer after drag · palette count reduced (item left palette) · canvas + dialog usable · UTF-8 VI OK · no error chrome |

**ENV vs PRODUCT:** PRODUCT FE-01 fix verified live on `:5173` + `:28001` — not ENV drift.

---

## L2.5 journey matrix (U19 — DnD certify)

| Journey / UF | Prior | QA retest | QC |
|--------------|-------|-----------|-----|
| **UF-JD-DND-01** (writer DnD certify) | OPEN / NON-CERTIFIED | **PASS** · storm=0 · palette→canvas | 🟢 **PASS · CERTIFIED** |
| **J-HRM-JD-02** writer usable completeness (DnD interaction) | Process NO-GO: create without DnD | DnD exercised · writer usable | 🟢 **process gap CLOSED** (DnD class) |
| Soft OBS CMP / IV | CLOSED | must_keep · not reopened | ⚪ retain CLOSED |
| Pack REC P1–P5 / full recruitment | Pack GWC | out of WI | ⚪ **C-SLICE-≠-MODULE** |
| Interview locale / shell dup (process baseline) | Missing UF history | out of WI | ⚪ not claimed this seat |

### CRUD / mutate (DnD slice scope)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| Open Thêm JD + resolve pack | Read + resolve POST | **PASS** · resolve **200** |
| Palette → canvas drag | UI mutate (no persist) | **PASS** · groups 6→7 |
| Hủy (no Lưu) | Cancel | **PASS** · U65 no invent persist |

---

## Process FAIL-immediate (CLEAN this seat)

| Gate | QA machine | QC |
|------|------------|-----|
| DnD storm | `dndHits=0` · `dndStorm=false` | 🟢 **CLEAN · CERTIFIED** |
| Mojibake | `mojibakeHits=0` | 🟢 CLEAN |
| Uncaught / ReferenceError / TypeError | `uncaughtHits=0` · `pageErrors=[]` | 🟢 CLEAN |
| Duplicate shell | Not claimed invent; out of primary AC | ⚪ not fail this seat |
| Process verdict | `PASS` | 🟢 **PASS** |

Sponsor baseline 384 DnD class hits (**process NO-GO** history) — **not reproduced** on FE-01 writer surface after hard refresh. History file retained; **do not** delete process NO-GO record.

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| Storm=0 + palette→canvas + writer usable | **PRODUCT OK** | ACCEPT · JD DnD **CERTIFIED** |
| Process gates PASS on writer path | **PROCESS CLEAN** | Closes L2.5 DnD incompleteness for this surface |
| QA pack verify **6/8** (missing J-* heading / Residual heading form) | **PROCESS OBS** | QC pack consolidates **8/8** — **not** product demote |
| Soft OBS CMP/IV | **PRODUCT OK** prior | must_keep CLOSED |
| `C-SLICE-≠-MODULE` | **CONDITION** | DnD CERTIFIED ≠ recruitment module UAT |
| invent `recruitment_uat_ready` / `jd_dynamic_done` | **HONESTY BLOCK** | QC DENIED |
| Prior process NO-GO file | **PROCESS HISTORY** | Retained · not invent reopen |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| JD writer DnD interactive storm | P0 prior | — | **CLOSED · CERTIFIED** | Stamp `JDDND-IEAW8L` · supersedes soft-OBS NON-CERTIFIED |
| Soft OBS CMP / IV | soft | — | **CLOSED** | must_keep |
| Process FAIL-immediate history (384) | process | — | **SUPERSEDED on this surface** | History retained |
| **C-SLICE-≠-MODULE** | honesty | **pm** | **OPEN** | Slice CERTIFY ≠ full-module GO |
| `recruitment_uat_ready` promote | P0 honesty | **pm** | **BLOCKED** | QC DENIED invent true |
| `jd_dynamic_done` promote | P0 honesty | **pm** | **BLOCKED** | DnD CERTIFIED ≠ program DONE |

**P0/P1 product residuals for this WI:** none (No residual product defects on DnD certify path).

**CONDITION for GWC:** JD DnD **CERTIFIED**; remaining CONDITIONS = **`C-SLICE-≠-MODULE`** + honesty flags **false** — deny full-module GO and deny invent `recruitment_uat_ready` / `jd_dynamic_done`.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uat-rec-jd-dnd-qa-01.md` | exit **1** · **6/8** (journey_l25 · residual_section) | **PROCESS OBS** — QC consolidates below |
| QA machine overall | **PASS** · stamp `JDDND-IEAW8L` · honesty false · exit **0** harness | PRODUCT OK |
| Process gates machine | dnd/mojibake/uncaught=0 · verdict PASS | PROCESS CLEAN |
| Spot screens before/after DnD | exist · UTF-8 OK · writer+palette+canvas | ASSET OK |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uat-rec-jd-dnd-qc-01.md` | expected **PASS** 8/8 after this file | QC pack SoT |

---

## Scope boundary (explicit)

| In seal | Out of seal |
|---------|-------------|
| JD writer DnD storm=0 CERTIFY (UF-JD-DND-01) | Full recruitment module UAT / `recruitment_uat_ready=true` |
| Palette→canvas + writer usable after drop | `jd_dynamic_done=true` / remaster DONE |
| Process FAIL-immediate CLEAN on writer path | Interview locale / shell dup full UF re-gate |
| Soft-OBS NON-CERTIFIED residual → CERTIFIED | Phase 1 DONE / product GO / production |
| Honesty flags **false** | Explicit full-module GO without sponsor seat |

**NOT Phase 1 DONE.** **NOT** `recruitment_uat_ready`. **NOT** full-module GO. **NOT** `jd_dynamic_done`. **JD DnD slice CERTIFIED only.**

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | See below |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-uat-rec-jd-dnd-qc-01.md` |
| **ack_status** | **PASS_TO_PM** |

### completion_report

**GO WITH CONDITIONS** for JD writer DnD certify seat. Stamp `JDDND-IEAW8L` proves **storm=0** (`unable_find_drag_handle`/`any`=0), **palette→canvas** (groups 6→7), writer usable, Uncaught=0, UTF-8 VI OK, process CLEAN. Soft-OBS residual **JD DnD NON-CERTIFIED** → **CERTIFIED (slice)**. Prior process NO-GO history retained (384-class not reproduced). **DENIED** invent `recruitment_uat_ready=true` / `jd_dynamic_done=true`. CONDITIONS: **`C-SLICE-≠-MODULE`**. U65 / seed DENIED. **NOT** Phase 1 DONE / full-module recruitment UAT.

### next_owner

pm

### next_dispatch_prompt

```text
work_item_id: PO-UAT-REC-PM-JD-DND-CERTIFY-01
from_role: pm
to_role: pm (bus + backlog)
lane: governance
parent: PO-UAT-REC-JD-DND-QC-01 GO WITH CONDITIONS
evidence: docs/qa/evidence/po-uat-rec-jd-dnd-qc-01.md
qa_stamp: JDDND-IEAW8L

task:
  - Bus INTAKE: JD writer DnD CERTIFIED (storm=0 · palette→canvas · UF-JD-DND-01); supersedes soft-OBS NON-CERTIFIED residual
  - Keep recruitment_uat_ready=false · jd_dynamic_done=false (QC DENIED invent)
  - Retain C-SLICE-≠-MODULE — DnD CERTIFIED ≠ full-module recruitment UAT / ≠ Phase1 DONE
  - Do NOT claim product GO / remaster / jd_dynamic_done from this seat
  - Continue PO-UAT-MODULES-PARALLEL-01 next open lane — idle-ok this DnD certify delta

exit: bus updated · honesty flags unchanged · residual text JD DnD CERTIFIED (slice)
```
