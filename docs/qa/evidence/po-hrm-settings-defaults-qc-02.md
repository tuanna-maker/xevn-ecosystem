# Evidence — `PO-HRM-SETTINGS-DEFAULTS-QC-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-DEFAULTS-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **L1 API Settings defaults hotfix** (TAX / SI / POS) · **not** browser UF · **not** J-* promote · **not** module UAT |
| **priority** | P1 |
| **parent** | `PO-HRM-SETTINGS-DEFAULTS-QA-02` |
| **prior_be** | `PO-HRM-SETTINGS-DEFAULTS-BE-02` READY_FOR_QA (DTO whitelist · date coerce · SC SAVEPOINT) |
| **prior_qa01** | `PO-HRM-SETTINGS-DEFAULTS-QA-01` FAIL_TO_PM · 3× P0 |
| **prior_qa02** | `PO-HRM-SETTINGS-DEFAULTS-QA-02` PASS_TO_PM · stamps `SETDEF2ISS23I` / `SETDEF2CSU3JM` |
| **closes** | **D-SETDEF-QA-TAX-01** · **D-SETDEF-QA-SI-DATE-01** · **D-SETDEF-QA-POS-TX-01** |
| **portal_url** | `http://127.0.0.1:5173` (L0 observe) · HRM `:28001` · XBOS `:28002` · **api_base** `http://127.0.0.1:28001/api/hrm` |
| **journey_l25** | **N/A deferred** — L1 API seat only · **no** J-* promote · `C-SLICE-≠-MODULE` |
| **crud_or_matrix** | L1 retest matrix vs QA-01 FAIL (see § Gate AC audit) |
| **Verdict** | **GO WITH CONDITIONS** — L1 API slice ACCEPT · CONDITIONS: **FE Settings UF deferred** · **`C-SLICE-≠-MODULE`** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-settings-defaults-qa-02.md`](po-hrm-settings-defaults-qa-02.md) |
| **qa01_ref** | [`po-hrm-settings-defaults-qa-01.md`](po-hrm-settings-defaults-qa-01.md) |
| **be_ref** | [`po-hrm-settings-defaults-be-02.md`](po-hrm-settings-defaults-be-02.md) |
| **machine** | [`_tmp-po-hrm-settings-defaults-qa-02.json`](_tmp-po-hrm-settings-defaults-qa-02.json) · [`_tmp-…-qa-02-pos.json`](_tmp-po-hrm-settings-defaults-qa-02-pos.json) |
| **spec_ref** | API-01 F-SET-TAX-01 · VAL-SET-TAX-SHAPE · F-SET-SI-03 · VAL-SET-SI-01/05 · F-SET-POS-02/05 · SRC-02 · BR-AMIS-SET-DEF-07 |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · L1 secondary only |
| **OS honesty** | `C-SLICE-≠-MODULE` — L1 GWC ≠ AMIS DONE / payroll module UAT / Phase1 DONE / UF 🟢 / J-* |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **AMIS parity DONE** | **DENIED** | Settings defaults L1 hotfix only |
| **Browser UF 🟢 / J-*** | **DENIED** this seat | U65 L1 probe secondary only |
| **Module Settings / payroll UAT** | **DENIED** | Seat GWC ≠ module GO |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **C-SLICE as module GO** | **DENIED** | Explicit |
| **Seed** | **DENIED** (U65) | Product catalog PC active list only |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT L1 Settings defaults hotfix after BE-02 + QA-02 retest. Audited QA-02 MD + machine JSON (`overallFinal=PASS` · `verdictsFinal` all true · `payroll_e2e_ready=false`) + BE-02 jest 21/21 cited + QA-01 FAIL matrix **superseded CLOSED**. Proven closures:

| Defect | QA-01 FAIL | QA-02 retest | QC |
|--------|------------|--------------|-----|
| **D-SETDEF-QA-TAX-01** | PUT `property value should not exist` | **200** `HRM-SET-TAX-200` UPSERT + **400** `HRM-SET-TAX-400-SHAPE` | 🟢 **CLOSED** |
| **D-SETDEF-QA-SI-DATE-01** | PATCH `Thu Jan 01` 400 · overlap **201** | PATCH **200** `effectiveFrom=2026-01-01` · overlap **409** `HRM-SET-SI-409-OVERLAP` | 🟢 **CLOSED** |
| **D-SETDEF-QA-POS-TX-01** | create/orphan **500** aborted TX | orphan **400** `HRM-ALLOW-CAT-ORPHAN-CODE` · create **201** `HRM-SET-POS-201` (`PC_RET_AC81`) | 🟢 **CLOSED** |

Retained PASS (QA-01 → QA-02): SI hard DELETE 409 · SI retire · resolve `NO_POLICY` · SRC-02 no emp package write · POS dup 409 · POS retire → resolve `NO_POLICY`.

**CONDITION:** FE Settings tax/SI/POS browser UF (U65) **deferred** — not blocking L1 hotfix GWC.

**OBS (probe hygiene, not product):** first POS create with `positionLabelSnapshot` → **400** `HRM-VAL-001` — documented in QA-02; re-probe without field → product OK. Machine `overall: FAIL` on first stamp **superseded** by `overallFinal: PASS` + pos JSON stamp `SETDEF2CSU3JM`.

QA pack verify **3/8** (`command_table` · `portal_url` · `journey_l25` missing) = **PROCESS OBS** for L1-only MD — this QC consolidates **8/8** with explicit **N/A deferred J-*** + portal + command table. Live QC spot `qc:dev-stack`: HRM/XBOS/portal **200** (Node UV assertion on process exit = ENV OBS only; health lines PASS).

**DENIED:** AMIS DONE · `payroll_e2e_ready=true` · Phase1 DONE · module UAT · UF 🟢 / J-* promote · claim C-SLICE as module GO. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| D-SETDEF-QA-TAX-01 CLOSED | QA-02 TAX PUT 200 + SHAPE 400 | 🟢 **ACCEPT CLOSED** |
| D-SETDEF-QA-SI-DATE-01 CLOSED | QA-02 PATCH YYYY-MM-DD + overlap 409 | 🟢 **ACCEPT CLOSED** |
| D-SETDEF-QA-POS-TX-01 CLOSED | QA-02 orphan 400 + create 201 | 🟢 **ACCEPT CLOSED** |
| SRC-02 resolve read-only | warnings NO_POLICY · no employeePackageId | 🟢 **RETAIN** |
| Honesty `payroll_e2e_ready=false` | MD + machine | 🟢 **DENIED promote** |
| No UF 🟢 claim | QA-02 honesty + residual | 🟢 **DENIED** |
| FE Settings UF | deferred residual | 🟡 **CONDITION** |
| `C-SLICE-≠-MODULE` | seat ≠ module GO | 🟡 **CONDITION** |
| QA pack 3/8 | L1 seat missing fields | 🟡 **PROCESS OBS** — QC consolidates |
| Live L0 at QC gate | HRM/XBOS/portal 200 | 🟢 **ENV OK** |
| AMIS DONE / module UAT / Phase1 / ready / UF | Explicit DENIED | 🟢 |

**Cấm:** invent AMIS DONE · `payroll_e2e_ready=true` · Phase1 DONE · claim J-* / UF 🟢 · claim module UAT · reopen D-SETDEF-* as open · seed · treat C-SLICE GWC as module GO.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · L1 Settings defaults ≠ LIVE process / module UAT · no UF/J-* |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim L1 TAX/SI/POS hotfix + 3× D CLOSED? | **YES** — this seat GWC |
| May PM claim AMIS DONE / module UAT / Phase1 / UF 🟢 / J-*? | **NO** |
| May PM treat this as Settings module GO? | **NO** — L1 API slice only |
| Forced residual dispatch this turn? | **NO** for product P0 — FE Settings UF when PM schedules (CONDITION deferred) · idle-ok L1 |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QA-01 L1 | `po-hrm-settings-defaults-qa-01.md` | FAIL_TO_PM · 3× P0 | **ACCEPT FAIL matrix** · superseded by QA-02 |
| BE-02 hotfix | `po-hrm-settings-defaults-be-02.md` | READY_FOR_QA | **ACCEPT** `@Allow()` · `toLeaveDayKey` · SAVEPOINT |
| QA-02 L1 retest | `po-hrm-settings-defaults-qa-02.md` | PASS_TO_PM | **ACCEPT** stamps `SETDEF2*` · overallFinal PASS |
| Machine | `_tmp-…-qa-02.json` + pos JSON | overallFinal PASS | **ACCEPT** (first POS 400 = probe OBS) |
| Pack verify QA-02 | `verify:qc:evidence-pack` | exit **1** · **3/8** | 🟡 **PROCESS OBS** — L1; QC consolidates |
| Spec F-SET-* / VAL-* | API-01 | CONFIRMED | **TRACE OK** |

### Machine JSON spot (`SETDEF2ISS23I` → final)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` / POS stamp | `SETDEF2ISS23I` / `SETDEF2CSU3JM` | 🟢 |
| `payroll_e2e_ready` | **false** | 🟢 |
| `TAX_PUT_OK` / `TAX_PUT_BAD_SHAPE` | true / true · 200 / 400-SHAPE | 🟢 |
| `SI_PATCH_YYYY_MM_DD` / `SI_OVERLAP` | true / true · 200 / 409 | 🟢 |
| First `POS_CREATE` | 400 `positionLabelSnapshot` | 🟡 **PROBE OBS** (not product) |
| Final `POS_CREATE` / orphan | 201 / 400 ORPHAN · `PC_RET_AC81` | 🟢 |
| `verdictsFinal` / `overallFinal` | all true / **PASS** | 🟢 |
| `src02_no_emp_write` | true | 🟢 |
| QA ack | **PASS_TO_PM** | 🟢 |

