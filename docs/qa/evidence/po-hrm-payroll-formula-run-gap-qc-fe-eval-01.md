# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-FE-EVAL-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-FE-EVAL-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **browser U65 FE-EVAL gd1_eval_v1 author + Nest preview slice gate** (not formula LIVE · not module UAT) |
| **priority** | P1 |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-FE-EVAL-01` PASS_TO_PM (stamp **`PAYFEVAL-MSII5NC4`**) |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` |
| **journey_l25** | Formula author `gd1_eval_v1` + Nest preview (overrides) — **not** full J-HRM-07 process UAT |
| **Verdict** | **GO WITH CONDITIONS** — FE-EVAL browser UF ACCEPT · **R-PAY-FE-OPAQUE→EVAL CLOSED** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-payroll-formula-run-gap-qa-fe-eval-01.md`](po-hrm-payroll-formula-run-gap-qa-fe-eval-01.md) stamp **`PAYFEVAL-MSII5NC4`** |
| **fe_ref** | [`po-hrm-payroll-formula-run-gap-fe-eval-01.md`](po-hrm-payroll-formula-run-gap-fe-eval-01.md) READY_FOR_QA |
| **l1_eval_baseline** | [`po-hrm-payroll-formula-run-gap-qc-eval-01.md`](po-hrm-payroll-formula-run-gap-qc-eval-01.md) GWC L1 evaluator — **RETAINED · do not reopen** |
| **form_baseline** | [`po-hrm-payroll-formula-run-gap-qc-02.md`](po-hrm-payroll-formula-run-gap-qc-02.md) GWC form · **R-PAY-FE-FORM CLOSED** — **RETAINED** |
| **machine** | [`_tmp-po-hrm-payroll-formula-run-gap-qa-fe-eval-01.FINAL.json`](_tmp-po-hrm-payroll-formula-run-gap-qa-fe-eval-01.FINAL.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-payroll-formula-run-gap-qa-fe-eval-01/` (01–08) |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — FE-EVAL browser GWC ≠ formula LIVE / payroll module UAT / Phase1 DONE |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **Formula LIVE / customer UAT** | **DENIED** | OK-COMPUTE = **staged Nest** + `variableOverrides` · warnings `STAGED_EVAL_SUBSET` · `ATT_TIMESHEET_LINE_ABSENT` · `CB_CONTEXT_SKIPPED` |
| **J-HRM-07 process UAT** | **DENIED** this seat | Author + preview UF only · ≠ process payslip lines |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Browser form only · `seed_used=false` in machine |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT browser U65 FE-EVAL UF: author lines → Lưu nháp POST **201** with `expressionJson.form=gd1_eval_v1` → FE row → F5 hydrate → Nest Preview **201 OK-COMPUTE** (gross/net · `ready=false`) → self-publish **403-DUAL** toast. Audited QA-FE-EVAL MD + FINAL JSON stamp `PAYFEVAL-MSII5NC4` (`overall=PASS` · AC1–AC7 PASS · `honesty.payroll_e2e_ready=false`) + FE-EVAL + QC-EVAL / QC-02 baselines + screens 06/08 + pack verify **8/8**. **R-PAY-FE-OPAQUE→EVAL = CLOSED**. L1 evaluator QC-EVAL GWC and form QC-02 GWC **RETAINED · not reopened**. Residuals **R-PAY-F-ATT-LINE** · **R-PAY-F-CB-BAG** (UF not closed) · **R-PAY-F-STALE-DIST** OBS · **`C-SLICE-≠-MODULE`** remain **OPEN CONDITIONS**. **DENIED** formula LIVE · `payroll_e2e_ready=true` · Phase1 DONE · module payroll UAT · J-HRM-07 process UAT.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| AC1 Tab + eval UI + honesty | QA MD · JSON · badge false | 🟢 **ACCEPT** |
| AC2 Author lines BASE + DED_TAX | line-0/1 · marker `gd1_eval_v1` | 🟢 **ACCEPT** |
| AC3 Save `gd1_eval_v1` POST 201 | form=`gd1_eval_v1` · lines=2 · FE row | 🟢 **ACCEPT** |
| AC4 F5 hydrate | BASE/`base_salary` · DED_TAX · marker | 🟢 **ACCEPT** |
| AC5 Preview Nest OK-COMPUTE | **201** gross **8_000_000** · net **7_200_000** · ready=false · overrides | 🟢 **ACCEPT** (staged ≠ LIVE) |
| AC6 Dual-control 403-DUAL | **403** + toast · screen 08 | 🟢 **ACCEPT** |
| AC7 HDSD · no DnD · honesty | missing=[] · dnd=0 · ready=false | 🟢 **ACCEPT** |
| Pack verify QA-FE-EVAL | **8/8** exit 0 | 🟢 **PROCESS OK** |
| R-PAY-FE-OPAQUE→EVAL | QA CLOSE + QC confirm | 🟢 **CLOSED** |
| R-PAY-F-ATT-LINE / R-PAY-F-CB-BAG | still open | 🟡 **CONDITION OPEN** |
| Module UAT / Phase1 / ready | Explicit DENIED | 🟢 |

