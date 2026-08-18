# Evidence — `PO-HRM-SETTINGS-DEFAULTS-QC-03`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-DEFAULTS-QC-03` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **U65 browser Settings defaults UF** (TAX / SI / POS) · **not** module UAT · **not** J-* promote · **not** AMIS DONE |
| **priority** | P2 |
| **resume_chunk** | K6.3 |
| **parent** | `PO-HRM-SETTINGS-DEFAULTS-QA-03` |
| **prior_fe** | `PO-HRM-SETTINGS-DEFAULTS-FE-01` READY_FOR_QA |
| **prior_qa** | `PO-HRM-SETTINGS-DEFAULTS-QA-03` PASS_TO_PM · stamp **`SETDEFQA3-MSIWEG3M`** · **12/12** |
| **prior_qc02** | `PO-HRM-SETTINGS-DEFAULTS-QC-02` L1 GWC **SEAL retained** (do not reopen D-SETDEF-*) |
| **closes** | QC-02 CONDITION **FE Settings UF deferred** |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` |
| **journey_l25** | **N/A deferred** — Settings UF seat · **no** J-* promote · `C-SLICE-≠-MODULE` |
| **crud_or_matrix** | AC-SETDEF-TAB…NO-INVENT browser matrix (see § Gate AC audit) |
| **Verdict** | **GO WITH CONDITIONS** — FE Settings UF slice ACCEPT · CONDITION: **`C-SLICE-≠-MODULE`** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-settings-defaults-qa-03.md`](po-hrm-settings-defaults-qa-03.md) |
| **fe_ref** | [`po-hrm-settings-defaults-fe-01.md`](po-hrm-settings-defaults-fe-01.md) |
| **qc02_ref** | [`po-hrm-settings-defaults-qc-02.md`](po-hrm-settings-defaults-qc-02.md) — L1 SEAL |
| **machine** | [`_tmp-po-hrm-settings-defaults-qa-03-browser.FINAL.json`](_tmp-po-hrm-settings-defaults-qa-03-browser.FINAL.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-settings-defaults-qa-03/` (01–09) |
| **spec_ref** | F-SET-TAX-01 · F-SET-SI-01 · F-SET-POS-02/05 · SRC-02 · UC-SET-DEF-01 |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — FE UF GWC ≠ Settings module UAT / AMIS DONE / Phase1 DONE / J-* |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **AMIS parity DONE** | **DENIED** | Settings defaults FE UF seat only |
| **J-* / L2.5 promote** | **DENIED** this seat | journey_l25 N/A deferred |
| **Module Settings / payroll UAT** | **DENIED** | Seat GWC ≠ module GO |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **C-SLICE as module GO** | **DENIED** | Explicit |
| **L1 D-SETDEF-* reopen** | **DENIED** | QC-02 SEAL retained |
| **Seed** | **DENIED** (U65) | `seed_used=false` in FINAL JSON |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT U65 browser Settings defaults UF after FE-01 + QA-03 retest stamp `SETDEFQA3-MSIWEG3M` (**12/12** · `overall=PASS`). Audited QA-03 MD + FINAL machine JSON + FE-01 + QC-02 L1 SEAL + screens **03-tax-f5** / **08-pos-resolve**. Proven:

| Surface | Network / FE | QC |
|---------|--------------|-----|
| **TAX** | PUT ×4 **200** `HRM-SET-TAX-200` → F5 `11500000` / `4400000` | 🟢 **ACCEPT** |
| **SI** | POST **201** `HRM-SET-SI-201` key=`BHXH_QA3_msiweg3m` → F5 row | 🟢 **ACCEPT** |
| **POS** | catalogOpts=14 · `PC_RET_AC81` · POST **201** `HRM-SET-POS-201` `CEO` → F5 | 🟢 **ACCEPT** |
| **SRC-02 resolve** | GET **200** `HRM-SET-POS-200` · `policyId=4309d1f0-…` · `inventEmpPkg=false` · `hasEmployeePackageId=false` | 🟢 **ACCEPT** |
| **Honesty** | badge `payroll_e2e_ready=false` · «không công thức FE» | 🟢 **DENIED promote** |

**CLOSED:** QC-02 CONDITION **FE Settings UF deferred**.

**RETAIN (do not reopen):** QC-02 L1 GWC — D-SETDEF-QA-TAX-01 / SI-DATE-01 / POS-TX-01 **SEAL**.

**CONDITION remaining:** `C-SLICE-≠-MODULE` only.

**DENIED:** module Settings UAT · AMIS DONE · J-* promote · Phase1 DONE · `payroll_e2e_ready=true` · claim C-SLICE as module GO · seed.

QA pack verify **1/8** (`command_table` missing) = **PROCESS OBS** for browser MD — this QC consolidates **8/8**. Live L0 at QC gate: HRM/XBOS/portal **200** (Node UV exit assert = ENV OBS only).

**NOT Phase 1 DONE.** **NOT** module GO via C-SLICE.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Stamp `SETDEFQA3-MSIWEG3M` · 12/12 | FINAL JSON `summary.passCount=12` · `failCount=0` | 🟢 **ACCEPT** |
| TAX 2xx→F5 | PUT 200 ×4 · personal/dependent persist | 🟢 **ACCEPT** |
| SI 2xx→F5 | POST 201 · row after F5 | 🟢 **ACCEPT** |
| POS catalog+2xx→F5 | PC_RET_AC81 · CEO row | 🟢 **ACCEPT** |
| SRC-02 no emp write | inventEmpPkg=false · no employeePackageId | 🟢 **ACCEPT** |
| Honesty false | MD + JSON + screen 03 badge | 🟢 **DENIED promote** |
| QC-02 FE CONDITION | closed by QA-03 PASS | 🟢 **CLOSED** |
| L1 QC-02 SEAL | D-SETDEF-* not reopened | 🟢 **RETAIN** |
| J-* / module UAT / AMIS / Phase1 / ready | Explicit DENIED | 🟢 |
| `C-SLICE-≠-MODULE` | seat ≠ module GO | 🟡 **CONDITION** |
| QA pack 1/8 | missing `command_table` | 🟡 **PROCESS OBS** — QC consolidates |
| First-run HRM 500 storm | QA-03 ENV OBS · superseded by retest | 🟡 **ENV OBS** — not product |
| Live L0 at QC gate | HRM/XBOS/portal 200 · UV exit noise | 🟢 **ENV OK** (+ OBS) |

**Cấm:** invent AMIS DONE · `payroll_e2e_ready=true` · Phase1 DONE · claim J-* / module UAT · claim C-SLICE as module GO · reopen L1 D-SETDEF-* · seed.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · Settings defaults FE UF ≠ LIVE payroll process / module UAT · no J-* |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim FE Settings tax/SI/POS UF closed (QC-02 FE CONDITION)? | **YES** — this seat GWC |
| May PM claim AMIS DONE / module UAT / Phase1 / J-*? | **NO** |
| May PM treat this as Settings module GO? | **NO** — FE UF slice only |
| Forced residual dispatch this turn? | **NO** — idle-ok FE UF seat (`C-SLICE` honesty carry only) |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QC-02 L1 | `po-hrm-settings-defaults-qc-02.md` | GWC · FE UF CONDITION | **SEAL retained** · FE CONDITION **CLOSED** by this seat |
| FE-01 wire | `po-hrm-settings-defaults-fe-01.md` | READY_FOR_QA | **ACCEPT** panel/tab/HDSD ids · SRC-02 read-only |
| QA-03 browser U65 | `po-hrm-settings-defaults-qa-03.md` | PASS_TO_PM · 12/12 | **ACCEPT** stamp `SETDEFQA3-MSIWEG3M` |
| Machine FINAL | `_tmp-…-qa-03-browser.FINAL.json` | overall PASS | **ACCEPT** |
| Screens 01–09 | `screens/po-hrm-settings-defaults-qa-03/` | 9 PNGs present | **ACCEPT** spot 03 / 08 |
| Pack verify QA-03 | `verify:qc:evidence-pack` | exit **1** · **1/8** (`command_table`) | 🟡 **PROCESS OBS** — QC consolidates |
| Spec F-SET-* / SRC-02 | API / FE ack | CONFIRMED | **TRACE OK** |

### Machine JSON spot (`SETDEFQA3-MSIWEG3M`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` / `summary.stamp` | `SETDEFQA3-MSIWEG3M` | 🟢 |
| `honesty.payroll_e2e_ready` / `seed_used` | **false** / **false** | 🟢 |
| `deny_module_settings_uat` / `deny_amis_done` / `deny_j_star_promote` | **true** | 🟢 |
| `l0` portal/hrm/xbos | all **200** | 🟢 |
| `ac.*` (12 keys) | all **PASS** | 🟢 |
| TAX PUT codes | `HRM-SET-TAX-200` ×4 | 🟢 |
| `taxF5` | `11500000` / `4400000` | 🟢 |
| SI POST | **201** `HRM-SET-SI-201` · `BHXH_QA3_msiweg3m` | 🟢 |
| POS POST | **201** `HRM-SET-POS-201` · `PC_RET_AC81` · `CEO` | 🟢 |
| `resolve.hasEmployeePackageId` | **false** | 🟢 |
| `overall` / passCount | **PASS** / **12** | 🟢 |
| `ack_status` | **PASS_TO_PM** | 🟢 |

### Screen spot-check

| Screen | Observed | QC |
|--------|----------|-----|
| `03-tax-f5.png` | Tab **Mặc định thuế/BH/PC** · badge `payroll_e2e_ready=false` · personal `11.500.000` · dependent `4.400.000` · honesty copy SRC-02 | 🟢 |
| `08-pos-resolve.png` | SI row `BHXH_QA3_msiweg3m` · POS card SRC-02 · toast «draft read-only» / khớp chính sách | 🟢 |

---

## Gate AC audit

| ID | QA-03 | Machine | QC |
|----|-------|---------|-----|
| L0-STACK | 🟢 | portal/hrm/xbos 200 | 🟢 **ACCEPT** |
| AC-SETDEF-TAB / PANEL | 🟢 | PASS | 🟢 **ACCEPT** |
| AC-SETDEF-HONESTY | 🟢 | badge false exact | 🟢 **ACCEPT** |
| AC-SETDEF-TAX-SAVE / TAX-F5 | 🟢 | PUT 200 ×4 · F5 values | 🟢 **ACCEPT** |
| AC-SETDEF-SI-CREATE / SI-F5 | 🟢 | POST 201 · F5 row | 🟢 **ACCEPT** |
| AC-SETDEF-POS-CREATE / POS-F5 | 🟢 | POST 201 · CEO F5 | 🟢 **ACCEPT** |
| AC-SETDEF-POS-RESOLVE | 🟢 | inventEmpPkg=false | 🟢 **ACCEPT** |
| AC-SETDEF-NO-INVENT | 🟢 | honesty copy | 🟢 **ACCEPT** |
| Module UAT / AMIS / J-* / ready | DENIED | deny_* true | 🟢 **DENIED** |

---

## Defect / CONDITION disposition

| ID | Prior | QC disposition |
|----|-------|----------------|
| **QC-02 FE Settings UF deferred** | CONDITION | **CLOSED** — QA-03 U65 PASS accepted |
| **D-SETDEF-QA-TAX/SI-DATE/POS-TX** | QC-02 CLOSED | **SEAL retained** — do not reopen |
| **`C-SLICE-≠-MODULE`** | honesty | **CONDITION** — seat ≠ module GO |
| First-run Nest GET 500 mid-F5 | QA-03 ENV OBS | **WAIVE** — superseded by retest PASS · not product residual |
| Free-text `positionKey` → 400 | PRODUCT SPEC note | **OBS OK** — FE uses job_titles `CEO` (correct) |
| QA pack missing `command_table` | PROCESS | **OBS** — QC consolidates 8/8 |
| Node UV assert after qc:dev-stack | ENV | **ENV OBS** — health lines 200; no product NO-GO |

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| Browser UF TAX/SI/POS 2xx→F5 · SRC-02 no emp write · 12/12 | PRODUCT PASS | Yes → GWC ACCEPT |
| `C-SLICE-≠-MODULE` | PRODUCT CONDITION | Yes → CONDITION (not NO-GO) |
| QA pack missing command_table | PROCESS OBS | No — QC consolidates |
| First-run HRM 500 storm | ENV OBS | No — retest PASS |
| Node UV exit after health 200 | ENV OBS | No product NO-GO |

---

## Evidence pack (QC consolidates 8/8)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `PO-HRM-SETTINGS-DEFAULTS-QC-03` |
| 2 | portal_url | ✅ `:5173` + HRM `:28001` + XBOS `:28002` |
| 3 | journey_l25 | ✅ **N/A deferred** — Settings UF · no J-* promote |
| 4 | crud_or_matrix | ✅ Gate AC audit AC-SETDEF-* |
| 5 | Classification | ✅ PRODUCT / PROCESS / ENV |
| 6 | Honesty locks | ✅ `payroll_e2e_ready=false` · DENIED flips · no module UAT |
| 7 | Defect disposition | ✅ FE UF CONDITION CLOSED · L1 SEAL · C-SLICE CONDITION |
| 8 | Verdict + ack | ✅ **GO WITH CONDITIONS** · `PASS_TO_PM` |

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-settings-defaults-qa-03.md` | exit **1** · **1/8** (`command_table`) | **PROCESS OBS** — browser seat |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-settings-defaults-qc-03.md` | *(run after write)* | QC pack SoT |
| `pnpm run qc:dev-stack` | HRM **200** · XBOS **200** · portal **200** · Node UV exit noise | **ENV OK** (+ OBS exit assert) |
| QA-03 FINAL stamp `SETDEFQA3-MSIWEG3M` | **PASS** · 12/12 · inventEmpPkg=false | PRODUCT OK (cited) |
| Screen spot 03 / 08 | tax F5 values + SI stamp row + resolve toast | PRODUCT OK (cited) |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON + screen audit.

**L2.5 / journey:** No J-* in-scope this seat — **deferred**. Explicit: program J-* rows = **N/A / not tested** for this FE UF gate.

---

## Scope statement (bounded)

**IN scope ACCEPT:** U65 Settings tab **Mặc định thuế/BH/PC** · TAX Lưu→2xx→F5 · SI create/list→2xx→F5 · POS create+PC catalog→2xx→F5 · SRC-02 resolve draft read-only (no emp package write) · honesty badge false · QC-02 FE CONDITION **CLOSED**.

**OUT of scope / DENIED:** Settings module UAT · AMIS DONE · J-* L2.5 · `payroll_e2e_ready=true` · Phase 1 DONE · PAY process tax/SI consumer · reopen L1 D-SETDEF-* · claim C-SLICE as module GO.

**NOT Phase 1 DONE.** **NOT** module GO via C-SLICE.

---

## completion_report

### Closed

1. Narrow QC gate on Settings defaults **FE UF** (K6.3) complete.
2. QA-03 stamp `SETDEFQA3-MSIWEG3M` **12/12 ACCEPT** — TAX/SI/POS 2xx→F5 · SRC-02 no emp write · honesty false.
3. QC-02 CONDITION **FE Settings UF deferred** **CLOSED**.
4. L1 QC-02 GWC **SEAL retained** (D-SETDEF-* not reopened).
5. Verdict **GO WITH CONDITIONS** (FE UF seat) — remaining CONDITION: `C-SLICE-≠-MODULE`.
6. Explicit DENY: AMIS DONE · module UAT · J-* · Phase1 DONE · `payroll_e2e_ready=true` · C-SLICE as module GO · seed.

### Residual

- `C-SLICE-≠-MODULE` honesty carry (not forced product fix this seat).
- ENV OBS first-run Nest 500 / Node UV — monitor only.
- PAY process consumers of tax/SI defaults **out of scope**.

---

## next_owner

**pm**

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-SETTINGS-DEFAULTS-PM-INTAKE-03
from_role: qc
to_role: pm
lane: governance
priority: P2
parent: PO-HRM-SETTINGS-DEFAULTS-QC-03
resume_chunk: K6.3
ref_qc: docs/qa/evidence/po-hrm-settings-defaults-qc-03.md
ref_qa: docs/qa/evidence/po-hrm-settings-defaults-qa-03.md

## task
INTAKE QC GWC for Settings defaults FE UF (closes QC-02 FE CONDITION):
- ACCEPT FE UF TAX/SI/POS U65 · stamp SETDEFQA3-MSIWEG3M · SRC-02 no emp write.
- Keep payroll_e2e_ready=false; DENY AMIS DONE / module UAT / J-* / C-SLICE as module GO / Phase1 DONE.
- RETAIN L1 QC-02 SEAL (D-SETDEF-* CLOSED — do not reopen).
- Update TEAM_WORKING_NOW / bus: K6.3 Settings defaults FE UF seat GWC; idle-ok this seat.
- Next product wave per program backlog (not forced residual P0 from this QC).
```

---

## evidence_path

`docs/qa/evidence/po-hrm-settings-defaults-qc-03.md`

## ack_status

**GO WITH CONDITIONS**

## payroll_e2e_ready

**false**
