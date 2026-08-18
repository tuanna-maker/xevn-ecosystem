# Evidence — `PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **narrow L1 API list-totals seat** (`R-PAY-PERIOD-LIST-TOTALS`) — **not** formula LIVE · **not** J-HRM-07 e2e · **not** module UAT |
| **priority** | P2 |
| **parent** | `PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-QA-01` |
| **program** | `PO-HRM-CONTINUOUS-W7-20260807` |
| **prior** | QA retest stamp **`PAYLISTTOTQA-MSIZ6H4F`** PASS · DevOps **`PAYLISTTOTDEVOPS-MSIZRBLD`** · prior FAIL `PAYLISTTOTQA-MSIYQJRA` (stale dist) |
| **closes** | **`R-PAY-PERIOD-LIST-TOTALS`** (API list totals on wire) · **`D-PAY-LIST-TOTALS-RUNTIME`** (CLOSED retained) |
| **portal_url** | `http://127.0.0.1:5173` · HRM API `:28001` · XBOS `:28002` (L1 API seat — read-only GET) |
| **api_base** | `http://127.0.0.1:28001/api/hrm` |
| **journey_l25** | GET `/payroll/periods` list totals vs payslip SUM — **slice only** · **DENY** full J-HRM-07 DoD |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-payroll-period-list-totals-qa-01.md`](po-hrm-payroll-period-list-totals-qa-01.md) stamp **`PAYLISTTOTQA-MSIZ6H4F`** |
| **devops_ref** | [`po-hrm-payroll-period-list-totals-devops-01.md`](po-hrm-payroll-period-list-totals-devops-01.md) stamp **`PAYLISTTOTDEVOPS-MSIZRBLD`** |
| **machine** | [`_tmp_pay_list_totals_qa01_retest.json`](_tmp_pay_list_totals_qa01_retest.json) |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · no PROCESS re-run |
| **OS honesty** | `C-SLICE-≠-MODULE` · `payroll_e2e_ready=false` locked · LIVE invent DENIED · J-HRM-07 e2e DENIED |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **LOCKED** — **PM must not set true** |
| **Formula LIVE / invent** | **DENIED** | Compared existing payslip SUM only |
| **J-HRM-07 e2e-ready / full DoD** | **DENIED** | List totals API slice only |
| **Module payroll UAT / Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Existing `cf38deac` / draft `4d2111d7` |
| **process-post / period-bind / summary-cards GWC** | **RETAINED CLOSED** | **must_keep · not reopened** |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT **R-PAY-PERIOD-LIST-TOTALS** (API list totals on wire) after DevOps rebuild + QA retest stamp `PAYLISTTOTQA-MSIZ6H4F`. Audited QA MD (prior FAIL + retest) + machine JSON + DevOps evidence + QC live spot-check. Proven on processed period **`cf38deac`**: list `total_gross`/`total_net`/`total_deduction` = **12345000** / **12345000** / **0** == payslip SUM; `payslip_summary` mirrors top-level; draft **`4d2111d7`** totals **0**. Prior defect class `runtime_stale_build` (**`D-PAY-LIST-TOTALS-RUNTIME`**) CLOSED by DevOps `PAYLISTTOTDEVOPS-MSIZRBLD`. Process-post / period-bind / summary-cards GWC **not reopened**. Honesty **LOCKED** `payroll_e2e_ready=false`.

**NOT Phase 1 DONE. NOT module payroll UAT. NOT formula LIVE. NOT J-HRM-07 e2e-ready / full DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Stamp `PAYLISTTOTQA-MSIZ6H4F` | QA retest MD + machine `stamp` · `overall=PASS` | 🟢 **ACCEPT** |
| DevOps `PAYLISTTOTDEVOPS-MSIZRBLD` | rebuild + single `:28001` · D-RUNTIME CLOSED | 🟢 **ACCEPT** |
| Prior FAIL stale dist | `PAYLISTTOTQA-MSIYQJRA` · fields absent | 🟢 **BASELINE retained** |
| AC-LIST-TOTALS-01 | `cf38deac` totals present | 🟢 **ACCEPT** |
| AC-LIST-SUMMARY-01 | `payslip_summary` mirrors top-level | 🟢 **ACCEPT** |
| AC-LIST-MATCH-SUM-01 | list **12345000** = payslip SUM **12345000** | 🟢 **ACCEPT** |
| AC-DRAFT-ZERO-01 | draft `4d2111d7` all zeros | 🟢 **ACCEPT** |
| QC live spot-check | GET periods + payslips 2026-08-07 · match true | 🟢 **CONFIRM** |
| L0 stack | HRM+XBOS+portal **200** (UV exit noise ENV OBS) | 🟢 **ENV OK** |
| QA pack verify | exit **1** · **1/8** (missing `portal_url` on L1 QA MD) | 🟡 **PROCESS OBS** — QC consolidates |
| process-post / period-bind / summary-cards | must_keep | 🟢 **NOT REOPENED** |
| FE list column bind | out-of-slice | 🟡 **OBS idle-ok** |
| Module / Phase1 / LIVE / J-HRM-07 e2e | Explicit DENIED | 🟢 |
| `C-SLICE-≠-MODULE` | governance | 🟡 **CONDITION** |

**Cấm:** flip `payroll_e2e_ready` · claim J-HRM-07 full DONE/e2e-ready · claim module UAT · reopen process-post / period-bind / summary-cards GWC · seed · invent formula LIVE.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| May PM claim formula LIVE / customer UAT? | **NO** |
| May PM claim J-HRM-07 e2e-ready / full DONE? | **NO** — list totals API slice only |
| May PM claim module payroll UAT / Phase1 DONE? | **NO** |
| May PM claim `R-PAY-PERIOD-LIST-TOTALS` closed? | **YES** — this seat (API wire) |
| May PM claim `D-PAY-LIST-TOTALS-RUNTIME` closed? | **YES** — DevOps + QA retest retained |
| May PM reopen process-post / period-bind / summary-cards GWC? | **NO** |
| Forced residual Task this turn? | **NO** — FE list-column OBS idle-ok |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QA-01 prior FAIL | `…-qa-01.md` stamp `PAYLISTTOTQA-MSIYQJRA` | FAIL_TO_PM | **BASELINE** — stale dist · fields absent |
| DEVOPS-01 rebuild | `…-devops-01.md` stamp `PAYLISTTOTDEVOPS-MSIZRBLD` | READY_FOR_QA | **ACCEPT** · D-RUNTIME CLOSED |
| QA-01 retest | `…-qa-01.md` stamp `PAYLISTTOTQA-MSIZ6H4F` | PASS_TO_PM | **ACCEPT** AC 8/8 |
| Machine retest JSON | `_tmp_pay_list_totals_qa01_retest.json` | overall PASS | **ACCEPT** |
| Pack verify QA | `verify:qc:evidence-pack` | exit **1** · **1/8** | 🟡 **PROCESS OBS** |
| QC live spot-check | GET `:28001` periods + payslips | match 12345000 · draft zero | 🟢 **CONFIRM** |
| Pack verify QC | this file | consolidates portal_url + journey + CRUD | QC SoT |

### Machine JSON spot (`_tmp_pay_list_totals_qa01_retest.json`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `PAYLISTTOTQA-MSIZ6H4F` | 🟢 |
| `parent_devops_stamp` | `PAYLISTTOTDEVOPS-MSIZRBLD` | 🟢 |
| `prior_fail_stamp` | `PAYLISTTOTQA-MSIYQJRA` | 🟢 |
| `list_status` / `list_code` | **200** / `HRM-PAY-200` | 🟢 |
| `period_count` | **33** (processed 7 · draft 24) | 🟢 |
| `cf38deac.total_*` | gross/net **12345000** · ded **0** | 🟢 |
| `cf38deac.payslip_summary` | mirrors top-level | 🟢 |
| `payslip_sum_cf38deac` | count **1** · sumGross/Net **12345000** | 🟢 |
| `draft_sample` totals | all **0** + summary zeros | 🟢 |
| `ac.*` (8 keys) | all **true** | 🟢 |
| `match_expected_12345000` | **true** | 🟢 |
| `overall` | **PASS** | 🟢 |
| `closes` | `D-PAY-LIST-TOTALS-RUNTIME` · `R-PAY-PERIOD-LIST-TOTALS` | 🟢 |

### QC live spot-check (2026-08-07)

| Check | Observed | QC |
|-------|----------|-----|
| Login `ceo@xe.vn` | `XBOS-AUTH-200` | 🟢 |
| `GET /payroll/periods?company_id=main` | `HRM-PAY-200` · **33** rows | 🟢 |
| `cf38deac` totals | 12345000 / 12345000 / 0 + summary | 🟢 |
| Payslip SUM same period | **1** slip · sum **12345000** | 🟢 |
| `match_12345000` | **true** | 🟢 |
| Draft `4d2111d7` zeros | **true** | 🟢 |
| Seed / PROCESS / formula invent | none | 🟢 **DENIED paths held** |

---

## Gate AC audit (list totals L1)

| # | AC | Observed | QC |
|---|----|----------|-----|
| 1 | AC-LIST-TOTALS-01 | Processed list has `total_*` | 🟢 |
| 2 | AC-LIST-SUMMARY-01 | `payslip_summary` equals top-level | 🟢 |
| 3 | AC-LIST-MATCH-SUM-01 | List = payslip SUM **12345000** | 🟢 |
| 4 | AC-DRAFT-ZERO-01 | Draft totals **0** | 🟢 |
| 5 | AC-SCOPE-MAIN-01 | `company_id=main` **200** | 🟢 |
| 6 | AC-HONESTY-01 | ready=false | 🟢 **LOCKED** |
| 7 | AC-NO-SEED-01 | U65 | 🟢 |
| 8 | AC-MUST-KEEP-01 | sealed GWC not reopened | 🟢 |

### L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA retest | QC |
|-----------------|-------|-----------|-----|
| **R-PAY-PERIOD-LIST-TOTALS** (GET list totals) | summary-cards OBS · QA FAIL stale dist | 🟢 stamp PASS | 🟢 **PASS / ACCEPT** (API wire) |
| **J-HRM-07 process-post spine** | QC GWC must_keep | not re-run | 🟢 **RETAIN · not reopened** |
| **J-HRM-07 period-bind** | QC GWC must_keep | not re-run | 🟢 **RETAIN · not reopened** |
| **J-HRM-07 summary-cards** | QC GWC CLOSED | not re-run | 🟢 **RETAIN · not reopened** |
| **J-HRM-07 e2e-ready / full DoD** | DENIED | Explicit non-claim | ⬜ **DENIED** — `C-SLICE-≠-MODULE` |
| Formula LIVE / module UAT / Phase1 | DENIED | Explicit non-claim | ⬜ **DENIED** |

**U19 note:** Certifies **display-ready list totals on GET `/payroll/periods`** after runtime rebuild — **does not** flip J-HRM-07 into e2e-ready or formula LIVE.

### CRUD / mutate matrix (L1 U65 — read-only)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| GET `/payroll/periods` list totals | Read | **PASS** |
| GET `/payroll/payslips?period_id=cf38deac` SUM | Read | **PASS** |
| Draft empty totals | Read | **PASS** |
| PROCESS / formula invent / seed | Mutate | **N/A — DENIED** |
| Hard-delete | Delete | **N/A — DENIED** |

### command_table (QC consolidated)

| # | Command / probe | Result | Class |
|---|-----------------|--------|-------|
| 1 | `pnpm run qc:dev-stack` | HRM+XBOS+portal **200** (UV exit noise) | ENV OK |
| 2 | Login XBOS `ceo@xe.vn` | `XBOS-AUTH-200` | PRODUCT OK |
| 3 | `GET /api/hrm/payroll/periods?company_id=main` | **200** `HRM-PAY-200` · totals present | PRODUCT OK |
| 4 | Assert `cf38deac` totals vs payslip SUM | **12345000** match | PRODUCT OK |
| 5 | Assert draft `4d2111d7` zeros | totals **0** | PRODUCT OK |
| 6 | Honesty / no seed / must_keep | held | PROCESS OK |
| 7 | `verify:qc:evidence-pack` on QA MD | **1/8** portal_url | PROCESS OBS |
| 8 | QC pack this file | consolidates portal_url + journey + CRUD | PROCESS OK |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| List totals == payslip SUM **12345000** | **PRODUCT OK** | Closes R-PAY-PERIOD-LIST-TOTALS (API) |
| Prior stale dist FAIL → rebuild → retest PASS | **PRODUCT OK** (runtime) | D-PAY-LIST-TOTALS-RUNTIME CLOSED |
| QA pack verify **1/8** missing `portal_url` | **PROCESS OBS** | L1 API QA MD — **not** product demote; QC consolidates |
| Windows `UV_HANDLE_CLOSING` on `qc:dev-stack` | **ENV OBS** | Services still HTTP 200 — not product NO-GO |
| FE list column bind optional | **SCOPE / OBS** | Idle-ok · not this seat |
| Missing J-HRM-07 / module UAT / ready flip | **SCOPE / CONDITION** | Blocks ready=true · **not** list-totals product NO-GO |
| process-post / period-bind / summary-cards | **must_keep** | Not reopened |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **`R-PAY-PERIOD-LIST-TOTALS`** | P3→closed | `qc` | **CLOSED** | API list totals on wire ACCEPT this seat |
| **`D-PAY-LIST-TOTALS-RUNTIME`** | P0 | `devops` | **CLOSED** | Rebuild stamp retained |
| **`C-SLICE-≠-MODULE`** | honesty | `pm` | **CONDITION** | List-totals GWC ≠ module UAT / Phase1 / J-HRM-07 e2e |
| **`payroll_e2e_ready`** | honesty | `pm` | **LOCKED false** | DENY flip |
| Optional FE list column bind | P3 OBS | `dev-fe` | **OBS idle-ok** | Not opened · no forced Task |
| process-post / period-bind / summary-cards GWC | — | — | **RETAIN must_keep** | Do not reopen |

---

## completion_report

### Closed

- QC audited QA retest `PAYLISTTOTQA-MSIZ6H4F` + machine JSON + DevOps `PAYLISTTOTDEVOPS-MSIZRBLD`.
- Live spot-check confirms `cf38deac` list totals == payslip SUM **12345000**; draft zeros.
- **GO WITH CONDITIONS** for **R-PAY-PERIOD-LIST-TOTALS** (API wire) only.
- **D-PAY-LIST-TOTALS-RUNTIME** CLOSED retained.
- Honesty locks held; must_keep sealed GWC not reopened.
- QA pack 1/8 PROCESS OBS consolidated in this QC file.

### Residual / not closed

- `C-SLICE-≠-MODULE` CONDITION — list totals ≠ module / J-HRM-07 e2e / Phase1.
- Optional FE list-column bind OBS idle-ok — no forced dispatch.
- **DENY** `payroll_e2e_ready=true`.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CONTINUOUS-W7-IDLE-OK-01
from_role: pm
to_role: pm
lane: governance
priority: P3
parent: PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-QC-01
program: PO-HRM-CONTINUOUS-W7-20260807

entry_criteria:
- QC GWC PASS_TO_PM: docs/qa/evidence/po-hrm-payroll-period-list-totals-qc-01.md
- Verdict GO WITH CONDITIONS — R-PAY-PERIOD-LIST-TOTALS CLOSED (API wire)
- D-PAY-LIST-TOTALS-RUNTIME CLOSED · stamp chain PAYLISTTOTDEVOPS-MSIZRBLD → PAYLISTTOTQA-MSIZ6H4F
- Honesty: payroll_e2e_ready=false LOCKED · DENY J-HRM-07 e2e / module UAT / Phase1
- must_keep: process-post / period-bind / summary-cards GWC — do NOT reopen

Mission:
1. Record bus INTAKE QC GWC; mark R-PAY-PERIOD-LIST-TOTALS CLOSED on wire
2. Do NOT flip payroll_e2e_ready; do NOT claim J-HRM-07 DONE / module UAT
3. FE list-column bind remains OBS idle-ok — no forced Task unless product sponsor asks
4. Continue W7 backlog scan / next P0–P2 seat per PM_OPEN_BACKLOG (not this residual)

exit_criteria: bus updated; ready flag still false; next program seat dispatched or idle-ok recorded
ack_status: PASS_TO_PM (orchestration)
```

## ack_status

**PASS_TO_PM**