**Cấm:** invent formula LIVE · `payroll_e2e_ready=true` · Phase1 DONE · claim J-HRM-07 process UAT · reopen QC-EVAL / QC-02 without regression · seed.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · staged OK-COMPUTE with overrides ≠ LIVE payslip · ATT line ABSENT · C&B process UF not closed · J-HRM-07 formula process not proven |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim R-PAY-FE-OPAQUE→EVAL closed? | **YES** — this seat ACCEPT |
| May PM claim formula LIVE / module UAT? | **NO** |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QC-EVAL L1 honesty GWC | `po-hrm-payroll-formula-run-gap-qc-eval-01.md` | PASS_TO_PM | **RETAIN · do not reopen** |
| QC-02 browser form GWC | `po-hrm-payroll-formula-run-gap-qc-02.md` | PASS_TO_PM | **RETAIN** · R-PAY-FE-FORM CLOSED |
| FE-EVAL emit gd1_eval_v1 | `po-hrm-payroll-formula-run-gap-fe-eval-01.md` | READY_FOR_QA | **ACCEPT** prior |
| QA-FE-EVAL browser U65 | `po-hrm-payroll-formula-run-gap-qa-fe-eval-01.md` | PASS_TO_PM | **ACCEPT** stamp `PAYFEVAL-MSII5NC4` |
| Machine QA-FE-EVAL | `_tmp-po-hrm-payroll-formula-run-gap-qa-fe-eval-01.FINAL.json` | PASS | **ACCEPT** |
| Screens 01–08 | `screens/po-hrm-payroll-formula-run-gap-qa-fe-eval-01/` | present | **ACCEPT** spot-check 06 (OK-COMPUTE) · 08 (403-DUAL) |
| Pack verify QA-FE-EVAL | `verify:qc:evidence-pack` | exit **0** · **8/8** | 🟢 |
| Parallel BE-CB-BAG | `po-hrm-payroll-formula-run-gap-be-cb-bag-01.md` | READY_FOR_QA | **NOTE** — code shipped; **UF residual still OPEN** until QA closes |

### Machine JSON spot

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `PAYFEVAL-MSII5NC4` | 🟢 |
| `honesty.payroll_e2e_ready` / `formula_live_claimed` / `seed_used` | all **false** | 🟢 |
| `ac.AC1`..`AC7` | all **PASS** | 🟢 |
| AC3 POST | **201** `HRM-PAY-FORMULA-201` · `expression_json_form=gd1_eval_v1` · lines=2 | 🟢 |
| AC5 preview | **201** `HRM-PAY-FORMULA-200` · gross/net · `payroll_e2e_ready=false` · path OK-COMPUTE | 🟢 |
| AC5 warnings | `STAGED_EVAL_SUBSET` · `ATT_TIMESHEET_LINE_ABSENT` · `CB_CONTEXT_SKIPPED` | 🟢 honesty (blocks ready) |
| AC6 publish | **403** `HRM-PAY-FORMULA-403-DUAL` · `dualToast=true` | 🟢 |
| `process.pageErrors` / `dndStorm` / `uncaught` | **0** | 🟢 |
| `consoleErrors` 403 | Chromium native resource | 🟢 **PRODUCT OK** (expected dual deny) |
| `overall` | **PASS** | 🟢 |

