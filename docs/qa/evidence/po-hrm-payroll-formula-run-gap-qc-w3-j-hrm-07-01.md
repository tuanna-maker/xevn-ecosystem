# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-W3-J-HRM-07-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-W3-J-HRM-07-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **W3 J-HRM-07 browser slice** (TDZ clear + load + Lập bảng + Jan locked payslip UI) — **not** formula LIVE · **not** full enroll→process DoD · **not** module UAT |
| **priority** | P0 |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-J-HRM-07-01` R2 `PASS_TO_PM` (stamp **`PAYW3J07-R2-MSIRLK3I`**) · R1 `FAIL_TO_PM` retained |
| **closes** | **R-PAY-BATCHES-SHOWADD-TDZ** (P0 FE — R2 verified CLOSED) |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` · persona `ceo@xe.vn` · `company_id=main` |
| **journey_l25** | **J-HRM-07** — **PARTIAL ACCEPT** this seat (load + locked Jan detail) · **DENY** full process DONE |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01.md`](po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01.md) stamp **`PAYW3J07-R2-MSIRLK3I`** |
| **fe_ref** | [`po-hrm-payroll-formula-run-gap-w3-fe-showadd-tdz-01.md`](po-hrm-payroll-formula-run-gap-w3-fe-showadd-tdz-01.md) `READY_FOR_QA` |
| **machine** | [`_tmp-po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01-r2-browser.json`](_tmp-po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01-r2-browser.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01-r2/` (`01-pay-list` … `15-sep-after-process`) |
| **U65** | zero-seed · browser-only · QC observe · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `payroll_e2e_ready=false` locked |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **Formula LIVE / customer UAT** | **DENIED** | Jan amounts **0 ₫** · no LIVE claim |
| **Full J-HRM-07 process DONE** | **DENIED** | enroll→process→F5 **not proven** this stamp |
| **Module payroll UAT** | **DENIED** | Seat GWC ≠ module GO |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | zero-seed retained |
| **ATT / CB-BAG / FE-EVAL / EVAL / PAYSLIP-GET / PAY-TPL** | **RETAINED CLOSED** | Prior L1/Settings GWC — **do not reopen** |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT W3 browser **slice** after FE-SHOWADD-TDZ + QA R2 U65 against J-HRM-07 load path. Audited QA MD (R1 FAIL history + R2 PASS_TO_PM) + machine stamp `PAYW3J07-R2-MSIRLK3I` (`tdz_cleared=PASS` · `payroll_load=PASS` · `lap_bang_reachable=PASS` · `payslip_ui_jan=PASS` · `enroll_jan=BLOCKED_PERIOD_CLOSED` · `honesty.payroll_e2e_ready=false` · `pageErrors=[]` · `tdzErrors=[]`) + screens + FE READY_FOR_QA. Proven: calc-list `pay-batches-precision` · Lập bảng dialog · Jan ATT closed + elig 53 · locked Jan batch detail with component cols (0 ₫ honesty). **R-PAY-BATCHES-SHOWADD-TDZ = CLOSED**.

**CONDITIONS retained / waived as open residuals (not product demote of TDZ seat):**

| ID | Sev | QC disposition |
|----|-----|----------------|
| **R-PAY-W3-PROCESS-POST-UNPROVEN** | P1 | **CONDITION / WAIVE for this seat** — Sep Khóa UI reached (`14-sep-lock-confirm.png`) · **no** POST `/process` 2xx in machine network · **owner qa** retest capture |
| **R-PAY-JAN-PERIOD-ALREADY-CLOSED** | P2 | **CONDITION / WAIVE** — Jan `dffbb1fe` already closed · enroll/process mutate N/A without reopen/new draft · **owner qa/pm** |
| **`C-SLICE-≠-MODULE`** | governance | **CONDITION** — seat ≠ module UAT / Phase1 / ready |

