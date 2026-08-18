# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **AC-PLT-EMP-TOK-04* narrow only** · allow-list EMP field → `custom.emp.<code>` `origin=extension_field` · **not** module EMP UAT · **not** printable · **not** invent LIVE beyond AC-04 seal |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-QA-01` PASS_TO_PM stamp **`EMPTOKEXTQA-MSJ57PE1`** |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · **api_base** `http://127.0.0.1:28001/api/hrm` |
| **journey_l25** | **N/A deferred** — Settings EMP field allow-list → merge-tokens UF (U65) · **no** J-* promote · `C-SLICE-≠-MODULE` |
| **crud_or_matrix** | AC-PLT-EMP-TOK-04 / 04-RETIRE / 04b / 04c / 04H · STALE-DIST-PROBE · MUST_KEEP-SURFACE |
| **Verdict** | **GO WITH CONDITIONS** — MERGE-TOKEN-EMP-EXT **SEAL ACCEPT** · **`R-EMP-TOK-EXT` SEALED/CLOSED** · CONDITION: honesty LOCKED false · Group HR dialog P3 OBS · **`C-SLICE-≠-MODULE`** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-dynamic-config-platform-merge-token-emp-ext-qa-01.md`](po-hrm-dynamic-config-platform-merge-token-emp-ext-qa-01.md) |
| **be_ref** | [`po-hrm-dynamic-config-platform-merge-token-emp-ext-be-01.md`](po-hrm-dynamic-config-platform-merge-token-emp-ext-be-01.md) |
| **peer_gwc** | [`po-hrm-dynamic-config-platform-merge-token-emp-qc-01.md`](po-hrm-dynamic-config-platform-merge-token-emp-qc-01.md) · stamp **`EMPTOKQA-MSJ290VB`** · **SEAL RETAIN** (cấm reopen) |
| **machine** | [`_tmp-po-hrm-dynamic-config-platform-merge-token-emp-ext-qa-01-browser.json`](_tmp-po-hrm-dynamic-config-platform-merge-token-emp-ext-qa-01-browser.json) · stamp **`EMPTOKEXTQA-MSJ57PE1`** |
| **screens** | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-merge-token-emp-ext-qa-01/` (`00-cc` · `01-group-hr` · `02-cfg-dialog`) |
| **stamp_ref** | QA `EMPTOKEXTQA-MSJ57PE1` · peer DOC/ET `EMPTOKQA-MSJ290VB` |
| **spec_ref** | AC-PLT-EMP-TOK-04/04b/04c · BA CONFIRMED · F-EMP-TOK-03 · SA Option B′ |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — EXT GWC ≠ personnel UAT / printable / Phase1 / invent LIVE / reopen EMP-QC / DEC / CTR |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`hrm_personnel_uat_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **`employees_e2e_linkage_ready`** | **`false`** | **DENIED** invent / promote |
| **`contracts_printable_ready`** | **`false`** | **DENIED** invent / promote |
| **`custom.emp.*` LIVE invent** | **DENIED** | AC-04* path **SEALED** ≠ claim platform/module LIVE invent |
| **`R-EMP-TOK-EXT`** | **SEALED / CLOSED** | Product residual closed this seat (AC pack 8/8) |
| **MERGE-TOKEN-EMP GWC / EMP-QC / DEC / CTR** | **SEAL RETAIN** | **cấm reopen** |
| **Module EMP UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module seal |
| **J-* L2.5 promote** | **DENIED / deferred** | Out of scope this seat |
| **Seed** | **DENIED** (U65) | QA browser zero-seed · `seed_used=false` |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow AC-PLT-EMP-TOK-04* after QA stamp **`EMPTOKEXTQA-MSJ57PE1`** (`overall=PASS` · rollup pass **8** · fail **0** · honesty all **false** · `stale_dist.verdict=OK`). Audited QA MD + machine JSON + screens path + live unauth merge-tokens **401** + dist `upsertEmpExtensionFieldMergeToken` / `extension_field` / settings `registerEmpExtensionMergeToken` **PRESENT**. Proven: allow-list `hrm_employee_basic_fields` extension POST **201** `HRM-SET-209` → GET merge-tokens hit `custom.emp.qa_ext_tok_msj57pe1` `origin=extension_field` `ring=custom` `status=active` `extension_field_ref=qa_ext_tok_msj57pe1` `domain=EMP` · retire DELETE **200** active hide · `leave_types` non-allow **201** → no `custom.emp.qa_leave_*` · employee `custom_fields` PATCH **200** → no orphan token · peer DOC/ET stamp retain · no GWC reopen. QA pack verify **1/8 fail** (`journey_l25`) = **PROCESS OBS** — this QC consolidates **8/8** with explicit **N/A deferred J-***. **`R-EMP-TOK-EXT` SEALED/CLOSED.** **DENIED** personnel UAT · e2e · printable · invent LIVE · reopen MERGE-TOKEN-EMP / EMP-QC / DEC / CTR · Phase1 DONE · seed. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Stamp `EMPTOKEXTQA-MSJ57PE1` · 8/8 | machine `overall=PASS` · `rollup.fail=0` | 🟢 **ACCEPT** |
| STALE-DIST-PROBE F-EMP-TOK-03 | QA OK after watch rebuild · QC dist PRESENT upsert+extension_field+settings hook | 🟢 **ACCEPT** · no `D-EMP-TOK-EXT-STALE-DIST` |
| AC-PLT-EMP-TOK-04 allow-list → token | POST 201 · hit `custom.emp.qa_ext_tok_msj57pe1` origin=`extension_field` | 🟢 **ACCEPT** |
| AC-PLT-EMP-TOK-04-RETIRE | DELETE 200 · active hide | 🟢 **ACCEPT** |
| AC-PLT-EMP-TOK-04b non-allow | leave_types 201 · no custom.emp | 🟢 **ACCEPT** |
| AC-PLT-EMP-TOK-04c value PATCH | employee PATCH 200 · no orphan token | 🟢 **ACCEPT** |
| AC-PLT-EMP-TOK-04H honesty | flags false · deny LIVE/reopen · peer retain | 🟢 **ACCEPT** |
| MUST_KEEP / peer seals | EMPTOKQA-MSJ290VB retain · no reopen | 🟢 **ACCEPT** |
| U65 zero-seed | QA + machine `seed_used=false` · portal-session mutate | 🟢 **ACCEPT** |
| `R-EMP-TOK-EXT` | AC pack complete | 🟢 **SEALED / CLOSED** |
| invent `custom.emp` LIVE / module UAT | Explicit DENIED | 🟢 **DENIED promote** |
| Group HR dialog UI | `group_hr_ui.ok=false` → portal_fetch fallback | 🟡 **CONDITION OBS P3** (not NO-GO; still U65 zero-seed) |
| QA pack journey_l25 miss | verify exit 1 · 7/8 | 🟡 **PROCESS OBS** — QC consolidates |
| Module UAT / printable / Phase1 / reopen peers | Explicit DENIED | 🟢 |

**Cấm:** invent `hrm_personnel_uat_ready=true` · invent e2e/printable · invent `custom.emp` LIVE beyond AC-04 seal · claim module EMP UAT DONE · reopen MERGE-TOKEN-EMP GWC / EMP-QC / DEC / CTR · seed as evidence · treat slice GWC as module GO · wipe GĐ1 seals · flip ready flags.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `hrm_personnel_uat_ready=true`? | **NO** |
| May PM set `employees_e2e_linkage_ready=true`? | **NO** |
| May PM set `contracts_printable_ready=true`? | **NO** |
| May PM invent `custom.emp.*` LIVE (module/platform claim)? | **NO** — AC-04* path SEALED only |
| May PM reopen MERGE-TOKEN-EMP GWC / EMP-QC / DEC / CTR? | **NO** |
| May PM claim `R-EMP-TOK-EXT` closed? | **YES** — this seat SEAL |
| May PM claim module EMP UAT / Phase1 / J-* / printable? | **NO** |
| Why | `C-SLICE-≠-MODULE` · EXT register ≠ personnel/module UAT |
| Recommended flag state | keep honesty flags **`false` LOCKED** |
| Forced residual dispatch this turn? | **U88** — ≥1 **sa** (or ba-process) next platform vertical (PAY catalog AC-PLT-PAY-01 Option/F.1) · optional FE P3 Group HR dialog idle-ok |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| Peer MERGE-TOKEN-EMP QC | `…-merge-token-emp-qc-01.md` · `EMPTOKQA-MSJ290VB` | GWC · prior `R-EMP-TOK-EXT` HOLD | **SEAL RETAIN** — not reopened |
| EXT-BE-01 | `…-ext-be-01.md` | READY_FOR_QA · F-EMP-TOK-03 | **ACCEPT** (cited) |
| EXT-QA-01 | `…-ext-qa-01.md` | PASS_TO_PM · 8/8 · `EMPTOKEXTQA-MSJ57PE1` | **ACCEPT** |
| Machine JSON | `_tmp-…-ext-qa-01-browser.json` | stamp PASS · fail 0 | **ACCEPT** |
| Screens | 00 / 01 / 02 | path present (`01-group-hr.png` verified) | **ACCEPT** |
| Pack verify QA-01 | `verify:qc:evidence-pack` | exit **1** · missing `journey_l25` | 🟡 **PROCESS OBS** — QC consolidates |
| Live unauth spot (QC) | `GET …/merge-tokens?domain=EMP&company_id=holding` | **401** | 🟢 OK (not 404/500) |
| Dist spot (QC) | `emp-merge-token-register.js` upsert+`extension_field` · settings hook | **PRESENT** · mtime 2026-08-07T16:07:25Z | 🟢 |

### Machine JSON spot (`EMPTOKEXTQA-MSJ57PE1`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `EMPTOKEXTQA-MSJ57PE1` | 🟢 |
| `overall` / `rollup` | **PASS** · pass **8** · fail **0** | 🟢 |
| `stale_dist.verdict` | **OK** · upsert + EMP_EXTENSION keys + extension_field + settings hook | 🟢 |
| `honesty.hrm_personnel_uat_ready` | **false** | 🟢 |
| `honesty.employees_e2e_linkage_ready` | **false** | 🟢 |
| `honesty.contracts_printable_ready` | **false** | 🟢 |
| `honesty.deny_custom_emp_live` | **true** | 🟢 |
| `honesty.deny_reopen_emp_qc` / `deny_reopen_merge_token_emp_gwc` | **true** | 🟢 |
| `honesty.peer_stamp_retain` | `EMPTOKQA-MSJ290VB` | 🟢 |
| `honesty.seed_used` | **false** | 🟢 |
| AC-PLT-EMP-TOK-04 | hit `custom.emp.qa_ext_tok_msj57pe1` `origin=extension_field` `ring=custom` | 🟢 |
| AC-04-RETIRE | DELETE 200 · `hiddenActive=true` | 🟢 |
| AC-04b | leave_types 201 · `newCustomKeys=[]` | 🟢 |
| AC-04c | PATCH 200 · `afterOrphanToken=null` | 🟢 |
| AC-04H / MUST_KEEP | honesty PASS · seals retain | 🟢 |
| `group_hr_ui.ok` | **false** · portal_fetch fallback | 🟡 OBS P3 |
| `residuals` | `[]` | 🟢 product empty → EXT seal |
| `ack_status` | **PASS_TO_PM** | 🟢 |

---

## Gate AC audit (AC-PLT-EMP-TOK-04*)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| 04 | Allow-list EMP field append → 2xx → `custom.emp.<code>` origin=`extension_field` ring=`custom` active | POST **201** · GET hit stamp key | 🟢 **ACCEPT** |
| 04-RETIRE | Retire → hide active token | DELETE **200** · absent active | 🟢 **ACCEPT** |
| 04b | Non-allow-list → no `custom.emp` | leave_types **201** · no token | 🟢 **ACCEPT** |
| 04c | Employee `custom_fields` PATCH alone → no token | PATCH **200** · no orphan | 🟢 **ACCEPT** |
| 04H | Honesty false · DENY LIVE invent · seals retain | LOCKED | 🟢 **ACCEPT** |
| STALE | F-EMP-TOK-03 in dist | OK (QA+QC) | 🟢 **ACCEPT** |
| — | `R-EMP-TOK-EXT` product residual | AC pack complete | 🟢 **SEALED** |
| — | invent LIVE / module UAT / printable / Phase1 / reopen peers | Explicit non-claim | 🟢 **DENIED** |

---

## Defect / OBS disposition

| ID | Prior | QC disposition |
|----|-------|----------------|
| **R-EMP-TOK-EXT** | P2 product HOLD (custom.emp path) | **SEALED / CLOSED** — AC-04* 8/8 ACCEPT · still **DENIED** invent LIVE / personnel UAT |
| Group HR dialog UI miss | P3 QA note | **CONDITION OBS** — portal-session fetch still U65; optional FE polish · **not** NO-GO |
| QA pack missing journey_l25 | verify 7/8 | **PROCESS OBS** — QC consolidates 8/8 |
| `D-EMP-TOK-EXT-STALE-DIST` | — | **NONE** — dist OK · no open stale residual |
| L1/product blockers on TOK-04* | none | **NONE** — do not invent defect |
| must_keep contracts probe 404 | QA non-blocking | **OBS** — does not reopen CTR; seals not touched |

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| QA 8/8 PASS stamp `EMPTOKEXTQA-MSJ57PE1` | PRODUCT PASS | Yes → GWC ACCEPT EXT SEAL |
| Stale-dist F-EMP-TOK-03 OK | PRODUCT OK | Yes → no DevOps residual |
| `R-EMP-TOK-EXT` closed | PRODUCT CLOSED | Yes → seal residual |
| invent LIVE / honesty flips | PRODUCT DENIED | Yes → CONDITIONS (not full GO) |
| Group HR dialog fallback | PRODUCT OBS P3 | Soft CONDITION only |
| QA pack journey_l25 miss | PROCESS OBS | No — QC consolidates |
| Live unauth 401 / dist PRESENT | ENV OK / PRODUCT OK | Spot-check only |

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **Honesty / C-SLICE** | — | **pm** | Keep personnel/e2e/printable **false** · no module EMP UAT / Phase1 invent · no invent LIVE |
| **R-FE-GROUP-HR-DIALOG** (optional) | P3 OBS | **pm** → `dev-fe` if polish | Group HR `Cấu hình chi tiết` dialog open reliability — **idle-ok** this seat |
| Peer seals MERGE-TOKEN-EMP / EMP-QC / DEC / CTR | must_keep | — | **do not reopen** |
| **U88 continuous** | — | **pm** | Dispatch **sa** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01` (AC-PLT-PAY-01 Option/F.1) — do not idle program on EXT seal alone |