---

## Gate AC audit (browser U65 FE-EVAL)

| # | Expected | Observed | QC |
|---|----------|----------|-----|
| 1 | Tab + eval lines + badge false | Panel + `pay-formula-eval-lines` · badge ready=false | 🟢 |
| 2 | Author BASE var + DED_TAX expr | line-0/1 authored · marker `gd1_eval_v1` | 🟢 |
| 3 | Save body form=gd1_eval_v1 · FE row | POST **201** · form documented · list row | 🟢 |
| 4 | F5 hydrate lines | BASE/`base_salary` · DED_TAX · marker | 🟢 |
| 5 | Preview OK-COMPUTE **or** honest 412 | **201** OK-COMPUTE amounts · ready=false · Nest only | 🟢 |
| 6 | Self-publish 403-DUAL toast | Toast dual-control · **not** silent 2xx | 🟢 |
| 7 | HDSD · no DnD · honesty | missing=[] · dnd=0 | 🟢 |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-FE-EVAL | QC |
|-----------------|-------|------------|-----|
| **FE-EVAL browser gd1_eval_v1 author + Nest preview** (in-scope) | FE-EVAL READY | 🟢 AC1–7 PASS | 🟢 **PASS / ACCEPT** |
| **L1 evaluator honesty PREVIEW/PROCESS** | QC-EVAL GWC | not re-run | 🟢 **RETAIN ACCEPT** |
| **Browser GĐ1 formula author UF (opaque era)** | QC-02 GWC | not re-run | 🟢 **RETAIN ACCEPT** (R-PAY-FE-FORM CLOSED) |
| **J-HRM-07** Lương → phiếu lương | Historical shell | **not retested** · ≠ formula process | ⬜ **DEFERRED** — not claimed |
| PROCESS payslip_lines success (C&B bag, no overrides) | BE-CB-BAG READY | not this seat | ⬜ **DEFERRED** — R-PAY-F-CB-BAG OPEN |
| Hours var bag LIVE (`att_timesheet_line`) | DATA ABSENT | warning ATT_ABSENT on preview | ⬜ **DEFERRED** — R-PAY-F-ATT-LINE OPEN |

**U19 note:** This gate certifies the **browser FE-EVAL gd1_eval_v1 author + Nest preview UF** named in dispatch — **not** a claim that **J-HRM-07** process / formula LIVE / module payroll UAT is newly GO. Missing process-success journey does **not** NO-GO this FE-EVAL seat; it **forces GWC CONDITION** (`C-SLICE-≠-MODULE` + ATT/CB residuals) and keeps `payroll_e2e_ready=false`.