---

## Gate AC audit (vs QA-01 FAIL)

| # | Spec / AC | QA-01 | QA-02 | QC |
|---|-----------|-------|-------|-----|
| TAX PUT UPSERT | F-SET-TAX-01 | 🔴 whitelist | 🟢 200 UPSERT | 🟢 **ACCEPT CLOSED** |
| TAX bad shape | VAL-SET-TAX-01/02 | 🔴 blocked | 🟢 400-SHAPE | 🟢 **ACCEPT CLOSED** |
| SI PATCH date | F-SET-SI-03 | 🔴 Thu Jan 01 | 🟢 YYYY-MM-DD | 🟢 **ACCEPT CLOSED** |
| SI overlap | VAL-SET-SI-01 | 🔴 201 | 🟢 409 | 🟢 **ACCEPT CLOSED** |
| SI hard DELETE / retire | VAL-SET-SI-05 / retire | 🟢 | 🟢 retain | 🟢 **RETAIN** |
| POS create | F-SET-POS-02 | 🔴 500 TX | 🟢 201 | 🟢 **ACCEPT CLOSED** |
| POS orphan | VAL-SET-POS-02 | 🔴 500 | 🟢 400 ORPHAN | 🟢 **ACCEPT CLOSED** |
| POS resolve SRC-02 | F-SET-POS-05 | 🟢 NO_POLICY | 🟢 retain + hit/after | 🟢 **RETAIN** |
| POS dup / retire | — | ⬜ blocked | 🟢 409 / soft | 🟢 **ACCEPT** |
| — | AMIS / module UAT / UF / Phase1 / ready | DENIED | DENIED | 🟢 **DENIED** |