**No residual:** `R-EMP-TOK-EXT` (CLOSED this seat).

---

## Evidence pack (QC consolidates 8/8)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-QC-01` |
| 2 | portal_url | ✅ `:5173` + api_base `:28001` |
| 3 | journey_l25 | ✅ **N/A deferred** — Settings allow-list→merge-tokens UF · no J-* promote · L2.5 deferred |
| 4 | crud_or_matrix | ✅ AC-PLT-EMP-TOK-04* matrix above |
| 5 | Classification | ✅ PRODUCT / PROCESS |
| 6 | Honesty locks | ✅ personnel/e2e/printable **false** · DENIED invent LIVE · seals retain |
| 7 | Residual section | ✅ R-EMP-TOK-EXT CLOSED · C-SLICE · U88 PAY-SA · optional FE P3 |
| 8 | Verdict + ack | ✅ **GO WITH CONDITIONS** · `PASS_TO_PM` |

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-ext-qa-01.md` | exit **1** · missing `journey_l25` | **PROCESS OBS** — QA seat |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-ext-qc-01.md` | exit **0** · **PASS** · **8/8** | QC pack SoT (re-run after write) |
| QA-01 runner stamp `EMPTOKEXTQA-MSJ57PE1` | **PASS** · 8/8 · fail 0 | PRODUCT OK (cited machine JSON) |
| QC live spot unauth `:28001` merge-tokens?domain=EMP&company_id=holding | **401** | PRODUCT OK (spot-check) |
| QC dist spot `emp-merge-token-register.js` upsert+`extension_field` + settings hook | **PRESENT** | PRODUCT OK |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON audit + unauth/dist spot.