**DENIED:** formula LIVE · `payroll_e2e_ready=true` · module payroll UAT · full J-HRM-07 process DONE · Phase 1 DONE. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| AC-W3-TDZ (R2 primary) | `tdzErrors=[]` · no showAddDialog ReferenceError | 🟢 **ACCEPT · residual CLOSED** |
| P-CC-08 / payroll_load | `pay-batches-precision` · `01-pay-list.png` | 🟢 **ACCEPT** |
| Lập bảng lương reachable | dialog + `HRM-PAY-TPL-200` · `02-create-dialog.png` | 🟢 **ACCEPT** |
| AC-W3-01 ATT Jan closed | closedJanCount=1 · elig=53 | 🟢 **ACCEPT** |
| AC-W3-05 Payslip/lines UI Jan locked | detail + component cols · 0 ₫ · API processed=1 | 🟢 **ACCEPT (slice)** · LIVE DENIED |
| AC-W3-03 Enroll Jan | BLOCKED period closed | 🟡 **CONDITION** `R-PAY-JAN-PERIOD-ALREADY-CLOSED` |
| AC-W3-04 Process POST 2xx | not in network · Sep confirm only | 🟡 **CONDITION** `R-PAY-W3-PROCESS-POST-UNPROVEN` |
| AC-W3-06 F5 | NOT RUN | 🟡 **CONDITION** (tied to process unproven) |
| Honesty `payroll_e2e_ready=false` | MD + machine | 🟢 **DENIED promote** |
| QA pack verify | **2/8** missing command_table + portal_url | 🟡 **PROCESS OBS** — QC consolidates **8/8** below |
| Prior L1 / Settings GWC | ATT/CB/EVAL/FE-EVAL/PAYSLIP/TPL | 🟢 **RETAIN CLOSED · do not reopen** |
| Formula LIVE / module UAT / full J-HRM-07 process | Explicit | 🟢 **DENIED** |

**Cấm:** invent formula LIVE · `payroll_e2e_ready=true` · Phase1 DONE · claim full J-HRM-07 process DONE · claim module payroll UAT · reopen L1 seats · seed.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · process POST unproven · Jan mutate blocked · 0 ₫ amounts |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim R-PAY-BATCHES-SHOWADD-TDZ closed? | **YES** — R2 ACCEPT |
| May PM claim formula LIVE / module UAT / Phase1 / full J-HRM-07 process DONE? | **NO** |
| May PM reopen ATT / CB-BAG / FE-EVAL / EVAL / PAYSLIP-GET / PAY-TPL? | **NO** |
| Forced residual dispatch this turn? | **OPTIONAL** — P1 `R-PAY-W3-PROCESS-POST-UNPROVEN` → **qa** when program continues W3 mutate; P2 Jan closed is env data (not FE reopen) |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| R1 QA W3 | same QA MD · FAIL TDZ | `FAIL_TO_PM` | 🟢 history retained — P0 root valid |
| FE-SHOWADD-TDZ | `…-w3-fe-showadd-tdz-01.md` | `READY_FOR_QA` | 🟢 state reorder ACCEPT |
| QA R2 W3 | `…-w3-qa-j-hrm-07-01.md` | `PASS_TO_PM` | 🟢 stamp `PAYW3J07-R2-MSIRLK3I` |
| Machine R2 | `_tmp-…-r2-browser.json` | PASS_TO_PM | 🟢 criteria align MD |
| Screens R2 | `screens/…-r2/` 9 PNGs | present | 🟢 |
| Pack verify QA | `verify:qc:evidence-pack` | exit **1** · **2/8** | 🟡 **PROCESS OBS** — QC consolidates |
| L0 / FE-BE | QA L0 200 · fe-be-health PASS | PASS | 🟢 ENV OK |
| Prior L1 GWC baselines | ATT-LINE-03 · CB-BAG · PAYSLIP-GET · PAY-TPL-02 · FE-EVAL · EVAL | GWC | 🟢 **RETAIN** |

### Machine JSON spot

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `PAYW3J07-R2-MSIRLK3I` | 🟢 |
| `honesty.payroll_e2e_ready` / seed / formula_LIVE | **false** / **false** / **false** | 🟢 |
| `criteria.tdz_cleared` / `payroll_load` / `lap_bang_reachable` | **PASS** | 🟢 |
| `criteria.enroll_jan` | **BLOCKED_PERIOD_CLOSED** | 🟡 CONDITION |
| `criteria.payslip_ui_jan` | **PASS** | 🟢 |
| `pay.janPeriodStatus` | `closed` · addEmpVisible=false | 🟢 correct UX |
| `payslip.janBatchLines` | visible · rowCount=1 · **0 ₫** · component cols | 🟢 honesty |
| `network` payroll | **GET only** — no POST enroll/process | 🟡 process unproven |
| `pageErrors` / `tdzErrors` / `consoleErrors` | `[]` | 🟢 |
| `verdict` / `ack_status` | `PASS_TO_PM` | 🟢 |

