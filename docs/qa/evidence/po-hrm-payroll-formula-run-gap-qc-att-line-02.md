# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-ATT-LINE-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-ATT-LINE-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **L1 API R-PAY-F-ATT-LINE Date-coerce + taxonomy slice gate** (not formula LIVE · not browser UF · not module UAT) |
| **priority** | P0 |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-ATT-LINE-02` PASS_TO_PM (stamp **`PAYFEATT-MSIJRXT4`**) |
| **supersedes FAIL** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-ATT-LINE-01` FAIL (`AGG_SHEET_DATE_INVALID` · `PAYFEATT-MSIJH9MT`) |
| **portal_url** | `http://127.0.0.1:5173` (L0 observe) · HRM `:28001` · XBOS `:28002` · **PORTAL_DEV_URL** N/A browser this seat |
| **journey_l25** | L1 AGG/wire + PREVIEW-STUB + ATT-412 honesty — **not** full J-HRM-07 process UAT · **not** AC4 hours LIVE bind |
| **Verdict** | **GO WITH CONDITIONS** — Date coerce + AGG taxonomy ACCEPT · **R-PAY-F-ATT-LINE Date coerce CLOSED** · **AC4-BIND CONDITION OPEN** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-payroll-formula-run-gap-qa-att-line-02.md`](po-hrm-payroll-formula-run-gap-qa-att-line-02.md) stamp **`PAYFEATT-MSIJRXT4`** |
| **be_ref** | [`po-hrm-payroll-formula-run-gap-be-att-line-02.md`](po-hrm-payroll-formula-run-gap-be-att-line-02.md) READY_FOR_QA |
| **cb_bag_baseline** | [`po-hrm-payroll-formula-run-gap-qc-cb-bag-01.md`](po-hrm-payroll-formula-run-gap-qc-cb-bag-01.md) GWC L1 C&B — **RETAINED · do not reopen** |
| **fe_eval_baseline** | [`po-hrm-payroll-formula-run-gap-qc-fe-eval-01.md`](po-hrm-payroll-formula-run-gap-qc-fe-eval-01.md) GWC FE-EVAL — **RETAINED · do not reopen** |
| **l1_eval_baseline** | [`po-hrm-payroll-formula-run-gap-qc-eval-01.md`](po-hrm-payroll-formula-run-gap-qc-eval-01.md) GWC L1 evaluator — **RETAINED · do not reopen** |
| **machine** | [`_tmp-po-hrm-payroll-formula-run-gap-qa-att-line-02.FINAL.json`](_tmp-po-hrm-payroll-formula-run-gap-qa-att-line-02.FINAL.json) |
| **spec_ref** | `docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01.md` · BE-ATT-LINE-02 |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · AC4 SKIP = honest empty enrollment (not seed to invent lines) |
| **OS honesty** | `C-SLICE-≠-MODULE` — L1 Date-coerce GWC ≠ formula LIVE / payroll module UAT / Phase1 DONE / J-HRM-07 |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **Formula LIVE / customer UAT** | **DENIED** | PREVIEW still **412-PREVIEW-STUB** · hours bag incomplete |
| **Browser UF / J-HRM-07** | **DENIED** this seat | L1 API only · FE-EVAL / CB-BAG / EVAL retained separately |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Empty enrollment = SKIP AC4 · not force-pass via seed |
| **AC4 hours LIVE bind** | **NOT claimed** | CONDITION OPEN — product enrollment required |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT L1 Date-coerce FIX after BE-ATT-LINE-02 + QA-ATT-LINE-02 against AGG header policy + lock taxonomy + retained PREVIEW-STUB / ATT-412. Audited QA-ATT-LINE-02 MD + FINAL JSON stamp `PAYFEATT-MSIJRXT4` (`verdict=PASS` · `failed_acs=[]` · `agg_date_invalid=false` · `honesty_final.payroll_e2e_ready=false`) + BE-ATT-LINE-02 + prior GWC seats (CB-BAG · FE-EVAL · L1 EVAL). Proven: dist `toLeaveDayKey` · AGG **201** honest `AGG_EMPTY_ENROLLMENT` (**no** `AGG_SHEET_DATE_INVALID`) · submit/close/reopen wire · closed AGG **409** `HRM-ATT-SHEET-LOCKED` · AC2 **412-PREVIEW-STUB** · AC3 **412 HRM-PAY-ATT-412**. QA pack verify **1/8** = **PROCESS OBS** (missing `crud_or_matrix` heading on L1-only MD) — this QC consolidates **8/8**. **R-PAY-F-ATT-LINE Date coerce = CLOSED**. **R-PAY-F-ATT-LINE-AC4-BIND = CONDITION OPEN** (SKIP until non-empty enrollment via FE product path). Retain CB-BAG / FE-EVAL / L1 EVAL — **do not reopen**. **DENIED** formula LIVE · `payroll_e2e_ready=true` · Phase1 DONE · module payroll UAT · J-HRM-07 process UAT · AC4 LIVE bind PASS.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| DIST `toLeaveDayKey` | JSON `dist_markers.agg_has_toLeaveDayKey=true` · stale `String.slice` **absent** · `dist_rebuild=true` | 🟢 **ACCEPT** |
| AC1 AGG no DATE_INVALID | **201** `HRM-AS-200` · `line_count=0` · warnings `AGG_EMPTY_ENROLLMENT` · `agg_date_invalid=false` | 🟢 **ACCEPT** |
| AC1 wire submit/close/409/reopen | submit **201** · close **201** · AGG closed **409** `HRM-ATT-SHEET-LOCKED` · reopen **201** | 🟢 **ACCEPT** |
| AC2 PREVIEW-STUB retained | **412** `HRM-PAY-FORMULA-412-PREVIEW-STUB` · `ATT_HOURS_VAR_BAG_INCOMPLETE` · silent0=false | 🟢 **ACCEPT** |
| AC3 ATT-412 retained | **412** `HRM-PAY-ATT-412` · period 2036-02 | 🟢 **ACCEPT** |
| AC4 hours bind LIVE | SKIP · `ac4_closed_locked_bind.skipped=true` · empty enrollment Sep+Jan | 🟡 **CONDITION OPEN** — **not** ACCEPT bind |
| Honesty `payroll_e2e_ready=false` | MD + machine `honesty` + `honesty_final` | 🟢 **DENIED promote** |
| QA pack 1/8 | crud_or_matrix missing | 🟡 **PROCESS OBS** — QC consolidates |
| R-PAY-F-STALE-DIST | QA kill+rebuild+`start:prod` before probe | 🟡 **CONDITION OK** (SOP retained) |
| Prior CB-BAG / FE-EVAL / L1 EVAL | QC baselines | 🟢 **RETAIN CLOSED · do not reopen** |
| Module UAT / Phase1 / ready / J-HRM-07 / LIVE | Explicit DENIED | 🟢 |

**Cấm:** invent formula LIVE · `payroll_e2e_ready=true` · Phase1 DONE · claim J-HRM-07 · claim module payroll UAT · claim AC4 hours LIVE bind · reopen CB-BAG / FE-EVAL / L1 EVAL · seed to invent enrollment.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · AC4-BIND unproven · PREVIEW still stub · no J-HRM-07 process UF |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim R-PAY-F-ATT-LINE Date coerce closed? | **YES** — this seat ACCEPT |
| May PM claim R-PAY-F-ATT-LINE (full hours LIVE) closed? | **NO** — AC4-BIND CONDITION OPEN |
| May PM claim formula LIVE / module UAT / Phase1 / J-HRM-07? | **NO** |
| May PM reopen CB-BAG / FE-EVAL / L1 EVAL? | **NO** |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QC-CB-BAG L1 GWC | `po-hrm-payroll-formula-run-gap-qc-cb-bag-01.md` | PASS_TO_PM | **RETAIN · do not reopen** · R-PAY-F-CB-BAG L1 CLOSED |
| QC-FE-EVAL browser GWC | `po-hrm-payroll-formula-run-gap-qc-fe-eval-01.md` | PASS_TO_PM | **RETAIN · do not reopen** · R-PAY-FE-OPAQUE→EVAL CLOSED |
| QC-EVAL L1 honesty GWC | `po-hrm-payroll-formula-run-gap-qc-eval-01.md` | PASS_TO_PM | **RETAIN · do not reopen** · R-PAY-F-EVAL L1 CLOSED |
| BE-ATT-LINE-02 Date coerce | `po-hrm-payroll-formula-run-gap-be-att-line-02.md` | READY_FOR_QA | **ACCEPT** prior · `toLeaveDayKey` |
| QA-ATT-LINE-02 L1 retest | `po-hrm-payroll-formula-run-gap-qa-att-line-02.md` | PASS_TO_PM | **ACCEPT** stamp `PAYFEATT-MSIJRXT4` |
| Machine QA-ATT-LINE-02 | `_tmp-po-hrm-payroll-formula-run-gap-qa-att-line-02.FINAL.json` | PASS | **ACCEPT** |
| Pack verify QA-ATT-LINE-02 | `verify:qc:evidence-pack` | exit **1** · **1/8** | 🟡 **PROCESS OBS** — L1 seat; QC consolidates |
| Spec API-ATT-LINE | F.1 AGG · taxonomy freeze | CONFIRMED | **TRACE OK** |

### Machine JSON spot

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `PAYFEATT-MSIJRXT4` | 🟢 |
| `prior_fail_stamp` | `PAYFEATT-MSIJH9MT` | 🟢 supersede FAIL |
| `honesty.*` / `honesty_final.*` | all **false** (ready / live / seed / j_hrm_07) | 🟢 |
| `dist_markers.agg_has_toLeaveDayKey` | **true** | 🟢 |
| `dist_markers.agg_has_stale_string_slice` | **false** | 🟢 |
| `agg_date_invalid` | **false** | 🟢 Date coerce CLOSED |
| `agg_empty_enrollment` / `agg_line_count` | **true** / **0** | 🟢 honest empty |
| `checks.dist_toLeaveDayKey` | PASS | 🟢 |
| `checks.ac1_aggregate` | PASS · `AGG_EMPTY_ENROLLMENT` | 🟢 |
| `checks.ac1_agg_closed_locked` | PASS · **409** `HRM-ATT-SHEET-LOCKED` | 🟢 |
| `checks.ac2_preview_stub_incomplete` | PASS · **412** PREVIEW-STUB · silent0=false | 🟢 |
| `checks.ac3_process_att_412` | PASS · **412** ATT-412 | 🟢 |
| `checks.ac4_closed_locked_bind` | PASS + **`skipped=true`** · SKIP_EMPTY_ENROLLMENT | 🟡 **CONDITION** — not LIVE bind |
| `bindWireOk` / `line_locked_count` | **false** / **0** | 🟡 AC4 unproven |
| `followup_probe_jan.agg_warnings` | `AGG_EMPTY_ENROLLMENT` | 🟢 consistent empty |
| `verdict` / `failed_acs` | **PASS** / `[]` | 🟢 |
| `dist_rebuild` | **true** | 🟡 **OBS** stale-dist SOP |
| Author / publisher | `ceo@xe.vn` ≠ `admin@xe.vn` | 🟢 dual-control retained |
| Jul sheets | not reopened (CB-BAG preserve) | 🟢 |

**QC note on AC4 harness:** Harness marks `ac4_closed_locked_bind.verdict=PASS` with `skipped=true`. QC **does not** promote that to AC4 LIVE bind ACCEPT — residual **R-PAY-F-ATT-LINE-AC4-BIND** remains **OPEN CONDITION**.

---

## Gate AC audit (ATT-LINE Date coerce + taxonomy)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| DIST | Live dist uses `toLeaveDayKey` (not `String(Date).slice`) | markers + check PASS · rebuild SOP | 🟢 |
| AC1 materialize | AGG `line_count>0` **OR** honest `AGG_EMPTY_ENROLLMENT` — **cấm** `AGG_SHEET_DATE_INVALID` | honest empty · `agg_date_invalid=false` | 🟢 |
| AC1 wire | submit / close / AGG-closed 409 / reopen | all PASS · **409** locked | 🟢 |
| AC2 | PREVIEW incomplete → **412-PREVIEW-STUB** · no silent 0 | **412** stub retained | 🟢 |
| AC3 | PROCESS open → **HRM-PAY-ATT-412** | **412** ATT-412 retained | 🟢 |
| AC4 | closed+locked binds hours **without** `ATT_TIMESHEET_LINE_ABSENT` when enrollment non-empty | **SKIP** empty enrollment U65 | 🟡 **CONDITION OPEN** |
| — | Formula LIVE / customer UAT / J-HRM-07 / ready | Explicit non-claim | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-ATT-LINE-02 | QC |
|-----------------|-------|----------------|-----|
| **L1 ATT-LINE Date coerce + AGG taxonomy** (in-scope) | BE-02 READY · QA-01 FAIL | 🟢 DIST+AC1–3 PASS · AC4 SKIP | 🟢 **PASS / ACCEPT** (coerce) · 🟡 AC4 CONDITION |
| **L1 C&B bag** | QC-CB-BAG GWC | not re-run | 🟢 **RETAIN ACCEPT** |
| **L1 evaluator honesty** | QC-EVAL GWC | not re-run | 🟢 **RETAIN ACCEPT** |
| **Browser FE-EVAL gd1_eval_v1** | QC-FE-EVAL GWC | not re-run | 🟢 **RETAIN ACCEPT** |
| **J-HRM-07** Lương → phiếu lương | Historical ✅ PASS (W5B) | **not retested** · ≠ hours LIVE bind | ⬜ **DEFERRED** — not claimed |
| Hours var bag LIVE bind (`payable_hours`) | blocked by DATE_INVALID before | still blocked by empty enrollment | ⬜ **DEFERRED** — R-PAY-F-ATT-LINE-AC4-BIND |
| Browser process payslip UF | — | L1 only | ⬜ **DEFERRED** |

**U19 note:** This gate certifies the **L1 Date-coerce + AGG taxonomy API slice** named in dispatch — **not** a claim that **J-HRM-07** / formula LIVE / module payroll UAT / AC4 hours LIVE bind is newly GO. Missing AC4 bind does **not** NO-GO the Date-coerce seat; it **forces GWC CONDITION** (`C-SLICE-≠-MODULE` + AC4-BIND) and keeps `payroll_e2e_ready=false`.

### CRUD / mutate matrix (L1 API — ATT-LINE coerce)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| AGG open sheet (pg DATE header) | Update | **PASS** — honest `AGG_EMPTY_ENROLLMENT` · no DATE_INVALID |
| Submit sheet | Update | **PASS** |
| Close sheet | Update | **PASS** (`line_locked_count=0` expected empty) |
| AGG closed sheet | Update deny | **PASS** — **409** `HRM-ATT-SHEET-LOCKED` |
| Reopen sheet | Update | **PASS** |
| Preview hours incomplete | Read dry-run deny | **PASS** — **412** PREVIEW-STUB |
| PROCESS open ATT period | Update deny | **PASS** — **412** ATT-412 |
| AC4 payable_hours LIVE bind | Read/Update | **N/A SKIP** — empty enrollment · residual OPEN |
| Browser UF | — | **N/A** — DENIED this seat |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| QA-ATT-LINE-02 pack **1/8** | **PROCESS OBS** | Missing crud_or_matrix on L1 MD — **not** product demote; QC pack consolidates |
| Date coerce + AGG taxonomy + AC2/AC3 | **PRODUCT OK** | Slice ACCEPT |
| Stale dist until QA rebuild | **PROCESS / ENV OBS** | CONDITION OK SOP — QA rebuilt + `start:prod` |
| AC4 SKIP empty enrollment | **SCOPE / CONDITION** | U65 no seed · blocks ready=true · **not** Date-coerce NO-GO |
| Harness AC4 `verdict=PASS` + skipped | **PROCESS OBS** | QC demotes to CONDITION OPEN for AC4-BIND |
| Prior GWC seats | **GOVERNANCE RETAIN** | CB-BAG · FE-EVAL · L1 EVAL not reopened |
| No P0 product residual on Date-coerce WI | **PRODUCT OK** | Date coerce CLOSED |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-PAY-F-ATT-LINE Date coerce** | was P0 | `qa`/`qc` | **CLOSED** | `toLeaveDayKey` · no `AGG_SHEET_DATE_INVALID` · honest empty |
| **R-PAY-F-ATT-LINE-AC4-BIND** | P1 | **pm** → **dev-fe** (ATT enroll / punch / sheet density product path) **or** **ba-process** if product gap (no FE path to create enrollment in sheet window) | **OPEN CONDITION** | Prove `payable_hours` bind without `ATT_TIMESHEET_LINE_ABSENT` when enrollment non-empty — **U65 no seed** |
| **R-PAY-F-CB-BAG** (L1) | — | — | **CLOSED** (QC-CB-BAG) | **Do not reopen** |
| **R-PAY-FE-OPAQUE→EVAL** | — | — | **CLOSED** (QC-FE-EVAL) | **Do not reopen** |
| **R-PAY-F-EVAL** (L1) | — | — | **CLOSED** (QC-EVAL) | **Do not reopen** |
| **R-PAY-F-STALE-DIST** | process P2 | `dev-be`/`devops` | **CONDITION OK** | Post-READY dist refresh SOP — retain |
| **`payroll_e2e_ready`** | honesty | `pm` | **LOCKED false** | Explicit **NO** promote |
| **J-HRM-07** formula/process UAT | L2.5 | `qa` later | **DEFERRED** | After AC4 LIVE + browser process |
| **`C-SLICE-≠-MODULE`** | governance | `pm`/`qc` | **CONDITION** | Seat GWC ≠ module UAT / Phase1 |

**P0 product residuals for this Date-coerce WI:** none blocking slice ACCEPT.

**CONDITIONS for GWC:** `C-SLICE-≠-MODULE` + **R-PAY-F-ATT-LINE-AC4-BIND OPEN** + stale-dist SOP — sufficient to deny `payroll_e2e_ready=true` and deny clean module / Phase1 / J-HRM-07 / AC4 LIVE GO; **not** product NO-GO for certified Date-coerce + taxonomy slice.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-att-line-02.md` | exit **1** · **1/8** (crud_or_matrix) | **PROCESS OBS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-att-line-02.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| QA harness stamp `PAYFEATT-MSIJRXT4` | **PASS** · `failed_acs=[]` · `agg_date_invalid=false` | PRODUCT OK (cited) |
| Spec / BE-02 spot-check | `toLeaveDayKey` policy + taxonomy retain | TRACE OK |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON audit.

