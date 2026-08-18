# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **browser U65 GĐ1 formula form slice gate** (not formula LIVE · not module UAT) |
| **priority** | P0 |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-03` PASS_TO_PM (browser U65) |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` |
| **journey_l25** | GĐ1 formula author UF (Payroll → Công thức lương) — **not** full J-HRM-07 process UAT |
| **Verdict** | **GO WITH CONDITIONS** — browser GĐ1 form UF ACCEPT · **R-PAY-FE-FORM CLOSED** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-payroll-formula-run-gap-qa-03.md`](po-hrm-payroll-formula-run-gap-qa-03.md) stamp **`PAYFQ3-MSIGUR4C`** |
| **fe_ref** | [`po-hrm-payroll-formula-run-gap-fe-01.md`](po-hrm-payroll-formula-run-gap-fe-01.md) READY_FOR_QA |
| **l1_baseline** | [`po-hrm-payroll-formula-run-gap-qc-01.md`](po-hrm-payroll-formula-run-gap-qc-01.md) GWC L1 — **RETAINED** |
| **machine** | [`_tmp-po-hrm-payroll-formula-run-gap-qa-03.FINAL.json`](_tmp-po-hrm-payroll-formula-run-gap-qa-03.FINAL.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-payroll-formula-run-gap-qa-03/` (01–07) |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — browser form GWC ≠ formula LIVE / payroll module UAT / Phase1 DONE |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **Formula LIVE / evaluator** | **DENIED** | Preview honest **`HRM-PAY-FORMULA-412-PREVIEW-STUB`** (screen 07) |
| **J-HRM-07 process UAT** | **DENIED** this seat | Historical shell PASS ≠ formula author + process lines |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Browser form only · `seed_used=false` in machine |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT browser U65 GĐ1 formula author form UF (draft POST **201** → FE row → F5 → submit-publish **pending_publish** → self-publish **403-DUAL** toast → preview **412-PREVIEW-STUB** panel). Audited QA-03 MD + FINAL JSON stamp `PAYFQ3-MSIGUR4C` + FE-01 + screens 01–07 + pack verify **8/8**. **R-PAY-FE-FORM = CLOSED** (supersedes QC-01 OPEN CONDITION for FE form). L1 QC-01 CRUD/dual-control baseline **RETAINED**. Residual **R-PAY-F-EVAL** + process lines remain **OPEN** → next PM dispatch evaluator BE (preferred) or peer TPL FE residual. **DENIED** formula LIVE · `payroll_e2e_ready=true` · Phase1 DONE · module payroll UAT.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| AC1 Tab + honesty badge | QA-03 · JSON · screen 01 | 🟢 **ACCEPT** |
| AC2 Draft save → FE row | POST **201** `HRM-PAY-FORMULA-201` · label+code | 🟢 **ACCEPT** |
| AC3 F5 persist | Same row after reload | 🟢 **ACCEPT** |
| AC4 Submit-publish | **201** · `pending_publish` · UI chờ phát hành | 🟢 **ACCEPT** |
| AC5 Self-publish 403-DUAL | **403** + toast «Bị chặn dual-control…» · screen 06 | 🟢 **ACCEPT** |
| AC6 Preview 412 stub | **412** + panel stub · `payroll_e2e_ready=false` · screen 07 | 🟢 **ACCEPT** (honest staging) |
| AC7 No DnD · HDSD | `dndSurface=0` · missing=[] | 🟢 **ACCEPT** |
| Pack verify QA-03 | **8/8** exit 0 | 🟢 **PROCESS OK** |
| R-PAY-FE-FORM | QA-03 CLOSE + QC confirm | 🟢 **CLOSED** |
| R-PAY-F-EVAL / process lines | staged | 🟡 **CONDITION OPEN** |
| Module UAT / Phase1 / ready | Explicit DENIED | 🟢 |

**Cấm:** invent formula LIVE · `payroll_e2e_ready=true` · Phase1 DONE · claim J-HRM-07 formula process UAT · reopen R-PAY-FE-FORM without regression · seed.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · evaluator not LIVE · preview stub only · process lines / J-HRM-07 formula UAT not proven |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim R-PAY-FE-FORM closed? | **YES** — this seat ACCEPT |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QC-01 L1 GWC | `po-hrm-payroll-formula-run-gap-qc-01.md` | PASS_TO_PM | **RETAIN** — L1 CRUD/dual ACCEPT |
| FE-01 GĐ1 form | `po-hrm-payroll-formula-run-gap-fe-01.md` | READY_FOR_QA | **ACCEPT** prior |
| QA-03 browser U65 | `po-hrm-payroll-formula-run-gap-qa-03.md` | PASS_TO_PM | **ACCEPT** stamp `PAYFQ3-MSIGUR4C` |
| Machine QA-03 | `_tmp-po-hrm-payroll-formula-run-gap-qa-03.FINAL.json` | PASS | **ACCEPT** |
| Screens 01–07 | `screens/po-hrm-payroll-formula-run-gap-qa-03/` | present | **ACCEPT** spot-check 01/06/07 |
| Pack verify QA-03 | `verify:qc:evidence-pack` | exit **0** · **8/8** | 🟢 |

