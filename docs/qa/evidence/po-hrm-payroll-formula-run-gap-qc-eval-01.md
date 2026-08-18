# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-EVAL-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-EVAL-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **L1 API evaluator honesty slice gate** (not formula LIVE · not browser UF · not module UAT) |
| **priority** | P0 |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-EVAL-01` PASS_TO_PM (L1 evaluator honesty) |
| **portal_url** | `http://127.0.0.1:5173` (L0 observe) · HRM `:28001` · XBOS `:28002` · **PORTAL_DEV_URL** N/A browser this seat |
| **journey_l25** | L1 F-PAY-FORMULA PREVIEW/PROCESS honesty (API §4.4 · §5 · §7) — **not** full J-HRM-07 process UAT |
| **Verdict** | **GO WITH CONDITIONS** — L1 evaluator honesty ACCEPT · **R-PAY-F-EVAL (L1 honesty) CLOSED** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-payroll-formula-run-gap-qa-eval-01.md`](po-hrm-payroll-formula-run-gap-qa-eval-01.md) stamp **`PAYFEQ1-MSIHM5A1`** |
| **be_ref** | [`po-hrm-payroll-formula-run-gap-be-eval-01.md`](po-hrm-payroll-formula-run-gap-be-eval-01.md) READY_FOR_QA |
| **form_baseline** | [`po-hrm-payroll-formula-run-gap-qc-02.md`](po-hrm-payroll-formula-run-gap-qc-02.md) GWC browser form · **R-PAY-FE-FORM CLOSED** — **RETAINED** |
| **l1_crud_baseline** | [`po-hrm-payroll-formula-run-gap-qc-01.md`](po-hrm-payroll-formula-run-gap-qc-01.md) GWC L1 CRUD — **RETAINED** |
| **spec_ref** | `docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md` **§4.4** · **§5** · **§7** |
| **machine** | [`_tmp-po-hrm-payroll-formula-run-gap-qa-eval-01.FINAL.json`](_tmp-po-hrm-payroll-formula-run-gap-qa-eval-01.FINAL.json) |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — L1 evaluator GWC ≠ formula LIVE / payroll module UAT / Phase1 DONE |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **Formula LIVE / customer preview UAT** | **DENIED** | Opaque still **412-PREVIEW-STUB**; `gd1_eval_v1` = **staged subset** only (`STAGED_EVAL_SUBSET` / `NOT_CUSTOMER_UAT`) |
| **Browser UF / FE preview UX** | **DENIED** this seat | L1 API only · form baseline QC-02 retained |
| **J-HRM-07 process UAT** | **DENIED** | Process success lines blocked (`FORMULA-412-VARS` C&B) · not claimed |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | QA reused live closed ATT sheet · not seed |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT L1 API evaluator honesty after BE-EVAL + QA-EVAL against API_DESIGN §4.4 PREVIEW · §5 PROCESS bind · §7 taxonomy. Audited QA-EVAL MD + FINAL JSON stamp `PAYFEQ1-MSIHM5A1` (`verdict=PASS` · `failed_acs=[]` · `honesty_final.payroll_e2e_ready=false`) + BE-EVAL matrix + form/L1 baselines. Proven: opaque preview **412-PREVIEW-STUB** · `gd1_eval_v1` + overrides **201** compute gross/net/lines with **`payroll_e2e_ready=false`** · PROCESS no formula **412 FORMULA-412** (refuse silent 0₫) · ATT-open **412 ATT-412** · hours-incomplete **412-PREVIEW-STUB** · fail-paths **no processed payslip lines**. QA pack verify **2/8** = **PROCESS OBS** (missing `portal_url` + CRUD/journey headings on L1-only MD) — this QC consolidates **8/8**. **R-PAY-F-EVAL (L1 honesty path) = CLOSED**. Retain **R-PAY-F-ATT-LINE** · **R-PAY-F-CB-BAG** · **R-PAY-F-STALE-DIST** OBS · optional **R-PAY-FE-OPAQUE→EVAL**. **DENIED** formula LIVE · `payroll_e2e_ready=true` · Phase1 DONE · module payroll UAT · J-HRM-07 process UAT.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| AC1 Opaque → 412-PREVIEW-STUB | JSON `ac1_opaque_preview_stub` · 412 · ready=false | 🟢 **ACCEPT** |
| AC2 `gd1_eval_v1` + overrides → 2xx compute ready=false | **201** `HRM-PAY-FORMULA-200` · gross **8_000_000** · net **7_200_000** · lines **2** · warnings staged | 🟢 **ACCEPT** |
| AC3 FORMULA-412 no silent 0₫ | **412** `HRM-PAY-FORMULA-412` · `ac3_no_silent_zero` | 🟢 **ACCEPT** |
| AC4a Hours incomplete → PREVIEW-STUB | **412** stub · `payable_hours` missing | 🟢 **ACCEPT** |
| AC4b ATT open → ATT-412 | **412** `HRM-PAY-ATT-412` | 🟢 **ACCEPT** |
| AC5 Fail-path no processed lines | att412 + formula412 · payslips on open period **0** · success SKIP `FORMULA-412-VARS` | 🟢 **ACCEPT** |
| Spec §4.4 / §5 / §7 | codes match taxonomy | 🟢 **TRACE OK** |
| Honesty `payroll_e2e_ready=false` | MD + machine `honesty` + `honesty_final` | 🟢 **DENIED promote** |
| QA pack 2/8 | portal_url + crud_or_matrix missing | 🟡 **PROCESS OBS** — QC consolidates |
| R-PAY-F-STALE-DIST | QA rebuild before live routes | 🟡 **CONDITION OK** (repeat SOP) |
| R-PAY-F-ATT-LINE / R-PAY-F-CB-BAG | hours LIVE · C&B process lines | 🟡 **CONDITION OPEN** |
| Module UAT / Phase1 / ready | Explicit DENIED | 🟢 |

**Cấm:** invent formula LIVE · `payroll_e2e_ready=true` · Phase1 DONE · claim J-HRM-07 process UAT · claim customer preview UAT · seed · reopen R-PAY-FE-FORM / L1 CRUD without regression.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · staged `gd1_eval_v1` ≠ LIVE · ATT line ABSENT · C&B process success not UF-proven · no browser process UAT |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim R-PAY-F-EVAL L1 honesty closed? | **YES** — this seat ACCEPT (staged evaluator path) |
| May PM claim formula LIVE? | **NO** |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QC-01 L1 CRUD GWC | `po-hrm-payroll-formula-run-gap-qc-01.md` | PASS_TO_PM | **RETAIN** |
| QC-02 browser form GWC | `po-hrm-payroll-formula-run-gap-qc-02.md` | PASS_TO_PM | **RETAIN** · R-PAY-FE-FORM CLOSED |
| BE-EVAL staged evaluator | `po-hrm-payroll-formula-run-gap-be-eval-01.md` | READY_FOR_QA | **ACCEPT** prior |
| QA-EVAL L1 honesty | `po-hrm-payroll-formula-run-gap-qa-eval-01.md` | PASS_TO_PM | **ACCEPT** stamp `PAYFEQ1-MSIHM5A1` |
| Machine QA-EVAL | `_tmp-po-hrm-payroll-formula-run-gap-qa-eval-01.FINAL.json` | PASS | **ACCEPT** |
| Pack verify QA-EVAL | `verify:qc:evidence-pack` | exit **1** · **2/8** | 🟡 **PROCESS OBS** — L1 seat; QC consolidates |
| Spec API-01 | §4.4 · §5 · §7 | CONFIRMED | **TRACE OK** |

### Machine JSON spot

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `PAYFEQ1-MSIHM5A1` | 🟢 |
| `honesty.payroll_e2e_ready` / `formula_live` / `browser_uf` | all **false** | 🟢 |
| `honesty_final.*` + `seed` | all **false** | 🟢 |
| `checks.ac1_opaque_preview_stub` | **412** `HRM-PAY-FORMULA-412-PREVIEW-STUB` · ready=false | 🟢 |
| `checks.ac2_eval_preview_compute` | **201** · gross/net/lines · ready=false · `NOT_CUSTOMER_UAT` | 🟢 |
| `checks.ac3_process_formula_412` + `ac3_no_silent_zero` | **412** FORMULA-412 · no 2xx zero | 🟢 |
| `checks.ac4_incomplete_hours_preview` | **412** PREVIEW-STUB | 🟢 |
| `checks.ac4_process_att_412` | **412** ATT-412 | 🟢 |
| `checks.ac5_no_success_lines_on_fail` | payslips **0** on ATT-open | 🟢 |
| `checks.ac5_success_path_amounts` | SKIP · **412** `FORMULA-412-VARS` honest | 🟢 **ACCEPT** residual CB bag |
| `verdict` / `failed_acs` | **PASS** / `[]` | 🟢 |
| `dist_rebuild` | **true** | 🟡 **OBS** stale-dist SOP |
| Author / publisher | `ceo@xe.vn` ≠ `admin@xe.vn` | 🟢 dual-control retained |

---

## Gate AC audit (API §4.4 / §5 / §7)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| 1 | §4.4 opaque / unsupported → PREVIEW-STUB | Opaque GĐ1 → **412-PREVIEW-STUB** · msg need `gd1_eval_v1` | 🟢 |
| 2 | §4.4 evaluate when bag ready · ready=false | `gd1_eval_v1` + overrides → **201** compute · `payroll_e2e_ready=false` | 🟢 |
| 3 | §5 / §7 FORMULA-412 no silent zero | Process after retire active → **412** refuse silent zero | 🟢 |
| 4a | §4.4 hours ABSENT → PREVIEW-STUB | `payable_hours` missing → **412** stub | 🟢 |
| 4b | §5 / §7 ATT-412 | Draft period no closed sheet → **412** ATT-412 | 🟢 |
| 5 | §5 lines only on evaluate success | Fail paths no processed lines; success SKIP blocked by VARS | 🟢 |
| — | Formula LIVE / customer UAT | Explicit non-claim | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-EVAL | QC |
|-----------------|-------|---------|-----|
| **L1 evaluator honesty PREVIEW/PROCESS** (in-scope) | BE-EVAL READY | 🟢 AC1–5 PASS | 🟢 **PASS / ACCEPT** |
| **L1 F-PAY-FORMULA CRUD dual-control** | QC-01 GWC | not re-run | 🟢 **RETAIN ACCEPT** |
| **Browser GĐ1 formula author UF** | QC-02 GWC | not re-run | 🟢 **RETAIN ACCEPT** (R-PAY-FE-FORM CLOSED) |
| **J-HRM-07** Lương → phiếu lương | Historical ✅ PASS (W5B) | **not retested** · ≠ formula process lines | ⬜ **DEFERRED** — not claimed |
| PROCESS payslip_lines success (C&B bag) | staged | SKIP `FORMULA-412-VARS` | ⬜ **DEFERRED** — R-PAY-F-CB-BAG |
| Hours var bag LIVE (`att_timesheet_line`) | DATA ABSENT | PREVIEW-STUB | ⬜ **DEFERRED** — R-PAY-F-ATT-LINE |

**U19 note:** This gate certifies the **L1 evaluator honesty API slice** named in dispatch — **not** a claim that **J-HRM-07** process / formula LIVE / module payroll UAT is newly GO. Missing process-success journey does **not** NO-GO this honesty seat; it **forces GWC CONDITION** (`C-SLICE-≠-MODULE` + ATT/CB residuals) and keeps `payroll_e2e_ready=false`.

### CRUD / mutate matrix (L1 API — evaluator honesty)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| Publish opaque + preview stub | Read dry-run deny | **PASS** |
| Author/publish `gd1_eval_v1` + preview compute | Create + Read dry-run | **PASS** (ready=false) |
| PROCESS no active formula | Update deny | **PASS** (FORMULA-412) |
| PROCESS open ATT | Update deny | **PASS** (ATT-412) |
| Preview hours incomplete | Read dry-run deny | **PASS** (PREVIEW-STUB) |
| PROCESS success payslip_lines | Update | **N/A this seat** — blocked honest VARS → R-PAY-F-CB-BAG |
| Browser UF | — | **N/A** — QC-02 retained |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| QA-EVAL pack **2/8** | **PROCESS OBS** | Missing portal_url + crud/journey headings on L1 MD — **not** product demote; QC pack consolidates |
| AC1–5 API honesty codes | **PRODUCT OK** | Slice ACCEPT |
| Stale dist until QA rebuild | **PROCESS / ENV OBS** | CONDITION OK SOP — repeat of QA-02/QC-01 |
| `ac5_preview_not_persist_claim` note trailing `ready=true` | **PROCESS OBS** | Ambiguous harness note wording; `honesty` + AC2 compute + `honesty_final` prove **false** — **not** product demote |
| ATT line / C&B bag / FE gd1_eval emit | **SCOPE / CONDITION** | Blocks ready=true · **not** L1-honesty NO-GO |
| No P0/P1 product residual on L1 honesty WI | **PRODUCT OK** | R-PAY-F-EVAL L1 CLOSED |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-PAY-F-EVAL** (L1 honesty / staged PREVIEW+PROCESS codes) | was P1 | `qa`/`qc` | **CLOSED** | AC1–5 ACCEPT this seat |
| **R-PAY-F-ATT-LINE** | P1 | ATT / ba-data → **dev-be** | **OPEN CONDITION** | `att_timesheet_line` → hours var bag LIVE |
| **R-PAY-F-CB-BAG** | P1 | **dev-be** + **qa** later | **OPEN CONDITION** | PROCESS success with real C&B `base_salary` (no overrides) → payslip_lines UF |
| **R-PAY-FE-OPAQUE→EVAL** | P2 optional | **dev-fe** | **OPEN** | FE emit `gd1_eval_v1` (optional) |
| **R-PAY-F-STALE-DIST** | process P2 | `dev-be`/`devops` | **CONDITION OK** | Post-READY dist refresh SOP — retain |
| **R-PAY-FE-FORM** | — | — | **CLOSED** (QC-02) | Retained baseline |
| **`payroll_e2e_ready`** | honesty | `pm` | **LOCKED false** | Explicit **NO** promote |
| **J-HRM-07** formula/process UAT | L2.5 | `qa` later | **DEFERRED** | After ATT line + C&B bag + browser |
| **`C-SLICE-≠-MODULE`** | governance | `pm`/`qc` | **CONDITION** | Seat GWC ≠ module UAT / Phase1 |

**P0/P1 product residuals for this L1 evaluator honesty WI:** none blocking slice ACCEPT.

**CONDITION for GWC:** `C-SLICE-≠-MODULE` + R-PAY-F-ATT-LINE + R-PAY-F-CB-BAG OPEN — sufficient to deny `payroll_e2e_ready=true` and deny clean module / Phase1 GO; **not** product NO-GO for certified L1 honesty slice.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-eval-01.md` | exit **1** · **2/8** (portal_url · crud_or_matrix) | **PROCESS OBS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-eval-01.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| QA harness (prior) stamp `PAYFEQ1-MSIHM5A1` | **PASS** · `failed_acs=[]` | PRODUCT OK (cited) |
| Spec spot-check §4.4 / §5 / §7 | codes aligned | TRACE OK |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON audit.

