# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-QC-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — **SI insurer Nest EFF consumer FE browser (Settings + policy) narrow only** · **not** module SI/CTR UAT |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-QA-02` PASS_TO_PM stamp **`SIINRQA2-MSJBIMYU`** · **R-PLT-SI-INR-03 CLOSED** |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · **api_base** `http://127.0.0.1:28001/api/hrm` |
| **journey_l25** | Proposed deepen **J-HRM-INS-E3-01** insurer path (Settings → policy EFF picker) — **PASS slice only** · **DENY** module SI/CTR UAT promote · `C-SLICE-≠-MODULE` |
| **crud_or_matrix** | AC-PLT-SI-INSURER-01d · 01-PICKER-SOT · 01 · 01b · VAL-SI-INR-CNS-06 peer TYPE-KEY · 01c OBS · 01H · MUST_KEEP-SI-TYPE |
| **Verdict** | **GO WITH CONDITIONS** — SI-INSURER-CATALOG **FE browser SEAL ACCEPT** · **R-PLT-SI-INR-03 CLOSED** · CONDITION: honesty `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · L1 QA-01 `SIINRQA-MSJB1WLH` + QC-01 GWC L1 **RETAIN** · SI type L1/QC-02 FE enrollment **SEAL RETAIN** · CTR · enrollment EMP-BE-02 · EMPTY-DATE CLOSED **RETAIN** · **`C-SLICE-≠-MODULE`** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-dynamic-config-platform-si-insurer-catalog-qa-02.md`](po-hrm-dynamic-config-platform-si-insurer-catalog-qa-02.md) |
| **qc_l1_ref** | [`po-hrm-dynamic-config-platform-si-insurer-catalog-qc-01.md`](po-hrm-dynamic-config-platform-si-insurer-catalog-qc-01.md) **GWC L1 RETAIN** — **not reopened** |
| **fe_ref** | [`po-hrm-dynamic-config-platform-si-insurer-catalog-fe-01.md`](po-hrm-dynamic-config-platform-si-insurer-catalog-fe-01.md) READY · closes R-PLT-SI-INR-03 wire |
| **machine** | [`_tmp-po-hrm-dynamic-config-platform-si-insurer-catalog-qa-02-browser.json`](_tmp-po-hrm-dynamic-config-platform-si-insurer-catalog-qa-02-browser.json) · stamp **`SIINRQA2-MSJBIMYU`** |
| **screens** | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-si-insurer-catalog-qa-02/` (01–07 + 03b) |
| **stamp_ref** | QA-02 `SIINRQA2-MSJBIMYU` · L1 retain `SIINRQA-MSJB1WLH` · commit `dc930c5` |
| **spec_ref** | BA-01 AC-PLT-SI-INSURER-01* · VAL-SI-INR-CNS-01/06 · SA Option **B** · F-SI-CAT-INS / F-SI-CAT-INS-EFF · `HRM-INS-INSURER-KEY` · peer `HRM-INS-TYPE-KEY` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · L1 probe ≠ 🟢 UF |
| **OS honesty** | `C-SLICE-≠-MODULE` — FE insurer Nest EFF GWC ≠ module SI/CTR UAT / Phase1 / flip printable·personnel / reopen L1/QC-01 / SI type / CTR / enrollment / EMPTY-DATE |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`contracts_printable_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **`hrm_personnel_uat_ready`** | **`false`** | **DENIED** invent / promote |
| L1 QA-01 `SIINRQA-MSJB1WLH` · QC-01 GWC L1 | **SEAL RETAIN** | **FORBIDDEN reopen** |
| SI type L1 `SIINSQA-MSJA2Z7H` · QC-02 FE enrollment | **SEAL RETAIN** | **FORBIDDEN reopen** |
| EMPTY-DATE QC-02-R2 CLOSED | **SEAL RETAIN** | **FORBIDDEN reopen** |
| CTR legal-print / library | **SEAL RETAIN** | **cấm reopen** |
| SI enrollment EMP-BE-02 / ONE SoT | **SEAL RETAIN** | **cấm reopen** |
| **R-PLT-SI-INR-03** | **CLOSED** | Nest EFF picker proven — **RETAIN closed** |
| **EMP · DEC · PAY · ATT · REC · EXT · LIST-TOTALS** | **SEAL RETAIN** | **cấm reopen** |
| **Module SI / CTR UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module seal |
| **Seed** | **DENIED** (U65) | QA + machine · no seed |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | Nest EFF insurer FE ≠ module SI/CTR UAT |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow SI **insurer** catalog **FE browser** gate after QA-02 stamp **`SIINRQA2-MSJBIMYU`** (`overall=PASS` · U65 browser · honesty printable/personnel=false · zero-seed · **R-PLT-SI-INR-03 CLOSED**). Audited QA MD + machine JSON + screens 01–07/03b + L0 stack spot (hrm/xbos/portal **200**) + live unauth `GET …/insurers/effective?company_id=main` → **401**. Proven: Settings CREATE `hr_si_inr_msjbimyu` → PUT **200** `HRM-SI-INSURER-200` → F5 row true (01d) · policy Network **GET …/insurers/effective** **200** · MD catalog hits **0** (PICKER-SOT) · policy ∈ EFF → POST **201** `HRM-INS-POL-201` → F5 true (01) · invent ∉ EFF → **400** `HRM-INS-INSURER-KEY` (01b) · peer invent type → **400** `HRM-INS-TYPE-KEY` ≠ INSURER-KEY (VAL-SI-INR-CNS-06) · SI type Settings tab retain. **01c OBS:** empty EFF not forced (live density≥1) — soft CTA covered when EFF=0 · **idle-ok P2** (no product reopen). QA pack verify **1/8** missing `command_table` = **PROCESS OBS** — this QC consolidates **8/8**. **DENIED** printable/personnel flip · reopen L1/QC-01 · reopen SI type L1/QC-02 FE · reopen CTR/enrollment/EMPTY-DATE · module SI/CTR UAT · Phase1 DONE · seed. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Stamp `SIINRQA2-MSJBIMYU` · FE browser PASS | machine `overall=PASS` · fail_count=0 | 🟢 **ACCEPT** |
| AC-PLT-SI-INSURER-01d CREATE+F5 | PUT **200** `HRM-SI-INSURER-200` · key `hr_si_inr_msjbimyu` · F5 true · screen 02/03 | 🟢 **ACCEPT** |
| MUST_KEEP-SI-TYPE | Settings SI type tab visible · screen 03b | 🟢 **RETAIN** |
| AC-PLT-SI-INSURER-01-PICKER-SOT | GET `…/insurers/effective` **200** · MD hits=0 | 🟢 **ACCEPT** |
| **R-PLT-SI-INR-03** | Nest EFF SoT proven | ✅ **CLOSED ACCEPT** |
| AC-PLT-SI-INSURER-01 policy 201+F5 | POST **201** `HRM-INS-POL-201` · insurer=`hr_si_inr_msjbimyu` · F5 · screens 05–07 | 🟢 **ACCEPT** |
| AC-PLT-SI-INSURER-01b invent KEY | FE blocked · POST **400** `HRM-INS-INSURER-KEY` | 🟢 **ACCEPT** |
| VAL-SI-INR-CNS-06 peer TYPE-KEY | invent type **400** `HRM-INS-TYPE-KEY` ≠ INSURER-KEY | 🟢 **ACCEPT** |
| AC-PLT-SI-INSURER-01c empty EFF | density≥1 · CTA soft · no seed | 🟢 **ACCEPT** · OBS idle-ok |
| AC-PLT-SI-INSURER-01H honesty | false · seals RETAIN · C-SLICE | 🟢 **ACCEPT** |
| L1 QC-01 GWC · stamp `SIINRQA-MSJB1WLH` | Explicit RETAIN | 🟢 **RETAIN — not reopened** |
| SI type L1/QC-02 FE · CTR · enrollment · EMPTY-DATE | Explicit RETAIN | 🟢 **SEAL RETAIN** |
| invent ready / module SI/CTR UAT / Phase1 | Explicit DENIED | 🟢 **DENIED promote** |
| QA pack command_table miss | verify exit 1 · 1/8 | 🟡 **PROCESS OBS** — QC consolidates |
| Unauth effective / L0 stack | **401** · L0 **200** | 🟢 ENV OK |
| J-* module SI/CTR promote | Explicit DENIED | 🟢 |

