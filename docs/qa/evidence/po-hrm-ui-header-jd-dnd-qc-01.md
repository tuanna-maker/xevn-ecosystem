# Evidence — `PO-HRM-UI-HEADER-JD-DND-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-HEADER-JD-DND-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-06 |
| **lane** | L3 governance — **re-gate FE-01 residuals only** (CC header · JD DnD · interview UTF-8 · named ReferenceErrors) |
| **priority** | P0 residual seal (post process NO-GO) |
| **portal_url** | `http://127.0.0.1:5173` · `ceo@xe.vn` · `company_id=main` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no persist mutate (resolve-only POST allowed in QA) |
| **process context** | `docs/qa/evidence/po-hrm-rec-ux-qc-process-01.md` — module UAT claims **DENIED** (still applies) |
| **NOT claimed** | recruitment UAT-ready · `jd_dynamic_done` · remaster program DONE · Face LIVE · product GO · Phase 1 DONE |
| **recruitment_uat_ready** | **false** |
| **jd_dynamic_done** | **false** |
| **remaster_program_done** | **false** |
| **face_live** | **false** |
| **product_go** | **false** |
| **phase1_done** | **false** |
| **commit (QA cite)** | `dc930c5` |

---

## Verdict summary

**GO WITH CONDITIONS** — **this pack only** (FE-01 four residual UFs) **ACCEPT**:

1. **UF-CC-HEADER-01** — single TopHeader / `portal-brand-mark`; no duplicate «XeVN OS / Command Center» page strip; persona BOD / Quản lý / Nhân viên usable
2. **UF-JD-DND-01** — canvas-reorder DnD exercised; writer usable after drop; drag-handle invariant class counts **0**
3. **UF-REC-INTERVIEW-UTF-01** — dialog title «Lên lịch phỏng vấn» + labels Ngày/Giờ/Thời lượng/Hình thức/Địa điểm UTF-8 OK; zero mojibake
4. **UF-REFERROR-01** — `getDialogPortalContainer` = **0** · `LayoutDashboard` = **0** · `pageErrors=[]` · `consoleErrors=[]`

**Conditions** = honesty + process locks (below). Process NO-GO (`PO-HRM-REC-UX-QC-PROCESS-01`) is **not** overturned. Prior JD-dynamic GWC is **not** re-certified as module runnable.

**No product P0 residual** on the four in-scope FE-01 defects → residual lane **idle-ok**. Program recruitment / JD-dynamic / remaster remain open under separate ownership.

---

## Entry audit (FE + QA)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| Dev-FE READY 5/5 | `docs/qa/evidence/po-hrm-ui-header-jd-dnd-fe-01.md` | READY_FOR_QA | **ACCEPT** — root causes map to 5 residuals; must_keep honesty false |
| QA browser U65 4/4 | `docs/qa/evidence/po-hrm-ui-header-jd-dnd-qa-01.md` | PASS_TO_PM · verdict **PASS** · harness exit **0** | **ACCEPT** |
| Process honesty | `docs/qa/evidence/po-hrm-rec-ux-qc-process-01.md` | NO-GO (process) | **STILL BINDING** for module UAT / product GO claims |

### Machine log

| Artifact | Present | QC |
|----------|---------|-----|
| `docs/qa/evidence/_tmp-po-hrm-ui-header-jd-dnd-qa-01.FINAL.json` | ✅ | `verdict: PASS` · `failReasons: []` · 20/20 checks `pass: true` · honesty flags all false |

### Console class counts (FINAL JSON — QC confirm)

| Class | Count | Gate |
|-------|------:|------|
| `unable_find_drag_handle` | **0** | PASS |
| `unable_find_any_drag_handles` | **0** | PASS |
| `getDialogPortalContainer` | **0** | PASS |
| `LayoutDashboard` | **0** | PASS |
| `pageErrors` | `[]` | PASS |
| `consoleErrors` | `[]` | PASS |