---

## completion_report

### Closed

1. QC L1 evaluator honesty gate — **GO WITH CONDITIONS**.  
2. Audited QA-EVAL MD + FINAL JSON stamp `PAYFEQ1-MSIHM5A1` + BE-EVAL + QC-01/QC-02 baselines — AC1–5 **ACCEPT**.  
3. **R-PAY-F-EVAL (L1 honesty) CLOSED**.  
4. Honesty locks held: `payroll_e2e_ready=false` · formula LIVE **DENIED** · Phase1 **NOT** claimed · module UAT **DENIED**.  
5. QA pack PROCESS OBS consolidated into this QC pack **8/8**.  
6. Explicit **NO** to PM promote ready flag · **C-SLICE-≠-MODULE**.

### Residual (open for next dispatch)

- **R-PAY-F-ATT-LINE** → ba-data / **dev-be** (`att_timesheet_line` hours bag)  
- **R-PAY-F-CB-BAG** → **dev-be** (real C&B process → payslip_lines) then **qa**  
- Optional: **R-PAY-FE-OPAQUE→EVAL** → **dev-fe** emit `gd1_eval_v1`  
- Module / J-HRM-07 formula process UAT → **qa** only after ATT+CB  

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** → dispatch **dev-be** ATT line and/or C&B bag (preferred) **or** **dev-fe** `gd1_eval_v1` emit |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-eval-01.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | After GWC → **dev-be** R-PAY-F-ATT-LINE / R-PAY-F-CB-BAG — **cấm** flip `payroll_e2e_ready` / claim formula LIVE / Phase1 DONE / module UAT |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-01
from_role: pm
to_role: ba-data
lane: governance → then execution
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-EVAL-01 GO WITH CONDITIONS (L1 evaluator honesty · R-PAY-F-EVAL L1 CLOSED)
priority: P0