**Cấm:** invent `contracts_printable_ready=true` / `hrm_personnel_uat_ready=true` · claim module SI/CTR UAT DONE · reopen L1 QA-01 / QC-01 GWC L1 · reopen SI type L1/QC-02 FE · reopen CTR legal-print · reopen enrollment EMP-BE-02 · reopen EMPTY-DATE CLOSED · reopen EMP/DEC/PAY/ATT/REC/EXT/LIST-TOTALS · seed as evidence · treat FE insurer GWC as module GO · flip ready flags · claim Phase1 DONE.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `contracts_printable_ready=true`? | **NO** |
| May PM set `hrm_personnel_uat_ready=true`? | **NO** |
| May PM reopen L1 QA-01 / QC-01 GWC L1? | **NO** |
| May PM reopen SI type L1 / QC-02 FE enrollment? | **NO** |
| May PM reopen CTR legal-print / enrollment / EMPTY-DATE? | **NO** |
| May PM claim module SI/CTR UAT / Phase1? | **NO** |
| May PM seal SI-INSURER-CATALOG **FE browser** slice? | **YES** — this seat GWC |
| May PM invent DOCS-01 / FE-01 / L1 retest? | **NO** — DOCS ACCEPT · FE READY closed · L1 sealed |
| Why | `C-SLICE-≠-MODULE` · Nest EFF insurer FE ≠ module SI/CTR UAT |
| Recommended flag state | keep **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false` LOCKED** |
| Forced residual dispatch this turn? | **U88** — ≥1 governance **ATT-WORKSITE** next (DATA/BE unlock) — prompt below |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QC-01 L1 GWC | `…-si-insurer-catalog-qc-01.md` | GWC L1-SEAL · FE HOLD | 🟢 **RETAIN — not reopened** |
| FE-01 Nest EFF wire | `…-si-insurer-catalog-fe-01.md` | READY · R-PLT-SI-INR-03 wire | 🟢 **ACCEPT closed** |
| DOCS-01 | board ACCEPT SRS v0.29 · HDSD CH06c | ACCEPT | 🟢 **RETAIN** |
| QA-02 | `…-si-insurer-catalog-qa-02.md` | PASS_TO_PM · `SIINRQA2-MSJBIMYU` | 🟢 **ACCEPT** |
| Machine JSON | `_tmp-…-qa-02-browser.json` | PASS · FE 201+F5 · invent KEY | 🟢 **ACCEPT** |
| Screens 01–07/03b | `screens/…-qa-02/` | CREATE toast · policy picker · F5 | 🟢 **ACCEPT** |
| Pack verify QA-02 | `verify:qc:evidence-pack` | exit **1** · missing `command_table` | 🟡 **PROCESS OBS** — QC consolidates |
| Live unauth spot (QC) | `GET …/insurers/effective?company_id=main` | **401** | 🟢 OK (not 404/500) |
| L0 `qc:dev-stack` (QC spot) | hrm/xbos/portal | **200** | 🟢 ENV OK |
| Peer SI type / EMPTY-DATE / CTR / enrollment | prior GWC | cited honesty | 🟢 **SEAL RETAIN** |

### Machine JSON spot (`SIINRQA2-MSJBIMYU`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `SIINRQA2-MSJBIMYU` | 🟢 |
| `overall` | **PASS** | 🟢 |
| `fail_count` / `critical_fail_count` | **0** / **0** | 🟢 |
| `honesty.contracts_printable_ready` | **false** | 🟢 |
| `honesty.hrm_personnel_uat_ready` | **false** | 🟢 |
| `honesty.deny_module_si_ctr_uat` | **true** | 🟢 |
| `honesty.c_slice_ne_module` | **true** | 🟢 |
| `honesty.seed_used` | **false** | 🟢 |
| `ac.AC-PLT-SI-INSURER-01d` | PUT **200** · key `hr_si_inr_msjbimyu` · F5 | 🟢 |
| `ac.AC-PLT-SI-INSURER-01-PICKER-SOT` | GET effective **200** · MD hits=0 | 🟢 |
| `ac.AC-PLT-SI-INSURER-01-POLICY` | POST **201** `HRM-INS-POL-201` · F5 | 🟢 |
| `ac.AC-PLT-SI-INSURER-01b` | **400** `HRM-INS-INSURER-KEY` · FE blocked | 🟢 |
| `ac.VAL-SI-INR-CNS-06-PEER-TYPE` | **400** `HRM-INS-TYPE-KEY` | 🟢 |
| `closed_residuals[0]` | R-PLT-SI-INR-03 **CLOSED** | 🟢 |
| `ack_status` | **PASS_TO_PM** | 🟢 |

---

## Gate AC audit (FE browser focus)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| 01d | Settings CREATE N+1 → 2xx → F5 | PUT **200** `HRM-SI-INSURER-200` · `hr_si_inr_msjbimyu` · F5 | 🟢 **ACCEPT** |
| PICKER-SOT | Policy GET `…/insurers/effective` not MD-alone | **200** · MD hits=0 · picker visible | 🟢 **ACCEPT** |
| R-PLT-SI-INR-03 | FE rebind Nest EFF | CLOSED this QA-02 | ✅ **CLOSED** |
| 01 | Policy Lưu ∈ EFF → 2xx → F5 | **201** `HRM-INS-POL-201` · F5 true | 🟢 **ACCEPT** |
| 01b | Invent ∉ EFF → `HRM-INS-INSURER-KEY` | **400** KEY · FE blocked | 🟢 **ACCEPT** |
| VAL-CNS-06 | Peer invent type → `HRM-INS-TYPE-KEY` | **400** TYPE-KEY ≠ INSURER-KEY | 🟢 **ACCEPT** |
| 01c | Empty EFF + CTA · no seed | density≥1 · soft CTA · no seed | 🟢 **ACCEPT** · OBS idle-ok |
| 01H | Honesty / seals / L1 retain | false · RETAIN · C-SLICE | 🟢 **ACCEPT** |
| — | invent ready / module SI/CTR UAT / Phase1 / reopen L1·SI-type·CTR·enrollment·EMPTY-DATE | Explicit non-claim | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-02 | QC |
|-----------------|-------|-------|-----|
| **SI-INSURER-CATALOG FE** Settings CREATE+F5 + policy Nest EFF + invent KEY (in-scope) | FE-01 READY | 🟢 PASS | 🟢 **PASS / ACCEPT** |
| **SI-INSURER-CATALOG L1** Nest INS/EFF | QC-01 GWC | not rewritten | 🟢 **RETAIN** |
| Proposed **J-HRM-INS-E3-01** insurer deepen | — | cited path PASS slice | 🟢 **PASS slice** · **DENY module promote** |
| Module SI·CTR UAT / printable UF | Historical seals | **not executed** | ⬜ **DEFERRED** — **DENY promote** |
| SI type FE enrollment / EMPTY-DATE / CTR / EMP-BE-02 | Prior GWC | cited retain | 🟢 **SEAL RETAIN** — **DENY reopen** |

**U19 note:** This gate certifies the **SI-INSURER-CATALOG FE browser** slice named in dispatch — **not** module SI/CTR UAT and **not** a re-open of L1. Missing full J-* module retest does **not** NO-GO this narrow FE pack; it **forces GWC CONDITIONS** (honesty false) and keeps printable/personnel=false.

---

## Defect / OBS disposition

| ID | Prior | QC disposition |
|----|-------|----------------|
| **R-PLT-SI-INR-03** | QC-01 HOLD → FE-01 | **CLOSED ACCEPT** — Nest EFF picker proven |
| AC-PLT-SI-INSURER-01c empty EFF | Soft CTA when EFF=0 | **OBS idle-ok P2** — density≥1 live · no wipe · no product reopen |
| QA pack command_table miss | verify exit 1 · 1/8 | **PROCESS OBS** — QC consolidates 8/8 |
| Stale-dist / product P0 | — | **NONE** |

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| QA-02 PASS stamp CREATE+F5 · GET effective · 201+F5 · invent KEY · peer TYPE-KEY | PRODUCT PASS | Yes → GWC ACCEPT FE SEAL |
| R-PLT-SI-INR-03 CLOSED | PRODUCT PASS | Yes → residual closed |
| Honesty / ready flips / L1·SI-type·CTR reopen | PRODUCT DENIED | Yes → CONDITIONS |
| 01c empty EFF not forced | PRODUCT OBS idle-ok | No — soft path covered |
| QA pack command_table miss | PROCESS OBS | No — QC consolidates |
| L0 stack 200 · unauth 401 | ENV OK | Spot-check only |

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **Honesty / C-SLICE** | — | **pm** | Keep printable/personnel=false · no module SI/CTR UAT / Phase1 invent · no L1/QC-01/SI-type/CTR/enrollment/EMPTY-DATE seal reopen |
| 01c empty EFF soft CTA | OBS P2 idle-ok | — | No forced Task — covered when EFF=0 |
| Peer seals L1 / SI type FE / CTR / EMP-BE-02 / EMPTY-DATE / EMP·DEC·PAY·ATT·REC·EXT·LIST-TOTALS | must_keep | — | **do not reopen** |
| **U88 continuous** | — | **pm** | Open **ATT-WORKSITE** DATA/BE deepen (SA/BA CONFIRMED) — prompt below · **do not invent** SI-INSURER DOCS/FE/L1 |

**No residual P0 product** on FE insurer AC pack.

---

## Evidence pack (QC consolidates 8/8)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-QC-02` |
| 2 | portal_url | ✅ `:5173` + api_base `:28001` |
| 3 | journey_l25 | ✅ Proposed **J-HRM-INS-E3-01** PASS slice · DENY module SI/CTR promote · FE Nest EFF path |
| 4 | crud_or_matrix | ✅ AC-PLT-SI-INSURER-01d / PICKER-SOT / 01 / 01b / VAL-CNS-06 matrix above |
| 5 | Classification | ✅ PRODUCT / PROCESS / ENV |
| 6 | Honesty locks | ✅ printable/personnel=false · L1/QC-01/SI-type/CTR/enrollment/EMPTY-DATE RETAIN · C-SLICE |
| 7 | Residual section | ✅ honesty · OBS 01c idle-ok · U88 ATT-WORKSITE next |
| 8 | Verdict + ack | ✅ **GO WITH CONDITIONS** · `PASS_TO_PM` |

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-qa-02.md` | exit **1** · missing `command_table` (1/8) | **PROCESS OBS** — QA seat |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-qc-02.md` | exit **0** · **PASS** · **8/8** (re-run after write) | QC pack SoT |
| QA-02 runner stamp `SIINRQA2-MSJBIMYU` | **PASS** · CREATE+F5 · GET effective · 201+F5 · invent KEY · peer TYPE-KEY | PRODUCT OK (cited machine JSON) |
| QC L0 `pnpm run qc:dev-stack` | hrm/xbos/portal **200** (node UV assert after print — non-blocking) | ENV OK |
| Unauth `GET …/insurers/effective?company_id=main` | **401** | ENV/AUTH OK |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON + screens audit + L0/unauth spot.

