# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **MERGE-TOKEN-EMP slice only** · Settings DOC/ET → register-on-save `emp.doc.*` / `emp.et.*` · **not** module EMP UAT · **not** printable · **not** `custom.emp` LIVE |
| **priority** | P0 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-QA-01` PASS_TO_PM §9 |
| **prior_devops** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DEVOPS-01` · stamp `EMPTOKDEVOPS-6A75EE71` · closes `D-EMP-TOK-STALE-DIST` |
| **prior_fail** | stamp `EMPTOKQA-MSJ1R7MT` (stale dist · empty merge-tokens) — **superseded** by §9 |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · **api_base** `http://127.0.0.1:28001/api/hrm` |
| **journey_l25** | **N/A deferred** — Settings DOC/ET → merge-tokens UF (U65) · **no** J-* promote · `C-SLICE-≠-MODULE` |
| **crud_or_matrix** | AC-PLT-EMP-TOK-01..03+05 · STALE-DIST-PROBE · must_keep seals/XBOS/contracts/keyword_map |
| **Verdict** | **GO WITH CONDITIONS** — MERGE-TOKEN-EMP SEAL ACCEPT · `D-EMP-TOK-STALE-DIST` **CLOSED** · CONDITION: `R-EMP-TOK-EXT` HOLD · **`C-SLICE-≠-MODULE`** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-dynamic-config-platform-merge-token-emp-qa-01.md`](po-hrm-dynamic-config-platform-merge-token-emp-qa-01.md) §9 |
| **devops_ref** | [`po-hrm-dynamic-config-platform-merge-token-emp-devops-01.md`](po-hrm-dynamic-config-platform-merge-token-emp-devops-01.md) |
| **machine** | [`_tmp-po-hrm-dynamic-config-platform-merge-token-emp-qa-01-browser.json`](_tmp-po-hrm-dynamic-config-platform-merge-token-emp-qa-01-browser.json) · stamp **`EMPTOKQA-MSJ290VB`** |
| **screens** | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-merge-token-emp-qa-01/` (01–05 · 99-final) |
| **stamp_ref** | QA `EMPTOKQA-MSJ290VB` · DevOps `EMPTOKDEVOPS-6A75EE71` · prior FAIL `EMPTOKQA-MSJ1R7MT` |
| **spec_ref** | AC-PLT-EMP-TOK-01..03+05 · SA Option B register-on-save · DATA emp_catalog CHK · BE-01 |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — slice GWC ≠ personnel UAT / printable / Phase1 / `custom.emp` LIVE / reopen EMP-QC |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`hrm_personnel_uat_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **`employees_e2e_linkage_ready`** | **`false`** | **DENIED** invent / promote |
| **`contracts_printable_ready`** | **`false`** | **DENIED** invent / promote |
| **`custom.emp.*` LIVE** | **HOLD** | **DENIED** invent — `R-EMP-TOK-EXT` |
| **EMP-QC-01 / EMP-QC-02** | **SEAL RETAIN** | **cấm reopen** |
| **Module EMP UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module seal |
| **J-* L2.5 promote** | **DENIED / deferred** | Out of scope this seat |
| **Seed** | **DENIED** (U65) | QA browser zero-seed |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT MERGE-TOKEN-EMP browser U65 after DevOps rebuild closed `D-EMP-TOK-STALE-DIST` + QA retest stamp **`EMPTOKQA-MSJ290VB`** (`overall=PASS` · `summary.pass=14` · `fail=0` · honesty all **false** · `stale_dist.verdict=OK`). Audited QA MD §9 + machine JSON + DevOps-01 + live unauth spot **401** + dist register/`emp_catalog` present. Proven: Settings DOC PUT **200** → F5 GET merge-tokens hit `emp.doc.hr_doc_tok_msj290vb` `origin=emp_catalog` · ET create+normalize → `emp.et.seasonal_tok_msj290vb` + `emp.et.full_time` · retire **201** hides seasonal from active · resolve-preview registry labels + `emp.doc.cccd` `source=missing` (no invent) · must_keep contracts/SI/catalog-sync/builtin + EMP-QC not reopened + `custom.emp` not claimed LIVE. QA pack verify **2/8** (missing `command_table` / `journey_l25`) = **PROCESS OBS** — this QC consolidates **8/8** with explicit **N/A deferred J-***. **DENIED** personnel UAT · e2e · printable · `custom.emp` LIVE · reopen EMP-QC · Phase1 DONE · seed. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Stamp `EMPTOKQA-MSJ290VB` · 14/14 | machine `overall=PASS` · `summary.fail=0` | 🟢 **ACCEPT** |
| `D-EMP-TOK-STALE-DIST` CLOSED | DevOps-01 + QA §9 dist OK + live unauth **401** + register.js PRESENT | 🟢 **CLOSED** |
| AC-PLT-EMP-TOK-01 DOC→token | PUT 200 · GET hit `emp.doc.*` `emp_catalog` | 🟢 **ACCEPT** |
| AC-PLT-EMP-TOK-02 ET→token + retire | create/normalize + retire hide | 🟢 **ACCEPT** |
| AC-PLT-EMP-TOK-03 resolve-preview | registry labels · CCCD missing | 🟢 **ACCEPT** |
| AC-PLT-EMP-TOK-05 must_keep | contracts/SI/sync/builtin · seals | 🟢 **ACCEPT** |
| STALE-DIST-PROBE | register + `emp_catalog` + DOC/ET hooks | 🟢 **ACCEPT** |
| U65 zero-seed | QA + machine `seed_used=false` | 🟢 **ACCEPT** |
| Honesty ready flags false | MD §9.5 + JSON | 🟢 **DENIED promote** |
| `R-EMP-TOK-EXT` custom.emp | HOLD | 🟡 **CONDITION OPEN** (not claim LIVE) |
| QA pack 2/8 | verify exit 1 | 🟡 **PROCESS OBS** — QC consolidates |
| Module UAT / printable / Phase1 / reopen EMP-QC | Explicit DENIED | 🟢 |

**Cấm:** invent `hrm_personnel_uat_ready=true` · invent `employees_e2e_linkage_ready` · invent `contracts_printable_ready` · invent `custom.emp` LIVE · claim module EMP UAT DONE · reopen EMP-QC-01/02 · seed as evidence · treat slice GWC as module GO.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `hrm_personnel_uat_ready=true`? | **NO** |
| May PM set `employees_e2e_linkage_ready=true`? | **NO** |
| May PM set `contracts_printable_ready=true`? | **NO** |
| May PM claim `custom.emp.*` LIVE? | **NO** — `R-EMP-TOK-EXT` HOLD |
| May PM reopen EMP-QC-01/02? | **NO** |
| Why | `C-SLICE-≠-MODULE` · MERGE-TOKEN-EMP register ≠ personnel/module UAT |
| Recommended flag state | keep honesty flags **`false` LOCKED** |
| May PM claim MERGE-TOKEN-EMP AC-PLT-EMP-TOK SEALED? | **YES** — this seat GWC slice-SEAL |
| May PM claim module EMP UAT / Phase1 / J-* / printable? | **NO** |
| Forced residual dispatch this turn? | **U88** — W8 peer **DEC-QA-02** (FE READY) · `R-EMP-TOK-EXT` idle-ok HOLD until DEC/EMP FE |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| Prior FAIL | stamp `EMPTOKQA-MSJ1R7MT` | FAIL_TO_PM · empty merge-tokens · stale dist | **SUPERSEDED** |
| DevOps-01 | `…-merge-token-emp-devops-01.md` | READY_FOR_QA · `EMPTOKDEVOPS-6A75EE71` | **ACCEPT** · `D-EMP-TOK-STALE-DIST` CLOSED |
| QA-01 §9 retest | `…-merge-token-emp-qa-01.md` §9 | PASS_TO_PM · 14/14 | **ACCEPT** |
| Machine JSON | `_tmp-…-qa-01-browser.json` | stamp `EMPTOKQA-MSJ290VB` · PASS | **ACCEPT** |
| Screens | 01–05 · 99-final | Settings DOC/ET path | **ACCEPT** (path present) |
| Pack verify QA-01 | `verify:qc:evidence-pack` | exit **1** · **2/8** | 🟡 **PROCESS OBS** — QC consolidates |
| Live unauth spot (QC) | `GET …/merge-tokens?domain=EMP&company_id=holding` | **401** | 🟢 CLOSED stale-dist |
| Dist spot (QC) | `emp-merge-token-register.js` + `emp_catalog` | **PRESENT** | 🟢 |

### Machine JSON spot (`EMPTOKQA-MSJ290VB`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `EMPTOKQA-MSJ290VB` | 🟢 |
| `overall` / `summary` | **PASS** · pass **14** · fail **0** | 🟢 |
| `stale_dist.verdict` | **OK** · register + `emp_catalog` + DOC/ET hooks | 🟢 |
| `honesty.hrm_personnel_uat_ready` | **false** | 🟢 |
| `honesty.employees_e2e_linkage_ready` | **false** | 🟢 |
| `honesty.contracts_printable_ready` | **false** | 🟢 |
| `honesty.deny_custom_emp_live` / `r_emp_tok_ext_hold` | **true** | 🟢 |
| `honesty.deny_reopen_emp_qc` | **true** | 🟢 |
| `honesty.seed_used` | **false** | 🟢 |
| AC-PLT-EMP-TOK-01 | hit `emp.doc.hr_doc_tok_msj290vb` `origin=emp_catalog` | 🟢 |
| AC-PLT-EMP-TOK-02 | `emp.et.seasonal_tok_msj290vb` + `emp.et.full_time` · retire hide | 🟢 |
| AC-PLT-EMP-TOK-03 | registry labels · `emp.doc.cccd` `source=missing` | 🟢 |
| mustKeep | contracts **200** · SI **200** · sync **200** · builtin · empQcNotReopened · customEmpNotClaimedLive | 🟢 |
| `residuals` | `[]` (product) · EXT HOLD in honesty | 🟡 CONDITION EXT |
| `ack_status` | **PASS_TO_PM** | 🟢 |

---

## Gate AC audit (AC-PLT-EMP-TOK)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| 01 | DOC Lưu → F5 merge-tokens `emp.doc.<key>` `origin=emp_catalog` | PUT **200** · GET hit stamp key | 🟢 **ACCEPT** |
| 02 | ET create/normalize → `emp.et.*`; retire hide | PUT **200** · tokens present · retire **201** active hide | 🟢 **ACCEPT** |
| 03 | resolve-preview catalog labels; no invent CCCD | **201** registry · CCCD **missing** | 🟢 **ACCEPT** |
| 05 | must_keep seals/XBOS/contracts/keyword_map | contracts/SI/sync/builtin OK · EMP-QC not reopened · custom.emp HOLD | 🟢 **ACCEPT** |
| STALE | register + `emp_catalog` live | OK (DevOps+QA+QC spot) | 🟢 **ACCEPT** |
| — | `custom.emp.*` LIVE | not claimed | 🟡 **CONDITION HOLD** `R-EMP-TOK-EXT` |
| — | Module UAT / printable / Phase1 / reopen EMP-QC | Explicit non-claim | 🟢 **DENIED** |

---

## Defect / OBS disposition

| ID | Prior | QC disposition |
|----|-------|----------------|
| **D-EMP-TOK-STALE-DIST** | P0 runtime missing register/`emp_catalog` | **CLOSED** — DevOps rebuild + QA §9 PASS + QC live 401 + dist PRESENT |
| **R-EMP-TOK-EXT** | P2 HOLD `custom.emp.*` LIVE | **CONDITION OPEN** — idle-ok until DEC/EMP FE; **DENIED** invent LIVE this seat |
| Prior FAIL `EMPTOKQA-MSJ1R7MT` | empty merge-tokens | **SUPERSEDED** |
| QA pack missing 2 fields | verify 2/8 | **PROCESS OBS** — QC consolidates 8/8 |
| L1/product blockers on TOK-01..03+05 | none | **NONE** — do not invent defect |

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| QA §9 14/14 PASS stamp `EMPTOKQA-MSJ290VB` | PRODUCT PASS | Yes → GWC ACCEPT slice SEAL |
| `D-EMP-TOK-STALE-DIST` closed (401 + dist) | PRODUCT CLOSED | Yes → prior FAIL superseded |
| `R-EMP-TOK-EXT` custom.emp HOLD | PRODUCT CONDITION | Yes → CONDITIONS (not NO-GO) |
| QA pack 2/8 | PROCESS OBS | No — QC consolidates |
| Live unauth 401 / HRM 200 | ENV OK / PRODUCT OK | Spot-check only |

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **R-EMP-TOK-EXT** | P2 HOLD | **pm** → after DEC/EMP FE | `custom.emp.*` LIVE — **do not invent** this seat |
| **C-SLICE-≠-MODULE** | — | **pm** | Keep personnel/e2e/printable **false** · no module EMP UAT / Phase1 invent |
| EMP-QC-01/02 | must_keep | — | **do not reopen** |
| W8 peer continuous | U88 | **pm** | Dispatch **DEC-QA-02** (DEC-FE READY) — not idle program |

---

## Evidence pack (QC consolidates 8/8)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-QC-01` |
| 2 | portal_url | ✅ `:5173` + api_base `:28001` |
| 3 | journey_l25 | ✅ **N/A deferred** — Settings DOC/ET→merge-tokens UF · no J-* promote |
| 4 | crud_or_matrix | ✅ AC-PLT-EMP-TOK-01..03+05 matrix above |
| 5 | Classification | ✅ PRODUCT / PROCESS |
| 6 | Honesty locks | ✅ personnel/e2e/printable **false** · custom.emp HOLD · DENIED flips |
| 7 | Residual section | ✅ R-EMP-TOK-EXT + C-SLICE · D CLOSED · U88 DEC-QA-02 |
| 8 | Verdict + ack | ✅ **GO WITH CONDITIONS** · `PASS_TO_PM` |

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-qa-01.md` | exit **1** · **2/8** (`command_table` · `journey_l25`) | **PROCESS OBS** — QA seat |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-qc-01.md` | exit **0** · **PASS** · **8/8** | QC pack SoT (re-run after write) |
| QA-01 runner stamp `EMPTOKQA-MSJ290VB` | **PASS** · 14/14 · fail 0 | PRODUCT OK (cited machine JSON) |
| DevOps-01 unauth merge-tokens + rebuild | **401** not 404 · register/`emp_catalog` live | PRODUCT OK — `D-EMP-TOK-STALE-DIST` CLOSED |
| QC live spot unauth `:28001` merge-tokens?domain=EMP&company_id=holding | **401** | PRODUCT OK (spot-check) |
| QC dist spot `emp-merge-token-register.js` + `emp_catalog` | **PRESENT** | PRODUCT OK |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON audit + unauth/dist spot.