### Machine JSON spot

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `PAYFQ3-MSIGUR4C` | 🟢 |
| `honesty.payroll_e2e_ready` / `formula_live_claimed` / `seed_used` | all **false** | 🟢 |
| `ac.AC1`..`AC7` | all **PASS** | 🟢 |
| AC2 POST | **201** `HRM-PAY-FORMULA-201` · id `51511dd9-…` | 🟢 |
| AC5 publish | **403** `HRM-PAY-FORMULA-403-DUAL` · `dualToast=true` | 🟢 |
| AC6 preview | **412** `HRM-PAY-FORMULA-412-PREVIEW-STUB` · stub copy in FE | 🟢 |
| `process.pageErrors` / `dndStorm` / `uncaught` | **0** | 🟢 |
| `consoleErrors` 403/412 | Chromium native resource | 🟢 **PRODUCT OK** (expected deny/stub) |
| `overall` | **PASS** | 🟢 |
| `ac.AC6.noFakeLive` | `false` with PASS | 🟡 **PROCESS OBS** — inverted/ambiguous harness flag; **previewText + screen 07** prove honest stub (not demote) |

---

## Gate AC audit (browser U65)

| # | Expected | Observed | QC |
|---|----------|----------|-----|
| 1 | Tab Công thức lương + badge | Panel + `payroll_e2e_ready=false · evaluator chưa LIVE` | 🟢 |
| 2 | Save draft → Network 2xx → FE row | **201** · row label+code `…PAYFQ3-MSIGUR4C` | 🟢 |
| 3 | F5 → row còn | Persist after reload + re-open tab | 🟢 |
| 4 | Submit-publish | **201** · `pending_publish` | 🟢 |
| 5 | Self-publish honest 403-DUAL | Toast dual-control · **not** silent 2xx | 🟢 |
| 6 | Preview honest 412 stub | Panel + toast · **not** fake LIVE amounts | 🟢 |
| 7 | No DnD · HDSD inventory | `dndSurface=0` · required testids seen | 🟢 |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-03 | QC |
|-----------------|-------|-------|-----|
| **GĐ1 formula author UF** (in-scope this seat) | FE-01 READY | 🟢 AC1–7 PASS | 🟢 **PASS / ACCEPT** |
| **L1 F-PAY-FORMULA CRUD** | QC-01 GWC | not re-run (baseline) | 🟢 **RETAIN ACCEPT** |
| **J-HRM-07** Lương → phiếu lương | Historical ✅ PASS (W5B) | **not retested** · ≠ formula process | ⬜ **DEFERRED** — not claimed |
| Payroll process FORMULA-412 / payslip lines | staged | not claimed | ⬜ **DEFERRED** — R-PAY-F-EVAL |

**U19 note:** This gate certifies the **browser GĐ1 formula author UF** named in dispatch — **not** a claim that **J-HRM-07** process / evaluator / module payroll UAT is newly GO. Missing full process journey does **not** NO-GO this form seat; it **forces GWC CONDITION** (`C-SLICE-≠-MODULE` + R-PAY-F-EVAL) and keeps `payroll_e2e_ready=false`.

### CRUD / mutate matrix (browser UF)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| POST draft via FE Save | Create | **PASS** |
| List row after 2xx + F5 | Read | **PASS** |
| submit-publish via FE | Update (SM) | **PASS** |
| publish same actor | Update deny | **PASS** (403-DUAL toast) |
| preview stub | Read dry-run | **PASS** (412 honest) |
| Second-actor publish → active | Update (SM) | **N/A this seat** — L1 QA-02 already proved |
| Hard-delete | Delete | **N/A** |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| QA-03 pack **8/8** | **PROCESS OK** | Gate entry PASS |
| AC1–7 Network + FE-after-2xx + F5 | **PRODUCT OK** | Slice ACCEPT |
| Console 403/412 native | **PRODUCT OK** | Expected dual/stub; app toast/panel present |
| `noFakeLive:false` harness field | **PROCESS OBS** | Ambiguous boolean; visual + previewText override — **not** product demote |
| Evaluator / process lines / J-HRM-07 formula UAT | **SCOPE / CONDITION** | Blocks ready=true · **not** form-slice NO-GO |
| No P0/P1 product residual on GĐ1 form UF | **PRODUCT OK** | R-PAY-FE-FORM CLOSED |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-PAY-FE-FORM** | was P1 | `qa`/`qc` | **CLOSED** | Browser U65 AC1–7 ACCEPT this seat |
| **R-PAY-F-EVAL** | P1 staged | `dev-be` | **OPEN CONDITION** | Evaluator + real PREVIEW + PROCESS lines — **DENIED** LIVE claim |
| **R-PAY-F-STALE-DIST** | process P2 | `dev-be`/`devops` | **CONDITION OK** (QC-01) | Retain SOP |
| **R-PAY-TPL-FE** / peer AMIS TPL | peer | `dev-fe` / AMIS | **OUT OF SEAL** optional carry | Not blocking this form GWC |
| **`payroll_e2e_ready`** | honesty | `pm` | **LOCKED false** | Explicit **NO** promote |
| **J-HRM-07** formula/process UAT | L2.5 | `qa` later | **DEFERRED** | After evaluator + process lines |
| **`C-SLICE-≠-MODULE`** | governance | `pm`/`qc` | **CONDITION** | Seat GWC ≠ module UAT / Phase1 |