Sponsor baseline pre-fix (**384** DnD + **~14** ReferenceError) **not reproduced** on QA session after hard refresh — ACCEPT for this residual seal.

### Screenshots (disk + visual spot)

| File | QC spot |
|------|---------|
| `…/01-cc-shell.png` | ✅ Single XeVN TopHeader + slim persona pills (BOD / Quản lý / Nhân viên); **no** second brand title strip |
| `…/02-cc-persona.png` | ✅ cited by QA (persona after clicks) |
| `…/03-jd-library.png` | ✅ cited |
| `…/04-jd-writer-before-dnd.png` | ✅ cited |
| `…/05-jd-writer-after-dnd.png` | ✅ Writer open · canvas groups with drag handles · UTF-8 VI OK · submit chrome present |
| `…/06-candidates.png` | ✅ cited |
| `…/07-interview-schedule-dialog.png` | ✅ Title «Lên lịch phỏng vấn» + 5 labels đúng dấu · zero mojibake |

---

## AC / UF matrix (this pack)

| # | UF / AC | QA | QC spot | Result |
|---|---------|----|---------|--------|
| 1 | UF-CC-HEADER-01 — single brand mark · no duplicate strip · persona usable | 🟢 | PNG 01 visual | **PASS** |
| 2 | UF-JD-DND-01 — drag canvas · writer usable · zero drag-handle invariants | 🟢 | PNG 05 + JSON DnD OBS | **PASS** |
| 3 | UF-REC-INTERVIEW-UTF-01 — title + 5 labels UTF-8 · zero mojibake | 🟢 | PNG 07 visual | **PASS** |
| 4 | UF-REFERROR-01 — zero named ReferenceErrors on tested paths | 🟢 | FINAL `consoleClassCounts` | **PASS** |

**Score:** **4/4 PASS** on in-scope FE-01 residuals.

---

## L2.5 / journey honesty (U19)

| Journey / UF | This seat | QC |
|--------------|-----------|-----|
| **UF-CC-HEADER-01** (shell) | PASS | **PASS** — shell integrity UF from process NO-GO; not a PROGRAM_JOURNEY_MAP `J-*` id |
| **UF-JD-DND-01** (DnD interaction) | PASS | **PASS** — closes L2.5 DnD gap called out in process NO-GO (prior create-only OBS) |
| **UF-REC-INTERVIEW-UTF-01** | PASS | **PASS** — locale UF missing from prior JD QC-01 |
| **UF-REFERROR-01** | PASS | **PASS** |
| **J-HRM-JD-01..03** / G4 | **not re-run** | **deferred** — this pack does **not** re-certify CFG/create/snapshot |
| Recruitment module UAT-ready / product GO | Denied | **DENIED** |

Mandatory for this gate: the four UFs above + honesty denials. **Not** invent recruitment UAT / `jd_dynamic_done` / remaster / Face LIVE / product GO / Phase 1 DONE.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | FE-01 five residuals CLOSED on live `:5173` + `:28001` — header duplicate · DnD storm · interview mojibake · `getDialogPortalContainer` · `LayoutDashboard` |
| **PROCESS** | Module UAT / GWC-as-certification silence still governed by `po-hrm-rec-ux-qc-process-01.md` — **DENIED** promotion |
| **ENV** | None driving verdict — L0 portal/HRM/XBOS **200** cited by QA |
| **OUT-OF-SCOPE** | Full recruitment E2E · J-HRM-JD-01..03 re-gate · YCTD-REF BA/DB · remaster · Face LIVE · Phase 1 · product GO |

---

## Evidence pack gate