**L2.5 / journey:** No J-* in-scope this seat — **deferred**. Explicit: personnel/module J-* = **N/A / not tested** for this EXT gate.

---

## Scope statement (bounded)

**IN scope ACCEPT:** AC-PLT-EMP-TOK-04 / 04-RETIRE / 04b / 04c / 04H · STALE-DIST OK · U65 allow-list EMP field → `custom.emp.*` `origin=extension_field` · retire / negatives · peer DOC/ET seal retain · **`R-EMP-TOK-EXT` SEALED** · honesty LOCKED false.

**OUT of scope / DENIED:** Module EMP UAT · personnel ready flip · employees e2e · contracts printable · invent `custom.emp` LIVE beyond AC-04 seal · reopen MERGE-TOKEN-EMP GWC / EMP-QC / DEC / CTR · J-* L2.5 promote · Phase 1 DONE · seed.

**NOT Phase 1 DONE.**

---

## completion_report

### Closed

1. Narrow QC GWC **SEAL** for MERGE-TOKEN-EMP-EXT (AC-PLT-EMP-TOK-04*) complete.
2. QA stamp **`EMPTOKEXTQA-MSJ57PE1`** · **8/8** · U65 allow-list→`custom.emp` origin=`extension_field` **ACCEPT**.
3. **`R-EMP-TOK-EXT` SEALED / CLOSED** (product residual).
4. Stale-dist F-EMP-TOK-03 **OK** (QA watch rebuild + QC dist PRESENT + live unauth **401**).
5. Peer stamps/seals retained: `EMPTOKQA-MSJ290VB` DOC/ET · MERGE-TOKEN-EMP GWC / EMP-QC / DEC / CTR **not reopened**.
6. Honesty locked: personnel/e2e/printable **false** · DENIED invent LIVE / module EMP UAT / Phase1.
7. Verdict **GO WITH CONDITIONS** (slice-SEAL) — not full-module GO.

