# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-CB-BAG-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-CB-BAG-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **L1 API R-PAY-F-CB-BAG slice gate** (not formula LIVE · not browser process UF · not module UAT) |
| **priority** | P0 |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-CB-BAG-01` PASS_TO_PM (L1 R-PAY-F-CB-BAG · stamp **`PAYFECB-MSIIFNL`**) |
| **portal_url** | `http://127.0.0.1:5173` (L0 observe) · HRM `:28001` · XBOS `:28002` · **PORTAL_DEV_URL** N/A browser this seat |
| **journey_l25** | L1 PROCESS/PREVIEW C&B bag honesty (API §4.4 · §5 · §7) — **not** full J-HRM-07 process UAT |
| **Verdict** | **GO WITH CONDITIONS** — L1 C&B bag ACCEPT · **R-PAY-F-CB-BAG (L1) CLOSED** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-payroll-formula-run-gap-qa-cb-bag-01.md`](po-hrm-payroll-formula-run-gap-qa-cb-bag-01.md) stamp **`PAYFECB-MSIIFNL`** |
| **be_ref** | [`po-hrm-payroll-formula-run-gap-be-cb-bag-01.md`](po-hrm-payroll-formula-run-gap-be-cb-bag-01.md) READY_FOR_QA |
| **l1_eval_baseline** | [`po-hrm-payroll-formula-run-gap-qc-eval-01.md`](po-hrm-payroll-formula-run-gap-qc-eval-01.md) GWC L1 evaluator — **RETAINED · do not reopen** |
| **fe_eval_baseline** | [`po-hrm-payroll-formula-run-gap-qc-fe-eval-01.md`](po-hrm-payroll-formula-run-gap-qc-fe-eval-01.md) GWC FE-EVAL · **R-PAY-FE-OPAQUE→EVAL CLOSED** — **RETAINED · do not reopen** |
| **machine** | [`_tmp-po-hrm-payroll-formula-run-gap-qa-cb-bag-01.FINAL.json`](_tmp-po-hrm-payroll-formula-run-gap-qa-cb-bag-01.FINAL.json) |
| **spec_ref** | `docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md` **§4.4** · **§5** · **§7** |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · QA used product-path `POST …/compensation-packages` (≠ seed) |
| **OS honesty** | `C-SLICE-≠-MODULE` — L1 C&B bag GWC ≠ formula LIVE / payroll module UAT / Phase1 DONE / J-HRM-07 |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **Formula LIVE / customer UAT** | **DENIED** | Staged `gd1_eval_v1` + CORE C&B subset · warnings `STAGED_EVAL_SUBSET` / `NOT_CUSTOMER_UAT` / `ATT_TIMESHEET_LINE_ABSENT` |
| **Browser process UF / J-HRM-07** | **DENIED** this seat | L1 API only · FE-EVAL author/preview GWC retained separately |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Product-path C&B create allowed · not `pnpm seed:*` |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT L1 API C&B variable bag after BE-CB-BAG + QA-CB-BAG against API_DESIGN §4.4 PREVIEW · §5 PROCESS bind · §7 taxonomy. Audited QA-CB-BAG MD + FINAL JSON stamp `PAYFECB-MSIIFNL` (`verdict=PASS` · `failed_acs=[]` · `honesty_final.payroll_e2e_ready=false`) + BE-CB-BAG matrix + QC-EVAL / QC-FE-EVAL baselines. Proven: preview `employeeId` **no** overrides → **201** compute **`payroll_e2e_ready=false`** + `CB_PACKAGE_SOURCE:scoped_package` · PROCESS with real C&B → **201** `HRM-PAY-202` amounts · missing C&B → **412** `HRM-PAY-FORMULA-412-VARS` · ATT-open → **412** `HRM-PAY-ATT-412` · no active formula → **412** `HRM-PAY-FORMULA-412`. QA pack verify **1/8** = **PROCESS OBS** (missing `crud_or_matrix` heading on L1-only MD) — this QC consolidates **8/8**. **R-PAY-F-CB-BAG (L1) = CLOSED**. Retain **R-PAY-F-ATT-LINE** · **R-PAY-PAYSLIP-LINES-GET** OBS · **`C-SLICE-≠-MODULE`**. FE-EVAL seat **RETAINED CLOSED** — **do not reopen**. **DENIED** formula LIVE · `payroll_e2e_ready=true` · Phase1 DONE · module payroll UAT · J-HRM-07 process UAT.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| CB-preview no overrides + CB_PACKAGE_SOURCE | JSON `ac_cb_preview_bag` · **201** gross **12_000_000** · lines **2** · ready=false · `CB_PACKAGE_SOURCE:scoped_package` | 🟢 **ACCEPT** |
| AC-CB1 PROCESS + real C&B → 2xx amounts | **201** `HRM-PAY-202` · gross **9_500_000** · net **8_550_000** · NV002 processed · stamp prior RETRY3 | 🟢 **ACCEPT** |
| AC-CB2 Missing C&B → FORMULA-412-VARS | **412** `HRM-PAY-FORMULA-412-VARS` · `missingVars:[base_salary]` · `CB_PACKAGE_ABSENT` | 🟢 **ACCEPT** |
| AC-CB3 Open ATT → ATT-412 | **412** `HRM-PAY-ATT-412` | 🟢 **ACCEPT** |
| AC-CB4 No active formula → FORMULA-412 | **412** `HRM-PAY-FORMULA-412` · refuse silent zero · `ac_cb4_recheck_v2` | 🟢 **ACCEPT** |
| Spec §4.4 / §5 / §7 | codes match taxonomy | 🟢 **TRACE OK** |
| Honesty `payroll_e2e_ready=false` | MD + machine `honesty` + `honesty_final` | 🟢 **DENIED promote** |
| QA pack 1/8 | crud_or_matrix missing | 🟡 **PROCESS OBS** — QC consolidates |
| R-PAY-F-STALE-DIST | QA rebuild + `start:prod` before live | 🟡 **CONDITION OK** (SOP retained) |
| Payslip lines GET 404 | `payslip_lines_get: ABSENT_OBS` | 🟡 **OBS P2** — not slice FAIL |
| R-PAY-F-ATT-LINE | hours LIVE still ABSENT | 🟡 **CONDITION OPEN** (SA in flight) |
| FE-EVAL / R-PAY-FE-OPAQUE→EVAL | QC-FE-EVAL GWC | 🟢 **CLOSED · do not reopen** |
| Module UAT / Phase1 / ready / J-HRM-07 | Explicit DENIED | 🟢 |

**Cấm:** invent formula LIVE · `payroll_e2e_ready=true` · Phase1 DONE · claim J-HRM-07 process UAT · claim module payroll UAT · reopen FE-EVAL / QC-EVAL without regression · seed.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · staged C&B L1 ≠ LIVE payslip UF · ATT line ABSENT · no public payslip lines GET · no browser process UAT / J-HRM-07 |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim R-PAY-F-CB-BAG L1 closed? | **YES** — this seat ACCEPT |
| May PM claim formula LIVE / module UAT / Phase1? | **NO** |
| May PM reopen R-PAY-FE-OPAQUE→EVAL? | **NO** — QC-FE-EVAL CLOSED |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QC-EVAL L1 honesty GWC | `po-hrm-payroll-formula-run-gap-qc-eval-01.md` | PASS_TO_PM | **RETAIN · do not reopen** · R-PAY-F-EVAL L1 CLOSED |
| QC-FE-EVAL browser GWC | `po-hrm-payroll-formula-run-gap-qc-fe-eval-01.md` | PASS_TO_PM | **RETAIN · do not reopen** · R-PAY-FE-OPAQUE→EVAL CLOSED |
| BE-CB-BAG C&B resolve | `po-hrm-payroll-formula-run-gap-be-cb-bag-01.md` | READY_FOR_QA | **ACCEPT** prior |
| QA-CB-BAG L1 honesty | `po-hrm-payroll-formula-run-gap-qa-cb-bag-01.md` | PASS_TO_PM | **ACCEPT** stamp `PAYFECB-MSIIFNL` |
| Machine QA-CB-BAG | `_tmp-po-hrm-payroll-formula-run-gap-qa-cb-bag-01.FINAL.json` | PASS | **ACCEPT** |
| Pack verify QA-CB-BAG | `verify:qc:evidence-pack` | exit **1** · **1/8** | 🟡 **PROCESS OBS** — L1 seat; QC consolidates |
| Spec API-01 | §4.4 · §5 · §7 | CONFIRMED | **TRACE OK** |
| ATT residual parallel | DATA-ATT-LINE PASS · **API-ATT-LINE SA DISPATCHED** 12:36 | in flight | **NOTE** — prefer await SA; BE unlock after F.1 |

### Machine JSON spot

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `PAYFECB-MSIIFNL` | 🟢 |
| `honesty.payroll_e2e_ready` / `formula_live` / `browser_uf` | all **false** | 🟢 |
| `honesty_final.*` + `seed` + `module_uat` | all **false** | 🟢 |
| `checks.ac_cb_preview_bag` | **201** gross=12000000 lines=2 ready=false · `CB_PACKAGE_SOURCE:scoped_package` | 🟢 |
| `checks.ac_cb1_process_with_cb` | processed=1 gross=9500000 net=8550000 · lines GET ABSENT OBS | 🟢 |
| `checks.ac_cb2_formula_412_vars` | **412** `HRM-PAY-FORMULA-412-VARS` · `CB_PACKAGE_ABSENT` | 🟢 |
| `checks.ac_cb3_att_412` | **412** `HRM-PAY-ATT-412` | 🟢 |
| `checks.ac_cb4_formula_412` | **412** `HRM-PAY-FORMULA-412` · active_after=0 | 🟢 |
| `process_success` | period `38674cc1…` · **201** `HRM-PAY-202` · NV002 | 🟢 |
| `preview_cb_no_overrides.warnings` | includes `CB_PACKAGE_SOURCE:scoped_package` · `PAYROLL_E2E_READY_FALSE` · `NOT_CUSTOMER_UAT` | 🟢 |
| `verdict` / `failed_acs` | **PASS** / `[]` | 🟢 |
| `dist_rebuild` | **true** | 🟡 **OBS** stale-dist SOP |
| Author / publisher | `ceo@xe.vn` ≠ `admin@xe.vn` | 🟢 dual-control retained |
| `u65` | product-path compensation-packages · zero-seed | 🟢 |

**Correction vs QA residual table:** QA listed `R-PAY-FE-OPAQUE→EVAL` as still open to `dev-fe`. QC **supersedes**: seat already **CLOSED** by `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-FE-EVAL-01` — **retain CLOSED · do not reopen**.

---

## Gate AC audit (API §4.4 / §5 / §7)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| CB-preview | §4.4 evaluate from CORE C&B when `employeeId` · no overrides · ready=false | **201** · gross/net/lines · `CB_PACKAGE_SOURCE` | 🟢 |
| AC-CB1 | §5 PROCESS + published `gd1_eval_v1` + real C&B → amounts / lines path | **201** summary + payslip processed · `replacePayslipLines` via BE | 🟢 |
| AC-CB2 | §7 FORMULA-412-VARS when bag incomplete · no silent 0₫ | **412** VARS · `CB_PACKAGE_ABSENT` | 🟢 |
| AC-CB3 | §5 / §7 ATT-412 retained | **412** ATT-412 | 🟢 |
| AC-CB4 | §5 / §7 FORMULA-412 retained | **412** FORMULA-412 refuse silent zero | 🟢 |
| — | Formula LIVE / customer UAT / J-HRM-07 | Explicit non-claim | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-CB-BAG | QC |
|-----------------|-------|-----------|-----|
| **L1 C&B bag PREVIEW/PROCESS** (in-scope) | BE-CB-BAG READY | 🟢 AC-CB1..4 PASS | 🟢 **PASS / ACCEPT** |
| **L1 evaluator honesty** | QC-EVAL GWC | not re-run | 🟢 **RETAIN ACCEPT** |
| **Browser FE-EVAL gd1_eval_v1** | QC-FE-EVAL GWC | not re-run | 🟢 **RETAIN ACCEPT** (R-PAY-FE-OPAQUE→EVAL CLOSED) |
| **J-HRM-07** Lương → phiếu lương | Historical ✅ PASS (W5B) | **not retested** · ≠ formula process UF | ⬜ **DEFERRED** — not claimed |
| Hours var bag LIVE (`att_timesheet_line`) | DATA CONFIRMED ADD · SA F.1 in flight | ATT still ABSENT in warnings | ⬜ **DEFERRED** — R-PAY-F-ATT-LINE |
| Browser process payslip UF | — | L1 only | ⬜ **DEFERRED** |

**U19 note:** This gate certifies the **L1 C&B bag API slice** named in dispatch — **not** a claim that **J-HRM-07** process / formula LIVE / module payroll UAT is newly GO. Missing browser process journey does **not** NO-GO this L1 seat; it **forces GWC CONDITION** (`C-SLICE-≠-MODULE` + ATT residual) and keeps `payroll_e2e_ready=false`.

### CRUD / mutate matrix (L1 API — C&B bag)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| Preview `employeeId` no overrides → C&B compute | Read dry-run | **PASS** (ready=false · CB_PACKAGE_SOURCE) |
| PROCESS published formula + real C&B | Update | **PASS** (201 amounts) |
| PROCESS missing C&B | Update deny | **PASS** (FORMULA-412-VARS) |
| PROCESS open ATT | Update deny | **PASS** (ATT-412) |
| PROCESS no active formula | Update deny | **PASS** (FORMULA-412) |
| Product-path create compensation-package | Create | **PASS** (U65 allowed · ≠ seed) |
| GET payslip lines public | Read | **N/A / OBS** — route ABSENT |
| Browser process UF | — | **N/A** — DENIED this seat |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| QA-CB-BAG pack **1/8** | **PROCESS OBS** | Missing crud_or_matrix on L1 MD — **not** product demote; QC pack consolidates |
| AC-CB1..4 API honesty codes | **PRODUCT OK** | Slice ACCEPT |
| Stale dist until QA rebuild | **PROCESS / ENV OBS** | CONDITION OK SOP — QA rebuilt + `start:prod` |
| Payslip lines GET 404 | **OBS P2** | PROCESS write path proven via summary + preview lines; public GET not shipped — **not** CB-BAG L1 FAIL |
| ATT line ABSENT warnings on success path | **SCOPE / CONDITION** | Blocks ready=true · **not** L1 CB-BAG NO-GO |
| QA residual listed FE-EVAL open | **PROCESS OBS** | Superseded by QC-FE-EVAL CLOSED — wording correction only |
| No P0/P1 product residual on L1 CB-BAG WI | **PRODUCT OK** | R-PAY-F-CB-BAG L1 CLOSED |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-PAY-F-CB-BAG** (L1 PROCESS+C&B no overrides) | was P1 | `qa`/`qc` | **CLOSED** | AC-CB1..4 ACCEPT this seat |
| **R-PAY-F-ATT-LINE** | P1 | **sa** (in flight `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01`) → then **dev-be** | **OPEN CONDITION** | DATA CONFIRMED ADD · await SA F.1 then BE wire + QA UF |
| **R-PAY-PAYSLIP-LINES-GET** | P2 OBS | **dev-be** later | **OPEN OBS** | No public GET `/payroll/payslips/:id/lines` |
| **R-PAY-FE-OPAQUE→EVAL** | — | — | **CLOSED** (QC-FE-EVAL) | **Do not reopen** |
| **R-PAY-F-EVAL** (L1) | — | — | **CLOSED** (QC-EVAL) | Retained |
| **R-PAY-F-STALE-DIST** | process P2 | `dev-be`/`devops` | **CONDITION OK** | Post-READY dist refresh SOP — retain |
| **`payroll_e2e_ready`** | honesty | `pm` | **LOCKED false** | Explicit **NO** promote |
| **J-HRM-07** formula/process UAT | L2.5 | `qa` later | **DEFERRED** | After ATT line LIVE + browser process |
| **`C-SLICE-≠-MODULE`** | governance | `pm`/`qc` | **CONDITION** | Seat GWC ≠ module UAT / Phase1 |

**P0/P1 product residuals for this L1 C&B bag WI:** none blocking slice ACCEPT.

**CONDITION for GWC:** `C-SLICE-≠-MODULE` + R-PAY-F-ATT-LINE OPEN + payslip lines GET OBS — sufficient to deny `payroll_e2e_ready=true` and deny clean module / Phase1 / J-HRM-07 GO; **not** product NO-GO for certified L1 C&B bag slice.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-cb-bag-01.md` | exit **1** · **1/8** (crud_or_matrix) | **PROCESS OBS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-cb-bag-01.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| QA harness stamp `PAYFECB-MSIIFNL` | **PASS** · `failed_acs=[]` | PRODUCT OK (cited) |
| Spec spot-check §4.4 / §5 / §7 | codes aligned | TRACE OK |
| Bus note ATT | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01` DISPATCHED 12:36 | governance in flight |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON audit.

---

## completion_report

### Closed

1. QC L1 C&B bag gate — **GO WITH CONDITIONS**.  
2. Audited QA-CB-BAG MD + FINAL JSON stamp `PAYFECB-MSIIFNL` + BE-CB-BAG + QC-EVAL/QC-FE-EVAL baselines — AC-CB1..4 **ACCEPT**.  
3. **R-PAY-F-CB-BAG (L1) CLOSED**.  
4. Honesty locks held: `payroll_e2e_ready=false` · formula LIVE **DENIED** · Phase1 **NOT** claimed · module UAT **DENIED** · J-HRM-07 **DENIED**.  
5. QA pack PROCESS OBS consolidated into this QC pack **8/8**.  
6. FE-EVAL residual **not reopened** (CLOSED retained).  
7. Explicit **NO** to PM promote ready flag · **C-SLICE-≠-MODULE**.

### Residual (open for next dispatch)

- **R-PAY-F-ATT-LINE** → **prefer ATT SA already in flight** (`PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01`); after SA F.1 CONFIRM → **dev-be** wire → QA UF.  
- **R-PAY-PAYSLIP-LINES-GET** OBS P2 → **dev-be** later (optional).  
- Module / J-HRM-07 formula process UAT → **qa** only after ATT LIVE + browser.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** → prefer continue **sa** ATT-LINE (already DISPATCHED); after SA F.1 → **dev-be** unlock |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-cb-bag-01.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | GWC L1 CB-BAG CLOSED · **cấm** flip `payroll_e2e_ready` / claim formula LIVE / Phase1 / J-HRM-07 · do **not** re-dispatch FE-EVAL · ATT SA in flight — await then BE |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01
from_role: pm
to_role: sa
lane: governance
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-CB-BAG-01 GO WITH CONDITIONS (L1 R-PAY-F-CB-BAG CLOSED · stamp PAYFECB-MSIIFNL)
note: ALREADY DISPATCHED 2026-08-07T12:36 — if still in flight, do NOT duplicate; intake when PASS_TO_PM then unlock BE below
priority: P0

## Mission (if SA still open)
Complete F.1 API_DESIGN for att_timesheet_line hours bag (AGG+PAY) per DATA-ATT-LINE CONFIRMED ADD. Keep payroll_e2e_ready=false. Unlock BE only after F.1 CONFIRMED.

If SA already PASS_TO_PM with F.1 CONFIRMED, skip to BE unlock:

work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-01
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-CB-BAG-01 GWC (R-PAY-F-CB-BAG L1 CLOSED) + API-ATT-LINE F.1 CONFIRMED
priority: P0

## Mission (BE unlock — only after SA F.1)
Wire closed-sheet att_timesheet_line → formula var bag (payable_hours / ot_hours_weighted). Retain ATT-412 on open sheet · FORMULA-412-VARS when hours incomplete · no silent 0₫. Retain C&B bag path. Dist rebuild SOP (R-PAY-F-STALE-DIST). payroll_e2e_ready=false.

entry_criteria:
- QC-CB-BAG GWC · docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-cb-bag-01.md
- DATA-ATT-LINE CONFIRMED · SA API-ATT-LINE F.1 CONFIRMED
- U65 zero-seed · post-READY dist refresh SOP

exit_criteria:
- jest + CODE-MEMORY · READY_FOR_QA
- evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-att-line-01.md
- honesty: payroll_e2e_ready=false · cấm formula LIVE / Phase1 / module UAT / J-HRM-07

cấm: silent 0₫ · reopen FE-EVAL · flip payroll_e2e_ready · seed
```