---

## Defect / CONDITION disposition

| ID | Prior | QC disposition |
|----|-------|----------------|
| **D-SETDEF-QA-TAX-01** | P0 PUT whitelist | **CLOSED** — do not reopen |
| **D-SETDEF-QA-SI-DATE-01** | P0 date coerce / overlap | **CLOSED** — do not reopen |
| **D-SETDEF-QA-POS-TX-01** | P0 aborted TX | **CLOSED** — do not reopen |
| **FE Settings UF** | deferred (browser U65) | **CONDITION** — schedule when PM prioritizes · not L1 blocker |
| **C-SLICE-≠-MODULE** | honesty | **CONDITION** — seat ≠ module GO |
| **OBS probe positionLabelSnapshot** | QA-02 false start | **WAIVE** — probe hygiene · not product residual |
| **ENV** Node UV exit after qc:dev-stack | wall-clock | **ENV OBS** — health lines 200; does not reopen product |

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| TAX/SI/POS L1 hotfix PASS · 3× D CLOSED | PRODUCT PASS | Yes → GWC ACCEPT |
| FE Settings UF deferred | PRODUCT CONDITION | Yes → CONDITION (not NO-GO) |
| First POS create 400 snapshot field | PROCESS / probe OBS | No |
| QA pack missing command_table/portal/journey | PROCESS OBS | No — L1 seat; QC consolidates |
| Node UV assert after health 200 | ENV OBS | No product NO-GO |

---