### CRUD / mutate matrix (browser UF)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| POST draft via FE Save (`gd1_eval_v1`) | Create | **PASS** |
| List row after 2xx + F5 hydrate | Read | **PASS** |
| Preview Nest with overrides | Read dry-run | **PASS** (OK-COMPUTE staged · ready=false) |
| submit-publish via FE | Update (SM) | **PASS** |
| publish same actor | Update deny | **PASS** (403-DUAL toast) |
| PROCESS payslip_lines (no overrides) | Update | **N/A this seat** → R-PAY-F-CB-BAG |
| Second-actor publish → active | Update (SM) | **N/A this seat** — L1 already proved |
| Hard-delete | Delete | **N/A** |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| QA-FE-EVAL pack **8/8** | **PROCESS OK** | Gate entry PASS |
| AC1–7 Network + FE-after-2xx + F5 | **PRODUCT OK** | Slice ACCEPT |
| Console 403 native | **PRODUCT OK** | Expected dual-control; toast present (screen 08) |
| OK-COMPUTE with ATT/CB warnings | **PRODUCT OK** + **SCOPE** | Honest staged compute · warnings keep ready=false |
| ATT line / C&B process UF / J-HRM-07 | **SCOPE / CONDITION** | Blocks ready=true · **not** FE-EVAL slice NO-GO |
| No P0/P1 product residual on FE-EVAL WI | **PRODUCT OK** | R-PAY-FE-OPAQUE→EVAL CLOSED |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-PAY-FE-OPAQUE→EVAL** | was P2 | `qa`/`qc` | **CLOSED** | Browser U65 AC1–7 ACCEPT this seat |
| **R-PAY-F-ATT-LINE** | P1 | ATT / ba-data → **dev-be** | **OPEN CONDITION** | `att_timesheet_line` → hours var bag LIVE (preview warns ABSENT) |
| **R-PAY-F-CB-BAG** | P1 | **qa** (BE READY_FOR_QA) | **OPEN CONDITION** | PROCESS success with real C&B `base_salary` (no overrides) → payslip_lines UF — **not** closed by FE-EVAL overrides path |
| **R-PAY-F-STALE-DIST** | process P2 | `dev-be`/`devops` | **CONDITION OK** | Post-READY dist refresh SOP — retain |
| **R-PAY-FE-FORM** | — | — | **CLOSED** (QC-02) | Retained baseline |
| **R-PAY-F-EVAL** (L1 honesty) | — | — | **CLOSED** (QC-EVAL) | Retained · do not reopen |
| **`payroll_e2e_ready`** | honesty | `pm` | **LOCKED false** | Explicit **NO** promote |
| **J-HRM-07** formula/process UAT | L2.5 | `qa` later | **DEFERRED** | After ATT line + C&B UF |
| **`C-SLICE-≠-MODULE`** | governance | `pm`/`qc` | **CONDITION** | Seat GWC ≠ module UAT / Phase1 |

**P0/P1 product residuals for this FE-EVAL browser WI:** none blocking slice ACCEPT.

**CONDITION for GWC:** `C-SLICE-≠-MODULE` + R-PAY-F-ATT-LINE + R-PAY-F-CB-BAG OPEN — sufficient to deny `payroll_e2e_ready=true` and deny clean module / Phase1 GO; **not** product NO-GO for certified FE-EVAL browser slice.

**Open CONDITIONS (explicit list for PM):**