### Command table (QC consolidated — L0 observe)

| Command / check | Result | Exit / note |
|-----------------|--------|-------------|
| QA `qc:dev-stack` (cited) | hrm/xbos/portal **200** | PASS |
| QA `qc:fe-be-health` (cited) | ALL PASS | PASS |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01.md` | **2/8** FAIL process | exit **1** — OBS; QC pack fills portal_url + command_table + matrix |
| Browser U65 harness R2 | stamp `PAYW3J07-R2-MSIRLK3I` | PASS slice (see AC) |
| Seed | none | U65 |

### Evidence pack integrity (QC 8/8 consolidation)

| Check | Status |
|-------|--------|
| work_item_id | ✅ |
| portal_url | ✅ this QC MD |
| command_table | ✅ this QC MD |
| journey / J-* | ✅ J-HRM-07 PARTIAL |
| crud_or_matrix / AC table | ✅ below |
| honesty / Classification | ✅ |
| residual table | ✅ |
| screens / machine path | ✅ |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA R2 | QC |
|-----------------|-------|-------|-----|
| **W3 TDZ / calc-list load** (in-scope) | R1 FAIL | 🟢 PASS | 🟢 **PASS / ACCEPT** |
| **Lập bảng dialog** | blocked R1 | 🟢 PASS | 🟢 **PASS / ACCEPT** |
| **Jan locked payslip/lines UI** | NOT RUN R1 | 🟢 PASS (0 ₫) | 🟢 **PASS slice** · LIVE DENIED |
| **Jan enroll→process→F5** | blocked | BLOCKED closed | 🟡 **CONDITION** `R-PAY-JAN-PERIOD-ALREADY-CLOSED` |
| **Sep/process POST 2xx** | — | NOT PROVEN | 🟡 **CONDITION** `R-PAY-W3-PROCESS-POST-UNPROVEN` |
| **J-HRM-07 full process DONE** | Historical map ✅ older H1–H7 | **not** this formula-gap W3 DoD | ⬜ **DENIED claim** this program seat |
| **L1 ATT / CB / EVAL / FE-EVAL / PAYSLIP-GET / TPL** | prior GWC | not re-run | 🟢 **RETAIN ACCEPT** |

**U19 note:** This gate certifies the **W3 TDZ + load + Jan locked detail** named in PM exit — **not** a claim that **full J-HRM-07 process UAT** / formula LIVE / module payroll UAT is newly GO. Missing mutate POST does **not** NO-GO the TDZ seat; it **forces GWC CONDITIONS** and keeps `payroll_e2e_ready=false`.

### CRUD / mutate matrix (browser W3)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| Load Tính lương / Danh sách | Read | **PASS** |
| Open Lập bảng dialog | Create UI | **PASS** (dialog; create not required Jan overlap) |
| Open Jan locked period detail | Read | **PASS** |
| Enroll NV Jan | Create | **BLOCKED** (closed) — CONDITION |
| Process / Khóa POST | Update | **NOT PROVEN** — CONDITION |
| Payslip component cols UI | Read | **PASS** (0 ₫ honesty) |
| F5 after mutate | Read | **NOT RUN** |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| QA pack **2/8** | **PROCESS OBS** | Missing `command_table` + `portal_url` on QA MD — **not** product demote; QC consolidates |
| TDZ / load / Lập bảng / Jan UI | **PRODUCT OK** | Slice ACCEPT · TDZ CLOSED |
| Jan period already closed | **SCOPE / DATA CONDITION** | Correct product UX (add-emp hidden) — waive mutate N/A |
| Process POST unproven | **PRODUCT GAP (bounded)** | CONDITION P1 — not TDZ FAIL; next QA wave |
| Portal flap mid-wave (QA note) | **ENV OBS** | Recovered · not demote slice |
| 0 ₫ payslip amounts | **HONESTY OK** | Forces DENY formula LIVE |
| Module / Phase1 / ready / full process | **SCOPE CONDITION** | `C-SLICE-≠-MODULE` |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-PAY-BATCHES-SHOWADD-TDZ** | was P0 | `dev-fe` | **CLOSED** | R2 browser ACCEPT |
| **R-PAY-W3-PROCESS-POST-UNPROVEN** | P1 | `qa` | **CONDITION / WAIVED for TDZ seat** | Retest: draft period + ATT closed → enroll → POST `/process` 2xx → F5 |
| **R-PAY-JAN-PERIOD-ALREADY-CLOSED** | P2 | `qa`/`pm` | **CONDITION / WAIVED** | Use reopen or other month draft with ATT closed |
| **R-PAY-ATT-AUG-NO-CLOSE** | P2 | `qa`/`pm` | **RETAIN** | Aug still 0 closed — not this seat blocker |
| **R-PAY-PERIOD-ROW-NAV** | P1 | — | **SUPERSEDED** | Downstream of TDZ — R2 detail open PASS |
| Prior L1 residuals CLOSED | — | — | **RETAIN CLOSED** | Do not reopen |
| **`payroll_e2e_ready`** | honesty | `pm` | **LOCKED false** | Explicit **NO** promote |
| **`C-SLICE-≠-MODULE`** | governance | `pm`/`qc` | **CONDITION** | Seat GWC ≠ module UAT / Phase1 |

---

## GO WITH CONDITIONS — explicit list

1. **Scope of GO:** W3 FE TDZ clear + payroll calc-list load + Lập bảng dialog reachability + Jan locked batch payslip/lines UI visibility (honesty 0 ₫).
2. **J-* PASS this seat:** J-HRM-07 **PARTIAL** (load + locked detail) — **not** full process spine.
3. **J-* deferred / denied:** full enroll→process→F5 as module DoD; formula LIVE UAT.
4. **Conditions:** `R-PAY-W3-PROCESS-POST-UNPROVEN` (P1) · `R-PAY-JAN-PERIOD-ALREADY-CLOSED` (P2) · `C-SLICE-≠-MODULE`.
5. **NOT Phase 1 DONE** · **NOT** `payroll_e2e_ready=true` · **NOT** module payroll UAT · **NOT** formula LIVE.

---

## completion_report

- **Closed:** QC gate on QA R2 stamp `PAYW3J07-R2-MSIRLK3I` — **GWC**; **R-PAY-BATCHES-SHOWADD-TDZ CLOSED**; honesty `payroll_e2e_ready=false` retained; L1/Settings baselines not reopened; DENY LIVE / module UAT / full J-HRM-07 process DONE; pack PROCESS OBS consolidated.
- **Open / residual:** `R-PAY-W3-PROCESS-POST-UNPROVEN` (P1 qa) · `R-PAY-JAN-PERIOD-ALREADY-CLOSED` (P2) · `C-SLICE-≠-MODULE`.
- **Not claimed:** Phase1 DONE · formula LIVE · module UAT · ready=true.

## next_owner

**pm** — intake GWC; optional dispatch **qa** for process POST proof when continuing W3 mutate spine (no FE reopen for TDZ).

## next_dispatch_prompt

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-PROCESS-POST-01
from_role: pm
to_role: qa
lane: execution
priority: P1
parent: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-W3-J-HRM-07-01

read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-w3-j-hrm-07-01.md
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01.md (R2)

entry_criteria: QC GWC on W3 TDZ slice; residual R-PAY-W3-PROCESS-POST-UNPROVEN OPEN; U65 zero-seed; payroll_e2e_ready=false locked
exit_criteria:
- Pick draft period with ATT closed same month (not Jan dffbb1fe closed) OR reopen path per SRS
- Browser enroll → POST /process 2xx captured in Network + machine JSON
- Payslip/lines UI after process + F5 persist
- Honesty payroll_e2e_ready=false · DENY formula LIVE unless non-zero amounts + AC map
- ack_status: PASS_TO_PM or FAIL_TO_PM
- evidence_path: docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qa-process-post-01.md

cấm: seed · invent LIVE · reopen R-PAY-BATCHES-SHOWADD-TDZ without new crash
```

## ack_status

**`PASS_TO_PM`** — verdict **GO WITH CONDITIONS**