**P0/P1 product residuals for this browser form WI:** none blocking slice ACCEPT.

**CONDITION for GWC:** `C-SLICE-≠-MODULE` + R-PAY-F-EVAL OPEN — sufficient to deny `payroll_e2e_ready=true` and deny clean module / Phase1 GO; **not** product NO-GO for certified GĐ1 form UF.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-03.md` | exit **0** · **8/8** | **PROCESS OK** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-02.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| QA harness (prior) `node scripts/qa/_tmp-po-hrm-payroll-formula-run-gap-qa-03.mjs` | **PASS** · stamp `PAYFQ3-MSIGUR4C` | PRODUCT OK (cited) |
| Screen spot-check 01 / 06 / 07 | badge · 403 toast · 412 stub panel | PRODUCT OK |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + screen audit.

---

## completion_report

### Closed

1. QC browser slice gate on Payroll → **Công thức lương** GĐ1 form UF — **GO WITH CONDITIONS**.  
2. Audited QA-03 MD + FINAL JSON + FE-01 + QC-01 L1 baseline + screens — AC1–7 **ACCEPT**.  
3. **R-PAY-FE-FORM CLOSED**.  
4. Honesty locks held: `payroll_e2e_ready=false` · formula LIVE **DENIED** · Phase1 **NOT** claimed.  
5. Pack QA-03 **8/8**; this QC pack consolidates mandatory sections.  
6. Explicit **NO** to PM promote ready flag · **C-SLICE-≠-MODULE**.

### Residual (open for next dispatch)

- **R-PAY-F-EVAL** → **dev-be** evaluator + real PREVIEW + PROCESS lines (preferred next)  
- Optional peer: **R-PAY-TPL-FE** browser residual (AMIS pay-sheet template FE) if PM prioritizes TPL over eval  
- Module / J-HRM-07 formula process UAT → **qa** only after evaluator  

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** → dispatch **dev-be** evaluator (preferred) **or** **dev-fe** TPL browser residual |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-02.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | After GWC → **dev-be** R-PAY-F-EVAL — **cấm** flip `payroll_e2e_ready` / claim formula LIVE / Phase1 DONE |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-EVAL-01
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-02 GO WITH CONDITIONS (browser GĐ1 form · R-PAY-FE-FORM CLOSED)
priority: P0

## Mission
Ship staged evaluator + deepen PREVIEW beyond 412-PREVIEW-STUB only when att_timesheet_line / closed-sheet variable bag is ready; bind PROCESS payslip component lines to published formula version. Keep honest FORMULA-412 / ATT-412 until fidelity ready. payroll_e2e_ready=false until UF-proven.

entry_criteria:
- QC-02 GWC · evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-02.md
- QC-01 L1 GWC retained · BE-01 formulas CRUD READY
- API_DESIGN §4 PREVIEW / PROCESS · R-PAY-F-EVAL OPEN
- U65 zero-seed · no invent LIVE amounts without closed timesheet vars

exit_criteria:
- Evaluator path + tests; PREVIEW returns real compute OR remains honest stub with clear codes
- PROCESS line binding to active formula version documented + tested
- CODE-MEMORY + regression jest
- READY_FOR_QA · evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-eval-01.md
- honesty: payroll_e2e_ready=false · cấm claim formula LIVE / Phase1 DONE / module UAT

cấm: silent fake LIVE preview · salary_components.formula as engine · seed · flip payroll_e2e_ready

read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-02.md
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-01.md
- docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md §4 · §7
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-01.md
```

**Alternate (if PM prioritizes TPL FE browser residual before evaluator):**

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-TPL-FE-01
from_role: pm
to_role: dev-fe
lane: execution
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-02 GWC (formula form CLOSED; peer TPL residual)
Mission: Browser GĐ1 pay-sheet-templates FE (mẫu ≠ salary-templates pack) — list/upsert/lines/archive bind to Nest /pay-sheet-templates*; U65 zero-seed; payroll_e2e_ready=false. evidence: docs/qa/evidence/po-hrm-amis-parity-pay-tpl-fe-01.md
```