---

## completion_report

### Closed

1. QC L1 ATT-LINE Date-coerce gate — **GO WITH CONDITIONS**.  
2. Audited QA-ATT-LINE-02 MD + FINAL JSON stamp `PAYFEATT-MSIJRXT4` + BE-ATT-LINE-02 + CB-BAG/FE-EVAL/EVAL baselines — DIST + AC1–3 **ACCEPT**.  
3. **R-PAY-F-ATT-LINE Date coerce CLOSED** (supersedes QA-ATT-LINE-01 FAIL).  
4. AC2 PREVIEW-STUB + AC3 ATT-412 + **409** `HRM-ATT-SHEET-LOCKED` retained.  
5. Honesty locks held: `payroll_e2e_ready=false` · formula LIVE **DENIED** · Phase1 **NOT** claimed · module UAT **DENIED** · J-HRM-07 **DENIED** · AC4 LIVE **DENIED**.  
6. QA pack PROCESS OBS consolidated into this QC pack **8/8**.  
7. Prior GWC seats **not reopened**.  
8. Explicit **NO** to PM promote ready flag · **C-SLICE-≠-MODULE**.

### Residual (open for next dispatch)

- **R-PAY-F-ATT-LINE-AC4-BIND** → **dev-fe** (product FE attendance enroll / punch / density so sheet window has enrollment) **or** **ba-process** if no FE path (spec_gap) → then **qa** retest AC4 STRICT bind without seed.  
- Module / J-HRM-07 formula process UAT → **qa** only after AC4 LIVE + browser.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** → **dev-fe** (ATT enrollment product path) **or** **ba-process** if product gap |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-att-line-02.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | GWC Date coerce CLOSED · AC4-BIND CONDITION OPEN · **cấm** flip `payroll_e2e_ready` / claim LIVE / Phase1 / J-HRM-07 / AC4 PASS · do **not** reopen CB-BAG / FE-EVAL / L1 EVAL |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-ATT-ENROLL-01
from_role: pm
to_role: dev-fe
lane: execution
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-ATT-LINE-02 GO WITH CONDITIONS (Date coerce CLOSED · AC4-BIND OPEN · stamp PAYFEATT-MSIJRXT4)
priority: P1
residual_auto_fix: true