### Residual

- **CONDITION:** honesty / `C-SLICE-≠-MODULE` retained · DENIED invent LIVE / ready flips.
- **CONDITION OBS P3:** Group HR dialog open reliability (optional FE) — idle-ok.
- **U88 continuous:** next **sa** PAY catalog AC-PLT-PAY-01 Option/F.1 — do not idle program on this seat seal alone.

---

## next_owner

**pm** → dispatch **`sa`** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01` · retain honesty false · cấm reopen sealed GWC

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01
from_role: pm
to_role: sa
lane: governance
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-QC-01 GWC · R-EMP-TOK-EXT SEALED
program: PO-HRM-CONTINUOUS-W8-20260807
ref_qc_peer: docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-ext-qc-01.md
stamp_peer: EMPTOKEXTQA-MSJ57PE1 · EMPTOKQA-MSJ290VB DOC/ET SEAL retain
spec_ref: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md AC-PLT-PAY-01 · PLATFORM-TECHSPEC PAY · PAY-CATALOG-API-01

## entry_criteria
EXT-QC-01 GWC sealed; honesty LOCKED false; peer MERGE-TOKEN-EMP / EMP-QC / DEC / CTR seals retained (cấm reopen)

## task
Option/F.1 narrow for PAY open-catalog spine AC-PLT-PAY-01:
- When salary_components catalog ≠ empty, instance create MUST pick catalog code (no free-text SoT)
- Matrix Option A/B/C + recommended · failure modes · unlock ba-process/ba-data only if CONFIRM
- DENY payroll_e2e_ready flip · DENY formula LIVE · DENY reopen EXT/EMP/DEC/CTR seals
- Evidence: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md + docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-sa-01.md

## cấm
seed · flip ready flags · invent module PAY/EMP UAT · reopen sealed GWC · wipe prior seals

## exit
PASS_TO_PM · Option LOCKED or HOLD-WITH-RATIONALE · completion_report · next_owner · next_dispatch_prompt · evidence_path · ack_status
```

---

## evidence_path

`docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-ext-qc-01.md`

## ack_status

**PASS_TO_PM**

## hrm_personnel_uat_ready

**false**

## employees_e2e_linkage_ready

**false**

## contracts_printable_ready

**false**

## custom.emp LIVE invent

**DENIED** (AC-04* path SEALED · `R-EMP-TOK-EXT` CLOSED · not module LIVE claim)