| Check | Result |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-header-jd-dnd-qa-01.md --check-assets` | **PASS** · exit **0** · pack **8/8** · assets **7 PNG** OK |
| QC opened QA MD + FINAL JSON + FE MD + process NO-GO | **Yes** (not bus-title-only) |
| This QC evidence consolidated path | `docs/qa/evidence/po-hrm-ui-header-jd-dnd-qc-01.md` |

---

## Explicit denials (MUST)

| Claim | Status |
|-------|--------|
| Recruitment UAT-ready / module «chạy được» | **DENIED** |
| `jd_dynamic_done` | **DENIED** |
| `remaster_program_done` | **DENIED** |
| Face LIVE | **DENIED** |
| Product GO | **DENIED** |
| Phase 1 DONE | **DENIED** / **NOT Phase 1 DONE** |

**Hard rule for PM/comms:** Cite this QC only as *«FE-01 residual UF seal GWC (header / DnD / interview UTF-8 / RefError)»* — **never** as recruitment UAT-ready or overturn of process NO-GO.

---

## Residual

| Item | Status | Owner |
|------|--------|-------|
| FE-01 four UFs (header / DnD / interview UTF-8 / RefError) | **CLOSED** | — |
| Recruitment UAT-ready / module E2E | **OPEN** (false) | PM program |
| `jd_dynamic_done` / remaster / Face / product GO / Phase1 | **OPEN** (Denied) | PM program |
| J-HRM-JD-01..03 + G4 re-stamp (optional) | deferred | PM → QC if requested |
| Process rule adoption (console-storm FAIL) | OPEN governance | PM |
| BA YCTD-REF / other REC outside FE-01 | separate lanes | ba-data / PM |

**ENV vs PRODUCT:** closed defects are **PRODUCT** fixes verified on live stack — not ENV drift.

---

## Honesty

- GWC = FE-01 residual pack seal only.
- Does **not** overturn `PO-HRM-REC-UX-QC-PROCESS-01` NO-GO for module UAT claims.
- Does **not** claim remaster / `jd_dynamic_done` / Face LIVE / product GO / Phase 1 DONE.
- Mutates in QA: incidental `POST …/jd-pack-rules/resolve` only — no job-template create, no interview schedule POST.

---

## Commands (QC seat)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-header-jd-dnd-qa-01.md --check-assets` | **PASS** · **8/8** · 7 PNG |
| Visual spot PNG 01 / 05 / 07 | **PASS** |
| FINAL JSON console class audit | **PASS** (all 0) |

---

## completion_report

**Closed:** QC re-gate of `PO-HRM-UI-HEADER-JD-DND-QA-01` — 4/4 UF ACCEPT; console drag-handle / getDialogPortalContainer / LayoutDashboard class counts **0**; QA pack verify **8/8**; screens 01/05/07 visual spot PASS; honesty denials recorded; process NO-GO still binding for module UAT.

**Open / residual:** recruitment UAT-ready · `jd_dynamic_done` · remaster · Face LIVE · product GO · Phase 1 DONE — all **Denied**; J-HRM-JD-01..03 not re-run.

**ack_status:** `PASS_TO_PM`

**next_owner:** `pm`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-UI-HEADER-JD-DND-QC-01-INTAKE
role: pm
lane: governance — intake GWC residual seal; do not invent module UAT

entry_criteria:
  - QC GWC: docs/qa/evidence/po-hrm-ui-header-jd-dnd-qc-01.md
  - QA PASS pack: docs/qa/evidence/po-hrm-ui-header-jd-dnd-qa-01.md (8/8)
  - Process NO-GO still binding: docs/qa/evidence/po-hrm-rec-ux-qc-process-01.md

exit_criteria:
  - Bus INTAKE + stamp FE-01 residuals CLOSED (header / DnD / interview UTF-8 / RefError)
  - MUST keep false: recruitment_uat_ready · jd_dynamic_done · remaster_program_done · face_live · product_go · Phase1 DONE
  - Idle-ok this residual lane OR dispatch next OPEN program item from PM_OPEN_BACKLOG (e.g. YCTD-REF / other REC) — do not re-dispatch same QC
  - Comms: cite only as «FE-01 residual UF seal GWC» — never recruitment UAT-ready

ack_status: PASS_TO_PM (PM owns next)
evidence_path: docs/qa/evidence/po-hrm-ui-header-jd-dnd-qc-01.md
```