## Mission
Unlock hours var bag LIVE: ADD-plan / confirm `att_timesheet_line` (or equivalent closed-sheet line SoT) so PREVIEW/PROCESS can bind payable_hours without PREVIEW-STUB. Keep payroll_e2e_ready=false until UF-proven. Do not invent LIVE formula claim.

entry_criteria:
- QC-EVAL GWC · evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-eval-01.md
- Residual R-PAY-F-ATT-LINE OPEN · API_DESIGN §4.4 hours fidelity BLOCKED until ATT line
- U65 zero-seed

exit_criteria:
- DATA delta + handoff ready for dev-be wire
- evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-data-att-line-01.md (or BA path)
- honesty: payroll_e2e_ready=false

cấm: flip payroll_e2e_ready · claim formula LIVE · seed
```

**Parallel preferred execution (if DATA already sufficient for soft C&B path):**

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-CB-BAG-01
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-EVAL-01 GWC (L1 honesty CLOSED; R-PAY-F-CB-BAG OPEN)
priority: P0

## Mission
PROCESS success path with real CORE C&B `base_salary` bag (no admin variableOverrides) → write payroll_payslip_lines on evaluate ok; keep FORMULA-412-VARS honest when bag incomplete. Retain ATT-412 / FORMULA-412. payroll_e2e_ready=false until browser UF.

entry_criteria:
- QC-EVAL GWC · docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-eval-01.md
- BE-EVAL + QA-EVAL stamps retained · API §5 PROCESS bind
- U65 zero-seed · post-READY dist refresh SOP (R-PAY-F-STALE-DIST)

exit_criteria:
- PROCESS with published gd1_eval_v1 + C&B bag → 2xx lines OR honest VARS with clear residual
- jest regression · CODE-MEMORY · READY_FOR_QA
- evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-cb-bag-01.md
- honesty: payroll_e2e_ready=false · cấm formula LIVE / Phase1 / module UAT

cấm: silent 0₫ process · salary_components.formula as engine · seed · flip payroll_e2e_ready
```

**Optional FE:**

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-GD1-EVAL-01
from_role: pm
to_role: dev-fe
lane: execution
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-EVAL-01 GWC
Mission: Optional — FE emit expression_json form=gd1_eval_v1 (documented subset) instead of opaque-only; preview panel shows staged compute ready=false; U65; payroll_e2e_ready=false. evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-fe-gd1-eval-01.md
```
