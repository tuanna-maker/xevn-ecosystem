# QC Gate — PO-E2E-SPINE-01-QC-W5-R1 (HP-05 HĐ + HP-06 CC payroll)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-SPINE-01-QC-W5-R1` |
| **program** | `PO-E2E-BIZ-SPINE-01` · spine **E2E-SPINE-01** |
| **executor** | qc |
| **date** | 2026-08-03 |
| **scope** | **HP-05** (menu Hợp đồng · J-HRM-01) · **HP-06** (CC Tiền lương · J-HRM-07 / FR-UC-H04) — **slice only** |
| **portal** | `http://127.0.0.1:5173` (local QA R1) |
| **qa_in** | `docs/qa/evidence/po-e2e-spine-01-qa-w5-r1.md` · test-log `.md` + `.json` |
| **prior_fail** | `docs/qa/evidence/po-e2e-spine-01-qa-w5.md` (Vite 500 · CC blank pane) |
| **fe_fix** | `docs/qa/evidence/po-e2e-spine-01-fe-vite-pay-con-01.md` |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **GO WITH CONDITIONS** (bounded slice — **not** full spine · **not** UAT DONE · **not** Phase1 DONE) |

## 1. Evidence-pack gate (mandatory script)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-e2e-spine-01-qa-w5-r1.md
```

| Result | Detail |
|--------|--------|
| **exit 1** | **3/8** checks fail (process hygiene — **not** product reopen) |
| `command_table` | Missing `pnpm run …` row with exit code (QA cites `qc:dev-stack` without `pnpm run`) |
| `crud_or_matrix` | Verdict column uses `🟢 **PASS**` — pack regex expects `\| **pass**` without leading emoji |
| `residual_section` | Heading `## 4. Residuals` — pack expects `## Residual` pattern (numbered `.` breaks match) |

**QC disposition:** Independent substance audit **proceeds**. **Condition C-QA-EVID-PACK-01 CLOSED** 2026-08-03 — QA evidence now `verify:qc:evidence-pack` **8/8** exit 0 ([`c-qa-evid-pack-01.md`](./c-qa-evid-pack-01.md)).

## 2. U78 / browser vs probe-only (U65 · U76)

| Check | QC finding |
|-------|------------|
| U78 test log | `po-e2e-spine-01-qa-w5-r1-test-log.md` + `.json` · 12 chronological steps · `seed_used: false` · `hdsd_align: true` |
| Harness | `scripts/qa/po-e2e-spine-01-qa-w5-browser.mjs` · raw `_tmp-po-e2e-spine-01-qa-w5-r1-browser.json` |
| Clicks | **12** · `idle_guard: PASS` · click_log matches narrative (employees → deep-link → contracts → J-HRM-01 → CC payroll → F5 → emp tab Lương) |
| Screens | **9** PNG on disk under `docs/qa/evidence/screens/po-e2e-spine-01-qa-w5-20260803/` (QC verified `04-contracts-list.png`, `06-payroll.png` **exist**) |
| Console | `consoleErrors=[]` · `pageErrors=[]` |
| Network | contracts GET **200** · payslips GET **200** · employee GET **200** — correlated to UI steps |
| Anti false-PASS | W5 FAIL class **Vite 500** on `Contracts.tsx`/`Payroll.tsx` + **blankPane** CC — R1 reports transform **200**, `blankPane=false`, `textLen=485`, `present_with_rows` on HĐ |

**Conclusion:** PASS is **browser-backed**, not probe-only.

## 3. Residual closure (slice)

| ID | W5 | R1 QC |
|----|-----|--------|
| **R-PO-SPINE01-CONTRACTS-VITE** | Vite 500 · whitescreen `/hr/contracts` | **CLOSED** — module mount · API 200 · J-HRM-01 **true** |
| **R-PO-SPINE01-PAYROLL-BLANK** | CC pane blank · Payroll.tsx 500 | **CLOSED** — CC mount · not blank pane · F5 stable · payslips 200 |

**Open (non-blocking this slice):**

| ID | Sev | Note |
|----|-----|------|
| Soft-link stamp `SP4SDEKW49` absent on emp list | product_gap | Documented · not regression · case C pass |
| CC payroll `emptyHonest=false` · `hasRows=false` | info | Content shell (~485 chars) — not W5 blank-pane class; no invent payslip rows (U65) |
| **C-QA-EVID-PACK-01** | P2 process | **CLOSED** — pack **8/8** ([`c-qa-evid-pack-01.md`](./c-qa-evid-pack-01.md)) |