1. **`C-SLICE-≠-MODULE`** — FE-EVAL GWC ≠ module / Phase1 DONE  
2. **`R-PAY-F-ATT-LINE`** — hours LIVE SoT still ABSENT  
3. **`R-PAY-F-CB-BAG`** — PROCESS C&B UF still OPEN (BE shipped; QA not closed)  
4. **`R-PAY-F-STALE-DIST`** — CONDITION OK SOP  
5. **`payroll_e2e_ready=false`** LOCKED · formula LIVE DENIED · J-HRM-07 process UAT DENIED  

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-fe-eval-01.md` | exit **0** · **8/8** | **PROCESS OK** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-fe-eval-01.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| QA harness (prior) stamp `PAYFEVAL-MSII5NC4` | **PASS** · AC1–7 | PRODUCT OK (cited) |
| Screen spot-check 06 / 08 | OK-COMPUTE ready=false · 403-DUAL toast | PRODUCT OK |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + screen audit · **did not** re-run full browser.

---

## completion_report

### Closed

1. QC FE-EVAL browser slice gate on Payroll → **Công thức lương** `gd1_eval_v1` author + Nest preview — **GO WITH CONDITIONS**.  
2. Audited QA-FE-EVAL MD + FINAL JSON stamp `PAYFEVAL-MSII5NC4` + FE-EVAL + QC-EVAL/QC-02 baselines + screens — AC1–7 **ACCEPT**.  
3. **R-PAY-FE-OPAQUE→EVAL CLOSED**.  
4. Honesty locks held: `payroll_e2e_ready=false` · formula LIVE **DENIED** · Phase1 **NOT** claimed · module UAT **DENIED** · J-HRM-07 process UAT **DENIED**.  
5. Pack QA-FE-EVAL **8/8**; this QC pack consolidates mandatory sections.  
6. Explicit **NO** to PM promote ready flag · **`C-SLICE-≠-MODULE`**.  
7. Did **not** reopen prior L1 evaluator GWC or form GWC.

### Residual (open for next dispatch)

- **R-PAY-F-CB-BAG** → **qa** L1/browser PROCESS retest (BE-CB-BAG READY_FOR_QA) — preferred parallel  
- **R-PAY-F-ATT-LINE** → ba-data / **dev-be** hours LIVE SoT  
- Module / J-HRM-07 formula process UAT → **qa** only after ATT+CB UF  

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** → dispatch **qa** R-PAY-F-CB-BAG (preferred) **and/or** **ba-data**/`dev-be` R-PAY-F-ATT-LINE |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-fe-eval-01.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | After GWC → **qa** CB-BAG UF (BE already READY) — **cấm** flip `payroll_e2e_ready` / claim formula LIVE / Phase1 DONE / module UAT |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-CB-BAG-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-FE-EVAL-01 GO WITH CONDITIONS (FE-EVAL browser · R-PAY-FE-OPAQUE→EVAL CLOSED)
priority: P0

## Mission
L1 (+ optional browser observe) retest R-PAY-F-CB-BAG after BE-CB-BAG READY_FOR_QA: PROCESS with published gd1_eval_v1 + real CORE C&B base_salary (NO variableOverrides) → 2xx payslip_lines OR honest FORMULA-412-VARS. Retain ATT-412 / FORMULA-412 / dual-control. U65 zero-seed. payroll_e2e_ready=false.

entry_criteria:
- QC-FE-EVAL GWC · docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-fe-eval-01.md
- BE-CB-BAG READY · docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-cb-bag-01.md
- QC-EVAL L1 honesty retained · API §5 PROCESS bind
- U65 zero-seed · post-READY dist refresh SOP (R-PAY-F-STALE-DIST)

exit_criteria:
- Evidence proves PROCESS C&B success lines OR honest VARS with clear residual
- honesty: payroll_e2e_ready=false · cấm formula LIVE / Phase1 / module UAT / J-HRM-07 claim
- evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-cb-bag-01.md
- ack_status PASS_TO_PM

cấm: seed · silent 0₫ process · flip payroll_e2e_ready · claim LIVE from FE-EVAL overrides path
```

**Parallel preferred (ATT hours LIVE):**

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-01
from_role: pm
to_role: ba-data
lane: governance → then execution
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-FE-EVAL-01 GWC (R-PAY-F-ATT-LINE OPEN · preview warns ATT_TIMESHEET_LINE_ABSENT)
priority: P0

## Mission
Unlock hours var bag LIVE: ADD-plan / confirm att_timesheet_line (or closed-sheet line SoT) so PREVIEW/PROCESS can bind payable_hours without ATT_ABSENT / PREVIEW-STUB-only. Keep payroll_e2e_ready=false until UF-proven.

entry_criteria:
- QC-FE-EVAL GWC · docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-fe-eval-01.md
- Residual R-PAY-F-ATT-LINE OPEN
- U65 zero-seed

exit_criteria:
- DATA delta + handoff ready for dev-be wire
- evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-data-att-line-01.md (or BA path)
- honesty: payroll_e2e_ready=false

cấm: flip payroll_e2e_ready · claim formula LIVE · seed
```
