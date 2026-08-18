# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-ATT-LINE-03`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-ATT-LINE-03` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **L1 product-path AC4 STRICT bind close** (not formula LIVE · not browser UF · not module UAT) |
| **priority** | P0 |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-ATT-LINE-03` PASS_TO_PM (stamp **`PAYFEATT-MSIKCMFF`**) |
| **closes** | **R-PAY-F-ATT-LINE-AC4-BIND** (CONDITION OPEN on QC-ATT-LINE-02) |
| **portal_url** | `http://127.0.0.1:5173` (L0 observe) · HRM `:28001` · XBOS `:28002` · **PORTAL_DEV_URL** N/A browser this seat |
| **journey_l25** | L1 Path A punch→Aug AGG→close→PREVIEW bind — **not** full J-HRM-07 process UAT |
| **Verdict** | **GO WITH CONDITIONS** — AC4 STRICT bind ACCEPT · **R-PAY-F-ATT-LINE-AC4-BIND CLOSED** · remaining: payslip GET OBS · `C-SLICE-≠-MODULE` |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-payroll-formula-run-gap-qa-att-line-03.md`](po-hrm-payroll-formula-run-gap-qa-att-line-03.md) stamp **`PAYFEATT-MSIKCMFF`** |
| **fe_ref** | [`po-hrm-payroll-formula-run-gap-fe-att-enroll-01.md`](po-hrm-payroll-formula-run-gap-fe-att-enroll-01.md) READY_FOR_QA Path A |
| **qc_prior** | [`po-hrm-payroll-formula-run-gap-qc-att-line-02.md`](po-hrm-payroll-formula-run-gap-qc-att-line-02.md) GWC · Date coerce CLOSED · AC4 CONDITION OPEN |
| **cb_bag_baseline** | [`po-hrm-payroll-formula-run-gap-qc-cb-bag-01.md`](po-hrm-payroll-formula-run-gap-qc-cb-bag-01.md) GWC L1 C&B — **RETAINED · do not reopen** |
| **fe_eval_baseline** | [`po-hrm-payroll-formula-run-gap-qc-fe-eval-01.md`](po-hrm-payroll-formula-run-gap-qc-fe-eval-01.md) GWC FE-EVAL — **RETAINED · do not reopen** |
| **l1_eval_baseline** | [`po-hrm-payroll-formula-run-gap-qc-eval-01.md`](po-hrm-payroll-formula-run-gap-qc-eval-01.md) GWC L1 evaluator — **RETAINED · do not reopen** |
| **date_coerce_baseline** | QC-ATT-LINE-02 Date coerce CLOSED — **RETAINED · do not reopen** |
| **machine** | [`_tmp-po-hrm-payroll-formula-run-gap-qa-att-line-03.FINAL.json`](_tmp-po-hrm-payroll-formula-run-gap-qa-att-line-03.FINAL.json) |
| **spec_ref** | `docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01.md` · FE-ATT-ENROLL-01 Path A |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · density via product `POST /attendance/records` |
| **OS honesty** | `C-SLICE-≠-MODULE` — AC4 STRICT L1 bind GWC ≠ formula LIVE / payroll module UAT / Phase1 DONE / J-HRM-07 |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **Formula LIVE / customer UAT** | **DENIED** | PREVIEW dry-run + `NOT_CUSTOMER_UAT` · `STAGED_EVAL_SUBSET` · `CB_PACKAGE_ABSENT` still present |
| **Browser UF / J-HRM-07** | **DENIED** this seat | L1 product-path API · FE Path A corroborated · not browser Playwright UF |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Punch via product API only |
| **Module payroll UAT** | **DENIED** | Slice close ≠ module GO |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT L1 Path A AC4 STRICT hours bind after FE-ATT-ENROLL-01 + QA-ATT-LINE-03 against closed+locked sheet → PREVIEW without `ATT_TIMESHEET_LINE_ABSENT`. Audited QA-ATT-LINE-03 MD + FINAL JSON stamp `PAYFEATT-MSIKCMFF` (`verdict=PASS` · `failed_acs=[]` · `ac4_closed_locked_bind.skipped=false` · `honesty_final.payroll_e2e_ready=false`) + FE-ATT-ENROLL Path A + QC-ATT-LINE-02 baseline. Proven: Path A punch **201** → Aug sheet AGG **`line_count=2`** → close **`line_locked_count=2`** → AGG closed **409** `HRM-ATT-SHEET-LOCKED` → PREVIEW **201** `HRM-PAY-FORMULA-200` warnings include **`ATT_HOURS_FROM_CLOSED_LINE`** · **`absent=false`** · **`incomplete=false`** · **`from_line=true`** · gross `900000` · **no** `ATT_TIMESHEET_LINE_ABSENT` · AC2 **412-PREVIEW-STUB** + AC3 **412 HRM-PAY-ATT-412** retained after hygiene reopen · `jul_touched=false`. QA pack verify **8/8** exit **0**. **R-PAY-F-ATT-LINE-AC4-BIND = CLOSED** (supersedes QC-ATT-LINE-02 CONDITION OPEN). Retain Date coerce / CB-BAG / FE-EVAL / L1 EVAL — **do not reopen**. Remaining CONDITIONS: **`C-SLICE-≠-MODULE`** + **R-PAY-PAYSLIP-LINES-GET** OBS (prior CB-BAG). **DENIED** formula LIVE · `payroll_e2e_ready=true` · Phase1 DONE · module payroll UAT · J-HRM-07 process UAT.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Path A density | punch **201** · AGG **201** `line_count=2` · no `AGG_EMPTY_ENROLLMENT` · no DATE_INVALID | 🟢 **ACCEPT** |
| Close lock | close **201** `line_locked_count=2` · AGG closed **409** LOCKED | 🟢 **ACCEPT** |
| AC4 STRICT bind | PREVIEW **201** · `ATT_HOURS_FROM_CLOSED_LINE` · absent=false · skipped=false | 🟢 **ACCEPT** — **CONDITION CLOSED** |
| No `ATT_TIMESHEET_LINE_ABSENT` | bind warnings + `absent=false` | 🟢 **ACCEPT** |
| AC2 PREVIEW-STUB retained | **412** after reopen · `NO_CLOSED_SHEET` · silent0=false | 🟢 **ACCEPT** |
| AC3 ATT-412 retained | **412** `HRM-PAY-ATT-412` · period 2036-02 | 🟢 **ACCEPT** |
| Jul CB-BAG untouched | `hygiene.jul_touched=false` | 🟢 **PRESERVE** |
| Honesty `payroll_e2e_ready=false` | MD + machine honesty / honesty_final · ready_leak=false | 🟢 **DENIED promote** |
| QA pack 8/8 | `verify:qc:evidence-pack` exit **0** | 🟢 |
| Prior Date coerce / CB-BAG / FE-EVAL / L1 EVAL | QC baselines | 🟢 **RETAIN CLOSED · do not reopen** |
| Module UAT / Phase1 / ready / J-HRM-07 / LIVE | Explicit DENIED | 🟢 |
| Payslip lines GET | Prior CB-BAG OBS | 🟡 **OBS retained** |

**Cấm:** invent formula LIVE · `payroll_e2e_ready=true` · Phase1 DONE · claim J-HRM-07 · claim module payroll UAT · reopen CB-BAG / FE-EVAL / L1 EVAL / Date coerce · seed.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · PREVIEW still staged dry-run · `CB_PACKAGE_ABSENT` · no J-HRM-07 browser process UF · payslip GET OBS open |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim R-PAY-F-ATT-LINE-AC4-BIND closed? | **YES** — this seat ACCEPT STRICT bind |
| May PM claim R-PAY-F-ATT-LINE Date coerce closed? | **YES** — retained from QC-ATT-LINE-02 |
| May PM claim formula LIVE / module UAT / Phase1 / J-HRM-07? | **NO** |
| May PM reopen CB-BAG / FE-EVAL / L1 EVAL / Date coerce? | **NO** |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QC-ATT-LINE-02 Date coerce GWC | `po-hrm-payroll-formula-run-gap-qc-att-line-02.md` | PASS_TO_PM | **RETAIN · AC4 was CONDITION OPEN** |
| FE-ATT-ENROLL-01 Path A | `po-hrm-payroll-formula-run-gap-fe-att-enroll-01.md` | READY_FOR_QA | **ACCEPT** product density path |
| QA-ATT-LINE-03 STRICT | `po-hrm-payroll-formula-run-gap-qa-att-line-03.md` | PASS_TO_PM | **ACCEPT** stamp `PAYFEATT-MSIKCMFF` |
| Machine QA-ATT-LINE-03 | `_tmp-po-hrm-payroll-formula-run-gap-qa-att-line-03.FINAL.json` | PASS | **ACCEPT** |
| Pack verify QA-ATT-LINE-03 | `verify:qc:evidence-pack` | exit **0** · **8/8** | 🟢 |
| QC-CB-BAG / FE-EVAL / EVAL | prior GWC | PASS_TO_PM | **RETAIN · do not reopen** |
| Spec API-ATT-LINE + FE Path A | F.1 bind closed+locked | CONFIRMED | **TRACE OK** |

### Machine JSON spot

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `PAYFEATT-MSIKCMFF` | 🟢 |
| `path_used` | **A** | 🟢 |
| `honesty.*` / `honesty_final.*` | all **false** (ready / live / seed / j_hrm_07) · ready_leak=false | 🟢 |
| `dist_markers.agg_has_toLeaveDayKey` | **true** · stale slice **false** | 🟢 retained |
| `agg_line_count` / `agg_empty_enrollment` | **2** / **false** | 🟢 density |
| `agg_date_invalid` | **false** | 🟢 Date coerce retained |
| `checks.ac4_density` | PASS · line_count=2 · punch=201 | 🟢 |
| `checks.ac1_close_locked` | PASS · `line_locked_count=2` | 🟢 |
| `checks.ac1_agg_closed_locked` | PASS · **409** `HRM-ATT-SHEET-LOCKED` | 🟢 |
| `checks.ac4_closed_locked_bind` | PASS · **`skipped=false`** · `strict=true` · `from_line=true` · absent=false · incomplete=false · `ATT_HOURS_FROM_CLOSED_LINE` · gross=900000 | 🟢 **STRICT ACCEPT** |
| `bind.absent` / `ATT_TIMESHEET_LINE_ABSENT` | **false** / **not in warnings** | 🟢 |
| `checks.ac2_preview_stub_incomplete` | PASS · **412** PREVIEW-STUB · silent0=false | 🟢 retained |
| `checks.ac3_process_att_412` | PASS · **412** ATT-412 | 🟢 retained |
| `hygiene.jul_touched` | **false** | 🟢 |
| `verdict` / `failed_acs` | **PASS** / `[]` | 🟢 |
| Author / publisher | `ceo@xe.vn` ≠ `admin@xe.vn` | 🟢 dual-control retained |
| `CB_PACKAGE_ABSENT` on bind preview | present | 🟡 OBS — not AC4 FAIL · C&B L1 already GWC separately |

**QC note on AC4:** Unlike QA-ATT-LINE-02 (`skipped=true` empty enrollment), QA-03 proves **STRICT** non-skipped bind. QC **ACCEPT** → **R-PAY-F-ATT-LINE-AC4-BIND CLOSED**. `payable_hours=null` in JSON with `from_line=true` + gross=`hours×override` is ACCEPT for this seat (hours sourced from closed line warning taxonomy; not ABSENT/incomplete).

---

## Gate AC audit (ATT-LINE AC4 STRICT)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| DIST | `toLeaveDayKey` live | markers PASS | 🟢 retained |
| AC4-DENSITY | product punch → AGG `line_count>0` | Path A `line_count=2` | 🟢 |
| AC1 wire | submit / close / AGG-closed 409 | all PASS · locked=2 | 🟢 |
| **AC4 STRICT** | closed+locked binds hours **without** `ATT_TIMESHEET_LINE_ABSENT` | PREVIEW **201** · `ATT_HOURS_FROM_CLOSED_LINE` · absent=false · skipped=false | 🟢 **CLOSED** |
| AC2 | incomplete after reopen → **412-PREVIEW-STUB** | **412** retained | 🟢 |
| AC3 | PROCESS open → **HRM-PAY-ATT-412** | **412** retained | 🟢 |
| — | Formula LIVE / customer UAT / J-HRM-07 / ready | Explicit non-claim | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-ATT-LINE-03 | QC |
|-----------------|-------|----------------|-----|
| **L1 ATT-LINE Date coerce** | QC-02 GWC CLOSED | not re-run | 🟢 **RETAIN ACCEPT** |
| **L1 ATT-LINE AC4 STRICT bind** (in-scope) | CONDITION OPEN | 🟢 Path A STRICT PASS | 🟢 **PASS / ACCEPT · CLOSED** |
| **L1 C&B bag** | QC-CB-BAG GWC | not re-run · Jul untouched | 🟢 **RETAIN ACCEPT** |
| **L1 evaluator honesty** | QC-EVAL GWC | not re-run | 🟢 **RETAIN ACCEPT** |
| **Browser FE-EVAL gd1_eval_v1** | QC-FE-EVAL GWC | not re-run | 🟢 **RETAIN ACCEPT** |
| **J-HRM-07** Lương → phiếu lương | Historical ✅ PASS (W5B) | **not retested** · ≠ module formula LIVE | ⬜ **DEFERRED** — not claimed |
| Browser process payslip UF + ATT+C&B | — | L1 PREVIEW only · `CB_PACKAGE_ABSENT` | ⬜ **DEFERRED** |
| Payslip lines GET | CB-BAG OBS | not in scope | 🟡 **OBS retained** |

**U19 note:** This gate certifies the **L1 AC4 STRICT closed+locked hours bind** named in dispatch — **not** a claim that **J-HRM-07** / formula LIVE / module payroll UAT is newly GO. Closing AC4-BIND does **not** flip `payroll_e2e_ready`; it **forces GWC** with `C-SLICE-≠-MODULE` + payslip GET OBS retained.

### CRUD / mutate matrix (L1 product-path — AC4 STRICT)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| Punch `attendance/records` today | Create | **PASS** 201 |
| Create Aug attendance sheet | Create | **PASS** |
| AGG materialize lines | Update | **PASS** line_count=2 |
| Submit / sign / close lock | Update | **PASS** locked=2 |
| AGG closed deny | Update deny | **PASS** 409 LOCKED |
| Preview hours bind STRICT | Read dry-run | **PASS** 201 + FROM_CLOSED_LINE |
| Reopen archive | Update | **PASS** archived=2 |
| Preview incomplete stub | Read deny | **PASS** 412 PREVIEW-STUB |
| PROCESS open ATT | Update deny | **PASS** 412 ATT-412 |
| Jul CB-BAG | — | **N/A** — not touched |
| Browser UF / J-HRM-07 | — | **N/A** — DENIED this seat |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| Path A density + AC4 STRICT bind | **PRODUCT OK** | Slice ACCEPT · CONDITION CLOSED |
| AC2/AC3 retained | **PRODUCT OK** | Taxonomy honesty held |
| QA pack 8/8 | **PROCESS OK** | exit 0 |
| `CB_PACKAGE_ABSENT` on PREVIEW bind | **SCOPE OBS** | Not AC4 FAIL · C&B L1 already GWC; full ATT+C&B PROCESS deferred |
| Payslip lines GET ABSENT | **OBS P2** | Retained from CB-BAG — not this seat NO-GO |
| Prior GWC seats | **GOVERNANCE RETAIN** | Date coerce · CB-BAG · FE-EVAL · L1 EVAL not reopened |
| No P0 product residual on AC4-BIND WI | **PRODUCT OK** | AC4-BIND CLOSED |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-PAY-F-ATT-LINE-AC4-BIND** | was P0/P1 | `qa`/`qc` | **CLOSED** | STRICT Path A · `ATT_HOURS_FROM_CLOSED_LINE` · no ABSENT |
| **R-PAY-F-ATT-LINE Date coerce** | — | — | **CLOSED** (QC-02) | **Do not reopen** |
| **R-PAY-F-CB-BAG** (L1) | — | — | **CLOSED** (QC-CB-BAG) | **Do not reopen** · Jul untouched |
| **R-PAY-FE-OPAQUE→EVAL** | — | — | **CLOSED** (QC-FE-EVAL) | **Do not reopen** |
| **R-PAY-F-EVAL** (L1) | — | — | **CLOSED** (QC-EVAL) | **Do not reopen** |
| **R-PAY-PAYSLIP-LINES-GET** | P2 OBS | `dev-be` later | **OPEN OBS** | No public GET `/payroll/payslips/:id/lines` — retained |
| **R-PAY-F-STALE-DIST** | process P2 | `dev-be`/`devops` | **CONDITION OK** | SOP retained |
| **`payroll_e2e_ready`** | honesty | `pm` | **LOCKED false** | Explicit **NO** promote |
| **J-HRM-07** formula/process UAT | L2.5 | `qa` later | **DEFERRED** | After browser process ATT+C&B |
| **`C-SLICE-≠-MODULE`** | governance | `pm`/`qc` | **CONDITION** | Seat GWC ≠ module UAT / Phase1 |

**P0 product residuals for this AC4-BIND WI:** none blocking slice ACCEPT.

**CONDITIONS for GWC:** `C-SLICE-≠-MODULE` + payslip GET OBS — sufficient to deny `payroll_e2e_ready=true` and deny clean module / Phase1 / J-HRM-07 GO; **not** product NO-GO for certified AC4 STRICT bind slice.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-att-line-03.md` | exit **0** · **8/8** | **PROCESS OK** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-att-line-03.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| QA harness stamp `PAYFEATT-MSIKCMFF` | **PASS** · `failed_acs=[]` · `ac4.skipped=false` | PRODUCT OK (cited) |
| Spec / FE Path A spot-check | punch→sheet→AGG→close→bind | TRACE OK |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON audit.