**L2.5 / journey:** No J-* in-scope this seat — **deferred**. Explicit: personnel/module J-* = **N/A / not tested** for this MERGE-TOKEN-EMP gate.

---

## Scope statement (bounded)

**IN scope ACCEPT:** AC-PLT-EMP-TOK-01..03+05 · STALE-DIST CLOSED · U65 Settings DOC/ET → merge-tokens · must_keep contracts/SI/catalog/builtin · EMP-QC seals retained · honesty LOCKED false.

**OUT of scope / DENIED:** Module EMP UAT · personnel ready flip · employees e2e · contracts printable · `custom.emp` LIVE · reopen EMP-QC-01/02 · J-* L2.5 promote · Phase 1 DONE · seed.

**NOT Phase 1 DONE.**

---

## completion_report

### Closed

1. Narrow QC GWC **SEAL** for MERGE-TOKEN-EMP (AC-PLT-EMP-TOK-01..03+05) complete.
2. QA stamp **`EMPTOKQA-MSJ290VB`** · **14/14** · U65 browser Settings DOC/ET→merge-tokens **ACCEPT**.
3. **`D-EMP-TOK-STALE-DIST` CLOSED** (DevOps `EMPTOKDEVOPS-6A75EE71` + QA §9 + QC live 401 + dist PRESENT).
4. must_keep seals/XBOS/contracts/keyword_map retained · EMP-QC not reopened · `custom.emp` not claimed LIVE.
5. Honesty locked: personnel/e2e/printable **false** · no module EMP UAT / Phase1 invent.
6. Verdict **GO WITH CONDITIONS** (slice-SEAL) — not full-module GO.