## 4. must_keep audit

| Lane | QC |
|------|-----|
| Leave / LV-03/04 · LV-02 HOLD T_L1 | **Not reopened** — QA + FE handoff explicit; slice did not execute leave ladder |
| AUTH / EMP / CAT | **Not reopened** — emp deep-link GET 200 preserved |
| HP-03/04 | **Not reopened** — out of R1 scope |
| Approve UX GWC | **Not reopened** — no approve path in R1 harness |

FE fix `po-e2e-spine-01-fe-vite-pay-con-01.md` restore chain aligns with root cause (missing Vite imports); **no** seed · **no** payroll row invention.

## 5. L2.5 journey matrix (in-scope slice)

| Journey | Route / HDSD | QA | QC |
|---------|----------------|-----|-----|
| **J-HRM-01** | Hợp đồng list → NV link → hồ sơ | pass | **PASS** |
| **J-HRM-02** | NV deep-link hồ sơ | pass | **PASS** (must_keep) |
| **J-HRM-07** | CC **Tiền lương** | pass | **PASS** |
| J-HRM-03 · HP-03/04 · full E2E-SPINE-01 | — | not in R1 | **DEFER** — not claimed |

## 6. Classification

| Class | Items |
|-------|--------|
| **PRODUCT (closed)** | HP-05 HĐ mount · HP-06 CC payroll mount · Vite 500 class |
| **ENV** | None driving NO-GO |
| **PROCESS** | C-QA-EVID-PACK-01 |
| **PROGRAM** | Full spine · Phase1 · UAT — **explicitly NOT DONE** |

## 7. QC verdict

**GO WITH CONDITIONS** — promote **HP-05 + HP-06 browser slice** only.

**Conditions:**

1. ~~**C-QA-EVID-PACK-01**~~ — **CLOSED** (pack 8/8).
2. Remaining spine hops (HP-01..04, leave LV-02 T_L1, mobile mutate payroll rows) remain **open** in program WBS — PM must **not** infer UAT/Phase1 closure from this gate. Slice HP-05/06 + process condition closed → treat as **GO** for this bounded slice (still not full spine / UAT / Phase1).

**Forbidden (confirmed):** seed · UAT DONE · Phase1 DONE · reopen leave ladder · full-spine QA re-run (unless fraud — **not indicated**).

## Residual

| ID | Owner | Expiry / trigger |
|----|-------|------------------|
| C-QA-EVID-PACK-01 | qa | **CLOSED** 2026-08-03 |
| E2E-SPINE-01 program remainder | pm | WBS per `PO_E2E_BUSINESS_SPINE_PROGRAM.md` |
| Soft-link stamp product_gap | ba/pm | When HP-05 hire-in-period AC retested |

## completion_report

- **Closed (QC):** Substantive audit of QA W5-R1 — browser U78 log + disk screenshots + raw JSON support **PASS** vs W5 Vite/blank failures; **R-PO-SPINE01-CONTRACTS-VITE** and **R-PO-SPINE01-PAYROLL-BLANK** credibly **CLOSED**; must_keep lanes not violated in evidence.
- **Open:** Evidence-pack script **3/8** format gaps (process only); full spine / UAT / Phase1 **not** signed.

## next_owner

**pm** — program WBS next item or spine continuation per backlog.

## next_dispatch_prompt

```text
work_item_id: PO-E2E-SPINE-01-PM-W5-R1-INTAKE
from_role: qc
to_role: pm
lane: program
entry: docs/qa/evidence/po-e2e-spine-01-qc-w5-r1.md · GO WITH CONDITIONS · HP-05/06 slice CLOSED · C-QA-EVID-PACK-01 open (qa hygiene)
mission: Intake QC signoff — advance PO-E2E-BIZ-SPINE-01 WBS (next HP or deferred J-*); dispatch qa only for C-QA-EVID-PACK-01 pack format fix if next gate requires exit 0; do NOT claim UAT/Phase1/spine DONE.
exit: bus INTAKE + next execution dispatch with work_item_id
cấm: seed · Phase1 DONE · reopen LV ladder without sponsor
```