**L2.5 / journey:** Proposed **J-HRM-INS-E3-01** insurer path **PASS slice** — **DENY** module SI/CTR UAT re-promote this seat. In-scope = Nest EFF insurer FE UF only.

---

## Scope statement (bounded)

**IN scope ACCEPT:** AC-PLT-SI-INSURER-01d / PICKER-SOT / 01 / 01b · VAL-SI-INR-CNS-06 · R-PLT-SI-INR-03 CLOSED · U65 zero-seed · L1 QC-01 + SI type FE + CTR + enrollment + EMPTY-DATE seals retain · FE insurer slice **SEAL**.

**OUT of scope / DENIED:** Module SI/CTR UAT · printable/personnel flip · reopen L1/QC-01 · reopen SI type L1/QC-02 FE · reopen CTR/enrollment/EMPTY-DATE · Phase 1 DONE · seed · invent DOCS/FE/L1 retest · claim 01c empty-force as defect.

---

## completion_report

### Closed

1. Narrow QC GWC **SEAL** for SI-INSURER-CATALOG **FE browser** (Settings CREATE+F5 · policy Nest EFF · invent KEY · peer TYPE-KEY) complete.
2. QA stamp **`SIINRQA2-MSJBIMYU`** · U65 CREATE `hr_si_inr_msjbimyu` → **200**+F5 · GET `…/insurers/effective` · policy **201 `HRM-INS-POL-201`**+F5 · invent **400 `HRM-INS-INSURER-KEY`** · peer **400 `HRM-INS-TYPE-KEY`** **ACCEPT**.
3. **R-PLT-SI-INR-03 CLOSED** — Nest EFF picker SoT proven (not MD-alone).
4. Seals retained: L1 QA-01 + QC-01 GWC L1 · SI type L1/QC-02 FE · CTR legal-print · enrollment EMP-BE-02 · EMPTY-DATE CLOSED · EMP·DEC·PAY·ATT·REC·EXT·LIST-TOTALS **not reopened**.
5. Honesty locked: `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · DENIED module SI/CTR UAT / Phase1.
6. Verdict **GO WITH CONDITIONS** (FE-insurer-SEAL) — not full-module GO.

### Residual

- **CONDITION:** honesty / `C-SLICE-≠-MODULE` retained · DENIED ready flips / L1·SI-type·CTR·enrollment·EMPTY-DATE seal reopen.
- **OBS P2 idle-ok:** 01c empty EFF not forced live — soft CTA when EFF=0 · no forced Task.
- **U88 continuous:** next vertical **ATT-WORKSITE** DATA/BE deepen (SA/BA CONFIRMED on W8 board).

---

## next_owner

**pm** → Task **ba-data** (or **dev-be** if DATA already CONFIRMED) **ATT-WORKSITE-CATALOG** deepen · honesty false · cấm reopen SI-INSURER L1/FE / SI type / CTR / enrollment / EMPTY-DATE seals

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DATA-01
from_role: pm
to_role: ba-data
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
prior: SI-INSURER-CATALOG-QC-02 GWC FE SEAL stamp SIINRQA2-MSJBIMYU · R-PLT-SI-INR-03 CLOSED
ref_qc: docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-qc-02.md
ref_sa: ATT-WORKSITE-CATALOG-SA-01 CONFIRMED Option B
ref_ba: ATT-WORKSITE-CATALOG-BA-01 CONFIRMED · BE UNLOCK deepen
retain: SI-INSURER L1 SIINRQA-MSJB1WLH · QC-01 GWC L1 · QC-02 FE SEAL · SI type L1/QC-02 FE · CTR · enrollment · EMPTY-DATE CLOSED — do NOT reopen

## entry_criteria
- Read W8 board ATT-WORKSITE SA-01 + BA-01 CONFIRMED
- SI-INSURER QC-02 GWC sealed; honesty contracts_printable_ready=false · hrm_personnel_uat_ready=false LOCKED
- U65 · C-SLICE-≠-MODULE

## task
Physical DATA pack for ATT work-sites catalog deepen (soft-retire + list active filter · GEO-001):
- ADD/CONFIRM DB_DESIGN columns/FK/index for work-site catalog deepen vs BA AC-PLT-ATT-WORKSITE-01*
- Unlock BE-01 only after DATA CONFIRMED
- DENY invent module ATT UAT · DENY flip printable/personnel · DENY reopen SI-INSURER / SI type seals
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-data-01.md (or program specs path per map)

## cấm
seed · flip ready flags · invent module ATT/SI/CTR UAT · reopen SI-INSURER L1/QC-01/QC-02 · reopen SI type · claim Phase1 DONE

## exit
PASS_TO_PM | CONFIRMED · completion_report · next_owner · next_dispatch_prompt · evidence_path · ack_status
```

---

## evidence_path

`docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-qc-02.md`

## ack_status

**PASS_TO_PM**

## contracts_printable_ready

**false**

## hrm_personnel_uat_ready

**false**

## C-SLICE-≠-MODULE

**RETAIN**