---

## completion_report

### Closed

1. QC L1 ATT-LINE AC4 STRICT gate — **GO WITH CONDITIONS**.  
2. Audited QA-ATT-LINE-03 MD + FINAL JSON stamp `PAYFEATT-MSIKCMFF` + FE-ATT-ENROLL-01 + QC-ATT-LINE-02 — Path A density + STRICT bind **ACCEPT**.  
3. **R-PAY-F-ATT-LINE-AC4-BIND CLOSED** (closes QC-ATT-LINE-02 CONDITION OPEN).  
4. AC2 PREVIEW-STUB + AC3 ATT-412 + **409** LOCKED + Jul preserve retained.  
5. Honesty locks held: `payroll_e2e_ready=false` · formula LIVE **DENIED** · Phase1 **NOT** claimed · module UAT **DENIED** · J-HRM-07 **DENIED**.  
6. QA pack **8/8** verified.  
7. Prior GWC seats (Date coerce · CB-BAG · FE-EVAL · L1 EVAL) **not reopened**.  
8. Explicit **NO** to PM promote ready flag · **C-SLICE-≠-MODULE**.

### Residual (open — not P0 for this WI)

- **R-PAY-PAYSLIP-LINES-GET** OBS P2 → `dev-be` later (optional).  
- Module / J-HRM-07 formula process UAT (browser ATT+C&B) → `qa` only when PM opens that wave.  
- `C-SLICE-≠-MODULE` retained — **cấm** flip ready / claim LIVE.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** — intake GWC; optional later wave payslip GET or J-HRM-07 browser (not forced P0 this seat) |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-att-line-03.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | GWC AC4-BIND CLOSED · stamp PAYFEATT-MSIKCMFF · **cấm** flip `payroll_e2e_ready` / claim LIVE / Phase1 / J-HRM-07 / module UAT · retain Date coerce / CB-BAG / FE-EVAL / EVAL · residual OBS payslip GET + C-SLICE |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-PM-INTAKE-ATT-LINE-03
from_role: qc
to_role: pm
lane: governance
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-ATT-LINE-03 GO WITH CONDITIONS
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
priority: P1 (no P0 product residual on AC4-BIND)

## Mission
Intake QC-ATT-LINE-03 GWC:
1) Record R-PAY-F-ATT-LINE-AC4-BIND CLOSED (stamp PAYFEATT-MSIKCMFF)
2) Keep payroll_e2e_ready=false — do NOT promote formula LIVE / module UAT / Phase1 / J-HRM-07
3) Do NOT reopen Date coerce / CB-BAG / FE-EVAL / L1 EVAL
4) Optional backlog (not forced same-turn P0): R-PAY-PAYSLIP-LINES-GET OBS → dev-be; or browser J-HRM-07 ATT+C&B process when program opens

evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-att-line-03.md
```