### Residual

- **CONDITION:** `R-EMP-TOK-EXT` (`custom.emp.*` LIVE) **HOLD** — idle-ok until DEC/EMP FE; **DENIED** invent.
- **`C-SLICE-≠-MODULE`** retained.
- **U88 continuous:** W8 peer **DEC-QA-02** (DEC-FE READY) — do not idle program on this seat seal alone.

---

## next_owner

**pm** → dispatch **`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QA-02`** (`qa`) · retain `R-EMP-TOK-EXT` HOLD

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QA-02
from_role: pm
to_role: qa
lane: execution
priority: P0
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-01 READY · peer seal PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-QC-01 GWC
program: PO-HRM-CONTINUOUS-W8-20260807
ref_qc_peer: docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-qc-01.md
ref_fe: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-fe-01.md (or READY handoff)
stamp_peer: EMPTOKQA-MSJ290VB · EMPTOK-QC GWC · D-EMP-TOK-STALE-DIST CLOSED

## entry_criteria
DEC-FE-01 READY; L0 stack up; U65 zero-seed; honesty LOCKED false; DEC L1 QC-01 SEAL retained (cấm reopen)

## task
U65 browser Settings DEC open catalog + picker:
- create Loại QSĐ → 2xx → F5 persist → picker shows new key
- format/UNKNOWN reject deterministic toast
- retire → picker hide + history
- must_keep: DEC L1 SEAL · MERGE-TOKEN-EMP GWC · EMP-QC seals · no invent custom.emp LIVE · no personnel/printable flip
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qa-02.md
- closes: R-PLT-DEC-FE browser residual (if named)

## cấm
seed · flip hrm_personnel_uat_ready / employees_e2e / printable · claim module DEC/EMP UAT DONE · invent custom.emp LIVE · reopen sealed GWC

## exit
PASS_TO_PM or FAIL_TO_PM · completion_report · next_owner qc · next_dispatch_prompt · evidence_path
```

---

## evidence_path

`docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-qc-01.md`

## ack_status

**PASS_TO_PM**

## hrm_personnel_uat_ready

**false**

## employees_e2e_linkage_ready

**false**

## contracts_printable_ready

**false**

## custom.emp LIVE

**DENIED** (`R-EMP-TOK-EXT` HOLD)