## Evidence pack (QC consolidates 8/8)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `PO-HRM-SETTINGS-DEFAULTS-QC-02` |
| 2 | portal_url | ✅ `:5173` + api_base `:28001` |
| 3 | journey_l25 | ✅ **N/A deferred** — L1 only · no J-* promote |
| 4 | crud_or_matrix | ✅ Gate AC audit vs QA-01 FAIL |
| 5 | Classification | ✅ PRODUCT / PROCESS / ENV |
| 6 | Honesty locks | ✅ `payroll_e2e_ready=false` · DENIED flips · no UF 🟢 |
| 7 | Defect disposition | ✅ 3× D CLOSED · FE UF CONDITION · C-SLICE CONDITION |
| 8 | Verdict + ack | ✅ **GO WITH CONDITIONS** · `PASS_TO_PM` |

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-settings-defaults-qa-02.md` | exit **1** · **3/8** (`command_table` · `portal_url` · `journey_l25`) | **PROCESS OBS** — L1 seat |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-settings-defaults-qc-02.md` | *(run after write)* | QC pack SoT |
| `pnpm run qc:dev-stack` | HRM **200** · XBOS **200** · portal **200** · Node UV exit noise | **ENV OK** (+ OBS exit assert) |
| BE-02 jest `settings-defaults.service.spec` | **PASS** · 21/21 (cited BE-02) | PRODUCT OK (cited) |
| QA-02 L1 stamps `SETDEF2ISS23I` / `SETDEF2CSU3JM` | **PASS** · overallFinal · 3× D CLOSED | PRODUCT OK (cited) |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON audit.

**L2.5 / journey:** No J-* in-scope this seat — **deferred** (Settings FE UF not promoted). Explicit: program J-* rows = **N/A / not tested** for this L1 gate.

---

## Scope statement (bounded)

**IN scope ACCEPT:** L1 F-SET-TAX PUT/GET/SHAPE · F-SET-SI create/PATCH/overlap/retire/hard-DELETE · F-SET-POS create/orphan/resolve/dup/retire · SRC-02 resolve read-only · D-SETDEF-QA-TAX/SI-DATE/POS-TX **CLOSED**.

**OUT of scope / DENIED:** Settings browser UF 🟢 · J-* L2.5 · `payroll_e2e_ready=true` · AMIS DONE · module UAT · Phase 1 DONE · PAY process tax/SI wire · SI-412 process helper live.

**NOT Phase 1 DONE.** **NOT** module GO via C-SLICE.

---

## completion_report

### Closed

1. Narrow QC gate on Settings defaults L1 hotfix wave complete.
2. **D-SETDEF-QA-TAX-01 / SI-DATE-01 / POS-TX-01 CLOSED** (QA-02 PASS; do not reopen).
3. Honesty acknowledged: `payroll_e2e_ready=false` · U65 L1 secondary only · **no** UF 🟢 claim.
4. Verdict **GO WITH CONDITIONS** (L1 API slice) — CONDITIONS: FE Settings UF deferred · `C-SLICE-≠-MODULE`.
5. Explicit DENY: AMIS DONE · module UAT · C-SLICE as module GO · Phase1 DONE.

### Residual

- FE Settings tax/SI/POS browser UF when PM schedules (CONDITION — not L1 P0).
- `C-SLICE-≠-MODULE` honesty carry.
- No open product P0 on F-SET-TAX/SI/POS L1 surface.

---

## next_owner

**pm**

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-SETTINGS-DEFAULTS-PM-INTAKE-02
from_role: qc
to_role: pm
lane: governance
priority: P2
parent: PO-HRM-SETTINGS-DEFAULTS-QC-02
ref_qc: docs/qa/evidence/po-hrm-settings-defaults-qc-02.md

## task
INTAKE QC GWC for Settings defaults L1 hotfix:
- CLOSE D-SETDEF-QA-TAX-01 / SI-DATE-01 / POS-TX-01 on bus (do not reopen).
- Keep payroll_e2e_ready=false; DENY AMIS DONE / module UAT / UF 🟢 / J-* / C-SLICE as module GO.
- CONDITION OK: FE Settings UF deferred — schedule PO-HRM-SETTINGS-DEFAULTS-FE-* only when product prioritizes browser U65 (not forced this turn).
- Update TEAM_WORKING_NOW / bus: L1 Settings defaults seat GWC; next product wave per program backlog.
- Idle-ok this seat (no forced residual P0).
```

---

## evidence_path

`docs/qa/evidence/po-hrm-settings-defaults-qc-02.md`

## ack_status

**GO WITH CONDITIONS**

## payroll_e2e_ready

**false**