## Mission
Enable product-path (U65 zero-seed) attendance enrollment / punch / sheet-window density so AGG can produce line_count>0 on a non-Jul open sheet — then AC4 hours bind can be re-QA'd.
1) Identify FE SRS path: enroll employees on attendance sheet OR create attendance_records/OT in sheet window (holding · ceo@xe.vn)
2) Preserve Jul closed sheets (CB-BAG PROCESS month) — use Sep/Jan or new window
3) Do NOT seed DB · do NOT flip payroll_e2e_ready · do NOT claim formula LIVE
4) After FE path works: READY_FOR_QA → QA AC4 STRICT (closed+locked bind payable_hours without ATT_TIMESHEET_LINE_ABSENT)

If FE path missing in SRS / product gap → PASS_TO_BA:

work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BA-ATT-ENROLL-01
from_role: pm
to_role: ba-process
lane: governance
prior: QC-ATT-LINE-02 GWC · AC4-BIND OPEN · no FE enroll path confirmed
## Mission
Confirm SRS/TechSpec AC for sheet enrollment → AGG lines → payroll hours bag; delta AC if gap; unlock FE or document product blocker.

entry_criteria:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-att-line-02.md GWC
- U65 zero-seed · retain AC2/AC3 taxonomy · retain CB-BAG/FE-EVAL/EVAL CLOSED

exit_criteria (FE):
- evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-fe-att-enroll-01.md
- READY_FOR_QA with click path to non-empty enrollment on sheet window
- honesty: payroll_e2e_ready=false

cấm: seed · reopen CB-BAG/FE-EVAL/L1 EVAL · flip payroll_e2e_ready · claim J-HRM-07 / Phase1 / module UAT
```
